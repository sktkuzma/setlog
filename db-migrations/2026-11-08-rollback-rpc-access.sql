-- Emergency rollback; does not modify user diary or snapshot rows.
begin;

grant select, insert, update on public.setlog_user_data to authenticated;
grant select, insert, delete on public.setlog_user_snapshots to authenticated;

drop function if exists public.save_setlog_state(jsonb,bigint);
drop function if exists public.create_setlog_restore_point(bigint);

alter function setlog_internal.save_setlog_state(jsonb,bigint) security invoker;
alter function setlog_internal.create_setlog_restore_point(bigint) security invoker;
alter function setlog_internal.save_setlog_state(jsonb,bigint) set schema public;
alter function setlog_internal.create_setlog_restore_point(bigint) set schema public;

revoke all on function public.save_setlog_state(jsonb,bigint) from public, anon;
revoke all on function public.create_setlog_restore_point(bigint) from public, anon;
grant execute on function public.save_setlog_state(jsonb,bigint) to authenticated;
grant execute on function public.create_setlog_restore_point(bigint) to authenticated;

revoke usage on schema setlog_internal from authenticated;
select pg_notify('pgrst','reload schema');
commit;
