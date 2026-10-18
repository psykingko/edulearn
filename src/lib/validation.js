/**
 * Validation Utilities
 * Pure functions for user inputs across authentication, courses, lessons, and quizzes.
 */

/**
 * Validates email format using standard RFC 5322 regex.
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed);
}

/**
 * Validates login form inputs.
 * @param {string} email
 * @param {string} password
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateLoginForm(email, password) {
  if (!email || typeof email !== 'string' || !email.trim()) {
    return { isValid: false, error: 'Email address is required.' };
  }
  if (!validateEmail(email)) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }
  if (!password || typeof password !== 'string' || !password.trim()) {
    return { isValid: false, error: 'Password is required.' };
  }
  return { isValid: true };
}

/**
 * Validates registration form inputs.
 * @param {{ fullName: string, email: string, password: string, confirmPassword: string, accountType: string }} data
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateSignupForm({ fullName, email, password, confirmPassword, accountType }) {
  const trimmedName = typeof fullName === 'string' ? fullName.trim() : '';
  const trimmedEmail = typeof email === 'string' ? email.trim() : '';

  if (!trimmedName) {
    return { isValid: false, error: 'Full name is required.' };
  }
  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Full name must be at least 2 characters.' };
  }
  if (!trimmedEmail) {
    return { isValid: false, error: 'Email address is required.' };
  }
  if (!validateEmail(trimmedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required.' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long.' };
  }
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match.' };
  }
  if (!accountType || !['student', 'instructor'].includes(accountType)) {
    return { isValid: false, error: 'Please select an account type (Student or Instructor).' };
  }
  return { isValid: true };
}

/**
 * Validates course metadata form inputs.
 * @param {{ title: string, description: string }} data
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateCourseForm({ title, description }) {
  const trimmedTitle = typeof title === 'string' ? title.trim() : '';
  const trimmedDesc = typeof description === 'string' ? description.trim() : '';

  if (!trimmedTitle) {
    return { isValid: false, error: 'Course title is required.' };
  }
  if (trimmedTitle.length < 3) {
    return { isValid: false, error: 'Course title must be at least 3 characters long.' };
  }
  if (trimmedTitle.length > 120) {
    return { isValid: false, error: 'Course title cannot exceed 120 characters.' };
  }
  if (!trimmedDesc) {
    return { isValid: false, error: 'Course description is required.' };
  }
  if (trimmedDesc.length < 10) {
    return { isValid: false, error: 'Course description must be at least 10 characters long.' };
  }

  return { isValid: true };
}

/**
 * Validates lesson form inputs.
 * @param {{ title: string, content: string, position: number|string }} data
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateLessonForm({ title, content, position }) {
  const trimmedTitle = typeof title === 'string' ? title.trim() : '';
  const trimmedContent = typeof content === 'string' ? content.trim() : '';
  const posNum = Number(position);

  if (!trimmedTitle) {
    return { isValid: false, error: 'Lesson title is required.' };
  }
  if (trimmedTitle.length < 3) {
    return { isValid: false, error: 'Lesson title must be at least 3 characters long.' };
  }
  if (!trimmedContent) {
    return { isValid: false, error: 'Lesson content is required.' };
  }
  if (trimmedContent.length < 10) {
    return { isValid: false, error: 'Lesson content must be at least 10 characters long.' };
  }
  if (Number.isNaN(posNum) || posNum <= 0 || !Number.isInteger(posNum)) {
    return { isValid: false, error: 'Lesson position must be a positive integer.' };
  }

  return { isValid: true };
}

/**
 * Validates a quiz question and its options.
 * A question must have text, at least 2 non-empty options, and a valid correct option selection.
 * 
 * @param {{
 *   questionText: string,
 *   options: Array<{ optionText: string }>,
 *   correctOptionIndex: number
 * }} data
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateQuizQuestion({ questionText, options, correctOptionIndex }) {
  const trimmedText = typeof questionText === 'string' ? questionText.trim() : '';
  if (!trimmedText) {
    return { isValid: false, error: 'Question text is required.' };
  }
  if (!Array.isArray(options) || options.length < 2) {
    return { isValid: false, error: 'A quiz question must have at least 2 options.' };
  }
  if (options.length > 6) {
    return { isValid: false, error: 'A quiz question cannot exceed 6 options.' };
  }

  for (let i = 0; i < options.length; i++) {
    const optText = typeof options[i]?.optionText === 'string' ? options[i].optionText.trim() : '';
    if (!optText) {
      return { isValid: false, error: `Option ${i + 1} cannot be empty.` };
    }
  }

  if (
    typeof correctOptionIndex !== 'number' ||
    correctOptionIndex < 0 ||
    correctOptionIndex >= options.length ||
    !Number.isInteger(correctOptionIndex)
  ) {
    return { isValid: false, error: 'Please select which option is the correct answer.' };
  }

  return { isValid: true };
}

/**
 * Validates student quiz answers before submission.
 * Checks that every question in the quiz has a selected option.
 * 
 * @param {Array<{ id: string }>} questions - All questions in the quiz
 * @param {Record<string, string>} selectedAnswers - Map of questionId -> optionId
 * @returns {{
 *   isValid: boolean,
 *   unansweredCount: number,
 *   totalQuestions: number,
 *   error?: string
 * }}
 */
export function validateQuizSubmission(questions = [], selectedAnswers = {}) {
  const totalQuestions = Array.isArray(questions) ? questions.length : 0;
  if (totalQuestions === 0) {
    return {
      isValid: false,
      unansweredCount: 0,
      totalQuestions: 0,
      error: 'Cannot submit a quiz with zero questions.',
    };
  }

  const unanswered = questions.filter((q) => !selectedAnswers[q.id]);
  const unansweredCount = unanswered.length;

  if (unansweredCount > 0) {
    return {
      isValid: false,
      unansweredCount,
      totalQuestions,
      error: `Please answer all questions before submitting. Unanswered: ${unansweredCount} of ${totalQuestions}.`,
    };
  }

  return {
    isValid: true,
    unansweredCount: 0,
    totalQuestions,
  };
}

/**
 * Checks if a string is a valid UUID v4 (common for Supabase record IDs).
 * @param {string} id
 * @returns {boolean}
 */
export function isValidUUID(id) {
  if (!id || typeof id !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id.trim());
}
