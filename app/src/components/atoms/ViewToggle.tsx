import Icon from './Icon'

export interface ViewOption {
  value: string
  label: string
  icon?: string
}

interface Props {
  value: string
  options: ViewOption[]
  onChange: (value: string) => void
}

export default function ViewToggle({ value, options, onChange }: Props) {
  return (
    <div
      role="tablist"
      className="inline-flex items-center bg-surface-container border border-outline-variant/40 rounded-full p-1"
    >
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={[
              'flex items-center gap-2 px-3 py-1.5 rounded-full font-label-md text-label-md transition-all',
              active
                ? 'bg-primary-container/15 text-primary-container'
                : 'text-on-surface-variant hover:text-on-surface',
            ].join(' ')}
          >
            {opt.icon && <Icon name={opt.icon} size={16} />}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}