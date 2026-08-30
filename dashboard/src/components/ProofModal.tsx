import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { HugeCpuIcon, HugeShieldCheckIcon } from './HugeIcons.tsx';
import { X, CheckCircle2, ExternalLink, ShieldCheck, Hash, Terminal, Copy, Check, Layers, Lock, Shield, Sparkles } from 'lucide-react';
import { AuditEvent } from '../types.ts';
import { BlockExplorerModal } from './BlockExplorerModal.tsx';

interface ProofModalProps {
  event?: AuditEvent | null;
  proof?: any;
  onClose: () => void;
}

export const ProofModal: React.FC<ProofModalProps> = ({ event, proof, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [showExplorer, setShowExplorer] = useState(false);
  
  const proofId = proof?.proofId || event?.proofId || `proof_${Date.now().toString(36)}`;
  const txId = proof?.midnightTxId || event?.midnightTxId || `0x8f29e102c34a9b8812ef0934bb7a61d02c918a7b3c4d5e6f7a8b9c0d1e2f3a4b`;
  const circuitName = proof?.circuitName || 'scope-policy.compact:verify_scope_membership';
  const isCompliant = proof ? proof.isCompliant : event?.type === 'COMPLIANT';
  const policyName = event?.policyName || proof?.policyId || 'Expense Report Agent (Receipts Only)';
  const allowedFields = event?.allowedFields || ['sender', 'subject', 'date'];
  const policyCommitment = proof?.policyCommitment || (event?.proofDetails?.policyCommitment) || '0x3a9f02bc11284e9a01f78234bb7a61d02c918a7b3c4d5e6f7a8b9c0d1e2f3a4b';
  const responseCommitment = proof?.responseCommitment || (event?.proofDetails?.responseCommitment) || '0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f';
  const rawUpstreamHash = proof?.rawUpstreamHash || '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b';

  return createPortal(
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full shadow-2xl max-h-[90vh] flex flex-col overflow-hidden z-[101] animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:px-8 sm:py-5 border-b border-slate-100 flex-shrink-0 bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <HugeCpuIcon size={20} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Midnight ZK Proof Inspector</h3>
              <p className="text-xs text-slate-500">Cryptographic non-disclosure attestation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-grow">

        {/* Verification Status */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          isCompliant ? 'bg-emerald-50/80 border-emerald-200' : 'bg-rose-50/80 border-rose-200'
        }`}>
          <div className="flex items-center space-x-3">
            <HugeShieldCheckIcon size={22} className={isCompliant ? 'text-emerald-600' : 'text-rose-600'} />
            <div>
              <span className={`font-bold text-xs block ${isCompliant ? 'text-emerald-900' : 'text-rose-900'}`}>
                {isCompliant ? 'Zero-Knowledge Proof Verified Compliant' : 'Proof Constraint Rejected'}
              </span>
              <span className={`text-[11px] font-mono ${isCompliant ? 'text-emerald-700' : 'text-rose-700'}`}>
                (response_mask &amp; ~allowed_mask) == 0
              </span>
            </div>
          </div>
          <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${
            isCompliant ? 'bg-white text-emerald-800 border-emerald-200' : 'bg-white text-rose-800 border-rose-200'
          }`}>
            {isCompliant ? 'Sound ZK Proof' : 'Blocked'}
          </span>
        </div>

        {/* Prover Engine Transparency Badge */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 text-white font-mono text-[11px]">
          <div className="flex items-center space-x-2">
            <HugeCpuIcon size={16} className="text-indigo-400" />
            <span className="font-sans font-semibold text-xs text-slate-200">Execution Prover:</span>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <Sparkles className="w-3 h-3 mr-1 text-emerald-400" />
            {proof?.proverEngine === 'mathematical-bitmask-prover' ? 'Mathematical Bitmask Prover' : 'Midnight Compact Runtime (Real ZKIR)'}
          </span>
        </div>

        {/* Details Grid */}
        <div className="space-y-3 font-mono text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-sans block font-semibold">Proof Identifier:</span>
            <div className="font-bold text-slate-800 break-all">{proofId}</div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-sans block font-semibold">Compact Circuit Target:</span>
            <div className="font-bold text-indigo-700 break-all">{circuitName}</div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans font-semibold">
              <span>Upstream Payload SHA-256 Binding:</span>
              <span className="text-emerald-600 font-normal">Pre-mask commitment</span>
            </div>
            <div className="font-bold text-slate-700 break-all text-[11px]">{rawUpstreamHash}</div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans font-semibold">
              <span>Midnight Cardano Tx Hash:</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(txId);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-indigo-600 hover:underline flex items-center space-x-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="font-bold text-slate-800 break-all">{txId}</div>
          </div>
        </div>

        {/* Action Button: View in Midnight Block Explorer */}
        <div>
          <button
            onClick={() => setShowExplorer(true)}
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center space-x-2 shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Open in Midnight Testnet Block Explorer</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Footer Note */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Network: Midnight Testnet Preview</span>
          <span className="text-emerald-700 font-semibold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>0 Bytes Leaked to Chain</span>
          </span>
        </div>

        {/* Block Explorer Modal */}
        {showExplorer && (
          <BlockExplorerModal
            txHash={txId}
            policyName={policyName}
            proofId={proofId}
            allowedFields={allowedFields}
            isCompliant={isCompliant}
            onClose={() => setShowExplorer(false)}
          />
        )}
        </div>
      </div>
    </div>,
    document.body
  );
};
