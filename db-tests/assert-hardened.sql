-- Must preserve old snapshots and unchanged second account while hardening.
do $test$
begin
 if (select count(*) from public.setlog_user_data)<>2 then raise exception 'Diaries lost'; end if;
 if (select count(*) from public.setlog_user_snapshots)<>2 then raise exception 'Snapshots lost'; end if;
 if (select revision from public.setlog_user_data where user_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')<>5
 then raise exception 'Second account revision changed'; end if;
 if has_table_privilege('authenticated','public.setlog_user_data','INSERT')
    or has_table_privilege('authenticated','public.setlog_user_data','UPDATE')
    or has_table_privilege('authenticated','public.setlog_user_snapshots','INSERT')
    or has_table_privilege('authenticated','public.setlog_user_snapshots','DELETE')
 then raise exception 'Direct table writes still allowed'; end if;
 if not has_table_privilege('authenticated','public.setlog_user_data','SELECT') then raise exception 'Diary read denied'; end if;
 if has_function_privilege('anon','public.save_setlog_state(jsonb,bigint)','EXECUTE')
    or has_function_privilege('anon','public.create_setlog_restore_point(bigint)','EXECUTE')
 then raise exception 'Anonymous RPC access granted'; end if;
 if not (select prosecdef from pg_proc where oid='setlog_internal.save_setlog_state(jsonb,bigint)'::regprocedure)
 then raise exception 'Protected RPC is not definer'; end if;
 if (select prosecdef from pg_proc where oid='public.save_setlog_state(jsonb,bigint)'::regprocedure)
 then raise exception 'Public RPC should be invoker'; end if;
end;
$test$;

select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false);
set role authenticated;

-- The authenticated caller still reads only their own row via RLS.
do $test$
begin
 if (select count(*) from public.setlog_user_data)<>1 then raise exception 'RLS leak'; end if;
 if (select count(*) from public.setlog_user_snapshots)<>1 then raise exception 'RLS snapshot leak'; end if;
 if (select revision from public.setlog_user_data)<>3 then raise exception 'A revision changed unexpectedly'; end if;
end;
$test$;

-- Both user-visible RPCs must still work with the existing signatures.
select * from public.save_setlog_state('{"history":[{"id":"training-a"},{"id":"training-a2"}],"programs":[]}'::jsonb,3);
select public.create_setlog_restore_point(4);

do $test$
begin
 if (select revision from public.setlog_user_data)<>4 then raise exception 'RPC save failed'; end if;
 if (select count(*) from public.setlog_user_snapshots)<2 then raise exception 'RPC snapshot lost'; end if;
 begin
   perform public.save_setlog_state('{"history":[],"programs":[]}'::jsonb,2);
   raise exception 'Stale revision unexpectedly accepted';
 exception when raise_exception then
   if sqlerrm<>'revision_conflict' then raise; end if;
 end;
end;
$test$;
reset role;

-- Verify a different account was not modified by privileged RPCs.
do $test$
begin
 if (select revision from public.setlog_user_data where user_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')<>5
 then raise exception 'Cross-user write occurred'; end if;
 if (select count(*) from public.setlog_user_snapshots where user_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')<>1
 then raise exception 'Cross-user snapshot changed'; end if;
end;
$test$;
