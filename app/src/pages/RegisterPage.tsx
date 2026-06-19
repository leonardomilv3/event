import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import CinematicAuthLayout from '../components/organisms/CinematicAuthLayout'
import AuthFormPanel from '../components/molecules/AuthFormPanel'
import AuthInput from '../components/atoms/AuthInput'
import SocialAuthButton from '../components/atoms/SocialAuthButton'
import { useAuthContext } from '../hooks/useAuthContext'
import { ApiError } from '../services/httpClient'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isAuthenticated, loading: authLoading } = useAuthContext()

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  if (authLoading) return null
  if (isAuthenticated) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (username.trim().length < 3) {
      setError('Username deve ter no mínimo 3 caracteres')
      setLoading(false)
      return
    }
    if (/\s/.test(username)) {
      setError('Username não pode conter espaços')
      setLoading(false)
      return
    }
    if (!agreedToTerms) {
      setError('Você precisa aceitar os Termos de Uso para continuar')
      setLoading(false)
      return
    }

    try {
      await register(email, username, password)
      navigate('/')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro inesperado. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <CinematicAuthLayout>
      <AuthFormPanel
        title="Join the city"
        subtitle="Create your account and find the pulse."
        footer={
          <p className="font-body-md text-body-md text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-fixed-dim font-bold ml-1 hover:underline">
              Sign in
            </Link>
          </p>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-stack-md" noValidate>
          <AuthInput
            id="username"
            label="Username"
            type="text"
            placeholder="username"
            value={username}
            onChange={setUsername}
            autoComplete="username"
            disabled={loading}
            leftIcon="person"
          />

          <AuthInput
            id="email"
            label="Email Address"
            type="email"
            placeholder="name@exclusive.com"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            disabled={loading}
            leftIcon="mail"
          />

          <AuthInput
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            disabled={loading}
            leftIcon="lock"
          />

          {/* Checkbox de termos */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="sr-only"
              />
              <div
                className={[
                  'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                  agreedToTerms
                    ? 'bg-primary-container border-primary-container'
                    : 'border-surface-container-highest bg-surface-container-low group-hover:border-primary-container/50',
                ].join(' ')}
              >
                {agreedToTerms && (
                  <span
                    className="material-symbols-outlined text-on-primary"
                    style={{ fontSize: 14 }}
                  >
                    check
                  </span>
                )}
              </div>
            </div>
            <span className="font-body-md text-body-md text-on-surface-variant leading-snug">
              I agree to the{' '}
              <a href="/terms" className="text-primary-fixed-dim hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-primary-fixed-dim hover:underline">
                Privacy Policy
              </a>
            </span>
          </label>

          {error && (
            <p className="font-label-md text-label-md text-error flex items-center gap-2" role="alert">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !agreedToTerms}
            className={[
              'w-full bg-primary-container text-on-primary font-bold py-4 rounded-lg',
              'mint-glow-primary hover:bg-primary-fixed transition-all active:scale-95 duration-200',
              (loading || !agreedToTerms) ? 'opacity-50 cursor-not-allowed' : '',
            ].join(' ')}
          >
            {loading ? 'Criando conta...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-stack-lg">
          <div className="relative flex items-center mb-stack-md">
            <div className="flex-grow border-t border-surface-container-highest" />
            <span className="flex-shrink mx-4 font-label-caps text-on-surface-variant/50">
              Or continue with
            </span>
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
