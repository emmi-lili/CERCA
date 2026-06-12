'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { REUNION_DATE, REUNION_LABEL } from '@/lib/constants'

type Remaining = {
  days: number
  hours: number
  minutes: number
  seconds: number
  done: boolean
}

function getRemaining(): Remaining {
  const diff = REUNION_DATE.getTime() - Date.now()
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  }
  const totalSeconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    done: false,
  }
}

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

function Unit({
  value,
  label,
  pop = false,
}: {
  value: string
  label: string
  pop?: boolean
}) {
  const number = (
    <span
      className="font-display leading-none"
      style={{ fontSize: 40, fontWeight: 500, color: '#5a47b0' }}
    >
      {value}
    </span>
  )

  return (
    <div className="glass flex flex-col items-center justify-center gap-1 py-4">
      {pop ? (
        <motion.div
          key={value}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {number}
        </motion.div>
      ) : (
        number
      )}
      <span
        className="text-[11px] uppercase tracking-[0.15em]"
        style={{ color: '#9888d0' }}
      >
        {label}
      </span>
    </div>
  )
}

export default function Countdown() {
  const [time, setTime] = useState<Remaining | null>(null)

  useEffect(() => {
    setTime(getRemaining())
    const id = setInterval(() => setTime(getRemaining()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!time) {
    // Avoid hydration mismatch — render placeholders until mounted.
    return (
      <div className="grid grid-cols-2 gap-3">
        {['Días', 'Horas', 'Min', 'Seg'].map((l) => (
          <Unit key={l} value="--" label={l} />
        ))}
      </div>
    )
  }

  if (time.done) {
    return (
      <div className="glass-strong flex flex-col items-center gap-2 px-6 py-8 text-center">
        <span className="font-display text-3xl" style={{ color: '#5a47b0' }}>
          Por fin juntos 💜
        </span>
        <span className="text-sm" style={{ color: '#9888d0' }}>
          {REUNION_LABEL}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Unit value={pad(time.days)} label="Días" />
        <Unit value={pad(time.hours)} label="Horas" />
        <Unit value={pad(time.minutes)} label="Min" />
        <Unit value={pad(time.seconds)} label="Seg" pop />
      </div>
      <p className="text-center text-sm" style={{ color: '#8878c4' }}>
        {REUNION_LABEL}
      </p>
    </div>
  )
}
