import React, { useState } from 'react';
import {
  User,
  Lock,
  Key,
  Shield,
  Check,
  Copy,
  RefreshCw,
  Mail,
  Building,
  Globe,
  Bell,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Wallet,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { AuthUser } from '../types.ts';

interface AccountSettingsProps {
  currentUser: AuthUser | null;
  onUpdateUser: (user: AuthUser, token?: string) => void;
  walletAddress: string | null;
  onOpenWalletModal: () => void;
}

type SettingsTab = 'profile' | 'security' | 'api_keys' | 'midnight';

export const AccountSettings: React.FC<AccountSettingsProps> = ({
  currentUser,
  onUpdateUser,
  walletAddress,
  onOpenWalletModal
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Profile Form state
  const [name, setName] = useState(currentUser?.name || '');
  const [role, setRole] = useState<'admin' | 'security_auditor' | 'developer' | 'ciso'>(
    (currentUser?.role as any) || 'admin'
  );
  const [organization, setOrganization] = useState(
    (currentUser as any)?.organization || 'Acme Cyber Security Corp'
  );
  const [timezone, setTimezone] = useState(
    (currentUser as any)?.timezone || 'UTC (GMT+0)'
  );
  const [emailNotifications, setEmailNotifications] = useState(
    (currentUser as any)?.emailNotifications !== false
  );

  // Security Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // API Key state
  const [apiKey, setApiKey] = useState(
    (currentUser as any)?.apiKey || 'kh_live_9f8a2b3c4d5e6f7a8b9c0d1e2f3a4b5'
  );
  const [copiedKey, setCopiedKey] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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

  const passwordStrength = getPasswordStrength(newPassword);

  // 1. Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    const token = localStorage.getItem('keyhole-jwt');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          role,
          organization,
          timezone,
          emailNotifications
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem('keyhole-jwt', data.token);
        }
        onUpdateUser(data.user, data.token);
        setStatusMessage({ text: 'Your profile details have been successfully saved!', type: 'success' });
      } else {
        setStatusMessage({ text: data.error || 'Failed to update profile', type: 'error' });
      }
    } catch (err: any) {
      setStatusMessage({ text: `Network error: ${err.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setStatusMessage({ text: 'Please enter your current password', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setStatusMessage({ text: 'New password must be at least 6 characters', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    const token = localStorage.getItem('keyhole-jwt');
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ text: 'Password successfully changed! Please keep your new password safe.', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setStatusMessage({ text: data.error || 'Failed to update password', type: 'error' });
      }
    } catch (err: any) {
      setStatusMessage({ text: `Network error: ${err.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle Regenerate API Key
  const handleRegenerateApiKey = async () => {
    if (!window.confirm('Are you sure you want to regenerate your API key? Any running agents using the old key will need to be updated.')) {
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    const token = localStorage.getItem('keyhole-jwt');
    try {
      const res = await fetch('/api/auth/api-keys/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setApiKey(data.apiKey);
        setStatusMessage({ text: 'New personal access token generated successfully!', type: 'success' });
      } else {
        setStatusMessage({ text: data.error || 'Failed to generate token', type: 'error' });
      }
    } catch (err: any) {
      setStatusMessage({ text: `Error: ${err.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-entrance pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account &amp; Security Settings</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your enterprise credentials, personal access tokens, and Midnight Zero-Knowledge identities.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-bold flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Authenticated ({currentUser?.role || 'Admin'})</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 p-1 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        {[
          { id: 'profile', label: 'Profile & Organization', icon: User },
          { id: 'security', label: 'Password & Security', icon: Lock },
          { id: 'api_keys', label: 'Developer API Keys', icon: Key },
          { id: 'midnight', label: 'Midnight Identity & Wallet', icon: Wallet }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as SettingsTab);
                setStatusMessage(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Status Notifications */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center space-x-2.5 animate-in fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* TAB 1: PROFILE & ORGANIZATION */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Personal &amp; Enterprise Profile</h2>
            <p className="text-xs text-slate-500">Configure how your identity appears across policy audit trails and compliance reports.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Full Name</label>
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
              <label className="block font-bold text-slate-700 mb-1.5">Corporate Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || ''}
                  className="w-full pl-9 pr-20 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-sans cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <span className="absolute right-2.5 top-2 px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                  Verified
                </span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Enterprise Role</label>
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

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Organization / Team</label>
              <div className="relative">
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Acme Cyber Security Corp"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-sans"
                />
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Audit Log Timezone</label>
              <div className="relative">
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-sans font-medium"
                >
                  <option value="UTC (GMT+0)">UTC (GMT+0) - Standard Universal</option>
                  <option value="EST (GMT-5)">EST (GMT-5) - US Eastern</option>
                  <option value="PST (GMT-8)">PST (GMT-8) - US Pacific</option>
                  <option value="CET (GMT+1)">CET (GMT+1) - Central Europe</option>
                  <option value="NPT (GMT+5:45)">NPT (GMT+5:45) - Nepal Standard</option>
                  <option value="IST (GMT+5:30)">IST (GMT+5:30) - India Standard</option>
                  <option value="JST (GMT+9)">JST (GMT+9) - Tokyo</option>
                </select>
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 self-end">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 block">Security Alert Emails</span>
                <span className="text-[11px] text-slate-500">Receive Resend alerts on honeypot canary breaches</span>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center space-x-2 shadow-sm hover:-translate-y-0.5"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: PASSWORD & SECURITY */}
      {activeTab === 'security' && (
        <form onSubmit={handleChangePassword} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Change Account Password</h2>
            <p className="text-xs text-slate-500">Update your master password to protect your zero-knowledge policy console.</p>
          </div>

          <div className="space-y-4 max-w-md text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-sans"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-sans"
                />
                <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {newPassword && (
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

            <div>
              <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
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
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center space-x-2 shadow-sm hover:-translate-y-0.5"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
              <span>Update Master Password</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: DEVELOPER API KEYS */}
      {activeTab === 'api_keys' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">Personal Access Tokens &amp; SDK Keys</h2>
              <p className="text-xs text-slate-500">Authenticate autonomous AI agent scripts with your Keyhole gateway policies.</p>
            </div>
            <button
              onClick={handleRegenerateApiKey}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Regenerate Key</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 text-xs">Live API Gateway Key</label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-3 rounded-xl bg-slate-900 text-indigo-300 font-mono text-xs border border-slate-800 truncate">
                  {apiKey}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(apiKey);
                    setCopiedKey(true);
                    setTimeout(() => setCopiedKey(false), 2000);
                  }}
                  className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-sm"
                >
                  {copiedKey ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Pass this key via <code className="text-indigo-600 font-mono font-bold">Authorization: Bearer {'{API_KEY}'}</code> to authenticate agent tool runs.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block font-mono">1-Line Python SDK Integration:</span>
              <pre className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-800 overflow-x-auto">
{`from keyhole import KeyholeShield
shield = KeyholeShield(gateway_url="https://keyhole.techsangi.com.np", api_key="${apiKey}")
tools = shield.get_tools(["gmail", "m365", "slack", "github", "postgres"])`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MIDNIGHT NETWORK & CRYPTOGRAPHIC IDENTITY */}
      {activeTab === 'midnight' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Midnight Network &amp; Zero-Knowledge Identity</h2>
            <p className="text-xs text-slate-500">View your connected Lace wallet, proof gas balance, and cryptographic prover state.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Lace DApp Wallet</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  walletAddress ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  {walletAddress ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 truncate">
                {walletAddress || '0x0000000000000000000000000000000000000000'}
              </div>
              <button
                onClick={onOpenWalletModal}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5"
              >
                <Wallet className="w-3.5 h-3.5 text-indigo-400" />
                <span>{walletAddress ? 'Manage Lace Wallet' : 'Connect Lace Wallet'}</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Prover Node Engine</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-mono font-bold">
                  Compact v0.34
                </span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>Proving Architecture:</span>
                  <span className="font-bold text-slate-800">Local Compact ZKIR Prover</span>
                </div>
                <div className="flex justify-between">
                  <span>Proving Latency:</span>
                  <span className="font-bold text-emerald-600">~7ms median (Sub-second)</span>
                </div>
                <div className="flex justify-between">
                  <span>Network Target:</span>
                  <span className="font-bold text-indigo-600">Midnight Testnet Preview (42)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
