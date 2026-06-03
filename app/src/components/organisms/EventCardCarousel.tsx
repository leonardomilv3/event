import { useRef, useState, useCallback } from 'react'
import Icon from '../atoms/Icon'

interface EventCardCarouselProps {
  children: React.ReactNode
  sectionLabel?: string
  sectionTitle?: string
  className?: string
}

export default function EventCardCarousel({
  children,
  sectionLabel,
  sectionTitle,
  className = '',
}: EventCardCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!trackRef.current) return
    setIsDragging(true)
    startX.current = e.pageX - trackRef.current.offsetLeft
    scrollLeft.current = trackRef.current.scrollLeft
  }, [])

  const onMouseLeave = useCallback(() => setIsDragging(false), [])
  const onMouseUp = useCallback(() => setIsDragging(false), [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return
    e.preventDefault()
    const x = e.pageX - trackRef.current.offsetLeft
    trackRef.current.scrollLeft = scrollLeft.current - (x - startX.current) * 1.5
  }, [isDragging])

  const scroll = (dir: 'left' | 'right') => {
    trackRef.current?.scrollBy({ left: dir === 'right' ? 500 : -500, behavior: 'smooth' })
  }

  return (
    <div className={className}>
      {/* Optional header with arrows */}
      {(sectionLabel || sectionTitle) && (
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-stack-lg flex justify-between items-end">
          <div>
            {sectionLabel && (
              <span className="font-label-caps text-label-caps text-primary-container uppercase block mb-1">
                {sectionLabel}
              </span>
            )}
            {sectionTitle && (
              <h2 className="font-serif text-headline-lg-mobile md:text-headline-lg text-on-surface">
                {sectionTitle}
              </h2>
            )}
          </div>
          <div className="hidden md:flex gap-4">
            <button
              onClick={() => scroll('left')}
              className="p-4 border border-outline-variant rounded-full hover:bg-white/5 transition-colors"
              aria-label="Anterior"
            >
              <Icon name="arrow_back" className="text-on-surface" size={20} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-4 border border-outline-variant rounded-full hover:bg-white/5 transition-colors"
              aria-label="Próximo"
            >
              <Icon name="arrow_forward" className="text-on-surface" size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Scrollable track */}
      <div
        ref={trackRef}
        className={[
          'flex gap-gutter overflow-x-auto scrollbar-none pb-stack-md',
          'px-margin-mobile md:px-margin-desktop',
          isDragging ? 'cursor-grabbing select-none' : 'cursor-grab',
        ].join(' ')}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      >
        {children}
      </div>
    </div>
  )
}
