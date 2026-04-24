import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Messaging } from './pages/Messaging';
import { FacultyManagement } from './pages/FacultyManagement';
import { TeacherManagement } from './pages/TeacherManagement';
import { TeacherEnrollment } from './pages/TeacherEnrollment';
import { Admissions } from './pages/Admissions';
import { StudentEnrollment } from './pages/StudentEnrollment';
import { Finance } from './pages/Finance';
import AcademicSystem from './pages/AcademicSystem';
import AcademicConfig from './pages/AcademicConfig';
import { StudentProfile } from './pages/StudentProfile';
import SubjectPortal from './pages/SubjectPortal';
import { Library } from './pages/Library';
import { ChurchManagement } from './pages/ChurchManagement';
import { Settings } from './pages/Settings';
import { SuperAdmin } from './pages/SuperAdmin';
import { Login } from './pages/Login';
import { useAuthStore } from './store/useStore';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export default function App() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f0a1e, #1a0e2e, #12082a)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-fuchsia-500/30 animate-pulse">
            <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-fuchsia-300/60">Initializing Covenant</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/messages" element={
            <ProtectedRoute feature="messaging">
              <Messaging />
            </ProtectedRoute>
          } />
          <Route path="/admissions" element={
            <ProtectedRoute feature="admissions">
              <Admissions />
            </ProtectedRoute>
          } />
          <Route path="/admissions/:studentId" element={
            <ProtectedRoute feature="admissions">
              <StudentProfile />
            </ProtectedRoute>
          } />
          <Route path="/enrollment" element={
            <ProtectedRoute feature="admissions">
              <StudentEnrollment />
            </ProtectedRoute>
          } />
          <Route path="/faculty" element={
            <ProtectedRoute feature="faculty">
              <FacultyManagement />
            </ProtectedRoute>
          } />
          <Route path="/teachers" element={
            <ProtectedRoute feature="faculty">
              <TeacherManagement />
            </ProtectedRoute>
          } />
          <Route path="/teacher-enrollment" element={
            <ProtectedRoute feature="faculty">
              <TeacherEnrollment />
            </ProtectedRoute>
          } />
          <Route path="/courses" element={
            <ProtectedRoute feature="courses">
              <AcademicSystem />
            </ProtectedRoute>
          } />
          <Route path="/academic-config" element={
            <ProtectedRoute feature="courses">
              <AcademicConfig />
            </ProtectedRoute>
          } />
          <Route path="/finance" element={
            <ProtectedRoute feature="finance">
              <Finance />
            </ProtectedRoute>
          } />
          <Route path="/library" element={
            <ProtectedRoute feature="library">
              <Library />
            </ProtectedRoute>
          } />
          <Route path="/church" element={
            <ProtectedRoute feature="church">
              <ChurchManagement />
            </ProtectedRoute>
          } />
          <Route path="/classroom" element={
            <ProtectedRoute feature="classroom">
              <SubjectPortal />
            </ProtectedRoute>
          } />
          <Route path="/super-admin" element={
            <ProtectedRoute feature="super-admin">
              <SuperAdmin />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute feature="settings">
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}
