import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Icon from '../atoms/Icon'

export default function Footer() {
  const { t } = useTranslation()

  const links = [
    { labelKey: 'footer.privacy', href: '/privacy' },
    { labelKey: 'footer.terms', href: '/terms' },
    { labelKey: 'footer.editorial', href: '/editorial' },
    { labelKey: 'footer.contact', href: '/contact' },
  ] as const

  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/30 py-stack-lg">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto gap-stack-md">
        <div className="flex flex-col items-center md:items-start gap-4">
          <span className="font-serif text-headline-md text-on-surface">
            {t('app.name')}
          </span>
          <p className="font-label-caps text-label-caps text-on-tertiary-fixed-variant">
            {t('footer.copyrightFull')}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="font-label-caps text-label-caps text-on-tertiary-fixed-variant hover:text-primary-container transition-colors"
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </div>

        <div className="flex gap-4">
          <Link
            to="/settings"
            className="hover:text-primary-container transition-colors"
            aria-label={t('footer.languageLabel')}
          >
            <Icon name="language" className="text-on-surface" size={22} />
          </Link>
          <button
            type="button"
            className="hover:text-primary-container transition-colors"
            aria-label={t('footer.shareLabel')}
          >
            <Icon name="share" className="text-on-surface" size={22} />
          </button>
        </div>
      </div>
    </footer>
  )
}