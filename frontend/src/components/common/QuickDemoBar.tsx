import React from 'react';
import { UserCheck, Shield, Users, UserPlus, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const QuickDemoBar: React.FC = () => {
  return null;
};

export const _QuickDemoBarDisabled: React.FC = () => {
  const { user, quickDemoLogin, logout } = useAuth();

  const demoRoles: Array<{ role: UserRole; label: string; name: string; icon: React.ReactNode }> = [
    {
      role: 'investigator',
      label: 'Investigator',
      name: 'Inspector Maya Sen',
      icon: <Shield className="w-3.5 h-3.5 text-teal-600" />,
    },
    {
      role: 'family_member',
      label: 'Family Member',
      name: 'Sunita Sharma',
      icon: <Users className="w-3.5 h-3.5 text-blue-600" />,
    },
    {
      role: 'admin',
      label: 'Administrator',
      name: 'Sarah Jenkins',
      icon: <UserCheck className="w-3.5 h-3.5 text-purple-600" />,
    },
    {
      role: 'public_reporter',
      label: 'Public Reporter',
      name: 'Rahul Verma',
      icon: <UserPlus className="w-3.5 h-3.5 text-amber-600" />,
    },
  ];

  return (
    <div className="bg-[#FFF9F6]/95 text-slate-700 border-b border-[#FDD8CD] px-4 py-2 text-xs backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FEEDEA] text-[#B93E23] font-semibold border border-[#FDD8CD]">
            <Sparkles className="w-3 h-3 text-[#EF6B4B]" />
            <span>DEMO EVALUATION</span>
          </div>
          <span className="hidden sm:inline text-slate-500 font-medium">
            1-Click Role Switcher:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {demoRoles.map(({ role, label, icon }) => {
            const isActive = user?.role === role;
            return (
              <button
                key={role}
                onClick={() => quickDemoLogin(role)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all font-medium text-xs ${
                  isActive
                    ? 'bg-plum-600 text-white font-bold shadow-sm shadow-plum-600/20 ring-1 ring-plum-400'
                    : 'bg-white hover:bg-[#FFF8F5] text-slate-700 border border-[#F2E6EC] hover:border-[#FCBAA7]'
                }`}
              >
                {icon}
                <span>{label}</span>
                {isActive && <span className="text-[10px] bg-plum-800 text-white px-1.5 py-0.2 rounded-full font-bold">Active</span>}
              </button>
            );
          })}

          {user && (
            <button
              onClick={logout}
              title="Logout session"
              className="p-1 rounded-md hover:bg-[#FEEDEA] text-slate-400 hover:text-rose-600 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
