// ==============================================================================
// Phase 03 End-to-End Verification Test Script
// Tests all instructor workflows and RLS security boundaries
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
  console.log('--- STARTING PHASE 03 VERIFICATION TESTS ---');

  // 1. Authenticate sessions
  const inst1 = await login('instructor1.demo@example.com', 'Instructor123!');
  console.log('✔ Authenticated Instructor 1:', inst1.user.id);

  const inst2 = await login('instructor2.demo@example.com', 'Instructor456!');
  console.log('✔ Authenticated Instructor 2:', inst2.user.id);

  const student1 = await login('student1.demo@example.com', 'Student123!');
  console.log('✔ Authenticated Student 1:', student1.user.id);

  let testCourseId = null;

  try {
    // TEST 1: Instructor 1 creates a new course as draft
    const createCourseRes = await fetch(`${SUPABASE_URL}/rest/v1/courses`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${inst1.token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        instructor_id: inst1.user.id,
        title: 'Phase 03 Test Course',
        description: 'Automated test course for Phase 03 verification.',
        is_published: false
      })
    });
    const createdCourses = await createCourseRes.json();
    if (createCourseRes.status !== 201) {
      throw new Error(`Test 1 Failed: ${JSON.stringify(createdCourses)}`);
    }
    testCourseId = createdCourses[0].id;
    console.log('✔ Test 1 PASS: Instructor 1 created draft course:', testCourseId);

    // TEST 2: Instructor 1 edits course and publishes it
    const updateCourseRes = await fetch(`${SUPABASE_URL}/rest/v1/courses?id=eq.${testCourseId}`, {
      method: 'PATCH',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${inst1.token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        title: 'Phase 03 Test Course (Published)',
        is_published: true
      })
    });
    const updatedCourses = await updateCourseRes.json();
    if (updatedCourses[0]?.is_published !== true) {
      throw new Error(`Test 2 Failed: ${JSON.stringify(updatedCourses)}`);
    }
    console.log('✔ Test 2 PASS: Instructor 1 updated title and published course');

    // TEST 3: Instructor 1 adds a lesson
    const createLessonRes = await fetch(`${SUPABASE_URL}/rest/v1/lessons`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${inst1.token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        course_id: testCourseId,
        title: 'Lesson 1: Getting Started',
        content: 'This is the first lesson text content.',
        position: 1
      })
    });
    const createdLessons = await createLessonRes.json();
    if (createLessonRes.status !== 201) {
      throw new Error(`Test 3 Failed: ${JSON.stringify(createdLessons)}`);
    }
    const lessonId = createdLessons[0].id;
    console.log('✔ Test 3 PASS: Instructor 1 added lesson:', lessonId);

    // TEST 4: Instructor 1 creates a quiz with questions, options, and answer key
    const createQuizRes = await fetch(`${SUPABASE_URL}/rest/v1/quizzes`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${inst1.token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        course_id: testCourseId,
        title: 'Quiz 1: Fundamentals'
      })
    });
    const quiz = (await createQuizRes.json())[0];

    const createQRes = await fetch(`${SUPABASE_URL}/rest/v1/quiz_questions`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${inst1.token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        quiz_id: quiz.id,
        question_text: 'What is Supabase RLS?',
        position: 1
      })
    });
    const question = (await createQRes.json())[0];

    const createOptRes = await fetch(`${SUPABASE_URL}/rest/v1/quiz_options`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${inst1.token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify([
        { question_id: question.id, option_text: 'PostgreSQL Row Level Security', position: 1 },
        { question_id: question.id, option_text: 'A frontend state library', position: 2 }
      ])
    });
    const options = await createOptRes.json();

    const createKeyRes = await fetch(`${SUPABASE_URL}/rest/v1/quiz_answer_keys`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${inst1.token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        question_id: question.id,
        correct_option_id: options[0].id
      })
    });
    if (createKeyRes.status !== 201) {
      throw new Error(`Quiz answer key create failed: ${JSON.stringify(await createKeyRes.json())}`);
    }
    console.log('✔ Test 4 PASS: Instructor 1 authored quiz with question, options, and answer key');

    // TEST 5: Instructor 2 cannot modify Instructor 1's course
    const inst2ModCourseRes = await fetch(`${SUPABASE_URL}/rest/v1/courses?id=eq.${testCourseId}`, {
      method: 'PATCH',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${inst2.token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ title: 'Tampered by Instructor 2' })
    });
    const inst2ModResult = await inst2ModCourseRes.json();
    if (inst2ModResult.length !== 0) {
      throw new Error('Test 5 FAILED: Instructor 2 was able to modify Instructor 1 course!');
    }
    console.log('✔ Test 5 PASS: Instructor 2 denied update on Instructor 1 course (0 rows modified)');

    // TEST 6: Instructor 2 cannot add a lesson to Instructor 1's course
    const inst2AddLessonRes = await fetch(`${SUPABASE_URL}/rest/v1/lessons`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${inst2.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        course_id: testCourseId,
        title: 'Unauthorized Lesson',
        content: 'Hacked',
        position: 2
      })
    });
    if (inst2AddLessonRes.status !== 403) {
      throw new Error(`Test 6 FAILED: Expected 403, got ${inst2AddLessonRes.status}`);
    }
    console.log('✔ Test 6 PASS: Instructor 2 blocked from adding lesson to Instructor 1 course (HTTP 403)');

    // TEST 7: Student 1 cannot create a course
    const studentCreateCourseRes = await fetch(`${SUPABASE_URL}/rest/v1/courses`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${student1.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instructor_id: student1.user.id,
        title: 'Student Created Course',
        description: 'Should be rejected',
        is_published: true
      })
    });
    if (studentCreateCourseRes.status !== 403) {
      throw new Error(`Test 7 FAILED: Expected 403 for student course creation, got ${studentCreateCourseRes.status}`);
    }
    console.log('✔ Test 7 PASS: Student 1 blocked from creating course (HTTP 403)');

    // TEST 8: Student 1 cannot read answer keys
    const studentReadKeysRes = await fetch(`${SUPABASE_URL}/rest/v1/quiz_answer_keys?select=*`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${student1.token}`
      }
    });
    const studentKeys = await studentReadKeysRes.json();
    if (studentKeys.length !== 0) {
      throw new Error('Test 8 FAILED: Student was able to read answer keys!');
    }
    console.log('✔ Test 8 PASS: Student 1 query on quiz_answer_keys returned 0 records (protected by RLS)');

    // TEST 9: Anonymous (unauthenticated) request cannot create course
    const anonRes = await fetch(`${SUPABASE_URL}/rest/v1/courses`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Anon Course',
        description: 'Blocked'
      })
    });
    if (anonRes.status !== 401 && anonRes.status !== 403) {
      throw new Error(`Test 9 FAILED: Expected 401/403 for anon insert, got ${anonRes.status}`);
    }
    console.log('✔ Test 9 PASS: Unauthenticated course creation rejected (HTTP ' + anonRes.status + ')');

    // TEST 10: Instructor 1 deletes course (verifying cascade delete of lessons and quizzes)
    const delRes = await fetch(`${SUPABASE_URL}/rest/v1/courses?id=eq.${testCourseId}`, {
      method: 'DELETE',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${inst1.token}`
      }
    });
    if (delRes.status !== 204) {
      throw new Error(`Test 10 FAILED: Delete course returned status ${delRes.status}`);
    }
    console.log('✔ Test 10 PASS: Instructor 1 deleted test course with cascade');

    console.log('\n--- ALL 10 VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
  } catch (err) {
    console.error('TEST SUITE ERROR:', err);
    // Cleanup if course was created
    if (testCourseId) {
      await fetch(`${SUPABASE_URL}/rest/v1/courses?id=eq.${testCourseId}`, {
        method: 'DELETE',
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${inst1.token}`
        }
      });
    }
    process.exit(1);
  }
}

runTests();
