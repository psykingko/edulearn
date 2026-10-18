import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { validateSignupForm } from '../lib/validation.js';

export default function SignupPage() {
  const { signup, user } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState('student'); // 'student' or 'instructor'
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  // If user is already authenticated and visits /signup
  if (user && !successInfo) {
    return (
      <main className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 shadow-[0_0_35px_rgba(7,20,38,0.7)] border border-[rgba(160,177,220,0.18)] space-y-4">
          <div className="w-12 h-12 bg-[#2855D9]/20 text-[#60A5FA] border border-[#2855D9]/40 rounded-full flex items-center justify-center mx-auto text-xl font-bold shadow-[0_0_15px_rgba(40,85,217,0.3)]">
            👤
          </div>
          <h2 className="font-heading text-xl font-bold text-[#F3F5FF]">Already Signed In</h2>
          <p className="text-xs text-[#A5B1CA]">
            You are currently signed in as <strong className="text-[#F3F5FF]">{user.email}</strong>.
          </p>
          <div className="pt-2">
            <Link
              to="/student"
              className="px-5 py-2 bg-gradient-to-r from-[#2855D9] to-[#7951C8] text-white text-xs font-semibold rounded-lg hover:brightness-110 transition-all inline-block shadow-xs"
            >
              Go to Your Dashboard →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessInfo(null);

    // Validate inputs
    const validation = validateSignupForm({
      fullName,
      email,
      password,
      confirmPassword,
      accountType,
    });

    if (!validation.isValid) {
      setErrorMessage(validation.error);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signup({
        fullName,
        email,
        password,
        accountType,
      });

      if (!result.success) {
        if (result.error?.toLowerCase().includes('already registered')) {
          setErrorMessage('An account with this email address already exists. Please sign in instead.');
        } else {
          setErrorMessage(result.error || 'Registration failed. Please check your inputs.');
        }
        return;
      }

      // Success handling based on account type and confirmation status
      setSuccessInfo({
        requiresEmailConfirmation: result.requiresEmailConfirmation,
        accountType,
        fullName,
        email,
      });

      // If student and active session, redirect after brief notification
      if (accountType === 'student' && !result.requiresEmailConfirmation) {
        setTimeout(() => {
          navigate('/student');
        }, 1800);
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred during signup.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 shadow-[0_0_35px_rgba(7,20,38,0.7)] border border-[rgba(160,177,220,0.18)] relative overflow-hidden">
        {/* Top subtle neon line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA]"></div>

        {/* Header */}
        <div className="text-center mb-6">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#2855D9]/15 text-[#60A5FA] border border-[#2855D9]/30 mb-2 font-mono uppercase tracking-wider">
            Get Started with EduLearn
          </span>
          <h1 className="font-heading text-2xl font-bold text-[#F3F5FF] tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs text-[#A5B1CA] mt-1">
            Join students and educators on the cinematic learning platform.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/40 rounded-lg text-xs text-rose-200 space-y-1">
            <p className="font-semibold text-rose-300">Registration Notice</p>
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Success Screen */}
        {successInfo ? (
          <div className="space-y-4 py-4 text-center">
            <div className="w-14 h-14 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-[0_0_20px_rgba(52,211,153,0.3)]">
              ✓
            </div>

            {successInfo.accountType === 'instructor' ? (
              <div className="space-y-3">
                <h2 className="font-heading text-lg font-bold text-[#F3F5FF]">
                  Instructor Application Submitted
                </h2>
                <div className="p-4 bg-[#7951C8]/15 border border-[#7951C8]/30 rounded-lg text-left text-xs text-[#E9D5FF] space-y-2">
                  <p className="font-semibold text-[#F3F5FF]">
                    Pending Administrator Review
                  </p>
                  <p className="leading-relaxed text-[#A5B1CA]">
                    Thank you, <strong className="text-[#F3F5FF]">{successInfo.fullName}</strong>. To ensure course quality and academic reliability,
                    instructor accounts require manual administrative verification.
                  </p>
                  <p className="leading-relaxed text-[#C084FC]">
                    Your request has been logged. While your authoring privileges are pending approval, your account operates with full student privileges so you can explore courses.
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="w-full py-2 bg-gradient-to-r from-[#2855D9] to-[#7951C8] text-white text-xs font-semibold rounded-lg hover:brightness-110 transition-all block text-center shadow-xs"
                  >
                    Proceed to Sign In →
                  </Link>
                </div>
              </div>
            ) : successInfo.requiresEmailConfirmation ? (
              <div className="space-y-3">
                <h2 className="font-heading text-lg font-bold text-[#F3F5FF]">
                  Verify Your Email Address
                </h2>
                <p className="text-xs text-[#A5B1CA] leading-relaxed">
                  We have dispatched a confirmation email to <strong className="text-[#F3F5FF]">{successInfo.email}</strong>.
                  Please click the link inside your inbox to activate your account, then sign in.
                </p>
                <div className="pt-2">
                  <Link
                    to="/login"
                    className="w-full py-2 bg-gradient-to-r from-[#2855D9] to-[#7951C8] text-white text-xs font-semibold rounded-lg hover:brightness-110 transition-all block text-center shadow-xs"
                  >
                    Go to Sign In →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h2 className="font-heading text-lg font-bold text-[#F3F5FF]">
                  Welcome to EduLearn!
                </h2>
                <p className="text-xs text-[#A5B1CA]">
                  Your student account is active. Redirecting you to your learning dashboard...
                </p>
                <div className="w-5 h-5 border-2 border-[rgba(160,177,220,0.2)] border-t-[#60A5FA] rounded-full animate-spin mx-auto"></div>
              </div>
            )}
          </div>
        ) : (
          /* Registration Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Type Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#A5B1CA] mb-1.5">
                I want to join EduLearn as:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label
                  className={`p-3 border rounded-lg cursor-pointer transition-colors flex flex-col justify-between ${
                    accountType === 'student'
                      ? 'border-[#2855D9] bg-[#2855D9]/20 ring-1 ring-[#2855D9]'
                      : 'border-[rgba(160,177,220,0.15)] bg-[#071426]/60 hover:bg-[#112947]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      name="accountType"
                      value="student"
                      checked={accountType === 'student'}
                      onChange={() => setAccountType('student')}
                      className="text-[#2855D9] focus:ring-[#2855D9]"
                    />
                    <span className="text-xs font-bold text-[#F3F5FF]">Student</span>
                  </div>
                  <span className="text-[11px] text-[#7483A3] leading-snug">
                    Enroll in courses, read modular lessons, and take quizzes.
                  </span>
                </label>

                <label
                  className={`p-3 border rounded-lg cursor-pointer transition-colors flex flex-col justify-between ${
                    accountType === 'instructor'
                      ? 'border-[#7951C8] bg-[#7951C8]/20 ring-1 ring-[#7951C8]'
                      : 'border-[rgba(160,177,220,0.15)] bg-[#071426]/60 hover:bg-[#112947]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      name="accountType"
                      value="instructor"
                      checked={accountType === 'instructor'}
                      onChange={() => setAccountType('instructor')}
                      className="text-[#7951C8] focus:ring-[#7951C8]"
                    />
                    <span className="text-xs font-bold text-[#F3F5FF]">Instructor</span>
                  </div>
                  <span className="text-[11px] text-[#7483A3] leading-snug">
                    Author courses, publish lessons, configure quizzes. (Requires review)
                  </span>
                </label>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="signup-name" className="block text-xs font-medium text-[#A5B1CA] mb-1">
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                disabled={isSubmitting}
                autoComplete="name"
                className="w-full px-3 py-2 text-sm bg-[#071426] border border-[rgba(160,177,220,0.2)] text-[#F3F5FF] placeholder-[#7483A3] rounded-lg focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA] transition"
              />
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="signup-email" className="block text-xs font-medium text-[#A5B1CA] mb-1">
                Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                disabled={isSubmitting}
                autoComplete="email"
                className="w-full px-3 py-2 text-sm bg-[#071426] border border-[rgba(160,177,220,0.2)] text-[#F3F5FF] placeholder-[#7483A3] rounded-lg focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA] transition"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="signup-password" className="block text-xs font-medium text-[#A5B1CA]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-[#7483A3] hover:text-[#F3F5FF] focus:outline-none transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                disabled={isSubmitting}
                autoComplete="new-password"
                className="w-full px-3 py-2 text-sm bg-[#071426] border border-[rgba(160,177,220,0.2)] text-[#F3F5FF] placeholder-[#7483A3] rounded-lg focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA] transition"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="signup-confirm-password" className="block text-xs font-medium text-[#A5B1CA] mb-1">
                Confirm Password
              </label>
              <input
                id="signup-confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                disabled={isSubmitting}
                autoComplete="new-password"
                className="w-full px-3 py-2 text-sm bg-[#071426] border border-[rgba(160,177,220,0.2)] text-[#F3F5FF] placeholder-[#7483A3] rounded-lg focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA] transition"
              />
            </div>

            {/* Instructor Approval Notice */}
            {accountType === 'instructor' && (
              <div className="p-3 bg-[#7951C8]/15 border border-[#7951C8]/30 rounded-lg text-[11px] text-[#E9D5FF] leading-relaxed">
                ℹ️ <strong>Security Notice:</strong> To ensure platform reliability, instructor registration requests are placed in pending status.
                An administrator verifies credentials before course authoring privileges are granted.
              </div>
            )}

            {/* Submit Button */}
            <button
              id="signup-submit-button"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#2855D9] to-[#7951C8] hover:from-[#3565EB] hover:to-[#8E64E3] text-white text-sm font-semibold rounded-lg shadow-[0_0_20px_rgba(40,85,217,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>
                  {accountType === 'instructor' ? 'Submit Instructor Request' : 'Create Student Account'}
                </span>
              )}
            </button>
          </form>
        )}

        {/* Existing Account Footer Link */}
        <div className="mt-6 pt-5 border-t border-[rgba(160,177,220,0.12)] text-center text-xs text-[#A5B1CA]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#60A5FA] hover:text-[#93C5FD] underline transition-colors"
          >
            Sign In here →
          </Link>
        </div>
      </div>
    </main>
  );
}
