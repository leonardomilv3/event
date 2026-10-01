import posthog from './posthog'

type EventLogAttributes = {
  category: string
  visibility: string
  status: string
}

export const eventLifecycleLogger = {
  created(attributes: EventLogAttributes): void {
    posthog.logger.info('event creation completed', {
      operation: 'event_created',
      ...attributes,
    })
  },
  updated(attributes: EventLogAttributes): void {
    posthog.logger.info('event update completed', {
      operation: 'event_updated',
      ...attributes,
    })
  },
  cancelled(): void {
    posthog.logger.info('event cancellation completed', {
      operation: 'event_cancelled',
    })
  },
}
