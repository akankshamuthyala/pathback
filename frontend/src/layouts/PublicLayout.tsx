import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { SethuLogo } from '../components/common/SethuLogo';
import { QuickDemoBar } from '../components/common/QuickDemoBar';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, EyeOff, Sparkles, HeartHandshake } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Responsible AI', path: '/responsible-ai' },
    { name: 'Consent & Privacy', path: '/privacy-consent' },
    { name: 'Submit Sighting', path: '/submit-sighting' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F6] via-[#FAF5F8] to-[#F5EBF2] flex flex-col font-sans">
      {/* Main Public Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#F2E6EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/">
            <SethuLogo size="md" showSubtitle />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xs transition-colors py-1 ${
                    isActive
                      ? 'text-plum-700 font-bold border-b-2 border-plum-600'
                      : 'text-slate-600 hover:text-plum-700 font-medium'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-plum-600 hover:bg-plum-700 text-white shadow-sm transition-all"
              >
                Go to Dashboard ({user?.role?.replace('_', ' ')})
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-[#FEEDEA] transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-plum-600 hover:bg-plum-700 text-white shadow-sm transition-all"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Public Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Trust & Integrity Footer in Plum & Peach Palette */}
      <footer className="bg-gradient-to-r from-[#FFF9F6] via-[#FAF5F8] to-[#F5EBF2] text-slate-600 border-t border-[#F2E6EC] text-xs py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <SethuLogo size="sm" showSubtitle />
            <p className="text-slate-600 leading-relaxed text-[11px]">
              PathBack — Finding a safer path back home. A Consent-First Multimodal AI Platform for Missing-Person Investigation Support.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEEDEA] text-[#B93E23] text-[10px] font-semibold border border-[#FDD8CD]">
              <Sparkles className="w-3 h-3 text-[#EF6B4B]" /> Hackathon Series: Category PS-16
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">Core Pillars</h4>
            <ul className="space-y-2 text-[11px]">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-plum-600" />
                <span>PS-16 Multimodal AI Engine</span>
              </li>
              <li className="flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-plum-600" />
                <span>PS-13 Security, Privacy & Trust</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-peach-600" />
                <span>PS-3 Visual & Document Intelligence</span>
              </li>
              <li className="flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-plum-600" />
                <span>PS-8 Decision Intelligence</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">Responsible AI Rules</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-600">
              <li>• Recommendations, not facts</li>
              <li>• Never automated identity confirmation</li>
              <li>• Similar appearance is never proof</li>
              <li>• Located person's consent is respected</li>
              <li>• No unrestricted public face search</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">Demonstration Disclosure</h4>
            <div className="p-3 rounded-lg bg-white border border-[#FDD8CD] text-[11px] text-slate-600 leading-relaxed shadow-xs">
              <span className="font-bold text-peach-700 block mb-1">Synthetic Data Notice:</span>
              All records, names, photographs, and sightings displayed on this platform are synthetic demonstration records created strictly for hackathon evaluation. No real missing-person data is utilized.
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-[#F2E6EC] text-center text-[10px] text-slate-500">
          © {new Date().getFullYear()} PathBack. Finding a safer path back home. Built for Hackathon Series — Multimodal AI for Social Good.
        </div>
      </footer>
    </div>
  );
};
