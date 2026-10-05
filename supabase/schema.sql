-- Run this once in Supabase: Dashboard -> SQL Editor -> paste -> Run.

create extension if not exists pgcrypto;

create table if not exists mentees (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  track text,
  level text,
  goals text,
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  mentee_id uuid not null references mentees(id) on delete cascade,
  language text,
  code text not null,
  strengths jsonb not null default '[]'::jsonb,
  improvements jsonb not null default '[]'::jsonb,
  next_steps jsonb not null default '[]'::jsonb,
  raw_response text,
  created_at timestamptz not null default now()
);

create index if not exists reviews_mentee_id_idx on reviews (mentee_id, created_at desc);

alter table mentees enable row level security;
alter table reviews enable row level security;

drop policy if exists "mentors manage their own mentees" on mentees;
create policy "mentors manage their own mentees" on mentees
  for all
  using (auth.uid() = mentor_id)
  with check (auth.uid() = mentor_id);

drop policy if exists "mentors manage their mentees' reviews" on reviews;
create policy "mentors manage their mentees' reviews" on reviews
  for all
  using (exists (
    select 1 from mentees m where m.id = reviews.mentee_id and m.mentor_id = auth.uid()
  ))
  with check (exists (
    select 1 from mentees m where m.id = reviews.mentee_id and m.mentor_id = auth.uid()
  ));
