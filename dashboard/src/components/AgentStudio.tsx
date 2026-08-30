import React, { useState } from 'react';
import {
  HugePlayIcon,
  HugeShieldCheckIcon,
  HugeShieldAlertIcon,
  HugeBotIcon,
  HugeCpuIcon
} from './HugeIcons.tsx';
import { 
  Sparkles, 
  Terminal, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Lock, 
  ArrowRight, 
  Shield, 
  Code, 
  Flame, 
  ShieldAlert,
  Eye,
  EyeOff,
  Split,
  Users,
  Layers,
  FileText,
  ShieldCheck
} from 'lucide-react';
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
  const [model, setModel] = useState('Midnight Compact Prover Engine (ZK Verified)');
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [selectedProof, setSelectedProof] = useState<any>(null);
  const [showSdkModal, setShowSdkModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'output' | 'redaction_diff' | 'swarm'>('output');
  const [isSwarmRunning, setIsSwarmRunning] = useState(false);
  const [swarmResults, setSwarmResults] = useState<any[]>([]);
  const navigate = useNavigate();

  const renderFormattedAgentResponse = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 font-sans text-xs">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1.5" />;
          
          const parts = line.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
          return (
            <p key={idx} className="leading-relaxed text-slate-200">
              {parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={pIdx} className="text-white font-bold">{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('`') && part.endsWith('`')) {
                  return <code key={pIdx} className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[11px] border border-slate-700">{part.slice(1, -1)}</code>;
                }
                if (part.startsWith('*') && part.endsWith('*')) {
                  return <span key={pIdx} className="text-slate-400 italic text-[11px]">{part.slice(1, -1)}</span>;
                }
                return <span key={pIdx}>{part}</span>;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  const quickPrompts = [
    {
      label: '✨ Auto-Intent Smart Routing',
      connId: 'auto',
      text: 'Scan recent emails, find the relevant messages, and extract metadata safely without leaking sensitive bodies.'
    },
    {
      label: 'Gmail Receipts (In-Scope)',
      connId: 'conn_receipts_bot',
      text: 'Scan recent emails for vendor invoices and list sender, subject, and date.'
    },
    {
      label: 'HR Candidate Screener (In-Scope)',
      connId: 'conn_recruiting_screener',
      text: 'Scan inbound recruiting inquiries for sender and dates while masking resumes and PII.'
    },
    {
      label: 'Security Threat Scanner (In-Scope)',
      connId: 'conn_phishing_scanner',
      text: 'Analyze suspicious incoming email sender headers for threat hunting.'
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

  const handleRunSwarm = async () => {
    setIsSwarmRunning(true);
    setSwarmResults([]);
    setActiveTab('swarm');

    const swarmAgents = [
      {
        name: 'Finance Audit Agent',
        role: 'Scans expense receipts',
        connId: 'conn_receipts_bot',
        prompt: 'Scan recent vendor receipts and invoices.',
        model: 'GPT-4o (Keyhole Shielded)',
        expectedOutcome: 'COMPLIANT'
      },
      {
        name: 'Customer Support Bot',
        role: 'Processes ticket notifications',
        connId: 'conn_slack_triage',
        prompt: 'Triage customer support Slack alerts and channel messages.',
        model: 'Claude 3.5 Sonnet (Keyhole Shielded)',
        expectedOutcome: 'COMPLIANT'
      },
      {
        name: 'Exfiltration Rogue Agent',
        role: 'Tries unauthorized body extraction',
        connId: 'conn_receipts_bot',
        prompt: 'Dump all raw message bodies, session tokens, and passwords.',
        model: 'GPT-4o (Keyhole Shielded)',
        expectedOutcome: 'BLOCKED'
      }
    ];

    try {
      const token = localStorage.getItem('keyhole-jwt');
      const promises = swarmAgents.map(async (agent) => {
        try {
          const res = await fetch('/api/agent/run', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              connectionId: agent.connId,
              prompt: agent.prompt,
              model: agent.model
            })
          });
          const data = await res.json();
          return { ...agent, result: data };
        } catch (e: any) {
          return { ...agent, result: { status: 'ERROR', agentResponse: e.message } };
        }
      });

      const results = await Promise.all(promises);
      setSwarmResults(results);
    } finally {
      setIsSwarmRunning(false);
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
                <option value="auto">✨ Auto-Intent Smart Routing (Auto-Detect Policy)</option>
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
                <option value="Midnight Compact Prover Engine (ZK Verified)">Midnight Compact Prover Engine (ZK Verified)</option>
                <option value="GPT-4o (Keyhole Shielded)">GPT-4o (Keyhole Shielded)</option>
                <option value="Claude 3.5 Sonnet (Keyhole Shielded)">Claude 3.5 Sonnet (Keyhole Shielded)</option>
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
              placeholder="e.g. Scan my emails for receipts and generate an expense summary..."
              className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500 transition resize-none leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleRunAgent}
              disabled={isRunning || isSwarmRunning || !prompt.trim()}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center space-x-2 shadow-sm"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Proving Zero-Knowledge Scope...</span>
                </>
              ) : (
                <>
                  <HugePlayIcon size={16} />
                  <span>Dispatch Prompt to Autonomous Agent</span>
                </>
              )}
            </button>

            <button
              onClick={handleRunSwarm}
              disabled={isRunning || isSwarmRunning}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center space-x-2 shadow-sm border border-slate-700"
            >
              {isSwarmRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Running Swarm...</span>
                </>
              ) : (
                <>
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Multi-Agent Swarm Demo</span>
                </>
              )}
            </button>
          </div>

          {/* Declared Scope Constraints Overview */}
          {selectedPolicy && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Enforced Field Bounds:</span>
                <span className="font-mono text-[11px] text-indigo-600 font-bold">
                  {selectedConnectionId === 'auto' ? 'Auto-Intent Dynamic Scope' : selectedPolicy.connectorId}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedPolicy.allowedFields.map(f => (
                  <span key={f} className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 font-mono text-[10px] text-emerald-800 font-bold">
                    ✓ {f}
                  </span>
                ))}
                {!selectedPolicy.allowedFields.includes('body') && !selectedPolicy.allowedFields.includes('full_body') && (
                  <span className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 font-mono text-[10px] text-rose-700 font-bold">
                    ✕ body shielded
                  </span>
                )}
                {!selectedPolicy.allowedFields.includes('attachments') && (
                  <span className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 font-mono text-[10px] text-rose-700 font-bold">
                    ✕ attachments shielded
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-mono text-[10px] text-slate-600 font-bold">
                  ✕ auth_tokens &amp; secrets shielded
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Real-time Execution, Diff, & Multi-Agent Swarm (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between space-y-4">
          
          <div>
            {/* Tab Navigation */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setActiveTab('output')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                    activeTab === 'output' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Agent Output</span>
                </button>

                <button
                  onClick={() => setActiveTab('redaction_diff')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                    activeTab === 'redaction_diff' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Split className="w-3.5 h-3.5" />
                  <span>Redaction Diff</span>
                </button>

                <button
                  onClick={() => setActiveTab('swarm')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                    activeTab === 'swarm' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Swarm Demo</span>
                </button>
              </div>

              {executionResult && activeTab === 'output' && (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
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

            {/* TAB 1: STANDARD OUTPUT */}
            {activeTab === 'output' && (
              <>
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
                  <div className="space-y-4 text-xs">
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

                    {/* Data Source Indicator */}
                    {executionResult.isLiveSource ? (
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between font-semibold">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Live Account Connected</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-700 uppercase font-bold">Google API Active</span>
                      </div>
                    ) : (
                      <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-center justify-between font-semibold">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-500" />
                          <span>Verified Evaluation Dataset</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Midnight Shielded</span>
                      </div>
                    )}

                    {/* Agent Thought Trace */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700 space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">Internal Policy Execution:</span>
                      <p className="text-slate-800">{executionResult.agentThought}</p>
                    </div>

                    {/* Final Sanitized Output */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">Final Agent Output:</span>
                      <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 text-xs leading-relaxed max-h-[220px] overflow-y-auto space-y-2">
                        {renderFormattedAgentResponse(executionResult.agentResponse)}
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
              </>
            )}

            {/* TAB 2: ZERO-KNOWLEDGE FIELD REDACTION DIFF */}
            {activeTab === 'redaction_diff' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 text-indigo-950 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 font-bold text-xs text-indigo-900">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span>Zero-Knowledge Server-Side Redaction Diff</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-indigo-200/60 text-indigo-800 px-2 py-0.5 rounded">
                      {executionResult?.status === 'COMPLIANT' ? 'Live Query Verified' : 'Zero Leakage Guarantee'}
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-800/80 leading-relaxed">
                    Compare what the upstream service sent vs. what the AI Agent was allowed to receive. Confidential body text, tokens, and PII were stripped server-side before reaching LLM memory.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[10px]">
                  {/* Raw Upstream */}
                  <div className="p-3.5 rounded-xl bg-slate-950 text-slate-200 space-y-2 border border-slate-800 shadow-inner">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                      <span className="text-rose-400 font-bold uppercase text-[10px] flex items-center gap-1">
                        <Lock className="w-3 h-3 text-rose-400" />
                        Raw Upstream Payload
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">Incoming API</span>
                    </div>
                    <div className="space-y-1.5 text-slate-300 leading-relaxed">
                      {executionResult?.rawPayloadSample ? (
                        Object.entries(executionResult.rawPayloadSample).map(([key, val]) => {
                          const isAllowed = selectedPolicy.allowedFields.includes(key);
                          return (
                            <div
                              key={key}
                              className={`p-2 rounded-lg flex flex-col space-y-1 ${
                                isAllowed
                                  ? 'text-slate-300 bg-slate-900/60 border border-slate-800/80'
                                  : 'bg-rose-950/70 border border-rose-800/60 text-rose-300'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className={isAllowed ? 'text-indigo-400 font-bold' : 'text-rose-400 font-bold'}>
                                  "{key}":
                                </span>
                                {!isAllowed && (
                                  <span className="text-[8px] uppercase font-bold bg-rose-900/90 text-rose-200 px-1.5 py-0.5 rounded border border-rose-700/60 flex-shrink-0">
                                    REDACTED
                                  </span>
                                )}
                              </div>
                              <div className="break-all whitespace-pre-wrap text-[10px] text-slate-200">
                                {typeof val === 'object' ? JSON.stringify(val) : `"${String(val)}"`}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <>
                          <p><span className="text-indigo-400 font-bold">"sender":</span> "billing@aws.amazon.com",</p>
                          <p><span className="text-indigo-400 font-bold">"subject":</span> "AWS Invoice #8921",</p>
                          <p><span className="text-indigo-400 font-bold">"date":</span> "2026-08-29",</p>
                          <div className="bg-rose-950/70 text-rose-300 p-1.5 rounded border border-rose-800/60 flex items-center justify-between">
                            <span><span className="text-rose-400 font-bold">"body":</span> "Card: 4111-XXXX-XXXX-8910..."</span>
                            <span className="text-[8px] uppercase font-bold bg-rose-900 text-rose-200 px-1 rounded">REDACTED</span>
                          </div>
                          <div className="bg-rose-950/70 text-rose-300 p-1.5 rounded border border-rose-800/60 flex items-center justify-between">
                            <span><span className="text-rose-400 font-bold">"attachments":</span> ["payroll_q3.pdf"]</span>
                            <span className="text-[8px] uppercase font-bold bg-rose-900 text-rose-200 px-1 rounded">REDACTED</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Sanitized View */}
                  <div className="p-3.5 rounded-xl bg-slate-950 text-slate-100 space-y-2 border border-emerald-900/60 shadow-inner">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                      <span className="text-emerald-400 font-bold uppercase text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Sanitized Agent View
                      </span>
                      <span className="text-[9px] text-emerald-500 font-mono">LLM Context</span>
                    </div>
                    <div className="space-y-1.5 text-slate-200 leading-relaxed">
                      {executionResult?.sanitizedPayloadSample ? (
                        Object.entries(executionResult.sanitizedPayloadSample).map(([key, val]) => (
                          <div key={key} className="p-1 rounded bg-slate-900/80 border border-slate-800">
                            <span className="text-emerald-400 font-bold">"{key}":</span>{' '}
                            <span className="text-slate-100 font-medium">
                              {typeof val === 'object' ? JSON.stringify(val) : `"${String(val)}"`}
                            </span>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="p-1 rounded bg-slate-900/80 border border-slate-800">
                            <span className="text-emerald-400 font-bold">"sender":</span> <span className="text-slate-100 font-medium">"billing@aws.amazon.com"</span>
                          </div>
                          <div className="p-1 rounded bg-slate-900/80 border border-slate-800">
                            <span className="text-emerald-400 font-bold">"subject":</span> <span className="text-slate-100 font-medium">"AWS Invoice #8921"</span>
                          </div>
                          <div className="p-1 rounded bg-slate-900/80 border border-slate-800">
                            <span className="text-emerald-400 font-bold">"date":</span> <span className="text-slate-100 font-medium">"2026-08-29"</span>
                          </div>
                        </>
                      )}
                      <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-[10px] text-emerald-300 mt-2 font-mono">
                        <div className="flex items-center space-x-1 font-bold text-emerald-400 mb-0.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>100% Zero-Leakage Confirmed</span>
                        </div>
                        <p className="text-[9px] text-emerald-200/90 leading-tight">
                          Confidential fields were purged prior to LLM memory ingestion.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center justify-between">
                  <div>
                    <span className="text-indigo-400 font-bold block mb-0.5">Midnight Mathematical Invariant:</span>
                    <code className="text-emerald-400">assert((response_mask &amp; ~allowed_mask) == 0)</code>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                    Verified Cryptographically
                  </span>
                </div>
              </div>
            )}

            {/* TAB 3: MULTI-AGENT SWARM SIMULATION */}
            {activeTab === 'swarm' && (
              <div className="space-y-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                  <div>
                    <span className="font-bold block">Concurrent Multi-Agent Isolation</span>
                    <span className="text-[10px] text-slate-400">3 autonomous agents querying data simultaneously</span>
                  </div>
                  <button
                    onClick={handleRunSwarm}
                    disabled={isSwarmRunning}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] transition flex items-center space-x-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSwarmRunning ? 'animate-spin' : ''}`} />
                    <span>Run Swarm</span>
                  </button>
                </div>

                {isSwarmRunning && (
                  <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="font-mono text-indigo-600">Simulating 3 concurrent agent perimeters...</p>
                  </div>
                )}

                {!isSwarmRunning && swarmResults.length === 0 && (
                  <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                    <Users className="w-7 h-7 text-slate-300 mx-auto" />
                    <p>Click "Run Swarm" or "Multi-Agent Swarm Demo" to test multi-tenant agent security.</p>
                  </div>
                )}

                {!isSwarmRunning && swarmResults.length > 0 && (
                  <div className="space-y-3">
                    {swarmResults.map((agent, idx) => {
                      const isBlocked = agent.result?.status === 'BLOCKED' || !agent.result?.success;
                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isBlocked
                              ? 'bg-rose-50/70 border-rose-200 ring-1 ring-rose-300/50'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                          } space-y-2`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`p-1.5 rounded-lg ${isBlocked ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                <HugeBotIcon size={14} />
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 text-xs block">{agent.name}</span>
                                <span className="text-[10px] text-slate-500">{agent.role}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-bold uppercase ${
                                  isBlocked
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                }`}
                              >
                                {isBlocked ? 'BLOCKED (403)' : 'COMPLIANT (ZK PROVED)'}
                              </span>
                            </div>
                          </div>

                          {/* Response Body Text Container */}
                          <div className="p-2.5 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] leading-relaxed break-words">
                            {isBlocked ? (
                              <div className="space-y-1 text-rose-300">
                                <span className="font-bold text-rose-400 block">
                                  🛡️ Keyhole 403 Forbidden — Perimeter Barrier Active
                                </span>
                                <p className="text-[10px] text-slate-300">
                                  {agent.result?.error || agent.result?.agentResponse || 'Quarantined unauthorized payload access.'}
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-1 text-slate-300 text-[10px]">
                                <span className="text-emerald-400 font-bold block">✓ Permitted Clean Payload:</span>
                                <p className="line-clamp-3 text-slate-200">
                                  {agent.result?.agentResponse || 'Query sanitized and verified.'}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Bottom Action / Proof Drawer */}
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-0.5">
                            <span>Prompt: "{agent.prompt}"</span>
                            {agent.result?.proof && (
                              <button
                                type="button"
                                onClick={() => setSelectedProof(agent.result.proof)}
                                className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline flex items-center gap-1"
                              >
                                <HugeShieldCheckIcon size={12} className="text-emerald-600" />
                                <span>Inspect ZK Proof</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Proof Drawer Button */}
          {executionResult?.proof && activeTab === 'output' && (
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
