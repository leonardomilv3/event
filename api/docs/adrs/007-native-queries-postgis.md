# ADR-007: Native Queries para Operações PostGIS

## Status

Accepted

## Context

O projeto Eventing usa a coluna `location GEOGRAPHY(POINT, 4326)` com a extensão PostGIS para busca geoespacial. Os métodos `findNearby`, `findFeed`, `countNearby` e `countFeed` em `EventRepository` requerem funções PostGIS — `ST_DWithin`, `ST_Distance`, `ST_Point`, `ST_Y`, `ST_X` — para filtrar eventos por raio de distância, calcular distâncias em km e extrair coordenadas da coluna geography.

JPQL e HQL do Hibernate não têm suporte nativo a funções `GEOGRAPHY` específicas do PostgreSQL. O Hibernate Spatial oferece suporte parcial a WKT/WKB, mas não ao tipo `GEOGRAPHY` do PostgreSQL que o schema já usa (V3).

O mapeamento original dessas queries retornava `List<Object[]>` com 20 colunas acessadas por índice numérico no `EventService` — frágil, pois qualquer mudança na ordem das colunas do SELECT quebra silenciosamente o mapeamento.

## Decision

Manter native queries SQL para todas as operações PostGIS em `EventRepository`. Eliminar o mapeamento por índice introduzindo o record tipado `NativeEventRow` (20 campos nomeados, pacote `com.eventing.events`). O mapeamento de `Object[]` para `NativeEventRow` é encapsulado no método privado `mapToNativeRow` com comentário de índice por coluna.

Padrão adotado no código:

```java
// Repository — mapToNativeRow é privado; a camada de serviço nunca vê Object[]
// [0] id  [1] creator_id  [2] username  ...  [19] distance_km
private NativeEventRow mapToNativeRow(Object[] r) { ... }

public List<NativeEventRow> findNearby(...) {
    List<Object[]> rows = em.createNativeQuery(sql)...getResultList();
    return rows.stream().map(this::mapToNativeRow).toList();
}

// Service — acesso por nome de campo, sem índice
private EventResponse fromNativeRow(NativeEventRow r) {
    return new EventResponse(r.id(), r.creatorId(), r.title(), ...);
}
```

O mesmo padrão se aplica a `ApprovedParticipantRow` em `ParticipantRepository` para a query de participantes aprovados (que requer `LEFT JOIN profiles` não traversável via JPA).

## Consequences

**Positivas:**
- Mapeamento type-safe: campos acessados por nome, erros de ordem detectados em tempo de compilação
- Queries PostGIS intactas — nenhum risco de regressão por tradução ORM
- Sem acoplamento ao Hibernate Spatial para operações que o ORM não suporta nativamente
- `mapToNativeRow` documenta a ordem das colunas via comentário de índice — qualquer alteração no SELECT quebra o mapeamento de forma explícita e localizada no repository

**Negativas:**
- SQL nativo não é validado em tempo de compilação — erros de sintaxe só aparecem em runtime
- Ao alterar o SELECT, dois locais precisam ser sincronizados: a query e o comentário de índices em `mapToNativeRow`

## Alternatives Considered

- **`hibernate-spatial`** — suporta apenas WKT/WKB básico; o tipo `GEOGRAPHY` específico do PostgreSQL (usado no schema desde V3) não é compatível; descartado por incompatibilidade com o schema existente
- **Migrar backend para Node.js/Prisma** — Prisma tem suporte a PostGIS via extensão `@prisma/client` + raw queries; descartado por incompatibilidade com a stack JVM/Quarkus e pelas integrações já consolidadas (SmallRye JWT, Redis Panache, Flyway)
