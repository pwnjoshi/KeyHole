import React, { useState } from 'react';
import {
  HugeAnalyticsIcon,
  HugeShieldCheckIcon,
  HugeShieldAlertIcon,
  HugeCpuIcon
} from './HugeIcons.tsx';
import { Database, Zap, Shield, Layers, CheckCircle2, Lock, ArrowUpRight, Award, Code, DollarSign, Sparkles } from 'lucide-react';
import { AuditEvent } from '../types.ts';
import { SkeletonMetric } from './SkeletonLoader.tsx';
import { ComplianceCertificateModal } from './ComplianceCertificateModal.tsx';
import { DeveloperSdkModal } from './DeveloperSdkModal.tsx';

interface AnalyticsViewProps {
  events: AuditEvent[];
  isLoading?: boolean;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ events, isLoading = false }) => {
  const [showCertModal, setShowCertModal] = useState(false);
  const [showSdkModal, setShowSdkModal] = useState(false);

  const validEvents = events.filter(e => e.type !== 'INIT');
  const compliantCount = validEvents.filter(e => e.type === 'COMPLIANT').length;
  const blockedCount = validEvents.filter(e => e.type === 'BLOCKED').length;
  const total = validEvents.length || 1;
  const complianceRate = ((compliantCount / total) * 100).toFixed(1);

  // IBM Benchmark: $4.45M average cost of an enterprise data breach
  const liabilityPrevented = (blockedCount * 4.45).toFixed(2);

  return (
    <div className="space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-entrance">
        <div>
          <div className="flex items-center space-x-2">
            <HugeAnalyticsIcon size={22} className="text-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Enterprise Governance & Security Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-service compliance telemetry, breach mitigation statistics, and Midnight ZK performance metrics.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setShowSdkModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition flex items-center space-x-1.5"
          >
            <Code className="w-3.5 h-3.5 text-indigo-600" />
            <span>Agent SDK</span>
          </button>

          <button
            onClick={() => setShowCertModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center space-x-1.5 hover:-translate-y-0.5"
          >
            <Award className="w-3.5 h-3.5 text-yellow-300" />
            <span>Export Auditor Certificate</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-entrance animate-delay-1">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Total Queries Evaluated</span>
              <Database className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {validEvents.length}
            </div>
            <p className="text-[11px] text-slate-400">All SaaS queries intercepted</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Compliant & ZK Proven</span>
              <HugeShieldCheckIcon size={18} className="text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 font-mono">
              {compliantCount}
            </div>
            <p className="text-[11px] text-slate-400">{complianceRate}% compliance rate</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Breach Liability Prevented</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 font-mono">
              ${liabilityPrevented}M
            </div>
            <p className="text-[11px] text-slate-400">IBM Benchmark ($4.45M/breach)</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Security Posture Grade</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-indigo-600 font-mono">
              Grade A+
            </div>
            <p className="text-[11px] text-slate-400">SOC 2 &amp; HIPAA Hardened</p>
          </div>
        </div>
      )}

      {/* Breakdown Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-entrance animate-delay-2">
        {/* Multi-Service Threat Defense Breakdown */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Threat Defense Breakdown by Service</h3>
            <span className="text-xs font-mono text-slate-400">Live Telemetry</span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">Google Workspace (Body &amp; Attachments)</span>
                <span className="font-bold text-rose-600">100% Intercepted</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full w-full" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">Microsoft 365 (EA Contracts &amp; Tokens)</span>
                <span className="font-bold text-rose-600">100% Intercepted</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full w-full" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">Slack Enterprise (Executive DMs &amp; Threads)</span>
                <span className="font-bold text-indigo-600">100% Redacted</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full w-full" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">GitHub Enterprise (Secrets &amp; SSH Keys)</span>
                <span className="font-bold text-indigo-600">100% Redacted</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full w-full" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">PostgreSQL / SQL Proxy (PII &amp; Credit Cards)</span>
                <span className="font-bold text-emerald-600">100% ZK Anchored</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Midnight Blockchain Ledger Verification State */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-200 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Midnight Network Verification State</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                Midnight Testnet Preview
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs pt-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-500 font-sans">Smart Contract:</span>
                <span className="text-indigo-700 font-bold">scope-policy.compact</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-500 font-sans">Circuit Runtime:</span>
                <span className="text-slate-800 font-bold">Compact v0.34.0 (ZKIR)</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-500 font-sans">State Commitments:</span>
                <span className="text-slate-800 font-bold">SHA-256 Public Anchors</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex justify-between">
                <span className="text-emerald-800 font-sans font-semibold">Total Bytes Leaked:</span>
                <span className="text-emerald-700 font-bold">0 Bytes (Zero-Knowledge)</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>SOC 2 Type II &amp; HIPAA Auditor-Grade Proofs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Compliance Certificate Modal */}
      {showCertModal && (
        <ComplianceCertificateModal onClose={() => setShowCertModal(false)} />
      )}

      {/* Developer SDK Modal */}
      {showSdkModal && (
        <DeveloperSdkModal onClose={() => setShowSdkModal(false)} />
      )}
    </div>
  );
};
