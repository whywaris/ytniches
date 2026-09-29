-- D-077: channel_niches allows one primary per channel; the purge expires
-- view readings older than 30 days and clears an emptied channel's tags.
-- Run by scripts/test-sql.sh; everything is rolled back.

begin;

insert into public.niches (id, slug, name, category)
values ('00000000-0000-0000-0000-00000000f001', 'sql-test-niche-a', 'SQL test niche A', 'Entertainment & Stories'),
       ('00000000-0000-0000-0000-00000000f002', 'sql-test-niche-b', 'SQL test niche B', 'History & Mythology');

insert into public.channels (id, youtube_channel_id, name, youtube_created_at, last_synced_at, subscriber_count)
values ('00000000-0000-0000-0000-00000000f101', 'UCfresh', 'Fresh', '2020-01-01', now(), 1000),
       ('00000000-0000-0000-0000-00000000f102', 'UCstale', 'Stale', '2020-01-01', now() - interval '40 days', 1000);

-- Tracked, so the stale one is emptied, not deleted.
insert into auth.users (id, email, raw_user_meta_data)
values ('00000000-0000-0000-0000-00000000f201', 'viewer@example.com', '{}');
insert into public.tracked_channels (user_id, channel_id)
values ('00000000-0000-0000-0000-00000000f201', '00000000-0000-0000-0000-00000000f102');

insert into public.channel_niches (channel_id, niche_id, confidence, is_primary)
values ('00000000-0000-0000-0000-00000000f101', '00000000-0000-0000-0000-00000000f001', 0.9, true),
       ('00000000-0000-0000-0000-00000000f101', '00000000-0000-0000-0000-00000000f002', 0.7, false),
       ('00000000-0000-0000-0000-00000000f102', '00000000-0000-0000-0000-00000000f001', 0.8, true);

-- A second primary for the same channel is rejected.
do $$
begin
  begin
    insert into public.channel_niches (channel_id, niche_id, confidence, is_primary)
    values ('00000000-0000-0000-0000-00000000f101', '00000000-0000-0000-0000-00000000f002', 0.7, true)
    on conflict (channel_id, niche_id) do update set is_primary = true;
    raise exception 'second primary niche was allowed';
  exception when unique_violation then
    null;
  end;
end $$;

insert into public.channel_view_snapshots (channel_id, snapshot_date, total_view_count)
values ('00000000-0000-0000-0000-00000000f101', current_date, 5000),
       ('00000000-0000-0000-0000-00000000f101', current_date - 30, 4000),
       ('00000000-0000-0000-0000-00000000f101', current_date - 31, 3900),
       ('00000000-0000-0000-0000-00000000f102', current_date, 100);

select * from public.purge_stale_youtube_data(30, 90, 30);

do $$
begin
  if (select count(*) from public.channel_view_snapshots
      where channel_id = '00000000-0000-0000-0000-00000000f101') <> 2 then
    raise exception 'expected today and day -30 to survive, day -31 to go';
  end if;
  if exists (select 1 from public.channel_view_snapshots
             where channel_id = '00000000-0000-0000-0000-00000000f102') then
    raise exception 'emptied channel kept its view readings';
  end if;
  if exists (select 1 from public.channel_niches
             where channel_id = '00000000-0000-0000-0000-00000000f102') then
    raise exception 'emptied channel kept its niche tags';
  end if;
  if (select count(*) from public.channel_niches
      where channel_id = '00000000-0000-0000-0000-00000000f101') <> 2 then
    raise exception 'fresh channel lost its niche tags';
  end if;
end $$;

rollback;

-- The trigger records one reading per channel per day, keeping the highest,
-- and records nothing for an emptied (0-view) channel.
begin;

insert into public.channels (id, youtube_channel_id, name, youtube_created_at, total_view_count)
values ('00000000-0000-0000-0000-00000000f301', 'UCtrig', 'Trig', '2020-01-01', 1000);
update public.channels set total_view_count = 1500 where id = '00000000-0000-0000-0000-00000000f301';
update public.channels set total_view_count = 1200 where id = '00000000-0000-0000-0000-00000000f301';
update public.channels set total_view_count = 0 where id = '00000000-0000-0000-0000-00000000f301';

do $$
begin
  if (select total_view_count from public.channel_view_snapshots
      where channel_id = '00000000-0000-0000-0000-00000000f301' and snapshot_date = current_date) <> 1500 then
    raise exception 'expected the day''s highest reading (1500)';
  end if;
  if (select count(*) from public.channel_view_snapshots
      where channel_id = '00000000-0000-0000-0000-00000000f301') <> 1 then
    raise exception 'expected exactly one reading for the day';
  end if;
end $$;

rollback;
