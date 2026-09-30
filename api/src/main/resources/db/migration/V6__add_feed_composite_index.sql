-- Índice composto para queries de feed, nearby e listagens públicas.
-- Cobre o WHERE status = 'PUBLISHED' AND visibility = 'PUBLIC' AND starts_at/ends_at
-- que aparece em findFeed, findNearby e findPublishedPublic.
-- O índice existente idx_events_status_vis (status, visibility) não inclui starts_at,
-- obrigando scan adicional para filtrar por data em cada execução.
CREATE INDEX IF NOT EXISTS idx_events_status_visibility_starts_at
    ON events (status, visibility, starts_at);
