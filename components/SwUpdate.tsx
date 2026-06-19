'use client'

import { useEffect } from 'react'

// Production: keep the service worker fresh (avoids stale CSS after deploys).
// Development: unregister any SW — it breaks Next.js HMR and causes webpack errors.
export default function SwUpdate() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    if (process.env.NODE_ENV !== 'production') {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => void reg.unregister())
      })
      return
    }

    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((reg) => reg.update())
      .catch(() => {})
  }, [])

  return null
}
