// The email digest. DIGEST_LOCAL_HOUR mirrors the SQL in
// find_due_digest_user_ids (the digest goes out at this hour in the
// user's own time zone); tests/lib/help/sql-mirrors.test.ts keeps them
// equal.
export const DIGEST_LOCAL_HOUR = 8;
// Up to this many outliers and this many new videos per digest.
export const DIGEST_ITEM_LIMIT = 5;
