-- Migration 024: drop the unused audit_logs table (#1748)
--
-- audit_logs (007) is soft-deletable and unused; the append-only audit_log
-- (010) is the table audit.rs writes. Keeping the older one would let a
-- future writer weaken the audit guarantee.

DROP TABLE IF EXISTS audit_logs;
