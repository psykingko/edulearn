import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import InstructorDashboard from '../../pages/instructor/InstructorDashboard.jsx';
import CourseFormPage from '../../pages/instructor/CourseFormPage.jsx';
import * as AuthContextModule from '../../context/AuthContext.jsx';
import { supabase } from '../../lib/supabase.js';

describe('Instructor Components Flow Tests', () => {
  const mockInstructorUser = {
    id: 'inst-123',
    email: 'instructor1.demo@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: mockInstructorUser,
      profile: { full_name: 'Dr. Jane Smith', role: 'instructor' },
      role: 'instructor',
      logout: vi.fn(),
    });
  });

  describe('InstructorDashboard Component', () => {
    it('renders empty course state when instructor has no courses', async () => {
      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      render(
        <MemoryRouter>
          <InstructorDashboard />
        </MemoryRouter>
      );

      expect(await screen.findByText('No Courses Created Yet')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Create Your First Course' })).toBeInTheDocument();
    });

    it('renders authored courses with badges and lesson/quiz counts', async () => {
      const mockCourses = [
        {
          id: 'course-1',
          title: 'Advanced Web Engineering',
          description: 'A comprehensive study of full stack systems.',
          is_published: true,
          created_at: new Date().toISOString(),
          lessons: [{ count: 5 }],
          quizzes: [{ count: 2 }],
        },
        {
          id: 'course-2',
          title: 'Draft Cloud Course',
          description: 'Under development.',
          is_published: false,
          created_at: new Date().toISOString(),
          lessons: [{ count: 0 }],
          quizzes: [{ count: 0 }],
        },
      ];

      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockCourses, error: null }),
        }),
      });

      render(
        <MemoryRouter>
          <InstructorDashboard />
        </MemoryRouter>
      );

      expect(await screen.findByText('Advanced Web Engineering')).toBeInTheDocument();
      expect(screen.getByText('Published')).toBeInTheDocument();
      expect(screen.getByText('Draft Cloud Course')).toBeInTheDocument();
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    it('displays error message when Supabase query fails', async () => {
      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database query timeout' },
          }),
        }),
      });

      render(
        <MemoryRouter>
          <InstructorDashboard />
        </MemoryRouter>
      );

      expect(await screen.findByText(/database query timeout/i)).toBeInTheDocument();
    });
  });

  describe('CourseFormPage Component', () => {
    it('validates empty title before submitting', async () => {
      render(
        <MemoryRouter>
          <CourseFormPage isEditing={false} />
        </MemoryRouter>
      );

      const submitBtn = screen.getByRole('button', { name: /save as draft/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByText('Course title is required.')).toBeInTheDocument();
    });

    it('validates title minimum length', async () => {
      render(
        <MemoryRouter>
          <CourseFormPage isEditing={false} />
        </MemoryRouter>
      );

      const titleInput = screen.getByLabelText(/course title/i);
      fireEvent.change(titleInput, { target: { value: 'AB' } });

      const submitBtn = screen.getByRole('button', { name: /save as draft/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByText('Course title must be at least 3 characters.')).toBeInTheDocument();
    });

    it('validates description required', async () => {
      render(
        <MemoryRouter>
          <CourseFormPage isEditing={false} />
        </MemoryRouter>
      );

      const titleInput = screen.getByLabelText(/course title/i);
      fireEvent.change(titleInput, { target: { value: 'Valid Course Title' } });

      const submitBtn = screen.getByRole('button', { name: /save as draft/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByText('Course description is required.')).toBeInTheDocument();
    });

    it('calls Supabase insert when form is valid and submitted', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'new-course-id', title: 'Valid Title' },
            error: null,
          }),
        }),
      });

      vi.spyOn(supabase, 'from').mockReturnValue({
        insert: mockInsert,
      });

      render(
        <MemoryRouter>
          <CourseFormPage isEditing={false} />
        </MemoryRouter>
      );

      const titleInput = screen.getByLabelText(/course title/i);
      const descInput = screen.getByLabelText(/course description/i);

      fireEvent.change(titleInput, { target: { value: 'Distributed Systems' } });
      fireEvent.change(descInput, { target: { value: 'In-depth exploration of consensus algorithms.' } });

      const submitBtn = screen.getByRole('button', { name: /save as draft/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith({
          instructor_id: 'inst-123',
          title: 'Distributed Systems',
          description: 'In-depth exploration of consensus algorithms.',
          is_published: false,
        });
      });

      expect(await screen.findByText(/course created successfully/i)).toBeInTheDocument();
    });
  });
});
