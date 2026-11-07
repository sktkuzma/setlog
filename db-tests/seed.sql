-- Seed pre-existing data to prove migration never replaces or deletes it.
insert into public.setlog_user_data(user_id,payload,revision) values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','{"history":[{"id":"training-a"}],"programs":[]}',3),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','{"history":[{"id":"training-b"}],"programs":[]}',5);
insert into public.setlog_user_snapshots(user_id,revision,payload) values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',1,'{"history":[{"id":"old-a"}],"programs":[]}'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',1,'{"history":[{"id":"old-b"}],"programs":[]}');
