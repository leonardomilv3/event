import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import TopNavBar from '../components/organisms/TopNavBar'
import Footer from '../components/organisms/Footer'
import EventFormPanel from '../components/molecules/EventFormPanel'
import AuthInput from '../components/atoms/AuthInput'
import AddressAutocomplete from '../components/molecules/AddressAutocomplete'
import TagChip from '../components/atoms/TagChip'
import SegmentedControl from '../components/atoms/SegmentedControl'
import Icon from '../components/atoms/Icon'
import { useEventForm } from '../hooks/useEventForm'
import { useAddressSearch } from '../hooks/useAddressSearch'
import { type CreateEventRequest } from '../types/api'
import { datetimeLocalToIso } from '../utils/date'
import { isHttpUrl } from '../utils/url'
import { formatCoordinate, parseCoordinates } from '../utils/coordinates'
import { type AddressSuggestion } from '../types/geocoding'

const MIN_LEAD_TIME_MS = 60_000

const CATEGORY_VALUES = ['MUSIC', 'ART', 'FOOD', 'SPORTS', 'NETWORKING', 'NIGHTLIFE'] as const
type CategoryValue = (typeof CATEGORY_VALUES)[number]

const CATEGORY_LABEL_KEYS = {
  MUSIC: 'categories.music',
  ART: 'categories.art',
  FOOD: 'categories.food',
  SPORTS: 'categories.sports',
  NETWORKING: 'categories.networking',
  NIGHTLIFE: 'categories.nightlife',
} as const satisfies Record<CategoryValue, string>

const VISIBILITY_VALUES = ['PUBLIC', 'PRIVATE', 'INVITE_ONLY'] as const
type VisibilityValue = (typeof VISIBILITY_VALUES)[number]

const VISIBILITY_LABEL_KEYS = {
  PUBLIC: 'visibility.public',
  PRIVATE: 'visibility.private',
  INVITE_ONLY: 'visibility.inviteOnly',
} as const satisfies Record<VisibilityValue, string>

const INPUT_CLASS = [
  'w-full bg-surface-container-lowest border border-outline-variant rounded-lg',
  'p-stack-sm text-on-surface text-body-md placeholder:text-on-surface-variant/30',
  'focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30',
  'transition-all duration-300',
].join(' ')

const LABEL_CLASS =
  'font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider'

export default function CreateEventPage() {
  const { t } = useTranslation('events')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [visibility, setVisibility] = useState<VisibilityValue>('PUBLIC')
  const [locationName, setLocationName] = useState('')
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [maxParticipants, setMaxParticipants] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const { saving, error, create } = useEventForm()
  const addressSearch = useAddressSearch()

  const applySuggestion = (s: AddressSuggestion) => {
    addressSearch.select(s)
    if (s.venueName) setLocationName(s.venueName)
    setAddress(s.address)
    setLatitude(formatCoordinate(s.latitude))
    setLongitude(formatCoordinate(s.longitude))
  }
  const parsedCoords = parseCoordinates(latitude, longitude)
  const hasCoordinates = parsedCoords !== null && parsedCoords !== 'invalid'

  const handleCreate = async (publishNow: boolean) => {
    setValidationError(null)
    if (!title.trim()) return setValidationError(t('errors.titleRequired'))
    if (!category) return setValidationError(t('errors.categoryRequired'))
    if (!startsAt) return setValidationError(t('errors.startRequired'))
    if (!endsAt) return setValidationError(t('errors.endRequired'))
    if (new Date(startsAt) <= new Date(Date.now() + MIN_LEAD_TIME_MS))
      return setValidationError(t('errors.startInPast'))
    if (new Date(endsAt) <= new Date(startsAt))
      return setValidationError(t('errors.endBeforeStart'))
    if (sourceUrl.trim() && !isHttpUrl(sourceUrl.trim()))
      return setValidationError(t('errors.invalidSourceUrl'))
    if (parsedCoords === 'invalid') return setValidationError(t('errors.invalidCoordinates'))

    const data: CreateEventRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      visibility,
      locationName: locationName.trim() || undefined,
      address: address.trim() || undefined,
      latitude: parsedCoords?.latitude,
      longitude: parsedCoords?.longitude,
      startsAt: datetimeLocalToIso(startsAt),
      endsAt: datetimeLocalToIso(endsAt),
      maxParticipants: maxParticipants ? Number(maxParticipants) : undefined,
      sourceUrl: sourceUrl.trim() || undefined,
    }
    await create(data, publishNow)
  }

  const displayError = validationError ?? error

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopNavBar />
      <main className="pt-32 pb-stack-xl px-margin-mobile md:px-0">
        <EventFormPanel title={t('form.createTitle')} subtitle={t('form.subtitle')}>
          <div className="flex flex-col gap-gutter">
            <AuthInput
              id="event-title"
              label={t('form.titleLabel')}
              type="text"
              placeholder={t('form.titlePlaceholder')}
              value={title}
              onChange={setTitle}
              disabled={saving}
            />

            <div className="flex flex-col gap-stack-xs">
              <label htmlFor="event-description" className={LABEL_CLASS}>
                {t('form.descriptionLabel')}
              </label>
              <textarea
                id="event-description"
                rows={4}
                placeholder={t('form.descriptionPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={saving}
                className={[INPUT_CLASS, 'resize-none', saving ? 'opacity-50 cursor-not-allowed' : ''].join(' ')}
              />
            </div>

            <div className="flex flex-col gap-stack-xs">
              <span className={LABEL_CLASS}>{t('form.categoryLabel')}</span>
              <div className="flex flex-wrap gap-stack-sm mt-stack-xs">
                {CATEGORY_VALUES.map((cat) => (
                  <TagChip
                    key={cat}
                    label={t(CATEGORY_LABEL_KEYS[cat])}
                    active={category === cat}
                    onClick={() => setCategory(cat)}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-stack-xs">
              <span className={LABEL_CLASS}>{t('form.visibilityLabel')}</span>
              <SegmentedControl
                options={VISIBILITY_VALUES.map((v) => ({ value: v, label: t(VISIBILITY_LABEL_KEYS[v]) }))}
                value={visibility}
                onChange={(v) => setVisibility(v as VisibilityValue)}
              />
            </div>

            <AddressAutocomplete
              id="event-address-search"
              label={t('form.addressSearchLabel')}
              placeholder={t('form.addressSearchPlaceholder')}
              value={addressSearch.query}
              onChange={addressSearch.setQuery}
              suggestions={addressSearch.suggestions}
              onSelect={applySuggestion}
              loading={addressSearch.loading}
              error={addressSearch.error}
              disabled={saving}
            />

            <AuthInput id="event-location-name" label={t('form.locationNameLabel')} type="text" placeholder={t('form.locationNamePlaceholder')} value={locationName} onChange={setLocationName} disabled={saving} leftIcon="location_on" />
            <AuthInput id="event-address" label={t('form.addressLabel')} type="text" placeholder={t('form.addressPlaceholder')} value={address} onChange={setAddress} disabled={saving} />

            <div className="grid grid-cols-2 gap-gutter">
              <AuthInput id="event-latitude" label={t('form.latitudeLabel')} type="text" placeholder="-23.561496" value={latitude} onChange={setLatitude} disabled={saving} />
              <AuthInput id="event-longitude" label={t('form.longitudeLabel')} type="text" placeholder="-46.655968" value={longitude} onChange={setLongitude} disabled={saving} />
            </div>

            <p className="font-sans text-label-md text-on-surface-variant -mt-stack-sm flex items-center gap-1">
              <Icon name={hasCoordinates ? 'my_location' : 'location_off'} size={14} />
              {hasCoordinates ? t('form.coordinatesSet') : t('form.coordinatesMissing')}
            </p>

            <AuthInput id="event-source-url" label={t('form.sourceUrlLabel')} type="text" placeholder={t('form.sourceUrlPlaceholder')} value={sourceUrl} onChange={setSourceUrl} disabled={saving} leftIcon="link" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <div className="flex flex-col gap-stack-xs">
                <label htmlFor="event-starts-at" className={LABEL_CLASS}>{t('form.startsAtLabel')}</label>
                <input id="event-starts-at" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required disabled={saving} className={[INPUT_CLASS, saving ? 'opacity-50 cursor-not-allowed' : ''].join(' ')} />
              </div>
              <div className="flex flex-col gap-stack-xs">
                <label htmlFor="event-ends-at" className={LABEL_CLASS}>{t('form.endsAtLabel')}</label>
                <input id="event-ends-at" type="datetime-local" value={endsAt} min={startsAt || undefined} onChange={(e) => setEndsAt(e.target.value)} required disabled={saving} className={[INPUT_CLASS, saving ? 'opacity-50 cursor-not-allowed' : ''].join(' ')} />
              </div>
            </div>

            <AuthInput id="event-max-participants" label={t('form.maxParticipantsLabel')} type="text" placeholder={t('form.maxParticipantsPlaceholder')} value={maxParticipants} onChange={(v) => { if (v === '' || /^\d+$/.test(v)) setMaxParticipants(v) }} disabled={saving} leftIcon="group" />

            {displayError && (
              <p className="font-label-md text-label-md text-error flex items-center gap-2" role="alert">
                <Icon name="error" size={16} />
                {displayError}
              </p>
            )}

            <div className="flex flex-col gap-stack-sm mt-stack-md">
              <button type="button" onClick={() => void handleCreate(true)} disabled={saving} className={['w-full bg-primary-container text-on-primary font-bold py-stack-sm rounded-lg','mint-glow-primary hover:bg-primary-fixed transition-all active:scale-95 duration-200','uppercase tracking-widest font-label-md flex items-center justify-center gap-2', saving ? 'opacity-70 cursor-not-allowed' : ''].join(' ')}>
                {saving ? (<><Icon name="progress_activity" size={18} className="animate-spin" />{t('form.publishing')}</>) : t('form.publish')}
              </button>
              <button type="button" onClick={() => void handleCreate(false)} disabled={saving} className={['w-full bg-transparent text-on-surface font-medium py-stack-sm rounded-lg','hover:bg-white/5 transition-all duration-300 font-label-md', saving ? 'opacity-50 cursor-not-allowed' : ''].join(' ')}>
                {t('form.saveDraft')}
              </button>
            </div>

            <div className="text-center">
              <Link to="/events" className="text-outline hover:text-primary-container transition-colors font-label-md uppercase tracking-widest">
                {t('form.cancel')}
              </Link>
            </div>
          </div>
        </EventFormPanel>
      </main>
      <Footer />
    </div>
  )
}