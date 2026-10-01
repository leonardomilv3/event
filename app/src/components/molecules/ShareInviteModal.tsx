import { useEffect } from 'react'
import GlassPanel from './GlassPanel'
import Icon from '../atoms/Icon'

interface ShareInviteModalProps {
  eventTitle: string
  shareUrl: string
  copied: boolean
  canNativeShare: boolean
  whatsappHref: string
  twitterHref: string
  onCopy: () => void
  onNativeShare: () => void
  onWhatsApp: () => void
  onTwitter: () => void
  onClose: () => void
}

const channelClass = [
  'flex-1 flex items-center justify-center gap-2 p-stack-sm rounded-lg',
  'bg-surface-variant text-on-surface hover:bg-white/10 transition-all',
  'font-label-md text-label-md',
].join(' ')

export default function ShareInviteModal({
  eventTitle,
  shareUrl,
  copied,
  canNativeShare,
  whatsappHref,
  twitterHref,
  onCopy,
  onNativeShare,
  onWhatsApp,
  onTwitter,
  onClose,
}: ShareInviteModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-stack-md">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <GlassPanel
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-invite-title"
        className="relative w-full max-w-md rounded-xl overflow-hidden shadow-2xl"
      >
        <div className="flex justify-between items-start gap-stack-md px-gutter py-stack-md border-b border-white/5">
          <div className="flex items-center gap-stack-sm">
            <Icon name="check_circle" fill={1} className="text-primary-container" size={28} />
            <h2 id="share-invite-title" className="font-serif text-headline-md text-on-surface">
              Presença confirmada!
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            aria-label="Fechar"
          >
            <Icon name="close" size={20} className="text-on-surface-variant" />
          </button>
        </div>

        <div className="flex flex-col gap-stack-md px-gutter py-stack-lg">
          <p className="font-sans text-body-md text-on-surface-variant">
            Convide seus amigos para <span className="text-on-surface font-semibold">{eventTitle}</span> —
            evento bom é evento cheio.
          </p>

          <div className="flex items-center gap-stack-sm p-1 pl-stack-md rounded-lg bg-surface-container border border-outline-variant/50">
            <span className="flex-1 truncate font-sans text-label-md text-on-surface-variant" title={shareUrl}>
              {shareUrl}
            </span>
            <button
              type="button"
              onClick={onCopy}
              className="flex items-center gap-2 px-stack-md py-2 rounded-md bg-primary-container text-on-primary-fixed font-label-md text-label-md shadow-mint-glow active:scale-95 transition-all"
            >
              <Icon name={copied ? 'check' : 'content_copy'} size={18} />
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-stack-sm">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={onWhatsApp} className={channelClass}>
              <Icon name="chat" size={18} />
              WhatsApp
            </a>
            <a href={twitterHref} target="_blank" rel="noopener noreferrer" onClick={onTwitter} className={channelClass}>
              <Icon name="tag" size={18} />
              X / Twitter
            </a>
            {canNativeShare && (
              <button type="button" onClick={onNativeShare} className={channelClass}>
                <Icon name="ios_share" size={18} />
                Mais
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="self-center font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Agora não
          </button>
        </div>
      </GlassPanel>
    </div>
  )
}
