import SideNavBar from '../components/organisms/SideNavBar'
import BottomNav from '../components/organisms/BottomNav'
import FAB from '../components/organisms/FAB'
import Footer from '../components/organisms/Footer'
import StatCard from '../components/molecules/StatCard'
import TimelineItem from '../components/molecules/TimelineItem'
import GlassPanel from '../components/molecules/GlassPanel'
import AvatarStack from '../components/molecules/AvatarStack'
import TagChip from '../components/atoms/TagChip'
import Icon from '../components/atoms/Icon'
import { PulseDot } from '../components/atoms/ActivityPulse'

const STATS = [
  { label: 'Events Created', value: 24, accent: true },
  { label: 'Participated', value: 142, accent: false },
  { label: 'Connections', value: 891, accent: false },
  { label: 'Rating', value: '4.9', accent: true },
]

const INTEREST_TAGS = ['Electronic', 'Editorial Art', 'Mixology']

const CHART_BARS = [
  { day: 'M', height: '40%' },
  { day: 'T', height: '65%' },
  { day: 'W', height: '50%' },
  { day: 'T', height: '90%', highlight: true },
  { day: 'F', height: '55%' },
  { day: 'S', height: '75%' },
  { day: 'S', height: '60%' },
]

const TIMELINE_ITEMS = [
  {
    type: 'LIVE NOW',
    time: '20m atrás',
    isActive: true,
    content: (
      <div>
        <p>
          Lançou <span className="text-primary-container font-bold">Midnight Gallery v.04</span> no The Foundry.
          Vendas 40% acima da projeção.
        </p>
        <AvatarStack
          className="mt-4"
          avatars={[
            { src: 'https://i.pravatar.cc/32?img=10', alt: 'Attendee' },
            { src: 'https://i.pravatar.cc/32?img=11', alt: 'Attendee' },
            { src: 'https://i.pravatar.cc/32?img=12', alt: 'Attendee' },
          ]}
          overflow={12}
        />
      </div>
    ),
  },
  {
    type: 'CONNECTION',
    time: '4h atrás',
    isActive: false,
    content: (
      <p>
        Colaborou com <span className="text-tertiary underline decoration-primary-container/40 underline-offset-4">Luna Ray</span> em
        um novo conceito de iluminação imersiva para próximos eventos.
      </p>
    ),
  },
  {
    type: 'EVENT JOINED',
    time: 'Ontem',
    isActive: false,
    content: (
      <div className="flex gap-4">
        <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=160&q=80"
            alt="Sonic Bloom"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h4 className="font-serif text-headline-md text-primary-container leading-none">Sonic Bloom</h4>
          <p className="font-sans text-label-md text-on-surface-variant mt-1">Experimental Audio Collective • Berlin</p>
        </div>
      </div>
    ),
  },
]

const AVATAR_URL = 'https://i.pravatar.cc/160?img=8'

export default function UserDashboard() {
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
                  src={AVATAR_URL}
                  alt="Alex Chen"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              {/* Info */}
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg text-on-surface">Alex Chen</h1>
                  <PulseDot className="mt-1" />
                </div>
                <p className="font-sans text-body-lg text-on-surface-variant max-w-xl mt-2">
                  Arquiteto de experiências noturnas. Especializado em warehouse techno pop-ups e encontros secretos em jardins.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {INTEREST_TAGS.map((tag, i) => (
                    <TagChip key={tag} label={tag} active={i === 0} />
                  ))}
                </div>
              </div>

            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-stack-md">

          {/* Stats Bento */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-stack-xl">
            {STATS.map((stat, i) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                accent={stat.accent}
                extra={
                  i === 3 ? (
                    <Icon name="star" fill={1} size={18} className="text-primary-container scale-75" />
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
                <button className="font-label-caps text-label-caps text-primary-container hover:underline">
                  Ver Tudo
                </button>
              </div>

              <div className="space-y-6 relative border-l border-outline-variant/30 pl-8 ml-3">
                {TIMELINE_ITEMS.map((item, i) => (
                  <TimelineItem
                    key={i}
                    type={item.type}
                    time={item.time}
                    isActive={item.isActive}
                    content={item.content}
                  />
                ))}
              </div>
            </section>

            {/* Insights Sidebar */}
            <aside className="lg:col-span-5 space-y-gutter">

              {/* Growth Pulse bar chart */}
              <GlassPanel className="p-6 border border-white/5">
                <h3 className="font-serif text-headline-md text-on-surface mb-4">Growth Pulse</h3>
                <div className="h-40 w-full relative flex items-end justify-between gap-2 px-2">
                  {CHART_BARS.map((bar, i) => (
                    <div key={i} className="w-full relative group flex flex-col items-center">
                      {/* Label on top */}
                      <div className={`absolute -top-6 text-[10px] text-primary-container font-bold transition-opacity ${bar.highlight ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {bar.day}
                      </div>
                      <div
                        className={`w-full rounded-t-sm transition-all ${bar.highlight ? 'bg-primary-container/60 shadow-mint-glow' : 'bg-primary-container/20 hover:bg-primary-container/40'}`}
                        style={{ height: bar.height }}
                      />
                    </div>
                  ))}
                </div>
                <p className="font-label-md text-label-md text-on-surface-variant mt-6 text-center">
                  Interação <span className="text-primary-container">+12%</span> em relação à semana passada.
                </p>
              </GlassPanel>

              {/* Draft card */}
              <GlassPanel className="p-6 border border-white/5 relative overflow-hidden group">
                <PulseDot className="absolute top-4 right-4" />
                <h3 className="font-serif text-headline-md text-on-surface mb-2">Rascunho Próximo</h3>
                <p className="font-sans text-label-md text-on-surface-variant">Monolith Festival Concept</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-widest">72% Concluído</span>
                  <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-primary-container hover:text-on-primary-fixed transition-all">
                    <Icon name="arrow_forward" size={18} />
                  </button>
                </div>
              </GlassPanel>

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
