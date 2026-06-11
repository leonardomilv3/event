package com.eventing.events;

import com.eventing.events.domain.Event;
import com.eventing.events.domain.EventStatus;
import com.eventing.events.domain.EventVisibility;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Page;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class EventRepository implements PanacheRepositoryBase<Event, UUID> {

    @Inject
    EntityManager em;

    // ── CRUD helpers ──────────────────────────────────────────────────────────

    public List<Event> findPublishedPublic(Page page) {
        return find("status = ?1 and visibility = ?2", EventStatus.PUBLISHED, EventVisibility.PUBLIC)
                .page(page).list();
    }

    public List<Event> findByCategory(String category, Page page) {
        return find("category = ?1 and status = ?2 and visibility = ?3",
                category, EventStatus.PUBLISHED, EventVisibility.PUBLIC)
                .page(page).list();
    }

    public List<Event> findByCreatorId(UUID creatorId, Page page) {
        return find("creator.id", creatorId).page(page).list();
    }

    // ── PostGIS — nearby ──────────────────────────────────────────────────────

    /**
     * Retorna linhas brutas:
     *   [0] id UUID, [1] creator_id UUID, [2] creator_username TEXT,
     *   [3] title, [4] description, [5] category,
     *   [6] visibility TEXT, [7] status TEXT,
     *   [8] cover_image_url, [9] location_name, [10] address,
     *   [11] latitude FLOAT8, [12] longitude FLOAT8,
     *   [13] starts_at, [14] ends_at,
     *   [15] max_participants INT, [16] participant_count INT,
     *   [17] created_at, [18] updated_at,
     *   [19] distance_km FLOAT8
     */
    @SuppressWarnings("unchecked")
    public List<Object[]> findNearby(double lat, double lon, double radiusKm, int page, int size) {
        String sql = """
                SELECT e.id, e.creator_id, u.username,
                       e.title, e.description, e.category,
                       e.visibility::text, e.status::text,
                       e.cover_image_url, e.location_name, e.address,
                       ST_Y(e.location::geometry), ST_X(e.location::geometry),
                       e.starts_at, e.ends_at,
                       e.max_participants, e.participant_count,
                       e.created_at, e.updated_at,
                       ST_Distance(e.location, ST_Point(:lon, :lat)::geography) / 1000 AS distance_km
                FROM events e
                JOIN users u ON u.id = e.creator_id
                WHERE e.status = 'PUBLISHED'
                  AND e.visibility = 'PUBLIC'
                  AND ST_DWithin(e.location, ST_Point(:lon, :lat)::geography, :radiusMeters)
                  AND e.starts_at > now()
                ORDER BY distance_km ASC
                """;
        return em.createNativeQuery(sql)
                .setParameter("lat", lat)
                .setParameter("lon", lon)
                .setParameter("radiusMeters", radiusKm * 1000.0)
                .setFirstResult(page * size)
                .setMaxResults(size)
                .getResultList();
    }

    public long countNearby(double lat, double lon, double radiusKm) {
        String sql = """
                SELECT COUNT(*) FROM events e
                WHERE e.status = 'PUBLISHED'
                  AND e.visibility = 'PUBLIC'
                  AND ST_DWithin(e.location, ST_Point(:lon, :lat)::geography, :radiusMeters)
                  AND e.starts_at > now()
                """;
        Number result = (Number) em.createNativeQuery(sql)
                .setParameter("lat", lat)
                .setParameter("lon", lon)
                .setParameter("radiusMeters", radiusKm * 1000.0)
                .getSingleResult();
        return result.longValue();
    }

    // ── PostGIS — feed com score composto ────────────────────────────────────

    /**
     * Mesma estrutura de colunas que findNearby (índices 0-19).
     * O score é usado apenas no ORDER BY — não é retornado.
     */
    @SuppressWarnings("unchecked")
    public List<Object[]> findFeed(double lat, double lon, int page, int size) {
        String sql = """
                SELECT e.id, e.creator_id, u.username,
                       e.title, e.description, e.category,
                       e.visibility::text, e.status::text,
                       e.cover_image_url, e.location_name, e.address,
                       ST_Y(e.location::geometry), ST_X(e.location::geometry),
                       e.starts_at, e.ends_at,
                       e.max_participants, e.participant_count,
                       e.created_at, e.updated_at,
                       COALESCE(ST_Distance(e.location, ST_Point(:lon, :lat)::geography) / 1000, NULL) AS distance_km
                FROM events e
                JOIN users u ON u.id = e.creator_id
                WHERE e.status = 'PUBLISHED'
                  AND e.visibility = 'PUBLIC'
                  AND e.starts_at BETWEEN now() AND now() + INTERVAL '30 days'
                ORDER BY (
                    COALESCE(0.4 * (1 - LEAST(ST_Distance(e.location, ST_Point(:lon, :lat)::geography) / 50000, 1)), 0) +
                    0.3 * LEAST(COALESCE(e.participant_count, 0) / 100.0, 1) +
                    0.1 * (1 - LEAST(EXTRACT(EPOCH FROM (e.starts_at - now())) / 604800, 1))
                ) DESC NULLS LAST
                """;
        return em.createNativeQuery(sql)
                .setParameter("lat", lat)
                .setParameter("lon", lon)
                .setFirstResult(page * size)
                .setMaxResults(size)
                .getResultList();
    }

    public long countFeed() {
        String sql = """
                SELECT COUNT(*) FROM events e
                WHERE e.status = 'PUBLISHED'
                  AND e.visibility = 'PUBLIC'
                  AND e.starts_at BETWEEN now() AND now() + INTERVAL '30 days'
                """;
        return ((Number) em.createNativeQuery(sql).getSingleResult()).longValue();
    }
}
