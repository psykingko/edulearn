import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function CourseDetailsPage() {
  const { courseId } = useParams();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [lessonProgressMap, setLessonProgressMap] = useState({});
  const [quizAttemptsMap, setQuizAttemptsMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadCourseData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      // 1. Fetch course details
      const { data: cData, error: cErr } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          instructor_id,
          is_published,
          created_at,
          profiles(full_name)
        `)
        .eq('id', courseId)
        .single();

      if (cErr) throw cErr;
      setCourse(cData);

      // 2. Check if student is enrolled
      const { data: eData, error: eErr } = await supabase
        .from('enrollments')
        .select('id, enrolled_at')
        .eq('student_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (eErr) throw eErr;
      const enrolled = Boolean(eData);
      setIsEnrolled(enrolled);

      // 3. Fetch lessons for this course
      const { data: lData, error: lErr } = await supabase
        .from('lessons')
        .select('id, title, position')
        .eq('course_id', courseId)
        .order('position', { ascending: true });

      if (lErr) throw lErr;
      setLessons(lData || []);

      // 4. Fetch quizzes for this course
      const { data: qData, error: qErr } = await supabase
        .from('quizzes')
        .select('id, title, created_at')
        .eq('course_id', courseId)
        .order('created_at', { ascending: true });

      if (qErr) throw qErr;
      setQuizzes(qData || []);

      // 5. If enrolled, fetch lesson progress and quiz attempts
      if (enrolled && lData && lData.length > 0) {
        const lessonIds = lData.map((l) => l.id);
        const { data: pData, error: pErr } = await supabase
          .from('lesson_progress')
          .select('lesson_id, is_completed')
          .eq('student_id', user.id)
          .in('lesson_id', lessonIds);

        if (!pErr && pData) {
          const progMap = {};
          pData.forEach((p) => {
            progMap[p.lesson_id] = p.is_completed;
          });
          setLessonProgressMap(progMap);
        }
      }

      if (enrolled && qData && qData.length > 0) {
        const quizIds = qData.map((q) => q.id);
        const { data: aData, error: aErr } = await supabase
          .from('quiz_attempts')
          .select('quiz_id, score, submitted_at')
          .eq('student_id', user.id)
          .in('quiz_id', quizIds)
          .order('submitted_at', { ascending: false });

        if (!aErr && aData) {
          const attMap = {};
          aData.forEach((a) => {
            if (!attMap[a.quiz_id]) {
              attMap[a.quiz_id] = a; // latest attempt
            }
          });
          setQuizAttemptsMap(attMap);
        }
      }
    } catch (err) {
      setErrorMessage(`Failed to load course details: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, user.id]);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  // Handle enrollment
  const handleEnroll = async () => {
    setIsEnrolling(true);
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
        if (error.code === '23505') {
          setIsEnrolled(true);
          setSuccessMessage('You are already enrolled.');
          return;
        }
        throw error;
      }

      setIsEnrolled(true);
      setSuccessMessage('Successfully enrolled! You now have access to lessons and quizzes.');
      await loadCourseData();
    } catch (err) {
      setErrorMessage(`Enrollment failed: ${err.message}`);
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-3 border-[rgba(160,177,220,0.2)] border-t-[#60A5FA] rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-[#A5B1CA]">Loading course syllabus and progress...</p>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="glass-panel rounded-2xl p-8 border border-[rgba(160,177,220,0.18)] space-y-4">
          <h2 className="font-heading text-xl font-bold text-[#F3F5FF] mb-2">Course Not Found</h2>
          <p className="text-xs text-[#A5B1CA] mb-6">
            The requested course does not exist or has not been published yet.
          </p>
          <Link
            to="/student/courses"
            className="px-4 py-2 bg-gradient-to-r from-[#2855D9] to-[#7951C8] text-white text-xs font-semibold rounded-lg hover:brightness-110 transition-all inline-block shadow-xs"
          >
            ← Browse Available Courses
          </Link>
        </div>
      </main>
    );
  }

  // Calculate progress
  const totalLessons = lessons.length;
  const completedCount = lessons.filter((l) => lessonProgressMap[l.id]).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          to="/student/courses"
          className="text-xs font-semibold text-[#A5B1CA] hover:text-[#F3F5FF] inline-flex items-center gap-1 mb-4 transition-colors"
        >
          ← Back to Course Catalogue
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#60A5FA] font-mono">
                Course Syllabus &amp; Learning Flow
              </span>
              {isEnrolled && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_rgba(52,211,153,0.2)]">
                  Enrolled
                </span>
              )}
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#F3F5FF] tracking-tight">
              {course.title}
            </h1>
            <p className="text-xs text-[#7483A3] mt-1">
              Instructor: <strong className="text-[#A5B1CA]">{course.profiles?.full_name || 'Verified Instructor'}</strong>
            </p>
          </div>

          {!isEnrolled && (
            <button
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="px-5 py-2.5 bg-gradient-to-r from-[#2855D9] to-[#7951C8] hover:brightness-110 text-white text-xs font-semibold rounded-lg shadow-[0_0_15px_rgba(40,85,217,0.35)] transition-all self-start shrink-0 disabled:opacity-60 cursor-pointer"
            >
              {isEnrolling ? 'Enrolling...' : 'Enroll in this Course'}
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 bg-rose-950/60 border border-rose-500/40 rounded-lg text-xs text-rose-200 space-y-1">
          <p className="font-semibold text-rose-300">Error</p>
          <p>{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-xs text-emerald-200 space-y-1">
          <p className="font-semibold text-emerald-300">Success</p>
          <p>{successMessage}</p>
        </div>
      )}

      {/* Course Overview Card */}
      <div className="glass-panel-elevated rounded-xl p-6 shadow-sm space-y-4 border border-[rgba(160,177,220,0.18)]">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#7483A3] font-mono">
          Course Description
        </h2>
        <p className="text-sm text-[#A5B1CA] leading-relaxed whitespace-pre-wrap font-sans">
          {course.description}
        </p>

        {/* Progress Bar (if enrolled) */}
        {isEnrolled && (
          <div className="pt-4 border-t border-[rgba(160,177,220,0.1)] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#F3F5FF]">Your Learning Progress</span>
              <span className="font-bold text-[#38BDF8] font-mono">
                {completedCount} of {totalLessons} lessons ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-[#071426] h-2 rounded-full overflow-hidden border border-[rgba(160,177,220,0.1)]">
              <div
                className="bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#34D399] h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Lessons Curriculum List */}
      <div className="glass-panel rounded-xl p-6 shadow-sm border border-[rgba(160,177,220,0.16)] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#A5B1CA] font-heading">
            Course Lessons ({lessons.length})
          </h2>
          {!isEnrolled && (
            <span className="text-[11px] text-[#7483A3]">Enroll to access lesson reading material</span>
          )}
        </div>

        {lessons.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#7483A3]">
            No lessons published in this course yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {lessons.map((lesson) => {
              const isCompleted = Boolean(lessonProgressMap[lesson.id]);

              return (
                <div
                  key={lesson.id}
                  className="p-3.5 bg-[#071426]/70 border border-[rgba(160,177,220,0.12)] rounded-lg flex items-center justify-between gap-3 hover:border-[#60A5FA]/40 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                          : 'bg-[#112947] text-[#A5B1CA] border border-[rgba(160,177,220,0.2)]'
                      }`}
                    >
                      {isCompleted ? '✓' : lesson.position}
                    </span>
                    <span className="text-xs font-bold text-[#F3F5FF] truncate">
                      {lesson.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isEnrolled ? (
                      <Link
                        to={`/student/courses/${courseId}/lessons/${lesson.id}`}
                        className="px-3 py-1.5 bg-[#112947] hover:bg-[#163252] text-[#F3F5FF] text-xs font-semibold rounded-lg border border-[rgba(160,177,220,0.2)] transition-colors"
                      >
                        {isCompleted ? 'Review Lesson' : 'Read Lesson →'}
                      </Link>
                    ) : (
                      <span className="text-[11px] text-[#7483A3] px-2 font-mono">Locked</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quizzes List */}
      <div className="glass-panel rounded-xl p-6 shadow-sm border border-[rgba(160,177,220,0.16)] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#A5B1CA] font-heading">
            Multiple-Choice Quizzes ({quizzes.length})
          </h2>
          {!isEnrolled && (
            <span className="text-[11px] text-[#7483A3]">Enroll to attempt quizzes</span>
          )}
        </div>

        {quizzes.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#7483A3]">
            No quizzes authored for this course yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {quizzes.map((quiz) => {
              const attempt = quizAttemptsMap[quiz.id];

              return (
                <div
                  key={quiz.id}
                  className="p-3.5 bg-[#071426]/70 border border-[rgba(160,177,220,0.12)] rounded-lg flex items-center justify-between gap-3 hover:border-[#C084FC]/40 transition-colors"
                >
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-[#F3F5FF] truncate">
                      {quiz.title}
                    </h3>
                    {attempt && (
                      <p className="text-[11px] text-emerald-400 font-medium">
                        Latest Score: <strong>{attempt.score}%</strong> (Submitted{' '}
                        {new Date(attempt.submitted_at).toLocaleDateString()})
                      </p>
                    )}
                  </div>

                  <div className="shrink-0">
                    {isEnrolled ? (
                      <Link
                        to={`/student/courses/${courseId}/quizzes/${quiz.id}`}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-[#7951C8] to-[#C04BAA] hover:brightness-110 text-white text-xs font-semibold rounded-lg shadow-[0_0_12px_rgba(121,81,200,0.35)] transition-all"
                      >
                        {attempt ? 'Retake Quiz' : 'Take Quiz →'}
                      </Link>
                    ) : (
                      <span className="text-[11px] text-[#7483A3] px-2 font-mono">Locked</span>
                    )}
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
