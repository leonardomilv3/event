import { type ReactNode } from 'react'
import GlassPanel from './GlassPanel'

interface EventFormPanelProps {
  title: string
  subtitle: string
  children: ReactNode
  statusBadge?: ReactNode
}

export default function EventFormPanel({ title, subtitle, children, statusBadge }: EventFormPanelProps) {
  return (
    <GlassPanel className="p-stack-lg max-w-2xl mx-auto">
      <header className="mb-stack-lg">
        <div className="flex items-start justify-between gap-stack-sm">
          <div>
            <h1 className="font-serif text-headline-lg italic text-primary-container leading-tight">
              {title}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">{subtitle}</p>
          </div>
          {statusBadge && <div className="flex-shrink-0 mt-1">{statusBadge}</div>}
        </div>
      </header>
      {children}
    </GlassPanel>
  )
}
