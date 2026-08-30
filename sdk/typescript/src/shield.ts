import { KeyholeConfig, KeyholeQueryResult } from './types.js';

export class KeyholePolicyViolationError extends Error {
  public statusCode: number;
  public details: any;

  constructor(message: string, statusCode: number = 403, details?: any) {
    super(message);
    this.name = 'KeyholePolicyViolationError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class KeyholeShield {
  private gatewayUrl: string;
  private apiKey?: string;
  private timeoutMs: number;

  constructor(config: KeyholeConfig = {}) {
    this.gatewayUrl = (config.gatewayUrl || 'https://keyhole.techsangi.com.np').replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.timeoutMs = config.timeoutMs || 15000;
  }

  public async executeQuery(prompt: string, connectionId: string = 'auto'): Promise<KeyholeQueryResult> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.gatewayUrl}/api/agent/run`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt, connectionId }),
        signal: controller.signal
      });

      const data = await res.json();
      clearTimeout(timer);

      if (res.status === 423) {
        throw new KeyholePolicyViolationError(
          `🚨 CANARY HONEYPOT TRIGGERED: Session quarantined (HTTP 423). ${data.error}`,
          423,
          data
        );
      } else if (res.status >= 400 || !data.success) {
        throw new KeyholePolicyViolationError(
          `🛡️ KEYHOLE POLICY BLOCKED (HTTP ${res.status}): ${data.error || 'Out-of-scope query'}`,
          res.status,
          data
        );
      }

      return data as KeyholeQueryResult;
    } catch (err: any) {
      clearTimeout(timer);
      if (err instanceof KeyholePolicyViolationError) throw err;
      throw new KeyholePolicyViolationError(`Gateway Communication Error: ${err.message}`, 500);
    }
  }

  /**
   * Generates standard OpenAI Function Tool schemas for 1-click binding
   */
  public async getTools(connectors: string[] = ['gmail', 'm365', 'slack', 'github', 'postgres']): Promise<any[]> {
    return connectors.map(conn => ({
      type: 'function',
      function: {
        name: `query_${conn}`,
        description: `Zero-Knowledge privacy-shielded query for ${conn}. Automatically redacts credentials, PII, and out-of-scope fields with Midnight ZK proofs.`,
        parameters: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'The search or retrieval query for the agent'
            }
          },
          required: ['prompt']
        }
      }
    }));
  }
}
