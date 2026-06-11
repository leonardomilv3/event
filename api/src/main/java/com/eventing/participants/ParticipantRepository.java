package com.eventing.participants;

import com.eventing.participants.domain.EventParticipant;
import com.eventing.participants.domain.ParticipantStatus;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class ParticipantRepository implements PanacheRepositoryBase<EventParticipant, UUID> {

    @Inject
    EntityManager em;

    public Optional<EventParticipant> findByEventAndUser(UUID eventId, UUID userId) {
        return find("event.id = ?1 and user.id = ?2", eventId, userId).firstResultOptional();
    }

    public boolean hasActiveParticipation(UUID eventId, UUID userId) {
        return count(
                "event.id = ?1 and user.id = ?2 and (status = ?3 or status = ?4)",
                eventId, userId, ParticipantStatus.APPROVED, ParticipantStatus.REQUESTED
        ) > 0;
    }

    // ── Participantes de um evento (APPROVED) ─────────────────────────────────

    /**
     * Colunas: [0]=user_id, [1]=username, [2]=display_name, [3]=avatar_url,
     *          [4]=status::text, [5]=joined_at
     */
    @SuppressWarnings("unchecked")
    public List<Object[]> findApprovedByEvent(UUID eventId, int page, int size) {
        String sql = """
                SELECT ep.user_id, u.username, p.display_name, p.avatar_url,
                       ep.status::text, ep.joined_at
                FROM event_participants ep
                JOIN users u ON u.id = ep.user_id
                LEFT JOIN profiles p ON p.user_id = ep.user_id
                WHERE ep.event_id = :eventId
                  AND ep.status = 'APPROVED'
                ORDER BY ep.joined_at ASC
                """;
        return em.createNativeQuery(sql)
                .setParameter("eventId", eventId)
                .setFirstResult(page * size)
                .setMaxResults(size)
                .getResultList();
    }

    public long countApprovedByEvent(UUID eventId) {
        String sql = """
                SELECT COUNT(*) FROM event_participants
                WHERE event_id = :eventId AND status = 'APPROVED'
                """;
        return ((Number) em.createNativeQuery(sql)
                .setParameter("eventId", eventId)
                .getSingleResult()).longValue();
    }

    // ── Eventos de um usuário (APPROVED) ──────────────────────────────────────

    public List<EventParticipant> findApprovedByUser(UUID userId, int page, int size) {
        return find(
                "from EventParticipant ep join fetch ep.event e join fetch e.creator where ep.user.id = ?1 and ep.status = ?2",
                userId, ParticipantStatus.APPROVED
        ).page(page, size).list();
    }

    public long countApprovedByUser(UUID userId) {
        return count("user.id = ?1 and status = ?2", userId, ParticipantStatus.APPROVED);
    }
}
