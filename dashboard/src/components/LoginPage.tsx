import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  KeyRound,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  Send
} from 'lucide-react';
import { AuthUser } from '../types.ts';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser, token: string) => void;
}

type AuthScreen = 'login' | 'register' | 'verify_otp' | 'forgot_password' | 'reset_password';

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<AuthScreen>('login');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@keyhole.sec');
  const [password, setPassword] = useState('midnight2026');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'security_auditor' | 'developer' | 'ciso'>('admin');
  
  // OTP & Reset fields
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  // Resend Timer Countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

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

  // 1. Handle Login or Initial Registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

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

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), password, role })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setAuthMode('verify_otp');
          setPreviewOtp(data.previewOtp || null);
          setResendTimer(60);
          setSuccessMessage(data.message || '6-digit verification code sent to your email.');
        } else {
          setError(data.error || 'Registration failed. Please check your information.');
        }
      } catch (err: any) {
        setError(`Network error: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Standard Sign In
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
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

  // 2. Handle OTP Verification for Registration
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      setError('Please enter the full 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otpCode.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('keyhole-jwt', data.token);
        onLoginSuccess(data.user, data.token);
        navigate(from, { replace: true });
      } else {
        setError(data.error || 'Invalid or expired code. Please try again.');
      }
    } catch (err: any) {
      setError(`Verification error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle Resend OTP
  const handleResendOtp = async (type: 'register' | 'reset_password') => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), type })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResendTimer(60);
        if (data.previewOtp) setPreviewOtp(data.previewOtp);
        setSuccessMessage('A fresh 6-digit code was sent to ' + email);
      } else {
        setError(data.error || 'Failed to resend code.');
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Handle Requesting Password Reset
  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your account email address');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAuthMode('reset_password');
        setPreviewOtp(data.previewOtp || null);
        setResendTimer(60);
        setSuccessMessage(data.message || 'Password reset code sent to your email.');
      } else {
        setError(data.error || 'Unable to initiate password reset.');
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Handle Submitting New Password with OTP
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: otpCode.trim(),
          newPassword
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAuthMode('login');
        setPassword(newPassword);
        setSuccessMessage('Password reset successfully! You can now sign in.');
      } else {
        setError(data.error || 'Failed to reset password.');
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[78vh] flex flex-col justify-center items-center px-4 py-8 animate-entrance">
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
            {authMode === 'login' && 'Sign In to Keyhole'}
            {authMode === 'register' && 'Create Enterprise Account'}
            {authMode === 'verify_otp' && 'Verify Your Email'}
            {authMode === 'forgot_password' && 'Reset Password'}
            {authMode === 'reset_password' && 'Enter New Password'}
          </h1>
          <p className="text-xs text-slate-500">
            {authMode === 'login' && 'Access protected policy engine, agent studio, and integrations.'}
            {authMode === 'register' && 'Register for cryptographic zero-knowledge AI access.'}
            {authMode === 'verify_otp' && `Enter the 6-digit code dispatched to ${email}`}
            {authMode === 'forgot_password' && 'Enter your registered email to receive a recovery code.'}
            {authMode === 'reset_password' && `Enter the code sent to ${email} and your new password.`}
          </p>
        </div>

        {/* Tab Switcher: Only shown on Login/Register modes */}
        {(authMode === 'login' || authMode === 'register') && (
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setError(null);
                setSuccessMessage(null);
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
                setSuccessMessage(null);
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
        )}

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Notification */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE 1 & 2: SIGN IN & REGISTRATION FORMS                    */}
        {/* ============================================================ */}
        {(authMode === 'login' || authMode === 'register') && (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
                    <option value="developer">AI Platform Engineer</option>
                    <option value="ciso">Chief Information Security Officer (CISO)</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Corporate Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@enterprise.corp"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-sans"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">
                  Password
                </label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot_password');
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-indigo-600 hover:text-indigo-700 font-medium text-[11px] hover:underline"
                  >
                    Forgot password?
                  </button>
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
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {authMode === 'register' && password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Security Strength</span>
                    <span className="font-bold text-slate-700">{passwordStrength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate-200'}`} />
                    <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-200'}`} />
                    <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-200'}`} />
                  </div>
                </div>
              )}
            </div>

            {authMode === 'register' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
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
                  <span>{authMode === 'login' ? 'Authenticating...' : 'Sending Security Code...'}</span>
                </>
              ) : (
                <>
                  <span>{authMode === 'login' ? 'Sign In to Dashboard' : 'Send 6-Digit Email Verification Code'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ============================================================ */}
        {/* MODE 3: 6-DIGIT EMAIL OTP VERIFICATION SCREEN               */}
        {/* ============================================================ */}
        {authMode === 'verify_otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 text-xs animate-in fade-in">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 text-center text-sm">
                Enter 6-Digit Security Code
              </label>
              <div className="relative max-w-[260px] mx-auto">
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center text-2xl tracking-[10px] font-mono py-3 px-4 rounded-xl bg-slate-50 border-2 border-indigo-500 text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-100 font-bold"
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center mt-2">
                Check your inbox or spam folder for an email from Keyhole Security.
              </p>
            </div>

            {previewOtp && (
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-center space-y-1">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                  Developer Test Mode Code
                </span>
                <span className="text-lg font-mono font-black text-indigo-900 tracking-widest">
                  {previewOtp}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || otpCode.length < 6}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Activating Account...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Code & Enter Dashboard</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className="flex items-center space-x-1 text-slate-500 hover:text-slate-800 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Edit Registration</span>
              </button>

              <button
                type="button"
                disabled={resendTimer > 0 || isLoading}
                onClick={() => handleResendOtp('register')}
                className="font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-40 transition"
              >
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* MODE 4: FORGOT PASSWORD REQUEST SCREEN                      */}
        {/* ============================================================ */}
        {authMode === 'forgot_password' && (
          <form onSubmit={handleRequestPasswordReset} className="space-y-4 text-xs animate-in fade-in">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Your Account Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@enterprise.corp"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-sans"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending Recovery Code...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Password Reset Code</span>
                </>
              )}
            </button>

            <div className="text-center pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError(null);
                }}
                className="text-slate-600 hover:text-slate-900 font-semibold flex items-center justify-center space-x-1 mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* MODE 5: RESET PASSWORD WITH OTP SCREEN                      */}
        {/* ============================================================ */}
        {authMode === 'reset_password' && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs animate-in fade-in">
            <div>
              <label className="block font-bold text-slate-700 mb-1 text-center">
                6-Digit Reset Code
              </label>
              <div className="relative max-w-[200px] mx-auto">
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center text-xl tracking-[8px] font-mono py-2.5 px-3 rounded-xl bg-slate-50 border-2 border-indigo-500 text-slate-900 focus:outline-none font-bold"
                />
              </div>
            </div>

            {previewOtp && (
              <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                  Reset Code
                </span>
                <span className="text-base font-mono font-black text-indigo-900 tracking-widest">
                  {previewOtp}
                </span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-sans"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-sans"
                />
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Set New Password & Sign In</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="flex items-center space-x-1 text-slate-500 hover:text-slate-800 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>

              <button
                type="button"
                disabled={resendTimer > 0 || isLoading}
                onClick={() => handleResendOtp('reset_password')}
                className="font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-40 transition"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        {/* 1-Click Instant Demo Login for Judges & Evaluators (Always visible on login) */}
        {authMode === 'login' && (
          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
            <button
              type="button"
              onClick={async () => {
                setIsLoading(true);
                setError(null);
                try {
                  const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: 'admin@keyhole.sec', password: 'midnight2026' })
                  });
                  const data = await res.json();
                  if (res.ok && data.success) {
                    localStorage.setItem('keyhole-jwt', data.token);
                    onLoginSuccess(data.user, data.token);
                    navigate(from, { replace: true });
                  } else {
                    setEmail('admin@keyhole.sec');
                    setPassword('midnight2026');
                  }
                } catch {
                  setEmail('admin@keyhole.sec');
                  setPassword('midnight2026');
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-slate-700 hover:text-indigo-700 text-xs font-bold transition flex items-center justify-center space-x-2 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>1-Click Instant Sign In (Judge Demo Account)</span>
            </button>
          </div>
        )}

        <div className="text-center text-[10px] text-slate-400 font-mono">
          Keyhole ZK Gateway &bull; Zero-Knowledge Perimeter on Midnight Compact v0.34
        </div>
      </div>
    </div>
  );
};
