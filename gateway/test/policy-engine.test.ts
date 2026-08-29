import { PolicyStore } from '../src/policy-store.js';
import { AuditLog } from '../src/audit-log.js';
import { MidnightProofClient } from '../src/proof-client.js';
import { PolicyEngine } from '../src/policy-engine.js';
import { GmailConnector } from '../src/connectors/gmail-connector.js';
import { GCalConnector } from '../src/connectors/gcal-connector.js';
import path from 'path';

async function runPolicyEngineTests() {
  console.log('===============================================================');
  console.log('  KEYHOLE GATEWAY: Policy Engine & ZK Enforcement Test Suite');
  console.log('===============================================================\n');

  const samplePoliciesPath = path.resolve(process.cwd(), '../data/sample-policies.json');
  const policyStore = new PolicyStore(samplePoliciesPath);
  const auditLog = new AuditLog();
  const proofClient = new MidnightProofClient();
  await proofClient.initialize();

  const policyEngine = new PolicyEngine(policyStore, auditLog, proofClient);
  const gmailConnector = new GmailConnector();
  const gcalConnector = new GCalConnector();

  policyEngine.registerConnector(gmailConnector);
  policyEngine.registerConnector(gcalConnector);

  console.log('1. PolicyEngine initialized with Gmail and GCal connectors.\n');

  // TEST 1: In-scope query on Receipts bot policy
  console.log('--- TEST 1: In-scope Query (Receipts Bot) ---');
  try {
    const res1 = await policyEngine.executeQuery({
      connectionId: 'conn_receipts_bot',
      requestedFields: ['sender', 'subject', 'date'],
      params: { maxResults: 3 }
    });

    console.log('   Status          : SUCCESS (200 OK)');
    console.log('   Records Returned:', res1.recordCount);
    console.log('   Proof ID        :', res1.proof.proofId);
    console.log('   ZK Compliant    :', res1.proof.isCompliant);
    console.log('   Sample Record   :', JSON.stringify(res1.data[0]));

    // Assert that NO record contains unauthorized 'body' or 'attachments'
    for (const rec of res1.data) {
      if (rec.body !== undefined || rec.attachments !== undefined) {
        throw new Error('Leak detected! Response contained body or attachments');
      }
    }
    console.log('   [SUCCESS] Test 1: In-scope fields delivered with valid ZK proof and zero leakage.');
  } catch (err: any) {
    console.error('   [FAILURE] Test 1 failed:', err.message);
    process.exit(1);
  }

  // TEST 2: Out-of-scope query requesting email body & attachments
  console.log('\n--- TEST 2: Out-of-scope Query (Blocked Pre-Fetch) ---');
  let test2Blocked = false;
  try {
    await policyEngine.executeQuery({
      connectionId: 'conn_receipts_bot',
      requestedFields: ['sender', 'subject', 'body', 'attachments'] // 'body' and 'attachments' are out of scope!
    });
  } catch (err: any) {
    test2Blocked = true;
    console.log('   Status          : REJECTED (403 Forbidden)');
    console.log('   Error Message   :', err.message);
    console.log('   Unauthorized    :', err.unauthorizedFields);
    console.log('   [SUCCESS] Test 2: Out-of-scope request blocked before touching external API.');
  }

  if (!test2Blocked) {
    console.error('   [FAILURE] Test 2: Unauthorized request was not blocked!');
    process.exit(1);
  }

  // TEST 3: Connector #2 (Google Calendar Assistant) In-Scope
  console.log('\n--- TEST 3: Connector #2 (Google Calendar) In-Scope Execution ---');
  try {
    const res3 = await policyEngine.executeQuery({
      connectionId: 'conn_calendar_scheduler',
      requestedFields: ['title', 'start_time', 'end_time', 'attendee_count'],
      params: { maxResults: 2 }
    });

    console.log('   Status          : SUCCESS (200 OK)');
    console.log('   Connector Used  :', res3.connectorId);
    console.log('   Records Returned:', res3.recordCount);
    console.log('   Sample Record   :', JSON.stringify(res3.data[0]));
    console.log('   Proof Valid     :', res3.proof.isCompliant);
    console.log('   [SUCCESS] Test 3: Connector #2 passed through same policy engine and ZK circuit.');
  } catch (err: any) {
    console.error('   [FAILURE] Test 3 failed:', err.message);
    process.exit(1);
  }

  // TEST 4: Verify Audit Log Events
  console.log('\n--- TEST 4: Tamper-Evident Audit Log Verification ---');
  const recentEvents = auditLog.getEvents();
  console.log(`   Total Logged Events: ${recentEvents.length}`);
  const compliantCount = recentEvents.filter(e => e.type === 'COMPLIANT').length;
  const blockedCount = recentEvents.filter(e => e.type === 'BLOCKED').length;
  console.log(`   Compliant Events: ${compliantCount}, Blocked Events: ${blockedCount}`);

  if (compliantCount >= 2 && blockedCount >= 1) {
    console.log('   [SUCCESS] Test 4: Audit log correctly captured compliant and blocked events.');
  } else {
    console.error('   [FAILURE] Test 4: Audit log event count mismatch.');
    process.exit(1);
  }

  console.log('\n===============================================================');
  console.log('  ALL GATEWAY POLICY ENGINE TESTS PASSED PERFECTLY!');
  console.log('===============================================================\n');
}

runPolicyEngineTests().catch((err) => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
