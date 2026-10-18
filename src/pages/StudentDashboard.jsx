import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function StudentDashboard() {
  const { user, profile, logout } = useAuth();

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      // 1. Fetch student enrollments and course details (including lessons and instructor)
      const { data: enrollData, error: enrollErr } = await supabase
        .from('enrollments')
        .select(`
          id,
          enrolled_at,
          courses (
            id,
            title,
            description,
            is_published,
            instructor_id,
            profiles (full_name),
            lessons (id, position)
          )
        `)
        .eq('student_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (enrollErr) throw enrollErr;

      // 2. Fetch all completed lessons for this student
      const { data: progData, error: progErr } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('student_id', user.id)
        .eq('is_completed', true);

      if (progErr) throw progErr;

      const completedLessonSet = new Set((progData || []).map((p) => p.lesson_id));

      // 3. Process courses with calculated progress
      const coursesWithProgress = (enrollData || [])
        .filter((e) => e.courses && e.courses.is_published)
        .map((e) => {
          const c = e.courses;
          const totalLessons = c.lessons?.length || 0;
          const completedCount = totalLessons > 0
            ? c.lessons.filter((l) => completedLessonSet.has(l.id)).length
            : 0;
          const progressPercent = totalLessons > 0
            ? Math.round((completedCount / totalLessons) * 100)
            : 0;
          const isCompleted = totalLessons > 0 && completedCount === totalLessons;
          const isInProgress = totalLessons > 0 && completedCount > 0 && !isCompleted;

          return {
            enrollmentId: e.id,
            enrolledAt: e.enrolled_at,
            courseId: c.id,
            title: c.title,
            description: c.description,
            instructorName: c.profiles?.full_name || 'Verified Instructor',
            totalLessons,
            completedCount,
            progressPercent,
            isCompleted,
            isInProgress,
          };
        });

      setEnrolledCourses(coursesWithProgress);

      // 4. Fetch recent quiz attempts (limit 5)
      const { data: quizData, error: quizErr } = await supabase
        .from('quiz_attempts')
        .select(`
          id,
          score,
          submitted_at,
          quizzes (
            id,
            title,
            course_id,
            courses (id, title)
          )
        `)
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(5);

      if (!quizErr && quizData) {
        setRecentAttempts(quizData);
      }
    } catch (err) {
      setErrorMessage(`Failed to load student dashboard: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Derived metrics
  const totalEnrolled = enrolledCourses.length;
  const inProgressCount = enrolledCourses.filter((c) => c.isInProgress).length;
  const completedCount = enrolledCourses.filter((c) => c.isCompleted).length;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Welcome & Role Header */}
      <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 shadow-[0_0_35px_rgba(7,20,38,0.7)] border border-[rgba(160,177,220,0.18)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA]"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(160,177,220,0.12)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] shadow-[0_0_8px_rgba(56,189,248,0.5)]"></span>
              <span className="text-xs uppercase font-bold tracking-wider text-[#60A5FA] font-mono">
                Student Learning Portal
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#F3F5FF] tracking-tight">
              Welcome back, {profile?.full_name || user?.email}
            </h1>
            <p className="text-xs text-[#7483A3] mt-1">
              Signed in as <code className="font-mono text-[#A5B1CA]">{user?.email}</code> • Student ID:{' '}
              <span className="font-mono text-[#7483A3] text-[11px]">{user?.id?.slice(0, 8)}...</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/student/courses"
              className="px-4 py-2 bg-gradient-to-r from-[#2855D9] to-[#7951C8] hover:brightness-110 text-white text-xs font-semibold rounded-lg shadow-[0_0_15px_rgba(40,85,217,0.35)] transition-all"
            >
              + Browse Course Catalogue
            </Link>
            <button
              onClick={logout}
              className="px-3.5 py-2 bg-[#0D203B] hover:bg-[#112947] text-[#F3F5FF] border border-[rgba(160,177,220,0.2)] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mt-6 p-4 bg-rose-950/60 border border-rose-500/40 rounded-lg text-xs text-rose-200 space-y-1">
            <p className="font-semibold text-rose-300">Unable to load dashboard records</p>
            <p>{errorMessage}</p>
            <button
              onClick={loadDashboardData}
              className="mt-2 text-xs font-semibold underline text-rose-300 hover:text-rose-100 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Learning Journey Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-[#071426]/70 rounded-xl border border-[rgba(160,177,220,0.12)]">
            <dt className="text-xs font-semibold uppercase tracking-wider text-[#7483A3] font-mono">
              Total Enrolled
            </dt>
            <dd className="text-3xl font-extrabold text-[#F3F5FF] font-mono mt-1">
              {isLoading ? '-' : totalEnrolled}
            </dd>
            <p className="text-[11px] text-[#7483A3] mt-0.5">Active course enrollments</p>
          </div>

          <div className="p-4 bg-[#071426]/70 rounded-xl border border-[rgba(160,177,220,0.12)]">
            <dt className="text-xs font-semibold uppercase tracking-wider text-[#7483A3] font-mono">
              In Progress
            </dt>
            <dd className="text-3xl font-extrabold text-[#38BDF8] font-mono mt-1">
              {isLoading ? '-' : inProgressCount}
            </dd>
            <p className="text-[11px] text-[#7483A3] mt-0.5">Partially completed syllabi</p>
          </div>

          <div className="p-4 bg-[#071426]/70 rounded-xl border border-[rgba(160,177,220,0.12)]">
            <dt className="text-xs font-semibold uppercase tracking-wider text-[#7483A3] font-mono">
              Completed
            </dt>
            <dd className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">
              {isLoading ? '-' : completedCount}
            </dd>
            <p className="text-[11px] text-[#7483A3] mt-0.5">100% lessons verified</p>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Enrolled Courses & Recent Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Enrolled Courses (2 cols wide) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[rgba(160,177,220,0.14)]">
            <h2 className="font-heading text-base font-bold text-[#F3F5FF] tracking-tight">
              My Enrolled Courses ({enrolledCourses.length})
            </h2>
            <Link
              to="/student/courses"
              className="text-xs font-semibold text-[#60A5FA] hover:text-[#93C5FD] transition-colors"
            >
              Explore More Courses →
            </Link>
          </div>

          {isLoading ? (
            <div className="py-16 text-center glass-panel rounded-xl">
              <div className="w-8 h-8 border-3 border-[rgba(160,177,220,0.2)] border-t-[#60A5FA] rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-[#A5B1CA]">Loading your enrolled courses...</p>
            </div>
          ) : enrolledCourses.length === 0 ? (
            <div className="glass-panel border-2 border-dashed border-[rgba(160,177,220,0.18)] rounded-xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#2855D9]/20 text-[#60A5FA] border border-[#2855D9]/30 font-bold text-lg flex items-center justify-center mx-auto mb-3 shadow-[0_0_12px_rgba(40,85,217,0.3)]">
                🎓
              </div>
              <h3 className="font-heading text-sm font-bold text-[#F3F5FF] mb-1">
                You haven&apos;t enrolled in any courses yet
              </h3>
              <p className="text-xs text-[#7483A3] max-w-sm mx-auto mb-5 leading-relaxed">
                Browse our published course catalogue to enroll in classes, study modular lessons, and take quizzes.
              </p>
              <Link
                to="/student/courses"
                className="px-5 py-2.5 bg-gradient-to-r from-[#2855D9] to-[#7951C8] hover:brightness-110 text-white text-xs font-semibold rounded-lg shadow-xs transition-all inline-block"
              >
                Browse Published Courses
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {enrolledCourses.map((c) => (
                <div
                  key={c.courseId}
                  className="glass-panel rounded-xl p-5 shadow-sm hover:border-[#60A5FA]/40 transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#2855D9] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-[#7483A3]">
                        Instructor: <strong className="text-[#A5B1CA]">{c.instructorName}</strong>
                      </span>
                      {c.isCompleted ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_rgba(52,211,153,0.2)]">
                          ✓ Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#2855D9]/15 text-[#60A5FA] border border-[#2855D9]/30">
                          In Progress
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading text-base font-bold text-[#F3F5FF] tracking-tight group-hover:text-[#60A5FA] transition-colors">
                      {c.title}
                    </h3>

                    <p className="text-xs text-[#A5B1CA] line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>

                    {/* Progress details */}
                    <div className="pt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#7483A3]">
                          {c.completedCount} of {c.totalLessons} {c.totalLessons === 1 ? 'lesson' : 'lessons'} completed
                        </span>
                        <span className="font-bold text-[#F3F5FF] font-mono">{c.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-[#071426] h-2 rounded-full overflow-hidden border border-[rgba(160,177,220,0.1)]">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            c.isCompleted ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'bg-gradient-to-r from-[#2855D9] to-[#7951C8]'
                          }`}
                          style={{ width: `${c.progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-[rgba(160,177,220,0.1)] flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#7483A3] font-mono">
                      Enrolled on {new Date(c.enrolledAt).toLocaleDateString()}
                    </span>
                    <Link
                      to={`/student/courses/${c.courseId}`}
                      className="px-4 py-2 bg-gradient-to-r from-[#2855D9] to-[#7951C8] hover:brightness-110 text-white text-xs font-semibold rounded-lg shadow-xs transition-all"
                    >
                      Continue Learning →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recent Quiz Results (1 col wide) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[rgba(160,177,220,0.14)]">
            <h2 className="font-heading text-base font-bold text-[#F3F5FF] tracking-tight">
              Recent Quiz Scores
            </h2>
            <Link
              to="/student/results"
              className="text-xs font-semibold text-[#C084FC] hover:text-[#E9D5FF] transition-colors"
            >
              View All ({recentAttempts.length}) →
            </Link>
          </div>

          <div className="glass-panel rounded-xl p-5 border border-[rgba(160,177,220,0.16)] shadow-sm">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-[#7483A3]">
                Loading attempt records...
              </div>
            ) : recentAttempts.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <p className="text-xs font-semibold text-[#F3F5FF]">No Quizzes Attempted</p>
                <p className="text-[11px] text-[#7483A3] leading-relaxed">
                  Attempt multiple-choice quizzes in your enrolled courses to see scores evaluated here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[rgba(160,177,220,0.08)] space-y-3">
                {recentAttempts.map((att) => {
                  const courseId = att.quizzes?.course_id;
                  const quizTitle = att.quizzes?.title || 'MCQ Quiz';
                  const courseTitle = att.quizzes?.courses?.title || 'Course';

                  return (
                    <div key={att.id} className="pt-3 first:pt-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#F3F5FF] truncate">
                          {quizTitle}
                        </span>
                        <span
                          className={`text-xs font-extrabold px-2 py-0.5 rounded font-mono ${
                            att.score >= 70
                              ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_rgba(52,211,153,0.2)]'
                              : 'bg-amber-950/70 text-amber-400 border border-amber-500/40'
                          }`}
                        >
                          {att.score}%
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7483A3] truncate">{courseTitle}</p>
                      <div className="flex items-center justify-between text-[10px] text-[#7483A3] pt-0.5">
                        <span className="font-mono">{new Date(att.submitted_at).toLocaleDateString()}</span>
                        {courseId && att.quizzes?.id && (
                          <Link
                            to={`/student/courses/${courseId}/quizzes/${att.quizzes.id}`}
                            className="text-[#C084FC] hover:text-[#E9D5FF] font-semibold transition-colors"
                          >
                            Retake
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Helpful Links */}
          <div className="glass-panel rounded-xl p-5 border border-[rgba(160,177,220,0.16)] space-y-3">
            <h4 className="text-xs font-bold text-[#F3F5FF] font-heading">Student Navigation Quick Links</h4>
            <ul className="text-xs text-[#60A5FA] space-y-2 font-medium">
              <li>
                <Link to="/student/courses" className="hover:text-[#93C5FD] transition-colors block">
                  → Browse Course Catalogue
                </Link>
              </li>
              <li>
                <Link to="/student/results" className="hover:text-[#93C5FD] transition-colors block">
                  → View Full Quiz Attempt History
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#93C5FD] transition-colors block">
                  → Read Project Architecture
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
