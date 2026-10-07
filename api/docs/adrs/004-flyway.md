# ADR-004: Flyway para migrations

## Status
Accepted

## Contexto

O schema do banco evolui junto com o código. As opções foram:

| Opção | Decisão |
|---|---|
| `hibernate.ddl-auto=create-drop` | Descartado — destrói dados, não serve para produção |
| `hibernate.ddl-auto=update` | Descartado — não é determinístico, não registra histórico |
| Liquibase | Considerado — mais verboso (XML/YAML), sem vantagem clara no MVP |
| **Flyway** | **Escolhido** — simples, versionado, integrado ao Quarkus |

## Decisão

Usamos **Flyway** com migrations SQL versionadas em `src/main/resources/db/migration/`.

### Configuração

```properties
# Executa migrations no startup (só no perfil prod; não existe perfil %dev)
%prod.quarkus.flyway.migrate-at-start=true
%prod.quarkus.flyway.locations=classpath:db/migration
%prod.quarkus.flyway.baseline-on-migrate=true

# Hibernate em modo validate (não gera DDL)
%prod.quarkus.hibernate-orm.schema-management.strategy=validate
```

Localmente, a API roda com o perfil prod (JAR ou `./mvnw quarkus:dev -Dquarkus.profile=prod`); ver o README. Os testes usam `src/test/resources/application.properties`, que também liga `migrate-at-start`.

### Convenção de nomes

`V{n}__{descricao_snake_case}.sql` — ex: `V1__create_users.sql`

### Migrations existentes

| Versão | Arquivo | Conteúdo |
|---|---|---|
| V1 | `V1__create_users.sql` | Tabela `users` |
| V2 | `V2__create_profiles.sql` | Tabela `profiles` |
| V3 | `V3__create_events.sql` | PostGIS, enums, tabela `events` |
| V4 | `V4__create_participants.sql` | Enum `participant_status`, tabela `event_participants` |

## Consequências

- **Migrations são imutáveis** após aplicação — nunca editar um arquivo já executado; criar nova migration `V{n+1}`
- Em dev, o banco é recriado dropando e recriando via `%dev` profile quando necessário
- `baseline-on-migrate=true` permite aplicar Flyway em banco pré-existente sem histórico
