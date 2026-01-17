'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { X, Plus, Columns, Square, MessageSquare, MoreHorizontal, Maximize2, LayoutGrid, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/Header';
import { MarketsPanel } from '@/components/panels/MarketsPanel';
import { EventPanel } from '@/components/panels/EventPanel';
import { FlowPanel } from '@/components/panels/FlowPanel';
import { ResearchCanvas } from '@/components/panels/ResearchCanvas';
import { QuickChat } from '@/components/panels/QuickChat';
import { NewTabPanel } from '@/components/panels/NewTabPanel';
import { KOLPanel } from '@/components/panels/KOLPanel';
import { TrenchesPanel } from '@/components/panels/TrenchesPanel';
import { CoinsPanel } from '@/components/panels/CoinsPanel';
import { TradersPanel } from '@/components/panels/TradersPanel';
import { LaunchPanel } from '@/components/panels/LaunchPanel';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { OnboardingModal } from '@/components/modals/OnboardingModal';
import { TutorialModal } from '@/components/modals/TutorialModal';
import { useStore, Tab } from '@/store';

// Mobile detection overlay
function MobileOverlay() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#030303] flex flex-col">
      {/* Top texture bar */}
      <div
        className="h-1 w-full animate-texture-scroll"
        style={{
          backgroundImage: 'url(/brand/pixel-texture.jpeg)',
          backgroundSize: '200% 100%',
          backgroundRepeat: 'repeat-x',
        }}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <Image
            src="/brand/helmet-logo.png"
            alt="PumpBet"
            width={80}
            height={80}
            className="mb-4"
          />
          <div className="flex items-baseline">
            <span className="text-2xl text-[#6B7B5E] font-bold tracking-tight" style={{ fontFamily: 'Hyperbole, sans-serif' }}>pumpbet</span>
            <span className="text-2xl text-[#8B9B7E]" style={{ fontFamily: 'Bambino, sans-serif' }}>.fun</span>
          </div>
        </div>

        {/* Simple message */}
        <div className="text-center max-w-xs">
          <p className="text-[#666] text-sm tracking-wide uppercase mb-3">
            Desktop Only
          </p>
          <h1 className="text-white text-xl font-medium mb-6">
            Open on your computer
          </h1>
          <div className="w-12 h-[1px] bg-[#1a1a1a] mx-auto mb-6" />
          <p className="text-[#444] text-sm leading-relaxed">
            PumpBet is a trench trading terminal built for desktop screens.
          </p>
        </div>
      </div>

      {/* Bottom section */}
      <div className="pb-12 text-center">
        <p className="text-[#333] text-xs tracking-wider uppercase">
          pumpbet.fun
        </p>
      </div>

      {/* Bottom texture bar */}
      <div
        className="h-1 w-full animate-texture-scroll"
        style={{
          backgroundImage: 'url(/brand/pixel-texture.jpeg)',
          backgroundSize: '200% 100%',
          backgroundRepeat: 'repeat-x',
          animationDirection: 'reverse',
        }}
      />
    </div>
  );
}

export default function Home() {
  const {
    tabs,
    activeTabId,
    addTab,
    removeTab,
    setActiveTab,
    selectedMarket,
    markets,
    setShowOnboarding,
    setShowTutorial,
    splitView,
    splitPanels,
    setSplitView,
    setSelectedMarket,
  } = useStore();

  // Panel widths for resizable layout (percentages)
  const [panelWidths, setPanelWidths] = useState([40, 35, 25]); // Markets 40%, Flow 35%, Chat 25%
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [fullScreenTab, setFullScreenTab] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Show tutorial only on first visit
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('pumpbet_tutorial_seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, [setShowTutorial]);

  // Handle drag resize
  const handleMouseDown = useCallback((index: number) => {
    setIsDragging(index);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging === null || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - containerRect.left;
    const containerWidth = containerRect.width;
    const mousePercent = (mouseX / containerWidth) * 100;

    setPanelWidths(prev => {
      const newWidths = [...prev];
      // Calculate the cumulative width up to this divider
      let cumulative = 0;
      for (let i = 0; i < isDragging; i++) {
        cumulative += prev[i];
      }

      const newWidth = mousePercent - cumulative;
      const nextWidth = prev[isDragging] + prev[isDragging + 1] - (newWidth);

      // Minimum width constraints (15%)
      if (newWidth >= 15 && nextWidth >= 15) {
        newWidths[isDragging] = newWidth;
        newWidths[isDragging + 1] = nextWidth;
      }

      return newWidths;
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleAddTab = () => {
    const newId = addTab({
      type: 'new',
      title: 'New Tab',
      color: '#22c55e',
    });
    // In split view, also add to splitPanels if less than 4 panels
    if (splitView && splitPanels.length < 4 && newId) {
      setSplitPanels([...splitPanels, newId]);
    }
  };

  // Open market in full screen (called from FlowPanel)
  const openMarketFullScreen = useCallback((market: typeof markets[0]) => {
    setSelectedMarket(market);
    const newId = addTab({
      type: 'event',
      title: market.title.length > 20 ? market.title.slice(0, 20) + '...' : market.title,
      eventId: market.id,
      color: '#5C8A4A',
    });
    if (newId) {
      setFullScreenTab(newId);
    }
  }, [addTab, setSelectedMarket]);

  // Return to 3-panel view
  const returnToSplitView = useCallback(() => {
    setFullScreenTab(null);
  }, []);

  const setSplitPanels = useStore(state => state.setSplitPanels);

  const renderPanelContent = (tab: Tab, isFullScreen = false) => {
    switch (tab.type) {
      case 'trenches':
        return <TrenchesPanel />;
      case 'coins':
        return <CoinsPanel />;
      case 'markets':
        return <MarketsPanel />;
      case 'event':
        const market = tab.eventId
          ? markets.find((m) => m.id === tab.eventId)
          : selectedMarket;
        return <EventPanel market={market || undefined} />;
      case 'flow':
        return <FlowPanel onMarketClick={openMarketFullScreen} />;
      case 'research':
        return <ResearchCanvas />;
      case 'chat':
        return <QuickChat />;
      case 'kols':
        return <KOLPanel />;
      case 'new':
        return <NewTabPanel />;
      case 'traders':
        return <TradersPanel />;
      case 'launch':
        return <LaunchPanel />;
      case 'portfolio':
        return <PortfolioPanel />;
      case 'wallet':
        return <WalletPanel />;
      case 'alerts':
        return <AlertsPanel />;
      case 'bonds':
        return <BondsPanel />;
      case 'calendar':
        return <CalendarPanel />;
      default:
        return <NewTabPanel />;
    }
  };

  // Get tabs for split view
  const splitTabs = splitPanels
    .map(id => tabs.find(t => t.id === id))
    .filter((t): t is Tab => t !== undefined);

  // Full screen tab
  const fullScreenTabData = fullScreenTab ? tabs.find(t => t.id === fullScreenTab) : null;

  // Single panel view (non-split)
  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="h-screen flex flex-col bg-[#F5F0E1]">
      <MobileOverlay />
      <Header />

      {/* Full Screen Mode - when clicking from whale flow */}
      {fullScreenTabData ? (
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Full screen header with back button */}
          <div className="h-12 bg-[#EFEAD9] flex items-center border-b-2 border-[#D4CDB8] px-3">
            <button
              onClick={returnToSplitView}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#6B7B5E] hover:bg-[#5A6A4D] rounded-xl transition-colors mr-3 border-2 border-[#5A6A4D]"
            >
              <ArrowLeft className="w-4 h-4 text-[#F5F0E1]" />
              <span className="text-sm text-[#F5F0E1] font-bambino font-bold">Back to Dashboard</span>
            </button>
            <button
              onClick={returnToSplitView}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F0E1] hover:bg-[#E8E2D0] rounded-xl transition-colors border-2 border-[#D4CDB8]"
            >
              <LayoutGrid className="w-4 h-4 text-[#6B7B5E]" />
              <span className="text-sm text-[#6B7B5E] font-bambino font-bold">3-Panel View</span>
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#5C8A4A] animate-pulse" />
              <span className="text-sm text-[#3A4A2D] font-bambino font-bold">{fullScreenTabData.title}</span>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            {renderPanelContent(fullScreenTabData, true)}
          </div>
        </main>
      ) : splitView && splitTabs.length > 0 ? (
        // Multi-panel resizable split view
        <main ref={containerRef} className="flex-1 flex overflow-hidden">
          {splitTabs.map((tab, index) => (
            <div
              key={tab.id}
              className="flex flex-col min-w-0 relative"
              style={{ width: `${panelWidths[index] || 100 / splitTabs.length}%` }}
            >
              {/* Drag handle */}
              {index > 0 && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize z-10 group hover:bg-[#6B7B5E] bg-[#D4CDB8] transition-colors"
                  onMouseDown={() => handleMouseDown(index - 1)}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-4 -translate-x-1/2" />
                </div>
              )}

              {/* Panel Tab Bar */}
              <div className={`h-8 bg-[#EFEAD9] flex items-center border-b-2 border-[#D4CDB8] ${index > 0 ? 'border-l-2 border-[#D4CDB8]' : ''}`}>
                <div className="flex items-center flex-1 min-w-0 px-2">
                  <div
                    className="w-2 h-2 rounded-full mr-2 flex-shrink-0 bg-[#5C8A4A]"
                  />
                  <span className="text-xs text-[#3A4A2D] font-bambino font-bold truncate">
                    {tab.title}
                  </span>
                </div>
              </div>

              {/* Panel Content */}
              <div className={`flex-1 overflow-hidden ${index > 0 ? 'border-l-2 border-[#D4CDB8]' : ''}`}>
                {renderPanelContent(tab)}
              </div>
            </div>
          ))}
        </main>
      ) : (
        // Single panel view with tab bar
        <>
          <div className="h-10 bg-[#EFEAD9] flex items-center border-b-2 border-[#D4CDB8]">
            <div className="flex items-center flex-1 overflow-x-auto">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`group flex items-center gap-2 px-3 py-2 border-r-2 border-[#D4CDB8] cursor-pointer transition-all relative ${
                    tab.id === activeTabId
                      ? 'bg-[#F5F0E1]'
                      : 'bg-[#EFEAD9] hover:bg-[#F5F0E1]'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.id === activeTabId && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6B7B5E]" />
                  )}
                  <div className="w-2 h-2 rounded-full bg-[#5C8A4A]" />
                  <span className={`text-sm font-bambino font-bold transition-colors max-w-[120px] truncate ${
                    tab.id === activeTabId ? 'text-[#3A4A2D]' : 'text-[#8B9B7E] group-hover:text-[#5A6A4D]'
                  }`}>
                    {tab.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTab(tab.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[#E8E2D0] rounded transition-all ml-1"
                  >
                    <X className="w-3 h-3 text-[#8B9B7E] hover:text-[#C45A4A]" />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddTab}
                className="p-2 hover:bg-[#E8E2D0] rounded-lg transition-colors ml-1"
              >
                <Plus className="w-4 h-4 text-[#8B9B7E] hover:text-[#5C8A4A]" />
              </button>
            </div>

            <div className="flex items-center gap-0.5 px-2 border-l-2 border-[#D4CDB8]">
              <button
                onClick={() => setSplitView(true)}
                className="p-1.5 hover:bg-[#E8E2D0] rounded-lg transition-colors"
                title="Split view"
              >
                <Columns className="w-4 h-4 text-[#8B9B7E] hover:text-[#3A4A2D]" />
              </button>
              <button className="p-1.5 hover:bg-[#E8E2D0] rounded-lg transition-colors">
                <Square className="w-4 h-4 text-[#8B9B7E] hover:text-[#3A4A2D]" />
              </button>
              <button className="p-1.5 hover:bg-[#E8E2D0] rounded-lg transition-colors">
                <MessageSquare className="w-4 h-4 text-[#8B9B7E] hover:text-[#3A4A2D]" />
              </button>
              <button className="p-1.5 hover:bg-[#E8E2D0] rounded-lg transition-colors">
                <MoreHorizontal className="w-4 h-4 text-[#8B9B7E] hover:text-[#3A4A2D]" />
              </button>
            </div>
          </div>
          <main className="flex-1 overflow-hidden">
            {activeTab && renderPanelContent(activeTab)}
          </main>
        </>
      )}

      <SettingsModal />
      <OnboardingModal />
      <TutorialModal />
    </div>
  );
}


function PortfolioPanel() {
  const { userPositions, fetchUserPositions, isConnected, walletType, walletAddressFull, userLPPositions, fetchUserLPPositions, addPendingTransaction, updateTransactionStatus, removePendingTransaction } = useStore();
  const [claimablePositions, setClaimablePositions] = useState<any[]>([]);
  const [claimableLPPositions, setClaimableLPPositions] = useState<any[]>([]);
  const [totalClaimable, setTotalClaimable] = useState(0);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'positions' | 'liquidity' | 'claimable'>('positions');

  useEffect(() => {
    if (isConnected) {
      fetchUserPositions();
      fetchUserLPPositions();
    }
  }, [isConnected, fetchUserPositions, fetchUserLPPositions]);

  // Fetch claimable positions
  useEffect(() => {
    if (isConnected && walletAddressFull) {
      fetch(`/api/user/claim?wallet=${walletAddressFull}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setClaimablePositions(data.claimablePositions || []);
            setClaimableLPPositions(data.claimableLPPositions || []);
            setTotalClaimable(data.totalClaimable || 0);
          }
        })
        .catch(console.error);
    }
  }, [isConnected, walletAddressFull]);

  const handleClaim = async (positionId: string, isLP: boolean = false) => {
    if (!walletAddressFull) return;
    setClaiming(positionId);

    const txId = `claim-${Date.now()}`;
    addPendingTransaction({
      id: txId,
      type: 'payout',
      amount: 0,
      status: 'pending',
      signature: '',
      createdAt: new Date(),
    });

    try {
      const response = await fetch('/api/user/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: walletAddressFull,
          ...(isLP ? { lpPositionId: positionId } : { positionId }),
        }),
      });

      const data = await response.json();

      if (data.success) {
        updateTransactionStatus(txId, 'confirmed');
        // Refresh claimable positions
        const refreshRes = await fetch(`/api/user/claim?wallet=${walletAddressFull}`);
        const refreshData = await refreshRes.json();
        if (refreshData.success) {
          setClaimablePositions(refreshData.claimablePositions || []);
          setClaimableLPPositions(refreshData.claimableLPPositions || []);
          setTotalClaimable(refreshData.totalClaimable || 0);
        }
        setTimeout(() => removePendingTransaction(txId), 5000);
      } else {
        updateTransactionStatus(txId, 'failed');
        setTimeout(() => removePendingTransaction(txId), 5000);
      }
    } catch (error) {
      console.error('Claim error:', error);
      updateTransactionStatus(txId, 'failed');
      setTimeout(() => removePendingTransaction(txId), 5000);
    }

    setClaiming(null);
  };

  // Calculate totals
  const totalValue = userPositions.reduce((sum, pos) => sum + (pos.currentValue || 0), 0);
  const totalPnl = userPositions.reduce((sum, pos) => sum + (pos.pnl || 0), 0);
  const totalLP = userLPPositions.reduce((sum, lp) => sum + (lp.amount || 0), 0);

  return (
    <div className="h-full bg-[#F5F0E1] p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#3A4A2D] font-bambino">Portfolio</h2>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] text-[#8B9B7E] uppercase tracking-wider font-satoshi">Total Value</div>
            <div className="text-lg font-bold text-[#3A4A2D] font-bambino">{totalValue.toFixed(3)} {walletType === 'solana' ? 'SOL' : 'ETH'}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[#8B9B7E] uppercase tracking-wider font-satoshi">Total P&L</div>
            <div className={`text-lg font-bold font-bambino ${totalPnl >= 0 ? 'text-[#5C8A4A]' : 'text-[#C45A4A]'}`}>
              {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(3)} {walletType === 'solana' ? 'SOL' : 'ETH'}
            </div>
          </div>
          {totalClaimable > 0 && (
            <div className="text-right px-3 py-1.5 bg-[#D4A060]/20 rounded-xl border-2 border-[#D4A060]/40">
              <div className="text-[10px] text-[#D4A060] uppercase tracking-wider font-satoshi">Claimable</div>
              <div className="text-lg font-bold text-[#D4A060] font-bambino">{totalClaimable.toFixed(3)} SOL</div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('positions')}
          className={`px-4 py-2 rounded-xl text-sm font-bambino transition-all ${
            activeTab === 'positions'
              ? 'bg-[#6B7B5E] text-[#E4D4B8] border-2 border-[#4A5A3D]'
              : 'bg-[#EFEAD9] text-[#5A6A4D] border-2 border-[#D4CDB8] hover:border-[#6B7B5E]'
          }`}
        >
          Positions ({userPositions.length})
        </button>
        <button
          onClick={() => setActiveTab('liquidity')}
          className={`px-4 py-2 rounded-xl text-sm font-bambino transition-all ${
            activeTab === 'liquidity'
              ? 'bg-[#6B7B5E] text-[#E4D4B8] border-2 border-[#4A5A3D]'
              : 'bg-[#EFEAD9] text-[#5A6A4D] border-2 border-[#D4CDB8] hover:border-[#6B7B5E]'
          }`}
        >
          Liquidity ({userLPPositions.length})
        </button>
        {(claimablePositions.length > 0 || claimableLPPositions.length > 0) && (
          <button
            onClick={() => setActiveTab('claimable')}
            className={`px-4 py-2 rounded-xl text-sm font-bambino transition-all ${
              activeTab === 'claimable'
                ? 'bg-[#D4A060] text-white border-2 border-[#B8884A]'
                : 'bg-[#D4A060]/20 text-[#D4A060] border-2 border-[#D4A060]/40 hover:bg-[#D4A060]/30'
            }`}
          >
            Claim ({claimablePositions.length + claimableLPPositions.length})
          </button>
        )}
      </div>

      {!isConnected ? (
        <div className="bg-[#EFEAD9] border-2 border-[#D4CDB8] rounded-2xl p-8 text-center">
          <div className="text-[#6B7B5E] mb-2 font-bambino">Connect your wallet to view positions</div>
        </div>
      ) : activeTab === 'positions' ? (
        userPositions.length === 0 ? (
          <div className="bg-[#EFEAD9] border-2 border-[#D4CDB8] rounded-2xl p-8 text-center">
            <div className="text-[#6B7B5E] font-bambino">No positions yet</div>
            <div className="text-[#8B9B7E] text-sm mt-2 font-satoshi">Place bets on KOL markets to get started</div>
          </div>
        ) : (
          <div className="bg-[#EFEAD9] border-2 border-[#D4CDB8] rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#D4CDB8] bg-[#E8E2D0]">
                  <th className="px-4 py-3 text-left text-[10px] text-[#6B7B5E] font-medium uppercase tracking-wider font-satoshi">Market</th>
                  <th className="px-4 py-3 text-left text-[10px] text-[#6B7B5E] font-medium uppercase tracking-wider font-satoshi">Position</th>
                  <th className="px-4 py-3 text-left text-[10px] text-[#6B7B5E] font-medium uppercase tracking-wider font-satoshi">Shares</th>
                  <th className="px-4 py-3 text-left text-[10px] text-[#6B7B5E] font-medium uppercase tracking-wider font-satoshi">Invested</th>
                  <th className="px-4 py-3 text-left text-[10px] text-[#6B7B5E] font-medium uppercase tracking-wider font-satoshi">Value</th>
                  <th className="px-4 py-3 text-left text-[10px] text-[#6B7B5E] font-medium uppercase tracking-wider font-satoshi">P&L</th>
                </tr>
              </thead>
              <tbody>
                {userPositions.map((pos, idx) => (
                  <tr key={pos.id || idx} className="border-b border-[#D4CDB8] last:border-0 hover:bg-[#E8E2D0] cursor-pointer transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {pos.bet?.kolImage && (
                          <Image src={pos.bet.kolImage} alt={pos.bet?.kolName || ''} width={24} height={24} className="rounded-full border border-[#D4CDB8]" />
                        )}
                        <span className="text-sm text-[#3A4A2D] font-bambino">{pos.bet?.title || 'Unknown Market'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] uppercase font-bold ${pos.side === 'yes' ? 'bg-[#5C8A4A]/20 text-[#5C8A4A]' : 'bg-[#C45A4A]/20 text-[#C45A4A]'}`}>
                        {pos.side}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#5A6A4D] font-satoshi">{pos.shares?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-[#5A6A4D] font-satoshi">{pos.amount?.toFixed(3)} SOL</td>
                    <td className="px-4 py-3 text-sm text-[#3A4A2D] font-bold font-satoshi">{pos.currentValue?.toFixed(3)} SOL</td>
                    <td className="px-4 py-3">
                      <div className={`text-sm font-satoshi ${pos.pnl >= 0 ? 'text-[#5C8A4A]' : 'text-[#C45A4A]'}`}>
                        {pos.pnl >= 0 ? '+' : ''}{pos.pnl?.toFixed(3)} SOL
                        <span className="text-[10px] ml-1 opacity-70">({pos.pnlPercent?.toFixed(1)}%)</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : activeTab === 'liquidity' ? (
        userLPPositions.length === 0 ? (
          <div className="bg-[#EFEAD9] border-2 border-[#D4CDB8] rounded-2xl p-8 text-center">
            <div className="text-[#6B7B5E] font-bambino">No liquidity positions</div>
            <div className="text-[#8B9B7E] text-sm mt-2 font-satoshi">Add liquidity to markets to earn fees</div>
          </div>
        ) : (
          <div className="space-y-3">
            {userLPPositions.map((lp) => (
              <div key={lp.id} className="bg-[#EFEAD9] border-2 border-[#D4CDB8] rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[#3A4A2D] font-bold font-bambino">Market #{lp.marketId.slice(0, 8)}</div>
                    <div className="text-xs text-[#8B9B7E] font-satoshi mt-1">
                      {lp.shares?.toFixed(2)} shares
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#3A4A2D] font-bambino">{lp.amount?.toFixed(4)} SOL</div>
                    <div className="text-xs text-[#8B9B7E] font-satoshi">Provided</div>
                  </div>
                </div>
              </div>
            ))}
            <div className="bg-[#E8E2D0] border-2 border-[#D4CDB8] rounded-xl p-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6B7B5E] font-bambino">Total LP Value</span>
                <span className="text-lg font-bold text-[#3A4A2D] font-bambino">{totalLP.toFixed(4)} SOL</span>
              </div>
            </div>
          </div>
        )
      ) : (
        /* Claimable Tab */
        <div className="space-y-4">
          {claimablePositions.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-[#3A4A2D] mb-3 font-bambino">Winning Positions</h3>
              <div className="space-y-2">
                {claimablePositions.map((pos) => (
                  <div key={pos.positionId} className="bg-[#5C8A4A]/10 border-2 border-[#5C8A4A]/30 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] uppercase font-bold ${pos.side === 'yes' ? 'bg-[#5C8A4A]/20 text-[#5C8A4A]' : 'bg-[#C45A4A]/20 text-[#C45A4A]'}`}>
                            {pos.side}
                          </span>
                          <span className="text-sm text-[#3A4A2D] font-bambino">Market #{pos.marketId?.slice(0, 8)}</span>
                        </div>
                        <div className="text-xs text-[#5C8A4A] font-satoshi mt-1">
                          +{pos.profit?.toFixed(4)} SOL profit
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-lg font-bold text-[#5C8A4A] font-bambino">{pos.payoutAmount?.toFixed(4)} SOL</div>
                          <div className="text-xs text-[#8B9B7E] font-satoshi">Claimable</div>
                        </div>
                        <button
                          onClick={() => handleClaim(pos.positionId, false)}
                          disabled={claiming === pos.positionId}
                          className="px-4 py-2 bg-[#5C8A4A] hover:bg-[#4A7A3A] text-white rounded-xl font-bold text-sm font-bambino transition-all disabled:opacity-50"
                        >
                          {claiming === pos.positionId ? 'Claiming...' : 'Claim'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {claimableLPPositions.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-[#3A4A2D] mb-3 font-bambino">LP Withdrawals</h3>
              <div className="space-y-2">
                {claimableLPPositions.map((lp) => (
                  <div key={lp.lpPositionId} className="bg-[#D4A060]/10 border-2 border-[#D4A060]/30 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-[#3A4A2D] font-bambino">LP Position #{lp.lpPositionId?.slice(0, 8)}</span>
                        <div className="text-xs text-[#D4A060] font-satoshi mt-1">
                          {lp.profit >= 0 ? '+' : ''}{lp.profit?.toFixed(4)} SOL {lp.profit >= 0 ? 'earned' : 'lost'}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-lg font-bold text-[#D4A060] font-bambino">{lp.payoutAmount?.toFixed(4)} SOL</div>
                          <div className="text-xs text-[#8B9B7E] font-satoshi">Withdrawable</div>
                        </div>
                        <button
                          onClick={() => handleClaim(lp.lpPositionId, true)}
                          disabled={claiming === lp.lpPositionId}
                          className="px-4 py-2 bg-[#D4A060] hover:bg-[#C49050] text-white rounded-xl font-bold text-sm font-bambino transition-all disabled:opacity-50"
                        >
                          {claiming === lp.lpPositionId ? 'Withdrawing...' : 'Withdraw'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {claimablePositions.length === 0 && claimableLPPositions.length === 0 && (
            <div className="bg-[#EFEAD9] border-2 border-[#D4CDB8] rounded-2xl p-8 text-center">
              <div className="text-[#6B7B5E] font-bambino">No claimable positions</div>
              <div className="text-[#8B9B7E] text-sm mt-2 font-satoshi">Winnings will appear here when markets resolve</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WalletPanel() {
  const { balance, walletAddress, walletAddressFull, walletType, pendingTransactions } = useStore();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (walletAddressFull) {
      navigator.clipboard.writeText(walletAddressFull);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="h-full bg-[#F5F0E1] p-6 overflow-y-auto">
      <h2 className="text-xl font-bold text-[#3A4A2D] mb-6 font-bambino">Wallet</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#EFEAD9] border-2 border-[#D4CDB8] rounded-2xl p-6">
          <div className="text-[10px] text-[#8B9B7E] uppercase tracking-wider mb-2 font-satoshi">Available Balance</div>
          <div className="text-3xl font-bold text-[#3A4A2D] font-bambino">
            {balance.toFixed(4)} {walletType === 'solana' ? 'SOL' : walletType === 'ethereum' ? 'ETH' : ''}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button className="px-4 py-2 bg-[#5C8A4A] hover:bg-[#4A7A3A] text-white rounded-xl text-sm font-bold font-bambino transition-all">
              Deposit
            </button>
            <button className="px-4 py-2 bg-[#E8E2D0] border-2 border-[#D4CDB8] hover:border-[#6B7B5E] text-[#5A6A4D] rounded-xl text-sm font-bold font-bambino transition-all">
              Withdraw
            </button>
          </div>
        </div>

        <div className="bg-[#EFEAD9] border-2 border-[#D4CDB8] rounded-2xl p-6">
          <div className="text-[10px] text-[#8B9B7E] uppercase tracking-wider mb-2 font-satoshi">Wallet Address</div>
          <div className="font-mono text-sm text-[#3A4A2D] break-all">{walletAddressFull || walletAddress || 'Not connected'}</div>
          <button
            onClick={copyAddress}
            className="mt-4 text-sm text-[#5C8A4A] hover:text-[#4A7A3A] font-bambino transition-colors"
          >
            {copied ? '✓ Copied!' : 'Copy Address'}
          </button>
        </div>
      </div>

      <h3 className="text-lg font-bold text-[#3A4A2D] mb-4 font-bambino">Recent Transactions</h3>
      <div className="bg-[#EFEAD9] border-2 border-[#D4CDB8] rounded-2xl p-4">
        {pendingTransactions.length === 0 ? (
          <div className="text-center text-[#8B9B7E] py-8 font-bambino">No recent transactions</div>
        ) : (
          <div className="space-y-2">
            {pendingTransactions.map((tx) => (
              <div key={tx.id} className={`flex items-center justify-between p-3 rounded-xl border-2 ${
                tx.status === 'confirmed' ? 'bg-[#5C8A4A]/10 border-[#5C8A4A]/30' :
                tx.status === 'failed' ? 'bg-[#C45A4A]/10 border-[#C45A4A]/30' :
                'bg-[#D4A060]/10 border-[#D4A060]/30'
              }`}>
                <div>
                  <div className="text-sm text-[#3A4A2D] font-bambino capitalize">{tx.type.replace('_', ' ')}</div>
                  <div className="text-xs text-[#8B9B7E] font-satoshi">{tx.amount.toFixed(4)} SOL</div>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                  tx.status === 'confirmed' ? 'bg-[#5C8A4A]/20 text-[#5C8A4A]' :
                  tx.status === 'failed' ? 'bg-[#C45A4A]/20 text-[#C45A4A]' :
                  'bg-[#D4A060]/20 text-[#D4A060]'
                }`}>
                  {tx.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AlertsPanel() {
  return (
    <div className="h-full bg-[#F5F0E1] p-6 overflow-y-auto">
      <h2 className="text-xl font-bold text-[#3A4A2D] mb-6 font-bambino">Alerts</h2>

      <div className="bg-[#EFEAD9] border-2 border-[#D4CDB8] rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-bold text-[#3A4A2D] mb-4 font-bambino">Create New Alert</h3>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-[#8B9B7E] uppercase tracking-wider block mb-2 font-satoshi">Market</label>
            <input
              type="text"
              placeholder="Search markets..."
              className="w-full bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-xl px-4 py-2 text-[#3A4A2D] placeholder:text-[#8B9B7E] focus:outline-none focus:border-[#6B7B5E] font-satoshi"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-[#8B9B7E] uppercase tracking-wider block mb-2 font-satoshi">Condition</label>
              <select className="w-full bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-xl px-4 py-2 text-[#3A4A2D] focus:outline-none focus:border-[#6B7B5E] font-satoshi">
                <option>Price above</option>
                <option>Price below</option>
                <option>Volume spike</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[#8B9B7E] uppercase tracking-wider block mb-2 font-satoshi">Value</label>
              <input
                type="number"
                placeholder="50"
                className="w-full bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-xl px-4 py-2 text-[#3A4A2D] placeholder:text-[#8B9B7E] focus:outline-none focus:border-[#6B7B5E] font-satoshi"
              />
            </div>
          </div>
          <button className="px-4 py-2 bg-[#5C8A4A] hover:bg-[#4A7A3A] text-white rounded-xl text-sm font-bold font-bambino transition-all">
            Create Alert
          </button>
        </div>
      </div>

      <h3 className="text-lg font-bold text-[#3A4A2D] mb-4 font-bambino">Active Alerts</h3>
      <div className="bg-[#EFEAD9] border-2 border-[#D4CDB8] rounded-2xl p-4">
        <div className="text-center text-[#8B9B7E] py-8 font-bambino">No active alerts</div>
      </div>
    </div>
  );
}

function BondsPanel() {
  const bonds = [
    { market: 'Will Bitcoin exist on Jan 1, 2026?', probability: 99.9, payout: '0.1%', liquidity: '$500K' },
    { market: 'Will the US hold elections in 2026?', probability: 99.8, payout: '0.2%', liquidity: '$320K' },
    { market: 'Will Google still exist by 2027?', probability: 99.7, payout: '0.3%', liquidity: '$180K' },
  ];

  return (
    <div className="h-full bg-[#F5F0E1] p-6 overflow-y-auto">
      <h2 className="text-xl font-bold text-[#3A4A2D] mb-2 font-bambino">Bonds</h2>
      <p className="text-[#8B9B7E] mb-6 font-satoshi">Near-certain outcomes with predictable payouts</p>

      <div className="bg-[#EFEAD9] border-2 border-[#D4CDB8] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-[#D4CDB8] bg-[#E8E2D0]">
              <th className="px-4 py-3 text-left text-[10px] text-[#6B7B5E] font-medium uppercase tracking-wider font-satoshi">Market</th>
              <th className="px-4 py-3 text-left text-[10px] text-[#6B7B5E] font-medium uppercase tracking-wider font-satoshi">Probability</th>
              <th className="px-4 py-3 text-left text-[10px] text-[#6B7B5E] font-medium uppercase tracking-wider font-satoshi">Expected Payout</th>
              <th className="px-4 py-3 text-left text-[10px] text-[#6B7B5E] font-medium uppercase tracking-wider font-satoshi">Liquidity</th>
            </tr>
          </thead>
          <tbody>
            {bonds.map((bond, idx) => (
              <tr key={idx} className="border-b border-[#D4CDB8] last:border-0 hover:bg-[#E8E2D0] cursor-pointer transition-colors">
                <td className="px-4 py-3 text-sm text-[#3A4A2D] font-bambino">{bond.market}</td>
                <td className="px-4 py-3 text-sm text-[#5C8A4A] font-bold font-satoshi">{bond.probability}%</td>
                <td className="px-4 py-3 text-sm text-[#5A6A4D] font-satoshi">{bond.payout}</td>
                <td className="px-4 py-3 text-sm text-[#5A6A4D] font-satoshi">{bond.liquidity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CalendarPanel() {
  const events = [
    { date: 'Jan 10', market: 'Wizards vs. 76ers', time: '7:00 PM ET' },
    { date: 'Jan 11', market: 'Celtics vs. Clippers', time: '8:30 PM ET' },
    { date: 'Jan 12', market: 'Cardinals vs. Rams', time: '4:25 PM ET' },
    { date: 'Jan 31', market: 'Bitcoin $85K dip deadline', time: '11:59 PM ET' },
    { date: 'Feb 9', market: 'Super Bowl 2026', time: '6:30 PM ET' },
  ];

  return (
    <div className="h-full bg-[#F5F0E1] p-6 overflow-y-auto">
      <h2 className="text-xl font-bold text-[#3A4A2D] mb-2 font-bambino">Calendar</h2>
      <p className="text-[#8B9B7E] mb-6 font-satoshi">Upcoming market resolutions</p>

      <div className="space-y-3">
        {events.map((event, idx) => (
          <div key={idx} className="flex items-center gap-4 p-4 bg-[#EFEAD9] border-2 border-[#D4CDB8] rounded-2xl hover:border-[#6B7B5E] cursor-pointer transition-colors">
            <div className="w-16 text-center bg-[#6B7B5E] rounded-xl py-2">
              <div className="text-[10px] text-[#E4D4B8] uppercase font-satoshi">{event.date.split(' ')[0]}</div>
              <div className="text-2xl font-bold text-white font-bambino">{event.date.split(' ')[1]}</div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-[#3A4A2D] font-bambino">{event.market}</h3>
              <p className="text-[10px] text-[#8B9B7E] font-satoshi">{event.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
