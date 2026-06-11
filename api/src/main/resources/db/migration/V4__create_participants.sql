CREATE TYPE participant_status AS ENUM (
    'INVITED', 'REQUESTED', 'APPROVED', 'ATTENDED', 'DECLINED'
);

CREATE TABLE event_participants (
    id         UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id   UUID             NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id    UUID             NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    status     participant_status NOT NULL DEFAULT 'APPROVED',
    joined_at  TIMESTAMPTZ      DEFAULT NOW(),
    updated_at TIMESTAMPTZ      DEFAULT NOW(),
    UNIQUE (event_id, user_id)
);

CREATE INDEX idx_participants_event  ON event_participants(event_id);
CREATE INDEX idx_participants_user   ON event_participants(user_id);
CREATE INDEX idx_participants_status ON event_participants(status);
