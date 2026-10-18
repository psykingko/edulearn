# Master Test Plan & Manual Test Matrix

**Project:** Online Education Platform (EduLearn)  
**Degree Track:** MCA Integrated Project (Advanced Web Technologies, Software Testing & Reliability, Cloud Infrastructure)  
**Testing Frameworks:** Vitest 5.x, React Testing Library 16.x, jsdom, Live PostgreSQL REST / RPC scripts  
**Environment:** Node.js v22.x, Windows 11, Vite 6, Tailwind CSS v4, Supabase Hosted PostgreSQL  
**Last Reconciled:** Verified against actual test execution and codebase (84 Vitest tests, 22 live integration tests)  

---

## 1. Test Strategy & Scope Overview

The software testing strategy follows a rigorous multi-tier testing pyramid:

```
           / \
          /   \     Manual Acceptance & Exploratory (Browser Personas)
         /-----\
        / Live  \   Automated Integration & RLS Security Scripts (Node + Supabase Client)
       /  Integ  \  (verify_demo_courses.js, verify_phase03.js, verify_phase04.js)
      /-----------\
     /  Component  \  React Testing Library + Vitest + jsdom
    /   & UI Flow   \ (Form validation, route guards, async auth, error banners)
   /-----------------\
  /    Pure Unit      \ Vitest (Score math, progress boundary checks, regex validation)
 /---------------------\
```

1. **Unit Tests (Fast & Pure):** Isolated mathematical calculation of course progress percentages, boundary handling (0/0, 100%, rounding, negative numbers), and validation functions (emails, course titles/descriptions, lesson forms, quiz questions, UUID validation).
2. **Component Tests (React Testing Library + jsdom):** Behavior-driven verification of forms, input changes, button clicks, loading spinners, empty states, error banners, and client-side route guards (`ProtectedRoute`).
3. **Automated Live Integration & Security Scripts:** Live HTTP REST queries using real Supabase JWT tokens testing PostgreSQL Row Level Security (RLS) enforcement, cross-user isolation, answer key privacy, and server-side RPC quiz grading (`submit_quiz_attempt`).
4. **Manual End-to-End Test Matrix:** Interactive verification in local browser sessions for Student (Alice, Bob) and Instructor (Dr. Sarah Connor, Prof. John Matrix) personas.

---

## 2. Comprehensive Test Case Matrix

| Test ID | Module | Preconditions | Test Steps | Expected Result | Actual Result | Status | Verification Source |
|---|---|---|---|---|---|---|---|
| **AUTH-01** | Authentication | User is logged out | Navigate to `/login`, inspect form fields | Form renders with Email, Password inputs, Sign In button, and 4 demo buttons | Rendered accurately with all persona buttons | **Pass** | `src/test/components/LoginPage.test.jsx` |
| **AUTH-02** | Authentication | User on `/login` | Click `Student Demo 1 (Alice)` button | Populates `student1.demo@example.com` and `Student123!` without auto-submitting form | Inputs populated; form not submitted; notice rendered | **Pass** | `src/test/components/LoginPage.test.jsx` |
| **AUTH-03** | Authentication | User on `/login` | Click `Instructor Demo 1` button | Populates `instructor1.demo@example.com` and `Instructor123!` without auto-submitting | Inputs populated; form not submitted | **Pass** | `src/test/components/LoginPage.test.jsx` |
| **AUTH-04** | Authentication | Empty form inputs | Click `Sign In` button | Client displays "Please enter your email address." | Validation error displayed; submission blocked | **Pass** | `src/test/components/LoginPage.test.jsx` |
| **AUTH-05** | Authentication | Valid email, empty password | Click `Sign In` button | Client displays "Please enter your password." | Validation error displayed; submission blocked | **Pass** | `src/test/components/LoginPage.test.jsx` |
| **AUTH-06** | Authentication | Invalid credentials | Enter non-existent credentials, submit | Error banner displayed: "Invalid login credentials." | Auth error banner rendered; loading state resets | **Pass** | `src/test/components/LoginPage.test.jsx` |
| **AUTH-07** | Authentication | Valid credentials | Enter `Student Demo 1` credentials, click Sign In | Successfully authenticates, resolves role `student`, redirects to `/student` | Redirected to `/student` dashboard | **Pass** | Live Session / Browser Run |
| **AUTH-08** | Authentication | Active student session | Click `Sign Out` button in Header | Clears session, resets auth context, redirects to `/login` | Logged out successfully; protected routes blocked | **Pass** | `src/test/components/Header.test.jsx` |
| **AUTH-09** | Authentication | Active session | Refresh browser (`F5` or Reload) | Session restored from Supabase local storage without logging out | Session restored instantly with student role | **Pass** | Live Session / Browser Run |
| **AUTH-10** | Registration | Unauthenticated visitor | On `/signup`, submit empty form | Client highlights validation errors (Name required, Email invalid, Password short) | All validation errors rendered; submit prevented | **Pass** | `src/test/components/SignupPage.test.jsx` |
| **AUTH-11** | Registration | Unauthenticated visitor | On `/signup`, select Instructor account type, submit valid credentials | Account created with default `student` role; pending record added to `instructor_applications` | Confirmation screen shows pending instructor review | **Pass** | `src/test/components/SignupPage.test.jsx` |
| **GUARD-01** | Protected Route | Logged out visitor | Enter `/student` directly in browser URL | Access blocked; redirected to `/login` with `from` state | Redirected to `/login` with return destination | **Pass** | `src/test/components/ProtectedRoute.test.jsx` |
| **GUARD-02** | Protected Route | Logged out visitor | Enter `/instructor` directly in URL | Access blocked; redirected to `/login` | Redirected to `/login` | **Pass** | `src/test/components/ProtectedRoute.test.jsx` |
| **GUARD-03** | Protected Route | Signed in as Student | Enter `/instructor` directly in URL | Access Denied (HTTP 403 screen); portal content hidden | Access Denied screen rendered with role indicator | **Pass** | `src/test/components/ProtectedRoute.test.jsx` |
| **GUARD-04** | Protected Route | Signed in as Instructor | Enter `/student` directly in URL | Access Denied (HTTP 403 screen); student portal hidden | Access Denied screen rendered with role indicator | **Pass** | `src/test/components/ProtectedRoute.test.jsx` |
| **INST-01** | Instructor | Logged in as Instructor 1 | Navigate to `/instructor` (no courses) | Clean empty state with "Create Your First Course" CTA | Empty state rendered with CTA button | **Pass** | `src/test/components/InstructorFlow.test.jsx` |
| **INST-02** | Instructor | On `/instructor/courses/new` | Leave title blank, click Save as Draft | Form validation rejects submit: "Course title is required." | Error banner shown; submit blocked | **Pass** | `src/test/components/InstructorFlow.test.jsx` |
| **INST-03** | Instructor | On `/instructor/courses/new` | Enter valid title and description, save as draft | Course saved to PostgreSQL with `is_published: false` | Course created with Draft badge | **Pass** | `scripts/verify_phase03.js` Test 1 |
| **INST-04** | Instructor | On course edit screen | Update course title, set `is_published: true` | Course updated and published in Supabase | Title updated; badge changes to Published | **Pass** | `scripts/verify_phase03.js` Test 2 |
| **INST-05** | Instructor | On lessons management | Add text lesson with title, content, position | Lesson inserted and ordered by position | Lesson saved to `lessons` table | **Pass** | `scripts/verify_phase03.js` Test 3 |
| **INST-06** | Instructor | On quiz management | Add question, options, radio select correct answer | Quiz and options created; answer key stored in `quiz_answer_keys` | Quiz authored with private answer key | **Pass** | `scripts/verify_phase03.js` Test 4 |
| **INST-07** | Instructor | Logged in as Instructor 2 | Attempt to edit or delete Instructor 1's course | Blocked by RLS (0 rows modified) | 0 rows modified; HTTP 200 with empty array | **Pass** | `scripts/verify_phase03.js` Test 5 |
| **INST-08** | Instructor | Logged in as Instructor 2 | Attempt to insert lesson into Instructor 1's course | Blocked by RLS with HTTP 403 Forbidden | HTTP 403 Forbidden returned | **Pass** | `scripts/verify_phase03.js` Test 6 |
| **STUD-01** | Student | Logged in as Student 1 | Navigate to `/student/courses` (catalogue) | Displays published courses; hides draft courses | Published courses visible; drafts hidden | **Pass** | `scripts/verify_phase04.js` Test 1 & 2 |
| **STUD-02** | Student | On `/student/courses` | Click "Enroll in Course" on published course | Inserts enrollment into `enrollments`; updates to "Enrolled" | Enrolled status reflected immediately | **Pass** | `scripts/verify_phase04.js` Test 3 |
| **STUD-03** | Student | Enrolled in course | Attempt duplicate enrollment | Blocked by PostgreSQL unique constraint (HTTP 409) | HTTP 409 Conflict handled gracefully | **Pass** | `scripts/verify_phase04.js` Test 4 |
| **STUD-04** | Student | Viewing lesson | Click "Mark as Complete" | Inserts `lesson_progress` record; button toggles | Record saved; progress percentage increases | **Pass** | `scripts/verify_phase04.js` Test 5 |
| **STUD-05** | Student | Completed lesson | Click "✓ Completed (Click to Unmark)" | Updates `lesson_progress` to incomplete (`is_completed: false`) | Progress percentage decreases; status unmarks | **Pass** | `scripts/verify_phase04.js` Test 6 |
| **STUD-06** | Student | Logged in as Student 2 | Attempt to read or modify Student 1 progress | Blocked by RLS (0 rows returned or modified) | 0 rows returned; isolation maintained | **Pass** | `scripts/verify_phase04.js` Test 7 |
| **STUD-07** | Student | On quiz page | Click Submit without answering all questions | Form validation blocks submit; displays warning | Warning displayed: "Please answer all questions before submitting" | **Pass** | `src/test/components/StudentFlow.test.jsx` |
| **STUD-08** | Student | On quiz page | Answer all questions, click Submit | Calls RPC `submit_quiz_attempt`; PostgreSQL grades score | Evaluated server-side; displays score percentage | **Pass** | `scripts/verify_phase04.js` Test 10 |
| **STUD-09** | Student | Attempted quiz | Navigate to `/student/results` | Historical attempt listed with quiz title, score, and date | Historical score records rendered accurately | **Pass** | `scripts/verify_phase04.js` Test 11 |
| **SEC-01** | Security | Unauthenticated visitor | Attempt direct REST insert into `courses` | Blocked by RLS | HTTP 401 Unauthorized | **Pass** | `scripts/verify_phase03.js` Test 9 |
| **SEC-02** | Security | Student session | Attempt direct REST insert into `courses` | Blocked by RLS | HTTP 403 Forbidden | **Pass** | `scripts/verify_phase03.js` Test 7 |
| **SEC-03** | Security | Student session | Attempt query on `quiz_answer_keys` | Blocked by RLS | HTTP 200 with 0 rows returned | **Pass** | `scripts/verify_phase04.js` Test 8 |
| **SEC-04** | Security | Student session | Attempt direct REST insert of score into `quiz_attempts` | Denied by RLS (only SELECT permitted for students) | HTTP 403 Forbidden | **Pass** | `scripts/verify_phase04.js` Test 9 |
| **REL-01** | Reliability | Network disconnected / timeout | Fetch catalogue data | Error banner rendered; loading spinner cleared; retry available | Gracefully handled without runtime crash | **Pass** | `src/test/components/ReliabilityAndFailures.test.jsx` |
| **REL-02** | Reliability | Student on quiz form | Rapid double-click submit button | Only 1 network request triggered; button immediately disabled | Button disabled; duplicate requests prevented | **Pass** | `src/test/components/ReliabilityAndFailures.test.jsx` |
| **REL-03** | Reliability | Invalid URL / missing lesson ID | Open invalid lesson route | "Lesson Not Found" friendly fallback screen rendered | Friendly fallback rendered; no page crash | **Pass** | `src/test/components/ReliabilityAndFailures.test.jsx` |
| **REL-04** | Reliability | Missing RPC function | PostgREST schema cache error PGRST202 | Actionable banner guides user to execute `phase04_student_functions.sql` | Actionable message rendered; no uncaught error | **Pass** | `src/test/components/ReliabilityAndFailures.test.jsx` |

---

## 3. Summary of Test Results

### Automated Test Breakdown
- **Pure Unit Tests:** 46 / 46 Passed (100%)
  - `src/test/unit/courseProgress.test.js` (15 tests: 0-lesson division by zero, 100% boundary, rounding, cross-course isolation)
  - `src/test/unit/validation.test.js` (31 tests: email RFC format, passwords, course title length, position integers, options count)
- **Component & Integration Tests (Vitest + React Testing Library):** 38 / 38 Passed (100%)
  - `src/test/components/LoginPage.test.jsx` (7 tests: form inputs, 4 demo buttons, validation, invalid auth banner)
  - `src/test/components/SignupPage.test.jsx` (5 tests: student vs instructor flow, password confirmation, validation)
  - `src/test/components/ProtectedRoute.test.jsx` (6 tests: session resolving, unauthenticated redirect, role matching, 403 screen)
  - `src/test/components/Header.test.jsx` (4 tests: public links, student dashboard links, instructor portal links, logout trigger)
  - `src/test/components/InstructorFlow.test.jsx` (7 tests: empty state, course validation, draft badge, Supabase insert)
  - `src/test/components/StudentFlow.test.jsx` (4 tests: catalogue rendering, enroll button, quiz answering, RPC grading)
  - `src/test/components/ReliabilityAndFailures.test.jsx` (5 tests: network timeout, double submit, missing lesson 404, PGRST202 schema cache error)
- **Total Vitest In-Memory Tests:** **84 / 84 Passed (100%)**

### Live Database & Security Script Tests (Node.js + Supabase HTTPS)
- `scripts/verify_demo_courses.js`: **All checks passed (100%)**
- `scripts/verify_phase03.js`: **10 / 10 Passed (100%)**
- `scripts/verify_phase04.js`: **12 / 12 Passed (100%)**
- **Total Live Integration Tests:** **22 / 22 Passed (100%)**

### Overall Automated Test Count: **106 / 106 Passed (100%)**

---

## 4. Test Execution Commands

```bash
# 1. Run all 84 Vitest unit and component tests once
npm test

# 2. Run Vitest with code coverage report (v8 provider)
npm run test:coverage

# 3. Run production build verification
npm run build

# 4. Run live database course verification (requires network access to Supabase)
node scripts/verify_demo_courses.js

# 5. Run live instructor authorization script
node scripts/verify_phase03.js

# 6. Run live student workflow and security script
node scripts/verify_phase04.js
```
