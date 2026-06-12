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

-- Push notification subscriptions
create table if not exists public.push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

-- Enable Realtime on journal_entries and profiles
alter publication supabase_realtime add table journal_entries;
alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table question_games;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table journal_entries enable row level security;
create policy "couple access" on journal_entries for all using (couple_id = 'cerca-main');

alter table question_games enable row level security;
create policy "couple access" on question_games for all using (couple_id = 'cerca-main');

alter table profiles enable row level security;
create policy "profiles visible to couple" on profiles for select using (true);
create policy "own profile update" on profiles for update using (auth.uid() = id);
create policy "own profile insert" on profiles for insert with check (auth.uid() = id);

alter table push_subscriptions enable row level security;
create policy "own subscriptions" on push_subscriptions for all using (auth.uid() = user_id);
