export interface NangoConnectSessionResponse {
  token: string;
  connectLink: string;
  expiresAt: string;
}

export interface NangoConnection {
  id: number;
  connection_id: string;
  provider_config_key: string;
  provider: string;
  errors: string[];
  end_user?: {
    id: string;
    display_name?: string;
    email?: string;
  };
  created: string;
}

export class NangoService {
  private secretKey: string;
  private baseUrl = 'https://api.nango.dev';

  constructor() {
    this.secretKey = process.env.NANGO_SECRET_KEY || '03fb88bc-844d-42b7-a831-1479f31a346e';
  }

  public isConfigured(): boolean {
    return !!this.secretKey && this.secretKey.length > 5;
  }

  public mapServiceToNangoSlug(serviceId: string): string {
    const map: Record<string, string> = {
      'google_workspace': 'google-mail',
      'gmail': 'google-mail',
      'gcal': 'google-calendar',
      'google-calendar': 'google-calendar',
      'slack': 'slack',
      'github': 'github-getting-started',
      'microsoft_365': 'microsoft',
      'microsoft': 'microsoft',
      'notion': 'notion',
      'salesforce': 'salesforce',
      'outlook': 'outlook'
    };
    return map[serviceId] || serviceId;
  }

  /**
   * Create a 1-Click Connect Session for end users.
   * Generates a hosted Nango connect link / modal session token.
   */
  public async createConnectSession(
    endUserId: string,
    email?: string,
    displayName?: string,
    integrationKey?: string
  ): Promise<NangoConnectSessionResponse> {
    const payload: Record<string, any> = {
      end_user: {
        id: endUserId,
        email: email || endUserId,
        display_name: displayName || email || endUserId
      }
    };

    if (integrationKey && integrationKey !== 'all') {
      const slug = this.mapServiceToNangoSlug(integrationKey);
      payload.allowed_integrations = [slug];
    } else {
      payload.allowed_integrations = [
        'google-mail',
        'google-calendar',
        'slack',
        'github-getting-started',
        'microsoft',
        'notion',
        'salesforce'
      ];
    }

    const response = await fetch(`${this.baseUrl}/connect/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Nango session creation failed (${response.status}): ${errText}`);
    }

    const json = await response.json();
    const data = json.data || json;
    return {
      token: data.token,
      connectLink: data.connect_link,
      expiresAt: data.expires_at
    };
  }

  /**
   * Fetch all active connections across all integrations for a user or tenant.
   */
  public async listConnections(): Promise<NangoConnection[]> {
    const response = await fetch(`${this.baseUrl}/connection`, {
      headers: {
        'Authorization': `Bearer ${this.secretKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to list Nango connections (${response.status})`);
    }

    const json = await response.json();
    return json.connections || [];
  }

  /**
   * Fetch specific provider connection credentials and access token.
   */
  public async getConnectionToken(
    connectionId: string,
    providerConfigKey: string
  ): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/connection/${connectionId}?provider_config_key=${providerConfigKey}`,
      {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`
        }
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  }
}

export const nangoService = new NangoService();
