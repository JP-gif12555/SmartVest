-- Create OTP codes table
create table if not exists public.otp_codes (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  code text not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add RLS policies for OTP codes
alter table public.otp_codes enable row level security;

-- Create policy to allow service role to manage OTP codes
create policy "Service role can manage OTP codes"
  on public.otp_codes
  for all
  using (true)
  with check (true);

-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  trial_start_date timestamp with time zone default timezone('utc'::text, now()) not null,
  trial_end_date timestamp with time zone default (timezone('utc'::text, now()) + interval '14 days') not null,
  subscription_status text check (subscription_status in ('trial', 'pro', 'expired', 'lifetime')) default 'trial' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create function to handle trial status
create or replace function public.handle_trial_status()
returns trigger as $$
begin
  if new.trial_end_date < now() then
    new.subscription_status = 'expired';
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for trial status
create trigger on_trial_update
  before update on public.profiles
  for each row
  execute function public.handle_trial_status();

-- Create function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Add check constraint for subscription status
alter table profiles
  add constraint valid_subscription_status
  check (subscription_status in ('trial', 'pro', 'lifetime', 'expired'));

-- Create profiles table if it doesn't exist
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  wallet_address text,
  trial_start_date timestamp with time zone,
  trial_end_date timestamp with time zone,
  subscription_status text default 'trial',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table profiles enable row level security;

-- Create policies
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id); 