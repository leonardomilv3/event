---
type: product
status: draft
date: 2026-10-15
tags: [produto, priorizacao, discovery]
related:
  - ../routes.md
  - ../adrs/012-posthog-funnel-analytics.md
  - ../adrs/013-photon-geocoding.md
  - ../experiments/funil-compartilhamento.md
---

# Priorização da fase de discovery

Decisão de prioridade tomada na fase de discovery. A lista bruta de ideias que a originou está em `notes.md`, na raiz do repositório.

A coluna **situação** vem só de evidência no código ou nos ADRs, conferida em 2026-10-15. Onde não há evidência, fica "a confirmar".

## P0: MVP mínimo

| Item | Situação |
|---|---|
| CRUD de eventos | Implementado: CRUD e rascunho → publicação em `api/.../events` |
| Localização manual/GPS | Parcial: endereço digitado com autocomplete Photon na criação/edição ([ADR-013](../adrs/013-photon-geocoding.md)); GPS (`navigator.geolocation`) só localiza o usuário para o feed da landing (`useEventFeed`), não define o local do evento |
| Capacidade mín/máx | Parcial: só máximo (`max_participants`, validado no join); mínimo não encontrado |
| Visibilidade público/privado | Implementado: `PUBLIC`, `PRIVATE` e `INVITE_ONLY` (migration `V3__create_events.sql`) |
| Participar / talvez / não vou | Parcial: entrar e sair (sair = `DECLINED`) em eventos não públicos; não existe "talvez" |
| Perfil público | Implementado: rota `/users/:userId` (`PublicProfilePage`) |
| Filtro por distância/tipo/data | Parcial: a API aceita raio até 50 km (`/api/events/nearby`) e `category`; no front a landing usa o feed por proximidade sem filtro exposto (`useNearbyEvents` existe, mas nenhuma página o usa); filtro por data não encontrado |
| Upload de imagem/banner | A confirmar: existe a coluna `cover_image_url` e o front exibe a imagem, mas `CreateEventRequest` não tem esse campo e não há upload no front |

## P1: loop orgânico

| Item | Situação |
|---|---|
| Compartilhamento por link | Implementado: copiar link, share nativo, WhatsApp, X, com atribuição `ref=share` (`useShareEvent`, [ADR-012](../adrs/012-posthog-funnel-analytics.md)) |
| Seguidores | Implementado: seguir/deixar de seguir, listas (`api/.../social`) |
| Lembretes 24h/1h | Implementado, **desligado por padrão** (`NOTIFICATIONS_ENABLED=false`, `api/.../notifications`) |
| Confirmar participação | Implementado: join → `APPROVED`, evento `event_join_confirmed` |
| QR Code | Parcial: QR de divulgação do evento no `EventDetail` (client-side); check-in por QR não encontrado |
| Eventos próximos | Implementado: `/api/events/nearby` e feed por proximidade com PostGIS |

## P2: capitalização (só após tração)

| Item | Situação |
|---|---|
| Destaque pago "Promoted" pelo organizador | A confirmar |
| Pagamento por inscrição (Pix/Stripe) | A confirmar |
| Cobrança por quantidade de participantes | A confirmar |

## P3: alimenta tráfego pago

| Item | Situação |
|---|---|
| Recomendação por comportamento | A confirmar |
| Alertas de eventos populares | A confirmar |
| Comentários/curtidas | A confirmar |
| Compartilhamento em redes sociais | Parcial: WhatsApp e X via `useShareEvent`; Instagram e outras redes não encontradas |

## Backlog

Chat do evento, enquetes, comunidades, integrações (Uber, Moovit, clima, Wallet, avaliações do Google), recorrência, fork de evento, avaliação do evento. Situação: a confirmar.

## Decisão posterior: participação só em eventos não públicos

Eventos `PUBLIC` não têm fluxo de participar nem contagem de inscritos. Isso vale só para `PRIVATE` e `INVITE_ONLY`.

Situação: implementado no front no commit `8ccb818` (`EventDetail` e `EventManagement`; ver [routes.md](../routes.md)). No backend, `ParticipantService` não bloqueia join em evento `PUBLIC`; se isso deve ser bloqueado na API está a confirmar.
