import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Code,
  Terminal,
  Copy,
  Check,
  X,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  Play
} from 'lucide-react';
import { HugeCpuIcon } from './HugeIcons.tsx';

interface DeveloperSdkModalProps {
  onClose: () => void;
}

export const DeveloperSdkModal: React.FC<DeveloperSdkModalProps> = ({ onClose }) => {
  const [selectedLang, setSelectedLang] = useState<'python' | 'typescript' | 'curl'>('python');
  const [copied, setCopied] = useState(false);

  const pythonSnippet = `# Install: pip install keyhole-shield langchain crewai
from keyhole import KeyholeShield
from crewai import Agent, Task, Crew

# 1. Wrap ANY existing tool in 1 line with a Keyhole Zero-Knowledge Scope Policy
secure_gmail_tool = KeyholeShield(
    connector="gmail",
    policy_id="conn_receipts_bot",
    gateway_url="http://localhost:4000"
)

# 2. Autonomous Agent runs with zero risk of confidential data leakage
auditor_agent = Agent(
    role="SaaS Expense Auditor",
    goal="Extract SaaS receipts and dates for monthly reconciliation",
    tools=[secure_gmail_tool],
    verbose=True
)

# 3. Midnight ZK proof is automatically anchored on every tool execution!
result = auditor_agent.execute("Scan recent vendor invoices.")
print("Audited Result:", result.data)
print("Midnight Proof Tx:", result.midnight_proof.tx_id)`;

  const tsSnippet = `// Install: npm install @keyhole/sdk openai
import { KeyholeShield } from '@keyhole/sdk';
import OpenAI from 'openai';

const openai = new OpenAI();

// 1. Initialize Keyhole Zero-Knowledge Tool Shield
const shield = new KeyholeShield({
  gatewayUrl: 'http://localhost:4000',
  apiKey: process.env.KEYHOLE_API_KEY
});

// 2. Wrap tool definition with declared scope perimeter
const secureM365Tool = shield.wrapTool({
  connectionId: 'conn_m365_invoices',
  description: 'Audits Microsoft 365 cloud invoices with bodies and tokens masked.'
});

// 3. AI Agent tool execution returns cryptographically proven records
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'List recent Microsoft 365 invoices' }],
  tools: [secureM365Tool]
});`;

  const curlSnippet = `# Keyhole REST Gateway Tool Query Execution
curl -X POST http://localhost:4000/api/agent/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer kh_live_9f8a2b3c4d5e6f7a8b9c0d1e2f3a4b5" \\
  -d '{
    "connectionId": "conn_receipts_bot",
    "prompt": "Scan recent emails for vendor invoices."
  }'`;

  const currentCode = selectedLang === 'python' ? pythonSnippet : selectedLang === 'typescript' ? tsSnippet : curlSnippet;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto z-[101]"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Code className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Keyhole Universal Agent SDK
                </h2>
                <span className="text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  2-Line Drop-in
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Secure LangChain, CrewAI, AutoGen, or Custom LLM Agents in under 60 seconds.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSelectedLang('python')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedLang === 'python' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Python (LangChain / CrewAI)
            </button>
            <button
              onClick={() => setSelectedLang('typescript')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedLang === 'typescript' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              TypeScript (OpenAI / Vercel)
            </button>
            <button
              onClick={() => setSelectedLang('curl')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedLang === 'curl' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              cURL / REST API
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition flex items-center space-x-1.5 shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Snippet' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Code Block */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-inner text-xs font-mono">
          <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 text-slate-400 flex items-center justify-between text-[11px]">
            <span>{selectedLang === 'python' ? 'agent_shield.py' : selectedLang === 'typescript' ? 'agent_shield.ts' : 'request.sh'}</span>
            <span className="text-indigo-400 font-semibold">Midnight ZKIR Engine</span>
          </div>
          <pre className="p-4 text-slate-200 overflow-x-auto leading-relaxed max-h-[380px]">
            <code>{currentCode}</code>
          </pre>
        </div>

        {/* Integration Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">Zero LLM Lock-in</span>
            <p className="text-slate-600 text-[11px]">Works seamlessly with OpenAI, Anthropic Claude, Gemini, and local Ollama models.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">Sub-Second ZKIR</span>
            <p className="text-slate-600 text-[11px]">Under 12ms cryptographic proof compilation on Midnight Cardano testnet.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">Canary Defense</span>
            <p className="text-slate-600 text-[11px]">Automatic honeypot trap injection for instant prompt injection quarantine.</p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
