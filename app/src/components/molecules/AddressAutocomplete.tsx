import { useState, type KeyboardEvent } from 'react'
import AuthInput from '../atoms/AuthInput'
import Icon from '../atoms/Icon'
import { type AddressSuggestion } from '../../types/geocoding'

interface AddressAutocompleteProps {
  id: string
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  suggestions: AddressSuggestion[]
  onSelect: (suggestion: AddressSuggestion) => void
  loading?: boolean
  error?: string | null
  disabled?: boolean
}

export default function AddressAutocomplete({
  id,
  label,
  placeholder,
  value,
  onChange,
  suggestions,
  onSelect,
  loading = false,
  error,
  disabled = false,
}: AddressAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const listId = `${id}-listbox`
  const expanded = open && suggestions.length > 0

  const choose = (suggestion: AddressSuggestion) => {
    onSelect(suggestion)
    setOpen(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!expanded) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      choose(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <AuthInput
        id={id}
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={(v) => {
          onChange(v)
          setOpen(true)
          setActiveIndex(-1)
        }}
        disabled={disabled}
        autoComplete="off"
        leftIcon="search"
        error={error ?? undefined}
        trailingElement={
          loading ? (
            <Icon name="progress_activity" size={18} className="animate-spin text-on-surface-variant mr-1" />
          ) : undefined
        }
        inputProps={{
          role: 'combobox',
          'aria-autocomplete': 'list',
          'aria-expanded': expanded,
          'aria-controls': listId,
          'aria-activedescendant': expanded && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined,
          onKeyDown: handleKeyDown,
          onFocus: () => setOpen(true),
          onBlur: () => setOpen(false),
        }}
      />

      {expanded && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 left-0 right-0 mt-1 bg-surface-container-high border border-outline-variant/50 rounded-lg overflow-hidden shadow-mint-glow"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              // mousedown + preventDefault: seleciona antes do blur do input fechar a lista
              onMouseDown={(e) => {
                e.preventDefault()
                choose(s)
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={[
                'flex items-start gap-stack-sm px-stack-sm py-2 cursor-pointer transition-colors',
                i === activeIndex ? 'bg-white/5' : '',
              ].join(' ')}
            >
              <Icon
                name={s.venueName ? 'storefront' : 'location_on'}
                size={18}
                className="text-primary-container mt-0.5 shrink-0"
              />
              <div className="min-w-0">
                <p className="font-sans text-body-md text-on-surface truncate">{s.label}</p>
                {s.address && s.address !== s.label && (
                  <p className="font-sans text-label-md text-on-surface-variant truncate">{s.address}</p>
                )}
              </div>
            </li>
          ))}
          <li
            role="presentation"
            className="px-stack-sm py-1 border-t border-outline-variant/30 font-sans text-label-md text-on-surface-variant/60 text-right"
          >
            © OpenStreetMap contributors
          </li>
        </ul>
      )}
    </div>
  )
}
