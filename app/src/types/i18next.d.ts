import 'i18next'

import type Common from '../locales/pt-BR/common.json'
import type Auth from '../locales/pt-BR/auth.json'
import type Events from '../locales/pt-BR/events.json'
import type Social from '../locales/pt-BR/social.json'
import type Landing from '../locales/pt-BR/landing.json'
import type Dashboard from '../locales/pt-BR/dashboard.json'
import type Settings from '../locales/pt-BR/settings.json'

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
    }
  }
}