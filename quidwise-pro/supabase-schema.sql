-- ============================================
-- QuidWise Pro — Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- USER PROFILES
create table public.profiles (
  id uuid references auth.users primary key,
  full_name text,
  business_name text,
  employment_type text default 'sole_trader',
  tax_year text default '2025-26',
  income_band text default 'basic',
  vat_registered boolean default false,
  stripe_customer_id text,
  subscription_status text default 'none',
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  preferred_categories text[],
  mileage_method text default 'simplified',
  home_office_method text default 'flat_rate',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- EXPENSES
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  amount numeric(10,2) not null,
  description text,
  merchant text,
  date date not null,
  category_id text not null,
  hmrc_box text not null,
  is_partial_claim boolean default false,
  business_proportion integer default 100,
  claimable_amount numeric(10,2) generated always as (
    round(amount * business_proportion / 100, 2)
  ) stored,
  includes_vat boolean default false,
  vat_amount numeric(10,2),
  receipt_image_path text,
  receipt_thumbnail_path text,
  ai_extracted_data jsonb,
  entry_method text default 'manual',
  payment_method text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- MILEAGE LOG
create table public.mileage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  date date not null,
  from_location text not null,
  to_location text not null,
  miles numeric(8,1) not null,
  purpose text not null,
  is_return_trip boolean default false,
  rate_pence numeric(5,1) not null default 45.0,
  amount numeric(10,2) generated always as (
    round(miles * rate_pence / 100, 2)
  ) stored,
  created_at timestamptz default now()
);

-- SAVED ROUTES
create table public.saved_routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  from_location text not null,
  to_location text not null,
  miles numeric(8,1) not null,
  is_return boolean default true,
  created_at timestamptz default now()
);

-- AI USAGE TRACKING
create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  billing_period text not null,
  receipt_scans integer default 0,
  categorisation_queries integer default 0,
  estimated_cost_pence integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, billing_period)
);

-- INDEXES
create index idx_expenses_user_date on public.expenses(user_id, date desc);
create index idx_expenses_user_category on public.expenses(user_id, category_id);
create index idx_mileage_user_date on public.mileage(user_id, date desc);
create index idx_ai_usage_user_period on public.ai_usage(user_id, billing_period);

-- ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.expenses enable row level security;
alter table public.mileage enable row level security;
alter table public.saved_routes enable row level security;
alter table public.ai_usage enable row level security;

create policy "Own data only" on public.profiles for all using (auth.uid() = id);
create policy "Own data only" on public.expenses for all using (auth.uid() = user_id);
create policy "Own data only" on public.mileage for all using (auth.uid() = user_id);
create policy "Own data only" on public.saved_routes for all using (auth.uid() = user_id);
create policy "Own data only" on public.ai_usage for all using (auth.uid() = user_id);

-- FUNCTION: Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

