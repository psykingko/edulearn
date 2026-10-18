import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage.jsx';
import * as AuthContextModule from '../../context/AuthContext.jsx';

describe('LoginPage Component Tests', () => {
  const mockLogin = vi.fn();
  const defaultAuthContext = {
    user: null,
    profile: null,
    role: null,
    login: mockLogin,
    authError: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue(defaultAuthContext);
  });

  it('renders login form, input fields, and submit button', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /sign in to edulearn/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders all four demo persona buttons', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Student Demo 1')).toBeInTheDocument();
    expect(screen.getByText('Student Demo 2')).toBeInTheDocument();
    expect(screen.getByText('Instructor Demo 1')).toBeInTheDocument();
    expect(screen.getByText('Instructor Demo 2')).toBeInTheDocument();
  });

  it('populates fields when a demo button is clicked WITHOUT auto-submitting', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const studentBtn = screen.getByText('Student Demo 1');
    fireEvent.click(studentBtn);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password/i);

    expect(emailInput).toHaveValue('student1.demo@example.com');
    expect(passwordInput).toHaveValue('Student123!');
    expect(screen.getByText(/filled credentials for student demo 1/i)).toBeInTheDocument();

    // Verify mockLogin was NOT automatically called
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('displays client validation error when email is missing', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Please enter your email address.')).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('displays client validation error when password is missing', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });

    const submitBtn = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Please enter your password.')).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('displays error message when authentication fails', async () => {
    mockLogin.mockResolvedValueOnce({
      success: false,
      error: 'Invalid login credentials.',
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password/i);

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'WrongPass!' } });

    const submitBtn = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Invalid login credentials.')).toBeInTheDocument();
    expect(mockLogin).toHaveBeenCalledWith('wrong@example.com', 'WrongPass!');
  });

  it('shows loading indicator and disables submit button while submission is in progress', async () => {
    let resolveLogin;
    mockLogin.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        })
    );

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

    const submitBtn = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitBtn);

    // Button should show loading state and be disabled
    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();

    // Resolve login promise
    resolveLogin({ success: true });
    await waitFor(() => {
      expect(screen.queryByText('Signing in...')).not.toBeInTheDocument();
    });
  });
});
