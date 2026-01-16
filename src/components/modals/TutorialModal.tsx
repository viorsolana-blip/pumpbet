'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Swords, BarChart2, MessageSquare } from 'lucide-react';
import { useStore } from '@/store';

const tutorialSteps = [
  {
    id: 'welcome',
    title: 'Bet On The Trenches',
    description: 'Your edge in the Solana trenches. Bet on KOL milestones, token pumps, and memecoin outcomes with SOL.',
    icon: Swords,
  },
  {
    id: 'features',
    title: 'KOLs + Markets + Flow',
    description: 'Bet on KOLs hitting targets, track whale trades in real-time, and access Polymarket & Kalshi markets - all in one terminal.',
    icon: BarChart2,
  },
  {
    id: 'chat',
    title: 'AI Trench Assistant',
    description: 'Chat scrapes X for alpha and gives you assisted betting recommendations. Ask about any KOL, token, or market.',
    icon: MessageSquare,
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
  const StepIcon = step.icon;

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
    localStorage.setItem('pumpbet_tutorial_seen', 'true');
    setShowTutorial(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Olive backdrop */}
      <div className="absolute inset-0 bg-[#3A4A2D]/90 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Top accent gradient */}
        <div className="h-2 w-full bg-gradient-to-r from-[#6B7B5E] via-[#8B7355] to-[#6B7B5E]" />

        {/* Content */}
        <div className="p-8 bg-[#EFEAD9]">
          {/* Animated Icon/Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 blur-2xl bg-[#6B7B5E]/30 animate-pulse rounded-full" />
              {/* Icon container */}
              <div className="relative w-20 h-20 bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-2xl flex items-center justify-center shadow-lg">
                <StepIcon className="w-10 h-10 text-[#5A6A4D]" />
              </div>
              {/* Mascot peek */}
              <div className="absolute -bottom-2 -right-2">
                <Image
                  src="/brand/mascot.png"
                  alt=""
                  width={32}
                  height={32}
                  className="opacity-80"
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl text-[#3A4A2D] text-center mb-3">
            <span className="font-hyperbole text-[#5A6A4D]">{step.title.split(' ')[0]}</span>
            <span className="font-bambino"> {step.title.split(' ').slice(1).join(' ')}</span>
          </h2>

          {/* Description */}
          <p className="text-[#6B7B5E] text-center text-sm leading-relaxed mb-8 font-bambino">
            {step.description}
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {tutorialSteps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-6 h-2 bg-[#6B7B5E]'
                    : idx < currentStep
                    ? 'w-2 h-2 bg-[#6B7B5E]/50'
                    : 'w-2 h-2 bg-[#D4CDB8]'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          {isLastStep ? (
            <button
              onClick={handleExplore}
              className="group relative w-full px-6 py-3.5 bg-[#6B7B5E] border-2 border-[#5A6A4D] rounded-xl font-bambino font-bold overflow-hidden transition-all hover:bg-[#5A6A4D] shadow-lg"
            >
              <span className="relative text-[#F5F0E1]">
                Enter the Trenches
              </span>
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={isFirstStep}
                className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bambino font-bold transition-colors ${
                  isFirstStep
                    ? 'text-[#D4CDB8] cursor-not-allowed'
                    : 'text-[#8B9B7E] hover:text-[#5A6A4D] hover:bg-[#F5F0E1]'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleExplore}
                className="text-sm text-[#8B9B7E] hover:text-[#5A6A4D] transition-colors font-bambino font-bold"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-5 py-2.5 bg-[#6B7B5E] text-[#F5F0E1] rounded-xl text-sm font-bambino font-bold hover:bg-[#5A6A4D] transition-colors shadow-lg"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer decoration */}
        <div className="h-1 w-full bg-gradient-to-r from-[#6B7B5E] via-[#8B7355] to-[#6B7B5E]" />
      </div>
    </div>
  );
}
