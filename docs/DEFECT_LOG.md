# Defect Tracking Log — Software Testing and Reliability

**Project:** Online Education Platform (EduLearn)  
**Standard:** IEEE 829 Standard for Software and System Test Documentation  
**Repository State:** Verified against actual code and test executions  

---

## 1. Defect Summary Table

| Defect ID | Title | Module | Severity | Status | Resolution |
|---|---|---|---|---|---|
| **DEF-01** | Ambiguous text locator in `InstructorFlow.test.jsx` causing multiple matching elements error | Testing / Instructor | Low | **Fixed** | Replaced text regex with semantic role `getByRole('link', { name: 'Create Your First Course' })`. |
| **DEF-02** | Missing async `act(...)` wrap on Header logout navigation in Vitest runner | Testing / Navigation | Low | **Fixed** | Imported `act` from React Testing Library and wrapped async logout trigger in `act(async () => { fireEvent.click(logoutBtn); })`. |
| **DEF-03** | PostgREST `PGRST202` schema cache latency for RPC `submit_quiz_attempt` prior to SQL migration execution | Student / Quiz Evaluation | Medium | **Fixed** | Added descriptive error banner in `QuizAttemptPage.jsx` advising execution of `phase04_student_functions.sql`. Verified live in Supabase SQL Editor. |
| **DEF-04** | Unrestricted Student Catalogue Navigation for Instructor Role Causing HTTP 403 | Navigation / Authorization | Medium | **Fixed** | Hid `Explore Courses` link in `Header.jsx`, `Footer.jsx`, and `HomePage.jsx` when authenticated role is `instructor`, routing instructors to `Instructor Portal` instead. |
| **DEF-05** | Stale Authentication Prompts in Footer and Landing CTA During Active Session | Layout / Home Page | Low | **Fixed** | Connected `Footer.jsx` to `AuthContext` to conditionally hide `Sign In` / `Register` during active sessions; updated `HomePage.jsx` bottom CTA banner to display role-appropriate dashboard links. |

---

## 2. Detailed Defect Reports

### DEF-01: Ambiguous text locator in `InstructorFlow.test.jsx`
- **Module:** Component Testing / `InstructorDashboard.jsx`
- **Severity:** Low (Test Harness Quality)
- **Status:** **Fixed**
- **Date Identified:** Phase 05 Testing
- **Steps to Reproduce:**
  1. Render `InstructorDashboard` inside `MemoryRouter` with 0 courses.
  2. Query `screen.getByText(/create your first course/i)`.
- **Expected Behavior:** Exactly one matching element returned.
- **Actual Behavior:** Vitest threw `TestingLibraryElementError: Found multiple elements with the text: /create your first course/i` because the string occurred in both the description paragraph and the call-to-action link button.
- **Root Cause:** Non-semantic regex query matching multiple DOM nodes.
- **Fix:** Switched to semantic role selector:
  ```javascript
  expect(screen.getByRole('link', { name: 'Create Your First Course' })).toBeInTheDocument();
  ```
- **Retest Evidence:** Test passed immediately; 0 errors on subsequent runs in `InstructorFlow.test.jsx`.

---

### DEF-02: Missing async `act(...)` wrap on Header logout navigation
- **Module:** Component Testing / `Header.jsx`
- **Severity:** Low (Console Noise / Test Hygiene)
- **Status:** **Fixed**
- **Date Identified:** Phase 05 Testing
- **Steps to Reproduce:**
  1. Render `Header` with authenticated student session.
  2. Trigger `fireEvent.click(logoutBtn)`.
- **Expected Behavior:** Logout triggers and React Router navigation state updates cleanly without warnings.
- **Actual Behavior:** React console emitted: `An update to MemoryRouter inside a test was not wrapped in act(...)`.
- **Root Cause:** Asynchronous state transition in React Router v7 triggered after the synchronous test block finished.
- **Fix:** Wrapped the click trigger in `await act(...)`:
  ```javascript
  await act(async () => {
    fireEvent.click(logoutBtn);
  });
  ```
- **Retest Evidence:** Warning completely eliminated; test passed with clean console output in `Header.test.jsx`.

---

### DEF-03: PostgREST `PGRST202` Schema Cache Latency for Quiz Submission RPC
- **Module:** Student Portal / `QuizAttemptPage.jsx`
- **Severity:** Medium (Deployment / Integration)
- **Status:** **Fixed**
- **Date Identified:** Phase 04 / Phase 05 Integration
- **Steps to Reproduce:**
  1. Submit answers to `/rest/v1/rpc/submit_quiz_attempt` before running the SQL DDL in Supabase SQL editor.
  2. Supabase PostgREST returns HTTP 404 with code `PGRST202`.
- **Expected Behavior:** System informs user of the pending database migration clearly instead of a generic failure.
- **Actual Behavior:** Generic RPC failure error displayed.
- **Root Cause:** Hosted PostgREST schema cache does not expose functions until DDL execution is run in Supabase SQL editor.
- **Fix:** Added specialized error mapping in `QuizAttemptPage.jsx`:
  ```javascript
  if (error.code === 'PGRST202' || error.message?.includes('schema cache')) {
    throw new Error('The secure quiz evaluation function "submit_quiz_attempt" has not been created in your Supabase database yet. Please run supabase/phase04_student_functions.sql in your Supabase SQL Editor.');
  }
  ```
- **Retest Evidence:** SQL migration executed in Supabase; `verify_demo_courses.js` and `verify_phase04.js` executed against live database and passed with HTTP 200, returning verified score `100%`.

---

### DEF-04: Unrestricted Student Catalogue Navigation for Instructor Role Causing HTTP 403
- **Module:** Navigation & Access Control / `Header.jsx`, `Footer.jsx`, `HomePage.jsx`
- **Severity:** Medium (User Experience / Role Mismatch)
- **Status:** **Fixed**
- **Date Identified:** UI Redesign Verification
- **Steps to Reproduce:**
  1. Sign in as Instructor Demo 1 or Instructor Demo 2.
  2. Click `Explore Courses` in the top navigation bar or footer.
  3. Browser routes to `/student/courses`.
- **Expected Behavior:** Instructors should not see irrelevant student catalogue navigation links, or should be directed to their instructor workspace.
- **Actual Behavior:** `ProtectedRoute` correctly denied access and rendered a 403 Access Denied screen because `/student/courses` is restricted to `allowedRoles={['student']}`.
- **Root Cause:** Navigation links in `Header.jsx` and `Footer.jsx` unconditionally rendered `Explore Courses` for all roles, including instructors who have no enrollment capabilities.
- **Fix:**
  - In `Header.jsx`: Added conditional `{role !== 'instructor' && <NavLink to="/student/courses">Explore Courses</NavLink>}` to desktop and mobile menus.
  - In `Footer.jsx`: Connected component to `useAuth()` and suppressed `Explore Courses` when `role === 'instructor'`.
  - In `HomePage.jsx`: Replaced hero CTA, featured course card actions, and bottom CTA with instructor-specific links (`Go to Instructor Portal →`, `+ Create New Course`, `Manage Course →`).
- **Retest Evidence:** Manual browser navigation verified; all 84 Vitest tests passed with 0 regressions.

---

### DEF-05: Stale Authentication Prompts in Footer and Landing CTA During Active Session
- **Module:** Public Layout & Home Page / `Footer.jsx`, `HomePage.jsx`
- **Severity:** Low (Cosmetic / Workflow Clarity)
- **Status:** **Fixed**
- **Date Identified:** UI Redesign Verification
- **Steps to Reproduce:**
  1. Authenticate as a student or instructor.
  2. Navigate to `/` (Home) and scroll to the bottom call-to-action card and footer.
- **Expected Behavior:** Prompts to sign in or register should be hidden or replaced with dashboard links when an authenticated session is active.
- **Actual Behavior:** The bottom banner rendered `[Sign In to Your Account]` and the footer rendered `Sign In` and `Register` links despite an active session.
- **Root Cause:** `Footer.jsx` had hardcoded auth links, and the bottom section of `HomePage.jsx` did not inspect the `user` state from `AuthContext`.
- **Fix:**
  - Connected `Footer.jsx` to `useAuth()` and conditionally rendered `Sign In` and `Register` only when `!user`.
  - Updated `HomePage.jsx` bottom CTA banner to render `Go to Student Dashboard →` for students and `Go to Instructor Portal →` for instructors.
- **Retest Evidence:** Manual browser inspection confirmed appropriate authenticated actions; `npm test` passed with 84/84 tests.
