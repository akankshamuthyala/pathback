import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, User, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import apiClient from '../api/client';
import { SethuLogo } from '../components/common/SethuLogo';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'public_reporter' | 'family_member'>('family_member');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setIsLoading(true);
    setError('');

    try {
      const res = await apiClient.post('/auth/request-otp', { phoneNumber });
      if (res.data.success) {
        if (res.data.devOtp) {
          setDevOtpHint(res.data.devOtp);
          setOtp(res.data.devOtp);
        }
        setStep(2);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to dispatch OTP challenge.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setIsLoading(true);
    setError('');

    try {
      const res = await apiClient.post('/auth/verify-otp', { phoneNumber, otp });
      if (res.data.success) {
        setStep(3);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Complete Profile & Password
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || password.length < 8) {
      setError('Name and a password with at least 8 characters are required.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const res = await apiClient.post('/auth/register', {
        name,
        phoneNumber,
        otp,
        password,
        role,
      });

      if (res.data.success) {
        localStorage.setItem('pathback_access_token', res.data.accessToken);
        localStorage.setItem('pathback_refresh_token', res.data.refreshToken);
        localStorage.setItem('sethu_access_token', res.data.accessToken);
        localStorage.setItem('sethu_refresh_token', res.data.refreshToken);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
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
            Register Verified Account
          </h2>
          <div className="flex justify-center gap-2 pt-2">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  step === s ? 'w-8 bg-plum-600' : step > s ? 'w-4 bg-peach-400' : 'w-4 bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        {/* Step 1: Mobile Number */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
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
              <p className="text-[11px] text-slate-400 mt-1">
                A 6-digit cryptographic verification challenge will be dispatched to this number.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !phoneNumber}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-plum-600 hover:bg-plum-700 text-white shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? 'Generating OTP...' : 'Send Verification OTP'}
            </button>
          </form>
        )}

        {/* Step 2: Enter OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Enter 6-Digit Code for {phoneNumber}
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full text-center tracking-widest font-mono text-base p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-plum-500 outline-none"
              />
            </div>

            {devOtpHint && (
              <div className="p-2.5 bg-peach-50 border border-peach-200 text-peach-900 text-xs rounded-lg flex items-center justify-between">
                <span>Dev Mode Simulator Code: <strong className="font-mono">{devOtpHint}</strong></span>
                <span className="text-[10px] text-peach-600 font-semibold">(Auto-Populated)</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-plum-600 hover:bg-plum-700 text-white shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Confirm OTP Challenge'}
            </button>
          </form>
        )}

        {/* Step 3: Name, Password, Role */}
        {step === 3 && (
          <form onSubmit={handleCompleteRegistration} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-plum-600" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-plum-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-plum-600" />
                Create Password (Min 8 Characters)
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Account Role
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label
                  className={`p-3 rounded-lg border cursor-pointer flex flex-col items-center text-center ${
                    role === 'family_member'
                      ? 'border-plum-500 bg-plum-50/70 text-plum-900 font-bold'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="family_member"
                    checked={role === 'family_member'}
                    onChange={() => setRole('family_member')}
                    className="hidden"
                  />
                  <span>Family Member</span>
                  <span className="text-[10px] text-slate-400 font-normal mt-0.5">Manage case & leads</span>
                </label>

                <label
                  className={`p-3 rounded-lg border cursor-pointer flex flex-col items-center text-center ${
                    role === 'public_reporter'
                      ? 'border-peach-500 bg-peach-50/70 text-peach-900 font-bold'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="public_reporter"
                    checked={role === 'public_reporter'}
                    onChange={() => setRole('public_reporter')}
                    className="hidden"
                  />
                  <span>Public Reporter</span>
                  <span className="text-[10px] text-slate-400 font-normal mt-0.5">Submit sightings</span>
                </label>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 italic">
                Note: Investigator and Administrator roles require manual institutional vetting.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-plum-600 hover:bg-plum-700 text-white shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Complete Registration & Sign In'}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-plum-600 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
