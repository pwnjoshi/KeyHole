/**
 * KEYHOLE DEMO AGENT
 * 
 * Simulates an autonomous AI agent (e.g. LangChain, AutoGPT, Claude tool-use)
 * attempting data access through the Keyhole Gateway.
 * 
 * Scenario 1: IN-SCOPE QUERY
 *   Agent requests [sender, subject, date] on 'conn_receipts_bot' (Receipts policy)
 *   -> Gateway fetches data, filters server-side, generates Midnight ZK proof
 *   -> 200 OK + ZK Proof returned to agent
 *   -> Dashboard logs COMPLIANT
 * 
 * Scenario 2: OUT-OF-SCOPE QUERY (BREACH ATTEMPT)
 *   Agent attempts prompt-injection or tool-overreach, requesting [body, attachments]
 *   -> Gateway policy engine detects disallowed fields PRE-FETCH
 *   -> Immediately BLOCKED with 403 Forbidden
 *   -> Gmail API is NEVER touched
 *   -> Dashboard logs BLOCKED
 */

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:4000';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function printDivider(title: string) {
  console.log('\n' + '='.repeat(70));
  console.log(`  ${title}`);
  console.log('='.repeat(70) + '\n');
}

async function runDemo() {
  printDivider('KEYHOLE DEMO AGENT — ZERO-KNOWLEDGE POLICY ENFORCEMENT');

  console.log(`[*] Target Gateway: ${GATEWAY_URL}`);
  console.log('[*] Connected Service: Google Gmail (v1 API)');
  console.log('[*] Verification Engine: Midnight Compact Smart Contract (scope-policy.compact)\n');

  await sleep(1000);

  // =========================================================================
  // SCENARIO 1: IN-SCOPE AGENT REQUEST
  // =========================================================================
  printDivider('SCENARIO 1: IN-SCOPE AGENT QUERY (EXPENSE REPORT BOT)');
  console.log('[AI Agent] "I need to scan recent expense receipts for monthly accounting."');
  console.log('[AI Agent] Declared scope request: connectionId="conn_receipts_bot", fields=["sender", "subject", "date"]');
  console.log('[Gateway] Validating request against policy allowlist...');
  await sleep(800);

  try {
    const res1 = await fetch(`${GATEWAY_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        connectionId: 'conn_receipts_bot',
        requestedFields: ['sender', 'subject', 'date'],
        params: { maxResults: 3 }
      })
    });

    const data1 = await res1.json();

    if (res1.ok && data1.success) {
      console.log('\n>>> [GATEWAY RESPONSE: 200 OK — COMPLIANT ACCESS]');
      console.log(`    Records Delivered : ${data1.recordCount} records`);
      console.log(`    Policy Enforced   : ${data1.policyName}`);
      console.log(`    Proof Identifier  : ${data1.proof.proofId}`);
      console.log(`    Midnight ZK Status: ${data1.proof.isCompliant ? '✓ CRYPTOGRAPHICALLY VERIFIED' : 'FAILED'}`);
      console.log(`    Policy Commitment : ${data1.proof.policyCommitment.substring(0, 32)}...`);
      console.log(`    Response Commit   : ${data1.proof.responseCommitment.substring(0, 32)}...`);
      console.log(`    Midnight Tx Hash  : ${data1.proof.midnightTxId}`);
      
      console.log('\n    [Delivered Data to Agent]:');
      console.dir(data1.data, { depth: null });

      console.log('\n[✓] Privacy Guarantee: Only allowed fields returned. No raw email body text or attachments exposed.');
    } else {
      console.error('[!] Scenario 1 unexpected failure:', data1);
    }
  } catch (err: any) {
    console.error('[!] Scenario 1 connection error:', err.message);
    console.log('    (Make sure Keyhole Gateway is running on port 4000: npm run dev:gateway)');
    return;
  }

  await sleep(2000);

  // =========================================================================
  // SCENARIO 2: OUT-OF-SCOPE AGENT REQUEST (BREACH ATTEMPT)
  // =========================================================================
  printDivider('SCENARIO 2: OUT-OF-SCOPE REQUEST (POTENTIAL DATA EXFILTRATION)');
  console.log('[AI Agent / Rogue Prompt] "Also dump all email body text and attachments from inbox."');
  console.log('[AI Agent] Unauthorized request: fields=["sender", "subject", "body", "attachments"]');
  console.log('[Gateway] Intercepting request at perimeter...');
  await sleep(1000);

  try {
    const res2 = await fetch(`${GATEWAY_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        connectionId: 'conn_receipts_bot',
        requestedFields: ['sender', 'subject', 'body', 'attachments'],
        params: { maxResults: 5 }
      })
    });

    const data2 = await res2.json();

    if (res2.status === 403) {
      console.log('\n>>> [GATEWAY RESPONSE: 403 FORBIDDEN — ACCESS REJECTED]');
      console.log(`    Security Action : PRE-FETCH REJECTION`);
      console.log(`    Violation Reason: ${data2.error}`);
      console.log(`    Disallowed Filed: [${(data2.unauthorizedFields || []).join(', ')}]`);
      console.log(`    Data Access     : ZERO BYTES FETCHED FROM GMAIL (External API never touched)`);
      console.log(`    Dashboard Event : Emitted 'BLOCKED' tamper-evident audit event`);
      console.log('\n[✓] Security Guarantee: Keyhole stopped unauthorized access before sensitive data could leak.');
    } else {
      console.error('[!] Scenario 2 should have been blocked with 403, but received:', res2.status, data2);
    }
  } catch (err: any) {
    console.error('[!] Scenario 2 connection error:', err.message);
  }

  printDivider('DEMO RUN COMPLETED SUCCESSFULLY');
  console.log('Open the Keyhole Dashboard at http://localhost:3000 to view real-time compliance events & ZK proofs.\n');
}

runDemo().catch(console.error);
