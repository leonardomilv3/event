# ADRs — Backend Eventing

Decisões arquiteturais do backend (`api/`). Cada ADR documenta uma escolha técnica significativa com contexto, decisão, consequências e alternativas consideradas.

| ADR | Decisão |
|---|---|
| [001](001-java-quarkus.md) | Java 21 + Quarkus 3 |
| [002](002-smallrye-jwt.md) | SmallRye JWT (sem Keycloak no MVP) |
| [003](003-postgresql-postgis.md) | PostgreSQL + PostGIS (geolocalização nativa) |
| [004](004-flyway.md) | Flyway para migrations |
| [005](005-redis-cache.md) | Redis para cache de feed |
| [006](006-ddd-modular.md) | DDD leve por módulo de domínio |
| [007](007-native-queries-postgis.md) | Native queries + records tipados para operações PostGIS |
