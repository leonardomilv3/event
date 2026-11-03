import { useState, useReducer, useEffect } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
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
import { useAuthContext } from '../hooks/useAuthContext'
import { getById } from '../services/eventService'
import { type EventResponse, type UpdateEventRequest } from '../types/api'
import { apiDateToDatetimeLocal, datetimeLocalToIso } from '../utils/date'
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

const STATUS_KEYS = {
  DRAFT: 'detail.status.draft',
  PUBLISHED: 'detail.status.published',
  CANCELLED: 'detail.status.cancelled',
  FINISHED: 'detail.status.finished',
} as const satisfies Record<EventResponse['status'], string>

const STATUS_STYLES: Record<EventResponse['status'], string> = {
  DRAFT: 'border-outline-variant text-on-surface-variant',
  PUBLISHED: 'border-primary-container text-primary-container',
  CANCELLED: 'border-error text-error',
  FINISHED: 'border-outline text-outline',
}

const INPUT_CLASS = [
  'w-full bg-surface-container-lowest border border-outline-variant rounded-lg',
  'p-stack-sm text-on-surface text-body-md placeholder:text-on-surface-variant/30',
  'focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30',
  'transition-all duration-300',
].join(' ')

const LABEL_CLASS = 'font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider'

interface FormState {
  title: string
  description: string
  category: string
  visibility: string
  locationName: string
  address: string
  latitude: string
  longitude: string
  startsAt: string
  endsAt: string
  maxParticipants: string
  sourceUrl: string
}

type FormAction =
  | { type: 'init'; payload: FormState }
  | { type: 'set'; field: keyof FormState; value: string }

function formReducer(state: FormState, action: FormAction): FormState {
  if (action.type === 'init') return action.payload
  return { ...state, [action.field]: action.value }
}

const EMPTY_FORM: FormState = {
  title: '', description: '', category: '', visibility: 'PUBLIC',
  locationName: '', address: '', latitude: '', longitude: '',
  startsAt: '', endsAt: '', maxParticipants: '', sourceUrl: '',
}

export default function EditEventPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { user } = useAuthContext()
  const { t } = useTranslation('events')

  const [event, setEvent] = useState<EventResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [form, formDispatch] = useReducer(formReducer, EMPTY_FORM)
  const [formInitialized, setFormInitialized] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [confirmingCancel, setConfirmingCancel] = useState(false)

  const { saving, deleting, error, update, cancelEvent } = useEventForm()
  const addressSearch = useAddressSearch()

  useEffect(() => {
    if (!id) return
    let cancelled = false
    void Promise.resolve()
      .then(() => {
        if (cancelled) return
        setEvent(null)
        setFetchError(null)
        setLoading(true)
        return getById(id)
          .then((evt) => { if (!cancelled) setEvent(evt) })
          .catch(() => { if (!cancelled) setFetchError(t('errors.notFound')) })
          .finally(() => { if (!cancelled) setLoading(false) })
      })
    return () => { cancelled = true }
  }, [id, t])

  if (event && !formInitialized) {
    setFormInitialized(true)
    formDispatch({
      type: 'init',
      payload: {
        title: event.title,
        description: event.description ?? '',
        category: event.category,
        visibility: event.visibility,
        locationName: event.locationName ?? '',
        address: event.address ?? '',
        latitude: event.latitude != null ? formatCoordinate(event.latitude) : '',
        longitude: event.longitude != null ? formatCoordinate(event.longitude) : '',
        startsAt: apiDateToDatetimeLocal(event.startsAt),
        endsAt: event.endsAt ? apiDateToDatetimeLocal(event.endsAt) : '',
        maxParticipants: event.maxParticipants != null ? String(event.maxParticipants) : '',
        sourceUrl: event.sourceUrl ?? '',
      },
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col">
        <TopNavBar />
        <div className="flex-1 flex items-center justify-center">
          <Icon name="progress_activity" size={32} className="animate-spin text-primary-container" />
        </div>
      </div>
    )
  }

  if (fetchError || !event) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col">
        <TopNavBar />
        <div className="flex-1 flex items-center justify-center">
          <p className="font-label-md text-label-md text-error flex items-center gap-2">
            <Icon name="error" size={18} />
            {fetchError ?? t('errors.notFound')}
          </p>
        </div>
      </div>
    )
  }

  if (user !== null && event.creatorId !== user.id) {
    return <Navigate to={`/events/${id}`} replace />
  }

  const applySuggestion = (s: AddressSuggestion) => {
    addressSearch.select(s)
    if (s.venueName) formDispatch({ type: 'set', field: 'locationName', value: s.venueName })
    formDispatch({ type: 'set', field: 'address', value: s.address })
    formDispatch({ type: 'set', field: 'latitude', value: formatCoordinate(s.latitude) })
    formDispatch({ type: 'set', field: 'longitude', value: formatCoordinate(s.longitude) })
  }
  const parsedCoords = parseCoordinates(form.latitude, form.longitude)
  const hasCoordinates = parsedCoords !== null && parsedCoords !== 'invalid'

  const handleSave = async () => {
    setValidationError(null)
    if (!form.title.trim()) return setValidationError(t('errors.titleRequired'))
    if (!form.category) return setValidationError(t('errors.categoryRequired'))
    if (!form.startsAt) return setValidationError(t('errors.startRequired'))
    if (!form.endsAt) return setValidationError(t('errors.endRequired'))
    if (new Date(form.startsAt) <= new Date(Date.now() + MIN_LEAD_TIME_MS))
      return setValidationError(t('errors.startInPast'))
    if (new Date(form.endsAt) <= new Date(form.startsAt))
      return setValidationError(t('errors.endBeforeStart'))
    if (form.sourceUrl.trim() && !isHttpUrl(form.sourceUrl.trim()))
      return setValidationError(t('errors.invalidSourceUrl'))
    if (parsedCoords === 'invalid') return setValidationError(t('errors.invalidCoordinates'))

    const data: UpdateEventRequest = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      category: form.category,
      visibility: form.visibility as VisibilityValue,
      locationName: form.locationName.trim() || undefined,
      address: form.address.trim() || undefined,
      latitude: parsedCoords?.latitude,
      longitude: parsedCoords?.longitude,
      startsAt: datetimeLocalToIso(form.startsAt),
      endsAt: datetimeLocalToIso(form.endsAt),
      maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : undefined,
      sourceUrl: form.sourceUrl.trim(),
    }
    await update(id, data)
  }

  const handleCancelEvent = async () => { await cancelEvent(id) }

  const displayError = validationError ?? error

  const statusBadge = (
    <span className={['inline-block px-3 py-1 border rounded-full font-label-caps text-label-caps uppercase tracking-widest', STATUS_STYLES[event.status]].join(' ')}>
      {t(STATUS_KEYS[event.status])}
    </span>
  )

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopNavBar />
      <main className="pt-32 pb-stack-xl px-margin-mobile md:px-0">
        <EventFormPanel title={t('form.editTitle')} subtitle={t('form.subtitle')} statusBadge={statusBadge}>
          <div className="flex flex-col gap-gutter">
            <AuthInput id="event-title" label={t('form.titleLabel')} type="text" placeholder={t('form.titlePlaceholder')} value={form.title} onChange={(v) => formDispatch({ type: 'set', field: 'title', value: v })} disabled={saving} />

            <div className="flex flex-col gap-stack-xs">
              <label htmlFor="event-description" className={LABEL_CLASS}>{t('form.descriptionLabel')}</label>
              <textarea id="event-description" rows={4} placeholder={t('form.descriptionPlaceholder')} value={form.description} onChange={(e) => formDispatch({ type: 'set', field: 'description', value: e.target.value })} disabled={saving} className={[INPUT_CLASS, 'resize-none', saving ? 'opacity-50 cursor-not-allowed' : ''].join(' ')} />
            </div>

            <div className="flex flex-col gap-stack-xs">
              <span className={LABEL_CLASS}>{t('form.categoryLabel')}</span>
              <div className="flex flex-wrap gap-stack-sm mt-stack-xs">
                {CATEGORY_VALUES.map((cat) => (
                  <TagChip key={cat} label={t(CATEGORY_LABEL_KEYS[cat])} active={form.category === cat} onClick={() => formDispatch({ type: 'set', field: 'category', value: cat })} />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-stack-xs">
              <span className={LABEL_CLASS}>{t('form.visibilityLabel')}</span>
              <SegmentedControl options={VISIBILITY_VALUES.map((v) => ({ value: v, label: t(VISIBILITY_LABEL_KEYS[v]) }))} value={form.visibility} onChange={(v) => formDispatch({ type: 'set', field: 'visibility', value: v })} />
            </div>

            <AddressAutocomplete id="event-address-search" label={t('form.addressSearchLabel')} placeholder={t('form.addressSearchPlaceholder')} value={addressSearch.query} onChange={addressSearch.setQuery} suggestions={addressSearch.suggestions} onSelect={applySuggestion} loading={addressSearch.loading} error={addressSearch.error} disabled={saving} />

            <AuthInput id="event-location-name" label={t('form.locationNameLabel')} type="text" placeholder={t('form.locationNamePlaceholder')} value={form.locationName} onChange={(v) => formDispatch({ type: 'set', field: 'locationName', value: v })} disabled={saving} leftIcon="location_on" />
            <AuthInput id="event-address" label={t('form.addressLabel')} type="text" placeholder={t('form.addressPlaceholder')} value={form.address} onChange={(v) => formDispatch({ type: 'set', field: 'address', value: v })} disabled={saving} />

            <div className="grid grid-cols-2 gap-gutter">
              <AuthInput id="event-latitude" label={t('form.latitudeLabel')} type="text" placeholder="-23.561496" value={form.latitude} onChange={(v) => formDispatch({ type: 'set', field: 'latitude', value: v })} disabled={saving} />
              <AuthInput id="event-longitude" label={t('form.longitudeLabel')} type="text" placeholder="-46.655968" value={form.longitude} onChange={(v) => formDispatch({ type: 'set', field: 'longitude', value: v })} disabled={saving} />
            </div>

            <p className="font-sans text-label-md text-on-surface-variant -mt-stack-sm flex items-center gap-1">
              <Icon name={hasCoordinates ? 'my_location' : 'location_off'} size={14} />
              {hasCoordinates ? t('form.coordinatesSet') : t('form.coordinatesMissing')}
            </p>

            <AuthInput id="event-source-url" label={t('form.sourceUrlLabel')} type="text" placeholder={t('form.sourceUrlPlaceholder')} value={form.sourceUrl} onChange={(v) => formDispatch({ type: 'set', field: 'sourceUrl', value: v })} disabled={saving} leftIcon="link" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <div className="flex flex-col gap-stack-xs">
                <label htmlFor="event-starts-at" className={LABEL_CLASS}>{t('form.startsAtLabel')}</label>
                <input id="event-starts-at" type="datetime-local" value={form.startsAt} onChange={(e) => formDispatch({ type: 'set', field: 'startsAt', value: e.target.value })} required disabled={saving} className={[INPUT_CLASS, saving ? 'opacity-50 cursor-not-allowed' : ''].join(' ')} />
              </div>
              <div className="flex flex-col gap-stack-xs">
                <label htmlFor="event-ends-at" className={LABEL_CLASS}>{t('form.endsAtLabel')}</label>
                <input id="event-ends-at" type="datetime-local" value={form.endsAt} min={form.startsAt || undefined} onChange={(e) => formDispatch({ type: 'set', field: 'endsAt', value: e.target.value })} required disabled={saving} className={[INPUT_CLASS, saving ? 'opacity-50 cursor-not-allowed' : ''].join(' ')} />
              </div>
            </div>

            <AuthInput id="event-max-participants" label={t('form.maxParticipantsLabel')} type="text" placeholder={t('form.maxParticipantsPlaceholder')} value={form.maxParticipants} onChange={(v) => { if (v === '' || /^\d+$/.test(v)) formDispatch({ type: 'set', field: 'maxParticipants', value: v }) }} disabled={saving} leftIcon="group" />

            {displayError && (
              <p className="font-label-md text-label-md text-error flex items-center gap-2" role="alert">
                <Icon name="error" size={16} />
                {displayError}
              </p>
            )}

            <div className="mt-stack-md">
              <button type="button" onClick={() => void handleSave()} disabled={saving} className={['w-full bg-primary-container text-on-primary font-bold py-stack-sm rounded-lg','mint-glow-primary hover:bg-primary-fixed transition-all active:scale-95 duration-200','uppercase tracking-widest font-label-md flex items-center justify-center gap-2', saving ? 'opacity-70 cursor-not-allowed' : ''].join(' ')}>
                {saving ? (<><Icon name="progress_activity" size={18} className="animate-spin" />{t('form.saving')}</>) : t('form.save')}
              </button>
            </div>

            <div className="mt-stack-lg pt-stack-md border-t border-error/20 flex flex-col gap-stack-sm">
              <p className="font-body-md text-body-md text-error/70">{t('form.dangerZone.warning')}</p>
              {!confirmingCancel ? (
                <button type="button" onClick={() => setConfirmingCancel(true)} className="w-full border border-error text-error font-medium py-stack-sm rounded-lg hover:bg-error/5 transition-all duration-300 font-label-md uppercase tracking-widest">
                  {t('form.dangerZone.cancel')}
                </button>
              ) : (
                <div className="flex gap-stack-sm">
                  <button type="button" onClick={() => setConfirmingCancel(false)} disabled={deleting} className="flex-1 border border-outline-variant text-on-surface-variant font-medium py-stack-sm rounded-lg hover:bg-white/5 transition-all duration-300 font-label-md">
                    {t('form.dangerZone.keep')}
                  </button>
                  <button type="button" onClick={() => void handleCancelEvent()} disabled={deleting} className={['flex-1 bg-error text-on-error font-bold py-stack-sm rounded-lg','transition-all active:scale-95 font-label-md flex items-center justify-center gap-2', deleting ? 'opacity-70 cursor-not-allowed' : ''].join(' ')}>
                    {deleting ? (<><Icon name="progress_activity" size={16} className="animate-spin" />{t('form.dangerZone.cancelling')}</>) : t('form.dangerZone.confirm')}
                  </button>
                </div>
              )}
            </div>

            <div className="text-center">
              <Link to={`/events/${id}`} className="text-outline hover:text-primary-container transition-colors font-label-md uppercase tracking-widest">
                {t('form.backToEvent')}
              </Link>
            </div>
          </div>
        </EventFormPanel>
      </main>
      <Footer />
    </div>
  )
}