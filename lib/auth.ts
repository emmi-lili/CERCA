import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase-server'

// Reads the session from cookies — no extra round trip to Supabase Auth.
// Middleware already validates the user on every navigation.
export async function getAuthUser(): Promise<User | null> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.user ?? null
}
