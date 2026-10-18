/**
 * ==============================================================================
 * DEMO ACCOUNTS CONFIGURATION — Online Education Platform Testing
 * ==============================================================================
 * IMPORTANT SECURITY NOTICE:
 * These credentials are intentionally public, synthetic demo accounts created
 * strictly for academic evaluation and demonstration of this MCA integrated project.
 *
 * - No real personal email addresses or personal passwords are used.
 * - These are disposable classroom accounts with project-only passwords.
 * - Clicking a demo button in the UI only PREFILLS the form fields; it does NOT
 *   auto-submit or bypass authentication.
 * ==============================================================================
 */

export const DEMO_ACCOUNTS = [
  {
    id: 'student-1',
    label: 'Student Demo 1',
    role: 'student',
    fullName: 'Alice Student (Demo 1)',
    email: 'student1.demo@example.com',
    password: 'Student123!',
    description: 'Primary demo student account for verifying learning workflows.',
  },
  {
    id: 'student-2',
    label: 'Student Demo 2',
    role: 'student',
    fullName: 'Bob Student (Demo 2)',
    email: 'student2.demo@example.com',
    password: 'Student456!',
    description: 'Secondary demo student account for testing multi-user enrollment isolation.',
  },
  {
    id: 'instructor-1',
    label: 'Instructor Demo 1',
    role: 'instructor',
    fullName: 'Dr. Sarah Connor (Demo 1)',
    email: 'instructor1.demo@example.com',
    password: 'Instructor123!',
    description: 'Primary demo instructor account for course creation and authoring.',
  },
  {
    id: 'instructor-2',
    label: 'Instructor Demo 2',
    role: 'instructor',
    fullName: 'Prof. John Matrix (Demo 2)',
    email: 'instructor2.demo@example.com',
    password: 'Instructor456!',
    description: 'Secondary demo instructor account for verifying course ownership isolation.',
  },
];
