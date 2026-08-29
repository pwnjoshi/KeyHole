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

// Default initial policies for zero-knowledge enterprise connectors
export const INITIAL_DEFAULT_POLICIES = [
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
