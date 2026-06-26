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
                       ST_Distance(e.location, ST_Point(:lon, :lat)::geography) / 1000 AS distance_km
                FROM events e
                JOIN users u ON u.id = e.creator_id
                WHERE e.status = 'PUBLISHED'
                  AND e.visibility = 'PUBLIC'
                  AND ST_DWithin(e.location, ST_Point(:lon, :lat)::geography, :radiusMeters)
                  AND e.starts_at > now()
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

    @SuppressWarnings("unchecked")
    public List<NativeEventRow> findFeed(double lat, double lon, int page, int size) {
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
                asDouble(r[19])
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
        if (o instanceof OffsetDateTime odt) return odt;
        if (o instanceof Timestamp ts) return ts.toInstant().atOffset(ZoneOffset.UTC);
        return null;
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
