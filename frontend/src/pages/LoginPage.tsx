import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SethuLogo } from '../components/common/SethuLogo';
import apiClient from '../api/client';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, quickDemoLogin } = useAuth();

  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [phoneNumber, setPhoneNumber] = useState('+15550000002'); // Defaults to demo investigator
  const [password, setPassword] = useState('Investigator@123');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(phoneNumber, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!phoneNumber) {
      setError('Please enter your mobile number.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const res = await apiClient.post('/auth/request-otp', { phoneNumber });
      if (res.data.success) {
        setOtpSent(true);
        if (res.data.devOtp) {
          setDevOtpHint(res.data.devOtp);
          setOtp(res.data.devOtp); // Auto-fill in dev mode!
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to dispatch OTP challenge.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const verifyRes = await apiClient.post('/auth/verify-otp', { phoneNumber, otp });
      if (verifyRes.data.success) {
        // Auto authenticate demo investigator session or redirect
        await quickDemoLogin('investigator');
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <SethuLogo size="lg" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Access Investigation Platform
          </h2>
          <p className="text-xs text-slate-500">
            Sign in with verified mobile phone number or credentials
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-lg bg-slate-100 dark:bg-sethu-navy-800 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setLoginMethod('password')}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              loginMethod === 'password'
                ? 'bg-white dark:bg-sethu-navy-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Password Sign-in
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('otp')}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              loginMethod === 'otp'
                ? 'bg-white dark:bg-sethu-navy-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Mobile SMS OTP
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        {loginMethod === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-plum-600" />
                Mobile Phone Number
              </label>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 9876543210 or +91 98765 43210"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-plum-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-plum-600" />
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-plum-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-plum-600 hover:bg-plum-700 text-white shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Registered Mobile Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 9876543210 or +91 98765 43210"
                  className="flex-1 text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-plum-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={isLoading}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-peach-50 hover:bg-peach-100 text-slate-800 border border-peach-200 flex-shrink-0"
                >
                  {otpSent ? 'Resend' : 'Send Code'}
                </button>
              </div>
            </div>

            {devOtpHint && (
              <div className="p-2.5 bg-peach-50 border border-peach-200 text-peach-900 text-xs rounded-lg flex items-center justify-between">
                <span>Dev Simulator OTP: <strong className="font-mono">{devOtpHint}</strong></span>
                <span className="text-[10px] text-peach-600 font-semibold">(Auto-Filled)</span>
              </div>
            )}

            {otpSent && (
              <form onSubmit={handleOtpLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full text-center tracking-widest font-mono text-base p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-plum-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-plum-600 hover:bg-plum-700 text-white shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP & Log In'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* 1-Click Demo Evaluation Shortcut */}
        <div className="pt-4 border-t border-slate-100 dark:border-sethu-navy-800 space-y-2.5 text-center">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Fast Evaluator 1-Click Sign-in
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                quickDemoLogin('investigator');
                navigate('/dashboard');
              }}
              className="p-2 rounded-lg bg-plum-50 text-plum-800 border border-plum-200 text-[11px] font-semibold hover:bg-plum-100 transition-colors"
            >
              Investigator (Maya Sen)
            </button>
            <button
              onClick={() => {
                quickDemoLogin('family_member');
                navigate('/dashboard');
              }}
              className="p-2 rounded-lg bg-peach-50 text-peach-800 border border-peach-200 text-[11px] font-semibold hover:bg-peach-100 transition-colors"
            >
              Family (Sunita Sharma)
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          New to PathBack?{' '}
          <Link to="/register" className="font-semibold text-plum-600 hover:underline">
            Register Verified Account
          </Link>
        </div>
      </div>
    </div>
  );
};
