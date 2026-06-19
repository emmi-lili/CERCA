import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { supabaseCookieOptions } from '@/lib/supabase-config'

type CookieToSet = { name: string; value: string; options: CookieOptions }

function applyCookies(target: NextResponse, cookiesToSet: CookieToSet[]) {
  cookiesToSet.forEach(({ name, value, options }) =>
    target.cookies.set(name, value, options)
  )
}

// Refreshes the Supabase session cookie on every request and guards the app:
// unauthenticated visitors are sent to /auth, while authenticated visitors who
// land on /auth are sent home.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  let pendingCookies: CookieToSet[] = []

  const { pathname } = request.nextUrl

  // If Supabase isn't configured yet, let the (static) login page load and send
  // everything else there too, instead of crashing on a missing client.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    if (pathname.startsWith('/auth')) return response
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    return NextResponse.redirect(url)
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: supabaseCookieOptions,
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          pendingCookies = cookiesToSet
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          applyCookies(response, cookiesToSet)
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthRoute = pathname.startsWith('/auth')

  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    const redirect = NextResponse.redirect(url)
    applyCookies(redirect, pendingCookies)
    return redirect
  }

  if (user && pathname === '/auth') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    const redirect = NextResponse.redirect(url)
    applyCookies(redirect, pendingCookies)
    return redirect
  }

  return response
}

export const config = {
  matcher: [
    // Run on everything except static assets, the service worker and images.
    '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
