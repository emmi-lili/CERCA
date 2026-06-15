'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { COUPLE_ID } from '@/lib/constants'

type Props = { currentUserId: string }

const OPTIONS = [
  { kind: 'abrazo', label: 'Abrazo', emoji: '🤗' },
  { kind: 'beso',   label: 'Beso',   emoji: '😘' },
] as const

export default function SendDetail({ currentUserId }: Props) {
  const supabase = createClient()
  const [sending, setSending]   = useState<string | null>(null)
  const [sentLabel, setSentLabel] = useState('')
  const [showOther, setShowOther] = useState(false)
  const [otherText, setOtherText] = useState('')
  const [error, setError] = useState('')

  const send = async (kind: string, message: string | null, label: string) => {
    setSending(kind)
    setError('')
    const { error } = await supabase.from('details').insert({
      couple_id: COUPLE_ID,
      author_id: currentUserId,
      kind,
      message,
    })
    setSending(null)
    if (error) {
      setError('No se pudo enviar. Intenta de nuevo.')
      return
    }
    setSentLabel(label)
    setShowOther(false)
    setOtherText('')
    setTimeout(() => setSentLabel(''), 2200)
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs uppercase tracking-[0.2em]" style={{ color: '#9888d0' }}>
        Envía un detalle
      </h2>

      <div className="flex gap-3">
        {OPTIONS.map(({ kind, label, emoji }) => (
          <button
            key={kind}
            onClick={() => send(kind, null, label)}
            disabled={sending !== null}
            className="glass flex flex-1 flex-col items-center gap-1.5 py-4 transition-transform active:scale-95 disabled:opacity-50"
          >
            <span style={{ fontSize: 30 }}>{emoji}</span>
            <span className="font-display text-base" style={{ color: '#5a47b0' }}>
              {label}
            </span>
          </button>
        ))}

        <button
          onClick={() => setShowOther((v) => !v)}
          disabled={sending !== null}
          className="glass flex flex-1 flex-col items-center justify-center gap-1.5 py-4 transition-transform active:scale-95 disabled:opacity-50"
        >
          <span className="font-display text-base" style={{ color: '#5a47b0' }}>
            Otro
          </span>
          <span className="text-[11px]" style={{ color: '#9888d0' }}>
            escribir
          </span>
        </button>
      </div>

      {/* Custom "Otro" input */}
      <AnimatePresence>
        {showOther && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div
              className="flex items-end gap-2 rounded-2xl p-2"
              style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(180,160,240,0.25)' }}
            >
              <textarea
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                placeholder="Escribe tu detalle…"
                rows={2}
                autoFocus
                className="flex-1 resize-none bg-transparent px-2 py-1 font-display text-base"
                style={{ color: '#3a2e6e' }}
              />
              <button
                onClick={() => setShowOther(false)}
                className="mb-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                style={{ background: 'rgba(160,140,230,0.15)' }}
                aria-label="Cancelar"
              >
                <X size={16} color="#5a47b0" />
              </button>
              <button
                onClick={() => send('otro', otherText.trim(), 'tu detalle')}
                disabled={sending !== null || !otherText.trim()}
                className="mb-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#8878c4,#5a47b0)' }}
                aria-label="Enviar"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation */}
      <AnimatePresence>
        {sentLabel && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-sm font-display"
            style={{ color: '#8878c4' }}
          >
            Enviado 💜
          </motion.p>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-center text-xs" style={{ color: '#c47878' }}>
          {error}
        </p>
      )}
    </section>
  )
}
