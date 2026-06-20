interface SegmentedOption {
  label: string
  value: string
}

interface SegmentedControlProps {
  options: SegmentedOption[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export default function SegmentedControl({ options, value, onChange, className = '' }: SegmentedControlProps) {
  return (
    <div
      className={[
        'flex bg-surface-container-low border border-outline-variant rounded-full p-1',
        className,
      ].join(' ')}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={[
            'flex-1 text-center py-2 rounded-full font-label-md text-label-md transition-all duration-200',
            value === opt.value
              ? 'bg-primary-container text-on-primary'
              : 'text-on-surface-variant hover:text-on-surface',
          ].join(' ')}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
