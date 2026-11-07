-- Minimal simulation of the Supabase Auth schema for isolated PostgreSQL tests.
create role authenticated nologin;
create role anon nologin;
create schema auth;
create table auth.users (id uuid primary key);
create or replace function auth.uid() returns uuid
language sql stable set search_path = pg_catalog
as $fn$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $fn$;
grant usage on schema auth, public to authenticated;
grant execute on function auth.uid() to authenticated;

insert into auth.users(id) values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
