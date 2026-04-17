/**
 * LoginScreen.jsx — Simulated authentication UI.
 *
 * Features:
 * - Email input + role toggle (User / Hospital)
 * - Sign In button (validates against mock users)
 * - Quick-login buttons for demo (no email needed)
 * - Animated glassmorphism card
 * - Dark mode aware
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DEMO_ACCOUNTS } from '../../data/users';
import { Heart, Building2, User, Zap, AlertCircle, ArrowRight, Stethoscope } from 'lucide-react';

const LoginScreen = () => {
  const { login, quickLogin, isLoggingIn, loginError } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    await login(email.trim(), role);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-32 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.7s' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="relative w-full max-w-md mx-4">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-blue-500/30 mb-4">
            <Heart className="w-8 h-8 text-white" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1">MedConnect</h1>
          <p className="text-slate-400 text-sm">Unified Digital Health Ecosystem</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Role Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-black/20 rounded-xl">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                role === 'user'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              Patient
            </button>
            <button
              type="button"
              onClick={() => setRole('hospital')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                role === 'hospital'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Hospital
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                role === 'doctor'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              Doctor
            </button>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={role === 'user' ? 'rahul@demo.com' : 'admin.ruby@demo.com'}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {loginError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-red-400 text-xs">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn || !email.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {isLoggingIn ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-500 font-medium">Or try demo</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Quick Demo Logins */}
          <div className="space-y-2">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">
              <Zap className="w-3 h-3 inline mr-1 text-amber-400" />
              Quick Login (No credentials needed)
            </p>

            {role === 'user' ? (
              <>
                <QuickLoginBtn
                  label="🫀 Anil Kapoor — Cardiac Patient"
                  sublabel="Primary Doctor: Dr. Arjun Mehta · Triggers Cardiac Emergency Flow"
                  color="red"
                  onClick={() => quickLogin(DEMO_ACCOUNTS.user)}
                  loading={isLoggingIn}
                />
                <QuickLoginBtn
                  label="💉 Priya Iyer — Diabetic Patient"
                  sublabel="Primary Doctor: Dr. Anjali Tiwari · Triggers Diabetic Emergency Flow"
                  color="amber"
                  onClick={() => quickLogin(DEMO_ACCOUNTS.user2)}
                  loading={isLoggingIn}
                />
                <QuickLoginBtn
                  label="🧠 Rohan Desai — Neuro Patient"
                  sublabel="Primary Doctor: Dr. Priya Sharma · Triggers Neuro Emergency Flow"
                  color="blue"
                  onClick={() => quickLogin(DEMO_ACCOUNTS.user3)}
                  loading={isLoggingIn}
                />
              </>
            ) : role === 'hospital' ? (
              <>
                <QuickLoginBtn
                  label="🏥 Ruby Hall Clinic"
                  sublabel="Receives specialist banner when Anil calls ambulance"
                  color="green"
                  onClick={() => quickLogin(DEMO_ACCOUNTS.hospitalAdmin)}
                  loading={isLoggingIn}
                />
                <QuickLoginBtn
                  label="🏥 KEM Hospital"
                  sublabel="Receives specialist banner when Priya calls ambulance"
                  color="cyan"
                  onClick={() => quickLogin(DEMO_ACCOUNTS.hospitalAdmin2)}
                  loading={isLoggingIn}
                />
                <QuickLoginBtn
                  label="🏥 Sahyadri Hospital"
                  sublabel="Receives specialist banner when Rohan calls ambulance"
                  color="teal"
                  onClick={() => quickLogin(DEMO_ACCOUNTS.hospitalAdmin3)}
                  loading={isLoggingIn}
                />
              </>
            ) : (
              <>
                <QuickLoginBtn
                  label="🩺 Dr. Arjun Mehta — Cardiology"
                  sublabel="Alerted for Anil Kapoor · Views cardiac reports + live vitals"
                  color="teal"
                  onClick={() => quickLogin(DEMO_ACCOUNTS.doctor)}
                  loading={isLoggingIn}
                />
                <QuickLoginBtn
                  label="🩺 Dr. Anjali Tiwari — General Medicine"
                  sublabel="Alerted for Priya Iyer · Views diabetic reports + live vitals"
                  color="purple"
                  onClick={() => quickLogin(DEMO_ACCOUNTS.doctor2)}
                  loading={isLoggingIn}
                />
                <QuickLoginBtn
                  label="🩺 Dr. Priya Sharma — Neurology"
                  sublabel="Alerted for Rohan Desai · Views neuro reports + live vitals"
                  color="blue"
                  onClick={() => quickLogin(DEMO_ACCOUNTS.doctor3)}
                  loading={isLoggingIn}
                />
              </>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-slate-600 text-xs mt-6">
          Hackathon Prototype — All data is simulated
        </p>
      </div>
    </div>
  );
};

// ── Helper: Quick Login Button ─────────────────────────────────────────────────
const colorMap = {
  blue:   'border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/10',
  cyan:   'border-cyan-500/30 hover:border-cyan-500/60 hover:bg-cyan-500/10',
  purple: 'border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/10',
  green:  'border-green-500/30 hover:border-green-500/60 hover:bg-green-500/10',
  teal:   'border-teal-500/30 hover:border-teal-500/60 hover:bg-teal-500/10',
  amber:  'border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/10',
  red:    'border-red-500/30 hover:border-red-500/60 hover:bg-red-500/10',
};

const QuickLoginBtn = ({ label, sublabel, color, onClick, loading }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border bg-white/[0.03] text-left transition-all duration-200 disabled:opacity-50 active:scale-[0.98] ${colorMap[color]}`}
  >
    <Zap className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
    <div>
      <p className="text-white text-xs font-semibold leading-none mb-1">{label}</p>
      <p className="text-slate-500 text-[10px] leading-snug">{sublabel}</p>
    </div>
  </button>
);

export default LoginScreen;
