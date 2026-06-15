// @ts-nocheck — Deno edge function: Node.js types don't apply here.
// =============================================================================
// Cerca — send-push Edge Function (Deno)
// =============================================================================
//
// Sends a Web Push notification to the OTHER partner whenever a row is inserted
// into `journal_entries` or `question_games`. Wired up as a Supabase Database
// Webhook (see "DEPLOY" below).
//
// -----------------------------------------------------------------------------
// 1. GENERATE VAPID KEYS (run locally, once)
// -----------------------------------------------------------------------------
//   npx web-push generate-vapid-keys
//
//   This prints a Public Key and a Private Key. Use them as:
//     • NEXT_PUBLIC_VAPID_PUBLIC_KEY  -> the Public Key  (also in .env.local)
//     • VAPID_PRIVATE_KEY             -> the Private Key
//
// -----------------------------------------------------------------------------
// 2. SET FUNCTION SECRETS
// -----------------------------------------------------------------------------
//   supabase secrets set \
//     VAPID_PUBLIC_KEY="<public key>" \
//     VAPID_PRIVATE_KEY="<private key>" \
//     VAPID_SUBJECT="mailto:you@example.com" \
//     PROJECT_URL="https://<project-ref>.supabase.co" \
//     SERVICE_ROLE_KEY="<service role key>"
//
//   (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are also injected automatically
//    by the platform; we fall back to them if PROJECT_URL/SERVICE_ROLE_KEY are
//    not set.)
//
// -----------------------------------------------------------------------------
// 3. DEPLOY
// -----------------------------------------------------------------------------
//   supabase functions deploy send-push --no-verify-jwt
//
// -----------------------------------------------------------------------------
// 4. CREATE THE WEBHOOKS (Supabase Dashboard → Database → Webhooks)
// -----------------------------------------------------------------------------
//   Create two webhooks, both:
//     • Events: INSERT
//     • Type: Supabase Edge Function -> send-push
//   One on table `journal_entries`, one on table `question_games`.
// =============================================================================

import webpush from 'npm:web-push@3.6.7'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PROJECT_URL =
  Deno.env.get('PROJECT_URL') ?? Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY =
  Deno.env.get('SERVICE_ROLE_KEY') ??
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
  ''

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') ?? ''
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:cerca@example.com'

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY)

type WebhookPayload = {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: {
    author_id?: string | null
    [key: string]: unknown
  }
}

Deno.serve(async (req) => {
  try {
    const payload = (await req.json()) as WebhookPayload

    if (payload.type !== 'INSERT') {
      return new Response('ignored', { status: 200 })
    }

    const authorId = payload.record?.author_id
    if (!authorId) {
      return new Response('no author', { status: 200 })
    }

    // Look up the author's name for a friendly message.
    const { data: author } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', authorId)
      .maybeSingle()

    const authorName = author?.name ?? 'Tu amor'

    // The recipient is the other partner (everyone who is not the author).
    const { data: recipients } = await supabase
      .from('profiles')
      .select('id')
      .neq('id', authorId)

    const recipientIds = (recipients ?? []).map((r) => r.id)
    if (recipientIds.length === 0) {
      return new Response('no recipients', { status: 200 })
    }

    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .in('user_id', recipientIds)

    if (!subs || subs.length === 0) {
      return new Response('no subscriptions', { status: 200 })
    }

    const body =
      payload.table === 'journal_entries'
        ? `${authorName} escribió algo en el diario 💜`
        : `${authorName} respondió la pregunta de hoy ✨`

    const url = payload.table === 'journal_entries' ? '/diario' : '/juegos'

    const notification = JSON.stringify({ title: 'Cerca', body, url })

    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            notification
          )
        } catch (err) {
          // 404/410 mean the subscription is gone — clean it up.
          const statusCode = (err as { statusCode?: number })?.statusCode
          if (statusCode === 404 || statusCode === 410) {
            await supabase.from('push_subscriptions').delete().eq('id', sub.id)
          } else {
            console.error('push error', err)
          }
        }
      })
    )

    return new Response('sent', { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response('error', { status: 500 })
  }
})
