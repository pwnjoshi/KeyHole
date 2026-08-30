import { PolicyStore, ScopePolicy } from './policy-store.js';
import { AuditLog } from './audit-log.js';
import { MidnightProofClient, ProofResult } from './proof-client.js';
import { DataConnector, FetchParams, RawRecord } from './connectors/connector-interface.js';

export interface AgentQueryRequest {
  connectionId: string;
  requestedFields?: string[];
  params?: FetchParams;
  clientIp?: string;
}

export interface AgentQueryResponse {
  success: boolean;
  requestId: string;
  connectionId: string;
  policyName: string;
  connectorId: string;
  recordCount: number;
  data: RawRecord[];
  records?: RawRecord[];
  isLiveSource?: boolean;
  dataSource?: 'live_oauth' | 'sandbox_dataset';
  proof: ProofResult;
  timestamp: string;
}

export class PolicyEngine {
  private connectors: Map<string, DataConnector> = new Map();

  constructor(
    private policyStore: PolicyStore,
    private auditLog: AuditLog,
    private proofClient: MidnightProofClient
  ) {}

  public registerConnector(connector: DataConnector): void {
    this.connectors.set(connector.id, connector);
  }

  public getConnector(id: string): DataConnector | undefined {
    return this.connectors.get(id);
  }

  public getAllConnectors(): DataConnector[] {
    return Array.from(this.connectors.values());
  }

  public async executeQuery(req: AgentQueryRequest): Promise<AgentQueryResponse> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const policy = this.policyStore.getPolicy(req.connectionId);

    if (!policy) {
      this.auditLog.logEvent({
        connectionId: req.connectionId,
        policyName: 'UNKNOWN',
        connectorId: 'none',
        type: 'BLOCKED',
        reason: `Connection ID '${req.connectionId}' not found in active policy store`,
        requestedFields: req.requestedFields || [],
        allowedFields: [],
        deliveredFieldCount: 0,
        recordCount: 0,
        clientIp: req.clientIp
      });
      throw new Error(`Policy not found for connection '${req.connectionId}'`);
    }

    if (policy.status !== 'active') {
      this.auditLog.logEvent({
        connectionId: policy.id,
        policyName: policy.name,
        connectorId: policy.connectorId,
        type: 'BLOCKED',
        reason: `Policy '${policy.name}' is currently ${policy.status.toUpperCase()}`,
        requestedFields: req.requestedFields || [],
        allowedFields: policy.allowedFields,
        deliveredFieldCount: 0,
        recordCount: 0,
        clientIp: req.clientIp
      });
      throw new Error(`Policy '${policy.name}' is ${policy.status}`);
    }

    // Check Ephemeral TTL Expiration
    if (policy.expiresAt && new Date(policy.expiresAt).getTime() < Date.now()) {
      this.auditLog.logEvent({
        connectionId: policy.id,
        policyName: policy.name,
        connectorId: policy.connectorId,
        type: 'BLOCKED',
        reason: `Ephemeral Policy '${policy.name}' has EXPIRED and was sealed on Midnight`,
        requestedFields: req.requestedFields || [],
        allowedFields: policy.allowedFields,
        deliveredFieldCount: 0,
        recordCount: 0,
        clientIp: req.clientIp
      });
      const err: any = new Error(`Access Denied: Ephemeral Scope Policy '${policy.name}' expired at ${policy.expiresAt}. Re-authentication required.`);
      err.statusCode = 403;
      throw err;
    }

    const requestedFields = req.requestedFields && req.requestedFields.length > 0
      ? req.requestedFields.map(f => f.toLowerCase().trim())
      : policy.allowedFields.map(f => f.toLowerCase().trim());

    // Canary Token & Honeypot Trap Detection
    const canaryMatches = requestedFields.filter(f =>
      f.includes('canary') || f.includes('honeypot') || f.includes('shadow_admin') || f.includes('master_secret') || f.includes('root_token')
    );
    if (canaryMatches.length > 0) {
      this.auditLog.logEvent({
        connectionId: policy.id,
        policyName: policy.name,
        connectorId: policy.connectorId,
        type: 'BLOCKED',
        reason: `🚨 HONEYPOT TRIGGERED: Canary token exfiltration attempt detected on fields [${canaryMatches.join(', ')}]. Session quarantined on Midnight.`,
        requestedFields,
        allowedFields: policy.allowedFields,
        deliveredFieldCount: 0,
        recordCount: 0,
        clientIp: req.clientIp
      });
      const error: any = new Error(
        `🚨 [CRITICAL SECURITY INCIDENT] Keyhole Canary Honeypot Triggered: Agent attempted to exfiltrate synthetic canary trap variables [${canaryMatches.join(', ')}]. Session quarantined on Midnight.`
      );
      error.statusCode = 423;
      error.isHoneypot = true;
      error.unauthorizedFields = canaryMatches;
      throw error;
    }

    const allowedSet = new Set(policy.allowedFields.map(f => f.toLowerCase().trim()));

    // 1. PRE-FETCH POLICY CHECK:
    // If agent explicitly asked for out-of-scope fields, BLOCK IMMEDIATELY without calling external API
    const unauthorizedRequested = requestedFields.filter(f => !allowedSet.has(f));
    if (unauthorizedRequested.length > 0) {
      this.auditLog.logEvent({
        connectionId: policy.id,
        policyName: policy.name,
        connectorId: policy.connectorId,
        type: 'BLOCKED',
        reason: `Unauthorized field request: [${unauthorizedRequested.join(', ')}] not allowed by policy`,
        requestedFields,
        allowedFields: policy.allowedFields,
        deliveredFieldCount: 0,
        recordCount: 0,
        clientIp: req.clientIp
      });
      const error: any = new Error(
        `Access Denied: Request contains fields [${unauthorizedRequested.join(', ')}] outside declared scope policy '${policy.name}'. Blocked before data access.`
      );
      error.statusCode = 403;
      error.unauthorizedFields = unauthorizedRequested;
      throw error;
    }

    const connector = this.connectors.get(policy.connectorId);
    if (!connector) {
      throw new Error(`Connector '${policy.connectorId}' is not registered with Keyhole`);
    }

    // 2. FETCH DATA FROM CONNECTOR:
    const fetchParams: FetchParams = {
      ...req.params,
      labelIds: policy.allowedLabels,
      maxResults: Math.min(req.params?.maxResults || 10, policy.maxMessageCount || 20)
    };

    const rawRecords = await connector.fetch(fetchParams);

    // 3. SERVER-SIDE FIELD MASKING / REDACTION:
    // Extract only strictly allowed fields
    const filteredRecords = rawRecords.map(record => {
      const masked: RawRecord = {};
      for (const field of policy.allowedFields) {
        if (record[field] !== undefined) {
          masked[field] = record[field];
        }
      }
      return masked;
    });

    // Compute active response field set
    const responseFieldSet = new Set<string>();
    for (const rec of filteredRecords) {
      for (const k of Object.keys(rec)) {
        responseFieldSet.add(k);
      }
    }
    const responseFields = Array.from(responseFieldSet);

    // 4. GENERATE MIDNIGHT ZERO-KNOWLEDGE SCOPE PROOF:
    // rawRecords is passed as the upstream binding witness so the proof is anchored to
    // the actual API response hash, not a gateway self-assertion about the data content.
    const proof = await this.proofClient.generateScopeProof(
      policy.id,
      policy.allowedFields,
      responseFields,
      requestId,
      rawRecords   // raw upstream payload — hashed as private witness inside generateScopeProof
    );

    // 5. APPEND-ONLY AUDIT LOG (zero confidential data logged):
    this.auditLog.logEvent({
      connectionId: policy.id,
      policyName: policy.name,
      connectorId: policy.connectorId,
      type: 'COMPLIANT',
      reason: `Verified ${filteredRecords.length} records conforming strictly to allowed fields [${policy.allowedFields.join(', ')}]`,
      requestedFields,
      allowedFields: policy.allowedFields,
      deliveredFieldCount: responseFields.length,
      recordCount: filteredRecords.length,
      proofId: proof.proofId,
      midnightTxId: proof.midnightTxId,
      clientIp: req.clientIp
    });

    const isLiveSource = connector && typeof (connector as any).isConfigured === 'function' ? (connector as any).isConfigured() : false;

    return {
      success: true,
      requestId,
      connectionId: policy.id,
      policyName: policy.name,
      connectorId: policy.connectorId,
      recordCount: filteredRecords.length,
      data: filteredRecords,
      records: filteredRecords,
      isLiveSource,
      dataSource: isLiveSource ? 'live_oauth' : 'sandbox_dataset',
      proof,
      timestamp: new Date().toISOString()
    };
  }
}
