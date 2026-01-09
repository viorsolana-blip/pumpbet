'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ChevronDown, ExternalLink, Sparkles, RefreshCw, X, Zap, TrendingUp, TrendingDown, Pause, Play, Maximize2 } from 'lucide-react';
import { useStore, FlowTrade, Market } from '@/store';
import { generateSingleFlowTrade } from '@/lib/api/markets';
import { PolymarketLogo, NFLLogo, NBALogo, BitcoinLogo, EthereumLogo, SolanaLogo, SportsLogo } from '@/components/icons/Logos';

interface FlowPanelProps {
  onMarketClick?: (market: Market) => void;
}

export function FlowPanel({ onMarketClick }: FlowPanelProps) {
  const { flowTrades, flowFilters, setFlowFilter, addFlowTrade, markets } = useStore();
  const [sortBy, setSortBy] = useState<'recent' | 'size' | 'multiplier'>('recent');
  const [isLive, setIsLive] = useState(true);
  const [newTradeIds, setNewTradeIds] = useState<Set<string>>(new Set());
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [tradesCount, setTradesCount] = useState(0);

  // Generate new trades periodically when live
  useEffect(() => {
    if (!isLive || markets.length === 0) return;

    // Add a new trade every 3-8 seconds randomly
    const addNewTrade = () => {
      const trade = generateSingleFlowTrade(markets);
      if (trade) {
        addFlowTrade(trade);
        setNewTradeIds(prev => {
          const updated = new Set(prev);
          updated.add(trade.id);
          return updated;
        });
        setLastRefresh(new Date());
        setTradesCount(prev => prev + 1);

        // Remove the "new" highlight after 5 seconds
        setTimeout(() => {
          setNewTradeIds(prev => {
            const updated = new Set(prev);
            updated.delete(trade.id);
            return updated;
          });
        }, 5000);
      }
    };

    // Initial trade after 1 second
    const initialTimeout = setTimeout(addNewTrade, 1000);

    // Then add trades at random intervals
    const interval = setInterval(() => {
      addNewTrade();
    }, Math.random() * 5000 + 3000); // 3-8 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isLive, markets, addFlowTrade]);

  const filteredTrades = flowTrades.filter((trade) => {
    if (trade.size < flowFilters.minSize) return false;
    if (trade.price < flowFilters.priceMin || trade.price > flowFilters.priceMax) return false;
    if (flowFilters.side !== 'all' && trade.side !== flowFilters.side) return false;
    if (flowFilters.outcome !== 'all') {
      const isYes = trade.outcome === 'Y' || trade.outcome === 'yes';
      if (flowFilters.outcome === 'yes' && !isYes) return false;
      if (flowFilters.outcome === 'no' && isYes) return false;
    }
    if (flowFilters.newWalletsOnly && !trade.isNew) return false;
    return true;
  });

  const sortedTrades = [...filteredTrades].sort((a, b) => {
    if (sortBy === 'recent') return b.time.getTime() - a.time.getTime();
    if (sortBy === 'size') return b.size - a.size;
    if (sortBy === 'multiplier') return b.multiplier - a.multiplier;
    return 0;
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getTimeSinceRefresh = () => {
    const diff = Math.floor((new Date().getTime() - lastRefresh.getTime()) / 1000);
    return `${diff}s`;
  };

  // Update display every second
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Animated texture accent bar */}
      <div
        className="w-full h-3 flex-shrink-0 animate-texture-scroll"
        style={{
          backgroundImage: 'url(/brand/pixel-texture.jpeg)',
          backgroundSize: '200% 100%',
          backgroundRepeat: 'repeat-x',
        }}
      />

      {/* Header Title */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1a]">
        <Zap className="w-4 h-4 text-white" />
        <span className="text-sm font-medium text-white">Whale Flow</span>
        {isLive ? (
          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-[#22c55e] text-white text-[8px] font-semibold rounded uppercase">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </span>
        ) : (
          <span className="px-2 py-0.5 bg-[#333] text-[#888] text-[8px] font-semibold rounded uppercase">PAUSED</span>
        )}
        <span className="text-[10px] text-[#444] ml-1">{tradesCount} trades today</span>
        <div className="flex-1" />
        <Image
          src="/brand/icon.png"
          alt=""
          width={16}
          height={16}
          className="opacity-30"
        />
      </div>

      {/* Filters Header */}
      <div className="p-3 border-b border-[#1a1a1a] space-y-3">
        {/* Size and Price Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#555] uppercase tracking-wider">SIZE</span>
            <span className="text-[#555]">$</span>
            <input
              type="number"
              value={flowFilters.minSize}
              onChange={(e) => setFlowFilter('minSize', Number(e.target.value))}
              className="w-20 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-[#333]"
            />
            <button
              onClick={() => setFlowFilter('minSize', 0)}
              className="text-[#555] hover:text-white p-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#555] uppercase tracking-wider">PRICE</span>
            <input
              type="number"
              value={flowFilters.priceMin}
              onChange={(e) => setFlowFilter('priceMin', Number(e.target.value))}
              className="w-12 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-2 py-1 text-sm text-white text-center focus:outline-none focus:border-[#333]"
            />
            <span className="text-[#444]">—</span>
            <input
              type="number"
              value={flowFilters.priceMax}
              onChange={(e) => setFlowFilter('priceMax', Number(e.target.value))}
              className="w-12 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-2 py-1 text-sm text-white text-center focus:outline-none focus:border-[#333]"
            />
            <button
              onClick={() => { setFlowFilter('priceMin', 1); setFlowFilter('priceMax', 99); }}
              className="text-[#555] hover:text-white p-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#555] uppercase tracking-wider">SORT</span>
            <button
              onClick={() => setSortBy(sortBy === 'recent' ? 'size' : sortBy === 'size' ? 'multiplier' : 'recent')}
              className="flex items-center gap-1 px-3 py-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-sm text-[#888] hover:border-[#333] transition-colors"
            >
              {sortBy === 'recent' ? 'Recent' : sortBy === 'size' ? 'Size' : 'Multiplier'} <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Side and Outcome Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* All/Buy/Sell */}
            <div className="flex items-center bg-[#0a0a0a] rounded-lg p-0.5 border border-[#1a1a1a]">
              {['all', 'buy', 'sell'].map((side) => (
                <button
                  key={side}
                  onClick={() => setFlowFilter('side', side)}
                  className={`px-3 py-1 rounded text-xs uppercase transition-all duration-200 ${
                    flowFilters.side === side
                      ? 'bg-[#141414] text-white'
                      : 'text-[#555] hover:text-[#888]'
                  }`}
                >
                  {side === 'all' ? 'ALL' : side.toUpperCase()}
                </button>
              ))}
            </div>

            {/* All/Yes/No */}
            <div className="flex items-center bg-[#0a0a0a] rounded-lg p-0.5 border border-[#1a1a1a]">
              {['all', 'yes', 'no'].map((outcome) => (
                <button
                  key={outcome}
                  onClick={() => setFlowFilter('outcome', outcome)}
                  className={`px-3 py-1 rounded text-xs uppercase transition-all duration-200 ${
                    flowFilters.outcome === outcome
                      ? 'bg-[#141414] text-white'
                      : 'text-[#555] hover:text-[#888]'
                  }`}
                >
                  {outcome === 'all' ? 'ALL' : outcome.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* New Wallets Toggle */}
            <button
              onClick={() => setFlowFilter('newWalletsOnly', !flowFilters.newWalletsOnly)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                flowFilters.newWalletsOnly
                  ? 'bg-white text-black'
                  : 'bg-[#0a0a0a] text-[#666] border border-[#1a1a1a] hover:text-[#888]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              New Wallets
            </button>

            <span className="text-[10px] text-[#444]">{getTimeSinceRefresh()}</span>
            <button
              onClick={() => setIsLive(!isLive)}
              className={`p-1.5 rounded transition-all duration-200 ${
                isLive ? 'hover:bg-[#141414] text-[#22c55e]' : 'hover:bg-[#141414] text-[#555]'
              }`}
            >
              {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-6 gap-4 px-4 py-2 border-b border-[#1a1a1a] text-[10px] text-[#555] uppercase tracking-wider">
        <span>TIME</span>
        <span>MARKET</span>
        <span>SIDE</span>
        <span>SIZE</span>
        <span>ENTRY</span>
        <span>WALLET</span>
      </div>

      {/* Trades List */}
      <div className="flex-1 overflow-y-auto">
        {sortedTrades.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#444]">
            <Zap className="w-8 h-8 mb-2" />
            <span className="text-sm">Waiting for whale trades...</span>
            {isLive && <span className="text-xs mt-1 animate-pulse">Streaming live data</span>}
          </div>
        ) : (
          sortedTrades.map((trade, idx) => (
            <FlowTradeRow
              key={trade.id}
              trade={trade}
              formatTime={formatTime}
              isNewlyAdded={newTradeIds.has(trade.id)}
              animationDelay={idx * 50}
              onMarketClick={onMarketClick}
            />
          ))
        )}
      </div>
    </div>
  );
}

function FlowTradeRow({
  trade,
  formatTime,
  isNewlyAdded,
  animationDelay,
  onMarketClick,
}: {
  trade: FlowTrade;
  formatTime: (date: Date) => string;
  isNewlyAdded?: boolean;
  animationDelay?: number;
  onMarketClick?: (market: Market) => void;
}) {
  const { addTab, markets, setSelectedMarket } = useStore();

  const openMarket = () => {
    const market = markets.find((m) => m.id === trade.marketId);
    if (market) {
      if (onMarketClick) {
        // Open in full screen mode
        onMarketClick(market);
      } else {
        // Fallback to regular tab
        setSelectedMarket(market);
        addTab({
          type: 'event',
          title: market.title.length > 20 ? market.title.slice(0, 20) + '...' : market.title,
          eventId: market.id,
          color: '#666',
        });
      }
    }
  };

  const getOutcomeColor = (outcome: string) => {
    if (['Y', 'yes', 'Up', 'O'].includes(outcome)) return 'bg-[#22c55e]';
    if (['N', 'no', 'Down', 'U'].includes(outcome)) return 'bg-[#3b82f6]';
    return 'bg-[#666]';
  };

  // Determine if this is a mega trade
  const isMegaTrade = trade.size >= 100000;
  const isLargeTrade = trade.size >= 50000;

  // Determine which logo to show based on market
  const getMarketLogo = () => {
    const title = trade.marketTitle.toLowerCase();

    // Crypto markets
    if (title.includes('bitcoin') || title.includes('btc')) {
      return <BitcoinLogo className="w-6 h-6" />;
    }
    if (title.includes('ethereum') || title.includes('eth')) {
      return <EthereumLogo className="w-6 h-6" />;
    }
    if (title.includes('solana') || title.includes('sol')) {
      return <SolanaLogo className="w-6 h-6" />;
    }

    // Sports markets
    if (title.includes('vs.') || title.includes('spread') || title.includes('game')) {
      if (title.includes('celtics') || title.includes('76ers') || title.includes('warriors') ||
          title.includes('lakers') || title.includes('nets') || title.includes('bucks')) {
        return <NBALogo className="w-6 h-6" />;
      }
      if (title.includes('chiefs') || title.includes('eagles') || title.includes('cowboys') ||
          title.includes('super bowl') || title.includes('cardinals') || title.includes('rams')) {
        return <NFLLogo className="w-6 h-6" />;
      }
      return <SportsLogo className="w-6 h-6" />;
    }

    // Default to Polymarket
    return <PolymarketLogo className="w-6 h-6" />;
  };

  const formatSize = (size: number) => {
    if (size >= 1000000) return `$${(size / 1000000).toFixed(1)}M`;
    if (size >= 1000) return `$${(size / 1000).toFixed(1)}K`;
    return `$${size}`;
  };

  return (
    <div
      onClick={openMarket}
      className={`
        grid grid-cols-6 gap-4 px-4 py-3 border-b border-[#1a1a1a]
        hover:bg-[#0a0a0a] cursor-pointer transition-all duration-300 hover:pl-5
        ${isNewlyAdded ? 'animate-slide-in-left bg-[#0f1a0f] border-l-2 border-l-[#22c55e]' : ''}
        ${isMegaTrade ? 'bg-[#1a1510]' : ''}
      `}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Time */}
      <div className="flex items-center gap-2">
        <span className={`text-sm ${isNewlyAdded ? 'text-white' : 'text-[#666]'}`}>
          {formatTime(trade.time)}
        </span>
        {trade.isNew && (
          <span className="bg-white text-black text-[9px] px-1.5 py-0.5 rounded font-medium animate-pulse">NEW</span>
        )}
      </div>

      {/* Market */}
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg bg-[#0f0f0f] flex items-center justify-center flex-shrink-0 ${isNewlyAdded ? 'ring-1 ring-[#22c55e]/30' : ''}`}>
          {getMarketLogo()}
        </div>
        <span className={`text-sm truncate ${isNewlyAdded ? 'text-white font-medium' : 'text-white'}`}>
          {trade.marketTitle}
        </span>
      </div>

      {/* Side */}
      <div className="flex items-center gap-1">
        <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-medium ${
          trade.side === 'buy' ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#ef4444]/20 text-[#ef4444]'
        }`}>
          {trade.side === 'buy' ? 'B' : 'S'}
        </span>
        <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-medium ${getOutcomeColor(trade.outcome)}/20 text-white`}>
          {trade.outcome}
        </span>
        {trade.side === 'buy' ? (
          <TrendingUp className="w-3 h-3 text-[#22c55e]" />
        ) : (
          <TrendingDown className="w-3 h-3 text-[#ef4444]" />
        )}
      </div>

      {/* Size */}
      <div className={`text-sm font-medium ${
        isMegaTrade ? 'text-[#f59e0b]' : isLargeTrade ? 'text-white' : 'text-white'
      }`}>
        <span className={isMegaTrade ? 'animate-pulse' : ''}>
          {formatSize(trade.size)}
        </span>
        {isMegaTrade && <span className="ml-1 text-[9px] text-[#f59e0b]">MEGA</span>}
      </div>

      {/* Entry */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-white">{trade.price.toFixed(1)}¢</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
          trade.multiplier >= 2 ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#0f0f0f] text-[#555]'
        }`}>
          {trade.multiplier.toFixed(1)}x
        </span>
      </div>

      {/* Wallet */}
      <div className="flex items-center gap-1">
        <span className="text-sm text-[#666] font-mono">{trade.wallet}</span>
        <ExternalLink className="w-3 h-3 text-[#444]" />
      </div>
    </div>
  );
}
