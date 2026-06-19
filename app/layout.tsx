import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Nunito, DM_Sans } from 'next/font/google'
import './globals.css'
import BottomNav from '@/components/BottomNav'
import AppBackground from '@/components/AppBackground'
import SessionKeeper from '@/components/SessionKeeper'
import SwUpdate from '@/components/SwUpdate'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-nunito',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Cerca',
  description: 'Un rinconcito solo para nosotros dos',
  ...(process.env.NODE_ENV === 'production'
    ? {
        manifest: '/manifest.json',
        appleWebApp: {
          capable: true,
          title: 'Cerca',
          statusBarStyle: 'default' as const,
        },
      }
    : {}),
  icons: {
    icon: '/cerca.png',
    apple: '/cerca.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#e8e0f8',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${nunito.variable} ${dmSans.variable}`}>
      <body>
        {process.env.NODE_ENV === 'development' && (
          <Script id="dev-unregister-sw" strategy="beforeInteractive">
            {`if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(function (regs) {
                regs.forEach(function (r) { r.unregister(); });
              });
            }`}
          </Script>
        )}
        <SwUpdate />
        <SessionKeeper />
        <AppBackground />

        {/* Mobile-first centered container */}
        <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[390px] flex-col px-5 pb-28 pt-8">
          {children}
        </div>

        <BottomNav />
      </body>
    </html>
  )
}
