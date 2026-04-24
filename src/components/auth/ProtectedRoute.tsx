import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useStore';
import { hasPermission } from '../../lib/permissions';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  feature: string;
}

export function ProtectedRoute({ children, feature }: ProtectedRouteProps) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!hasPermission(user.role, feature)) {
    // Smooth redirect for users who logged out from super-admin and back in as regular users
    if (feature === 'super-admin') {
       return <Navigate to="/" replace />;
    }

    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] text-center p-6 bg-white rounded-2xl border border-slate-200">
        <div className="w-20 h-20 bg-red-50 rounded-full mb-6 flex items-center justify-center border-2 border-red-100">
          <ShieldAlert className="text-red-600 w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight ">Access Restricted</h2>
        <p className="text-slate-500 mt-2 max-w-sm mx-auto">
          Your current role (<span className="text-indigo-600 font-bold uppercase">{user.role || 'Unassigned'}</span>) does not have sufficient permissions to access the <span className="font-bold text-slate-700 capitalize">{feature}</span> module.
        </p>
        
        <Link 
          to="/"
          className="mt-8 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </Link>
        
        <p className="text-xs text-slate-400 mt-6 uppercase tracking-widest font-bold">
          Zero-Trust Security Layer Active
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
