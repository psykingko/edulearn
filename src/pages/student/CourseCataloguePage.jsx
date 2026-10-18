import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function CourseCataloguePage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadCatalogue = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      // 1. Fetch all published courses
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          instructor_id,
          created_at,
          profiles(full_name),
          lessons(count),
          quizzes(count)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (courseError) throw courseError;

      // 2. Fetch student's existing enrollments
      const { data: enrollmentData, error: enrollError } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', user.id);

      if (enrollError) throw enrollError;

      setCourses(courseData || []);
      const enrolledSet = new Set((enrollmentData || []).map((e) => e.course_id));
      setEnrolledCourseIds(enrolledSet);
    } catch (err) {
      setErrorMessage(`Failed to load course catalogue: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadCatalogue();
  }, [loadCatalogue]);

  // Handle enrollment
  const handleEnroll = async (courseId, courseTitle) => {
    setEnrollingCourseId(courseId);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { error } = await supabase
        .from('enrollments')
        .insert({
          student_id: user.id,
          course_id: courseId,
        });

      if (error) {
        // If already enrolled (PostgreSQL unique violation 23505)
        if (error.code === '23505' || error.message.includes('unique')) {
          setEnrolledCourseIds((prev) => new Set([...prev, courseId]));
          setSuccessMessage(`You are already enrolled in "${courseTitle}".`);
          return;
        }
        throw error;
      }

      setEnrolledCourseIds((prev) => new Set([...prev, courseId]));
      setSuccessMessage(`Successfully enrolled in "${courseTitle}"!`);
    } catch (err) {
      setErrorMessage(`Enrollment failed: ${err.message}`);
    } finally {
      setEnrollingCourseId(null);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[rgba(160,177,220,0.14)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] shadow-[0_0_8px_rgba(56,189,248,0.5)]"></span>
            <span className="text-xs uppercase font-bold tracking-wider text-[#60A5FA] font-mono">
              Course Catalogue
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#F3F5FF] tracking-tight">
            Explore Published Courses
          </h1>
          <p className="text-xs text-[#A5B1CA] mt-0.5">
            Discover courses published by verified instructors and enroll to start learning.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/student"
            className="px-3.5 py-1.5 bg-[#0D203B] hover:bg-[#112947] text-[#F3F5FF] border border-[rgba(160,177,220,0.2)] text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            ← My Dashboard
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-950/60 border border-rose-500/40 rounded-lg text-xs text-rose-200 space-y-1">
          <p className="font-semibold text-rose-300">Error</p>
          <p>{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-xs text-emerald-200 space-y-1">
          <p className="font-semibold text-emerald-300">Success</p>
          <p>{successMessage}</p>
        </div>
      )}

      {/* Catalogue Grid */}
      {isLoading ? (
        <div className="py-20 text-center glass-panel rounded-xl">
          <div className="w-8 h-8 border-3 border-[rgba(160,177,220,0.2)] border-t-[#60A5FA] rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-[#A5B1CA]">Loading published courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="glass-panel border-2 border-dashed border-[rgba(160,177,220,0.18)] rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-[#2855D9]/20 text-[#60A5FA] border border-[#2855D9]/30 font-bold text-lg flex items-center justify-center mx-auto mb-3">
            📚
          </div>
          <h3 className="font-heading text-sm font-bold text-[#F3F5FF] mb-1">No Published Courses Yet</h3>
          <p className="text-xs text-[#7483A3] max-w-md mx-auto mb-4 leading-relaxed">
            Instructors have not published any courses yet. Once a course is published, it will appear here for student enrollment.
          </p>
          <Link
            to="/student"
            className="px-4 py-2 bg-gradient-to-r from-[#2855D9] to-[#7951C8] text-white text-xs font-semibold rounded-lg shadow-xs hover:brightness-110 transition-all inline-block"
          >
            Return to Dashboard
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const isEnrolled = enrolledCourseIds.has(course.id);
            const isEnrolling = enrollingCourseId === course.id;
            const lessonCount = course.lessons?.[0]?.count || 0;
            const quizCount = course.quizzes?.[0]?.count || 0;
            const instructorName = course.profiles?.full_name || 'Verified Instructor';

            return (
              <div
                key={course.id}
                className="glass-panel rounded-xl p-6 shadow-sm flex flex-col justify-between hover:border-[#60A5FA]/40 transition-all duration-300 relative group overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#2855D9] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-[#7483A3]">
                      Instructor: <strong className="text-[#A5B1CA]">{instructorName}</strong>
                    </span>
                    {isEnrolled && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_rgba(52,211,153,0.2)]">
                        Enrolled
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading text-base font-bold text-[#F3F5FF] tracking-tight line-clamp-1 group-hover:text-[#60A5FA] transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-xs text-[#A5B1CA] line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-[#7483A3] pt-2 border-t border-[rgba(160,177,220,0.1)]">
                    <span>📖 {lessonCount} {lessonCount === 1 ? 'Lesson' : 'Lessons'}</span>
                    <span>📝 {quizCount} {quizCount === 1 ? 'Quiz' : 'Quizzes'}</span>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-[rgba(160,177,220,0.1)] flex items-center justify-between gap-2">
                  <Link
                    to={`/student/courses/${course.id}`}
                    className="text-xs font-semibold text-[#A5B1CA] hover:text-[#F3F5FF] transition-colors"
                  >
                    View Details
                  </Link>

                  {isEnrolled ? (
                    <Link
                      to={`/student/courses/${course.id}`}
                      className="px-4 py-2 bg-gradient-to-r from-[#2855D9] to-[#7951C8] hover:brightness-110 text-white text-xs font-semibold rounded-lg shadow-[0_0_15px_rgba(40,85,217,0.35)] transition-all"
                    >
                      Continue Learning →
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id, course.title)}
                      disabled={isEnrolling}
                      className="px-4 py-2 bg-[#2855D9] hover:bg-[#3B82F6] text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-60 cursor-pointer"
                    >
                      {isEnrolling ? 'Enrolling...' : 'Enroll in Course'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
