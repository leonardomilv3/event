import { Link } from 'react-router-dom'
import TopNavBar from '../components/organisms/TopNavBar'
import SideNavBar from '../components/organisms/SideNavBar'
import BottomNav from '../components/organisms/BottomNav'
import Footer from '../components/organisms/Footer'
import EventCard from '../components/molecules/EventCard'
import Icon from '../components/atoms/Icon'
import { useMyEvents } from '../hooks/useMyEvents'
import { useAuthContext } from '../hooks/useAuthContext'
import { formatEventDate } from '../utils/date'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=900&q=80'

export default function MyEventsPage() {
  const { user } = useAuthContext()
  const { events, loading, error } = useMyEvents()

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopNavBar authenticated userName={user?.username ?? ''} />
      <SideNavBar topOffset="top-20" />

      <div className="flex min-h-screen pt-20">
        {/* Sidebar spacer */}
        <div className="hidden md:block w-64 flex-shrink-0" />

        <main className="flex-1 px-margin-mobile md:px-margin-desktop py-stack-lg max-w-full">

          {/* Header */}
          <header className="mb-stack-lg">
            <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">
              Meus Eventos
            </h1>
            <p className="font-sans text-body-md text-on-surface-variant">
              Eventos confirmados que você vai participar
            </p>
          </header>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-stack-xl">
              <Icon name="progress_activity" size={32} className="animate-spin text-primary-container" />
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex items-center justify-center py-stack-xl gap-3">
              <Icon name="error" size={24} className="text-error" />
              <p className="font-label-md text-label-md text-error">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-stack-xl text-center">
              <div className="relative mb-stack-lg">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 bg-primary-container/5 rounded-full blur-3xl" />
                </div>
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <div className="pulse-ring" />
                  <div className="relative z-10 w-24 h-24 rounded-full bg-surface-container border border-white/10 glass-panel flex items-center justify-center">
                    <Icon name="confirmation_number" size={48} className="text-primary-container" />
                  </div>
                </div>
              </div>

              <div className="max-w-md mx-auto mb-stack-lg">
                <p className="font-body-lg text-body-lg text-on-surface mb-stack-sm">
                  Você ainda não confirmou presença em nenhum evento
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  O coração da cidade nunca para. Descubra os próximos encontros, coletivos e festas que definem o Eventing.
                </p>
              </div>

              <Link
                to="/"
                className="px-10 py-4 bg-primary-container text-on-primary font-bold rounded-full mint-glow-primary hover:bg-primary-fixed transition-all active:scale-95 font-label-md"
              >
                Explorar Eventos
              </Link>
            </div>
          )}

          {/* Events grid */}
          {!loading && !error && events.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {events.map((event) => (
                <div key={event.id} className="flex flex-col">
                  <EventCard
                    title={event.title}
                    category={event.category}
                    imageUrl={event.coverImageUrl ?? FALLBACK_IMAGE}
                    href={`/events/${event.id}`}
                    className="!w-full"
                  />
                  <div className="mt-stack-sm px-2 space-y-stack-xs">
                    <p className="font-label-caps text-label-caps text-primary-container uppercase">
                      {formatEventDate(event.startsAt)}
                    </p>
                    {event.locationName && (
                      <p className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1">
                        <Icon name="location_on" size={14} />
                        {event.locationName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>

      <Footer />
      <BottomNav />
    </div>
  )
}
