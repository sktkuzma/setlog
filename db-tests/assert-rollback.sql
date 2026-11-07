do $test$
begin
 if not has_table_privilege('authenticated','public.setlog_user_data','INSERT')
   or not has_table_privilege('authenticated','public.setlog_user_data','UPDATE')
   or not has_table_privilege('authenticated','public.setlog_user_snapshots','INSERT')
   or not has_table_privilege('authenticated','public.setlog_user_snapshots','DELETE')
 then raise exception 'Rollback did not restore grants'; end if;
 if (select prosecdef from pg_proc where oid='public.save_setlog_state(jsonb,bigint)'::regprocedure)
 then raise exception 'Rollback did not restore SECURITY INVOKER'; end if;
 if (select count(*) from public.setlog_user_data)<>2 then raise exception 'Rollback changed diaries'; end if;
end;
$test$;
