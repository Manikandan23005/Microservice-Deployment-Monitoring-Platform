import React from 'react';
import { Navigate } from 'react-router-dom';
import { ShieldX } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('session_token');
  const userRole = localStorage.getItem('user_role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-6">
          <ShieldX className="h-9 w-9" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Access Restrained</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
          Your current authorization level (<span className="font-semibold text-blue-500">{userRole}</span>) is insufficient to access or perform operations on this view.
        </p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
