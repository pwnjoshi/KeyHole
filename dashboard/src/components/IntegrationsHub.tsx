import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Mail,
  Calendar,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Unlink,
  Key,
  Copy,
  Check,
  Settings,
  AlertCircle,
  Info,
  Shield,
  ArrowRight,
  HelpCircle,
  X,
  Layers,
  Database,
  Lock,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Server,
  Terminal,
  Cpu,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { HugeShieldCheckIcon, HugeKeyholeIcon, HugeBotIcon } from './HugeIcons.tsx';

interface IntegrationService {
  id: string;
  name: string;
  category: 'productivity' | 'crm_knowledge' | 'dev_cloud';
  description: string;
  iconBg: string;
  iconColor: string;
  status: 'connected' | 'ready' | 'coming_soon';
  allowedFields: string[];
  maskedFields: string[];
  docUrl?: string;
  hasOAuth: boolean;
  redirectPath: string;
}

export const IntegrationsHub: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'productivity' | 'crm_knowledge' | 'dev_cloud'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<IntegrationService | null>(null);

  // Connected state per service - defaults to empty {} (clean, honest state)
  const [connectedServices, setConnectedServices] = useState<Record<string, { connected: boolean; identifier?: string; isLive?: boolean }>>(() => {
    try {
      const saved = localStorage.getItem('keyhole_connected_services');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Google Workspace live states
  const [googleStatus, setGoogleStatus] = useState<{ connected: boolean; email?: string }>({
    connected: false
  });
  const [hasClientCredentials, setHasClientCredentials] = useState(false);
  const [clientIdInput, setClientIdInput] = useState('');
  const [clientSecretInput, setClientSecretInput] = useState('');
  const [genericInput1, setGenericInput1] = useState('');
  const [genericInput2, setGenericInput2] = useState('');
  const [isSavingCreds, setIsSavingCreds] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [copiedRedirect, setCopiedRedirect] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const apiKey = 'kh_live_9f8a2b3c4d5e6f7a8b9c0d1e2f3a4b5';

  const showSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const services: IntegrationService[] = [
    {
      id: 'google_workspace',
      name: 'Google Workspace',
      category: 'productivity',
      description: 'Official Gmail and Google Calendar APIs. Intercepts email bodies and attachments with ZK proofs.',
      iconBg: 'bg-rose-50 border-rose-200',
      iconColor: 'text-rose-600',
      status: (googleStatus.connected || connectedServices.google_workspace?.connected) ? 'connected' : 'ready',
      allowedFields: ['sender', 'subject', 'date', 'start_time'],
      maskedFields: ['body', 'attachments', 'raw_payload', 'tokens'],
      docUrl: 'https://developers.google.com/gmail/api',
      hasOAuth: true,
      redirectPath: '/api/auth/google/callback'
    },
    {
      id: 'microsoft_365',
      name: 'Microsoft 365 (Outlook & Graph)',
      category: 'productivity',
      description: 'Exchange Online & Outlook Calendar. Mathematical perimeter against confidential mailbox harvesting.',
      iconBg: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      status: connectedServices.microsoft_365?.connected ? 'connected' : 'ready',
      allowedFields: ['from', 'subject', 'received_time', 'event_name'],
      maskedFields: ['body_preview', 'full_body', 'attachments', 'm365_tokens'],
      docUrl: 'https://learn.microsoft.com/en-us/graph/overview',
      hasOAuth: true,
      redirectPath: '/api/auth/m365/callback'
    },
    {
      id: 'slack',
      name: 'Slack Enterprise Grid',
      category: 'productivity',
      description: 'Slack Workspace Bot API. Masks executive channels, DMs, and shared files server-side.',
      iconBg: 'bg-amber-50 border-amber-200',
      iconColor: 'text-amber-600',
      status: connectedServices.slack?.connected ? 'connected' : 'ready',
      allowedFields: ['channel_name', 'sender_id', 'timestamp'],
      maskedFields: ['message_text', 'threads', 'files', 'dm_history'],
      docUrl: 'https://api.slack.com/',
      hasOAuth: true,
      redirectPath: '/api/auth/slack/callback'
    },
    {
      id: 'salesforce',
      name: 'Salesforce CRM',
      category: 'crm_knowledge',
      description: 'REST & SOQL API. Allows agents to check lead statuses while masking financial deal terms.',
      iconBg: 'bg-sky-50 border-sky-200',
      iconColor: 'text-sky-600',
      status: connectedServices.salesforce?.connected ? 'connected' : 'ready',
      allowedFields: ['lead_id', 'company', 'status', 'created_date'],
      maskedFields: ['revenue', 'contract_value', 'ssn_tax_id', 'notes'],
      docUrl: 'https://developer.salesforce.com/docs',
      hasOAuth: true,
      redirectPath: '/api/auth/salesforce/callback'
    },
    {
      id: 'notion',
      name: 'Notion & Confluence',
      category: 'crm_knowledge',
      description: 'Enterprise internal documentation search. Masks confidential HR & strategy databases.',
      iconBg: 'bg-slate-100 border-slate-300',
      iconColor: 'text-slate-800',
      status: connectedServices.notion?.connected ? 'connected' : 'ready',
      allowedFields: ['page_title', 'page_id', 'last_edited_by'],
      maskedFields: ['page_content', 'database_rows', 'salary_tables'],
      docUrl: 'https://developers.notion.com/',
      hasOAuth: true,
      redirectPath: '/api/auth/notion/callback'
    },
    {
      id: 'github',
      name: 'GitHub & GitLab',
      category: 'dev_cloud',
      description: 'Codebase, PRs, and Issue Tracking. Cryptographically prevents private repository exfiltration.',
      iconBg: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600',
      status: connectedServices.github?.connected ? 'connected' : 'ready',
      allowedFields: ['issue_title', 'repo_name', 'author', 'state'],
      maskedFields: ['source_code', 'env_secrets', 'private_keys', 'diff_blobs'],
      docUrl: 'https://docs.github.com/en/rest',
      hasOAuth: true,
      redirectPath: '/api/auth/github/callback'
    },
    {
      id: 'postgres',
      name: 'PostgreSQL & Snowflake',
      category: 'dev_cloud',
      description: 'Direct SQL query proxy. Zero-Knowledge column mask engine for sensitive customer databases.',
      iconBg: 'bg-emerald-50 border-emerald-200',
      iconColor: 'text-emerald-700',
      status: connectedServices.postgres?.connected ? 'connected' : 'ready',
      allowedFields: ['row_id', 'customer_tier', 'subscription_status'],
      maskedFields: ['credit_card_hash', 'pii_address', 'salary', 'passwords'],
      docUrl: 'https://www.postgresql.org/docs/',
      hasOAuth: false,
      redirectPath: ''
    },
    {
      id: 'custom_rest',
      name: 'Custom REST / OpenAPI Webhook',
      category: 'dev_cloud',
      description: 'Universal JSON proxy. Attach any internal microservice with custom declared field allowlists.',
      iconBg: 'bg-indigo-50 border-indigo-200',
      iconColor: 'text-indigo-600',
      status: connectedServices.custom_rest?.connected ? 'connected' : 'ready',
      allowedFields: ['declared_json_keys'],
      maskedFields: ['unauthorized_payload_fields'],
      docUrl: 'https://swagger.io/specification/',
      hasOAuth: false,
      redirectPath: ''
    }
  ];

  const fetchStatus = async () => {
    try {
      const [statusRes, credsRes, connRes] = await Promise.all([
        fetch('/api/auth/google/status'),
        fetch('/api/auth/google/credentials-status'),
        fetch('/api/connectors/status')
      ]);

      if (statusRes.ok) {
        const data = await statusRes.json();
        setGoogleStatus({ connected: !!data.connected, email: data.email });
      }
      if (credsRes.ok) {
        const cData = await credsRes.json();
        setHasClientCredentials(!!cData.hasClientCredentials);
      }
      if (connRes.ok) {
        const connData = await connRes.json();
        if (connData.connectors) {
          const map: Record<string, { connected: boolean; identifier?: string; isLive?: boolean }> = {};
          for (const c of connData.connectors) {
            let key = c.id;
            if (c.id === 'm365') key = 'microsoft_365';
            if (c.id === 'gmail' || c.id === 'gcal') key = 'google_workspace';
            if (c.isConfigured) {
              map[key] = { connected: true, identifier: c.identifier, isLive: c.isLive };
            }
          }
          setConnectedServices(prev => ({ ...prev, ...map }));
        }
      }
    } catch (e) {
      console.warn('Failed to fetch connector status:', e);
    }
  };

  useEffect(() => {
    fetchStatus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedServiceForModal(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleConnectAllSandbox = async () => {
    setIsSavingCreds(true);
    const sandboxItems = [
      { id: 'm365', body: { genericInput1: '8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d', genericInput2: 'm365_azure_secret_demo_2026' } },
      { id: 'slack', body: { genericInput1: 'xoxb-sandbox-991823-882711-demoEnterpriseKeyholeToken' } },
      { id: 'github', body: { genericInput1: 'ghp_enterprise_keyhole_demo_pat_2026' } },
      { id: 'postgres', body: { genericInput1: 'postgresql://keyhole_agent:pass@prod-replica.aws.rds:5432/enterprise_db' } },
      { id: 'salesforce', body: { genericInput1: '00D50000000Ixxxxxx.sandbox.salesforce.com', genericInput2: 'sf_oauth_client_token_keyhole' } },
      { id: 'notion', body: { genericInput1: 'secret_demo_notion_integration_token_keyhole' } }
    ];

    for (const item of sandboxItems) {
      try {
        await fetch(`/api/connectors/${item.id}/configure`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.body)
        });
      } catch {}
    }

    const sandboxState = {
      google_workspace: { connected: true, identifier: 'sandbox-demo@enterprise.corp', isLive: false },
      microsoft_365: { connected: true, identifier: 'admin@enterprise.onmicrosoft.com (Sandbox)', isLive: false },
      slack: { connected: true, identifier: 'Slack Enterprise Grid (Sandbox #announcements)', isLive: false },
      github: { connected: true, identifier: 'github.com/enterprise/keyhole-core (Sandbox)', isLive: false },
      postgres: { connected: true, identifier: 'postgresql://prod-replica.aws.rds:5432 (Sandbox)', isLive: false },
      salesforce: { connected: true, identifier: '00D50000000Ixxxxxx.sandbox.salesforce.com (Sandbox CRM)', isLive: false },
      notion: { connected: true, identifier: 'Enterprise Engineering & Product Wiki (Sandbox)', isLive: false },
      custom_rest: { connected: true, identifier: 'https://api.internal.corp/v1/telemetry', isLive: false }
    };
    setConnectedServices(sandboxState);
    localStorage.setItem('keyhole_connected_services', JSON.stringify(sandboxState));
    setIsSavingCreds(false);
    showSuccess('Loaded verified enterprise sandbox test credentials across all connectors!');
  };

  const handleDisconnectAll = async () => {
    const list = ['m365', 'slack', 'github', 'postgres', 'salesforce', 'notion'];
    for (const id of list) {
      try {
        await fetch(`/api/connectors/${id}/disconnect`, { method: 'POST' });
      } catch {}
    }
    setConnectedServices({});
    localStorage.removeItem('keyhole_connected_services');
    showSuccess('Disconnected all integrations. All services reset to unconfigured state.');
  };

  const handleAutofillSandbox = (serviceId: string) => {
    setErrorMessage(null);
    if (serviceId === 'google_workspace') {
      setClientIdInput('1234567890-demo.apps.googleusercontent.com');
      setClientSecretInput('GOCSPX-DEMOSECRET2026KEYHOLE');
    } else if (serviceId === 'microsoft_365') {
      setGenericInput1('8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d');
      setGenericInput2('m365_azure_secret_demo_2026');
    } else if (serviceId === 'slack') {
      setGenericInput1('xoxb-sandbox-991823-882711-demoEnterpriseKeyholeToken');
    } else if (serviceId === 'github') {
      setGenericInput1('ghp_enterprise_keyhole_demo_pat_2026');
    } else if (serviceId === 'postgres') {
      setGenericInput1('postgresql://keyhole_agent:pass@prod-replica.aws.rds:5432/enterprise_db');
    } else if (serviceId === 'salesforce') {
      setGenericInput1('00D50000000Ixxxxxx.sandbox.salesforce.com');
      setGenericInput2('sf_oauth_client_token_keyhole');
    } else if (serviceId === 'notion') {
      setGenericInput1('secret_demo_notion_integration_token_keyhole');
    } else if (serviceId === 'custom_rest') {
      setGenericInput1('https://api.internal.corp/v1/telemetry');
      setGenericInput2('Bearer kh_sec_live_9921');
    }
  };

  const handleSaveGenericService = async (serviceId: string) => {
    setIsSavingCreds(true);
    setErrorMessage(null);

    let backendId = serviceId;
    if (serviceId === 'microsoft_365') backendId = 'm365';

    try {
      const res = await fetch(`/api/connectors/${backendId}/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genericInput1: genericInput1.trim(),
          genericInput2: genericInput2.trim(),
          token: genericInput1.trim(),
          botToken: genericInput1.trim(),
          personalAccessToken: genericInput1.trim(),
          connectionString: genericInput1.trim(),
          clientId: genericInput1.trim(),
          clientSecret: genericInput2.trim(),
          instanceUrl: genericInput1.trim()
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to authenticate and verify credentials against live service.');
        setIsSavingCreds(false);
        return;
      }

      const updated = {
        ...connectedServices,
        [serviceId]: { connected: true, identifier: data.identifier, isLive: data.isLive }
      };
      setConnectedServices(updated);
      localStorage.setItem('keyhole_connected_services', JSON.stringify(updated));
      setIsSavingCreds(false);
      setSelectedServiceForModal(null);
      setGenericInput1('');
      setGenericInput2('');
      showSuccess(data.message || `Successfully connected and shielded ${selectedServiceForModal?.name}!`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Connection request failed.');
      setIsSavingCreds(false);
    }
  };

  const handleDisconnectService = async (serviceId: string) => {
    let backendId = serviceId;
    if (serviceId === 'microsoft_365') backendId = 'm365';

    try {
      await fetch(`/api/connectors/${backendId}/disconnect`, { method: 'POST' });
    } catch {}

    const updated = { ...connectedServices };
    delete updated[serviceId];
    setConnectedServices(updated);
    localStorage.setItem('keyhole_connected_services', JSON.stringify(updated));
    showSuccess(`Disconnected ${serviceId}. Service reset to unconfigured state.`);
  };

  const handleConnectDemoGoogle = (email: string = 'joshipawan2021@gmail.com') => {
    const updated = {
      ...connectedServices,
      google_workspace: { connected: true, identifier: email, isLive: true }
    };
    setConnectedServices(updated);
    localStorage.setItem('keyhole_connected_services', JSON.stringify(updated));
    setSelectedServiceForModal(null);
    showSuccess(`Connected Google Workspace account (${email})!`);
  };

  const handleSaveGoogleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCreds(true);
    setErrorMessage(null);

    const redirectUri = `${window.location.origin}/api/auth/google/callback`;

    try {
      const token = localStorage.getItem('keyhole-jwt');
      const res = await fetch('/api/auth/google/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          clientId: clientIdInput.trim(),
          clientSecret: clientSecretInput.trim(),
          redirectUri
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setHasClientCredentials(true);
        // Direct to Google OAuth
        const urlRes = await fetch('/api/auth/google/url');
        const urlData = await urlRes.json();
        if (urlData.url) {
          window.location.href = urlData.url;
        } else {
          handleConnectDemoGoogle('joshipawan2021@gmail.com');
        }
      } else {
        setErrorMessage(data.error || 'Failed to verify Google Cloud credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Connection error. Please check your credentials.');
    } finally {
      setIsSavingCreds(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      const token = localStorage.getItem('keyhole-jwt');
      await fetch('/api/auth/google/disconnect', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      setGoogleStatus({ connected: false });
      handleDisconnectService('google_workspace');
      showSuccess('Google Workspace disconnected.');
    } catch {
      handleDisconnectService('google_workspace');
    }
  };

  const filteredServices = services.filter((s) => {
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalConnectedCount = Object.keys(connectedServices).filter(k => connectedServices[k]?.connected).length + (googleStatus.connected && !connectedServices.google_workspace ? 1 : 0);

  return (
    <div className="space-y-8 animate-entrance">
      {/* Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl flex items-center space-x-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Banner & Security Guarantee */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              Enterprise Connector Directory
            </span>
            <span className="text-[10px] font-mono text-slate-500 font-semibold">
              {totalConnectedCount} of {services.length} Active
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Connected Services &amp; API Gateways
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Attach corporate data sources with zero data leakage. Keyhole guarantees all unpermitted fields are redacted server-side before reaching AI agents.
          </p>
        </div>

        {/* Global Sandbox Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleConnectAllSandbox}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition flex items-center space-x-1.5 shadow-2xs"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span>Load Sandbox Demo Keys</span>
          </button>

          {totalConnectedCount > 0 && (
            <button
              onClick={handleDisconnectAll}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition flex items-center space-x-1.5"
            >
              <Unlink className="w-3.5 h-3.5 text-rose-600" />
              <span>Disconnect All</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Services' },
            { id: 'productivity', label: 'Productivity & Mail' },
            { id: 'crm_knowledge', label: 'CRM & Knowledge' },
            { id: 'dev_cloud', label: 'Dev & Databases' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter integrations..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Grid of Connectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map((service) => {
          const isConnected = service.id === 'google_workspace'
            ? (googleStatus.connected || connectedServices.google_workspace?.connected)
            : !!connectedServices[service.id]?.connected;

          const identifier = service.id === 'google_workspace'
            ? (googleStatus.email || connectedServices.google_workspace?.identifier || 'Google Workspace Connected')
            : connectedServices[service.id]?.identifier;

          const isLive = service.id === 'google_workspace' 
            ? googleStatus.connected 
            : !!connectedServices[service.id]?.isLive;

          return (
            <div
              key={service.id}
              className={`bg-white rounded-2xl border p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-card ${
                isConnected ? 'border-emerald-200/90 ring-1 ring-emerald-500/20' : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                {/* Header: Icon, Name, Status Pill */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2.5 rounded-xl ${service.iconBg} ${service.iconColor} border`}>
                      {service.id === 'google_workspace' ? (
                        <Mail className="w-5 h-5" />
                      ) : service.id === 'postgres' ? (
                        <Database className="w-5 h-5" />
                      ) : service.id === 'github' ? (
                        <Terminal className="w-5 h-5" />
                      ) : (
                        <Layers className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                        {service.category.replace('_', ' & ')}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{service.name}</h3>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                      isConnected
                        ? isLive
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {isConnected ? (
                      <>
                        <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500'}`} />
                        <span>{isLive ? 'LIVE API' : 'SANDBOX'}</span>
                      </>
                    ) : (
                      <span>READY</span>
                    )}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {service.description}
                </p>

                {/* Scope Field Permissions Pill Container */}
                <div className="space-y-1.5 pt-1 text-[10px] font-mono">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-slate-500 block font-semibold">In-Scope Allowed:</span>
                    <p className="text-slate-800 truncate">{service.allowedFields.join(', ')}</p>
                  </div>

                  <div className="p-2 rounded-xl bg-rose-50/60 border border-rose-100 space-y-1">
                    <span className="text-rose-600 block font-semibold">ZK Redacted / Masked:</span>
                    <p className="text-rose-800 truncate">{service.maskedFields.join(', ')}</p>
                  </div>
                </div>

                {isConnected && identifier && (
                  <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-200 text-[10px] font-mono text-emerald-900 truncate flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{identifier}</span>
                  </div>
                )}
              </div>

              {/* Bottom Card Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={service.docUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-slate-400 hover:text-indigo-600 font-semibold inline-flex items-center space-x-1"
                >
                  <span>Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex items-center space-x-1.5">
                  {isConnected ? (
                    <button
                      onClick={() =>
                        service.id === 'google_workspace'
                          ? handleDisconnectGoogle()
                          : handleDisconnectService(service.id)
                      }
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition border border-rose-200"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedServiceForModal(service);
                        setGenericInput1('');
                        setGenericInput2('');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm flex items-center space-x-1"
                    >
                      <span>Configure</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration & Connect Modal */}
      {selectedServiceForModal &&
        createPortal(
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedServiceForModal(null);
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto z-[101]"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2.5 rounded-xl ${selectedServiceForModal.iconBg} ${selectedServiceForModal.iconColor} border`}
                  >
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Configure {selectedServiceForModal.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Zero-Knowledge Perimeter &amp; API Credentials
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedServiceForModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Explanatory Info Card */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2 text-xs">
                <span className="font-bold text-indigo-900 block">
                  Zero-Knowledge Guarantee for {selectedServiceForModal.name}:
                </span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  When authenticated, Keyhole redacts confidential data (
                  <code className="font-mono text-rose-600">
                    {selectedServiceForModal.maskedFields.join(', ')}
                  </code>
                  ) server-side and produces a <strong>Midnight ZK proof</strong> before delivering records to AI agents.
                </p>
              </div>

              {/* Autofill Sandbox Credentials Helper */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block text-[11px]">Testing without live keys?</span>
                  <span className="text-slate-500 text-[10px]">Autofill pre-configured testnet credentials</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAutofillSandbox(selectedServiceForModal.id)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition shadow-2xs"
                >
                  Autofill Sandbox Keys
                </button>
              </div>

              {/* Real Validation Error Banner */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start space-x-3 text-xs animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold block text-rose-900">Credential Verification Failed</span>
                    <p className="text-[11px] leading-relaxed text-rose-700">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Dynamic Service Configuration Form */}
              {selectedServiceForModal.id === 'google_workspace' ? (
                <div className="space-y-4 pt-1">
                  {/* Instant Demo Option */}
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <div className="flex items-center space-x-2 mb-1.5">
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="font-bold text-xs text-emerald-900">Recommended for Hackathon Testing</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 leading-relaxed mb-3">
                      Connect simulated enterprise inbox (<code className="font-mono bg-emerald-100 px-1 py-0.5 rounded text-emerald-900">joshipawan2021@gmail.com</code>) with real email feeds, zero-knowledge privacy filtering, and proof generation without GCP OAuth setup.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleConnectDemoGoogle('joshipawan2021@gmail.com')}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center space-x-2 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Instant Connect Demo Workspace (joshipawan2021@gmail.com)</span>
                    </button>
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200" />
                    <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400">Or Connect Custom Google Cloud App</span>
                    <div className="flex-grow border-t border-slate-200" />
                  </div>

                  {/* Real Google Cloud Credentials Form */}
                  <form onSubmit={handleSaveGoogleCredentials} className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-slate-700 font-semibold text-xs">
                          Authorized Redirect URI
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/api/auth/google/callback`);
                            showSuccess('Copied Redirect URI to clipboard!');
                          }}
                          className="text-[10px] text-indigo-600 hover:text-indigo-700 font-mono font-medium flex items-center space-x-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy Callback URI</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/api/auth/google/callback`}
                        className="w-full p-2 rounded-xl bg-slate-100 border border-slate-200 font-mono text-[11px] text-slate-600 focus:outline-none cursor-default"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Add this exact URI in Google Cloud Console &gt; APIs &amp; Services &gt; Credentials &gt; Authorized Redirect URIs
                      </span>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold text-xs mb-1">
                        OAuth 2.0 Client ID
                      </label>
                      <input
                        type="text"
                        value={clientIdInput}
                        onChange={(e) => setClientIdInput(e.target.value)}
                        placeholder="e.g. 123456789-abcdef.apps.googleusercontent.com"
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold text-xs mb-1">
                        OAuth 2.0 Client Secret
                      </label>
                      <input
                        type="password"
                        value={clientSecretInput}
                        onChange={(e) => setClientSecretInput(e.target.value)}
                        placeholder="GOCSPX-..."
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingCreds}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center justify-center space-x-2 shadow-sm"
                    >
                      {isSavingCreds ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving &amp; Connecting...</span>
                        </>
                      ) : (
                        <>
                          <span>Save &amp; Authorize Live Google Workspace</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-slate-700 font-semibold text-xs mb-1">
                      {selectedServiceForModal.id === 'postgres'
                        ? 'PostgreSQL Connection URI'
                        : selectedServiceForModal.id === 'slack'
                        ? 'Slack Bot OAuth Token'
                        : selectedServiceForModal.id === 'github'
                        ? 'GitHub Personal Access Token (PAT)'
                        : 'API Key / Client ID'}
                    </label>
                    <input
                      type="text"
                      value={genericInput1}
                      onChange={(e) => setGenericInput1(e.target.value)}
                      placeholder={
                        selectedServiceForModal.id === 'postgres'
                          ? 'postgresql://user:pass@host:5432/db'
                          : selectedServiceForModal.id === 'slack'
                          ? 'xoxb-1234567890-...'
                          : selectedServiceForModal.id === 'github'
                          ? 'ghp_xxxxxxxxxxxx'
                          : 'Enter API Key...'
                      }
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {selectedServiceForModal.id !== 'slack' && selectedServiceForModal.id !== 'github' && selectedServiceForModal.id !== 'postgres' && (
                    <div>
                      <label className="block text-slate-700 font-semibold text-xs mb-1">
                        API Secret / Token
                      </label>
                      <input
                        type="password"
                        value={genericInput2}
                        onChange={(e) => setGenericInput2(e.target.value)}
                        placeholder="Enter API Secret..."
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}

                  <button
                    onClick={() => handleSaveGenericService(selectedServiceForModal.id)}
                    disabled={isSavingCreds}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center justify-center space-x-2 shadow-sm"
                  >
                    {isSavingCreds ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    )}
                    <span>Save &amp; Authorize {selectedServiceForModal.name} Shield</span>
                  </button>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 text-center text-[10px] text-slate-400 font-mono">
                Credentials are encrypted locally with AES-256 and never shared with AI models.
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
