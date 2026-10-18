import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function QuizResultsPage() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadResults = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select(`
          id,
          score,
          submitted_at,
          quizzes (
            id,
            title,
            course_id,
            courses (
              id,
              title
            )
          )
        `)
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setAttempts(data || []);
    } catch (err) {
      setErrorMessage(`Failed to load quiz results: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(160,177,220,0.14)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C084FC] shadow-[0_0_8px_rgba(192,132,252,0.5)]"></span>
            <span className="text-xs uppercase font-bold tracking-wider text-[#C084FC] font-mono">
              Evaluation History
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#F3F5FF] tracking-tight">
            My Quiz Results
          </h1>
          <p className="text-xs text-[#A5B1CA] mt-0.5">
            Review your past multiple-choice quiz attempt scores and submission records.
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
        <div className="p-4 bg-rose-950/60 border border-rose-500/40 rounded-lg text-xs text-rose-200 space-y-1">
          <p className="font-semibold text-rose-300">Error</p>
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Results Table / Cards */}
      {isLoading ? (
        <div className="py-20 text-center glass-panel rounded-xl">
          <div className="w-8 h-8 border-3 border-[rgba(160,177,220,0.2)] border-t-[#C084FC] rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-[#A5B1CA]">Loading your evaluation records...</p>
        </div>
      ) : attempts.length === 0 ? (
        <div className="glass-panel border-2 border-dashed border-[rgba(160,177,220,0.18)] rounded-xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#7951C8]/20 text-[#C084FC] border border-[#7951C8]/30 font-bold text-lg flex items-center justify-center mx-auto mb-3 shadow-[0_0_12px_rgba(121,81,200,0.25)]">
            📝
          </div>
          <h3 className="font-heading text-sm font-bold text-[#F3F5FF] mb-1">No Quiz Attempts Yet</h3>
          <p className="text-xs text-[#7483A3] max-w-md mx-auto leading-relaxed">
            You haven&apos;t taken any multiple-choice quizzes yet. Enroll in courses and attempt quizzes to see your scores here.
          </p>
          <Link
            to="/student/courses"
            className="px-4 py-2 bg-gradient-to-r from-[#2855D9] to-[#7951C8] text-white text-xs font-semibold rounded-lg hover:brightness-110 transition-all inline-block shadow-xs"
          >
            Browse Courses to Take Quizzes
          </Link>
        </div>
      ) : (
        <div className="glass-panel rounded-xl overflow-hidden border border-[rgba(160,177,220,0.16)] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#071426]/80 border-b border-[rgba(160,177,220,0.12)] text-[#7483A3] font-semibold uppercase tracking-wider text-[10px] font-mono">
                  <th className="py-3 px-4">Quiz Title</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(160,177,220,0.08)]">
                {attempts.map((att) => {
                  const courseId = att.quizzes?.course_id;
                  const courseTitle = att.quizzes?.courses?.title || 'Course';
                  const quizTitle = att.quizzes?.title || 'Quiz';

                  return (
                    <tr key={att.id} className="hover:bg-[#112947]/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#F3F5FF]">
                        {quizTitle}
                      </td>
                      <td className="py-3.5 px-4 text-[#A5B1CA] truncate max-w-xs">
                        {courseTitle}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-[#F3F5FF]">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                            att.score >= 70
                              ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_rgba(52,211,153,0.2)]'
                              : 'bg-amber-950/70 text-amber-400 border border-amber-500/40'
                          }`}
                        >
                          {att.score}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#7483A3] whitespace-nowrap font-mono">
                        {new Date(att.submitted_at).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {courseId && att.quizzes?.id && (
                          <Link
                            to={`/student/courses/${courseId}/quizzes/${att.quizzes.id}`}
                            className="px-3 py-1 bg-[#112947] hover:bg-[#163252] text-[#F3F5FF] rounded-lg border border-[rgba(160,177,220,0.2)] font-semibold text-[11px] transition-colors"
                          >
                            Retake →
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
