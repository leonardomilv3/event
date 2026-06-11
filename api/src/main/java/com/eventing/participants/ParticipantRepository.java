package com.eventing.participants;

import com.eventing.participants.domain.Participant;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class ParticipantRepository implements PanacheRepositoryBase<Participant, UUID> {

    public List<Participant> findByEventId(UUID eventId) {
        return find("event.id", eventId).list();
    }

    public long countByEventId(UUID eventId) {
        return count("event.id", eventId);
    }

    public Optional<Participant> findByEventAndUser(UUID eventId, UUID userId) {
        return find("event.id = ?1 and user.id = ?2", eventId, userId).firstResultOptional();
    }

    public boolean isParticipant(UUID eventId, UUID userId) {
        return count("event.id = ?1 and user.id = ?2", eventId, userId) > 0;
    }
}
