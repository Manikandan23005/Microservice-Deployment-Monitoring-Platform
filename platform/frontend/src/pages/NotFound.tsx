import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-16 space-y-6">
      <AlertCircle className="h-16 w-16 text-rose-500 animate-bounce" />
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">404 - Page Not Found</h2>
        <p className="text-sm text-slate-400">The namespace path you are requesting is missing or offline.</p>
      </div>
      <Link 
        to="/overview"
        className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-md hover:bg-blue-500 transition-all"
      >
        Return to Overview
      </Link>
    </div>
  );
};

export default NotFound;
