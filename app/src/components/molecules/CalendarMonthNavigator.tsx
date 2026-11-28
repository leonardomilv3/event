import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Icon from '../atoms/Icon'
import CalendarMonthPicker from './CalendarMonthPicker'

interface Props {
  label: string
  year: number
  month: number
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onSelect: (year: number, month: number) => void
}

export default function CalendarMonthNavigator({
  label,
  year,
  month,
  onPrev,
  onNext,
  onToday,
  onSelect,
}: Props) {
  const { t } = useTranslation('calendar')
  const [pickerOpen, setPickerOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  return (
    <div className="flex items-center justify-between gap-3 mb-stack-md">
      <button
        type="button"
        onClick={onPrev}
        aria-label={t('navigation.previous')}
        title={t('navigation.previous')}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container border border-outline-variant/40 text-on-surface hover:border-primary-container/50 hover:bg-white/5 transition-all active:scale-95"
      >
        <Icon name="chevron_left" size={22} />
      </button>

      <div className="flex flex-col items-center flex-1 min-w-0">
        <button
          ref={btnRef}
          type="button"
          onClick={() => setPickerOpen((o) => !o)}
          aria-haspopup="dialog"
          aria-expanded={pickerOpen}
          aria-label={t('picker.openLabel')}
          title={t('picker.openLabel')}
          className="group flex items-center gap-1 min-w-0 max-w-full"
        >
          <h2 className="font-serif text-headline-md md:text-headline-lg text-on-surface capitalize truncate group-hover:text-primary-container transition-colors">
            {label}
          </h2>
          <Icon
            name="expand_more"
            size={18}
            className="text-on-surface-variant group-hover:text-primary-container transition-colors shrink-0"
          />
        </button>
        <button
          type="button"
          onClick={onToday}
          title={t('navigation.goToToday')}
          className="mt-1 font-label-caps text-[10px] md:text-label-caps uppercase tracking-widest text-primary-container hover:underline"
        >
          {t('navigation.goToToday')}
        </button>
      </div>

      <button
        type="button"
        onClick={onNext}
        aria-label={t('navigation.next')}
        title={t('navigation.next')}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container border border-outline-variant/40 text-on-surface hover:border-primary-container/50 hover:bg-white/5 transition-all active:scale-95"
      >
        <Icon name="chevron_right" size={22} />
      </button>

      {pickerOpen && (
        <CalendarMonthPicker
          anchorRef={btnRef}
          year={year}
          month={month}
          onSelect={(y, m) => {
            onSelect(y, m)
            setPickerOpen(false)
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  )
}