alter table public.users
  add column if not exists email text,
  add column if not exists password_hash text;

create unique index if not exists users_email_unique_idx
  on public.users(lower(email))
  where email is not null;
