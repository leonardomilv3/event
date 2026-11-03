import { useTranslation } from 'react-i18next'
import {
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '../../lib/i18n'

interface LanguageSwitcherProps {
  className?: string
}

export default function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation()
  const current = (i18n.resolvedLanguage ?? i18n.language) as SupportedLanguage

  return (
    <div className={className}>
      <div className="relative">
        <select
          aria-label={t('language.label')}
          value={current}
          onChange={(e) => void i18n.changeLanguage(e.target.value)}
          className={[
            'w-full appearance-none cursor-pointer',
            'bg-surface-container-lowest border border-outline-variant rounded-lg',
            'px-stack-sm pr-10 py-stack-sm text-on-surface text-body-md font-label-md',
            'focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30',
            'hover:border-primary-container/40 transition-all',
          ].join(' ')}
        >
          {SUPPORTED_LANGUAGES.map((code) => (
            <option key={code} value={code} className="bg-surface-container text-on-surface">
              {LANGUAGE_LABELS[code]}
            </option>
          ))}
        </select>
        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          aria-hidden="true"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  )
}