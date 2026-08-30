import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HugeShieldIcon } from './HugeIcons.tsx';
import { X, Trash2, Save, Plus, AlertCircle, Mail, Calendar, Layers, Database, Shield, Clock, ShieldAlert } from 'lucide-react';
import { ScopePolicy, ConnectorInfo } from '../types.ts';

interface PolicyEditorProps {
  policy: ScopePolicy | null;
  connectors?: ConnectorInfo[];
  onSave: (policy: ScopePolicy) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const FIELD_CATALOG: Record<string, { fields: string[]; sensitive: string[]; defaultAllowed: string[] }> = {
  gmail: {
    fields: ['id', 'sender', 'recipient', 'subject', 'date', 'snippet', 'labels', 'body', 'attachments', 'raw_payload'],
    sensitive: ['body', 'attachments', 'raw_payload'],
    defaultAllowed: ['sender', 'subject', 'date']
  },
  gcal: {
    fields: ['id', 'title', 'start_time', 'end_time', 'attendee_count', 'location', 'description', 'meet_link'],
    sensitive: ['description', 'meet_link'],
    defaultAllowed: ['title', 'start_time', 'end_time', 'attendee_count']
  },
  m365: {
    fields: ['id', 'from', 'to_recipients', 'subject', 'received_time', 'has_attachments', 'importance', 'body_preview', 'full_body', 'attachments', 'm365_tokens'],
    sensitive: ['full_body', 'attachments', 'm365_tokens'],
    defaultAllowed: ['from', 'subject', 'received_time']
  },
  slack: {
    fields: ['id', 'channel_name', 'channel_type', 'sender_name', 'timestamp', 'reaction_count', 'message_text', 'threads', 'files', 'dm_history'],
    sensitive: ['message_text', 'threads', 'files', 'dm_history'],
    defaultAllowed: ['channel_name', 'sender_name', 'timestamp']
  },
  github: {
    fields: ['id', 'repo_name', 'issue_number', 'issue_title', 'author', 'state', 'labels', 'source_code', 'env_secrets', 'private_keys', 'diff_blobs'],
    sensitive: ['source_code', 'env_secrets', 'private_keys', 'diff_blobs'],
    defaultAllowed: ['repo_name', 'issue_title', 'author', 'state']
  },
  postgres: {
    fields: ['row_id', 'customer_tier', 'subscription_status', 'region', 'last_active_date', 'credit_card_hash', 'pii_address', 'salary', 'passwords'],
    sensitive: ['credit_card_hash', 'pii_address', 'salary', 'passwords'],
    defaultAllowed: ['row_id', 'customer_tier', 'subscription_status', 'region']
  },
  custom_rest: {
    fields: ['record_id', 'status', 'timestamp', 'meta_tags', 'private_payload', 'auth_tokens'],
    sensitive: ['private_payload', 'auth_tokens'],
    defaultAllowed: ['record_id', 'status', 'timestamp']
  }
};

export const PolicyEditor: React.FC<PolicyEditorProps> = ({
  policy,
  onSave,
  onDelete,
  onClose
}) => {
  const [id, setId] = useState(policy?.id || `conn_${Date.now()}`);
  const [name, setName] = useState(policy?.name || '');
  const [connectorId, setConnectorId] = useState(policy?.connectorId || 'gmail');
  const [description, setDescription] = useState(policy?.description || '');
  const [allowedFields, setAllowedFields] = useState<string[]>(
    policy?.allowedFields || FIELD_CATALOG[policy?.connectorId || 'gmail']?.defaultAllowed || ['sender', 'subject', 'date']
  );
  const [maxMessageCount, setMaxMessageCount] = useState<number>(policy?.maxMessageCount || 10);
  const [ttlOption, setTtlOption] = useState<'permanent' | '15m' | '1h' | '24h'>('permanent');
  const [canaryEnabled, setCanaryEnabled] = useState(true);

  const activeCatalog = FIELD_CATALOG[connectorId] || FIELD_CATALOG.gmail;
  const availableFields = activeCatalog.fields;

  const handleConnectorChange = (newConnectorId: string) => {
    setConnectorId(newConnectorId);
    if (!policy) {
      const catalog = FIELD_CATALOG[newConnectorId] || FIELD_CATALOG.gmail;
      setAllowedFields(catalog.defaultAllowed);
    }
  };

  const handleToggleField = (field: string) => {
    if (allowedFields.includes(field)) {
      setAllowedFields(allowedFields.filter(f => f !== field));
    } else {
      setAllowedFields([...allowedFields, field]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Policy name is required');
      return;
    }
    if (allowedFields.length === 0) {
      alert('At least one field must be allowed');
      return;
    }

    let expiresAt: string | null = null;
    if (ttlOption === '15m') {
      expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    } else if (ttlOption === '1h') {
      expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    } else if (ttlOption === '24h') {
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    }

    onSave({
      id,
      name,
      connectorId,
      description,
      allowedFields,
      maxMessageCount,
      expiresAt,
      canaryEnabled,
      status: policy?.status || 'active',
      createdAt: policy?.createdAt || new Date().toISOString()
    } as any);
    onClose();
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
        className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full shadow-2xl max-h-[90vh] flex flex-col overflow-hidden z-[101] animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:px-8 sm:py-5 border-b border-slate-100 flex-shrink-0 bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <HugeShieldIcon size={20} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {policy ? 'Edit Scope Policy' : 'Create Agent Scope Policy'}
              </h3>
              <p className="text-xs text-slate-500">Configure allowable fields for Midnight ZK circuit verification</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4 flex-grow">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Policy Display Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. M365 Finance Auditor / Slack Incident Bot"
              className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Data Connector
              </label>
              <select
                value={connectorId}
                onChange={(e) => handleConnectorChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-sans"
              >
                <option value="gmail">Google Gmail (v1 API)</option>
                <option value="gcal">Google Calendar (v3 API)</option>
                <option value="m365">Microsoft 365 (Outlook & Graph)</option>
                <option value="slack">Slack Enterprise Grid</option>
                <option value="github">GitHub & GitLab API</option>
                <option value="postgres">PostgreSQL / Snowflake SQL</option>
                <option value="custom_rest">Custom REST Microservice</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Max Records Per Query
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={maxMessageCount}
                onChange={(e) => setMaxMessageCount(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>
          </div>

          {/* Ephemeral TTL Lifetime & Canary Honeypot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Scope Lifetime (Ephemeral TTL):</span>
              </label>
              <select
                value={ttlOption}
                onChange={(e) => setTtlOption(e.target.value as any)}
                className="w-full p-2 rounded-lg bg-white border border-slate-200 text-slate-800 font-semibold focus:outline-none"
              >
                <option value="permanent">Permanent (Always Active)</option>
                <option value="15m">15 Minutes (Ephemeral Passport)</option>
                <option value="1h">1 Hour (Single Work Shift)</option>
                <option value="24h">24 Hours (Daily Task)</option>
              </select>
            </div>

            <div className="flex flex-col justify-center">
              <label className="font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Canary Honeypot:</span>
              </label>
              <label className="flex items-center space-x-2 text-[11px] text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={canaryEnabled}
                  onChange={(e) => setCanaryEnabled(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Arm Zero-Day Canary Trap</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Policy Description & Security Intent
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this agent is allowed to access and why..."
              className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-sans resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block font-semibold text-slate-700">
                Allowed Field Set (Click to Toggle):
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {allowedFields.length} of {availableFields.length} selected
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableFields.map((field) => {
                const isSelected = allowedFields.includes(field);
                const isSensitive = activeCatalog.sensitive.includes(field);

                return (
                  <button
                    key={field}
                    type="button"
                    onClick={() => handleToggleField(field)}
                    className={`p-2 rounded-lg border text-left font-mono text-[11px] transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <span className="truncate">{field}</span>
                    {isSensitive && (
                      <span className="text-[8px] px-1 py-0.2 rounded bg-rose-100 text-rose-700 font-sans uppercase font-bold ml-1">
                        SENSITIVE
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {policy && onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(policy.id)}
                className="px-3.5 py-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold transition flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Policy</span>
              </button>
            ) : <div />}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center space-x-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Scope Policy</span>
              </button>
            </div>
          </div>
        </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
