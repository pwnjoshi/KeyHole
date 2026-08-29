-- Keyhole Zero-Knowledge Gateway - Supabase Database Schema
-- Run this SQL in your Supabase Project SQL Editor (https://supabase.com/dashboard/project/mkwhrortcfhjjeghmtww/sql)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Scope Policies Table
CREATE TABLE IF NOT EXISTS policies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  connector_id TEXT NOT NULL,
  description TEXT,
  allowed_fields JSONB NOT NULL,
  allowed_labels JSONB,
  max_records INTEGER DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'active',
  expires_at TIMESTAMPTZ,
  canary_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Audit Events Table
CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  connection_id TEXT NOT NULL,
  policy_name TEXT NOT NULL,
  connector_id TEXT NOT NULL,
  type TEXT NOT NULL, -- COMPLIANT | BLOCKED
  reason TEXT NOT NULL,
  requested_fields JSONB NOT NULL,
  allowed_fields JSONB NOT NULL,
  delivered_field_count INTEGER NOT NULL,
  record_count INTEGER NOT NULL,
  midnight_tx_id TEXT,
  proof_id TEXT,
  client_ip TEXT
);

-- Enable Row Level Security (RLS) and allow public read/write for Keyhole API Gateway
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for service gateway on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for service gateway on policies" ON policies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for service gateway on audit_events" ON audit_events FOR ALL USING (true) WITH CHECK (true);

-- Seed Initial Default Admin User
INSERT INTO users (id, email, password_hash, name, role)
VALUES ('usr_admin_01', 'admin@keyhole.sec', 'midnight2026', 'Security Admin', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, email, password_hash, name, role)
VALUES ('usr_audit_02', 'auditor@midnight.network', 'midnight2026', 'Compliance Officer', 'security_auditor')
ON CONFLICT (email) DO NOTHING;
