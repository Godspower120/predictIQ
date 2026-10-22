-- Rollback 023: remove the objects added by the reconcile migration.
-- Columns are left in place: 017 owns them on databases that ran it first.
ALTER TABLE watched_transactions DROP CONSTRAINT IF EXISTS watched_transactions_status_check;
DROP INDEX IF EXISTS idx_watched_transactions_pending;
