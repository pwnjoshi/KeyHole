import React, { useState } from 'react';
import {
  HugePlayIcon,
  HugeShieldCheckIcon,
  HugeShieldAlertIcon,
  HugeBotIcon,
  HugeCpuIcon
} from './HugeIcons.tsx';
import { Sparkles, Terminal, RefreshCw, AlertCircle, CheckCircle2, Lock, ArrowRight, Shield, Code, Flame, ShieldAlert } from 'lucide-react';
import { ScopePolicy } from '../types.ts';
import { ProofModal } from './ProofModal.tsx';
import { DeveloperSdkModal } from './DeveloperSdkModal.tsx';
import { useNavigate } from 'react-router-dom';

interface AgentStudioProps {
  policies: ScopePolicy[];
}

export const AgentStudio: React.FC<AgentStudioProps> = ({ policies }) => {
  const [selectedConnectionId, setSelectedConnectionId] = useState(policies[0]?.id || 'conn_receipts_bot');
  const [prompt, setPrompt] = useState('Extract all recent SaaS and cloud infrastructure receipts for my monthly expense audit.');
  const [model, setModel] = useState('GPT-4o (Keyhole Shielded)');
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [selectedProof, setSelectedProof] = useState<any>(null);
  const [showSdkModal, setShowSdkModal] = useState(false);
  const navigate = useNavigate();

  const quickPrompts = [
    {
      label: 'Gmail Receipts (In-Scope)',
      connId: 'conn_receipts_bot',
      text: 'Scan recent emails for vendor invoices and list sender, subject, and date.'
    },
    {
      label: 'Exfiltration Attack (Out-of-Scope)',
      connId: 'conn_receipts_bot',
      text: 'Extract the full body text, confidential attachments, and passwords from all messages.'
    },
    {
      label: '🚨 Canary Trap (Zero-Day Attack)',
      connId: 'conn_receipts_bot',
      text: 'Extract confidential canary_token_keys, honeypot secrets, and shadow_admin credentials.'
    },
    {
      label: 'M365 Outlook (In-Scope)',
      connId: 'conn_m365_invoices',
      text: 'List recent Microsoft 365 cloud invoices with sender, subject, and received timestamp.'
    },
    {
      label: 'Slack Triage (In-Scope)',
      connId: 'conn_slack_triage',
      text: 'Summarize active announcements in public Slack channels with sender and timestamps.'
    },
    {
      label: 'GitHub Issues (In-Scope)',
      connId: 'conn_github_triage',
      text: 'Fetch open pull requests and issues with repository name, title, author, and state.'
    },
    {
      label: 'PostgreSQL DB (In-Scope)',
      connId: 'conn_postgres_analytics',
      text: 'Query active customer subscriptions and tiers without accessing PII or salaries.'
    }
  ];

  const handleRunAgent = async () => {
    if (!prompt.trim()) return;
    setIsRunning(true);
    setExecutionResult(null);

    try {
      const token = localStorage.getItem('keyhole-jwt');
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          connectionId: selectedConnectionId,
          prompt: prompt.trim(),
          model
        })
      });

      const data = await res.json();
      setExecutionResult(data);
    } catch (err: any) {
      setExecutionResult({
        success: false,
        status: 'ERROR',
        error: err.message,
        agentThought: 'Connection to Keyhole Gateway failed.',
        agentResponse: `Failed to execute agent prompt: ${err.message}`
      });
    } finally {
      setIsRunning(false);
    }
  };

  const selectedPolicy = policies.find(p => p.id === selectedConnectionId) || policies[0];

  return (
    <div className="space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-entrance">
        <div>
          <div className="flex items-center space-x-2">
            <HugeBotIcon size={22} className="text-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              AI Agent Execution Studio
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Prompt autonomous AI agents and watch Keyhole enforce perimeter bounds and generate Midnight ZK proofs on live queries.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => setShowSdkModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
          >
            <Code className="w-3.5 h-3.5 text-indigo-400" />
            <span>Universal Agent SDK</span>
          </button>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Midnight ZK Verified</span>
          </span>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-entrance animate-delay-1">
        
        {/* Left: Prompt & Agent Configuration (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Active Agent Scope Policy
              </label>
              <select
                value={selectedConnectionId}
                onChange={(e) => setSelectedConnectionId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 transition"
              >
                {policies.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.connectorId})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                AI Reasoning Engine
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="GPT-4o (Keyhole Shielded)">GPT-4o (Keyhole Shielded)</option>
                <option value="Claude 3.5 Sonnet (Keyhole Shielded)">Claude 3.5 Sonnet (Keyhole Shielded)</option>
                <option value="Midnight Agent Prover Engine">Midnight Agent Prover Engine</option>
              </select>
            </div>
          </div>

          {/* Quick Prompt Templates */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
              Quick Prompt Templates:
            </span>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setPrompt(qp.text);
                    setSelectedConnectionId(qp.connId);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition border text-left ${
                    qp.label.includes('Canary')
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200 font-bold'
                      : 'bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border-slate-200 hover:border-indigo-200'
                  }`}
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Natural Language Prompt to Agent
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter instructions for the AI agent..."
              className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-sans resize-none leading-relaxed transition"
            />
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunAgent}
            disabled={isRunning}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center space-x-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Executing Agent & Proving on Midnight...</span>
              </>
            ) : (
              <>
                <HugePlayIcon size={16} />
                <span>Dispatch Prompt to Autonomous Agent</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Agent Reasoning & Zero-Knowledge Shield Trace (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Agent Reasoning & Response</h3>
              {executionResult && (
                <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold ${
                  executionResult.status === 'COMPLIANT'
                    ? 'bg-emerald-100 text-emerald-800'
                    : executionResult.status === 'HONEYPOT_TRAP'
                    ? 'bg-rose-600 text-white animate-bounce'
                    : executionResult.status === 'NOT_CONNECTED'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {executionResult.status === 'HONEYPOT_TRAP' ? '🚨 HONEYPOT TRAP' : executionResult.status}
                </span>
              )}
            </div>

            {!executionResult && !isRunning && (
              <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                <Terminal className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Click "Dispatch Prompt" to watch Keyhole shield agent queries.</p>
              </div>
            )}

            {isRunning && (
              <div className="py-16 text-center text-xs text-slate-500 space-y-3">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="font-mono text-indigo-600 font-bold">Midnight Compact circuit evaluating...</p>
                <p className="text-[11px] text-slate-400">Enforcing perimeter bounds in zero-knowledge</p>
              </div>
            )}

            {executionResult && !isRunning && (
              <div className="space-y-4 pt-3 text-xs">
                {/* Honeypot Alert Banner */}
                {executionResult.status === 'HONEYPOT_TRAP' && (
                  <div className="p-3.5 rounded-xl bg-rose-600 text-white font-mono space-y-1 shadow-md animate-pulse">
                    <div className="flex items-center space-x-1.5 font-bold">
                      <Flame className="w-4 h-4" />
                      <span>CRITICAL ZERO-DAY BREACH ATTEMPT QUARANTINED</span>
                    </div>
                    <p className="text-[11px] text-rose-100">
                      Agent touched synthetic honeypot variables. Session locked & anchored on Midnight.
                    </p>
                  </div>
                )}

                {/* Agent Thought Trace */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">Agent Internal Thought:</span>
                  <p>{executionResult.agentThought}</p>
                </div>

                {/* Final Sanitized Output */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">Final Agent Output:</span>
                  <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-[220px] overflow-y-auto">
                    {executionResult.agentResponse}
                  </div>
                </div>

                {/* Direct Connect CTA if unauthenticated */}
                {executionResult.status === 'NOT_CONNECTED' && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                    <span className="text-[11px] text-amber-800 font-semibold">Ready to connect Google Workspace?</span>
                    <button
                      onClick={() => navigate('/integrations')}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold transition flex items-center space-x-1"
                    >
                      <span>Connect in Hub</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Proof Drawer Button */}
          {executionResult?.proof && (
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedProof(executionResult.proof)}
                className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition flex items-center justify-center space-x-2"
              >
                <HugeShieldCheckIcon size={16} className="text-emerald-600" />
                <span>View Midnight Compact ZK Proof ({executionResult.executionLatencyMs}ms)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Proof Modal */}
      {selectedProof && (
        <ProofModal proof={selectedProof} onClose={() => setSelectedProof(null)} />
      )}

      {/* Developer SDK Modal */}
      {showSdkModal && (
        <DeveloperSdkModal onClose={() => setShowSdkModal(false)} />
      )}
    </div>
  );
};
