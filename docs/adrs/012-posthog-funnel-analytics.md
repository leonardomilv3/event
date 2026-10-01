# ADR-012: PostHog para instrumentação do funil de crescimento

## Status

Accepted

## Context

Antes de investir em canais de aquisição precisamos responder duas perguntas sem query manual no banco:

1. Qual % de visitantes que chegam por **link compartilhado** termina **confirmando presença**?
2. Quantos usuários que confirmaram presença numa semana **voltam** na semana seguinte (retenção D7/semanal)?

O projeto já tinha `@vercel/analytics`, que só mede pageviews agregados: sem identidade de usuário, sem funil e sem retenção.

## Decision

**PostHog** (cloud US, `posthog-js`) é a ferramenta de produto. A inicialização fica em `app/src/lib/posthog.ts` (`VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`). A Vercel Analytics continua só para Web Vitals.

Eventos de funil são emitidos **somente** via `track()` de `app/src/lib/analytics.ts`, cujo tipo `FunnelEvent` é o contrato com os dashboards:

| Evento | Onde | Propriedades |
|---|---|---|
| `event_viewed` | `EventDetail`, uma vez por evento após auth resolver | `event_id`, `source` (`share`/`internal`), `ref`, `share_channel`, `category`, `authenticated` |
| `event_join_clicked` | `useParticipation.join`, antes da API | `event_id`, `authenticated` |
| `event_join_confirmed` | `useParticipation.join`, após 2xx | `event_id` |
| `share_prompt_shown` / `share_prompt_dismissed` | `EventDetail` (prompt pós-confirmação) | `event_id` |
| `share_link_copied` / `share_native_clicked` / `share_whatsapp_clicked` / `share_twitter_clicked` | `useShareEvent` | `event_id`, `surface` (`event_hero`/`post_join_prompt`) |

Atribuição:
- Todo link gerado pelo app é `/events/:id?ref=share&via={copy|native|whatsapp|twitter|qr}`.
- Ao abrir com `ref=share`, `markShareEntry()` registra `entry_ref`, `entry_event_id` e `entry_share_channel` como **propriedades de sessão**, que acompanham todos os eventos seguintes, inclusive depois do desvio pelo login.
- `posthog.identify(user.id)` no login, registro e restauração de sessão (`useAuth`) une a pessoa anônima que viu o link à conta criada.

Retenção **não** tem evento manual (`user_returned`). O PostHog calcula retenção nativamente a partir de `$pageview` (captura automática de SPA) e dos eventos acima. `user_logged_in`/`user_registered` + `identify` garantem a identidade de base.

### Insights a criar no PostHog

1. **Funil "Share → Join"**: Funnel, janela de conversão 1 dia, passos `event_viewed` (filtro `source = share`) → `event_join_clicked` → `event_join_confirmed`. Breakdown por `share_channel`.
2. **Retenção semanal de participantes**: Retention, evento inicial `event_join_confirmed`, evento de retorno "any event" (ou `$pageview`), período semanal.

## Consequences

**Positivas:**
- Funil e retenção prontos na ferramenta, sem pipeline próprio
- Nomes de eventos tipados, então um typo vira erro de build
- Atribuição de share sobrevive ao login graças à propriedade de sessão + identify

**Negativas:**
- Dependência de terceiro (US cloud); dados de comportamento saem da infraestrutura própria
- `posthog-js` aumenta o bundle principal (~150 kB min); candidato a lazy-load futuro
- Bloqueadores de anúncio podem suprimir parte dos eventos; considerar reverse proxy se a perda for relevante

## Alternatives Considered

- **Plausible**: sem cookies e simples, mas não tem identidade de usuário nem retenção por coorte, que são exatamente as perguntas a responder
- **Google Analytics 4**: overhead de configuração e de consentimento desproporcional ao estágio do MVP
- **Tabela própria de eventos no Postgres**: exigiria construir funil/retenção à mão
