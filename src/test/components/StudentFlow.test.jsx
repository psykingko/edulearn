import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CourseCataloguePage from '../../pages/student/CourseCataloguePage.jsx';
import QuizAttemptPage from '../../pages/student/QuizAttemptPage.jsx';
import * as AuthContextModule from '../../context/AuthContext.jsx';
import { supabase } from '../../lib/supabase.js';

describe('Student Components Flow Tests', () => {
  const mockStudentUser = {
    id: 'student-123',
    email: 'student1.demo@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: mockStudentUser,
      profile: { full_name: 'Alex Student', role: 'student' },
      role: 'student',
      logout: vi.fn(),
    });
  });

  describe('CourseCataloguePage Component', () => {
    it('renders published courses and distinguishes enrolled vs non-enrolled', async () => {
      const mockPublishedCourses = [
        {
          id: 'course-1',
          title: 'Cloud Foundations',
          description: 'Introduction to cloud platforms.',
          instructor_id: 'inst-1',
          created_at: new Date().toISOString(),
          profiles: { full_name: 'Prof. Miller' },
          lessons: [{ count: 3 }],
          quizzes: [{ count: 1 }],
        },
        {
          id: 'course-2',
          title: 'Database Reliability',
          description: 'PostgreSQL and RLS in production.',
          instructor_id: 'inst-2',
          created_at: new Date().toISOString(),
          profiles: { full_name: 'Dr. Adams' },
          lessons: [{ count: 4 }],
          quizzes: [{ count: 2 }],
        },
      ];

      // Student is enrolled only in course-1
      const mockEnrollments = [{ course_id: 'course-1' }];

      vi.spyOn(supabase, 'from').mockImplementation((table) => {
        if (table === 'courses') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockPublishedCourses,
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'enrollments') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: mockEnrollments,
                error: null,
              }),
            }),
          };
        }
        return {};
      });

      render(
        <MemoryRouter>
          <CourseCataloguePage />
        </MemoryRouter>
      );

      // Verify course titles appear
      expect(await screen.findByText('Cloud Foundations')).toBeInTheDocument();
      expect(screen.getByText('Database Reliability')).toBeInTheDocument();

      // Verify enrolled vs not enrolled buttons
      expect(screen.getByText('Continue Learning →')).toBeInTheDocument();
      expect(screen.getByText('Enroll in Course')).toBeInTheDocument();
      expect(screen.getByText('Enrolled')).toBeInTheDocument();
    });

    it('handles one-click enrollment successfully', async () => {
      const mockPublishedCourses = [
        {
          id: 'course-new',
          title: 'Software Testing Fundamentals',
          description: 'Unit and component testing methodologies.',
          instructor_id: 'inst-1',
          created_at: new Date().toISOString(),
          profiles: { full_name: 'Prof. Miller' },
          lessons: [{ count: 2 }],
          quizzes: [{ count: 1 }],
        },
      ];

      const mockInsert = vi.fn().mockResolvedValue({ error: null });

      vi.spyOn(supabase, 'from').mockImplementation((table) => {
        if (table === 'courses') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockPublishedCourses,
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'enrollments') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
            insert: mockInsert,
          };
        }
        return {};
      });

      render(
        <MemoryRouter>
          <CourseCataloguePage />
        </MemoryRouter>
      );

      const enrollBtn = await screen.findByRole('button', { name: /enroll in course/i });
      fireEvent.click(enrollBtn);

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith({
          student_id: 'student-123',
          course_id: 'course-new',
        });
      });

      expect(await screen.findByText(/successfully enrolled in "software testing fundamentals"/i)).toBeInTheDocument();
    });
  });

  describe('QuizAttemptPage Component', () => {
    const mockCourse = { id: 'c1', title: 'Course 1', is_published: true };
    const mockQuiz = { id: 'q1', title: 'Security & RLS Assessment' };
    const mockQuestions = [
      {
        id: 'quest-1',
        question_text: 'What is Supabase RLS?',
        position: 1,
        quiz_options: [
          { id: 'opt-1', option_text: 'PostgreSQL Row Level Security', position: 1 },
          { id: 'opt-2', option_text: 'Frontend React Library', position: 2 },
        ],
      },
    ];

    it('renders questions and options, and validates unanswered questions before submit', async () => {
      vi.spyOn(supabase, 'from').mockImplementation((table) => {
        if (table === 'courses') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockCourse, error: null }),
              }),
            }),
          };
        }
        if (table === 'quizzes') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockQuiz, error: null }),
              }),
            }),
          };
        }
        if (table === 'quiz_questions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: mockQuestions, error: null }),
              }),
            }),
          };
        }
        if (table === 'quiz_attempts') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({ data: [], error: null }),
                }),
              }),
            }),
          };
        }
        return {};
      });

      render(
        <MemoryRouter initialEntries={['/student/courses/c1/quizzes/q1']}>
          <QuizAttemptPage />
        </MemoryRouter>
      );

      expect(await screen.findByText('Security & RLS Assessment')).toBeInTheDocument();
      expect(screen.getByText('What is Supabase RLS?')).toBeInTheDocument();
      expect(screen.getByText('PostgreSQL Row Level Security')).toBeInTheDocument();

      // Submit without selecting an answer
      const submitBtn = screen.getByRole('button', { name: /submit quiz for grading/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByText(/please answer all questions before submitting/i)).toBeInTheDocument();
    });

    it('submits answers to PostgreSQL RPC submit_quiz_attempt and displays score screen', async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: {
          attempt_id: 'att-123',
          quiz_id: 'q1',
          score: 100,
          total_questions: 1,
          correct_count: 1,
          submitted_at: new Date().toISOString(),
        },
        error: null,
      });

      vi.spyOn(supabase, 'rpc').mockImplementation(mockRpc);

      vi.spyOn(supabase, 'from').mockImplementation((table) => {
        if (table === 'courses') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockCourse, error: null }),
              }),
            }),
          };
        }
        if (table === 'quizzes') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockQuiz, error: null }),
              }),
            }),
          };
        }
        if (table === 'quiz_questions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: mockQuestions, error: null }),
              }),
            }),
          };
        }
        if (table === 'quiz_attempts') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({ data: [], error: null }),
                }),
              }),
            }),
          };
        }
        return {};
      });

      render(
        <MemoryRouter initialEntries={['/student/courses/c1/quizzes/q1']}>
          <QuizAttemptPage />
        </MemoryRouter>
      );

      await screen.findByText('What is Supabase RLS?');

      // Select option 1
      const radioOption = screen.getByLabelText('PostgreSQL Row Level Security');
      fireEvent.click(radioOption);

      const submitBtn = screen.getByRole('button', { name: /submit quiz for grading/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockRpc).toHaveBeenCalledWith('submit_quiz_attempt', {
          p_quiz_id: undefined, // route params mocked in memory router
          p_answers: [{ question_id: 'quest-1', selected_option_id: 'opt-1' }],
        });
      });

      expect(await screen.findByText('Quiz Completed!')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText(/graded securely server-side inside postgresql/i)).toBeInTheDocument();
    });
  });
});
