'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { COUPLE_ID } from '@/lib/constants'

export type Answer = {
  id: string
  question_index: number
  author_id: string | null
  answer: string
  created_at: string
}

// Pastel palette for answer bubbles (RGB triplets).
const BUBBLE_COLORS = [
  '168,216,255', // celeste
  '255,190,140', // naranja
  '255,180,210', // rosa
]

// Deterministically pick a color from an id so it stays stable across renders.
function bubbleColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  const rgb = BUBBLE_COLORS[hash % BUBBLE_COLORS.length]
  return `radial-gradient(ellipse at center, rgba(${rgb},0.85) 0%, rgba(${rgb},0.35) 45%, rgba(${rgb},0) 75%)`
}

// Tally-style slide+fade when moving between questions. Direction 1 = next
// (new content rises from below), -1 = previous (drops from above).
const slideVariants = {
  enter: (dir: number) => ({ y: dir >= 0 ? 36 : -36, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (dir: number) => ({ y: dir >= 0 ? -36 : 36, opacity: 0 }),
}

type Props = {
  currentUserId: string
  partnerName: string
  todayIndex: number
  initialAnswers: Answer[]
  questions: string[]
  indexOffset?: number
}

export default function QuestionCard({
  currentUserId,
  partnerName,
  todayIndex,
  initialAnswers,
  questions,
  indexOffset = 0,
}: Props) {
  const supabase      = useMemo(() => createClient(), [])
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers)
  const [viewIndex, setViewIndex] = useState(todayIndex)
  const [direction, setDirection] = useState(0)
  const [draft, setDraft]     = useState('')
  const [saving, setSaving]   = useState(false)
  const [sendError, setSendError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const goPrev = () => {
    setDirection(-1)
    setViewIndex((i) => Math.max(0, i - 1))
  }
  const goNext = () => {
    setDirection(1)
    setViewIndex((i) => Math.min(todayIndex, i + 1))
  }

  useEffect(() => {
    const channel = supabase
      .channel(`question-games-${indexOffset}`)
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
    return () => { supabase.removeChannel(channel) }
  }, [supabase, indexOffset])

  // Reset draft and error when navigating between questions.
  useEffect(() => { setDraft(''); setSendError('') }, [viewIndex])

  // Scroll to bottom when partner's answer arrives.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [answers])

  const isToday       = viewIndex === todayIndex
  const dbIndex       = viewIndex + indexOffset
  const forIndex      = answers.filter((a) => a.question_index === dbIndex)
  const myAnswer      = forIndex.find((a) => a.author_id === currentUserId)
  const partnerAnswer = forIndex.find((a) => a.author_id !== currentUserId)

  // If both answered, sort by created_at so the first reply shows first.
  const chatMessages = [myAnswer, partnerAnswer]
    .filter(Boolean)
    .sort((a, b) =>
      new Date(a!.created_at).getTime() - new Date(b!.created_at).getTime()
    ) as Answer[]

  const handleSend = async () => {
    const answer = draft.trim()
    if (!answer || saving || myAnswer) return
    setSaving(true)
    setSendError('')

    const { data, error } = await supabase
      .from('question_games')
      .insert({
        couple_id: COUPLE_ID,
        question_index: dbIndex,
        author_id: currentUserId,
        answer,
      })
      .select()
      .single()

    setSaving(false)

    if (error) {
      console.error('insert error:', error)
      setSendError(error.message)
      return
    }

    setDraft('')

    // Use returned data if available; otherwise build an optimistic entry.
    const saved: Answer = data ?? {
      id: crypto.randomUUID(),
      question_index: dbIndex,
      author_id: currentUserId,
      answer,
      created_at: new Date().toISOString(),
    }
    setAnswers((prev) =>
      prev.some((x) => x.id === saved.id) ? prev : [...prev, saved]
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Question navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={viewIndex <= 0}
          className="glass flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-30"
          aria-label="Pregunta anterior"
        >
          <ChevronLeft size={20} color="#5a47b0" />
        </button>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs uppercase tracking-[0.2em]" style={{ color: '#9888d0' }}>
            Pregunta {viewIndex + 1}
          </span>
          {isToday && (
            <span
              className="rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white"
              style={{ background: 'linear-gradient(135deg,#8878c4,#5a47b0)' }}
            >
              Hoy
            </span>
          )}
        </div>
        <button
          onClick={goNext}
          disabled={viewIndex >= todayIndex}
          className="glass flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-30"
          aria-label="Pregunta siguiente"
        >
          <ChevronRight size={20} color="#5a47b0" />
        </button>
      </div>

      {/* Chat container */}
      <div className="glass-strong overflow-hidden p-5">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={viewIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col gap-4"
          >
            {/* Question bubble — centered */}
            <div className="flex justify-center">
              <p
                className="font-display text-center text-xl leading-snug"
                style={{ color: '#5a47b0' }}
              >
                {questions[viewIndex]}
              </p>
            </div>

            <div className="h-px" style={{ background: 'rgba(160,140,230,0.2)' }} />

            {/* Chat messages */}
            <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {chatMessages.map((msg) => {
              const isMe = msg.author_id === currentUserId
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span
                    className="text-[10px] uppercase tracking-wide px-1"
                    style={{ color: '#9888d0' }}
                  >
                    {isMe ? 'Tú' : partnerName}
                  </span>
                  <div
                    className="max-w-[85%] px-5 py-4"
                    style={{ background: bubbleColor(msg.id) }}
                  >
                    <p
                      className="font-display text-base leading-snug"
                      style={{ color: '#3a2e6e' }}
                    >
                      {msg.answer}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* Waiting state */}
          {myAnswer && !partnerAnswer && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm italic"
              style={{ color: '#b8aee0' }}
            >
              Esperando la respuesta de {partnerName}…
            </motion.p>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input — available for any unanswered question */}
        {!myAnswer && (
          <div className="flex flex-col gap-1">
            <div
              className="flex items-end gap-2 rounded-2xl p-2"
              style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(180,160,240,0.25)' }}
            >
              <textarea
                value={draft}
                onChange={(e) => { setDraft(e.target.value); setSendError('') }}
                onKeyDown={handleKeyDown}
                placeholder={isToday ? 'Tu respuesta de hoy…' : 'Tu respuesta…'}
                rows={2}
                className="flex-1 resize-none bg-transparent px-2 py-1 font-display text-base"
                style={{ color: '#3a2e6e' }}
              />
              <button
                onClick={handleSend}
                disabled={saving || !draft.trim()}
                className="mb-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#8878c4,#5a47b0)' }}
                aria-label="Enviar"
              >
                <Send size={16} />
              </button>
            </div>
            {sendError && (
              <p className="px-1 text-xs" style={{ color: '#c47878' }}>
                Error: {sendError}
              </p>
            )}
          </div>
        )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
