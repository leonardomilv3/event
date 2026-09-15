import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TopNavBar from '../components/organisms/TopNavBar'
import SideNavBar from '../components/organisms/SideNavBar'
import BottomNav from '../components/organisms/BottomNav'
import FAB from '../components/organisms/FAB'
import Footer from '../components/organisms/Footer'
import FilterTabs from '../components/molecules/FilterTabs'
import SearchInput from '../components/molecules/SearchInput'
import Icon from '../components/atoms/Icon'
import { useCreatedEvents } from '../hooks/useCreatedEvents'
import { type EventResponse } from '../types/api'

const FILTER_TABS = [
  { label: 'Todos', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Público', value: 'public' },
  { label: 'Privado', value: 'private' },
  { label: 'Ao Vivo', value: 'live' },
]

function StatusBadge({ status, visibility, startsAt }: Pick<EventResponse, 'status' | 'visibility' | 'startsAt'>) {
  const isLive = status === 'PUBLISHED' && new Date(startsAt) <= new Date()

  if (isLive) {
    return (
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full border border-secondary/30">
        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse-red" />
        <span className="font-label-caps text-label-caps text-secondary">LIVE</span>
      </div>
    )
  }
  if (status === 'DRAFT') {
    return (
      <div className="absolute top-4 left-4 bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
        <span className="font-label-caps text-label-caps text-on-surface-variant">DRAFT</span>
      </div>
    )
  }
  if (status === 'CANCELLED') {
    return (
      <div className="absolute top-4 left-4 bg-error/20 backdrop-blur-md px-3 py-1 rounded-full border border-error/30">
        <span className="font-label-caps text-label-caps text-error">CANCELADO</span>
      </div>
    )
  }
  if (visibility === 'INVITE_ONLY') {
    return (
      <div className="absolute top-4 left-4 bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1">
        <Icon name="lock" size={12} className="text-on-surface-variant" />
        <span className="font-label-caps text-label-caps text-on-surface-variant">PRIVADO</span>
      </div>
    )
  }
  return (
    <div className="absolute top-4 left-4 bg-primary-container/20 backdrop-blur-md px-3 py-1 rounded-full border border-primary-container/30">
      <span className="font-label-caps text-label-caps text-primary-container">PÚBLICO</span>
    </div>
  )
}

export default function EventManagement() {
  const navigate = useNavigate()
  const { events, loading, error } = useCreatedEvents()
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = events.filter(ev => {
    if (activeFilter === 'draft') return ev.status === 'DRAFT'
    if (activeFilter === 'public') return ev.visibility === 'PUBLIC'
    if (activeFilter === 'private') return ev.visibility === 'INVITE_ONLY'
    if (activeFilter === 'live') return ev.status === 'PUBLISHED' && new Date(ev.startsAt) <= new Date()
    return true
  })

  const searched = filtered.filter(ev =>
    ev.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopNavBar />
      <SideNavBar topOffset="top-20" />

      <div className="flex min-h-screen pt-20">
        {/* Spacer for sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0" />

        <main className="flex-1 px-margin-mobile md:px-margin-desktop py-stack-lg max-w-full">

          {/* Page header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-stack-md mb-stack-xl">
            <div>
              <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">
                Eventing Hub
              </h1>
              <p className="font-sans text-body-md text-on-surface-variant max-w-xl">
                Curate suas experiências noturnas. Gerencie, escale e divulgue o próximo movimento do seu coletivo.
              </p>
            </div>
            <button
              onClick={() => navigate('/events/new')}
              className="flex items-center gap-2 bg-primary-container text-on-primary-fixed font-bold px-6 py-3 rounded-lg hover:shadow-mint-glow-strong transition-all active:scale-95"
            >
              <Icon name="add" size={20} />
              Criar Evento
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 mb-stack-lg">
            <FilterTabs
              tabs={FILTER_TABS}
              active={activeFilter}
              onChange={setActiveFilter}
            />
            <div className="ml-auto">
              <SearchInput
                placeholder="Filtrar eventos..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-64"
              />
            </div>
          </div>

          {/* Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">

            {loading && (
              <div className="col-span-full flex justify-center py-stack-xl">
                <Icon name="progress_activity" size={32} className="animate-spin text-primary-container" />
              </div>
            )}

            {!loading && error && (
              <div className="col-span-full text-center py-stack-xl">
                <p className="text-error font-label-md flex items-center justify-center gap-2">
                  <Icon name="error" size={18} />
                  {error}
                </p>
              </div>
            )}

            {!loading && !error && searched.length === 0 && (
              <div className="col-span-full text-center py-stack-xl">
                <p className="font-sans text-body-md text-on-surface-variant">
                  {events.length === 0 ? 'Você ainda não criou nenhum evento.' : 'Nenhum evento encontrado.'}
                </p>
              </div>
            )}

            {!loading && !error && searched.map(ev => (
              <Link
                key={ev.id}
                to={`/events/${ev.id}`}
                className="group bg-[#181C1F] border border-white/5 rounded-xl overflow-hidden hover:border-primary-container/40 hover:shadow-mint-glow transition-all duration-300 flex flex-col"
              >
                <div className="relative h-48">
                  {ev.coverImageUrl ? (
                    <img
                      src={ev.coverImageUrl}
                      alt={ev.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-variant/10 flex items-center justify-center">
                      <Icon name="image" size={64} className="text-white/5" />
                    </div>
                  )}
                  <StatusBadge status={ev.status} visibility={ev.visibility} startsAt={ev.startsAt} />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-serif text-headline-md text-on-surface mb-1">{ev.title}</h3>
                  <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                    {ev.locationName ?? 'Local a definir'} • {ev.category}
                  </p>
                  <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                      <Icon name="groups" size={16} />
                      {ev.participantCount} participantes
                    </span>
                    <span className="font-label-caps text-label-caps text-primary-container">
                      {new Date(ev.startsAt).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }).toUpperCase()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {/* CTA: Novo Conceito */}
            {!loading && (
              <button
                onClick={() => navigate('/events/new')}
                className="group border-2 border-dashed border-outline-variant/30 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-primary-container/50 transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-surface-variant/30 flex items-center justify-center mb-4 group-hover:bg-primary-container/10 transition-colors">
                  <Icon name="add_circle" className="text-primary-container" size={32} />
                </div>
                <h3 className="font-serif text-headline-md text-on-surface mb-2">Novo Conceito</h3>
                <p className="font-sans text-body-md text-on-surface-variant px-8">
                  Duplique um sucesso anterior ou comece uma nova visão do zero.
                </p>
              </button>
            )}

          </div>
        </main>
      </div>

      <Footer />
      <FAB mobileOnly icon="add" label="Criar Evento" onClick={() => navigate('/events/new')} />
      <BottomNav />
    </div>
  )
}
