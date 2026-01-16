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
    <div className="flex flex-col h-full bg-[#F5F0E1]">
      {/* Decorative top stripe */}
      <div className="w-full h-2 flex-shrink-0 bg-gradient-to-r from-[#6B7B5E] via-[#8B7355] to-[#6B7B5E]" />

      {/* Header Title */}
      <div className="flex items-center gap-2 px-4 py-3 border-b-2 border-[#E8E2D0]">
        <Zap className="w-4 h-4 text-[#5A6A4D]" />
        <span className="text-sm font-bambino font-bold text-[#3A4A2D]">Whale Flow</span>
        {isLive ? (
          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-[#5C8A4A] text-[#F5F0E1] text-[8px] font-bambino font-bold rounded-lg uppercase">
            <span className="w-1.5 h-1.5 bg-[#F5F0E1] rounded-full animate-pulse" />
            LIVE
          </span>
        ) : (
          <span className="px-2 py-0.5 bg-[#D4CDB8] text-[#6B7B5E] text-[8px] font-bambino font-bold rounded-lg uppercase">PAUSED</span>
        )}
        <span className="text-[10px] text-[#8B9B7E] ml-1 font-bambino">{tradesCount} trades today</span>
        <div className="flex-1" />
        <Image
          src="/brand/helmet-logo.png"
          alt=""
          width={16}
          height={16}
          className="opacity-40"
        />
      </div>

      {/* Filters Header */}
      <div className="p-3 border-b-2 border-[#E8E2D0] space-y-3 bg-[#EFEAD9]">
        {/* Size and Price Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#8B9B7E] uppercase tracking-wider font-bambino font-bold">SIZE</span>
            <span className="text-[#8B9B7E]">$</span>
            <input
              type="number"
              value={flowFilters.minSize}
              onChange={(e) => setFlowFilter('minSize', Number(e.target.value))}
              className="w-20 bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-xl px-2 py-1 text-sm text-[#3A4A2D] focus:outline-none focus:border-[#6B7B5E] font-satoshi"
            />
            <button
              onClick={() => setFlowFilter('minSize', 0)}
              className="text-[#8B9B7E] hover:text-[#C45A4A] p-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#8B9B7E] uppercase tracking-wider font-bambino font-bold">PRICE</span>
            <input
              type="number"
              value={flowFilters.priceMin}
              onChange={(e) => setFlowFilter('priceMin', Number(e.target.value))}
              className="w-12 bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-xl px-2 py-1 text-sm text-[#3A4A2D] text-center focus:outline-none focus:border-[#6B7B5E] font-satoshi"
            />
            <span className="text-[#8B9B7E]">—</span>
            <input
              type="number"
              value={flowFilters.priceMax}
              onChange={(e) => setFlowFilter('priceMax', Number(e.target.value))}
              className="w-12 bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-xl px-2 py-1 text-sm text-[#3A4A2D] text-center focus:outline-none focus:border-[#6B7B5E] font-satoshi"
            />
            <button
              onClick={() => { setFlowFilter('priceMin', 1); setFlowFilter('priceMax', 99); }}
              className="text-[#8B9B7E] hover:text-[#C45A4A] p-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#8B9B7E] uppercase tracking-wider font-bambino font-bold">SORT</span>
            <button
              onClick={() => setSortBy(sortBy === 'recent' ? 'size' : sortBy === 'size' ? 'multiplier' : 'recent')}
              className="flex items-center gap-1 px-3 py-1 bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-xl text-sm text-[#6B7B5E] hover:border-[#6B7B5E] transition-colors font-bambino"
            >
              {sortBy === 'recent' ? 'Recent' : sortBy === 'size' ? 'Size' : 'Multiplier'} <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Side and Outcome Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* All/Buy/Sell */}
            <div className="flex items-center bg-[#F5F0E1] rounded-xl p-0.5 border-2 border-[#D4CDB8]">
              {['all', 'buy', 'sell'].map((side) => (
                <button
                  key={side}
                  onClick={() => setFlowFilter('side', side)}
                  className={`px-3 py-1 rounded-lg text-xs uppercase transition-all duration-200 font-bambino font-bold ${
                    flowFilters.side === side
                      ? 'bg-[#6B7B5E] text-[#F5F0E1]'
                      : 'text-[#8B9B7E] hover:text-[#5A6A4D]'
                  }`}
                >
                  {side === 'all' ? 'ALL' : side.toUpperCase()}
                </button>
              ))}
            </div>

            {/* All/Yes/No */}
            <div className="flex items-center bg-[#F5F0E1] rounded-xl p-0.5 border-2 border-[#D4CDB8]">
              {['all', 'yes', 'no'].map((outcome) => (
                <button
                  key={outcome}
                  onClick={() => setFlowFilter('outcome', outcome)}
                  className={`px-3 py-1 rounded-lg text-xs uppercase transition-all duration-200 font-bambino font-bold ${
                    flowFilters.outcome === outcome
                      ? 'bg-[#6B7B5E] text-[#F5F0E1]'
                      : 'text-[#8B9B7E] hover:text-[#5A6A4D]'
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
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-all duration-200 font-bambino font-bold ${
                flowFilters.newWalletsOnly
                  ? 'bg-[#6B7B5E] text-[#F5F0E1]'
                  : 'bg-[#F5F0E1] text-[#6B7B5E] border-2 border-[#D4CDB8] hover:border-[#6B7B5E]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              New Wallets
            </button>

            <span className="text-[10px] text-[#8B9B7E] font-bambino">{getTimeSinceRefresh()}</span>
            <button
              onClick={() => setIsLive(!isLive)}
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                isLive ? 'hover:bg-[#F5F0E1] text-[#5C8A4A]' : 'hover:bg-[#F5F0E1] text-[#8B9B7E]'
              }`}
            >
              {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-6 gap-4 px-4 py-2 border-b-2 border-[#E8E2D0] text-[10px] text-[#8B9B7E] uppercase tracking-wider font-bambino font-bold bg-[#EFEAD9]">
        <span>TIME</span>
        <span>MARKET</span>
        <span>SIDE</span>
        <span>SIZE</span>
        <span>ENTRY</span>
        <span>WALLET</span>
      </div>

      {/* Trades List */}
      <div className="flex-1 overflow-y-auto bg-[#EFEAD9]">
        {sortedTrades.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#8B9B7E]">
            <Zap className="w-8 h-8 mb-2" />
            <span className="text-sm font-bambino">Waiting for whale trades...</span>
            {isLive && <span className="text-xs mt-1 animate-pulse font-bambino">Streaming live data</span>}
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
    if (['Y', 'yes', 'Up', 'O'].includes(outcome)) return 'bg-[#5C8A4A]';
    if (['N', 'no', 'Down', 'U'].includes(outcome)) return 'bg-[#5A7A9A]';
    return 'bg-[#8B9B7E]';
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
        grid grid-cols-6 gap-4 px-4 py-3 border-b-2 border-[#E8E2D0]
        hover:bg-[#F5F0E1] cursor-pointer transition-all duration-300 hover:pl-5
        ${isNewlyAdded ? 'animate-slide-in-left bg-[#5C8A4A]/10 border-l-4 border-l-[#5C8A4A]' : ''}
        ${isMegaTrade ? 'bg-[#8B7355]/10' : ''}
      `}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Time */}
      <div className="flex items-center gap-2">
        <span className={`text-sm font-satoshi ${isNewlyAdded ? 'text-[#3A4A2D]' : 'text-[#6B7B5E]'}`}>
          {formatTime(trade.time)}
        </span>
        {trade.isNew && (
          <span className="bg-[#6B7B5E] text-[#F5F0E1] text-[9px] px-1.5 py-0.5 rounded-lg font-bambino font-bold animate-pulse">NEW</span>
        )}
      </div>

      {/* Market */}
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-xl bg-[#F5F0E1] border-2 border-[#D4CDB8] flex items-center justify-center flex-shrink-0 ${isNewlyAdded ? 'ring-2 ring-[#5C8A4A]/30' : ''}`}>
          {getMarketLogo()}
        </div>
        <span className={`text-sm truncate font-bambino ${isNewlyAdded ? 'text-[#3A4A2D] font-bold' : 'text-[#3A4A2D]'}`}>
          {trade.marketTitle}
        </span>
      </div>

      {/* Side */}
      <div className="flex items-center gap-1">
        <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bambino font-bold ${
          trade.side === 'buy' ? 'bg-[#5C8A4A]/20 text-[#5C8A4A]' : 'bg-[#C45A4A]/20 text-[#C45A4A]'
        }`}>
          {trade.side === 'buy' ? 'B' : 'S'}
        </span>
        <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bambino font-bold ${getOutcomeColor(trade.outcome)}/20 text-[#F5F0E1]`}>
          {trade.outcome}
        </span>
        {trade.side === 'buy' ? (
          <TrendingUp className="w-3 h-3 text-[#5C8A4A]" />
        ) : (
          <TrendingDown className="w-3 h-3 text-[#C45A4A]" />
        )}
      </div>

      {/* Size */}
      <div className={`text-sm font-satoshi font-bold ${
        isMegaTrade ? 'text-[#8B7355]' : isLargeTrade ? 'text-[#3A4A2D]' : 'text-[#3A4A2D]'
      }`}>
        <span className={isMegaTrade ? 'animate-pulse' : ''}>
          {formatSize(trade.size)}
        </span>
        {isMegaTrade && <span className="ml-1 text-[9px] text-[#8B7355] font-bambino">MEGA</span>}
      </div>

      {/* Entry */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#3A4A2D] font-satoshi">{trade.price.toFixed(1)}¢</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-lg font-bambino font-bold ${
          trade.multiplier >= 2 ? 'bg-[#5C8A4A]/10 text-[#5C8A4A]' : 'bg-[#EFEAD9] text-[#8B9B7E]'
        }`}>
          {trade.multiplier.toFixed(1)}x
        </span>
      </div>

      {/* Wallet */}
      <div className="flex items-center gap-1">
        <span className="text-sm text-[#6B7B5E] font-mono">{trade.wallet}</span>
        <ExternalLink className="w-3 h-3 text-[#8B9B7E]" />
      </div>
    </div>
  );
}
