import { useState } from 'react'
import { Link } from 'react-router-dom'
import TopNavBar from '../components/organisms/TopNavBar'
import Footer from '../components/organisms/Footer'
import EventFormPanel from '../components/molecules/EventFormPanel'
import AuthInput from '../components/atoms/AuthInput'
import TagChip from '../components/atoms/TagChip'
import SegmentedControl from '../components/atoms/SegmentedControl'
import Icon from '../components/atoms/Icon'
import { useEventForm } from '../hooks/useEventForm'
import { useAuthContext } from '../hooks/useAuthContext'
import { type CreateEventRequest } from '../types/api'
import { datetimeLocalToIso } from '../utils/date'

const MIN_LEAD_TIME_MS = 60_000

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

export default function CreateEventPage() {
  const { user } = useAuthContext()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY'>('PUBLIC')
  const [locationName, setLocationName] = useState('')
  const [address, setAddress] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [maxParticipants, setMaxParticipants] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const { saving, error, create } = useEventForm()

  const handleCreate = async (publishNow: boolean) => {
    setValidationError(null)

    if (!title.trim()) {
      setValidationError('O nome do evento é obrigatório')
      return
    }
    if (!category) {
      setValidationError('Selecione uma categoria')
      return
    }
    if (!startsAt) {
      setValidationError('A data de início é obrigatória')
      return
    }
    if (new Date(startsAt) <= new Date(Date.now() + MIN_LEAD_TIME_MS)) {
      setValidationError('A data de início deve ser pelo menos 1 minuto no futuro')
      return
    }

    const data: CreateEventRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      visibility,
      locationName: locationName.trim() || undefined,
      address: address.trim() || undefined,
      startsAt: datetimeLocalToIso(startsAt),
      endsAt: endsAt ? datetimeLocalToIso(endsAt) : undefined,
      maxParticipants: maxParticipants ? Number(maxParticipants) : undefined,
    }

    await create(data, publishNow)
  }

  const displayError = validationError ?? error

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopNavBar authenticated userName={user?.username ?? ''} />

      <main className="pt-32 pb-stack-xl px-margin-mobile md:px-0">
        <EventFormPanel
          title="Crie seu próximo evento"
          subtitle="Preencha os detalhes para iluminar a noite."
        >
          <div className="flex flex-col gap-gutter">

            {/* Title */}
            <AuthInput
              id="event-title"
              label="Nome do Evento"
              type="text"
              placeholder="Ex: Neon Pulse Warehouse"
              value={title}
              onChange={setTitle}
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                    active={category === cat}
                    onClick={() => setCategory(cat)}
                  />
                ))}
              </div>
            </div>

            {/* Visibility */}
            <div className="flex flex-col gap-stack-xs">
              <span className={LABEL_CLASS}>Visibilidade</span>
              <SegmentedControl
                options={VISIBILITY_OPTIONS}
                value={visibility}
                onChange={(v) => setVisibility(v as 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY')}
              />
            </div>

            {/* Location */}
            <AuthInput
              id="event-location-name"
              label="Local"
              type="text"
              placeholder="Nome do local (ex: The Grid Factory)"
              value={locationName}
              onChange={setLocationName}
              disabled={saving}
              leftIcon="location_on"
            />

            <AuthInput
              id="event-address"
              label="Endereço"
              type="text"
              placeholder="Rua, número, bairro"
              value={address}
              onChange={setAddress}
              disabled={saving}
            />

            {/* Date / Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <div className="flex flex-col gap-stack-xs">
                <label htmlFor="event-starts-at" className={LABEL_CLASS}>Início</label>
                <input
                  id="event-starts-at"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
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
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
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
              value={maxParticipants}
              onChange={(v) => {
                if (v === '' || /^\d+$/.test(v)) setMaxParticipants(v)
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

            {/* Actions */}
            <div className="flex flex-col gap-stack-sm mt-stack-md">
              <button
                type="button"
                onClick={() => void handleCreate(true)}
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
                    Publicando...
                  </>
                ) : 'Publicar Evento'}
              </button>

              <button
                type="button"
                onClick={() => void handleCreate(false)}
                disabled={saving}
                className={[
                  'w-full bg-transparent text-on-surface font-medium py-stack-sm rounded-lg',
                  'hover:bg-white/5 transition-all duration-300 font-label-md',
                  saving ? 'opacity-50 cursor-not-allowed' : '',
                ].join(' ')}
              >
                Salvar como rascunho
              </button>
            </div>

            {/* Cancel */}
            <div className="text-center">
              <Link
                to="/events"
                className="text-outline hover:text-primary-container transition-colors font-label-md uppercase tracking-widest"
              >
                Cancelar
              </Link>
            </div>

          </div>
        </EventFormPanel>
      </main>

      <Footer />
    </div>
  )
}
