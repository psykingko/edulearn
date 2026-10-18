-- ==============================================================================
-- Online Education Platform Testing — Phase 04 Student Functions & Security
-- Execute this script in the Supabase SQL Editor for Phase 04
-- ==============================================================================

-- 1. Permit authenticated users to view instructor profiles (so course instructor names display)
DROP POLICY IF EXISTS "profiles_select_instructors" ON public.profiles;
CREATE POLICY "profiles_select_instructors" ON public.profiles
  FOR SELECT TO authenticated
  USING (role = 'instructor');

-- 2. Secure Server-Side Quiz Grading Function
-- Calculates score inside PostgreSQL, verifies student enrollment and option integrity,
-- persists the attempt with calculated score, and returns results without exposing answer keys.
CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(
  p_quiz_id UUID,
  p_answers JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_student_id UUID;
  v_course_id UUID;
  v_is_published BOOLEAN;
  v_is_enrolled BOOLEAN;
  v_total_questions INTEGER;
  v_correct_count INTEGER := 0;
  v_score NUMERIC(5, 2);
  v_attempt_id UUID;
  v_item JSONB;
  v_q_id UUID;
  v_opt_id UUID;
  v_correct_opt_id UUID;
  v_submitted_count INTEGER;
  v_quiz_title TEXT;
BEGIN
  -- 1. Identify student from auth.uid() (never trust client-supplied ID)
  v_student_id := auth.uid();
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to submit quiz attempt';
  END IF;

  -- 2. Fetch quiz and verify course is published
  SELECT q.course_id, q.title, c.is_published
  INTO v_course_id, v_quiz_title, v_is_published
  FROM public.quizzes q
  JOIN public.courses c ON q.course_id = c.id
  WHERE q.id = p_quiz_id;

  IF v_course_id IS NULL THEN
    RAISE EXCEPTION 'Quiz not found';
  END IF;

  IF NOT v_is_published THEN
    RAISE EXCEPTION 'Course is not published';
  END IF;

  -- 3. Verify student is enrolled in the course
  SELECT EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE student_id = v_student_id AND course_id = v_course_id
  ) INTO v_is_enrolled;

  IF NOT v_is_enrolled THEN
    RAISE EXCEPTION 'Student is not enrolled in this course';
  END IF;

  -- 4. Get total questions for this quiz
  SELECT COUNT(*) INTO v_total_questions
  FROM public.quiz_questions
  WHERE quiz_id = p_quiz_id;

  IF v_total_questions = 0 THEN
    RAISE EXCEPTION 'Quiz has no questions';
  END IF;

  -- 5. Validate answers payload structure
  IF p_answers IS NULL OR jsonb_typeof(p_answers) <> 'array' THEN
    RAISE EXCEPTION 'Answers must be provided as a JSON array of { question_id, selected_option_id }';
  END IF;

  v_submitted_count := jsonb_array_length(p_answers);
  IF v_submitted_count = 0 THEN
    RAISE EXCEPTION 'No answers were submitted';
  END IF;

  -- 6. Evaluate each submitted answer
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_answers)
  LOOP
    v_q_id := (v_item->>'question_id')::UUID;
    v_opt_id := (v_item->>'selected_option_id')::UUID;

    -- Verify question belongs to this quiz
    IF NOT EXISTS (
      SELECT 1 FROM public.quiz_questions
      WHERE id = v_q_id AND quiz_id = p_quiz_id
    ) THEN
      RAISE EXCEPTION 'Question % does not belong to this quiz', v_q_id;
    END IF;

    -- Verify option belongs to this question
    IF NOT EXISTS (
      SELECT 1 FROM public.quiz_options
      WHERE id = v_opt_id AND question_id = v_q_id
    ) THEN
      RAISE EXCEPTION 'Option % does not belong to question %', v_opt_id, v_q_id;
    END IF;

    -- Compare against protected answer key
    SELECT correct_option_id INTO v_correct_opt_id
    FROM public.quiz_answer_keys
    WHERE question_id = v_q_id;

    IF v_correct_opt_id = v_opt_id THEN
      v_correct_count := v_correct_count + 1;
    END IF;
  END LOOP;

  -- 7. Calculate percentage score
  v_score := ROUND((v_correct_count::NUMERIC / v_total_questions::NUMERIC) * 100.0, 2);

  -- 8. Persist attempt record
  INSERT INTO public.quiz_attempts (
    id,
    quiz_id,
    student_id,
    score,
    submitted_at
  ) VALUES (
    gen_random_uuid(),
    p_quiz_id,
    v_student_id,
    v_score,
    now()
  )
  RETURNING id INTO v_attempt_id;

  -- 9. Return result without revealing answer keys
  RETURN jsonb_build_object(
    'attempt_id', v_attempt_id,
    'quiz_id', p_quiz_id,
    'quiz_title', v_quiz_title,
    'score', v_score,
    'total_questions', v_total_questions,
    'correct_count', v_correct_count,
    'submitted_at', now()
  );
END;
$$;

-- Restrict function execution to authenticated role
REVOKE EXECUTE ON FUNCTION public.submit_quiz_attempt(UUID, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_quiz_attempt(UUID, JSONB) TO authenticated;
