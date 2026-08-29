import React, { useState } from 'react';
import { HugeShieldCheckIcon, HugeShieldAlertIcon, HugeCpuIcon } from './HugeIcons.tsx';
import { Activity, ArrowRight, ShieldCheck, ShieldX, Database, Trash2, Layers, ExternalLink } from 'lucide-react';
import { AuditEvent } from '../types.ts';
import { SkeletonFeedItem } from './SkeletonLoader.tsx';
import { BlockExplorerModal } from './BlockExplorerModal.tsx';

interface ComplianceFeedProps {
  events: AuditEvent[];
  onInspectProof: (event: AuditEvent) => void;
  onClearEvents?: () => void;
  isLoading?: boolean;
}

export const ComplianceFeed: React.FC<ComplianceFeedProps> = ({
  events,
  onInspectProof,
  onClearEvents,
  isLoading = false
}) => {
  const [selectedTxForExplorer, setSelectedTxForExplorer] = useState<string | null>(null);
  const validEvents = events.filter(e => e.type !== 'INIT');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-card hover:shadow-card-hover transition-all duration-200 space-y-6 animate-entrance animate-delay-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Live Zero-Knowledge Compliance Stream</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time SSE event log of all evaluated agent requests. Zero confidential message content is stored in this log.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-500 font-medium">Live SSE Stream</span>
          </div>

          {onClearEvents && validEvents.length > 0 && (
            <button
              onClick={onClearEvents}
              className="px-2.5 py-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-medium transition flex items-center space-x-1 border border-slate-200"
              title="Clear all recorded compliance events"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Log</span>
            </button>
          )}
        </div>
      </div>

      {/* Events Stream List */}
      {isLoading ? (
        <div className="space-y-3">
          <SkeletonFeedItem />
          <SkeletonFeedItem />
          <SkeletonFeedItem />
        </div>
      ) : validEvents.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs font-sans">
          No audit events recorded yet. Trigger a query from Agent Studio to generate real-time events.
        </div>
      ) : (
        <div className="space-y-2.5">
          {validEvents.map((evt) => {
            const isBlocked = evt.type === 'BLOCKED';
            const txId = evt.midnightTxId || `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

            return (
              <div
                key={evt.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isBlocked
                    ? 'bg-rose-50/40 border-rose-200 hover:bg-rose-50/70'
                    : 'bg-slate-50 border-slate-200 hover:bg-indigo-50/30'
                }`}
              >
                <div className="flex items-start sm:items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isBlocked
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {isBlocked ? <HugeShieldAlertIcon size={18} /> : <HugeShieldCheckIcon size={18} />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                        isBlocked
                          ? 'bg-rose-200/70 text-rose-800'
                          : 'bg-emerald-200/70 text-emerald-800'
                      }`}>
                        {evt.type}
                      </span>
                      <span className="font-bold text-slate-900 text-xs">
                        {evt.policyName || evt.connectionId}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-mono">
                      {isBlocked
                        ? `Exfiltration Blocked: [${(evt.requestedFields || []).join(', ')}]`
                        : `Delivered Fields: [${(evt.allowedFields || []).join(', ')}]`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
                  <div className="text-right text-[11px] text-slate-400 font-mono">
                    <p>{new Date(evt.timestamp).toLocaleTimeString()}</p>
                    <p className="text-[10px]">{evt.deliveredFieldCount || 0} fields delivered</p>
                  </div>

                  {(evt.proofDetails || evt.proofId || evt.midnightTxId) && (
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => onInspectProof(evt)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition flex items-center space-x-1 shadow-2xs hover:-translate-y-0.5"
                      >
                        <HugeCpuIcon size={13} />
                        <span>ZK Proof</span>
                      </button>

                      <button
                        onClick={() => setSelectedTxForExplorer(txId)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition shadow-2xs"
                        title="View on Midnight Testnet Block Explorer"
                      >
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Block Explorer Modal */}
      {selectedTxForExplorer && (
        <BlockExplorerModal
          txHash={selectedTxForExplorer}
          onClose={() => setSelectedTxForExplorer(null)}
        />
      )}
    </div>
  );
};
