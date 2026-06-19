import type { CookieOptions } from '@supabase/ssr'

// Long-lived cookies so the session survives closing and reopening the app.
export const supabaseCookieOptions: CookieOptions = {
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 400,
}
