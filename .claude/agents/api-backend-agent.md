# API Backend Agent

## Quando usar
- Implementar novo endpoint, service ou repository
- Criar nova entidade ou migration Flyway
- Revisar código Java antes de commitar
- Debugar erros de runtime na API

## Stack e versões obrigatórias
- Java 25 (ver `api/docs/adrs/010-java-25-quarkus-3-40.md`; JDK 21 não compila mais o projeto)
- Quarkus 3.40.1 (LTS)
- Hibernate ORM + Panache
- Flyway (versão do Quarkus BOM) + extensão `quarkus-flyway-postgresql` (obrigatória para PG 16)
- SmallRye JWT (RSA RS256)
- PostgreSQL 16.4 + PostGIS

## Estrutura de pacotes (DDD leve)

com.eventing
├── auth/          (controller, service, dto)
├── events/        (controller, service, domain, dto, EventRepository)
├── participants/  (controller, service, domain, dto, ParticipantRepository)
├── social/        (controller, service, domain, dto)
├── users/         (controller, service, domain, dto, UserRepository)
└── shared/        (exception, response, config)


## Convenções obrigatórias

### Controllers JAX-RS
- NUNCA dois controllers com o mesmo `@Path` na classe
- Paths de sub-recursos (ex: participants de evento) devem ficar no mesmo controller do recurso pai para evitar conflito de rotas
- Exemplo correto: `join`, `leave`, `participants` ficam em `EventController`, não em controller separado
- Path da classe sempre com prefixo `/api/` (ex: `@Path("/api/events")`)
- Usar `@RolesAllowed("user")` + `@SecurityRequirement(name = "jwt")` em endpoints autenticados

### Enums com PostgreSQL
- SEMPRE usar `@JdbcType(PostgreSQLEnumJdbcType.class)` em campos enum mapeados para tipos enum do PostgreSQL
- Imports necessários:
```java
  import org.hibernate.annotations.JdbcType;
  import org.hibernate.dialect.PostgreSQLEnumJdbcType;
```
- Exemplo:
```java
  @Column(name = "status")
  @JdbcType(PostgreSQLEnumJdbcType.class)
  private EventStatus status;
```
- Em queries nativas, usar cast explícito: `'APPROVED'::participant_status`

### Migrations Flyway
- Arquivos em `src/main/resources/db/migration/`
- Nomenclatura: `V{N}__{descricao_com_underscores}.sql`
- Versão atual: V9 (próxima deve ser V10)
- Habilitar no properties: `quarkus.flyway.migrate-at-start=true`
- Para enums PostgreSQL, criar tipo ANTES das tabelas:
```sql
  CREATE TYPE event_status AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'FINISHED');
```
- PostGIS: `CREATE EXTENSION IF NOT EXISTS postgis;` na migration que usa geography

### Entidades Panache
- Herdar de `PanacheEntityBase` com ID explícito, nunca `PanacheEntity`
- UUID como PK: `@Id @GeneratedValue UUID id;`
- Relacionamentos com `@ManyToOne(fetch = FetchType.LAZY)`
- `@JoinColumn` explícito em todos os relacionamentos

### Padrão de resposta
- Wrapper: `ApiResponse.ok(data)` para sucesso, `ApiResponse.error(msg)` para erro
- Paginação: `PageResponse.of(content, page, size, total)`
- Erros: usar `ApiException.notFound()`, `ApiException.badRequest()`, `ApiException.conflict()`

### Transações
- `@Transactional` obrigatório em todos os métodos de service que escrevem no banco
- Métodos de leitura que fazem lazy loading também precisam de `@Transactional`
- Atualização atômica de contadores:
```java
  repository.update("count = count + 1 where id = ?1", id);
```

## Armadilhas conhecidas (NUNCA repetir)

| Armadilha | Causa | Solução |
|---|---|---|
| `Fatal error compiling: error: release version 25 not supported` | JDK abaixo do 25 no `JAVA_HOME` | Usar Java 25 via SDKMAN: `sdk use java 25-tem` |
| `Unsupported Database: PostgreSQL 16` | Falta suporte a PostgreSQL no Flyway | Manter a dependência `quarkus-flyway-postgresql` |
| `operator does not exist: event_status = character varying` | Enum sem @JdbcType | Adicionar `@JdbcType(PostgreSQLEnumJdbcType.class)` (Hibernate 7: `org.hibernate.dialect.type.PostgreSQLEnumJdbcType`) |
| CORS para de funcionar sem erro | `quarkus.http.cors=true` é ignorado no Quarkus 3.40 | Usar `quarkus.http.cors.enabled=true` |
| `Schema-validation: missing table` | Hibernate validate sem migration | Criar migration correspondente |
| `Recurso não encontrado` em endpoint existente | Conflito de @Path entre controllers | Consolidar endpoints no mesmo controller |
| `data directory initialized by PostgreSQL 16` | Volume com PG16, imagem PG15 | Usar `postgis/postgis:16-3.4` e `docker compose down -v` |

## Checklist antes de finalizar qualquer tarefa backend
- [ ] `./mvnw compile` sem erros
- [ ] Nenhum campo enum sem `@JdbcType`
- [ ] Nenhum controller com `@Path` duplicado
- [ ] Migration criada para cada nova tabela/coluna
- [ ] `@Transactional` em todos os métodos de escrita
- [ ] Resposta via `ApiResponse` wrapper
- [ ] Endpoints autenticados com `@RolesAllowed("user")`
