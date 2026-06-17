# ADR-001: Java 21 + Quarkus 3

## Status
Accepted

## Contexto

O backend do Eventing precisa de uma plataforma JVM moderna com tempo de startup rápido para containers, suporte nativo a CDI, JWT e ORM sem boilerplate excessivo. A equipe tem familiaridade com Java e quer aproveitar features modernas da linguagem (records, switch expressions, text blocks).

## Decisão

Usamos **Java 21** (LTS) com **Quarkus 3.12.3**.

- `maven.compiler.release=21` travado no `pom.xml`
- Quarkus BOM gerencia versões de todas as extensões oficiais
- Runtime: JVM (não native-image no MVP — toolchain mais simples)

## Consequências

- **Switch type patterns** (`case SomeException e ->`) disponíveis
- **Unnamed variables** (`_`) **não disponíveis** — requerem Java 22+; usar variáveis nomeadas
- Extensions fora do BOM (ex: `hibernate-spatial`) exigem versão explícita alinhada à versão do Hibernate usada pelo Quarkus (`6.5.2.Final`)
- Hot reload via `quarkus:dev`; `tsc -b` não se aplica — validação de tipos em `mvn compile`
