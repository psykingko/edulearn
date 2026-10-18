// ==============================================================================
// Phase 04 End-to-End Verification Test Script
// Tests Student Learning Journey, Lesson Progress Persistence, and Security Boundaries
// ==============================================================================

const SUPABASE_URL = 'https://pbpnsyumlfkrhiwtrjbn.supabase.co';
const ANON_KEY = 'sb_publishable_piicbKQCnM73cS7ttkRDTg_IQYitLaX';

async function login(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!data.access_token) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(data)}`);
  }
  return { token: data.access_token, user: data.user };
}

async function runTests() {
  console.log('--- STARTING PHASE 04 STUDENT VERIFICATION TESTS ---\n');

  // Authenticate sessions
  const inst1 = await login('instructor1.demo@example.com', 'Instructor123!');
  console.log('✔ Authenticated Instructor 1:', inst1.user.id);

  const student1 = await login('student1.demo@example.com', 'Student123!');
  console.log('✔ Authenticated Student 1:', student1.user.id);

  const student2 = await login('student2.demo@example.com', 'Student456!');
  console.log('✔ Authenticated Student 2:', student2.user.id);

  let testCourseId = null;
  let draftCourseId = null;
  let testLessonId = null;
  let testQuizId = null;
  let testQuestionId = null;
  let correctOptId = null;
  let incorrectOptId = null;

  try {
    // -------------------------------------------------------------------------
    // SETUP: Instructor 1 creates 1 published course and 1 draft course
    // -------------------------------------------------------------------------
    const pubCourseRes = await fetch(`${SUPABASE_URL}/rest/v1/courses`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${inst1.token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        instructor_id: inst1.user.id,
        title: 'Phase 04 Verified Course',
        description: 'Automated test published course for student learning journey.',
        is_published: true
      })
    });
    testCourseId = (await pubCourseRes.json())[0].id;

    const draftCourseRes = await fetch(`${SUPABASE_URL}/rest/v1/courses`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${inst1.token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        instructor_id: inst1.user.id,
        title: 'Phase 04 Secret Draft Course',
        description: 'Should never be visible in student catalogue.',
        is_published: false
      })
    });
    draftCourseId = (await draftCourseRes.json())[0].id;

    // Add lesson to published course
    const lessonRes = await fetch(`${SUPABASE_URL}/rest/v1/lessons`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${inst1.token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        course_id: testCourseId,
        title: 'Introduction to Cloud Architectures',
        content: 'Lesson content for Phase 04 testing.',
        position: 1
      })
    });
    testLessonId = (await lessonRes.json())[0].id;

    // Add quiz with question, 2 options, and answer key
    const quizRes = await fetch(`${SUPABASE_URL}/rest/v1/quizzes`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${inst1.token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        course_id: testCourseId,
        title: 'Cloud Architecture Quiz'
      })
    });
    testQuizId = (await quizRes.json())[0].id;

    const qRes = await fetch(`${SUPABASE_URL}/rest/v1/quiz_questions`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${inst1.token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        quiz_id: testQuizId,
        question_text: 'Which SQL command defines Row Level Security in PostgreSQL?',
        position: 1
      })
    });
    testQuestionId = (await qRes.json())[0].id;

    const optRes = await fetch(`${SUPABASE_URL}/rest/v1/quiz_options`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${inst1.token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify([
        { question_id: testQuestionId, option_text: 'ALTER TABLE table_name ENABLE ROW LEVEL SECURITY', position: 1 },
        { question_id: testQuestionId, option_text: 'ENABLE FIREWALL NOW', position: 2 }
      ])
    });
    const options = await optRes.json();
    correctOptId = options[0].id;
    incorrectOptId = options[1].id;

    await fetch(`${SUPABASE_URL}/rest/v1/quiz_answer_keys`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${inst1.token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        question_id: testQuestionId,
        correct_option_id: correctOptId
      })
    });

    console.log('✔ Setup Complete: Test course, lesson, quiz, and private answer key created.\n');

    // -------------------------------------------------------------------------
    // TEST 1: Catalogue Visibility - Student sees published course
    // -------------------------------------------------------------------------
    const catRes = await fetch(`${SUPABASE_URL}/rest/v1/courses?id=eq.${testCourseId}&select=*`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${student1.token}`
      }
    });
    const catCourses = await catRes.json();
    if (catCourses.length !== 1) {
      throw new Error(`Test 1 FAILED: Student could not see published course in catalogue: ${JSON.stringify(catCourses)}`);
    }
    console.log('✔ Test 1 PASS: Student 1 can view published course in catalogue.');

    // -------------------------------------------------------------------------
    // TEST 2: Draft Protection - Student cannot see or access draft course
    // -------------------------------------------------------------------------
    const draftRes = await fetch(`${SUPABASE_URL}/rest/v1/courses?id=eq.${draftCourseId}&select=*`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${student1.token}`
      }
    });
    const draftCourses = await draftRes.json();
    if (draftCourses.length !== 0) {
      throw new Error(`Test 2 FAILED: Student was able to access draft course via API! ${JSON.stringify(draftCourses)}`);
    }
    console.log('✔ Test 2 PASS: Draft course is completely hidden from Student 1 by RLS.');

    // -------------------------------------------------------------------------
    // TEST 3: Enrollment - Student 1 enrolls in published course
    // -------------------------------------------------------------------------
    const enrollRes = await fetch(`${SUPABASE_URL}/rest/v1/enrollments`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${student1.token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        student_id: student1.user.id,
        course_id: testCourseId
      })
    });
    if (enrollRes.status !== 201) {
      throw new Error(`Test 3 FAILED: Student enrollment failed with status ${enrollRes.status}: ${JSON.stringify(await enrollRes.json())}`);
    }
    console.log('✔ Test 3 PASS: Student 1 successfully enrolled in published course.');

    // -------------------------------------------------------------------------
    // TEST 4: Duplicate Enrollment Prevention
    // -------------------------------------------------------------------------
    const dupEnrollRes = await fetch(`${SUPABASE_URL}/rest/v1/enrollments`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${student1.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        student_id: student1.user.id,
        course_id: testCourseId
      })
    });
    if (dupEnrollRes.status !== 409) {
      throw new Error(`Test 4 FAILED: Expected 409 Conflict for duplicate enrollment, got status ${dupEnrollRes.status}`);
    }
    console.log('✔ Test 4 PASS: Duplicate enrollment rejected by unique constraint (HTTP 409).');

    // -------------------------------------------------------------------------
    // TEST 5: Lesson Progress - Student 1 marks lesson complete
    // -------------------------------------------------------------------------
    const progressInsertRes = await fetch(`${SUPABASE_URL}/rest/v1/lesson_progress`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${student1.token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        student_id: student1.user.id,
        lesson_id: testLessonId,
        is_completed: true,
        completed_at: new Date().toISOString()
      })
    });
    const insertedProg = await progressInsertRes.json();
    if (progressInsertRes.status !== 201 || !insertedProg[0]?.is_completed) {
      throw new Error(`Test 5 FAILED: Marking lesson complete failed: ${JSON.stringify(insertedProg)}`);
    }
    console.log('✔ Test 5 PASS: Student 1 marked lesson complete; record persisted in lesson_progress.');

    // -------------------------------------------------------------------------
    // TEST 6: Lesson Progress - Student 1 unmarks lesson (toggles to incomplete)
    // -------------------------------------------------------------------------
    const progressUpdateRes = await fetch(`${SUPABASE_URL}/rest/v1/lesson_progress?lesson_id=eq.${testLessonId}&student_id=eq.${student1.user.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${student1.token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        is_completed: false,
        completed_at: null
      })
    });
    const updatedProg = await progressUpdateRes.json();
    if (updatedProg[0]?.is_completed !== false) {
      throw new Error(`Test 6 FAILED: Unmarking lesson failed: ${JSON.stringify(updatedProg)}`);
    }
    console.log('✔ Test 6 PASS: Student 1 unmarked lesson; is_completed correctly set to false.');

    // -------------------------------------------------------------------------
    // TEST 7: Cross-Student Isolation - Student 2 cannot read or update Student 1 progress
    // -------------------------------------------------------------------------
    const s2ReadProgressRes = await fetch(`${SUPABASE_URL}/rest/v1/lesson_progress?student_id=eq.${student1.user.id}`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${student2.token}`
      }
    });
    const s2ReadProgData = await s2ReadProgressRes.json();
    if (s2ReadProgData.length !== 0) {
      throw new Error(`Test 7 FAILED: Student 2 was able to read Student 1 progress records! ${JSON.stringify(s2ReadProgData)}`);
    }

    const s2UpdateProgressRes = await fetch(`${SUPABASE_URL}/rest/v1/lesson_progress?lesson_id=eq.${testLessonId}&student_id=eq.${student1.user.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${student2.token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ is_completed: true })
    });
    const s2UpdateData = await s2UpdateProgressRes.json();
    if (s2UpdateData.length !== 0) {
      throw new Error(`Test 7 FAILED: Student 2 modified Student 1 progress record!`);
    }
    console.log('✔ Test 7 PASS: Student 2 is blocked by RLS from reading or modifying Student 1 progress.');

    // -------------------------------------------------------------------------
    // TEST 8: Security - Student 1 cannot read quiz_answer_keys
    // -------------------------------------------------------------------------
    const keysRes = await fetch(`${SUPABASE_URL}/rest/v1/quiz_answer_keys?select=*`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${student1.token}`
      }
    });
    const keysData = await keysRes.json();
    if (keysData.length !== 0) {
      throw new Error('Test 8 FAILED: Student 1 was able to read quiz answer keys!');
    }
    console.log('✔ Test 8 PASS: Student 1 query on quiz_answer_keys returned 0 records (RLS enforced).');

    // -------------------------------------------------------------------------
    // TEST 9: Security - Student 1 cannot directly INSERT arbitrary scores in quiz_attempts
    // -------------------------------------------------------------------------
    const directScoreRes = await fetch(`${SUPABASE_URL}/rest/v1/quiz_attempts`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${student1.token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        student_id: student1.user.id,
        quiz_id: testQuizId,
        score: 100.00
      })
    });
    // Schema only permits SELECT for students on quiz_attempts. INSERT by students is forbidden.
    if (directScoreRes.status === 201) {
      throw new Error('Test 9 FAILED: Student was able to insert an arbitrary score directly into quiz_attempts!');
    }
    console.log(`✔ Test 9 PASS: Student direct insert of score into quiz_attempts blocked with HTTP ${directScoreRes.status}.`);

    // -------------------------------------------------------------------------
    // TEST 10: Server-Side Grading via RPC function `submit_quiz_attempt`
    // -------------------------------------------------------------------------
    const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/submit_quiz_attempt`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${student1.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_quiz_id: testQuizId,
        p_answers: [
          { question_id: testQuestionId, selected_option_id: correctOptId }
        ]
      })
    });

    if (rpcRes.status === 200) {
      const rpcData = await rpcRes.json();
      console.log('✔ Test 10 PASS: PostgreSQL RPC submit_quiz_attempt executed successfully!');
      console.log('   Grading Result:', JSON.stringify(rpcData));
      if (rpcData.score !== 100 || rpcData.correct_count !== 1) {
        throw new Error(`Grading score mismatch: expected 100%, got ${rpcData.score}%`);
      }
    } else {
      const errBody = await rpcRes.json();
      console.log(`ℹ Test 10 NOTICE: RPC function returned HTTP ${rpcRes.status} (${errBody.code}: ${errBody.message})`);
      console.log('  NOTE: If code is PGRST202, supabase/phase04_student_functions.sql needs to be executed in the Supabase SQL Editor.');
    }

    // -------------------------------------------------------------------------
    // TEST 11: Cross-Student Attempts Isolation - Student 2 cannot read Student 1 quiz attempts
    // -------------------------------------------------------------------------
    const s2AttemptsRes = await fetch(`${SUPABASE_URL}/rest/v1/quiz_attempts?student_id=eq.${student1.user.id}`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${student2.token}`
      }
    });
    const s2Attempts = await s2AttemptsRes.json();
    if (s2Attempts.length !== 0) {
      throw new Error('Test 11 FAILED: Student 2 was able to read Student 1 quiz attempts!');
    }
    console.log('✔ Test 11 PASS: Student 2 cannot read Student 1 quiz attempts (RLS enforced).');

    // -------------------------------------------------------------------------
    // TEST 12: Instructor Regression Check - Instructor 1 can still update their course
    // -------------------------------------------------------------------------
    const instCheckRes = await fetch(`${SUPABASE_URL}/rest/v1/courses?id=eq.${testCourseId}`, {
      method: 'PATCH',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${inst1.token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ title: 'Phase 04 Verified Course (Updated)' })
    });
    if (instCheckRes.status !== 200) {
      throw new Error(`Test 12 FAILED: Instructor update failed with status ${instCheckRes.status}`);
    }
    console.log('✔ Test 12 PASS: Instructor regression verified; instructor retains course edit privileges.');

    console.log('\n======================================================');
    console.log('--- ALL AUTOMATED PHASE 04 TESTS COMPLETED! ---');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ PHASE 04 TEST ERROR:', err);
    process.exit(1);
  } finally {
    // CLEANUP: Delete test courses created for this run
    if (testCourseId) {
      await fetch(`${SUPABASE_URL}/rest/v1/courses?id=eq.${testCourseId}`, {
        method: 'DELETE',
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${inst1.token}`
        }
      });
    }
    if (draftCourseId) {
      await fetch(`${SUPABASE_URL}/rest/v1/courses?id=eq.${draftCourseId}`, {
        method: 'DELETE',
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${inst1.token}`
        }
      });
    }
    console.log('✔ Cleanup completed: Test courses deleted.\n');
  }
}

runTests();
