import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CourseCataloguePage from '../../pages/student/CourseCataloguePage.jsx';
import CourseFormPage from '../../pages/instructor/CourseFormPage.jsx';
import QuizAttemptPage from '../../pages/student/QuizAttemptPage.jsx';
import LessonViewerPage from '../../pages/student/LessonViewerPage.jsx';
import * as AuthContextModule from '../../context/AuthContext.jsx';
import { supabase } from '../../lib/supabase.js';

describe('Reliability & API Failure Handling Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles network failure on catalogue loading without crashing and allows retry', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'student-1' },
      role: 'student',
    });

    let attempts = 0;
    vi.spyOn(supabase, 'from').mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockImplementation(() => {
            attempts++;
            if (attempts === 1) {
              return Promise.reject(new Error('Network request timed out'));
            }
            return Promise.resolve({
              data: [
                {
                  id: 'course-recovered',
                  title: 'Recovered Course After Retry',
                  description: 'Successfully loaded after transient error.',
                  created_at: new Date().toISOString(),
                  profiles: { full_name: 'Prof. Davis' },
                  lessons: [{ count: 1 }],
                  quizzes: [{ count: 0 }],
                },
              ],
              error: null,
            });
          }),
        }),
      }),
    }));

    render(
      <MemoryRouter>
        <CourseCataloguePage />
      </MemoryRouter>
    );

    // Initial failure displays error banner and removes spinner
    expect(await screen.findByText(/failed to load course catalogue: network request timed out/i)).toBeInTheDocument();
    expect(screen.queryByText(/loading published courses/i)).not.toBeInTheDocument();
  });

  it('displays permission denied (RLS) error and never shows false success', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'unauthorized-user' },
      role: 'student',
    });

    vi.spyOn(supabase, 'from').mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: {
              code: '42501',
              message: 'new row violates row-level security policy for table "courses"',
            },
          }),
        }),
      }),
    });

    render(
      <MemoryRouter>
        <CourseFormPage isEditing={false} />
      </MemoryRouter>
    );

    const titleInput = screen.getByLabelText(/course title/i);
    const descInput = screen.getByLabelText(/course description/i);

    fireEvent.change(titleInput, { target: { value: 'Unauthorized Course' } });
    fireEvent.change(descInput, { target: { value: 'This should be blocked by RLS.' } });

    const submitBtn = screen.getByRole('button', { name: /save as draft/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/new row violates row-level security policy/i)).toBeInTheDocument();
    expect(screen.queryByText(/course created successfully/i)).not.toBeInTheDocument();
  });

  it('prevents multiple submissions when user double clicks action button', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'student-1' },
      role: 'student',
    });

    const mockRpc = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                data: { score: 100, correct_count: 1, total_questions: 1 },
                error: null,
              }),
            150
          );
        })
    );

    vi.spyOn(supabase, 'rpc').mockImplementation(mockRpc);

    vi.spyOn(supabase, 'from').mockImplementation((table) => {
      if (table === 'courses') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 'c1' }, error: null }),
            }),
          }),
        };
      }
      if (table === 'quizzes') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 'q1', title: 'Quiz 1' }, error: null }),
            }),
          }),
        };
      }
      if (table === 'quiz_questions') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: 'q1',
                    question_text: 'Q1',
                    position: 1,
                    quiz_options: [{ id: 'opt1', option_text: 'Opt 1', position: 1 }],
                  },
                ],
                error: null,
              }),
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
      <MemoryRouter>
        <QuizAttemptPage />
      </MemoryRouter>
    );

    await screen.findByText('Q1');
    fireEvent.click(screen.getByLabelText('Opt 1'));

    const submitBtn = screen.getByRole('button', { name: /submit quiz for grading/i });

    // Rapid double click
    fireEvent.click(submitBtn);
    fireEvent.click(submitBtn);

    // Should only have initiated 1 RPC call because button is immediately disabled
    expect(mockRpc).toHaveBeenCalledTimes(1);
    expect(submitBtn).toBeDisabled();
  });

  it('safely handles missing or not-found records without crashing the page', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'student-1' },
      role: 'student',
    });

    vi.spyOn(supabase, 'from').mockImplementation((table) => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    }));

    render(
      <MemoryRouter>
        <LessonViewerPage />
      </MemoryRouter>
    );

    // Displays helpful not found screen instead of JavaScript runtime crash
    expect(await screen.findByText('Lesson Not Found')).toBeInTheDocument();
    expect(screen.getByText(/the requested lesson does not exist or you are not enrolled/i)).toBeInTheDocument();
  });

  it('displays actionable guidance when RPC submit_quiz_attempt is missing from schema cache (PGRST202)', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'student-1' },
      role: 'student',
    });

    vi.spyOn(supabase, 'rpc').mockResolvedValue({
      data: null,
      error: {
        code: 'PGRST202',
        message: 'Could not find the function public.submit_quiz_attempt in the schema cache',
      },
    });

    vi.spyOn(supabase, 'from').mockImplementation((table) => {
      if (table === 'courses') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 'c1' }, error: null }),
            }),
          }),
        };
      }
      if (table === 'quizzes') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 'q1', title: 'Quiz 1' }, error: null }),
            }),
          }),
        };
      }
      if (table === 'quiz_questions') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: 'q1',
                    question_text: 'Q1',
                    position: 1,
                    quiz_options: [{ id: 'opt1', option_text: 'Opt 1', position: 1 }],
                  },
                ],
                error: null,
              }),
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
      <MemoryRouter>
        <QuizAttemptPage />
      </MemoryRouter>
    );

    await screen.findByText('Q1');
    fireEvent.click(screen.getByLabelText('Opt 1'));

    const submitBtn = screen.getByRole('button', { name: /submit quiz for grading/i });
    fireEvent.click(submitBtn);

    // Expect clear, actionable error instructing user to run supabase/phase04_student_functions.sql
    expect(
      await screen.findByText(/please run supabase\/phase04_student_functions\.sql in your supabase sql editor/i)
    ).toBeInTheDocument();
  });
});
