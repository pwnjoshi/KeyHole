import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HugeWalletIcon, HugeShieldCheckIcon } from './HugeIcons.tsx';
import { X, ExternalLink, RefreshCw, CheckCircle2, ShieldCheck, AlertCircle, Info, Zap, Copy, Check, Coins } from 'lucide-react';

interface LaceWalletModalProps {
  walletAddress: string | null;
  onConnect: (address: string) => void;
  onDisconnect: () => void;
  onClose: () => void;
}

export const LaceWalletModal: React.FC<LaceWalletModalProps> = ({
  walletAddress,
  onConnect,
  onDisconnect,
  onClose
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  // Balance defaults to '—' until a real CIP-30 query succeeds or demo path sets sandbox labels.
  const [dustBalance, setDustBalance] = useState('—');
  const [nightBalance, setNightBalance] = useState('—');
  const [balanceSource, setBalanceSource] = useState<'live' | 'sandbox' | null>(null);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Attempt real Web3 CIP-30 Lace browser extension handshake
  const handleConnectBrowserExtension = async () => {
    setIsConnecting(true);
    setErrorMessage(null);

    try {
      const cardano = (window as any).cardano;
      const midnight = (window as any).midnight;

      if (midnight?.mnLace) {
        const api = await midnight.mnLace.enable();
        const address = await api.getChangeAddress();
        // Try to query real balance via CIP-30; gracefully fall back if unavailable.
        try {
          const rawBalance = await api.getBalance();
          // CIP-30 returns CBOR-encoded balance in lovelace; display raw hex for now
          // pending Midnight-specific token parsing.
          setDustBalance(rawBalance ? `${rawBalance}` : '—');
          setNightBalance('—');
          setBalanceSource('live');
        } catch {
          setBalanceSource(null);
        }
        onConnect(address);
        return;
      } else if (cardano?.lace) {
        const api = await cardano.lace.enable();
        const usedAddresses = await api.getUsedAddresses();
        const address = usedAddresses[0] || (await api.getChangeAddress());
        try {
          const rawBalance = await api.getBalance();
          setDustBalance(rawBalance ? `${rawBalance}` : '—');
          setNightBalance('—');
          setBalanceSource('live');
        } catch {
          setBalanceSource(null);
        }
        onConnect(address);
        return;
      } else {
        setErrorMessage(
          'Lace Wallet browser extension was not detected in this browser. You can click "Connect Demo Midnight Testnet Wallet" below for instant sandbox testing!'
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'User rejected wallet connection request.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectDemoTestnetWallet = () => {
    const demoTestnetAddr = 'mn_testnet1qqv8f892a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5';
    // Demo path: show clearly labelled sandbox values, not hardcoded numbers passed off as live.
    setDustBalance('142.50');
    setNightBalance('1,250.00');
    setBalanceSource('sandbox');
    onConnect(demoTestnetAddr);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAddress.trim()) {
      setErrorMessage('Please enter a valid Midnight / Cardano testnet address');
      return;
    }
    onConnect(manualAddress.trim());
  };

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return createPortal(
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto z-[101]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <HugeWalletIcon size={20} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Midnight Lace Wallet</h3>
              <p className="text-xs text-slate-500">Decentralized Web3 On-Chain Attestations</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Explanation of What Lace Is */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-slate-600 space-y-1.5 leading-relaxed">
          <div className="flex items-center space-x-1.5 font-bold text-indigo-950">
            <HugeShieldCheckIcon size={16} className="text-indigo-600" />
            <span>Zero-Knowledge Proof Attestation on Midnight</span>
          </div>
          <p className="text-[11px] text-slate-600">
            <strong>Lace</strong> is the official Web3 wallet for the Cardano and Midnight Network ecosystem. Connecting your wallet allows enterprise compliance officers to sign and verify ZK policy commitments directly on the Midnight blockchain testnet.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {walletAddress ? (
          <div className="space-y-4">
            {/* Connected Address Card */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Midnight Testnet Wallet Connected</span>
                </div>
                <button
                  onClick={handleCopyAddress}
                  className="p-1 text-slate-500 hover:text-slate-800 text-xs flex items-center space-x-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[10px] font-mono">{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-emerald-200 font-mono text-[11px] text-slate-800 break-all select-all">
                {walletAddress}
              </div>
            </div>

            {/* Testnet Token Balances */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">DUST (Shielded Gas)</span>
                <span className="font-bold text-indigo-700 text-base font-mono">{dustBalance !== '—' ? `${dustBalance} DUST` : '—'}</span>
                <p className="text-[9px] text-slate-500 font-sans">
                  {balanceSource === 'live' ? 'Live (CIP-30 wallet)' : balanceSource === 'sandbox' ? 'Sandbox demo value' : 'Not available'}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">tNIGHT (Testnet Token)</span>
                <span className="font-bold text-slate-900 text-base font-mono">{nightBalance !== '—' ? `${nightBalance} tNIGHT` : '—'}</span>
                <p className="text-[9px] text-slate-500 font-sans">
                  {balanceSource === 'live' ? 'Live (CIP-30 wallet)' : balanceSource === 'sandbox' ? 'Sandbox demo value' : 'Not available'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-600">
              <span className="font-bold text-slate-900 block">Active Network: Midnight Testnet Preview (Chain ID: 4202)</span>
              <p className="text-[11px]">
                {balanceSource === 'live'
                  ? 'Balances queried via CIP-30 getBalance(). tNIGHT parsing pending Midnight token format spec.'
                  : balanceSource === 'sandbox'
                  ? 'Demo sandbox wallet — balances are illustrative. Connect Lace extension for live data.'
                  : 'Balances unavailable — Midnight Testnet does not yet expose a public balance RPC.'}
              </p>
            </div>

            <button
              onClick={onDisconnect}
              className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition"
            >
              Disconnect Lace Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 1-Click Demo Testnet Wallet Connector */}
            <button
              onClick={handleConnectDemoTestnetWallet}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Connect Demo Midnight Testnet Wallet</span>
            </button>

            {/* Primary Extension Connect Button */}
            <button
              onClick={handleConnectBrowserExtension}
              disabled={isConnecting}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition flex items-center justify-center space-x-2"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting to Lace Extension...</span>
                </>
              ) : (
                <>
                  <HugeWalletIcon size={16} />
                  <span>Connect Installed Lace Extension (CIP-30)</span>
                </>
              )}
            </button>

            <div className="flex items-center my-2">
              <div className="flex-1 border-t border-slate-200" />
              <span className="px-3 text-[10px] text-slate-400 font-mono uppercase">or manual testnet address</span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            {/* Manual Testnet Key Input */}
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Midnight / Cardano Address
                </label>
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="mn_testnet1... or addr_test1..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition"
              >
                Set Custom Testnet Address
              </button>
            </form>

            <div className="pt-1 text-center">
              <a
                href="https://www.lace.io/"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-slate-500 hover:text-indigo-600 font-medium inline-flex items-center space-x-1"
              >
                <span>Don't have Lace installed? Visit lace.io</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 text-center text-[10px] text-slate-400 font-mono">
          IOHK Midnight Network · Cardano CIP-30 Zero-Knowledge Protocol
        </div>
      </div>
    </div>,
    document.body
  );
};
