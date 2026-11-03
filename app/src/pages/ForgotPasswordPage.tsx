import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthFormPanel from '../components/molecules/AuthFormPanel'
import AuthInput from '../components/atoms/AuthInput'
import GlowCursor from '../components/atoms/GlowCursor'
import Icon from '../components/atoms/Icon'

export default function ForgotPasswordPage() {
  const { t } = useTranslation('auth')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-margin-mobile">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <div className="absolute top-stack-lg left-1/2 -translate-x-1/2">
        <Link to="/">
          <span className="font-serif text-headline-md text-primary-container tracking-tight">
            {t('app.name', { ns: 'common' })}
          </span>
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10">
        {sent ? (
          <AuthFormPanel
            title={t('forgotPassword.sentTitle')}
            subtitle={t('forgotPassword.sentSubtitle')}
            footer={<Link to="/login" className="font-label-md text-label-md text-primary-fixed-dim hover:underline">{t('forgotPassword.backToLogin')}</Link>}
          >
            <div className="flex flex-col items-center gap-stack-md py-stack-md">
              <Icon name="mark_email_read" size={64} className="text-primary-container" />
              <p className="font-body-md text-body-md text-on-surface-variant text-center">{t('forgotPassword.sentBody')}</p>
            </div>
          </AuthFormPanel>
        ) : (
          <AuthFormPanel
            title={t('forgotPassword.title')}
            subtitle={t('forgotPassword.subtitle')}
            footer={<Link to="/login" className="font-label-md text-label-md text-primary-fixed-dim hover:underline">{t('forgotPassword.backToLogin')}</Link>}
          >
            <form onSubmit={handleSubmit} className="space-y-stack-md" noValidate>
              <AuthInput id="email" label={t('forgotPassword.emailLabel')} type="email" placeholder={t('forgotPassword.emailPlaceholder')} value={email} onChange={setEmail} autoComplete="email" />
              <button type="submit" className="w-full bg-primary-container text-on-primary font-bold py-4 rounded-lg mint-glow-primary hover:bg-primary-fixed transition-all active:scale-95 duration-200">
                {t('forgotPassword.submit')}
              </button>
            </form>
          </AuthFormPanel>
        )}
      </div>

      <GlowCursor />
    </div>
  )
}