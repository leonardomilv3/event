interface Tab {
  label: string
  value: string
}

interface FilterTabsProps {
  tabs: Tab[]
  active: string
  onChange: (value: string) => void
  className?: string
}

export default function FilterTabs({ tabs, active, onChange, className = '' }: FilterTabsProps) {
  return (
    <div className={['flex bg-surface-container rounded-lg p-1 border border-white/5', className].join(' ')}>
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={[
            'px-5 py-2 rounded-md font-label-md text-label-md transition-colors',
            active === tab.value
              ? 'bg-primary-container/10 text-primary-container'
              : 'text-on-surface-variant hover:text-on-surface',
          ].join(' ')}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
