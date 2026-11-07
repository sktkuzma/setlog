-- SETLOG: do not execute on production before the isolated SQL tests pass.
-- Preserve the exact existing function bodies and table rows. Limit direct writes to RPC.
begin;

create schema if not exists setlog_internal;
revoke all on schema setlog_internal from public, anon, authenticated;
grant usage on schema setlog_internal to authenticated;

do $migration$
begin
  if to_regprocedure('setlog_internal.save_setlog_state(jsonb,bigint)') is null then
    if to_regprocedure('public.save_setlog_state(jsonb,bigint)') is null then
      raise exception 'Expected existing save_setlog_state RPC was not found';
    end if;
    alter function public.save_setlog_state(jsonb,bigint) set schema setlog_internal;
  end if;
  if to_regprocedure('setlog_internal.create_setlog_restore_point(bigint)') is null then
    if to_regprocedure('public.create_setlog_restore_point(bigint)') is null then
      raise exception 'Expected existing create_setlog_restore_point RPC was not found';
    end if;
    alter function public.create_setlog_restore_point(bigint) set schema setlog_internal;
  end if;
end;
$migration$;

-- Only the moved implementation is privileged. It already obtains auth.uid(),
-- checks the expected revision and operates exclusively on that user's row.
alter function setlog_internal.save_setlog_state(jsonb,bigint) security definer;
alter function setlog_internal.save_setlog_state(jsonb,bigint) set search_path = pg_catalog;
alter function setlog_internal.create_setlog_restore_point(bigint) security definer;
alter function setlog_internal.create_setlog_restore_point(bigint) set search_path = pg_catalog;

revoke all on function setlog_internal.save_setlog_state(jsonb,bigint) from public, anon;
revoke all on function setlog_internal.create_setlog_restore_point(bigint) from public, anon;
grant execute on function setlog_internal.save_setlog_state(jsonb,bigint) to authenticated;
grant execute on function setlog_internal.create_setlog_restore_point(bigint) to authenticated;

-- Public API retains precisely the original signatures and SECURITY INVOKER.
create or replace function public.save_setlog_state(
  p_payload jsonb, p_expected_revision bigint
)
returns table(revision bigint, updated_at timestamptz)
language sql security invoker set search_path = pg_catalog
as $fn$
  select * from setlog_internal.save_setlog_state(p_payload, p_expected_revision);
$fn$;

create or replace function public.create_setlog_restore_point(
  p_expected_revision bigint
)
returns boolean
language sql security invoker set search_path = pg_catalog
as $fn$
  select setlog_internal.create_setlog_restore_point(p_expected_revision);
$fn$;

revoke all on function public.save_setlog_state(jsonb,bigint) from public, anon;
revoke all on function public.create_setlog_restore_point(bigint) from public, anon;
grant execute on function public.save_setlog_state(jsonb,bigint) to authenticated;
grant execute on function public.create_setlog_restore_point(bigint) to authenticated;

-- Keep SELECT for UI and conflict resolution. All table mutations go through RPC.
revoke insert, update on public.setlog_user_data from authenticated;
revoke insert, delete on public.setlog_user_snapshots from authenticated;

select pg_notify('pgrst','reload schema');
commit;
