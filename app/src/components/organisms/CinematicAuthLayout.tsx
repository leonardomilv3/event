import { type ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import GlowCursor from '../atoms/GlowCursor'

interface CinematicAuthLayoutProps {
  children: ReactNode
}

export default function CinematicAuthLayout({ children }: CinematicAuthLayoutProps) {
  const { t } = useTranslation('auth')

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface-container-lowest">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-surface-container-lowest via-surface-container to-surface-container-lowest" />
        <div className="absolute inset-0 z-10 nocturnal-overlay" />
        <div className="relative z-20 flex flex-col justify-between w-full h-full p-margin-desktop">
          <div className="flex items-center gap-2">
            <span className="font-serif text-headline-lg text-primary-container tracking-tight">
              Eventing
            </span>
            <div className="w-2 h-2 rounded-full bg-primary-container pulse-dot" />
          </div>

          <div className="max-w-xl">
            <h1 className="font-serif text-display-lg text-on-surface leading-tight">
              <Trans
                i18nKey="brand.headline"
                ns="auth"
                components={{ em: <span className="italic font-normal" /> }}
              />
            </h1>
            <p className="mt-stack-sm font-body-lg text-body-lg text-on-surface-variant/80 max-w-md">
              {t('brand.subtitle')}
            </p>
          </div>

          <div className="flex gap-stack-md text-on-surface-variant font-label-caps tracking-widest">
            <span>{t('brand.steps.discover')}</span>
            <span>{t('brand.steps.connect')}</span>
            <span>{t('brand.steps.experience')}</span>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-margin-mobile md:p-margin-desktop bg-surface-container-lowest">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-stack-xl">
            <span className="font-serif text-headline-lg-mobile text-primary-container tracking-tight">
              Eventing
            </span>
          </div>
          {children}
        </div>
      </div>

      <GlowCursor />
    </div>
  )
}