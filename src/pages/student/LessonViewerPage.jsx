import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function LessonViewerPage() {
  const { courseId, lessonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadLessonData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      // 1. Fetch course details
      const { data: cData, error: cErr } = await supabase
        .from('courses')
        .select('id, title, is_published')
        .eq('id', courseId)
        .single();

      if (cErr) throw cErr;
      setCourse(cData);

      // 2. Fetch all lessons in this course (for order & navigation)
      const { data: lData, error: lErr } = await supabase
        .from('lessons')
        .select('id, title, position')
        .eq('course_id', courseId)
        .order('position', { ascending: true });

      if (lErr) throw lErr;
      setAllLessons(lData || []);

      // 3. Fetch the specific current lesson content
      const { data: activeLesson, error: activeErr } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (activeErr) throw activeErr;
      setCurrentLesson(activeLesson);

      // 4. Fetch student's progress for this lesson
      const { data: pData, error: pErr } = await supabase
        .from('lesson_progress')
        .select('id, is_completed')
        .eq('student_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (pErr) throw pErr;
      setIsCompleted(Boolean(pData?.is_completed));
    } catch (err) {
      setErrorMessage(`Failed to load lesson: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, lessonId, user.id]);

  useEffect(() => {
    loadLessonData();
  }, [loadLessonData]);

  // Toggle completion
  const handleToggleCompletion = async () => {
    setIsUpdatingProgress(true);
    setErrorMessage('');
    setSuccessMessage('');

    const nextState = !isCompleted;
    const completedAt = nextState ? new Date().toISOString() : null;

    try {
      // Check if progress row already exists
      const { data: existing, error: checkErr } = await supabase
        .from('lesson_progress')
        .select('id')
        .eq('student_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (checkErr) throw checkErr;

      if (existing) {
        // Update existing row
        const { error: updErr } = await supabase
          .from('lesson_progress')
          .update({
            is_completed: nextState,
            completed_at: completedAt,
          })
          .eq('id', existing.id);

        if (updErr) throw updErr;
      } else {
        // Insert new progress row
        const { error: insErr } = await supabase
          .from('lesson_progress')
          .insert({
            student_id: user.id,
            lesson_id: lessonId,
            is_completed: nextState,
            completed_at: completedAt,
          });

        if (insErr) throw insErr;
      }

      setIsCompleted(nextState);
      setSuccessMessage(
        nextState ? 'Lesson marked as completed! Progress updated.' : 'Lesson marked as incomplete.'
      );
    } catch (err) {
      setErrorMessage(`Failed to update progress: ${err.message}`);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-3 border-[rgba(160,177,220,0.2)] border-t-[#60A5FA] rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-[#A5B1CA]">Loading lesson content...</p>
      </main>
    );
  }

  if (!currentLesson) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="glass-panel rounded-2xl p-8 border border-[rgba(160,177,220,0.18)] space-y-4">
          <h2 className="font-heading text-xl font-bold text-[#F3F5FF] mb-2">Lesson Not Found</h2>
          <p className="text-xs text-[#A5B1CA] mb-6">
            The requested lesson does not exist or you are not enrolled in this course.
          </p>
          <Link
            to={`/student/courses/${courseId}`}
            className="px-4 py-2 bg-gradient-to-r from-[#2855D9] to-[#7951C8] text-white text-xs font-semibold rounded-lg hover:brightness-110 transition-all inline-block shadow-xs"
          >
            ← Return to Course Overview
          </Link>
        </div>
      </main>
    );
  }

  // Calculate previous and next lessons
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb Navigation */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(160,177,220,0.14)]">
        <div>
          <Link
            to={`/student/courses/${courseId}`}
            className="text-xs font-semibold text-[#A5B1CA] hover:text-[#F3F5FF] inline-flex items-center gap-1 mb-1 transition-colors"
          >
            ← {course?.title || 'Back to Course'}
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#60A5FA] font-mono">
              Lesson {currentLesson.position} of {allLessons.length}
            </span>
            {isCompleted && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_rgba(52,211,153,0.2)]">
                ✓ Completed
              </span>
            )}
          </div>
        </div>

        {/* Completion Toggle Button */}
        <div>
          <button
            onClick={handleToggleCompletion}
            disabled={isUpdatingProgress}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border shadow-xs transition-all disabled:opacity-60 cursor-pointer ${
              isCompleted
                ? 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(52,211,153,0.2)]'
                : 'bg-gradient-to-r from-[#2855D9] to-[#7951C8] hover:brightness-110 text-white border-transparent shadow-[0_0_15px_rgba(40,85,217,0.35)]'
            }`}
          >
            {isUpdatingProgress
              ? 'Saving...'
              : isCompleted
              ? '✓ Completed (Click to Unmark)'
              : 'Mark as Complete'}
          </button>
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
          <p className="font-semibold text-emerald-300">Progress Updated</p>
          <p>{successMessage}</p>
        </div>
      )}

      {/* Lesson Content Body */}
      <article className="glass-panel-elevated rounded-2xl p-6 sm:p-10 shadow-[0_0_35px_rgba(7,20,38,0.7)] border border-[rgba(160,177,220,0.18)] mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA]"></div>

        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#F3F5FF] tracking-tight mb-6">
          {currentLesson.title}
        </h1>

        <div className="text-[#F3F5FF] text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans space-y-4">
          {currentLesson.content}
        </div>
      </article>

      {/* Bottom Pagination & Navigation Footer */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-[rgba(160,177,220,0.14)]">
        <div>
          {prevLesson ? (
            <button
              onClick={() => navigate(`/student/courses/${courseId}/lessons/${prevLesson.id}`)}
              className="px-4 py-2 bg-[#0D203B] hover:bg-[#112947] text-[#F3F5FF] text-xs font-semibold rounded-lg border border-[rgba(160,177,220,0.2)] shadow-xs transition-colors cursor-pointer"
            >
              ← Previous: {prevLesson.title}
            </button>
          ) : (
            <span className="text-xs text-[#7483A3]">First lesson</span>
          )}
        </div>

        <div>
          {nextLesson ? (
            <button
              onClick={() => navigate(`/student/courses/${courseId}/lessons/${nextLesson.id}`)}
              className="px-4 py-2 bg-gradient-to-r from-[#2855D9] to-[#7951C8] hover:brightness-110 text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
            >
              Next: {nextLesson.title} →
            </button>
          ) : (
            <Link
              to={`/student/courses/${courseId}`}
              className="px-4 py-2 bg-gradient-to-r from-[#059669] to-[#10B981] hover:brightness-110 text-white text-xs font-semibold rounded-lg shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all"
            >
              Finish Syllabus (Back to Course) →
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
