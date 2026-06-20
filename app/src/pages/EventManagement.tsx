import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TopNavBar from '../components/organisms/TopNavBar'
import SideNavBar from '../components/organisms/SideNavBar'
import BottomNav from '../components/organisms/BottomNav'
import FAB from '../components/organisms/FAB'
import Footer from '../components/organisms/Footer'
import FilterTabs from '../components/molecules/FilterTabs'
import SearchInput from '../components/molecules/SearchInput'
import AvatarStack from '../components/molecules/AvatarStack'
import Icon from '../components/atoms/Icon'

const FILTER_TABS = [
  { label: 'Todos', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Público', value: 'public' },
  { label: 'Privado', value: 'private' },
  { label: 'Ao Vivo', value: 'live' },
]

const MOCK_AVATARS = [
  { src: 'https://i.pravatar.cc/32?img=1', alt: 'Attendee' },
  { src: 'https://i.pravatar.cc/32?img=2', alt: 'Attendee' },
  { src: 'https://i.pravatar.cc/32?img=3', alt: 'Attendee' },
]

export default function EventManagement() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopNavBar authenticated userName="Alex Chen" />
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

            {/* Card: Live */}
            <Link to="/events/neon-pulse" className="group bg-[#181C1F] border border-white/5 rounded-xl overflow-hidden hover:border-primary-container/40 hover:shadow-mint-glow transition-all duration-300 flex flex-col">
              <div className="relative h-48">
                <img
                  src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80"
                  alt="Neon Pulse Warehouse"
                  className="w-full h-full object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-500"
                />
                {/* Live badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full border border-secondary/30">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse-red" />
                  <span className="font-label-caps text-label-caps text-secondary">LIVE</span>
                </div>
                {/* Actions */}
                <div className="absolute bottom-4 right-4 bg-background/60 backdrop-blur-md p-2 rounded-lg flex gap-2">
                  <button className="hover:text-primary-container transition-colors" onClick={e => e.preventDefault()}>
                    <Icon name="share" className="text-on-surface" size={18} />
                  </button>
                  <button className="hover:text-primary-container transition-colors" onClick={e => e.preventDefault()}>
                    <Icon name="more_vert" className="text-on-surface" size={18} />
                  </button>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="font-serif text-headline-md text-on-surface mb-1">Neon Pulse Warehouse</h3>
                  <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Berlin Industrial • Techno</p>
                </div>
                <div className="mt-auto flex justify-between items-center">
                  <AvatarStack avatars={MOCK_AVATARS} overflow={842} size={8} />
                  <div className="text-right">
                    <p className="font-label-caps text-label-caps text-primary-container">OUT 24</p>
                    <p className="text-on-surface-variant text-xs">22:00 - LATE</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Card: Public */}
            <div className="group bg-[#181C1F] border border-white/5 rounded-xl overflow-hidden hover:border-primary-container/40 hover:shadow-mint-glow transition-all duration-300 flex flex-col">
              <div className="relative h-48">
                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80"
                  alt="Vanguard Editorial"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute top-4 left-4 bg-primary-container/20 backdrop-blur-md px-3 py-1 rounded-full border border-primary-container/30">
                  <span className="font-label-caps text-label-caps text-primary-container">PÚBLICO</span>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="font-serif text-headline-md text-on-surface mb-1">Vanguard Editorial</h3>
                  <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">The Glass House • Fashion</p>
                </div>
                <div className="flex gap-2 mt-2">
                  <button className="flex-1 bg-surface-variant/50 hover:bg-surface-variant py-2 rounded-lg font-label-md text-label-md text-on-surface transition-colors border border-white/5">
                    Editar
                  </button>
                  <button className="flex-1 bg-surface-variant/50 hover:bg-surface-variant py-2 rounded-lg font-label-md text-label-md text-on-surface transition-colors border border-white/5">
                    Duplicar
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                    <Icon name="groups" size={16} />
                    12.4k Registrados
                  </span>
                  <span className="font-label-caps text-label-caps text-primary-container">NOV 12</span>
                </div>
              </div>
            </div>

            {/* Card: Draft */}
            <div className="group bg-[#181C1F] border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 flex flex-col">
              <div className="relative h-48 bg-surface-variant/10 flex items-center justify-center">
                <Icon name="image" size={64} className="text-white/5" />
                <div className="absolute top-4 left-4 bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  <span className="font-label-caps text-label-caps text-on-surface-variant">DRAFT</span>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="font-serif text-headline-md text-on-surface/60 mb-1 italic">Projeto Sem Título 04</h3>
                  <p className="font-label-caps text-label-caps text-on-surface-variant/60 uppercase tracking-widest">Local a Definir</p>
                </div>
                <div className="mt-auto">
                  <button className="w-full border-2 border-primary-container text-primary-container hover:bg-primary-container/5 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2">
                    <Icon name="edit_note" size={18} />
                    Finalizar Configuração
                  </button>
                </div>
              </div>
            </div>

            {/* Card: Private — wide */}
            <div className="group bg-[#181C1F] border border-white/5 rounded-xl overflow-hidden hover:bg-[#1A1E21] transition-all duration-300 flex flex-col lg:col-span-2">
              <div className="flex flex-col md:flex-row h-full">
                <div className="md:w-2/5 relative h-48 md:h-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80"
                    alt="The Alchemist Sessions"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#181C1F] via-transparent to-transparent hidden md:block" />
                </div>
                <div className="p-8 md:w-3/5 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon name="lock" className="text-on-surface-variant" size={16} />
                    <span className="font-label-caps text-label-caps text-on-surface-variant">COLETIVO PRIVADO</span>
                  </div>
                  <h3 className="font-serif text-display-lg-mobile text-on-surface mb-2">The Alchemist Sessions</h3>
                  <p className="font-sans text-body-md text-on-surface-variant mb-6">
                    Apenas convidados. Uma noite curada de jazz experimental e síntese modular ambiente. Limitado a 50 patronos.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <button className="hover:scale-110 transition-transform">
                        <Icon name="share" className="text-primary-container" size={22} />
                      </button>
                      <button className="hover:text-on-surface transition-colors">
                        <Icon name="content_copy" className="text-on-surface-variant" size={22} />
                      </button>
                      <button className="hover:text-on-surface transition-colors">
                        <Icon name="edit" className="text-on-surface-variant" size={22} />
                      </button>
                    </div>
                    <span className="font-label-caps text-label-caps text-primary-container">DEZ 05</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card: Empty CTA */}
            <div className="group border-2 border-dashed border-outline-variant/30 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-primary-container/50 transition-all cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-surface-variant/30 flex items-center justify-center mb-4 group-hover:bg-primary-container/10 transition-colors">
                <Icon name="add_circle" className="text-primary-container" size={32} />
              </div>
              <h3 className="font-serif text-headline-md text-on-surface mb-2">Novo Conceito</h3>
              <p className="font-sans text-body-md text-on-surface-variant px-8">
                Duplique um sucesso anterior ou comece uma nova visão do zero.
              </p>
            </div>

          </div>
        </main>
      </div>

      <Footer />
      <FAB mobileOnly icon="add" label="Criar Evento" onClick={() => navigate('/events/new')} />
      <BottomNav />
    </div>
  )
}
