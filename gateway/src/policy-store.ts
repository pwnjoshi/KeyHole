import { supabase, INITIAL_DEFAULT_POLICIES } from './supabase.js';

export interface ScopePolicy {
  id: string;
  name: string;
  connectorId: string;
  description: string;
  allowedFields: string[];
  allowedLabels?: string[];
  maxMessageCount?: number;
  createdAt?: string;
  expiresAt?: string | null;
  canaryEnabled?: boolean;
  status: 'active' | 'paused' | 'revoked';
}

export class PolicyStore {
  private cache: Map<string, ScopePolicy> = new Map();
  private initialized: boolean = false;

  constructor() {
    // Populate cache with default policies initially
    for (const p of INITIAL_DEFAULT_POLICIES) {
      this.cache.set(p.id, {
        id: p.id,
        name: p.name,
        connectorId: p.connector_id,
        description: p.description,
        allowedFields: p.allowed_fields,
        allowedLabels: p.allowed_labels,
        maxMessageCount: p.max_records,
        status: p.status as any,
        expiresAt: p.expires_at,
        canaryEnabled: p.canary_enabled,
        createdAt: new Date().toISOString()
      });
    }

    // Load from Supabase Database asynchronously
    this.syncFromSupabase();
  }

  private async syncFromSupabase(): Promise<void> {
    try {
      // Seed/upsert all rich enterprise policies into Supabase
      await this.seedDefaultPolicies();

      const { data, error } = await supabase.from('policies').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        for (const r of data) {
          const policy = this.mapRowToPolicy(r);
          this.cache.set(policy.id, policy);
        }
        this.initialized = true;
        console.log(`[Supabase PolicyStore] Synchronized ${data.length} policies from cloud DB.`);
      }
    } catch (e: any) {
      console.warn('[Supabase PolicyStore] Sync warning:', e.message);
    }
  }

  private async seedDefaultPolicies(): Promise<void> {
    try {
      const inserts = INITIAL_DEFAULT_POLICIES.map(p => ({
        id: p.id,
        name: p.name,
        connector_id: p.connector_id,
        description: p.description,
        allowed_fields: p.allowed_fields,
        allowed_labels: p.allowed_labels,
        max_records: p.max_records,
        status: p.status,
        expires_at: p.expires_at,
        canary_enabled: p.canary_enabled
      }));
      await supabase.from('policies').upsert(inserts);
    } catch (err: any) {
      console.warn('[Supabase PolicyStore] Seeding notice:', err.message);
    }
  }

  public get(id: string): ScopePolicy | undefined {
    return this.cache.get(id);
  }

  public getPolicy(id: string): ScopePolicy | undefined {
    return this.get(id);
  }

  public getAll(): ScopePolicy[] {
    return Array.from(this.cache.values());
  }

  public getAllPolicies(): ScopePolicy[] {
    return this.getAll();
  }

  public set(policy: ScopePolicy): ScopePolicy {
    this.cache.set(policy.id, policy);

    // Save directly to Supabase cloud database
    Promise.resolve().then(async () => {
      try {
        await supabase.from('policies').upsert({
          id: policy.id,
          name: policy.name,
          connector_id: policy.connectorId,
          description: policy.description || '',
          allowed_fields: policy.allowedFields || [],
          allowed_labels: policy.allowedLabels || [],
          max_records: policy.maxMessageCount || 10,
          status: policy.status || 'active',
          expires_at: policy.expiresAt || null,
          canary_enabled: policy.canaryEnabled !== false
        });
      } catch (err: any) {
        console.warn('[Supabase PolicyStore] Set policy error:', err.message);
      }
    });

    return policy;
  }

  public setPolicy(policy: ScopePolicy): void {
    this.set(policy);
  }

  public delete(id: string): boolean {
    const existed = this.cache.delete(id);

    // Delete directly from Supabase cloud database
    Promise.resolve().then(async () => {
      try {
        await supabase.from('policies').delete().eq('id', id);
      } catch (err: any) {
        console.warn('[Supabase PolicyStore] Delete policy error:', err.message);
      }
    });

    return existed;
  }

  public deletePolicy(id: string): boolean {
    return this.delete(id);
  }

  private mapRowToPolicy(row: any): ScopePolicy {
    return {
      id: row.id,
      name: row.name,
      connectorId: row.connector_id,
      description: row.description || '',
      allowedFields: Array.isArray(row.allowed_fields) ? row.allowed_fields : JSON.parse(row.allowed_fields || '[]'),
      allowedLabels: Array.isArray(row.allowed_labels) ? row.allowed_labels : JSON.parse(row.allowed_labels || '[]'),
      maxMessageCount: row.max_records,
      status: row.status as any,
      expiresAt: row.expires_at || null,
      canaryEnabled: row.canary_enabled !== false && row.canary_enabled !== 0,
      createdAt: row.created_at
    };
  }
}
