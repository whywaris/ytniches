-- Down:
-- drop type if exists credit_event_type;
-- drop type if exists subscription_status;
-- drop type if exists subscription_tier;

-- Backend-Schema.md §2.6. Created before any table that references them.
create type subscription_tier as enum ('free', 'starter', 'pro', 'team');
create type subscription_status as enum ('active', 'trialing', 'past_due', 'cancelled', 'paused');
create type credit_event_type as enum ('allocation', 'consumption', 'grant', 'refund', 'expiration');
