'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Search, Grid, List, Star, Filter, RefreshCw, ChevronDown, ArrowUpRight, Loader2, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { useStore, Market } from '@/store';
import { PolymarketLogo, KalshiLogo } from '@/components/icons/Logos';

const categories = ['All', 'Crypto', 'Sports', 'Politics', 'Tech'];

export function MarketsPanel() {
  const { markets, marketsLoading, addTab, setSelectedMarket, fetchMarkets, searchMarkets } = useStore();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'polymarket' | 'kalshi'>('all');
  const [sortBy, setSortBy] = useState<'volume' | 'recent' | 'price'>('volume');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [newMarketIds, setNewMarketIds] = useState<Set<string>>(new Set());
  const [priceUpdates, setPriceUpdates] = useState<Map<string, 'up' | 'down'>>(new Map());
  const [isLive, setIsLive] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  const previousMarketsRef = useRef<Market[]>([]);

  // Fetch markets on mount
  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  // Auto-refresh every 8 seconds when live
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      fetchMarkets();
      setLastRefresh(new Date());
      setRefreshCount(prev => prev + 1);
    }, 8000);

    return () => clearInterval(interval);
  }, [isLive, fetchMarkets]);

  // Detect new markets and price changes
  useEffect(() => {
    if (previousMarketsRef.current.length > 0) {
      const prevIds = new Set(previousMarketsRef.current.map(m => m.id));
      const newIds = markets.filter(m => !prevIds.has(m.id)).map(m => m.id);

      if (newIds.length > 0) {
        setNewMarketIds(new Set(newIds));
        // Clear new badge after 5 seconds
        setTimeout(() => {
          setNewMarketIds(new Set());
        }, 5000);
      }

      // Detect price changes
      const updates = new Map<string, 'up' | 'down'>();
      markets.forEach(market => {
        const prevMarket = previousMarketsRef.current.find(m => m.id === market.id);
        if (prevMarket && market.outcomes[0] && prevMarket.outcomes[0]) {
          const diff = market.outcomes[0].price - prevMarket.outcomes[0].price;
          if (Math.abs(diff) > 0.5) {
            updates.set(market.id, diff > 0 ? 'up' : 'down');
          }
        }
      });

      if (updates.size > 0) {
        setPriceUpdates(updates);
        setTimeout(() => setPriceUpdates(new Map()), 2000);
      }
    }
    previousMarketsRef.current = markets;
  }, [markets]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchMarkets();
    setLastRefresh(new Date());
  }, [fetchMarkets]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim()) {
        searchMarkets(search);
      } else if (search === '') {
        fetchMarkets();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search, searchMarkets, fetchMarkets]);

  // Calculate time since last refresh
  const getTimeSinceRefresh = () => {
    const diff = Math.floor((Date.now() - lastRefresh.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  const filteredMarkets = markets
    .filter((market) => {
      if (search && !market.title.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (activeCategory !== 'All' && market.category !== activeCategory.toLowerCase()) {
        return false;
      }
      if (platformFilter !== 'all' && market.platform !== platformFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'volume') return (b.volume || 0) - (a.volume || 0);
      if (sortBy === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'price') return (b.outcomes[0]?.price || 0) - (a.outcomes[0]?.price || 0);
      return 0;
    });

  const openMarket = (market: Market) => {
    setSelectedMarket(market);
    addTab({
      type: 'event',
      title: market.title.length > 20 ? market.title.slice(0, 20) + '...' : market.title,
      eventId: market.id,
      color: '#666',
    });
  };

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

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white">Markets</span>
          {/* Live indicator */}
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
              isLive
                ? 'bg-[#22c55e]/10 text-[#22c55e] animate-pulse'
                : 'bg-[#333] text-[#888]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-[#22c55e]' : 'bg-[#555]'}`} />
            {isLive ? 'LIVE' : 'PAUSED'}
          </button>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#555]">
          <span className="tabular-nums">{filteredMarkets.length} results</span>
          <span>•</span>
          <span className="tabular-nums">{getTimeSinceRefresh()}</span>
          <button
            onClick={handleRefresh}
            disabled={marketsLoading}
            className="p-1 hover:bg-[#111] rounded transition-colors disabled:opacity-50"
          >
            {marketsLoading ? (
              <Loader2 className="w-3 h-3 text-[#555] animate-spin" />
            ) : (
              <RefreshCw className={`w-3 h-3 text-[#555] ${isLive ? 'animate-spin-slow' : ''}`} />
            )}
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1a]">
        {categories.map((cat, idx) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-200 ${
              activeCategory === cat
                ? 'bg-white text-black scale-105'
                : 'bg-[#111] text-[#888] hover:text-white hover:bg-[#1a1a1a]'
            }`}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="px-4 py-3 space-y-3 border-b border-[#1a1a1a]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
          <input
            type="text"
            placeholder="Search markets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[#444] focus:outline-none focus:border-[#333] transition-colors"
          />
        </div>

        <div className="flex items-center justify-between">
          {/* Platform Filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlatformFilter('all')}
              className={`px-2.5 py-1 rounded text-[10px] uppercase tracking-wider transition-all duration-200 ${
                platformFilter === 'all' ? 'bg-[#222] text-white scale-105' : 'text-[#555] hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPlatformFilter(platformFilter === 'polymarket' ? 'all' : 'polymarket')}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                platformFilter === 'polymarket' ? 'bg-[#222] ring-1 ring-[#333] scale-110' : 'bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#333]'
              }`}
            >
              <PolymarketLogo className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPlatformFilter(platformFilter === 'kalshi' ? 'all' : 'kalshi')}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                platformFilter === 'kalshi' ? 'bg-[#222] ring-1 ring-[#333] scale-110' : 'bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#333]'
              }`}
            >
              <KalshiLogo className="w-5 h-5" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-1 px-2 py-1.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-xs text-[#666] hover:border-[#333] hover:text-white transition-colors"
              >
                {sortBy === 'volume' ? 'Volume' : sortBy === 'recent' ? 'Recent' : 'Price'} <ChevronDown className={`w-3 h-3 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showSortDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden z-50 min-w-[100px]">
                  <button
                    onClick={() => { setSortBy('volume'); setShowSortDropdown(false); }}
                    className={`w-full px-3 py-2 text-xs text-left hover:bg-[#141414] transition-colors ${sortBy === 'volume' ? 'text-white bg-[#141414]' : 'text-[#888]'}`}
                  >
                    Volume
                  </button>
                  <button
                    onClick={() => { setSortBy('recent'); setShowSortDropdown(false); }}
                    className={`w-full px-3 py-2 text-xs text-left hover:bg-[#141414] transition-colors ${sortBy === 'recent' ? 'text-white bg-[#141414]' : 'text-[#888]'}`}
                  >
                    Recent
                  </button>
                  <button
                    onClick={() => { setSortBy('price'); setShowSortDropdown(false); }}
                    className={`w-full px-3 py-2 text-xs text-left hover:bg-[#141414] transition-colors ${sortBy === 'price' ? 'text-white bg-[#141414]' : 'text-[#888]'}`}
                  >
                    Price
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-[#1a1a1a] text-white scale-110' : 'text-[#555] hover:text-white'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-[#1a1a1a] text-white scale-110' : 'text-[#555] hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-[#1a1a1a] mx-1" />
            <button className="p-2 rounded-lg text-[#555] hover:text-white hover:bg-[#111] transition-colors">
              <Star className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg text-[#555] hover:text-white hover:bg-[#111] transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Markets Grid/List */}
      <div className="flex-1 overflow-y-auto p-4">
        {marketsLoading && markets.length === 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3 animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-[#1a1a1a] rounded" />
                  <div className="w-12 h-2 bg-[#1a1a1a] rounded" />
                </div>
                <div className="w-full h-4 bg-[#1a1a1a] rounded mb-2" />
                <div className="w-2/3 h-4 bg-[#1a1a1a] rounded mb-3" />
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between">
                    <div className="w-12 h-3 bg-[#1a1a1a] rounded" />
                    <div className="w-8 h-3 bg-[#1a1a1a] rounded" />
                  </div>
                  <div className="flex justify-between">
                    <div className="w-10 h-3 bg-[#1a1a1a] rounded" />
                    <div className="w-8 h-3 bg-[#1a1a1a] rounded" />
                  </div>
                </div>
                <div className="pt-2 border-t border-[#1a1a1a]">
                  <div className="w-16 h-3 bg-[#1a1a1a] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <p className="text-[#555] text-sm">No markets found</p>
            <p className="text-[#444] text-xs mt-1">Try adjusting your filters</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-3">
            {filteredMarkets.map((market, idx) => (
              <MarketCard
                key={market.id}
                market={market}
                onClick={() => openMarket(market)}
                isNew={newMarketIds.has(market.id)}
                priceDirection={priceUpdates.get(market.id)}
                animationDelay={idx * 30}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMarkets.map((market, idx) => (
              <MarketListItem
                key={market.id}
                market={market}
                onClick={() => openMarket(market)}
                isNew={newMarketIds.has(market.id)}
                priceDirection={priceUpdates.get(market.id)}
                animationDelay={idx * 30}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface MarketCardProps {
  market: Market;
  onClick: () => void;
  isNew?: boolean;
  priceDirection?: 'up' | 'down';
  animationDelay?: number;
}

function MarketCard({ market, onClick, isNew, priceDirection, animationDelay = 0 }: MarketCardProps) {
  return (
    <button
      onClick={onClick}
      className={`bg-[#0a0a0a] border rounded-lg overflow-hidden transition-all duration-300 group text-left hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 animate-fade-in-up ${
        isNew ? 'border-[#22c55e] ring-1 ring-[#22c55e]/30' : 'border-[#1a1a1a] hover:border-[#333]'
      } ${priceDirection ? 'animate-pulse' : ''}`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="p-3">
        {/* Platform & Category */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {market.platform === 'polymarket' ? (
              <PolymarketLogo className="w-4 h-4" />
            ) : (
              <KalshiLogo className="w-4 h-4" />
            )}
            <span className="text-[9px] text-[#555] uppercase tracking-wider">
              {market.category}
            </span>
          </div>
          {isNew && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[#22c55e] text-white text-[8px] font-bold rounded animate-bounce">
              <Zap className="w-2 h-2" />
              NEW
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-white mb-3 line-clamp-2 group-hover:text-[#ccc] transition-colors leading-tight">
          {market.title}
        </h3>

        {/* Outcomes */}
        <div className="space-y-1.5 mb-3">
          {market.outcomes.slice(0, 2).map((outcome) => (
            <div key={outcome.id} className="flex items-center justify-between">
              <span className="text-xs text-[#666] truncate flex-1 mr-2">{outcome.name}</span>
              <div className="flex items-center gap-1">
                {priceDirection && (
                  priceDirection === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-[#22c55e] animate-bounce" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-[#ef4444] animate-bounce" />
                  )
                )}
                <span className={`text-sm font-medium tabular-nums transition-colors duration-300 ${
                  priceDirection === 'up'
                    ? 'text-[#22c55e]'
                    : priceDirection === 'down'
                    ? 'text-[#ef4444]'
                    : outcome.priceChange24h && outcome.priceChange24h > 0
                    ? 'text-[#22c55e]'
                    : outcome.priceChange24h && outcome.priceChange24h < 0
                    ? 'text-[#ef4444]'
                    : 'text-white'
                }`}>
                  {outcome.price.toFixed(0)}¢
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1a1a1a]">
          <span className="text-[10px] text-[#555] tabular-nums">
            ${market.volume >= 1000000
              ? `${(market.volume / 1000000).toFixed(1)}M`
              : `${(market.volume / 1000).toFixed(0)}K`} vol
          </span>
          <ArrowUpRight className="w-3 h-3 text-[#333] group-hover:text-[#666] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>
      </div>
    </button>
  );
}

interface MarketListItemProps {
  market: Market;
  onClick: () => void;
  isNew?: boolean;
  priceDirection?: 'up' | 'down';
  animationDelay?: number;
}

function MarketListItem({ market, onClick, isNew, priceDirection, animationDelay = 0 }: MarketListItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-3 bg-[#0a0a0a] border rounded-lg transition-all duration-200 group text-left hover:bg-[#0f0f0f] animate-fade-in-up ${
        isNew ? 'border-[#22c55e] ring-1 ring-[#22c55e]/30' : 'border-[#1a1a1a] hover:border-[#333]'
      }`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="w-10 h-10 rounded-lg bg-[#111] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
        {market.platform === 'polymarket' ? (
          <PolymarketLogo className="w-6 h-6" />
        ) : (
          <KalshiLogo className="w-6 h-6" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm text-white truncate group-hover:text-[#ccc] transition-colors">{market.title}</h3>
          {isNew && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[#22c55e] text-white text-[8px] font-bold rounded flex-shrink-0">
              <Zap className="w-2 h-2" />
              NEW
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-[#555] tabular-nums">
            ${market.volume >= 1000000
              ? `${(market.volume / 1000000).toFixed(1)}M`
              : `${(market.volume / 1000).toFixed(0)}K`} vol
          </span>
          <span className="text-[9px] text-[#444] uppercase">{market.category}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {market.outcomes.slice(0, 2).map((outcome) => (
          <div key={outcome.id} className="text-right">
            <div className="text-[10px] text-[#555]">{outcome.name}</div>
            <div className={`text-sm font-medium tabular-nums transition-colors duration-300 ${
              priceDirection === 'up'
                ? 'text-[#22c55e]'
                : priceDirection === 'down'
                ? 'text-[#ef4444]'
                : outcome.priceChange24h && outcome.priceChange24h > 0
                ? 'text-[#22c55e]'
                : outcome.priceChange24h && outcome.priceChange24h < 0
                ? 'text-[#ef4444]'
                : 'text-white'
            }`}>
              {outcome.price.toFixed(0)}¢
            </div>
          </div>
        ))}
      </div>
      <ArrowUpRight className="w-4 h-4 text-[#333] group-hover:text-[#666] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
    </button>
  );
}
