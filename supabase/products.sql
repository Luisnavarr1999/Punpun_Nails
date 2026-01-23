create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  price text not null,
  image text not null,
  available boolean default true,
  created_at timestamptz default now()
);

alter table public.products enable row level security;

create policy "public read products"
  on public.products
  for select
  using (true);