import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import ptBRCommon from '../locales/pt-BR/common.json'
import ptBRAuth from '../locales/pt-BR/auth.json'
import ptBREvents from '../locales/pt-BR/events.json'
import ptBRSocial from '../locales/pt-BR/social.json'
import ptBRLanding from '../locales/pt-BR/landing.json'
import ptBRDashboard from '../locales/pt-BR/dashboard.json'
import ptBRSettings from '../locales/pt-BR/settings.json'

import enCommon from '../locales/en/common.json'
import enAuth from '../locales/en/auth.json'
import enEvents from '../locales/en/events.json'
import enSocial from '../locales/en/social.json'
import enLanding from '../locales/en/landing.json'
import enDashboard from '../locales/en/dashboard.json'
import enSettings from '../locales/en/settings.json'

export const SUPPORTED_LANGUAGES = ['pt-BR', 'en'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  'pt-BR': 'Português (BR)',
  en: 'English',
}

export const resources = {
  'pt-BR': {
    common: ptBRCommon,
    auth: ptBRAuth,
    events: ptBREvents,
    social: ptBRSocial,
    landing: ptBRLanding,
    dashboard: ptBRDashboard,
    settings: ptBRSettings,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    events: enEvents,
    social: enSocial,
    landing: enLanding,
    dashboard: enDashboard,
    settings: enSettings,
  },
} as const

export const NAMESPACES = [
  'common',
  'auth',
  'events',
  'social',
  'landing',
  'dashboard',
  'settings',
] as const

const STORAGE_KEY = 'eventing.language'
const FALLBACK: SupportedLanguage = 'en'

function isSupportedLanguage(value: string | null): value is SupportedLanguage {
  return value === 'pt-BR' || value === 'en'
}

/** Reads the user's explicit choice from a previous visit. */
function readStoredLanguage(): SupportedLanguage | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isSupportedLanguage(stored) ? stored : null
  } catch {
    // localStorage can throw in private mode / when disabled by the user.
    return null
  }
}

/**
 * Resolves the language to use on first load.
 * Priority:
 *   1. User's explicit choice from a previous visit (localStorage)
 *   2. Browser's preferred language (any of navigator.languages), matched to pt-BR/en
 *   3. Fallback to 'en' for any other browser language (fr, de, ja, ...)
 */
function detectBrowserLanguage(): SupportedLanguage {
  const candidates: string[] = []
  if (typeof navigator !== 'undefined') {
    if (navigator.language) candidates.push(navigator.language)
    if (Array.isArray(navigator.languages)) candidates.push(...navigator.languages)
  }

  for (const candidate of candidates) {
    const lower = candidate.toLowerCase()
    if (lower === 'pt-br' || lower.startsWith('pt')) return 'pt-BR'
    if (lower === 'en' || lower.startsWith('en')) return 'en'
  }

  return FALLBACK
}

function getInitialLanguage(): SupportedLanguage {
  return readStoredLanguage() ?? detectBrowserLanguage()
}

const initialLanguage = getInitialLanguage()

function persistLanguage(lng: string): void {
  const resolved: SupportedLanguage = isSupportedLanguage(lng) ? lng : FALLBACK
  try {
    localStorage.setItem(STORAGE_KEY, resolved)
  } catch {
    // ignore storage failures — language still applies for this session
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = resolved
  }
}

i18n.on('languageChanged', persistLanguage)

void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: FALLBACK,
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    ns: NAMESPACES as unknown as string[],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })
  .then(() => {
    persistLanguage(i18n.language)
  })

export default i18n