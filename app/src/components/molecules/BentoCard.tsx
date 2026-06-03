import Icon from '../atoms/Icon'

interface BentoCardProps {
  icon: string
  title: string
  description: string
  className?: string
}

export default function BentoCard({ icon, title, description, className = '' }: BentoCardProps) {
  return (
    <div className={[
      'p-stack-lg bg-surface-container rounded-3xl border border-white/5',
      'hover:border-primary-container/30 transition-all group',
      className,
    ].join(' ')}>
      <Icon
        name={icon}
        size={40}
        className="text-primary-container mb-stack-md block group-hover:scale-110 transition-transform"
      />
      <h3 className="font-serif text-headline-md text-on-surface mb-stack-sm">{title}</h3>
      <p className="font-sans text-body-md text-on-surface-variant">{description}</p>
    </div>
  )
}
