import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import HomePage from './pages/HomePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import CourseCataloguePage from './pages/student/CourseCataloguePage.jsx';
import CourseDetailsPage from './pages/student/CourseDetailsPage.jsx';
import LessonViewerPage from './pages/student/LessonViewerPage.jsx';
import QuizAttemptPage from './pages/student/QuizAttemptPage.jsx';
import QuizResultsPage from './pages/student/QuizResultsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// Instructor Portal Pages
import InstructorDashboard from './pages/instructor/InstructorDashboard.jsx';
import CourseFormPage from './pages/instructor/CourseFormPage.jsx';
import LessonsPage from './pages/instructor/LessonsPage.jsx';
import QuizzesPage from './pages/instructor/QuizzesPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-[#071426] text-[#F3F5FF] font-sans selection:bg-[#7951C8] selection:text-white relative">
        <Header />
        <div className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected Student Portal Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/courses"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <CourseCataloguePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/courses/:courseId"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <CourseDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/courses/:courseId/lessons/:lessonId"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <LessonViewerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/courses/:courseId/quizzes/:quizId"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <QuizAttemptPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/results"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <QuizResultsPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Instructor Portal Routes */}
            <Route
              path="/instructor"
              element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <InstructorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/courses/new"
              element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <CourseFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/courses/:courseId/edit"
              element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <CourseFormPage isEditing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/courses/:courseId/lessons"
              element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <LessonsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/courses/:courseId/quizzes"
              element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <QuizzesPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </AuthProvider>
  );
}
