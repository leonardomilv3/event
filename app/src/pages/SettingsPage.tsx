import { useTranslation } from 'react-i18next'
import TopNavBar from '../components/organisms/TopNavBar'
import SideNavBar from '../components/organisms/SideNavBar'
import BottomNav from '../components/organisms/BottomNav'
import Footer from '../components/organisms/Footer'
import GlassPanel from '../components/molecules/GlassPanel'
import Icon from '../components/atoms/Icon'
import LanguageSwitcher from '../components/atoms/LanguageSwitcher'

interface SectionProps {
  icon: string
  title: string
  description: string
  badge?: string
  iconMuted?: boolean
  children?: React.ReactNode
}

function SettingSection({ icon, title, description, badge, iconMuted, children }: SectionProps) {
  return (
    <GlassPanel className="p-stack-lg">
      <div className="flex items-start justify-between gap-stack-md mb-stack-md">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 className="font-serif text-headline-md text-on-surface">{title}</h2>
            {badge && (
              <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 font-label-caps text-[10px] uppercase tracking-widest">
                {badge}
              </span>
            )}
          </div>
          <p className="font-sans text-body-md text-on-surface-variant">{description}</p>
        </div>
        <div
          className={[
            'p-3 rounded-full border flex-shrink-0',
            iconMuted
              ? 'bg-surface-container border-outline-variant/30 opacity-50'
              : 'bg-primary-container/10 border-primary-container/20',
          ].join(' ')}
        >
          <Icon
            name={icon}
            className={iconMuted ? 'text-on-surface-variant' : 'text-primary-container'}
            size={20}
          />
        </div>
      </div>
      {children}
    </GlassPanel>
  )
}

export default function SettingsPage() {
  const { t } = useTranslation('settings')

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopNavBar />
      <SideNavBar topOffset="top-20" />

      <div className="flex min-h-screen pt-20">
        <div className="hidden md:block w-64 flex-shrink-0" />

        <main className="flex-1 px-margin-mobile md:px-margin-desktop py-stack-lg max-w-full">
          <header className="mb-stack-xl">
            <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">
              {t('title')}
            </h1>
            <p className="font-sans text-body-md text-on-surface-variant max-w-xl">
              {t('subtitle')}
            </p>
          </header>

          <div className="max-w-2xl flex flex-col gap-stack-md">
            <SettingSection
              icon="language"
              title={t('sections.language.title')}
              description={t('sections.language.description')}
            >
              <LanguageSwitcher />
            </SettingSection>

            <SettingSection
              icon="palette"
              title={t('sections.appearance.title')}
              description={t('sections.appearance.description')}
              badge={t('sections.appearance.badge')}
              iconMuted
            />

            <SettingSection
              icon="notifications"
              title={t('sections.notifications.title')}
              description={t('sections.notifications.description')}
              badge={t('sections.notifications.badge')}
              iconMuted
            />
          </div>
        </main>
      </div>

      <Footer />
      <BottomNav />
    </div>
  )
}