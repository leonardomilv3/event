CREATE TABLE profiles (
    user_id      UUID         PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    avatar_url   TEXT,
    bio          TEXT,
    city         VARCHAR(100),
    interests    TEXT[],
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
