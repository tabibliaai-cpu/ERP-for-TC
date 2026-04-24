import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Messaging } from './pages/Messaging';
import { FacultyManagement } from './pages/FacultyManagement';
import { Admissions } from './pages/Admissions';
import { Finance } from './pages/Finance';
import AcademicSystem from './pages/AcademicSystem';
import { StudentProfile } from './pages/StudentProfile';
import SubjectPortal from './pages/SubjectPortal';
import { Library } from './pages/Library';
import { ChurchManagement } from './pages/ChurchManagement';
import { Settings } from './pages/Settings';
import { SuperAdmin } from './pages/SuperAdmin';
import { Login } from './pages/Login';
import { OnboardingWizard } from './pages/OnboardingWizard';
import { MarketingLanding } from './pages/MarketingLanding';
import { Pricing } from './pages/Pricing';
import { useAuthStore, useAppStore } from './store/useStore';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './lib/firebase';

// ─── Public Site Layout (no sidebar) ───
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      {children}
    </div>
  );
}

// ─── Onboarding Layout (no sidebar, centered) ───
function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      {children}
    </div>
  );
}

export default function App() {
  const { user, isLoading, appView } = useAuthStore();
  const { isImpersonating, impersonationContext } = useAppStore();

  // ─── Loading State ───
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium tracking-wide">Authenticating...</p>
        </div>
      </div>
    );
  }

  // ─── Not logged in: Public Marketing Site ───
  if (!user) {
    return (
      <PublicLayout>
        <MarketingLanding onNavigate={(path: string) => { window.location.href = path; }} />
      </PublicLayout>
    );
  }

  // ─── GATEKEEPER ROUTING ───

  // Gate 2: No subscription → Show marketing site with pricing
  if (appView === 'public') {
    return (
      <Router>
        <Routes>
          <Route path="/" element={
            <PublicLayout>
              <MarketingLanding onNavigate={(path) => window.location.href = path} />
            </PublicLayout>
          } />
          <Route path="/pricing" element={
            <PublicLayout>
              <Pricing onSelectPlan={() => {/* TODO: checkout flow */}} />
            </PublicLayout>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    );
  }

  // Gate 3: Subscribed but onboarding incomplete → Show wizard
  if (appView === 'onboarding') {
    const handleOnboardingComplete = async (institutionId: string) => {
      try {
        await updateDoc(doc(db, 'users', user!.uid), {
          onboardingComplete: true,
          institutionId: institutionId,
          tenantId: institutionId,
          role: 'admin',
          updatedAt: serverTimestamp(),
        });
        // AuthProvider will pick up the change and set appView to 'app'
        window.location.reload();
      } catch (err) {
        console.error('Failed to complete onboarding:', err);
      }
    };

    return (
      <OnboardingLayout>
        <OnboardingWizard
          userEmail={user.email || ''}
          userId={user.uid}
          onComplete={handleOnboardingComplete}
        />
      </OnboardingLayout>
    );
  }

  // Gate 4: Full Access — The main app
  if (appView === 'app') {
    // Super Admin: Impersonation Mode → Show regular admin dashboard
    if (user.role === 'super_admin' && isImpersonating && impersonationContext) {
      return (
        <Router>
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/messages" element={<Messaging />} />
              <Route path="/admissions" element={<Admissions />} />
              <Route path="/admissions/:studentId" element={<StudentProfile />} />
              <Route path="/faculty" element={<FacultyManagement />} />
              <Route path="/courses" element={<AcademicSystem />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/library" element={<Library />} />
              <Route path="/church" element={<ChurchManagement />} />
              <Route path="/classroom" element={<SubjectPortal />} />
              <Route path="/super-admin" element={
                <ProtectedRoute feature="super-admin">
                  <SuperAdmin />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </DashboardLayout>
        </Router>
      );
    }

    // Super Admin: Normal Mode → Go to Super Admin panel
    if (user.role === 'super_admin') {
      return (
        <Router>
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/super-admin" replace />} />
              <Route path="/super-admin" element={
                <ProtectedRoute feature="super-admin">
                  <SuperAdmin />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/super-admin" replace />} />
            </Routes>
          </DashboardLayout>
        </Router>
      );
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
            <Route path="/faculty" element={
              <ProtectedRoute feature="faculty">
                <FacultyManagement />
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

  // Fallback
  return <Login />;
}
