'use client'

import { useEffect, useState } from 'react'
import { Heart, Sparkles } from 'lucide-react'
import QuestionCard, { type Answer } from './QuestionCard'
import {
  QUESTIONS_CONOCERNOS,
  QUESTIONS_CRECER,
  INDEX_OFFSET_CRECER,
  QUESTION_UNLOCK_HOUR,
} from '@/lib/constants'
import { getTodayQuestionIndex, isBeforeTodayQuestionUnlock } from '@/lib/utils'

type Category = 'conocernos' | 'crecer'

type Props = {
  currentUserId: string
  partnerName: string
  initialAnswers: Answer[]
  firstEntryDate: string | null
}

const TABS: { id: Category; label: string; sublabel: string; Icon: typeof Heart }[] = [
  { id: 'conocernos', label: 'Conocernos mejor', sublabel: 'memorias & distancia', Icon: Heart },
  { id: 'crecer',     label: 'Crecer juntos',    sublabel: 'sueños & valores',      Icon: Sparkles },
]

export default function GamesShell({
  currentUserId,
  partnerName,
  initialAnswers,
  firstEntryDate,
}: Props) {
  const [category, setCategory] = useState<Category>('conocernos')
  const [now, setNow] = useState(() => new Date())

  // Re-check every minute so both sections unlock right at 10 AM.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const isConocer = category === 'conocernos'
  const questions = isConocer ? QUESTIONS_CONOCERNOS : QUESTIONS_CRECER
  const offset = isConocer ? 0 : INDEX_OFFSET_CRECER
  const todayIdx = getTodayQuestionIndex(
    firstEntryDate,
    questions.length,
    now,
  )
  const waitingForUnlock = isBeforeTodayQuestionUnlock(now)

  return (
    <div className="flex flex-col gap-5">
      {/* Category tabs */}
      <div className="flex gap-2">
        {TABS.map(({ id, label, sublabel, Icon }) => {
          const active = category === id
          return (
            <button
              key={id}
              onClick={() => setCategory(id)}
              className="flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-3 text-center transition-all"
              style={{
                background: active
                  ? 'rgba(255,255,255,0.55)'
                  : 'rgba(255,255,255,0.22)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: active
                  ? '1px solid rgba(180,160,240,0.5)'
                  : '1px solid rgba(255,255,255,0.35)',
                boxShadow: active ? '0 2px 16px rgba(90,71,176,0.10)' : 'none',
              }}
            >
              <Icon
                size={18}
                strokeWidth={active ? 2.2 : 1.6}
                color={active ? '#5a47b0' : '#9888d0'}
                fill={active ? 'rgba(90,71,176,0.12)' : 'none'}
              />
              <span
                className="text-[12px] font-medium leading-tight"
                style={{ color: active ? '#5a47b0' : '#9888d0' }}
              >
                {label}
              </span>
              <span
                className="text-[10px] leading-tight"
                style={{ color: active ? '#8878c4' : '#b8aee0' }}
              >
                {sublabel}
              </span>
            </button>
          )
        })}
      </div>

      {waitingForUnlock && (
        <p
          className="rounded-2xl px-4 py-3 text-center text-sm"
          style={{
            color: '#8878c4',
            background: 'rgba(255,255,255,0.35)',
            border: '1px solid rgba(180,160,240,0.25)',
          }}
        >
          Las preguntas de hoy llegan a las {QUESTION_UNLOCK_HOUR}:00 AM
        </p>
      )}

      {/* Question card for the selected category */}
      <QuestionCard
        key={category}
        currentUserId={currentUserId}
        partnerName={partnerName}
        todayIndex={todayIdx}
        initialAnswers={initialAnswers}
        questions={questions}
        indexOffset={offset}
      />
    </div>
  )
}
