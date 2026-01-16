'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { TrendingUp, TrendingDown, Clock, Flame, Users } from 'lucide-react';
import { useStore, KOLBet } from '@/store';

function formatTimeRemaining(endTime: Date): string {
  const now = new Date();
  const diff = endTime.getTime() - now.getTime();

  if (diff <= 0) return 'Ended';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

function KOLBetCard({ bet, index }: { bet: KOLBet; index: number }) {
  const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(bet.endTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(bet.endTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [bet.endTime]);

  const totalPool = bet.yesPool + bet.noPool;
  const yesPercent = totalPool > 0 ? (bet.yesPool / totalPool) * 100 : 50;

  return (
    <div
      className="bg-gradient-to-b from-[#0f1419] to-[#0a0d10] rounded-xl overflow-hidden border border-[#1a1f26] hover:border-[#3B82F6]/50 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-[#3B82F6]/10"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header with gradient banner */}
      <div className="h-16 bg-gradient-to-r from-[#3B82F6] via-[#2563eb] to-[#1d4ed8] relative overflow-hidden">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        {/* Live badge */}
        {bet.isLive && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-black/30 backdrop-blur-sm rounded-full">
            <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse" />
            <span className="text-[10px] text-white font-medium">LIVE</span>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/30 backdrop-blur-sm rounded-full">
          <span className="text-[10px] text-white/80 font-medium uppercase">{bet.category}</span>
        </div>
      </div>

      {/* Profile image overlapping banner */}
      <div className="relative -mt-8 flex justify-center">
        <div className="w-16 h-16 rounded-full border-3 border-[#0f1419] overflow-hidden bg-[#1a1f26] shadow-xl ring-2 ring-[#3B82F6]/30 group-hover:ring-[#3B82F6]/60 transition-all">
          <Image
            src={bet.image}
            alt={bet.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Card content */}
      <div className="px-3 pb-3 pt-2">
        {/* Name & ticker */}
        <div className="text-center mb-2">
          <h3 className="text-sm font-bold text-white group-hover:text-[#3B82F6] transition-colors">
            {bet.name}
          </h3>
          <p className="text-[#22c55e] text-xs font-semibold">
            {bet.ticker}
          </p>
        </div>

        {/* Main stat - the bet target */}
        <div className="bg-[#1a1f26] rounded-lg p-2 mb-2">
          <p className="text-white text-center text-base font-bold">
            {bet.mainStat}
          </p>
          <p className="text-[#6B7280] text-center text-[10px] leading-tight mt-0.5">
            {bet.description}
          </p>
        </div>

        {/* Pool visualization bar */}
        <div className="mb-2">
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-[#22c55e] font-medium">{yesPercent.toFixed(0)}% Yes</span>
            <span className="text-[#ef4444] font-medium">{(100 - yesPercent).toFixed(0)}% No</span>
          </div>
          <div className="h-1.5 bg-[#1a1f26] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] transition-all duration-500"
              style={{ width: `${yesPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-[#6B7280] mt-1">
            <span>{bet.yesPool.toFixed(2)} SOL</span>
            <span>{bet.noPool.toFixed(2)} SOL</span>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center gap-1 text-[#6B7280] mb-2 py-1 bg-[#1a1f26]/50 rounded">
          <Clock className="w-3 h-3" />
          <span className="text-[10px] font-mono">{timeRemaining}</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-1 py-2 bg-[#22c55e]/10 hover:bg-[#22c55e]/20 border border-[#22c55e]/30 rounded-lg text-[#22c55e] transition-all group/btn">
            <TrendingUp className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Yes</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-1 py-2 bg-[#ef4444]/10 hover:bg-[#ef4444]/20 border border-[#ef4444]/30 rounded-lg text-[#ef4444] transition-all group/btn">
            <TrendingDown className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
            <span className="text-xs font-semibold">No</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function KOLPanel() {
  const { kolBets } = useStore();
  const [filter, setFilter] = useState<'all' | 'kol' | 'crypto' | 'token'>('all');

  const filteredBets = filter === 'all'
    ? kolBets
    : kolBets.filter(bet => bet.category === filter);

  const totalPool = filteredBets.reduce((sum, bet) => sum + bet.yesPool + bet.noPool, 0);

  return (
    <div className="h-full bg-[#0a0d10] overflow-auto">
      {/* Animated texture accent bar */}
      <div
        className="w-full h-2 flex-shrink-0 animate-texture-scroll"
        style={{
          backgroundImage: 'url(/brand/pixel-texture.jpeg)',
          backgroundSize: '200% 100%',
          backgroundRepeat: 'repeat-x',
        }}
      />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0d10]/95 backdrop-blur-sm border-b border-[#1a1f26] px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-white">KOL Bets</h2>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#22c55e]/10 rounded-full">
              <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse" />
              <span className="text-[10px] text-[#22c55e] font-medium">LIVE</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-[#6B7280]">
            <span>{filteredBets.length} bets</span>
            <span className="text-[#3B82F6]">{totalPool.toFixed(2)} SOL pool</span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5">
          {(['all', 'kol', 'crypto', 'token'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-[#3B82F6] text-white shadow-lg shadow-[#3B82F6]/25'
                  : 'bg-[#1a1f26] text-[#6B7280] hover:text-white hover:bg-[#252b33]'
              }`}
            >
              {f === 'all' ? 'All' : f === 'kol' ? 'KOLs' : f === 'crypto' ? 'Crypto' : 'Tokens'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of cards */}
      <div className="p-3">
        {filteredBets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Flame className="w-8 h-8 text-[#3B82F6] mb-3 opacity-50" />
            <p className="text-[#6B7280] text-sm">No bets in this category</p>
            <p className="text-[#4B5563] text-xs mt-1">Check back soon for new KOL bets</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
            {filteredBets.map((bet, index) => (
              <KOLBetCard key={bet.id} bet={bet} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
