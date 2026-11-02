import { useTranslation } from 'react-i18next'
import { type SupportedLanguage } from '../../lib/i18n'

const LANGUAGES: { code: SupportedLanguage; nativeName: string }[] = [
  { code: 'pt-BR', nativeName: 'Português' },
]

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const current = (i18n.resolvedLanguage ?? 'pt-BR') as SupportedLanguage

  if (LANGUAGES.length < 2) return null

  return (
    <select
      aria-label={t('language.label')}
      value={current}
      onChange={(e) => void i18n.changeLanguage(e.target.value)}
      className="bg-surface-variant text-on-surface font-label-md text-label-md rounded-full px-3 py-1.5 border border-white/5"
    >
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.nativeName}
        </option>
      ))}
    </select>
  )
}