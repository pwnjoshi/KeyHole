import { DataConnector, FetchParams, RawRecord, ConnectorConfigResult } from './connector-interface.js';

export class M365Connector implements DataConnector {
  public readonly id = 'm365';
  public readonly displayName = 'Microsoft 365 (Outlook & Graph API)';
  public readonly availableFields = [
    'id',
    'from',
    'to_recipients',
    'subject',
    'received_time',
    'has_attachments',
    'importance',
    'body_preview',
    'full_body',
    'attachments',
    'm365_tokens'
  ];

  private configured = false;
  private liveApi = false;
  private clientId: string | null = null;
  private identifier = 'admin@enterprise.onmicrosoft.com';

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
    const rawClientId = (creds.clientId || creds.genericInput1 || '').trim();
    const rawSecret = (creds.clientSecret || creds.genericInput2 || '').trim();

    if (!rawClientId || !rawSecret) {
      throw new Error('Azure App Client ID and Client Secret are both required for Microsoft 365.');
    }

    const isSandbox = rawClientId.includes('demo') || rawClientId.includes('8a7b6c5d') || rawSecret.includes('demo');
    const isGuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(rawClientId);

    if (!isGuid && !isSandbox) {
      throw new Error(
        `Invalid Microsoft 365 Azure Client ID format "${rawClientId.substring(0, 10)}...". Azure Client IDs must be a valid 36-character UUID (e.g. 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d). If testing without live keys, click 'Autofill Sandbox Keys'.`
      );
    }

    if (isSandbox) {
      this.configured = true;
      this.liveApi = false;
      this.clientId = rawClientId;
      this.identifier = 'admin@enterprise.onmicrosoft.com (Sandbox)';
      return {
        success: true,
        identifier: this.identifier,
        isLive: false,
        message: 'Connected in Verified Sandbox Mode with sample Azure Outlook data.'
      };
    }

    // Live Azure OAuth verification
    try {
      const tenant = creds.tenantId || 'common';
      const tokenUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;
      const body = new URLSearchParams({
        client_id: rawClientId,
        client_secret: rawSecret,
        grant_type: 'client_credentials',
        scope: 'https://graph.microsoft.com/.default'
      });

      const res = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });

      const data: any = await res.json();

      if (!res.ok) {
        throw new Error(`Microsoft Azure AD Authentication Failed: ${data.error_description || data.error || res.statusText}`);
      }

      this.configured = true;
      this.liveApi = true;
      this.clientId = rawClientId;
      this.identifier = `Microsoft Graph EA Tenant (${rawClientId.substring(0, 8)}...)`;

      return {
        success: true,
        identifier: this.identifier,
        isLive: true,
        message: 'Successfully authenticated with live Microsoft 365 Azure AD Tenant.'
      };
    } catch (err: any) {
      throw new Error(err.message || 'Could not verify Microsoft Graph credentials.');
    }
  }

  public disconnect(): void {
    this.configured = false;
    this.liveApi = false;
    this.clientId = null;
    this.identifier = 'Unconfigured';
  }

  public async fetch(params: FetchParams): Promise<RawRecord[]> {
    const max = params.maxResults || 5;

    // Realistic Microsoft 365 Outlook Sandbox Records
    const sampleM365Emails: RawRecord[] = [
      {
        id: 'msg_m365_101',
        from: 'billing@microsoft.com',
        to_recipients: 'finance@enterprise.corp',
        subject: 'Azure Enterprise Agreement Invoice #MS-9921',
        received_time: new Date(Date.now() - 3600000 * 2).toISOString(),
        has_attachments: true,
        importance: 'normal',
        body_preview: 'Your Microsoft Azure cloud invoice for $1,240.00 is ready for review.',
        full_body: 'CONFIDENTIAL: Azure Cloud Subscription EA-4892. Subtotal: $1,240.00. Payment method: Wire transfer to Microsoft US Corp.',
        attachments: ['Azure_Invoice_Aug2026.pdf'],
        m365_tokens: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
      },
      {
        id: 'msg_m365_102',
        from: 'it-security@enterprise.corp',
        to_recipients: 'all-employees@enterprise.corp',
        subject: 'Mandatory Quarterly Security Training Reminder',
        received_time: new Date(Date.now() - 3600000 * 8).toISOString(),
        has_attachments: false,
        importance: 'high',
        body_preview: 'Please complete the annual SOC2 & HIPAA cybersecurity modules before Friday.',
        full_body: 'CONFIDENTIAL: Internal compliance tracking. Failing to complete will revoke VPN credentials.',
        attachments: [],
        m365_tokens: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
      },
      {
        id: 'msg_m365_103',
        from: 'accounts@github.com',
        to_recipients: 'devops@enterprise.corp',
        subject: 'GitHub Enterprise License Renewal Confirmed',
        received_time: new Date(Date.now() - 3600000 * 18).toISOString(),
        has_attachments: false,
        importance: 'normal',
        body_preview: 'Your 250 developer seat licenses for Keyhole organization have been renewed.',
        full_body: 'CONFIDENTIAL: Contract terms $45,000/yr. Credit Card on file ending in 4242.',
        attachments: [],
        m365_tokens: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    ];

    return sampleM365Emails.slice(0, max);
  }
}
