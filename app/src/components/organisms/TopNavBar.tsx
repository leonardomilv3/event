import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Icon from '../atoms/Icon'

const NAV_LINKS = [
  { label: 'Explore', href: '/' },
  { label: 'Calendar', href: '/calendar' },
  { label: 'Venues', href: '/venues' },
  { label: 'Collective', href: '/collective' },
]

interface TopNavBarProps {
  authenticated?: boolean
  userName?: string
}

export default function TopNavBar({ authenticated = false, userName }: TopNavBarProps) {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={[
      'fixed top-0 w-full z-50 glass-nav shadow-nav-glow transition-colors duration-300',
      scrolled ? 'bg-surface/90' : '',
    ].join(' ')}>
      <div className="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">

        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <span className="font-serif text-display-lg-mobile md:text-display-lg text-primary-container tracking-tighter leading-none">
            Eventing
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex gap-8 items-center">
          {NAV_LINKS.map(link => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                to={link.href}
                className={[
                  'font-sans text-body-md transition-colors',
                  active
                    ? 'text-primary-container font-bold border-b-2 border-primary-container pb-1'
                    : 'text-on-surface-variant hover:text-on-surface',
                ].join(' ')}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3 items-center">
          <button className="p-2 rounded-full hover:bg-white/5 transition-all" aria-label="Notificações">
            <Icon name="notifications" className="text-on-surface" size={24} />
          </button>

          {authenticated && userName ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-variant/30 rounded-full border border-white/5">
              <Icon name="account_circle" className="text-primary-container" size={20} />
              <span className="hidden md:inline font-label-md text-label-md text-on-surface">{userName}</span>
            </div>
          ) : (
            <button className="p-2 rounded-full hover:bg-white/5 transition-all" aria-label="Perfil">
              <Icon name="account_circle" className="text-on-surface" size={24} />
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
