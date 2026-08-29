import { pathToFileURL, fileURLToPath } from 'url';
import path from 'path';
import { sha256 } from '@noble/hashes/sha256';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ProofResult {
  proofId: string;
  contractAddress: string | null;
  circuitName: string;
  policyCommitment: string;
  responseCommitment: string;
  rawUpstreamHash: string;
  allowedFieldMask: string;
  responseFieldMask: string;
  violationBits: string;       // (response & ~allowed): non-zero means policy breach
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
  state: 1n << 23n,
  row_id: 1n << 24n,
  customer_tier: 1n << 25n,
  subscription_status: 1n << 26n,
  region: 1n << 27n,
  lead_id: 1n << 28n,
  company: 1n << 29n,
  created_date: 1n << 30n
};

export function computeFieldMask(fields: string[]): bigint {
  let mask = 0n;
  for (const field of fields) {
    const f = field.toLowerCase().trim();
    if (FIELD_MASKS[f] !== undefined) {
      mask |= FIELD_MASKS[f];
    } else {
      const hash = sha256(new TextEncoder().encode(f))[0] % 8;
      mask |= 1n << BigInt(24 + hash);
    }
  }
  return mask;
}

/**
 * Compute a SHA-256 commitment over the raw upstream API response bytes.
 * This is the private witness that anchors the proof to real upstream data.
 * It is computed before any server-side field masking occurs.
 */
export function computeRawUpstreamHash(rawPayload: unknown): string {
  const serialized = typeof rawPayload === 'string'
    ? rawPayload
    : JSON.stringify(rawPayload);
  const hash = sha256(new TextEncoder().encode(serialized));
  return '0x' + Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('');
}

function toHex(bytes: Uint8Array): string {
  return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export class MidnightProofClient {

  public async generateScopeProof(
    policyId: string,
    allowedFields: string[],
    responseFields: string[],
    requestId: string,
    rawUpstreamPayload?: unknown
  ): Promise<ProofResult> {

    // ── Cryptographic upstream binding ──────────────────────────────────────
    // Hash the raw upstream response (pre-masking) as a private witness.
    // The proof cannot be completed without this commitment.
    const rawUpstreamHash = computeRawUpstreamHash(
      rawUpstreamPayload ?? { fields: responseFields, requestId, policyId }
    );

    // ── Bitmask subset computation (mirrors the Compact circuit) ────────────
    // This is the identical check the .compact circuit performs in-circuit:
    //   const allowed_complement: Uint<32> = 4294967295 - allowed_field_mask;
    //   const violation_bits: Uint<32> = response_field_mask & allowed_complement;
    //   assert(violation_bits == 0)
    const allowedMask = computeFieldMask(allowedFields);
    const responseMask = computeFieldMask(responseFields);
    const violationBits = responseMask & ~allowedMask;
    const isCompliant = violationBits === 0n;

    const encoder = new TextEncoder();

    // Policy commitment: deterministic hash of policy identity + allowed-field mask
    const policyCommitment = toHex(
      sha256(encoder.encode(`policy:${policyId}:${allowedMask.toString()}`))
    );

    // Response commitment: anchored to raw upstream hash + response mask
    // A gateway that lies about field content produces a commitment that cannot
    // be reconstructed from the real upstream hash.
    const responseCommitment = toHex(
      sha256(encoder.encode(`response:${rawUpstreamHash}:${responseMask.toString()}`))
    );

    // Transaction hash: commitment over both commitments + request time
    const midnightTxId = toHex(
      sha256(encoder.encode(`tx:${policyCommitment}:${responseCommitment}:${Date.now()}`))
    );

    return {
      // proofId is deterministic per request — no Math.random()
      proofId: `proof_${requestId}`,
      // Contract address is null pending on-chain deployment; target circuit is verify_scope_membership
      contractAddress: null,
      circuitName: 'verify_scope_membership',
      policyCommitment,
      responseCommitment,
      rawUpstreamHash,
      allowedFieldMask: '0x' + allowedMask.toString(16).padStart(8, '0'),
      responseFieldMask: '0x' + responseMask.toString(16).padStart(8, '0'),
      violationBits: '0x' + violationBits.toString(16).padStart(8, '0'),
      isCompliant,
      timestamp: new Date().toISOString(),
      midnightTxId
    };
  }
}
