'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Clock, Flame, Search, RefreshCw, Loader2, ArrowUpRight, Zap, X, Wallet, Check, AlertCircle, Swords, Target, Trophy } from 'lucide-react';
import { useStore, KOLBet, Market } from '@/store';
import { PolymarketLogo, KalshiLogo } from '@/components/icons/Logos';

// ============ TIME FORMATTING ============
function formatTimeRemaining(endTime: Date): string {
  const now = new Date();
  const diff = endTime.getTime() - now.getTime();
  if (diff <= 0) return 'Ended';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// ============ FEATURED KOL CARD ============
function FeaturedKOLCard({ bet, onClick }: { bet: KOLBet; onClick: () => void }) {
  const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(bet.endTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(bet.endTime));
    }, 60000);
    return () => clearInterval(interval);
  }, [bet.endTime]);

  const totalPool = bet.yesPool + bet.noPool;
  const yesPercent = totalPool > 0 ? (bet.yesPool / totalPool) * 100 : 50;

  return (
    <div
      onClick={onClick}
      className="group relative w-[300px] h-[180px] rounded-2xl overflow-hidden cursor-pointer shrink-0 snap-start bg-[#EFEAD9] border-2 border-[#D4CDB8] hover:border-[#6B7B5E] transition-all hover:shadow-lg"
    >
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-30 texture-canvas" />

      {/* Content */}
      <div className="relative h-full p-4 flex flex-col">
        {/* Top row */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative shrink-0">
            <Image
              src={bet.image}
              alt={bet.name}
              width={44}
              height={44}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-[#6B7B5E]/30"
            />
            {bet.isLive && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#5C8A4A] rounded-full border-2 border-[#EFEAD9]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[#3A4A2D] font-bold text-sm truncate font-bambino">{bet.name}</h3>
            <p className="text-[#8B9B7E] text-xs font-satoshi">{bet.ticker}</p>
          </div>
          <div className="px-2.5 py-1 bg-[#6B7B5E]/10 rounded-full">
            <span className="text-[#5A6A4D] text-[11px] font-medium font-satoshi">{timeRemaining}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-[#5A6A4D] text-[13px] leading-relaxed line-clamp-2 flex-1 font-bambino">{bet.description}</p>

        {/* Bottom: odds bar + stats */}
        <div className="mt-auto pt-3">
          <div className="h-2 rounded-full overflow-hidden flex bg-[#D4CDB8] mb-2">
            <div
              className="h-full bg-[#5C8A4A] transition-all duration-500 rounded-l-full"
              style={{ width: `${yesPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="text-[#5C8A4A] font-bold font-satoshi">Yes {yesPercent.toFixed(0)}%</span>
              <span className="text-[#C45A4A] font-bold font-satoshi">No {(100 - yesPercent).toFixed(0)}%</span>
            </div>
            <span className="text-[#8B9B7E] font-satoshi">{totalPool.toFixed(1)} SOL</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ COMPACT KOL CARD ============
function CompactKOLCard({ bet, onClick }: { bet: KOLBet; onClick: () => void }) {
  const totalPool = bet.yesPool + bet.noPool;
  const yesPercent = totalPool > 0 ? (bet.yesPool / totalPool) * 100 : 50;

  return (
    <div
      onClick={onClick}
      className="group min-w-[200px] bg-[#EFEAD9] rounded-xl border-2 border-[#D4CDB8] hover:border-[#6B7B5E] p-3 cursor-pointer shrink-0 snap-start transition-all duration-200 hover:shadow-md"
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div className="relative">
          <Image
            src={bet.image}
            alt={bet.name}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-[#D4CDB8]"
          />
          {bet.isLive && (
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#5C8A4A] rounded-full border border-[#EFEAD9]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[#3A4A2D] text-sm font-bold truncate font-bambino">{bet.name}</h4>
          <p className="text-[#8B9B7E] text-xs font-satoshi">{bet.ticker}</p>
        </div>
      </div>

      <p className="text-[#6B7B5E] text-xs line-clamp-2 mb-2.5 leading-relaxed font-bambino">{bet.description}</p>

      <div className="flex items-center justify-between text-xs">
        <span className="text-[#5C8A4A] font-bold font-satoshi">{yesPercent.toFixed(0)}% Yes</span>
        <span className="text-[#8B9B7E] font-satoshi">{totalPool.toFixed(1)} SOL</span>
      </div>
    </div>
  );
}

// ============ KOL BET CARD (Grid) ============
function KOLBetCard({ bet, onClick }: { bet: KOLBet; onClick: () => void }) {
  const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(bet.endTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(bet.endTime));
    }, 60000);
    return () => clearInterval(interval);
  }, [bet.endTime]);

  const totalPool = bet.yesPool + bet.noPool;
  const yesPercent = totalPool > 0 ? (bet.yesPool / totalPool) * 100 : 50;

  return (
    <div
      onClick={onClick}
      className="group bg-[#EFEAD9] rounded-2xl border-2 border-[#D4CDB8] hover:border-[#6B7B5E] transition-all duration-200 cursor-pointer overflow-hidden hover:shadow-lg"
    >
      <div className="p-4 flex items-center gap-3">
        <div className="relative shrink-0">
          <Image
            src={bet.image}
            alt={bet.name}
            width={44}
            height={44}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-[#D4CDB8]"
          />
          {bet.isLive && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#5C8A4A] rounded-full border-2 border-[#EFEAD9]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[#3A4A2D] text-sm font-bold truncate font-bambino">{bet.name}</h3>
          <p className="text-[#8B9B7E] text-xs font-satoshi">{bet.ticker}</p>
        </div>
        <div className="px-2 py-1 bg-[#6B7B5E]/10 rounded-full">
          <span className="text-[#5A6A4D] text-xs font-satoshi">{timeRemaining}</span>
        </div>
      </div>

      <div className="px-4 pb-3">
        <p className="text-[#5A6A4D] text-sm leading-relaxed line-clamp-2 font-bambino">{bet.description}</p>
      </div>

      <div className="px-4 pb-4">
        <div className="h-2 rounded-full overflow-hidden flex bg-[#D4CDB8] mb-3">
          <div className="h-full bg-[#5C8A4A] rounded-l-full" style={{ width: `${yesPercent}%` }} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[#5C8A4A] text-sm font-bold font-satoshi">Yes {yesPercent.toFixed(0)}%</span>
            <span className="text-[#C45A4A] text-sm font-bold font-satoshi">No {(100 - yesPercent).toFixed(0)}%</span>
          </div>
          <span className="text-[#8B9B7E] text-xs font-satoshi">{totalPool.toFixed(2)} SOL</span>
        </div>
      </div>
    </div>
  );
}

// ============ CAROUSEL ROW ============
function CarouselRow({ title, children, icon, autoScroll = false }: { title: string; children: React.ReactNode; icon?: React.ReactNode; autoScroll?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, [checkScroll]);

  useEffect(() => {
    if (!autoScroll || isPaused) return;
    const el = scrollRef.current;
    if (!el) return;

    const interval = setInterval(() => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      if (scrollLeft >= scrollWidth - clientWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 310, behavior: 'smooth' });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [autoScroll, isPaused]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -310 : 310;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-[#3A4A2D] text-sm font-bold font-bambino">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="p-1.5 rounded-lg hover:bg-[#E8E2D0] disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-transparent hover:border-[#D4CDB8]"
          >
            <ArrowUpRight className="w-4 h-4 text-[#6B7B5E] rotate-[-135deg]" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="p-1.5 rounded-lg hover:bg-[#E8E2D0] disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-transparent hover:border-[#D4CDB8]"
          >
            <ArrowUpRight className="w-4 h-4 text-[#6B7B5E] rotate-45" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-4 snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
    </div>
  );
}

// ============ MARKET CARD ============
function MarketCard({ market, onClick }: { market: Market; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-[#EFEAD9] rounded-2xl overflow-hidden border-2 border-[#D4CDB8] hover:border-[#6B7B5E] transition-all duration-200 cursor-pointer hover:shadow-lg"
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          {market.platform === 'polymarket' ? (
            <PolymarketLogo className="w-4 h-4" />
          ) : (
            <KalshiLogo className="w-4 h-4" />
          )}
          <span className="text-[10px] text-[#8B9B7E] uppercase tracking-wide font-satoshi">{market.category}</span>
          <span className="text-[10px] text-[#6B7B5E] ml-auto font-bold font-satoshi">
            ${market.volume >= 1000000 ? `${(market.volume / 1000000).toFixed(1)}M` : `${(market.volume / 1000).toFixed(0)}K`}
          </span>
        </div>

        <p className="text-[#5A6A4D] text-sm leading-relaxed mb-4 line-clamp-2 font-bambino">{market.title}</p>

        <div className="space-y-2">
          {market.outcomes.slice(0, 2).map((outcome) => (
            <div key={outcome.id} className="flex items-center justify-between">
              <span className="text-xs text-[#6B7B5E] truncate flex-1 mr-2 font-bambino">{outcome.name}</span>
              <span className={`text-sm font-bold font-satoshi tabular-nums ${
                outcome.priceChange24h && outcome.priceChange24h > 0 ? 'text-[#5C8A4A]'
                : outcome.priceChange24h && outcome.priceChange24h < 0 ? 'text-[#C45A4A]'
                : 'text-[#3A4A2D]'
              }`}>
                {outcome.price.toFixed(0)}¢
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ KOL BET PLACEMENT MODAL ============
function KOLDetailModal({ bet, onClose }: { bet: KOLBet; onClose: () => void }) {
  const { placeBet, addLiquidity, isConnected, balance, userLPPositions } = useStore();
  const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(bet.endTime));
  const [betAmount, setBetAmount] = useState('');
  const [selectedSide, setSelectedSide] = useState<'yes' | 'no' | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [modalMode, setModalMode] = useState<'bet' | 'liquidity'>('bet');
  const [lpAmount, setLpAmount] = useState('');
  const [isAddingLiquidity, setIsAddingLiquidity] = useState(false);

  const userLPPosition = userLPPositions.find(lp => lp.marketId === bet.id);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(bet.endTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [bet.endTime]);

  const totalPool = bet.yesPool + bet.noPool;
  const yesPercent = totalPool > 0 ? (bet.yesPool / totalPool) * 100 : 50;
  const amount = parseFloat(betAmount) || 0;

  const calculatePotentialPayout = (side: 'yes' | 'no') => {
    if (amount <= 0) return 0;
    const price = side === 'yes' ? yesPercent : (100 - yesPercent);
    return (amount / price) * 100;
  };

  const handlePlaceBet = async (side: 'yes' | 'no') => {
    if (!isConnected) {
      setResult({ success: false, message: 'Connect wallet first' });
      return;
    }
    if (amount <= 0) {
      setResult({ success: false, message: 'Enter an amount' });
      return;
    }
    if (amount > balance) {
      setResult({ success: false, message: 'Insufficient balance' });
      return;
    }

    setSelectedSide(side);
    setIsPlacing(true);
    setResult(null);

    const response = await placeBet(bet.id, side, amount);
    setResult(response);
    setIsPlacing(false);

    if (response.success) {
      setTimeout(() => onClose(), 1500);
    }
  };

  const handleAddLiquidity = async () => {
    const lpAmt = parseFloat(lpAmount) || 0;
    if (lpAmt <= 0) {
      setResult({ success: false, message: 'Enter an amount' });
      return;
    }
    if (lpAmt > balance) {
      setResult({ success: false, message: 'Insufficient balance' });
      return;
    }

    setIsAddingLiquidity(true);
    setResult(null);

    const response = await addLiquidity(bet.id, lpAmt);
    setResult(response);
    setIsAddingLiquidity(false);

    if (response.success) {
      setLpAmount('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-3xl overflow-hidden animate-scale-in shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-[#EFEAD9]">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src={bet.image}
                  alt={bet.name}
                  width={52}
                  height={52}
                  className="w-13 h-13 rounded-full object-cover ring-3 ring-[#6B7B5E]/30"
                />
                {bet.isLive && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#5C8A4A] rounded-full border-2 border-[#EFEAD9]" />
                )}
              </div>
              <div>
                <h3 className="text-[#3A4A2D] font-bold text-lg font-bambino">{bet.name}</h3>
                <p className="text-[#8B9B7E] text-sm font-satoshi">{bet.ticker}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#E8E2D0] text-[#6B7B5E] hover:text-[#3A4A2D] transition-all border border-transparent hover:border-[#D4CDB8]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-[#3A4A2D] text-[15px] leading-relaxed mb-4 font-bambino">{bet.description}</p>

          <div className="flex items-center gap-4 text-sm text-[#6B7B5E]">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#6B7B5E]/10 rounded-full">
              <Clock className="w-4 h-4" />
              <span className="font-satoshi">{timeRemaining}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#8B7355]/10 rounded-full">
              <Flame className="w-4 h-4 text-[#D4A060]" />
              <span className="font-satoshi">{totalPool.toFixed(2)} SOL</span>
            </div>
          </div>
        </div>

        {/* Odds bar */}
        <div className="px-5 py-4">
          <div className="h-3 rounded-full overflow-hidden flex bg-[#D4CDB8]">
            <div
              className="h-full bg-[#5C8A4A] transition-all duration-500 rounded-l-full"
              style={{ width: `${yesPercent}%` }}
            />
            <div
              className="h-full bg-[#C45A4A] transition-all duration-500 rounded-r-full"
              style={{ width: `${100 - yesPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-2.5">
            <span className="text-[#5C8A4A] text-sm font-bold font-satoshi">Yes {yesPercent.toFixed(0)}%</span>
            <span className="text-[#C45A4A] text-sm font-bold font-satoshi">No {(100 - yesPercent).toFixed(0)}%</span>
          </div>
        </div>

        {/* Mode toggle + Content section */}
        <div className="px-5 pb-5 pt-4 border-t-2 border-[#D4CDB8] bg-[#F8F4E8]">
          {/* Mode tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => { setModalMode('bet'); setResult(null); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all font-bambino ${
                modalMode === 'bet'
                  ? 'bg-[#6B7B5E] text-[#E4D4B8] border-2 border-[#4A5A3D]'
                  : 'bg-[#EFEAD9] text-[#6B7B5E] border-2 border-[#D4CDB8] hover:border-[#6B7B5E]'
              }`}
            >
              Place Bet
            </button>
            <button
              onClick={() => { setModalMode('liquidity'); setResult(null); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all font-bambino ${
                modalMode === 'liquidity'
                  ? 'bg-[#8B7355] text-[#E4D4B8] border-2 border-[#6B5A40]'
                  : 'bg-[#EFEAD9] text-[#8B7355] border-2 border-[#D4CDB8] hover:border-[#8B7355]'
              }`}
            >
              Add Liquidity
            </button>
          </div>

          {isConnected && (
            <div className="flex items-center justify-between mb-4 px-3 py-2 bg-gradient-to-r from-[#A08B70] to-[#8B7355] rounded-xl">
              <span className="text-[#E4D4B8] text-sm font-bambino">Your balance</span>
              <span className="text-white font-bold font-satoshi">{balance.toFixed(3)} SOL</span>
            </div>
          )}

          {modalMode === 'bet' ? (
            <>

          {/* Amount input */}
          <div className="relative mb-3">
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="0.00"
              disabled={isPlacing}
              className="w-full bg-[#EFEAD9] border-2 border-[#D4CDB8] rounded-xl px-4 py-3.5 text-[#3A4A2D] text-xl font-bold placeholder:text-[#B4AD98] focus:outline-none focus:border-[#6B7B5E] transition-colors disabled:opacity-50 font-satoshi"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B9B7E] text-sm font-bold font-satoshi">SOL</span>
          </div>

          {/* Quick amounts */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[0.1, 0.5, 1, 5].map((qa) => (
              <button
                key={qa}
                onClick={() => setBetAmount(qa.toString())}
                disabled={isPlacing}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all font-satoshi ${
                  betAmount === qa.toString()
                    ? 'bg-[#6B7B5E] text-[#E4D4B8] border-2 border-[#4A5A3D]'
                    : 'bg-[#EFEAD9] hover:bg-[#E8E2D0] border-2 border-[#D4CDB8] text-[#5A6A4D] hover:border-[#6B7B5E]'
                } disabled:opacity-50`}
              >
                {qa}
              </button>
            ))}
          </div>

          {/* Potential returns */}
          {amount > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-[#5C8A4A]/10 rounded-xl border-2 border-[#5C8A4A]/30">
                <div className="text-[#6B7B5E] text-xs mb-1 font-bambino">If Yes wins</div>
                <div className="text-[#5C8A4A] text-lg font-bold font-satoshi">{calculatePotentialPayout('yes').toFixed(2)} SOL</div>
              </div>
              <div className="p-3 bg-[#C45A4A]/10 rounded-xl border-2 border-[#C45A4A]/30">
                <div className="text-[#6B7B5E] text-xs mb-1 font-bambino">If No wins</div>
                <div className="text-[#C45A4A] text-lg font-bold font-satoshi">{calculatePotentialPayout('no').toFixed(2)} SOL</div>
              </div>
            </div>
          )}

          {/* Result message */}
          {result && (
            <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-sm font-bold font-bambino ${
              result.success ? 'bg-[#5C8A4A]/10 text-[#5C8A4A] border-2 border-[#5C8A4A]/30' : 'bg-[#C45A4A]/10 text-[#C45A4A] border-2 border-[#C45A4A]/30'
            }`}>
              {result.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{result.message}</span>
            </div>
          )}

          {/* Bet buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handlePlaceBet('yes')}
              disabled={isPlacing || !isConnected || amount <= 0}
              className="py-4 bg-[#5C8A4A] hover:bg-[#4A7038] disabled:bg-[#D4CDB8] disabled:text-[#9AAA8D] text-white font-bold rounded-xl transition-all disabled:cursor-not-allowed flex items-center justify-center border-2 border-[#4A7038] disabled:border-[#B4AD98] font-bambino"
            >
              {isPlacing && selectedSide === 'yes' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Yes {yesPercent.toFixed(0)}%</>
              )}
            </button>
            <button
              onClick={() => handlePlaceBet('no')}
              disabled={isPlacing || !isConnected || amount <= 0}
              className="py-4 bg-[#C45A4A] hover:bg-[#A44A3A] disabled:bg-[#D4CDB8] disabled:text-[#9AAA8D] text-white font-bold rounded-xl transition-all disabled:cursor-not-allowed flex items-center justify-center border-2 border-[#A44A3A] disabled:border-[#B4AD98] font-bambino"
            >
              {isPlacing && selectedSide === 'no' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>No {(100 - yesPercent).toFixed(0)}%</>
              )}
            </button>
          </div>

          {!isConnected && (
            <p className="text-center text-sm text-[#8B9B7E] mt-4 font-bambino">Connect wallet to place bets</p>
          )}
            </>
          ) : (
            /* Liquidity mode */
            <>
              {/* Existing LP position */}
              {userLPPosition && (
                <div className="p-3 bg-[#8B7355]/10 rounded-xl border-2 border-[#8B7355]/30 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B5A40] text-sm font-bambino">Your LP Position</span>
                    <span className="text-[#8B7355] font-bold font-satoshi">{userLPPosition.amount.toFixed(3)} SOL</span>
                  </div>
                  <div className="text-xs text-[#9A8670] mt-1 font-satoshi">
                    {userLPPosition.shares.toFixed(2)} shares
                  </div>
                </div>
              )}

              {/* LP Amount input */}
              <div className="relative mb-3">
                <input
                  type="number"
                  value={lpAmount}
                  onChange={(e) => setLpAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={isAddingLiquidity}
                  className="w-full bg-[#EFEAD9] border-2 border-[#D4CDB8] rounded-xl px-4 py-3.5 text-[#3A4A2D] text-xl font-bold placeholder:text-[#B4AD98] focus:outline-none focus:border-[#8B7355] transition-colors disabled:opacity-50 font-satoshi"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B9B7E] text-sm font-bold font-satoshi">SOL</span>
              </div>

              {/* Quick LP amounts */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[0.5, 1, 5, 10].map((qa) => (
                  <button
                    key={qa}
                    onClick={() => setLpAmount(qa.toString())}
                    disabled={isAddingLiquidity}
                    className={`py-2.5 rounded-xl text-sm font-bold transition-all font-satoshi ${
                      lpAmount === qa.toString()
                        ? 'bg-[#8B7355] text-[#E4D4B8] border-2 border-[#6B5A40]'
                        : 'bg-[#EFEAD9] hover:bg-[#E8E2D0] border-2 border-[#D4CDB8] text-[#5A6A4D] hover:border-[#8B7355]'
                    } disabled:opacity-50`}
                  >
                    {qa}
                  </button>
                ))}
              </div>

              {/* LP info */}
              <div className="p-3 bg-[#EFEAD9] border-2 border-[#D4CDB8] rounded-xl mb-4">
                <h4 className="text-[#5A6A4D] text-sm font-bold mb-2 font-bambino">How Liquidity Works</h4>
                <ul className="text-xs text-[#6B7B5E] space-y-1 font-satoshi">
                  <li>• Your SOL is split 50/50 between YES and NO pools</li>
                  <li>• You earn fees from every trade (1-2%)</li>
                  <li>• Withdraw anytime (or when market resolves)</li>
                </ul>
              </div>

              {/* Result message */}
              {result && (
                <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-sm font-bold font-bambino ${
                  result.success ? 'bg-[#5C8A4A]/10 text-[#5C8A4A] border-2 border-[#5C8A4A]/30' : 'bg-[#C45A4A]/10 text-[#C45A4A] border-2 border-[#C45A4A]/30'
                }`}>
                  {result.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{result.message}</span>
                </div>
              )}

              {/* Add Liquidity button */}
              <button
                onClick={handleAddLiquidity}
                disabled={isAddingLiquidity || !isConnected || (parseFloat(lpAmount) || 0) <= 0}
                className="w-full py-4 bg-[#8B7355] hover:bg-[#7A6348] disabled:bg-[#D4CDB8] disabled:text-[#9AAA8D] text-white font-bold rounded-xl transition-all disabled:cursor-not-allowed flex items-center justify-center border-2 border-[#6B5A40] disabled:border-[#B4AD98] font-bambino"
              >
                {isAddingLiquidity ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Add Liquidity'
                )}
              </button>

              {!isConnected && (
                <p className="text-center text-sm text-[#8B9B7E] mt-4 font-bambino">Connect wallet to add liquidity</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ MAIN PANEL ============
export function TrenchesPanel() {
  const { kolBets, kolBetsLoading, fetchKolBets, markets, marketsLoading, fetchMarkets, searchMarkets, addTab, setSelectedMarket } = useStore();
  const [activeTab, setActiveTab] = useState<'kols' | 'markets'>('kols');
  const [search, setSearch] = useState('');
  const [kolFilter, setKolFilter] = useState<'all' | 'kol' | 'crypto' | 'token'>('all');
  const [marketFilter, setMarketFilter] = useState<'all' | 'crypto' | 'sports' | 'politics' | 'tech'>('all');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'polymarket' | 'kalshi'>('all');
  const [selectedKol, setSelectedKol] = useState<KOLBet | null>(null);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    fetchKolBets();
    fetchMarkets();
  }, [fetchKolBets, fetchMarkets]);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      fetchKolBets();
      fetchMarkets();
    }, 10000);
    return () => clearInterval(interval);
  }, [isLive, fetchKolBets, fetchMarkets]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim() && activeTab === 'markets') {
        searchMarkets(search);
      } else if (search === '' && activeTab === 'markets') {
        fetchMarkets();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search, searchMarkets, fetchMarkets, activeTab]);

  const filteredKols = kolBets.filter(bet => {
    if (search && !bet.name.toLowerCase().includes(search.toLowerCase()) &&
        !bet.description.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (kolFilter !== 'all' && bet.category !== kolFilter) return false;
    return true;
  });

  const filteredMarkets = markets.filter(market => {
    if (search && !market.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (marketFilter !== 'all' && market.category !== marketFilter) return false;
    if (platformFilter !== 'all' && market.platform !== platformFilter) return false;
    return true;
  }).sort((a, b) => b.volume - a.volume);

  const openMarket = (market: Market) => {
    setSelectedMarket(market);
    addTab({
      type: 'event',
      title: market.title.length > 20 ? market.title.slice(0, 20) + '...' : market.title,
      eventId: market.id,
      color: '#6B7B5E',
    });
  };

  return (
    <div className="h-full bg-[#F5F0E1] flex flex-col">
      {/* Header */}
      <div className="border-b-2 border-[#D4CDB8] px-4 py-3 bg-[#EFEAD9]">
        {/* Tabs */}
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={() => setActiveTab('kols')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all font-bambino ${
              activeTab === 'kols'
                ? 'bg-[#6B7B5E] text-[#E4D4B8]'
                : 'text-[#6B7B5E] hover:bg-[#E8E2D0]'
            }`}
          >
            <Swords className="w-4 h-4" />
            Trenches
          </button>
          <button
            onClick={() => setActiveTab('markets')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all font-bambino ${
              activeTab === 'markets'
                ? 'bg-[#6B7B5E] text-[#E4D4B8]'
                : 'text-[#6B7B5E] hover:bg-[#E8E2D0]'
            }`}
          >
            <Target className="w-4 h-4" />
            Markets
          </button>
          <div className="flex-1" />
          {isLive && <div className="w-2 h-2 bg-[#5C8A4A] rounded-full animate-pulse" />}
          <span className="text-xs text-[#8B9B7E] font-satoshi">
            {activeTab === 'kols' ? filteredKols.length : filteredMarkets.length} active
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B9B7E]" />
          <input
            type="text"
            placeholder="Search bets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-xl pl-10 pr-4 py-2 text-sm text-[#3A4A2D] placeholder:text-[#9AAA8D] focus:outline-none focus:border-[#6B7B5E] font-bambino"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === 'kols' ? (
            <>
              {(['all', 'kol', 'crypto', 'token'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setKolFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all font-bambino ${
                    kolFilter === f
                      ? 'bg-[#6B7B5E] text-[#E4D4B8]'
                      : 'text-[#6B7B5E] hover:bg-[#E8E2D0] border border-[#D4CDB8]'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'kol' ? 'KOLs' : f === 'crypto' ? 'Crypto' : 'Tokens'}
                </button>
              ))}
            </>
          ) : (
            <>
              {(['all', 'crypto', 'sports', 'politics', 'tech'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setMarketFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all font-bambino ${
                    marketFilter === f
                      ? 'bg-[#6B7B5E] text-[#E4D4B8]'
                      : 'text-[#6B7B5E] hover:bg-[#E8E2D0] border border-[#D4CDB8]'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
              <div className="w-px h-5 bg-[#D4CDB8] mx-1" />
              <button
                onClick={() => setPlatformFilter(platformFilter === 'polymarket' ? 'all' : 'polymarket')}
                className={`w-7 h-7 rounded-lg flex items-center justify-center border-2 transition-all ${
                  platformFilter === 'polymarket' ? 'bg-[#6B7B5E] border-[#4A5A3D]' : 'border-[#D4CDB8] hover:border-[#6B7B5E]'
                }`}
              >
                <PolymarketLogo className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPlatformFilter(platformFilter === 'kalshi' ? 'all' : 'kalshi')}
                className={`w-7 h-7 rounded-lg flex items-center justify-center border-2 transition-all ${
                  platformFilter === 'kalshi' ? 'bg-[#6B7B5E] border-[#4A5A3D]' : 'border-[#D4CDB8] hover:border-[#6B7B5E]'
                }`}
              >
                <KalshiLogo className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'kols' ? (
          kolBetsLoading && kolBets.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-[#6B7B5E] animate-spin" />
            </div>
          ) : filteredKols.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Swords className="w-10 h-10 text-[#D4CDB8] mb-3" />
              <p className="text-[#6B7B5E] text-sm font-bambino">No bets found in the trenches</p>
            </div>
          ) : (
            <div className="py-4">
              {/* Trending carousel */}
              <CarouselRow
                title="Trending"
                icon={<Flame className="w-4 h-4 text-[#D4A060]" />}
                autoScroll
              >
                {[...filteredKols]
                  .sort((a, b) => (b.yesPool + b.noPool) - (a.yesPool + a.noPool))
                  .slice(0, 5)
                  .map((bet) => (
                    <FeaturedKOLCard key={bet.id} bet={bet} onClick={() => setSelectedKol(bet)} />
                  ))}
              </CarouselRow>

              {/* KOL category */}
              {filteredKols.filter(b => b.category === 'kol').length > 0 && (
                <CarouselRow
                  title="KOL Milestones"
                  icon={<Trophy className="w-4 h-4 text-[#6B7B5E]" />}
                >
                  {filteredKols
                    .filter(b => b.category === 'kol')
                    .map((bet) => (
                      <CompactKOLCard key={bet.id} bet={bet} onClick={() => setSelectedKol(bet)} />
                    ))}
                </CarouselRow>
              )}

              {/* Token category */}
              {filteredKols.filter(b => b.category === 'token').length > 0 && (
                <CarouselRow
                  title="Token Bets"
                  icon={<Zap className="w-4 h-4 text-[#D4A060]" />}
                >
                  {filteredKols
                    .filter(b => b.category === 'token')
                    .map((bet) => (
                      <CompactKOLCard key={bet.id} bet={bet} onClick={() => setSelectedKol(bet)} />
                    ))}
                </CarouselRow>
              )}

              {/* All bets grid */}
              <div className="px-4 mt-6">
                <h3 className="text-[#3A4A2D] text-sm font-bold mb-3 flex items-center gap-2 font-bambino">
                  <RefreshCw className="w-4 h-4 text-[#8B9B7E]" />
                  All Bets
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredKols.map((bet) => (
                    <KOLBetCard key={bet.id} bet={bet} onClick={() => setSelectedKol(bet)} />
                  ))}
                </div>
              </div>
            </div>
          )
        ) : marketsLoading && markets.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-[#6B7B5E] animate-spin" />
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Target className="w-10 h-10 text-[#D4CDB8] mb-3" />
            <p className="text-[#6B7B5E] text-sm font-bambino">No markets found</p>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMarkets.map((market) => (
              <MarketCard key={market.id} market={market} onClick={() => openMarket(market)} />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedKol && (
        <KOLDetailModal bet={selectedKol} onClose={() => setSelectedKol(null)} />
      )}
    </div>
  );
}
