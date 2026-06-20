import { useState, useReducer, useEffect } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import TopNavBar from '../components/organisms/TopNavBar'
import Footer from '../components/organisms/Footer'
import EventFormPanel from '../components/molecules/EventFormPanel'
import AuthInput from '../components/atoms/AuthInput'
import TagChip from '../components/atoms/TagChip'
import SegmentedControl from '../components/atoms/SegmentedControl'
import Icon from '../components/atoms/Icon'
import { useEventForm } from '../hooks/useEventForm'
import { useAuthContext } from '../hooks/useAuthContext'
import { getById } from '../services/eventService'
import { type EventResponse, type UpdateEventRequest } from '../types/api'

const CATEGORIES = ['MUSIC', 'ART', 'FOOD', 'SPORTS', 'NETWORKING', 'NIGHTLIFE']

const VISIBILITY_OPTIONS = [
  { label: 'PUBLIC', value: 'PUBLIC' },
  { label: 'PRIVATE', value: 'PRIVATE' },
  { label: 'INVITE_ONLY', value: 'INVITE_ONLY' },
]

const INPUT_CLASS = [
  'w-full bg-surface-container-lowest border border-outline-variant rounded-lg',
  'p-stack-sm text-on-surface text-body-md placeholder:text-on-surface-variant/30',
  'focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30',
  'transition-all duration-300',
].join(' ')

const LABEL_CLASS = 'font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider'

const STATUS_STYLES: Record<EventResponse['status'], string> = {
  DRAFT: 'border-outline-variant text-on-surface-variant',
  PUBLISHED: 'border-primary-container text-primary-container',
  CANCELLED: 'border-error text-error',
  FINISHED: 'border-outline text-outline',
}

interface FormState {
  title: string
  description: string
  category: string
  visibility: string
  locationName: string
  address: string
  startsAt: string
  endsAt: string
  maxParticipants: string
}

type FormAction =
  | { type: 'init'; payload: FormState }
  | { type: 'set'; field: keyof FormState; value: string }

function formReducer(state: FormState, action: FormAction): FormState {
  if (action.type === 'init') return action.payload
  return { ...state, [action.field]: action.value }
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  category: '',
  visibility: 'PUBLIC',
  locationName: '',
  address: '',
  startsAt: '',
  endsAt: '',
  maxParticipants: '',
}

export default function EditEventPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { user } = useAuthContext()

  const [event, setEvent] = useState<EventResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [form, formDispatch] = useReducer(formReducer, EMPTY_FORM)
  const [formInitialized, setFormInitialized] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [confirmingCancel, setConfirmingCancel] = useState(false)

  const { saving, deleting, error, update, cancelEvent } = useEventForm()

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
          .then((evt) => {
            if (!cancelled) setEvent(evt)
          })
          .catch(() => {
            if (!cancelled) setFetchError('Evento não encontrado.')
          })
          .finally(() => {
            if (!cancelled) setLoading(false)
          })
      })
    return () => { cancelled = true }
  }, [id])

  // Initialize form once when event first loads — same pattern as UserDashboard.
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
        startsAt: event.startsAt.slice(0, 16),
        endsAt: event.endsAt ? event.endsAt.slice(0, 16) : '',
        maxParticipants: event.maxParticipants != null ? String(event.maxParticipants) : '',
      },
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col">
        <TopNavBar authenticated userName={user?.username ?? ''} />
        <div className="flex-1 flex items-center justify-center">
          <Icon name="progress_activity" size={32} className="animate-spin text-primary-container" />
        </div>
      </div>
    )
  }

  if (fetchError || !event) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col">
        <TopNavBar authenticated userName={user?.username ?? ''} />
        <div className="flex-1 flex items-center justify-center">
          <p className="font-label-md text-label-md text-error flex items-center gap-2">
            <Icon name="error" size={18} />
            {fetchError ?? 'Evento não encontrado.'}
          </p>
        </div>
      </div>
    )
  }

  if (user !== null && event.creatorId !== user.id) {
    return <Navigate to={`/events/${id}`} replace />
  }

  const handleSave = async () => {
    setValidationError(null)

    if (!form.title.trim()) {
      setValidationError('O nome do evento é obrigatório')
      return
    }
    if (!form.category) {
      setValidationError('Selecione uma categoria')
      return
    }
    if (!form.startsAt) {
      setValidationError('A data de início é obrigatória')
      return
    }

    const data: UpdateEventRequest = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      category: form.category,
      visibility: form.visibility as 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY',
      locationName: form.locationName.trim() || undefined,
      address: form.address.trim() || undefined,
      startsAt: form.startsAt,
      endsAt: form.endsAt || undefined,
      maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : undefined,
    }

    await update(id, data)
  }

  const handleCancelEvent = async () => {
    await cancelEvent(id)
  }

  const displayError = validationError ?? error

  const statusBadge = (
    <span
      className={[
        'inline-block px-3 py-1 border rounded-full font-label-caps text-label-caps uppercase tracking-widest',
        STATUS_STYLES[event.status],
      ].join(' ')}
    >
      {event.status}
    </span>
  )

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopNavBar authenticated userName={user?.username ?? ''} />

      <main className="pt-32 pb-stack-xl px-margin-mobile md:px-0">
        <EventFormPanel
          title="Editar Evento"
          subtitle="Preencha os detalhes para iluminar a noite."
          statusBadge={statusBadge}
        >
          <div className="flex flex-col gap-gutter">

            {/* Title */}
            <AuthInput
              id="event-title"
              label="Nome do Evento"
              type="text"
              placeholder="Ex: Neon Pulse Warehouse"
              value={form.title}
              onChange={(v) => formDispatch({ type: 'set', field: 'title', value: v })}
              disabled={saving}
            />

            {/* Description */}
            <div className="flex flex-col gap-stack-xs">
              <label htmlFor="event-description" className={LABEL_CLASS}>
                A Narrativa
              </label>
              <textarea
                id="event-description"
                rows={4}
                placeholder="Descreva a atmosfera e o propósito..."
                value={form.description}
                onChange={(e) => formDispatch({ type: 'set', field: 'description', value: e.target.value })}
                disabled={saving}
                className={[
                  INPUT_CLASS,
                  'resize-none',
                  saving ? 'opacity-50 cursor-not-allowed' : '',
                ].join(' ')}
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-stack-xs">
              <span className={LABEL_CLASS}>Categoria</span>
              <div className="flex flex-wrap gap-stack-sm mt-stack-xs">
                {CATEGORIES.map((cat) => (
                  <TagChip
                    key={cat}
                    label={cat}
                    active={form.category === cat}
                    onClick={() => formDispatch({ type: 'set', field: 'category', value: cat })}
                  />
                ))}
              </div>
            </div>

            {/* Visibility */}
            <div className="flex flex-col gap-stack-xs">
              <span className={LABEL_CLASS}>Visibilidade</span>
              <SegmentedControl
                options={VISIBILITY_OPTIONS}
                value={form.visibility}
                onChange={(v) => formDispatch({ type: 'set', field: 'visibility', value: v })}
              />
            </div>

            {/* Location */}
            <AuthInput
              id="event-location-name"
              label="Local"
              type="text"
              placeholder="Nome do local (ex: The Grid Factory)"
              value={form.locationName}
              onChange={(v) => formDispatch({ type: 'set', field: 'locationName', value: v })}
              disabled={saving}
              leftIcon="location_on"
            />

            <AuthInput
              id="event-address"
              label="Endereço"
              type="text"
              placeholder="Rua, número, bairro"
              value={form.address}
              onChange={(v) => formDispatch({ type: 'set', field: 'address', value: v })}
              disabled={saving}
            />

            {/* Date / Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <div className="flex flex-col gap-stack-xs">
                <label htmlFor="event-starts-at" className={LABEL_CLASS}>Início</label>
                <input
                  id="event-starts-at"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => formDispatch({ type: 'set', field: 'startsAt', value: e.target.value })}
                  disabled={saving}
                  className={[
                    INPUT_CLASS,
                    saving ? 'opacity-50 cursor-not-allowed' : '',
                  ].join(' ')}
                />
              </div>
              <div className="flex flex-col gap-stack-xs">
                <label htmlFor="event-ends-at" className={LABEL_CLASS}>Fim (Opcional)</label>
                <input
                  id="event-ends-at"
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => formDispatch({ type: 'set', field: 'endsAt', value: e.target.value })}
                  disabled={saving}
                  className={[
                    INPUT_CLASS,
                    saving ? 'opacity-50 cursor-not-allowed' : '',
                  ].join(' ')}
                />
              </div>
            </div>

            {/* Max participants */}
            <AuthInput
              id="event-max-participants"
              label="Limite de Presença"
              type="text"
              placeholder="Sem limite"
              value={form.maxParticipants}
              onChange={(v) => {
                if (v === '' || /^\d+$/.test(v)) {
                  formDispatch({ type: 'set', field: 'maxParticipants', value: v })
                }
              }}
              disabled={saving}
              leftIcon="group"
            />

            {/* Error */}
            {displayError && (
              <p className="font-label-md text-label-md text-error flex items-center gap-2" role="alert">
                <Icon name="error" size={16} />
                {displayError}
              </p>
            )}

            {/* Save */}
            <div className="mt-stack-md">
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className={[
                  'w-full bg-primary-container text-on-primary font-bold py-stack-sm rounded-lg',
                  'mint-glow-primary hover:bg-primary-fixed transition-all active:scale-95 duration-200',
                  'uppercase tracking-widest font-label-md flex items-center justify-center gap-2',
                  saving ? 'opacity-70 cursor-not-allowed' : '',
                ].join(' ')}
              >
                {saving ? (
                  <>
                    <Icon name="progress_activity" size={18} className="animate-spin" />
                    Salvando...
                  </>
                ) : 'Salvar Alterações'}
              </button>
            </div>

            {/* Danger Zone */}
            <div className="mt-stack-lg pt-stack-md border-t border-error/20 flex flex-col gap-stack-sm">
              <p className="font-body-md text-body-md text-error/70">
                Cancelar este evento irá notificar todos os participantes confirmados. Esta ação não pode ser desfeita.
              </p>
              {!confirmingCancel ? (
                <button
                  type="button"
                  onClick={() => setConfirmingCancel(true)}
                  className="w-full border border-error text-error font-medium py-stack-sm rounded-lg hover:bg-error/5 transition-all duration-300 font-label-md uppercase tracking-widest"
                >
                  Cancelar Evento
                </button>
              ) : (
                <div className="flex gap-stack-sm">
                  <button
                    type="button"
                    onClick={() => setConfirmingCancel(false)}
                    disabled={deleting}
                    className="flex-1 border border-outline-variant text-on-surface-variant font-medium py-stack-sm rounded-lg hover:bg-white/5 transition-all duration-300 font-label-md"
                  >
                    Manter Evento
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCancelEvent()}
                    disabled={deleting}
                    className={[
                      'flex-1 bg-error text-on-error font-bold py-stack-sm rounded-lg',
                      'transition-all active:scale-95 font-label-md flex items-center justify-center gap-2',
                      deleting ? 'opacity-70 cursor-not-allowed' : '',
                    ].join(' ')}
                  >
                    {deleting ? (
                      <>
                        <Icon name="progress_activity" size={16} className="animate-spin" />
                        Cancelando...
                      </>
                    ) : 'Sim, cancelar'}
                  </button>
                </div>
              )}
            </div>

            {/* Back link */}
            <div className="text-center">
              <Link
                to={`/events/${id}`}
                className="text-outline hover:text-primary-container transition-colors font-label-md uppercase tracking-widest"
              >
                Voltar ao Evento
              </Link>
            </div>

          </div>
        </EventFormPanel>
      </main>

      <Footer />
    </div>
  )
}
