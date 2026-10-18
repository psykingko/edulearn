-- ==============================================================================
-- EduLearn — Pre-Phase 05 Instructor Registration & Approval Workflow
-- Authoritative Migration for Secure Account-Type Registration
-- ==============================================================================

-- 1. Instructor Applications Table
-- Holds pending requests from users wishing to author courses.
-- All users start with 'student' role in profiles; instructor role is granted ONLY upon approval.
CREATE TABLE IF NOT EXISTS public.instructor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  reviewed_at TIMESTAMPTZ,
  CONSTRAINT uq_instructor_application_user UNIQUE (user_id)
);

-- Index for fast lookup by user or status
CREATE INDEX IF NOT EXISTS idx_instructor_apps_user ON public.instructor_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_instructor_apps_status ON public.instructor_applications(status);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.instructor_applications ENABLE ROW LEVEL SECURITY;

-- 3. Grants
GRANT SELECT, INSERT ON public.instructor_applications TO authenticated;

-- 4. RLS Policies
-- Applicants can read only their own application status
DROP POLICY IF EXISTS "instructor_apps_select_own" ON public.instructor_applications;
CREATE POLICY "instructor_apps_select_own" ON public.instructor_applications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Applicants can insert only an application for themselves
DROP POLICY IF EXISTS "instructor_apps_insert_self" ON public.instructor_applications;
CREATE POLICY "instructor_apps_insert_self" ON public.instructor_applications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Disallow client-side updates or deletions: only database administrators can approve or reject
DROP POLICY IF EXISTS "instructor_apps_no_client_update" ON public.instructor_applications;
DROP POLICY IF EXISTS "instructor_apps_no_client_delete" ON public.instructor_applications;

-- 5. Administrative Approval Procedure (Executed in Supabase SQL Editor by Project Owner)
-- Upgrades user's role to 'instructor', marks application approved, and auto-confirms email
-- so the instructor is not blocked by "Email not confirmed".
CREATE OR REPLACE FUNCTION public.approve_instructor_application(p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Locate user by email in auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE LOWER(email) = LOWER(TRIM(p_email));

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No user found with email ' || p_email
    );
  END IF;

  -- 1. Promote profile role to 'instructor'
  UPDATE public.profiles
  SET role = 'instructor', updated_at = timezone('utc'::text, now())
  WHERE id = v_user_id;

  -- 2. Mark instructor application as approved if record exists
  UPDATE public.instructor_applications
  SET status = 'approved', reviewed_at = timezone('utc'::text, now())
  WHERE user_id = v_user_id;

  -- 3. Auto-confirm email in auth.users so the user can immediately log in
  -- (Prevents "Authentication Error: Email not confirmed" when Supabase email verification is enabled)
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, timezone('utc'::text, now()))
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', p_email,
    'role', 'instructor',
    'status', 'approved',
    'email_confirmed', true,
    'message', 'User successfully approved, email confirmed, and granted instructor privileges.'
  );
END;
$$;

-- Restrict approval function execution to service_role or database admin
REVOKE ALL ON FUNCTION public.approve_instructor_application(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.approve_instructor_application(TEXT) TO postgres, service_role;
