import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
const MAP_PINS = [
  { top: '30%', left: '45%' }, { top: '50%', left: '20%' }, { top: '70%', left: '60%' },
  { top: '40%', left: '75%' }, { top: '25%', left: '85%' },
]
const HERO_PULSES = [
  { top: '25%', left: '15%' }, { top: '60%', left: '80%' },
  { top: '85%', left: '30%' }, { top: '40%', left: '65%' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const heroRef = useRef<HTMLDivElement>(null)
  const { events: feedEvents, loading: feedLoading, error: feedError, retry: feedRetry } = useEventFeed()
  const { t } = useTranslation('landing')

  const howItWorks = [
    { icon: 'explore', title: t('howItWorks.discover.title'), description: t('howItWorks.discover.description') },
    { icon: 'hub', title: t('howItWorks.connect.title'), description: t('howItWorks.connect.description') },
    { icon: 'celebration', title: t('howItWorks.participate.title'), description: t('howItWorks.participate.description') },
  ]

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

      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div ref={heroRef} className="hero-gradient absolute inset-0 pointer-events-none" />
        {HERO_PULSES.map((p, i) => (<ActivityPulse key={i} top={p.top} left={p.left} />))}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-container/5 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 text-center px-margin-mobile">
          <h1 className="max-w-4xl mx-auto">
            <span className="block font-serif text-headline-lg-mobile md:text-headline-lg text-on-surface leading-tight">{t('hero.line1')}</span>
            <span className="block font-serif text-display-lg-mobile md:text-display-lg text-primary-container italic md:-translate-y-2 md:translate-x-4 transform">{t('hero.line2')}</span>
            <span className="block font-serif text-headline-lg-mobile md:text-headline-lg text-on-surface leading-tight">{t('hero.line3')}</span>
            <span className="block font-serif text-display-lg-mobile md:text-display-lg text-primary-container italic md:-translate-y-2 md:-translate-x-6 transform">{t('hero.line4')}</span>
          </h1>
          <div className="mt-stack-lg flex flex-col md:flex-row gap-gutter justify-center items-center">
            <Link to="/events" className="bg-primary-container text-on-primary-fixed font-bold py-4 px-8 rounded-full shadow-mint-glow hover:shadow-mint-glow-strong transition-all active:scale-95 font-sans text-label-md">{t('hero.ctaPrimary')}</Link>
            <button className="border-2 border-primary-container text-on-surface font-bold py-4 px-8 rounded-full hover:bg-primary-container/5 transition-all active:scale-95 font-sans text-label-md">{t('hero.ctaSecondary')}</button>
          </div>
        </div>
      </section>

      <section className="py-stack-xl bg-surface-container-lowest">
        <EventCardCarousel sectionLabel={t('carousel.sectionLabel')} sectionTitle={t('carousel.sectionTitle')}>
          {feedLoading && feedEvents.length === 0 ? (
            <div className="flex items-center gap-2 px-margin-mobile text-on-surface-variant">
              <Icon name="progress_activity" className="animate-spin" size={20} />
              <span className="font-sans text-body-md">{t('carousel.loading')}</span>
            </div>
          ) : feedError ? (
            <div className="flex flex-col gap-stack-sm px-margin-mobile">
              <p className="font-sans text-body-md text-error">{feedError}</p>
              <Button variant="ghost" size="sm" onClick={feedRetry}>
                <Icon name="refresh" size={16} />
                {t('actions.retry', { ns: 'common' })}
              </Button>
            </div>
          ) : feedEvents.length === 0 ? (
            <p className="font-sans text-body-md text-on-surface-variant px-margin-mobile">{t('carousel.empty')}</p>
          ) : (
            feedEvents.map((event) => (
              <EventCard key={event.id} id={event.id} title={event.title} category={event.category} imageUrl={event.coverImageUrl ?? FALLBACK_IMAGE} href={`/events/${event.id}`} />
            ))
          )}
        </EventCardCarousel>
      </section>

      <section className="py-stack-xl bg-surface">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
            <div className="lg:col-span-4 order-2 lg:order-1">
              <span className="font-label-caps text-label-caps text-primary-container uppercase block mb-1">{t('map.label')}</span>
              <h2 className="font-serif text-headline-lg-mobile md:text-headline-lg text-on-surface mt-stack-xs">{t('map.title')}</h2>
              <p className="font-sans text-body-lg text-on-surface-variant mt-stack-md">{t('map.description')}</p>
              <ul className="mt-stack-lg space-y-stack-md">
                <li className="flex items-center gap-4">
                  <span className="w-3 h-3 rounded-full bg-primary-container shadow-mint-glow flex-shrink-0" />
                  <span className="font-label-md text-label-md text-on-surface">{t('map.highActivity')}</span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="w-3 h-3 rounded-full bg-secondary flex-shrink-0" />
                  <span className="font-label-md text-label-md text-on-surface">{t('map.premiumEvents')}</span>
                </li>
              </ul>
            </div>
            <div className="lg:col-span-8 order-1 lg:order-2">
              <div className="relative aspect-video bg-surface-container rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                <img src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=60" alt={t('map.imageAlt')} className="w-full h-full object-cover grayscale opacity-30 mix-blend-luminosity" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 via-transparent to-secondary/5" />
                {MAP_PINS.map((pin, i) => (<ActivityPulse key={i} top={pin.top} left={pin.left} />))}
                <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                  <button className="bg-surface-variant/80 backdrop-blur-md p-3 rounded-lg hover:bg-surface-variant transition-colors"><Icon name="add" className="text-on-surface" size={20} /></button>
                  <button className="bg-surface-variant/80 backdrop-blur-md p-3 rounded-lg hover:bg-surface-variant transition-colors"><Icon name="remove" className="text-on-surface" size={20} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-stack-xl px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="text-center mb-stack-xl">
          <h2 className="font-serif text-headline-lg-mobile md:text-headline-lg text-on-surface">{t('howItWorks.title')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {howItWorks.map((item) => (<BentoCard key={item.icon} icon={item.icon} title={item.title} description={item.description} />))}
        </div>
      </section>

      <Footer />
      <FAB label={t('hero.ctaPrimary')} onClick={() => navigate('/events/new')} />
    </div>
  )
}