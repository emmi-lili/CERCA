'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bell, BellRing } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { urlBase64ToUint8Array } from '@/lib/utils'

type Props = { currentUserId: string }

// Registers the service worker and lets the user opt in to Web Push. The push
// subscription is stored in push_subscriptions so the edge function can target
// the other partner's device.
export default function NotificationSetup({ currentUserId }: Props) {
  const supabase = useMemo(() => createClient(), [])
  const [supported, setSupported] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window)
    ) {
      return
    }
    setSupported(true)

    // Register the SW and reflect any existing subscription state.
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setEnabled(Boolean(sub) && Notification.permission === 'granted'))
      .catch(() => {})
  }, [])

  const enable = async () => {
    if (busy) return
    setBusy(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setBusy(false)
        return
      }

      const reg = await navigator.serviceWorker.ready
      const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapid) {
        console.warn('Falta NEXT_PUBLIC_VAPID_PUBLIC_KEY')
        setBusy(false)
        return
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      })

      const json = sub.toJSON()
      await supabase.from('push_subscriptions').upsert(
        {
          user_id: currentUserId,
          endpoint: json.endpoint,
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
        },
        { onConflict: 'endpoint' }
      )

      setEnabled(true)
    } catch (e) {
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  if (!supported) return null

  return (
    <button
      onClick={enable}
      disabled={enabled || busy}
      className="glass flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium disabled:opacity-70"
      style={{ color: '#5a47b0' }}
    >
      {enabled ? <BellRing size={18} /> : <Bell size={18} />}
      {enabled
        ? 'Notificaciones activadas'
        : busy
          ? 'Activando…'
          : 'Activar notificaciones'}
    </button>
  )
}
