import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-sethu-navy-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Verifying SETHU Security Credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600 mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Restricted Role Protocol
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            Your current account role (<span className="font-semibold text-teal-600">{user.role}</span>) does not possess statutory authorization to access this operational terminal.
          </p>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-left text-xs text-slate-500 mb-6">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Authorized Roles:</span>
            {allowedRoles.join(', ')}
          </div>
          <p className="text-[11px] text-slate-400 italic mb-4">
            Tip: Use the Demo Role Switcher at the top bar to switch to an authorized role for testing.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors"
          >
            Return to Authorized Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
