import { useState, type ReactNode } from 'react'
import AuthInput from '../atoms/AuthInput'

interface PasswordInputProps {
  id: string
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  rightElement?: ReactNode
  autoComplete?: 'current-password' | 'new-password'
  disabled?: boolean
  leftIcon?: string
}

export default function PasswordInput({
  placeholder = '••••••••',
  leftIcon,
  disabled = false,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <AuthInput
      {...props}
      type={visible ? 'text' : 'password'}
      placeholder={placeholder}
      leftIcon={leftIcon}
      disabled={disabled}
      trailingElement={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visible}
          aria-controls={props.id}
          className="p-1 rounded text-on-surface-variant hover:text-primary-container focus-visible:outline-none focus-visible:text-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined select-none" style={{ fontSize: 20 }}>
            {visible ? 'visibility' : 'visibility_off'}
          </span>
        </button>
      }
    />
  )
}
