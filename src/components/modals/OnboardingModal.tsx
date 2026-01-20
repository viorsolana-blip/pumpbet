'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useStore } from '@/store';
import { ArrowRight, Check, Sparkles, TrendingUp, Activity, Zap, Swords, Target } from 'lucide-react';

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Welcome to the Trenches',
    subtitle: 'Soldier',
    description: 'dumpbet.fun is where degens come to bet on KOL milestones, memecoin predictions, and trench warfare outcomes.',
    features: [
      'Bet on KOL follower milestones',
      'Real-time whale flow tracking',
      'Community-driven markets',
    ],
    showMascot: true,
    mascotSize: 'large',
  },
  {
    id: 'kols',
    title: 'KOL Trenches',
    subtitle: 'Bet on Influencers',
    description: 'Pick your side. Will ansem hit 1M followers? Will that shitcoin caller pump or dump? Put your SOL where your mouth is.',
    features: [
      'Social milestone markets',
      'Performance tracking',
      'Live resolution feeds',
    ],
    showMascot: false,
    icon: Swords,
  },
  {
    id: 'flow',
    title: 'Whale Flow Intelligence',
    subtitle: 'Follow the Smart Money',
    description: 'Track large trades in real-time. See whale movements before the crowd catches on.',
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
    subtitle: 'Your Edge in the Trenches',
    description: 'Research Canvas and Quick Chat help you analyze markets and make informed bets.',
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
    title: 'Ready for Battle',
    subtitle: 'Enter the Trenches',
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
    <div className="fixed inset-0 bg-[#3A4A2D]/90 backdrop-blur-sm flex items-center justify-center z-50">
      {/* Decorative top stripe */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#6B7B5E] via-[#8B7355] to-[#6B7B5E]" />

      {/* Modal */}
      <div className={`relative bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {/* Decorative top bar with gradient */}
        <div className="h-2 w-full bg-gradient-to-r from-[#6B7B5E] via-[#8B7355] to-[#6B7B5E]" />

        {/* Progress bar */}
        <div className="h-1 bg-[#E8E2D0]">
          <div
            className="h-full bg-[#6B7B5E] transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#E8E2D0]">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/helmet-logo.png"
              alt="dumpbet.fun"
              width={28}
              height={28}
              className="rounded"
            />
            <span className="text-[11px] text-[#8B9B7E] uppercase tracking-wider font-bambino font-bold">
              {currentStep + 1} of {onboardingSteps.length}
            </span>
          </div>
          <button
            onClick={() => setShowOnboarding(false)}
            className="text-[11px] text-[#8B9B7E] hover:text-[#5A6A4D] transition-colors uppercase tracking-wider font-bambino font-bold"
          >
            Skip intro
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-8 bg-[#EFEAD9]">
          {/* Icon or Mascot */}
          <div className="flex justify-center mb-6">
            {step.showMascot ? (
              <div className="relative">
                <div className="absolute -inset-4 bg-[#6B7B5E]/20 rounded-full blur-2xl" />
                <Image
                  src="/brand/mascot.png"
                  alt="dumpbet.fun Mascot"
                  width={step.mascotSize === 'large' ? 120 : 80}
                  height={step.mascotSize === 'large' ? 120 : 80}
                  className="relative mascot-bounce"
                />
                {isFirstStep && (
                  <div className="absolute -right-2 -top-2 animate-fade-in">
                    <div className="bg-[#6B7B5E] rounded-full p-1.5">
                      <Zap className="w-4 h-4 text-[#F5F0E1]" />
                    </div>
                  </div>
                )}
              </div>
            ) : StepIcon ? (
              <div className="w-20 h-20 rounded-2xl bg-[#6B7B5E]/10 border-2 border-[#6B7B5E]/30 flex items-center justify-center">
                <StepIcon className="w-10 h-10 text-[#5A6A4D]" />
              </div>
            ) : null}
          </div>

          {/* Text content */}
          <div className="text-center mb-8">
            {step.subtitle && (
              <p className="text-[11px] text-[#8B9B7E] uppercase tracking-[0.2em] mb-2 font-bambino font-bold">{step.subtitle}</p>
            )}
            <h2 className="text-2xl text-[#3A4A2D] mb-4">
              <span className="font-hyperbole text-[#5A6A4D]">{step.title.split(' ')[0]}</span>
              <span className="font-bambino"> {step.title.split(' ').slice(1).join(' ')}</span>
            </h2>
            <p className="text-[#6B7B5E] leading-relaxed max-w-md mx-auto font-bambino">{step.description}</p>
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
                  <div className="w-6 h-6 rounded-lg bg-[#6B7B5E] flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#F5F0E1]" />
                  </div>
                  <span className="text-[#5A6A4D] font-bambino">{feature}</span>
                </div>
              ))}
            </div>
          )}

          {/* Wallet info on last step */}
          {isLastStep && (
            <div className="bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-2xl p-4 mb-6 animate-fade-in-up">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6B7B5E] to-[#8B7355] flex items-center justify-center">
                  <Image
                    src="/brand/helmet-logo.png"
                    alt=""
                    width={24}
                    height={24}
                  />
                </div>
                <div>
                  <p className="text-[10px] text-[#8B9B7E] uppercase tracking-wider font-bambino font-bold">Connected Wallet</p>
                  <p className="text-sm text-[#3A4A2D] font-mono font-medium">{walletAddress}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t-2 border-[#E8E2D0] bg-[#F5F0E1]">
          <button
            onClick={handleBack}
            disabled={isFirstStep}
            className={`text-sm font-bambino font-bold transition-colors ${
              isFirstStep
                ? 'text-[#D4CDB8] cursor-not-allowed'
                : 'text-[#8B9B7E] hover:text-[#5A6A4D]'
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
                    ? 'w-6 h-2 bg-[#6B7B5E] rounded-full'
                    : idx < currentStep
                    ? 'w-2 h-2 bg-[#6B7B5E]/50 rounded-full hover:bg-[#6B7B5E]'
                    : 'w-2 h-2 bg-[#D4CDB8] rounded-full hover:bg-[#8B9B7E]'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#6B7B5E] text-[#F5F0E1] rounded-xl text-sm font-bambino font-bold hover:bg-[#5A6A4D] transition-colors shadow-lg"
          >
            {isLastStep ? 'Enter Trenches' : 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Corner mascot decoration */}
      <div className="absolute bottom-8 right-8 opacity-20 pointer-events-none hidden lg:block">
        <Image
          src="/brand/mascot.png"
          alt=""
          width={80}
          height={80}
        />
      </div>
    </div>
  );
}
