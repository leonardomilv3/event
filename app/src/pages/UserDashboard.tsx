import { useState, useReducer, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SideNavBar from '../components/organisms/SideNavBar'
import BottomNav from '../components/organisms/BottomNav'
import FAB from '../components/organisms/FAB'
import Footer from '../components/organisms/Footer'
import StatCard from '../components/molecules/StatCard'
import TimelineItem from '../components/molecules/TimelineItem'
import GlassPanel from '../components/molecules/GlassPanel'
import TagChip from '../components/atoms/TagChip'
import Icon from '../components/atoms/Icon'
import Button from '../components/atoms/Button'
import { PulseDot } from '../components/atoms/ActivityPulse'
import { useProfile } from '../hooks/useProfile'
import { useMyEvents } from '../hooks/useMyEvents'
import { useCreatedEvents } from '../hooks/useCreatedEvents'

const INPUT_CLASS = [
  'w-full bg-surface-container-low border border-outline-variant rounded-lg',
  'px-4 py-3 text-on-surface text-body-md placeholder:text-on-surface-variant',
  'focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container',
  'transition-colors',
].join(' ')

interface FormState { displayName: string; bio: string; city: string }
type FormAction =
  | { type: 'init'; displayName: string; bio: string; city: string }
  | { type: 'set'; field: keyof FormState; value: string }

function formReducer(state: FormState, action: FormAction): FormState {
  if (action.type === 'init') return { displayName: action.displayName, bio: action.bio, city: action.city }
  return { ...state, [action.field]: action.value }
}

export default function UserDashboard() {
  const navigate = useNavigate()
  const { profile, update, updating, error, success, logout } = useProfile()
  const { events: myEvents } = useMyEvents()
  const { events: createdEvents } = useCreatedEvents()

  const [form, formDispatch] = useReducer(formReducer, { displayName: '', bio: '', city: '' })

  // Initialize form once when profile first loads.
  // Calling useState/dispatch during render is the React-recommended pattern for
  // initializing from async data — triggers one extra render, not flagged by set-state-in-effect.
  const [formInitialized, setFormInitialized] = useState(false)
  if (profile && !formInitialized) {
    setFormInitialized(true)
    formDispatch({ type: 'init', displayName: profile.displayName ?? '', bio: profile.bio ?? '', city: profile.city ?? '' })
  }

  const handleSave = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    await update({ displayName: form.displayName || undefined, bio: form.bio || undefined, city: form.city || undefined })
  }

  const handleLogout = (): void => {
    logout()
    navigate('/login')
  }

  const displayedName = profile?.displayName ?? profile?.username ?? ''
  const avatarSrc = profile?.avatarUrl ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayedName || 'U')}&background=1C4532&color=6EE7B7&size=160`
  const interestTags = profile?.interests ?? []

  // Stats reais
  const stats = [
    { label: 'Eventos Criados', value: createdEvents.length, accent: true },
    { label: 'Participações', value: myEvents.length, accent: false },
    { label: 'Conexões', value: '—', accent: false },
    {
      label: 'Eventos Futuros',
      value: createdEvents.filter(e => new Date(e.startsAt) > new Date()).length,
      accent: true,
    },
  ]

  // Timeline: 3 atividades mais recentes (criados + participando)
  const recentActivity = [
    ...createdEvents.map(e => ({ ...e, activityType: 'CRIADO' })),
    ...myEvents.map(e => ({ ...e, activityType: 'PARTICIPANDO' })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  // Primeiro rascunho do usuário
  const nextDraft = createdEvents.find(e => e.status === 'DRAFT')

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <SideNavBar />

      <main className="md:ml-64 min-h-screen pb-stack-xl">

        {/* ── Profile Hero ── */}
        <header className="relative w-full h-[400px] flex items-end overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1400&q=80"
            alt="Cityscape"
            className="absolute inset-0 w-full h-full object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

          <div className="relative w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-stack-lg flex flex-col md:flex-row md:items-end md:justify-between gap-stack-md">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">

              {/* Avatar */}
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden glass-panel p-1 flex-shrink-0">
                <img
                  src={avatarSrc}
                  alt={displayedName}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              {/* Info */}
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg text-on-surface">{displayedName}</h1>
                  <PulseDot className="mt-1" />
                </div>
                <p className="font-sans text-body-lg text-on-surface-variant max-w-xl mt-2">
                  {profile?.bio ?? ''}
                </p>
                {interestTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {interestTags.map((tag, i) => (
                      <TagChip key={tag} label={tag} active={i === 0} />
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Logout */}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="self-start md:self-auto">
              <Icon name="logout" size={18} />
              Sair
            </Button>
          </div>
        </header>

        {/* ── Content ── */}
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-stack-md">

          {/* Stats Bento */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-stack-xl">
            {stats.map((stat, i) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                accent={stat.accent}
                extra={
                  i === 2 ? (
                    <Icon name="people" fill={1} size={18} className="text-on-surface-variant scale-75" />
                  ) : undefined
                }
              />
            ))}
          </section>

          {/* Timeline + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-stack-lg">

            {/* Activity Timeline */}
            <section className="lg:col-span-7">
              <div className="flex items-center justify-between mb-stack-md">
                <h2 className="font-serif text-headline-md text-on-surface">Atividade Recente</h2>
                <Link to="/events" className="font-label-caps text-label-caps text-primary-container hover:underline">
                  Ver Tudo
                </Link>
              </div>

              <div className="space-y-6 relative border-l border-outline-variant/30 pl-8 ml-3">
                {recentActivity.length === 0 ? (
                  <p className="font-label-md text-label-md text-on-surface-variant pl-2">
                    Sua atividade aparecerá aqui conforme você cria e participa de eventos.
                  </p>
                ) : (
                  recentActivity.map((ev) => (
                    <TimelineItem
                      key={ev.id}
                      type={ev.activityType}
                      time={new Date(ev.createdAt).toLocaleDateString('pt-BR')}
                      isActive={ev.status === 'PUBLISHED' && new Date(ev.startsAt) <= new Date()}
                      content={
                        <p>
                          <Link to={`/events/${ev.id}`} className="text-primary-container font-bold hover:underline">
                            {ev.title}
                          </Link>
                          {ev.locationName && (
                            <span className="text-on-surface-variant"> · {ev.locationName}</span>
                          )}
                        </p>
                      }
                    />
                  ))
                )}
              </div>
            </section>

            {/* Insights Sidebar */}
            <aside className="lg:col-span-5 space-y-gutter">

              {/* Edit Profile */}
              <GlassPanel className="p-6 border border-white/5">
                <h3 className="font-serif text-headline-md text-on-surface mb-4">Editar Perfil</h3>
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                      Nome de exibição
                    </label>
                    <input
                      type="text"
                      value={form.displayName}
                      onChange={(e) => formDispatch({ type: 'set', field: 'displayName', value: e.target.value })}
                      placeholder={profile?.username ?? ''}
                      className={INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                      Bio
                    </label>
                    <textarea
                      value={form.bio}
                      onChange={(e) => formDispatch({ type: 'set', field: 'bio', value: e.target.value })}
                      rows={3}
                      placeholder="Conte um pouco sobre você..."
                      className={[INPUT_CLASS, 'resize-none'].join(' ')}
                    />
                  </div>

                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => formDispatch({ type: 'set', field: 'city', value: e.target.value })}
                      placeholder="São Paulo, BR"
                      className={INPUT_CLASS}
                    />
                  </div>

                  {success && (
                    <p className="font-sans text-body-sm text-primary-container flex items-center gap-1">
                      <Icon name="check_circle" size={16} />
                      Perfil atualizado com sucesso
                    </p>
                  )}
                  {error && (
                    <p className="font-sans text-body-sm text-error">{error}</p>
                  )}

                  <Button type="submit" disabled={updating} className="w-full">
                    {updating ? (
                      <>
                        <Icon name="progress_activity" size={16} className="animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar alterações'
                    )}
                  </Button>
                </form>
              </GlassPanel>

              {/* Growth Pulse — analytics em breve */}
              <GlassPanel className="p-6 border border-white/5">
                <h3 className="font-serif text-headline-md text-on-surface mb-2">Growth Pulse</h3>
                <p className="font-sans text-body-md text-on-surface-variant text-center py-8">
                  Analytics em breve
                </p>
              </GlassPanel>

              {/* Draft card — só aparece se houver um rascunho real */}
              {nextDraft && (
                <GlassPanel className="p-6 border border-white/5 relative overflow-hidden group">
                  <PulseDot className="absolute top-4 right-4" />
                  <h3 className="font-serif text-headline-md text-on-surface mb-2">Rascunho</h3>
                  <p className="font-sans text-label-md text-on-surface-variant">{nextDraft.title}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Em edição</span>
                    <Link
                      to={`/events/${nextDraft.id}/edit`}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-primary-container hover:text-on-primary-fixed transition-all"
                    >
                      <Icon name="arrow_forward" size={18} />
                    </Link>
                  </div>
                </GlassPanel>
              )}

            </aside>
          </div>
        </div>

      </main>

      <Footer />
      <FAB label="Criar Evento" />
      <BottomNav />
    </div>
  )
}
