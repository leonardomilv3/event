interface Avatar {
  src: string
  alt: string
}

interface AvatarStackProps {
  avatars: Avatar[]
  overflow?: number
  size?: number
  className?: string
}

export default function AvatarStack({ avatars, overflow, size = 8, className = '' }: AvatarStackProps) {
  const sizeClass = `w-${size} h-${size}`

  return (
    <div className={['flex -space-x-3 items-center', className].join(' ')}>
      {avatars.map((av, i) => (
        <img
          key={i}
          src={av.src}
          alt={av.alt}
          className={`${sizeClass} rounded-full border-2 border-surface object-cover`}
        />
      ))}
      {overflow != null && overflow > 0 && (
        <div className={`${sizeClass} rounded-full border-2 border-surface bg-surface-variant flex items-center justify-center text-[10px] font-bold text-on-surface`}>
          +{overflow}
        </div>
      )}
    </div>
  )
}
