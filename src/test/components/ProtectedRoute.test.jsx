import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute.jsx';
import * as AuthContextModule from '../../context/AuthContext.jsx';

describe('ProtectedRoute Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading indicator while session is resolving (does NOT leak protected content)', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      profile: null,
      role: null,
      isLoading: true,
      authError: null,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <ProtectedRoute allowedRoles={['student']}>
          <div>Secret Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Verifying session...')).toBeInTheDocument();
    expect(screen.queryByText('Secret Protected Content')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated user to /login', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      profile: null,
      role: null,
      isLoading: false,
      authError: null,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/student']}>
        <Routes>
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <div>Secret Student Dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page Destination</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page Destination')).toBeInTheDocument();
    expect(screen.queryByText('Secret Student Dashboard')).not.toBeInTheDocument();
  });

  it('renders profile resolution error if user exists but profile/role failed to load', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'user-123' },
      profile: null,
      role: null,
      isLoading: false,
      authError: 'Failed to fetch user profile',
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/student']}>
        <ProtectedRoute allowedRoles={['student']}>
          <div>Secret Student Dashboard</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Profile Resolution Error')).toBeInTheDocument();
    expect(screen.getByText(/failed to fetch user profile/i)).toBeInTheDocument();
    expect(screen.queryByText('Secret Student Dashboard')).not.toBeInTheDocument();
  });

  it('denies access (403) when student attempts to access instructor-only route', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'student-123' },
      profile: { full_name: 'Test Student', role: 'student' },
      role: 'student',
      isLoading: false,
      authError: null,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/instructor']}>
        <ProtectedRoute allowedRoles={['instructor']}>
          <div>Secret Instructor Course Management</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText(/your account is registered as a/i)).toBeInTheDocument();
    expect(screen.getByText('student')).toBeInTheDocument();
    expect(screen.queryByText('Secret Instructor Course Management')).not.toBeInTheDocument();
  });

  it('denies access (403) when instructor attempts to access student-only route', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'instructor-123' },
      profile: { full_name: 'Test Instructor', role: 'instructor' },
      role: 'instructor',
      isLoading: false,
      authError: null,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/student']}>
        <ProtectedRoute allowedRoles={['student']}>
          <div>Secret Student Portal</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('instructor')).toBeInTheDocument();
    expect(screen.queryByText('Secret Student Portal')).not.toBeInTheDocument();
  });

  it('renders children when authenticated user has matching authorized role', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'student-123' },
      profile: { full_name: 'Alice Student', role: 'student' },
      role: 'student',
      isLoading: false,
      authError: null,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/student']}>
        <ProtectedRoute allowedRoles={['student']}>
          <div>Authorized Student Workspace</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Authorized Student Workspace')).toBeInTheDocument();
  });
});
