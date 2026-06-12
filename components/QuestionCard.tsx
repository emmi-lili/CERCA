'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { COUPLE_ID, QUESTIONS } from '@/lib/constants'

export type Answer = {
  id: string
  question_index: number
  author_id: string | null
  answer: string
  created_at: string
}

type Props = {
  currentUserId: string
  partnerName: string
  todayIndex: number
  initialAnswers: Answer[]
}

export default function QuestionCard({
  currentUserId,
  partnerName,
  todayIndex,
  initialAnswers,
}: Props) {
  const supabase = useMemo(() => createClient(), [])
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers)
  const [viewIndex, setViewIndex] = useState(todayIndex)
  const [flipped, setFlipped] = useState(false)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const channel = supabase
      .channel('question-games')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'question_games' },
        (payload) => {
          const a = payload.new as Answer
          setAnswers((prev) =>
            prev.some((x) => x.id === a.id) ? prev : [...prev, a]
          )
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Reset flip + draft whenever the viewed question changes.
  useEffect(() => {
    setFlipped(false)
    setDraft('')
  }, [viewIndex])

  const forIndex = answers.filter((a) => a.question_index === viewIndex)
  const myAnswer = forIndex.find((a) => a.author_id === currentUserId)
  const partnerAnswer = forIndex.find((a) => a.author_id !== currentUserId)
  const bothAnswered = Boolean(myAnswer && partnerAnswer)

  const handleSend = async () => {
    const answer = draft.trim()
    if (!answer || saving || myAnswer) return
    setSaving(true)
    const { data, error } = await supabase
      .from('question_games')
      .insert({
        couple_id: COUPLE_ID,
        question_index: viewIndex,
        author_id: currentUserId,
        answer,
      })
      .select()
      .single()
    setSaving(false)
    if (!error && data) {
      setDraft('')
      setAnswers((prev) =>
        prev.some((x) => x.id === data.id) ? prev : [...prev, data as Answer]
      )
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Day navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setViewIndex((i) => Math.max(0, i - 1))}
          disabled={viewIndex <= 0}
          className="glass flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-30"
          aria-label="Pregunta anterior"
        >
          <ChevronLeft size={20} color="#5a47b0" />
        </button>
        <span
          className="text-xs uppercase tracking-[0.2em]"
          style={{ color: '#9888d0' }}
        >
          Pregunta {viewIndex + 1}
        </span>
        <button
          onClick={() => setViewIndex((i) => Math.min(todayIndex, i + 1))}
          disabled={viewIndex >= todayIndex}
          className="glass flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-30"
          aria-label="Pregunta siguiente"
        >
          <ChevronRight size={20} color="#5a47b0" />
        </button>
      </div>

      {/* Flip card */}
      <div style={{ perspective: 1200 }}>
        <motion.div
          className="relative w-full"
          style={{ transformStyle: 'preserve-3d', minHeight: 280 }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        >
          {/* FRONT — question + my answer */}
          <div
            className="glass-strong flex flex-col gap-4 p-6"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <p
              className="font-display text-2xl leading-snug"
              style={{ color: '#3a2e6e' }}
            >
              {QUESTIONS[viewIndex]}
            </p>

            {myAnswer ? (
              <div className="flex flex-col gap-3">
                <div
                  className="rounded-2xl px-4 py-3"
                  style={{ background: 'rgba(160,140,230,0.12)' }}
                >
                  <span
                    className="mb-1 block text-[11px] uppercase tracking-wide"
                    style={{ color: '#9888d0' }}
                  >
                    Tu respuesta
                  </span>
                  <p
                    className="font-display text-lg"
                    style={{ color: '#3a2e6e' }}
                  >
                    {myAnswer.answer}
                  </p>
                </div>

                {bothAnswered ? (
                  <button
                    onClick={() => setFlipped(true)}
                    className="flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white"
                    style={{
                      background: 'linear-gradient(135deg,#8878c4,#5a47b0)',
                    }}
                  >
                    <RotateCw size={16} />
                    Ver la respuesta de {partnerName}
                  </button>
                ) : (
                  <p
                    className="text-center text-sm italic"
                    style={{ color: '#9888d0' }}
                  >
                    Esperando la respuesta de {partnerName}…
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Tu respuesta…"
                  rows={3}
                  className="w-full resize-none rounded-2xl bg-white/50 p-3 font-display text-lg"
                  style={{ color: '#3a2e6e' }}
                />
                <button
                  onClick={handleSend}
                  disabled={saving || !draft.trim()}
                  className="self-end rounded-full px-6 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-40"
                  style={{
                    background: 'linear-gradient(135deg,#8878c4,#5a47b0)',
                  }}
                >
                  {saving ? 'Enviando…' : 'Responder'}
                </button>
              </div>
            )}
          </div>

          {/* BACK — partner's answer */}
          <div
            className="glass-strong absolute inset-0 flex flex-col gap-4 p-6"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <p
              className="font-display text-2xl leading-snug"
              style={{ color: '#3a2e6e' }}
            >
              {QUESTIONS[viewIndex]}
            </p>
            <div
              className="rounded-2xl px-4 py-3"
              style={{ background: 'rgba(187,214,255,0.25)' }}
            >
              <span
                className="mb-1 block text-[11px] uppercase tracking-wide"
                style={{ color: '#9888d0' }}
              >
                {partnerName}
              </span>
              <p className="font-display text-lg" style={{ color: '#3a2e6e' }}>
                {partnerAnswer?.answer}
              </p>
            </div>
            <button
              onClick={() => setFlipped(false)}
              className="flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium"
              style={{
                background: 'rgba(160,140,230,0.15)',
                color: '#5a47b0',
              }}
            >
              <RotateCw size={16} />
              Volver a la pregunta
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
