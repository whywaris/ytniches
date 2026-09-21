-- Down:
-- drop policy if exists "users_insert_own_consumption" on public.credit_events;

-- lib/credits/consume() (Phase 1B) writes from the session-scoped client
-- (lib/supabase/server.ts), not the service role — see DECISIONS.md-style
-- reasoning in the Phase 1 Niche Finder build log: keeps credit consumption
-- in the same RLS/audit trail as every other user action (Security.md §1.3
-- principle 4, defense in depth), rather than routing it through the
-- higher-privilege service-role path.
--
-- Deliberately narrow: only a user's own, negative-amount, consumption-type
-- row. Does NOT let a user insert an 'allocation'/'grant'/'refund' row or a
-- positive amount for themselves — those stay blocked for `authenticated`,
-- same as before this migration. Allocations still flow exclusively through
-- the security-definer handle_new_user() trigger (bypasses RLS by function
-- ownership, not by a grant to `authenticated`).
create policy "users_insert_own_consumption" on public.credit_events
  for insert
  with check (
    auth.uid() = user_id
    and event_type = 'consumption'
    and amount < 0
  );
