import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validateLoginForm,
  validateSignupForm,
  validateCourseForm,
  validateLessonForm,
  validateQuizQuestion,
  validateQuizSubmission,
  isValidUUID,
} from '../../lib/validation.js';

describe('validateEmail Unit Tests', () => {
  it('accepts valid email addresses', () => {
    expect(validateEmail('student1.demo@example.com')).toBe(true);
    expect(validateEmail('instructor@test.org')).toBe(true);
    expect(validateEmail('user.name+tag@domain.co.in')).toBe(true);
  });

  it('rejects invalid email formats', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('plainaddress')).toBe(false);
    expect(validateEmail('@missingusername.com')).toBe(false);
    expect(validateEmail('missingdomain@.com')).toBe(false);
    expect(validateEmail('user@domain')).toBe(false);
    expect(validateEmail(null)).toBe(false);
    expect(validateEmail(undefined)).toBe(false);
  });
});

describe('validateLoginForm Unit Tests', () => {
  it('validates correct email and password inputs', () => {
    const result = validateLoginForm('student1.demo@example.com', 'Student123!');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('rejects empty or missing email', () => {
    expect(validateLoginForm('', 'Pass123!')).toEqual({
      isValid: false,
      error: 'Email address is required.',
    });
    expect(validateLoginForm('   ', 'Pass123!')).toEqual({
      isValid: false,
      error: 'Email address is required.',
    });
  });

  it('rejects malformed email format', () => {
    expect(validateLoginForm('invalid-email', 'Pass123!')).toEqual({
      isValid: false,
      error: 'Please enter a valid email address.',
    });
  });

  it('rejects empty or missing password', () => {
    expect(validateLoginForm('user@example.com', '')).toEqual({
      isValid: false,
      error: 'Password is required.',
    });
    expect(validateLoginForm('user@example.com', '   ')).toEqual({
      isValid: false,
      error: 'Password is required.',
    });
  });
});

describe('validateSignupForm Unit Tests', () => {
  const validData = {
    fullName: 'Alex Johnson',
    email: 'alex@example.com',
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!',
    accountType: 'student',
  };

  it('accepts valid student registration inputs', () => {
    const result = validateSignupForm(validData);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('accepts valid instructor registration inputs', () => {
    const result = validateSignupForm({ ...validData, accountType: 'instructor' });
    expect(result.isValid).toBe(true);
  });

  it('rejects empty or single-character full name', () => {
    expect(validateSignupForm({ ...validData, fullName: '' })).toEqual({
      isValid: false,
      error: 'Full name is required.',
    });
    expect(validateSignupForm({ ...validData, fullName: 'A' })).toEqual({
      isValid: false,
      error: 'Full name must be at least 2 characters.',
    });
  });

  it('rejects invalid email address', () => {
    expect(validateSignupForm({ ...validData, email: 'not-an-email' })).toEqual({
      isValid: false,
      error: 'Please enter a valid email address.',
    });
  });

  it('rejects passwords shorter than 6 characters', () => {
    expect(validateSignupForm({ ...validData, password: '123', confirmPassword: '123' })).toEqual({
      isValid: false,
      error: 'Password must be at least 6 characters long.',
    });
  });

  it('rejects non-matching passwords', () => {
    expect(validateSignupForm({ ...validData, confirmPassword: 'DifferentPassword' })).toEqual({
      isValid: false,
      error: 'Passwords do not match.',
    });
  });

  it('rejects invalid or missing account type', () => {
    expect(validateSignupForm({ ...validData, accountType: 'admin' })).toEqual({
      isValid: false,
      error: 'Please select an account type (Student or Instructor).',
    });
  });
});

describe('validateCourseForm Unit Tests', () => {
  it('accepts valid course metadata', () => {
    const result = validateCourseForm({
      title: 'Cloud Computing Architecture',
      description: 'A comprehensive study of microservices, serverless, and cloud patterns.',
    });
    expect(result.isValid).toBe(true);
  });

  it('rejects empty title or title with fewer than 3 characters', () => {
    expect(validateCourseForm({ title: '', description: 'Valid description here' })).toEqual({
      isValid: false,
      error: 'Course title is required.',
    });
    expect(validateCourseForm({ title: 'AB', description: 'Valid description here' })).toEqual({
      isValid: false,
      error: 'Course title must be at least 3 characters long.',
    });
  });

  it('rejects course title exceeding 120 characters', () => {
    const longTitle = 'A'.repeat(125);
    const result = validateCourseForm({ title: longTitle, description: 'Valid description' });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('cannot exceed 120 characters');
  });

  it('rejects empty description or description shorter than 10 characters', () => {
    expect(validateCourseForm({ title: 'Valid Title', description: '' })).toEqual({
      isValid: false,
      error: 'Course description is required.',
    });
    expect(validateCourseForm({ title: 'Valid Title', description: 'Too short' })).toEqual({
      isValid: false,
      error: 'Course description must be at least 10 characters long.',
    });
  });
});

describe('validateLessonForm Unit Tests', () => {
  it('accepts valid lesson content and positive integer position', () => {
    const result = validateLessonForm({
      title: 'Introduction to PostgreSQL RLS',
      content: 'Row Level Security restricts row access based on user session context.',
      position: 1,
    });
    expect(result.isValid).toBe(true);
  });

  it('rejects empty lesson title or short title', () => {
    expect(validateLessonForm({ title: '', content: 'Valid content text here', position: 1 })).toEqual({
      isValid: false,
      error: 'Lesson title is required.',
    });
  });

  it('rejects empty lesson content or short content', () => {
    expect(validateLessonForm({ title: 'Valid Title', content: 'Short', position: 1 })).toEqual({
      isValid: false,
      error: 'Lesson content must be at least 10 characters long.',
    });
  });

  it('rejects non-positive or non-integer lesson positions', () => {
    expect(validateLessonForm({ title: 'Valid Title', content: 'Valid content text here', position: 0 })).toEqual({
      isValid: false,
      error: 'Lesson position must be a positive integer.',
    });
    expect(validateLessonForm({ title: 'Valid Title', content: 'Valid content text here', position: -2 })).toEqual({
      isValid: false,
      error: 'Lesson position must be a positive integer.',
    });
    expect(validateLessonForm({ title: 'Valid Title', content: 'Valid content text here', position: 'not-a-number' })).toEqual({
      isValid: false,
      error: 'Lesson position must be a positive integer.',
    });
  });
});

describe('validateQuizQuestion Unit Tests', () => {
  it('accepts a valid question with 2 to 6 non-empty options and a valid correct index', () => {
    const result = validateQuizQuestion({
      questionText: 'What is Supabase RLS?',
      options: [
        { optionText: 'PostgreSQL Row Level Security' },
        { optionText: 'A JavaScript frontend library' },
      ],
      correctOptionIndex: 0,
    });
    expect(result.isValid).toBe(true);
  });

  it('rejects question with empty question text', () => {
    const result = validateQuizQuestion({
      questionText: '',
      options: [{ optionText: 'A' }, { optionText: 'B' }],
      correctOptionIndex: 0,
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Question text is required.');
  });

  it('rejects a question with fewer than two options', () => {
    const result = validateQuizQuestion({
      questionText: 'Question text',
      options: [{ optionText: 'Only One Option' }],
      correctOptionIndex: 0,
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('A quiz question must have at least 2 options.');
  });

  it('rejects options with blank text', () => {
    const result = validateQuizQuestion({
      questionText: 'Question text',
      options: [{ optionText: 'Valid Option' }, { optionText: '   ' }],
      correctOptionIndex: 0,
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Option 2 cannot be empty.');
  });

  it('rejects missing or out-of-range correct option index', () => {
    const result = validateQuizQuestion({
      questionText: 'Question text',
      options: [{ optionText: 'A' }, { optionText: 'B' }],
      correctOptionIndex: 5,
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Please select which option is the correct answer.');
  });
});

describe('validateQuizSubmission Unit Tests', () => {
  const sampleQuestions = [
    { id: 'q1', text: 'Question 1' },
    { id: 'q2', text: 'Question 2' },
    { id: 'q3', text: 'Question 3' },
  ];

  it('validates when all questions are answered', () => {
    const selectedAnswers = {
      q1: 'opt-1',
      q2: 'opt-2',
      q3: 'opt-3',
    };
    const result = validateQuizSubmission(sampleQuestions, selectedAnswers);
    expect(result.isValid).toBe(true);
    expect(result.unansweredCount).toBe(0);
  });

  it('detects unanswered questions and generates user-facing error message', () => {
    const selectedAnswers = {
      q1: 'opt-1',
      // q2 and q3 missing
    };
    const result = validateQuizSubmission(sampleQuestions, selectedAnswers);
    expect(result.isValid).toBe(false);
    expect(result.unansweredCount).toBe(2);
    expect(result.error).toContain('Unanswered: 2 of 3');
  });

  it('rejects submission for quiz with zero questions', () => {
    const result = validateQuizSubmission([], {});
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('zero questions');
  });
});

describe('isValidUUID Unit Tests', () => {
  it('accepts valid UUID strings', () => {
    expect(isValidUUID('1187344c-ba9f-4c7b-80f4-4b69862f3b29')).toBe(true);
    expect(isValidUUID('1558c5f4-f170-4ba0-aeeb-a0490956efa5')).toBe(true);
  });

  it('rejects invalid or missing identifiers', () => {
    expect(isValidUUID('')).toBe(false);
    expect(isValidUUID('12345')).toBe(false);
    expect(isValidUUID('not-a-uuid')).toBe(false);
    expect(isValidUUID(null)).toBe(false);
  });
});
