import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import Icon from '../atoms/Icon'

interface Props {
  anchorRef: React.RefObject<HTMLElement | null>
  year: number
  month: number
  onSelect: (year: number, month: number) => void
  onClose: () => void
}

const PICKER_WIDTH = 288
const ESTIMATED_HEIGHT = 300
const GAP = 6
const VIEWPORT_PADDING = 8

export default function CalendarMonthPicker({
  anchorRef,
  year,
  month,
  onSelect,
  onClose,
}: Props) {
  const { t, i18n } = useTranslation('calendar')
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const [displayYear, setDisplayYear] = useState(year)

  const today = new Date()
  const todayYear = today.getFullYear()
  const todayMonth = today.getMonth()

  useLayoutEffect(() => {
    const anchor = anchorRef.current
    if (!anchor) return
    const rect = anchor.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    let left = rect.left + rect.width / 2 - PICKER_WIDTH / 2
    left = Math.max(VIEWPORT_PADDING, Math.min(left, vw - PICKER_WIDTH - VIEWPORT_PADDING))

    let top = rect.bottom + GAP
    if (top + ESTIMATED_HEIGHT > vh - VIEWPORT_PADDING && rect.top > ESTIMATED_HEIGHT + VIEWPORT_PADDING) {
      top = rect.top - ESTIMATED_HEIGHT - GAP
    }

    setPos({ top, left })
  }, [anchorRef])

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      if (ref.current?.contains(target)) return
      if (anchorRef.current?.contains(target)) return
      onClose()
    }
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    document.addEventListener('keydown', keyHandler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
      document.removeEventListener('keydown', keyHandler)
    }
  }, [onClose, anchorRef])

  if (!pos) return null

  const monthLabels = Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat(i18n.language, { month: 'short' })
      .format(new Date(displayYear, i, 1))
      .replace(/^\p{L}/u, (c) => c.toUpperCase()),
  )

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label={t('picker.openLabel')}
      style={{ position: 'fixed', top: pos.top, left: pos.left, width: PICKER_WIDTH }}
      className="calendar-pop z-[100] rounded-xl border border-outline-variant/40 bg-surface-container/95 backdrop-blur-xl shadow-2xl p-3"
    >
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setDisplayYear((y) => y - 1)}
          className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label={t('picker.previousYear')}
          title={t('picker.previousYear')}
        >
          <Icon name="chevron_left" size={18} />
        </button>
        <span className="font-serif text-body-lg text-on-surface">{displayYear}</span>
        <button
          type="button"
          onClick={() => setDisplayYear((y) => y + 1)}
          className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label={t('picker.nextYear')}
          title={t('picker.nextYear')}
        >
          <Icon name="chevron_right" size={18} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {monthLabels.map((label, i) => {
          const isSelected = displayYear === year && i === month
          const isCurrent = displayYear === todayYear && i === todayMonth
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(displayYear, i)}
              title={`${label} ${displayYear}`}
              className={[
                'py-2 rounded-lg font-label-md text-label-md transition-colors',
                isSelected
                  ? 'bg-primary-container text-surface-container-lowest font-bold'
                  : isCurrent
                    ? 'ring-1 ring-inset ring-primary-container/50 text-primary-container hover:bg-white/5'
                    : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface',
              ].join(' ')}
            >
              {label}
            </button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={() => onSelect(todayYear, todayMonth)}
        title={t('navigation.goToToday')}
        className="mt-2 w-full py-1.5 rounded-lg text-primary-container font-label-caps text-[10px] uppercase tracking-widest hover:bg-white/5 transition-colors"
      >
        {t('navigation.goToToday')}
      </button>
    </div>,
    document.body,
  )
}