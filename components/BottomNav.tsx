'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Gamepad2, User, CalendarHeart } from 'lucide-react'

const TABS = [
  { href: '/', label: 'Inicio', Icon: Home },
  { href: '/diario', label: 'Diario', Icon: BookOpen },
  { href: '/juegos', label: 'Juegos', Icon: Gamepad2 },
  { href: '/calendario', label: 'Cal.', Icon: CalendarHeart },
  { href: '/perfil', label: 'Perfil', Icon: User },
] as const

export default function BottomNav() {
  const pathname = usePathname()

  // Never show the nav on the auth flow.
  if (pathname.startsWith('/auth')) return null

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-20 w-full max-w-[390px] -translate-x-1/2"
      style={{
        background: 'rgba(255,255,255,0.65)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderTop: '0.5px solid rgba(180,160,240,0.3)',
      }}
    >
      <ul className="flex items-stretch justify-between px-0.5 pb-[max(env(safe-area-inset-bottom),10px)] pt-2">
        {TABS.map(({ href, label, Icon }) => {
          const active =
            href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <li key={href} className="min-w-0 flex-1">
              <Link
                href={href}
                className="flex flex-col items-center gap-0.5 rounded-xl px-0.5 py-1.5 transition-colors"
                style={
                  active
                    ? { background: 'rgba(160,140,230,0.15)' }
                    : undefined
                }
              >
                <Icon
                  size={19}
                  strokeWidth={active ? 2.2 : 1.8}
                  color={active ? '#5a47b0' : '#9888d0'}
                />
                <span
                  className="w-full truncate text-center text-[9px] tracking-wide"
                  style={{ color: active ? '#5a47b0' : '#9888d0' }}
                >
                  {label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
