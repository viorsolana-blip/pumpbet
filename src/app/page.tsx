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
import { SettingsModal } from '@/components/modals/SettingsModal';
import { OnboardingModal } from '@/components/modals/OnboardingModal';
import { TutorialModal } from '@/components/modals/TutorialModal';
import { useStore, Tab } from '@/store';

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

  // Show tutorial on every page load
  useEffect(() => {
    setShowTutorial(true);
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
      color: '#ff0000',
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
      case 'new':
        return <NewTabPanel />;
      case 'traders':
        return <TradersPanel />;
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
    <div className="h-screen flex flex-col bg-[#050505]">
      <Header />

      {/* Full Screen Mode - when clicking from whale flow */}
      {fullScreenTabData ? (
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Full screen header with back button */}
          <div className="h-10 bg-[#050505] flex items-center border-b border-[#1a1a1a] px-2">
            <button
              onClick={returnToSplitView}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#ff0000] hover:bg-[#cc0000] rounded-lg transition-colors mr-3"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
              <span className="text-sm text-white font-medium">Back to Dashboard</span>
            </button>
            <button
              onClick={returnToSplitView}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#222] rounded-lg transition-colors"
            >
              <LayoutGrid className="w-4 h-4 text-[#888]" />
              <span className="text-sm text-[#888]">3-Panel View</span>
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: fullScreenTabData.color || '#ff0000' }} />
              <span className="text-sm text-white">{fullScreenTabData.title}</span>
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
                  className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize z-10 group hover:bg-[#ff0000] transition-colors"
                  onMouseDown={() => handleMouseDown(index - 1)}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-4 -translate-x-1/2" />
                </div>
              )}

              {/* Panel Tab Bar */}
              <div className={`h-8 bg-[#050505] flex items-center border-b border-[#1a1a1a] ${index > 0 ? 'border-l border-[#1a1a1a]' : ''}`}>
                <div className="flex items-center flex-1 min-w-0 px-2">
                  <div
                    className="w-2 h-2 rounded-full mr-2 flex-shrink-0"
                    style={{ backgroundColor: tab.color || '#ff0000' }}
                  />
                  <span className="text-xs text-white truncate">
                    {tab.title}
                  </span>
                </div>
              </div>

              {/* Panel Content */}
              <div className={`flex-1 overflow-hidden ${index > 0 ? 'border-l border-[#1a1a1a]' : ''}`}>
                {renderPanelContent(tab)}
              </div>
            </div>
          ))}
        </main>
      ) : (
        // Single panel view with tab bar
        <>
          <div className="h-10 bg-[#050505] flex items-center border-b border-[#1a1a1a]">
            <div className="flex items-center flex-1 overflow-x-auto">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`group flex items-center gap-2 px-3 py-2 border-r border-[#1a1a1a] cursor-pointer transition-all relative ${
                    tab.id === activeTabId
                      ? 'bg-[#0a0a0a]'
                      : 'bg-[#050505] hover:bg-[#0a0a0a]'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.id === activeTabId && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff0000]" />
                  )}
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: tab.color || '#ff0000' }}
                  />
                  <span className={`text-sm transition-colors max-w-[120px] truncate ${
                    tab.id === activeTabId ? 'text-white' : 'text-[#666] group-hover:text-[#888]'
                  }`}>
                    {tab.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTab(tab.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[#1a1a1a] rounded transition-all ml-1"
                  >
                    <X className="w-3 h-3 text-[#555] hover:text-[#ff0000]" />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddTab}
                className="p-2 hover:bg-[#141414] rounded-lg transition-colors ml-1"
              >
                <Plus className="w-4 h-4 text-[#444] hover:text-[#ff0000]" />
              </button>
            </div>

            <div className="flex items-center gap-0.5 px-2 border-l border-[#1a1a1a]">
              <button
                onClick={() => setSplitView(true)}
                className="p-1.5 hover:bg-[#141414] rounded-lg transition-colors"
                title="Split view"
              >
                <Columns className="w-4 h-4 text-[#444] hover:text-white" />
              </button>
              <button className="p-1.5 hover:bg-[#141414] rounded-lg transition-colors">
                <Square className="w-4 h-4 text-[#444] hover:text-white" />
              </button>
              <button className="p-1.5 hover:bg-[#141414] rounded-lg transition-colors">
                <MessageSquare className="w-4 h-4 text-[#444] hover:text-white" />
              </button>
              <button className="p-1.5 hover:bg-[#141414] rounded-lg transition-colors">
                <MoreHorizontal className="w-4 h-4 text-[#444] hover:text-white" />
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

// Placeholder panels for features not yet fully implemented
function TradersPanel() {
  const traders = [
    { rank: 1, name: 'TrumpWin123', score: 95, pnl: '+$36K', volume: '$211K', winRate: '68%' },
    { rank: 2, name: 'CryptoWhale', score: 92, pnl: '+$28K', volume: '$185K', winRate: '72%' },
    { rank: 3, name: 'SportsBetter', score: 89, pnl: '+$22K', volume: '$142K', winRate: '65%' },
    { rank: 4, name: 'PoliticalPundit', score: 87, pnl: '+$18K', volume: '$98K', winRate: '71%' },
    { rank: 5, name: 'AITrader', score: 85, pnl: '+$15K', volume: '$76K', winRate: '69%' },
    { rank: 6, name: 'MarketMaker01', score: 83, pnl: '+$12K', volume: '$65K', winRate: '63%' },
    { rank: 7, name: 'DegenGambler', score: 81, pnl: '+$10K', volume: '$54K', winRate: '58%' },
    { rank: 8, name: 'ValueHunter', score: 79, pnl: '+$8K', volume: '$43K', winRate: '66%' },
  ];

  return (
    <div className="h-full bg-[#050505] p-6 animate-fade-in">
      {/* Texture bar */}
      <div
        className="absolute top-0 left-0 right-0 h-3 animate-texture-scroll"
        style={{
          backgroundImage: 'url(/brand/pixel-texture.jpeg)',
          backgroundSize: '200% 100%',
          backgroundRepeat: 'repeat-x',
        }}
      />
      <h2 className="text-xl font-semibold text-white mb-6">Top Traders</h2>
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1a1a1a]">
              <th className="px-4 py-3 text-left text-[10px] text-[#555] font-medium uppercase tracking-wider">Rank</th>
              <th className="px-4 py-3 text-left text-[10px] text-[#555] font-medium uppercase tracking-wider">Trader</th>
              <th className="px-4 py-3 text-left text-[10px] text-[#555] font-medium uppercase tracking-wider">Score</th>
              <th className="px-4 py-3 text-left text-[10px] text-[#555] font-medium uppercase tracking-wider">P&L</th>
              <th className="px-4 py-3 text-left text-[10px] text-[#555] font-medium uppercase tracking-wider">Volume</th>
              <th className="px-4 py-3 text-left text-[10px] text-[#555] font-medium uppercase tracking-wider">Win Rate</th>
            </tr>
          </thead>
          <tbody>
            {traders.map((trader, idx) => (
              <tr
                key={trader.rank}
                className="border-b border-[#1a1a1a] last:border-0 hover:bg-[#0f0f0f] cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <td className="px-4 py-3 text-sm text-[#555]">{trader.rank}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#22c55e] flex items-center justify-center">
                      <span className="text-xs text-white font-medium">{trader.name.charAt(0)}</span>
                    </div>
                    <span className="text-sm text-white">{trader.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-white">{trader.score}</td>
                <td className="px-4 py-3 text-sm text-[#22c55e]">{trader.pnl}</td>
                <td className="px-4 py-3 text-sm text-[#666]">{trader.volume}</td>
                <td className="px-4 py-3 text-sm text-[#666]">{trader.winRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PortfolioPanel() {
  const positions = [
    { market: 'Los Angeles R - Super Bowl', outcome: 'Yes', shares: 150, avgPrice: 15.2, currentPrice: 17.8, pnl: '+$3.90' },
    { market: 'Bitcoin Up/Down', outcome: 'Down', shares: 500, avgPrice: 85, currentPrice: 91, pnl: '+$30.00' },
    { market: 'Will China invade Taiwan?', outcome: 'No', shares: 200, avgPrice: 86, currentPrice: 88.3, pnl: '+$4.60' },
  ];

  return (
    <div className="h-full bg-[#050505] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Portfolio</h2>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] text-[#555] uppercase tracking-wider">Total Value</div>
            <div className="text-lg font-semibold text-white">$1,247.50</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[#555] uppercase tracking-wider">Total P&L</div>
            <div className="text-lg font-semibold text-[#22c55e]">+$127.35</div>
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1a1a1a]">
              <th className="px-4 py-3 text-left text-[10px] text-[#555] font-medium uppercase tracking-wider">Market</th>
              <th className="px-4 py-3 text-left text-[10px] text-[#555] font-medium uppercase tracking-wider">Position</th>
              <th className="px-4 py-3 text-left text-[10px] text-[#555] font-medium uppercase tracking-wider">Shares</th>
              <th className="px-4 py-3 text-left text-[10px] text-[#555] font-medium uppercase tracking-wider">Avg Price</th>
              <th className="px-4 py-3 text-left text-[10px] text-[#555] font-medium uppercase tracking-wider">Current</th>
              <th className="px-4 py-3 text-left text-[10px] text-[#555] font-medium uppercase tracking-wider">P&L</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos, idx) => (
              <tr key={idx} className="border-b border-[#1a1a1a] last:border-0 hover:bg-[#0f0f0f] cursor-pointer">
                <td className="px-4 py-3 text-sm text-white">{pos.market}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] ${pos.outcome === 'Yes' ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#3b82f6]/10 text-[#3b82f6]'}`}>
                    {pos.outcome}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[#666]">{pos.shares}</td>
                <td className="px-4 py-3 text-sm text-[#666]">{pos.avgPrice}¢</td>
                <td className="px-4 py-3 text-sm text-white">{pos.currentPrice}¢</td>
                <td className="px-4 py-3 text-sm text-[#22c55e]">{pos.pnl}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WalletPanel() {
  const { balance, walletAddress } = useStore();

  return (
    <div className="h-full bg-[#050505] p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Wallet</h2>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-6">
          <div className="text-[10px] text-[#555] uppercase tracking-wider mb-2">Available Balance</div>
          <div className="text-3xl font-bold text-white">${balance.toFixed(2)}</div>
          <div className="flex items-center gap-2 mt-4">
            <button className="px-4 py-2 bg-[#22c55e] text-white rounded-lg text-sm font-medium hover:bg-[#16a34a]">
              Deposit
            </button>
            <button className="px-4 py-2 bg-[#0f0f0f] border border-[#1a1a1a] text-white rounded-lg text-sm font-medium hover:bg-[#141414]">
              Withdraw
            </button>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-6">
          <div className="text-[10px] text-[#555] uppercase tracking-wider mb-2">Wallet Address</div>
          <div className="font-mono text-white break-all">{walletAddress}</div>
          <button className="mt-4 text-sm text-[#22c55e] hover:underline">Copy Address</button>
        </div>
      </div>

      <h3 className="text-lg font-medium text-white mb-4">Recent Transactions</h3>
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4">
        <div className="text-center text-[#555] py-8">No recent transactions</div>
      </div>
    </div>
  );
}

function AlertsPanel() {
  return (
    <div className="h-full bg-[#050505] p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Alerts</h2>

      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-6 mb-6">
        <h3 className="text-sm font-medium text-white mb-4">Create New Alert</h3>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-[#555] uppercase tracking-wider block mb-2">Market</label>
            <input
              type="text"
              placeholder="Search markets..."
              className="w-full bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg px-4 py-2 text-white placeholder:text-[#444] focus:outline-none focus:border-[#242424]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-[#555] uppercase tracking-wider block mb-2">Condition</label>
              <select className="w-full bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg px-4 py-2 text-white focus:outline-none">
                <option>Price above</option>
                <option>Price below</option>
                <option>Volume spike</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[#555] uppercase tracking-wider block mb-2">Value</label>
              <input
                type="number"
                placeholder="50"
                className="w-full bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg px-4 py-2 text-white placeholder:text-[#444] focus:outline-none"
              />
            </div>
          </div>
          <button className="px-4 py-2 bg-[#22c55e] text-white rounded-lg text-sm font-medium hover:bg-[#16a34a]">
            Create Alert
          </button>
        </div>
      </div>

      <h3 className="text-lg font-medium text-white mb-4">Active Alerts</h3>
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4">
        <div className="text-center text-[#555] py-8">No active alerts</div>
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
    <div className="h-full bg-[#050505] p-6">
      <h2 className="text-xl font-semibold text-white mb-2">Bonds</h2>
      <p className="text-[#555] mb-6">Near-certain outcomes with predictable payouts</p>

      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1a1a1a]">
              <th className="px-4 py-3 text-left text-[10px] text-[#555] font-medium uppercase tracking-wider">Market</th>
              <th className="px-4 py-3 text-left text-[10px] text-[#555] font-medium uppercase tracking-wider">Probability</th>
              <th className="px-4 py-3 text-left text-[10px] text-[#555] font-medium uppercase tracking-wider">Expected Payout</th>
              <th className="px-4 py-3 text-left text-[10px] text-[#555] font-medium uppercase tracking-wider">Liquidity</th>
            </tr>
          </thead>
          <tbody>
            {bonds.map((bond, idx) => (
              <tr key={idx} className="border-b border-[#1a1a1a] last:border-0 hover:bg-[#0f0f0f] cursor-pointer">
                <td className="px-4 py-3 text-sm text-white">{bond.market}</td>
                <td className="px-4 py-3 text-sm text-[#22c55e]">{bond.probability}%</td>
                <td className="px-4 py-3 text-sm text-[#666]">{bond.payout}</td>
                <td className="px-4 py-3 text-sm text-[#666]">{bond.liquidity}</td>
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
    <div className="h-full bg-[#050505] p-6">
      <h2 className="text-xl font-semibold text-white mb-2">Calendar</h2>
      <p className="text-[#555] mb-6">Upcoming market resolutions</p>

      <div className="space-y-3">
        {events.map((event, idx) => (
          <div key={idx} className="flex items-center gap-4 p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg hover:border-[#242424] cursor-pointer transition-colors">
            <div className="w-16 text-center">
              <div className="text-[10px] text-[#555] uppercase">{event.date.split(' ')[0]}</div>
              <div className="text-2xl font-bold text-white">{event.date.split(' ')[1]}</div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-white">{event.market}</h3>
              <p className="text-[10px] text-[#555]">{event.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
