# EduLearn — Online Education Platform

EduLearn is a cloud-hosted online education platform engineered to provide structured, distraction-free computer science learning with automated assessments and persistent backend verification. The platform features two dedicated, role-isolated portals: **Student** and **Instructor/Teacher**.

The system is built as a single-page application using React 19, Vite 6, Tailwind CSS v4, and React Router v7, backed by Supabase hosted PostgreSQL and Supabase Auth with database-enforced Row Level Security (RLS).

---

## 1. Project Overview

### Purpose and Intended Users
The platform provides a streamlined educational environment for two primary user groups:
1. **Students:** Discover published technology curricula, enroll in sequential courses, read modular text lessons, track lesson completion progress, and take multiple-choice quizzes with instant, tamper-proof server-side grading.
2. **Instructors:** Author comprehensive curricula, structure lessons in ordered sequences, configure multiple-choice quizzes with private answer keys, and manage course visibility through draft and published states.

### Core Capabilities
- **Role-Based Portals:** Complete functional isolation between students and instructors enforced by database-level policies and client-side route guards.
- **Shared Authentication with Demo Pre-Fill:** Secure email/password authentication featuring four one-click demo account buttons that prefill credentials without auto-submitting.
- **Account Registration & Role Safety:** Student self-registration with automatic role assignment. Instructor applicants submit a formal application reviewed and approved via a database procedure, preventing unauthorized privilege escalation.
- **Curriculum & Lesson Management:** Instructors create, edit, order, publish, and delete courses and text-based lessons.
- **Self-Paced Learning & Progress Tracking:** Students enroll in published courses, toggle lesson completion, and monitor real-time completion percentages.
- **Secure Server-Side Quiz Grading:** Quizzes are graded inside PostgreSQL via a `SECURITY DEFINER` stored procedure (`submit_quiz_attempt`). Correct answer keys are strictly protected and never exposed to the client browser.
- **Cinematic Neon User Experience:** A modern, high-contrast dark theme utilizing geometric typography (`Space Grotesk`, `Inter`, `JetBrains Mono`), electric-blue and violet lighting accents, and responsive navigation.

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose in Application |
|---|---|---|---|
| **Frontend Framework** | React | `^19.0.0` | Declarative component UI and reactive state management |
| **Build Tool & Dev Server** | Vite | `^6.2.0` | Fast ESM development server and Rollup production bundler |
| **Styling & Theme** | Tailwind CSS | `^4.0.0` | CSS custom properties, utility classes, and responsive layouts |
| **Client Routing** | React Router | `^7.1.5` | Declarative client-side routing, nested routes, and route guards |
| **Backend as a Service** | Supabase | `^2.118.0` (`@supabase/supabase-js`) | HTTPS API client, auth session management, and PostgREST gateway |
| **Authentication** | Supabase Auth | Built-in | Email/password authentication, JWT issuance, and session restoration |
| **Database Engine** | PostgreSQL (Supabase) | 15.x / 16.x | Relational persistence, constraints, triggers, and stored procedures |
| **Data Authorization** | PostgreSQL Row Level Security (RLS) | Native | Granular per-table security policies enforcing user isolation |
| **Test Runner** | Vitest | `^5.0.5` | Fast in-memory unit, component, and reliability test execution |
| **DOM Testing** | React Testing Library | `^16.3.3` | User-centric component rendering and DOM interaction testing |
| **DOM Environment** | jsdom | `^29.1.1` | Headless browser DOM simulation for Vitest |
| **Code Coverage** | `@vitest/coverage-v8` | `^5.0.5` | V8 native statement, branch, function, and line coverage metrics |
| **Frontend Hosting** | Vercel (Hobby Tier) | Cloud | Static production bundle hosting over HTTPS |

> **Architecture Constraint:** This project uses no custom Express backend, Python service, Docker containers, Kubernetes, or microservices. All backend functionality is handled directly through Supabase Auth, PostgreSQL, and PostgreSQL Row Level Security over HTTPS.

---

## 3. Features by User Role

### A. Public & Unauthenticated Experience
- **Cinematic Homepage (`/`):** Hero section with platform overview, system architecture pillars, learning journey roadmap, and live query of published courses.
- **Platform Overview (`/about`):** Detailed breakdown of educational architecture, security design, and persistence.
- **Shared Login (`/login`):** Single login page for both roles with four pre-fill buttons for disposable demonstration accounts.
- **Account Registration (`/signup`):** Client-side validated registration form allowing visitors to register as a student or submit a pending instructor application.

### B. Student Experience (`/student/*`)
- **Student Dashboard (`/student`):** Summary metrics (Total Enrolled, In Progress, Completed), course progress cards with dynamic progress bars, and recent quiz score history.
- **Course Catalogue (`/student/courses`):** Browse all published courses. Displays instructor name, lesson counts, quiz counts, and provides single-click enrollment.
- **Course Details & Syllabus (`/student/courses/:courseId`):** Full curriculum breakdown, ordered lesson checklist, and quiz access.
- **Modular Lesson Viewer (`/student/courses/:courseId/lessons/:lessonId`):** Clean reading interface with code syntax styling, sequential navigation (Previous/Next), and an interactive **Mark Complete / Incomplete** toggle.
- **Quiz Assessment (`/student/courses/:courseId/quizzes/:quizId`):** Multiple-choice quiz taking interface with required answer validation and instant server-side grading.
- **Evaluation History (`/student/results`):** Chronological log of all quiz attempts, percentage scores, and submission timestamps.

### C. Instructor Experience (`/instructor/*`)
- **Instructor Dashboard (`/instructor`):** Management view of all authored courses with real-time lesson counts, quiz counts, and publication status badges.
- **Course Editor (`/instructor/courses/new` and `/instructor/courses/:courseId/edit`):** Create and update course titles and descriptions. Save courses as Drafts or Publish them to the public catalogue.
- **Lesson Management (`/instructor/courses/:courseId/lessons`):** Add, edit, reorder, and delete text-based lessons with custom position integers.
- **Quiz Management (`/instructor/courses/:courseId/quizzes`):** Author multiple-choice quizzes, configure 2 to 6 options per question, and designate the single correct answer key stored in a protected table.

### D. Instructor Security & Approval Workflow
- When a user registers as an instructor on `/signup`, their record in `public.profiles` is assigned `role = 'student'` by default.
- A pending application record is simultaneously inserted into `public.instructor_applications`.
- The database trigger `protect_profile_role` strictly blocks client-side role modification.
- Project owners approve instructors using the PostgreSQL administrative function:
  ```sql
  SELECT public.approve_instructor_application('applicant_email@example.com');
  ```
- This updates `profiles.role` to `'instructor'`, approves the application record, and auto-confirms the email address.

---

## 4. System Architecture

```
+-----------------------------------------------------------------------+
|                         Browser Client (React 19 SPA)                 |
|                                                                       |
|  +-------------------+  +-----------------------+  +---------------+  |
|  | Public / Auth     |  | Student Portal        |  | Instructor    |  |
|  | (/ , /login, ...) |  | (/student/*)          |  | (/instructor) |  |
|  +-------------------+  +-----------------------+  +---------------+  |
|            |                        |                       |         |
|            +------------------------+-----------------------+         |
|                                     |                                 |
|                      +-----------------------------+                  |
|                      | ProtectedRoute & AuthContext|                  |
|                      +-----------------------------+                  |
+-------------------------------------|---------------------------------+
                                      | HTTPS / REST / WebSockets
+-------------------------------------v---------------------------------+
|                       Supabase Cloud Infrastructure                   |
|                                                                       |
|  +-----------------------------+   +-------------------------------+  |
|  | Supabase Auth (JWT)         |   | PostgREST API Engine          |  |
|  +-----------------------------+   +-------------------------------+  |
|                                                     |                 |
|  +--------------------------------------------------v--------------+  |
|  | PostgreSQL Database                                              |  |
|  |                                                                 |  |
|  |  [Row Level Security]                                           |  |
|  |   ├── profiles (role-based read/update policies)                |  |
|  |   ├── courses (instructor ownership / published public read)    |  |
|  |   ├── lessons (course ownership / enrolled student read)        |  |
|  |   ├── enrollments (student-scoped insert/select)                |  |
|  |   ├── lesson_progress (student-isolated completion tracking)    |  |
|  |   ├── quizzes & quiz_questions & quiz_options                   |  |
|  |   └── quiz_answer_keys (ZERO student read access)               |  |
|  |                                                                 |  |
|  |  [Stored Procedures & Triggers]                                 |  |
|  |   ├── submit_quiz_attempt(quiz_id, answers) [SECURITY DEFINER]  |  |
|  |   ├── approve_instructor_application(email) [SECURITY DEFINER] |  |
|  |   ├── handle_new_user() [Auto student profile on signup]        |  |
|  |   └── protect_profile_role() [Blocks client role escalation]    |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+
```

### Access Control Mechanism
1. **Frontend Route Guards (`ProtectedRoute.jsx`):** Inspects the session and role stored in `AuthContext`. If the user is unauthenticated, they are redirected to `/login`. If an authenticated user's role does not match `allowedRoles`, an Access Denied (HTTP 403) screen is displayed.
2. **Backend Row Level Security (PostgreSQL):** The database independently validates user identity via `auth.uid()`. Even if a user bypasses client-side code, direct database REST requests cannot access another instructor's courses or read another student's progress.

---

## 5. Database Setup & Execution Order

All database configuration is managed through SQL scripts located in the [`supabase/`](supabase/) directory.

### Script Execution Order

Apply scripts in this exact sequence in the **Supabase Dashboard -> SQL Editor**:

| Step | Script File | Purpose | Idempotent |
|---|---|---|---|
| **1** | [`supabase/schema.sql`](supabase/schema.sql) | Baseline schema: tables (`profiles`, `courses`, `lessons`, `enrollments`, `lesson_progress`, `quizzes`, `quiz_questions`, `quiz_options`, `quiz_answer_keys`, `quiz_attempts`), constraints, indexes, and base RLS policies. | Yes (`IF NOT EXISTS`) |
| **2** | [`supabase/seed_demo_accounts.sql`](supabase/seed_demo_accounts.sql) | Creates the four disposable demo accounts in `auth.users` with verified passwords and assigns their respective roles in `public.profiles`. | Yes (`ON CONFLICT`) |
| **3** | [`supabase/phase04_student_functions.sql`](supabase/phase04_student_functions.sql) | Creates the `profiles_select_instructors` RLS policy and the secure `submit_quiz_attempt` stored procedure. | Yes (`CREATE OR REPLACE`) |
| **4** | [`supabase/pre_phase05_registration_and_branding.sql`](supabase/pre_phase05_registration_and_branding.sql) | Creates `instructor_applications` table, RLS policies, and the administrative `approve_instructor_application` function. | Yes (`IF NOT EXISTS`) |
| **5** | [`supabase/seed_demo_courses.sql`](supabase/seed_demo_courses.sql) | Seeds two complete, presentation-ready courses with 10 lessons, 2 quizzes, 20 questions, 80 options, and 20 protected answer keys. | Yes (Upsert logic) |

### Alternative Node.js Seeder
After applying Steps 1–4 in the SQL editor, the demo courses can alternatively be seeded from the terminal:
```bash
node scripts/seed_demo_courses.js
```

### Verifying Database Setup
Run the automated verification script to confirm tables, policies, and workflows:
```bash
node scripts/verify_demo_courses.js
```

---

## 6. Local Setup & Installation

### Prerequisites
- **Node.js:** v18.0.0 or later (v22.x verified)
- **npm:** v9.0.0 or later (v11.x verified)
- **Supabase Project:** Free-tier hosted project with database scripts applied

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/online-education-platform.git
cd online-education-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the template configuration file:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your public Supabase credentials:
```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
```
> **Security Warning:** Never place your Supabase `service_role` secret key in `.env.local` or any frontend file.

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Run Production Build
```bash
npm run build
```
Build output is compiled into the `dist/` directory.

### 6. Preview Production Build Locally
```bash
npm run preview
```

---

## 7. Demo Accounts

Four disposable classroom demonstration accounts are pre-configured:

| Demo Button Label | Email Address | Password | Role | Assigned Content |
|---|---|---|---|---|
| **Student 1 (Alice Demo)** | `student1.demo@example.com` | `Student123!` | `student` | Enrolled in both demo courses; active lesson progress |
| **Student 2 (Bob Demo)** | `student2.demo@example.com` | `Student456!` | `student` | Enrolled in both demo courses; isolated progress history |
| **Instructor 1 (Dr. Sarah Connor)** | `instructor1.demo@example.com` | `Instructor123!` | `instructor` | Owns Course A: *Web Development Foundations — HTML & CSS* |
| **Instructor 2 (Prof. John Matrix)** | `instructor2.demo@example.com` | `Instructor456!` | `instructor` | Owns Course B: *Cloud Computing and Web Hosting Essentials* |

### Demo Button Behavior
- Clicking a demo button fills the **Email Address** and **Password** inputs only.
- Buttons **never auto-submit**. The user must explicitly click the **Sign In** button.
- Demo accounts contain purely synthetic educational data and project-only passwords.

---

## 8. Testing and Quality Assurance

### Automated Vitest Test Suite
Execute all 84 in-memory unit and component tests:
```bash
npm test
```

### Test Coverage Report
Generate code coverage using the V8 engine:
```bash
npm run test:coverage
```
*Current Coverage: ~94.5% line coverage on pure business logic (`validation.js`, `courseProgress.js`), 100% on `ProtectedRoute.jsx`, 95% on `LoginPage.jsx`.*

### Live Integration & RLS Security Verification
Run the automated end-to-end scripts against your live Supabase instance:
```bash
# Verify presentation courses, enrollment, lesson progress, and RPC quiz grading
node scripts/verify_demo_courses.js

# Verify instructor course authoring and cross-instructor isolation (10 tests)
node scripts/verify_phase03.js

# Verify student enrollment, lesson progress, and security policies (12 tests)
node scripts/verify_phase04.js
```

### Known Limitations
1. **No Video Streaming:** Lesson content is strictly text-based with code formatting. Video streaming, conferencing, and file upload attachments are outside the frozen scope.
2. **No OAuth or Social Login:** In accordance with project requirements, authentication is restricted to Supabase email/password.
3. **Single-Choice Multiple Choice Questions:** Quizzes support single-answer multiple-choice formats with 2 to 6 options. Multi-select checkboxes and open-ended text submissions are not supported.
4. **Manual Instructor Review:** Instructor registrations require database administrator approval via `public.approve_instructor_application(email)` because no administrative user interface is included.

---

## 9. Deployment Guide (Vercel)

The application is structured for static deployment on **Vercel Hobby Tier**.

### Deployment Procedure
1. Push the repository to a private or public GitHub repository.
2. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import the `online-education-platform` repository.
4. In the project settings, configure the environment variables:
   - `VITE_SUPABASE_URL`: Your hosted Supabase project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your hosted Supabase public anon key.
5. Set Framework Preset to **Vite**.
6. Set Build Command to `npm run build` and Output Directory to `dist`.
7. Click **Deploy**.
8. Verify HTTPS connectivity, navigation, demo logins, and quiz grading on the deployed URL.

> **Deployment Verification Note:** Local production build compilation has been verified clean (`npm run build`). Cloud deployment to Vercel and manual verification on the live URL is performed by the project owner.
