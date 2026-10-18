-- ==============================================================================
-- Online Education Platform Testing — Demo Accounts Setup (Phase 02)
-- Execute this script in the Supabase SQL Editor to provision/fix demo accounts
-- ==============================================================================

-- 1. FIX NULL TOKEN COLUMNS FOR GOTRUE AUTH SERVER:
-- Direct SQL inserts into auth.users leave token columns as NULL.
-- Supabase GoTrue requires empty string '' instead of NULL to scan user records,
-- otherwise it throws 500: "Database error querying schema".
UPDATE auth.users 
SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, '')
WHERE 
  confirmation_token IS NULL 
  OR recovery_token IS NULL 
  OR email_change_token_new IS NULL 
  OR email_change IS NULL;

-- 2. Refine role-protection trigger to allow administrative SQL updates while
-- strictly blocking client-side REST/browser role changes:
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If invoked from client-side authentication context (authenticated or anon), block role change
  IF (auth.role() = 'authenticated' OR auth.role() = 'anon') AND (NEW.role IS DISTINCT FROM OLD.role) THEN
    RAISE EXCEPTION 'Role modification is restricted to trusted administrative workflows';
  END IF;
  RETURN NEW;
END;
$$;

-- 3. Helper block to create or configure the 4 disposable demo users in auth.users
-- This inserts confirmed email users directly into auth.users using pgcrypto hashing.
DO $$
DECLARE
  v_student1_id UUID;
  v_student2_id UUID;
  v_instructor1_id UUID;
  v_instructor2_id UUID;
BEGIN
  -- Create or retrieve Student Demo 1
  SELECT id INTO v_student1_id FROM auth.users WHERE email = 'student1.demo@example.com';
  IF v_student1_id IS NULL THEN
    v_student1_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_student1_id, 'authenticated', 'authenticated',
      'student1.demo@example.com', crypt('Student123!', gen_salt('bf')), now(),
      '', '', '', '',
      '{"provider":"email","providers":["email"]}', '{"full_name":"Alice Student (Demo 1)"}', false, now(), now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = crypt('Student123!', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        confirmation_token = COALESCE(confirmation_token, ''),
        recovery_token = COALESCE(recovery_token, ''),
        email_change_token_new = COALESCE(email_change_token_new, ''),
        email_change = COALESCE(email_change, '')
    WHERE id = v_student1_id;
  END IF;

  -- Create or retrieve Student Demo 2
  SELECT id INTO v_student2_id FROM auth.users WHERE email = 'student2.demo@example.com';
  IF v_student2_id IS NULL THEN
    v_student2_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_student2_id, 'authenticated', 'authenticated',
      'student2.demo@example.com', crypt('Student456!', gen_salt('bf')), now(),
      '', '', '', '',
      '{"provider":"email","providers":["email"]}', '{"full_name":"Bob Student (Demo 2)"}', false, now(), now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = crypt('Student456!', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        confirmation_token = COALESCE(confirmation_token, ''),
        recovery_token = COALESCE(recovery_token, ''),
        email_change_token_new = COALESCE(email_change_token_new, ''),
        email_change = COALESCE(email_change, '')
    WHERE id = v_student2_id;
  END IF;

  -- Create or retrieve Instructor Demo 1
  SELECT id INTO v_instructor1_id FROM auth.users WHERE email = 'instructor1.demo@example.com';
  IF v_instructor1_id IS NULL THEN
    v_instructor1_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_instructor1_id, 'authenticated', 'authenticated',
      'instructor1.demo@example.com', crypt('Instructor123!', gen_salt('bf')), now(),
      '', '', '', '',
      '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Sarah Connor (Demo 1)"}', false, now(), now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = crypt('Instructor123!', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        confirmation_token = COALESCE(confirmation_token, ''),
        recovery_token = COALESCE(recovery_token, ''),
        email_change_token_new = COALESCE(email_change_token_new, ''),
        email_change = COALESCE(email_change, '')
    WHERE id = v_instructor1_id;
  END IF;

  -- Create or retrieve Instructor Demo 2
  SELECT id INTO v_instructor2_id FROM auth.users WHERE email = 'instructor2.demo@example.com';
  IF v_instructor2_id IS NULL THEN
    v_instructor2_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_instructor2_id, 'authenticated', 'authenticated',
      'instructor2.demo@example.com', crypt('Instructor456!', gen_salt('bf')), now(),
      '', '', '', '',
      '{"provider":"email","providers":["email"]}', '{"full_name":"Prof. John Matrix (Demo 2)"}', false, now(), now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = crypt('Instructor456!', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        confirmation_token = COALESCE(confirmation_token, ''),
        recovery_token = COALESCE(recovery_token, ''),
        email_change_token_new = COALESCE(email_change_token_new, ''),
        email_change = COALESCE(email_change, '')
    WHERE id = v_instructor2_id;
  END IF;

  -- 4. Synchronize profiles with verified roles
  -- Note: The handle_new_user trigger defaults users to 'student'.
  -- Administrative assignment updates instructor roles here:
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (v_student1_id, 'Alice Student (Demo 1)', 'student')
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = 'student';

  INSERT INTO public.profiles (id, full_name, role)
  VALUES (v_student2_id, 'Bob Student (Demo 2)', 'student')
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = 'student';

  INSERT INTO public.profiles (id, full_name, role)
  VALUES (v_instructor1_id, 'Dr. Sarah Connor (Demo 1)', 'instructor')
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = 'instructor';

  INSERT INTO public.profiles (id, full_name, role)
  VALUES (v_instructor2_id, 'Prof. John Matrix (Demo 2)', 'instructor')
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = 'instructor';

END $$;

-- 5. Verification Query: Confirm profiles and roles
SELECT p.id, u.email, p.full_name, p.role, p.created_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email IN (
  'student1.demo@example.com',
  'student2.demo@example.com',
  'instructor1.demo@example.com',
  'instructor2.demo@example.com'
)
ORDER BY p.role, u.email;
