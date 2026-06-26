package com.eventing.participants.service;

import com.eventing.events.EventRepository;
import com.eventing.events.domain.Event;
import com.eventing.events.domain.EventStatus;
import com.eventing.events.domain.EventVisibility;
import com.eventing.events.dto.EventResponse;
import com.eventing.participants.ApprovedParticipantRow;
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

import java.time.LocalDateTime;
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
            throw ApiException.alreadyParticipant();
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
        EventParticipant participant;

        if (existing.isPresent()) {
            // Registro existe (ex: fez leave antes) — atualiza status e timestamp
            participant = existing.get();
            participant.status = targetStatus;
            participant.joinedAt = LocalDateTime.now();
            // Entidade já gerenciada pelo Hibernate — o flush persiste automaticamente
        } else {
            // Novo participante
            var user = userRepository.findById(userId);
            if (user == null) throw ApiException.notFound("Usuário");
            participant = new EventParticipant();
            participant.event = event;
            participant.user = user;
            participant.status = targetStatus;
            participant.joinedAt = LocalDateTime.now();
            participantRepository.persist(participant);
        }

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

    @Transactional
    public PageResponse<ParticipantResponse> listParticipants(UUID eventId, int page, int size) {
        if (eventRepository.findById(eventId) == null) throw ApiException.notFound("Evento");

        List<ApprovedParticipantRow> rows = participantRepository.findApprovedByEvent(eventId, page, size);
        long total = participantRepository.countApprovedByEvent(eventId);

        List<ParticipantResponse> content = rows.stream().map(this::fromApprovedRow).toList();
        return PageResponse.of(content, page, size, total);
    }

    @Transactional
    public PageResponse<EventResponse> getMyEvents(UUID userId, int page, int size) {
        List<EventParticipant> participants = participantRepository.findApprovedByUser(userId, page, size);
        long total = participantRepository.countApprovedByUser(userId);

        List<EventResponse> content = participants.stream()
                .map(ep -> toEventResponse(ep.event))
                .toList();
        return PageResponse.of(content, page, size, total);
    }

    // ── Row mapping ───────────────────────────────────────────────────────────

    private ParticipantResponse fromApprovedRow(ApprovedParticipantRow r) {
        return new ParticipantResponse(
                r.userId(),
                r.username(),
                r.displayName(),
                r.avatarUrl(),
                r.status() != null ? ParticipantStatus.valueOf(r.status()) : null,
                r.joinedAt() != null ? r.joinedAt().toLocalDateTime() : null
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

}