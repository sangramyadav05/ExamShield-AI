import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ExamPortal from './pages/ExamPortal';
import StudyAssistant from './pages/StudyAssistant';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#020617]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher-dashboard" replace />;
    return <Navigate to="/student-dashboard" replace />;
  }

  return children;
};

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 h-[calc(100vh-73px)] overflow-y-auto custom-scrollbar bg-slate-950/20">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={user ? (
        user.role === 'admin' ? <Navigate to="/admin-dashboard" replace /> :
        user.role === 'teacher' ? <Navigate to="/teacher-dashboard" replace /> :
        <Navigate to="/student-dashboard" replace />
      ) : <Login />} />
      <Route path="/register" element={user ? (
        user.role === 'admin' ? <Navigate to="/admin-dashboard" replace /> :
        user.role === 'teacher' ? <Navigate to="/teacher-dashboard" replace /> :
        <Navigate to="/student-dashboard" replace />
      ) : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Admin Protected Routes */}
      <Route path="/admin-dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <DashboardLayout>
            <AdminDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Teacher Protected Routes */}
      <Route path="/teacher-dashboard" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <DashboardLayout>
            <TeacherDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/create-exam" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <DashboardLayout>
            <TeacherDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Student Protected Routes */}
      <Route path="/student-dashboard" element={
        <ProtectedRoute allowedRoles={['student']}>
          <DashboardLayout>
            <StudentDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/exams" element={
        <ProtectedRoute allowedRoles={['student']}>
          <DashboardLayout>
            <StudentDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/study-assistant" element={
        <ProtectedRoute allowedRoles={['student']}>
          <DashboardLayout>
            <StudyAssistant />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Full screen Exam Attempt portal */}
      <Route path="/exam/:id" element={
        <ProtectedRoute allowedRoles={['student']}>
          <ExamPortal />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
