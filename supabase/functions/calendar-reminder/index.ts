// @ts-nocheck — Deno edge function: Node.js types don't apply here.
// =============================================================================
// Cerca — calendar-reminder Edge Function (Deno)
// =============================================================================
//
// Sends scheduled push notifications for:
//   • Monthly anniversary (day 11) — 1 day before and same day
//   • calendar_events in DB — 1 day before and same day
//
// Called by pg_cron (see supabase/cron.sql).
//
// -----------------------------------------------------------------------------
// DEPLOY
// -----------------------------------------------------------------------------
//   supabase functions deploy calendar-reminder --no-verify-jwt
//
// Uses the same VAPID secrets as send-push and question-reminder.
// =============================================================================

import webpush from 'npm:web-push@3.6.7'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PROJECT_URL =
  Deno.env.get('PROJECT_URL') ?? Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY =
  Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') ?? ''
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:cerca@example.com'

const ANNIVERSARY_DAY = 11
const ANNIVERSARY_TITLE = 'Aniversario del primer beso'

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY)

function toIsoDate(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

async function alreadySent(key: string): Promise<boolean> {
  const { data } = await supabase
    .from('calendar_reminder_log')
    .select('reminder_key')
    .eq('reminder_key', key)
    .maybeSingle()
  return Boolean(data)
}

async function markSent(key: string) {
  await supabase.from('calendar_reminder_log').upsert({ reminder_key: key })
}

async function sendToAll(body: string, url = '/calendario') {
  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')

  if (error) {
    console.error('fetch error', error)
    return
  }
  if (!subs || subs.length === 0) return

  const notification = JSON.stringify({ title: 'Cerca', body, url })

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          notification,
        )
      } catch (err) {
        const statusCode = (err as { statusCode?: number })?.statusCode
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id)
        } else {
          console.error('push error', err)
        }
      }
    }),
  )
}

type Reminder = { key: string; body: string }

Deno.serve(async () => {
  try {
    const now = new Date()
    const today = toIsoDate(now)
    const tomorrow = toIsoDate(addDays(now, 1))
    const reminders: Reminder[] = []

    const tomorrowDate = addDays(now, 1)
    const todayDate = now

    if (tomorrowDate.getUTCDate() === ANNIVERSARY_DAY) {
      reminders.push({
        key: `anniversary-${tomorrow}-before`,
        body: 'Mañana es el Aniversario del primer beso 💜',
      })
    }

    if (todayDate.getUTCDate() === ANNIVERSARY_DAY) {
      reminders.push({
        key: `anniversary-${today}-today`,
        body: `Hoy es ${ANNIVERSARY_TITLE} 💜`,
      })
    }

    const { data: dbEvents, error } = await supabase
      .from('calendar_events')
      .select('id, kind, title, event_date')
      .in('event_date', [today, tomorrow])

    if (error) {
      console.error('events error', error)
      return new Response('db error', { status: 500 })
    }

    for (const event of dbEvents ?? []) {
      const isTomorrow = event.event_date === tomorrow
      const isToday = event.event_date === today
      const prefix =
        event.kind === 'plan' ? 'Plan' : 'Fecha importante'

      if (isTomorrow) {
        reminders.push({
          key: `event-${event.id}-${tomorrow}-before`,
          body: `Mañana · ${prefix}: ${event.title}`,
        })
      }
      if (isToday) {
        reminders.push({
          key: `event-${event.id}-${today}-today`,
          body: `Hoy · ${prefix}: ${event.title}`,
        })
      }
    }

    let sent = 0
    for (const reminder of reminders) {
      if (await alreadySent(reminder.key)) continue
      await sendToAll(reminder.body)
      await markSent(reminder.key)
      sent++
    }

    return new Response(`sent ${sent}`, { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response('error', { status: 500 })
  }
})
