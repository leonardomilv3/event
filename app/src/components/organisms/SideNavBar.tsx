import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Icon from '../atoms/Icon'
import { useAuthContext } from '../../hooks/useAuthContext'

interface SideNavBarProps {
  topOffset?: string
}

export default function SideNavBar({ topOffset = 'top-0' }: SideNavBarProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthContext()
  const { t } = useTranslation()

  const NAV_ITEMS = [
    { label: t('nav.dashboard'), icon: 'grid_view', href: '/dashboard' },
    { label: t('nav.events'), icon: 'confirmation_number', href: '/events' },
    { label: t('nav.myEvents'), icon: 'event_available', href: '/my-events' },
    { label: t('nav.messages'), icon: 'chat_bubble', href: '/messages' },
    { label: t('nav.insights'), icon: 'analytics', href: '/insights' },
    { label: t('nav.settings'), icon: 'settings', href: '/settings' },
  ]

  const userName = user?.displayName ?? user?.username ?? ''
  const userRole = t('user.organizer')
  const userAvatar = user?.avatarUrl

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside
      className={`hidden md:flex flex-col h-screen w-64 fixed left-0 ${topOffset} bg-surface-container py-8 px-4 z-40`}
    >
      <div className="mb-10 px-2">
        <Link to="/">
          <span className="font-serif text-headline-md text-primary-container tracking-tighter">
            {t('app.name')}
          </span>
        </Link>
      </div>

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
          <div className="font-label-md text-label-md text-primary-container truncate">
            {userName}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">
            {userRole}
          </div>
        </div>
      </div>

      <nav className="flex-grow space-y-1">
        {NAV_ITEMS.map((item) => {
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

      <div className="mt-auto space-y-1 border-t border-outline-variant/30 pt-6">
        <Link
          to="/support"
          className="flex items-center gap-3 py-2 px-4 text-on-tertiary-fixed-variant hover:text-primary-container transition-colors"
        >
          <Icon name="help" size={20} />
          <span className="font-label-caps text-label-caps">{t('nav.support')}</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 py-2 px-4 text-on-tertiary-fixed-variant hover:text-primary-container transition-colors"
        >
          <Icon name="logout" size={20} />
          <span className="font-label-caps text-label-caps">{t('nav.logout')}</span>
        </button>
      </div>
    </aside>
  )
}