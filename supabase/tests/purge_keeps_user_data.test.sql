-- D-073: the 30-day purge never deletes or orphans user-created rows.
-- Run by scripts/test-sql.sh against a scratch database with every
-- migration applied. Everything happens in one transaction that is rolled
-- back; a failed assert aborts the run with a non-zero exit.

begin;

insert into auth.users (id, email, raw_user_meta_data)
values ('00000000-0000-0000-0000-0000000000a1', 'owner@example.com', '{}');
insert into public.workspaces (id, name, slug, owner_id)
values ('00000000-0000-0000-0000-0000000000b1', 'WS', 'ws', '00000000-0000-0000-0000-0000000000a1');

-- Five stale, untracked channels with no videos -- exactly what the purge
-- deletes -- four of them referenced by a user row.
insert into public.channels (id, youtube_channel_id, name, youtube_created_at, last_synced_at, subscriber_count)
select ('00000000-0000-0000-0000-0000000000c' || n)::uuid, 'UC' || n, 'Channel ' || n, '2020-01-01',
       now() - interval '40 days', 1000
from generate_series(1, 5) n;

insert into public.calendar_entries (id, user_id, workspace_id, channel_id, title)
values ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000a1',
        '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000c1', 'Script ep. 1');
insert into public.calendar_entries (id, user_id, workspace_id, channel_id, title, deleted_at)
values ('00000000-0000-0000-0000-0000000000d2', '00000000-0000-0000-0000-0000000000a1',
        '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000c2', 'Trashed idea', now());
insert into public.notification_channel_overrides (user_id, channel_id)
values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000c3');
insert into public.tasks (id, workspace_id, title, created_by, linked_type, linked_id)
values ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-0000000000b1', 'Research',
        '00000000-0000-0000-0000-0000000000a1', 'channel', '00000000-0000-0000-0000-0000000000c4');

select * from public.purge_stale_youtube_data(30);

do $$
begin
  -- The calendar entry survives, still linked to its channel.
  assert (select channel_id from public.calendar_entries
          where id = '00000000-0000-0000-0000-0000000000d1')
         = '00000000-0000-0000-0000-0000000000c1',
    'calendar entry lost its channel';
  assert (select channel_id from public.calendar_entries
          where id = '00000000-0000-0000-0000-0000000000d2')
         = '00000000-0000-0000-0000-0000000000c2',
    'soft-deleted calendar entry lost its channel';
  assert exists (select 1 from public.notification_channel_overrides
                 where channel_id = '00000000-0000-0000-0000-0000000000c3'),
    'notification override was deleted';
  assert exists (select 1 from public.tasks t join public.channels c on c.id = t.linked_id
                 where t.id = '00000000-0000-0000-0000-0000000000e1'),
    'task link now dangles';

  -- Referenced channels are emptied (YouTube data gone), not deleted.
  assert (select count(*) from public.channels
          where id in ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000c2',
                       '00000000-0000-0000-0000-0000000000c3', '00000000-0000-0000-0000-0000000000c4')
            and name = '' and subscriber_count = 0) = 4,
    'referenced channels were not emptied';
  -- The unreferenced one is still deleted.
  assert not exists (select 1 from public.channels where id = '00000000-0000-0000-0000-0000000000c5'),
    'unreferenced stale channel was kept';
end $$;

-- Backstops at the FK level, whatever path deletes rows.
insert into public.videos (id, youtube_video_id, channel_id, title, thumbnail_url, duration_seconds, published_at, last_synced_at)
values ('00000000-0000-0000-0000-0000000000f1', 'vid1', '00000000-0000-0000-0000-0000000000c1',
        'T', 't', 60, now(), now());
insert into public.prompts (id, user_id, source_video_id, output)
values ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-0000000000a1',
        '00000000-0000-0000-0000-0000000000f1', '{}');

do $$
begin
  begin
    delete from public.videos where id = '00000000-0000-0000-0000-0000000000f1';
    raise exception 'deleting a prompted video succeeded; prompts FK must be RESTRICT';
  exception when foreign_key_violation then
    null; -- expected
  end;
  assert exists (select 1 from public.prompts where id = '00000000-0000-0000-0000-000000000011'),
    'prompt was deleted';

  -- A direct channel delete (not the purge) still keeps the calendar entry.
  delete from public.prompts where id = '00000000-0000-0000-0000-000000000011';
  delete from public.channels where id = '00000000-0000-0000-0000-0000000000c1';
  assert (select channel_id from public.calendar_entries
          where id = '00000000-0000-0000-0000-0000000000d1') is null,
    'calendar entry did not survive a channel delete';
end $$;

rollback;
