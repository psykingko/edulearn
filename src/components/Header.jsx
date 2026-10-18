import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Header() {
  const { user, profile, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `text-xs font-medium transition-all px-3 py-1.5 rounded-md ${
      isActive
        ? 'bg-[#112947] text-[#F3F5FF] border border-[rgba(160,177,220,0.2)] shadow-xs'
        : 'text-[#A5B1CA] hover:text-[#F3F5FF] hover:bg-[#112947]/40'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `block text-sm font-medium py-2 px-3 rounded-md transition-all ${
      isActive
        ? 'bg-[#112947] text-[#F3F5FF] border border-[rgba(160,177,220,0.2)] font-semibold'
        : 'text-[#A5B1CA] hover:text-[#F3F5FF] hover:bg-[#112947]/40'
    }`;

  return (
    <header className="border-b border-[rgba(160,177,220,0.14)] bg-[#071426]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Branding */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-lg sm:text-xl font-bold text-[#F3F5FF] tracking-tight flex items-center gap-2.5 hover:opacity-95 transition-opacity font-heading"
          >
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2855D9] via-[#7951C8] to-[#C04BAA] text-white flex items-center justify-center font-black text-sm shadow-[0_0_18px_rgba(40,85,217,0.45)]">
              E
            </span>
            <span className="tracking-tight">EduLearn</span>
          </Link>

          {role && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                role === 'instructor'
                  ? 'bg-[#7951C8]/15 text-[#C084FC] border-[#7951C8]/40 shadow-[0_0_10px_rgba(121,81,200,0.2)]'
                  : 'bg-[#2855D9]/15 text-[#60A5FA] border-[#2855D9]/40 shadow-[0_0_10px_rgba(40,85,217,0.2)]'
              }`}
            >
              {role}
            </span>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          {role !== 'instructor' && (
            <NavLink to="/student/courses" className={navLinkClass}>
              Explore Courses
            </NavLink>
          )}
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>

          {role === 'student' && (
            <>
              <NavLink to="/student" end className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/student/results" className={navLinkClass}>
                My Results
              </NavLink>
            </>
          )}

          {role === 'instructor' && (
            <NavLink to="/instructor" className={navLinkClass}>
              Instructor Portal
            </NavLink>
          )}
        </nav>

        {/* Desktop User / Auth Actions */}
        <div className="hidden md:flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#A5B1CA] font-medium" title={user.email}>
                {profile?.full_name || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-[#0D203B] hover:bg-[#112947] text-[#F3F5FF] border border-[rgba(160,177,220,0.2)] text-xs font-medium rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="px-3.5 py-1.5 text-[#A5B1CA] hover:text-[#F3F5FF] text-xs font-semibold rounded-md transition-colors"
              >
                Sign In
              </NavLink>
              <NavLink
                to="/signup"
                className="px-4 py-1.5 bg-gradient-to-r from-[#2855D9] to-[#7951C8] hover:from-[#3462EB] hover:to-[#8E64E3] text-white text-xs font-semibold rounded-md transition-all shadow-[0_0_16px_rgba(40,85,217,0.4)]"
              >
                Get Started
              </NavLink>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-1.5 rounded-md text-[#A5B1CA] hover:text-[#F3F5FF] hover:bg-[#112947] focus:outline-none transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[rgba(160,177,220,0.14)] bg-[#0A1B35]/95 backdrop-blur-xl px-4 py-3 space-y-2">
          <NavLink
            to="/"
            end
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClass}
          >
            Home
          </NavLink>
          {role !== 'instructor' && (
            <NavLink
              to="/student/courses"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              Explore Courses
            </NavLink>
          )}
          <NavLink
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClass}
          >
            About
          </NavLink>

          {role === 'student' && (
            <>
              <NavLink
                to="/student"
                end
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/student/results"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass}
              >
                My Results
              </NavLink>
            </>
          )}

          {role === 'instructor' && (
            <NavLink
              to="/instructor"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              Instructor Portal
            </NavLink>
          )}

          <div className="pt-3 border-t border-[rgba(160,177,220,0.12)]">
            {user ? (
              <div className="space-y-2">
                <p className="text-xs text-[#A5B1CA] font-medium">
                  Signed in as: <strong className="text-[#F3F5FF]">{profile?.full_name || user.email}</strong>
                </p>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2 bg-[#0D203B] hover:bg-[#112947] text-[#F3F5FF] text-xs font-semibold rounded-md border border-[rgba(160,177,220,0.2)] transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center bg-[#0D203B] text-[#F3F5FF] text-xs font-semibold rounded-md border border-[rgba(160,177,220,0.2)]"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center bg-gradient-to-r from-[#2855D9] to-[#7951C8] text-white text-xs font-semibold rounded-md shadow-xs"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
