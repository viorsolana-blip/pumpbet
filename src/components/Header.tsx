'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, ChevronDown, Wallet, LogOut, Zap, Settings, Trophy, Coins, Loader2 } from 'lucide-react';
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
    tabs,
    pendingTransactions,
  } = useStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Ansem just hit a new milestone!', time: '2m ago', unread: true },
    { id: 2, text: 'Whale alert: 500 SOL bet on YES', time: '15m ago', unread: true },
    { id: 3, text: 'New KOL bet: Will Cented reach 100K?', time: '1h ago', unread: false },
    { id: 4, text: 'Your position is up 23%!', time: '2h ago', unread: false },
  ]);

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
    const phantom = (window as any).phantom?.solana;
    const ethereum = (window as any).ethereum;

    if (phantom?.isPhantom) {
      try {
        const response = await phantom.connect();
        const address = response.publicKey.toString();
        setIsConnected(true);
        setWalletAddress(address.slice(0, 4) + '...' + address.slice(-4), address);
        setWalletType('solana');

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
              const solBalance = data.result.value / 1e9;
              setBalance(Math.round(solBalance * 1000) / 1000);
              balanceFetched = true;
            }
          } catch (e) {
            console.log(`RPC ${rpc} failed, trying next...`);
          }
        }

        if (!balanceFetched) {
          setBalance(0);
        }
      } catch (err) {
        console.error('Phantom connection failed:', err);
        window.open('https://phantom.app/', '_blank');
      }
    } else if (ethereum) {
      try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts[0]) {
          setIsConnected(true);
          setWalletAddress(accounts[0].slice(0, 6) + '...' + accounts[0].slice(-4), accounts[0]);
          setWalletType('ethereum');

          try {
            const balanceHex = await ethereum.request({
              method: 'eth_getBalance',
              params: [accounts[0], 'latest'],
            });
            const ethBalance = parseInt(balanceHex, 16) / 1e18;
            setBalance(Math.round(ethBalance * 10000) / 10000);
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
    setWalletAddress(null, null);
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
    <header className="h-14 bg-[#F8F4E8] border-b-2 border-[#D4CDB8] flex items-center justify-between px-4 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={openDashboard}
          className="flex items-center gap-3 hover:scale-105 transition-transform group"
        >
          {/* Helmet Logo */}
          <div className="relative">
            <Image
              src="/brand/helmet-logo.png"
              alt="PumpBet"
              width={40}
              height={40}
              className="helmet-wobble"
            />
          </div>
          {/* Brand Text */}
          <div className="hidden sm:flex items-baseline">
            <span className="text-xl text-[#5A6A4D] font-hyperbole tracking-tight">pump</span>
            <span className="text-xl text-[#3A4A2D]" style={{ fontFamily: 'Bambino, sans-serif' }}>bet.fun</span>
          </div>
        </button>

        {/* Nav Pills */}
        <div className="hidden lg:flex items-center gap-1 ml-4">
          <button
            onClick={() => addTab({ type: 'kols', title: 'Trenches', color: '#6B7B5E' })}
            className="px-3 py-1.5 text-sm text-[#5A6A4D] hover:bg-[#EFEAD9] rounded-full transition-colors font-bambino"
          >
            Trenches
          </button>
          <button
            onClick={() => addTab({ type: 'coins', title: 'Coins', color: '#5C8A4A' })}
            className="px-3 py-1.5 text-sm text-[#5A6A4D] hover:bg-[#EFEAD9] rounded-full transition-colors font-bambino"
          >
            Coins
          </button>
          <button
            onClick={() => addTab({ type: 'traders', title: 'Leaderboard', color: '#8B7355' })}
            className="px-3 py-1.5 text-sm text-[#5A6A4D] hover:bg-[#EFEAD9] rounded-full transition-colors font-bambino"
          >
            Leaderboard
          </button>
        </div>
      </div>

      {/* Center - Fun tagline */}
      <div className="hidden md:flex items-center gap-2">
        <span className="text-sm text-[#8B9B7E] font-bambino">bet on the trenches</span>
        <span className="text-[#D4CDB8]">|</span>
        <span className="text-xs text-[#9AAA8D] font-satoshi">built on solana</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Flywheel Button */}
        <Link
          href="/flywheel"
          className="group flex items-center gap-2 px-3 py-2 bg-[#EFEAD9] hover:bg-[#E8E2D0] border-2 border-[#D4CDB8] hover:border-[#6B7B5E] rounded-xl transition-all"
          title="Tokenomics"
        >
          <Image
            src="/brand/flywheel.png"
            alt="Flywheel"
            width={20}
            height={20}
            className="group-hover:animate-spin-slow"
            style={{ animationDuration: '2s' }}
          />
          <span className="text-xs text-[#5A6A4D] group-hover:text-[#3A4A2D] transition-colors hidden sm:block font-bambino">
            Flywheel
          </span>
        </Link>

        {/* $PUMPBET Token Button */}
        <a
          href="https://pump.fun"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 px-4 py-2 bg-[#6B7B5E] hover:bg-[#5A6A4D] border-2 border-[#4A5A3D] rounded-xl transition-all hover:scale-105 shadow-md"
        >
          <Coins className="w-4 h-4 text-[#E4D4B8]" />
          <span className="text-sm font-bold text-[#E4D4B8] font-bambino">$PUMPBET</span>
        </a>

        {/* X (Twitter) Link */}
        <a
          href="https://x.com/PumpBetFun"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:bg-[#EFEAD9] rounded-xl transition-colors border-2 border-transparent hover:border-[#D4CDB8]"
          title="Follow on X"
        >
          <svg className="w-4 h-4 text-[#5A6A4D] hover:text-[#3A4A2D] transition-colors" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>

        {/* Pending Transactions Indicator */}
        {pendingTransactions.length > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#D4A060]/20 border-2 border-[#D4A060]/40 rounded-xl">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4A060]" />
            <span className="text-xs font-bold text-[#D4A060] font-bambino">
              {pendingTransactions.length} tx
            </span>
          </div>
        )}

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-[#EFEAD9] rounded-xl transition-colors relative border-2 border-transparent hover:border-[#D4CDB8]"
            title="Alerts"
          >
            <Bell className="w-4 h-4 text-[#5A6A4D]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#C45A4A] rounded-full animate-pulse border border-[#F8F4E8]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#F8F4E8] border-2 border-[#D4CDB8] rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[#D4CDB8] bg-[#EFEAD9]">
                <span className="text-sm font-bold text-[#3A4A2D] font-bambino">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[#6B7B5E] hover:text-[#3A4A2D] transition-colors font-bambino"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-[#8B9B7E] font-bambino">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-[#EFEAD9] transition-colors text-left ${
                        notification.unread ? 'bg-[#E8E2D0]' : ''
                      }`}
                    >
                      <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                        notification.unread ? 'bg-[#5C8A4A]' : 'bg-[#D4CDB8]'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bambino ${notification.unread ? 'text-[#3A4A2D]' : 'text-[#6B7B5E]'}`}>
                          {notification.text}
                        </p>
                        <span className="text-xs text-[#8B9B7E] font-satoshi">{notification.time}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="px-4 py-3 border-t-2 border-[#D4CDB8] bg-[#EFEAD9]">
                <button
                  onClick={() => {
                    addTab({ type: 'alerts', title: 'Alerts', color: '#C45A4A' });
                    setShowNotifications(false);
                  }}
                  className="text-xs text-[#6B7B5E] hover:text-[#3A4A2D] transition-colors font-bambino"
                >
                  View all alerts →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-[#D4CDB8] mx-1" />

        {isConnected ? (
          <>
            {/* Balance - Dog tag style */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-br from-[#A08B70] to-[#8B7355] rounded-md shadow-inner">
              <span className="text-sm text-[#F5F0E1] font-bold font-satoshi tabular-nums">
                {balance.toLocaleString()} {walletType === 'solana' ? 'SOL' : walletType === 'ethereum' ? 'ETH' : ''}
              </span>
            </div>

            {/* Wallet Menu */}
            <div className="relative" ref={walletRef}>
              <button
                onClick={() => setShowWalletMenu(!showWalletMenu)}
                className="flex items-center gap-2 bg-[#EFEAD9] hover:bg-[#E8E2D0] border-2 border-[#D4CDB8] hover:border-[#6B7B5E] rounded-xl px-3 py-1.5 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6B7B5E] to-[#4A5A3D] flex items-center justify-center border border-[#3A4A2D]">
                  <span className="text-[10px] text-[#E4D4B8] font-bold font-satoshi">
                    {walletAddress?.slice(2, 4).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-[#5A6A4D] font-mono hover:text-[#3A4A2D] transition-colors hidden sm:block">
                  {walletAddress}
                </span>
                <ChevronDown className={`w-3 h-3 text-[#6B7B5E] transition-transform ${showWalletMenu ? 'rotate-180' : ''}`} />
              </button>

              {showWalletMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#F8F4E8] border-2 border-[#D4CDB8] rounded-xl shadow-xl z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      setShowSettings(true);
                      setShowWalletMenu(false);
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-[#EFEAD9] transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 text-[#6B7B5E]" />
                    <span className="text-sm text-[#5A6A4D] font-bambino">Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      addTab({ type: 'portfolio', title: 'Portfolio', color: '#6B7B5E' });
                      setShowWalletMenu(false);
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-[#EFEAD9] transition-colors text-left"
                  >
                    <Trophy className="w-4 h-4 text-[#6B7B5E]" />
                    <span className="text-sm text-[#5A6A4D] font-bambino">Portfolio</span>
                  </button>
                  <div className="border-t-2 border-[#D4CDB8]" />
                  <button
                    onClick={handleDisconnect}
                    className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-[#EFEAD9] transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-[#C45A4A]" />
                    <span className="text-sm text-[#C45A4A] font-bambino">Disconnect</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-[#EFEAD9] rounded-xl transition-colors border-2 border-transparent hover:border-[#D4CDB8]"
              title="Settings"
            >
              <Settings className="w-4 h-4 text-[#5A6A4D]" />
            </button>
            <button
              onClick={handleConnect}
              className="flex items-center gap-2 bg-[#6B7B5E] hover:bg-[#5A6A4D] text-[#E4D4B8] font-bold rounded-xl px-4 py-2 transition-all hover:scale-105 shadow-md border-2 border-[#4A5A3D]"
            >
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-bambino">Connect</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
