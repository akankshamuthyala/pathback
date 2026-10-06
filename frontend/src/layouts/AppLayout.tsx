import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  PlusCircle,
  Sparkles,
  GitMerge,
  CheckSquare,
  ShieldAlert,
  MessageSquare,
  History,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SethuLogo } from '../components/common/SethuLogo';
import { QuickDemoBar } from '../components/common/QuickDemoBar';

export const AppLayout: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isInvestigatorOrAdmin = hasRole('investigator', 'admin');
  const isAdmin = hasRole('admin');

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Missing Cases', path: '/cases', icon: FolderOpen },
    { name: 'Open New Case', path: '/cases/create', icon: PlusCircle },
    { name: 'AI Analysis Center', path: '/ai-center', icon: Sparkles },
    ...(isInvestigatorOrAdmin
      ? [
          { name: 'Pattern Insights', path: '/patterns', icon: GitMerge, badge: '6-Signal' },
          { name: 'Review Queue', path: '/reviews', icon: CheckSquare, badge: 'Human-in-Loop' },
        ]
      : []),
    { name: 'Consent Wall', path: '/consent-wall', icon: ShieldAlert, badge: 'Core Rule' },
    { name: 'Secure Comms', path: '/communication', icon: MessageSquare },
    ...(isInvestigatorOrAdmin
      ? [{ name: 'Audit History', path: '/audit', icon: History }]
      : []),
    ...(isAdmin
      ? [{ name: 'System Governance', path: '/admin', icon: ShieldCheck, badge: 'Admin' }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F6] via-[#FAF5F8] to-[#F5EBF2] flex flex-col font-sans">
      {/* Main App Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white/95 border-r border-[#F2E6EC] flex-shrink-0">
          {/* Logo Branding */}
          <div className="p-5 border-b border-[#F2E6EC]">
            <Link to="/dashboard">
              <SethuLogo size="md" showSubtitle />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-plum-50 text-plum-800 font-bold border border-plum-200 shadow-xs'
                      : 'text-slate-600 hover:bg-[#FFF8F5] hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-plum-600' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FEEDEA] text-peach-800 font-medium">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Public Portal Shortcut & User Footer */}
          <div className="p-4 border-t border-[#F2E6EC] space-y-3">
            <Link
              to="/submit-sighting"
              className="flex items-center justify-between p-2.5 rounded-lg bg-[#FFF5F0] border border-[#FDD8CD] text-[#B93E23] text-xs font-medium hover:bg-[#FEEDEA] transition-colors"
            >
              <span>Submit Public Sighting</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-plum-100 text-plum-700 flex items-center justify-center font-bold text-xs">
                  {user?.name?.[0] || 'U'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                  <p className="text-[10px] text-plum-700 uppercase tracking-wider font-semibold truncate">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                title="Log out"
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Header and Menu */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Mobile Topbar */}
          <header className="lg:hidden bg-white border-b border-[#F2E6EC] px-4 py-3 flex items-center justify-between">
            <Link to="/dashboard">
              <SethuLogo size="sm" />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 rounded-lg hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </header>

          {/* Mobile Drawer */}
          {isMobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm pt-14">
              <div className="bg-white dark:bg-sethu-navy-900 w-3/4 max-w-xs h-full p-4 flex flex-col">
                <nav className="flex-1 space-y-1">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-lg hover:bg-teal-50 dark:hover:bg-sethu-navy-800"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>
                <div className="pt-4 border-t border-slate-200 dark:border-sethu-navy-800">
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Page Body Viewport */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
