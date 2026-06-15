import PageTransition from '@/components/PageTransition'
import { CalendarHeart } from 'lucide-react'

export default function CalendarioPage() {
  return (
    <PageTransition>
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: 'rgba(160,140,230,0.15)' }}
        >
          <CalendarHeart size={36} color="#8878c4" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col gap-2">
          <h1
            className="font-display text-3xl"
            style={{ color: '#5a47b0', fontWeight: 700 }}
          >
            Calendario
          </h1>
          <p className="text-sm" style={{ color: '#9888d0' }}>
            en construcción aún 🛠️
          </p>
          <p className="mt-1 text-xs" style={{ color: '#b8aee0' }}>
            pronto podrán marcar fechas especiales juntos
          </p>
        </div>
      </div>
    </PageTransition>
  )
}
