-- SET / SetLog cloud-state storage v1 for project `setlog`.
-- Safe to rerun: creates/replaces policies and function without deleting user data.
-- Row Level Security restricts every row to auth.uid(). The client uses only the
-- public publishable key. Never expose service_role/secret keys in GitHub Pages.

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

-- This function runs with caller privileges; RLS remains active inside it.
-- It can read/write only the row whose user_id matches auth.uid().
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

  select s.revision into v_current_revision
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
  else
    if v_current_revision <> p_expected_revision then
      raise exception 'revision_conflict';
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
