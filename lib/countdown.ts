import { REUNION_DATE } from '@/lib/constants'

export type ReunionRemaining = {
  days: number
  hours: number
  minutes: number
  seconds: number
  done: boolean
}

export function getReunionRemaining(now = Date.now()): ReunionRemaining {
  const diff = REUNION_DATE.getTime() - now
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
