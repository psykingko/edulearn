import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { DEMO_ACCOUNTS } from '../config/demoAccounts.js';

export default function LoginPage() {
  const { user, role, login, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [activeDemoNotice, setActiveDemoNotice] = useState('');

  // Determine redirection destination if user arrived from a protected route
  const from = location.state?.from?.pathname || (role === 'instructor' ? '/instructor' : '/student');

  // If already logged in, redirect to appropriate destination
  useEffect(() => {
    if (user && role) {
      navigate(from, { replace: true });
    }
  }, [user, role, navigate, from]);

  // Handle manual login submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setActiveDemoNotice('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setValidationError('Please enter your email address.');
      return;
    }
    if (!password) {
      setValidationError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(trimmedEmail, password);
    setIsSubmitting(false);

    if (result.success) {
      // Redirection will trigger via useEffect once session and role are resolved
    } else {
      setValidationError(result.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  // Handle demo button click — strictly fills input fields without auto-submitting
  const handleFillDemo = (demo) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setValidationError('');
    setActiveDemoNotice(`Filled credentials for ${demo.label}. Click 'Sign In' to submit.`);
  };

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 shadow-[0_0_35px_rgba(7,20,38,0.7)] border border-[rgba(160,177,220,0.18)] relative overflow-hidden">
        {/* Top subtle neon line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA]"></div>

        {/* Header */}
        <div className="text-center mb-6">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#2855D9]/15 text-[#60A5FA] border border-[#2855D9]/30 mb-2 font-mono uppercase tracking-wider">
            EduLearn Portal Access
          </span>
          <h1 className="font-heading text-2xl font-bold text-[#F3F5FF] tracking-tight">
            Sign In to EduLearn
          </h1>
          <p className="text-xs text-[#A5B1CA] mt-1">
            Access your Student or Instructor portal using email and password.
          </p>
        </div>

        {/* Validation or Auth Error Display */}
        {(validationError || authError) && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/40 rounded-lg text-xs text-rose-200 space-y-1">
            <p className="font-semibold text-rose-300">Authentication Error</p>
            <p>{validationError || authError}</p>
          </div>
        )}

        {/* Demo Fill Notice */}
        {activeDemoNotice && (
          <div className="mb-4 p-3 bg-[#2855D9]/15 border border-[#2855D9]/30 rounded-lg text-xs text-[#93C5FD]">
            ℹ️ {activeDemoNotice}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-medium text-[#A5B1CA] mb-1">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              disabled={isSubmitting}
              autoComplete="email"
              className="w-full px-3 py-2 text-sm bg-[#071426] border border-[rgba(160,177,220,0.2)] text-[#F3F5FF] placeholder-[#7483A3] rounded-lg focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA] transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="login-password" className="block text-xs font-medium text-[#A5B1CA]">
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
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isSubmitting}
              autoComplete="current-password"
              className="w-full px-3 py-2 text-sm bg-[#071426] border border-[rgba(160,177,220,0.2)] text-[#F3F5FF] placeholder-[#7483A3] rounded-lg focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA] transition"
            />
          </div>

          <button
            id="login-submit-button"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-[#2855D9] to-[#7951C8] hover:from-[#3565EB] hover:to-[#8E64E3] text-white text-sm font-semibold rounded-lg shadow-[0_0_20px_rgba(40,85,217,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>

          <div className="text-center pt-1 text-xs text-[#A5B1CA]">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-[#60A5FA] hover:text-[#93C5FD] underline transition-colors">
              Create an account / Sign Up →
            </Link>
          </div>
        </form>

        {/* Demo Accounts Prefill Section */}
        <div className="mt-8 pt-6 border-t border-[rgba(160,177,220,0.12)]">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#A5B1CA] font-heading">
              Evaluation Demo Accounts
            </h2>
            <span className="text-[10px] text-[#7483A3]">Prefills fields only</span>
          </div>
          <p className="text-[11px] text-[#7483A3] mb-3 leading-relaxed">
            Select a demo persona below to populate credentials. You must click <strong>Sign In</strong> to authenticate.
          </p>

          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((demo) => (
              <button
                key={demo.id}
                type="button"
                onClick={() => handleFillDemo(demo)}
                className="p-2.5 text-left bg-[#071426]/70 hover:bg-[#112947] border border-[rgba(160,177,220,0.15)] hover:border-[#60A5FA]/40 rounded-lg transition-colors group cursor-pointer"
                title={`${demo.fullName} (${demo.role})`}
              >
                <div className="text-xs font-semibold text-[#F3F5FF] group-hover:text-white flex items-center justify-between">
                  <span>{demo.label}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                      demo.role === 'instructor' 
                        ? 'bg-[#7951C8]/20 text-[#C084FC] border border-[#7951C8]/40' 
                        : 'bg-[#2855D9]/20 text-[#60A5FA] border border-[#2855D9]/40'
                    }`}
                  >
                    {demo.role}
                  </span>
                </div>
                <div className="text-[10px] text-[#7483A3] truncate mt-0.5 font-mono">
                  {demo.email}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-3 p-2.5 bg-[#071426]/60 rounded-lg border border-[rgba(160,177,220,0.1)] text-[11px] text-[#7483A3] space-y-1">
            <p>
              🔒 <strong>Demo Credential Notice:</strong> These are public, synthetic accounts designated for testing and grading.
              Passwords are disposable and no administrative secrets or service-role keys are exposed.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
