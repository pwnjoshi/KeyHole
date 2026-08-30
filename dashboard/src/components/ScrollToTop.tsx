import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ROUTE_SEO: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Keyhole | Cryptographic Zero-Trust Gateway for Autonomous AI Agents',
    description: 'Grant autonomous AI agents least-privilege API access with zero data leakage. Powered by Midnight Compact zero-knowledge cryptographic proofs.'
  },
  '/docs': {
    title: 'Documentation & Universal SDK Reference | Keyhole AI Security',
    description: 'Developer quickstart, 1-line Python & TypeScript SDK reference, threat models, and Midnight Compact ZK circuit specifications.'
  },
  '/sandbox': {
    title: 'Live Security Sandbox & Attack Demos | Keyhole Zero-Knowledge',
    description: 'Interactive live testbed for simulating prompt injections, canary honeypots, and Midnight ZK scope verifications.'
  },
  '/about': {
    title: 'Technical Whitepaper & Architecture Specs | Keyhole',
    description: 'Deep dive into Keyhole zero-trust architecture, hardware-isolated mathematical privacy perimeters, and Midnight blockchain anchoring.'
  },
  '/circuit': {
    title: 'Midnight ZK Circuit Prover & ZKIR Explorer | Keyhole',
    description: 'Interactive mathematical circuit compiler, bitmask violation calculator, and sub-12ms Midnight prover latency benchmarks.'
  },
  '/integrations': {
    title: 'Enterprise Connectors & 1-Click OAuth (8 Ready) | Keyhole',
    description: 'Connect Google Workspace, Microsoft 365, Slack, GitHub, Postgres, Salesforce, Notion, and Custom REST Webhooks.'
  },
  '/analytics': {
    title: 'Compliance Analytics & SOC 2 Cryptographic Ledger | Keyhole',
    description: 'Real-time telemetry, tamper-evident audit logs, and printable single-page compliance certificates.'
  },
  '/studio': {
    title: 'Autonomous AI Agent Studio & Swarm Defense | Keyhole',
    description: 'Execute multi-agent LLM reasoning workflows with live server-side redaction and cryptographic compliance proofs.'
  },
  '/console': {
    title: 'Enterprise Policy Console & Allowlist Editor | Keyhole',
    description: 'Configure and enforce fine-grained field allowlists and zero-knowledge boundaries across corporate APIs.'
  },
  '/login': {
    title: 'Enterprise Access & Secure Authentication | Keyhole Shield',
    description: 'Secure enterprise login with role-based access control, cryptographic session tokens, and audit compliance.'
  }
};

export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });

    const seo = ROUTE_SEO[pathname] || ROUTE_SEO['/'];
    document.title = seo.title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', seo.description);
    }
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', seo.title);
    }
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', seo.description);
    }
  }, [pathname]);

  return null;
};
