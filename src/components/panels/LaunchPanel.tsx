'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Rocket,
  Heart,
  Plus,
  Clock,
  TrendingUp,
  Sparkles,
  Trophy,
  Users,
  Zap,
  Search,
  Filter,
  X,
  Loader2,
  CheckCircle,
  Calendar,
  Target,
  Swords,
  ImagePlus,
  Upload,
  Bitcoin,
  Coins,
  Landmark,
  User,
  HelpCircle,
} from 'lucide-react';
import { useStore, PendingPrediction } from '@/store';

const GRADUATION_THRESHOLD = 15;

// Category colors and icons
const categoryConfig: Record<string, { bg: string; text: string; border: string; icon: React.ElementType }> = {
  kol: { bg: 'bg-[#6B7B5E]/10', text: 'text-[#6B7B5E]', border: 'border-[#6B7B5E]/30', icon: User },
  crypto: { bg: 'bg-[#D4A060]/10', text: 'text-[#D4A060]', border: 'border-[#D4A060]/30', icon: Bitcoin },
  token: { bg: 'bg-[#5C8A4A]/10', text: 'text-[#5C8A4A]', border: 'border-[#5C8A4A]/30', icon: Coins },
  sports: { bg: 'bg-[#5A7A9A]/10', text: 'text-[#5A7A9A]', border: 'border-[#5A7A9A]/30', icon: Trophy },
  politics: { bg: 'bg-[#8B7355]/10', text: 'text-[#8B7355]', border: 'border-[#8B7355]/30', icon: Landmark },
  other: { bg: 'bg-[#9AAA8D]/10', text: 'text-[#9AAA8D]', border: 'border-[#9AAA8D]/30', icon: HelpCircle },
};

// Time formatting
function formatTimeAgo(date: string): string {
  try {
    const now = new Date();
    const created = new Date(date);
    if (isNaN(created.getTime())) return 'Recently';

    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}

function formatTimeUntil(date: string): string {
  try {
    const now = new Date();
    const end = new Date(date);
    if (isNaN(end.getTime())) return 'TBD';

    const diffMs = end.getTime() - now.getTime();
    if (diffMs <= 0) return 'Ended';
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (diffDays > 0) return `${diffDays}d ${diffHours}h`;
    if (diffHours > 0) return `${diffHours}h`;
    return 'Soon';
  } catch {
    return 'TBD';
  }
}

// Create Prediction Modal
function CreatePredictionModal({ onClose }: { onClose: () => void }) {
  const { createPendingPrediction, walletAddressFull } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'crypto' as 'kol' | 'crypto' | 'token' | 'sports' | 'politics' | 'other',
    resolutionCriteria: '',
    endDate: '',
    imageUrl: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle file upload
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, GIF, WebP)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setError('Image must be under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      setFormData({ ...formData, imageUrl: dataUrl });
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate image is uploaded
    if (!formData.imageUrl) {
      setError('Please upload an image for your prediction');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createPendingPrediction({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        resolutionCriteria: formData.resolutionCriteria,
        endDate: formData.endDate,
        createdBy: walletAddressFull || null,
        imageUrl: formData.imageUrl,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to create prediction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#D4A060] to-[#C49050] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-bambino">Launch Prediction</h2>
              <p className="text-xs text-white/80 font-satoshi">Get 15 likes to go live</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {success ? (
          <div className="p-8 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-[#5C8A4A]/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-[#5C8A4A]" />
            </div>
            <h3 className="text-xl font-bold text-[#3A4A2D] font-bambino mb-2">Prediction Launched!</h3>
            <p className="text-[#8B9B7E] text-sm font-satoshi">Get 15 likes to make it live</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-[#3A4A2D] mb-1.5 font-bambino">
                Prediction Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Will [X] happen by [date]?"
                className="w-full px-4 py-3 bg-[#EFEAD9] border-2 border-[#D4CDB8] rounded-xl text-[#3A4A2D] placeholder:text-[#8B9B7E] focus:outline-none focus:border-[#6B7B5E] transition-colors font-satoshi"
                required
                minLength={10}
                maxLength={200}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-[#3A4A2D] mb-1.5 font-bambino">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add more context about your prediction..."
                rows={3}
                className="w-full px-4 py-3 bg-[#EFEAD9] border-2 border-[#D4CDB8] rounded-xl text-[#3A4A2D] placeholder:text-[#8B9B7E] focus:outline-none focus:border-[#6B7B5E] transition-colors font-satoshi resize-none"
                required
              />
            </div>

            {/* Category & End Date Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#3A4A2D] mb-1.5 font-bambino">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-4 py-3 bg-[#EFEAD9] border-2 border-[#D4CDB8] rounded-xl text-[#3A4A2D] focus:outline-none focus:border-[#6B7B5E] transition-colors font-satoshi"
                >
                  <option value="crypto">Crypto</option>
                  <option value="kol">KOL</option>
                  <option value="token">Token</option>
                  <option value="sports">Sports</option>
                  <option value="politics">Politics</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#3A4A2D] mb-1.5 font-bambino">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-[#EFEAD9] border-2 border-[#D4CDB8] rounded-xl text-[#3A4A2D] focus:outline-none focus:border-[#6B7B5E] transition-colors font-satoshi"
                  required
                />
              </div>
            </div>

            {/* Resolution Criteria */}
            <div>
              <label className="block text-sm font-bold text-[#3A4A2D] mb-1.5 font-bambino">
                Resolution Criteria *
              </label>
              <input
                type="text"
                value={formData.resolutionCriteria}
                onChange={(e) => setFormData({ ...formData, resolutionCriteria: e.target.value })}
                placeholder="How will this be verified? (e.g., CoinGecko price, Twitter post count)"
                className="w-full px-4 py-3 bg-[#EFEAD9] border-2 border-[#D4CDB8] rounded-xl text-[#3A4A2D] placeholder:text-[#8B9B7E] focus:outline-none focus:border-[#6B7B5E] transition-colors font-satoshi"
                required
              />
            </div>

            {/* Image Upload (Required) */}
            <div>
              <label className="block text-sm font-bold text-[#3A4A2D] mb-1.5 font-bambino">
                Image / Logo *
              </label>
              {!imagePreview ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-[#6B7B5E] bg-[#6B7B5E]/10'
                      : 'border-[#D4CDB8] bg-[#EFEAD9] hover:border-[#8B9B7E]'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-[#D4CDB8] flex items-center justify-center">
                      <ImagePlus className="w-6 h-6 text-[#6B7B5E]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#3A4A2D] font-bambino">
                        Drop image here or click to upload
                      </p>
                      <p className="text-xs text-[#8B9B7E] font-satoshi mt-1">
                        PNG, JPG, GIF, WebP • Max 2MB
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative bg-[#EFEAD9] border-2 border-[#D4CDB8] rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#D4CDB8] flex-shrink-0">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#3A4A2D] font-bambino">Image uploaded</p>
                      <p className="text-xs text-[#8B9B7E] font-satoshi">Ready to launch</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData({ ...formData, imageUrl: '' });
                      }}
                      className="p-2 hover:bg-[#E8E2D0] rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-[#8B9B7E]" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 bg-[#C45A4A]/10 border border-[#C45A4A]/30 rounded-xl">
                <p className="text-[#C45A4A] text-sm font-satoshi">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-[#D4A060] to-[#C49050] hover:from-[#E4B070] hover:to-[#D4A060] text-white font-bold rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-bambino flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Launching...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  Launch Prediction
                </>
              )}
            </button>

            {/* Note */}
            <p className="text-xs text-[#8B9B7E] text-center font-satoshi">
              No wallet needed to create. Anyone can launch predictions!
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

// Prediction Card
function PredictionCard({ prediction }: { prediction: PendingPrediction }) {
  const { likePendingPrediction } = useStore();
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(prediction.likes);
  const [showConfetti, setShowConfetti] = useState(false);
  const [imageError, setImageError] = useState(false);

  const progress = (localLikes / GRADUATION_THRESHOLD) * 100;
  const isClose = localLikes >= GRADUATION_THRESHOLD - 3;
  const likesNeeded = GRADUATION_THRESHOLD - localLikes;
  const config = categoryConfig[prediction.category] || categoryConfig.other;
  const CategoryIcon = config.icon;

  const handleLike = async () => {
    if (isLiking || hasLiked) return;
    setIsLiking(true);

    const result = await likePendingPrediction(prediction.id);

    if (result.success) {
      setLocalLikes(result.likes);
      setHasLiked(true);
      if (result.isGraduated) {
        setShowConfetti(true);
      }
    }

    setIsLiking(false);
  };

  return (
    <div
      className={`relative bg-[#EFEAD9] rounded-2xl border-2 ${
        isClose ? 'border-[#D4A060] shadow-lg shadow-[#D4A060]/20' : 'border-[#D4CDB8]'
      } overflow-hidden transition-all hover:shadow-lg group`}
    >
      {/* Graduation glow effect */}
      {isClose && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4A060]/5 to-[#E4B070]/10 animate-pulse" />
      )}

      {/* Confetti effect */}
      {showConfetti && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#5C8A4A]/20 z-10">
          <div className="text-center">
            <Trophy className="w-12 h-12 text-[#D4A060] mx-auto mb-2 animate-bounce" />
            <p className="text-[#3A4A2D] font-bold font-bambino">Graduated!</p>
          </div>
        </div>
      )}

      <div className="relative p-4">
        {/* Header with category icon or uploaded image */}
        <div className="flex items-start gap-3 mb-3">
          {/* Category Icon or User-uploaded Image */}
          {prediction.imageUrl && !imageError ? (
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#D4CDB8] flex-shrink-0 border-2 border-[#D4CDB8]">
              <img
                src={prediction.imageUrl}
                alt=""
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg} border-2 ${config.border}`}
            >
              <CategoryIcon className={`w-6 h-6 ${config.text}`} />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${config.bg} ${config.text} border ${config.border} uppercase font-satoshi`}>
                {prediction.category}
              </span>
              {isClose && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#D4A060]/20 text-[#D4A060] border border-[#D4A060]/30 flex items-center gap-1 font-satoshi">
                  <Sparkles className="w-3 h-3" />
                  Almost Live
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-[#3A4A2D] line-clamp-2 font-bambino">
              {prediction.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-[#6B7B5E] line-clamp-2 mb-3 font-satoshi">
          {prediction.description}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-3 text-[10px] text-[#8B9B7E] mb-3 font-satoshi">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(prediction.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Ends {formatTimeUntil(prediction.endDate)}
          </span>
          {prediction.createdBy && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {prediction.createdBy}
            </span>
          )}
        </div>

        {/* Progress and Like section */}
        <div className="flex items-center gap-3">
          {/* Progress bar */}
          <div className="flex-1">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-[#6B7B5E] font-satoshi">
                {likesNeeded > 0 ? `${likesNeeded} more to launch` : 'Ready to launch!'}
              </span>
              <span className={`font-bold ${isClose ? 'text-[#D4A060]' : 'text-[#8B9B7E]'} font-satoshi`}>
                {localLikes}/{GRADUATION_THRESHOLD}
              </span>
            </div>
            <div className="h-1.5 bg-[#D4CDB8] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isClose
                    ? 'bg-gradient-to-r from-[#D4A060] to-[#E4B070]'
                    : 'bg-[#5C8A4A]'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Like button - compact heart */}
          <button
            onClick={handleLike}
            disabled={isLiking || hasLiked}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm transition-all font-satoshi ${
              hasLiked
                ? 'bg-[#E88B7D]/20 text-[#E88B7D]'
                : 'bg-[#EFEAD9] hover:bg-[#E88B7D]/20 text-[#8B9B7E] hover:text-[#E88B7D] border border-[#D4CDB8] hover:border-[#E88B7D]/30'
            } disabled:cursor-default`}
          >
            {isLiking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
            )}
            <span>{localLikes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Panel
export function LaunchPanel() {
  const { pendingPredictions, pendingPredictionsLoading, fetchPendingPredictions, addTab, setSplitPanels, splitView } = useStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'kol' | 'crypto' | 'token' | 'sports' | 'politics' | 'other'>('all');
  const [sort, setSort] = useState<'hot' | 'new' | 'close'>('hot');

  useEffect(() => {
    fetchPendingPredictions();
  }, [fetchPendingPredictions]);

  const goToTrenches = () => {
    const newId = addTab({ type: 'trenches', title: 'Trenches', color: '#6B7B5E' });
    if (newId && splitView) {
      const { splitPanels } = useStore.getState();
      const newPanels = [...splitPanels];
      newPanels[0] = newId;
      setSplitPanels(newPanels);
    }
  };

  // Filter and sort predictions
  const filteredPredictions = pendingPredictions
    .filter((p) => {
      if (filter !== 'all' && p.category !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === 'hot') return b.likes - a.likes;
      if (sort === 'new') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === 'close') {
        const aClose = GRADUATION_THRESHOLD - a.likes;
        const bClose = GRADUATION_THRESHOLD - b.likes;
        return aClose - bClose;
      }
      return 0;
    });

  return (
    <div className="h-full bg-[#F5F0E1] flex flex-col">
      {/* Decorative top stripe */}
      <div className="w-full h-1.5 bg-gradient-to-r from-[#D4A060] via-[#6B7B5E] to-[#D4A060]" />

      {/* Header */}
      <div className="border-b-2 border-[#D4CDB8] px-4 py-3 bg-[#EFEAD9]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#D4A060] to-[#C49050] rounded-xl flex items-center justify-center shadow-md">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#3A4A2D] font-bambino">Launch Zone</h2>
              <p className="text-xs text-[#8B9B7E] font-satoshi">Create predictions. Get 15 likes. Go live.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Go to Trenches button */}
            <button
              onClick={goToTrenches}
              className="flex items-center gap-2 px-3 py-2 bg-[#F5F0E1] border-2 border-[#6B7B5E] hover:bg-[#6B7B5E] text-[#6B7B5E] hover:text-white font-bold rounded-xl transition-all hover:scale-105 font-bambino text-sm"
            >
              <Swords className="w-4 h-4" />
              Trenches
            </button>
            {/* Create button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4A060] to-[#C49050] hover:from-[#E4B070] hover:to-[#D4A060] text-white font-bold rounded-xl transition-all hover:scale-105 shadow-md font-bambino"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B9B7E]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search predictions..."
              className="w-full pl-10 pr-4 py-2 bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-xl text-sm text-[#3A4A2D] placeholder:text-[#8B9B7E] focus:outline-none focus:border-[#6B7B5E] transition-colors font-satoshi"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-xl text-sm text-[#3A4A2D] focus:outline-none focus:border-[#6B7B5E] font-satoshi"
          >
            <option value="all">All</option>
            <option value="crypto">Crypto</option>
            <option value="kol">KOL</option>
            <option value="token">Token</option>
            <option value="sports">Sports</option>
            <option value="politics">Politics</option>
            <option value="other">Other</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="px-3 py-2 bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-xl text-sm text-[#3A4A2D] focus:outline-none focus:border-[#6B7B5E] font-satoshi"
          >
            <option value="hot">Most Liked</option>
            <option value="new">Newest</option>
            <option value="close">Closest to Live</option>
          </select>
        </div>
      </div>

      {/* Stats Banner with branding */}
      <div className="px-4 py-3 bg-gradient-to-r from-[#EFEAD9] via-[#F5F0E1] to-[#EFEAD9] border-b-2 border-[#D4CDB8]">
        <div className="flex items-center justify-between">
          {/* Left mascot */}
          <div className="hidden md:flex items-center gap-2 opacity-60">
            <Image
              src="/brand/mascot.png"
              alt=""
              width={28}
              height={28}
              className="rounded-full"
            />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 text-sm flex-1">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#D4A060]" />
              <span className="text-[#5A6A4D] font-satoshi">
                <span className="font-bold">{pendingPredictions.length}</span> predictions waiting
              </span>
            </div>
            <div className="w-px h-4 bg-[#D4CDB8]" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#5C8A4A]" />
              <span className="text-[#5A6A4D] font-satoshi">
                <span className="font-bold">{pendingPredictions.filter((p) => p.likes >= GRADUATION_THRESHOLD - 3).length}</span> almost live
              </span>
            </div>
            <div className="w-px h-4 bg-[#D4CDB8]" />
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#D4A060]" />
              <span className="text-[#5A6A4D] font-satoshi">
                <span className="font-bold">{GRADUATION_THRESHOLD}</span> likes to go live
              </span>
            </div>
          </div>

          {/* Right mascot */}
          <div className="hidden md:flex items-center gap-2 opacity-60">
            <Image
              src="/brand/mascot.png"
              alt=""
              width={28}
              height={28}
              className="rounded-full transform scale-x-[-1]"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {pendingPredictionsLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#6B7B5E] animate-spin mb-3" />
            <p className="text-[#6B7B5E] text-sm font-bambino">Loading predictions...</p>
          </div>
        ) : filteredPredictions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-[#EFEAD9] rounded-2xl flex items-center justify-center mb-4">
              <Rocket className="w-8 h-8 text-[#D4CDB8]" />
            </div>
            <h3 className="text-lg font-bold text-[#3A4A2D] mb-2 font-bambino">No predictions yet</h3>
            <p className="text-[#8B9B7E] text-sm mb-4 font-satoshi">Be the first to launch a prediction!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4A060] to-[#C49050] text-white font-bold rounded-xl transition-all hover:scale-105 font-bambino"
            >
              <Plus className="w-4 h-4" />
              Create Prediction
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPredictions.map((prediction) => (
              <PredictionCard key={prediction.id} prediction={prediction} />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && <CreatePredictionModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}
