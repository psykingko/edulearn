# EduLearn — Online Learning Platform

An MCA integrated academic project demonstrating full-stack web application development, cloud deployment, and software testing and reliability.

The application is strictly scoped to two user portals: **Student** and **Instructor/Teacher**, presented under the public product brand **EduLearn**.

---

## 1. Academic Subjects Covered

1. **Advanced Web Technologies**: Modern Single Page Application (SPA) architecture with React 19, Vite 6, Tailwind CSS v4, React Router v7, centralized Supabase Auth Context, and PostgreSQL Row Level Security.
2. **Software Testing and Reliability**: Comprehensive test planning, instructor ownership verification, negative role-authorization checks, defect tracking, and regression verification.
3. **Cloud Infrastructure**: Cloud deployment to Vercel Hobby (HTTPS) paired with hosted Supabase PostgreSQL and Row Level Security (RLS).

---

## 2. Current Implementation Status

- **Current Phase:** Pre-Phase 05 — Professional Homepage, Branding, and User Registration.
- **Status:** **Completed and Verified**.
  - **EduLearn Brand Identity:** Deployed consistent product branding across the homepage, navigation header, login page, registration page, and document title. All academic/phase jargon removed from public customer-facing UI.
  - **Public Homepage (`/`):** Professional landing page featuring hero section, trust indicators, interactive learning journey preview, learning benefits, live featured courses query, and closing CTA.
  - **User Registration (`/signup`):** Full student and instructor self-registration with pure client-side validation, duplicate email handling, and password matching.
  - **Instructor Security & Approval Workflow:** Signups default strictly to `'student'` role in `profiles`. Instructor applicants log a pending request in `public.instructor_applications` (enforced by RLS) and cannot self-escalate. Project owners approve legitimate instructors via database function `approve_instructor_application(email)`.
  - **Test Suite:** 84 automated unit and component tests passing (100% pass rate via Vitest). Live automated E2E tests verified (10/10 for Phase 03 instructor workflows, 12/12 for Phase 04 student workflows including live PostgreSQL RPC quiz grading). Production build verified clean (`vite build`).
- **Next Phase:** Phase 06 — Vercel Deployment and Production Verification.

---

## 3. Approved Technology Stack

- **Language:** JavaScript (ES modules)
- **Frontend Framework:** React 19
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS v4
- **Client Routing:** React Router v7
- **Authentication & Database:** Supabase (`@supabase/supabase-js`, Supabase Auth email/password, PostgreSQL with Row Level Security)
- **Testing Framework (Planned for Phase 05):** Vitest + React Testing Library
- **Hosting Target (Planned for Phase 06):** Vercel Hobby (HTTPS)

---

## 4. Prerequisites

- **Node.js:** v18.0.0 or later (v22.x verified)
- **npm:** v9.0.0 or later (v11.x verified)
- **Supabase Account & Project:** Existing free-tier Supabase project with schema applied

---

## 5. Demo Accounts

The application provides four disposable demonstration accounts for classroom evaluation:

| Account Label | Email | Password | Role | Intended Workflow |
|---|---|---|---|---|
| **Student Demo 1** | `student1.demo@example.com` | `Student123!` | `student` | Primary student learning workflow |
| **Student Demo 2** | `student2.demo@example.com` | `Student456!` | `student` | Multi-user enrollment isolation |
| **Instructor Demo 1** | `instructor1.demo@example.com` | `Instructor123!` | `instructor` | Course authoring & quiz creation |
| **Instructor Demo 2** | `instructor2.demo@example.com` | `Instructor456!` | `instructor` | Course ownership isolation |

### Crucial Demo Button Behavior:
Clicking any demo account button on `/login` **only fills the Email and Password fields**. It **never auto-submits** or bypasses authentication. The user must manually click the **Sign In** button to authenticate.

---

## 6. Instructor Portal Features (Phase 03)

### 6.1 Course Management
- **Dashboard (`/instructor`):** Lists all courses owned by the signed-in instructor with real-time lesson and quiz counts.
- **Create Course (`/instructor/courses/new`):** Instructors can create courses either as **Draft** or **Published**.
- **Edit Course (`/instructor/courses/:courseId/edit`):** Update title, description, or toggle publication status with confirmation.
- **Publish / Unpublish:** Draft courses are hidden from students; published courses are discoverable.

### 6.2 Lesson Management (`/instructor/courses/:courseId/lessons`)
- Text-based lessons structured with titles, position numbers, and rich text content.
- Inline ordering and editing capabilities.
- Cascade deletion handling when a course is deleted.

### 6.3 Quiz Management (`/instructor/courses/:courseId/quizzes`)
- Multiple-choice quiz authoring attached to specific courses.
- Add questions with customizable 2 to 6 options.
- Set the single correct option using radio controls.
- **Answer Key Security:** The correct option is stored exclusively in `quiz_answer_keys`. Row Level Security policies ensure students have **zero read access** to this table.

---

## 7. Student Portal & Learning Journey Features (Phase 04)

### 7.1 Student Dashboard (`/student`)
- **Metrics Overview:** Real-time metrics computed directly from database records: Total Enrolled Courses, Courses In Progress, and Courses Completed (100% lessons verified).
- **Course Cards:** Shows title, description, instructor name, completed lesson count vs total lessons, visual progress bar, and "Continue Learning" link.
- **Recent Quizzes Card:** Latest quiz scores and submission dates with instant retake links.
- **Empty State:** Clean empty state guiding students to the Course Catalogue if not yet enrolled.

### 7.2 Published Course Catalogue (`/student/courses`)
- Lists published courses (`is_published = true`) created by instructors.
- Draft/unpublished courses are completely hidden from the student catalogue and protected by database RLS.
- Provides enrollment status badges ("Enrolled").
- Single-click **Enroll in Course** button with duplicate-enrollment prevention.

### 7.3 Course Details & Syllabus (`/student/courses/:courseId`)
- View full course title, description, instructor name, and ordered syllabus.
- Dynamic learning progress indicator (`completed lessons / total lessons × 100`).
- Locked vs Unlocked lessons and quizzes based on enrollment status.
- Direct navigation into lesson reading materials and MCQ quiz assessments.

### 7.4 Modular Lesson Viewer (`/student/courses/:courseId/lessons/:lessonId`)
- Text-based lesson content reader with breadcrumbs and lesson position badges.
- **Mark as Complete / Incomplete** toggle button persisting directly to the `lesson_progress` table.
- Sequential navigation buttons ("Previous Lesson", "Next Lesson", "Finish Syllabus").
- Cross-student progress isolation enforced by PostgreSQL RLS.

### 7.5 MCQ Quiz Assessment & Grading (`/student/courses/:courseId/quizzes/:quizId`)
- Simple, distraction-free quiz taking interface with ordered questions and radio options.
- Validates all questions are answered prior to submission.
- Prevents double submissions while requests are in flight.
- **Server-Side Grading via PostgreSQL RPC:** Evaluates answers inside the database using `submit_quiz_attempt(p_quiz_id, p_answers)` against private `quiz_answer_keys`. Correct answer keys are never sent to or readable by the browser.
- Instant score display as a percentage, correct count breakdown, and retake controls.

### 7.6 Quiz Results History (`/student/results`)
- Chronological evaluation history table of all previous quiz attempts.
- Displays quiz title, course name, score percentage, and submission timestamp.
- Strict RLS isolation: students can only query their own quiz attempts.

---

## 8. Pre-Phase 05: Professional Homepage, Registration & Instructor Security Workflow

### 8.1 Professional Landing Page (`/`)
- Fully branded public product homepage under the **EduLearn** brand.
- Hero section explaining modular online learning with primary CTA (**Explore Courses**) and secondary CTA (**Get Started Free** / **Go to Portal**).
- Educational trust indicators (Self-Paced Learning, Instant Quiz Grading, Verified Curricula).
- Interactive simulated course syllabus card showing modular progression.
- Live query fetching published courses directly via the Supabase client with a polished empty state when zero courses are published.
- Clean closing CTA and minimal footer free of internal development, phase, or academic jargon.

### 8.2 User Registration (`/signup`)
- Pure client-side validation using `validateSignupForm`:
  - Full Name (required, min 2 characters)
  - Email Address (RFC 5322 regex validation)
  - Password (min 6 characters)
  - Password Confirmation (exact match)
  - Account Type selection (`student` or `instructor`)
- Submissions handled through centralized `useAuth().signup`.
- Prevents rapid double submissions while network requests are in flight.
- Handles duplicate email detection gracefully with guidance to sign in.

### 8.3 Instructor Application Security & Database Approval Workflow
- **Zero Client Privilege Escalation:** The PostgreSQL trigger `handle_new_user()` always sets `role = 'student'` upon signup in `public.profiles`. The trigger `protect_profile_role` strictly prohibits clients from updating their own role.
- When an applicant selects **Instructor**, their application is inserted into `public.instructor_applications` with `status = 'pending'`.
- Row Level Security ensures applicants can only read and insert their own application (`auth.uid() = user_id`). No client update or delete policies exist.
- **Project Owner Approval Procedure (No Admin Portal):**
  The project owner reviews pending applications in Supabase and executes the `SECURITY DEFINER` function in the Supabase SQL Editor:
  ```sql
  SELECT public.approve_instructor_application('applicant_email@example.com');
  ```
  This securely upgrades the user's role to `'instructor'` in `public.profiles` and marks their application as `'approved'` in `public.instructor_applications`.

---

## 9. Database Migrations

### 9.1 How to Apply `supabase/pre_phase05_registration_and_branding.sql`:
1. In the Supabase Dashboard, open the **SQL Editor** (`>_`).
2. Paste the contents of [`supabase/pre_phase05_registration_and_branding.sql`](supabase/pre_phase05_registration_and_branding.sql).
3. Click **Run**.
4. This creates:
   - `public.instructor_applications` table with RLS and unique constraint per user.
   - Client read (`instructor_apps_select_own`) and insert (`instructor_apps_insert_self`) policies.
   - `public.approve_instructor_application(TEXT)` security definer function granted exclusively to `postgres` and `service_role`.

### 9.2 How to Apply `supabase/phase04_student_functions.sql`:
1. In the Supabase Dashboard, open the **SQL Editor** (`>_`).
2. Paste the contents of [`supabase/phase04_student_functions.sql`](supabase/phase04_student_functions.sql) and click **Run**.
3. This creates:
   - `public.profiles_select_instructors` RLS policy allowing authenticated users to read instructor full names.
   - `public.submit_quiz_attempt(UUID, JSONB)` `SECURITY DEFINER` function to grade quizzes securely against private answer keys.

### 9.3 Presentation-Ready Demo Courses Setup (`supabase/seed_demo_courses.sql`):
Populates the database with two complete, presentation-ready courses for classroom evaluation without manual entry:

1. **Course A: Web Development Foundations — HTML & CSS**
   - **Instructor Owner:** `instructor1.demo@example.com` (Dr. Sarah Connor)
   - **Status:** Published (`is_published = true`)
   - **Curriculum:** 5 substantive lessons covering HTML fundamentals, semantic forms, CSS Box Model, Flexbox & CSS Grid, and responsive design.
   - **Assessment:** 1 certification assessment quiz with 10 questions, 40 options, and protected answer keys.

2. **Course B: Cloud Computing and Web Hosting Essentials**
   - **Instructor Owner:** `instructor2.demo@example.com` (Prof. John Matrix)
   - **Status:** Published (`is_published = true`)
   - **Curriculum:** 5 substantive lessons covering cloud service models (IaaS/PaaS/SaaS), compute/storage/networking, DNS & HTTPS request flow, web application deployment, and reliability troubleshooting.
   - **Assessment:** 1 certification assessment quiz with 10 questions, 40 options, and protected answer keys.

#### Prerequisites:
1. `supabase/schema.sql` (Tables and RLS policies)
2. `supabase/seed_demo_accounts.sql` (Provisioned demo accounts with assigned roles)
3. `supabase/phase04_student_functions.sql` (Server-side grading RPC `submit_quiz_attempt`)

#### Execution Steps (Idempotent):
- **Option 1 (Supabase SQL Editor):**
  1. Open the Supabase Dashboard -> **SQL Editor** (`>_`).
  2. Paste [`supabase/seed_demo_courses.sql`](supabase/seed_demo_courses.sql).
  3. Click **Run**. The transaction resolves instructors by email, verifies roles, upserts both courses, 10 lessons, 2 quizzes, 20 questions, 80 options, 20 answer keys, and prints the verification summary.
- **Option 2 (Automated Node Runner):**
  ```bash
  node scripts/seed_demo_courses.js
  ```

#### How to Verify Course Seeding & Workflows:
Run the comprehensive automated verification test:
```bash
node scripts/verify_demo_courses.js
```
This script verifies:
- Instructor 1 and Instructor 2 course ownership and lesson/quiz authoring visibility.
- Cross-instructor authorization isolation (Instructor 1 cannot modify Course B).
- Student 1 and Student 2 public catalogue discovery.
- Student enrollment in both courses.
- Lesson reading and progress completion persistence.
- Secure server-side quiz grading via PostgreSQL RPC (`submit_quiz_attempt`).
- Answer key protection (students cannot query `quiz_answer_keys`).
- Student progress and attempt isolation (Student 2 cannot view Student 1 data).

## 10. Environment Configuration Instructions

### How to Retrieve Credentials from Supabase:
1. In the Supabase Dashboard, go to **Project Settings** (gear icon) -> **API**.
2. Under **Project URL**, copy the URL (e.g. `https://<project-ref>.supabase.co`).
3. Under **Project API keys**, locate the public key (`anon` public key or `publishable` client key). **Never use or copy the `service_role` secret key!**

### Configuring Local Environment:
1. In your local repository root, create `.env.local` (or copy `.env.example`):
   ```bash
   cp .env.example .env.local
   ```
2. Populate the variables:
   ```env
   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-public-client-key>
   ```
3. Restart the Vite development server if running:
   ```bash
   npm run dev
   ```

---

## 11. Development, Testing & Build Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the local Vite development server with Hot Module Replacement |
| `npm test` | Run all 84 unit, component, and reliability tests once via Vitest |
| `npm run test:watch` | Run tests in interactive watch mode for TDD workflows |
| `npm run test:coverage` | Generate code coverage metrics via v8 provider |
| `npm run build` | Compile and bundle production assets to `dist/` |
| `npm run preview` | Serve the production build locally for verification |
| `node scripts/verify_phase03.js` | Run the automated Phase 03 Instructor E2E and RLS verification test suite |
| `node scripts/verify_phase04.js` | Run the automated Phase 04 Student Workflow and Security verification test suite |

---

## 12. Repository Structure

```text
online-education-platform/
├── .gitignore                   # Excludes node_modules, dist, and local environment files
├── .env.example                 # Placeholder example for Supabase public configuration
├── GEMINI.md                    # Persistent workspace rules and constraints
├── PROJECT_MASTER.md            # Authoritative project definition and phase roadmap
├── README.md                    # Developer documentation and setup instructions
├── index.html                   # HTML entry file with EduLearn branding
├── package.json                 # Dependencies and build/test scripts
├── vite.config.js               # Vite & Vitest configuration with React and Tailwind plugins
├── docs/
│   ├── TEST_PLAN.md             # Formal master test plan and manual test case matrix
│   └── DEFECT_LOG.md            # IEEE 829 defect tracking and resolution log
├── scripts/
│   ├── seed_demo_courses.js     # Automated REST seeder for the 2 presentation courses
│   ├── verify_demo_courses.js   # Automated E2E verification script for seeded demo courses
│   ├── verify_phase03.js        # Automated E2E verification script for Phase 03 (Instructor)
│   └── verify_phase04.js        # Automated E2E verification script for Phase 04 (Student)
├── supabase/
│   ├── schema.sql               # Authoritative PostgreSQL DDL, triggers, and RLS policies
│   ├── seed_demo_accounts.sql   # Trusted administrative script to provision demo accounts
│   ├── seed_demo_courses.sql    # Idempotent SQL seed for the 2 presentation courses & quizzes
│   ├── phase04_student_functions.sql # Phase 04 server-side grading RPC & instructor profile RLS
│   └── pre_phase05_registration_and_branding.sql # Instructor applications table & approval function
└── src/
    ├── main.jsx                 # React entry point with BrowserRouter
    ├── App.jsx                  # Main application shell with AuthProvider & routes
    ├── index.css                # Tailwind CSS entry file
    ├── config/
    │   └── demoAccounts.js      # Public demo credentials and personas
    ├── context/
    │   └── AuthContext.jsx      # Centralized session, auth listener, and signup/login/profile loading
    ├── lib/
    │   ├── supabase.js          # Centralized Supabase client instance
    │   ├── validation.js        # Pure validation logic (signup, login, forms, inputs, UUIDs)
    │   └── courseProgress.js    # Pure progress percentage calculation & boundary handling
    ├── components/
    │   ├── Header.jsx           # EduLearn role-aware navigation header
    │   ├── Footer.jsx           # Minimal EduLearn brand footer
    │   ├── ProtectedRoute.jsx   # Route guard enforcing login and role matching
    │   └── SupabaseDiagnostic.jsx # Minimal HTTPS backend connectivity check
    ├── pages/
    │   ├── HomePage.jsx         # Professional EduLearn landing page with live course preview
    │   ├── AboutPage.jsx        # Platform capabilities overview
    │   ├── LoginPage.jsx        # Shared login page with 4 demo prefill buttons
    │   ├── SignupPage.jsx       # Student and Instructor self-registration
    │   ├── StudentDashboard.jsx # Student portal dashboard with real progress & cards
    │   ├── NotFoundPage.jsx     # 404 handler for invalid routes
    │   ├── student/
    │   │   ├── CourseCataloguePage.jsx # Browse published courses & one-click enroll
    │   │   ├── CourseDetailsPage.jsx   # Course syllabus & live progress bar
    │   │   ├── LessonViewerPage.jsx    # Text lesson reader & completion toggle
    │   │   ├── QuizAttemptPage.jsx     # MCQ quiz taking & RPC server grading
    │   │   └── QuizResultsPage.jsx     # Quiz attempt score history table
    │   └── instructor/
    │       ├── InstructorDashboard.jsx # Course dashboard with counts & actions
    │       ├── CourseFormPage.jsx      # Create & edit course metadata
    │       ├── LessonsPage.jsx         # Manage text-based lessons
    │       └── QuizzesPage.jsx         # Manage MCQ quizzes & answer keys
    └── test/
        ├── setup.js             # Vitest setup with @testing-library/jest-dom & cleanup
        ├── unit/
        │   ├── courseProgress.test.js  # Progress calculation and zero-lesson handling
        │   └── validation.test.js      # Email, signup, login, course, lesson, quiz validation
        └── components/
            ├── LoginPage.test.jsx      # Login form, demo buttons, and validation
            ├── SignupPage.test.jsx     # Registration form, student/instructor flows, error handling
            ├── ProtectedRoute.test.jsx # Role-aware route guard verification
            ├── Header.test.jsx         # Role navigation & logout verification
            ├── InstructorFlow.test.jsx # Dashboard & course authoring validation
            ├── StudentFlow.test.jsx    # Catalogue, enrollment & quiz taking
            └── ReliabilityAndFailures.test.jsx # API timeouts, double click, 403, 404
```

---

## 13. Planned Phase-Wise Roadmap

- **Phase 00:** Foundation and Repository Verification *(Completed)*
- **Phase 01:** Supabase Setup and Secure Data Foundation *(Completed)*
- **Phase 02:** App Shell and Authentication *(Completed)*
- **Phase 03:** Instructor Course Management *(Completed)*
- **Phase 04:** Student Learning Flow *(Completed and Verified)*
- **Pre-Phase 05:** Professional Homepage, Branding, and User Registration *(Completed and Verified)*
- **Phase 05:** Testing and Defect Correction *(Completed and Verified)*
- **Phase 06:** Vercel Deployment and Production Verification *(Next)*
- **Phase 07:** Documentation, Report, and Presentation Evidence
