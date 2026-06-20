import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import Footer from '../components/organisms/Footer'
import GlassPanel from '../components/molecules/GlassPanel'
import AgendaItem from '../components/molecules/AgendaItem'
import ProgressBar from '../components/atoms/ProgressBar'
import Icon from '../components/atoms/Icon'
import { useEvent } from '../hooks/useEvent'
import { useParticipation } from '../hooks/useParticipation'
import { useFollow } from '../hooks/useFollow'
import { useAuthContext } from '../hooks/useAuthContext'
import { formatEventDate } from '../utils/date'
import FollowButton from '../components/atoms/FollowButton'

const AGENDA = [
  { title: 'Ambient Warm-up', time: '22:00 - 23:30 • Texturas de baixa fidelidade' },
  { title: 'The Vinyl Session', time: '23:30 - 02:00 • Jornada analógica curada' },
  { title: 'Sonic Descent', time: '02:00 - 04:00 • Frequências profundas de encerramento' },
]

const FALLBACK_HERO = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&q=80'
const HOST_IMG = 'https://i.pravatar.cc/160?img=8'
const VENUE_IMG = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=60'


export default function EventDetail() {
  const { id = '' } = useParams<{ id: string }>()
  const { user } = useAuthContext()
  const navRef = useRef<HTMLElement>(null)

  const { event, participants, loading, error } = useEvent(id)
  const {
    isParticipating,
    countDelta,
    loading: participationLoading,
    error: participationError,
    join,
    leave,
  } = useParticipation(participants)

  const {
    isFollowing,
    actionLoading: followActionLoading,
    toggleFollow,
  } = useFollow(event?.creatorId ?? '')

  const displayCount = (event?.participantCount ?? 0) + countDelta
  const isCreator = user !== null && event !== null && user.id === event.creatorId
  const capacityValue =
    event?.maxParticipants != null
      ? Math.min(Math.round((displayCount / event.maxParticipants) * 100), 100)
      : 0

  const handleParticipation = () => {
    if (isParticipating) {
      void leave(id)
    } else {
      void join(id)
    }
  }

  // Scroll-based nav opacity
  useEffect(() => {
    const handleScroll = () => {
      if (!navRef.current) return
      if (window.scrollY > 50) {
        navRef.current.classList.add('bg-surface/90')
      } else {
        navRef.current.classList.remove('bg-surface/90')
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <nav
        ref={navRef}
        className="fixed top-0 w-full z-50 glass-nav shadow-nav-glow transition-colors duration-300"
      >
        <div className="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <Link
            to="/"
            className="font-serif text-display-lg-mobile md:text-display-lg text-primary-container tracking-tighter leading-none"
          >
            Eventing
          </Link>
          <div className="hidden md:flex gap-stack-lg items-center">
            {(['Explore', 'Calendar', 'Venues', 'Collective'] as const).map((label, i) => (
              <Link
                key={label}
                to="/"
                className={[
                  'font-sans text-body-md transition-colors',
                  i === 2
                    ? 'text-primary-container font-bold border-b-2 border-primary-container pb-1'
                    : 'text-on-surface-variant hover:text-on-surface',
                ].join(' ')}
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="flex gap-stack-md items-center">
            <button className="p-2 rounded-full hover:bg-white/5 transition-all">
              <Icon name="notifications" className="text-on-surface" size={24} />
            </button>
            <button className="p-2 rounded-full hover:bg-white/5 transition-all">
              <Icon name="account_circle" className="text-on-surface" size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Loading ── */}
      {loading && (
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <Icon name="progress_activity" className="text-primary-container animate-spin" size={40} />
        </div>
      )}

      {/* ── Error ── */}
      {!loading && (error || !event) && (
        <div className="min-h-screen pt-20 flex flex-col items-center justify-center gap-stack-md">
          <Icon name="event_busy" className="text-on-surface-variant" size={48} />
          <p className="font-sans text-body-lg text-on-surface-variant">
            {error ?? 'Evento não encontrado'}
          </p>
        </div>
      )}

      {/* ── Content ── */}
      {!loading && !error && event && (
        <>
          <main className="pt-0">

            {/* ── Cinematic Hero ── */}
            <section className="relative h-[870px] w-full overflow-hidden flex items-end">
              <img
                src={event.coverImageUrl ?? FALLBACK_HERO}
                alt={event.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 editorial-gradient" />

              <div className="relative z-10 w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto pb-stack-xl">
                <div className="flex flex-col gap-stack-md max-w-4xl">

                  {/* Status indicator */}
                  <div className="flex items-center gap-stack-sm mb-stack-xs">
                    <div className="relative flex h-3 w-3">
                      <span className="animate-breath absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-secondary" />
                    </div>
                    <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">
                      {event.status === 'PUBLISHED' ? 'Live Now' : event.status}
                    </span>
                  </div>

                  <h1 className="font-serif text-display-lg-mobile md:text-display-lg text-on-surface leading-none mb-2">
                    {event.title}
                  </h1>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-stack-lg text-on-surface-variant">
                    <div className="flex items-center gap-2">
                      <Icon name="calendar_today" className="text-primary-container" size={20} />
                      <span className="font-sans text-body-lg">{formatEventDate(event.startsAt)}</span>
                    </div>
                    {event.locationName && (
                      <div className="flex items-center gap-2">
                        <Icon name="location_on" className="text-primary-container" size={20} />
                        <span className="font-sans text-body-lg">{event.locationName}</span>
                      </div>
                    )}
                    {/* Social proof */}
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-3">
                        {participants.slice(0, 3).map((p, n) => (
                          <div key={p.userId} className="w-10 h-10 rounded-full border-2 border-surface overflow-hidden">
                            <img
                              src={p.avatarUrl ?? `https://i.pravatar.cc/40?img=${n + 10}`}
                              alt={p.username}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {displayCount > 3 && (
                          <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-variant flex items-center justify-center">
                            <span className="font-label-md text-label-md text-on-surface">
                              +{displayCount - 3}
                            </span>
                          </div>
                        )}
                      </div>
                      {displayCount > 0 && (
                        <span className="font-sans text-label-md text-on-surface-variant italic ml-2">
                          {displayCount} {displayCount === 1 ? 'participante' : 'participantes'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Content Layout ── */}
            <section className="bg-background py-stack-xl px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">

                {/* ── Left column: details ── */}
                <div className="lg:col-span-8 flex flex-col gap-stack-xl">

                  {/* Narrative */}
                  {event.description && (
                    <article className="flex flex-col gap-stack-md">
                      <h2 className="font-serif text-headline-lg text-primary-container">The Narrative</h2>
                      <div className="font-sans text-body-lg text-on-surface-variant max-w-3xl leading-relaxed space-y-stack-md">
                        {event.description.split('\n').filter(Boolean).map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>
                    </article>
                  )}

                  {/* Agenda */}
                  <div className="flex flex-col gap-stack-md">
                    <h2 className="font-serif text-headline-lg text-primary-container">The Agenda</h2>
                    <div className="space-y-stack-md">
                      {AGENDA.map((item, i) => (
                        <AgendaItem
                          key={i}
                          index={i + 1}
                          title={item.title}
                          time={item.time}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Venue */}
                  <div className="flex flex-col gap-stack-md">
                    <h2 className="font-serif text-headline-lg text-primary-container">The Venue</h2>
                    <div className="h-[400px] rounded-xl overflow-hidden grayscale contrast-125 border border-outline-variant">
                      <img
                        src={VENUE_IMG}
                        alt="Venue Map"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {(event.locationName ?? event.address) && (
                      <div className="flex justify-between items-center p-stack-md bg-surface-container rounded-xl">
                        <div>
                          {event.locationName && (
                            <h4 className="font-serif text-headline-md text-on-surface">{event.locationName}</h4>
                          )}
                          {event.address && (
                            <p className="font-sans text-body-md text-on-surface-variant">{event.address}</p>
                          )}
                        </div>
                        <button className="bg-surface-variant text-on-surface p-stack-sm rounded-lg flex items-center gap-2 hover:bg-white/10 transition-all">
                          <Icon name="directions" size={20} />
                          <span className="font-label-md text-label-md">Navegar</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>

                {/* ── Right column: sidebar ── */}
                <div className="lg:col-span-4 flex flex-col gap-stack-lg">

                  {/* Host card */}
                  <GlassPanel className="p-stack-lg flex flex-col gap-stack-md items-center text-center">
                    <div className="w-24 h-24 rounded-full border-4 border-primary-container/20 p-1">
                      <img
                        src={HOST_IMG}
                        alt={event.creatorUsername}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <Link
                        to={`/users/${event.creatorId}`}
                        className="font-serif text-headline-md text-on-surface hover:text-primary-container transition-colors"
                      >
                        {event.creatorUsername}
                      </Link>
                      <p className="font-label-md text-label-md text-primary-container uppercase tracking-widest">
                        Organizador
                      </p>
                    </div>
                    <div className="flex gap-stack-sm mt-stack-sm">
                      {!isCreator && (
                        <FollowButton
                          isFollowing={isFollowing}
                          onClick={() => void toggleFollow()}
                          loading={followActionLoading}
                          size="sm"
                        />
                      )}
                      <button className="p-2 border border-outline-variant rounded-full hover:bg-white/5 transition-all">
                        <Icon name="mail" className="text-on-surface" size={20} />
                      </button>
                    </div>
                  </GlassPanel>

                  {/* Capacity card */}
                  <div className="bg-surface-container p-stack-lg rounded-xl flex flex-col gap-stack-md">
                    <h4 className="font-label-caps text-label-caps text-on-surface-variant">
                      Capacidade &amp; Presença
                    </h4>
                    <div className="flex justify-between items-center">
                      <span className="font-sans text-body-md text-on-surface-variant">Vagas Disponíveis</span>
                      <span className="font-serif text-headline-md text-on-surface">
                        {event.maxParticipants != null
                          ? `${displayCount} / ${event.maxParticipants}`
                          : `${displayCount} participantes`}
                      </span>
                    </div>
                    <ProgressBar value={capacityValue} />

                    {/* Participation error */}
                    {participationError && (
                      <p className="font-sans text-label-md text-error">{participationError}</p>
                    )}

                    <div className="flex flex-col gap-stack-sm mt-stack-md">
                      <div className="flex items-center gap-stack-sm">
                        <Icon name="bolt" className="text-secondary" size={18} />
                        <span className="font-label-md text-label-md text-on-surface">
                          Alta demanda: {displayCount} {displayCount === 1 ? 'pessoa' : 'pessoas'}
                        </span>
                      </div>
                      <div className="flex items-center gap-stack-sm">
                        <Icon name="verified" className="text-primary-container" size={18} />
                        <span className="font-label-md text-label-md text-on-surface">
                          Identidade Verificada Obrigatória
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>

          </main>

          <Footer />

          {/* ── Persistent CTA — mobile ── */}
          {!isCreator && (
            <div className="fixed bottom-0 left-0 w-full z-40 px-margin-mobile py-stack-md bg-background/80 backdrop-blur-md border-t border-outline-variant/30 md:hidden">
              <button
                onClick={handleParticipation}
                disabled={participationLoading}
                className={[
                  'w-full font-bold py-stack-md rounded-xl transition-all font-label-caps text-label-caps uppercase tracking-widest',
                  'flex items-center justify-center gap-2',
                  isParticipating
                    ? 'bg-surface-container-high text-on-surface border border-outline-variant active:scale-95'
                    : 'bg-primary-container text-on-primary-fixed shadow-mint-glow active:scale-95',
                  participationLoading ? 'opacity-70 cursor-not-allowed' : '',
                ].join(' ')}
              >
                {participationLoading && (
                  <Icon name="progress_activity" className="animate-spin" size={18} />
                )}
                {isParticipating ? 'Sair do evento' : 'Participar'}
              </button>
            </div>
          )}

          {/* ── Persistent CTA — desktop ── */}
          {!isCreator && (
            <div className="hidden md:flex fixed bottom-stack-lg right-stack-lg z-50 flex-col items-end gap-stack-sm">
              <GlassPanel className="px-stack-md py-stack-sm rounded-full flex items-center gap-stack-md mb-2">
                <span className="font-label-md text-label-md text-on-surface">
                  {event.maxParticipants != null && event.maxParticipants - displayCount > 0
                    ? `${event.maxParticipants - displayCount} vagas restantes`
                    : 'Vagas limitadas'}
                </span>
              </GlassPanel>
              <button
                onClick={handleParticipation}
                disabled={participationLoading}
                className={[
                  'h-20 px-stack-xl font-bold rounded-full transition-all flex items-center gap-4 font-serif text-headline-md uppercase tracking-widest',
                  isParticipating
                    ? 'bg-surface-container-high text-on-surface border border-outline-variant hover:scale-105 active:scale-90'
                    : 'bg-primary-container text-on-primary-fixed shadow-mint-glow hover:scale-105 active:scale-90',
                  participationLoading ? 'opacity-70 cursor-not-allowed' : '',
                ].join(' ')}
              >
                {participationLoading
                  ? <Icon name="progress_activity" className="animate-spin" size={24} />
                  : <Icon name={isParticipating ? 'logout' : 'arrow_forward'} size={24} />
                }
                {isParticipating ? 'Sair' : 'Participar'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
