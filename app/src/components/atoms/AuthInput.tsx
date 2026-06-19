import { type ReactNode } from 'react'

interface AuthInputProps {
  id: string
  label: string
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  rightElement?: ReactNode
  autoComplete?: string
  disabled?: boolean
  leftIcon?: string
}

export default function AuthInput({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  rightElement,
  autoComplete,
  disabled = false,
  leftIcon,
}: AuthInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label
          htmlFor={id}
          className="font-label-caps text-label-caps text-on-surface-variant"
        >
          {label}
        </label>
        {rightElement}
      </div>

      <div className="relative group input-focus-effect border border-surface-container-highest rounded-lg transition-all">
        {leftIcon && (
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none select-none"
            style={{ fontSize: 20 }}
          >
            {leftIcon}
          </span>
        )}

        <input
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={[
            'w-full bg-surface-container-low rounded-lg py-3',
            leftIcon ? 'pl-10 pr-4' : 'pl-4 pr-4',
            'text-on-surface text-body-md',
            'placeholder:text-on-surface-variant/30',
            'focus:outline-none focus:ring-0',
            'transition-all',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
          ].join(' ')}
        />
      </div>

      {error && (
        <p className="font-label-md text-label-md text-error flex items-center gap-1" role="alert">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </p>
      )}
    </div>
  )
}
