import React from 'react';
import { ShieldCheck, Lock, Activity, Radio } from 'lucide-react';

interface HeaderProps {
  stats: {
    totalRequests: number;
    compliantRequests: number;
    blockedRequests: number;
    activePolicies: number;
  };
  isConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({ stats, isConnected }) => {
  return (
    <header className="border-b border-slate-800 bg-midnight-800/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Pitch */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-tight text-white">KEYHOLE</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono">
                  Midnight Compact ZK
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Your AI agent gets a keyhole, not the whole room — and Midnight proves it never saw more than that.
              </p>
            </div>
          </div>

          {/* Real-time Status & Live Metrics */}
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="flex flex-col items-end">
                <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Compliant</span>
                <span className="font-mono font-bold text-emerald-400 text-base">{stats.compliantRequests}</span>
              </div>
              <div className="h-8 w-px bg-slate-800"></div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Blocked</span>
                <span className="font-mono font-bold text-rose-400 text-base">{stats.blockedRequests}</span>
              </div>
              <div className="h-8 w-px bg-slate-800"></div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Active Scopes</span>
                <span className="font-mono font-bold text-indigo-400 text-base">{stats.activePolicies}</span>
              </div>
            </div>

            {/* Connection Pill */}
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${
              isConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              <Radio className={`w-3.5 h-3.5 ${isConnected ? 'animate-pulse' : ''}`} />
              <span>{isConnected ? 'LIVE FEED ACTIVE' : 'CONNECTING...'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
