# PROJECT MASTER — Online Education Platform Testing

**Status:** FROZEN BASELINE  
**Owner:** Solo developer (AI-assisted)  
**Academic subjects:** Advanced Web Technologies; Software Testing and Reliability; Cloud Infrastructure  
**Primary constraint:** Finish a small, demonstrable, reliable project quickly. Avoid feature creep and unnecessary infrastructure.

This document is the single source of truth for project scope, technology choices, constraints, delivery phases, and report evidence. If an idea conflicts with this baseline, do not implement it unless the owner explicitly approves a change.

---

## 1. Project definition

Build a small, cloud-hosted online education platform with exactly two user portals:
1. **Student**
2. **Instructor/Teacher**

The academic emphasis is not building a large LMS. It is demonstrating web development, a real persistent backend, a cloud deployment, and a documented testing/reliability process.

### 1.1 Frozen MVP features

**Shared authentication (email/password only; no OAuth)**
- Use Supabase Auth email/password sign-in and sign-out.
- No Google login, OAuth 2.0 provider setup, social login, or third-party identity providers.
- Provide a single login page for both roles.
- On the login page, provide four clearly labelled demo-account buttons: two instructor demos and two student demos.
- Clicking a demo button fills the email and password fields only. It must not automatically sign the user in; the user clicks the normal Login button.
- Demo accounts are disposable, non-sensitive classroom accounts. Create them manually in Supabase Auth and assign their roles through the trusted setup process; do not let users choose or self-promote to instructor through a public registration form.
- If public self-registration is implemented, it must default to student and must never allow role selection or instructor privilege escalation. Keep registration minimal; if it adds unnecessary work, use pre-created demo accounts plus a simple email/password login.
- Clearly mark demo credentials as public/demo-only. Never reuse personal credentials or place real secrets in the client.
- Student and instructor roles, protected routes, and role-aware UI.
- Clear loading, empty, success, and error states.
- Responsive layout suitable for a classroom demo.

**Demo credential safety**
- The four demo accounts must contain only synthetic course/demo data and no personal or sensitive information.
- Because a browser-side button that fills a password cannot keep that password secret, demo credentials are considered public. Use disposable accounts and passwords that are unique to this project.
- Do not use Supabase service-role/secret keys in the frontend. RLS remains mandatory even for demo accounts.

**Student**
- Browse published courses.
- View course details and text-based lessons.
- Enroll in a course.
- Read lessons and mark lesson completion.
- Attempt multiple-choice quizzes.
- View quiz scores and basic learning progress.

**Instructor**
- Create and edit courses they own.
- Add/edit text lessons.
- Publish/unpublish their own courses.
- Create/edit simple multiple-choice quizzes.
- View enrollments and quiz results for their own courses.

### 1.2 Explicit exclusions — do not add

- No admin portal.
- No payments, subscriptions, shopping cart, or refunds.
- No live classes, video streaming, chat, notifications, or social feed.
- No AI tutor, chatbot, recommendations, or generative AI feature.
- No certificates, badges, gamification, or complex analytics.
- No mobile app.
- No microservices.
- No custom Node/Express backend in the initial architecture.
- No Python/FastAPI service.
- No Docker, Kubernetes, Terraform, or elaborate CI/CD.
- No paid APIs, paid domains, paid services, or paid add-ons.
- No feature additions just to make the project look more advanced.

If a feature is not in the frozen MVP above, leave it out unless the owner explicitly changes the baseline.

---

## 2. Frozen technology and deployment decisions

| Layer | Decision | Purpose |
|---|---|---|
| Language | JavaScript (ES modules) | Keep implementation straightforward |
| Frontend | React + Vite | UI and development server/build |
| Styling | Tailwind CSS | Responsive styling with low CSS overhead |
| Routing | React Router | Student/instructor pages and protected routes |
| Backend platform | Supabase | Hosted backend capabilities |
| Authentication | Supabase Auth email/password | Shared login page, session, no OAuth/social login |
| Demo access | Four pre-created disposable demo accounts | Two instructor and two student accounts; buttons fill fields, user clicks Login |
| Database | Supabase PostgreSQL | Persistent application data |
| Data access | Supabase JavaScript client over HTTPS | Browser-to-backend requests |
| Authorization | PostgreSQL Row Level Security (RLS) policies | Enforce data access on the server/database |
| Unit/component tests | Vitest + React Testing Library | Test key logic and UI |
| Manual/API checks | Browser + documented test cases; Supabase API checks as appropriate | Integration and system evidence |
| Version control | Git + GitHub | Source history and deployment integration |
| Frontend hosting | Vercel Hobby, subject to its current terms/limits | HTTPS frontend hosting |

**Do not substitute AWS, a separate Express server, another database, or another hosting provider without explicit owner approval.** The chosen baseline prioritizes simplicity and avoiding unexpected costs over demonstrating a specific vendor.

### Free-tier rule
The target is ₹0. Use only free plans and stay within their quotas. Free tiers can change, pause inactive projects, or impose eligibility/use restrictions. Before creating resources or enabling an add-on, check the current dashboard and pricing/usage page. Never enable a paid resource or enter a paid commitment without asking the owner first. Do not promise that free services will be available without limits forever.

### HTTPS and configuration
- Production frontend and Supabase endpoints must use HTTPS.
- Do not hardcode project URLs, credentials, or keys in source code.
- Create `.env.example` with placeholder values only.
- Use Vite client environment variables only for public configuration such as the Supabase project URL and intended public/anon/publishable key.
- Never put a Supabase service-role/secret key in frontend code or any `VITE_*` variable.
- Configure RLS and test it. Hiding UI buttons is not authorization.
- Do not disable security policies merely to make a feature work.
- Diagnose browser console/network errors rather than randomly changing CORS/security settings.

---

## 3. Minimum data model

Design only what the frozen features require. Expected entities:

- `profiles`: user profile and role (`student` or `instructor`); role changes must not be freely self-service.
- `courses`: instructor owner, title, description, publication status, timestamps.
- `lessons`: course, title, text content, order.
- `enrollments`: student and course, unique student/course pair.
- `quizzes`: course, title, related metadata.
- `questions`: quiz, prompt, order.
- `question_options`: question, option text, correct-answer indicator (answer keys must not be exposed to unauthorized students before submission).
- `quiz_attempts`: student, quiz, score, submission timestamp.
- `lesson_progress`: student, lesson, completion status/timestamp.

Use appropriate foreign keys, uniqueness constraints, and basic validation. Avoid unnecessary tables and abstraction. Before coding, check the current Supabase/PostgreSQL capabilities and design the minimum schema needed. All access must be protected with appropriate RLS policies.

---

## 4. Required repository documentation

Create and maintain these files in the repository:

### `GEMINI.md`
Persistent Antigravity workspace rules. Keep it concise and authoritative. It must direct the agent to follow this baseline and avoid scope creep.

### `PROJECT_MASTER.md`
This document: frozen product definition, architecture, constraints, phase plan, and acceptance criteria.

### `README.md`
Developer-facing guide: overview, features, stack, setup, environment variables, database setup, run/test/build commands, deployment steps, known limitations.

### `PROJECT_REPORT_CONTEXT.md`
Academic-report source: problem statement, objectives, requirements, subject mapping, architecture/data flow, test strategy, test-case format, evidence to collect, actual results, defects/retests, deployment and limitations. Distinguish planned tests from executed tests and passed tests. Never fabricate results.

Do not create many extra documents. Add another file only when it provides a concrete benefit required by the project or course.

---

## 5. Subject mapping

### Advanced Web Technologies
- React components and hooks.
- Routing and protected pages.
- Forms and client-side validation.
- API integration through Supabase.
- Authentication state and role-aware UI.
- Reusable components, responsive layout, and error handling.

### Software Testing and Reliability
- Test plan and test cases with expected/actual results.
- Unit tests for score calculation, validation, and progress calculation.
- Component tests for forms and important UI states.
- Integration checks for enrollment, lesson progress, and quiz submission.
- Manual end-to-end workflows for both roles.
- Negative/security tests for invalid input and unauthorized access.
- Regression testing after fixes.
- Reliability checks for network/API errors, session expiry, refresh/re-login, and persistence.
- Defect log with severity, steps to reproduce, expected result, actual result, status, and retest evidence.

### Cloud Infrastructure
- Vercel-hosted production frontend with HTTPS.
- Supabase-managed database and authentication.
- Environment configuration.
- Cloud API connectivity.
- Database permissions/RLS.
- Deployment and post-deployment verification.
- Basic logs/diagnostics and service limitations.
- Document the actual deployment topology; do not claim infrastructure that is not used.

---

## 6. Testing policy

Testing must be visible in the deliverables, but the testing setup must remain lightweight.

Minimum required:
1. Unit tests for pure business logic (for example, quiz scoring and progress calculation).
2. Component tests for key form validation and rendering states.
3. Manual test cases for student and instructor workflows.
4. Negative tests for invalid input and authorization boundaries.
5. Regression run after fixing reported defects.
6. Production smoke test after deployment.
7. A defect log and a summary of actual executed/passed/failed/blocked tests.

Do not add Playwright, Cypress, JMeter, k6, or another tool unless the owner explicitly approves it or the course specifically requires it. If automated API testing can be done simply without new infrastructure, it may be used, but it is not a reason to add a new backend.

Never invent test counts, results, performance figures, uptime, screenshots, defects, or security guarantees. Record evidence only after the test was actually run.

---

## 7. Phase-by-phase delivery plan

Work sequentially. Complete the exit criteria for a phase before moving on. If a blocker is found, fix it in the current phase rather than building on top of a broken foundation.

### Phase 0 — Baseline and repository setup
**Tasks**
- Create/open a clean project folder and Git repository.
- Add `GEMINI.md` and `PROJECT_MASTER.md` before feature coding.
- Scaffold React + Vite using JavaScript, not TypeScript.
- Install Tailwind CSS and React Router using the current official setup instructions.
- Add `.gitignore`, `.env.example`, and a minimal `README.md`.
- Confirm the app starts locally and production build succeeds.

**Exit criteria**
- App starts with the documented command.
- Production build passes.
- No secrets are committed.
- Antigravity has read the workspace rules and baseline.

### Phase 1 — Supabase setup and secure data foundation
**Tasks**
- Sign in to the existing Supabase account.
- Create one new project for this application, using the free option if available.
- Save the project URL and intended public client key in local environment variables.
- Create the minimum schema and constraints.
- Define profile/role handling.
- Write and test RLS policies for each table.
- Seed a small amount of non-sensitive demo data if useful.
- Document setup and schema instructions.

**Exit criteria**
- Frontend can connect to Supabase over HTTPS.
- Tables/relationships exist.
- RLS is enabled and tested.
- Student and instructor access boundaries are enforced in the database.
- No service-role key is present in frontend code or Git.

### Phase 2 — App shell and authentication
**Tasks**
- Build shared layout, navigation, loading states, and error states.
- Implement Supabase email/password login, logout, and session restoration. Do not implement OAuth or Google login.
- Build one login page with four demo buttons: two instructor accounts and two student accounts.
- Each demo button fills the email/password fields only; the user must click the normal Login button to submit.
- Create the four disposable demo users in Supabase Auth and assign roles through the trusted setup process. Never allow public users to choose an instructor role.
- Implement protected routes and role-aware navigation.
- Make sure a user cannot gain instructor permissions merely by editing browser state or client-side data.
- Keep the visual design clean and restrained.

**Exit criteria**
- Email/password authentication works on refresh.
- All four demo buttons fill the expected fields, and login succeeds only after the user clicks Login.
- Signed-out users cannot access protected screens.
- Students and instructors see appropriate navigation.
- Database authorization, not only the UI, protects privileged actions.
- Demo accounts use disposable passwords and contain no sensitive data.

### Phase 3 — Instructor course management
**Tasks**
- Create, list, edit, publish/unpublish, and view owned courses.
- Add and edit text-based lessons.
- Validate required fields and sensible lengths.
- Show loading, empty, success, and error states.
- Enforce ownership in RLS.

**Exit criteria**
- Instructor can manage their own courses and lessons.
- Unauthorized users cannot edit another instructor's content.
- Data persists after refresh/re-login.
- Basic validation and negative checks pass.

### Phase 4 — Student learning flow
**Tasks**
- Browse published courses and view course/lesson details.
- Enroll in a course.
- Mark lessons complete and calculate progress.
- Create simple MCQ quizzes for instructor-owned courses.
- Allow students to submit attempts and view scores.
- Protect correct answers and student results appropriately.

**Exit criteria**
- A student can complete the full learning workflow.
- Duplicate enrollment is prevented.
- Scores and progress are correct for tested examples.
- Students cannot alter other students' results or instructor content.
- Data persists after refresh/re-login.

### Phase 5 — Testing and defect correction
**Tasks**
- Add unit tests with Vitest for pure logic.
- Add a small number of meaningful component tests with React Testing Library.
- Write a manual test matrix for both roles.
- Execute positive, negative, authorization, persistence, and error-path checks.
- Record bugs, fix them, and retest.
- Capture genuine screenshots or other evidence for the report.

**Exit criteria**
- Required tests have actual recorded outcomes.
- Critical defects are fixed or clearly documented.
- Regression checks pass after fixes.
- Report material distinguishes planned and executed tests.

### Phase 6 — Vercel deployment and production verification
**Tasks**
- Push the working code to GitHub.
- Import the repository into Vercel using the free Hobby option if eligible.
- Configure production environment variables in Vercel.
- Deploy and verify the generated HTTPS URL.
- Verify Supabase HTTPS connectivity, authentication redirects, RLS, and complete student/instructor workflows in production.
- Diagnose errors from browser console/network output and provider logs.
- Confirm current usage/plan limits and do not enable paid services.

**Exit criteria**
- Public HTTPS URL loads.
- Sign-in/session behavior works in production.
- Database reads/writes work under RLS.
- Critical workflows work in production.
- Deployment URL, configuration steps, known limitations, and smoke-test results are recorded.

### Phase 7 — Documentation, report, and presentation evidence
**Tasks**
- Update `README.md` so a new developer can run the app.
- Complete `PROJECT_REPORT_CONTEXT.md` using the real implementation and actual test evidence.
- Record architecture, data model, screenshots, test cases, results, defects/retests, deployment, limitations, and future scope.
- Prepare concise presentation material based on implemented features only.
- Check that the repository contains no secrets and that setup instructions are reproducible.

**Exit criteria**
- App, documentation, test evidence, report context, and deployed URL agree.
- No unsupported claims or invented results.
- Presentation demonstrates the two roles and maps the implementation to all three subjects.

---

## 8. Global working protocol for Antigravity

1. Read `GEMINI.md` and `PROJECT_MASTER.md` at the start of every new task/session.
2. Work on the current phase only. Do not skip ahead.
3. Before a meaningful change, state: current phase, intended files, smallest implementation plan, risks, and verification commands.
4. For a small, reversible task, proceed after the brief plan. For destructive changes, schema/security changes, dependency changes, deployment changes, or scope changes, stop and ask the owner for approval.
5. Inspect existing files before editing. Do not replace working code or refactor unrelated files.
6. Prefer the smallest complete implementation. Reuse existing components and patterns.
7. Use JavaScript, not TypeScript.
8. Do not add packages unless they are needed for an approved requirement. Explain why each new dependency is necessary.
9. Never weaken RLS, authentication, validation, or secrets handling to make a test pass.
10. After each task, run the relevant tests/build and report the actual result. Do not claim success without verification.
11. Update `README.md` and `PROJECT_REPORT_CONTEXT.md` when actual implementation or setup changes.
12. If requirements appear ambiguous, ask one focused question rather than inventing a feature.
13. If a suggestion is outside the frozen scope, explicitly label it out of scope and do not implement it.
14. Maintain a short status section in `PROJECT_MASTER.md`: current phase, completed items, blockers, next exact task. Update it only with verified progress.
15. Do not make broad changes or perform destructive commands without explicit approval.

---

## 9. Definition of done

The project is done when:
- The frozen MVP is implemented.
- Both roles can complete their intended workflows.
- Authorization is enforced by database policies.
- The app is deployed over HTTPS.
- Unit/component tests and manual test cases have actual outcomes.
- Defects and retests are documented honestly.
- `README.md` and `PROJECT_REPORT_CONTEXT.md` match the implementation.
- The final report and presentation can be prepared from verified evidence.
- The project remains within the chosen free-plan limits and no paid service has been enabled.

## 10. Authentication decision — explicit owner clarification

- **No OAuth / Google sign-in.** Use Supabase Auth email/password only.
- One shared login screen serves both roles.
- Provide four demo-account fill buttons: `Instructor Demo 1`, `Instructor Demo 2`, `Student Demo 1`, and `Student Demo 2`.
- A click fills the email and password inputs but does not submit the form.
- The four users must be created in Supabase Auth; the profile/role records must be assigned safely and verified against RLS.
- Demo passwords are not secrets once included in browser-delivered code. Treat these as public, disposable accounts with synthetic data only; never reuse a personal password or expose the service-role key.
- Do not add OAuth, passwordless magic links, social login, MFA, custom auth servers, or advanced authentication features unless the owner explicitly approves a scope change.

**Current status at file update:** 
- **Phases 00–05:** Completed and verified.
  - Phase 00 (Foundation), Phase 01 (Supabase Setup & RLS), Phase 02 (App Shell & 4 Demo Accounts), Phase 03 (Instructor Course Management), Phase 04 (Student Learning Flow & Server-Side RPC Grading), Pre-Phase 05 (EduLearn Branding, Homepage & Registration), and Phase 05 (Testing & Reliability with 84 Vitest tests + 22 live integration tests passing, DEF-01 to DEF-05 resolved).
- **Demo Content Setup:** Completed and verified via `supabase/seed_demo_courses.sql` and `scripts/verify_demo_courses.js` (Course A: "Web Development Foundations — HTML & CSS" by Instructor 1; Course B: "Cloud Computing and Web Hosting Essentials" by Instructor 2; 10 lessons, 2 quizzes, 20 questions, 80 options, 20 answer keys).
- **UI Redesign:** Completed and verified. Cinematic Neon learning experience applied across all public, student, and instructor routes.
- **Phase 06 (Vercel Deployment):** Local production build verified clean (`vite build` exit code 0). Remote deployment and live production verification to be executed and evidenced manually by project owner.
- **Phase 07 (Documentation & Report Context):** Completed. `README.md`, `PROJECT_MASTER.md`, `docs/TEST_PLAN.md`, `docs/DEFECT_LOG.md`, and `PROJECT_REPORT_CONTEXT.md` fully aligned with the actual codebase and test evidence.
