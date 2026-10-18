import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function CourseFormPage({ isEditing = false }) {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch course details if editing
  useEffect(() => {
    if (!isEditing || !courseId) return;

    let isMounted = true;
    async function fetchCourse() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const { data, error } = await supabase
          .from('courses')
          .select('id, instructor_id, title, description, is_published')
          .eq('id', courseId)
          .single();

        if (!isMounted) return;

        if (error) {
          setErrorMessage(`Failed to load course: ${error.message}`);
        } else if (data) {
          setTitle(data.title || '');
          setDescription(data.description || '');
          setIsPublished(data.is_published || false);
        }
      } catch (err) {
        if (isMounted) setErrorMessage(err.message || 'Error loading course details.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchCourse();
    return () => {
      isMounted = false;
    };
  }, [isEditing, courseId]);

  const handleSubmit = async (e, publishOverride = null) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();

    if (!trimmedTitle) {
      setErrorMessage('Course title is required.');
      return;
    }
    if (trimmedTitle.length < 3) {
      setErrorMessage('Course title must be at least 3 characters.');
      return;
    }
    if (!trimmedDesc) {
      setErrorMessage('Course description is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing) {
        // Update existing course
        const updatePayload = {
          title: trimmedTitle,
          description: trimmedDesc,
          updated_at: new Date().toISOString(),
        };

        if (publishOverride !== null) {
          updatePayload.is_published = publishOverride;
        }

        const { data, error } = await supabase
          .from('courses')
          .update(updatePayload)
          .eq('id', courseId)
          .select()
          .single();

        if (error) {
          setErrorMessage(`Save failed: ${error.message}`);
        } else {
          setIsPublished(data.is_published);
          setSuccessMessage('Course updated successfully.');
          setTimeout(() => navigate('/instructor'), 1200);
        }
      } else {
        // Create new course
        const shouldPublish = publishOverride !== null ? publishOverride : false;
        const { data, error } = await supabase
          .from('courses')
          .insert({
            instructor_id: user.id,
            title: trimmedTitle,
            description: trimmedDesc,
            is_published: shouldPublish,
          })
          .select()
          .single();

        if (error) {
          setErrorMessage(`Creation failed: ${error.message}`);
        } else {
          setSuccessMessage(`Course created successfully as ${shouldPublish ? 'Published' : 'Draft'}.`);
          setTimeout(() => navigate(`/instructor/courses/${data.id}/lessons`), 1200);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async () => {
    const nextState = !isPublished;
    const confirmText = nextState
      ? 'Are you sure you want to publish this course? It will become visible to students.'
      : 'Are you sure you want to unpublish this course? Students will no longer see it in the catalog.';

    if (!window.confirm(confirmText)) return;

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { data, error } = await supabase
        .from('courses')
        .update({ is_published: nextState, updated_at: new Date().toISOString() })
        .eq('id', courseId)
        .select()
        .single();

      if (error) {
        setErrorMessage(`Failed to change publication status: ${error.message}`);
      } else {
        setIsPublished(data.is_published);
        setSuccessMessage(`Course successfully ${data.is_published ? 'published' : 'unpublished'}.`);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error updating course status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-9 h-9 border-2 border-[#A0B1DC]/20 border-t-[#7951C8] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs text-[#A5B1CA]">Loading course details...</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            to="/instructor"
            className="text-xs font-semibold text-[#A5B1CA] hover:text-white inline-flex items-center gap-1.5 mb-3 transition-colors"
          >
            ← Back to Instructor Dashboard
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {isEditing ? 'Edit Course' : 'Create New Course'}
          </h1>
          <p className="text-xs sm:text-sm text-[#A5B1CA] mt-1">
            {isEditing
              ? 'Update course metadata and manage publication visibility across EduLearn.'
              : 'Add course title and description. You can add modular lessons and quizzes next.'}
          </p>
        </div>

        {isEditing && (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
              isPublished
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-[#112947] text-[#A5B1CA] border-[#A0B1DC]/20'
            }`}
          >
            {isPublished ? 'Published' : 'Draft'}
          </span>
        )}
      </div>

      <div className="glass-panel border border-[#A0B1DC]/15 rounded-2xl p-6 sm:p-8">
        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-200 flex items-start gap-3">
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

        <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
          <div>
            <label htmlFor="course-title" className="block text-xs font-semibold uppercase tracking-wider text-[#A5B1CA] mb-2">
              Course Title <span className="text-[#E05BBE]">*</span>
            </label>
            <input
              id="course-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Modern Full-Stack Web Development"
              maxLength={120}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-[#071426] border border-[#A0B1DC]/20 rounded-xl text-white placeholder-[#7483A3] text-sm focus:outline-none focus:border-[#7951C8] focus:ring-1 focus:ring-[#7951C8] transition-all"
            />
            <p className="text-[11px] text-[#7483A3] mt-1.5 font-mono">Concise and descriptive title (max 120 chars).</p>
          </div>

          <div>
            <label htmlFor="course-desc" className="block text-xs font-semibold uppercase tracking-wider text-[#A5B1CA] mb-2">
              Course Description <span className="text-[#E05BBE]">*</span>
            </label>
            <textarea
              id="course-desc"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide an overview of the curriculum, prerequisites, and learning objectives..."
              maxLength={1000}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-[#071426] border border-[#A0B1DC]/20 rounded-xl text-white placeholder-[#7483A3] text-sm focus:outline-none focus:border-[#7951C8] focus:ring-1 focus:ring-[#7951C8] transition-all leading-relaxed"
            />
            <div className="flex justify-between text-[11px] text-[#7483A3] mt-1.5 font-mono">
              <span>Required overview text.</span>
              <span>{description.length}/1000 characters</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-[#A0B1DC]/15 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA] hover:brightness-110 shadow-lg shadow-[#7951C8]/25 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Save as Draft'}
              </button>

              {!isEditing && (
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#0D203B] hover:bg-[#112947] border border-[#A0B1DC]/25 hover:border-[#2855D9]/40 transition-all disabled:opacity-50"
                >
                  Save & Publish
                </button>
              )}

              <Link
                to="/instructor"
                className="px-4 py-2.5 rounded-lg text-xs font-semibold text-[#A5B1CA] hover:text-white bg-[#0A1B35] hover:bg-[#0D203B] border border-[#A0B1DC]/15 transition-all"
              >
                Cancel
              </Link>
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={handleTogglePublish}
                disabled={isSubmitting}
                className={`px-4 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                  isPublished
                    ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {isPublished ? 'Unpublish Course' : 'Publish Course'}
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
