# Master Test Plan & Manual Test Matrix

**Project:** Online Education Platform Testing  
**Degree Track:** MCA Integrated Project (Advanced Web Technologies, Software Testing & Reliability, Cloud Infrastructure)  
**Testing Frameworks:** Vitest 5.x, React Testing Library 16.x, jsdom, Live PostgreSQL REST / RPC scripts  
**Environment:** Node.js v22.x, Windows, Vite 6, Tailwind CSS v4, Supabase Hosted PostgreSQL  

---

## 1. Test Strategy & Scope Overview

The testing strategy follows a structured testing pyramid:
1. **Unit Tests (Fast & Pure):** Isolated mathematical calculation of course progress percentages, boundary handling (0/0, rounding, cross-course isolation), and validation functions (emails, course metadata, lesson forms, quiz questions, UUID validation).
2. **Component Tests (React Testing Library + jsdom):** Behavior-driven verification of forms, buttons, loading spinners, empty states, error banners, and client-side route guards.
3. **Automated Live Integration & Security Scripts:** Live HTTP REST queries using real Supabase JWT tokens testing PostgreSQL Row Level Security (RLS) enforcement, cross-user isolation, answer key privacy, and server-side RPC quiz grading.
4. **Manual End-to-End Test Matrix:** Realistic interactive verification in the browser for both Student and Instructor personas.

---

## 2. Comprehensive Test Case Matrix

| Test ID | Module | Preconditions | Test Steps | Expected Result | Actual Result | Status | Evidence |
|---|---|---|---|---|---|---|---|
| **AUTH-01** | Authentication | User is logged out | Navigate to `/login`, inspect form fields | Form renders with Email, Password inputs, Sign In button, and 4 demo buttons | Rendered accurately with all persona buttons | **Pass** | `LoginPage.test.jsx` |
| **AUTH-02** | Authentication | User on `/login` | Click `Student Demo 1` button | Populates `student1.demo@example.com` and `Student123!` without auto-submitting form | Inputs populated; form not submitted; notice rendered | **Pass** | `LoginPage.test.jsx` |
| **AUTH-03** | Authentication | User on `/login` | Click `Instructor Demo 1` button | Populates `instructor1.demo@example.com` and `Instructor123!` without auto-submitting | Inputs populated; form not submitted | **Pass** | `LoginPage.test.jsx` |
| **AUTH-04** | Authentication | Empty form inputs | Click `Sign In` button | Client displays "Please enter your email address." | Validation error displayed; submission blocked | **Pass** | `LoginPage.test.jsx` |
| **AUTH-05** | Authentication | Valid email, empty password | Click `Sign In` button | Client displays "Please enter your password." | Validation error displayed; submission blocked | **Pass** | `LoginPage.test.jsx` |
| **AUTH-06** | Authentication | Invalid credentials | Enter non-existent credentials, submit | Error banner displayed: "Invalid login credentials." | Auth error banner rendered; loading state resets | **Pass** | `LoginPage.test.jsx` |
| **AUTH-07** | Authentication | Valid credentials | Enter `Student Demo 1` credentials, click Sign In | Successfully authenticates, resolves role `student`, redirects to `/student` | Redirected to `/student` dashboard | **Pass** | Manual Browser Run |
| **AUTH-08** | Authentication | Active student session | Click `Sign Out` button in Header | Clears session, resets auth context, redirects to `/login` | Logged out successfully; protected routes blocked | **Pass** | `Header.test.jsx` |
| **AUTH-09** | Authentication | Active session | Refresh browser (`F5` or Reload) | Session restored from Supabase local storage without logging out | Session restored instantly with student role | **Pass** | Manual Browser Run |
| **GUARD-01** | Protected Route | Logged out visitor | Enter `/student` directly in browser URL | Access blocked; redirected to `/login` with `from` state | Redirected to `/login` with return destination | **Pass** | `ProtectedRoute.test.jsx` |
| **GUARD-02** | Protected Route | Logged out visitor | Enter `/instructor` directly in URL | Access blocked; redirected to `/login` | Redirected to `/login` | **Pass** | `ProtectedRoute.test.jsx` |
| **GUARD-03** | Protected Route | Signed in as Student | Enter `/instructor` directly in URL | Access Denied (HTTP 403 screen); portal content hidden | Access Denied screen rendered with role indicator | **Pass** | `ProtectedRoute.test.jsx` |
| **GUARD-04** | Protected Route | Signed in as Instructor | Enter `/student` directly in URL | Access Denied (HTTP 403 screen); student portal hidden | Access Denied screen rendered with role indicator | **Pass** | `ProtectedRoute.test.jsx` |
| **INST-01** | Instructor | Logged in as Instructor 1 | Navigate to `/instructor` (no courses) | Clean empty state with "Create Your First Course" CTA | Empty state rendered with CTA button | **Pass** | `InstructorFlow.test.jsx` |
| **INST-02** | Instructor | On `/instructor/courses/new` | Leave title blank, click Save as Draft | Form validation rejects submit: "Course title is required." | Error banner shown; submit blocked | **Pass** | `InstructorFlow.test.jsx` |
| **INST-03** | Instructor | On `/instructor/courses/new` | Enter valid title and description, save as draft | Course saved to PostgreSQL with `is_published: false` | Course created with Draft badge | **Pass** | `verify_phase03.js` Test 1 |
| **INST-04** | Instructor | On course edit screen | Update course title, set `is_published: true` | Course updated and published in Supabase | Title updated; badge changes to Published | **Pass** | `verify_phase03.js` Test 2 |
| **INST-05** | Instructor | On lessons management | Add text lesson with title, content, position | Lesson inserted and ordered by position | Lesson saved to `lessons` table | **Pass** | `verify_phase03.js` Test 3 |
| **INST-06** | Instructor | On quiz management | Add question, options, radio select correct answer | Quiz and options created; answer key stored in `quiz_answer_keys` | Quiz authored with private answer key | **Pass** | `verify_phase03.js` Test 4 |
| **INST-07** | Instructor | Logged in as Instructor 2 | Attempt to edit or delete Instructor 1's course | Blocked by RLS (0 rows modified) | 0 rows modified; HTTP 200 with empty array | **Pass** | `verify_phase03.js` Test 5 |
| **INST-08** | Instructor | Logged in as Instructor 2 | Attempt to insert lesson into Instructor 1's course | Blocked by RLS with HTTP 403 Forbidden | HTTP 403 Forbidden returned | **Pass** | `verify_phase03.js` Test 6 |
| **STUD-01** | Student | Logged in as Student 1 | Navigate to `/student/courses` (catalogue) | Displays published courses; hides draft courses | Published courses visible; drafts hidden | **Pass** | `verify_phase04.js` Test 1 & 2 |
| **STUD-02** | Student | On `/student/courses` | Click "Enroll in Course" on published course | Inserts enrollment into `enrollments`; updates to "Enrolled" | Enrolled status reflected immediately | **Pass** | `verify_phase04.js` Test 3 |
| **STUD-03** | Student | Enrolled in course | Attempt duplicate enrollment | Blocked by PostgreSQL unique constraint (HTTP 409) | HTTP 409 Conflict handled gracefully | **Pass** | `verify_phase04.js` Test 4 |
| **STUD-04** | Student | Viewing lesson | Click "Mark as Complete" | Inserts `lesson_progress` record; button toggles | Record saved; progress percentage increases | **Pass** | `verify_phase04.js` Test 5 |
| **STUD-05** | Student | Completed lesson | Click "✓ Completed (Click to Unmark)" | Updates `lesson_progress` to incomplete (`is_completed: false`) | Progress percentage decreases; status unmarks | **Pass** | `verify_phase04.js` Test 6 |
| **STUD-06** | Student | Logged in as Student 2 | Attempt to read or modify Student 1 progress | Blocked by RLS (0 rows returned or modified) | 0 rows returned; isolation maintained | **Pass** | `verify_phase04.js` Test 7 |
| **STUD-07** | Student | On quiz page | Click Submit without answering all questions | Form validation blocks submit; displays unanswered count | Warning displayed: "Unanswered: X of Y" | **Pass** | `StudentFlow.test.jsx` |
| **STUD-08** | Student | On quiz page | Answer all questions, click Submit | Calls RPC `submit_quiz_attempt`; PostgreSQL grades score | Evaluated server-side; displays score percentage | **Pass** | `verify_phase04.js` Test 10 |
| **STUD-09** | Student | Attempted quiz | Navigate to `/student/results` | Historical attempt listed with quiz title, score, and date | Historical score records rendered accurately | **Pass** | `verify_phase04.js` Test 11 |
| **SEC-01** | Security | Unauthenticated visitor | Attempt direct REST insert into `courses` | Blocked by RLS | HTTP 401 Unauthorized | **Pass** | `verify_phase03.js` Test 9 |
| **SEC-02** | Security | Student session | Attempt direct REST insert into `courses` | Blocked by RLS | HTTP 403 Forbidden | **Pass** | `verify_phase03.js` Test 7 |
| **SEC-03** | Security | Student session | Attempt query on `quiz_answer_keys` | Blocked by RLS | HTTP 200 with 0 rows returned | **Pass** | `verify_phase04.js` Test 8 |
| **SEC-04** | Security | Student session | Attempt direct REST insert of score into `quiz_attempts` | Denied by RLS (only SELECT permitted for students) | HTTP 403 Forbidden | **Pass** | `verify_phase04.js` Test 9 |
| **REL-01** | Reliability | Network disconnected / timeout | Fetch catalogue data | Error banner rendered; loading spinner cleared; retry available | Gracefully handled without runtime crash | **Pass** | `ReliabilityAndFailures.test.jsx` |
| **REL-02** | Reliability | Student on quiz form | Rapid double-click submit button | Only 1 network request triggered; button immediately disabled | Button disabled; duplicate requests prevented | **Pass** | `ReliabilityAndFailures.test.jsx` |
| **REL-03** | Reliability | Invalid URL / missing lesson ID | Open invalid lesson route | "Lesson Not Found" friendly fallback screen rendered | Friendly fallback rendered; no page crash | **Pass** | `ReliabilityAndFailures.test.jsx` |

---

## 3. Summary of Test Results

- **Automated Unit Tests:** 39 / 39 Passed (100%)
- **Automated Component Tests:** 33 / 33 Passed (100%)
- **Live Integration & Security Script Tests:** 22 / 22 Passed (100%)
  - Phase 03 Instructor Suite: 10 / 10 Passed
  - Phase 04 Student Suite: 12 / 12 Passed
- **Total Automated Checks:** 94 / 94 Passed (100%)
- **Manual Verification Cases:** All core workflows verified in local browser.
