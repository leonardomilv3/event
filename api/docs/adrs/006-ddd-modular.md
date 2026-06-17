# ADR-006: DDD leve por módulo de domínio

## Status
Accepted

## Contexto

O backend precisa de uma organização que escale conforme novos módulos são adicionados, evite acoplamento entre domínios e mantenha clareza sobre onde cada responsabilidade reside — sem a complexidade de microserviços ou hexagonal architecture completa.

## Decisão

Adotamos **DDD leve** com módulos de domínio auto-contidos dentro de um monólito Quarkus.

### Estrutura por módulo

```
com.eventing.{módulo}/
├── domain/          # Entidades JPA e enums de domínio
├── dto/             # Records de entrada e saída (sem lógica)
├── service/         # Casos de uso; transações; regras de negócio
├── controller/      # JAX-RS; apenas HTTP → service → response
└── {Módulo}Repository.java  # Panache + queries customizadas
```

### Módulos existentes

| Módulo | Responsabilidade |
|---|---|
| `auth` | Register, login, emissão de JWT |
| `users` | Perfis públicos e edição do próprio perfil |
| `events` | CRUD de eventos, publicação, geolocalização, feed |
| `participants` | Join/leave, contagem atômica, listagem |
| `shared` | `ApiResponse`, `PageResponse`, `ApiException`, `GlobalExceptionMapper` |

### Regras de dependência

- Módulos podem importar de `shared/` livremente
- `participants` importa entidades de `events` e `users` (referências JPA necessárias)
- Nenhum módulo importa de `auth` (auth importa de `users`)
- Controllers nunca importam repositórios diretamente — sempre via service

### Padrões de código

- **Repositórios**: `PanacheRepositoryBase<Entity, UUID>` + `EntityManager` injetado para queries nativas
- **Transações**: `@Transactional` apenas em métodos de escrita nos services
- **DTOs**: Java records imutáveis; `null` para campos opcionais (Jackson `non-null` omite no JSON)
- **Erros**: `ApiException` com factories (`notFound`, `badRequest`, `forbidden`, `conflict`) capturada pelo `GlobalExceptionMapper`

## Consequências

- Módulos podem ser extraídos para microserviços no futuro sem refatoração de lógica — apenas a camada de transporte muda
- Não há interfaces para services — injeção direta da implementação; adicionar interface apenas se houver múltiplas implementações
- Hibernate em modo `validate` garante que código e schema nunca divergem silenciosamente
