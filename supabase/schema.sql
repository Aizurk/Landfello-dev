-- Landfello properties schema (replaces Azure Cosmos DB)
-- Run this in the Supabase SQL Editor for your project.
--
-- Core columns saved from the Add Property form:
--   id            → auto-generated property ID (UUID)
--   user_id       → Firebase UID of the user who created it
--   title
--   description
--   country
--   city
--   property_type
--   area_acres
--   price         → sale listings (monthly_rent for rentals)
--
-- Additional columns keep contact info, images, tags, tenure/lease, etc.

create extension if not exists "pgcrypto";

create table if not exists public.properties (
  -- Generated property ID
  id uuid primary key default gen_random_uuid(),
  -- Firebase Auth UID of the creator
  user_id text not null,
  email text,
  listing_type text not null check (listing_type in ('sale', 'rent')),
  title text not null,
  description text not null,
  country text not null,
  city text not null,
  neighborhood text,
  property_type text not null check (
    property_type in ('Residential', 'Commercial', 'Agricultural', 'Mixed Use')
  ),
  area_acres numeric not null default 0,
  tenure text check (tenure is null or tenure in ('Freehold', 'Leasehold')),
  lease_term text check (
    lease_term is null or lease_term in ('Short-term', 'Long-term', 'Flexible')
  ),
  price numeric,
  monthly_rent numeric,
  tags text[] not null default '{}',
  images text[] not null default '{}',
  contact_name text not null,
  contact_phone text not null,
  contact_email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  verified boolean not null default false,
  days_on_market integer not null default 0
);

create index if not exists properties_user_id_idx on public.properties (user_id);
create index if not exists properties_created_at_idx on public.properties (created_at desc);
create index if not exists properties_listing_type_idx on public.properties (listing_type);
create index if not exists properties_country_idx on public.properties (country);

-- Keep updated_at fresh on row changes
create or replace function public.set_properties_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
  before update on public.properties
  for each row
  execute function public.set_properties_updated_at();

-- Auth is handled by Firebase via the Express API.
-- The backend uses the Supabase service_role key, which bypasses RLS.
-- These policies are a safety net if someone uses the anon key directly.
alter table public.properties enable row level security;

drop policy if exists "Public can read properties" on public.properties;
create policy "Public can read properties"
  on public.properties
  for select
  using (true);

-- Writes go through the Express API with the service_role key.
-- Do not grant insert/update/delete to anon/authenticated for this table
-- unless you later migrate auth to Supabase Auth.
