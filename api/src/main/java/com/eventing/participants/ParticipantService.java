package com.eventing.participants;

import com.eventing.events.EventRepository;
import com.eventing.participants.domain.Participant;
import com.eventing.participants.dto.ParticipantDto;
import com.eventing.shared.exception.ApiException;
import com.eventing.users.UserRepository;
import com.eventing.users.mapper.UserMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class ParticipantService {

    @Inject
    ParticipantRepository participantRepository;

    @Inject
    EventRepository eventRepository;

    @Inject
    UserRepository userRepository;

    @Inject
    UserMapper userMapper;

    public List<ParticipantDto> listByEvent(UUID eventId) {
        return participantRepository.findByEventId(eventId).stream()
                .map(p -> new ParticipantDto(p.id, eventId, userMapper.toDto(p.user), p.status, p.joinedAt))
                .toList();
    }

    @Transactional
    public ParticipantDto join(UUID eventId, UUID userId) {
        if (participantRepository.isParticipant(eventId, userId)) {
            throw ApiException.conflict("Usuário já participa deste evento");
        }
        var event = eventRepository.findById(eventId);
        if (event == null) throw ApiException.notFound("Evento");

        var user = userRepository.findById(userId);
        if (user == null) throw ApiException.notFound("Usuário");

        Participant participant = new Participant();
        participant.event = event;
        participant.user = user;
        participantRepository.persist(participant);
        return new ParticipantDto(participant.id, eventId, userMapper.toDto(user), participant.status, participant.joinedAt);
    }

    @Transactional
    public void leave(UUID eventId, UUID userId) {
        participantRepository.findByEventAndUser(eventId, userId)
                .ifPresentOrElse(
                        participantRepository::delete,
                        () -> { throw ApiException.notFound("Participação"); }
                );
    }
}
