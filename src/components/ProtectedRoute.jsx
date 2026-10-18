import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, role, isLoading, authError, logout } = useAuth();
  const location = useLocation();

  // 1. Session is still resolving: show clean, restrained loading state
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-9 h-9 border-2 border-[#A0B1DC]/20 border-t-[#7951C8] rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-[#A5B1CA]">Verifying session...</p>
      </div>
    );
  }

  // 2. Unauthenticated: redirect to /login with return state
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Authenticated but profile failed to load or role is missing
  if (!profile || !role) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 glass-panel border border-rose-500/30 rounded-2xl shadow-2xl text-center">
        <div className="w-12 h-12 bg-rose-500/20 text-rose-300 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-lg border border-rose-500/30">
          !
        </div>
        <h2 className="font-display text-xl font-bold text-white mb-2">Profile Resolution Error</h2>
        <p className="text-xs text-[#A5B1CA] mb-6 leading-relaxed">
          {authError || 'An authenticated session exists, but your profile or role could not be loaded from the database.'}
        </p>
        <button
          onClick={logout}
          className="px-5 py-2.5 bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA] hover:brightness-110 text-white text-xs font-semibold rounded-xl shadow-lg shadow-[#7951C8]/25 transition-all"
        >
          Sign Out & Return to Login
        </button>
      </div>
    );
  }

  // 4. Role mismatch: user is authenticated, but role is not authorized for this route
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 glass-panel border border-[#C04BAA]/30 rounded-2xl shadow-2xl text-center">
        <div className="w-12 h-12 bg-[#C04BAA]/20 text-[#E05BBE] rounded-2xl flex items-center justify-center mx-auto mb-4 font-mono font-bold text-base border border-[#C04BAA]/30">
          403
        </div>
        <h2 className="font-display text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-xs text-[#A5B1CA] mb-6 leading-relaxed">
          Your account is registered as a <strong className="font-semibold text-white uppercase tracking-wider">{role}</strong>.
          You do not have permission to access this portal.
        </p>
        <div className="flex justify-center gap-3">
          {role === 'student' ? (
            <a
              href="/student"
              className="px-5 py-2.5 bg-gradient-to-r from-[#2855D9] to-[#7951C8] text-white text-xs font-semibold rounded-xl hover:brightness-110 transition-all shadow-md shadow-[#2855D9]/20"
            >
              Go to Student Portal
            </a>
          ) : (
            <a
              href="/instructor"
              className="px-5 py-2.5 bg-gradient-to-r from-[#7951C8] to-[#C04BAA] text-white text-xs font-semibold rounded-xl hover:brightness-110 transition-all shadow-md shadow-[#7951C8]/20"
            >
              Go to Instructor Portal
            </a>
          )}
          <button
            onClick={logout}
            className="px-4 py-2.5 bg-[#0A1B35] hover:bg-[#0D203B] text-[#A5B1CA] hover:text-white text-xs font-medium rounded-xl border border-[#A0B1DC]/20 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // 5. Authorized: render children
  return children;
}
