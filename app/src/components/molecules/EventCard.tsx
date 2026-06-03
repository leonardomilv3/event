import { Link } from 'react-router-dom'
import TagChip from '../atoms/TagChip'

interface EventCardProps {
  id?: string
  title: string
  category: string
  imageUrl: string
  imageAlt?: string
  href?: string
  className?: string
}

export default function EventCard({ title, category, imageUrl, imageAlt, href, className = '' }: EventCardProps) {
  const content = (
    <div className={['flex-shrink-0 w-[300px] md:w-[450px] group cursor-pointer', className].join(' ')}>
      <div className="relative h-[500px] rounded-xl overflow-hidden">
        <img
          src={imageUrl}
          alt={imageAlt ?? title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <TagChip
            label={category}
            active
            className="bg-black/40 backdrop-blur-md mb-3"
          />
          <h3 className="font-serif text-headline-md text-on-surface">{title}</h3>
        </div>
        {/* Mint glow on hover */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-mint-glow pointer-events-none" />
      </div>
    </div>
  )

  if (href) {
    return <Link to={href}>{content}</Link>
  }

  return content
}
