'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

// Keeps the Supabase session alive when the app is reopened (PWA/mobile).
// Refreshes the JWT silently; only re-fetches server data on sign-in/out.
export default function SessionKeeper() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    let lastTouch = 0
    const touchSession = () => {
      const now = Date.now()
      if (now - lastTouch < 30_000) return
      lastTouch = now
      void supabase.auth.getSession()
    }

    void supabase.auth.getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh()
      }
    })

    const onVisible = () => {
      if (document.visibilityState === 'visible') touchSession()
    }

    document.addEventListener('visibilitychange', onVisible)

    return () => {
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [router])

  return null
}
