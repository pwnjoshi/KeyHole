export interface KeyholeConfig {
  gatewayUrl?: string;
  apiKey?: string;
  timeoutMs?: number;
}

export interface KeyholeProof {
  proofId: string;
  midnightTxId?: string;
  complianceVerified: boolean;
  policyCommitment: string;
  responseCommitment: string;
  proverLatencyMs: number;
  proverEngine: string;
}

export interface KeyholeQueryResult {
  success: boolean;
  records: Record<string, any>[];
  proof: KeyholeProof;
  connectionId: string;
  redactedFields: string[];
}
