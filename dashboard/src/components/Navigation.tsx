import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeWalletIcon } from './HugeIcons.tsx';
import { User, LogOut, ChevronDown, Menu, X, ArrowRight, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { AuthUser } from '../types.ts';

interface NavigationProps {
  currentUser: AuthUser | null;
  walletAddress: string | null;
  onConnectWallet: () => void;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentUser,
  walletAddress,
  onConnectWallet,
  onLogout
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close user menu when clicking anywhere outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [userMenuOpen]);

  // Public visitor navigation vs Authenticated enterprise dashboard navigation
  const publicNavItems = [
    { to: '/', label: 'Overview' },
    { to: '/sandbox', label: 'Live Sandbox' },
    { to: '/docs', label: 'Docs' },
    { to: '/circuit', label: 'ZK Circuit' },
    { to: '/about', label: 'About' },
  ];

  const authenticatedNavItems = [
    { to: '/', label: 'Overview' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/studio', label: 'Studio' },
    { to: '/console', label: 'Console' },
    { to: '/integrations', label: 'Integrations' },
    { to: '/analytics', label: 'Analytics' },
    { to: '/circuit', label: 'Circuit' },
    { to: '/docs', label: 'Docs' },
  ];

  const navItems = currentUser ? authenticatedNavItems : publicNavItems;

  return (
    <header className="sticky top-2 sm:top-3 z-40 w-full max-w-7xl mx-auto px-2 sm:px-4">
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-card px-2.5 sm:px-4">
        <div className="relative flex items-center justify-between h-14 gap-1.5 sm:gap-3">
          
          {/* Left: Clean Static Brand Logo */}
          <Link 
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-1.5 sm:space-x-2 cursor-pointer select-none flex-shrink-0 z-10"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0 shadow-sm">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="5.8" r="2.8" fill="#ffffff"/>
                <path d="M6.6 7.2L5.4 13H10.6L9.4 7.2H6.6Z" fill="#ffffff"/>
                <circle cx="8" cy="5.8" r="1.1" fill="#4f46e5"/>
              </svg>
            </div>
            <div className="flex items-baseline space-x-1 sm:space-x-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
                Keyhole
              </span>
              <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
                Midnight
              </span>
            </div>
          </Link>

          {/* Center: Desktop Nav Links (Balanced Dynamic Center) */}
          <nav className="hidden lg:flex items-center justify-center flex-1 mx-1.5 xl:mx-3 space-x-0.5 text-[11.5px] xl:text-xs font-semibold z-10">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="relative px-2 xl:px-2.5 py-1.5 rounded-lg whitespace-nowrap text-slate-600 hover:text-slate-900 transition-colors z-10"
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute inset-0 bg-slate-100 border border-slate-200/80 rounded-lg shadow-subtle -z-10"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 32,
                      }}
                    />
                  )}
                  <span className={isActive ? 'text-indigo-700 font-bold' : ''}>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0 z-10">
            
            {/* Authenticated User Menu or Sign In Button (Desktop) */}
            <div className="hidden sm:block">
              {currentUser ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition shadow-subtle min-h-[34px]"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="font-medium">{currentUser.name}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 text-xs z-50 animate-in fade-in zoom-in-95">
                      <div className="px-2.5 py-2 border-b border-slate-100 mb-1">
                        <p className="font-bold text-slate-900 truncate">{currentUser.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono truncate">{currentUser.email}</p>
                        <span className="inline-block mt-1 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {currentUser.role}
                        </span>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg text-slate-700 hover:bg-slate-50 transition font-medium"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Command Dashboard</span>
                      </Link>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm inline-flex items-center space-x-1 min-h-[36px]"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>

            {/* Lace Wallet Button (Desktop/Tablet) */}
            {currentUser && (
              <button
                onClick={onConnectWallet}
                title="Midnight Cardano Lace Wallet"
                className={`hidden sm:flex px-3 py-1.5 rounded-lg text-xs font-semibold transition items-center space-x-1.5 min-h-[36px] ${
                  walletAddress
                    ? 'bg-slate-50 text-indigo-600 border border-slate-200 hover:bg-slate-100'
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                }`}
              >
                <HugeWalletIcon size={14} />
                <span className="whitespace-nowrap">
                  {walletAddress
                    ? `${walletAddress.substring(0, 5)}...${walletAddress.substring(walletAddress.length - 3)}`
                    : 'Connect Lace'}
                </span>
              </button>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center min-w-[40px] min-h-[40px]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-slate-100 py-3 space-y-2 overflow-hidden"
            >
              <div className="grid grid-cols-1 gap-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                    </NavLink>
                  );
                })}
              </div>

              {/* Mobile Auth & Wallet Section */}
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                {currentUser ? (
                  <>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{currentUser.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{currentUser.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onLogout();
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition"
                      >
                        Sign Out
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onConnectWallet();
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-2 ${
                        walletAddress
                          ? 'bg-slate-50 text-indigo-600 border border-slate-200'
                          : 'bg-slate-900 text-white'
                      }`}
                    >
                      <HugeWalletIcon size={15} />
                      <span>{walletAddress ? `Connected: ${walletAddress.substring(0, 8)}...` : 'Connect Midnight Lace Wallet'}</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-center text-xs font-bold shadow-sm flex items-center justify-center space-x-1.5"
                  >
                    <span>Sign In to Keyhole</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
