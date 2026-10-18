import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Footer() {
  const { user, role } = useAuth();

  return (
    <footer className="border-t border-[rgba(160,177,220,0.12)] bg-[#071426] mt-auto py-10 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#7483A3]">
        <div className="flex items-center gap-2.5">
          <span className="w-5 h-5 rounded-md bg-gradient-to-br from-[#2855D9] to-[#7951C8] text-white flex items-center justify-center font-black text-xs shadow-[0_0_10px_rgba(40,85,217,0.4)]">
            E
          </span>
          <span className="font-bold text-[#F3F5FF] tracking-tight text-sm font-heading">EduLearn</span>
          <span className="text-[rgba(160,177,220,0.25)]">|</span>
          <span>&copy; {new Date().getFullYear()} EduLearn Learning Platform. All rights reserved.</span>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <Link to="/" className="hover:text-[#F3F5FF] transition-colors">
            Home
          </Link>

          {role !== 'instructor' && (
            <Link to="/student/courses" className="hover:text-[#F3F5FF] transition-colors">
              Explore Courses
            </Link>
          )}

          {role === 'student' && (
            <>
              <Link to="/student" className="hover:text-[#F3F5FF] transition-colors">
                Dashboard
              </Link>
              <Link to="/student/results" className="hover:text-[#F3F5FF] transition-colors">
                My Results
              </Link>
            </>
          )}

          {role === 'instructor' && (
            <Link to="/instructor" className="hover:text-[#F3F5FF] transition-colors">
              Instructor Portal
            </Link>
          )}

          <Link to="/about" className="hover:text-[#F3F5FF] transition-colors">
            About EduLearn
          </Link>

          {!user && (
            <>
              <Link to="/login" className="hover:text-[#F3F5FF] transition-colors">
                Sign In
              </Link>
              <Link to="/signup" className="hover:text-[#F3F5FF] transition-colors">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
