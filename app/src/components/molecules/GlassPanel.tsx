import { type HTMLAttributes } from 'react'

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export default function GlassPanel({ children, className = '', ...props }: GlassPanelProps) {
  return (
    <div className={['glass-panel rounded-xl', className].join(' ')} {...props}>
      {children}
    </div>
  )
}
