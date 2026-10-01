import posthog from './posthog'

/**
 * Eventos do funil de crescimento (link compartilhado → participação → retenção).
 * Nomes são contrato com os insights do PostHog — renomear quebra dashboards.
 */
export type FunnelEvent =
  | 'event_viewed'
  | 'event_join_clicked'
  | 'event_join_confirmed'
  | 'share_prompt_shown'
  | 'share_prompt_dismissed'
  | 'share_link_copied'
  | 'share_native_clicked'
  | 'share_whatsapp_clicked'
  | 'share_twitter_clicked'

export type ShareSurface = 'event_hero' | 'post_join_prompt'

type PropertyValue = string | number | boolean | null

export function track(event: FunnelEvent, properties: Record<string, PropertyValue> = {}): void {
  posthog.capture(event, properties)
}

/**
 * Marca a sessão como originada de link compartilhado: todo evento seguinte
 * (inclusive após o desvio pelo login) carrega `entry_ref`, permitindo
 * breakdown do funil sem depender de query param.
 */
export function markShareEntry(eventId: string, channel: string | null): void {
  posthog.register_for_session({
    entry_ref: 'share',
    entry_event_id: eventId,
    entry_share_channel: channel,
  })
}
