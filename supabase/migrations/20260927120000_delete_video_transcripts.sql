-- Down: none. Deleted transcripts can't (and must not) be restored.

-- D-067 (supersedes D-027). Transcripts came from YouTube's undocumented
-- timedtext endpoint, which YouTube's Developer Policies forbid (III.D.7
-- undocumented APIs, III.E.6 scraping, III.I.14 non-API retrieval). The
-- fetch path is removed from the app; this deletes everything it stored.
-- The table stays (empty) so a later, policy-compliant source could reuse
-- it; nothing reads or writes it now.
delete from public.video_transcripts_cache;

update public.videos set has_transcript = false where has_transcript;
