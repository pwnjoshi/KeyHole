import React, { useState } from 'react';
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
  Share2
} from 'lucide-react';
import { HugeCpuIcon, HugeShieldCheckIcon } from './HugeIcons.tsx';

interface BlockExplorerModalProps {
  txHash?: string;
  contractAddress?: string;
  onClose: () => void;
}

export const BlockExplorerModal: React.FC<BlockExplorerModalProps> = ({
  txHash = '0x8f29e102c34a9b8812ef0934bb7a61d02c918a7b3c4d5e6f7a8b9c0d1e2f3a4b',
  contractAddress = '0x9f88c0a72199b0c2e334f51e0892781a0b3882711',
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'raw_tx'>('overview');

  const handleCopy = () => {
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
              <HugeCpuIcon size={20} className="text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Midnight Testnet Block Explorer
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  Finalized
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
            <span>Raw Ledger Payload</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-4 text-xs">
              
              {/* Transaction Hash Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Transaction Hash
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-800 break-all font-semibold select-all">
                    {txHash}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition flex-shrink-0 ml-2"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
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
                  <span className="text-[10px] text-slate-400 font-sans font-bold uppercase block">Gas Consumed</span>
                  <span className="font-bold text-indigo-600">0.0042 DUST</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-sans font-bold uppercase block">Contract Address</span>
                  <span className="font-bold text-slate-800 text-[10px] break-all">{contractAddress}</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-sans font-bold uppercase block">Circuit Type</span>
                  <span className="font-bold text-emerald-700">Compact v0.34 (Subset Verifier)</span>
                </div>
              </div>

              {/* Shielded Private Inputs vs Public Inputs */}
              <div className="space-y-2">
                <span className="font-bold text-slate-900 block text-xs">Cryptographic Witness Privacy:</span>
                
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                  <div className="flex items-center space-x-1.5 font-bold text-emerald-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Public State Outputs (Visible On-Chain):</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-emerald-800 font-mono space-y-0.5">
                    <li>Merkle Root: <code className="bg-emerald-100 px-1 rounded">0x9f88c0a72199b...</code></li>
                    <li>Compliance Status: <code className="bg-emerald-100 px-1 rounded">true (Verified 0 Leakage)</code></li>
                    <li>Timestamp Attestation: <code className="bg-emerald-100 px-1 rounded">{new Date().toISOString()}</code></li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 text-slate-200 space-y-1.5 font-mono">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-100">
                    <Lock className="w-4 h-4 text-indigo-400" />
                    <span className="font-sans">Shielded Private Witnesses (Hidden in Zero-Knowledge):</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-0.5">
                    <li>Raw Email Body Text: <span className="text-rose-400 font-bold">[SHIELDED - NEVER REVEALED]</span></li>
                    <li>Auth Tokens &amp; Credentials: <span className="text-rose-400 font-bold">[SHIELDED - ZERO WITNESS LEAKAGE]</span></li>
                    <li>PII &amp; Attachment Payloads: <span className="text-rose-400 font-bold">[SHIELDED]</span></li>
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
  contract: contractAddress,
  blockHeight: 1489203,
  confirmations: 12,
  gasConsumedDust: "0.0042",
  proof: {
    circuit: "verify_scope_membership",
    version: "compact-v0.34.0",
    prover: "midnight-proof-client-wasm",
    status: "FINALIZED",
    stateCommitment: "0x3a9f02bc11284e9a01f78234bb7a61d02c918a7b3c4d5e6f7a8b9c0d1e2f3a4b"
  }
}, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Midnight Network CIP-30 Compatible
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
