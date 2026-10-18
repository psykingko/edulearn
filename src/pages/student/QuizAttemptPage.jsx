import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function QuizAttemptPage() {
  const { courseId, quizId } = useParams();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [previousAttempts, setPreviousAttempts] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittedResult, setSubmittedResult] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationError, setValidationError] = useState('');

  const loadQuizData = useCallback(async () => {
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

      // 2. Fetch quiz details
      const { data: qData, error: qErr } = await supabase
        .from('quizzes')
        .select('id, title')
        .eq('id', quizId)
        .single();

      if (qErr) throw qErr;
      setQuiz(qData);

      // 3. Fetch questions and options (answer keys are NOT fetched by client)
      const { data: questionData, error: questErr } = await supabase
        .from('quiz_questions')
        .select(`
          id,
          question_text,
          position,
          quiz_options(id, option_text, position)
        `)
        .eq('quiz_id', quizId)
        .order('position', { ascending: true });

      if (questErr) throw questErr;

      // Sort options within each question by position
      const formattedQuestions = (questionData || []).map((q) => ({
        ...q,
        options: (q.quiz_options || []).sort((a, b) => a.position - b.position),
      }));

      setQuestions(formattedQuestions);

      // 4. Fetch previous attempts for this student
      const { data: attData, error: attErr } = await supabase
        .from('quiz_attempts')
        .select('id, score, submitted_at')
        .eq('quiz_id', quizId)
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false });

      if (!attErr && attData) {
        setPreviousAttempts(attData);
      }
    } catch (err) {
      setErrorMessage(`Failed to load quiz: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, quizId, user.id]);

  useEffect(() => {
    loadQuizData();
  }, [loadQuizData]);

  // Handle option select
  const handleSelectOption = (questionId, optionId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
    setValidationError('');
  };

  // Submit quiz attempt to secure PostgreSQL RPC
  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setValidationError('');

    // Check that student has answered all questions
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < questions.length) {
      setValidationError(
        `Please answer all questions before submitting. (${answeredCount} of ${questions.length} answered)`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Build answers payload array
      const answersPayload = questions.map((q) => ({
        question_id: q.id,
        selected_option_id: selectedAnswers[q.id],
      }));

      // Invoke server-side grading RPC
      const { data: rpcResult, error: rpcError } = await supabase.rpc('submit_quiz_attempt', {
        p_quiz_id: quizId,
        p_answers: answersPayload,
      });

      if (rpcError) {
        if (rpcError.message?.includes('submit_quiz_attempt') || rpcError.message?.includes('schema cache')) {
          throw new Error('The required database evaluation function is missing. Please run supabase/phase04_student_functions.sql in your Supabase SQL editor.');
        }
        throw rpcError;
      }

      setSubmittedResult(rpcResult);

      // Refresh attempt history
      const { data: attData } = await supabase
        .from('quiz_attempts')
        .select('id, score, submitted_at')
        .eq('quiz_id', quizId)
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false });

      if (attData) {
        setPreviousAttempts(attData);
      }
    } catch (err) {
      setErrorMessage(`Quiz submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset to attempt quiz again
  const handleRetake = () => {
    setSelectedAnswers({});
    setSubmittedResult(null);
    setValidationError('');
    setErrorMessage('');
  };

  if (isLoading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-3 border-[rgba(160,177,220,0.2)] border-t-[#C084FC] rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-[#A5B1CA]">Loading quiz questions...</p>
      </main>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="glass-panel rounded-2xl p-8 border border-[rgba(160,177,220,0.18)] space-y-4">
          <h2 className="font-heading text-xl font-bold text-[#F3F5FF] mb-2">Quiz Not Available</h2>
          <p className="text-xs text-[#A5B1CA] mb-6">
            This quiz either has no questions or is not available for this course.
          </p>
          <Link
            to={`/student/courses/${courseId}`}
            className="px-4 py-2 bg-gradient-to-r from-[#2855D9] to-[#7951C8] text-white text-xs font-semibold rounded-lg hover:brightness-110 transition-all inline-block shadow-xs"
          >
            ← Return to Course
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Header */}
      <div>
        <Link
          to={`/student/courses/${courseId}`}
          className="text-xs font-semibold text-[#A5B1CA] hover:text-[#F3F5FF] inline-flex items-center gap-1 mb-2 transition-colors"
        >
          ← Back to {course?.title || 'Course'}
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C084FC] font-mono">
            MCQ Quiz Assessment
          </span>
          <span className="text-xs text-[#7483A3]">
            • {questions.length} {questions.length === 1 ? 'Question' : 'Questions'}
          </span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-[#F3F5FF] tracking-tight">
          {quiz.title}
        </h1>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 bg-rose-950/60 border border-rose-500/40 rounded-lg text-xs text-rose-200 space-y-1">
          <p className="font-semibold text-rose-300">Submission Error</p>
          <p>{errorMessage}</p>
        </div>
      )}

      {validationError && (
        <div className="p-3.5 bg-amber-950/60 border border-amber-500/40 rounded-lg text-xs text-amber-200">
          ⚠️ {validationError}
        </div>
      )}

      {/* Submission Success Screen */}
      {submittedResult ? (
        <div className="glass-panel-elevated rounded-2xl p-6 sm:p-10 shadow-[0_0_35px_rgba(7,20,38,0.7)] border border-[rgba(160,177,220,0.18)] mb-8 text-center space-y-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA]"></div>

          <div className="w-14 h-14 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold shadow-[0_0_15px_rgba(52,211,153,0.3)]">
            ✓
          </div>

          <h2 className="font-heading text-2xl font-bold text-[#F3F5FF] tracking-tight">
            Quiz Completed!
          </h2>

          <div className="p-5 bg-[#071426]/70 rounded-xl border border-[rgba(160,177,220,0.14)] max-w-sm mx-auto space-y-2">
            <p className="text-xs text-[#7483A3] uppercase tracking-wider font-mono font-semibold">
              Calculated Score
            </p>
            <p className="text-5xl font-extrabold text-gradient-neon font-mono">
              {submittedResult.score}%
            </p>
            <p className="text-xs text-[#A5B1CA]">
              You answered <strong className="text-[#F3F5FF]">{submittedResult.correct_count}</strong> of{' '}
              <strong className="text-[#F3F5FF]">{submittedResult.total_questions}</strong> questions correctly.
            </p>
            <p className="text-[10px] text-[#7483A3] pt-2 border-t border-[rgba(160,177,220,0.1)]">
              Graded securely server-side inside PostgreSQL
            </p>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={handleRetake}
              className="px-4 py-2 bg-[#0D203B] hover:bg-[#112947] text-[#F3F5FF] text-xs font-semibold rounded-lg border border-[rgba(160,177,220,0.2)] transition-colors cursor-pointer"
            >
              Retake Quiz
            </button>
            <Link
              to={`/student/courses/${courseId}`}
              className="px-5 py-2 bg-gradient-to-r from-[#2855D9] to-[#7951C8] hover:brightness-110 text-white text-xs font-semibold rounded-lg shadow-[0_0_15px_rgba(40,85,217,0.3)] transition-all"
            >
              Continue Course →
            </Link>
            <Link
              to="/student/results"
              className="px-4 py-2 bg-[#0D203B] hover:bg-[#112947] text-[#A5B1CA] hover:text-[#F3F5FF] text-xs font-semibold rounded-lg border border-[rgba(160,177,220,0.2)] transition-colors"
            >
              View All Results
            </Link>
          </div>
        </div>
      ) : (
        /* Quiz Form */
        <form onSubmit={handleSubmitQuiz} className="space-y-6">
          {questions.map((q, qIndex) => {
            const isAnswered = Boolean(selectedAnswers[q.id]);

            return (
              <div
                key={q.id}
                className="glass-panel rounded-xl p-5 sm:p-6 shadow-sm border border-[rgba(160,177,220,0.16)] space-y-4"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#7951C8]/20 text-[#C084FC] border border-[#7951C8]/30 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">
                    {qIndex + 1}
                  </span>
                  <div className="flex-1">
                    <h2 className="text-sm font-bold text-[#F3F5FF] leading-snug">
                      {q.question_text}
                    </h2>
                    {!isAnswered && (
                      <span className="text-[10px] text-[#7483A3] mt-0.5 inline-block font-mono">
                        Select an option below
                      </span>
                    )}
                  </div>
                </div>

                {/* Options List */}
                <div className="space-y-2 pl-8">
                  {q.options.map((opt) => {
                    const isSelected = selectedAnswers[q.id] === opt.id;

                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#7951C8]/20 border-[#7951C8]/50 text-[#F3F5FF] font-semibold shadow-[0_0_12px_rgba(121,81,200,0.2)]'
                            : 'bg-[#071426]/70 hover:bg-[#112947] border-[rgba(160,177,220,0.12)] text-[#A5B1CA]'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          value={opt.id}
                          checked={isSelected}
                          onChange={() => handleSelectOption(q.id, opt.id)}
                          className="w-4 h-4 accent-[#7951C8] focus:ring-[#7951C8]"
                        />
                        <span className="flex-1 leading-relaxed">{opt.option_text}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Submit Action Card */}
          <div className="glass-panel-elevated rounded-xl p-5 border border-[rgba(160,177,220,0.18)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-[#A5B1CA] font-mono">
              Answered <strong className="text-[#38BDF8]">{Object.keys(selectedAnswers).length}</strong> of{' '}
              <strong className="text-[#F3F5FF]">{questions.length}</strong> questions
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-[#7951C8] to-[#C04BAA] hover:brightness-110 text-white text-xs font-bold rounded-lg shadow-[0_0_15px_rgba(121,81,200,0.35)] transition-all disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? 'Evaluating Quiz Server-Side...' : 'Submit Quiz for Grading'}
            </button>
          </div>
        </form>
      )}

      {/* Previous Attempts History Section */}
      {previousAttempts.length > 0 && (
        <div className="glass-panel rounded-xl p-6 border border-[rgba(160,177,220,0.16)] space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7483A3] font-mono">
            Your Previous Attempts ({previousAttempts.length})
          </h3>
          <div className="divide-y divide-[rgba(160,177,220,0.1)] text-xs">
            {previousAttempts.map((att, idx) => (
              <div key={att.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#F3F5FF]">Attempt #{previousAttempts.length - idx}</span>
                  <span className="text-[#7483A3] ml-2 font-mono">
                    {new Date(att.submitted_at).toLocaleString()}
                  </span>
                </div>
                <div className="font-bold text-[#38BDF8] px-2.5 py-0.5 bg-[#071426] border border-[rgba(160,177,220,0.15)] rounded-md font-mono">
                  {att.score}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
