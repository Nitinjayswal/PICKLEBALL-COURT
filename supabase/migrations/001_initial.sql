-- Run this in the Supabase SQL editor or via supabase db push

create extension if not exists "pgcrypto";

create table if not exists public.blackouts (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  court_id text not null default 'main',
  start_at timestamptz not null,
  end_at timestamptz not null,
  name text not null,
  email text not null,
  phone text not null,
  notes text,
  status text not null default 'confirmed',
  created_at timestamptz not null default now(),
  constraint bookings_time_ok check (end_at > start_at),
  constraint bookings_unique_slot unique (court_id, start_at)
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists bookings_start_idx on public.bookings (start_at);
create index if not exists blackouts_range_idx on public.blackouts (starts_at, ends_at);

alter table public.bookings enable row level security;
alter table public.blackouts enable row level security;
alter table public.inquiries enable row level security;

-- No direct client access; Next.js API routes use the service role key.
