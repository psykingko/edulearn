import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AboutPage() {
  const { role } = useAuth();
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <div className="glass-panel border border-[#A0B1DC]/15 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-10 relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-gradient-to-br from-[#2855D9]/15 via-[#7951C8]/15 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#2855D9]/15 text-[#E05BBE] border border-[#7951C8]/30 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#2855D9] animate-pulse"></span>
            About EduLearn // Platform Architecture
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Focused, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#E05BBE]">Reliable</span> Online Learning
          </h1>
          <p className="text-[#A5B1CA] text-sm sm:text-base mt-3 leading-relaxed max-w-2xl">
            EduLearn is an advanced web-based learning platform engineered to provide distraction-free,
            modular instruction with automated assessments and verified course material.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          <div className="p-6 bg-[#0A1B35]/70 rounded-2xl border border-[#A0B1DC]/15 hover:border-[#2855D9]/40 transition-all duration-300 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#2855D9]/15 border border-[#2855D9]/30 text-[#2855D9] flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <h2 className="font-display text-base font-bold text-white">
              Student Learning Portal
            </h2>
            <p className="text-xs text-[#A5B1CA] leading-relaxed">
              Students can browse published course catalogues, enroll in sequential curricula,
              read structured text lessons, mark lesson progress, and attempt multiple-choice quizzes
              with instant server-side grading.
            </p>
          </div>

          <div className="p-6 bg-[#0A1B35]/70 rounded-2xl border border-[#A0B1DC]/15 hover:border-[#7951C8]/40 transition-all duration-300 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#7951C8]/15 border border-[#7951C8]/30 text-[#7951C8] flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="font-display text-base font-bold text-white">
              Instructor Authoring
            </h2>
            <p className="text-xs text-[#A5B1CA] leading-relaxed">
              Verified educators can author courses, organize lessons in ordered positions,
              configure multiple-choice quizzes, set protected answer keys, and manage
              draft and published visibility.
            </p>
          </div>

          <div className="p-6 bg-[#0A1B35]/70 rounded-2xl border border-[#A0B1DC]/15 hover:border-emerald-500/40 transition-all duration-300 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="font-display text-base font-bold text-white">
              Verified Security Architecture
            </h2>
            <p className="text-xs text-[#A5B1CA] leading-relaxed">
              Data isolation is enforced at the database level through PostgreSQL Row Level Security (RLS).
              Quiz answer keys are strictly protected and never exposed to the client prior to evaluation.
            </p>
          </div>

          <div className="p-6 bg-[#0A1B35]/70 rounded-2xl border border-[#A0B1DC]/15 hover:border-[#C04BAA]/40 transition-all duration-300 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#C04BAA]/15 border border-[#C04BAA]/30 text-[#E05BBE] flex items-center justify-center">
              <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="font-display text-base font-bold text-white">
              Real-Time Persistence
            </h2>
            <p className="text-xs text-[#A5B1CA] leading-relaxed">
              Learning progress, enrollments, course revisions, and quiz scores persist reliably across
              browser reloads and multi-device sessions without relying on temporary client state.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="pt-8 border-t border-[#A0B1DC]/15 flex flex-wrap items-center justify-between gap-4 relative">
          {role === 'instructor' ? (
            <Link
              to="/instructor"
              className="px-6 py-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA] hover:brightness-110 shadow-lg shadow-[#7951C8]/25 transition-all"
            >
              Go to Instructor Portal →
            </Link>
          ) : (
            <Link
              to="/student/courses"
              className="px-6 py-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA] hover:brightness-110 shadow-lg shadow-[#7951C8]/25 transition-all"
            >
              Explore Course Catalogue →
            </Link>
          )}

          <Link
            to="/"
            className="text-xs font-semibold text-[#A5B1CA] hover:text-white underline transition-colors"
          >
            ← Return to Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
