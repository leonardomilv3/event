import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import GlassPanel from '../components/molecules/GlassPanel'
import Button from '../components/atoms/Button'
import Icon from '../components/atoms/Icon'
import { useAuthContext } from '../hooks/useAuthContext'
import { ApiError } from '../services/httpClient'

const INPUT_CLASS = [
  'w-full bg-surface-container-low border border-outline-variant rounded-lg',
  'px-4 py-3 text-on-surface text-body-md placeholder:text-on-surface-variant',
  'focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container',
  'transition-colors',
].join(' ')

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthContext()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    <div className="min-h-screen bg-background flex items-center justify-center px-margin-mobile">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-container/5 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-stack-lg">
          <h1 className="font-serif text-headline-lg-mobile text-on-surface">
            Even<span className="text-primary-container italic">ting</span>
          </h1>
          <p className="font-sans text-body-md text-on-surface-variant mt-stack-xs">
            Entre na cidade viva
          </p>
        </div>

        <GlassPanel className="p-stack-md">
          <h2 className="font-sans text-headline-md text-on-surface mb-stack-md">
            Entrar
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-stack-sm" noValidate>
            <div className="flex flex-col gap-stack-xs">
              <label htmlFor="email" className="font-sans text-label-md text-on-surface-variant">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className={INPUT_CLASS}
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-stack-xs">
              <label htmlFor="password" className="font-sans text-label-md text-on-surface-variant">
                Senha
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className={INPUT_CLASS}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <p className="font-sans text-label-md text-error flex items-center gap-2" role="alert">
                <Icon name="error" size={16} className="text-error flex-shrink-0" />
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-stack-xs"
              disabled={loading}
            >
              {loading && (
                <Icon name="progress_activity" className="animate-spin" size={18} />
              )}
              {loading ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>

          <p className="font-sans text-label-md text-on-surface-variant text-center mt-stack-md">
            Não tem conta?{' '}
            <Link to="/register" className="text-primary-container hover:underline">
              Criar conta
            </Link>
          </p>
        </GlassPanel>
      </div>
    </div>
  )
}
