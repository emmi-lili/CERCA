// @ts-nocheck — Deno edge function: Node.js types don't apply here.
// =============================================================================
// Cerca — question-reminder Edge Function (Deno)
// =============================================================================
//
// Sends a daily push notification to BOTH partners reminding them to answer
// today's question. Called by a pg_cron job (see supabase/cron.sql).
//
// -----------------------------------------------------------------------------
// DEPLOY
// -----------------------------------------------------------------------------
//   supabase functions deploy question-reminder --no-verify-jwt
//
// The function uses the same VAPID secrets as send-push. If you have already
// set them you don't need to set them again. If not:
//
//   supabase secrets set \
//     VAPID_PUBLIC_KEY="<public key>" \
//     VAPID_PRIVATE_KEY="<private key>" \
//     VAPID_SUBJECT="mailto:you@example.com" \
//     PROJECT_URL="https://<project-ref>.supabase.co" \
//     SERVICE_ROLE_KEY="<service role key>"
// =============================================================================

import webpush from 'npm:web-push@3.6.7'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PROJECT_URL =
  Deno.env.get('PROJECT_URL') ?? Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY =
  Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')  ?? ''
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
const VAPID_SUBJECT     = Deno.env.get('VAPID_SUBJECT')     ?? 'mailto:emmi.a.rivero@gmail.com'

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY)

Deno.serve(async (req) => {
  try {
    // Optional: pass { "test_user_id": "<uuid>" } in the body to send only to
    // that user. Useful for testing without notifying the other partner.
    let testUserId: string | null = null
    try {
      const body = await req.json()
      testUserId = body?.test_user_id ?? null
    } catch { /* body is empty or not JSON — that's fine */ }

    // Fetch push subscriptions — filtered to one user when testing.
    let query = supabase.from('push_subscriptions').select('id, endpoint, p256dh, auth')
    if (testUserId) query = query.eq('user_id', testUserId)

    const { data: subs, error } = await query

    if (error) {
      console.error('fetch error', error)
      return new Response('db error', { status: 500 })
    }

    if (!subs || subs.length === 0) {
      return new Response('no subscriptions', { status: 200 })
    }

    const notification = JSON.stringify({
      title: 'Cerca - Emmmi y Santi 💜',
      body: '¡Ya están las preguntas de hoy en Conocernos y Crecer juntos!',
      url: '/juegos',
    })

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
            // Expired subscription — remove it.
            await supabase.from('push_subscriptions').delete().eq('id', sub.id)
          } else {
            console.error('push error', err)
          }
        }
      }),
    )

    return new Response('sent', { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response('error', { status: 500 })
  }
})
