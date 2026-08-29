import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ShieldCheck,
  Award,
  Download,
  Printer,
  X,
  ExternalLink,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  FileText,
  Calendar,
  Building,
  Sparkles,
  Fingerprint,
  FileCheck2,
  ShieldAlert
} from 'lucide-react';
import { HugeShieldCheckIcon, HugeCpuIcon } from './HugeIcons.tsx';

interface ComplianceCertificateModalProps {
  onClose: () => void;
}

export const ComplianceCertificateModal: React.FC<ComplianceCertificateModalProps> = ({ onClose }) => {
  const [certData, setCertData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    fetch('/api/compliance/certificate')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCertData(data.certificate);
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDownloadJson = () => {
    if (!certData) return;
    const blob = new Blob([JSON.stringify(certData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${certData.id}_attestation.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        id="certificate-print-area"
        onClick={(e) => e.stopPropagation()}
        className="bg-white border-2 border-slate-200/90 rounded-3xl max-w-3xl w-full p-6 sm:p-9 shadow-2xl space-y-6 max-h-[94vh] overflow-y-auto z-[101] relative overflow-hidden"
      >
        {/* Decorative Certificate Ribbon Watermark */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-indigo-500/10 via-emerald-500/5 to-transparent rounded-full blur-2xl pointer-events-none -z-0 no-print" />

        {/* Certificate Formal Header */}
        <div className="flex items-start justify-between pb-5 border-b-2 border-slate-100 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 border-2 border-amber-300/60 flex-shrink-0">
              <Award className="w-8 h-8 text-slate-950" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-700 font-black">
                  SOC 2 &amp; HIPAA-Ready Compliance Report
                </span>
                <span className="text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300/60 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Auditor-Ready</span>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5 font-serif">
                Zero-Knowledge Scope Compliance Attestation
              </h1>
              <p className="text-xs text-slate-500 font-mono flex items-center space-x-2 mt-0.5">
                <span>ID: {certData ? certData.id : 'Loading...'}</span>
                {certData && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(certData.id);
                      setCopiedId(true);
                      setTimeout(() => setCopiedId(false), 2000);
                    }}
                    className="text-slate-400 hover:text-indigo-600 no-print"
                    title="Copy Certificate ID"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition flex-shrink-0 no-print"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading || !certData ? (
          <div className="py-16 text-center text-xs text-slate-500 space-y-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-mono text-indigo-600 font-bold">Compiling Midnight Cardano Ledger commitments...</p>
          </div>
        ) : (
          <div className="space-y-6 text-xs relative z-10">
            {/* Formal Executive Statement */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white space-y-3 shadow-md border border-indigo-900/50">
              <div className="flex items-center justify-between text-[10px] text-indigo-300 font-mono tracking-wider">
                <span>MIDNIGHT ZK NON-DISCLOSURE ATTESTATION</span>
                <span>SOC 2 · HIPAA § 164.312 · GDPR ART. 25</span>
              </div>
              <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed font-sans font-normal">
                {certData.auditorAttestation}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-emerald-400 font-mono font-semibold">
                <span>Mathematical Guarantee: response_fields ⊆ allowed_fields</span>
                <span>0 Bytes Leaked</span>
              </div>
            </div>

            {/* Core Verification Numbers Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <span className="text-[10px] text-slate-500 font-sans block uppercase font-semibold">Total Queries</span>
                <span className="text-2xl font-black text-slate-900 font-mono">{certData.totalQueriesEvaluated}</span>
                <span className="text-[10px] text-slate-400 block font-sans">Evaluated 24/7</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center space-y-1">
                <span className="text-[10px] text-emerald-800 font-sans block uppercase font-semibold">ZK Proven</span>
                <span className="text-2xl font-black text-emerald-700 font-mono">{certData.compliantQueriesProved}</span>
                <span className="text-[10px] text-emerald-600 block font-sans">Anchored on Ledger</span>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-center space-y-1">
                <span className="text-[10px] text-rose-800 font-sans block uppercase font-semibold">Threats Blocked</span>
                <span className="text-2xl font-black text-rose-700 font-mono">{certData.exfiltrationsBlocked}</span>
                <span className="text-[10px] text-rose-600 block font-sans">403 Pre-Fetch Guard</span>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-center space-y-1">
                <span className="text-[10px] text-indigo-800 font-sans block uppercase font-semibold">Compliance</span>
                <span className="text-2xl font-black text-indigo-700 font-mono">{certData.complianceRate}</span>
                <span className="text-[10px] text-indigo-600 block font-sans">Auditor Certified</span>
              </div>
            </div>

            {/* Verified Enterprise Standards Badges */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="font-bold text-slate-900 text-xs block">
                Audited Regulatory &amp; Industry Standards:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {certData.complianceStandards.map((std: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80 text-slate-800 text-[11px] font-medium shadow-2xs"
                  >
                    <div className="p-1 rounded-lg bg-emerald-50 text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    </div>
                    <span className="truncate">{std}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* On-Chain Merkle Hash & Ledger Anchor */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 font-mono text-[11px]">
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-sans mb-1 font-semibold">
                  <span>Midnight Blockchain Merkle Root Hash:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(certData.merkleRootHash);
                      setCopiedHash(true);
                      setTimeout(() => setCopiedHash(false), 2000);
                    }}
                    className="text-indigo-600 hover:underline flex items-center space-x-1"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
                  </button>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-800 break-all select-all font-bold">
                  {certData.merkleRootHash}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-sans block">Smart Contract Target:</span>
                  <span className="font-bold text-indigo-700">{certData.smartContract}</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-sans block">Ledger State Commitment:</span>
                  <span className="font-bold text-slate-800 truncate block">{certData.midnightLedgerCommitment.substring(0, 22)}...</span>
                </div>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-slate-400 font-mono">
                Issued: {new Date(certData.issuedAt).toLocaleString()} · Midnight Testnet Preview
              </div>

              <div className="flex items-center space-x-2.5 w-full sm:w-auto no-print">
                <button
                  onClick={handleDownloadJson}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>Download JSON</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Certificate</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
