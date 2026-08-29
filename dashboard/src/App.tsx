import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation.tsx';
import { Preloader } from './components/Preloader.tsx';
import { HeroShowcase } from './components/HeroShowcase.tsx';
import { AboutPage } from './components/AboutPage.tsx';
import { AgentStudio } from './components/AgentStudio.tsx';
import { ConnectedAgents } from './components/ConnectedAgents.tsx';
import { ComplianceFeed } from './components/ComplianceFeed.tsx';
import { IntegrationsHub } from './components/IntegrationsHub.tsx';
import { ZKExplorer } from './components/ZKExplorer.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { PolicyEditor } from './components/PolicyEditor.tsx';
import { ProofModal } from './components/ProofModal.tsx';
import { LaceWalletModal } from './components/LaceWalletModal.tsx';
import { InteractiveBackground } from './components/InteractiveBackground.tsx';
import { Footer } from './components/Footer.tsx';
import { CommandDashboard } from './components/CommandDashboard.tsx';
import { JudgeDemoSandbox } from './components/JudgeDemoSandbox.tsx';
import { ScrollToTop } from './components/ScrollToTop.tsx';
import { ScopePolicy, AuditEvent, ConnectorInfo, AuthUser } from './types.ts';

function AppContent() {
  const location = useLocation();
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [policies, setPolicies] = useState<ScopePolicy[]>([]);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [connectors, setConnectors] = useState<ConnectorInfo[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Authentication state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Modals state
  const [editingPolicy, setEditingPolicy] = useState<ScopePolicy | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [inspectingEvent, setInspectingEvent] = useState<AuditEvent | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Toast notification feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Check stored auth token
  const checkAuth = async () => {
    const token = localStorage.getItem('keyhole-jwt');
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      } else {
        localStorage.removeItem('keyhole-jwt');
      }
    } catch {
      // ignore
    }
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [policiesRes, eventsRes, connectorsRes] = await Promise.all([
        fetch('/api/policies'),
        fetch('/api/audit-logs?limit=50'),
        fetch('/api/connectors')
      ]);

      if (policiesRes.ok) {
        const data = await policiesRes.json();
        setPolicies(data.policies || []);
      }
      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(data.events || []);
      }
      if (connectorsRes.ok) {
        const data = await connectorsRes.json();
        setConnectors(data.connectors || []);
      }
    } catch (err) {
      console.warn('Error fetching initial data from Keyhole Gateway:', err);
    }
  };

  // Sync wallet address per logged-in user account
  useEffect(() => {
    if (currentUser?.email) {
      const savedWallet = localStorage.getItem(`keyhole_wallet_${currentUser.email}`);
      setWalletAddress(savedWallet || null);
    } else {
      setWalletAddress(null);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchData();
    checkAuth();

    // Check if redirected from Google OAuth
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') === 'google') {
      showToast('Live Google Workspace account connected successfully!', 'success');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const timer = setTimeout(() => {
      setIsLoadingApp(false);
    }, 400);

    // Setup Server-Sent Events (SSE) stream for real-time audit feed
    let eventSource: EventSource | null = null;
    const connectSSE = () => {
      eventSource = new EventSource('/api/audit-stream');

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (e) => {
        try {
          const newEvent: AuditEvent = JSON.parse(e.data);
          if (newEvent.type !== 'INIT') {
            setEvents((prev) => [newEvent, ...prev.filter(item => item.id !== newEvent.id)]);
          }
        } catch (err) {
          console.error('Failed to parse SSE event:', err);
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
        eventSource?.close();
        setTimeout(connectSSE, 3000);
      };
    };

    connectSSE();

    return () => {
      clearTimeout(timer);
      eventSource?.close();
    };
  }, []);

  // Handler for saving/updating policies (Protected API)
  const handleSavePolicy = async (policy: ScopePolicy) => {
    const token = localStorage.getItem('keyhole-jwt');
    try {
      const res = await fetch('/api/policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(policy)
      });
      if (res.ok) {
        await fetchData();
        showToast(`Policy '${policy.name}' saved successfully.`, 'success');
      } else {
        const data = await res.json();
        showToast(`Failed to save policy: ${data.error}`, 'error');
      }
    } catch (err) {
      showToast('Network error saving policy.', 'error');
    }
  };

  // Handler for deleting policies (Protected API)
  const handleDeletePolicy = async (id: string) => {
    const token = localStorage.getItem('keyhole-jwt');
    try {
      const res = await fetch(`/api/policies/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchData();
        showToast(`Policy deleted.`, 'info');
        setIsEditorOpen(false);
      } else {
        const data = await res.json();
        showToast(`Failed to delete: ${data.error}`, 'error');
      }
    } catch (err) {
      showToast('Failed to delete policy.', 'error');
    }
  };

  // Handler for testing live agent requests
  const handleTriggerDemo = async (connectionId: string, outOfScope: boolean) => {
    setIsTesting(true);
    const targetPolicy = policies.find(p => p.id === connectionId);
    const policyName = targetPolicy?.name || connectionId;

    try {
      let requestedFields = targetPolicy?.allowedFields || ['sender', 'subject', 'date'];
      if (outOfScope) {
        requestedFields = [...requestedFields, 'body', 'attachments'];
      }

      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId,
          requestedFields,
          params: { maxResults: 3 }
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`In-Scope Query for '${policyName}' SUCCEEDED! Midnight ZK proof generated.`, 'success');
      } else if (res.status === 403) {
        showToast(`Out-of-Scope Query for '${policyName}' BLOCKED by Gateway (403 Forbidden).`, 'error');
      } else {
        showToast(`Request failed: ${data.error}`, 'error');
      }
    } catch (err: any) {
      showToast(`Network error triggering query: ${err.message}`, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearEvents = async () => {
    try {
      const res = await fetch('/api/events', { method: 'DELETE' });
      if (res.ok) {
        setEvents([]);
        showToast('Audit log cleared', 'info');
      }
    } catch (e) {
      setEvents([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white relative">
      {/* Interactive Mouse-Following Spotlight Background */}
      <InteractiveBackground />

      {/* Minimal Animated Preloader */}
      <Preloader isLoading={isLoadingApp} />

      {/* Modern Clean Navigation Header */}
      <Navigation
        currentUser={currentUser}
        walletAddress={walletAddress}
        onConnectWallet={() => setIsWalletModalOpen(true)}
        onLogout={() => {
          localStorage.removeItem('keyhole-jwt');
          setCurrentUser(null);
          showToast('Logged out successfully', 'info');
        }}
      />

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-150">
          <div className={`px-4 py-3 rounded-xl border shadow-xl flex items-center space-x-2 text-xs font-semibold backdrop-blur-md ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : toast.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-indigo-50 border-indigo-300 text-indigo-900'
          }`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Routed Page Content (Ample Top/Bottom Spacing Across All Views) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-16 flex-1 flex flex-col space-y-12 w-full animate-entrance">
        <Routes>
          {/* 1. Public Landing / Overview */}
          <Route path="/" element={<HeroShowcase />} />

          {/* Public Judge & Evaluator Live Sandbox */}
          <Route path="/sandbox" element={<JudgeDemoSandbox />} />

          {/* Dedicated Enterprise Command Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute currentUser={currentUser}>
                <CommandDashboard
                  currentUser={currentUser}
                  policies={policies}
                  events={events}
                  onSavePolicy={handleSavePolicy}
                />
              </ProtectedRoute>
            }
          />

          {/* 2. Public Technical Whitepaper / About */}
          <Route path="/about" element={<AboutPage />} />

          {/* 3. Login Page (Auto-redirect to /dashboard if already signed in) */}
          <Route
            path="/login"
            element={
              currentUser ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginPage
                  onLoginSuccess={(user) => {
                    setCurrentUser(user);
                    showToast(`Welcome back, ${user.name}!`, 'success');
                  }}
                />
              )
            }
          />

          {/* 4. Public ZK Circuit Explorer */}
          <Route path="/circuit" element={<ZKExplorer />} />

          {/* 5. Protected: Autonomous AI Agent Execution Studio */}
          <Route
            path="/studio"
            element={
              <ProtectedRoute currentUser={currentUser}>
                <AgentStudio policies={policies} />
              </ProtectedRoute>
            }
          />

          {/* 6. Protected: Security Console & Audit Log */}
          <Route
            path="/console"
            element={
              <ProtectedRoute currentUser={currentUser}>
                <div className="space-y-8">
                  <ConnectedAgents
                    policies={policies}
                    onSelectPolicy={(policy) => {
                      setEditingPolicy(policy);
                      setIsEditorOpen(true);
                    }}
                    onOpenNewPolicy={() => {
                      setEditingPolicy(null);
                      setIsEditorOpen(true);
                    }}
                    onTriggerDemo={handleTriggerDemo}
                    isTesting={isTesting}
                    isLoading={isLoadingApp}
                  />

                  <ComplianceFeed
                    events={events}
                    onInspectProof={(evt) => setInspectingEvent(evt)}
                    onClearEvents={handleClearEvents}
                    isLoading={isLoadingApp}
                  />
                </div>
              </ProtectedRoute>
            }
          />

          {/* 7. Protected: Connected Services & Integrations Hub */}
          <Route
            path="/integrations"
            element={
              <ProtectedRoute currentUser={currentUser}>
                <IntegrationsHub />
              </ProtectedRoute>
            }
          />

          {/* 8. Protected: Enterprise Governance Analytics */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute currentUser={currentUser}>
                <AnalyticsView events={events} isLoading={isLoadingApp} />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Modals */}
      {isEditorOpen && (
        <PolicyEditor
          policy={editingPolicy}
          connectors={connectors}
          onSave={handleSavePolicy}
          onDelete={handleDeletePolicy}
          onClose={() => setIsEditorOpen(false)}
        />
      )}

      {inspectingEvent && (
        <ProofModal
          event={inspectingEvent}
          onClose={() => setInspectingEvent(null)}
        />
      )}

      {isWalletModalOpen && (
        <LaceWalletModal
          walletAddress={walletAddress}
          onConnect={(addr) => {
            if (currentUser?.email) {
              localStorage.setItem(`keyhole_wallet_${currentUser.email}`, addr);
            }
            setWalletAddress(addr);
            setIsWalletModalOpen(false);
            showToast('Lace Wallet connected (Midnight Testnet)', 'success');
          }}
          onDisconnect={() => {
            if (currentUser?.email) {
              localStorage.removeItem(`keyhole_wallet_${currentUser.email}`);
            }
            setWalletAddress(null);
            showToast('Wallet disconnected for this account', 'info');
          }}
          onClose={() => setIsWalletModalOpen(false)}
        />
      )}

      {/* Modern Enterprise 4-Column Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
}
