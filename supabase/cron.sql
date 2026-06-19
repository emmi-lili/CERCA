-- =============================================================================
-- Cerca — cron job for the daily question reminder
-- =============================================================================
-- Run this SQL once in the Supabase SQL editor (Dashboard → SQL Editor).
--
-- Before running, replace the two placeholder values below:
--   <YOUR_PROJECT_URL>      → e.g. https://hypryiiafyoetamcuzov.supabase.co
--   <YOUR_SERVICE_ROLE_KEY> → Settings → API → service_role key
--
-- The job fires every day at 13:00 UTC (9:00 AM ET / 10:00 AM Cuba time).
-- Change the cron expression to adjust the time.
--
-- Prerequisites:
--   1. Enable pg_cron and pg_net in Dashboard → Database → Extensions.
--   2. Deploy the edge function first:
--        supabase functions deploy question-reminder --no-verify-jwt
-- =============================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'cerca-daily-question-reminder',
  '0 13 * * *',   -- every day at 13:00 UTC  (change to taste)
  $$
  select net.http_post(
    url     := 'https://<YOUR_PROJECT_URL>/functions/v1/question-reminder',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer <YOUR_SERVICE_ROLE_KEY>'
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- Verify:  select * from cron.job;
-- Remove:  select cron.unschedule('cerca-daily-question-reminder');

-- =============================================================================
-- Calendar reminders — anniversary (day 11) + events 1 day before and same day
-- =============================================================================
-- Fires every day at 13:00 UTC (same as the question reminder).
-- Deploy first:
--   supabase functions deploy calendar-reminder --no-verify-jwt
-- =============================================================================

select cron.schedule(
  'cerca-calendar-reminder',
  '0 13 * * *',
  $$
  select net.http_post(
    url     := 'https://<YOUR_PROJECT_URL>/functions/v1/calendar-reminder',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer <YOUR_SERVICE_ROLE_KEY>'
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- Verify:  select * from cron.job;
-- Remove:  select cron.unschedule('cerca-calendar-reminder');
