-- ==============================================================================
-- Online Education Platform Testing — Schema & Security Baseline (Phase 01)
-- Authoritative Schema for PostgreSQL & Supabase
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Helper Extensions
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. Application Tables
-- ------------------------------------------------------------------------------

-- 2.1 Profiles (Stores user metadata and authorization role linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'instructor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.2 Courses (Created and owned by instructors)
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.3 Lessons (Text-based lessons belonging to a course)
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_lessons_course_position UNIQUE (course_id, position)
);

-- 2.4 Enrollments (Connects students to courses, preventing duplicates)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_enrollments_student_course UNIQUE (student_id, course_id)
);

-- 2.5 Lesson Progress (Tracks individual student progress per lesson)
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  CONSTRAINT uq_lesson_progress_student_lesson UNIQUE (student_id, lesson_id)
);

-- 2.6 Quizzes (Quizzes attached to courses)
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.7 Quiz Questions (Ordered questions within a quiz)
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT uq_quiz_questions_quiz_position UNIQUE (quiz_id, position)
);

-- 2.8 Quiz Options (Multiple-choice choices for a question; NO is_correct flag here)
CREATE TABLE IF NOT EXISTS public.quiz_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT uq_quiz_options_question_position UNIQUE (question_id, position),
  CONSTRAINT uq_quiz_options_id_question UNIQUE (id, question_id)
);

-- 2.9 Quiz Answer Keys (Protected answer mapping; composite FK ensures option belongs to question)
CREATE TABLE IF NOT EXISTS public.quiz_answer_keys (
  question_id UUID PRIMARY KEY REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  correct_option_id UUID NOT NULL,
  CONSTRAINT fk_quiz_answer_keys_option FOREIGN KEY (correct_option_id, question_id)
    REFERENCES public.quiz_options(id, question_id) ON DELETE CASCADE
);

-- 2.10 Quiz Attempts (Stores student attempt scores; client inserts disallowed)
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score NUMERIC(5, 2) NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. Indexes for Query Performance & Foreign Key Lookups
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_is_published ON public.courses(is_published);
CREATE INDEX IF NOT EXISTS idx_lessons_course_pos ON public.lessons(course_id, position);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student ON public.lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON public.lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_course ON public.quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_pos ON public.quiz_questions(quiz_id, position);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question_pos ON public.quiz_options(question_id, position);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student ON public.quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);

-- ------------------------------------------------------------------------------
-- 4. Automatic Profile Trigger & Role Protection
-- ------------------------------------------------------------------------------

-- Ensure all new auth.users get a student profile by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Prevent direct client-side modification of the profile role column
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (auth.role() = 'authenticated' OR auth.role() = 'anon') AND (NEW.role IS DISTINCT FROM OLD.role) THEN
    RAISE EXCEPTION 'Role modification is restricted to trusted administrative workflows';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- ------------------------------------------------------------------------------
-- 5. Row Level Security (RLS) Activation
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answer_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 6. Role Permissions / Grants
-- ------------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Public/Anon access: only view published courses
GRANT SELECT ON public.courses TO anon, authenticated;

-- Authenticated student/instructor access
GRANT SELECT, UPDATE (full_name) ON public.profiles TO authenticated;
GRANT ALL ON public.courses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT SELECT, INSERT ON public.enrollments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.lesson_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quizzes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_questions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_options TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_answer_keys TO authenticated;
GRANT SELECT ON public.quiz_attempts TO authenticated;

-- ------------------------------------------------------------------------------
-- 7. RLS Policies
-- ------------------------------------------------------------------------------

-- 7.1 PROFILES POLICIES
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 7.2 COURSES POLICIES
DROP POLICY IF EXISTS "courses_select_published" ON public.courses;
CREATE POLICY "courses_select_published" ON public.courses
  FOR SELECT TO anon, authenticated
  USING (is_published = true);

DROP POLICY IF EXISTS "courses_select_instructor_own" ON public.courses;
CREATE POLICY "courses_select_instructor_own" ON public.courses
  FOR SELECT TO authenticated
  USING (
    instructor_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'instructor')
  );

DROP POLICY IF EXISTS "courses_insert_instructor" ON public.courses;
CREATE POLICY "courses_insert_instructor" ON public.courses
  FOR INSERT TO authenticated
  WITH CHECK (
    instructor_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'instructor')
  );

DROP POLICY IF EXISTS "courses_update_instructor" ON public.courses;
CREATE POLICY "courses_update_instructor" ON public.courses
  FOR UPDATE TO authenticated
  USING (
    instructor_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'instructor')
  )
  WITH CHECK (
    instructor_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'instructor')
  );

DROP POLICY IF EXISTS "courses_delete_instructor" ON public.courses;
CREATE POLICY "courses_delete_instructor" ON public.courses
  FOR DELETE TO authenticated
  USING (
    instructor_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'instructor')
  );

-- 7.3 LESSONS POLICIES
DROP POLICY IF EXISTS "lessons_select_enrolled_or_owner" ON public.lessons;
CREATE POLICY "lessons_select_enrolled_or_owner" ON public.lessons
  FOR SELECT TO authenticated
  USING (
    -- Course owner instructor can read
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = lessons.course_id AND c.instructor_id = auth.uid()
    )
    OR
    -- Enrolled student in a published course can read
    EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.courses c ON e.course_id = c.id
      WHERE c.id = lessons.course_id
        AND e.student_id = auth.uid()
        AND c.is_published = true
    )
  );

DROP POLICY IF EXISTS "lessons_modify_instructor" ON public.lessons;
CREATE POLICY "lessons_modify_instructor" ON public.lessons
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = lessons.course_id AND c.instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = lessons.course_id AND c.instructor_id = auth.uid()
    )
  );

-- 7.4 ENROLLMENTS POLICIES
DROP POLICY IF EXISTS "enrollments_select" ON public.enrollments;
CREATE POLICY "enrollments_select" ON public.enrollments
  FOR SELECT TO authenticated
  USING (
    -- Student reads own enrollments
    student_id = auth.uid()
    OR
    -- Instructor reads enrollments for their own courses
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = enrollments.course_id AND c.instructor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "enrollments_insert_self" ON public.enrollments;
CREATE POLICY "enrollments_insert_self" ON public.enrollments
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = enrollments.course_id AND c.is_published = true
    )
  );

-- 7.5 LESSON PROGRESS POLICIES
DROP POLICY IF EXISTS "lesson_progress_select" ON public.lesson_progress;
CREATE POLICY "lesson_progress_select" ON public.lesson_progress
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.courses c ON l.course_id = c.id
      WHERE l.id = lesson_progress.lesson_id AND c.instructor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "lesson_progress_insert_self" ON public.lesson_progress;
CREATE POLICY "lesson_progress_insert_self" ON public.lesson_progress
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.enrollments e ON l.course_id = e.course_id
      WHERE l.id = lesson_progress.lesson_id AND e.student_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "lesson_progress_update_self" ON public.lesson_progress;
CREATE POLICY "lesson_progress_update_self" ON public.lesson_progress
  FOR UPDATE TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- 7.6 QUIZZES POLICIES
DROP POLICY IF EXISTS "quizzes_select" ON public.quizzes;
CREATE POLICY "quizzes_select" ON public.quizzes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = quizzes.course_id AND c.instructor_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.courses c ON e.course_id = c.id
      WHERE c.id = quizzes.course_id
        AND e.student_id = auth.uid()
        AND c.is_published = true
    )
  );

DROP POLICY IF EXISTS "quizzes_modify_instructor" ON public.quizzes;
CREATE POLICY "quizzes_modify_instructor" ON public.quizzes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = quizzes.course_id AND c.instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = quizzes.course_id AND c.instructor_id = auth.uid()
    )
  );

-- 7.7 QUIZ QUESTIONS POLICIES
DROP POLICY IF EXISTS "quiz_questions_select" ON public.quiz_questions;
CREATE POLICY "quiz_questions_select" ON public.quiz_questions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      JOIN public.courses c ON q.course_id = c.id
      WHERE q.id = quiz_questions.quiz_id AND c.instructor_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.quizzes q
      JOIN public.enrollments e ON q.course_id = e.course_id
      JOIN public.courses c ON e.course_id = c.id
      WHERE q.id = quiz_questions.quiz_id
        AND e.student_id = auth.uid()
        AND c.is_published = true
    )
  );

DROP POLICY IF EXISTS "quiz_questions_modify_instructor" ON public.quiz_questions;
CREATE POLICY "quiz_questions_modify_instructor" ON public.quiz_questions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      JOIN public.courses c ON q.course_id = c.id
      WHERE q.id = quiz_questions.quiz_id AND c.instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      JOIN public.courses c ON q.course_id = c.id
      WHERE q.id = quiz_questions.quiz_id AND c.instructor_id = auth.uid()
    )
  );

-- 7.8 QUIZ OPTIONS POLICIES
DROP POLICY IF EXISTS "quiz_options_select" ON public.quiz_options;
CREATE POLICY "quiz_options_select" ON public.quiz_options
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_questions qq
      JOIN public.quizzes q ON qq.quiz_id = q.id
      JOIN public.courses c ON q.course_id = c.id
      WHERE qq.id = quiz_options.question_id AND c.instructor_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.quiz_questions qq
      JOIN public.quizzes q ON qq.quiz_id = q.id
      JOIN public.enrollments e ON q.course_id = e.course_id
      JOIN public.courses c ON e.course_id = c.id
      WHERE qq.id = quiz_options.question_id
        AND e.student_id = auth.uid()
        AND c.is_published = true
    )
  );

DROP POLICY IF EXISTS "quiz_options_modify_instructor" ON public.quiz_options;
CREATE POLICY "quiz_options_modify_instructor" ON public.quiz_options
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_questions qq
      JOIN public.quizzes q ON qq.quiz_id = q.id
      JOIN public.courses c ON q.course_id = c.id
      WHERE qq.id = quiz_options.question_id AND c.instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quiz_questions qq
      JOIN public.quizzes q ON qq.quiz_id = q.id
      JOIN public.courses c ON q.course_id = c.id
      WHERE qq.id = quiz_options.question_id AND c.instructor_id = auth.uid()
    )
  );

-- 7.9 QUIZ ANSWER KEYS POLICIES (Strictly Instructor-only; NO student read access)
DROP POLICY IF EXISTS "quiz_answer_keys_instructor_all" ON public.quiz_answer_keys;
CREATE POLICY "quiz_answer_keys_instructor_all" ON public.quiz_answer_keys
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_questions qq
      JOIN public.quizzes q ON qq.quiz_id = q.id
      JOIN public.courses c ON q.course_id = c.id
      WHERE qq.id = quiz_answer_keys.question_id AND c.instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quiz_questions qq
      JOIN public.quizzes q ON qq.quiz_id = q.id
      JOIN public.courses c ON q.course_id = c.id
      WHERE qq.id = quiz_answer_keys.question_id AND c.instructor_id = auth.uid()
    )
  );

-- 7.10 QUIZ ATTEMPTS POLICIES
-- Students can read only their own attempts; instructors can read attempts for their courses.
-- Direct insert/update is disallowed from clients (reserved for Phase 04 secure database function).
DROP POLICY IF EXISTS "quiz_attempts_select" ON public.quiz_attempts;
CREATE POLICY "quiz_attempts_select" ON public.quiz_attempts
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.quizzes q
      JOIN public.courses c ON q.course_id = c.id
      WHERE q.id = quiz_attempts.quiz_id AND c.instructor_id = auth.uid()
    )
  );
