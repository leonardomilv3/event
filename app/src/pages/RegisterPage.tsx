import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import CinematicAuthLayout from '../components/organisms/CinematicAuthLayout'
import AuthFormPanel from '../components/molecules/AuthFormPanel'
import AuthInput from '../components/atoms/AuthInput'
import PasswordInput from '../components/molecules/PasswordInput'
import SocialAuthButton from '../components/atoms/SocialAuthButton'
import { useAuthContext } from '../hooks/useAuthContext'
import { ApiError } from '../services/httpClient'
import { buildAuthPath, getSafeRedirect, REDIRECT_PARAM } from '../utils/redirect'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = getSafeRedirect(searchParams.get(REDIRECT_PARAM))
  const { register, isAuthenticated, loading: authLoading } = useAuthContext()
  const { t } = useTranslation('auth')

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword
  const canSubmit = agreedToTerms && password.length > 0 && password === confirmPassword

  if (authLoading) return null
  if (isAuthenticated) return <Navigate to={redirectTo} replace />

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    if (username.trim().length < 3) return (setError(t('errors.usernameTooShort')), setLoading(false))
    if (/\s/.test(username)) return (setError(t('errors.usernameNoSpaces')), setLoading(false))
    if (password !== confirmPassword) return (setError(t('errors.passwordMismatch')), setLoading(false))
    if (!agreedToTerms) return (setError(t('errors.mustAcceptTerms')), setLoading(false))

    try {
      await register(email, username, password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('errors.generic', { ns: 'common' }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <CinematicAuthLayout>
      <AuthFormPanel
        title={t('register.title')}
        subtitle={t('register.subtitle')}
        footer={
          <p className="font-body-md text-body-md text-on-surface-variant">
            <Trans
              i18nKey="register.hasAccount"
              ns="auth"
              components={{ link: <Link to={buildAuthPath(redirectTo, '/login')} className="text-primary-fixed-dim font-bold ml-1 hover:underline" /> }}
            />
          </p>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-stack-md" noValidate>
          <AuthInput id="username" label={t('register.usernameLabel')} type="text" placeholder={t('register.usernamePlaceholder')} value={username} onChange={setUsername} autoComplete="username" disabled={loading} leftIcon="person" />
          <AuthInput id="email" label={t('register.emailLabel')} type="email" placeholder={t('register.emailPlaceholder')} value={email} onChange={setEmail} autoComplete="email" disabled={loading} leftIcon="mail" />
          <PasswordInput id="password" label={t('register.passwordLabel')} value={password} onChange={setPassword} autoComplete="new-password" disabled={loading} leftIcon="lock" />
          <PasswordInput id="confirm-password" label={t('register.confirmPasswordLabel')} value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" disabled={loading} leftIcon="lock" error={passwordsMismatch ? t('errors.passwordMismatch') : undefined} />

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-0.5">
              <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="sr-only" />
              <div className={['w-5 h-5 rounded border-2 flex items-center justify-center transition-all', agreedToTerms ? 'bg-primary-container border-primary-container' : 'border-surface-container-highest bg-surface-container-low group-hover:border-primary-container/50'].join(' ')}>
                {agreedToTerms && (<span className="material-symbols-outlined text-on-primary" style={{ fontSize: 14 }}>check</span>)}
              </div>
            </div>
            <span className="font-body-md text-body-md text-on-surface-variant leading-snug">
              <Trans
                i18nKey="register.agreeToTerms"
                ns="auth"
                components={{
                  terms: <a href={t('register.termsHref')} className="text-primary-fixed-dim hover:underline" />,
                  privacy: <a href={t('register.privacyHref')} className="text-primary-fixed-dim hover:underline" />,
                }}
              />
            </span>
          </label>

          {error && (
            <p className="font-label-md text-label-md text-error flex items-center gap-2" role="alert">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading || !canSubmit} className={['w-full bg-primary-container text-on-primary font-bold py-4 rounded-lg','mint-glow-primary hover:bg-primary-fixed transition-all active:scale-95 duration-200', (loading || !canSubmit) ? 'opacity-50 cursor-not-allowed' : ''].join(' ')}>
            {loading ? t('register.submitting') : t('register.submit')}
          </button>
        </form>

        <div className="mt-stack-lg">
          <div className="relative flex items-center mb-stack-md">
            <div className="flex-grow border-t border-surface-container-highest" />
            <span className="flex-shrink mx-4 font-label-caps text-on-surface-variant/50">{t('register.socialDivider')}</span>
            <div className="flex-grow border-t border-surface-container-highest" />
          </div>
          <div className="grid grid-cols-2 gap-stack-sm">
            <SocialAuthButton provider="apple" onClick={() => alert('Em breve')} disabled={loading} />
            <SocialAuthButton provider="google" onClick={() => alert('Em breve')} disabled={loading} />
          </div>
        </div>
      </AuthFormPanel>
    </CinematicAuthLayout>
  )
}