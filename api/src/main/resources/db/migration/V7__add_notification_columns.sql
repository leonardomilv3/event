-- Rastreia quais lembretes de 24h e 1h já foram enviados para cada evento.
-- O scheduler consulta estas colunas para evitar reenvio em runs consecutivos.
ALTER TABLE events
    ADD COLUMN IF NOT EXISTS notified_24h BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS notified_1h  BOOLEAN NOT NULL DEFAULT FALSE;
