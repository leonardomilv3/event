-- ends_at passa a ser obrigatório. Eventos legados sem término recebem
-- duração padrão de 2h antes da constraint, para não quebrar dados existentes.
UPDATE events SET ends_at = starts_at + INTERVAL '2 hours' WHERE ends_at IS NULL;

ALTER TABLE events ALTER COLUMN ends_at SET NOT NULL;
