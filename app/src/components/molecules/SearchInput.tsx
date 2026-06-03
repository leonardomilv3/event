import { type InputHTMLAttributes, useState } from 'react'
import Icon from '../atoms/Icon'

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  className?: string
}

export default function SearchInput({ className = '', ...props }: SearchInputProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div
      className={[
        'relative transition-shadow duration-200',
        focused ? 'shadow-[0_0_15px_rgba(123,231,180,0.15)]' : '',
        className,
      ].join(' ')}
    >
      <Icon
        name="search"
        size={20}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
      />
      <input
        type="text"
        className={[
          'w-full bg-surface-container border rounded-lg pl-10 pr-4 py-2',
          'font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant',
          'transition-colors duration-200 outline-none',
          focused ? 'border-primary-container' : 'border-outline-variant/30',
        ].join(' ')}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
    </div>
  )
}
