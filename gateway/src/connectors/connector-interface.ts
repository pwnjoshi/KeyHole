/**
 * Generic DataConnector interface.
 * Keyhole is connector-agnostic: the policy engine and Compact ZK circuit
 * operate strictly on field sets and records, with no direct dependencies on any provider.
 */

export interface FetchParams {
  query?: string;
  labelIds?: string[];
  maxResults?: number;
  timeMin?: Date;
  timeMax?: Date;
}

export type RawRecord = Record<string, any>;

export interface ConnectorConfigResult {
  success: boolean;
  identifier: string;
  isLive: boolean;
  message?: string;
  error?: string;
}

export interface DataConnector {
  /** Unique connector identifier ('gmail', 'gcal', 'slack', 'github', 'm365', 'postgres', 'salesforce', 'notion', etc.) */
  readonly id: string;
  
  /** Human readable display name */
  readonly displayName: string;

  /** Full set of field identifiers this connector can theoretically return */
  readonly availableFields: string[];

  /** True if credentials (OAuth tokens / API keys / Sandbox credentials) are configured and active */
  isConfigured(): boolean;

  /** True if connected to real live external production API (not simulated sandbox) */
  isLive?(): boolean;

  /** Connected identifier (e.g. email, workspace domain, repo, db host) */
  getIdentifier?(): string;

  /** Validate credentials against live external API or sandbox profile */
  configure?(creds: Record<string, any>): Promise<ConnectorConfigResult>;

  /** Disconnect and wipe credentials */
  disconnect?(): void;

  /** Executes remote API call to retrieve raw records before policy filtering */
  fetch(params: FetchParams): Promise<RawRecord[]>;
}
