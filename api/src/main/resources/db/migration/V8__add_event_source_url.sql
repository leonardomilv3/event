-- Link da agenda externa de onde o evento foi curado/importado (opcional)
ALTER TABLE events ADD COLUMN source_url VARCHAR(500);
