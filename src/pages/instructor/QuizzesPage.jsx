import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';

export default function QuizzesPage() {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Quiz creation modal/state
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Question creation/form state
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [qText, setQText] = useState('');
  const [qPosition, setQPosition] = useState(1);
  const [options, setOptions] = useState(['', '']);
  const [correctOptionIdx, setCorrectOptionIdx] = useState(0);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);

  // Load course and its quizzes
  const loadCourseAndQuizzes = useCallback(async () => {
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

      // 2. Fetch quizzes
      const { data: qData, error: qErr } = await supabase
        .from('quizzes')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: true });

      if (qErr) throw qErr;
      setQuizzes(qData || []);

      if (qData && qData.length > 0 && !activeQuizId) {
        setActiveQuizId(qData[0].id);
      }
    } catch (err) {
      setErrorMessage(`Failed to load course quizzes: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, activeQuizId]);

  useEffect(() => {
    loadCourseAndQuizzes();
  }, [loadCourseAndQuizzes]);

  // Load questions, options, and answer keys for active quiz
  const loadQuizQuestions = useCallback(async (quizId) => {
    if (!quizId) {
      setQuestions([]);
      return;
    }

    try {
      // 1. Fetch questions
      const { data: qData, error: qErr } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('position', { ascending: true });

      if (qErr) throw qErr;

      if (!qData || qData.length === 0) {
        setQuestions([]);
        setQPosition(1);
        return;
      }

      const qIds = qData.map((q) => q.id);

      // 2. Fetch options for these questions
      const { data: optData, error: optErr } = await supabase
        .from('quiz_options')
        .select('*')
        .in('question_id', qIds)
        .order('position', { ascending: true });

      if (optErr) throw optErr;

      // 3. Fetch answer keys for these questions (instructor is authorized to read)
      const { data: akData, error: akErr } = await supabase
        .from('quiz_answer_keys')
        .select('*')
        .in('question_id', qIds);

      if (akErr) throw akErr;

      // Combine questions with their options and correct option ID
      const fullQuestions = qData.map((question) => {
        const questionOptions = (optData || []).filter((opt) => opt.question_id === question.id);
        const answerKey = (akData || []).find((ak) => ak.question_id === question.id);
        return {
          ...question,
          options: questionOptions,
          correct_option_id: answerKey?.correct_option_id || null,
        };
      });

      setQuestions(fullQuestions);
      setQPosition(fullQuestions.length + 1);
    } catch (err) {
      setErrorMessage(`Failed to load quiz questions: ${err.message}`);
    }
  }, []);

  useEffect(() => {
    if (activeQuizId) {
      loadQuizQuestions(activeQuizId);
    }
  }, [activeQuizId, loadQuizQuestions]);

  // Create new quiz
  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    const trimmedTitle = quizTitle.trim();
    if (!trimmedTitle) {
      setErrorMessage('Quiz title cannot be empty.');
      return;
    }

    setIsSubmittingQuiz(true);
    setErrorMessage('');
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .insert({
          course_id: courseId,
          title: trimmedTitle,
        })
        .select()
        .single();

      if (error) throw error;
      setSuccessMessage('Quiz created successfully.');
      setIsQuizModalOpen(false);
      setQuizTitle('');
      setActiveQuizId(data.id);
      await loadCourseAndQuizzes();
    } catch (err) {
      setErrorMessage(`Failed to create quiz: ${err.message}`);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // Delete quiz
  const handleDeleteQuiz = async (quizId, title) => {
    if (!window.confirm(`Are you sure you want to delete quiz "${title}" and all its questions?`)) {
      return;
    }

    setErrorMessage('');
    try {
      const { error } = await supabase.from('quizzes').delete().eq('id', quizId);
      if (error) throw error;

      setSuccessMessage('Quiz deleted successfully.');
      setActiveQuizId(null);
      await loadCourseAndQuizzes();
    } catch (err) {
      setErrorMessage(`Failed to delete quiz: ${err.message}`);
    }
  };

  // Option input handlers
  const handleOptionChange = (idx, value) => {
    const updated = [...options];
    updated[idx] = value;
    setOptions(updated);
  };

  const handleAddOptionField = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOptionField = (idx) => {
    if (options.length <= 2) return;
    const updated = options.filter((_, i) => i !== idx);
    setOptions(updated);
    if (correctOptionIdx >= updated.length) {
      setCorrectOptionIdx(0);
    }
  };

  // Create question with options and answer key
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedQuestion = qText.trim();
    if (!trimmedQuestion) {
      setErrorMessage('Question text is required.');
      return;
    }

    // Validate options
    const cleanedOptions = options.map((opt) => opt.trim());
    if (cleanedOptions.some((opt) => !opt)) {
      setErrorMessage('All answer options must have non-empty text.');
      return;
    }
    if (cleanedOptions.length < 2) {
      setErrorMessage('A minimum of two options is required.');
      return;
    }
    if (correctOptionIdx < 0 || correctOptionIdx >= cleanedOptions.length) {
      setErrorMessage('Please select one valid correct option.');
      return;
    }

    setIsSubmittingQuestion(true);
    let createdQuestionId = null;

    try {
      // 1. Insert question into quiz_questions
      const { data: qData, error: qErr } = await supabase
        .from('quiz_questions')
        .insert({
          quiz_id: activeQuizId,
          question_text: trimmedQuestion,
          position: parseInt(qPosition, 10) || 1,
        })
        .select()
        .single();

      if (qErr) throw qErr;
      createdQuestionId = qData.id;

      // 2. Insert options into quiz_options
      const optionsToInsert = cleanedOptions.map((optText, idx) => ({
        question_id: createdQuestionId,
        option_text: optText,
        position: idx + 1,
      }));

      const { data: optData, error: optErr } = await supabase
        .from('quiz_options')
        .insert(optionsToInsert)
        .select();

      if (optErr) throw optErr;

      // 3. Identify selected correct option and insert into quiz_answer_keys
      const correctOption = optData.find((opt) => opt.position === correctOptionIdx + 1);
      if (!correctOption) {
        throw new Error('Failed to resolve selected correct option ID.');
      }

      const { error: akErr } = await supabase
        .from('quiz_answer_keys')
        .insert({
          question_id: createdQuestionId,
          correct_option_id: correctOption.id,
        });

      if (akErr) throw akErr;

      setSuccessMessage('Question and protected answer key saved successfully.');
      setIsQuestionFormOpen(false);
      setQText('');
      setOptions(['', '']);
      setCorrectOptionIdx(0);
      await loadQuizQuestions(activeQuizId);
    } catch (err) {
      // Rollback question if options or answer key failed
      if (createdQuestionId) {
        await supabase.from('quiz_questions').delete().eq('id', createdQuestionId);
      }
      setErrorMessage(`Failed to save question: ${err.message}`);
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  // Delete individual question
  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this question and its answer options?')) return;

    try {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;
      setSuccessMessage('Question removed.');
      await loadQuizQuestions(activeQuizId);
    } catch (err) {
      setErrorMessage(`Delete question failed: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-9 h-9 border-2 border-[#A0B1DC]/20 border-t-[#7951C8] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs text-[#A5B1CA]">Loading quizzes...</p>
      </main>
    );
  }

  const activeQuiz = quizzes.find((q) => q.id === activeQuizId);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Header & Breadcrumb */}
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
                Quiz Management
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
              {course?.title} — Quizzes
            </h1>
          </div>

          <button
            onClick={() => setIsQuizModalOpen(true)}
            className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA] hover:brightness-110 shadow-lg shadow-[#7951C8]/25 transition-all self-start sm:self-auto"
          >
            + Create New Quiz
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

      {/* Quiz Modal */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 bg-[#071426]/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-panel border border-[#7951C8]/40 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl shadow-[#7951C8]/20">
            <h2 className="font-display text-lg font-bold text-white mb-1.5">Create Quiz</h2>
            <p className="text-xs text-[#A5B1CA] mb-5 leading-relaxed">
              Enter a descriptive title for this multiple-choice knowledge check.
            </p>
            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div>
                <label htmlFor="quiz-title-input" className="block text-xs font-semibold uppercase tracking-wider text-[#A5B1CA] mb-2">
                  Quiz Title <span className="text-[#E05BBE]">*</span>
                </label>
                <input
                  id="quiz-title-input"
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="e.g. Module 1 Comprehensive Knowledge Check"
                  className="w-full px-4 py-2.5 bg-[#071426] border border-[#A0B1DC]/20 rounded-xl text-white placeholder-[#7483A3] text-sm focus:outline-none focus:border-[#7951C8] focus:ring-1 focus:ring-[#7951C8] transition-all"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-[#A0B1DC]/10">
                <button
                  type="button"
                  onClick={() => setIsQuizModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#A5B1CA] hover:text-white bg-[#0A1B35] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuiz}
                  className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA] hover:brightness-110 shadow-lg shadow-[#7951C8]/25 transition-all disabled:opacity-50"
                >
                  {isSubmittingQuiz ? 'Creating...' : 'Create Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Quizzes & Questions Layout */}
      {quizzes.length === 0 ? (
        <div className="glass-panel border border-dashed border-[#A0B1DC]/25 rounded-2xl p-12 text-center">
          <p className="font-display text-base font-semibold text-white mb-2">No quizzes authoring started</p>
          <p className="text-xs text-[#A5B1CA] max-w-md mx-auto mb-6 leading-relaxed">
            Quizzes provide multiple-choice evaluation with server-side protected answer keys and immediate student feedback.
          </p>
          <button
            onClick={() => setIsQuizModalOpen(true)}
            className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA] hover:brightness-110 shadow-lg shadow-[#7951C8]/25 transition-all"
          >
            + Create First Quiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quiz Selector Sidebar */}
          <div className="glass-panel border border-[#A0B1DC]/15 rounded-2xl p-5 h-fit space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#A5B1CA]">
              Course Quizzes ({quizzes.length})
            </h2>
            <div className="space-y-2">
              {quizzes.map((quiz) => (
                <button
                  key={quiz.id}
                  onClick={() => setActiveQuizId(quiz.id)}
                  className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-center justify-between ${
                    quiz.id === activeQuizId
                      ? 'bg-gradient-to-r from-[#2855D9]/20 to-[#7951C8]/20 border border-[#7951C8]/40 text-white font-semibold'
                      : 'hover:bg-[#0A1B35] text-[#A5B1CA] hover:text-white border border-transparent'
                  }`}
                >
                  <span className="truncate">{quiz.title}</span>
                  {quiz.id === activeQuizId && (
                    <span className="w-2 h-2 rounded-full bg-[#E05BBE] shrink-0 animate-pulse"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Active Quiz Content & Questions */}
          <div className="md:col-span-2 space-y-6">
            {activeQuiz ? (
              <div className="glass-panel border border-[#A0B1DC]/15 rounded-2xl p-6 sm:p-8">
                {/* Active Quiz Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-[#A0B1DC]/15">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#7483A3]">Selected Quiz</span>
                    <h2 className="font-display text-xl font-bold text-white mt-0.5">{activeQuiz.title}</h2>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setIsQuestionFormOpen(true)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA] hover:brightness-110 shadow-lg shadow-[#7951C8]/25 transition-all"
                    >
                      + Add Question
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(activeQuiz.id, activeQuiz.title)}
                      className="px-3 py-2 text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/20 text-xs font-medium rounded-lg transition-all"
                    >
                      Delete Quiz
                    </button>
                  </div>
                </div>

                {/* Add Question Card */}
                {isQuestionFormOpen && (
                  <div className="mb-6 p-6 bg-[#0A1B35]/80 border border-[#7951C8]/40 rounded-xl space-y-4">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#A0B1DC]/15">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        New Multiple-Choice Question
                      </h3>
                      <button
                        onClick={() => setIsQuestionFormOpen(false)}
                        className="text-xs text-[#A5B1CA] hover:text-white"
                      >
                        ✕ Cancel
                      </button>
                    </div>

                    <form onSubmit={handleAddQuestion} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="sm:col-span-3">
                          <label htmlFor="question-text" className="block text-xs font-semibold uppercase tracking-wider text-[#A5B1CA] mb-1.5">
                            Question Prompt <span className="text-[#E05BBE]">*</span>
                          </label>
                          <input
                            id="question-text"
                            type="text"
                            value={qText}
                            onChange={(e) => setQText(e.target.value)}
                            placeholder="e.g. Which hook is used to perform side effects in React?"
                            className="w-full px-3.5 py-2.5 text-xs border border-[#A0B1DC]/20 rounded-lg focus:outline-none focus:border-[#7951C8] bg-[#071426] text-white placeholder-[#7483A3]"
                          />
                        </div>
                        <div>
                          <label htmlFor="question-pos" className="block text-xs font-semibold uppercase tracking-wider text-[#A5B1CA] mb-1.5">
                            Position
                          </label>
                          <input
                            id="question-pos"
                            type="number"
                            min={1}
                            value={qPosition}
                            onChange={(e) => setQPosition(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-xs font-mono border border-[#A0B1DC]/20 rounded-lg focus:outline-none focus:border-[#7951C8] bg-[#071426] text-white"
                          />
                        </div>
                      </div>

                      {/* Options & Correct Answer Selection */}
                      <div className="space-y-3">
                        <label className="block text-xs font-semibold text-[#A5B1CA]">
                          Answer Options (Select the single radio button representing the correct answer) <span className="text-[#E05BBE]">*</span>
                        </label>

                        {options.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer shrink-0">
                              <input
                                type="radio"
                                name="correct-option-group"
                                checked={correctOptionIdx === idx}
                                onChange={() => setCorrectOptionIdx(idx)}
                                className="w-4 h-4 text-[#7951C8] focus:ring-[#7951C8] bg-[#071426] border-[#A0B1DC]/30"
                              />
                              <span
                                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                                  correctOptionIdx === idx
                                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                    : 'text-[#A5B1CA] bg-[#112947] border-[#A0B1DC]/20'
                                }`}
                              >
                                {correctOptionIdx === idx ? 'Correct Answer' : `Option ${idx + 1}`}
                              </span>
                            </label>

                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleOptionChange(idx, e.target.value)}
                              placeholder={`Option ${idx + 1} text`}
                              className="flex-1 px-3.5 py-2 text-xs border border-[#A0B1DC]/20 rounded-lg bg-[#071426] text-white placeholder-[#7483A3] focus:outline-none focus:border-[#7951C8]"
                            />

                            {options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOptionField(idx)}
                                className="text-[#7483A3] hover:text-rose-400 text-xs px-2"
                                title="Remove this option"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}

                        {options.length < 6 && (
                          <button
                            type="button"
                            onClick={handleAddOptionField}
                            className="text-xs text-[#7951C8] hover:text-[#C04BAA] font-semibold mt-1 inline-block transition-colors"
                          >
                            + Add Another Option
                          </button>
                        )}
                      </div>

                      <div className="pt-3 flex items-center gap-3 border-t border-[#A0B1DC]/10">
                        <button
                          type="submit"
                          disabled={isSubmittingQuestion}
                          className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA] hover:brightness-110 shadow-lg shadow-[#7951C8]/25 transition-all disabled:opacity-50"
                        >
                          {isSubmittingQuestion ? 'Saving Question...' : 'Save Question'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsQuestionFormOpen(false)}
                          className="px-4 py-2 text-xs font-semibold text-[#A5B1CA] hover:text-white bg-[#0A1B35] rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Questions List */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#A5B1CA]">
                    Questions in this Quiz ({questions.length})
                  </h3>

                  {questions.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-[#A0B1DC]/20 rounded-xl p-6 text-xs text-[#A5B1CA]">
                      No questions authored in this quiz yet. Click <strong className="text-white">+ Add Question</strong> above.
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {questions.map((q) => (
                        <div
                          key={q.id}
                          className="p-5 bg-[#0A1B35]/70 border border-[#A0B1DC]/15 rounded-xl space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded bg-gradient-to-br from-[#2855D9]/20 to-[#7951C8]/20 border border-[#7951C8]/30 text-[#E05BBE] font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                {q.position}
                              </span>
                              <h4 className="text-sm font-bold text-white">{q.question_text}</h4>
                            </div>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="text-[#7483A3] hover:text-rose-400 text-xs px-1.5 transition-colors"
                              title="Delete Question"
                            >
                              ✕
                            </button>
                          </div>

                          {/* Options display with correct answer highlighted */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-7">
                            {q.options.map((opt) => {
                              const isCorrect = opt.id === q.correct_option_id;
                              return (
                                <div
                                  key={opt.id}
                                  className={`p-3 rounded-xl text-xs border flex items-center justify-between ${
                                    isCorrect
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200 font-medium'
                                      : 'bg-[#071426]/60 border-[#A0B1DC]/15 text-[#A5B1CA]'
                                  }`}
                                >
                                  <span>{opt.option_text}</span>
                                  {isCorrect && (
                                    <span className="text-[10px] font-bold text-emerald-300 px-2 py-0.5 bg-emerald-500/20 rounded-md border border-emerald-500/30">
                                      ✓ Correct
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass-panel border border-[#A0B1DC]/15 rounded-2xl p-10 text-center text-xs text-[#A5B1CA]">
                Select a quiz from the left sidebar to manage its questions.
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
