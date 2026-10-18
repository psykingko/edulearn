import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import * as AuthContextModule from '../../context/AuthContext.jsx';

describe('Header Component Tests', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders public navigation and Sign In link when signed out', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      profile: null,
      role: null,
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText('EduLearn')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Explore Courses')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /get started/i })).toBeInTheDocument();
    expect(screen.queryByText('Instructor Portal')).not.toBeInTheDocument();
  });

  it('renders student navigation links when authenticated as student', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 's1', email: 'student1.demo@example.com' },
      profile: { full_name: 'Alex Student', role: 'student' },
      role: 'student',
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText('student')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Explore Courses')).toBeInTheDocument();
    expect(screen.getByText('My Results')).toBeInTheDocument();
    expect(screen.queryByText('Instructor Portal')).not.toBeInTheDocument();
    expect(screen.getByText('Alex Student')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('renders instructor navigation links when authenticated as instructor', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'inst1', email: 'instructor1.demo@example.com' },
      profile: { full_name: 'Prof. Davis', role: 'instructor' },
      role: 'instructor',
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText('instructor')).toBeInTheDocument();
    expect(screen.getByText('Instructor Portal')).toBeInTheDocument();
    expect(screen.queryByText('Catalogue')).not.toBeInTheDocument();
    expect(screen.queryByText('My Results')).not.toBeInTheDocument();
    expect(screen.getByText('Prof. Davis')).toBeInTheDocument();
  });

  it('calls logout when Sign Out button is clicked', async () => {
    mockLogout.mockResolvedValueOnce();

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 's1', email: 'student1@example.com' },
      profile: { full_name: 'Student', role: 'student' },
      role: 'student',
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const logoutBtn = screen.getByRole('button', { name: /sign out/i });
    await act(async () => {
      fireEvent.click(logoutBtn);
    });

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
