'use client'

import { createBrowserClient } from '@supabase/ssr'
import { supabaseCookieOptions } from '@/lib/supabase-config'

// Browser-side Supabase client. Safe to call from client components.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookieOptions: supabaseCookieOptions }
  )
}
