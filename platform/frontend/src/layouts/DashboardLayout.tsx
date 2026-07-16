import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, GitBranch, Shield, Cpu, Layers, BarChart3, 
  Terminal, AlertTriangle, Bot, Settings, Sun, Moon, Menu, X, TerminalSquare
} from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.style.backgroundColor = '#0b0f19';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f8fafc';
    }
  }, [darkMode]);

  const navItems = [
    { name: 'Overview', path: '/overview', icon: LayoutDashboard },
    { name: 'Deployments', path: '/deployments', icon: GitBranch },
    { name: 'Pods', path: '/pods', icon: Shield },
    { name: 'Nodes', path: '/nodes', icon: Cpu },
    { name: 'Namespaces', path: '/namespaces', icon: Layers },
    { name: 'Metrics', path: '/metrics', icon: BarChart3 },
    { name: 'Logs', path: '/logs', icon: Terminal },
    { name: 'Alerts', path: '/alerts', icon: AlertTriangle },
    { name: 'AI Assistant', path: '/ai', icon: Bot },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  // Derive breadcrumb text
  const currentPath = location.pathname.substring(1);
  const breadcrumb = currentPath.charAt(0).toUpperCase() + currentPath.slice(1) || 'Overview';

  return (
    <div className="min-h-screen flex transition-colors duration-200 bg-[#f8fafc] dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100">
      
      {/* --- Sidebar Component --- */}
      <aside className={`fixed top-0 bottom-0 left-0 z-40 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <TerminalSquare className="h-7 w-7 text-blue-500 flex-shrink-0" />
            {sidebarOpen && (
              <span className="font-bold text-lg text-white whitespace-nowrap tracking-wide bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                DevOps Nexus
              </span>
            )}
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-500/25' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700/80 hover:text-white transition-all"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      {/* --- Page Main Viewport --- */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'pl-64' : 'pl-20'}`}>
        
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-8 bg-white/60 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md sticky top-0 z-30">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="hover:text-blue-500 cursor-pointer">Platform</span>
            <span>/</span>
            <span className="text-slate-800 dark:text-white font-medium">{breadcrumb}</span>
          </div>

          {/* Right Header Icons */}
          <div className="flex items-center gap-4">
            {/* System Health Badge */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Healthy
            </div>

            {/* Dark Mode Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            </button>

            {/* User Avatar stub */}
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/10">
              DX
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
