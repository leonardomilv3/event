# ADR-010: Java 25 + Quarkus 3.40 LTS

## Status

Accepted. Substitui o [ADR-001](001-java-quarkus.md) na escolha de versões.

## Context

O backend estava em Java 21 + Quarkus 3.12.3. Essa versão do Quarkus traz um Byte Buddy que só suporta até Java 22. Com JDK 25 no `PATH` (o padrão do SDKMAN na máquina de desenvolvimento), o build falhava com `Java 25 (69) is not supported by the current version of Byte Buddy`. Cada pessoa precisava manter dois JDKs e lembrar de trocar o `JAVA_HOME`. Além disso, o Quarkus 3.12 já não recebia correções.

Java 25 é LTS, e o Quarkus 3.40 é a LTS atual e suporta Java 25.

## Decision

- `maven.compiler.release=25` no `api/pom.xml`; Quarkus `3.40.1` (`quarkus.platform.version`).
- Imagens Docker: `maven:3.9-eclipse-temurin-25` (build) e `eclipse-temurin:25-jre` (runtime). A imagem de runtime instala `curl`, que não vem mais na base 25 e é usado pelo healthcheck do `docker-compose.yml`.
- CI (`.github/workflows/workflow.yml`): `actions/setup-java` com `java-version: '25'`.
- Versões de `hibernate-spatial` e do Flyway passam a vir do Quarkus BOM. O pin manual (`6.5.2.Final` e `10.15.0`) foi removido, e o suporte a PostgreSQL do Flyway agora vem da extensão `quarkus-flyway-postgresql`.
- Ajustes de migração exigidos pelo salto de versão:
  - Hibernate ORM 7: `PostgreSQLEnumJdbcType` mudou para `org.hibernate.dialect.type`.
  - `quarkus.http.cors=true` passou a ser **ignorado** (o CORS ficaria desligado sem aviso de erro). A chave nova é `quarkus.http.cors.enabled=true`.
  - `quarkus.hibernate-orm.database.generation` foi deprecada e trocada por `quarkus.hibernate-orm.schema-management.strategy`.
  - `quarkus-junit5` e `quarkus-junit5-mockito` foram renomeados para `quarkus-junit` e `quarkus-junit-mockito` (Quarkus 3.31+).
- Plugins Maven: `maven-compiler-plugin` 3.15.0, `maven-surefire-plugin`/`failsafe` 3.5.4.

## Consequences

**Positivas:**
- Um único JDK (25) para desenvolvimento, CI e produção
- Unnamed variables (`_`) e as demais features de linguagem do Java 22–25 passam a estar disponíveis
- Quarkus em versão LTS com correções de segurança
- Menos versões fixadas à mão no `pom.xml` (o BOM alinha Hibernate Spatial e Flyway)

**Negativas:**
- JDK 21 não compila mais o projeto (`release 25`)
- Imagem de runtime um pouco maior por causa do `curl`
- Em `quarkus:dev`, o JDK 25 imprime avisos de "restricted method" vindos do JNA; são inofensivos

Validação feita na migração: 200 testes passando com JaCoCo; migrations V1–V9 aplicadas do zero com Flyway 12; banco existente (histórico criado pelo Flyway 10) validado sem reaplicar nada; stack completa via `docker compose up --build` saudável.

## Alternatives Considered

- **Manter Java 21 + Quarkus 3.12**: continuaria exigindo dois JDKs e uma versão do Quarkus sem suporte.
- **Java 21 + Quarkus 3.40**: resolveria o suporte do Quarkus, mas não o atrito do JDK 25 já instalado nas máquinas, e adiaria uma migração de LTS do Java que viria de qualquer forma.
- **Forçar `-Dnet.bytebuddy.experimental=true` no Quarkus 3.12**: contorno sem suporte oficial, sem corrigir a defasagem do framework.
