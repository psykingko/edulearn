# Project Report Context — Online Education Platform (EduLearn)

**Academic Level:** Master of Computer Applications (MCA) Integrated Project  
**Subject Areas:**  
1. Advanced Web Technologies  
2. Software Testing and Reliability  
3. Cloud Infrastructure  
**Authoritative Baseline:** Reconciled against active repository implementation, PostgreSQL schema, and automated test evidence  

---

## 1. Project Title and Abstract

### Project Title
**Online Education Platform (EduLearn): A Role-Isolated, Cloud-Hosted Learning Management System with Database-Enforced Authorization and Server-Side Assessment Verification**

### Abstract
Modern web applications frequently suffer from bloated client-side architectures, excessive infrastructure dependencies, and client-side security vulnerabilities where authorization checks are relegated solely to front-end UI components. This academic project implements **EduLearn**, a lightweight, high-reliability online education platform engineered strictly around two distinct user personas: **Students** and **Instructors**. 

The application is implemented as a Single Page Application (SPA) using React 19, Vite 6, Tailwind CSS v4, and React Router v7, connecting directly over HTTPS to a hosted Supabase PostgreSQL backend. Data security and isolation are enforced at the database layer via PostgreSQL Row Level Security (RLS) policies, preventing unauthorized read, write, or modification of another user's content regardless of client-side requests. A critical innovation of the assessment subsystem is server-side quiz grading executed inside PostgreSQL through a `SECURITY DEFINER` stored procedure (`submit_quiz_attempt`), ensuring that correct answer keys are never transmitted to or readable by the client browser. 

The application was validated through an automated testing harness comprising 84 in-memory Vitest unit and component tests (100% pass rate) alongside 22 live automated integration and security scripts executed against the live database. The result is a demonstrable, presentation-ready educational platform with verified cross-user data isolation, responsive design, and zero reliance on intermediary custom application servers.

---

## 2. Problem Statement and Objectives

### Problem Statement
Standard web-based educational platforms often suffer from three major design and reliability challenges:
1. **Security Vulnerabilities Through Client-Side Evaluation:** In many prototype learning systems, quiz grading and answer keys are transmitted directly to the client browser, allowing students to inspect DOM structures or network payloads to extract correct answers before submission.
2. **Superficial Front-End Authorization:** Many platforms rely on hiding UI buttons or routing guards to restrict access, leaving backend database endpoints vulnerable to unauthorized modifications if client requests are forged.
3. **Overengineered Infrastructure:** Small-scale educational deployments often adopt complex microservices, dedicated API servers (Node/Express or Python), and container clusters that exceed project requirements, introduce failure modes, and incur unnecessary hosting costs.

### Technical and Educational Objectives
- **Demonstrate Advanced Web Technologies:** Construct a modern, reactive single-page application using modern React 19 hooks, client-side routing with role-aware route guards, clean state management via React Context, and a dark, high-contrast user interface styled with Tailwind CSS v4.
- **Implement Server-Side Verification and Persistence:** Utilize Supabase hosted PostgreSQL for all data storage, enforcing strict relational integrity, foreign key cascading, and database-level authorization via Row Level Security (RLS).
- **Secure Assessment Architecture:** Design a relational schema where quiz answer keys are isolated from option tables and evaluate quiz submissions entirely server-side inside PostgreSQL.
- **Execute Comprehensive Testing & Defect Tracking:** Build and document a multi-tiered test suite including unit tests for validation and math logic, component tests for form states and route guards, live HTTP scripts verifying PostgreSQL RLS enforcement, and formal defect tracking according to IEEE 829 standards.
- **Cloud Infrastructure & Free-Tier Optimization:** Structure the application to run entirely on free-tier cloud resources (Vercel Hobby frontend hosting and Supabase free PostgreSQL) over HTTPS without requiring paid add-ons or custom backend servers.

---

## 3. Scope

### 3.1 Implemented Features
- **Shared Authentication:** Supabase Auth email/password login, session persistence across page reloads, and clean session termination.
- **One-Click Demo Prefill:** Shared login page with four dedicated buttons for disposable demonstration accounts (two students, two instructors) that populate form fields without auto-submitting.
- **Role-Aware Route Protection:** Client-side route guard (`ProtectedRoute.jsx`) that inspects authentication state and role, redirecting unauthenticated users to `/login` and rendering a 403 Access Denied screen upon role mismatch.
- **User Registration & Instructor Review Workflow:** Public self-registration for students with client validation. Instructor registrations default to `'student'` in `profiles` and log a pending record in `instructor_applications`, requiring database administrator approval via `approve_instructor_application(email)` to prevent privilege escalation.
- **Instructor Course Management:** Create, list, edit, publish, unpublish, and delete owned courses. Draft courses remain hidden from student catalogues.
- **Instructor Lesson Management:** Create, edit, order, and delete text-based lessons structured with sequential position numbers.
- **Instructor Quiz Authoring:** Attach multiple-choice quizzes to courses, configure 2 to 6 options per question, and designate correct answers stored in private `quiz_answer_keys`.
- **Student Course Discovery & Enrollment:** Browse published courses, inspect course syllabi, and enroll with a single click (preventing duplicate enrollments).
- **Student Modular Lesson Viewer:** Read lesson texts and code examples, navigate between sequential lessons, and toggle lesson completion status with real-time database persistence.
- **Student Quiz Experience & Automated Grading:** Attempt quizzes, validate complete question coverage, submit to PostgreSQL stored procedure `submit_quiz_attempt`, and display instant score percentages and breakdown.
- **Progress Tracking & Results History:** Dynamic progress bar calculations on the Student Dashboard (`completed / total × 100`) and a historical table of all quiz attempts.
- **Presentation-Ready Seed Content:** Two comprehensive demonstration courses with 10 lessons, 2 quizzes, 20 questions, 80 options, and 20 protected answer keys.

### 3.2 Partially Implemented Features
- **Vercel Cloud Deployment:** Local production builds compile cleanly (`npm run build` exits with code 0). Remote deployment to Vercel Hobby and production verification are designed, documented, and ready for execution by the project owner.

### 3.3 Out-of-Scope Features (Explicit Exclusions)
- No custom Node/Express, Python, or microservices backend.
- No OAuth, Google login, magic links, or social sign-in.
- No administrative web portal (instructor approvals are performed via administrative SQL procedure).
- No payment processing, shopping cart, or course monetization.
- No live video streaming, video conferencing, audio chat, or file uploads.
- No AI chatbot, generative AI tutoring, or algorithmic recommendation engine.
- No mobile native application (responsive web only).
- No containerization with Docker or Kubernetes.

---

## 4. Technology Stack and Rationale

| Technology | Selection Rationale |
|---|---|
| **JavaScript (ES Modules)** | Keeps implementation straightforward and eliminates TypeScript compilation overhead while adhering to modern ECMAScript standards. |
| **React 19** | Industry-standard declarative UI framework. Employs modern hooks (`useState`, `useEffect`, `useCallback`, `useContext`) to build reactive component trees and reusable state abstractions. |
| **Vite 6** | Modern development server with instantaneous Hot Module Replacement (HMR) and optimized Rollup-based production bundling. Replaces legacy `create-react-app`. |
| **Tailwind CSS v4** | Modern utility-first CSS framework utilizing modern CSS custom properties and the `@theme` directive, delivering a responsive, dark neon aesthetic with minimal CSS bundle footprint. |
| **React Router v7** | Client-side declarative routing providing declarative route hierarchies, programmatic navigation, URL parameter parsing, and route guards. |
| **Supabase Client (`@supabase/supabase-js`)** | Official isomorphic client handling HTTPS REST communication, JWT session lifecycle management, and RPC stored procedure execution. |
| **Supabase PostgreSQL** | Robust relational database ensuring ACID transaction guarantees, relational constraints, cascade deletions, and JSONB payload manipulation. |
| **PostgreSQL Row Level Security (RLS)** | Directly enforces authorization policies at the database layer. Prevents unauthorized data access even if client-side code is tampered with. |
| **Vitest 5 + React Testing Library** | High-performance in-memory test runner compatible with Vite configuration, paired with user-centric DOM testing and V8 code coverage. |

---

## 5. System Architecture & Request Flows

### 5.1 System Architecture Diagram
```
[ Browser Client: React 19 + React Router v7 ]
      │
      ├── Public Routes: / (Home), /about, /login, /signup
      ├── Student Routes: /student (Dashboard), /student/courses, /student/results
      └── Instructor Routes: /instructor (Dashboard), /instructor/courses/*
      │
      ▼
[ Centralized Auth Context: AuthContext.jsx ]
      │ (Manages Supabase session, user JWT, profile role resolution)
      ▼
[ Client Route Guard: ProtectedRoute.jsx ]
      │ (Checks auth state and role match: redirects or renders 403)
      ▼
[ Centralized Supabase JS Client: lib/supabase.js ]
      │ (Communicates over HTTPS to PostgREST endpoint)
      ▼
═══════════════════════════════════════════════════════════════════════════
[ Supabase Hosted Backend Infrastructure ]
      │
      ├── [ Supabase Auth Engine ] ──> JWT Token Issuance & Password Hashing
      │
      └── [ PostgreSQL Database ]
            ├── Schema Tables (profiles, courses, lessons, enrollments, ...)
            ├── Row Level Security (RLS Policies on every table)
            ├── PostgreSQL Triggers (handle_new_user, protect_profile_role)
            └── Stored Procedures:
                  ├── submit_quiz_attempt(quiz_id, answers) [SECURITY DEFINER]
                  └── approve_instructor_application(email) [SECURITY DEFINER]
═══════════════════════════════════════════════════════════════════════════
```

### 5.2 Key Request Flows

#### Flow 1: Shared Authentication & Role Resolution
1. The user clicks a demo button on `/login` (pre-filling email and password) and clicks **Sign In**.
2. `AuthContext.login()` calls `supabase.auth.signInWithPassword({ email, password })`.
3. Supabase Auth validates credentials, sets local storage tokens, and returns a session containing the user's UUID.
4. `AuthContext` queries `public.profiles` for `id = user.id` to retrieve `full_name` and `role`.
5. If the role is `'student'`, the user is directed to `/student`. If `'instructor'`, directed to `/instructor`.

#### Flow 2: Course Enrollment & Lesson Progress
1. A student navigates to `/student/courses` and clicks **Enroll in Course**.
2. The client executes `supabase.from('enrollments').insert({ student_id: user.id, course_id })`.
3. PostgreSQL checks RLS policy `enrollments_insert_own` (`auth.uid() = student_id`) and verifies the unique constraint `uq_enrollments_student_course`.
4. While reading a lesson, the student clicks **Mark as Complete**.
5. The client upserts into `lesson_progress` with `is_completed: true` and `completed_at: now()`.
6. PostgreSQL validates `lesson_progress_manage_own` (`auth.uid() = student_id`).
7. The student dashboard recalculates progress: `(completed_lessons / total_lessons) * 100`.

#### Flow 3: Secure Quiz Submission & Server-Side Evaluation
1. The student answers all multiple-choice questions on `/student/courses/:courseId/quizzes/:quizId`.
2. The client constructs a submission payload: `[{ question_id: UUID, selected_option_id: UUID }, ...]`.
3. The client calls `supabase.rpc('submit_quiz_attempt', { p_quiz_id, p_answers })`.
4. Inside PostgreSQL, the `SECURITY DEFINER` function executes with elevated database privileges:
   - Verifies the user is authenticated via `auth.uid()`.
   - Confirms the course is published and the student is enrolled.
   - Iterates through submitted answers and compares each `selected_option_id` against `public.quiz_answer_keys.correct_option_id`.
   - Computes percentage score: `ROUND((correct_count / total_questions) * 100.0, 2)`.
   - Inserts an immutable record into `public.quiz_attempts`.
   - Returns the score, total questions, and correct count to the client.
5. The client renders the score card without ever receiving private answer keys.

---

## 6. Database Design

### 6.1 Entity Relational Structure

```
                  ┌────────────────────────┐
                  │      auth.users        │
                  │   (Supabase Auth)      │
                  └───────────┬────────────┘
                              │ 1:1 (ON DELETE CASCADE)
                              ▼
                  ┌────────────────────────┐
                  │    public.profiles     │
                  │ id (PK, UUID)          │
                  │ full_name (TEXT)       │
                  │ role (student|instruct)│
                  └───────────┬────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │ 1:N (instructor)  │ 1:N (student)     │ 1:N (student)
          ▼                   ▼                   ▼
┌───────────────────┐ ┌───────────────┐ ┌───────────────────┐
│  public.courses   │ │  enrollments  │ │  lesson_progress  │
│ id (PK, UUID)     │ │ id (PK, UUID) │ │ id (PK, UUID)     │
│ instructor_id(FK) │ │ student_id(FK)│ │ student_id (FK)   │
│ title, description│ │ course_id(FK) │ │ lesson_id (FK)    │
│ is_published(BOOL)│ └───────────────┘ │ is_completed(BOOL)│
└─────────┬─────────┘                   └───────────────────┘
          │
    ┌─────┴─────────────────┐
    │ 1:N                   │ 1:N
    ▼                       ▼
┌───────────────────┐ ┌───────────────────┐
│  public.lessons   │ │  public.quizzes   │
│ id (PK, UUID)     │ │ id (PK, UUID)     │
│ course_id (FK)    │ │ course_id (FK)    │
│ title, content    │ │ title (TEXT)      │
│ position (INT)    │ └─────────┬─────────┘
└───────────────────┘           │ 1:N
                                ▼
                      ┌───────────────────┐       ┌───────────────────┐
                      │  quiz_questions   │◀──────│  quiz_attempts    │
                      │ id (PK, UUID)     │       │ id (PK, UUID)     │
                      │ quiz_id (FK)      │       │ quiz_id (FK)      │
                      │ question_text     │       │ student_id (FK)   │
                      │ position (INT)    │       │ score (NUMERIC)   │
                      └─────────┬─────────┘       └───────────────────┘
                                │ 1:N
                                ▼
                      ┌───────────────────┐
                      │   quiz_options    │
                      │ id (PK, UUID)     │
                      │ question_id (FK)  │
                      │ option_text (TEXT)│
                      │ position (INT)    │
                      └─────────┬─────────┘
                                │ 1:1
                                ▼
                      ┌───────────────────┐
                      │ quiz_answer_keys  │
                      │ question_id (PK)  │
                      │ correct_option_id │
                      └───────────────────┘
```

### 6.2 Table Definitions and Constraints

1. **`public.profiles`**
   - `id`: `UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
   - `full_name`: `TEXT`
   - `role`: `TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'instructor'))`
   - `created_at`, `updated_at`: `TIMESTAMPTZ`
2. **`public.courses`**
   - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `instructor_id`: `UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE`
   - `title`: `TEXT NOT NULL`
   - `description`: `TEXT NOT NULL DEFAULT ''`
   - `is_published`: `BOOLEAN NOT NULL DEFAULT false`
3. **`public.lessons`**
   - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `course_id`: `UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE`
   - `title`: `TEXT NOT NULL`, `content`: `TEXT NOT NULL DEFAULT ''`, `position`: `INTEGER NOT NULL DEFAULT 1`
   - `CONSTRAINT uq_lessons_course_position UNIQUE (course_id, position)`
4. **`public.enrollments`**
   - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `student_id`: `UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE`
   - `course_id`: `UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE`
   - `CONSTRAINT uq_enrollments_student_course UNIQUE (student_id, course_id)`
5. **`public.lesson_progress`**
   - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `student_id`: `UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE`
   - `lesson_id`: `UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE`
   - `is_completed`: `BOOLEAN NOT NULL DEFAULT false`, `completed_at`: `TIMESTAMPTZ`
   - `CONSTRAINT uq_lesson_progress_student_lesson UNIQUE (student_id, lesson_id)`
6. **`public.quizzes`**
   - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `course_id`: `UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE`
   - `title`: `TEXT NOT NULL`
7. **`public.quiz_questions`**
   - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `quiz_id`: `UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE`
   - `question_text`: `TEXT NOT NULL`, `position`: `INTEGER NOT NULL DEFAULT 1`
   - `CONSTRAINT uq_quiz_questions_quiz_position UNIQUE (quiz_id, position)`
8. **`public.quiz_options`**
   - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `question_id`: `UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE`
   - `option_text`: `TEXT NOT NULL`, `position`: `INTEGER NOT NULL DEFAULT 1`
   - Composite Unique: `CONSTRAINT uq_quiz_options_id_question UNIQUE (id, question_id)`
9. **`public.quiz_answer_keys`**
   - `question_id`: `UUID PRIMARY KEY REFERENCES public.quiz_questions(id) ON DELETE CASCADE`
   - `correct_option_id`: `UUID NOT NULL`
   - Composite Foreign Key: `CONSTRAINT fk_quiz_answer_keys_option FOREIGN KEY (correct_option_id, question_id) REFERENCES public.quiz_options(id, question_id) ON DELETE CASCADE`
10. **`public.quiz_attempts`**
    - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
    - `quiz_id`: `UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE`
    - `student_id`: `UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE`
    - `score`: `NUMERIC(5, 2) NOT NULL DEFAULT 0`, `submitted_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
11. **`public.instructor_applications`**
    - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
    - `user_id`: `UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE`
    - `full_name`: `TEXT NOT NULL`, `email`: `TEXT NOT NULL`
    - `status`: `TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))`
    - `CONSTRAINT uq_instructor_application_user UNIQUE (user_id)`

---

## 7. Security Architecture

### 7.1 Authentication & Session Management
- **Supabase Auth Email/Password:** Users authenticate using email and password. Passwords are encrypted using bcrypt inside Supabase Auth.
- **JWT Lifecycles:** Upon successful authentication, Supabase issues signed JWT tokens containing the user's UUID in `auth.uid()`.
- **Public Client Key Safety:** The client uses `VITE_SUPABASE_ANON_KEY`. The service-role administrative key is never present in client-side code, git tracking, or environment files.

### 7.2 Database-Enforced Row Level Security (RLS)
Security is enforced by PostgreSQL RLS on every table:
- **`courses`:**
  - `courses_select_published`: Allows all authenticated users to read courses where `is_published = true`.
  - `courses_manage_instructor`: Allows instructors to SELECT, INSERT, UPDATE, DELETE only where `auth.uid() = instructor_id`.
- **`lessons`:**
  - `lessons_select_enrolled`: Allows students to read lessons if enrolled in the course or if the instructor owns the course.
  - `lessons_manage_instructor`: Allows instructors to insert, update, or delete lessons only if they own the parent course.
- **`quiz_answer_keys`:**
  - `answer_keys_instructor_select`: Allows instructors to read answer keys only for courses they own.
  - **Zero Student Access:** No SELECT, INSERT, UPDATE, or DELETE policies exist for students. Direct REST queries from students return HTTP 200 with 0 rows.
- **`quiz_attempts`:**
  - `attempts_student_select`: Students can SELECT only their own attempts (`student_id = auth.uid()`).
  - **No Direct Insert Policy:** Students cannot insert scores via REST; attempts are written exclusively via the `submit_quiz_attempt` RPC.

### 7.3 Privilege Escalation Prevention
- The PostgreSQL trigger `handle_new_user()` executes on `auth.users` insert and sets `role = 'student'` in `public.profiles`.
- The trigger `protect_profile_role` prevents any non-super-user from updating `profiles.role`.
- Instructor elevation is executed solely by database administrators calling `public.approve_instructor_application(email)`.

---

## 8. Implementation Summary

### Student Portal Workflow
1. **Authentication:** Student signs in using Student Demo 1 or 2.
2. **Dashboard Overview:** Displays progress cards for enrolled courses, completion percentage, and quiz attempts.
3. **Course Discovery:** Enters `/student/courses`, inspects technology tracks, and clicks **Enroll in Course**.
4. **Lesson Reading:** Opens `/student/courses/:courseId/lessons/:lessonId`, studies modular lesson texts and code blocks, and clicks **Mark as Complete**.
5. **Quiz Assessment:** Enters `/student/courses/:courseId/quizzes/:quizId`, selects multiple-choice answers, and submits for grading.
6. **Results Analysis:** Navigates to `/student/results` to inspect the permanent evaluation record.

### Instructor Portal Workflow
1. **Authentication:** Instructor signs in using Instructor Demo 1 or 2.
2. **Dashboard Overview:** Enters `/instructor`, reviewing authored courses, publication badges, lesson counts, and quiz counts.
3. **Course Authoring:** Enters `/instructor/courses/new`, provides course title and description, and saves as Draft or Published.
4. **Lesson Organization:** Enters `/instructor/courses/:courseId/lessons`, adds text lessons, sets ordering positions, and edits content.
5. **Quiz Configuration:** Enters `/instructor/courses/:courseId/quizzes`, creates multiple-choice questions, adds options, and designates the single correct radio option.
6. **Publication Toggle:** Toggles `is_published` between Draft and Published, instantly controlling student catalogue visibility.

---

## 9. Software Testing and Reliability

### 9.1 Multi-Tier Test Execution Summary

```text
================================================================================
Test Category                 Total Tests   Passed   Failed   Pass Rate
================================================================================
Vitest Pure Unit Tests            46          46        0       100%
Vitest Component Tests            38          38        0       100%
Live E2E Verification Scripts     22          22        0       100%
--------------------------------------------------------------------------------
Total Automated Tests            106         106        0       100%
================================================================================
```

### 9.2 Unit Testing Detail (46 Tests)
- **`src/test/unit/courseProgress.test.js` (15 tests):**
  - Handles division by zero (courses with 0 lessons return 0%).
  - Boundary tests (0% when 0 completed, 100% when all completed).
  - Rounding accuracy (e.g., 1 of 3 lessons = 33.33%).
  - Isolation tests (completed lessons from other courses do not pollute current course progress).
- **`src/test/unit/validation.test.js` (31 tests):**
  - RFC 5322 email regex validation, whitespace trimming, case insensitivity.
  - Password minimum length and confirmation matching.
  - Course title length boundaries (3 to 120 characters).
  - Lesson position integer parsing and rejection of non-integers.
  - Quiz options count boundaries (minimum 2, maximum 6 options).

### 9.3 Component & Reliability Testing Detail (38 Tests)
- **`src/test/components/LoginPage.test.jsx` (7 tests):** Input rendering, demo account button pre-fill, submission validation, and auth error rendering.
- **`src/test/components/SignupPage.test.jsx` (5 tests):** Student and instructor registration flows, password mismatch handling, and pending approval confirmation screens.
- **`src/test/components/ProtectedRoute.test.jsx` (6 tests):** Session resolving spinner, unauthenticated redirect to `/login`, role-matching authorization, and 403 Access Denied screen.
- **`src/test/components/Header.test.jsx` (4 tests):** Public navigation links, student dashboard links, instructor portal links, and logout trigger.
- **`src/test/components/InstructorFlow.test.jsx` (7 tests):** Empty course state, course metadata validation, draft badge rendering, and Supabase insert payload verification.
- **`src/test/components/StudentFlow.test.jsx` (4 tests):** Catalogue rendering, one-click enrollment execution, quiz answering, and PostgreSQL RPC submission.
- **`src/test/components/ReliabilityAndFailures.test.jsx` (5 tests):** Network disconnection error handling, rapid double-submit prevention, invalid lesson route 404 fallback, and PostgREST schema cache error mapping.

### 9.4 Live Integration & Security Testing Detail (22 Tests)
- **`scripts/verify_phase03.js` (10 tests):**
  - Instructor 1 creates, edits, and publishes Course A (Pass).
  - Instructor 1 authors lessons and quizzes with private answer keys (Pass).
  - Instructor 2 cross-modification blocked by RLS: 0 rows modified on Course A (Pass).
  - Instructor 2 blocked from adding lessons to Course A with HTTP 403 (Pass).
  - Unauthenticated REST insert into `courses` blocked with HTTP 401 (Pass).
- **`scripts/verify_phase04.js` (12 tests):**
  - Published courses visible in student catalogue; draft courses hidden (Pass).
  - Student 1 enrolls in Course A (Pass).
  - Duplicate enrollment rejected by unique constraint with HTTP 409 (Pass).
  - Student 1 marks Lesson 1 complete and unmarks it (Pass).
  - Student 2 cross-read on Student 1 progress blocked by RLS (0 rows returned) (Pass).
  - Student direct SELECT query on `quiz_answer_keys` blocked by RLS (0 rows returned) (Pass).
  - Student direct INSERT query on `quiz_attempts` blocked by RLS with HTTP 403 (Pass).
  - Live PostgreSQL RPC `submit_quiz_attempt` executes and grades score 100% (Pass).
  - Student 1 attempt history visible only to Student 1 (Pass).

---

## 10. Results and Discussion

1. **Verification of Non-Trivial Full-Stack Web Development:** The application successfully implements two distinct user workflows without relying on a monolithic custom web server. Leveraging PostgreSQL Row Level Security reduces architectural complexity while improving security.
2. **Tamper-Proof Assessment Integrity:** By decoupling `quiz_options` from `quiz_answer_keys` and evaluating quiz submissions inside PostgreSQL via a `SECURITY DEFINER` stored procedure, students cannot inspect network traffic or client memory to extract answers before submission.
3. **Reliability Under Network Failures:** Through centralized error state handling in `AuthContext` and page components, network latency, timeouts, and missing database migrations are communicated clearly via actionable UI banners rather than silent application crashes.
4. **Strict Scope Discipline:** The project remained strictly within the frozen baseline: zero paid cloud dependencies, no complex microservices, and no feature creep.

---

## 11. Limitations and Future Enhancements

### Genuine Limitations
- **Text-Only Lesson Format:** The curriculum reader supports text, headings, lists, and code blocks. Rich media streaming, video hosting, and PDF uploads were excluded from the frozen baseline.
- **Single-Answer Multiple Choice Only:** Quizzes support single correct answers per question. True/false and multi-select checkboxes are not supported.
- **Manual Instructor Approval Procedure:** Because no administrative user interface is included, instructor approvals are performed via administrative SQL execution.

### Future Enhancements (Post-Academic Roadmap)
- Video lesson streaming with adaptive bitrate playback.
- Automated code execution sandbox for interactive programming assessments.
- Real-time instructor analytics dashboard showing aggregate student quiz pass rates and drop-off points.
- Automated certificate generation with digital signature verification upon 100% curriculum completion.

---

## 12. Conclusion

The Online Education Platform (**EduLearn**) demonstrates that a modern, secure, and robust learning management system can be developed without overengineering. By utilizing React 19, Tailwind CSS v4, and hosted PostgreSQL with Row Level Security, the project fulfills all academic objectives across Advanced Web Technologies, Software Testing and Reliability, and Cloud Infrastructure. 

All 106 automated tests (84 Vitest unit/component tests and 22 live database integration tests) pass with a 100% success rate, confirming verified cross-user data isolation, reliable session persistence, and server-side assessment integrity.

---

## 13. Report Evidence Checklist (Manual Collection by Student)

This checklist outlines the visual evidence and screenshots to be collected manually by the project owner for the final project report:

- [ ] **EVID-01: Public Homepage:** Capture full-page view of `/` showing the hero section (*"Learn beyond the ordinary"*), trust indicators, curriculum telemetry card, and featured course preview.
- [ ] **EVID-02: Shared Login Interface:** Capture `/login` showing email and password fields along with the four demo pre-fill buttons.
- [ ] **EVID-03: Demo Pre-fill Verification:** Capture `/login` after clicking *Student 1 (Alice Demo)*, showing prefilled credentials and the verification notice.
- [ ] **EVID-04: Student Registration & Approval Flow:** Capture `/signup` with Instructor account type selected, followed by the pending application confirmation screen.
- [ ] **EVID-05: Student Dashboard:** Capture `/student` showing enrolled courses, progress percentage bars, and recent quiz scores.
- [ ] **EVID-06: Published Course Catalogue:** Capture `/student/courses` showing published courses with instructor names and "Enrolled" / "Enroll in Course" buttons.
- [ ] **EVID-07: Course Syllabus & Lesson Reader:** Capture `/student/courses/:courseId/lessons/:lessonId` displaying structured lesson text, code snippets, and the *Mark Complete* button.
- [ ] **EVID-08: Quiz Taking Interface:** Capture `/student/courses/:courseId/quizzes/:quizId` with multiple-choice questions and options.
- [ ] **EVID-09: Server-Side Quiz Result Card:** Capture the post-submission score screen showing percentage score and total correct count.
- [ ] **EVID-10: Student Evaluation History:** Capture `/student/results` showing chronological attempt logs.
- [ ] **EVID-11: Instructor Dashboard:** Capture `/instructor` displaying authored courses, lesson counts, quiz counts, and Draft/Published badges.
- [ ] **EVID-12: Instructor Lesson Management:** Capture `/instructor/courses/:courseId/lessons` showing curriculum order and the lesson creation form.
- [ ] **EVID-13: Instructor Quiz Configuration:** Capture `/instructor/courses/:courseId/quizzes` showing questions and radio selection of correct answer keys.
- [ ] **EVID-14: Role-Based Access Control (HTTP 403):** Capture the Access Denied screen when a student attempts to navigate directly to `/instructor`.
- [ ] **EVID-15: Automated Test Execution Evidence:** Capture terminal output of `npm test` showing all 9 test suites and 84 tests passing.
- [ ] **EVID-16: Automated E2E Verification Evidence:** Capture terminal output of `node scripts/verify_demo_courses.js` showing 100% database verification.
- [ ] **EVID-17: Production Build Verification:** Capture terminal output of `npm run build` showing clean compilation of `dist/` assets.
- [ ] **EVID-18: Cloud Deployment & HTTPS (Post-Vercel):** Capture browser address bar showing green HTTPS lock and live deployed URL on Vercel.
