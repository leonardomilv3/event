import { type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: React.ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary: [
    'bg-primary-container text-on-primary-fixed font-bold',
    'shadow-mint-glow hover:shadow-mint-glow-strong',
    'active:scale-95',
  ].join(' '),
  secondary: [
    'border-2 border-primary-container text-on-surface font-bold',
    'hover:bg-primary-container/5',
    'active:scale-95',
  ].join(' '),
  ghost: [
    'text-primary-container font-medium',
    'hover:bg-surface-container-low',
    'active:scale-95',
  ].join(' '),
}

const sizeClasses: Record<Size, string> = {
  sm: 'py-2 px-4 text-label-md',
  md: 'py-3 px-6 text-label-md',
  lg: 'py-4 px-8 text-label-md',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2',
        'rounded-full transition-all duration-200',
        'cursor-pointer select-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
