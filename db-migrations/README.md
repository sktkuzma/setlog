# Proposed Supabase permission migration

This migration is **not applied automatically**. It preserves table rows and moves existing RPC function bodies unchanged into the non-exposed `setlog_internal` schema. Two public `SECURITY INVOKER` wrappers preserve the web app's RPC signatures, while only the private implementations run as `SECURITY DEFINER`.

After the migration, direct authenticated INSERT/UPDATE of diary rows and INSERT/DELETE of snapshots are revoked. Read access and per-user RLS stay in place.

The scripts include an emergency rollback that restores the prior function privileges without deleting data. Both forward and rollback paths are tested using an ephemeral PostgreSQL 17 service in GitHub Actions.

**Do not run against the live database without separately verifying the exact production functions and taking a secure backup.** Supabase paid branching is not required for CI testing.

The historical `supabase-setup.sql` now deliberately aborts when a protected internal RPC already exists. For a fresh installation, run the bootstrap **once**, then apply the hardening migration before allowing users to sign up.
