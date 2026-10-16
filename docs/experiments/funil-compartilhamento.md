---
type: experiment
status: draft
date: 2026-10-15
tags: [experimento, posthog, funil, retencao]
related:
  - ../adrs/012-posthog-funnel-analytics.md
  - ../product/priorizacao.md
---

# Funil de compartilhamento: link → participação → retenção

Baseado no [ADR-012](../adrs/012-posthog-funnel-analytics.md), que instrumentou o funil no PostHog.

`status: draft` porque o período e o critério de sucesso ainda não foram definidos.

## Hipótese

Links de evento compartilhados pelo app convertem visitantes em participantes confirmados, e quem confirma presença volta ao app na semana seguinte.

## Métrica e evento PostHog

- **Conversão share → join:** funil `event_viewed` (filtro `source = share`) → `event_join_clicked` → `event_join_confirmed`, janela de 1 dia, breakdown por `share_channel` (insight 1 do ADR-012).
- **Retenção D7/semanal:** evento inicial `event_join_confirmed`, retorno "any event" ou `$pageview`, período semanal (insight 2 do ADR-012). Não há evento manual de retorno; o PostHog calcula a retenção.

Eventos já instrumentados em `app/src/lib/analytics.ts` (tipo `FunnelEvent`, emitidos só via `track()`):

| Evento | Papel no experimento |
|---|---|
| `event_viewed` | Entrada do funil (`source` = `share` ou `internal`) |
| `event_join_clicked` | Intenção de participar |
| `event_join_confirmed` | Conversão; evento inicial da retenção |
| `share_prompt_shown` / `share_prompt_dismissed` | Prompt de convite pós-confirmação |
| `share_link_copied` / `share_native_clicked` / `share_whatsapp_clicked` / `share_twitter_clicked` | Geração de novos links (`surface` = `event_hero` ou `post_join_prompt`) |

Atribuição: `markShareEntry()` registra `entry_ref`, `entry_event_id` e `entry_share_channel` como propriedades de sessão, e `posthog.identify` no login/registro une o visitante anônimo à conta.

Limitação conhecida: o fluxo de participação só existe em eventos `PRIVATE` e `INVITE_ONLY` (ver [priorizacao.md](../product/priorizacao.md)). Em eventos `PUBLIC` o funil termina em `event_viewed`.

## Critério de sucesso

a definir

## Período

- **Início:** a definir
- **Fim:** a definir

## Resultado

Pendente: o dashboard do PostHog ainda não foi validado.

## Decisão

a definir
