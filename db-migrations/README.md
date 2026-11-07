# Supabase RPC-only permission migration

This migration is **not applied automatically**. It preserves table rows and moves existing RPC function bodies unchanged into the non-exposed `setlog_internal` schema. Two public `SECURITY INVOKER` wrappers preserve the web app's RPC signatures, while only the private implementations run as `SECURITY DEFINER`.

After the migration, direct authenticated INSERT/UPDATE of diary rows and INSERT/DELETE of snapshots are revoked. Read access and per-user RLS stay in place.

The scripts include an emergency rollback that restores the prior function privileges without deleting data. Both forward and rollback paths are tested using an ephemeral PostgreSQL 17 service in GitHub Actions.

**Do not rerun `supabase-setup.sql` after RPC-only hardening.** The bootstrap file now refuses to run when protected internal RPC functions already exist, preventing it from accidentally restoring direct write permissions. Before applying any SQL to a live installation, inspect the actual database state, keep secure data backups and run integration tests. Supabase paid branching is not required for CI testing.
