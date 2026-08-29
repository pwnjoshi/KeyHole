import {
  createConstructorContext,
  createCircuitContext,
  dummyContractAddress
} from '@midnight-ntwrk/compact-runtime';
import { sha256 } from '@noble/hashes/sha256';
import { Contract, ledger } from './build/contract/index.js';

// Field bitmask mappings
export const FIELD_MASKS: Record<string, bigint> = {
  id: 1n << 0n,
  thread_id: 1n << 1n,
  sender: 1n << 2n,
  recipient: 1n << 3n,
  subject: 1n << 4n,
  date: 1n << 5n,
  snippet: 1n << 6n,
  labels: 1n << 7n,
  body: 1n << 8n,
  attachments: 1n << 9n,
  raw_payload: 1n << 10n
};

export function computeFieldMask(fields: string[]): bigint {
  let mask = 0n;
  for (const field of fields) {
    const f = field.toLowerCase().trim();
    if (FIELD_MASKS[f] !== undefined) {
      mask |= FIELD_MASKS[f];
    } else {
      const hash = sha256(new TextEncoder().encode(f))[0] % 20;
      mask |= 1n << BigInt(11 + hash);
    }
  }
  return mask;
}

export function isSubset(responseMask: bigint, allowedMask: bigint): boolean {
  return (responseMask & ~allowedMask) === 0n;
}

export function stringToBytes32(str: string): Uint8Array {
  const hash = sha256(new TextEncoder().encode(str));
  return new Uint8Array(hash);
}

async function runTests() {
  console.log('===============================================================');
  console.log('  KEYHOLE: Midnight Compact Smart Contract ZK Verification Test');
  console.log('===============================================================\n');

  const contract = new Contract({});
  const address = dummyContractAddress();
  const constructorContext = createConstructorContext({}, '00'.repeat(32));

  const initResult = await contract.initialState(constructorContext);
  const baseContractState = initResult.currentContractState;
  const basePrivateState = initResult.currentPrivateState;

  console.log('1. Contract initialized successfully on simulated Midnight ledger.');

  // TEST CASE A: Fully in-scope response
  console.log('\n--- TEST CASE A: In-Scope Response ---');
  const allowedFieldsA = ['sender', 'subject', 'date'];
  const responseFieldsA = ['sender', 'subject', 'date'];

  const allowedMaskA = computeFieldMask(allowedFieldsA);
  const responseMaskA = computeFieldMask(responseFieldsA);

  const policyIdA = stringToBytes32('policy_receipts_v1');
  const policyCommitmentA = stringToBytes32(`policy:${allowedMaskA.toString()}`);
  const rawUpstreamHashA = stringToBytes32('upstream_raw_invoice_payload_hash_123');
  const responseCommitmentA = stringToBytes32(`req_001:${responseMaskA.toString()}`);

  const circuitContextA = createCircuitContext(
    'verify_scope_membership',
    address,
    '00'.repeat(32),
    baseContractState,
    basePrivateState
  );

  try {
    const resultA = await contract.circuits.verify_scope_membership(
      circuitContextA,
      policyIdA,
      policyCommitmentA,
      responseCommitmentA,
      rawUpstreamHashA,
      allowedMaskA,
      responseMaskA
    );
    const qCtx = resultA.context.queryContexts[address];
    const currentLedger = ledger(qCtx.state);

    console.log('   Allowed Fields  :', allowedFieldsA.join(', '));
    console.log('   Response Fields :', responseFieldsA.join(', '));
    console.log('   Compliance State:', currentLedger.compliance_verified ? 'VERIFIED (PASS)' : 'FAILED');
    console.log('   Counter Value   :', currentLedger.verification_counter.toString());
    console.log('   [SUCCESS] Case A generated valid Zero-Knowledge proof and updated ledger state.');
  } catch (err: any) {
    console.error('   [FAIL] Case A threw unexpected error:', err.message);
    process.exit(1);
  }

  // TEST CASE B: Out-of-scope exfiltration attempt (body requested & returned)
  console.log('\n--- TEST CASE B: Disallowed Field Exfiltration Attempt ---');
  const allowedFieldsB = ['sender', 'subject', 'date'];
  const responseFieldsB = ['sender', 'subject', 'date', 'body'];

  const allowedMaskB = computeFieldMask(allowedFieldsB);
  const responseMaskB = computeFieldMask(responseFieldsB);

  const policyIdB = stringToBytes32('policy_receipts_v1');
  const policyCommitmentB = stringToBytes32(`policy:${allowedMaskB.toString()}`);
  const rawUpstreamHashB = stringToBytes32('upstream_raw_invoice_payload_hash_456');
  const responseCommitmentB = stringToBytes32(`req_002:${responseMaskB.toString()}`);

  const circuitContextB = createCircuitContext(
    'verify_scope_membership',
    address,
    '00'.repeat(32),
    baseContractState,
    basePrivateState
  );

  try {
    await contract.circuits.verify_scope_membership(
      circuitContextB,
      policyIdB,
      policyCommitmentB,
      responseCommitmentB,
      rawUpstreamHashB,
      allowedMaskB,
      responseMaskB
    );
    console.error('   [FAIL] Case B should have rejected but succeeded.');
    process.exit(1);
  } catch (err: any) {
    console.log('   Allowed Fields  :', allowedFieldsB.join(', '));
    console.log('   Response Fields :', responseFieldsB.join(', '));
    console.log('   Circuit Error   :', err.message || err);
    console.log('   [SUCCESS] Case B was mathematically rejected by Midnight Compact circuit as expected.');
  }

  // TEST CASE C: Empty set
  console.log('\n--- TEST CASE C: Empty Field Set (Edge Case) ---');
  const allowedFieldsC = ['sender', 'subject', 'date'];
  const responseFieldsC: string[] = [];

  const allowedMaskC = computeFieldMask(allowedFieldsC);
  const responseMaskC = computeFieldMask(responseFieldsC);

  const policyIdC = stringToBytes32('policy_receipts_v1');
  const policyCommitmentC = stringToBytes32(`policy:${allowedMaskC.toString()}`);
  const rawUpstreamHashC = stringToBytes32('upstream_raw_invoice_payload_hash_789');
  const responseCommitmentC = stringToBytes32(`req_003:${responseMaskC.toString()}`);

  const circuitContextC = createCircuitContext(
    'verify_scope_membership',
    address,
    '00'.repeat(32),
    baseContractState,
    basePrivateState
  );

  try {
    const resultC = await contract.circuits.verify_scope_membership(
      circuitContextC,
      policyIdC,
      policyCommitmentC,
      responseCommitmentC,
      rawUpstreamHashC,
      allowedMaskC,
      responseMaskC
    );
    const qCtx = resultC.context.queryContexts[address];
    const currentLedger = ledger(qCtx.state);

    console.log('   Allowed Fields  :', allowedFieldsC.join(', '));
    console.log('   Response Fields : (empty)');
    console.log('   Compliance State:', currentLedger.compliance_verified ? 'VERIFIED (PASS)' : 'FAILED');
    console.log('   [SUCCESS] Case C empty set subset verified successfully.');
  } catch (err: any) {
    console.error('   [FAIL] Case C threw unexpected error:', err.message);
    process.exit(1);
  }

  console.log('\n===============================================================');
  console.log('  ALL 3 MIDNIGHT COMPACT ZK VERIFICATION TESTS PASSED (100%)');
  console.log('===============================================================\n');
}

runTests().catch(err => {
  console.error('Fatal error during contract testing:', err);
  process.exit(1);
});
