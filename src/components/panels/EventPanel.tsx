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
      <div className="flex flex-col items-center justify-center h-full bg-black">
        <Image
          src="/brand/mascot.png"
          alt=""
          width={100}
          height={140}
          className="opacity-30 mb-4 animate-float"
        />
        <p className="text-[#555] text-sm">Select a market to trade</p>
        <p className="text-[#444] text-xs mt-1">Browse markets or use the flow to find opportunities</p>
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
    <div className="flex h-full bg-black relative">
      {/* Animated texture accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-3 z-10 animate-texture-scroll"
        style={{
          backgroundImage: 'url(/brand/pixel-texture.jpeg)',
          backgroundSize: '200% 100%',
          backgroundRepeat: 'repeat-x',
        }}
      />

      {/* Trade Confirmation Toast */}
      {showTradeConfirmation && lastTrade && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 animate-slide-in-down">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
            lastTrade.side === 'buy'
              ? 'bg-[#22c55e]/20 border-[#22c55e]/30'
              : 'bg-[#ef4444]/20 border-[#ef4444]/30'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              lastTrade.side === 'buy' ? 'bg-[#22c55e]' : 'bg-[#ef4444]'
            }`}>
              <Check className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">
                {lastTrade.side === 'buy' ? 'Bought' : 'Sold'} {lastTrade.outcomeName}
              </div>
              <div className="text-xs text-[#888]">
                ${lastTrade.amount.toFixed(2)} @ {lastTrade.price.toFixed(1)}¢ ({lastTrade.shares.toFixed(1)} shares)
              </div>
            </div>
            <button
              onClick={() => setShowTradeConfirmation(false)}
              className="p-1 hover:bg-white/10 rounded"
            >
              <X className="w-4 h-4 text-[#666]" />
            </button>
          </div>
        </div>
      )}

      {/* Left Sidebar - Markets List */}
      <div className="w-64 border-r border-[#1a1a1a] flex flex-col">
        <div className="p-3 border-b border-[#1a1a1a]">
          <h3 className="text-sm font-medium text-white mb-1">{market.title}</h3>
          <div className="flex items-center gap-2 text-xs text-[#666]">
            <span className="px-1.5 py-0.5 bg-[#1a1a1a] text-[#888] rounded">{market.platform === 'polymarket' ? 'P' : 'K'}</span>
            <span>${(market.volume / 1000000).toFixed(1)}M</span>
            <span>•</span>
            <span>{market.outcomes.length} markets</span>
          </div>
        </div>

        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#333]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 px-2 mb-2">
          <button className="flex items-center gap-1 px-2 py-1 bg-[#0f0f0f] rounded-lg text-xs text-[#888] hover:bg-[#141414] transition-colors">
            Hot <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* Markets List */}
        <div className="flex-1 overflow-y-auto">
          {market.outcomes.map((outcome, idx) => (
            <button
              key={outcome.id}
              onClick={() => setSelectedOutcome(outcome.id)}
              className={`flex items-center justify-between p-3 cursor-pointer border-l-2 transition-all duration-200 w-full text-left ${
                selectedOutcome === outcome.id
                  ? 'bg-[#141414] border-white'
                  : 'border-transparent hover:bg-[#0f0f0f]'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0f0f0f] flex items-center justify-center">
                  <span className="text-xs text-[#555]">{outcome.name.charAt(0)}</span>
                </div>
                <span className="text-sm text-white">{outcome.name}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-white">{outcome.price.toFixed(1)}¢</div>
                <div className={`text-xs flex items-center gap-0.5 justify-end ${
                  outcome.priceChange24h && outcome.priceChange24h > 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'
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
            <div className="p-3 border-t border-[#1a1a1a] mt-2">
              <h4 className="text-xs text-[#555] uppercase tracking-wide mb-2">Your Positions</h4>
              <div className="space-y-2">
                {marketPositions.map((pos) => (
                  <div key={pos.id} className="flex items-center justify-between p-2 bg-[#0f0f0f] rounded-lg">
                    <div>
                      <span className="text-xs text-white">{pos.outcomeName}</span>
                      <div className="text-[10px] text-[#666]">{pos.shares.toFixed(1)} shares</div>
                    </div>
                    <div className={`text-xs ${pos.pnl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
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
        <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#0f0f0f] flex items-center justify-center">
              <span className="text-lg">{selectedOutcomeData.name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">{selectedOutcomeData.name}</h2>
              <div className="flex items-center gap-2 text-xs text-[#555]">
                <span className="text-[#888]">{market.platform.toUpperCase()}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse" />
                  <span className="text-[#22c55e]">Live</span>
                </span>
                {market.category === 'crypto' && (
                  <>
                    <span>•</span>
                    <span>BTC $91,111.78</span>
                    <span className="text-[#ef4444]">-2.47%</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{currentPrice.toFixed(1)}¢</div>
            <div className={`text-sm flex items-center justify-end gap-1 ${selectedOutcomeData.priceChange24h && selectedOutcomeData.priceChange24h > 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
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
          <div className="flex items-center gap-2 px-4 pt-3">
            <button
              onClick={() => setChartType('market')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${chartType === 'market' ? 'bg-[#141414] text-white' : 'text-[#555] hover:text-white'}`}
            >
              Market
            </button>
            <button
              onClick={() => setChartType('btc')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${chartType === 'btc' ? 'bg-[#141414] text-white' : 'text-[#555] hover:text-white'}`}
            >
              BTC
            </button>
            <button
              onClick={() => setChartType('both')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${chartType === 'both' ? 'bg-white text-black' : 'text-[#555] hover:text-white'}`}
            >
              Both
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-1">
              {['5M', '15M', '30M', '1H'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 py-1 rounded-lg text-xs transition-colors ${timeframe === tf ? 'bg-[#141414] text-white' : 'text-[#555] hover:text-white'}`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="flex-1 p-4 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceData}>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#555', fontSize: 10 }}
              />
              <YAxis
                domain={['dataMin - 5', 'dataMax + 5']}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#555', fontSize: 10 }}
                tickFormatter={(v) => `${v}¢`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #1a1a1a',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#888' }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#ffffff"
                strokeWidth={2}
                fillOpacity={0.05}
                fill="#ffffff"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 px-4 border-t border-[#1a1a1a] pt-3">
          <button
            onClick={() => setActiveTab('trade')}
            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
              activeTab === 'trade' ? 'text-white border-white' : 'text-[#555] border-transparent hover:text-white'
            }`}
          >
            TRADE
          </button>
          <button
            onClick={() => setActiveTab('positions')}
            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
              activeTab === 'positions' ? 'text-white border-white' : 'text-[#555] border-transparent hover:text-white'
            }`}
          >
            POSITIONS {positions.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-[#22c55e] text-white text-[10px] rounded">{positions.length}</span>}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
              activeTab === 'history' ? 'text-white border-white' : 'text-[#555] border-transparent hover:text-white'
            }`}
          >
            HISTORY
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 pb-2">
            <Wallet className="w-4 h-4 text-[#555]" />
            <span className="text-sm text-white font-medium">${balance.toFixed(2)}</span>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'trade' && (
          <div className="p-4">
            {/* Outcome Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {market.outcomes.slice(0, 2).map((outcome) => (
                <button
                  key={outcome.id}
                  onClick={() => setSelectedOutcome(outcome.id)}
                  className={`p-3 rounded-lg text-center transition-all duration-200 ${
                    selectedOutcome === outcome.id
                      ? 'bg-white/10 border border-white'
                      : 'bg-[#0f0f0f] border border-[#1a1a1a] hover:border-[#333]'
                  }`}
                >
                  <div className={`text-xs uppercase tracking-wide mb-1 ${selectedOutcome === outcome.id ? 'text-white' : 'text-[#555]'}`}>
                    {outcome.name}
                  </div>
                  <div className="text-xl font-bold text-white">{outcome.price.toFixed(1)}¢</div>
                </button>
              ))}
            </div>

            {/* Buy/Sell Toggle */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setOrderSide('buy')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  orderSide === 'buy'
                    ? 'bg-[#22c55e] text-white'
                    : 'bg-[#0f0f0f] text-[#666] hover:text-white'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setOrderSide('sell')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  orderSide === 'sell'
                    ? 'bg-[#ef4444] text-white'
                    : 'bg-[#0f0f0f] text-[#666] hover:text-white'
                }`}
              >
                Sell
              </button>
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => setOrderType('market')}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    orderType === 'market' ? 'bg-[#141414] text-white' : 'text-[#555] hover:text-white'
                  }`}
                >
                  Market
                </button>
                <button
                  onClick={() => setOrderType('limit')}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    orderType === 'limit' ? 'bg-[#141414] text-white border border-[#1a1a1a]' : 'text-[#555] hover:text-white'
                  }`}
                >
                  Limit
                </button>
              </div>
            </div>

            {/* Limit Price */}
            {orderType === 'limit' && (
              <div className="mb-4">
                <label className="text-xs text-[#555] uppercase tracking-wide block mb-2">
                  LIMIT PRICE
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLimitPrice(Math.max(1, limitPrice - 1))}
                    className="p-2 bg-[#0f0f0f] rounded-lg hover:bg-[#141414] transition-colors"
                  >
                    <Minus className="w-4 h-4 text-[#555]" />
                  </button>
                  <input
                    type="number"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(Number(e.target.value))}
                    className="flex-1 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg px-4 py-2 text-center text-xl font-bold text-white focus:outline-none focus:border-[#333]"
                  />
                  <button
                    onClick={() => setLimitPrice(Math.min(99, limitPrice + 1))}
                    className="p-2 bg-[#0f0f0f] rounded-lg hover:bg-[#141414] transition-colors"
                  >
                    <Plus className="w-4 h-4 text-[#555]" />
                  </button>
                  <button
                    onClick={() => setLimitPrice(Math.round(currentPrice))}
                    className="p-2 text-[#555] hover:text-white transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Amount */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-[#555] uppercase tracking-wide">AMOUNT</label>
                <span className="text-xs text-[#555]">${balance.toFixed(2)} available</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]">$</span>
                <input
                  type="number"
                  value={orderAmount || ''}
                  onChange={(e) => setOrderAmount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg pl-8 pr-4 py-3 text-xl font-bold text-white placeholder:text-[#555] focus:outline-none focus:border-[#333]"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                {[5, 10, 25, 50].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setOrderAmount(Math.min(balance, orderAmount + amt))}
                    className="px-3 py-1 bg-[#0f0f0f] rounded-lg text-sm text-[#888] hover:bg-[#141414] transition-colors"
                  >
                    +${amt}
                  </button>
                ))}
                <button
                  onClick={() => setOrderAmount(balance)}
                  className="px-3 py-1 bg-[#0f0f0f] rounded-lg text-sm text-[#888] hover:bg-[#141414] transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Order Summary */}
            {orderAmount > 0 && (
              <div className="mb-4 p-3 bg-[#0f0f0f] rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#666]">Shares</span>
                  <span className="text-white">{potentialShares.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#666]">Avg Price</span>
                  <span className="text-white">{effectivePrice.toFixed(1)}¢</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#666]">Potential Payout</span>
                  <span className="text-[#22c55e]">${potentialPayout.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#666]">Max Profit</span>
                  <span className="text-[#22c55e]">+${(potentialPayout - orderAmount).toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Error Messages */}
            {orderAmount > balance && (
              <div className="mb-4 p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#ef4444]" />
                <span className="text-sm text-[#ef4444]">Insufficient balance</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleExecuteTrade}
              disabled={orderAmount <= 0 || orderAmount > balance || isExecuting}
              className={`w-full py-3 rounded-lg text-white font-medium transition-all duration-200 ${
                orderAmount > 0 && orderAmount <= balance && !isExecuting
                  ? orderSide === 'buy'
                    ? 'bg-[#22c55e] hover:bg-[#16a34a]'
                    : 'bg-[#ef4444] hover:bg-[#dc2626]'
                  : 'bg-[#0f0f0f] text-[#555] cursor-not-allowed'
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
                <Wallet className="w-8 h-8 text-[#444] mx-auto mb-2" />
                <p className="text-[#555] text-sm">No open positions</p>
                <p className="text-[#444] text-xs mt-1">Execute a trade to open a position</p>
              </div>
            ) : (
              positions.map((pos) => (
                <div key={pos.id} className="p-3 bg-[#0f0f0f] rounded-lg border border-[#1a1a1a]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{pos.outcomeName}</span>
                    <span className={`text-sm font-medium ${pos.pnl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                      {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)} ({pos.pnlPercent.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="text-xs text-[#666] mb-1">{pos.marketTitle}</div>
                  <div className="flex items-center justify-between text-xs text-[#888]">
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
                <BarChart2 className="w-8 h-8 text-[#444] mx-auto mb-2" />
                <p className="text-[#555] text-sm">No trade history</p>
                <p className="text-[#444] text-xs mt-1">Your trades will appear here</p>
              </div>
            ) : (
              trades.slice(0, 20).map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      trade.side === 'buy' ? 'bg-[#22c55e]/20' : 'bg-[#ef4444]/20'
                    }`}>
                      {trade.side === 'buy' ? (
                        <TrendingUp className="w-4 h-4 text-[#22c55e]" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-[#ef4444]" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-white">{trade.outcomeName}</div>
                      <div className="text-xs text-[#666]">
                        {trade.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${trade.side === 'buy' ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                      {trade.side === 'buy' ? '+' : '-'}${trade.amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-[#666]">{trade.shares.toFixed(1)} @ {trade.price.toFixed(1)}¢</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Order Book (Right Side) */}
      <div className="w-64 border-l border-[#1a1a1a] p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-[#555] uppercase tracking-wide">ORDER BOOK</span>
          <span className="text-[10px] text-[#444]">{selectedOutcomeData.name}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs text-[#555] mb-2">
          <span>PRICE</span>
          <span className="text-right">SIZE</span>
          <span className="text-right">TOTAL</span>
        </div>

        {/* Asks */}
        <div className="space-y-1 mb-4">
          {orderBook.asks.map((ask, idx) => (
            <div key={`ask-${idx}`} className="grid grid-cols-3 gap-2 text-xs relative group cursor-pointer hover:bg-[#1a1a1a]/50">
              <div
                className="absolute inset-0 bg-[#ef4444]/10 transition-all"
                style={{ width: `${Math.min(100, ask.size / 30)}%` }}
              />
              <span className="text-[#ef4444] relative">{ask.price.toFixed(1)}¢</span>
              <span className="text-right text-[#888] relative">{ask.size}</span>
              <span className="text-right text-[#888] relative">${ask.total.toFixed(0)}</span>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="text-center text-xs text-[#555] py-2 border-y border-[#1a1a1a] mb-4">
          <span className="text-white font-medium">{currentPrice.toFixed(1)}¢</span>
          <span className="text-[#444] ml-2">Spread: 1.0¢</span>
        </div>

        {/* Bids */}
        <div className="space-y-1">
          {orderBook.bids.map((bid, idx) => (
            <div key={`bid-${idx}`} className="grid grid-cols-3 gap-2 text-xs relative group cursor-pointer hover:bg-[#1a1a1a]/50">
              <div
                className="absolute inset-0 bg-[#22c55e]/10 transition-all"
                style={{ width: `${Math.min(100, bid.size / 30)}%` }}
              />
              <span className="text-[#22c55e] relative">{bid.price.toFixed(1)}¢</span>
              <span className="text-right text-[#888] relative">{bid.size}</span>
              <span className="text-right text-[#888] relative">${bid.total.toFixed(0)}</span>
            </div>
          ))}
        </div>

        {/* Recent Trades */}
        <div className="mt-6">
          <span className="text-xs text-[#555] uppercase tracking-wide">RECENT TRADES</span>
          <div className="mt-2 space-y-1">
            {marketTrades.slice(0, 5).map((trade) => (
              <div key={trade.id} className="flex items-center justify-between text-xs">
                <span className={trade.side === 'buy' ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                  {trade.price.toFixed(1)}¢
                </span>
                <span className="text-[#888]">${trade.amount.toFixed(0)}</span>
                <span className="text-[#555]">
                  {trade.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {marketTrades.length === 0 && (
              <div className="text-[#444] text-xs text-center py-2">No trades yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
