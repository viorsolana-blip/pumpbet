'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useStore } from '@/store';

const tutorialSteps = [
  {
    id: 'welcome',
    title: 'Where Truth-Seekers Find Their Edge',
    description: 'Terminal is built for serious prediction market traders who value data over noise. Professional infrastructure for research, analysis, and execution across all major markets.',
  },
  {
    id: 'markets',
    title: 'Multi-Platform Markets',
    description: 'Browse and trade markets from Polymarket and Kalshi in one unified interface. Real-time prices, volume data, and smart filtering to find opportunities fast.',
  },
  {
    id: 'flow',
    title: 'Whale Flow Intelligence',
    description: 'Track large trades as they happen. See where the smart money is moving, detect new wallets entering markets, and follow the whales to profitable opportunities.',
  },
  {
    id: 'research',
    title: 'AI-Powered Research',
    description: 'Use Quick Chat to ask questions about any market. Our AI searches across platforms, analyzes probabilities, and helps you make informed decisions.',
  },
  {
    id: 'trade',
    title: 'Execute With Precision',
    description: 'Place market or limit orders directly from the terminal. Track your positions, manage risk, and execute your strategy with professional-grade tools.',
  },
];

export function TutorialModal() {
  const { showTutorial, setShowTutorial } = useStore();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (showTutorial) {
      setCurrentStep(0);
    }
  }, [showTutorial]);

  if (!showTutorial) return null;

  const step = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleExplore = () => {
    setShowTutorial(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop */}
      <div className="absolute inset-0 bg-black/90" />

      {/* Modal */}
      <div className="relative bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-[#ff0000] via-[#ff4400] to-[#ff0000]" />

        {/* Content */}
        <div className="p-8">
          {/* Animated Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 blur-xl bg-[#ff0000]/20 animate-pulse" />
              {/* Logo with float animation */}
              <Image
                src="/brand/icon.png"
                alt="Apella"
                width={64}
                height={64}
                className="relative animate-float"
              />
              {/* Shine sweep */}
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <div className="absolute inset-0 -translate-x-full animate-shine-sweep bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-white text-center mb-3">
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-[#888] text-center text-sm leading-relaxed mb-8">
            {step.description}
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {tutorialSteps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-6 bg-white'
                    : idx < currentStep
                    ? 'w-1.5 bg-white/40'
                    : 'w-1.5 bg-[#333]'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          {isLastStep ? (
            <button
              onClick={handleExplore}
              className="group relative w-full px-6 py-3 bg-[#111] border border-[#1a1a1a] rounded-xl font-medium overflow-hidden transition-all hover:border-[#ff0000]/50"
            >
              {/* Texture background on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity animate-texture-scroll"
                style={{
                  backgroundImage: 'url(/brand/pixel-texture.jpeg)',
                  backgroundSize: '200% 100%',
                  backgroundRepeat: 'repeat-x',
                }}
              />
              <span className="relative text-[#888] group-hover:text-white transition-colors">
                Explore for now
              </span>
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={isFirstStep}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm transition-colors ${
                  isFirstStep
                    ? 'text-[#333] cursor-not-allowed'
                    : 'text-[#666] hover:text-white hover:bg-[#111]'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleExplore}
                className="text-sm text-[#555] hover:text-white transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-5 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-[#f0f0f0] transition-colors"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Keyframe styles */}
      <style jsx>{`
        @keyframes shine-sweep {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
        .animate-shine-sweep {
          animation: shine-sweep 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
