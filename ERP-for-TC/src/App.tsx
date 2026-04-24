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
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
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
