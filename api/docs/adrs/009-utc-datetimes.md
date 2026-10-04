# ADR-009: Datas em UTC de ponta a ponta

## Status

Accepted

## Context

As entidades usam `LocalDateTime` (sem fuso) mapeado para colunas `TIMESTAMPTZ`, e os DTOs devolviam `LocalDateTime` serializado sem offset (`"2026-09-17T22:00:00"`). Isso causava dois erros:

1. **Persistência dependente do fuso da JVM.** Sem configuração explícita, o Hibernate grava `LocalDateTime` em `timestamptz` usando o fuso default da JVM. Em produção (container, UTC) o instante saía certo; em dev (-03) saía deslocado 3h, e as queries nativas que comparam com `now()` (feed, nearby, sitemap) divergiam do caminho via entidade. `LocalDateTime.now()` em `@PrePersist` também usava o fuso da JVM.
2. **Exibição deslocada no browser.** Sem offset no JSON, `new Date("2026-09-17T22:00:00")` é interpretado como hora local, então usuários em -03 viam horários 3h adiantados. O formulário de edição (`slice(0, 16)`) mostrava a hora UTC como se fosse local. Só o `app/middleware.ts` tratava certo (`toUtcDate`).

## Decision

Todo `LocalDateTime` do domínio representa **UTC**:

- `quarkus.hibernate-orm.jdbc.timezone=UTC` em `application.properties`; `-Duser.timezone=UTC` no `Dockerfile`.
- `LocalDateTime.now(ZoneOffset.UTC)`, nunca `LocalDateTime.now()`.
- `shared/config/UtcDateTimeJacksonCustomizer` serializa todo `LocalDateTime` como ISO-8601 com `Z` e desserializa com ou sem offset (entradas antigas do cache Redis). Prioridade mínima para prevalecer sobre o `JavaTimeModule` do Quarkus.
- Queries nativas normalizam `OffsetDateTime`/`Instant` para UTC antes de `toLocalDateTime()`.
- Requests continuam recebendo `OffsetDateTime` com o offset do cliente (`datetimeLocalToIso`).
- Frontend: datas da API passam por `parseApiDate` (`app/src/utils/date.ts`), que assume UTC quando falta offset; `apiDateToDatetimeLocal` converte para `<input type="datetime-local">`.

## Consequences

**Positivas:**
- Instante salvo e exibido independe do fuso da JVM e do usuário
- Contrato JSON explícito (`...Z`), igual ao que o middleware já assumia

**Negativas:**
- Dados criados em ambientes de dev com JVM fora de UTC antes desta mudança estão deslocados (produção roda em UTC e não é afetada)
- Convenção implícita no tipo: `LocalDateTime` não carrega o fuso — depende desta regra

## Alternatives Considered

- **Trocar DTOs para `OffsetDateTime`/`Instant`** — mais explícito no tipo, mas exige mudar todos os DTOs e mapeamentos; o serializer global resolve o contrato num ponto só.
- **Só corrigir no frontend (anexar `Z`)** — não resolveria a gravação dependente do fuso da JVM.
