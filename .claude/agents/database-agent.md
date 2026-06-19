# Database Agent

## Quando usar
- Criar ou modificar migrations Flyway
- Escrever queries nativas com PostGIS
- Adicionar índices ou otimizar consultas
- Debugar erros de schema ou tipo de dado

## Schema atual (V1–V5)

### V1 — users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'USER',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### V2 — profiles
```sql
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  city VARCHAR(100),
  interests TEXT[],
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### V3 — events
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE TYPE event_status AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'FINISHED');
CREATE TYPE event_visibility AS ENUM ('PUBLIC', 'PRIVATE', 'INVITE_ONLY');

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  visibility event_visibility NOT NULL DEFAULT 'PUBLIC',
  status event_status NOT NULL DEFAULT 'DRAFT',
  cover_image_url TEXT,
  location_name VARCHAR(200),
  address TEXT,
  location GEOGRAPHY(POINT, 4326),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  max_participants INTEGER,
  participant_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### V4 — event_participants
```sql
CREATE TYPE participant_status AS ENUM ('INVITED', 'REQUESTED', 'APPROVED', 'ATTENDED', 'DECLINED');

CREATE TABLE event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status participant_status NOT NULL DEFAULT 'APPROVED',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);
```

### V5 — follows
```sql
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT no_self_follow CHECK (follower_id <> following_id),
  UNIQUE(follower_id, following_id)
);
```

## Próxima migration: V6

## Padrões PostGIS

### Busca por proximidade
```sql
-- Eventos num raio de X km
WHERE ST_DWithin(location, ST_Point(:lon, :lat)::geography, :radiusMeters)

-- Ordenar por distância
ST_Distance(location, ST_Point(:lon, :lat)::geography) / 1000 AS distance_km

-- Extrair lat/lon da coluna geography
ST_Y(location::geometry) AS latitude,
ST_X(location::geometry) AS longitude
```

### Salvar localização
```java
// No service, ao criar evento:
GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 4326);
Point point = gf.createPoint(new Coordinate(longitude, latitude)); // lon, lat — nessa ordem
event.location = point;
```

## Regras para migrations

1. NUNCA alterar migrations já aplicadas em produção — criar nova migration
2. Sempre testar com `docker exec event-postgres-1 psql -U eventing -d eventing`
3. Tipos enum devem ser criados ANTES das tabelas que os usam
4. Índices obrigatórios:
   - Colunas de FK: `CREATE INDEX idx_tabela_coluna ON tabela(coluna);`
   - Coluna geography: `CREATE INDEX idx_tabela_location ON tabela USING GIST(location);`
   - Colunas de filtro frequente: `starts_at`, `status`, `visibility`

## Comparação de enums em queries nativas
```sql
-- CORRETO
WHERE status = 'APPROVED'::participant_status

-- ERRADO — causa "operator does not exist"
WHERE status = 'APPROVED'
```

## Ambiente local
- Host: localhost:5432
- Database: eventing
- User/Password: eventing/eventing
- Container: event-postgres-1
- Imagem: postgis/postgis:16-3.4 (NUNCA usar postgis:15-x.x com este banco)
