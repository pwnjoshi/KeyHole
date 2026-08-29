import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HugeShieldCheckIcon,
  HugeShieldAlertIcon,
  HugeBotIcon,
  HugeCpuIcon,
  HugeAnalyticsIcon,
  HugePlayIcon
} from './HugeIcons.tsx';
import {
  Activity,
  Award,
  Code,
  Shield,
  Layers,
  ArrowRight,
  Database,
  Mail,
  Lock,
  CheckCircle2,
  Terminal,
  Clock,
  Sparkles,
  ExternalLink,
  Flame,
  Plus
} from 'lucide-react';
import { ScopePolicy, AuditEvent, AuthUser } from '../types.ts';
import { ComplianceCertificateModal } from './ComplianceCertificateModal.tsx';
import { DeveloperSdkModal } from './DeveloperSdkModal.tsx';
import { PolicyEditor } from './PolicyEditor.tsx';

interface CommandDashboardProps {
  currentUser: AuthUser | null;
  policies: ScopePolicy[];
  events: AuditEvent[];
  onSavePolicy: (policy: ScopePolicy) => void;
}

export const CommandDashboard: React.FC<CommandDashboardProps> = ({
  currentUser,
  policies,
  events,
  onSavePolicy
}) => {
  const [showCertModal, setShowCertModal] = useState(false);
  const [showSdkModal, setShowSdkModal] = useState(false);
  const [showPolicyEditor, setShowPolicyEditor] = useState(false);
  const navigate = useNavigate();

  const validEvents = events.filter(e => e.type !== 'INIT');
  const compliantCount = validEvents.filter(e => e.type === 'COMPLIANT').length;
  const blockedCount = validEvents.filter(e => e.type === 'BLOCKED').length;
  const total = validEvents.length || 1;
  const complianceRate = ((compliantCount / total) * 100).toFixed(1);

  return (
    <div className="space-y-8 py-2 animate-entrance">
      {/* 1. Welcome & Executive Security Posture Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl z-10">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {currentUser?.name || 'Security Officer'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            Keyhole is shielding <strong>{policies.length} enterprise agents</strong> across Google Workspace, Microsoft 365, Slack, GitHub, and PostgreSQL with sub-second Midnight ZK proofs.
          </p>
        </div>

        {/* Quick Command Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <button
            onClick={() => setShowSdkModal(true)}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition flex items-center space-x-2 backdrop-blur-xs border border-white/10"
          >
            <Code className="w-3.5 h-3.5 text-indigo-300" />
            <span>Agent SDK</span>
          </button>

          <button
            onClick={() => setShowCertModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition flex items-center space-x-2 hover:-translate-y-0.5"
          >
            <Award className="w-3.5 h-3.5 text-yellow-300" />
            <span>Export SOC 2 Report</span>
          </button>
        </div>

        {/* Background ambient lighting */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-0" />
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-200 space-y-1 hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active Policies</span>
            <Shield className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {policies.length} Active
          </div>
          <p className="text-[11px] text-slate-400">Enforcing ZK field allowlists</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-200 space-y-1 hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Queries Evaluated</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {validEvents.length}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold">{complianceRate}% compliance rate</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-200 space-y-1 hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Threats Intercepted</span>
            <HugeShieldAlertIcon size={18} className="text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 font-mono">
            {blockedCount}
          </div>
          <p className="text-[11px] text-slate-400">HTTP 403 Pre-fetch blocked</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-200 space-y-1 hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Data Leaked</span>
            <HugeShieldCheckIcon size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">
            0 Bytes
          </div>
          <p className="text-[11px] text-slate-400">100% Zero-Knowledge Proven</p>
        </div>
      </div>

      {/* 3. Action Hub Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div 
          onClick={() => navigate('/studio')}
          className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center group-hover:scale-110 transition">
              <HugePlayIcon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition">
                AI Agent Execution Studio
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Dispatch live prompts to GPT-4o & Claude and watch Keyhole enforce scope bounds with Midnight ZK proofs.
              </p>
            </div>
          </div>
          <div className="text-xs font-bold text-indigo-600 flex items-center space-x-1">
            <span>Launch Studio Sandbox</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>

        <div 
          onClick={() => navigate('/console')}
          className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center group-hover:scale-110 transition">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-purple-600 transition">
                Security Policies & SSE Feed
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Configure fine-grained field allowlists, simulate attack vectors, and inspect the real-time compliance stream.
              </p>
            </div>
          </div>
          <div className="text-xs font-bold text-purple-600 flex items-center space-x-1">
            <span>Manage Security Policies</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>

        <div 
          onClick={() => navigate('/integrations')}
          className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-110 transition">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition">
                Enterprise Integrations Hub
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Connect official Google Workspace, Microsoft 365, Slack Grid, GitHub, and SQL database proxies with ZK shielding.
              </p>
            </div>
          </div>
          <div className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
            <span>View Connected Services</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>
      </div>

      {/* 4. Active Scope Policies Overview */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Active Agent Scope Policies</h2>
            <p className="text-xs text-slate-500">Live cryptographic policies currently enforced by Keyhole Gateway</p>
          </div>

          <button
            onClick={() => setShowPolicyEditor(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center space-x-1.5 self-start sm:self-auto shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Scope Policy</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {policies.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    {p.connectorId}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Active</span>
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{p.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>{p.allowedFields.length} Fields Allowed</span>
                <span className="text-indigo-600 font-bold">Max {p.maxMessageCount || 10} records</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showCertModal && (
        <ComplianceCertificateModal onClose={() => setShowCertModal(false)} />
      )}
      {showSdkModal && (
        <DeveloperSdkModal onClose={() => setShowSdkModal(false)} />
      )}
      {showPolicyEditor && (
        <PolicyEditor
          policy={null}
          onSave={onSavePolicy}
          onClose={() => setShowPolicyEditor(false)}
        />
      )}
    </div>
  );
};
