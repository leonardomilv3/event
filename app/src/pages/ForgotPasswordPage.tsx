import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthFormPanel from '../components/molecules/AuthFormPanel'
import AuthInput from '../components/atoms/AuthInput'
import GlowCursor from '../components/atoms/GlowCursor'
import Icon from '../components/atoms/Icon'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-margin-mobile">

      {/* Ambient glow de fundo */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      {/* Logo no topo */}
      <div className="absolute top-stack-lg left-1/2 -translate-x-1/2">
        <Link to="/">
          <span className="font-serif text-headline-md text-primary-container tracking-tight">
            Eventing
          </span>
        </Link>
      </div>

      {/* Painel central */}
      <div className="w-full max-w-md relative z-10">
        {sent ? (
          <AuthFormPanel
            title="Check your inbox"
            subtitle="If this email is registered, you'll receive recovery instructions."
            footer={
              <Link
                to="/login"
                className="font-label-md text-label-md text-primary-fixed-dim hover:underline"
              >
                ← Back to login
              </Link>
            }
          >
            <div className="flex flex-col items-center gap-stack-md py-stack-md">
              <Icon
                name="mark_email_read"
                size={64}
                className="text-primary-container"
              />
              <p className="font-body-md text-body-md text-on-surface-variant text-center">
                Se este email estiver cadastrado, você receberá as instruções em breve.
              </p>
            </div>
          </AuthFormPanel>
        ) : (
          <AuthFormPanel
            title="Recover access"
            subtitle="Enter your email and we'll send recovery instructions."
            footer={
              <Link
                to="/login"
                className="font-label-md text-label-md text-primary-fixed-dim hover:underline"
              >
                ← Back to login
              </Link>
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
              />
              <button
                type="submit"
                className="w-full bg-primary-container text-on-primary font-bold py-4 rounded-lg mint-glow-primary hover:bg-primary-fixed transition-all active:scale-95 duration-200"
              >
                Send recovery link
              </button>
            </form>
          </AuthFormPanel>
        )}
      </div>

      <GlowCursor />
    </div>
  )
}
