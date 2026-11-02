import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import ptBRCommon from '../locales/pt-BR/common.json'
import ptBRAuth from '../locales/pt-BR/auth.json'
import ptBREvents from '../locales/pt-BR/events.json'
import ptBRSocial from '../locales/pt-BR/social.json'

export const SUPPORTED_LANGUAGES = ['pt-BR'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export const resources = {
  'pt-BR': {
    common: ptBRCommon,
    auth: ptBRAuth,
    events: ptBREvents,
    social: ptBRSocial,
  },
} as const

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    ns: ['common', 'auth', 'events', 'social'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'eventing.language',
    },
    react: { useSuspense: false },
  })

export default i18n