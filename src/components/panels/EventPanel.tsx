'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Search, ChevronDown, Settings, Minus, Plus, RefreshCw, BarChart2, Check, X, AlertCircle, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useStore, Market, Trade } from '@/store';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Generate price history data
function generatePriceHistory(basePrice: number, points: number = 50) {
  const data = [];
  let price = basePrice;
  const now = Date.now();

  for (let i = points; i >= 0; i--) {
    price = Math.max(1, Math.min(99, price + (Math.random() - 0.5) * 5));
    data.push({
      time: new Date(now - i * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: price,
      btc: 91000 + (Math.random() - 0.5) * 2000,
    });
  }
  return data;
}

// Generate realistic order book data
function generateOrderBook(currentPrice: number) {
  const bids = [];
  const asks = [];
  let bidPrice = Math.floor(currentPrice) - 1;
  let askPrice = Math.ceil(currentPrice) + 1;

  for (let i = 0; i < 6; i++) {
    const bidSize = Math.floor(Math.random() * 3000) + 500;
    const askSize = Math.floor(Math.random() * 3000) + 500;

    bids.push({
      price: Math.max(1, bidPrice - i),
      size: bidSize,
      total: bidSize * (bidPrice - i) / 100,
    });

    asks.push({
      price: Math.min(99, askPrice + i),
      size: askSize,
      total: askSize * (askPrice + i) / 100,
    });
  }

  return { bids, asks: asks.reverse() };
}

interface EventPanelProps {
  market?: Market;
}

export function EventPanel({ market }: EventPanelProps) {
  const {
    orderSide,
    orderType,
    limitPrice,
    orderAmount,
    setOrderSide,
    setOrderType,
    setLimitPrice,
    setOrderAmount,
    selectedOutcome,
    setSelectedOutcome,
    balance,
    executeTrade,
    trades,
    positions,
  } = useStore();

  const [timeframe, setTimeframe] = useState('1D');
  const [chartType, setChartType] = useState<'market' | 'btc' | 'both'>('both');
  const [showTradeConfirmation, setShowTradeConfirmation] = useState(false);
  const [lastTrade, setLastTrade] = useState<Trade | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<'trade' | 'positions' | 'history'>('trade');

  const priceData = useMemo(() => {
    return generatePriceHistory(market?.outcomes[0]?.price || 50);
  }, [market]);

  const orderBook = useMemo(() => {
    return generateOrderBook(market?.outcomes[0]?.price || 50);
  }, [market]);

  // Auto-dismiss trade confirmation
  useEffect(() => {
    if (showTradeConfirmation) {
      const timer = setTimeout(() => setShowTradeConfirmation(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showTradeConfirmation]);

  if (!market) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#F5F0E1]">
        <Image
          src="/brand/mascot.png"
          alt=""
          width={100}
          height={140}
          className="opacity-30 mb-4 animate-float"
        />
        <p className="text-[#8B9B7E] text-sm font-bambino">Select a market to trade</p>
        <p className="text-[#A8B89B] text-xs mt-1 font-bambino">Browse markets or use the flow to find opportunities</p>
      </div>
    );
  }

  const selectedOutcomeData = market.outcomes.find((o) => o.id === selectedOutcome) || market.outcomes[0];
  const currentPrice = selectedOutcomeData?.price || 50;
  const effectivePrice = orderType === 'limit' ? limitPrice : currentPrice;
  const potentialShares = orderAmount > 0 ? orderAmount / (effectivePrice / 100) : 0;
  const potentialPayout = potentialShares * (100 / effectivePrice);

  // Get positions for this market
  const marketPositions = positions.filter(p => p.marketId === market.id);
  const marketTrades = trades.filter(t => t.marketId === market.id).slice(0, 10);

  const handleExecuteTrade = async () => {
    if (orderAmount <= 0 || orderAmount > balance) return;

    setIsExecuting(true);

    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const trade = {
      marketId: market.id,
      marketTitle: market.title,
      outcomeId: selectedOutcomeData.id,
      outcomeName: selectedOutcomeData.name,
      side: orderSide,
      amount: orderAmount,
      price: effectivePrice,
      shares: potentialShares,
    };

    executeTrade(trade);
    setLastTrade({ ...trade, id: `trade-${Date.now()}`, time: new Date(), status: 'filled' });
    setShowTradeConfirmation(true);
    setIsExecuting(false);
  };

  return (
    <div className="flex h-full bg-[#F5F0E1] relative">
      {/* Decorative top stripe */}
      <div className="absolute top-0 left-0 right-0 h-2 z-10 bg-gradient-to-r from-[#6B7B5E] via-[#8B7355] to-[#6B7B5E]" />

      {/* Trade Confirmation Toast */}
      {showTradeConfirmation && lastTrade && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 animate-slide-in-down">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 shadow-lg ${
            lastTrade.side === 'buy'
              ? 'bg-[#5C8A4A]/20 border-[#5C8A4A]/40'
              : 'bg-[#C45A4A]/20 border-[#C45A4A]/40'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              lastTrade.side === 'buy' ? 'bg-[#5C8A4A]' : 'bg-[#C45A4A]'
            }`}>
              <Check className="w-4 h-4 text-[#F5F0E1]" />
            </div>
            <div>
              <div className="text-sm font-medium text-[#3A4A2D] font-bambino">
                {lastTrade.side === 'buy' ? 'Bought' : 'Sold'} {lastTrade.outcomeName}
              </div>
              <div className="text-xs text-[#6B7B5E] font-bambino">
                ${lastTrade.amount.toFixed(2)} @ {lastTrade.price.toFixed(1)}¢ ({lastTrade.shares.toFixed(1)} shares)
              </div>
            </div>
            <button
              onClick={() => setShowTradeConfirmation(false)}
              className="p-1 hover:bg-[#D4CDB8] rounded-lg"
            >
              <X className="w-4 h-4 text-[#8B9B7E]" />
            </button>
          </div>
        </div>
      )}

      {/* Left Sidebar - Markets List */}
      <div className="w-64 border-r-2 border-[#E8E2D0] flex flex-col bg-[#EFEAD9]">
        <div className="p-3 border-b-2 border-[#E8E2D0]">
          <h3 className="text-sm font-bambino font-bold text-[#3A4A2D] mb-1">{market.title}</h3>
          <div className="flex items-center gap-2 text-xs text-[#8B9B7E] font-bambino">
            <span className="px-1.5 py-0.5 bg-[#6B7B5E] text-[#F5F0E1] rounded-lg font-bold">{market.platform === 'polymarket' ? 'P' : 'K'}</span>
            <span>${(market.volume / 1000000).toFixed(1)}M</span>
            <span>•</span>
            <span>{market.outcomes.length} markets</span>
          </div>
        </div>

        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B9B7E]" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-xl pl-8 pr-3 py-1.5 text-sm text-[#3A4A2D] placeholder:text-[#A8B89B] focus:outline-none focus:border-[#6B7B5E] font-bambino"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 px-2 mb-2">
          <button className="flex items-center gap-1 px-2 py-1 bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-xl text-xs text-[#6B7B5E] hover:border-[#6B7B5E] transition-colors font-bambino font-bold">
            Hot <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* Markets List */}
        <div className="flex-1 overflow-y-auto">
          {market.outcomes.map((outcome, idx) => (
            <button
              key={outcome.id}
              onClick={() => setSelectedOutcome(outcome.id)}
              className={`flex items-center justify-between p-3 cursor-pointer border-l-4 transition-all duration-200 w-full text-left ${
                selectedOutcome === outcome.id
                  ? 'bg-[#F5F0E1] border-[#6B7B5E]'
                  : 'border-transparent hover:bg-[#F5F0E1]'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F5F0E1] border-2 border-[#D4CDB8] flex items-center justify-center">
                  <span className="text-xs text-[#6B7B5E] font-bold">{outcome.name.charAt(0)}</span>
                </div>
                <span className="text-sm text-[#3A4A2D] font-bambino">{outcome.name}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-[#3A4A2D] font-satoshi">{outcome.price.toFixed(1)}¢</div>
                <div className={`text-xs flex items-center gap-0.5 justify-end font-bambino ${
                  outcome.priceChange24h && outcome.priceChange24h > 0 ? 'text-[#5C8A4A]' : 'text-[#C45A4A]'
                }`}>
                  {outcome.priceChange24h && outcome.priceChange24h > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(outcome.priceChange24h || 0).toFixed(1)}¢
                </div>
              </div>
            </button>
          ))}

          {/* Positions in this market */}
          {marketPositions.length > 0 && (
            <div className="p-3 border-t-2 border-[#E8E2D0] mt-2">
              <h4 className="text-xs text-[#8B9B7E] uppercase tracking-wider mb-2 font-bambino font-bold">Your Positions</h4>
              <div className="space-y-2">
                {marketPositions.map((pos) => (
                  <div key={pos.id} className="flex items-center justify-between p-2 bg-[#F5F0E1] rounded-xl border-2 border-[#D4CDB8]">
                    <div>
                      <span className="text-xs text-[#3A4A2D] font-bambino">{pos.outcomeName}</span>
                      <div className="text-[10px] text-[#8B9B7E] font-bambino">{pos.shares.toFixed(1)} shares</div>
                    </div>
                    <div className={`text-xs font-bold ${pos.pnl >= 0 ? 'text-[#5C8A4A]' : 'text-[#C45A4A]'}`}>
                      {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Trading Panel */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-[#E8E2D0] bg-[#EFEAD9]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F5F0E1] border-2 border-[#D4CDB8] flex items-center justify-center">
              <span className="text-lg font-bold text-[#6B7B5E]">{selectedOutcomeData.name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-lg font-bambino font-bold text-[#3A4A2D]">{selectedOutcomeData.name}</h2>
              <div className="flex items-center gap-2 text-xs text-[#8B9B7E] font-bambino">
                <span className="text-[#6B7B5E] font-bold">{market.platform.toUpperCase()}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#5C8A4A] rounded-full animate-pulse" />
                  <span className="text-[#5C8A4A]">Live</span>
                </span>
                {market.category === 'crypto' && (
                  <>
                    <span>•</span>
                    <span>BTC $91,111.78</span>
                    <span className="text-[#C45A4A]">-2.47%</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#3A4A2D] font-satoshi">{currentPrice.toFixed(1)}¢</div>
            <div className={`text-sm flex items-center justify-end gap-1 font-bambino ${selectedOutcomeData.priceChange24h && selectedOutcomeData.priceChange24h > 0 ? 'text-[#5C8A4A]' : 'text-[#C45A4A]'}`}>
              {selectedOutcomeData.priceChange24h && selectedOutcomeData.priceChange24h > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {selectedOutcomeData.priceChange24h && selectedOutcomeData.priceChange24h > 0 ? '+' : ''}
              {selectedOutcomeData.priceChange24h?.toFixed(1)}¢ ({((selectedOutcomeData.priceChange24h || 0) / currentPrice * 100).toFixed(1)}%)
            </div>
          </div>
        </div>

        {/* Chart Type Toggle */}
        {market.category === 'crypto' && (
          <div className="flex items-center gap-2 px-4 pt-3 bg-[#F5F0E1]">
            <button
              onClick={() => setChartType('market')}
              className={`px-3 py-1 rounded-xl text-sm transition-colors font-bambino ${chartType === 'market' ? 'bg-[#6B7B5E] text-[#F5F0E1]' : 'text-[#8B9B7E] hover:text-[#3A4A2D]'}`}
            >
              Market
            </button>
            <button
              onClick={() => setChartType('btc')}
              className={`px-3 py-1 rounded-xl text-sm transition-colors font-bambino ${chartType === 'btc' ? 'bg-[#6B7B5E] text-[#F5F0E1]' : 'text-[#8B9B7E] hover:text-[#3A4A2D]'}`}
            >
              BTC
            </button>
            <button
              onClick={() => setChartType('both')}
              className={`px-3 py-1 rounded-xl text-sm transition-colors font-bambino ${chartType === 'both' ? 'bg-[#6B7B5E] text-[#F5F0E1]' : 'text-[#8B9B7E] hover:text-[#3A4A2D]'}`}
            >
              Both
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-1">
              {['5M', '15M', '30M', '1H'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 py-1 rounded-xl text-xs transition-colors font-bambino ${timeframe === tf ? 'bg-[#6B7B5E] text-[#F5F0E1]' : 'text-[#8B9B7E] hover:text-[#3A4A2D]'}`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="flex-1 p-4 min-h-[200px] bg-[#F5F0E1]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceData}>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#8B9B7E', fontSize: 10 }}
              />
              <YAxis
                domain={['dataMin - 5', 'dataMax + 5']}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#8B9B7E', fontSize: 10 }}
                tickFormatter={(v) => `${v}¢`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#F5F0E1',
                  border: '2px solid #D4CDB8',
                  borderRadius: '12px',
                }}
                labelStyle={{ color: '#6B7B5E' }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#6B7B5E"
                strokeWidth={2}
                fillOpacity={0.1}
                fill="#6B7B5E"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-4 border-t-2 border-[#C5BDA8] pt-3 bg-[#E5DFD0]">
          <button
            onClick={() => setActiveTab('trade')}
            className={`px-4 py-2 rounded-xl text-sm font-bambino font-bold transition-all ${
              activeTab === 'trade'
                ? 'bg-[#6B7B5E] text-[#F5F0E1] shadow-md'
                : 'bg-[#F5F0E1] text-[#5A6A4D] border-2 border-[#C5BDA8] hover:bg-[#EFEAD9]'
            }`}
          >
            TRADE
          </button>
          <button
            onClick={() => setActiveTab('positions')}
            className={`px-4 py-2 rounded-xl text-sm font-bambino font-bold transition-all flex items-center gap-1 ${
              activeTab === 'positions'
                ? 'bg-[#6B7B5E] text-[#F5F0E1] shadow-md'
                : 'bg-[#F5F0E1] text-[#5A6A4D] border-2 border-[#C5BDA8] hover:bg-[#EFEAD9]'
            }`}
          >
            POSITIONS {positions.length > 0 && <span className="px-1.5 py-0.5 bg-[#5C8A4A] text-[#F5F0E1] text-[10px] rounded-lg">{positions.length}</span>}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-sm font-bambino font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-[#6B7B5E] text-[#F5F0E1] shadow-md'
                : 'bg-[#F5F0E1] text-[#5A6A4D] border-2 border-[#C5BDA8] hover:bg-[#EFEAD9]'
            }`}
          >
            HISTORY
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 px-3 py-2 bg-[#F5F0E1] rounded-xl border-2 border-[#C5BDA8]">
            <Wallet className="w-4 h-4 text-[#5C8A4A]" />
            <span className="text-sm text-[#3A4A2D] font-satoshi font-bold">${balance.toFixed(2)}</span>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'trade' && (
          <div className="p-4 bg-[#EFEAD9]">
            {/* Outcome Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {market.outcomes.slice(0, 2).map((outcome) => (
                <button
                  key={outcome.id}
                  onClick={() => setSelectedOutcome(outcome.id)}
                  className={`p-3 rounded-xl text-center transition-all duration-200 border-2 ${
                    selectedOutcome === outcome.id
                      ? 'bg-[#F5F0E1] border-[#6B7B5E]'
                      : 'bg-[#F5F0E1] border-[#D4CDB8] hover:border-[#8B9B7E]'
                  }`}
                >
                  <div className={`text-xs uppercase tracking-wide mb-1 font-bambino font-bold ${selectedOutcome === outcome.id ? 'text-[#3A4A2D]' : 'text-[#8B9B7E]'}`}>
                    {outcome.name}
                  </div>
                  <div className="text-xl font-bold text-[#3A4A2D] font-satoshi">{outcome.price.toFixed(1)}¢</div>
                </button>
              ))}
            </div>

            {/* Buy/Sell Toggle */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setOrderSide('buy')}
                className={`flex-1 py-2 rounded-xl text-sm font-bambino font-bold transition-all duration-200 ${
                  orderSide === 'buy'
                    ? 'bg-[#5C8A4A] text-[#F5F0E1]'
                    : 'bg-[#F5F0E1] text-[#8B9B7E] border-2 border-[#D4CDB8] hover:text-[#3A4A2D]'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setOrderSide('sell')}
                className={`flex-1 py-2 rounded-xl text-sm font-bambino font-bold transition-all duration-200 ${
                  orderSide === 'sell'
                    ? 'bg-[#C45A4A] text-[#F5F0E1]'
                    : 'bg-[#F5F0E1] text-[#8B9B7E] border-2 border-[#D4CDB8] hover:text-[#3A4A2D]'
                }`}
              >
                Sell
              </button>
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => setOrderType('market')}
                  className={`px-3 py-2 rounded-xl text-sm font-bambino transition-colors ${
                    orderType === 'market' ? 'bg-[#6B7B5E] text-[#F5F0E1]' : 'text-[#8B9B7E] hover:text-[#3A4A2D]'
                  }`}
                >
                  Market
                </button>
                <button
                  onClick={() => setOrderType('limit')}
                  className={`px-3 py-2 rounded-xl text-sm font-bambino transition-colors ${
                    orderType === 'limit' ? 'bg-[#6B7B5E] text-[#F5F0E1]' : 'text-[#8B9B7E] hover:text-[#3A4A2D]'
                  }`}
                >
                  Limit
                </button>
              </div>
            </div>

            {/* Limit Price */}
            {orderType === 'limit' && (
              <div className="mb-4">
                <label className="text-xs text-[#8B9B7E] uppercase tracking-wider block mb-2 font-bambino font-bold">
                  LIMIT PRICE
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLimitPrice(Math.max(1, limitPrice - 1))}
                    className="p-2 bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-xl hover:border-[#6B7B5E] transition-colors"
                  >
                    <Minus className="w-4 h-4 text-[#6B7B5E]" />
                  </button>
                  <input
                    type="number"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(Number(e.target.value))}
                    className="flex-1 bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-xl px-4 py-2 text-center text-xl font-bold text-[#3A4A2D] focus:outline-none focus:border-[#6B7B5E] font-satoshi"
                  />
                  <button
                    onClick={() => setLimitPrice(Math.min(99, limitPrice + 1))}
                    className="p-2 bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-xl hover:border-[#6B7B5E] transition-colors"
                  >
                    <Plus className="w-4 h-4 text-[#6B7B5E]" />
                  </button>
                  <button
                    onClick={() => setLimitPrice(Math.round(currentPrice))}
                    className="p-2 text-[#8B9B7E] hover:text-[#3A4A2D] transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Amount */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-[#8B9B7E] uppercase tracking-wider font-bambino font-bold">AMOUNT</label>
                <span className="text-xs text-[#8B9B7E] font-bambino">${balance.toFixed(2)} available</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B9B7E]">$</span>
                <input
                  type="number"
                  value={orderAmount || ''}
                  onChange={(e) => setOrderAmount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-xl pl-8 pr-4 py-3 text-xl font-bold text-[#3A4A2D] placeholder:text-[#A8B89B] focus:outline-none focus:border-[#6B7B5E] font-satoshi"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                {[5, 10, 25, 50].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setOrderAmount(Math.min(balance, orderAmount + amt))}
                    className="px-3 py-1 bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-xl text-sm text-[#6B7B5E] hover:border-[#6B7B5E] transition-colors font-bambino"
                  >
                    +${amt}
                  </button>
                ))}
                <button
                  onClick={() => setOrderAmount(balance)}
                  className="px-3 py-1 bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-xl text-sm text-[#6B7B5E] hover:border-[#6B7B5E] transition-colors font-bambino"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Order Summary */}
            {orderAmount > 0 && (
              <div className="mb-4 p-3 bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8B9B7E] font-bambino">Shares</span>
                  <span className="text-[#3A4A2D] font-satoshi font-bold">{potentialShares.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8B9B7E] font-bambino">Avg Price</span>
                  <span className="text-[#3A4A2D] font-satoshi font-bold">{effectivePrice.toFixed(1)}¢</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8B9B7E] font-bambino">Potential Payout</span>
                  <span className="text-[#5C8A4A] font-satoshi font-bold">${potentialPayout.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8B9B7E] font-bambino">Max Profit</span>
                  <span className="text-[#5C8A4A] font-satoshi font-bold">+${(potentialPayout - orderAmount).toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Error Messages */}
            {orderAmount > balance && (
              <div className="mb-4 p-3 bg-[#C45A4A]/10 border-2 border-[#C45A4A]/30 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#C45A4A]" />
                <span className="text-sm text-[#C45A4A] font-bambino">Insufficient balance</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleExecuteTrade}
              disabled={orderAmount <= 0 || orderAmount > balance || isExecuting}
              className={`w-full py-3 rounded-xl font-bambino font-bold transition-all duration-200 ${
                orderAmount > 0 && orderAmount <= balance && !isExecuting
                  ? orderSide === 'buy'
                    ? 'bg-[#5C8A4A] text-[#F5F0E1] hover:bg-[#4A7A3A]'
                    : 'bg-[#C45A4A] text-[#F5F0E1] hover:bg-[#B44A3A]'
                  : 'bg-[#D4CDB8] text-[#8B9B7E] cursor-not-allowed'
              }`}
            >
              {isExecuting ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Executing...
                </span>
              ) : orderAmount > 0 ? (
                `${orderSide === 'buy' ? 'Buy' : 'Sell'} ${selectedOutcomeData.name}`
              ) : (
                'Enter amount'
              )}
            </button>
          </div>
        )}

        {activeTab === 'positions' && (
          <div className="p-4 space-y-3 overflow-y-auto">
            {positions.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="w-8 h-8 text-[#8B9B7E] mx-auto mb-2" />
                <p className="text-[#6B7B5E] text-sm">No open positions</p>
                <p className="text-[#8B9B7E] text-xs mt-1">Execute a trade to open a position</p>
              </div>
            ) : (
              positions.map((pos) => (
                <div key={pos.id} className="p-3 bg-[#EFEAD9] rounded-lg border border-[#D4CDB8]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#3A4A2D]">{pos.outcomeName}</span>
                    <span className={`text-sm font-medium ${pos.pnl >= 0 ? 'text-[#5C8A4A]' : 'text-[#C45A4A]'}`}>
                      {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)} ({pos.pnlPercent.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="text-xs text-[#6B7B5E] mb-1">{pos.marketTitle}</div>
                  <div className="flex items-center justify-between text-xs text-[#8B9B7E]">
                    <span>{pos.shares.toFixed(2)} shares @ {pos.avgPrice.toFixed(1)}¢</span>
                    <span>Current: {pos.currentPrice.toFixed(1)}¢</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-4 space-y-2 overflow-y-auto">
            {trades.length === 0 ? (
              <div className="text-center py-8">
                <BarChart2 className="w-8 h-8 text-[#8B9B7E] mx-auto mb-2" />
                <p className="text-[#6B7B5E] text-sm">No trade history</p>
                <p className="text-[#8B9B7E] text-xs mt-1">Your trades will appear here</p>
              </div>
            ) : (
              trades.slice(0, 20).map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 bg-[#EFEAD9] rounded-lg border border-[#D4CDB8]">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      trade.side === 'buy' ? 'bg-[#5C8A4A]/20' : 'bg-[#C45A4A]/20'
                    }`}>
                      {trade.side === 'buy' ? (
                        <TrendingUp className="w-4 h-4 text-[#5C8A4A]" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-[#C45A4A]" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-[#3A4A2D]">{trade.outcomeName}</div>
                      <div className="text-xs text-[#6B7B5E]">
                        {trade.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${trade.side === 'buy' ? 'text-[#5C8A4A]' : 'text-[#C45A4A]'}`}>
                      {trade.side === 'buy' ? '+' : '-'}${trade.amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-[#6B7B5E]">{trade.shares.toFixed(1)} @ {trade.price.toFixed(1)}¢</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Order Book (Right Side) */}
      <div className="w-64 border-l border-[#D4CDB8] p-4 bg-[#EFEAD9]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-[#6B7B5E] uppercase tracking-wide font-medium">ORDER BOOK</span>
          <span className="text-[10px] text-[#8B9B7E]">{selectedOutcomeData.name}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs text-[#6B7B5E] mb-2">
          <span>PRICE</span>
          <span className="text-right">SIZE</span>
          <span className="text-right">TOTAL</span>
        </div>

        {/* Asks */}
        <div className="space-y-1 mb-4">
          {orderBook.asks.map((ask, idx) => (
            <div key={`ask-${idx}`} className="grid grid-cols-3 gap-2 text-xs relative group cursor-pointer hover:bg-[#D4CDB8]/50 rounded">
              <div
                className="absolute inset-0 bg-[#C45A4A]/10 transition-all rounded"
                style={{ width: `${Math.min(100, ask.size / 30)}%` }}
              />
              <span className="text-[#C45A4A] relative">{ask.price.toFixed(1)}¢</span>
              <span className="text-right text-[#6B7B5E] relative">{ask.size}</span>
              <span className="text-right text-[#6B7B5E] relative">${ask.total.toFixed(0)}</span>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="text-center text-xs text-[#6B7B5E] py-2 border-y border-[#D4CDB8] mb-4">
          <span className="text-[#3A4A2D] font-medium">{currentPrice.toFixed(1)}¢</span>
          <span className="text-[#8B9B7E] ml-2">Spread: 1.0¢</span>
        </div>

        {/* Bids */}
        <div className="space-y-1">
          {orderBook.bids.map((bid, idx) => (
            <div key={`bid-${idx}`} className="grid grid-cols-3 gap-2 text-xs relative group cursor-pointer hover:bg-[#D4CDB8]/50 rounded">
              <div
                className="absolute inset-0 bg-[#5C8A4A]/10 transition-all rounded"
                style={{ width: `${Math.min(100, bid.size / 30)}%` }}
              />
              <span className="text-[#5C8A4A] relative">{bid.price.toFixed(1)}¢</span>
              <span className="text-right text-[#6B7B5E] relative">{bid.size}</span>
              <span className="text-right text-[#6B7B5E] relative">${bid.total.toFixed(0)}</span>
            </div>
          ))}
        </div>

        {/* Recent Trades */}
        <div className="mt-6">
          <span className="text-xs text-[#6B7B5E] uppercase tracking-wide font-medium">RECENT TRADES</span>
          <div className="mt-2 space-y-1">
            {marketTrades.slice(0, 5).map((trade) => (
              <div key={trade.id} className="flex items-center justify-between text-xs">
                <span className={trade.side === 'buy' ? 'text-[#5C8A4A]' : 'text-[#C45A4A]'}>
                  {trade.price.toFixed(1)}¢
                </span>
                <span className="text-[#6B7B5E]">${trade.amount.toFixed(0)}</span>
                <span className="text-[#8B9B7E]">
                  {trade.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {marketTrades.length === 0 && (
              <div className="text-[#8B9B7E] text-xs text-center py-2">No trades yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
