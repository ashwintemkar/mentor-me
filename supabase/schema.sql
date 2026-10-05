-- Run this in Supabase: Dashboard -> SQL Editor -> paste -> Run.
-- This REPLACES the earlier single-sided "mentees" model with real
-- two-sided mentor/mentee relationships. Safe to run even if the old
-- mentees/reviews tables already exist (they get dropped and recreated).

create extension if not exists pgcrypto;

drop table if exists reviews cascade;
drop table if exists mentees cascade;
drop table if exists connections cascade;
drop table if exists profiles cascade;

-- Every signed-in user gets a profile with a unique username, so they can
-- be found and invited regardless of which auth provider they used.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  created_at timestamptz not null default now()
);

-- One row per mentor<->mentee relationship. Either side can initiate:
-- a mentor can invite someone to be their mentee, or a mentee can request
-- someone to be their mentor. The other side accepts or declines.
create table connections (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references profiles(id) on delete cascade,
  mentee_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  initiated_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint no_self_mentoring check (mentor_id <> mentee_id),
  unique (mentor_id, mentee_id)
);

create index connections_mentor_idx on connections (mentor_id, status);
create index connections_mentee_idx on connections (mentee_id, status);

-- Reviews now belong to an accepted connection, not a mentor-authored profile.
create table reviews (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references connections(id) on delete cascade,
  submitted_by uuid not null references profiles(id),
  language text,
  code text not null,
  strengths jsonb not null default '[]'::jsonb,
  improvements jsonb not null default '[]'::jsonb,
  next_steps jsonb not null default '[]'::jsonb,
  raw_response text,
  created_at timestamptz not null default now()
);

create index reviews_connection_idx on reviews (connection_id, created_at desc);

alter table profiles enable row level security;
alter table connections enable row level security;
alter table reviews enable row level security;

-- Anyone signed in can look up profiles by username (needed to invite/request
-- people), but you can only create/update your own profile row.
create policy "profiles are readable by any signed-in user" on profiles
  for select using (auth.uid() is not null);

create policy "users manage only their own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "users update only their own profile" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Either party of a connection can see it, respond to it, or create a new one
-- (as long as they're actually one of the two people in it).
create policy "either party can view a connection" on connections
  for select using (auth.uid() = mentor_id or auth.uid() = mentee_id);

create policy "a party can create a connection they're part of" on connections
  for insert with check (
    (auth.uid() = mentor_id or auth.uid() = mentee_id) and auth.uid() = initiated_by
  );

create policy "either party can update a connection" on connections
  for update
  using (auth.uid() = mentor_id or auth.uid() = mentee_id)
  with check (auth.uid() = mentor_id or auth.uid() = mentee_id);

-- Reviews are only visible/writable by the two people in the connection,
-- and only once that connection is accepted.
create policy "connection parties can view reviews" on reviews
  for select using (exists (
    select 1 from connections c
    where c.id = reviews.connection_id
      and (c.mentor_id = auth.uid() or c.mentee_id = auth.uid())
  ));

create policy "connection parties can add reviews once accepted" on reviews
  for insert with check (exists (
    select 1 from connections c
    where c.id = reviews.connection_id
      and c.status = 'accepted'
      and (c.mentor_id = auth.uid() or c.mentee_id = auth.uid())
  ));
