-- Habilitar extensão PostGIS (deve rodar antes)
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE event_status AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'FINISHED');
CREATE TYPE event_visibility AS ENUM ('PUBLIC', 'PRIVATE', 'INVITE_ONLY');

CREATE TABLE events (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id        UUID         NOT NULL REFERENCES users(id),
    title             VARCHAR(200) NOT NULL,
    description       TEXT,
    category          VARCHAR(50)  NOT NULL,
    visibility        event_visibility NOT NULL DEFAULT 'PUBLIC',
    status            event_status     NOT NULL DEFAULT 'DRAFT',
    cover_image_url   TEXT,
    location_name     VARCHAR(200),
    address           TEXT,
    location          GEOGRAPHY(POINT, 4326),
    starts_at         TIMESTAMPTZ  NOT NULL,
    ends_at           TIMESTAMPTZ,
    max_participants  INTEGER,
    participant_count INTEGER      NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_location    ON events USING GIST(location);
CREATE INDEX idx_events_starts_at   ON events(starts_at);
CREATE INDEX idx_events_creator     ON events(creator_id);
CREATE INDEX idx_events_status_vis  ON events(status, visibility);
