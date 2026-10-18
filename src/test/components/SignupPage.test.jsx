import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignupPage from '../../pages/SignupPage.jsx';
import * as AuthContextModule from '../../context/AuthContext.jsx';

describe('SignupPage Component Tests', () => {
  const mockSignup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      profile: null,
      role: null,
      signup: mockSignup,
    });
  });

  it('renders registration form, input fields, and account type choices', () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /student/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /instructor/i })).not.toBeChecked();
    expect(screen.getByRole('button', { name: /create student account/i })).toBeInTheDocument();
  });

  it('validates client-side before calling signup (e.g. non-matching passwords)', async () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Alex Johnson' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'alex@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'Secret123!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'DifferentPass' } });

    fireEvent.click(screen.getByRole('button', { name: /create student account/i }));

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('submits student registration successfully and shows welcome state', async () => {
    mockSignup.mockResolvedValueOnce({
      success: true,
      user: { id: 'new-student' },
      session: { access_token: 'valid-token' },
      requiresEmailConfirmation: false,
      accountType: 'student',
    });

    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Alex Johnson' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'alex@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'Secret123!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Secret123!' } });

    fireEvent.click(screen.getByRole('button', { name: /create student account/i }));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith({
        fullName: 'Alex Johnson',
        email: 'alex@example.com',
        password: 'Secret123!',
        accountType: 'student',
      });
    });

    expect(await screen.findByText(/welcome to edulearn/i)).toBeInTheDocument();
  });

  it('submits instructor registration and displays pending review screen', async () => {
    mockSignup.mockResolvedValueOnce({
      success: true,
      user: { id: 'new-instructor' },
      session: { access_token: 'valid-token' },
      requiresEmailConfirmation: false,
      accountType: 'instructor',
    });

    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );

    // Switch account type to instructor
    fireEvent.click(screen.getByRole('radio', { name: /instructor/i }));

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Prof. Marcus Vance' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'marcus@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'Secret123!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Secret123!' } });

    const submitBtn = screen.getByRole('button', { name: /submit instructor request/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith({
        fullName: 'Prof. Marcus Vance',
        email: 'marcus@example.com',
        password: 'Secret123!',
        accountType: 'instructor',
      });
    });

    expect(await screen.findByText('Instructor Application Submitted')).toBeInTheDocument();
    expect(screen.getByText('Pending Administrator Review')).toBeInTheDocument();
    expect(screen.getByText(/instructor accounts require manual administrative verification/i)).toBeInTheDocument();
  });

  it('displays error when email is already registered', async () => {
    mockSignup.mockResolvedValueOnce({
      success: false,
      error: 'User already registered',
    });

    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Existing User' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'Secret123!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Secret123!' } });

    fireEvent.click(screen.getByRole('button', { name: /create student account/i }));

    expect(
      await screen.findByText(/an account with this email address already exists\. please sign in instead\./i)
    ).toBeInTheDocument();
  });
});
