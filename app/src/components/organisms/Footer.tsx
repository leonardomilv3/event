import { Link } from 'react-router-dom'
import Icon from '../atoms/Icon'

const LINKS = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Editorial Guidelines', href: '/editorial' },
  { label: 'Contact', href: '/contact' },
]

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/30 py-stack-lg">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto gap-stack-md">

        <div className="flex flex-col items-center md:items-start gap-4">
          <span className="font-serif text-headline-md text-on-surface">Eventing</span>
          <p className="font-label-caps text-label-caps text-on-tertiary-fixed-variant">
            © 2024 Eventing. Nocturnal Culture Collective.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {LINKS.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className="font-label-caps text-label-caps text-on-tertiary-fixed-variant hover:text-primary-container transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex gap-4">
          <button className="hover:text-primary-container transition-colors">
            <Icon name="language" className="text-on-surface" size={22} />
          </button>
          <button className="hover:text-primary-container transition-colors">
            <Icon name="share" className="text-on-surface" size={22} />
          </button>
        </div>

      </div>
    </footer>
  )
}
