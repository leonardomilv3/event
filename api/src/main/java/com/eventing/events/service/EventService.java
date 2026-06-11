package com.eventing.events.service;

import com.eventing.events.EventRepository;
import com.eventing.events.domain.Event;
import com.eventing.events.domain.EventStatus;
import com.eventing.events.domain.EventVisibility;
import com.eventing.events.dto.CreateEventRequest;
import com.eventing.events.dto.EventResponse;
import com.eventing.events.dto.UpdateEventRequest;
import com.eventing.shared.exception.ApiException;
import com.eventing.shared.response.PageResponse;
import com.eventing.users.UserRepository;
import com.eventing.users.domain.User;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.value.SetArgs;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class EventService {

    private static final GeometryFactory GEO_FACTORY = new GeometryFactory(new PrecisionModel(), 4326);
    private static final int CACHE_TTL_SECONDS = 300; // 5 minutos
    private static final TypeReference<PageResponse<EventResponse>> PAGE_TYPE = new TypeReference<>() {};

    @Inject EventRepository eventRepository;
    @Inject UserRepository userRepository;
    @Inject RedisDataSource redis;
    @Inject ObjectMapper objectMapper;

    // ── CRUD ──────────────────────────────────────────────────────────────────

    @Transactional
    public EventResponse create(UUID creatorId, CreateEventRequest request) {
        User creator = userRepository.findById(creatorId);
        if (creator == null) throw ApiException.notFound("Usuário");

        Event event = new Event();
        event.creator = creator;
        event.title = request.title();
        event.description = request.description();
        event.category = request.category();
        event.visibility = request.visibility() != null ? request.visibility() : EventVisibility.PUBLIC;
        event.locationName = request.locationName();
        event.address = request.address();
        event.startsAt = request.startsAt();
        event.endsAt = request.endsAt();
        event.maxParticipants = request.maxParticipants();
        if (request.latitude() != null && request.longitude() != null) {
            event.location = toPoint(request.longitude(), request.latitude());
        }
        eventRepository.persist(event);
        invalidateCaches();
        return toResponse(event, null);
    }

    public EventResponse getById(UUID id) {
        Event event = eventRepository.findById(id);
        if (event == null) throw ApiException.notFound("Evento");
        return toResponse(event, null);
    }

    @Transactional
    public EventResponse update(UUID currentUserId, UUID eventId, UpdateEventRequest request) {
        Event event = requireOwnership(currentUserId, eventId);
        if (request.title() != null) event.title = request.title();
        if (request.description() != null) event.description = request.description();
        if (request.category() != null) event.category = request.category();
        if (request.visibility() != null) event.visibility = request.visibility();
        if (request.locationName() != null) event.locationName = request.locationName();
        if (request.address() != null) event.address = request.address();
        if (request.startsAt() != null) event.startsAt = request.startsAt();
        if (request.endsAt() != null) event.endsAt = request.endsAt();
        if (request.maxParticipants() != null) event.maxParticipants = request.maxParticipants();
        if (request.latitude() != null && request.longitude() != null) {
            event.location = toPoint(request.longitude(), request.latitude());
        }
        return toResponse(event, null);
    }

    @Transactional
    public void delete(UUID currentUserId, UUID eventId) {
        Event event = requireOwnership(currentUserId, eventId);
        event.status = EventStatus.CANCELLED;
        invalidateCaches();
    }

    @Transactional
    public EventResponse publish(UUID currentUserId, UUID eventId) {
        Event event = requireOwnership(currentUserId, eventId);
        if (event.status != EventStatus.DRAFT) {
            throw ApiException.badRequest("Somente eventos em DRAFT podem ser publicados");
        }
        event.status = EventStatus.PUBLISHED;
        invalidateCaches();
        return toResponse(event, null);
    }

    // ── Geolocalização ────────────────────────────────────────────────────────

    public PageResponse<EventResponse> findNearby(double lat, double lon, double radiusKm, int page, int size) {
        String key = nearbyKey(lat, lon, radiusKm);
        PageResponse<EventResponse> cached = fromCache(key);
        if (cached != null) return cached;

        List<EventResponse> content = eventRepository.findNearby(lat, lon, radiusKm, page, size)
                .stream().map(this::fromRow).toList();
        long total = eventRepository.countNearby(lat, lon, radiusKm);

        PageResponse<EventResponse> result = PageResponse.of(content, page, size, total);
        toCache(key, result);
        return result;
    }

    public PageResponse<EventResponse> findFeed(double lat, double lon, int page, int size) {
        String key = feedKey(lat, lon);
        PageResponse<EventResponse> cached = fromCache(key);
        if (cached != null) return cached;

        List<EventResponse> content = eventRepository.findFeed(lat, lon, page, size)
                .stream().map(this::fromRow).toList();
        long total = eventRepository.countFeed();

        PageResponse<EventResponse> result = PageResponse.of(content, page, size, total);
        toCache(key, result);
        return result;
    }

    // ── Cache Redis ───────────────────────────────────────────────────────────

    private PageResponse<EventResponse> fromCache(String key) {
        try {
            String json = redis.value(String.class).get(key);
            if (json != null) return objectMapper.readValue(json, PAGE_TYPE);
        } catch (Exception ignored) {
            // Redis indisponível ou JSON inválido: fallback para DB
        }
        return null;
    }

    private void toCache(String key, PageResponse<EventResponse> value) {
        try {
            String json = objectMapper.writeValueAsString(value);
            redis.value(String.class).set(key, json, new SetArgs().ex(CACHE_TTL_SECONDS));
        } catch (Exception ignored) {
            // Redis indisponível: continua sem cache
        }
    }

    private void invalidateCaches() {
        try {
            var keyCmd = redis.key(String.class);
            List<String> nearbyKeys = keyCmd.keys("events:nearby:*");
            List<String> feedKeys = keyCmd.keys("events:feed:*");
            if (!nearbyKeys.isEmpty()) keyCmd.del(nearbyKeys.toArray(new String[0]));
            if (!feedKeys.isEmpty()) keyCmd.del(feedKeys.toArray(new String[0]));
        } catch (Exception ignored) {
            // Redis indisponível: TTL já garante expiração
        }
    }

    private static String nearbyKey(double lat, double lon, double radiusKm) {
        double la = Math.round(lat * 100.0) / 100.0;
        double lo = Math.round(lon * 100.0) / 100.0;
        return String.format("events:nearby:%.2f:%.2f:%.0f", la, lo, radiusKm);
    }

    private static String feedKey(double lat, double lon) {
        double la = Math.round(lat * 100.0) / 100.0;
        double lo = Math.round(lon * 100.0) / 100.0;
        return String.format("events:feed:%.2f:%.2f", la, lo);
    }

    // ── Mapeamento de Object[] → EventResponse ────────────────────────────────

    /**
     * Ordem das colunas conforme EventRepository.findNearby / findFeed:
     *   0=id, 1=creator_id, 2=creator_username,
     *   3=title, 4=description, 5=category,
     *   6=visibility, 7=status,
     *   8=cover_image_url, 9=location_name, 10=address,
     *   11=latitude, 12=longitude,
     *   13=starts_at, 14=ends_at,
     *   15=max_participants, 16=participant_count,
     *   17=created_at, 18=updated_at,
     *   19=distance_km
     */
    private EventResponse fromRow(Object[] r) {
        return new EventResponse(
                asUuid(r[0]),
                asUuid(r[1]),
                (String) r[2],
                (String) r[3],
                (String) r[4],
                (String) r[5],
                r[6] != null ? EventVisibility.valueOf((String) r[6]) : null,
                r[7] != null ? EventStatus.valueOf((String) r[7]) : null,
                (String) r[8],
                (String) r[9],
                (String) r[10],
                asDouble(r[11]),
                asDouble(r[12]),
                asLocalDateTime(r[13]),
                asLocalDateTime(r[14]),
                asInteger(r[15]),
                asInteger(r[16]) != null ? asInteger(r[16]) : 0,
                asDouble(r[19]),
                asLocalDateTime(r[17]),
                asLocalDateTime(r[18])
        );
    }

    // ── Helpers de conversão JDBC → Java ─────────────────────────────────────

    private static UUID asUuid(Object o) {
        if (o == null) return null;
        if (o instanceof UUID uuid) return uuid;
        return UUID.fromString(o.toString());
    }

    private static Double asDouble(Object o) {
        if (o == null) return null;
        return ((Number) o).doubleValue();
    }

    private static Integer asInteger(Object o) {
        if (o == null) return null;
        return ((Number) o).intValue();
    }

    private static LocalDateTime asLocalDateTime(Object o) {
        if (o == null) return null;
        if (o instanceof LocalDateTime ldt) return ldt;
        if (o instanceof Timestamp ts) return ts.toLocalDateTime();
        if (o instanceof OffsetDateTime odt) return odt.toLocalDateTime();
        return null;
    }

    // ── Helpers internos ──────────────────────────────────────────────────────

    private Event requireOwnership(UUID userId, UUID eventId) {
        Event event = eventRepository.findById(eventId);
        if (event == null) throw ApiException.notFound("Evento");
        if (!event.creator.id.equals(userId)) throw ApiException.forbidden();
        return event;
    }

    private Point toPoint(double longitude, double latitude) {
        return GEO_FACTORY.createPoint(new Coordinate(longitude, latitude));
    }

    private EventResponse toResponse(Event event, Double distanceKm) {
        Double lat = event.location != null ? event.location.getY() : null;
        Double lon = event.location != null ? event.location.getX() : null;
        return new EventResponse(
                event.id, event.creator.id, event.creator.username,
                event.title, event.description, event.category,
                event.visibility, event.status,
                event.coverImageUrl, event.locationName, event.address,
                lat, lon,
                event.startsAt, event.endsAt,
                event.maxParticipants, event.participantCount,
                distanceKm, event.createdAt, event.updatedAt
        );
    }
}
