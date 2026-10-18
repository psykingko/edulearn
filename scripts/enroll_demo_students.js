// ==============================================================================
// EduLearn — Enroll Demo Students in Both Courses
// File: scripts/enroll_demo_students.js
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

async function api(path, options = {}, token = null) {
  const headers = {
    'apikey': ANON_KEY,
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, ok: res.ok, data };
}

async function main() {
  console.log('Fetching published demo courses...');
  const coursesRes = await api('courses?select=id,title,instructor_id&is_published=eq.true');
  if (!coursesRes.ok || !coursesRes.data || coursesRes.data.length < 2) {
    throw new Error(`Could not fetch published courses: ${JSON.stringify(coursesRes.data)}`);
  }

  console.log(`Found ${coursesRes.data.length} published courses:`);
  coursesRes.data.forEach(c => console.log(` - [${c.id}] ${c.title}`));

  const students = [
    { email: 'student1.demo@example.com', pass: 'Student123!', name: 'Alice Student (Demo 1)' },
    { email: 'student2.demo@example.com', pass: 'Student456!', name: 'Bob Student (Demo 2)' },
  ];

  for (const st of students) {
    console.log(`\nLogging in as ${st.name} (${st.email})...`);
    const session = await login(st.email, st.pass);
    console.log(`✔ Authenticated: ${session.user.id}`);

    for (const c of coursesRes.data) {
      // Check existing enrollment
      const existing = await api(`enrollments?student_id=eq.${session.user.id}&course_id=eq.${c.id}`, { method: 'GET' }, session.token);
      if (existing.data && existing.data.length > 0) {
        console.log(`  ✔ Already enrolled in "${c.title}"`);
      } else {
        const enrollRes = await api('enrollments', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify({
            student_id: session.user.id,
            course_id: c.id
          })
        }, session.token);

        if (!enrollRes.ok) {
          throw new Error(`Failed to enroll in "${c.title}": ${JSON.stringify(enrollRes.data)}`);
        }
        console.log(`  ✔ Successfully enrolled in "${c.title}"`);
      }
    }
  }

  console.log('\n===========================================================');
  console.log('✔ BOTH DEMO STUDENTS SUCCESSFULLY ENROLLED IN BOTH COURSES!');
  console.log('===========================================================');
}

main().catch(err => {
  console.error('\n❌ ERROR:', err.message);
  process.exit(1);
});
