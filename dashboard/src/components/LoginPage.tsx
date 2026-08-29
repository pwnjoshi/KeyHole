import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { HugeKeyholeIcon } from './HugeIcons.tsx';
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  KeyRound,
  Shield,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building
} from 'lucide-react';
import { AuthUser } from '../types.ts';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@keyhole.sec');
  const [password, setPassword] = useState('midnight2026');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'security_auditor' | 'developer' | 'ciso'>('admin');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('keyhole-jwt');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (authMode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name');
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }
    }

    try {
      const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload = authMode === 'register'
        ? { name: name.trim(), email: email.trim(), password, role }
        : { email: email.trim(), password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('keyhole-jwt', data.token);
        onLoginSuccess(data.user, data.token);
        navigate(from, { replace: true });
      } else {
        setError(data.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(`Network error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setAuthMode('login');
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center px-4 py-8 animate-entrance">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto shadow-md">
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="5.8" r="2.8" fill="#ffffff"/>
              <path d="M6.6 7.2L5.4 13H10.6L9.4 7.2H6.6Z" fill="#ffffff"/>
              <circle cx="8" cy="5.8" r="1.1" fill="#4f46e5"/>
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {authMode === 'login' ? 'Sign In to Keyhole' : 'Create Enterprise Account'}
          </h1>
          <p className="text-xs text-slate-500">
            {authMode === 'login'
              ? 'Access protected policy engine, agent studio, and integrations.'
              : 'Register for cryptographic zero-knowledge AI access.'}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Register */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition text-center ${
              authMode === 'login'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition text-center ${
              authMode === 'register'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Name & Role for Registration */}
          {authMode === 'register' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-sans"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Enterprise Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-sans font-medium"
                >
                  <option value="admin">Security Administrator</option>
                  <option value="security_auditor">Compliance Officer / Auditor</option>
                  <option value="developer">AI &amp; Systems Developer</option>
                  <option value="ciso">Chief Information Security Officer (CISO)</option>
                </select>
              </div>
            </>
          )}

          {/* Email Address */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.corp"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-sans"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Password with Strength & Eye Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">
                Password
              </label>
              {authMode === 'register' && password && (
                <span className={`text-[10px] font-bold uppercase font-mono ${
                  passwordStrength.score === 3 ? 'text-emerald-600' : passwordStrength.score === 2 ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {passwordStrength.label}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-sans"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Meter */}
            {authMode === 'register' && password && (
              <div className="grid grid-cols-3 gap-1 pt-1.5">
                <div className={`h-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate-200'}`} />
                <div className={`h-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-200'}`} />
                <div className={`h-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-200'}`} />
              </div>
            )}
          </div>

          {/* Confirm Password for Register */}
          {authMode === 'register' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-sans"
                />
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20 hover:-translate-y-0.5"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{authMode === 'login' ? 'Authenticating...' : 'Creating Account...'}</span>
              </>
            ) : (
              <>
                <span>{authMode === 'login' ? 'Sign In to Dashboard' : 'Complete Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Test Accounts for Evaluators / Judges */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">
            Quick 1-Click Test Accounts:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@keyhole.sec', 'midnight2026')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-left transition group"
            >
              <span className="font-bold text-slate-800 block text-[11px] group-hover:text-indigo-600">
                Security Admin
              </span>
              <span className="text-[10px] text-slate-500 font-mono">admin@keyhole.sec</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('auditor@midnight.network', 'midnight2026')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-left transition group"
            >
              <span className="font-bold text-slate-800 block text-[11px] group-hover:text-indigo-600">
                Compliance Officer
              </span>
              <span className="text-[10px] text-slate-500 font-mono">auditor@midnight...</span>
            </button>
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-400 font-mono">
          Keyhole ZK Gateway · Passwords encrypted with SHA-256 in local SQLite WAL
        </div>
      </div>
    </div>
  );
};
