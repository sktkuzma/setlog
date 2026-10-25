-- SET / SetLog user data and cloud recovery history.
-- Safe to rerun: this creates/updates tables, policies and the save function
-- without deleting existing diary data. Browser clients use only the publishable key.

create table if not exists public.setlog_user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null,
  revision bigint not null default 1 check (revision >= 1),
  updated_at timestamptz not null default now(),
  constraint setlog_user_data_payload_object check (jsonb_typeof(payload) = 'object')
);

alter table public.setlog_user_data enable row level security;
revoke all on table public.setlog_user_data from anon, authenticated;
grant select, insert, update on table public.setlog_user_data to authenticated;

drop policy if exists "Users can read their own SetLog state" on public.setlog_user_data;
create policy "Users can read their own SetLog state"
  on public.setlog_user_data for select to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users can insert their own SetLog state" on public.setlog_user_data;
create policy "Users can insert their own SetLog state"
  on public.setlog_user_data for insert to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users can update their own SetLog state" on public.setlog_user_data;
create policy "Users can update their own SetLog state"
  on public.setlog_user_data for update to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

-- Significant cloud changes preserve the preceding state; draft-only saves are rate-limited.
create table if not exists public.setlog_user_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  revision bigint not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  constraint setlog_user_snapshots_payload_object check (jsonb_typeof(payload) = 'object'),
  constraint setlog_user_snapshots_user_revision_unique unique (user_id, revision)
);

create index if not exists setlog_user_snapshots_user_created_idx
  on public.setlog_user_snapshots (user_id, revision desc);

alter table public.setlog_user_snapshots enable row level security;
revoke all on table public.setlog_user_snapshots from anon, authenticated;
grant select, insert, delete on table public.setlog_user_snapshots to authenticated;

drop policy if exists "Users can read their own SetLog snapshots" on public.setlog_user_snapshots;
create policy "Users can read their own SetLog snapshots"
  on public.setlog_user_snapshots for select to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users can create their own SetLog snapshots" on public.setlog_user_snapshots;
create policy "Users can create their own SetLog snapshots"
  on public.setlog_user_snapshots for insert to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users can delete their own SetLog snapshots" on public.setlog_user_snapshots;
create policy "Users can delete their own SetLog snapshots"
  on public.setlog_user_snapshots for delete to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

-- This function runs with caller privileges; RLS remains active inside it.
-- Each account can only change its own row and keep up to 50 previous versions.
create or replace function public.save_setlog_state(
  p_payload jsonb,
  p_expected_revision bigint
)
returns table(revision bigint, updated_at timestamptz)
language plpgsql
security invoker
set search_path = pg_catalog
as $$
declare
  v_user_id uuid := auth.uid();
  v_current_revision bigint;
  v_current_payload jsonb;
  v_latest_snapshot_at timestamptz;
  v_should_snapshot boolean;
  v_new_revision bigint;
  v_updated_at timestamptz;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'invalid_payload';
  end if;
  if pg_column_size(p_payload) > 5242880 then
    raise exception 'payload_too_large';
  end if;
  if p_expected_revision is null or p_expected_revision < 0 then
    raise exception 'invalid_expected_revision';
  end if;

  select s.revision, s.payload into v_current_revision, v_current_payload
  from public.setlog_user_data as s
  where s.user_id = v_user_id
  for update;

  if not found then
    if p_expected_revision <> 0 then
      raise exception 'revision_conflict';
    end if;

    insert into public.setlog_user_data (user_id, payload, revision, updated_at)
    values (v_user_id, p_payload, 1, now())
    on conflict (user_id) do nothing
    returning setlog_user_data.revision, setlog_user_data.updated_at
      into v_new_revision, v_updated_at;

    if v_new_revision is null then
      raise exception 'revision_conflict';
    end if;

    insert into public.setlog_user_snapshots (user_id, revision, payload, created_at)
    values (v_user_id, v_new_revision, p_payload, now())
    on conflict (user_id, revision) do nothing;
  else
    if v_current_revision <> p_expected_revision then
      raise exception 'revision_conflict';
    end if;

    select max(b.created_at) into v_latest_snapshot_at
    from public.setlog_user_snapshots as b
    where b.user_id = v_user_id;

    -- Snapshot meaningful changes immediately; draft-only typing is rate-limited
    -- to one backup at most every 15 minutes to preserve useful history.
    v_should_snapshot := v_latest_snapshot_at is null
      or now() - v_latest_snapshot_at >= interval '15 minutes'
      or (v_current_payload -> 'history') is distinct from (p_payload -> 'history')
      or (v_current_payload -> 'programs') is distinct from (p_payload -> 'programs')
      or (v_current_payload -> 'exerciseCatalog') is distinct from (p_payload -> 'exerciseCatalog')
      or (v_current_payload -> 'archivedPlacements') is distinct from (p_payload -> 'archivedPlacements');

    if v_should_snapshot then
      insert into public.setlog_user_snapshots (user_id, revision, payload, created_at)
      select s.user_id, s.revision, s.payload, now()
      from public.setlog_user_data as s
      where s.user_id = v_user_id
      on conflict (user_id, revision) do nothing;

      delete from public.setlog_user_snapshots as b
      where b.user_id = v_user_id
        and b.id in (
          select old.id
          from public.setlog_user_snapshots as old
          where old.user_id = v_user_id
          order by old.revision desc
          offset 50
        );
    end if;

    update public.setlog_user_data as s
      set payload = p_payload,
          revision = v_current_revision + 1,
          updated_at = now()
      where s.user_id = v_user_id
      returning s.revision, s.updated_at into v_new_revision, v_updated_at;
  end if;

  return query select v_new_revision, v_updated_at;
end;
$$;

revoke all on function public.save_setlog_state(jsonb, bigint) from public, anon;
grant execute on function public.save_setlog_state(jsonb, bigint) to authenticated;

-- Explicitly keep the current cloud state before a user restores or replaces it.
create or replace function public.create_setlog_restore_point(p_expected_revision bigint)
returns boolean
language plpgsql
security invoker
set search_path = pg_catalog
as $$
declare
  v_user_id uuid := auth.uid();
  v_current_revision bigint;
  v_current_payload jsonb;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select s.revision, s.payload into v_current_revision, v_current_payload
  from public.setlog_user_data as s
  where s.user_id = v_user_id
  for update;

  if not found then
    raise exception 'diary_not_found';
  end if;
  if p_expected_revision is null or v_current_revision <> p_expected_revision then
    raise exception 'revision_conflict';
  end if;

  insert into public.setlog_user_snapshots (user_id, revision, payload, created_at)
  values (v_user_id, v_current_revision, v_current_payload, now())
  on conflict (user_id, revision) do nothing;

  delete from public.setlog_user_snapshots as b
  where b.user_id = v_user_id
    and b.id in (
      select old.id
      from public.setlog_user_snapshots as old
      where old.user_id = v_user_id
      order by old.revision desc
      offset 50
    );

  return true;
end;
$$;

revoke all on function public.create_setlog_restore_point(bigint) from public, anon;
grant execute on function public.create_setlog_restore_point(bigint) to authenticated;

-- Create a starting restore point for accounts that already have a saved diary.
-- This is safe to rerun because each user/revision pair is unique.
insert into public.setlog_user_snapshots (user_id, revision, payload, created_at)
select user_id, revision, payload, now()
from public.setlog_user_data
on conflict (user_id, revision) do nothing;
