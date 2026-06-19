import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import CinematicAuthLayout from '../components/organisms/CinematicAuthLayout'
import AuthFormPanel from '../components/molecules/AuthFormPanel'
import AuthInput from '../components/atoms/AuthInput'
import SocialAuthButton from '../components/atoms/SocialAuthButton'
import { useAuthContext } from '../hooks/useAuthContext'
import { ApiError } from '../services/httpClient'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated, loading: authLoading } = useAuthContext()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (authLoading) return null
  if (isAuthenticated) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
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
        title="Welcome back"
        subtitle="Enter your credentials to access the pulse."
        footer={
          <p className="font-body-md text-body-md text-on-surface-variant">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-fixed-dim font-bold ml-1 hover:underline">
              Sign up
            </Link>
          </p>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-stack-md" noValidate>
          <AuthInput
            id="email"
            label="Email Address"
            type="email"
            placeholder="name@exclusive.com"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            disabled={loading}
          />

          <AuthInput
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            disabled={loading}
            rightElement={
              <Link
                to="/forgot-password"
                className="font-label-md text-label-md text-primary-fixed-dim hover:text-primary transition-colors"
              >
                Forgot password?
              </Link>
            }
          />

          {error && (
            <p className="font-label-md text-label-md text-error flex items-center gap-2" role="alert">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={[
              'w-full bg-primary-container text-on-primary font-bold py-4 rounded-lg',
              'mint-glow-primary hover:bg-primary-fixed transition-all active:scale-95 duration-200',
              loading ? 'opacity-70 cursor-not-allowed' : '',
            ].join(' ')}
          >
            {loading ? 'Entrando...' : 'Entrar'}
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
            <SocialAuthButton
              provider="apple"
              onClick={() => alert('Em breve')}
              disabled={loading}
            />
            <SocialAuthButton
              provider="google"
              onClick={() => alert('Em breve')}
              disabled={loading}
            />
          </div>
        </div>
      </AuthFormPanel>
    </CinematicAuthLayout>
  )
}
