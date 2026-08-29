import { DataConnector, FetchParams, RawRecord, ConnectorConfigResult } from './connector-interface.js';

export class GitHubConnector implements DataConnector {
  public readonly id = 'github';
  public readonly displayName = 'GitHub & GitLab Enterprise';
  public readonly availableFields = [
    'id',
    'repo_name',
    'issue_number',
    'issue_title',
    'author',
    'state',
    'labels',
    'created_at',
    'source_code',
    'env_secrets',
    'private_keys',
    'diff_blobs'
  ];

  private configured = false;
  private liveApi = false;
  private token: string | null = null;
  private username: string | null = null;
  private identifier = 'github.com/enterprise/keyhole-core';

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
    const rawToken = (creds.token || creds.personalAccessToken || creds.genericInput1 || '').trim();

    if (!rawToken) {
      throw new Error('GitHub Personal Access Token is required.');
    }

    // 1. Format validation check
    const isSandbox = rawToken.includes('enterprise_keyhole_demo') || rawToken.includes('demo_pat');
    const isValidFormat = rawToken.startsWith('ghp_') || rawToken.startsWith('github_pat_') || rawToken.startsWith('gho_') || rawToken.startsWith('ghu_');

    if (!isValidFormat) {
      throw new Error(
        `Invalid GitHub Token format "${rawToken.substring(0, 10)}...". GitHub Personal Access Tokens (classic or fine-grained) must begin with 'ghp_' or 'github_pat_'. If testing without live keys, click '⚡ Autofill Sandbox Keys'.`
      );
    }

    // 2. Sandbox Mode
    if (isSandbox) {
      this.configured = true;
      this.liveApi = false;
      this.token = rawToken;
      this.identifier = 'github.com/enterprise/keyhole-core (Sandbox)';
      return {
        success: true,
        identifier: this.identifier,
        isLive: false,
        message: 'Connected in Verified Sandbox Mode with sample enterprise repository data.'
      };
    }

    // 3. Real Live GitHub REST API verification
    try {
      const res = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${rawToken}`,
          'User-Agent': 'Keyhole-Zero-Knowledge-Gateway/1.0',
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!res.ok) {
        const errData: any = await res.json().catch(() => ({}));
        throw new Error(`GitHub API Authentication Failed: ${errData.message || res.statusText} (${res.status}). Please check your GitHub token scopes ('repo', 'read:user').`);
      }

      const userData: any = await res.json();
      this.configured = true;
      this.liveApi = true;
      this.token = rawToken;
      this.username = userData.login;
      this.identifier = `github.com/${userData.login} (${userData.name || 'Developer'})`;

      return {
        success: true,
        identifier: this.identifier,
        isLive: true,
        message: `Successfully authenticated with live GitHub account @${userData.login}.`
      };
    } catch (err: any) {
      throw new Error(err.message || 'Could not verify GitHub token against api.github.com.');
    }
  }

  public disconnect(): void {
    this.configured = false;
    this.liveApi = false;
    this.token = null;
    this.username = null;
    this.identifier = 'Unconfigured';
  }

  public async fetch(params: FetchParams): Promise<RawRecord[]> {
    const max = params.maxResults || 5;

    // Real Live GitHub API Execution
    if (this.liveApi && this.token) {
      try {
        const issuesRes = await fetch(`https://api.github.com/user/issues?filter=all&state=all&per_page=${max}`, {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'User-Agent': 'Keyhole-Zero-Knowledge-Gateway/1.0',
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        if (issuesRes.ok) {
          const issues: any[] = await issuesRes.json();
          if (issues.length > 0) {
            return issues.map((issue) => ({
              id: `gh_issue_${issue.id}`,
              repo_name: issue.repository?.full_name || `${this.username}/repository`,
              issue_number: issue.number,
              issue_title: issue.title,
              author: issue.user?.login || this.username || 'developer',
              state: issue.state,
              labels: (issue.labels || []).map((l: any) => typeof l === 'string' ? l : l.name),
              created_at: issue.created_at,
              // Confidential properties to be masked by Keyhole Zero-Knowledge engine:
              source_code: issue.body || '',
              env_secrets: '',
              private_keys: '',
              diff_blobs: ''
            }));
          }
        }

        // Fallback to real user repos if no issues
        const reposRes = await fetch(`https://api.github.com/user/repos?sort=updated&per_page=${max}`, {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'User-Agent': 'Keyhole-Zero-Knowledge-Gateway/1.0',
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        if (reposRes.ok) {
          const repos: any[] = await reposRes.json();
          if (repos.length > 0) {
            return repos.map((repo, idx) => ({
              id: `gh_repo_${repo.id}`,
              repo_name: repo.full_name,
              issue_number: idx + 1,
              issue_title: `Repository: ${repo.description || repo.name}`,
              author: repo.owner?.login || this.username || 'developer',
              state: repo.private ? 'private' : 'public',
              labels: [repo.language || 'Code', repo.visibility || 'public'],
              created_at: repo.created_at,
              source_code: `git clone ${repo.clone_url}`,
              env_secrets: '',
              private_keys: '',
              diff_blobs: ''
            }));
          }
        }
      } catch (liveErr) {
        console.warn('[GitHubConnector] Live fetch failed, falling back to sandbox records:', liveErr);
      }
    }

    // High-Fidelity Sandbox Enterprise Dataset
    const sampleGitHubIssues: RawRecord[] = [
      {
        id: 'gh_issue_301',
        repo_name: 'enterprise/keyhole-core',
        issue_number: 142,
        issue_title: 'feat: Add Midnight Compact v0.34 ZKIR bitmask verification circuit',
        author: 'dev-lead',
        state: 'closed',
        labels: ['security', 'zk', 'midnight'],
        created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
        source_code: 'export contract ScopeMembershipCircuit { witness allowed_mask: Field; ... }',
        env_secrets: 'AWS_SECRET_KEY=AKIAIOSFODNN7EXAMPLE',
        private_keys: '-----BEGIN OPENSSH PRIVATE KEY-----...',
        diff_blobs: '+ export function verifyProof() { return true; }'
      },
      {
        id: 'gh_issue_302',
        repo_name: 'enterprise/ai-agents',
        issue_number: 89,
        issue_title: 'fix: Wrap LLM tool dispatch in Keyhole HTTP 403 Pre-Fetch Guard',
        author: 'security-audit',
        state: 'open',
        labels: ['enhancement', 'compliance'],
        created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
        source_code: 'const res = await keyholeGateway.executeQuery({ connectionId });',
        env_secrets: 'JWT_SIGNING_SECRET=shhhh_super_secret',
        private_keys: '',
        diff_blobs: '+ if (res.status === 403) throw new SecurityViolationError();'
      }
    ];

    return sampleGitHubIssues.slice(0, max);
  }
}
