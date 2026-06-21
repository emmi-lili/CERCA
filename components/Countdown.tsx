'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { REUNION_LABEL } from '@/lib/constants'
import {
  getReunionRemaining,
  type ReunionRemaining,
} from '@/lib/countdown'

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

function Unit({
  value,
  label,
  animate = false,
}: {
  value: string
  label: string
  animate?: boolean
}) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl py-5"
      style={{
        background: 'rgba(255,255,255,0.22)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,0.45)',
        boxShadow: '0 4px 24px rgba(90,71,176,0.10)',
      }}
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={animate ? { y: -8, opacity: 0 } : false}
          animate={{ y: 0, opacity: 1 }}
          exit={animate ? { y: 8, opacity: 0 } : undefined}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="font-display leading-none tabular-nums"
          style={{ fontSize: 36, fontWeight: 600, color: '#5a47b0' }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
      <span
        className="text-[10px] uppercase tracking-[0.18em]"
        style={{ color: '#9888d0' }}
      >
        {label}
      </span>
    </div>
  )
}

type Props = {
  initial: ReunionRemaining
}

export default function Countdown({ initial }: Props) {
  const [time, setTime] = useState(initial)

  useEffect(() => {
    const id = setInterval(() => setTime(getReunionRemaining()), 1000)
    return () => clearInterval(id)
  }, [])

  const units = [
    { label: 'Días',  value: pad(time.days) },
    { label: 'Horas', value: pad(time.hours) },
    { label: 'Min',   value: pad(time.minutes) },
    { label: 'Seg',   value: pad(time.seconds), animate: true },
  ]

  if (time.done) {
    return (
      <div
        className="flex flex-col items-center gap-2 rounded-2xl px-6 py-8 text-center"
        style={{
          background: 'rgba(255,255,255,0.28)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(255,255,255,0.5)',
        }}
      >
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
      <div className="flex gap-2">
        {units.map(({ label, value, animate }) => (
          <Unit key={label} label={label} value={value} animate={animate} />
        ))}
      </div>
      <p className="text-center text-xs" style={{ color: '#9888d0', letterSpacing: '0.05em' }}>
        {REUNION_LABEL}
      </p>
    </div>
  )
}
