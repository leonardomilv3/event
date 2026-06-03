interface IconProps {
  name: string
  fill?: 0 | 1
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700
  size?: number
  className?: string
}

export default function Icon({ name, fill = 0, weight = 400, size = 24, className = '' }: IconProps) {
  return (
    <span
      className={['material-symbols-outlined', className].join(' ')}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}`,
      }}
    >
      {name}
    </span>
  )
}
