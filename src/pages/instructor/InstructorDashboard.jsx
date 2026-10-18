import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function InstructorDashboard() {
  const { user, profile, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [updatingCourseId, setUpdatingCourseId] = useState(null);

  // Fetch courses owned by current instructor with counts
  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Fetch authored courses with lesson and quiz counts.
      // Filter by current instructor ID to ensure instructors only manage their own courses.
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, description, instructor_id, is_published, created_at, updated_at, lessons(count), quizzes(count)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const authored = (data || []).filter((c) => !c.instructor_id || c.instructor_id === user?.id);
      setCourses(authored);
    } catch (err) {
      setErrorMessage(`Failed to load courses: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Toggle publish / unpublish
  const handleTogglePublish = async (course) => {
    const nextState = !course.is_published;
    const confirmMessage = nextState
      ? `Publish "${course.title}"? It will become publicly visible to students.`
      : `Unpublish "${course.title}"? It will be hidden from student catalog view.`;

    if (!window.confirm(confirmMessage)) return;

    setUpdatingCourseId(course.id);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { data, error } = await supabase
        .from('courses')
        .update({ is_published: nextState, updated_at: new Date().toISOString() })
        .eq('id', course.id)
        .select()
        .single();

      if (error) throw error;

      setSuccessMessage(`"${data.title}" successfully ${data.is_published ? 'published' : 'unpublished'}.`);
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, is_published: data.is_published } : c))
      );
    } catch (err) {
      setErrorMessage(`Failed to update publication status: ${err.message}`);
    } finally {
      setUpdatingCourseId(null);
    }
  };

  // Delete course
  const handleDeleteCourse = async (course) => {
    if (!window.confirm(`Are you sure you want to delete course "${course.title}" and all its lessons and quizzes? This action cannot be undone.`)) {
      return;
    }

    setUpdatingCourseId(course.id);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { error } = await supabase.from('courses').delete().eq('id', course.id);
      if (error) throw error;

      setSuccessMessage(`Course "${course.title}" deleted.`);
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
    } catch (err) {
      setErrorMessage(`Failed to delete course: ${err.message}`);
    } finally {
      setUpdatingCourseId(null);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Header Profile Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 mb-10 border-b border-[#A0B1DC]/15">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#7951C8]/15 text-[#C04BAA] border border-[#7951C8]/30 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#E05BBE] animate-pulse"></span>
            Instructor Studio // Management
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome, {profile?.full_name || user?.email}
          </h1>
          <p className="text-sm text-[#A5B1CA] mt-1 max-w-2xl leading-relaxed">
            Manage your curriculum, author modular lessons, and configure multiple-choice quizzes with verified server evaluation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/instructor/courses/new"
            className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA] hover:brightness-110 shadow-lg shadow-[#7951C8]/25 transition-all"
          >
            + Create New Course
          </Link>
          <button
            onClick={logout}
            className="px-4 py-2.5 rounded-lg text-xs font-medium text-[#A5B1CA] hover:text-white bg-[#0A1B35] hover:bg-[#0D203B] border border-[#A0B1DC]/20 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="mb-8 p-4 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-200 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0 font-bold mt-0.5">
            !
          </div>
          <div>
            <p className="font-semibold text-rose-100">Operation Error</p>
            <p className="mt-0.5 text-rose-200/90 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-8 p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 font-bold mt-0.5">
            ✓
          </div>
          <div>
            <p className="font-semibold text-emerald-100">Success</p>
            <p className="mt-0.5 text-emerald-200/90 leading-relaxed">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Course List Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-[#A0B1DC]/10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#A5B1CA]">
            My Authored Courses ({courses.length})
          </h2>
          <button
            onClick={loadCourses}
            disabled={isLoading}
            className="text-xs text-[#7951C8] hover:text-[#C04BAA] underline transition-colors disabled:opacity-50"
          >
            Refresh List
          </button>
        </div>

        {isLoading ? (
          <div className="py-20 text-center glass-panel rounded-2xl border border-[#A0B1DC]/15">
            <div className="w-9 h-9 border-2 border-[#A0B1DC]/20 border-t-[#7951C8] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xs text-[#A5B1CA]">Loading your courses from Supabase...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="glass-panel border border-dashed border-[#A0B1DC]/25 rounded-2xl p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2855D9]/20 to-[#7951C8]/20 border border-[#7951C8]/30 text-[#E05BBE] flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-2">No Courses Created Yet</h3>
            <p className="text-xs text-[#A5B1CA] max-w-md mx-auto mb-6 leading-relaxed">
              You haven&apos;t created any courses yet. Create your first course to begin authoring text lessons and MCQ quizzes.
            </p>
            <Link
              to="/instructor/courses/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA] hover:brightness-110 shadow-lg shadow-[#7951C8]/25 transition-all"
            >
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {courses.map((course) => {
              const lessonCount = course.lessons?.[0]?.count || 0;
              const quizCount = course.quizzes?.[0]?.count || 0;
              const isUpdating = updatingCourseId === course.id;

              return (
                <div
                  key={course.id}
                  className="glass-panel border border-[#A0B1DC]/15 rounded-xl p-6 hover:border-[#7951C8]/40 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          course.is_published
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-[#112947] text-[#A5B1CA] border-[#A0B1DC]/20'
                        }`}
                      >
                        {course.is_published ? 'Published' : 'Draft'}
                      </span>
                      <span className="text-[11px] text-[#7483A3] font-mono">
                        Created {new Date(course.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-white truncate tracking-tight">
                      {course.title}
                    </h3>
                    <p className="text-xs text-[#A5B1CA] line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="flex items-center gap-5 text-xs text-[#7483A3] pt-1 font-mono">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-[#2855D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <strong className="text-white font-semibold">{lessonCount}</strong> {lessonCount === 1 ? 'Lesson' : 'Lessons'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-[#7951C8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <strong className="text-white font-semibold">{quizCount}</strong> {quizCount === 1 ? 'Quiz' : 'Quizzes'}
                      </span>
                    </div>
                  </div>

                  {/* Course Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-[#A0B1DC]/10">
                    <Link
                      to={`/instructor/courses/${course.id}/lessons`}
                      className="px-3.5 py-2 rounded-lg bg-[#0A1B35] hover:bg-[#0D203B] text-white text-xs font-semibold border border-[#A0B1DC]/20 hover:border-[#2855D9]/40 transition-all"
                    >
                      Lessons ({lessonCount})
                    </Link>

                    <Link
                      to={`/instructor/courses/${course.id}/quizzes`}
                      className="px-3.5 py-2 rounded-lg bg-[#0A1B35] hover:bg-[#0D203B] text-white text-xs font-semibold border border-[#A0B1DC]/20 hover:border-[#7951C8]/40 transition-all"
                    >
                      Quizzes ({quizCount})
                    </Link>

                    <Link
                      to={`/instructor/courses/${course.id}/edit`}
                      className="px-3 py-2 rounded-lg bg-[#0D203B]/60 hover:bg-[#112947] text-[#A5B1CA] hover:text-white text-xs font-medium border border-[#A0B1DC]/15 transition-all"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleTogglePublish(course)}
                      disabled={isUpdating}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 ${
                        course.is_published
                          ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {course.is_published ? 'Unpublish' : 'Publish'}
                    </button>

                    <button
                      onClick={() => handleDeleteCourse(course)}
                      disabled={isUpdating}
                      className="px-3 py-2 rounded-lg text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/20 hover:border-rose-500/40 text-xs font-medium transition-all disabled:opacity-50"
                      title="Delete Course"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
