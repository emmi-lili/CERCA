-- =============================================================================
-- Cerca — database schema. Run this in the Supabase SQL editor.
-- =============================================================================

-- Users profile (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  avatar_emoji text default '🫧',
  mood text default 'pensando en ti',
  last_seen timestamptz default now()
);

-- Journal entries
create table if not exists public.journal_entries (
  id uuid default gen_random_uuid() primary key,
  couple_id text default 'cerca-main',
  author_id uuid references public.profiles(id),
  content text not null,
  created_at timestamptz default now()
);

-- Question game answers
create table if not exists public.question_games (
  id uuid default gen_random_uuid() primary key,
  couple_id text default 'cerca-main',
  question_index integer not null,
  author_id uuid references public.profiles(id),
  answer text not null,
  created_at timestamptz default now()
);

-- Auto-create a profile row whenever a new auth user is created (password
-- sign-ups don't go through the magic-link callback, so we handle it here).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for any users that already existed before the trigger.
insert into public.profiles (id, name)
select id, split_part(email, '@', 1)
from auth.users
on conflict (id) do nothing;

-- Push notification subscriptions
create table if not exists public.push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

-- Enable Realtime on journal_entries, profiles and question_games.
-- Wrapped so re-running the schema doesn't fail if they're already members.
do $$
begin
  alter publication supabase_realtime add table journal_entries;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table profiles;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table question_games;
exception when duplicate_object then null;
end $$;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table journal_entries enable row level security;
drop policy if exists "couple access" on journal_entries;
create policy "couple access" on journal_entries for all using (couple_id = 'cerca-main');

alter table question_games enable row level security;
drop policy if exists "couple access" on question_games;
create policy "couple access" on question_games for all using (couple_id = 'cerca-main');

alter table profiles enable row level security;
drop policy if exists "profiles visible to couple" on profiles;
create policy "profiles visible to couple" on profiles for select using (true);
drop policy if exists "own profile update" on profiles;
create policy "own profile update" on profiles for update using (auth.uid() = id);
drop policy if exists "own profile insert" on profiles;
create policy "own profile insert" on profiles for insert with check (auth.uid() = id);

alter table push_subscriptions enable row level security;
drop policy if exists "own subscriptions" on push_subscriptions;
create policy "own subscriptions" on push_subscriptions for all using (auth.uid() = user_id);
