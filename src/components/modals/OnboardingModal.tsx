'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useStore } from '@/store';
import { ArrowRight, Check, Sparkles, TrendingUp, Activity, Zap } from 'lucide-react';

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Welcome to the Arena',
    subtitle: 'Spartan',
    description: 'apella.fun is the prediction market terminal built for degens, traders, and truth-seekers.',
    features: [
      'Professional trading tools',
      'Real-time market data',
      'Multi-platform support',
    ],
    showMascot: true,
    mascotSize: 'large',
  },
  {
    id: 'platforms',
    title: 'Multi-Platform Trading',
    subtitle: 'One Interface, All Markets',
    description: 'Trade across Polymarket and Kalshi from a single, unified interface.',
    features: [
      'Unified order management',
      'Cross-platform portfolio tracking',
      'Real-time price aggregation',
    ],
    showMascot: false,
    icon: TrendingUp,
  },
  {
    id: 'flow',
    title: 'Whale Flow Intelligence',
    subtitle: 'Follow the Smart Money',
    description: 'Track large trades in real-time. See whale movements before the crowd.',
    features: [
      'Live trade feed',
      'New wallet detection',
      'Smart money alerts',
    ],
    showMascot: false,
    icon: Activity,
  },
  {
    id: 'ai',
    title: 'AI-Powered Research',
    subtitle: 'Your Edge in the Market',
    description: 'Research Canvas and Quick Chat help you analyze markets faster than ever.',
    features: [
      'Instant market analysis',
      'Evidence tracking',
      'Spatial research tools',
    ],
    showMascot: false,
    icon: Sparkles,
  },
  {
    id: 'ready',
    title: 'Ready to Conquer',
    subtitle: 'Enter the Arena',
    description: 'Your wallet is connected. Start exploring markets, tracking whales, and making winning predictions.',
    features: [],
    showMascot: true,
    mascotSize: 'large',
  },
];

export function OnboardingModal() {
  const { showOnboarding, setShowOnboarding, walletAddress } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (showOnboarding) {
      setCurrentStep(0);
    }
  }, [showOnboarding]);

  if (!showOnboarding) return null;

  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isAnimating) return;

    if (isLastStep) {
      setShowOnboarding(false);
    } else {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleBack = () => {
    if (isAnimating || currentStep === 0) return;

    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(currentStep - 1);
      setIsAnimating(false);
    }, 150);
  };

  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
      {/* Animated pixel texture at top */}
      <div
        className="absolute top-0 left-0 right-0 h-3 animate-texture-scroll"
        style={{
          backgroundImage: 'url(/brand/pixel-texture.jpeg)',
          backgroundSize: '200% 100%',
          backgroundRepeat: 'repeat-x',
        }}
      />

      {/* Modal */}
      <div className={`relative bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg w-full max-w-lg overflow-hidden transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {/* Animated pixel texture bar */}
        <div
          className="h-3 w-full animate-texture-scroll"
          style={{
            backgroundImage: 'url(/brand/pixel-texture.jpeg)',
            backgroundSize: '200% 100%',
            backgroundRepeat: 'repeat-x',
          }}
        />

        {/* Progress bar */}
        <div className="h-0.5 bg-[#1a1a1a]">
          <div
            className="h-full bg-white transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/icon.png"
              alt="Apella"
              width={24}
              height={24}
            />
            <span className="text-[10px] text-[#555] uppercase tracking-wider">
              {currentStep + 1} of {onboardingSteps.length}
            </span>
          </div>
          <button
            onClick={() => setShowOnboarding(false)}
            className="text-[11px] text-[#555] hover:text-white transition-colors uppercase tracking-wider"
          >
            Skip intro
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          {/* Icon or Mascot */}
          <div className="flex justify-center mb-6">
            {step.showMascot ? (
              <div className="relative">
                <Image
                  src="/brand/mascot.png"
                  alt="Apella Mascot"
                  width={step.mascotSize === 'large' ? 140 : 100}
                  height={step.mascotSize === 'large' ? 196 : 140}
                  className="mascot-bounce"
                />
                {isFirstStep && (
                  <div className="absolute -right-4 top-0 animate-fade-in">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            ) : StepIcon ? (
              <div className="w-20 h-20 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                <StepIcon className="w-10 h-10 text-white" />
              </div>
            ) : null}
          </div>

          {/* Text content */}
          <div className="text-center mb-8">
            {step.subtitle && (
              <p className="text-[11px] text-[#888] uppercase tracking-[0.2em] mb-2">{step.subtitle}</p>
            )}
            <h2 className="text-2xl font-semibold text-white mb-4">{step.title}</h2>
            <p className="text-[#666] leading-relaxed max-w-md mx-auto">{step.description}</p>
          </div>

          {/* Features list */}
          {step.features.length > 0 && (
            <div className="space-y-3 max-w-sm mx-auto mb-8">
              {step.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 text-sm animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-[#888]">{feature}</span>
                </div>
              ))}
            </div>
          )}

          {/* Wallet info on last step */}
          {isLastStep && (
            <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-4 mb-6 animate-fade-in-up">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center">
                  <Image
                    src="/brand/icon.png"
                    alt=""
                    width={20}
                    height={20}
                    className="opacity-90"
                  />
                </div>
                <div>
                  <p className="text-[10px] text-[#555] uppercase tracking-wider">Connected Wallet</p>
                  <p className="text-sm text-white font-mono">{walletAddress}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#1a1a1a] bg-[#0f0f0f]">
          <button
            onClick={handleBack}
            disabled={isFirstStep}
            className={`text-sm transition-colors ${
              isFirstStep
                ? 'text-[#333] cursor-not-allowed'
                : 'text-[#666] hover:text-white'
            }`}
          >
            Back
          </button>

          {/* Progress dots */}
          <div className="flex items-center gap-2">
            {onboardingSteps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => !isAnimating && setCurrentStep(idx)}
                className={`transition-all duration-300 ${
                  idx === currentStep
                    ? 'w-6 h-1.5 bg-white rounded-full'
                    : idx < currentStep
                    ? 'w-1.5 h-1.5 bg-white/50 rounded-full hover:bg-white'
                    : 'w-1.5 h-1.5 bg-[#333] rounded-full hover:bg-[#555]'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-[#e0e0e0] transition-colors"
          >
            {isLastStep ? 'Enter Arena' : 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Corner mascot decoration */}
      <div className="absolute bottom-8 right-8 opacity-10 pointer-events-none hidden lg:block">
        <Image
          src="/brand/mascot.png"
          alt=""
          width={80}
          height={112}
          className="grayscale"
        />
      </div>
    </div>
  );
}
