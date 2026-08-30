import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mkwhrortcfhjjeghmtww.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_EvBHmkoczlaHCqcuXgCfkw_qtTviovL';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

console.log(`[Supabase Database] Connected -> Project: ${supabaseUrl}`);

// Expanded default initial policies for zero-knowledge enterprise connectors across 9 services
export const INITIAL_DEFAULT_POLICIES = [
  // --- 1. GOOGLE GMAIL POLICIES ---
  {
    id: 'conn_receipts_bot',
    name: 'Expense Report Agent (Receipts Only)',
    connector_id: 'gmail',
    description: 'Restricted to financial invoice metadata. Strictly forbidden from reading message body, attachments, or non-receipt threads.',
    allowed_fields: ['sender', 'subject', 'date'],
    allowed_labels: ['INBOX', 'RECEIPTS', 'PURCHASES'],
    max_records: 10,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },
  {
    id: 'conn_recruiting_screener',
    name: 'HR Recruiting & Candidate Screener',
    connector_id: 'gmail',
    description: 'Scans inbound candidate application emails for sender metadata and dates while cryptographically masking applicant resumes, PII, and salary requirements.',
    allowed_fields: ['sender', 'subject', 'date'],
    allowed_labels: ['INBOX', 'CAREERS', 'RECRUITING'],
    max_records: 10,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },
  {
    id: 'conn_phishing_scanner',
    name: 'Security Ops Phishing & Threat Scanner',
    connector_id: 'gmail',
    description: 'Analyzes suspicious email sender headers and delivery dates for threat hunting. Confidential executive message bodies and passwords remain masked.',
    allowed_fields: ['sender', 'subject', 'date'],
    allowed_labels: ['INBOX', 'SPAM', 'SECURITY'],
    max_records: 10,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },
  {
    id: 'conn_newsletter_digest',
    name: 'Market Intelligence & Newsletter Digest',
    connector_id: 'gmail',
    description: 'Aggregates industry newsletter subjects and dates while keeping private employee correspondence sealed.',
    allowed_fields: ['sender', 'subject', 'date'],
    allowed_labels: ['INBOX', 'NEWSLETTERS'],
    max_records: 10,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },
  {
    id: 'conn_gmail_support_router',
    name: 'Customer Support Ticket Dispatcher',
    connector_id: 'gmail',
    description: 'Triages inbound customer support requests by sender and subject line. Customer passwords, credit card numbers, and attachments are redacted.',
    allowed_fields: ['sender', 'subject', 'date'],
    allowed_labels: ['INBOX', 'SUPPORT', 'URGENT'],
    max_records: 15,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },
  {
    id: 'conn_gmail_legal_hold',
    name: 'Legal Hold & Compliance Discovery Monitor',
    connector_id: 'gmail',
    description: 'Maintains zero-knowledge eDiscovery indexing for legal holds without exposing privileged attorney-client message bodies to third-party AI models.',
    allowed_fields: ['sender', 'subject', 'date'],
    allowed_labels: ['INBOX', 'LEGAL', 'COMPLIANCE'],
    max_records: 20,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },

  // --- 2. GOOGLE CALENDAR POLICIES ---
  {
    id: 'conn_calendar_scheduler',
    name: 'Executive Scheduling Assistant',
    connector_id: 'gcal',
    description: 'Allowed to inspect event titles and times for conflict checking. Description text is redacted server-side.',
    allowed_fields: ['title', 'start_time', 'end_time', 'attendee_count'],
    allowed_labels: [],
    max_records: 15,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },
  {
    id: 'conn_calendar_interview_coordinator',
    name: 'Interview Panel & Room Coordinator',
    connector_id: 'gcal',
    description: 'Coordinates technical interview slots across engineering interviewers while shielding candidate evaluation notes and feedback.',
    allowed_fields: ['title', 'start_time', 'end_time', 'attendee_count'],
    allowed_labels: [],
    max_records: 12,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },
  {
    id: 'conn_calendar_room_manager',
    name: 'Facility & Conference Room Optimizer',
    connector_id: 'gcal',
    description: 'Monitors corporate board room utilization and occupancy time blocks without exposing confidential executive meeting agendas.',
    allowed_fields: ['title', 'start_time', 'end_time'],
    allowed_labels: [],
    max_records: 20,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },

  // --- 3. MICROSOFT 365 POLICIES ---
  {
    id: 'conn_m365_invoices',
    name: 'Microsoft 365 Enterprise Auditor',
    connector_id: 'm365',
    description: 'Inspects enterprise Azure & cloud vendor invoices. Email body text & attachments are cryptographically excluded.',
    allowed_fields: ['from', 'subject', 'received_time'],
    allowed_labels: [],
    max_records: 10,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },
  {
    id: 'conn_m365_teams_notifier',
    name: 'Teams DevOps Operational Notifier',
    connector_id: 'm365',
    description: 'Dispatches operational status alerts to Teams channels. Private executive direct chats and confidential SharePoint links are filtered.',
    allowed_fields: ['from', 'subject', 'received_time'],
    allowed_labels: [],
    max_records: 15,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },
  {
    id: 'conn_m365_compliance_bot',
    name: 'Microsoft Graph Data Governance Bot',
    connector_id: 'm365',
    description: 'Verifies email retention timestamps and sender domains for SOC 2 data governance without accessing unredacted message bodies.',
    allowed_fields: ['from', 'subject', 'received_time'],
    allowed_labels: [],
    max_records: 20,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },

  // --- 4. SLACK ENTERPRISE POLICIES ---
  {
    id: 'conn_slack_triage',
    name: 'Slack Incident Triage Bot',
    connector_id: 'slack',
    description: 'Monitors public channel metadata and timestamps. Executive DMs and private channel threads are masked.',
    allowed_fields: ['channel_name', 'sender_name', 'timestamp'],
    allowed_labels: [],
    max_records: 15,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },
  {
    id: 'conn_slack_support_escalator',
    name: 'Slack Customer Escalation Monitor',
    connector_id: 'slack',
    description: 'Identifies urgent customer issue mentions across designated triage channels while redacting sensitive API keys or passwords shared in chat.',
    allowed_fields: ['channel_name', 'sender_name', 'timestamp'],
    allowed_labels: [],
    max_records: 15,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },
  {
    id: 'conn_slack_announcement_bot',
    name: 'All-Hands Announcement Broadcaster',
    connector_id: 'slack',
    description: 'Delivers corporate-wide operational announcements and sprint summaries with strict zero-knowledge perimeter containment.',
    allowed_fields: ['channel_name', 'sender_name', 'timestamp'],
    allowed_labels: [],
    max_records: 20,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },

  // --- 5. GITHUB & GITLAB POLICIES ---
  {
    id: 'conn_github_triage',
    name: 'GitHub Release & Issue Agent',
    connector_id: 'github',
    description: 'Triage public issue titles and status flags. Source code blobs, private SSH keys, and secrets are redacted.',
    allowed_fields: ['repo_name', 'issue_title', 'author', 'state'],
    allowed_labels: [],
    max_records: 20,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },
  {
    id: 'conn_github_security_alert',
    name: 'Dependabot & CVE Triage Screener',
    connector_id: 'github',
    description: 'Scans vulnerability advisory titles and package names. Proprietary application source files and production infrastructure configs are shielded.',
    allowed_fields: ['repo_name', 'issue_title', 'author', 'state'],
    allowed_labels: [],
    max_records: 15,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },
  {
    id: 'conn_github_pr_auditor',
    name: 'Pull Request Review & CI Auditor',
    connector_id: 'github',
    description: 'Inspects PR author, title, and mergeability state while ensuring internal API secrets and private commit signatures are never exfiltrated.',
    allowed_fields: ['repo_name', 'issue_title', 'author', 'state'],
    allowed_labels: [],
    max_records: 25,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },

  // --- 6. POSTGRESQL SQL PROXY POLICIES ---
  {
    id: 'conn_postgres_analytics',
    name: 'PostgreSQL Sanitized Read-Only Bot',
    connector_id: 'postgres',
    description: 'Queries customer subscription metrics. Credit cards, salaries, passwords, and PII are masked server-side.',
    allowed_fields: ['row_id', 'customer_tier', 'subscription_status', 'region'],
    allowed_labels: [],
    max_records: 25,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },
  {
    id: 'conn_postgres_inventory',
    name: 'PostgreSQL Supply Chain Inventory Bot',
    connector_id: 'postgres',
    description: 'Queries warehouse stock tiers and shipment region status. Sensitive wholesale supplier pricing and billing accounts are redacted.',
    allowed_fields: ['row_id', 'customer_tier', 'subscription_status', 'region'],
    allowed_labels: [],
    max_records: 20,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },
  {
    id: 'conn_postgres_audit_inspector',
    name: 'Database Compliance Audit Inspector',
    connector_id: 'postgres',
    description: 'Inspects database table schema health and row synchronization status for SOC 2 audits with zero raw record leakage.',
    allowed_fields: ['row_id', 'subscription_status', 'region'],
    allowed_labels: [],
    max_records: 30,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },

  // --- 7. SALESFORCE CRM POLICIES ---
  {
    id: 'conn_salesforce_crm',
    name: 'Salesforce Enterprise Lead Intelligence',
    connector_id: 'salesforce',
    description: 'Allows revenue operations agents to check lead statuses while masking financial deal terms and SSN/Tax IDs.',
    allowed_fields: ['lead_id', 'company', 'status', 'created_date'],
    allowed_labels: [],
    max_records: 20,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },
  {
    id: 'conn_salesforce_churn_predictor',
    name: 'Customer Success Renewal & Health Screener',
    connector_id: 'salesforce',
    description: 'Calculates renewal timeframes and company tiers while redacting executive contact details and private contract clauses.',
    allowed_fields: ['lead_id', 'company', 'status', 'created_date'],
    allowed_labels: [],
    max_records: 15,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },
  {
    id: 'conn_salesforce_partner_portal',
    name: 'Channel Partner Opportunity Router',
    connector_id: 'salesforce',
    description: 'Routes partner leads and tracks stage progression with strict zero-knowledge redaction of internal pricing models.',
    allowed_fields: ['lead_id', 'company', 'status', 'created_date'],
    allowed_labels: [],
    max_records: 20,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },

  // --- 8. NOTION & WIKIS POLICIES ---
  {
    id: 'conn_notion_docs',
    name: 'Notion & Confluence Internal Knowledge',
    connector_id: 'notion',
    description: 'Enterprise internal documentation search. Masks confidential HR & strategy databases.',
    allowed_fields: ['page_title', 'page_id', 'last_edited_by'],
    allowed_labels: [],
    max_records: 20,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },
  {
    id: 'conn_notion_sprint_tracker',
    name: 'Engineering Roadmap & Sprint Tracker',
    connector_id: 'notion',
    description: 'Monitors feature delivery deadlines and ticket owners without disclosing proprietary unreleased feature designs.',
    allowed_fields: ['page_title', 'page_id', 'last_edited_by'],
    allowed_labels: [],
    max_records: 20,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },
  {
    id: 'conn_notion_compliance_wiki',
    name: 'ISO 27001 Security SOP Explorer',
    connector_id: 'notion',
    description: 'Navigates published compliance policies and operational runbooks with mathematical zero-knowledge proof verification.',
    allowed_fields: ['page_title', 'page_id', 'last_edited_by'],
    allowed_labels: [],
    max_records: 15,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },

  // --- 9. CUSTOM REST / OPENAPI WEBHOOK POLICIES ---
  {
    id: 'conn_custom_telemetry',
    name: 'Microservice Telemetry & Health Monitor',
    connector_id: 'custom_rest',
    description: 'Monitors microservice endpoint status codes and timestamps. Session authorization tokens and internal IPs are masked.',
    allowed_fields: ['endpoint', 'status_code', 'timestamp', 'service_name'],
    allowed_labels: [],
    max_records: 25,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },
  {
    id: 'conn_custom_billing_webhook',
    name: 'Payment & Billing Webhook Guard',
    connector_id: 'custom_rest',
    description: 'Ingests billing webhook transaction codes and timestamps while redacting customer credit card and bank account numbers.',
    allowed_fields: ['endpoint', 'status_code', 'timestamp', 'service_name'],
    allowed_labels: [],
    max_records: 20,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  },
  {
    id: 'conn_custom_erp_bridge',
    name: 'ERP Order Fulfillment Sync Bot',
    connector_id: 'custom_rest',
    description: 'Syncs enterprise order completion states across microservices with cryptographic least-privilege guarantees.',
    allowed_fields: ['endpoint', 'status_code', 'timestamp', 'service_name'],
    allowed_labels: [],
    max_records: 20,
    status: 'active',
    expires_at: null,
    canary_enabled: true
  }
];

export const INITIAL_DEFAULT_USERS = [
  {
    id: 'usr_admin_default',
    email: 'admin@keyhole.sec',
    password_hash: 'f360c7a8b375b40e34b9d0b67ff9b6574f88fc00bd1b504f215d2a6a1d8a1c97', // SHA-256 for 'midnight2026'
    name: 'Security Officer',
    role: 'admin'
  },
  {
    id: 'usr_auditor_default',
    email: 'auditor@midnight.network',
    password_hash: 'f360c7a8b375b40e34b9d0b67ff9b6574f88fc00bd1b504f215d2a6a1d8a1c97',
    name: 'Compliance Officer',
    role: 'security_auditor'
  }
];
