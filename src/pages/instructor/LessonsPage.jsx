import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';

export default function LessonsPage() {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form states for creating / editing lesson
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formPosition, setFormPosition] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Fetch course and its lessons
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      // 1. Fetch course details
      const { data: cData, error: cErr } = await supabase
        .from('courses')
        .select('id, title, is_published, instructor_id')
        .eq('id', courseId)
        .single();

      if (cErr) throw cErr;
      setCourse(cData);

      // 2. Fetch lessons ordered by position
      const { data: lData, error: lErr } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('position', { ascending: true });

      if (lErr) throw lErr;
      setLessons(lData || []);
      setFormPosition((lData?.length || 0) + 1);
    } catch (err) {
      setErrorMessage(`Failed to load lessons: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open form for adding a new lesson
  const handleOpenAddForm = () => {
    setEditingLessonId(null);
    setFormTitle('');
    setFormContent('');
    setFormPosition(lessons.length + 1);
    setErrorMessage('');
    setSuccessMessage('');
    setIsFormOpen(true);
  };

  // Open form for editing existing lesson
  const handleOpenEditForm = (lesson) => {
    setEditingLessonId(lesson.id);
    setFormTitle(lesson.title);
    setFormContent(lesson.content || '');
    setFormPosition(lesson.position);
    setErrorMessage('');
    setSuccessMessage('');
    setIsFormOpen(true);
  };

  // Close form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingLessonId(null);
    setFormTitle('');
    setFormContent('');
    setErrorMessage('');
  };

  // Handle lesson submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedTitle = formTitle.trim();
    const trimmedContent = formContent.trim();
    const parsedPos = parseInt(formPosition, 10);

    if (!trimmedTitle) {
      setErrorMessage('Lesson title is required.');
      return;
    }
    if (!trimmedContent) {
      setErrorMessage('Lesson text content is required.');
      return;
    }
    if (isNaN(parsedPos) || parsedPos < 1) {
      setErrorMessage('Position must be a positive integer.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingLessonId) {
        // Update lesson
        const { error } = await supabase
          .from('lessons')
          .update({
            title: trimmedTitle,
            content: trimmedContent,
            position: parsedPos,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingLessonId);

        if (error) throw error;
        setSuccessMessage('Lesson updated successfully.');
      } else {
        // Insert new lesson
        const { error } = await supabase
          .from('lessons')
          .insert({
            course_id: courseId,
            title: trimmedTitle,
            content: trimmedContent,
            position: parsedPos,
          });

        if (error) throw error;
        setSuccessMessage('Lesson added successfully.');
      }

      handleCloseForm();
      await loadData();
    } catch (err) {
      setErrorMessage(`Failed to save lesson: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete lesson
  const handleDeleteLesson = async (lessonId, lessonTitle) => {
    if (!window.confirm(`Are you sure you want to delete lesson "${lessonTitle}"?`)) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;
      setSuccessMessage('Lesson deleted successfully.');
      await loadData();
    } catch (err) {
      setErrorMessage(`Delete failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-9 h-9 border-2 border-[#A0B1DC]/20 border-t-[#7951C8] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs text-[#A5B1CA]">Loading lessons...</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Navigation & Header */}
      <div className="mb-8">
        <Link
          to="/instructor"
          className="text-xs font-semibold text-[#A5B1CA] hover:text-white inline-flex items-center gap-1.5 mb-3 transition-colors"
        >
          ← Back to Instructor Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C04BAA]">
                Lesson Management
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                  course?.is_published
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-[#112947] text-[#A5B1CA] border-[#A0B1DC]/20'
                }`}
              >
                {course?.is_published ? 'Published Course' : 'Draft Course'}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {course?.title || 'Course Lessons'}
            </h1>
          </div>

          <button
            onClick={handleOpenAddForm}
            className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA] hover:brightness-110 shadow-lg shadow-[#7951C8]/25 transition-all self-start sm:self-auto"
          >
            + Add New Lesson
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-200 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0 font-bold mt-0.5">
            !
          </div>
          <div>
            <p className="font-semibold text-rose-100">Error</p>
            <p className="mt-0.5 text-rose-200/90 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 font-bold mt-0.5">
            ✓
          </div>
          <div>
            <p className="font-semibold text-emerald-100">Success</p>
            <p className="mt-0.5 text-emerald-200/90 leading-relaxed">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Add / Edit Lesson Form Modal/Card */}
      {isFormOpen && (
        <div className="mb-8 glass-panel border border-[#7951C8]/40 rounded-2xl p-6 sm:p-7 shadow-xl shadow-[#7951C8]/10">
          <div className="flex items-center justify-between pb-3 mb-5 border-b border-[#A0B1DC]/15">
            <h2 className="font-display text-base font-bold text-white">
              {editingLessonId ? 'Edit Lesson' : 'Add New Lesson'}
            </h2>
            <button
              onClick={handleCloseForm}
              className="text-xs text-[#A5B1CA] hover:text-white transition-colors"
            >
              ✕ Close
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-3">
                <label htmlFor="lesson-title" className="block text-xs font-semibold uppercase tracking-wider text-[#A5B1CA] mb-2">
                  Lesson Title <span className="text-[#E05BBE]">*</span>
                </label>
                <input
                  id="lesson-title"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Setting Up Your Development Environment"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-[#071426] border border-[#A0B1DC]/20 rounded-xl text-white placeholder-[#7483A3] text-sm focus:outline-none focus:border-[#7951C8] focus:ring-1 focus:ring-[#7951C8] transition-all"
                />
              </div>

              <div>
                <label htmlFor="lesson-pos" className="block text-xs font-semibold uppercase tracking-wider text-[#A5B1CA] mb-2">
                  Order / Position <span className="text-[#E05BBE]">*</span>
                </label>
                <input
                  id="lesson-pos"
                  type="number"
                  min={1}
                  value={formPosition}
                  onChange={(e) => setFormPosition(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-[#071426] border border-[#A0B1DC]/20 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-[#7951C8] focus:ring-1 focus:ring-[#7951C8] transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="lesson-content" className="block text-xs font-semibold uppercase tracking-wider text-[#A5B1CA] mb-2">
                Lesson Content (Text-based) <span className="text-[#E05BBE]">*</span>
              </label>
              <textarea
                id="lesson-content"
                rows={8}
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Write the full lesson text, explanation, code snippets, or reading material..."
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-[#071426] border border-[#A0B1DC]/20 rounded-xl text-white placeholder-[#7483A3] text-sm font-mono focus:outline-none focus:border-[#7951C8] focus:ring-1 focus:ring-[#7951C8] transition-all leading-relaxed"
              />
              <p className="text-[11px] text-[#7483A3] mt-1.5 font-mono">
                Supports clear formatted text and code blocks. Video streaming and rich-text are out of scope.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA] hover:brightness-110 shadow-lg shadow-[#7951C8]/25 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : editingLessonId ? 'Update Lesson' : 'Add Lesson'}
              </button>
              <button
                type="button"
                onClick={handleCloseForm}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-lg text-xs font-semibold text-[#A5B1CA] hover:text-white bg-[#0A1B35] hover:bg-[#0D203B] border border-[#A0B1DC]/15 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lesson List */}
      <div className="glass-panel border border-[#A0B1DC]/15 rounded-2xl p-6 sm:p-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#A5B1CA] mb-5">
          Course Curriculum ({lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'})
        </h2>

        {lessons.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#A0B1DC]/20 rounded-xl p-8">
            <p className="text-sm font-medium text-white mb-1">No lessons added yet</p>
            <p className="text-xs text-[#A5B1CA] mb-5">
              Add your first text lesson to start structuring this course curriculum.
            </p>
            <button
              onClick={handleOpenAddForm}
              className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA] hover:brightness-110 shadow-lg shadow-[#7951C8]/25 transition-all"
            >
              + Add First Lesson
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="p-4 bg-[#0A1B35]/70 border border-[#A0B1DC]/15 rounded-xl hover:border-[#7951C8]/40 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2855D9]/20 to-[#7951C8]/30 border border-[#7951C8]/40 text-[#E05BBE] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {lesson.position}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-[#A5B1CA] line-clamp-2 mt-1 whitespace-pre-wrap font-sans leading-relaxed">
                      {lesson.content}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleOpenEditForm(lesson)}
                    className="px-3 py-1.5 bg-[#0D203B] hover:bg-[#112947] text-white border border-[#A0B1DC]/20 text-xs font-medium rounded-lg transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                    className="px-3 py-1.5 text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/20 text-xs font-medium rounded-lg transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
