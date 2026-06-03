import { Link, useLocation } from 'react-router-dom'
import Icon from '../atoms/Icon'

const NAV_ITEMS = [
  { label: 'Home', icon: 'grid_view', href: '/dashboard' },
  { label: 'Events', icon: 'confirmation_number', href: '/events' },
  { label: 'Chat', icon: 'chat_bubble', href: '/messages' },
  { label: 'Settings', icon: 'settings', href: '/settings' },
]

interface BottomNavProps {
  onCreatePress?: () => void
}

export default function BottomNav({ onCreatePress }: BottomNavProps) {
  const { pathname } = useLocation()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 glass-nav border-t-0 flex justify-around items-center px-4 z-50">
      {NAV_ITEMS.slice(0, 2).map(item => {
        const active = pathname === item.href
        return (
          <Link key={item.href} to={item.href} className={`flex flex-col items-center ${active ? 'text-primary-container' : 'text-on-surface-variant'}`}>
            <Icon name={item.icon} fill={active ? 1 : 0} size={24} />
            <span className="text-[10px] font-bold mt-1">{item.label}</span>
          </Link>
        )
      })}

      {/* Center FAB-style create button */}
      <button
        onClick={onCreatePress}
        className="w-12 h-12 bg-primary-container rounded-full -mt-10 border-4 border-background flex items-center justify-center text-on-primary-fixed shadow-mint-glow"
      >
        <Icon name="add" size={22} />
      </button>

      {NAV_ITEMS.slice(2).map(item => {
        const active = pathname === item.href
        return (
          <Link key={item.href} to={item.href} className={`flex flex-col items-center ${active ? 'text-primary-container' : 'text-on-surface-variant'}`}>
            <Icon name={item.icon} fill={active ? 1 : 0} size={24} />
            <span className="text-[10px] font-bold mt-1">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
