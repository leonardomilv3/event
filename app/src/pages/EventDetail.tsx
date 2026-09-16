import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import Footer from '../components/organisms/Footer'
import GlassPanel from '../components/molecules/GlassPanel'
import ProgressBar from '../components/atoms/ProgressBar'
import Icon from '../components/atoms/Icon'
import { useEvent } from '../hooks/useEvent'
import { deleteEvent } from '../services/eventService';
import { useParticipation } from '../hooks/useParticipation'
import { useFollow } from '../hooks/useFollow'
import { useAuthContext } from '../hooks/useAuthContext'
import { usePublicProfile } from '../hooks/usePublicProfile'
import { formatEventDate } from '../utils/date'
import FollowButton from '../components/atoms/FollowButton'

const FALLBACK_HERO = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&q=80'


export default function EventDetail() {
  const { id = '' } = useParams<{ id: string }>()
  const { user, loading: authLoading } = useAuthContext()
  const navRef = useRef<HTMLElement>(null)
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { event, participants, loading: eventLoading, error } = useEvent(id)
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

  const { profile: creatorProfile } = usePublicProfile(event?.creatorId ?? '')

  const displayCount = (event?.participantCount ?? 0) + countDelta
  // authLoading garante que isCreator não computa com user=null enquanto /api/auth/me ainda está em voo
  const stillLoading = authLoading || eventLoading
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

  const handleDelete = async () => {
    if (!event) return;

    const confirmed = window.confirm(
      `Tem certeza que deseja cancelar "${event.title}"? Essa ação não pode ser desfeita.`
    );
    if (!confirmed) return;

    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteEvent(event.id); // DELETE /api/events/{id}
      navigate('/my-events');
    } catch (err) {
      setDeleteError('Não foi possível cancelar o evento. Tente novamente.');
      setDeleting(false);
    }
  };

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
      {stillLoading && (
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <Icon name="progress_activity" className="text-primary-container animate-spin" size={40} />
        </div>
      )}

      {/* ── Error ── */}
      {!stillLoading && (error || !event) && (
        <div className="min-h-screen pt-20 flex flex-col items-center justify-center gap-stack-md">
          <Icon name="event_busy" className="text-on-surface-variant" size={48} />
          <p className="font-sans text-body-lg text-on-surface-variant">
            {error ?? 'Evento não encontrado'}
          </p>
        </div>
      )}

      {/* ── Content ── */}
      {!stillLoading && !error && event && (
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
                        {participants.slice(0, 3).map((p) => (
                          <div key={p.userId} className="w-10 h-10 rounded-full border-2 border-surface overflow-hidden">
                            <img
                              src={p.avatarUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(p.username)}&background=1C4532&color=6EE7B7&size=40`}
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

                  {/* Venue */}
                  <div className="flex flex-col gap-stack-md">
                    <h2 className="font-serif text-headline-lg text-primary-container">The Venue</h2>
                    {event.coverImageUrl && (
                      <div className="h-[400px] rounded-xl overflow-hidden grayscale contrast-125 border border-outline-variant">
                        <img
                          src={event.coverImageUrl}
                          alt={event.locationName ?? 'Local do evento'}
                          className="w-full h-full object-cover opacity-60"
                        />
                      </div>
                    )}
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
                        src={creatorProfile?.avatarUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(event.creatorUsername)}&background=1C4532&color=6EE7B7&size=160`}
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

                  {isCreator && (
                    <div className="bg-surface-container p-stack-lg rounded-xl flex flex-col gap-stack-md">
                      <h4 className="font-label-caps text-label-caps text-on-surface-variant">
                        Ações do Organizador
                      </h4>

                      {deleteError && (
                        <p className="font-sans text-label-md text-error">{deleteError}</p>
                      )}

                      <div className="flex gap-stack-sm">
                        <Link
                          to={`/events/${event.id}/edit`}
                          className="flex-1 flex items-center justify-center gap-2 bg-surface-variant text-on-surface p-stack-sm rounded-lg hover:bg-white/10 transition-all font-label-md text-label-md"
                        >
                          <Icon name="edit" size={18} />
                          Editar
                        </Link>

                        <button
                          onClick={() => void handleDelete()}
                          disabled={deleting}
                          className="flex-1 flex items-center justify-center gap-2 bg-error/10 text-error border border-error/30 p-stack-sm rounded-lg hover:bg-error/20 transition-all font-label-md text-label-md disabled:opacity-50"
                        >
                          {deleting ? (
                            <Icon name="progress_activity" size={18} className="animate-spin" />
                          ) : (
                            <Icon name="delete" size={18} />
                          )}
                          {deleting ? 'Cancelando...' : 'Cancelar Evento'}
                        </button>
                      </div>
                    </div>
                  )}

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
          {isCreator && (
            <div className="fixed bottom-0 left-0 w-full z-40 px-margin-mobile py-stack-md bg-background/80 backdrop-blur-md border-t border-outline-variant/30 md:hidden">
              <div className="w-full flex items-center justify-center gap-2 py-stack-md rounded-xl bg-surface-container-low border border-primary-container/30">
                <Icon name="verified" className="text-primary-container" size={18} />
                <span className="font-label-caps text-label-caps text-primary-container uppercase tracking-widest">
                  Você é o organizador
                </span>
              </div>
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
          {isCreator && (
            <div className="hidden md:flex fixed bottom-stack-lg right-stack-lg z-50">
              <GlassPanel className="px-stack-lg py-stack-md rounded-full flex items-center gap-stack-sm">
                <Icon name="verified" className="text-primary-container" size={20} />
                <span className="font-label-caps text-label-caps text-primary-container uppercase tracking-widest">
                  Você é o organizador
                </span>
              </GlassPanel>
            </div>
          )}
        </>
      )}
    </div>
  )
}
