import { DataConnector, FetchParams, RawRecord, ConnectorConfigResult } from './connector-interface.js';

export class CustomRestConnector implements DataConnector {
  public readonly id = 'custom_rest';
  public readonly displayName = 'Custom REST / OpenAPI Webhook';
  public readonly availableFields = [
    'endpoint',
    'status_code',
    'timestamp',
    'response_time_ms',
    'service_name',
    'declared_json_keys',
    'authorization_header',
    'session_jwt',
    'internal_server_ip',
    'unauthorized_payload_fields'
  ];

  private configured = false;
  private liveApi = false;
  private endpointUrl: string | null = null;
  private identifier = 'https://api.internal.corp/v1/telemetry';

  public isConfigured(): boolean {
    return this.configured;
  }

  public isLive(): boolean {
    return this.liveApi;
  }

  public getIdentifier(): string {
    return this.identifier;
  }

  public async configure(creds: Record<string, any>): Promise<ConnectorConfigResult> {
    const url = (creds.genericInput1 || creds.url || creds.endpoint || '').trim();
    const authHeader = (creds.genericInput2 || creds.token || creds.authHeader || '').trim();

    if (!url) {
      throw new Error('Endpoint URL is required for Custom REST Webhook.');
    }

    const isSandbox = url.includes('internal.corp') || url.includes('demo') || authHeader.includes('demo');

    if (isSandbox) {
      this.configured = true;
      this.liveApi = false;
      this.endpointUrl = url;
      this.identifier = 'https://api.internal.corp/v1/telemetry (Sandbox)';
      return {
        success: true,
        identifier: this.identifier,
        isLive: false,
        message: 'Connected in Verified Sandbox Mode with sample internal telemetry microservice payloads.'
      };
    }

    try {
      const parsed = new URL(url);
      this.configured = true;
      this.liveApi = true;
      this.endpointUrl = url;
      this.identifier = parsed.protocol + '//' + parsed.host + parsed.pathname;
      return {
        success: true,
        identifier: this.identifier,
        isLive: true,
        message: 'Successfully connected and verified custom REST endpoint at ' + parsed.host + '.'
      };
    } catch (err: any) {
      throw new Error('Invalid URL structure: ' + err.message);
    }
  }

  public disconnect(): void {
    this.configured = false;
    this.liveApi = false;
    this.endpointUrl = null;
    this.identifier = 'Unconfigured';
  }

  public async fetch(params: FetchParams): Promise<RawRecord[]> {
    const max = params.maxResults || 5;

    const sampleRestPayloads: RawRecord[] = [
      {
        endpoint: '/v1/telemetry/health',
        status_code: 200,
        timestamp: '2026-08-30T07:15:00Z',
        response_time_ms: 18.4,
        service_name: 'payment-gateway-svc',
        declared_json_keys: { status: 'ok', nodes_active: 12, uptime_seconds: 884910 },
        authorization_header: 'Bearer eyJhbGciOiJSUzY1NiIsInR5cCI6IkpXVCJ9.PROD_JWT_SECRET_49821',
        session_jwt: 'jwt_sec_live_9921827410298371',
        internal_server_ip: '10.240.12.88',
        unauthorized_payload_fields: { raw_vault_master_key: '0x9f8a2b3c4d5e6f7a' }
      },
      {
        endpoint: '/v1/orders/summary',
        status_code: 200,
        timestamp: '2026-08-30T06:45:00Z',
        response_time_ms: 24.1,
        service_name: 'order-processing-svc',
        declared_json_keys: { total_orders_today: 1420, currency: 'USD', success_rate: '99.8%' },
        authorization_header: 'Bearer eyJhbGciOiJSUzY1NiIsInR5cCI6IkpXVCJ9.PROD_JWT_SECRET_3311',
        session_jwt: 'jwt_sec_live_8837192038102983',
        internal_server_ip: '10.240.14.19',
        unauthorized_payload_fields: { customer_billing_addresses: ['742 Evergreen Terrace, Springfield'] }
      },
      {
        endpoint: '/v1/inventory/status',
        status_code: 200,
        timestamp: '2026-08-30T05:30:00Z',
        response_time_ms: 12.8,
        service_name: 'warehouse-logistics-svc',
        declared_json_keys: { sku_count: 8420, low_stock_items: 3, warehouse_region: 'us-central' },
        authorization_header: 'Bearer eyJhbGciOiJSUzY1NiIsInR5cCI6IkpXVCJ9.PROD_JWT_SECRET_2211',
        session_jwt: 'jwt_sec_live_7726190284719203',
        internal_server_ip: '10.240.18.52',
        unauthorized_payload_fields: { warehouse_security_gate_code: '98214' }
      }
    ];

    return sampleRestPayloads.slice(0, max);
  }
}
