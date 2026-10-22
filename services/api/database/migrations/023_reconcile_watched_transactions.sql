-- Migration 023: reconcile watched_transactions (#1747)
--
-- 017_create_watched_transactions and 019_create_watched_transactions both use
-- CREATE TABLE IF NOT EXISTS with different schemas; 017 runs first, so 019 is
-- a no-op. The 017 shape is the one db.rs queries (status, market_id,
-- expires_at), so this migration makes that the single guaranteed schema,
-- whichever definition created the table.

ALTER TABLE watched_transactions
    ADD COLUMN IF NOT EXISTS market_id BIGINT,
    ADD COLUMN IF NOT EXISTS status    TEXT NOT NULL DEFAULT 'pending';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'watched_transactions_status_check'
    ) THEN
        ALTER TABLE watched_transactions
            ADD CONSTRAINT watched_transactions_status_check
            CHECK (status IN ('pending', 'confirmed', 'expired'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_watched_transactions_pending
    ON watched_transactions (expires_at)
    WHERE status = 'pending';
