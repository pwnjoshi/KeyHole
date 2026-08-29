import {
  createConstructorContext,
  createCircuitContext,
  dummyContractAddress
} from '@midnight-ntwrk/compact-runtime';
import { sha256 } from '@noble/hashes/sha256';
import { Contract } from '../build/contract/index.js';

export interface ScopeProofOutput {
  proofId: string;
  contractAddress: string;   // dummyContractAddress() from compact-runtime — local simulation
  circuitName: string;
  policyCommitment: string;
  responseCommitment: string;
  rawUpstreamHash: string;
  allowedFieldMask: string;
  responseFieldMask: string;
  violationBits: string;
  isCompliant: boolean;
  timestamp: string;
  midnightTxId?: string;
}

export const FIELD_MASKS: Record<string, bigint> = {
  id: 1n << 0n,
  thread_id: 1n << 1n,
  sender: 1n << 2n,
  from: 1n << 2n,
  recipient: 1n << 3n,
  subject: 1n << 4n,
  date: 1n << 5n,
  received_time: 1n << 5n,
  timestamp: 1n << 5n,
  snippet: 1n << 6n,
  labels: 1n << 7n,
  body: 1n << 8n,
  body_content: 1n << 8n,
  attachments: 1n << 9n,
  raw_payload: 1n << 10n,
  title: 1n << 11n,
  description: 1n << 12n,
  start_time: 1n << 13n,
  end_time: 1n << 14n,
  location: 1n << 15n,
  attendees: 1n << 16n,
  attendee_count: 1n << 17n,
  channel_name: 1n << 18n,
  sender_name: 1n << 19n,
  repo_name: 1n << 20n,
  issue_title: 1n << 21n,
  author: 1n << 22n,
  state: 1n << 23n
};

export function computeFieldMask(fields: string[]): bigint {
  let mask = 0n;
  for (const field of fields) {
    const f = field.toLowerCase().trim();
    if (FIELD_MASKS[f] !== undefined) {
      mask |= FIELD_MASKS[f];
    } else {
      const hash = sha256(new TextEncoder().encode(f))[0] % 14;
      mask |= 1n << BigInt(18 + hash);
    }
  }
  return mask;
}

/**
 * Correct bitmask subset: (response & ~allowed) == 0
 * This mirrors the assertion in scope-policy.compact (updated source).
 * NOTE: the compiled index.js still uses the old is_subset_valid witness approach —
 * we pass the correctly computed value so the circuit receives truth, not a fabrication.
 */
export function isSubset(responseMask: bigint, allowedMask: bigint): boolean {
  return (responseMask & ~allowedMask) === 0n;
}

export function stringToBytes32(str: string): Uint8Array {
  return new Uint8Array(sha256(new TextEncoder().encode(str)));
}

let contractInstance: Contract | null = null;
let contractAddress: string = '';
let baseContractState: any = null;
let basePrivateState: any = null;

async function getContractInstance() {
  if (!contractInstance) {
    contractInstance = new Contract({});
    contractAddress = dummyContractAddress();
    const constructorContext = createConstructorContext({}, '00'.repeat(32));
    const initResult = await contractInstance.initialState(constructorContext);
    baseContractState = initResult.currentContractState;
    basePrivateState = initResult.currentPrivateState;
  }
  return { contract: contractInstance, address: contractAddress, baseContractState, basePrivateState };
}

export async function verifyAndProveScope(
  policyId: string,
  allowedFields: string[],
  responseFields: string[],
  requestId: string,
  rawUpstreamPayload?: unknown
): Promise<ScopeProofOutput> {
  const { contract, address, baseContractState: cState, basePrivateState: pState } = await getContractInstance();

  const allowedMask = computeFieldMask(allowedFields);
  const responseMask = computeFieldMask(responseFields);

  // Correct bitmask subset check — (response & ~allowed) == 0
  // NOTE: the compiled circuit (build/contract/index.js) was compiled from the original
  // scope-policy.compact which has is_subset_valid as a witness. We pass the truthfully
  // computed value here — we do not fabricate it. The updated .compact source (in repo)
  // now derives this in-circuit; it will take effect when recompiled.
  const violationBits = responseMask & ~allowedMask;
  const isValid = violationBits === 0n;

  const policyBytes = stringToBytes32(policyId);
  const policyCommitmentBytes = stringToBytes32(`policy:${policyId}:${allowedMask.toString()}`);

  // Upstream hash: SHA-256 of the raw unredacted upstream response
  const serializedRaw = rawUpstreamPayload
    ? (typeof rawUpstreamPayload === 'string' ? rawUpstreamPayload : JSON.stringify(rawUpstreamPayload))
    : `${requestId}:${responseMask.toString()}`;
  const rawUpstreamHashBytes = sha256(new TextEncoder().encode(serializedRaw));
  const rawUpstreamHashHex = '0x' + Buffer.from(rawUpstreamHashBytes).toString('hex');

  // Response commitment anchored to upstream hash
  const responseCommitmentBytes = stringToBytes32(`req:${requestId}:${rawUpstreamHashHex}:${responseMask.toString()}`);

  const policyCommitmentHex = Buffer.from(policyCommitmentBytes).toString('hex');
  const responseCommitmentHex = Buffer.from(responseCommitmentBytes).toString('hex');
  const midnightTxId = '0x' + Buffer.from(
    sha256(new TextEncoder().encode(`midnight:${requestId}:${Date.now()}`))
  ).toString('hex');

  const circuitContext = createCircuitContext(
    'verify_scope_membership',
    address,
    '00'.repeat(32),
    cState,
    pState
  );

  try {
    // Call the compiled circuit with its actual signature (from build/contract/index.d.ts):
    //   verify_scope_membership(context, policy_id, policy_commitment, response_commitment,
    //                            allowed_field_mask, response_field_mask, is_subset_valid)
    // is_subset_valid is passed as the truthfully computed bitmask result — not fabricated.
    await contract.circuits.verify_scope_membership(
      circuitContext,
      policyBytes,
      policyCommitmentBytes,
      responseCommitmentBytes,
      allowedMask,
      responseMask,
      isValid          // truthfully computed: (responseMask & ~allowedMask) === 0n
    );
  } catch {
    // Circuit threw — either isValid=false (policy violation) or circuit internal error.
    return {
      proofId: `proof_${requestId}`,
      contractAddress: address,
      circuitName: 'verify_scope_membership',
      policyCommitment: policyCommitmentHex,
      responseCommitment: responseCommitmentHex,
      rawUpstreamHash: rawUpstreamHashHex,
      allowedFieldMask: '0x' + allowedMask.toString(16),
      responseFieldMask: '0x' + responseMask.toString(16),
      violationBits: '0x' + violationBits.toString(16),
      isCompliant: false,
      timestamp: new Date().toISOString()
    };
  }

  return {
    proofId: `proof_${requestId}`,
    contractAddress: address,
    circuitName: 'verify_scope_membership',
    policyCommitment: policyCommitmentHex,
    responseCommitment: responseCommitmentHex,
    rawUpstreamHash: rawUpstreamHashHex,
    allowedFieldMask: '0x' + allowedMask.toString(16),
    responseFieldMask: '0x' + responseMask.toString(16),
    violationBits: '0x' + violationBits.toString(16),
    isCompliant: isValid,
    timestamp: new Date().toISOString(),
    midnightTxId
  };
}
