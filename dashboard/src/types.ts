export interface ScopePolicyConstraints {
  maxRecordsPerQuery?: number;
  maxAgeDays?: number;
  requireZeroKnowledgeProof?: boolean;
}

export interface ScopePolicy {
  id: string;
  name: string;
  connectorId: string;
  description: string;
  allowedFields: string[];
  allowedLabels?: string[];
  maxMessageCount?: number;
  createdAt?: string;
  status: 'active' | 'paused' | 'revoked';
  constraints?: ScopePolicyConstraints;
}

export type AuditEventType = 'COMPLIANT' | 'BLOCKED' | 'INIT';

export interface ProofDetails {
  midnightTxId: string;
  contractAddress?: string | null;
  circuitId: string;
  policyCommitment: string;
  responseCommitment: string;
  zkProofVerified: boolean;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  connectionId: string;
  policyName: string;
  connectorId: string;
  type: AuditEventType;
  reason: string;
  requestedFields: string[];
  allowedFields: string[];
  deliveredFieldCount: number;
  recordCount: number;
  proofId?: string;
  midnightTxId?: string;
  clientIp?: string;
  proofDetails?: ProofDetails;
}

export interface ConnectorInfo {
  id: string;
  displayName: string;
  availableFields: string[];
  isConfigured: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'security_auditor' | 'developer';
  name: string;
}
