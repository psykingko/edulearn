import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function HomePage() {
  const { user, profile, role } = useAuth();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadFeatured() {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select(`
            id,
            title,
            description,
            instructor_id,
            created_at,
            profiles (full_name),
            lessons (count),
            quizzes (count)
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(3);

        if (!error && isMounted && data) {
          setFeaturedCourses(data);
        }
      } catch (err) {
        console.error('[HomePage] Error loading featured courses:', err);
      } finally {
        if (isMounted) setIsLoadingCourses(false);
      }
    }

    loadFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-20 sm:space-y-32 pb-24 overflow-hidden relative">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-28 border-b border-[rgba(160,177,220,0.1)] bg-grid-cyber">
        {/* Atmospheric Radial Glow behind Hero */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] pointer-events-none -z-10 blur-3xl opacity-50"
          style={{
            background: 'radial-gradient(circle at center, rgba(40, 85, 217, 0.35) 0%, rgba(121, 81, 200, 0.2) 40%, transparent 70%)'
          }}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Headline & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#2855D9]/15 text-[#60A5FA] border border-[#2855D9]/30 tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse"></span>
                Structured Online Learning Platform
              </div>

              <h1 className="font-heading text-4xl sm:text-6xl font-extrabold text-[#F3F5FF] tracking-tight leading-[1.12]">
                Learn <span className="text-gradient-violet">beyond the ordinary</span>.
              </h1>

              <p className="text-[#A5B1CA] text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
                EduLearn empowers you to master modern web engineering and cloud infrastructure through modular, text-based lessons and verified automated quiz evaluations.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                {role === 'instructor' ? (
                  <>
                    <Link
                      to="/instructor"
                      className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA] hover:brightness-110 text-white font-semibold text-sm rounded-lg shadow-[0_0_25px_rgba(40,85,217,0.4)] transition-all text-center"
                    >
                      Go to Instructor Portal →
                    </Link>
                    <Link
                      to="/instructor/courses/new"
                      className="w-full sm:w-auto px-6 py-3.5 bg-[#0D203B] hover:bg-[#112947] text-[#F3F5FF] font-semibold text-sm rounded-lg border border-[rgba(160,177,220,0.2)] shadow-xs transition-colors text-center"
                    >
                      + Create New Course
                    </Link>
                  </>
                ) : role === 'student' ? (
                  <>
                    <Link
                      to="/student/courses"
                      className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA] hover:brightness-110 text-white font-semibold text-sm rounded-lg shadow-[0_0_25px_rgba(40,85,217,0.4)] transition-all text-center"
                    >
                      Explore Courses
                    </Link>
                    <Link
                      to="/student"
                      className="w-full sm:w-auto px-6 py-3.5 bg-[#0D203B] hover:bg-[#112947] text-[#F3F5FF] font-semibold text-sm rounded-lg border border-[rgba(160,177,220,0.2)] shadow-xs transition-colors text-center"
                    >
                      Go to Student Dashboard →
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/student/courses"
                      className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA] hover:brightness-110 text-white font-semibold text-sm rounded-lg shadow-[0_0_25px_rgba(40,85,217,0.4)] transition-all text-center"
                    >
                      Explore Courses
                    </Link>
                    <Link
                      to="/signup"
                      className="w-full sm:w-auto px-6 py-3.5 bg-[#0D203B] hover:bg-[#112947] text-[#F3F5FF] font-semibold text-sm rounded-lg border border-[rgba(160,177,220,0.2)] shadow-xs transition-colors text-center"
                    >
                      Get Started Free
                    </Link>
                  </>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#7483A3]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#38BDF8] font-bold">✓</span>
                  <span>Self-Paced Learning</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#C084FC] font-bold">✓</span>
                  <span>Instant Quiz Grading</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#F472B6] font-bold">✓</span>
                  <span>Verified Curricula</span>
                </div>
              </div>
            </div>

            {/* Right Cinematic Technology Terminal Card */}
            <div className="lg:col-span-5">
              <div className="glass-panel-elevated rounded-2xl p-6 sm:p-7 shadow-[0_0_35px_rgba(7,20,38,0.8)] border border-[rgba(160,177,220,0.18)] space-y-6 relative overflow-hidden">
                {/* Subtle top neon border accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA]"></div>

                {/* Terminal Header */}
                <div className="flex items-center justify-between border-b border-[rgba(160,177,220,0.1)] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#2855D9] to-[#7951C8] text-white flex items-center justify-center font-bold text-sm shadow-[0_0_12px_rgba(40,85,217,0.4)]">
                      E
                    </div>
                    <div>
                      <h3 className="font-bold text-[#F3F5FF] text-sm font-heading">EduLearn Learning Core</h3>
                      <p className="text-[11px] text-[#7483A3]">Interactive Curriculum Telemetry</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
                    Live System
                  </span>
                </div>

                {/* Track Metrics Cards */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3.5 rounded-lg bg-[#071426]/70 border border-[rgba(160,177,220,0.1)] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#38BDF8]"></span>
                      <span className="text-[#A5B1CA]">Web Foundations Track</span>
                    </div>
                    <span className="text-[#38BDF8] font-semibold">5 Lessons • HTML/CSS</span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#071426]/70 border border-[rgba(160,177,220,0.1)] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#C084FC]"></span>
                      <span className="text-[#A5B1CA]">Cloud &amp; Hosting Essentials</span>
                    </div>
                    <span className="text-[#C084FC] font-semibold">5 Lessons • Cloud Infra</span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#071426]/70 border border-[rgba(160,177,220,0.1)] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#F472B6]"></span>
                      <span className="text-[#A5B1CA]">Automated Grading</span>
                    </div>
                    <span className="text-[#F472B6] font-semibold">Instant Evaluation</span>
                  </div>
                </div>

                {/* Terminal Footnote */}
                <div className="pt-2 flex items-center justify-between text-[11px] text-[#7483A3] border-t border-[rgba(160,177,220,0.08)]">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>PostgreSQL RLS Active</span>
                  </div>
                  <span>100% Client Isolation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED COURSES SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#60A5FA] uppercase mb-1">
              Curriculum Highlights
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#F3F5FF] tracking-tight">
              Featured Technology Tracks
            </h2>
            <p className="text-xs sm:text-sm text-[#A5B1CA] mt-1 max-w-xl">
              Engineered courses with complete modular lessons and certification assessments.
            </p>
          </div>
          <Link
            to="/student/courses"
            className="text-xs font-semibold text-[#60A5FA] hover:text-[#93C5FD] transition-colors flex items-center gap-1 group"
          >
            <span>View All Courses</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>

        {isLoadingCourses ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="glass-panel rounded-xl p-6 h-64 animate-pulse flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-4 bg-[#112947] rounded w-1/3"></div>
                  <div className="h-6 bg-[#112947] rounded w-4/5"></div>
                  <div className="h-12 bg-[#112947] rounded w-full"></div>
                </div>
                <div className="h-9 bg-[#112947] rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : featuredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => {
              const lessonCount = course.lessons?.[0]?.count ?? 0;
              const quizCount = course.quizzes?.[0]?.count ?? 0;
              const instructorName = course.profiles?.full_name || 'Verified Instructor';

              return (
                <div
                  key={course.id}
                  className="glass-panel hover:border-[#60A5FA]/40 transition-all duration-300 rounded-xl p-6 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#2855D9] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-[#7483A3]">
                      <span>Instructor: <strong className="text-[#A5B1CA] font-medium">{instructorName}</strong></span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#2855D9]/15 text-[#60A5FA] border border-[#2855D9]/30">
                        Published
                      </span>
                    </div>

                    <h3 className="font-heading text-lg font-bold text-[#F3F5FF] group-hover:text-[#60A5FA] transition-colors leading-snug">
                      {course.title}
                    </h3>

                    <p className="text-xs text-[#A5B1CA] line-clamp-3 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[rgba(160,177,220,0.1)] flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-[#7483A3]">
                      <span>📖 {lessonCount} Lessons</span>
                      <span>📝 {quizCount} Quiz</span>
                    </div>

                    {role === 'instructor' ? (
                      <Link
                        to={course.instructor_id === user?.id ? `/instructor/courses/${course.id}/lessons` : '/instructor'}
                        className="px-3.5 py-1.5 bg-[#112947] hover:bg-[#163252] text-[#F3F5FF] hover:text-white text-xs font-semibold rounded-md border border-[rgba(160,177,220,0.2)] transition-colors"
                      >
                        {course.instructor_id === user?.id ? 'Manage Course →' : 'View in Studio →'}
                      </Link>
                    ) : (
                      <Link
                        to={`/student/courses/${course.id}`}
                        className="px-3.5 py-1.5 bg-[#112947] hover:bg-[#163252] text-[#F3F5FF] hover:text-white text-xs font-semibold rounded-md border border-[rgba(160,177,220,0.2)] transition-colors"
                      >
                        View Details →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel rounded-xl p-10 text-center space-y-3">
            <h3 className="font-heading text-base font-bold text-[#F3F5FF]">No Courses Published Yet</h3>
            <p className="text-xs text-[#7483A3] max-w-md mx-auto">
              Courses published by instructors will automatically appear here.
            </p>
          </div>
        )}
      </section>

      {/* 3. CORE ARCHITECTURE / BENEFITS SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#C084FC] uppercase mb-1">
            System Pillars
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#F3F5FF] tracking-tight">
            Architected for Mastery
          </h2>
          <p className="text-xs sm:text-sm text-[#A5B1CA] mt-1">
            Engineered from database security to user experience to ensure reliable, distraction-free knowledge acquisition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-xl p-6 space-y-3 relative group hover:border-[#7951C8]/40 transition-all">
            <div className="w-10 h-10 rounded-lg bg-[#2855D9]/20 text-[#60A5FA] border border-[#2855D9]/30 flex items-center justify-center text-lg font-bold">
              01
            </div>
            <h3 className="font-heading text-base font-bold text-[#F3F5FF]">Modular Curricula</h3>
            <p className="text-xs text-[#A5B1CA] leading-relaxed">
              Every course is structured into sequential, bite-sized text lessons with code blocks, architecture diagrams, and real-world examples.
            </p>
          </div>

          <div className="glass-panel rounded-xl p-6 space-y-3 relative group hover:border-[#7951C8]/40 transition-all">
            <div className="w-10 h-10 rounded-lg bg-[#7951C8]/20 text-[#C084FC] border border-[#7951C8]/30 flex items-center justify-center text-lg font-bold">
              02
            </div>
            <h3 className="font-heading text-base font-bold text-[#F3F5FF]">Automated Grading</h3>
            <p className="text-xs text-[#A5B1CA] leading-relaxed">
              Multiple-choice assessments are scored server-side with PostgreSQL functions, ensuring zero answer key leakage and immediate feedback.
            </p>
          </div>

          <div className="glass-panel rounded-xl p-6 space-y-3 relative group hover:border-[#7951C8]/40 transition-all">
            <div className="w-10 h-10 rounded-lg bg-[#C04BAA]/20 text-[#F472B6] border border-[#C04BAA]/30 flex items-center justify-center text-lg font-bold">
              03
            </div>
            <h3 className="font-heading text-base font-bold text-[#F3F5FF]">Relational Persistence</h3>
            <p className="text-xs text-[#A5B1CA] leading-relaxed">
              Enrollments, lesson completions, and quiz scores persist in real PostgreSQL tables protected by Row Level Security policies.
            </p>
          </div>
        </div>
      </section>

      {/* 4. LEARNING JOURNEY / HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="glass-panel-elevated rounded-2xl p-8 sm:p-12 relative overflow-hidden border border-[rgba(160,177,220,0.16)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#60A5FA] uppercase tracking-wider">Step 1</span>
              <h4 className="font-heading text-base font-bold text-[#F3F5FF]">Discover Curricula</h4>
              <p className="text-xs text-[#A5B1CA] leading-relaxed">
                Browse our verified technology tracks and enroll with a single click from the published course catalogue.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#C084FC] uppercase tracking-wider">Step 2</span>
              <h4 className="font-heading text-base font-bold text-[#F3F5FF]">Read &amp; Progress</h4>
              <p className="text-xs text-[#A5B1CA] leading-relaxed">
                Work through structured lessons at your own pace, marking completion to advance your dashboard progress bar.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#F472B6] uppercase tracking-wider">Step 3</span>
              <h4 className="font-heading text-base font-bold text-[#F3F5FF]">Assess &amp; Certify</h4>
              <p className="text-xs text-[#A5B1CA] leading-relaxed">
                Test your knowledge through multiple-choice certification quizzes with instant server-side scoring and permanent attempt logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="glass-panel-elevated rounded-2xl p-8 sm:p-12 border border-[rgba(160,177,220,0.18)] shadow-[0_0_35px_rgba(40,85,217,0.25)] space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA]"></div>

          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#F3F5FF] tracking-tight">
            {role === 'instructor'
              ? 'Ready to Expand Your Curriculum?'
              : role === 'student'
              ? 'Ready to Continue Your Learning Journey?'
              : 'Ready to Begin Your Learning Journey?'}
          </h2>

          <p className="text-xs sm:text-sm text-[#A5B1CA] max-w-lg mx-auto leading-relaxed">
            {role === 'instructor'
              ? 'Manage your authored courses, author structured lessons, and configure multiple-choice quizzes with verified server evaluation.'
              : role === 'student'
              ? 'Resume your courses, progress through structured modular lessons, and assess your knowledge with automated grading.'
              : 'Join students and instructors already leveraging EduLearn for structured, distraction-free computer science curricula.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {role === 'instructor' ? (
              <>
                <Link
                  to="/instructor"
                  className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA] hover:brightness-110 text-white font-semibold text-xs rounded-lg shadow-sm transition-all text-center"
                >
                  Go to Instructor Portal →
                </Link>
                <Link
                  to="/instructor/courses/new"
                  className="w-full sm:w-auto px-6 py-3 bg-[#0D203B] hover:bg-[#112947] text-[#F3F5FF] font-semibold text-xs rounded-lg border border-[rgba(160,177,220,0.2)] transition-colors text-center"
                >
                  + Create New Course
                </Link>
              </>
            ) : role === 'student' ? (
              <>
                <Link
                  to="/student"
                  className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA] hover:brightness-110 text-white font-semibold text-xs rounded-lg shadow-sm transition-all text-center"
                >
                  Go to Student Dashboard →
                </Link>
                <Link
                  to="/student/courses"
                  className="w-full sm:w-auto px-6 py-3 bg-[#0D203B] hover:bg-[#112947] text-[#F3F5FF] font-semibold text-xs rounded-lg border border-[rgba(160,177,220,0.2)] transition-colors text-center"
                >
                  Browse Course Catalogue
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/student/courses"
                  className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA] hover:brightness-110 text-white font-semibold text-xs rounded-lg shadow-sm transition-all text-center"
                >
                  Explore Available Courses
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-6 py-3 bg-[#0D203B] hover:bg-[#112947] text-[#F3F5FF] font-semibold text-xs rounded-lg border border-[rgba(160,177,220,0.2)] transition-colors text-center"
                >
                  Sign In to Your Account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
