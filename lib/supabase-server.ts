import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseCookieOptions } from '@/lib/supabase-config'

type CookieToSet = { name: string; value: string; options: CookieOptions }

// Server-side Supabase client backed by Next.js cookies.
// Use inside Server Components, Route Handlers and Server Actions.
export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: supabaseCookieOptions,
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — cookies are read-only here.
            // The middleware refreshes the session, so this can be ignored.
          }
        },
      },
    }
  )
}
