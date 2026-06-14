-- The Boardroom — initial schema
-- Run with: supabase db push  (or paste into the Supabase SQL editor)

create extension if not exists "pgcrypto";

-- ── Users (mirrors auth.users) ──
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  name text,
  avatar_url text,
  stripe_customer_id text,
  plan text not null default 'free',
  created_at timestamptz not null default now()
);

-- ── Boards ──
create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  purpose text,
  values text,
  goals text,
  charter_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Board members ──
create table if not exists public.board_members (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  name text not null,
  role text,
  type text not null check (type in ('real_person', 'custom')),
  persona_prompt text not null,
  voice_id text,
  avatar_id text,
  archetype text not null check (
    archetype in ('challenger','sponsor','expert','confidant','connector','values_anchor')
  ),
  attributes jsonb,
  created_at timestamptz not null default now()
);

-- ── Sessions ──
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  title text,
  presentation_text text,
  presentation_type text not null default 'text'
    check (presentation_type in ('text','voice','document')),
  status text not null default 'active' check (status in ('active','completed')),
  synthesis text,
  created_at timestamptz not null default now()
);

-- ── Session responses (parallel board responses) ──
create table if not exists public.session_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  member_id uuid references public.board_members (id) on delete set null,
  response_text text,
  audio_url text,
  video_url text,
  created_at timestamptz not null default now()
);

-- ── Conversation turns (chat / live back-and-forth) ──
create table if not exists public.conversation_turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  speaker text not null, -- 'user' or a board_members.id
  content text,
  audio_url text,
  video_url text,
  turn_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_boards_user on public.boards (user_id);
create index if not exists idx_members_board on public.board_members (board_id);
create index if not exists idx_sessions_board on public.sessions (board_id);
create index if not exists idx_responses_session on public.session_responses (session_id);
create index if not exists idx_turns_session on public.conversation_turns (session_id);

-- ── Row Level Security ──
alter table public.users enable row level security;
alter table public.boards enable row level security;
alter table public.board_members enable row level security;
alter table public.sessions enable row level security;
alter table public.session_responses enable row level security;
alter table public.conversation_turns enable row level security;

create policy "users self" on public.users
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "boards owner" on public.boards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "members via board" on public.board_members
  for all using (
    exists (select 1 from public.boards b where b.id = board_id and b.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.boards b where b.id = board_id and b.user_id = auth.uid())
  );

create policy "sessions via board" on public.sessions
  for all using (
    exists (select 1 from public.boards b where b.id = board_id and b.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.boards b where b.id = board_id and b.user_id = auth.uid())
  );

create policy "responses via session" on public.session_responses
  for all using (
    exists (
      select 1 from public.sessions s join public.boards b on b.id = s.board_id
      where s.id = session_id and b.user_id = auth.uid()
    )
  );

create policy "turns via session" on public.conversation_turns
  for all using (
    exists (
      select 1 from public.sessions s join public.boards b on b.id = s.board_id
      where s.id = session_id and b.user_id = auth.uid()
    )
  );
