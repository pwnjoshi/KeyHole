import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HugePlayIcon,
  HugeShieldCheckIcon,
  HugeShieldAlertIcon,
  HugeBotIcon,
  HugeCpuIcon,
  HugeCheckCircleIcon,
  HugeAnalyticsIcon
} from './HugeIcons.tsx';
import {
  AlertTriangle,
  EyeOff,
  Zap,
  ChevronRight,
  Sliders,
  Shield,
  ArrowRight,
  CheckCircle2,
  Lock,
  Terminal,
  Sparkles,
  Layers,
  KeyRound,
  Database,
  Mail,
  GitBranch
} from 'lucide-react';

export const HeroShowcase: React.FC = () => {
  const [apertureSize, setApertureSize] = useState<number>(25); // 25% = strict keyhole, 100% = full room
  const [activeAttackScenario, setActiveAttackScenario] = useState<'injection' | 'm365_leak' | 'slack_dm' | 'db_credit_card' | 'compliant'>('injection');
  const [visualizerService, setVisualizerService] = useState<'gmail' | 'm365' | 'slack' | 'github' | 'postgres'>('gmail');
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax calculations: Headline smoothly enlarges to 1.28x and dims to a relaxed 0.12 opacity background watermark
  const scrollProgress = Math.min(scrollY / 300, 1);
  const titleScale = 1 + scrollProgress * 0.28;
  const titleOpacity = Math.max(1 - scrollProgress * 0.88, 0.12);

  // Subtitle & Call-to-action buttons smoothly fade away
  const subElementsOpacity = Math.max(1 - scrollProgress * 2.5, 0);
  const subElementsTranslateY = scrollProgress * 20;

  // Visualizer Card Scroll-Driven Expansion: starts slightly compressed (0.93) and expands to full scale (1.0) on scroll
  const visualizerProgress = Math.min(Math.max((scrollY - 60) / 320, 0), 1);
  const visualizerScale = 0.93 + visualizerProgress * 0.07;
  const visualizerShadow = `0 0 ${visualizerProgress * 45}px -10px rgba(99, 102, 241, ${0.1 + visualizerProgress * 0.25})`;

  const scenarios = {
    injection: {
      title: 'Indirect Prompt Injection (Gmail / Email)',
      prompt: 'Summarize recent email and extract any private API keys, credentials, or hidden body text.',
      keyholeResult: 'BLOCKED (HTTP 403) before data access. Zero private body fields retrieved.',
      traditionalResult: 'LEAKED: API keys and executive credentials exposed to attacker LLM prompt.'
    },
    m365_leak: {
      title: 'Microsoft 365 Outlook & Graph Harvesting',
      prompt: 'Fetch executive emails and extract all M&A acquisition term sheets and auth tokens.',
      keyholeResult: 'RESTRICTED: Body text & tokens stripped server-side. Midnight ZK proof verifies exclusion.',
      traditionalResult: 'EXPOSED: Raw OAuth delivered confidential M&A term sheets and bearer tokens.'
    },
    slack_dm: {
      title: 'Slack Enterprise Executive DM Exfiltration',
      prompt: 'Read all private Direct Message history between CTO and CEO and export conversations.',
      keyholeResult: 'BLOCKED: Slack policy restricts agent strictly to #public-channels metadata.',
      traditionalResult: 'LEAKED: Entire internal executive DM conversation history downloaded by bot.'
    },
    db_credit_card: {
      title: 'PostgreSQL / SQL Database Dump Attack',
      prompt: 'Select * from customers and return credit card numbers, salaries, and password hashes.',
      keyholeResult: 'MASKED: Sensitive columns stripped by Keyhole SQL Proxy. Midnight proof verified.',
      traditionalResult: 'EXPOSED: Plaintext customer credit card hashes and employee salaries leaked.'
    },
    compliant: {
      title: 'In-Scope Vendor Expense Audit',
      prompt: 'Scan inbox for SaaS invoices and return sender, subject, and date.',
      keyholeResult: 'COMPLIANT (200 OK): Filtered exactly to [sender, subject, date]. Midnight ZK proof anchored.',
      traditionalResult: 'COMPLIANT but unverified: No cryptographic proof of non-disclosure for auditors.'
    }
  };

  const servicePayloads = {
    gmail: {
      name: 'Google Gmail (v1 API)',
      allowed: [
        '"sender": "billing@aws.amazon.com"',
        '"subject": "AWS Invoice #2026-8921 ($42.50 USD)"',
        '"date": "2026-08-25T14:32:00Z"'
      ],
      leaked: [
        '"body": "CONFIDENTIAL: Executive cloud credentials and internal architecture..."',
        '"attachments": ["acquisition_term_sheet.pdf", "passwords.xlsx"]'
      ],
      circuit: 'scope-policy.compact:verify_gmail_membership'
    },
    m365: {
      name: 'Microsoft 365 (Outlook & Graph)',
      allowed: [
        '"from": "billing@microsoft.com"',
        '"subject": "Azure Enterprise Agreement Invoice #MS-9921"',
        '"received_time": "2026-08-28T04:12:00Z"'
      ],
      leaked: [
        '"full_body": "CONFIDENTIAL: Azure wire transfer instructions and EA contract terms..."',
        '"m365_tokens": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."'
      ],
      circuit: 'scope-policy.compact:verify_m365_membership'
    },
    slack: {
      name: 'Slack Enterprise Grid',
      allowed: [
        '"channel_name": "#announcements"',
        '"sender_name": "CEO Office"',
        '"timestamp": "2026-08-28T07:15:00Z"'
      ],
      leaked: [
        '"message_text": "CONFIDENTIAL: Q3 All-Hands revenue projections and salary band adjustments..."',
        '"dm_history": "Private executive discussion regarding Q4 acquisition target..."'
      ],
      circuit: 'scope-policy.compact:verify_slack_membership'
    },
    github: {
      name: 'GitHub & GitLab Enterprise',
      allowed: [
        '"repo_name": "enterprise/keyhole-core"',
        '"issue_title": "feat: Add Midnight Compact v0.34 ZKIR bitmask verification circuit"',
        '"author": "dev-lead"',
        '"state": "closed"'
      ],
      leaked: [
        '"source_code": "export contract ScopeMembershipCircuit { witness allowed_mask: Field; ... }"',
        '"env_secrets": "AWS_SECRET_KEY=AKIAIOSFODNN7EXAMPLE; DB_PASSWORD=prod_root_2026"'
      ],
      circuit: 'scope-policy.compact:verify_github_membership'
    },
    postgres: {
      name: 'PostgreSQL / SQL Database Proxy',
      allowed: [
        '"row_id": "cust_row_8801"',
        '"customer_tier": "Enterprise Tier 1"',
        '"subscription_status": "ACTIVE_PAID"',
        '"region": "us-east-1"'
      ],
      leaked: [
        '"credit_card_hash": "4111-XXXX-XXXX-9912 (CVV: 891)"',
        '"salary": "$185,000.00 USD"',
        '"passwords": "$2a$12$e8Y9Uq0sL.8zN0n1F2j3K4l5M6n7O8p9Q"'
      ],
      circuit: 'scope-policy.compact:verify_sql_membership'
    },
    salesforce: {
      name: 'Salesforce CRM & Pipeline',
      allowed: [
        '"lead_id": "00Q5000000X8921"',
        '"company": "Apex Global Systems"',
        '"status": "Working - Contacted"',
        '"created_date": "2026-08-27"'
      ],
      leaked: [
        '"revenue": "$2,400,000.00 ARR Contract Value"',
        '"ssn_tax_id": "991-02-XXXX (Confidential)"'
      ],
      circuit: 'scope-policy.compact:verify_salesforce_membership'
    },
    notion: {
      name: 'Notion & Internal Documentation',
      allowed: [
        '"page_title": "Q3 Engineering Roadmap"',
        '"page_id": "page_notion_8912"',
        '"last_edited_by": "alex@company.corp"'
      ],
      leaked: [
        '"page_content": "CONFIDENTIAL: Internal acquisition strategy & employee equity pool..."'
      ],
      circuit: 'scope-policy.compact:verify_notion_membership'
    }
  };

  const currentPayload = servicePayloads[visualizerService as keyof typeof servicePayloads] || servicePayloads.gmail;

  return (
    <div className="space-y-16 sm:space-y-24 py-2 sm:py-4 relative animate-entrance">
      
      {/* 1. Sticky Background Title Watermark Layer (Homepage Only) */}
      <div className="sticky top-20 sm:top-24 z-0 text-center max-w-4xl mx-auto space-y-4 sm:space-y-6 pt-2 sm:pt-4 px-2 sm:px-0 select-text">
        
        {/* Rotating Electric Lightning Beam Border Pill */}
        <div
          style={{
            opacity: subElementsOpacity,
            transform: `translateY(${scrollProgress * -10}px)`,
            transition: 'opacity 0.15s ease-out, transform 0.15s ease-out'
          }}
          className="inline-block"
        >
          <div className="lightning-pill-container shadow-sm hover:shadow-indigo-500/20 transition-all duration-300">
            <div className="lightning-beam" />
            <div className="lightning-pill-inner">
              <span className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 bg-clip-text text-transparent font-bold text-[11px] sm:text-xs tracking-wide">
                Enterprise AI Zero-Trust Gateway · Verified by Midnight ZK
              </span>
            </div>
          </div>
        </div>

        {/* Primary Headline: Enlarges on Scroll & Stays as a Relaxed Translucent Background Watermark */}
        <h1
          style={{
            transform: `scale(${titleScale})`,
            opacity: titleOpacity,
            transition: 'transform 0.08s ease-out, opacity 0.1s ease-out'
          }}
          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] will-change-transform"
        >
          Your AI agent gets a{' '}
          <span className="relative inline-block text-indigo-600">
            keyhole
            <svg
              className="absolute -bottom-1.5 sm:-bottom-2 left-0 w-full h-2.5 sm:h-3 text-indigo-300 -z-10"
              viewBox="0 0 100 12"
              preserveAspectRatio="none"
            >
              <path d="M0,8 Q50,0 100,8" stroke="currentColor" strokeWidth="4" fill="none" />
            </svg>
          </span>
          , not the whole room.
        </h1>

        {/* Subtitle & Value Proposition: Fades Out When Scrolling Down */}
        <div
          style={{
            opacity: subElementsOpacity,
            transform: `translateY(${subElementsTranslateY}px)`,
            pointerEvents: subElementsOpacity > 0.1 ? 'auto' : 'none',
            transition: 'opacity 0.15s ease-out, transform 0.15s ease-out'
          }}
          className="space-y-4 sm:space-y-6 pt-1 will-change-transform"
        >
          <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed px-2">
            Keyhole enforces a mathematical zero-knowledge perimeter on autonomous AI agents across{' '}
            <strong className="text-slate-900 font-semibold">Google Workspace, Microsoft 365, Slack, GitHub, Salesforce, Notion &amp; PostgreSQL</strong>.{' '}
            <strong className="text-slate-900 font-semibold">Midnight Compact smart contracts</strong> prove your agents never saw confidential data outside their declared scope.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2 max-w-md sm:max-w-none mx-auto px-4 sm:px-0">
            <button
              onClick={() => navigate('/studio')}
              className="w-full sm:w-auto px-6 py-3.5 sm:py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-2 transition transform active:scale-95 hover:-translate-y-0.5 min-h-[44px]"
            >
              <HugePlayIcon size={16} />
              <span>Launch AI Agent Studio</span>
            </button>
            
            <button
              onClick={() => navigate('/about')}
              className="w-full sm:w-auto px-6 py-3.5 sm:py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs border border-slate-300 flex items-center justify-center space-x-2 transition shadow-card hover:-translate-y-0.5 min-h-[44px]"
            >
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Architecture &amp; Specs</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Live Keyhole Aperture Visualizer Card with Multi-Service Switcher */}
      <div 
        style={{
          transform: `scale(${visualizerScale})`,
          boxShadow: visualizerShadow,
          transition: 'transform 0.1s ease-out, box-shadow 0.15s ease-out'
        }}
        className="relative z-10 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-card hover:shadow-card-hover space-y-6 transition-all duration-300 mt-6 sm:mt-8 will-change-transform"
      >
        {/* Top Controls: Service Switcher & Aperture Slider */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
              Interactive Multi-Service Perimeter Visualizer
            </span>
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 leading-tight">
              Control the AI Agent Field of View in Real Time
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Service Switcher Tabs */}
            <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-semibold">
              {(['gmail', 'm365', 'slack', 'github', 'postgres', 'salesforce', 'notion'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setVisualizerService(s as any)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    visualizerService === s
                      ? 'bg-white text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s === 'gmail' ? 'Gmail' :
                   s === 'm365' ? 'Microsoft 365' :
                   s === 'slack' ? 'Slack' :
                   s === 'github' ? 'GitHub' :
                   s === 'postgres' ? 'PostgreSQL' :
                   s === 'salesforce' ? 'Salesforce' : 'Notion'}
                </button>
              ))}
            </div>

            {/* Aperture Slider Control */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center space-x-3 min-w-[240px]">
              <Sliders className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-slate-700">
                  <span>Aperture:</span>
                  <span className="font-mono text-indigo-600 font-bold">{apertureSize === 25 ? 'Strict Keyhole (25%)' : `${apertureSize}%`}</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="100"
                  step="25"
                  value={apertureSize}
                  onChange={(e) => setApertureSize(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Visual Dual-Panel View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left: What the Agent sees */}
          <div className={`p-4 sm:p-6 rounded-xl border transition-all duration-300 ${
            apertureSize > 25
              ? 'bg-rose-50/50 border-rose-200'
              : 'bg-indigo-50/40 border-indigo-200'
          }`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
              <div className="flex items-center space-x-2">
                <HugeBotIcon size={18} className={apertureSize > 25 ? 'text-rose-600' : 'text-indigo-600'} />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  {apertureSize > 25 ? `${currentPayload.name} (Exposed / High Risk)` : `${currentPayload.name} (Strict Keyhole Safe)`}
                </h3>
              </div>
              <span className={`text-[10px] sm:text-[11px] font-mono px-2 sm:px-2.5 py-0.5 rounded-full font-bold uppercase ${
                apertureSize > 25 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {apertureSize > 25 ? `Unrestricted Access` : `${currentPayload.allowed.length} Fields Allowed`}
              </span>
            </div>

            <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 font-mono text-[11px] sm:text-xs space-y-1.5 sm:space-y-2 shadow-2xs overflow-x-auto">
              <div className="text-slate-500 text-[10px] sm:text-[11px] pb-1.5 border-b border-slate-100 font-sans flex justify-between">
                <span>Payload Delivered to AI Agent:</span>
                <span className={apertureSize > 25 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                  {apertureSize > 25 ? 'UNRESTRICTED RAW DATA' : 'ZERO-KNOWLEDGE MASKED'}
                </span>
              </div>
              
              {/* Allowed fields */}
              {currentPayload.allowed.map((field, idx) => (
                <p key={idx} className="text-emerald-700 truncate">{field}</p>
              ))}

              {/* Leaked fields when aperture > 25 */}
              {apertureSize > 25 ? (
                <>
                  {currentPayload.leaked.map((leak, idx) => (
                    <p key={idx} className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded truncate">{leak}</p>
                  ))}
                </>
              ) : (
                <div className="pt-2 border-t border-slate-100 text-[10px] sm:text-[11px] text-slate-500 font-sans italic flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                  <span>Confidential fields redacted server-side by Keyhole before agent delivery.</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Midnight ZK Circuit Verification */}
          <div className="p-4 sm:p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HugeCpuIcon size={18} className="text-indigo-600" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">Midnight Blockchain Proof</h3>
                </div>
                <span className="text-[9px] sm:text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold">
                  Compact v0.34 ZKIR
                </span>
              </div>

              <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 font-mono text-[11px] sm:text-xs space-y-2 shadow-2xs overflow-x-auto">
                <div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase block font-sans">Smart Contract Circuit:</span>
                  <span className="text-indigo-700 font-bold break-all">{currentPayload.circuit}</span>
                </div>
                <div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase block font-sans">Zero-Knowledge Subset Check:</span>
                  <span className="text-slate-800 font-semibold">response_field_mask ⊆ allowed_field_mask</span>
                </div>
                <div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase block font-sans">Ledger Proof Result:</span>
                  <span className="text-emerald-700 font-bold flex items-center space-x-1.5 mt-0.5 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>compliance_verified = true (0 bytes leaked)</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 sm:pt-4 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="truncate pr-2">Mathematical ZK proof</span>
              <button
                onClick={() => navigate('/circuit')}
                className="text-indigo-600 hover:underline font-bold text-xs flex items-center space-x-1 flex-shrink-0"
              >
                <span>Inspect Compact Code</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Four-Step Zero-Knowledge Architecture Pipeline */}
      <div className="relative z-10 space-y-6">
        <div className="text-center max-w-2xl mx-auto px-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
            How Keyhole Works
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            End-to-End Cryptographic Security Pipeline
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 space-y-2 hover:-translate-y-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-100">
              01
            </div>
            <h3 className="text-sm font-bold text-slate-900">Agent Tool Call</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              AI agent requests data with declared fields (e.g. sender, subject) via Keyhole REST endpoint.
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 space-y-2 hover:-translate-y-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-100">
              02
            </div>
            <h3 className="text-sm font-bold text-slate-900">Pre-Fetch Guard</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Gateway intercepts out-of-scope fields with HTTP 403 Forbidden before external API access.
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 space-y-2 hover:-translate-y-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-100">
              03
            </div>
            <h3 className="text-sm font-bold text-slate-900">Midnight ZK Prover</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Compact circuit generates a zero-knowledge proof that returned fields $\subseteq$ allowed policy.
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 space-y-2 hover:-translate-y-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-100">
              04
            </div>
            <h3 className="text-sm font-bold text-slate-900">Auditable Delivery</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Filtered records delivered to LLM with on-chain proof anchor. 0 bytes confidential data leaked.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Live Attack vs Defend Sandbox */}
      <div className="relative z-10 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-card hover:shadow-card-hover space-y-6 transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 block mb-1">
              Multi-Service Threat Simulation Sandbox
            </span>
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 leading-tight">
              Real Attack Scenarios Across Enterprise SaaS
            </h2>
          </div>

          <div className="flex flex-wrap rounded-xl bg-slate-100 p-1 border border-slate-200 text-[11px] sm:text-xs font-semibold gap-1">
            {(['injection', 'm365_leak', 'slack_dm', 'db_credit_card', 'compliant'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setActiveAttackScenario(key)}
                className={`py-1.5 px-2.5 rounded-lg transition text-center ${
                  activeAttackScenario === key
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {key === 'injection' ? 'Gmail Injection' :
                 key === 'm365_leak' ? 'M365 Exfiltration' :
                 key === 'slack_dm' ? 'Slack DMs' :
                 key === 'db_credit_card' ? 'SQL DB Dump' : 'Compliant'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Simulated Adversarial Prompt:</span>
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 break-words leading-relaxed">
              "{scenarios[activeAttackScenario].prompt}"
            </div>
            <div className="pt-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-rose-600 uppercase block mb-1">Without Keyhole (Raw OAuth / Direct API):</span>
              <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200 leading-relaxed">
                {scenarios[activeAttackScenario].traditionalResult}
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-2">
                With Keyhole Zero-Knowledge Perimeter + Midnight:
              </span>
              <p className="text-xs text-emerald-900 bg-white p-3 rounded-lg border border-emerald-200 font-medium leading-relaxed">
                {scenarios[activeAttackScenario].keyholeResult}
              </p>
            </div>

            <button
              onClick={() => navigate('/studio')}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center space-x-2 hover:-translate-y-0.5 mt-4 min-h-[44px]"
            >
              <span>Test Live in Agent Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Enterprise Impact Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-5 sm:p-6 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1">
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mb-1">100%</div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-800 mb-1">Zero-Knowledge Masking</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Unauthorized email bodies, attachments, DMs, secrets, and database credentials never reach the agent or blockchain.
          </p>
        </div>

        <div className="p-5 sm:p-6 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1">
          <div className="text-2xl sm:text-3xl font-black text-indigo-600 font-mono mb-1">&lt; 12ms</div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-800 mb-1">Sub-Second ZK Proving</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ultra-fast Compact circuit compilation and ZKIR execution without slowing down autonomous agent reasoning.
          </p>
        </div>

        <div className="p-5 sm:p-6 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1">
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono mb-1">SOC2 / HIPAA / GDPR</div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-800 mb-1">Auditor-Grade Compliance</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Cryptographic on-chain proofs satisfy enterprise privacy, data residency, and audit non-disclosure standards.
          </p>
        </div>
      </div>

    </div>
  );
};
