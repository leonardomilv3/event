import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import CinematicAuthLayout from '../components/organisms/CinematicAuthLayout'
import AuthFormPanel from '../components/molecules/AuthFormPanel'
import AuthInput from '../components/atoms/AuthInput'
import PasswordInput from '../components/molecules/PasswordInput'
import { useAuthContext } from '../hooks/useAuthContext'
import { ApiError } from '../services/httpClient'
import { buildAuthPath, getSafeRedirect, REDIRECT_PARAM } from '../utils/redirect'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = getSafeRedirect(searchParams.get(REDIRECT_PARAM))
  const { login, isAuthenticated, loading: authLoading } = useAuthContext()
  const { t } = useTranslation('auth')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (authLoading) return null
  if (isAuthenticated) return <Navigate to={redirectTo} replace />

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
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
        title={t('login.title')}
        subtitle={t('login.subtitle')}
        footer={
          <p className="font-body-md text-body-md text-on-surface-variant">
            <Trans
              i18nKey="login.noAccount"
              ns="auth"
              components={{ link: <Link to={buildAuthPath(redirectTo, '/register')} className="text-primary-fixed-dim font-bold ml-1 hover:underline" /> }}
            />
          </p>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-stack-md" noValidate>
          <AuthInput id="email" label={t('login.emailLabel')} type="email" placeholder={t('login.emailPlaceholder')} value={email} onChange={setEmail} autoComplete="email" disabled={loading} />
          <PasswordInput id="password" label={t('login.passwordLabel')} value={password} onChange={setPassword} autoComplete="current-password" disabled={loading} rightElement={<Link to="/forgot-password" className="font-label-md text-label-md text-primary-fixed-dim hover:text-primary transition-colors">{t('password.forgot')}</Link>} />

          {error && (
            <p className="font-label-md text-label-md text-error flex items-center gap-2" role="alert">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className={['w-full bg-primary-container text-on-primary font-bold py-4 rounded-lg','mint-glow-primary hover:bg-primary-fixed transition-all active:scale-95 duration-200', loading ? 'opacity-70 cursor-not-allowed' : ''].join(' ')}>
            {loading ? t('login.submitting') : t('login.submit')}
          </button>
        </form>
      </AuthFormPanel>
    </CinematicAuthLayout>
  )
}