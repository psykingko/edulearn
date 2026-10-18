# Defect Tracking Log — Software Testing and Reliability

**Project:** Online Education Platform Testing  
**Current Phase:** Phase 05 — Testing, Regression, and Reliability  
**Tracking Standard:** IEEE 829 Standard for Software and System Test Documentation  

---

## 1. Defect Summary Table

| Defect ID | Title | Module | Severity | Status | Resolution |
|---|---|---|---|---|---|
| **DEF-01** | Ambiguous text locator in `InstructorFlow.test.jsx` causing multiple matching elements error | Testing / Instructor | Low | **Fixed** | Replaced text regex with semantic role `getByRole('link', { name: 'Create Your First Course' })`. |
| **DEF-02** | Missing async `act(...)` wrap on Header logout navigation in Vitest runner | Testing / Navigation | Low | **Fixed** | Imported `act` and wrapped async logout trigger in `act(async () => { fireEvent.click(logoutBtn); })`. |
| **DEF-03** | PostgREST `PGRST202` schema cache latency for RPC `submit_quiz_attempt` prior to SQL migration execution | Student / Quiz Evaluation | Medium | **Fixed** | Added descriptive error banner in `QuizAttemptPage.jsx` advising execution of `phase04_student_functions.sql`. Verified live in Supabase SQL Editor. |

---

## 2. Detailed Defect Reports

### DEF-01: Ambiguous text locator in `InstructorFlow.test.jsx`
- **Module:** Component Testing / `InstructorDashboard.jsx`
- **Severity:** Low (Test Harness Quality)
- **Status:** **Fixed**
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
- **Retest Evidence:** Test passed immediately; 0 errors on subsequent runs.

---

### DEF-02: Missing async `act(...)` wrap on Header logout navigation
- **Module:** Component Testing / `Header.jsx`
- **Severity:** Low (Console Noise / Test Hygiene)
- **Status:** **Fixed**
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
- **Retest Evidence:** Warning completely eliminated; test passed with clean output.

---

### DEF-03: PostgREST `PGRST202` Schema Cache Latency for Quiz Submission RPC
- **Module:** Student Portal / `QuizAttemptPage.jsx`
- **Severity:** Medium (Deployment / Integration)
- **Status:** **Fixed**
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
- **Retest Evidence:** SQL migration was executed by user in Supabase; `verify_phase04.js` Test 10 executed against live database and passed with HTTP 200, returning verified score `100%`.
