# ADR-003: PostgreSQL + PostGIS (geolocalização nativa)

## Status
Accepted

## Contexto

O Eventing é uma plataforma de descoberta de eventos **por localização**. Isso exige:

1. Consultas de proximidade eficientes ("eventos em raio de X km")
2. Armazenamento de coordenadas geográficas com semântica esférica (não plana)
3. Scoring de feed que combina distância, popularidade e urgência

As alternativas avaliadas:

| Opção | Decisão |
|---|---|
| Calcular distância na aplicação (Haversine) | Descartado — inviável para queries paginadas sem índice espacial |
| MongoDB com 2dsphere index | Descartado — mudaria o stack sem ganho claro no MVP |
| PostgreSQL + PostGIS | **Escolhido** |

## Decisão

Usamos **PostgreSQL** como banco principal com a extensão **PostGIS** ativada.

- Tipo de coluna: `geography(Point,4326)` — usa SRID WGS-84, distâncias em metros
- ORM: `hibernate-spatial:6.5.2.Final` para bind de `org.locationtech.jts.geom.Point`
- Queries nativas via `EntityManager` para `ST_DWithin`, `ST_Distance`, `ST_Y`/`ST_X`
- `GeometryFactory` como constante estática: `new GeometryFactory(new PrecisionModel(), 4326)`
- Coordenadas: `Point.getX() = longitude`, `Point.getY() = latitude`

## Consequências

- PostGIS deve estar instalado no container PostgreSQL (imagem `postgis/postgis`)
- `hibernate-spatial` não está no Quarkus BOM — versão deve ser declarada explicitamente e alinhada ao Hibernate em uso
- Queries nativas retornam `List<Object[]>`; mapeamento manual via helpers de tipo (`asUuid`, `asDouble`, `asLocalDateTime`)
- Enums PostgreSQL (`event_status`, `event_visibility`) exigem `@Column(columnDefinition = "nome_do_tipo")` + `@Enumerated(EnumType.STRING)`
