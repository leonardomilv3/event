import { Link, useLocation } from 'react-router-dom'
import Icon from '../atoms/Icon'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'grid_view', href: '/dashboard' },
  { label: 'Events', icon: 'confirmation_number', href: '/events' },
  { label: 'Messages', icon: 'chat_bubble', href: '/messages' },
  { label: 'Insights', icon: 'analytics', href: '/insights' },
  { label: 'Settings', icon: 'settings', href: '/settings' },
]

interface SideNavBarProps {
  userName?: string
  userRole?: string
  userAvatar?: string
  topOffset?: string
}

export default function SideNavBar({
  userName = 'Alex Chen',
  userRole = 'Pro Organizer',
  userAvatar,
  topOffset = 'top-0',
}: SideNavBarProps) {
  const { pathname } = useLocation()

  return (
    <aside className={`hidden md:flex flex-col h-screen w-64 fixed left-0 ${topOffset} bg-surface-container py-8 px-4 z-40`}>
      {/* Logo / brand */}
      <div className="mb-10 px-2">
        <Link to="/">
          <span className="font-serif text-headline-md text-primary-container tracking-tighter">Eventing</span>
        </Link>
      </div>

      {/* User section */}
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-primary-container/20 bg-surface-variant flex-shrink-0 flex items-center justify-center">
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <span className="font-bold text-sm text-primary-container uppercase select-none">
              {userName.slice(0, 2)}
            </span>
          )}
        </div>
        <div className="overflow-hidden">
          <div className="font-label-md text-label-md text-primary-container truncate">{userName}</div>
          <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">{userRole}</div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-grow space-y-1">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={[
                'flex items-center gap-3 py-3 px-4 rounded-lg transition-all duration-200',
                active
                  ? 'text-primary-container bg-primary-container/10'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant',
              ].join(' ')}
            >
              <Icon name={item.icon} fill={active ? 1 : 0} size={22} />
              <span className="font-label-md text-label-md">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom links */}
      <div className="mt-auto space-y-1 border-t border-outline-variant/30 pt-6">
        <Link to="/support" className="flex items-center gap-3 py-2 px-4 text-on-tertiary-fixed-variant hover:text-primary-container transition-colors">
          <Icon name="help" size={20} />
          <span className="font-label-caps text-label-caps">Support</span>
        </Link>
        <button className="w-full flex items-center gap-3 py-2 px-4 text-on-tertiary-fixed-variant hover:text-primary-container transition-colors">
          <Icon name="logout" size={20} />
          <span className="font-label-caps text-label-caps">Logout</span>
        </button>
      </div>
    </aside>
  )
}
