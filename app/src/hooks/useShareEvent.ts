import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '../lib/i18n'
import { track, type ShareSurface } from '../lib/analytics'

export type ShareChannel = 'copy' | 'native' | 'whatsapp' | 'twitter' | 'qr'

export interface ShareEventState {
  /**
   * URL canônica com `ref=share` e `hl=<lang>` — o middleware da Vercel usa
   * `hl` para saber em que idioma renderizar OG/SEO, porque WhatsApp/Telegram
   * não enviam `Accept-Language`. O SPA ignora `hl` e usa localStorage/navigator.
   */
  shareUrl: string
  copied: boolean
  canNativeShare: boolean
  whatsappHref: string
  twitterHref: string
  copyLink: (surface: ShareSurface) => Promise<void>
  nativeShare: (surface: ShareSurface) => Promise<void>
  trackExternal: (channel: 'whatsapp' | 'twitter', surface: ShareSurface) => void
}

interface ShareableEvent {
  id: string
  title: string
}

const COPIED_FEEDBACK_MS = 2000

/**
 * Builds the canonical share URL.
 *
 * Standalone (não-hook) porque também é usado fora do ciclo do React — ex.: o
 * QR code em `EventDetail` chama `buildShareUrl(event.id, 'qr')` num render.
 * Lê `i18n` global para refletir o idioma atual no momento da chamada.
 */
export function buildShareUrl(eventId: string, channel: ShareChannel): string {
  const url = new URL(`/events/${eventId}`, window.location.origin)
  const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en'
  url.searchParams.set('hl', lang)
  url.searchParams.set('ref', 'share')
  url.searchParams.set('via', channel)
  return url.toString()
}

export function useShareEvent(event: ShareableEvent | null): ShareEventState {
  // Hook reativo a mudanças de idioma:
  //   - `useTranslation` força re-render quando o usuário troca o idioma em Settings,
  //     o que recomputa `whatsappHref` / `twitterHref` / `shareUrl` abaixo com `?hl` atualizado.
  //   - `t('share.messageShort', ...)` traduz o texto pré-preenchido no share sheet.
  const { t } = useTranslation('events')

  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  const eventId = event?.id ?? ''
  const title = event?.title ?? ''
  const message = t('share.messageShort', { title })

  const whatsappHref = eventId
    ? `https://wa.me/?text=${encodeURIComponent(`${message} ${buildShareUrl(eventId, 'whatsapp')}`)}`
    : ''
  const twitterHref = eventId
    ? `https://twitter.com/intent/tweet?${new URLSearchParams({
        text: message,
        url: buildShareUrl(eventId, 'twitter'),
      }).toString()}`
    : ''

  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const copyLink = async (surface: ShareSurface): Promise<void> => {
    if (!eventId) return
    await navigator.clipboard.writeText(buildShareUrl(eventId, 'copy'))
    track('share_link_copied', { event_id: eventId, surface })
    setCopied(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS)
  }

  const nativeShare = async (surface: ShareSurface): Promise<void> => {
    if (!eventId || !canNativeShare) return
    try {
      await navigator.share({ title, text: message, url: buildShareUrl(eventId, 'native') })
      track('share_native_clicked', { event_id: eventId, surface })
    } catch {
      // Usuário cancelou o share sheet — não é erro
    }
  }

  const trackExternal = (channel: 'whatsapp' | 'twitter', surface: ShareSurface): void => {
    track(channel === 'whatsapp' ? 'share_whatsapp_clicked' : 'share_twitter_clicked', {
      event_id: eventId,
      surface,
    })
  }

  return {
    shareUrl: eventId ? buildShareUrl(eventId, 'copy') : '',
    copied,
    canNativeShare,
    whatsappHref,
    twitterHref,
    copyLink,
    nativeShare,
    trackExternal,
  }
}