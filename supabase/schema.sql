-- =============================================================================
-- Domain-restricted Google auth: database schema
-- Run once in Supabase Dashboard -> SQL Editor (safe to re-run).
--
-- What this gives you:
--   1. Server-side domain restriction: a trigger on auth.users rejects any
--      sign-up whose email is not on the allowed domain, so non-domain Google
--      accounts never get a Supabase account or a session.
--   2. public.profiles: user data stored in the database (name, avatar, role).
--   3. Role-based access (admin / user) enforced with Row Level Security.
-- =============================================================================

-- 1. Configuration ------------------------------------------------------------
-- Change the domain here AND in EXPO_PUBLIC_ALLOWED_EMAIL_DOMAIN.
create or replace function public.allowed_email_domain()
returns text
language sql
immutable
set search_path = ''
as $$ select 'hbplus.fit'::text $$;

-- Exact domain match, exactly one "@". Rejects look-alikes such as
-- "user@hbplus.fit.evil.com" and subdomains such as "user@mail.hbplus.fit".
create or replace function public.email_is_allowed(email text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(
    lower(email) ~ ('^[^@[:space:]]+@' || replace(public.allowed_email_domain(), '.', '\.') || '$'),
    false
  );
$$;

-- 2. Tables -------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null unique,
  full_name   text,
  avatar_url  text,
  role        text not null default 'user' check (role in ('admin', 'user')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Emails listed here become admins the first time they sign in.
-- Not readable or writable by app users (RLS on, no policies).
create table if not exists public.admin_emails (
  email text primary key check (email = lower(email))
);

alter table public.profiles     enable row level security;
alter table public.admin_emails enable row level security;

revoke all on public.profiles     from anon;
revoke all on public.admin_emails from anon, authenticated;

-- 3. Helpers ------------------------------------------------------------------
-- security definer so it can read profiles without recursing into RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

-- 4. Row Level Security -------------------------------------------------------
drop policy if exists "profiles: allowed domain only" on public.profiles;
drop policy if exists "profiles: read own"            on public.profiles;
drop policy if exists "profiles: admins read all"     on public.profiles;

-- RESTRICTIVE: every request must come from a JWT on the allowed domain,
-- in addition to matching one of the permissive policies below.
create policy "profiles: allowed domain only"
  on public.profiles as restrictive
  for all to authenticated
  using (public.email_is_allowed(auth.jwt() ->> 'email'));

create policy "profiles: read own"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "profiles: admins read all"
  on public.profiles for select to authenticated
  using (public.is_admin());

-- No insert / update / delete policies: rows are created by the trigger
-- below and roles change only through set_user_role().

-- 5. Sign-up gate + profile creation ------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.email_is_allowed(new.email) then
    -- Aborts the insert: Supabase Auth redirects back with
    -- "Database error saving new user", which the app shows as the
    -- "Access restricted..." message.
    raise exception 'Access restricted. Please login using your official domain email.';
  end if;

  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture'),
    case
      when exists (select 1 from public.admin_emails a where a.email = lower(new.email))
        then 'admin'
      else 'user'
    end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6. Admin-only role management -----------------------------------------------
create or replace function public.set_user_role(target_user uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can change roles' using errcode = '42501';
  end if;
  if new_role not in ('admin', 'user') then
    raise exception 'Invalid role: %', new_role using errcode = '22023';
  end if;
  if target_user = (select auth.uid()) then
    raise exception 'You cannot change your own role' using errcode = '42501';
  end if;

  update public.profiles
     set role = new_role, updated_at = now()
   where id = target_user;
end;
$$;

revoke execute on function public.handle_new_user()             from public, anon, authenticated;
revoke execute on function public.set_user_role(uuid, text)     from public, anon;
grant  execute on function public.set_user_role(uuid, text)     to authenticated;

-- 7. Bootstrap your first admin -----------------------------------------------
-- Before they sign in for the first time:
--   insert into public.admin_emails (email) values ('you@hbplus.fit') on conflict do nothing;
-- Or, if they have already signed in:
--   update public.profiles set role = 'admin' where email = 'you@hbplus.fit';
