-- ============================================================
-- LOAN TRACKER — SUPABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role text not null check (role in ('admin', 'client')),
  full_name text not null,
  client_id text unique,
  email text not null,
  created_at timestamptz default now() not null
);

-- Loans table
create table public.loans (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  total_amount numeric(12,2) not null,
  amount_paid numeric(12,2) default 0 not null,
  monthly_payment numeric(12,2) not null,
  start_date date not null,
  due_date date not null,
  status text default 'Active' check (status in ('Active', 'Overdue', 'Completed')) not null,
  created_at timestamptz default now() not null
);

-- Payments table
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  loan_id uuid references public.loans(id) on delete cascade not null,
  month text not null,
  amount numeric(12,2) not null,
  paid boolean default false not null,
  recorded_at timestamptz default now() not null
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.loans enable row level security;
alter table public.payments enable row level security;

-- PROFILES POLICIES
-- Admins can read all profiles
create policy "Admins can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Clients can read only their own profile
create policy "Clients can read own profile"
  on public.profiles for select
  using (id = auth.uid());

-- Admins can insert/update profiles
create policy "Admins can insert profiles"
  on public.profiles for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Admins can update profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- LOANS POLICIES
create policy "Admins can read all loans"
  on public.loans for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Clients can read own loan"
  on public.loans for select
  using (profile_id = auth.uid());

create policy "Admins can insert loans"
  on public.loans for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Admins can update loans"
  on public.loans for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- PAYMENTS POLICIES
create policy "Admins can read all payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Clients can read own payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.loans l
      where l.id = payments.loan_id and l.profile_id = auth.uid()
    )
  );

create policy "Admins can insert payments"
  on public.payments for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Admins can update payments"
  on public.payments for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================
-- FUNCTION: Auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name, email, client_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'client'),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    new.raw_user_meta_data->>'client_id'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- REALTIME: Enable for loans and payments
-- ============================================================
alter publication supabase_realtime add table public.loans;
alter publication supabase_realtime add table public.payments;
