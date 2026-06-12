'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { COUPLE_ID } from '@/lib/constants'
import { formatRelativeTime } from '@/lib/utils'

export type JournalEntry = {
  id: string
  author_id: string | null
  content: string
  created_at: string
}

type Props = {
  currentUserId: string
  initialEntries: JournalEntry[]
  names: Record<string, string>
}

export default function JournalFeed({
  currentUserId,
  initialEntries,
  names,
}: Props) {
  const supabase = useMemo(() => createClient(), [])
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const channel = supabase
      .channel('journal-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'journal_entries' },
        (payload) => {
          const entry = payload.new as JournalEntry
          setEntries((prev) =>
            prev.some((e) => e.id === entry.id) ? prev : [entry, ...prev]
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleSave = async () => {
    const content = text.trim()
    if (!content || saving) return
    setSaving(true)

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        couple_id: COUPLE_ID,
        author_id: currentUserId,
        content,
      })
      .select()
      .single()

    setSaving(false)
    if (!error && data) {
      setText('')
      // Optimistically add in case realtime echo is delayed.
      setEntries((prev) =>
        prev.some((e) => e.id === data.id)
          ? prev
          : [data as JournalEntry, ...prev]
      )
    }
  }

  const nameFor = (id: string | null) =>
    (id && names[id]) || (id === currentUserId ? 'Tú' : 'Tu amor')

  return (
    <div className="flex flex-col gap-4">
      <div className="glass-strong flex flex-col gap-3 p-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe algo bonito para los dos…"
          rows={3}
          className="w-full resize-none bg-transparent font-display text-lg leading-snug"
          style={{ color: '#3a2e6e' }}
        />
        <button
          onClick={handleSave}
          disabled={saving || !text.trim()}
          className="self-end rounded-full px-6 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg,#8878c4,#5a47b0)' }}
        >
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="glass px-5 py-10 text-center">
          <p className="font-display text-lg" style={{ color: '#8878c4' }}>
            Aún no hay entradas. Escribe algo bonito 💜
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {entries.map((entry) => (
              <motion.article
                key={entry.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="glass p-4"
              >
                <header className="mb-1 flex items-center justify-between">
                  <span
                    className="text-sm font-medium"
                    style={{ color: '#5a47b0' }}
                  >
                    {nameFor(entry.author_id)}
                  </span>
                  <span className="text-[11px]" style={{ color: '#9888d0' }}>
                    {formatRelativeTime(entry.created_at)}
                  </span>
                </header>
                <p
                  className="font-display text-lg leading-snug"
                  style={{ color: '#3a2e6e' }}
                >
                  {entry.content}
                </p>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
