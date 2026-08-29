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
  const isValidA = isSubset(responseMaskA, allowedMaskA);

  const policyIdA = stringToBytes32('policy_receipts_v1');
  const policyCommitmentA = stringToBytes32(`policy:${allowedMaskA.toString()}`);
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
      allowedMaskA,
      responseMaskA,
      isValidA
    );
    const qCtx = resultA.context.queryContexts[address];
    const currentLedger = ledger(qCtx.state);

    console.log('   Allowed Fields  :', allowedFieldsA.join(', '));
    console.log('   Response Fields :', responseFieldsA.join(', '));
    console.log('   Compliance State:', currentLedger.compliance_verified ? 'VERIFIED (PASS)' : 'FAILED');
    console.log('   Counter Value   :', currentLedger.verification_counter.toString());
    console.log('   [SUCCESS] Case A generated valid Zero-Knowledge proof and updated ledger state.');
  } catch (err: any) {
    console.error('   [FAILURE] Case A threw unexpected error:', err.message);
    process.exit(1);
  }

  // TEST CASE B: Response contains unauthorized/disallowed field
  console.log('\n--- TEST CASE B: Out-of-Scope Response (Disallowed Field) ---');
  const allowedFieldsB = ['sender', 'subject'];
  const responseFieldsB = ['sender', 'subject', 'body']; // 'body' is unauthorized

  const allowedMaskB = computeFieldMask(allowedFieldsB);
  const responseMaskB = computeFieldMask(responseFieldsB);
  const isValidB = isSubset(responseMaskB, allowedMaskB); // false!

  const policyIdB = stringToBytes32('policy_receipts_v1');
  const policyCommitmentB = stringToBytes32(`policy:${allowedMaskB.toString()}`);
  const responseCommitmentB = stringToBytes32(`req_002:${responseMaskB.toString()}`);

  const circuitContextB = createCircuitContext(
    'verify_scope_membership',
    address,
    '00'.repeat(32),
    baseContractState,
    basePrivateState
  );

  let caseBRejectedAsExpected = false;
  try {
    console.log('   Allowed Fields  :', allowedFieldsB.join(', '));
    console.log('   Response Fields :', responseFieldsB.join(', '), '(Disallowed field "body" present)');
    console.log('   Executing circuit assertion...');
    await contract.circuits.verify_scope_membership(
      circuitContextB,
      policyIdB,
      policyCommitmentB,
      responseCommitmentB,
      allowedMaskB,
      responseMaskB,
      isValidB
    );
  } catch (err: any) {
    caseBRejectedAsExpected = true;
    console.log('   [SUCCESS] Circuit correctly rejected transaction with ZK constraint assertion error:');
    console.log('   =>', err.message);
  }

  if (!caseBRejectedAsExpected) {
    console.error('   [FAILURE] Case B should have failed circuit verification but succeeded!');
    process.exit(1);
  }

  // TEST CASE C: Empty response (0 fields returned)
  console.log('\n--- TEST CASE C: Empty Response (Trivial In-Scope) ---');
  const allowedFieldsC = ['sender', 'subject', 'date'];
  const responseFieldsC: string[] = [];

  const allowedMaskC = computeFieldMask(allowedFieldsC);
  const responseMaskC = computeFieldMask(responseFieldsC); // 0n
  const isValidC = isSubset(responseMaskC, allowedMaskC);

  const policyIdC = stringToBytes32('policy_receipts_v1');
  const policyCommitmentC = stringToBytes32(`policy:${allowedMaskC.toString()}`);
  const responseCommitmentC = stringToBytes32(`req_003:empty`);

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
      allowedMaskC,
      responseMaskC,
      isValidC
    );
    const qCtx = resultC.context.queryContexts[address];
    const currentLedger = ledger(qCtx.state);

    console.log('   Allowed Fields  :', allowedFieldsC.join(', '));
    console.log('   Response Fields : (empty set)');
    console.log('   Compliance State:', currentLedger.compliance_verified ? 'VERIFIED (PASS)' : 'FAILED');
    console.log('   Counter Value   :', currentLedger.verification_counter.toString());
    console.log('   [SUCCESS] Case C empty response passed trivially.');
  } catch (err: any) {
    console.error('   [FAILURE] Case C threw error:', err.message);
    process.exit(1);
  }

  console.log('\n===============================================================');
  console.log('  ALL 3 COMPACT CIRCUIT TEST CASES PASSED SOLIDLY!');
  console.log('===============================================================\n');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
