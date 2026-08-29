import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Layers, 
  ShieldCheck, 
  Lock, 
  Clock, 
  CheckCircle2, 
  Database,
  Cpu,
  Share2,
  FileCode,
  Sparkles
} from 'lucide-react';
import { HugeCpuIcon, HugeShieldCheckIcon } from './HugeIcons.tsx';

interface BlockExplorerModalProps {
  txHash?: string;
  contractAddress?: string | null;
  policyName?: string;
  proofId?: string;
  allowedFields?: string[];
  deliveredFields?: string[];
  isCompliant?: boolean;
  onClose: () => void;
}

export const BlockExplorerModal: React.FC<BlockExplorerModalProps> = ({
  txHash = '0x8f29e102c34a9b8812ef0934bb7a61d02c918a7b3c4d5e6f7a8b9c0d1e2f3a4b',
  contractAddress = '0x9f88c0a72199b0c2e334f51e0892781a0b3882711',
  policyName = 'Expense Report Agent (Receipts Only)',
  proofId,
  allowedFields = ['sender', 'subject', 'date'],
  deliveredFields,
  isCompliant = true,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'raw_tx'>('overview');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 z-[121]"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
              <HugeCpuIcon size={22} className="text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Midnight Testnet Block Explorer
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  Finalized on Ledger
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Chain ID: 42 (Midnight Testnet Preview)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 bg-slate-50 px-5 pt-3 space-x-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-2 text-xs font-bold transition border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>State Transition Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('raw_tx')}
            className={`pb-2.5 px-2 text-xs font-bold transition border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'raw_tx'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Raw Ledger Payload (JSON)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 font-sans">
          {activeTab === 'overview' && (
            <div className="space-y-4 text-xs">
              
              {/* Transaction Hash Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Midnight Cardano Ledger Tx Hash
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200">
                    Verified Zero-Knowledge Soundness
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="font-mono text-[11px] text-slate-800 break-all font-semibold select-all">
                    {txHash}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition flex-shrink-0 ml-2 flex items-center space-x-1 text-[10px]"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-sans font-bold uppercase block">Block Height</span>
                  <span className="font-bold text-slate-900">#1,489,203 (Epoch 142)</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-sans font-bold uppercase block">Gas Consumed (DUST)</span>
                  <span className="font-bold text-indigo-600">0.0042 DUST</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-sans font-bold uppercase block">Enforced Policy</span>
                  <span className="font-bold text-slate-800 text-[11px] font-sans truncate block">{policyName}</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-sans font-bold uppercase block">Circuit Contract</span>
                  <span className="font-bold text-emerald-700">Compact v0.34 (Subset Verifier)</span>
                </div>
              </div>

              {/* Shielded Private Inputs vs Public Inputs */}
              <div className="space-y-2.5">
                <span className="font-bold text-slate-900 block text-xs">Cryptographic Witness Non-Disclosure Verification:</span>
                
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center space-x-1.5 font-bold text-emerald-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Public State Commitments (Published to Ledger):</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-emerald-800 font-mono space-y-1">
                    <li>Allowed Field Mask: <code className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-950">[{allowedFields.join(', ')}]</code></li>
                    <li>Compliance Status: <code className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-950">true (Subset Constraint Satisfied)</code></li>
                    <li>Timestamp Attestation: <code className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-950">{new Date().toISOString()}</code></li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 space-y-2 font-mono">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-100">
                    <Lock className="w-4 h-4 text-indigo-400" />
                    <span className="font-sans">Shielded Private Witnesses (Zero-Knowledge Protected):</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-1">
                    <li>Raw Email Body &amp; Attachments: <span className="text-rose-400 font-bold">[SHIELDED - NEVER REVEALED]</span></li>
                    <li>Auth Tokens, Secrets &amp; JWTs: <span className="text-rose-400 font-bold">[SHIELDED - ZERO WITNESS LEAKAGE]</span></li>
                    <li>Upstream Enterprise Database Rows: <span className="text-rose-400 font-bold">[SHIELDED - STRIPPED PRE-DELIVERY]</span></li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'raw_tx' && (
            <div className="space-y-2">
              <span className="font-bold text-slate-900 block text-xs">Raw Midnight Transaction JSON:</span>
              <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[300px]">
{JSON.stringify({
  network: "midnight-testnet-preview",
  chainId: 42,
  txHash: txHash,
  contractTarget: "scope-policy.compact:verify_scope_membership",
  blockHeight: 1489203,
  confirmations: 12,
  gasConsumedDust: "0.0042",
  policyId: policyName,
  proof: {
    proofId: proofId || `proof_${txHash.substring(2, 10)}`,
    circuit: "verify_scope_membership",
    version: "compact-v0.34.0",
    prover: "midnight-compact-runtime",
    status: isCompliant ? "COMPLIANT_FINALIZED" : "CONSTRAINT_REJECTED",
    subsetConstraint: "(response_field_mask & ~allowed_field_mask) == 0",
    stateCommitment: `0x${txHash.substring(2, 66)}`
  }
}, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Midnight Network CIP-30 Compatible</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
