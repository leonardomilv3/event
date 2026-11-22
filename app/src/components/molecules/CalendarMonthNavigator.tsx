import { useTranslation } from 'react-i18next'
import Icon from '../atoms/Icon'

interface Props {
  label: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export default function CalendarMonthNavigator({ label, onPrev, onNext, onToday }: Props) {
  const { t } = useTranslation('calendar')

  return (
    <div className="flex items-center justify-between gap-3 mb-stack-md">
      <button
        type="button"
        onClick={onPrev}
        aria-label={t('navigation.previous')}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container border border-outline-variant/40 text-on-surface hover:border-primary-container/50 hover:bg-white/5 transition-all active:scale-95"
      >
        <Icon name="chevron_left" size={22} />
      </button>

      <div className="flex flex-col items-center flex-1 min-w-0">
        <h2 className="font-serif text-headline-md md:text-headline-lg text-on-surface capitalize text-center truncate">
          {label}
        </h2>
        <button
          type="button"
          onClick={onToday}
          className="mt-1 font-label-caps text-[10px] md:text-label-caps uppercase tracking-widest text-primary-container hover:underline"
        >
          {t('navigation.today')}
        </button>
      </div>

      <button
        type="button"
        onClick={onNext}
        aria-label={t('navigation.next')}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container border border-outline-variant/40 text-on-surface hover:border-primary-container/50 hover:bg-white/5 transition-all active:scale-95"
      >
        <Icon name="chevron_right" size={22} />
      </button>
    </div>
  )
}