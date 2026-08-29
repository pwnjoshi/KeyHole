import { Response } from 'express';
import { supabase } from './supabase.js';

export type AuditEventType = 'COMPLIANT' | 'BLOCKED';

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
}

export class AuditLog {
  private events: AuditEvent[] = [];
  private sseClients: Set<Response> = new Set();
  private maxHistory = 500;

  constructor() {
    this.syncFromSupabase();
  }

  private async syncFromSupabase(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('audit_events')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (!error && data) {
        this.events = data.map(r => ({
          id: r.id,
          timestamp: r.timestamp,
          connectionId: r.connection_id,
          policyName: r.policy_name,
          connectorId: r.connector_id,
          type: r.type as AuditEventType,
          reason: r.reason,
          requestedFields: Array.isArray(r.requested_fields) ? r.requested_fields : JSON.parse(r.requested_fields || '[]'),
          allowedFields: Array.isArray(r.allowed_fields) ? r.allowed_fields : JSON.parse(r.allowed_fields || '[]'),
          deliveredFieldCount: r.delivered_field_count,
          recordCount: r.record_count,
          proofId: r.proof_id,
          midnightTxId: r.midnight_tx_id,
          clientIp: r.client_ip
        }));
        console.log(`[Supabase AuditLog] Loaded ${this.events.length} events from cloud DB.`);
      }
    } catch (e: any) {
      console.warn('[Supabase AuditLog] Sync warning:', e.message);
    }
  }

  public logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
    const fullEvent: AuditEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...event
    };

    this.events.unshift(fullEvent);
    if (this.events.length > this.maxHistory) {
      this.events.pop();
    }

    // Save directly to Supabase cloud database
    Promise.resolve().then(async () => {
      try {
        await supabase.from('audit_events').insert({
          id: fullEvent.id,
          timestamp: fullEvent.timestamp,
          connection_id: fullEvent.connectionId,
          policy_name: fullEvent.policyName,
          connector_id: fullEvent.connectorId,
          type: fullEvent.type,
          reason: fullEvent.reason,
          requested_fields: fullEvent.requestedFields,
          allowed_fields: fullEvent.allowedFields,
          delivered_field_count: fullEvent.deliveredFieldCount,
          record_count: fullEvent.recordCount,
          proof_id: fullEvent.proofId || null,
          midnight_tx_id: fullEvent.midnightTxId || null,
          client_ip: fullEvent.clientIp || null
        });
      } catch (err: any) {
        console.warn('[Supabase AuditLog] Insert event error:', err.message);
      }
    });

    this.broadcast(fullEvent);
    return fullEvent;
  }

  public getEvents(limit = 100): AuditEvent[] {
    return this.events.slice(0, limit);
  }

  public getRecent(limit = 100): AuditEvent[] {
    return this.getEvents(limit);
  }

  public addSseClient(res: Response): void {
    this.sseClients.add(res);
    res.on('close', () => {
      this.sseClients.delete(res);
    });
  }

  public addClient(res: Response): void {
    this.addSseClient(res);
  }

  public broadcast(event: AuditEvent): void {
    const data = JSON.stringify(event);
    for (const client of this.sseClients) {
      try {
        client.write(`data: ${data}\n\n`);
      } catch (err) {
        this.sseClients.delete(client);
      }
    }
  }

  public clearEvents(): void {
    this.events = [];
    Promise.resolve().then(async () => {
      try {
        await supabase.from('audit_events').delete().neq('id', '');
      } catch (err: any) {
        console.warn('[Supabase AuditLog] Clear error:', err.message);
      }
    });
  }

  public clear(): void {
    this.clearEvents();
  }
}
