-- Supabase Advisor hardening for this project.
-- Safe to run more than once after policies.sql.

-- SECURITY DEFINER helpers used by RLS should live outside schemas exposed by
-- the Data API. Moving the function preserves its OID, so existing policies
-- continue to work without being recreated.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

DO $$
BEGIN
  IF to_regprocedure('private.get_my_role()') IS NULL
     AND to_regprocedure('public.get_my_role()') IS NOT NULL THEN
    ALTER FUNCTION public.get_my_role() SET SCHEMA private;
  END IF;
END
$$;

ALTER FUNCTION private.get_my_role() SET search_path = '';
REVOKE ALL ON FUNCTION private.get_my_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.get_my_role() FROM anon;
GRANT EXECUTE ON FUNCTION private.get_my_role() TO authenticated, service_role;

-- This helper is not used by the application and must not be callable through
-- PostgREST by anonymous or signed-in users.
DO $$
BEGIN
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.rls_auto_enable() SET search_path = public, pg_temp';
    EXECUTE 'REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC';
    EXECUTE 'REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM anon';
    EXECUTE 'REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO service_role';
  END IF;
END
$$;

-- Prevent seed.sql from inserting duplicate reference data on later runs.
CREATE UNIQUE INDEX IF NOT EXISTS classes_name_unique
  ON public.classes (name);
CREATE UNIQUE INDEX IF NOT EXISTS public_teachers_name_unique
  ON public.teachers (full_name) WHERE profile_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS result_highlights_title_unique
  ON public.result_highlights (title);
