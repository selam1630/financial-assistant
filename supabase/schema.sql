create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  password_hash text,
  business_name text not null,
  business_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  price numeric not null default 0,
  stock integer not null default 0
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_name text not null,
  quantity integer not null,
  price numeric not null,
  total numeric not null,
  created_at timestamptz not null default now()
);

create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  message text not null,
  type text not null default 'general',
  created_at timestamptz not null default now()
);

create index if not exists products_user_id_idx on public.products(user_id);
create unique index if not exists users_email_unique_idx
  on public.users(lower(email))
  where email is not null;
create index if not exists transactions_user_id_created_at_idx
  on public.transactions(user_id, created_at desc);
create index if not exists insights_user_id_created_at_idx
  on public.insights(user_id, created_at desc);
