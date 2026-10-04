package com.eventing.events;

import com.eventing.events.domain.Event;
import com.eventing.events.domain.EventStatus;
import com.eventing.events.domain.EventVisibility;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Parameters;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class EventRepository implements PanacheRepositoryBase<Event, UUID> {

    @Inject
    EntityManager em;

    // ── CRUD helpers ──────────────────────────────────────────────────────────

    public List<Event> findByStatusAndVisibility(EventStatus status, EventVisibility visibility, Page page) {
        return find("status = :s and visibility = :v",
                Parameters.with("s", status).and("v", visibility))
                .page(page).list();
    }

    public long countByStatusAndVisibility(EventStatus status, EventVisibility visibility) {
        return count("status = :s and visibility = :v",
                Parameters.with("s", status).and("v", visibility));
    }

    public List<Event> findPublishedPublic(Page page) {
        return findByStatusAndVisibility(EventStatus.PUBLISHED, EventVisibility.PUBLIC, page);
    }

    public List<Event> findByCategory(String category, Page page) {
        return find("category = ?1 and status = ?2 and visibility = ?3",
                category, EventStatus.PUBLISHED, EventVisibility.PUBLIC)
                .page(page).list();
    }

    public List<Event> findByCreatorId(UUID creatorId, Page page) {
        return find("creator.id", creatorId).page(page).list();
    }

    /** Visão de terceiros: só eventos PUBLISHED + PUBLIC do criador. */
    public List<Event> findPublishedPublicByCreatorId(UUID creatorId, Page page) {
        return find("creator.id = ?1 and status = ?2 and visibility = ?3",
                creatorId, EventStatus.PUBLISHED, EventVisibility.PUBLIC)
                .page(page).list();
    }

    // ── PostGIS — nearby ──────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    public List<NativeEventRow> findNearby(double lat, double lon, double radiusKm, int page, int size) {
        String sql = """
                SELECT e.id, e.creator_id, u.username,
                       e.title, e.description, e.category,
                       e.visibility::text, e.status::text,
                       e.cover_image_url, e.location_name, e.address,
                       ST_Y(e.location::geometry), ST_X(e.location::geometry),
                       e.starts_at, e.ends_at,
                       e.max_participants, e.participant_count,
                       e.created_at, e.updated_at,
                       ST_Distance(e.location, ST_Point(:lon, :lat)::geography) / 1000 AS distance_km,
                       e.source_url
                FROM events e
                JOIN users u ON u.id = e.creator_id
                WHERE e.status = 'PUBLISHED'
                  AND e.visibility = 'PUBLIC'
                  AND ST_DWithin(e.location, ST_Point(:lon, :lat)::geography, :radiusMeters)
                  AND COALESCE(e.ends_at, e.starts_at) >= now() - INTERVAL '1 minute'
                ORDER BY distance_km ASC
                """;
        List<Object[]> rows = em.createNativeQuery(sql)
                .setParameter("lat", lat)
                .setParameter("lon", lon)
                .setParameter("radiusMeters", radiusKm * 1000.0)
                .setFirstResult(page * size)
                .setMaxResults(size)
                .getResultList();
        return rows.stream().map(this::mapToNativeRow).toList();
    }

    public long countNearby(double lat, double lon, double radiusKm) {
        String sql = """
                SELECT COUNT(*) FROM events e
                WHERE e.status = 'PUBLISHED'
                  AND e.visibility = 'PUBLIC'
                  AND ST_DWithin(e.location, ST_Point(:lon, :lat)::geography, :radiusMeters)
                  AND COALESCE(e.ends_at, e.starts_at) >= now() - INTERVAL '1 minute'
                """;
        Number result = (Number) em.createNativeQuery(sql)
                .setParameter("lat", lat)
                .setParameter("lon", lon)
                .setParameter("radiusMeters", radiusKm * 1000.0)
                .getSingleResult();
        return result.longValue();
    }

    // ── PostGIS — feed com score composto ────────────────────────────────────

    @SuppressWarnings("unchecked")
    public List<NativeEventRow> findFeed(double lat, double lon, int page, int size) {
        // CTE calcula ST_Distance uma única vez por linha e reutiliza o alias
        // tanto na projeção (distance_km) quanto no score do ORDER BY.
        String sql = """
                WITH base AS (
                    SELECT e.id, e.creator_id, u.username,
                           e.title, e.description, e.category,
                           e.visibility::text AS visibility,
                           e.status::text     AS status,
                           e.cover_image_url, e.location_name, e.address,
                           ST_Y(e.location::geometry) AS latitude,
                           ST_X(e.location::geometry) AS longitude,
                           e.starts_at, e.ends_at,
                           e.max_participants, e.participant_count,
                           e.created_at, e.updated_at,
                           ST_Distance(e.location, ST_Point(:lon, :lat)::geography) AS dist_m,
                           e.source_url
                    FROM events e
                    JOIN users u ON u.id = e.creator_id
                    WHERE e.status = 'PUBLISHED'
                      AND e.visibility = 'PUBLIC'
                      AND COALESCE(e.ends_at, e.starts_at) >= now() - INTERVAL '1 minute'
                      AND e.starts_at <= now() + INTERVAL '30 days'
                )
                SELECT id, creator_id, username,
                       title, description, category,
                       visibility, status,
                       cover_image_url, location_name, address,
                       latitude, longitude,
                       starts_at, ends_at,
                       max_participants, participant_count,
                       created_at, updated_at,
                       dist_m / 1000 AS distance_km,
                       source_url
                FROM base
                ORDER BY (
                    COALESCE(0.4 * (1 - LEAST(dist_m / 50000, 1)), 0) +
                    0.3 * LEAST(COALESCE(participant_count, 0) / 100.0, 1) +
                    0.1 * (1 - LEAST(EXTRACT(EPOCH FROM (starts_at - now())) / 604800, 1))
                ) DESC NULLS LAST
                """;
        List<Object[]> rows = em.createNativeQuery(sql)
                .setParameter("lat", lat)
                .setParameter("lon", lon)
                .setFirstResult(page * size)
                .setMaxResults(size)
                .getResultList();
        return rows.stream().map(this::mapToNativeRow).toList();
    }

    // [0] id  [1] creator_id  [2] username  [3] title  [4] description  [5] category
    // [6] visibility::text  [7] status::text  [8] cover_image_url  [9] location_name  [10] address
    // [11] latitude  [12] longitude  [13] starts_at  [14] ends_at
    // [15] max_participants  [16] participant_count  [17] created_at  [18] updated_at  [19] distance_km
    // [20] source_url
    private NativeEventRow mapToNativeRow(Object[] r) {
        return new NativeEventRow(
                asUuid(r[0]),
                asUuid(r[1]),
                (String) r[2],
                (String) r[3],
                (String) r[4],
                (String) r[5],
                (String) r[6],
                (String) r[7],
                (String) r[8],
                (String) r[9],
                (String) r[10],
                asDouble(r[11]),
                asDouble(r[12]),
                asOffsetDateTime(r[13]),
                asOffsetDateTime(r[14]),
                asInteger(r[15]),
                asInteger(r[16]),
                asOffsetDateTime(r[17]),
                asOffsetDateTime(r[18]),
                asDouble(r[19]),
                (String) r[20]
        );
    }

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

    private static OffsetDateTime asOffsetDateTime(Object o) {
        if (o == null) return null;
        // Normaliza para UTC: o driver pode devolver o offset da JVM e o chamador usa toLocalDateTime()
        if (o instanceof OffsetDateTime odt) return odt.withOffsetSameInstant(ZoneOffset.UTC);
        if (o instanceof java.time.Instant instant) return instant.atOffset(ZoneOffset.UTC);
        if (o instanceof Timestamp ts) return ts.toInstant().atOffset(ZoneOffset.UTC);
        return null;
    }

    // ── Notificações ─────────────────────────────────────────────────────────

    public List<Event> findEventsToNotify(LocalDateTime windowStart, LocalDateTime windowEnd, boolean is24h) {
        String notifiedField = is24h ? "notified24h" : "notified1h";
        return find(
                "status = ?1 AND starts_at BETWEEN ?2 AND ?3 AND " + notifiedField + " = false",
                EventStatus.PUBLISHED, windowStart, windowEnd
        ).list();
    }

    // ── Controle de acesso ───────────────────────────────────────────────────

    /**
     * Participação confirmada (APPROVED/ATTENDED). Native para não acoplar o módulo
     * events à entidade de participants (dependência hoje é só participants → events).
     */
    public boolean isConfirmedParticipant(UUID eventId, UUID userId) {
        String sql = """
                SELECT EXISTS (
                    SELECT 1 FROM event_participants
                    WHERE event_id = :eventId
                      AND user_id = :userId
                      AND status IN ('APPROVED'::participant_status, 'ATTENDED'::participant_status)
                )
                """;
        return (Boolean) em.createNativeQuery(sql)
                .setParameter("eventId", eventId)
                .setParameter("userId", userId)
                .getSingleResult();
    }

    // ── SEO ──────────────────────────────────────────────────────────────────

    /** Eventos PUBLISHED + PUBLIC que ainda não terminaram — nunca expõe PRIVATE/INVITE_ONLY. */
    public List<SitemapEventRow> findSitemapEntries(LocalDateTime nowUtc, int limit) {
        return em.createQuery("""
                SELECT new com.eventing.events.SitemapEventRow(e.id, e.updatedAt)
                FROM Event e
                WHERE e.status = :status
                  AND e.visibility = :visibility
                  AND COALESCE(e.endsAt, e.startsAt) >= :now
                ORDER BY e.startsAt ASC
                """, SitemapEventRow.class)
                .setParameter("status", EventStatus.PUBLISHED)
                .setParameter("visibility", EventVisibility.PUBLIC)
                .setParameter("now", nowUtc)
                .setMaxResults(limit)
                .getResultList();
    }

    // ── CRUD count helpers ────────────────────────────────────────────────────

    public long countPublishedPublic() {
        return countByStatusAndVisibility(EventStatus.PUBLISHED, EventVisibility.PUBLIC);
    }

    public long countByCategory(String category) {
        return count("category = ?1 and status = ?2 and visibility = ?3",
                category, EventStatus.PUBLISHED, EventVisibility.PUBLIC);
    }

    public long countByCreatorId(UUID creatorId) {
        return count("creator.id", creatorId);
    }

    public long countPublishedPublicByCreatorId(UUID creatorId) {
        return count("creator.id = ?1 and status = ?2 and visibility = ?3",
                creatorId, EventStatus.PUBLISHED, EventVisibility.PUBLIC);
    }

    public long countFeed() {
        String sql = """
                SELECT COUNT(*) FROM events e
                WHERE e.status = 'PUBLISHED'
                  AND e.visibility = 'PUBLIC'
                  AND COALESCE(e.ends_at, e.starts_at) >= now() - INTERVAL '1 minute'
                  AND e.starts_at <= now() + INTERVAL '30 days'
                """;
        return ((Number) em.createNativeQuery(sql).getSingleResult()).longValue();
    }
}
