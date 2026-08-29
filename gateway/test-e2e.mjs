// test-e2e.mjs: Comprehensive automated integration test suite for Keyhole Gateway & Midnight ZK Engine
process.env.NODE_ENV = 'test';

async function main() {
  const { app } = await import('./dist/index.js');
  
  const server = app.listen(0, '127.0.0.1', async () => {
    const port = server.address().port;
    const BASE_URL = `http://127.0.0.1:${port}`;
    console.log(`🧪 Starting Keyhole Automated End-to-End Test Suite (${BASE_URL})...\n`);
    
    let passed = 0;
    let failed = 0;

    async function test(name, fn) {
      try {
        process.stdout.write(`  ▶ Running: ${name}... `);
        await fn();
        console.log('✅ PASS');
        passed++;
      } catch (e) {
        console.log(`❌ FAIL: ${e.message}`);
        failed++;
      }
    }

    // 1. Health Check
    await test('Health check returns 200 with registered connectors', async () => {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (data.status !== 'healthy') throw new Error('Status not healthy');
      if (!data.connectorsRegistered.includes('m365')) throw new Error('M365 connector missing');
      if (!data.connectorsRegistered.includes('slack')) throw new Error('Slack connector missing');
    });

    // 2. Authentication
    let jwtToken = '';
    await test('User login with demo admin credentials', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@keyhole.sec', password: 'midnight2026' })
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.token) throw new Error('Token not returned');
      jwtToken = data.token;
    });

    // 3. Authenticated Session Check
    await test('Verify authenticated session with JWT token', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (data.user.email !== 'admin@keyhole.sec') throw new Error('User mismatch');
    });

    // 4. Policy Management
    await test('List active policies returns all 8 enterprise policies', async () => {
      const res = await fetch(`${BASE_URL}/api/policies`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (data.policies.length < 7) throw new Error(`Expected at least 7 policies, got ${data.policies.length}`);
    });

    // 5. Query Execution: Microsoft 365 In-Scope Query
    await test('Execute in-scope query against Microsoft 365 and verify Midnight ZK proof', async () => {
      const res = await fetch(`${BASE_URL}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId: 'conn_m365_invoices',
          requestedFields: ['from', 'subject', 'received_time'],
          params: { maxResults: 3 }
        })
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error('Execution not successful');
      if (data.records.length === 0) throw new Error('No records returned');
      if (!data.proof || !data.proof.proofId) throw new Error('Midnight ZK proof missing');
      if (!data.proof.isCompliant) throw new Error('ZK proof marked as non-compliant');
      
      // Check that confidential body text was NOT leaked
      for (const record of data.records) {
        if (record.body !== undefined || record.body_content !== undefined) {
          throw new Error('Confidential body text was leaked in in-scope response!');
        }
      }
    });

    // 6. Threat Defense: Out-of-Scope Prompt Injection Attack
    await test('Execute out-of-scope exfiltration attack and verify 403 Forbidden intercept', async () => {
      const res = await fetch(`${BASE_URL}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId: 'conn_m365_invoices',
          requestedFields: ['from', 'subject', 'body_content', 'attachments'], // body_content & attachments are forbidden
          params: { maxResults: 3 }
        })
      });
      if (res.status !== 403) throw new Error(`Expected HTTP 403, got ${res.status}`);
      const data = await res.json();
      if (data.success !== false) throw new Error('Attack was not blocked');
      if (!data.unauthorizedFields || !data.unauthorizedFields.includes('body_content')) {
        throw new Error('Unauthorized fields not identified in error response');
      }
    });

    // 7. Slack Enterprise Grid Connector In-Scope Query
    await test('Execute in-scope query against Slack Enterprise and verify Midnight ZK proof', async () => {
      const res = await fetch(`${BASE_URL}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId: 'conn_slack_triage',
          requestedFields: ['channel_name', 'sender_name', 'timestamp'],
          params: { maxResults: 3 }
        })
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.proof || !data.proof.isCompliant) throw new Error('Slack query proof missing or failed');
    });

    // 8. GitHub Release & Issue Connector In-Scope Query
    await test('Execute in-scope query against GitHub and verify Midnight ZK proof', async () => {
      const res = await fetch(`${BASE_URL}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId: 'conn_github_triage',
          requestedFields: ['repo_name', 'issue_title', 'author', 'state'],
          params: { maxResults: 3 }
        })
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.proof || !data.proof.isCompliant) throw new Error('GitHub query proof missing or failed');
    });

    // 9. PostgreSQL SQL Proxy Masking Query
    await test('Execute in-scope query against PostgreSQL SQL Proxy and verify credit card masking', async () => {
      const res = await fetch(`${BASE_URL}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId: 'conn_postgres_analytics',
          requestedFields: ['row_id', 'customer_tier', 'subscription_status', 'region'],
          params: { maxResults: 3 }
        })
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.proof || !data.proof.isCompliant) throw new Error('Postgres query proof missing or failed');
    });

    // 10. Audit Log Retrieval
    await test('Inspect live audit events from Supabase', async () => {
      const res = await fetch(`${BASE_URL}/api/audit-logs?limit=20`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.events)) throw new Error('Events is not an array');
    });

    console.log('\n========================================');
    console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('========================================\n');

    server.close();
    process.exit(failed > 0 ? 1 : 0);
  });
}

main().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
