import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { HugeShieldIcon, HugeBotIcon, HugeCheckCircleIcon } from './HugeIcons.tsx';
import {
  Plus,
  Edit2,
  ShieldAlert,
  Mail,
  Calendar,
  Layers,
  Search,
  Database,
  GitBranch,
  Filter
} from 'lucide-react';
import { ScopePolicy } from '../types.ts';
import { SkeletonCard } from './SkeletonLoader.tsx';

interface ConnectedAgentsProps {
  policies: ScopePolicy[];
  onSelectPolicy: (policy: ScopePolicy) => void;
  onOpenNewPolicy: () => void;
  onTriggerDemo: (connectionId: string, outOfScope: boolean) => void;
  isTesting: boolean;
  isLoading?: boolean;
}

export const ConnectedAgents: React.FC<ConnectedAgentsProps> = ({
  policies,
  onSelectPolicy,
  onOpenNewPolicy,
  onTriggerDemo,
  isTesting,
  isLoading = false
}) => {
  const [selectedService, setSelectedService] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const services = [
    { id: 'all', label: 'All Services' },
    { id: 'gmail', label: 'Gmail' },
    { id: 'gcal', label: 'Google Calendar' },
    { id: 'm365', label: 'Microsoft 365' },
    { id: 'slack', label: 'Slack' },
    { id: 'github', label: 'GitHub' },
    { id: 'postgres', label: 'PostgreSQL' },
    { id: 'salesforce', label: 'Salesforce' },
    { id: 'notion', label: 'Notion' },
    { id: 'custom_rest', label: 'Custom REST' }
  ];

  const filteredPolicies = useMemo(() => {
    return policies.filter(policy => {
      const matchesService = selectedService === 'all' || policy.connectorId === selectedService;
      const matchesSearch = !searchQuery.trim() || 
        policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.connectorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.allowedFields.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesService && matchesSearch;
    });
  }, [policies, selectedService, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-entrance">
        <div>
          <div className="flex items-center space-x-2">
            <HugeShieldIcon size={22} className="text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Agent Scope Policies</h2>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-bold">
              {policies.length} Policies Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cryptographic field allowlists enforced by the Keyhole Gateway and verified by Midnight ZK circuits.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <Link
            to="/integrations"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Connect Services &amp; APIs</span>
          </Link>

          <button
            onClick={onOpenNewPolicy}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Scope Policy</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Service Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          {services.map(svc => {
            const count = svc.id === 'all' 
              ? policies.length 
              : policies.filter(p => p.connectorId === svc.id).length;
            
            if (svc.id !== 'all' && count === 0) return null;

            return (
              <button
                key={svc.id}
                onClick={() => setSelectedService(svc.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center space-x-1.5 ${
                  selectedService === svc.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{svc.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  selectedService === svc.id ? 'bg-slate-800 text-indigo-200' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64 flex-shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search policies or fields..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-sans"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Grid of Policies */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredPolicies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
          <Filter className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No policies found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No active scope policies match your selected filter or search criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPolicies.map((policy) => {
            const isGmail = policy.connectorId === 'gmail';
            const isGCal = policy.connectorId === 'gcal';
            const isDb = policy.connectorId === 'postgres';
            const isGit = policy.connectorId === 'github';

            return (
              <div
                key={policy.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between space-y-4 relative group"
              >
                <div className="space-y-3">
                  {/* Top Bar: Icon + Connector + Edit */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {isGmail ? <Mail className="w-4 h-4" /> :
                         isGCal ? <Calendar className="w-4 h-4" /> :
                         isDb ? <Database className="w-4 h-4" /> :
                         isGit ? <GitBranch className="w-4 h-4" /> :
                         <HugeBotIcon size={18} />}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                          {policy.connectorId}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">{policy.name}</h3>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectPolicy(policy)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition"
                      title="Edit Policy"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {policy.description}
                  </p>

                  {/* Allowed Fields Pill Container */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Declared Allowed Fields:</span>
                      <span className="font-bold text-indigo-600">{policy.allowedFields.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {policy.allowedFields.map((field) => (
                        <span
                          key={field}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] border border-slate-200/80 font-medium"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Trigger Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-slate-400">
                    Max {policy.maxMessageCount || 10} records
                  </span>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onTriggerDemo(policy.id, false)}
                      disabled={isTesting}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold transition flex items-center space-x-1 border border-emerald-200 shadow-2xs"
                    >
                      <HugeCheckCircleIcon size={12} />
                      <span>Valid</span>
                    </button>
                    <button
                      onClick={() => onTriggerDemo(policy.id, true)}
                      disabled={isTesting}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold transition flex items-center space-x-1 border border-rose-200 shadow-2xs"
                    >
                      <ShieldAlert className="w-3 h-3 text-rose-600" />
                      <span>Attack</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
