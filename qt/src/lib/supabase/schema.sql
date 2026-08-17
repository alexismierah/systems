-- =========================================================
-- PROFILES TABLE
-- =========================================================

create table public.profiles (
  id uuid primary key
    references auth.users(id)
    on delete cascade,

  full_name text not null,

  email text,

  avatar_url text,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()
);


-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

alter table public.profiles
enable row level security;


-- =========================================================
-- SELECT
-- =========================================================

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (
  auth.uid() = id
);


-- =========================================================
-- INSERT
-- =========================================================

create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (
  auth.uid() = id
);


-- =========================================================
-- UPDATE
-- =========================================================

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (
  auth.uid() = id
)
with check (
  auth.uid() = id
);


-- =========================================================
-- DELETE
-- =========================================================

create policy "Users can delete their own profile"
on public.profiles
for delete
to authenticated
using (
  auth.uid() = id
);


-- =========================================================
-- CREATE PROFILE AUTOMATICALLY
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  insert into public.profiles (
    id,
    full_name,
    email
  )

  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      ''
    ),
    new.email
  );

  return new;

end;
$$;


-- =========================================================
-- USER CREATED TRIGGER
-- =========================================================

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();


-- =========================================================
-- UPDATED AT
-- =========================================================

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin

  new.updated_at = now();

  return new;

end;
$$;


create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at();