import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Compass, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Play, 
  CheckCircle2, 
  ShieldCheck, 
  Flame, 
  Split, 
  FileCode, 
  Award, 
  ExternalLink,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { HugeBotIcon, HugeShieldCheckIcon, HugeCpuIcon } from './HugeIcons.tsx';

export const JudgeGuidedTour: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const tourSteps = [
    {
      title: '1. Autonomous Agent Execution Studio',
      path: '/studio',
      badge: 'Step 1 of 5',
      icon: <HugeBotIcon size={18} className="text-indigo-600" />,
      description: 'Test autonomous AI agents prompting sensitive services (Gmail, M365, Slack). Watch Keyhole enforce field bounds before generating sub-second Midnight ZK proofs.',
      actionLabel: 'Go to Agent Studio',
      keyBenefit: 'Perimeter bounds enforced server-side before external APIs are queried.'
    },
    {
      title: '2. Attack Playground & Canary Honeypot',
      path: '/sandbox',
      badge: 'Step 2 of 5',
      icon: <Flame className="w-4 h-4 text-rose-600" />,
      description: 'Simulate active prompt injection exfiltration and zero-day attacks. See Keyhole immediately return HTTP 403 / HTTP 423 session lock, quarantining rogue agents.',
      actionLabel: 'Open Attack Sandbox',
      keyBenefit: 'Zero-day canary traps lock malicious LLM prompts before data exfiltration occurs.'
    },
    {
      title: '3. 1-Click Integrations Hub',
      path: '/integrations',
      badge: 'Step 3 of 5',
      icon: <Split className="w-4 h-4 text-emerald-600" />,
      description: 'Connect enterprise data sources (Gmail, Slack, GitHub, Postgres, Salesforce, Notion) using Nango 1-Click OAuth, Google Service Accounts, or Sandbox test keys.',
      actionLabel: 'Open Integrations Hub',
      keyBenefit: 'Unified 1-click enterprise connector onboarding with zero GCP setup required.'
    },
    {
      title: '4. Midnight Compact ZK Circuit Explorer',
      path: '/circuit',
      badge: 'Step 4 of 5',
      icon: <HugeCpuIcon size={18} className="text-indigo-600" />,
      description: 'Inspect the formal Midnight Compact v0.34 smart contract, compiled ZKIR opcode constraints, and test the real-time Cryptographic Proof Verifier sandbox.',
      actionLabel: 'Explore ZK Circuits',
      keyBenefit: 'Mathematically proves (response_mask & ~allowed_mask) == 0 in zero-knowledge.'
    },
    {
      title: '5. Compliance & Ledger Analytics',
      path: '/analytics',
      badge: 'Step 5 of 5',
      icon: <Award className="w-4 h-4 text-amber-500" />,
      description: 'Review real-time SOC 2 / HIPAA compliance metrics, tamper-evident audit logs, and on-chain Midnight ledger state commitments.',
      actionLabel: 'View Compliance Analytics',
      keyBenefit: 'Cryptographic compliance evidence for external auditors and enterprise CISOs.'
    }
  ];

  const current = tourSteps[currentStep];

  const handleGoToStep = (index: number) => {
    setCurrentStep(index);
    const target = tourSteps[index];
    if (location.pathname !== target.path) {
      navigate(target.path);
    }
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      handleGoToStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      handleGoToStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Minimized Pill */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            handleGoToStep(currentStep);
          }}
          className="group px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xl border border-indigo-500/30 transition-all flex items-center space-x-2.5 hover:scale-105"
        >
          <span className="h-2 w-2 rounded-full bg-indigo-400 inline-block" />
          <Compass className="w-4 h-4 text-indigo-400 group-hover:rotate-45 transition-transform" />
          <span>Judge Guided Tour (90s)</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* Expanded Walkthrough Card */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-entrance">
          {/* Header */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-indigo-400 animate-spin-slow" />
              <span className="font-bold text-xs">Judge Guided Walkthrough</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-mono text-[10px] font-bold">
                {current.badge}
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 flex-shrink-0">
                {current.icon}
              </div>
              <h3 className="font-bold text-slate-900 text-xs leading-snug">
                {current.title}
              </h3>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              {current.description}
            </p>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-700 font-medium flex items-start space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <span>{current.keyBenefit}</span>
            </div>

            {/* Quick Action Button */}
            <button
              onClick={() => handleGoToStep(currentStep)}
              className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{current.actionLabel}</span>
            </button>
          </div>

          {/* Footer Navigation */}
          <div className="bg-slate-50 border-t border-slate-100 px-4 py-2.5 flex items-center justify-between">
            <div className="flex space-x-1">
              {tourSteps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleGoToStep(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentStep ? 'w-5 bg-indigo-600' : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  title={`Step ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-700 text-xs font-semibold transition flex items-center space-x-1"
              >
                <ChevronLeft className="w-3 h-3" />
                <span>Prev</span>
              </button>

              <button
                onClick={handleNext}
                disabled={currentStep === tourSteps.length - 1}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white text-xs font-semibold transition flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
