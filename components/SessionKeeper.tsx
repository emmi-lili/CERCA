'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

// Keeps the Supabase session alive when the app is reopened or brought back
// from the background (common on mobile / PWA).
export default function SessionKeeper() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const refresh = () => {
      void supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) router.refresh()
      })
    }

    let lastRefresh = 0
    const refreshThrottled = () => {
      const now = Date.now()
      if (now - lastRefresh < 30_000) return
      lastRefresh = now
      refresh()
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        refreshThrottled()
      }
    })

    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshThrottled()
    }

    document.addEventListener('visibilitychange', onVisible)

    return () => {
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [router])

  return null
}
