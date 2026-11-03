import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface AuthFormPanelProps {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

export default function AuthFormPanel({
  title,
  subtitle,
  children,
  footer,
}: AuthFormPanelProps) {
  const { t } = useTranslation()

  return (
    <>
      <div className="glass-panel p-stack-lg rounded-xl">
        <header className="mb-stack-lg">
          <h2 className="font-serif text-headline-lg text-on-surface">{title}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">{subtitle}</p>
        </header>

        {children}

        {footer && <div className="mt-stack-xl text-center">{footer}</div>}
      </div>

      <footer className="mt-stack-lg flex justify-between font-label-md text-on-tertiary-fixed-variant opacity-60">
        <span>{t('footer.copyright')}</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-primary transition-colors">
            {t('footer.privacy')}
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            {t('footer.terms')}
          </a>
        </div>
      </footer>
    </>
  )
}