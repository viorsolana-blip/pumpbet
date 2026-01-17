'use client';

import { useState } from 'react';
import { Trophy, TrendingUp, Award, Search, Crown, Medal, Star, ChevronUp, ChevronDown, Flame, Clock, Calendar } from 'lucide-react';

interface Trader {
  rank: number;
  name: string;
  avatar?: string;
  score: number;
  pnl: number;
  volume: number;
  winRate: number;
  trades: number;
  streak?: number;
  change: number;
}

// Mock data - would come from API in production
const mockTraders: Trader[] = [
  { rank: 1, name: 'TrenchKing', score: 9850, pnl: 36420, volume: 211000, winRate: 78, trades: 156, streak: 12, change: 2 },
  { rank: 2, name: 'WhaleHunter', score: 9420, pnl: 28150, volume: 185000, winRate: 72, trades: 142, streak: 8, change: -1 },
  { rank: 3, name: 'AlphaSeeker', score: 8890, pnl: 22800, volume: 142000, winRate: 69, trades: 128, streak: 5, change: 1 },
  { rank: 4, name: 'DegenMaster', score: 8540, pnl: 18200, volume: 98000, winRate: 71, trades: 98, streak: 3, change: 0 },
  { rank: 5, name: 'SolanaShark', score: 8120, pnl: 15600, volume: 76000, winRate: 67, trades: 87, streak: 6, change: 3 },
  { rank: 6, name: 'CryptoWiz', score: 7890, pnl: 12400, volume: 65000, winRate: 63, trades: 76, streak: 2, change: -2 },
  { rank: 7, name: 'TrendRider', score: 7650, pnl: 10800, volume: 54000, winRate: 65, trades: 64, streak: 4, change: 1 },
  { rank: 8, name: 'ValuePro', score: 7320, pnl: 8200, volume: 43000, winRate: 66, trades: 52, streak: 1, change: 0 },
  { rank: 9, name: 'MemeKing', score: 7100, pnl: 7400, volume: 38000, winRate: 58, trades: 89, streak: 0, change: -1 },
  { rank: 10, name: 'YOLOTrader', score: 6890, pnl: 6100, volume: 32000, winRate: 55, trades: 120, streak: 2, change: 2 },
  { rank: 11, name: 'DiamondHands', score: 6650, pnl: 5200, volume: 28000, winRate: 62, trades: 45, streak: 3, change: 0 },
  { rank: 12, name: 'PumpFinder', score: 6420, pnl: 4800, volume: 24000, winRate: 59, trades: 67, streak: 1, change: -3 },
];

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4A060] to-[#B08040] flex items-center justify-center shadow-lg">
        <Crown className="w-5 h-5 text-white" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A8A8A8] to-[#888888] flex items-center justify-center shadow-md">
        <Medal className="w-5 h-5 text-white" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CD7F32] to-[#A65E22] flex items-center justify-center shadow-md">
        <Award className="w-5 h-5 text-white" />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-[#E8E2D0] border-2 border-[#D4CDB8] flex items-center justify-center">
      <span className="text-sm font-bold text-[#5A6A4D] font-satoshi">{rank}</span>
    </div>
  );
}

function TraderCard({ trader, expanded, onClick }: { trader: Trader; expanded: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#EFEAD9] rounded-2xl border-2 transition-all duration-200 cursor-pointer overflow-hidden ${
        trader.rank <= 3 ? 'border-[#D4A060]/50 hover:border-[#D4A060]' : 'border-[#D4CDB8] hover:border-[#6B7B5E]'
      } ${expanded ? 'ring-2 ring-[#6B7B5E]/30' : ''}`}
    >
      <div className="p-4 flex items-center gap-4">
        <RankBadge rank={trader.rank} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[#3A4A2D] font-bold font-bambino truncate">{trader.name}</span>
            {trader.streak && trader.streak >= 5 && (
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-[#D4A060]/20 rounded-full">
                <Flame className="w-3 h-3 text-[#D4A060]" />
                <span className="text-[10px] font-bold text-[#D4A060]">{trader.streak}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-[#8B9B7E] font-satoshi">{trader.trades} trades</span>
            <span className="text-xs text-[#8B9B7E] font-satoshi">{trader.winRate}% win</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[#5C8A4A] font-bold text-lg font-satoshi">+{formatCurrency(trader.pnl)}</div>
          <div className="flex items-center justify-end gap-1 mt-0.5">
            {trader.change > 0 ? (
              <ChevronUp className="w-3 h-3 text-[#5C8A4A]" />
            ) : trader.change < 0 ? (
              <ChevronDown className="w-3 h-3 text-[#C45A4A]" />
            ) : null}
            <span className={`text-xs font-satoshi ${
              trader.change > 0 ? 'text-[#5C8A4A]' : trader.change < 0 ? 'text-[#C45A4A]' : 'text-[#8B9B7E]'
            }`}>
              {trader.change > 0 ? `+${trader.change}` : trader.change < 0 ? trader.change : '—'}
            </span>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t-2 border-[#D4CDB8] bg-[#E8E2D0] animate-fade-in">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-[#8B9B7E] font-bambino mb-1">Score</div>
              <div className="text-lg font-bold text-[#3A4A2D] font-satoshi">{trader.score.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-[#8B9B7E] font-bambino mb-1">Volume</div>
              <div className="text-lg font-bold text-[#3A4A2D] font-satoshi">{formatCurrency(trader.volume)}</div>
            </div>
            <div>
              <div className="text-xs text-[#8B9B7E] font-bambino mb-1">Win Streak</div>
              <div className="text-lg font-bold text-[#D4A060] font-satoshi">{trader.streak || 0}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TopThreePodium({ traders }: { traders: Trader[] }) {
  const [first, second, third] = traders;

  return (
    <div className="flex items-end justify-center gap-4 mb-8 px-4">
      {/* Second Place */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A8A8A8] to-[#888888] flex items-center justify-center mb-2 ring-4 ring-[#A8A8A8]/30">
          <span className="text-xl font-bold text-white font-bambino">{second?.name.charAt(0)}</span>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-[#3A4A2D] font-bambino truncate max-w-[80px]">{second?.name}</div>
          <div className="text-xs text-[#5C8A4A] font-bold font-satoshi">+{formatCurrency(second?.pnl || 0)}</div>
        </div>
        <div className="w-24 h-20 bg-[#A8A8A8]/20 rounded-t-xl mt-2 flex items-center justify-center">
          <span className="text-3xl font-bold text-[#A8A8A8]">2</span>
        </div>
      </div>

      {/* First Place */}
      <div className="flex flex-col items-center -mt-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4A060] to-[#B08040] flex items-center justify-center mb-2 ring-4 ring-[#D4A060]/30 shadow-lg">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <div className="text-center">
          <div className="text-base font-bold text-[#3A4A2D] font-bambino truncate max-w-[100px]">{first?.name}</div>
          <div className="text-sm text-[#5C8A4A] font-bold font-satoshi">+{formatCurrency(first?.pnl || 0)}</div>
        </div>
        <div className="w-28 h-28 bg-[#D4A060]/20 rounded-t-xl mt-2 flex items-center justify-center">
          <span className="text-4xl font-bold text-[#D4A060]">1</span>
        </div>
      </div>

      {/* Third Place */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#CD7F32] to-[#A65E22] flex items-center justify-center mb-2 ring-4 ring-[#CD7F32]/30">
          <span className="text-xl font-bold text-white font-bambino">{third?.name.charAt(0)}</span>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-[#3A4A2D] font-bambino truncate max-w-[80px]">{third?.name}</div>
          <div className="text-xs text-[#5C8A4A] font-bold font-satoshi">+{formatCurrency(third?.pnl || 0)}</div>
        </div>
        <div className="w-24 h-16 bg-[#CD7F32]/20 rounded-t-xl mt-2 flex items-center justify-center">
          <span className="text-3xl font-bold text-[#CD7F32]">3</span>
        </div>
      </div>
    </div>
  );
}

export function TradersPanel() {
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState<'all' | 'weekly' | 'daily'>('all');
  const [expandedTrader, setExpandedTrader] = useState<number | null>(null);

  const filteredTraders = mockTraders.filter(trader =>
    trader.name.toLowerCase().includes(search.toLowerCase())
  );

  const topThree = filteredTraders.slice(0, 3);
  const restOfTraders = filteredTraders.slice(3);

  return (
    <div className="h-full bg-[#F5F0E1] flex flex-col">
      {/* Decorative top stripe */}
      <div className="w-full h-2 bg-gradient-to-r from-[#D4A060] via-[#8B7355] to-[#D4A060]" />

      {/* Header */}
      <div className="border-b-2 border-[#D4CDB8] px-4 py-3 bg-[#EFEAD9]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#D4A060]" />
            <h2 className="text-[#3A4A2D] font-bold font-bambino">Leaderboard</h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#8B9B7E] font-satoshi">
            <Star className="w-3 h-3" />
            <span>{mockTraders.length} traders</span>
          </div>
        </div>

        {/* Period tabs */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1 bg-[#E8E2D0] rounded-xl p-1 border-2 border-[#D4CDB8]">
            {([
              { id: 'all', label: 'All Time', icon: Trophy },
              { id: 'weekly', label: 'Weekly', icon: Calendar },
              { id: 'daily', label: 'Daily', icon: Clock },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setPeriod(id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all font-bambino ${
                  period === id ? 'bg-[#6B7B5E] text-[#F5F0E1]' : 'text-[#6B7B5E] hover:text-[#3A4A2D]'
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B9B7E]" />
          <input
            type="text"
            placeholder="Search traders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-xl pl-10 pr-4 py-2 text-sm text-[#3A4A2D] placeholder:text-[#9AAA8D] focus:outline-none focus:border-[#6B7B5E] font-bambino"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!search && (
          <TopThreePodium traders={topThree} />
        )}

        <div className="space-y-3">
          {(search ? filteredTraders : restOfTraders).map((trader) => (
            <TraderCard
              key={trader.rank}
              trader={trader}
              expanded={expandedTrader === trader.rank}
              onClick={() => setExpandedTrader(expandedTrader === trader.rank ? null : trader.rank)}
            />
          ))}
        </div>

        {filteredTraders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="w-8 h-8 text-[#D4CDB8] mb-3" />
            <p className="text-[#6B7B5E] text-sm font-bambino">No traders found</p>
            <p className="text-[#8B9B7E] text-xs mt-1 font-bambino">Try a different search term</p>
          </div>
        )}
      </div>

      {/* Stats footer */}
      <div className="px-4 py-3 bg-[#EFEAD9] border-t-2 border-[#D4CDB8]">
        <div className="flex items-center justify-between text-xs text-[#8B9B7E] font-bambino">
          <div className="flex items-center gap-4">
            <span>Total Volume: <strong className="text-[#3A4A2D]">{formatCurrency(mockTraders.reduce((sum, t) => sum + t.volume, 0))}</strong></span>
            <span>Total P&L: <strong className="text-[#5C8A4A]">+{formatCurrency(mockTraders.reduce((sum, t) => sum + t.pnl, 0))}</strong></span>
          </div>
          <span className="text-[10px]">Updated live</span>
        </div>
      </div>
    </div>
  );
}
