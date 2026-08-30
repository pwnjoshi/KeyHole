import React from 'react';
import { Link } from 'react-router-dom';
import { HugeKeyholeIcon, HugeCpuIcon, HugeShieldCheckIcon, HugeBotIcon } from './HugeIcons.tsx';
import { Shield, ExternalLink, ArrowRight, Github, Lock, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-200/90 bg-white/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-100">
          
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shadow-sm">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="5.8" r="2.8" fill="#ffffff"/>
                  <path d="M6.6 7.2L5.4 13H10.6L9.4 7.2H6.6Z" fill="#ffffff"/>
                  <circle cx="8" cy="5.8" r="1.1" fill="#4f46e5"/>
                </svg>
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  Keyhole
                </span>
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  Midnight
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              Your AI agent gets a keyhole, not the whole room — and Midnight Compact zero-knowledge proofs guarantee it never saw confidential data outside that perimeter.
            </p>

            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Enterprise Zero-Knowledge Perimeter · Verified on Midnight Network</span>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link to="/" className="hover:text-indigo-600 transition">Overview & Hero</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-indigo-600 transition">Technical Whitepaper</Link>
              </li>
              <li>
                <Link to="/studio" className="hover:text-indigo-600 transition">Agent Execution Studio</Link>
              </li>
              <li>
                <Link to="/console" className="hover:text-indigo-600 transition">Policy Console</Link>
              </li>
              <li>
                <Link to="/integrations" className="hover:text-indigo-600 transition">Integrations Hub</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Technology & Circuits */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans">
              Technology
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link to="/circuit" className="hover:text-indigo-600 transition">Compact v0.34 ZKIR</Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-indigo-600 transition">Breach Mitigation Metrics</Link>
              </li>
              <li>
                <span className="text-slate-500">SHA-256 Ledger Commitments</span>
              </li>
              <li>
                <span className="text-slate-500">Google Workspace v1/v3 APIs</span>
              </li>
              <li>
                <span className="text-slate-500">SQLite Persistence Engine</span>
              </li>
            </ul>
          </div>

          {/* Col 5: Security & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans">
              Compliance
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>SOC 2 Type II Ready</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>HIPAA Security Rule</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>GDPR Article 25</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>Zero Raw Data Leaks</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Ledger Info */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <strong className="text-slate-900 font-bold">KEYHOLE</strong>
            <span>© 2026</span>
            <span>·</span>
            <span>All rights reserved.</span>
          </div>

          <div className="flex items-center space-x-3 font-mono text-[11px] text-slate-500">
            <span>Compact Runtime v0.19.0</span>
            <span>·</span>
            <span className="text-indigo-600 font-bold">Ledger v9.1.0-rc.3</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
