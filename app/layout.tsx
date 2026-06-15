import type { Metadata, Viewport } from 'next'
import { Nunito, DM_Sans } from 'next/font/google'
import './globals.css'
import BottomNav from '@/components/BottomNav'

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
        {/* Floating decorative orbs */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        >
          <div
            className="absolute top-[-60px] left-[-60px] h-[220px] w-[220px] rounded-full"
            style={{ background: 'rgba(180,200,255,0.3)', filter: 'blur(8px)' }}
          />
          <div
            className="absolute top-[120px] right-[-40px] h-[160px] w-[160px] rounded-full"
            style={{ background: 'rgba(210,190,255,0.25)', filter: 'blur(8px)' }}
          />
          <div
            className="absolute bottom-[200px] left-[20px] h-[100px] w-[100px] rounded-full"
            style={{ background: 'rgba(160,210,255,0.2)', filter: 'blur(8px)' }}
          />
        </div>

        {/* Mobile-first centered container */}
        <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[390px] flex-col px-5 pb-28 pt-8">
          {children}
        </div>

        <BottomNav />
      </body>
    </html>
  )
}
