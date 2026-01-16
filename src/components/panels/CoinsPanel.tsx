'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ThumbsUp, ThumbsDown, Plus, Search, TrendingUp, Flame, Clock, X, Loader2, Star, ExternalLink } from 'lucide-react';
import { useStore, Coin } from '@/store';

// Add Coin Modal
function AddCoinModal({ onClose }: { onClose: () => void }) {
  const { submitCoin, isConnected } = useStore();
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Coin['category']>('memecoin');
  const [contractAddress, setContractAddress] = useState('');
  const [twitter, setTwitter] = useState('');
  const [website, setWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name || !ticker || !description) {
      setError('Please fill in all required fields');
      return;
    }

    if (!isConnected) {
      setError('Please connect your wallet to submit a coin');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const result = await submitCoin({
      name,
      ticker: ticker.startsWith('$') ? ticker : `$${ticker}`,
      description,
      category,
      image: null,
      contract_address: contractAddress || null,
      twitter: twitter || null,
      website: website || null,
      submitted_by: '',
    });

    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" onClick={onClose}>
      <div
        className="w-full max-w-md bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-[#1a1a1a] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Submit a Coin</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#1a1a1a] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#666]" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-[#1f0d0d] border border-[#ef4444]/30 rounded-lg text-[#ef4444] text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-[#666] mb-2">Coin Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Fartcoin"
              className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl px-4 py-3 text-white placeholder:text-[#333] focus:outline-none focus:border-[#333]"
            />
          </div>

          <div>
            <label className="block text-sm text-[#666] mb-2">Ticker *</label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="e.g., $FART"
              className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl px-4 py-3 text-white placeholder:text-[#333] focus:outline-none focus:border-[#333]"
            />
          </div>

          <div>
            <label className="block text-sm text-[#666] mb-2">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What makes this coin special? (10-500 characters)"
              rows={3}
              className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl px-4 py-3 text-white placeholder:text-[#333] focus:outline-none focus:border-[#333] resize-none"
            />
            <p className="text-xs text-[#444] mt-1">{description.length}/500</p>
          </div>

          <div>
            <label className="block text-sm text-[#666] mb-2">Category</label>
            <div className="grid grid-cols-5 gap-2">
              {(['memecoin', 'defi', 'gaming', 'ai', 'other'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`py-2 rounded-lg text-xs font-medium transition-all ${
                    category === cat
                      ? 'bg-white text-black'
                      : 'bg-[#111] text-[#666] hover:text-white border border-[#1a1a1a]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#666] mb-2">Contract Address (optional)</label>
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="Solana address"
              className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl px-4 py-3 text-white placeholder:text-[#333] focus:outline-none focus:border-[#333] font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-[#666] mb-2">Twitter (optional)</label>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="@handle"
                className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl px-4 py-3 text-white placeholder:text-[#333] focus:outline-none focus:border-[#333]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#666] mb-2">Website (optional)</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl px-4 py-3 text-white placeholder:text-[#333] focus:outline-none focus:border-[#333]"
              />
            </div>
          </div>

          <div className="p-3 bg-[#111] border border-[#1a1a1a] rounded-lg text-xs text-[#666]">
            <p className="font-medium text-[#888] mb-1">How it works:</p>
            <p>Get 15 upvotes and your coin becomes featured with its own betting market!</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!name || !ticker || !description || isSubmitting || !isConnected}
            className="w-full py-4 bg-[#22c55e] hover:bg-[#1ea550] disabled:bg-[#111] disabled:text-[#333] text-white font-semibold rounded-xl transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : !isConnected ? (
              'Connect Wallet to Submit'
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Submit Coin
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Coin Card Component
function CoinCard({ coin }: { coin: Coin }) {
  const { voteCoin, isConnected, walletAddressFull } = useStore();
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(coin.upvotes);
  const [localDownvotes, setLocalDownvotes] = useState(coin.downvotes);

  // Fetch user's vote status
  useEffect(() => {
    const fetchUserVote = async () => {
      if (!walletAddressFull) return;
      try {
        const response = await fetch(`/api/coins/${coin.id}/vote?wallet=${walletAddressFull}`);
        const data = await response.json();
        if (data.success && data.vote) {
          setUserVote(data.vote.type);
        }
      } catch (error) {
        console.error('Error fetching vote:', error);
      }
    };
    fetchUserVote();
  }, [coin.id, walletAddressFull]);

  // Sync local state with coin prop
  useEffect(() => {
    setLocalUpvotes(coin.upvotes);
    setLocalDownvotes(coin.downvotes);
  }, [coin.upvotes, coin.downvotes]);

  const handleVote = async (type: 'up' | 'down') => {
    if (!isConnected) return;
    setIsVoting(true);

    // Optimistic update
    const prevVote = userVote;
    const prevUpvotes = localUpvotes;
    const prevDownvotes = localDownvotes;

    if (userVote === type) {
      // Removing vote
      setUserVote(null);
      if (type === 'up') setLocalUpvotes(Math.max(0, localUpvotes - 1));
      else setLocalDownvotes(Math.max(0, localDownvotes - 1));
    } else {
      // Adding or changing vote
      if (userVote) {
        // Had previous vote
        if (userVote === 'up') setLocalUpvotes(Math.max(0, localUpvotes - 1));
        else setLocalDownvotes(Math.max(0, localDownvotes - 1));
      }
      setUserVote(type);
      if (type === 'up') setLocalUpvotes(localUpvotes + 1);
      else setLocalDownvotes(localDownvotes + 1);
    }

    const result = await voteCoin(coin.id, type);

    if (!result.success) {
      // Revert on failure
      setUserVote(prevVote);
      setLocalUpvotes(prevUpvotes);
      setLocalDownvotes(prevDownvotes);
    } else {
      // Use server values
      setLocalUpvotes(result.upvotes);
      setLocalDownvotes(result.downvotes);
      if (userVote === type) {
        setUserVote(null); // Vote was toggled off
      }
    }

    setIsVoting(false);
  };

  const score = localUpvotes - localDownvotes;
  const totalVotes = localUpvotes + localDownvotes;
  const likePercent = totalVotes > 0 ? (localUpvotes / totalVotes) * 100 : 50;
  const progressTo15 = Math.min(100, (localUpvotes / 15) * 100);

  return (
    <div className={`bg-[#0a0a0a] rounded-xl border transition-all overflow-hidden ${
      coin.is_featured
        ? 'border-[#22c55e]/50 ring-1 ring-[#22c55e]/20'
        : 'border-[#1a1a1a] hover:border-[#2a2a2a]'
    }`}>
      <div className="p-4">
        {/* Featured badge */}
        {coin.is_featured && (
          <div className="flex items-center gap-1.5 text-xs text-[#22c55e] mb-3 font-medium">
            <Star className="w-3.5 h-3.5 fill-[#22c55e]" />
            FEATURED - Betting Market Live!
          </div>
        )}

        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-[#111] flex items-center justify-center overflow-hidden flex-shrink-0">
            {coin.image ? (
              <Image src={coin.image} alt={coin.name} width={48} height={48} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-[#333]">{coin.ticker.slice(1, 3)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-medium truncate">{coin.name}</h3>
              <span className="text-xs px-2 py-0.5 bg-[#111] text-[#666] rounded-md flex-shrink-0">{coin.category}</span>
            </div>
            <p className="text-[#22c55e] text-sm font-medium">{coin.ticker}</p>
          </div>
          <div className={`text-sm font-semibold flex-shrink-0 ${score >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
            {score >= 0 ? '+' : ''}{score}
          </div>
        </div>

        {/* Description */}
        <p className="text-[#888] text-sm leading-relaxed mb-4 line-clamp-2">{coin.description}</p>

        {/* Progress to featured */}
        {!coin.is_featured && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#555]">Progress to Featured</span>
              <span className="text-[#666]">{localUpvotes}/15 upvotes</span>
            </div>
            <div className="h-1.5 bg-[#111] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#22c55e] to-[#4ade80] transition-all duration-300"
                style={{ width: `${progressTo15}%` }}
              />
            </div>
          </div>
        )}

        {/* Sentiment bar (for featured coins) */}
        {coin.is_featured && (
          <div className="mb-3">
            <div className="h-1.5 bg-[#111] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#22c55e] to-[#4ade80]"
                style={{ width: `${likePercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Vote buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVote('up')}
            disabled={isVoting || !isConnected}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${
              userVote === 'up'
                ? 'bg-[#22c55e] text-white'
                : 'bg-[#111] text-[#666] hover:text-[#22c55e] hover:bg-[#0d1f0d] border border-[#1a1a1a]'
            } ${!isConnected && 'opacity-50 cursor-not-allowed'}`}
          >
            <ThumbsUp className={`w-4 h-4 ${userVote === 'up' ? 'fill-white' : ''}`} />
            <span className="text-sm font-medium">{localUpvotes}</span>
          </button>
          <button
            onClick={() => handleVote('down')}
            disabled={isVoting || !isConnected}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${
              userVote === 'down'
                ? 'bg-[#ef4444] text-white'
                : 'bg-[#111] text-[#666] hover:text-[#ef4444] hover:bg-[#1f0d0d] border border-[#1a1a1a]'
            } ${!isConnected && 'opacity-50 cursor-not-allowed'}`}
          >
            <ThumbsDown className={`w-4 h-4 ${userVote === 'down' ? 'fill-white' : ''}`} />
            <span className="text-sm font-medium">{localDownvotes}</span>
          </button>
        </div>

        {/* Links */}
        {(coin.twitter || coin.website || coin.contract_address) && (
          <div className="flex items-center gap-2 mt-3">
            {coin.twitter && (
              <a
                href={`https://twitter.com/${coin.twitter.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#555] hover:text-[#1da1f2] transition-colors"
              >
                {coin.twitter}
              </a>
            )}
            {coin.website && (
              <a
                href={coin.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-[#555] hover:text-white transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Website
              </a>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-[#050505] border-t border-[#1a1a1a] flex items-center justify-between text-xs text-[#555]">
        <span>submitted {new Date(coin.created_at).toLocaleDateString()}</span>
        {coin.market_id && (
          <span className="text-[#22c55e]">Market active</span>
        )}
      </div>
    </div>
  );
}

export function CoinsPanel() {
  const { coins, coinsLoading, fetchCoins, isConnected } = useStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'memecoin' | 'defi' | 'gaming' | 'ai' | 'other'>('all');
  const [sort, setSort] = useState<'hot' | 'new' | 'top'>('hot');
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch coins on mount and when filter changes
  useEffect(() => {
    fetchCoins(filter === 'all' ? undefined : filter);
  }, [filter, fetchCoins]);

  // Filter and sort coins
  const filteredCoins = coins
    .filter(coin => {
      if (search && !coin.name.toLowerCase().includes(search.toLowerCase()) &&
          !coin.ticker.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sort) {
        case 'hot':
          // Featured coins first, then by score weighted by recency
          if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
          const aScore = (a.upvotes - a.downvotes) * (1 / (Date.now() - new Date(a.created_at).getTime()));
          const bScore = (b.upvotes - b.downvotes) * (1 / (Date.now() - new Date(b.created_at).getTime()));
          return bScore - aScore;
        case 'new':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'top':
          return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
        default:
          return 0;
      }
    });

  return (
    <div className="h-full bg-[#050505] flex flex-col">
      {/* Header */}
      <div className="border-b border-[#151515] px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-white font-medium">Community Coins</h2>
            <p className="text-xs text-[#555]">Submit coins and vote - 15 upvotes = Featured!</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#22c55e] hover:bg-[#1ea550] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Submit
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#333]" />
          <input
            type="text"
            placeholder="Search coins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-[#333] focus:outline-none focus:border-[#2a2a2a]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sort */}
          <div className="flex items-center gap-1 bg-[#0a0a0a] rounded-lg p-1">
            {(['hot', 'new', 'top'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  sort === s ? 'bg-[#1a1a1a] text-white' : 'text-[#555] hover:text-[#888]'
                }`}
              >
                {s === 'hot' && <Flame className="w-3 h-3" />}
                {s === 'new' && <Clock className="w-3 h-3" />}
                {s === 'top' && <TrendingUp className="w-3 h-3" />}
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-[#1a1a1a]" />

          {/* Category filter */}
          {(['all', 'memecoin', 'defi', 'ai', 'gaming', 'other'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                filter === f ? 'bg-[#1a1a1a] text-white' : 'text-[#555] hover:text-[#888]'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {coinsLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#333] animate-spin mb-3" />
            <p className="text-[#666] text-sm">Loading coins...</p>
          </div>
        ) : filteredCoins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="w-8 h-8 text-[#333] mb-3" />
            <p className="text-[#666] text-sm">No coins found</p>
            <p className="text-[#444] text-xs mt-1">Be the first to submit one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCoins.map((coin) => (
              <CoinCard key={coin.id} coin={coin} />
            ))}
          </div>
        )}
      </div>

      {/* Wallet connection notice */}
      {!isConnected && (
        <div className="px-4 py-3 bg-[#0a0a0a] border-t border-[#1a1a1a] text-center">
          <p className="text-xs text-[#555]">Connect your wallet to vote and submit coins</p>
        </div>
      )}

      {/* Add Coin Modal */}
      {showAddModal && (
        <AddCoinModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
