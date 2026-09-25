-- P01-003: additive schema for the P01-002 server-side admin session contract.
-- Deploy only after inspecting the live admin_users shape and taking a backup.
-- This does not migrate plaintext credentials (P01-004), change auth routes, or
-- create the missing fresh-database baseline (P02-004).

BEGIN;

DO $$
BEGIN
    IF to_regclass('public.admin_users') IS NULL THEN
        RAISE EXCEPTION 'P01-003 requires public.admin_users; create its baseline in P02-004 first';
    END IF;
END
$$;

-- Preserve any existing ID. Only older schemas without one receive UUIDs.
ALTER TABLE public.admin_users
    ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();

-- Fail instead of silently accepting an unstable/null/duplicated identity.
ALTER TABLE public.admin_users
    ALTER COLUMN id SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS admin_users_p01003_id_uidx
    ON public.admin_users (id);

-- Nullable during the staged credential cutover. No password is embedded here.
ALTER TABLE public.admin_users
    ADD COLUMN IF NOT EXISTS password_hash text,
    ADD COLUMN IF NOT EXISTS session_hash text,
    ADD COLUMN IF NOT EXISTS session_created_at timestamptz,
    ADD COLUMN IF NOT EXISTS session_expires_at timestamptz;

-- Re-running against an unexpected legacy schema must fail rather than create
-- a misleadingly successful migration with incompatible session columns.
DO $$
DECLARE
    field_name text;
    expected_type oid;
    actual_type oid;
BEGIN
    FOREACH field_name IN ARRAY ARRAY['password_hash', 'session_hash', 'session_created_at', 'session_expires_at']
    LOOP
        expected_type := CASE
            WHEN field_name IN ('password_hash', 'session_hash') THEN 'text'::regtype
            ELSE 'timestamptz'::regtype
        END;
        SELECT atttypid INTO actual_type
        FROM pg_attribute
        WHERE attrelid = 'public.admin_users'::regclass
          AND attname = field_name
          AND NOT attisdropped;
        IF actual_type IS DISTINCT FROM expected_type THEN
            RAISE EXCEPTION 'P01-003: %.% has incompatible type', 'admin_users', field_name;
        END IF;
    END LOOP;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS admin_users_p01003_session_hash_uidx
    ON public.admin_users (session_hash)
    WHERE session_hash IS NOT NULL;

ALTER TABLE public.admin_users
    ADD CONSTRAINT admin_users_p01003_session_consistency CHECK (
        (session_hash IS NULL AND session_created_at IS NULL AND session_expires_at IS NULL)
        OR
        (session_hash IS NOT NULL
         AND session_hash ~ '^[0-9a-f]{64}$'
         AND session_created_at IS NOT NULL
         AND session_expires_at IS NOT NULL
         AND session_expires_at > session_created_at)
    );

COMMIT;
