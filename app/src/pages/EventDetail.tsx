import { useEffect, useRef } from 'react'
import Footer from '../components/organisms/Footer'
import GlassPanel from '../components/molecules/GlassPanel'
import AgendaItem from '../components/molecules/AgendaItem'
import ProgressBar from '../components/atoms/ProgressBar'
import Icon from '../components/atoms/Icon'

const AGENDA = [
  { title: 'Ambient Warm-up', time: '22:00 - 23:30 • Texturas de baixa fidelidade' },
  { title: 'The Vinyl Session', time: '23:30 - 02:00 • Jornada analógica curada' },
  { title: 'Sonic Descent', time: '02:00 - 04:00 • Frequências profundas de encerramento' },
]

const HERO_IMG = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&q=80'
const HOST_IMG = 'https://i.pravatar.cc/160?img=8'
const VENUE_IMG = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=60'

export default function EventDetail() {
  const navRef = useRef<HTMLElement>(null)

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
      {/* Pass ref via wrapper hack — TopNavBar is self-contained, so we override with a local nav */}
      <nav
        ref={navRef}
        className="fixed top-0 w-full z-50 glass-nav shadow-nav-glow transition-colors duration-300"
      >
        <div className="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <a href="/" className="font-serif text-display-lg-mobile md:text-display-lg text-primary-container tracking-tighter leading-none">
            Eventing
          </a>
          <div className="hidden md:flex gap-stack-lg items-center">
            {['Explore', 'Calendar', 'Venues', 'Collective'].map((label, i) => (
              <a
                key={label}
                href="/"
                className={`font-sans text-body-md transition-colors ${i === 2 ? 'text-primary-container font-bold border-b-2 border-primary-container pb-1' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                {label}
              </a>
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

      <main className="pt-0">

        {/* ── Cinematic Hero ── */}
        <section className="relative h-[870px] w-full overflow-hidden flex items-end">
          <img
            src={HERO_IMG}
            alt="Nocturnal Vinyl Session"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 editorial-gradient" />

          <div className="relative z-10 w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto pb-stack-xl">
            <div className="flex flex-col gap-stack-md max-w-4xl">

              {/* Live indicator */}
              <div className="flex items-center gap-stack-sm mb-stack-xs">
                <div className="relative flex h-3 w-3">
                  <span className="animate-breath absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-secondary" />
                </div>
                <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">
                  Live Now / Session 042
                </span>
              </div>

              <h1 className="font-serif text-display-lg-mobile md:text-display-lg text-on-surface leading-none mb-2">
                Nocturnal Vinyl Session
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-stack-lg text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <Icon name="calendar_today" className="text-primary-container" size={20} />
                  <span className="font-sans text-body-lg">24 Out, 2024 • 22:00</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="location_on" className="text-primary-container" size={20} />
                  <span className="font-sans text-body-lg">The Concrete Void, Berlin</span>
                </div>
                {/* Social proof */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-3">
                    {[10, 11, 13].map(n => (
                      <div key={n} className="w-10 h-10 rounded-full border-2 border-surface overflow-hidden">
                        <img src={`https://i.pravatar.cc/40?img=${n}`} alt="Attendee" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-variant flex items-center justify-center">
                      <span className="font-label-md text-label-md text-on-surface">+12</span>
                    </div>
                  </div>
                  <span className="font-sans text-label-md text-on-surface-variant italic ml-2">
                    Seus amigos vão
                  </span>
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
              <article className="flex flex-col gap-stack-md">
                <h2 className="font-serif text-headline-lg text-primary-container">The Narrative</h2>
                <div className="font-sans text-body-lg text-on-surface-variant max-w-3xl leading-relaxed space-y-stack-md">
                  <p>
                    Uma jornada auditiva imersiva curada para os buscadores da noite. Retornamos ao underground para uma exploração sem compromisso de deep-house e rare groove em vinil. Sem celulares, sem ruído digital — apenas o calor do som analógico e o pulso do coletivo.
                  </p>
                  <p>
                    Esta sessão apresenta uma seleção curada da coleção privada de Alex Chen, abrangendo três décadas de evolução sônica. Espere uma atmosfera definida por estética de baixa luminosidade e precisão de alta fidelidade.
                  </p>
                </div>
              </article>

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
                <div className="flex justify-between items-center p-stack-md bg-surface-container rounded-xl">
                  <div>
                    <h4 className="font-serif text-headline-md text-on-surface">The Concrete Void</h4>
                    <p className="font-sans text-body-md text-on-surface-variant">Straubinger Str. 12, 10243 Berlin</p>
                  </div>
                  <button className="bg-surface-variant text-on-surface p-stack-sm rounded-lg flex items-center gap-2 hover:bg-white/10 transition-all">
                    <Icon name="directions" size={20} />
                    <span className="font-label-md text-label-md">Navegar</span>
                  </button>
                </div>
              </div>

            </div>

            {/* ── Right column: sidebar ── */}
            <div className="lg:col-span-4 flex flex-col gap-stack-lg">

              {/* Host card */}
              <GlassPanel className="p-stack-lg flex flex-col gap-stack-md items-center text-center">
                <div className="w-24 h-24 rounded-full border-4 border-primary-container/20 p-1">
                  <img
                    src={HOST_IMG}
                    alt="Alex Chen"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-headline-md text-on-surface">Alex Chen</h3>
                  <p className="font-label-md text-label-md text-primary-container uppercase tracking-widest">Pro Organizer</p>
                </div>
                <p className="font-sans text-body-md text-on-surface-variant">
                  Especializado em experiências culturais noturnas e paisagens sonoras analógicas curadas pela Europa.
                </p>
                <div className="flex gap-stack-sm mt-stack-sm">
                  <button className="px-stack-md py-2 border border-primary-container text-primary-container rounded-full hover:bg-primary-container hover:text-on-primary-fixed transition-all font-label-md text-label-md">
                    Seguir
                  </button>
                  <button className="p-2 border border-outline-variant rounded-full hover:bg-white/5 transition-all">
                    <Icon name="mail" className="text-on-surface" size={20} />
                  </button>
                </div>
              </GlassPanel>

              {/* Capacity card */}
              <div className="bg-surface-container p-stack-lg rounded-xl flex flex-col gap-stack-md">
                <h4 className="font-label-caps text-label-caps text-on-surface-variant">Capacidade & Presença</h4>
                <div className="flex justify-between items-center">
                  <span className="font-sans text-body-md text-on-surface-variant">Vagas Disponíveis</span>
                  <span className="font-serif text-headline-md text-on-surface">14 / 150</span>
                </div>
                <ProgressBar value={90} />
                <div className="flex flex-col gap-stack-sm mt-stack-md">
                  <div className="flex items-center gap-stack-sm">
                    <Icon name="bolt" className="text-secondary" size={18} />
                    <span className="font-label-md text-label-md text-on-surface">Alta demanda: 42 pessoas agora</span>
                  </div>
                  <div className="flex items-center gap-stack-sm">
                    <Icon name="verified" className="text-primary-container" size={18} />
                    <span className="font-label-md text-label-md text-on-surface">Identidade Verificada Obrigatória</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      <Footer />

      {/* ── Persistent CTA — mobile ── */}
      <div className="fixed bottom-0 left-0 w-full z-40 px-margin-mobile py-stack-md bg-background/80 backdrop-blur-md border-t border-outline-variant/30 md:hidden">
        <button className="w-full bg-primary-container text-on-primary-fixed font-bold py-stack-md rounded-xl shadow-mint-glow active:scale-95 transition-all font-label-caps text-label-caps uppercase tracking-widest">
          Participar
        </button>
      </div>

      {/* ── Persistent CTA — desktop ── */}
      <div className="hidden md:flex fixed bottom-stack-lg right-stack-lg z-50 flex-col items-end gap-stack-sm">
        <GlassPanel className="px-stack-md py-stack-sm rounded-full flex items-center gap-stack-md mb-2">
          <span className="font-label-md text-label-md text-on-surface">Vagas limitadas restantes</span>
        </GlassPanel>
        <button className="h-20 px-stack-xl bg-primary-container text-on-primary-fixed font-bold rounded-full shadow-mint-glow hover:scale-105 active:scale-90 transition-all flex items-center gap-4 font-serif text-headline-md uppercase tracking-widest">
          Participar
          <Icon name="arrow_forward" size={24} />
        </button>
      </div>
    </div>
  )
}
