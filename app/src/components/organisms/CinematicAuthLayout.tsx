import { type ReactNode } from 'react'
import GlowCursor from '../atoms/GlowCursor'

interface CinematicAuthLayoutProps {
  children: ReactNode
}

export default function CinematicAuthLayout({ children }: CinematicAuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left side — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface-container-lowest">
        {/* Cinematic background gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-surface-container-lowest via-surface-container to-surface-container-lowest" />
        {/* Nocturnal overlay */}
        <div className="absolute inset-0 z-10 nocturnal-overlay" />
        {/* Content */}
        <div className="relative z-20 flex flex-col justify-between w-full h-full p-margin-desktop">
          {/* Top — logo + pulse dot */}
          <div className="flex items-center gap-2">
            <span className="font-serif text-headline-lg text-primary-container tracking-tight">
              Eventing
            </span>
            <div className="w-2 h-2 rounded-full bg-primary-container pulse-dot" />
          </div>
          {/* Editorial headline */}
          <div className="max-w-xl">
            <h1 className="font-serif text-display-lg text-on-surface leading-tight">
              A cidade está <span className="italic font-normal">viva</span>.
            </h1>
            <p className="mt-stack-sm font-body-lg text-body-lg text-on-surface-variant/80 max-w-md">
              Descubra o pulso da noite. Eventos exclusivos, curadoria editorial e a
              energia que só acontece quando o sol se põe.
            </p>
          </div>
          {/* Footer steps */}
          <div className="flex gap-stack-md text-on-surface-variant font-label-caps tracking-widest">
            <span>01 — DISCOVER</span>
            <span>02 — CONNECT</span>
            <span>03 — EXPERIENCE</span>
          </div>
        </div>
      </div>

      {/* Right side — form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-margin-mobile md:p-margin-desktop bg-surface-container-lowest">
        <div className="w-full max-w-md">
          {/* Mobile logo — hidden on desktop */}
          <div className="lg:hidden flex items-center gap-2 mb-stack-xl">
            <span className="font-serif text-headline-lg-mobile text-primary-container tracking-tight">
              Eventing
            </span>
          </div>
          {children}
        </div>
      </div>

      <GlowCursor />
    </div>
  )
}
