import 'i18next'

import type Common from '../locales/en/common.json'
import type Auth from '../locales/en/auth.json'
import type Events from '../locales/en/events.json'
import type Social from '../locales/en/social.json'
import type Landing from '../locales/en/landing.json'
import type Dashboard from '../locales/en/dashboard.json'
import type Settings from '../locales/en/settings.json'
import type Calendar from '../locales/en/calendar.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof Common
      auth: typeof Auth
      events: typeof Events
      social: typeof Social
      landing: typeof Landing
      dashboard: typeof Dashboard
      settings: typeof Settings
      calendar: typeof Calendar
    }
  }
}