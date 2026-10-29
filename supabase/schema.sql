-- Lunorb database schema.
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste this file → Run.
-- Safe to re-run: every statement is idempotent.

-- ───────────────────────── tables ─────────────────────────

-- Public profile: what other signed-in members see in the community.
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 60),
  handle       text unique check (handle ~ '^[a-z0-9_.]{3,24}$'),
  created_at   timestamptz not null default now()
);

-- Private app state (saved tools, notes, board, progress). Owner only.
create table if not exists public.user_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb check (pg_column_size(data) < 524288),
  updated_at timestamptz not null default now()
);

-- Billing. The owner can read it; only the server (Stripe webhook, service role) writes it.
create table if not exists public.subscriptions (
  user_id                uuid primary key references auth.users(id) on delete cascade,
  plan                   text not null default 'free' check (plan in ('free', 'pro')),
  status                 text,
  stripe_customer_id     text unique,
  stripe_subscription_id text unique,
  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,
  updated_at             timestamptz not null default now()
);

create table if not exists public.workflows (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  name         text not null check (char_length(name) between 1 and 120),
  description  text not null default '' check (char_length(description) <= 500),
  input        text not null default '' check (char_length(input) <= 2000),
  steps        jsonb not null default '[]'::jsonb check (
                 jsonb_typeof(steps) = 'array' and jsonb_array_length(steps) between 1 and 30 and pg_column_size(steps) < 65536),
  is_public    boolean not null default false,
  published_at timestamptz,
  likes_count  integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists workflows_owner_idx  on public.workflows (user_id, updated_at desc);
create index if not exists workflows_public_idx on public.workflows (likes_count desc, published_at desc) where is_public;

create table if not exists public.workflow_likes (
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, workflow_id)
);
create index if not exists workflow_likes_wf_idx on public.workflow_likes (workflow_id);

create table if not exists public.follows (
  follower_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  followee_id uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);
create index if not exists follows_followee_idx on public.follows (followee_id);

-- ───────────────────────── row-level security ─────────────────────────

alter table public.profiles       enable row level security;
alter table public.user_state     enable row level security;
alter table public.subscriptions  enable row level security;
alter table public.workflows      enable row level security;
alter table public.workflow_likes enable row level security;
alter table public.follows        enable row level security;

drop policy if exists "profiles: members can read" on public.profiles;
create policy "profiles: members can read" on public.profiles for select to authenticated using (true);
drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "state: owner only" on public.user_state;
create policy "state: owner only" on public.user_state for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "subscriptions: read own" on public.subscriptions;
create policy "subscriptions: read own" on public.subscriptions for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "workflows: read own or public" on public.workflows;
create policy "workflows: read own or public" on public.workflows for select to authenticated
  using (is_public or (select auth.uid()) = user_id);
drop policy if exists "workflows: insert own" on public.workflows;
create policy "workflows: insert own" on public.workflows for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists "workflows: update own" on public.workflows;
create policy "workflows: update own" on public.workflows for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "workflows: delete own" on public.workflows;
create policy "workflows: delete own" on public.workflows for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "likes: read own" on public.workflow_likes;
create policy "likes: read own" on public.workflow_likes for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "likes: like public workflows" on public.workflow_likes;
create policy "likes: like public workflows" on public.workflow_likes for insert to authenticated
  with check ((select auth.uid()) = user_id
              and exists (select 1 from public.workflows w where w.id = workflow_id and w.is_public));
drop policy if exists "likes: remove own" on public.workflow_likes;
create policy "likes: remove own" on public.workflow_likes for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "follows: members can read" on public.follows;
create policy "follows: members can read" on public.follows for select to authenticated using (true);
drop policy if exists "follows: follow" on public.follows;
create policy "follows: follow" on public.follows for insert to authenticated
  with check ((select auth.uid()) = follower_id);
drop policy if exists "follows: unfollow" on public.follows;
create policy "follows: unfollow" on public.follows for delete to authenticated
  using ((select auth.uid()) = follower_id);

-- Column privileges: members can't set counters, plans, owners or timestamps themselves.
revoke all on public.profiles, public.user_state, public.subscriptions, public.workflows, public.workflow_likes, public.follows from anon;
revoke insert, update on public.profiles from authenticated;
grant  update (display_name, handle) on public.profiles to authenticated;
revoke insert, update, delete on public.subscriptions from authenticated;
revoke insert, update on public.workflows from authenticated;
grant  insert (name, description, input, steps, is_public) on public.workflows to authenticated;
grant  update (name, description, input, steps, is_public) on public.workflows to authenticated;
revoke update on public.workflow_likes, public.follows from authenticated;

-- ───────────────────────── triggers ─────────────────────────

-- Every new account gets a profile, an empty state row and a free plan.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
    values (new.id, left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), split_part(new.email, '@', 1)), 60))
    on conflict do nothing;
  insert into public.user_state (user_id) values (new.id) on conflict do nothing;
  insert into public.subscriptions (user_id) values (new.id) on conflict do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_state() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;
drop trigger if exists user_state_touch on public.user_state;
create trigger user_state_touch before insert or update on public.user_state
  for each row execute function public.touch_state();

-- Content edits bump updated_at; publishing stamps published_at. Like-count changes leave both alone.
create or replace function public.touch_workflow() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and (new.name, new.description, new.input, new.steps, new.is_public)
                     is not distinct from (old.name, old.description, old.input, old.steps, old.is_public) then
    return new;
  end if;
  new.updated_at := now();
  if new.is_public and (tg_op = 'INSERT' or not old.is_public) then new.published_at := now(); end if;
  if not new.is_public then new.published_at := null; end if;
  return new;
end $$;
drop trigger if exists workflows_touch on public.workflows;
create trigger workflows_touch before insert or update on public.workflows
  for each row execute function public.touch_workflow();

-- Free plan: up to 3 saved workflows. Enforced here so it can't be bypassed from the browser.
create or replace function public.enforce_workflow_limit() returns trigger
language plpgsql security definer set search_path = '' as $$
declare saved int;
begin
  perform pg_advisory_xact_lock(hashtext(new.user_id::text));
  if exists (select 1 from public.subscriptions s where s.user_id = new.user_id and s.plan = 'pro') then
    return new;
  end if;
  select count(*) into saved from public.workflows w where w.user_id = new.user_id;
  if saved >= 3 then
    raise exception 'FREE_LIMIT' using hint = 'Free accounts can save 3 workflows. Upgrade to Pro for unlimited.';
  end if;
  return new;
end $$;
drop trigger if exists workflows_limit on public.workflows;
create trigger workflows_limit before insert on public.workflows
  for each row execute function public.enforce_workflow_limit();

create or replace function public.sync_like_count() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    update public.workflows set likes_count = likes_count + 1 where id = new.workflow_id;
  else
    update public.workflows set likes_count = greatest(likes_count - 1, 0) where id = old.workflow_id;
  end if;
  return null;
end $$;
drop trigger if exists workflow_likes_count on public.workflow_likes;
create trigger workflow_likes_count after insert or delete on public.workflow_likes
  for each row execute function public.sync_like_count();

-- ───────────────────────── community view ─────────────────────────

-- Members who have published at least one workflow, with real counts. Runs with the caller's permissions.
create or replace view public.creators with (security_invoker = true) as
  select p.id, p.display_name, p.handle,
         count(w.id)::int                                                     as workflows,
         coalesce(sum(w.likes_count), 0)::int                                 as likes,
         (select count(*) from public.follows f where f.followee_id = p.id)::int as followers
  from public.profiles p
  join public.workflows w on w.user_id = p.id and w.is_public
  group by p.id;
revoke all on public.creators from anon;
grant select on public.creators to authenticated;

-- Accounts created before this schema ran still get their rows.
insert into public.profiles (id, display_name)
  select id, left(split_part(email, '@', 1), 60) from auth.users on conflict do nothing;
insert into public.user_state (user_id) select id from auth.users on conflict do nothing;
insert into public.subscriptions (user_id) select id from auth.users on conflict do nothing;
