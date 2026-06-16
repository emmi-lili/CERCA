'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { ALLOWED_EMAILS } from '@/lib/constants'
import Welcome from '@/components/Welcome'

const WELCOME_KEY = 'cerca_seen_welcome'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'denied'>('idle')
  const [error, setError] = useState('')

  // `null` until we've read localStorage; treated as "show" to avoid a flash
  // of the login form on first launch.
  const [showWelcome, setShowWelcome] = useState<boolean | null>(null)

  useEffect(() => {
    setShowWelcome(localStorage.getItem(WELCOME_KEY) !== '1')
  }, [])

  const dismissWelcome = () => {
    localStorage.setItem(WELCOME_KEY, '1')
    setShowWelcome(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const emailValue = email.trim().toLowerCase()
    if (!emailValue || !password) return

    if (!ALLOWED_EMAILS.map((x) => x.toLowerCase()).includes(emailValue)) {
      setStatus('denied')
      return
    }

    setStatus('loading')
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: emailValue,
      password,
    })

    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Correo o contraseña incorrectos.'
        : error.message)
      setStatus('idle')
    } else {
      window.location.href = '/'
    }
  }

  return (
    <main className="flex min-h-[80dvh] flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="glass-strong w-full px-7 py-10 text-center"
      >
        <h1
          className="font-display leading-none"
          style={{ fontSize: 48, fontWeight: 500, color: '#5a47b0' }}
        >
          Cerca
        </h1>
        <p className="mt-2 text-sm" style={{ color: '#9888d0' }}>
          solo para nosotros dos
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (status === 'denied') setStatus('idle')
              setError('')
            }}
            placeholder="tu correo"
            autoComplete="email"
            required
            className="w-full rounded-full bg-white/60 px-5 py-3 text-center text-base"
            style={{
              color: '#3a2e6e',
              border: '0.5px solid rgba(180,160,240,0.35)',
            }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
            placeholder="contraseña"
            autoComplete="current-password"
            required
            className="w-full rounded-full bg-white/60 px-5 py-3 text-center text-base"
            style={{
              color: '#3a2e6e',
              border: '0.5px solid rgba(180,160,240,0.35)',
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full rounded-full px-5 py-3 text-base font-medium text-white transition-opacity disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#8878c4,#5a47b0)' }}
          >
            {status === 'loading' ? 'Entrando…' : 'Entrar'}
          </button>

          {status === 'denied' && (
            <p className="text-sm" style={{ color: '#8878c4' }}>
              Acceso solo por invitación
            </p>
          )}
          {error && (
            <p className="text-sm" style={{ color: '#c47878' }}>
              {error}
            </p>
          )}
        </form>
      </motion.div>

      <AnimatePresence>
        {showWelcome !== false && <Welcome onNext={dismissWelcome} />}
      </AnimatePresence>
    </main>
  )
}
