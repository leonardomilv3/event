import 'i18next'

import type Common from '../locales/pt-BR/common.json'
import type Auth from '../locales/pt-BR/auth.json'
import type Events from '../locales/pt-BR/events.json'
import type Social from '../locales/pt-BR/social.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof Common
      auth: typeof Auth
      events: typeof Events
      social: typeof Social
    }
  }
}