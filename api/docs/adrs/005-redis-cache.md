# ADR-005: Redis para cache de feed

## Status
Accepted

## Contexto

As queries de feed e nearby envolvem PostGIS (`ST_DWithin`, `ST_Distance`), joins e scoring composto — relativamente custosas para executar a cada request. O feed de eventos muda com baixa frequência (criação, publicação, cancelamento de eventos).

## Decisão

Usamos **Redis** como cache em memória para os resultados paginados de `findNearby` e `findFeed`.

### Implementação

- Cliente: `io.quarkus.redis.datasource.RedisDataSource` com `ValueCommands<String, String>` (JSON serializado via Jackson)
- TTL: **300 segundos** (5 minutos) via `SetArgs.ex(TTL)`
- Chaves:
  - Nearby: `events:nearby:{lat:.2f}:{lon:.2f}:{radius:.0f}`
  - Feed: `events:feed:{lat:.2f}:{lon:.2f}`
  - Lat/lon arredondados para 2 casas decimais para coalescer requests próximas
- Invalidação: padrão `KEYS events:nearby:*` + `KEYS events:feed:*` + `DEL` nos eventos de escrita (criar, publicar, cancelar evento)
- **Degradação graciosa**: todos os acessos Redis em `try-catch`; falha silenciosa faz fallback para o banco

### Configuração

```properties
%dev.quarkus.redis.hosts=redis://localhost:6379
```

## Consequências

- Redis é dependência de infraestrutura obrigatória em dev/prod (disponível no `docker-compose.yml`)
- `KEYS pattern` é O(N) — aceitável para o volume do MVP; substituir por `SCAN` se o número de chaves crescer
- Invalidação parcial (por evento específico) não implementada — TTL garante consistência eventual
- `quarkus-redis-client` é a extensão usada; não confundir com o cliente Lettuce direto
