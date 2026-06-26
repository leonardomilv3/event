package com.eventing.participants;

import com.eventing.participants.domain.EventParticipant;
import com.eventing.participants.domain.ParticipantStatus;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
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

    // Native query mantida: Profile não está no grafo JPA de EventParticipant.
    // Migrar para JPQL exigiria mapear @OneToOne User→Profile — ver database-agent.
    @SuppressWarnings("unchecked")
    public List<ApprovedParticipantRow> findApprovedByEvent(UUID eventId, int page, int size) {
        String sql = """
                SELECT ep.user_id, u.username, p.display_name, p.avatar_url,
                       ep.status::text, ep.joined_at
                FROM event_participants ep
                JOIN users u ON u.id = ep.user_id
                LEFT JOIN profiles p ON p.user_id = ep.user_id
                WHERE ep.event_id = :eventId
                  AND ep.status = 'APPROVED'::participant_status
                ORDER BY ep.joined_at ASC
                """;
        List<Object[]> rows = em.createNativeQuery(sql)
                .setParameter("eventId", eventId)
                .setFirstResult(page * size)
                .setMaxResults(size)
                .getResultList();
        return rows.stream().map(this::mapToApprovedRow).toList();
    }

    // [0] user_id  [1] username  [2] display_name  [3] avatar_url
    // [4] status::text  [5] joined_at
    private ApprovedParticipantRow mapToApprovedRow(Object[] r) {
        return new ApprovedParticipantRow(
                asUuid(r[0]),
                (String) r[1],
                (String) r[2],
                (String) r[3],
                (String) r[4],
                asOffsetDateTime(r[5])
        );
    }

    private static UUID asUuid(Object o) {
        if (o == null) return null;
        if (o instanceof UUID uuid) return uuid;
        return UUID.fromString(o.toString());
    }

    private static OffsetDateTime asOffsetDateTime(Object o) {
        if (o == null) return null;
        if (o instanceof OffsetDateTime odt) return odt;
        if (o instanceof Timestamp ts) return ts.toInstant().atOffset(ZoneOffset.UTC);
        return null;
    }

    public long countApprovedByEvent(UUID eventId) {
        String sql = """
                SELECT COUNT(*) FROM event_participants
                WHERE event_id = :eventId AND status = 'APPROVED'::participant_status
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
