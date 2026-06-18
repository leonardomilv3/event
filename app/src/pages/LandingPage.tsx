import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import TopNavBar from '../components/organisms/TopNavBar'
import EventCardCarousel from '../components/organisms/EventCardCarousel'
import Footer from '../components/organisms/Footer'
import FAB from '../components/organisms/FAB'
import EventCard from '../components/molecules/EventCard'
import BentoCard from '../components/molecules/BentoCard'
import ActivityPulse from '../components/atoms/ActivityPulse'
import Icon from '../components/atoms/Icon'
import Button from '../components/atoms/Button'
import { useEventFeed } from '../hooks/useEventFeed'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=900&q=80'

const HOW_IT_WORKS = [
  {
    icon: 'explore',
    title: 'Descubra',
    description: 'Algoritmos curados pelo Nocturnal Collective sugerem eventos baseados no seu estilo e localização em tempo real.',
  },
  {
    icon: 'hub',
    title: 'Conecte-se',
    description: 'Interaja com outros participantes, veja quem está indo e entre em listas exclusivas através da nossa rede social.',
  },
  {
    icon: 'celebration',
    title: 'Participe',
    description: 'Tickets digitais instantâneos e acesso via QR code. Sua entrada no pulso da cidade sem atritos ou esperas.',
  },
]

const MAP_PINS = [
  { top: '30%', left: '45%' },
  { top: '50%', left: '20%' },
  { top: '70%', left: '60%' },
  { top: '40%', left: '75%' },
  { top: '25%', left: '85%' },
]

const HERO_PULSES = [
  { top: '25%', left: '15%' },
  { top: '60%', left: '80%' },
  { top: '85%', left: '30%' },
  { top: '40%', left: '65%' },
]

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { events: feedEvents, loading: feedLoading, error: feedError, retry: feedRetry } = useEventFeed()

  // Subtle parallax on mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return
      const moveX = (e.clientX - window.innerWidth / 2) * 0.008
      const moveY = (e.clientY - window.innerHeight / 2) * 0.008
      heroRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-background text-on-surface overflow-x-hidden">
      <TopNavBar />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Radial glow background */}
        <div ref={heroRef} className="hero-gradient absolute inset-0 pointer-events-none" />

        {/* Activity pulse dots */}
        {HERO_PULSES.map((p, i) => (
          <ActivityPulse key={i} top={p.top} left={p.left} />
        ))}

        {/* Ambient animated blobs */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-container/5 blur-[120px] rounded-full animate-pulse" />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full animate-pulse"
            style={{ animationDelay: '2s' }}
          />
        </div>

        {/* Headline */}
        <div className="relative z-10 text-center px-margin-mobile">
          <h1 className="max-w-4xl mx-auto">
            <span className="block font-serif text-headline-lg-mobile md:text-headline-lg text-on-surface leading-tight">
              Encontre os
            </span>
            <span className="block font-serif text-display-lg-mobile md:text-display-lg text-primary-container italic md:-translate-y-2 md:translate-x-4 transform">
              eventos
            </span>
            <span className="block font-serif text-headline-lg-mobile md:text-headline-lg text-on-surface leading-tight">
              que estão acontecendo
            </span>
            <span className="block font-serif text-display-lg-mobile md:text-display-lg text-primary-container italic md:-translate-y-2 md:-translate-x-6 transform">
              now
            </span>
          </h1>

          <div className="mt-stack-lg flex flex-col md:flex-row gap-gutter justify-center items-center">
            <Link
              to="/events"
              className="bg-primary-container text-on-primary-fixed font-bold py-4 px-8 rounded-full shadow-mint-glow hover:shadow-mint-glow-strong transition-all active:scale-95 font-sans text-label-md"
            >
              Descubra o Pulso
            </Link>
            <button className="border-2 border-primary-container text-on-surface font-bold py-4 px-8 rounded-full hover:bg-primary-container/5 transition-all active:scale-95 font-sans text-label-md">
              Ver Agenda
            </button>
          </div>
        </div>
      </section>

      {/* ── Carousel: O que está acontecendo ── */}
      <section className="py-stack-xl bg-surface-container-lowest">
        <EventCardCarousel
          sectionLabel="Current Pulse"
          sectionTitle="O que está acontecendo"
        >
          {feedLoading && feedEvents.length === 0 ? (
            <div className="flex items-center gap-2 px-margin-mobile text-on-surface-variant">
              <Icon name="progress_activity" className="animate-spin" size={20} />
              <span className="font-sans text-body-md">Carregando eventos...</span>
            </div>
          ) : feedError ? (
            <div className="flex flex-col gap-stack-sm px-margin-mobile">
              <p className="font-sans text-body-md text-error">{feedError}</p>
              <Button variant="ghost" size="sm" onClick={feedRetry}>
                <Icon name="refresh" size={16} />
                Tentar novamente
              </Button>
            </div>
          ) : feedEvents.length === 0 ? (
            <p className="font-sans text-body-md text-on-surface-variant px-margin-mobile">
              Nenhum evento encontrado na sua região
            </p>
          ) : (
            feedEvents.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                category={event.category}
                imageUrl={event.coverImageUrl ?? FALLBACK_IMAGE}
                href={`/events/${event.id}`}
              />
            ))
          )}
        </EventCardCarousel>
      </section>

      {/* ── Map Section ── */}
      <section className="py-stack-xl bg-surface">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">

            {/* Text */}
            <div className="lg:col-span-4 order-2 lg:order-1">
              <span className="font-label-caps text-label-caps text-primary-container uppercase block mb-1">
                Live Heatmap
              </span>
              <h2 className="font-serif text-headline-lg-mobile md:text-headline-lg text-on-surface mt-stack-xs">
                A densidade da noite
              </h2>
              <p className="font-sans text-body-lg text-on-surface-variant mt-stack-md">
                Navegue pelo mapa interativo para encontrar onde a energia está mais alta agora. Dos clubes subterrâneos às coberturas exclusivas.
              </p>
              <ul className="mt-stack-lg space-y-stack-md">
                <li className="flex items-center gap-4">
                  <span className="w-3 h-3 rounded-full bg-primary-container shadow-mint-glow flex-shrink-0" />
                  <span className="font-label-md text-label-md text-on-surface">Alta Atividade (Centro)</span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="w-3 h-3 rounded-full bg-secondary flex-shrink-0" />
                  <span className="font-label-md text-label-md text-on-surface">Eventos Premium (Jardins)</span>
                </li>
              </ul>
            </div>

            {/* Map mock */}
            <div className="lg:col-span-8 order-1 lg:order-2">
              <div className="relative aspect-video bg-surface-container rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=60"
                  alt="Mapa da cidade"
                  className="w-full h-full object-cover grayscale opacity-30 mix-blend-luminosity"
                />
                {/* Mint glow overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 via-transparent to-secondary/5" />

                {/* Pulse pins */}
                {MAP_PINS.map((pin, i) => (
                  <ActivityPulse key={i} top={pin.top} left={pin.left} />
                ))}

                {/* Zoom controls */}
                <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                  <button className="bg-surface-variant/80 backdrop-blur-md p-3 rounded-lg hover:bg-surface-variant transition-colors">
                    <Icon name="add" className="text-on-surface" size={20} />
                  </button>
                  <button className="bg-surface-variant/80 backdrop-blur-md p-3 rounded-lg hover:bg-surface-variant transition-colors">
                    <Icon name="remove" className="text-on-surface" size={20} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="py-stack-xl px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="text-center mb-stack-xl">
          <h2 className="font-serif text-headline-lg-mobile md:text-headline-lg text-on-surface">
            Como o Eventing funciona
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {HOW_IT_WORKS.map(item => (
            <BentoCard
              key={item.icon}
              icon={item.icon}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </section>

      <Footer />

      <FAB label="Criar Evento" />
    </div>
  )
}
