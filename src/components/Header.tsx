'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Bell, ChevronDown, Wallet, LogOut, Zap, Settings } from 'lucide-react';
import { useStore } from '@/store';

export function Header() {
  const {
    walletAddress,
    setShowSettings,
    addTab,
    balance,
    isConnected,
    setIsConnected,
    setWalletAddress,
    setBalance,
    walletType,
    setWalletType,
    splitView,
    setSplitView,
    setSplitPanels,
    tabs
  } = useStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Bitcoin above $100K market is trending', time: '2m ago', unread: true },
    { id: 2, text: 'Large whale trade detected: $50K on Chiefs', time: '15m ago', unread: true },
    { id: 3, text: 'New market: GPT-5 release date', time: '1h ago', unread: false },
    { id: 4, text: 'Your position in Super Bowl market is up 12%', time: '2h ago', unread: false },
  ]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (walletRef.current && !walletRef.current.contains(event.target as Node)) {
        setShowWalletMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConnect = async () => {
    // Security: We only request read-only access to public address
    // We NEVER request or store private keys
    // We NEVER request transaction signing without user action

    // Check for Phantom wallet (Solana)
    const phantom = (window as any).phantom?.solana;
    // Check for MetaMask (Ethereum)
    const ethereum = (window as any).ethereum;

    if (phantom?.isPhantom) {
      try {
        // Only requests public key - no private key access
        const response = await phantom.connect();
        const address = response.publicKey.toString();
        setIsConnected(true);
        setWalletAddress(address.slice(0, 4) + '...' + address.slice(-4));
        setWalletType('solana');

        // Fetch real SOL balance - try multiple RPC endpoints
        const rpcEndpoints = [
          'https://api.mainnet-beta.solana.com',
          'https://solana-mainnet.g.alchemy.com/v2/demo',
          'https://rpc.ankr.com/solana',
        ];

        let balanceFetched = false;
        for (const rpc of rpcEndpoints) {
          if (balanceFetched) break;
          try {
            const res = await fetch(rpc, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getBalance',
                params: [address],
              }),
            });
            const data = await res.json();
            if (data.result?.value !== undefined) {
              // Convert lamports to SOL (1 SOL = 1e9 lamports)
              const solBalance = data.result.value / 1e9;
              setBalance(Math.round(solBalance * 1000) / 1000); // Show 3 decimal places
              balanceFetched = true;
            }
          } catch (e) {
            console.log(`RPC ${rpc} failed, trying next...`);
          }
        }

        if (!balanceFetched) {
          console.error('All Solana RPC endpoints failed');
          setBalance(0);
        }
      } catch (err) {
        console.error('Phantom connection failed:', err);
        window.open('https://phantom.app/', '_blank');
      }
    } else if (ethereum) {
      try {
        // Only requests public address - no private key access
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts[0]) {
          setIsConnected(true);
          setWalletAddress(accounts[0].slice(0, 6) + '...' + accounts[0].slice(-4));
          setWalletType('ethereum');

          // Fetch real ETH balance
          try {
            const balanceHex = await ethereum.request({
              method: 'eth_getBalance',
              params: [accounts[0], 'latest'],
            });
            // Convert from wei to ETH
            const ethBalance = parseInt(balanceHex, 16) / 1e18;
            setBalance(Math.round(ethBalance * 10000) / 10000); // Show ETH balance
          } catch {
            setBalance(0);
          }
        }
      } catch (err) {
        console.error('MetaMask connection failed:', err);
      }
    } else {
      window.open('https://phantom.app/', '_blank');
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress(null);
    setBalance(0);
    setWalletType(null);
    setShowWalletMenu(false);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, unread: false } : n
    ));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const openDashboard = () => {
    // Reset to 3-panel dashboard view
    const marketTab = tabs.find(t => t.type === 'markets');
    const flowTab = tabs.find(t => t.type === 'flow');
    const chatTab = tabs.find(t => t.type === 'chat');

    const panels: string[] = [];
    if (marketTab) panels.push(marketTab.id);
    if (flowTab) panels.push(flowTab.id);
    if (chatTab) panels.push(chatTab.id);

    if (panels.length === 3) {
      setSplitView(true);
      setSplitPanels(panels);
    }
  };

  return (
    <header className="h-12 bg-black border-b border-[#1a1a1a] flex items-center justify-between px-4">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={openDashboard}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/brand/icon.png"
            alt="Apella"
            width={24}
            height={24}
          />
          <Image
            src="/brand/logo.png"
            alt="apella.fun"
            width={100}
            height={28}
            className="h-5 w-auto hidden sm:block opacity-90"
          />
        </button>
      </div>

      {/* Center - tagline */}
      <div className="flex-1 flex justify-center">
        <span className="text-xs text-[#444] hidden md:block">conquer the markets</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* $APELLA Token Button */}
        <a
          href="https://pump.fun"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative overflow-hidden rounded-lg"
        >
          {/* Texture background */}
          <div
            className="absolute inset-0 animate-texture-scroll opacity-60 group-hover:opacity-80 transition-opacity"
            style={{
              backgroundImage: 'url(/brand/pixel-texture.jpeg)',
              backgroundSize: '200% 100%',
              backgroundRepeat: 'repeat-x',
            }}
          />
          {/* Shine effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
          </div>
          {/* Border glow */}
          <div className="absolute inset-0 rounded-lg border border-[#ff0000]/40 group-hover:border-[#ff0000]/80 group-hover:shadow-[0_0_15px_rgba(255,0,0,0.3)] transition-all duration-300" />
          {/* Content */}
          <div className="relative px-4 py-1.5 flex items-center gap-2">
            <span className="text-sm font-bold text-white drop-shadow-[0_0_8px_rgba(255,68,0,0.8)]">$APELLA</span>
          </div>
        </a>

        {/* X (Twitter) Link */}
        <a
          href="https://x.com/ApellaDotFun"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:bg-[#111] rounded-lg transition-colors"
          title="Follow on X"
        >
          <svg className="w-4 h-4 text-[#666] hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-[#111] rounded-lg transition-colors relative"
            title="Alerts"
          >
            <Bell className="w-4 h-4 text-[#666] hover:text-white transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#ef4444] rounded-full animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a]">
                <span className="text-sm font-medium text-white">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[#666] hover:text-white transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-[#555]">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-[#111] transition-colors text-left ${
                        notification.unread ? 'bg-[#111]/50' : ''
                      }`}
                    >
                      <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                        notification.unread ? 'bg-[#3b82f6]' : 'bg-[#333]'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notification.unread ? 'text-white' : 'text-[#888]'}`}>
                          {notification.text}
                        </p>
                        <span className="text-xs text-[#555]">{notification.time}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="px-4 py-3 border-t border-[#1a1a1a]">
                <button
                  onClick={() => {
                    addTab({ type: 'alerts', title: 'Alerts', color: '#ec4899' });
                    setShowNotifications(false);
                  }}
                  className="text-xs text-[#666] hover:text-white transition-colors"
                >
                  View all alerts →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-[#1a1a1a] mx-2" />

        {isConnected ? (
          <>
            {/* Balance */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg">
              <span className="text-sm text-[#22c55e] font-medium tabular-nums">
                {balance.toLocaleString()} {walletType === 'solana' ? 'SOL' : walletType === 'ethereum' ? 'ETH' : ''}
              </span>
            </div>

            {/* Wallet Menu */}
            <div className="relative" ref={walletRef}>
              <button
                onClick={() => setShowWalletMenu(!showWalletMenu)}
                className="flex items-center gap-2 bg-[#0a0a0a] hover:bg-[#111] border border-[#1a1a1a] hover:border-[#333] rounded-lg px-3 py-1.5 transition-all"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center">
                  <span className="text-[10px] text-white font-medium">
                    {walletAddress?.slice(2, 4).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-[#888] font-mono hover:text-white transition-colors hidden sm:block">
                  {walletAddress}
                </span>
                <ChevronDown className={`w-3 h-3 text-[#555] transition-transform ${showWalletMenu ? 'rotate-180' : ''}`} />
              </button>

              {showWalletMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg shadow-xl z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      setShowSettings(true);
                      setShowWalletMenu(false);
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-[#111] transition-colors text-left"
                  >
                    <Wallet className="w-4 h-4 text-[#666]" />
                    <span className="text-sm text-[#888]">Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      addTab({ type: 'portfolio', title: 'Portfolio', color: '#8b5cf6' });
                      setShowWalletMenu(false);
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-[#111] transition-colors text-left"
                  >
                    <Zap className="w-4 h-4 text-[#666]" />
                    <span className="text-sm text-[#888]">Portfolio</span>
                  </button>
                  <div className="border-t border-[#1a1a1a]" />
                  <button
                    onClick={handleDisconnect}
                    className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-[#111] transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-[#ef4444]" />
                    <span className="text-sm text--[#ef4444]">Disconnect</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            {/* Settings button - accessible without connection */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-[#111] rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4 text-[#666] hover:text-white transition-colors" />
            </button>
            <button
              onClick={handleConnect}
              className="flex items-center gap-2 bg-white hover:bg-[#f0f0f0] text-black font-medium rounded-lg px-4 py-1.5 transition-all"
            >
              <Wallet className="w-4 h-4" />
              <span className="text-sm">Connect</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
