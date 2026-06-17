'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'

function Dots({ active }: { active: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {[0, 1].map((i) => (
        <span
          key={i}
          className="h-2.5 w-2.5 rounded-full"
          style={
            i === active
              ? { background: '#5a47b0' }
              : { border: '1.5px solid #5a47b0', opacity: 0.55 }
          }
        />
      ))}
    </div>
  )
}

export default function Welcome({ onNext }: { onNext: () => void }) {
  const [step, setStep] = useState(1)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      <AnimatePresence>
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1, transition: { duration: 0.6 } }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute inset-0"
            style={{
              zIndex: 1,
              background:
                'linear-gradient(180deg, #cdbdf0 0%, #c2b1ec 48%, #b4a3e6 100%)',
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(60% 42% at 50% 36%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)',
              }}
            />

            <div className="relative mx-auto flex h-full w-full max-w-[420px] flex-col px-8 pb-[max(env(safe-area-inset-bottom),28px)] pt-6">
              <div className="flex flex-1 items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                  className="relative w-full"
                >
                  <div
                    aria-hidden
                    className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      background: 'rgba(255,255,255,0.45)',
                      filter: 'blur(34px)',
                    }}
                  />
                  <Image
                    src="/nube-abrazo.png"
                    alt="Nubecita abrazándose"
                    width={923}
                    height={812}
                    priority
                    className="relative mx-auto h-auto w-[80%] max-w-[300px]"
                  />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
                className="shrink-0 text-center"
              >
                <h1
                  className="font-display mx-auto max-w-[300px] leading-[1.05] text-white"
                  style={{
                    fontSize: 40,
                    fontWeight: 800,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Juntos, aunque estemos lejos
                </h1>
                <p
                  className="mx-auto mt-4 max-w-[280px] text-[15px] leading-snug"
                  style={{ color: 'rgba(255,255,255,0.88)' }}
                >
                  Aquí comienza nuestro viaje juntos.
                </p>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="mt-9 w-full rounded-full px-6 py-4 text-[17px] font-semibold text-white transition-all active:scale-[0.98]"
                  style={{
                    background: 'rgba(120,102,178,0.55)',
                    border: '0.5px solid rgba(255,255,255,0.35)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 24px rgba(90,71,176,0.25)',
                  }}
                >
                  Siguiente
                </button>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute inset-0"
            style={{
              zIndex: 2,
              background:
                'linear-gradient(180deg, #e2f1fc 0%, #c6e7fb 52%, #a8dbf7 100%)',
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(58% 40% at 50% 58%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 62%)',
              }}
            />

            <div className="relative mx-auto flex h-full w-full max-w-[420px] flex-col px-8 pb-[max(env(safe-area-inset-bottom),28px)] pt-6">
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                className="shrink-0 pt-10 text-center"
              >
                <h1
                  className="font-display mx-auto max-w-[320px] leading-[1.08]"
                  style={{
                    fontSize: 34,
                    fontWeight: 800,
                    color: '#3a2e6e',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Contando cada segundo hasta nuestro siguiente abrazo
                </h1>
                <div className="mt-6">
                  <Dots active={1} />
                </div>
              </motion.div>

              <div className="flex flex-1 items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
                  className="relative w-full"
                >
                  <div
                    aria-hidden
                    className="absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      background: 'rgba(255,255,255,0.5)',
                      filter: 'blur(36px)',
                    }}
                  />
                  <Image
                    src="/nube-corazon.png"
                    alt="Nubecita haciendo un corazón con las manos"
                    width={2091}
                    height={1716}
                    priority
                    className="relative mx-auto h-auto w-[80%] max-w-[300px]"
                  />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                className="shrink-0"
              >
                <button
                  type="button"
                  onClick={onNext}
                  className="w-full rounded-full px-6 py-4 text-[17px] font-semibold text-white transition-all active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg,#8878c4,#5a47b0)',
                    boxShadow: '0 10px 26px rgba(90,71,176,0.3)',
                  }}
                >
                  Empezar
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
