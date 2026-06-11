package com.eventing.participants.service;

import com.eventing.events.EventRepository;
import com.eventing.events.domain.Event;
import com.eventing.events.domain.EventStatus;
import com.eventing.events.domain.EventVisibility;
import com.eventing.events.dto.EventResponse;
import com.eventing.participants.ParticipantRepository;
import com.eventing.participants.domain.EventParticipant;
import com.eventing.participants.domain.ParticipantStatus;
import com.eventing.participants.dto.ParticipantResponse;
import com.eventing.shared.exception.ApiException;
import com.eventing.shared.response.PageResponse;
import com.eventing.users.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class ParticipantService {

    @Inject ParticipantRepository participantRepository;
    @Inject EventRepository eventRepository;
    @Inject UserRepository userRepository;

    @Transactional
    public ParticipantResponse join(UUID userId, UUID eventId) {
        Event event = eventRepository.findById(eventId);
        if (event == null) throw ApiException.notFound("Evento");
        if (event.status != EventStatus.PUBLISHED) {
            throw ApiException.badRequest("Evento não está publicado");
        }

        if (participantRepository.hasActiveParticipation(eventId, userId)) {
            throw ApiException.conflict("Usuário já é participante deste evento");
        }

        ParticipantStatus targetStatus;
        if (event.visibility == EventVisibility.INVITE_ONLY) {
            targetStatus = ParticipantStatus.REQUESTED;
        } else {
            if (event.maxParticipants != null && event.participantCount >= event.maxParticipants) {
                throw ApiException.badRequest("Evento já atingiu a capacidade máxima");
            }
            targetStatus = ParticipantStatus.APPROVED;
        }

        Optional<EventParticipant> existing = participantRepository.findByEventAndUser(eventId, userId);
        EventParticipant participant = existing.orElseGet(() -> {
            EventParticipant ep = new EventParticipant();
            ep.event = event;
            ep.user = userRepository.findById(userId);
            return ep;
        });
        participant.status = targetStatus;

        participantRepository.persist(participant);

        if (targetStatus == ParticipantStatus.APPROVED) {
            eventRepository.update("participantCount = participantCount + 1 where id = ?1", eventId);
        }

        return new ParticipantResponse(
                participant.user.id,
                participant.user.username,
                null,
                null,
                participant.status,
                participant.joinedAt
        );
    }

    @Transactional
    public void leave(UUID userId, UUID eventId) {
        EventParticipant participant = participantRepository.findByEventAndUser(eventId, userId)
                .filter(ep -> ep.status != ParticipantStatus.DECLINED)
                .orElseThrow(() -> ApiException.notFound("Participante"));

        boolean wasApproved = participant.status == ParticipantStatus.APPROVED;
        participant.status = ParticipantStatus.DECLINED;

        if (wasApproved) {
            eventRepository.update(
                    "participantCount = participantCount - 1 where id = ?1 and participantCount > 0",
                    eventId
            );
        }
    }

    public PageResponse<ParticipantResponse> listParticipants(UUID eventId, int page, int size) {
        if (eventRepository.findById(eventId) == null) throw ApiException.notFound("Evento");

        List<Object[]> rows = participantRepository.findApprovedByEvent(eventId, page, size);
        long total = participantRepository.countApprovedByEvent(eventId);

        List<ParticipantResponse> content = rows.stream().map(this::fromParticipantRow).toList();
        return PageResponse.of(content, page, size, total);
    }

    public PageResponse<EventResponse> getMyEvents(UUID userId, int page, int size) {
        List<EventParticipant> participants = participantRepository.findApprovedByUser(userId, page, size);
        long total = participantRepository.countApprovedByUser(userId);

        List<EventResponse> content = participants.stream()
                .map(ep -> toEventResponse(ep.event))
                .toList();
        return PageResponse.of(content, page, size, total);
    }

    // ── Row mapping ───────────────────────────────────────────────────────────

    private ParticipantResponse fromParticipantRow(Object[] r) {
        return new ParticipantResponse(
                asUuid(r[0]),
                (String) r[1],
                (String) r[2],
                (String) r[3],
                r[4] != null ? ParticipantStatus.valueOf((String) r[4]) : null,
                asLocalDateTime(r[5])
        );
    }

    private EventResponse toEventResponse(Event e) {
        Double lat = e.location != null ? e.location.getY() : null;
        Double lon = e.location != null ? e.location.getX() : null;
        return new EventResponse(
                e.id, e.creator.id, e.creator.username,
                e.title, e.description, e.category,
                e.visibility, e.status,
                e.coverImageUrl, e.locationName, e.address,
                lat, lon,
                e.startsAt, e.endsAt,
                e.maxParticipants, e.participantCount,
                null,
                e.createdAt, e.updatedAt
        );
    }

    // ── Type helpers ──────────────────────────────────────────────────────────

    private static UUID asUuid(Object o) {
        if (o == null) return null;
        if (o instanceof UUID uuid) return uuid;
        return UUID.fromString(o.toString());
    }

    private static LocalDateTime asLocalDateTime(Object o) {
        if (o == null) return null;
        if (o instanceof LocalDateTime ldt) return ldt;
        if (o instanceof Timestamp ts) return ts.toLocalDateTime();
        if (o instanceof OffsetDateTime odt) return odt.toLocalDateTime();
        return null;
    }
}
