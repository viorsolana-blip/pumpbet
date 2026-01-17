'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Target, Coins, RefreshCw, Flame, TrendingUp } from 'lucide-react';

export default function FlywheelPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const steps = [
    { label: 'DEGENS BET', color: '#6B7B5E', Icon: Target },
    { label: 'FEES STACK', color: '#5C8A4A', Icon: Coins },
    { label: 'WE BUYBACK', color: '#5A7A9A', Icon: RefreshCw },
    { label: 'SUPPLY BURNS', color: '#C45A4A', Icon: Flame },
    { label: 'NUMBER GO UP', color: '#5C8A4A', Icon: TrendingUp },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [steps.length]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F0E1] text-[#3A4A2D] overflow-hidden relative">
      {/* Subtle texture overlay */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Gradient glow following mouse */}
      <div
        className="fixed w-[600px] h-[600px] rounded-full pointer-events-none opacity-10 blur-[120px] transition-all duration-300"
        style={{
          background: `radial-gradient(circle, ${steps[activeStep].color} 0%, transparent 70%)`,
          left: mousePos.x - 300,
          top: mousePos.y - 300,
        }}
      />

      {/* Floating decorative elements */}
      <div className="fixed top-20 left-10 w-4 h-4 bg-[#6B7B5E]/20 rounded-full animate-float" style={{ animationDelay: '0s' }} />
      <div className="fixed top-40 right-20 w-6 h-6 bg-[#8B7355]/20 rounded-full animate-float" style={{ animationDelay: '1s' }} />
      <div className="fixed bottom-40 left-20 w-3 h-3 bg-[#5C8A4A]/20 rounded-full animate-float" style={{ animationDelay: '2s' }} />
      <div className="fixed bottom-20 right-10 w-5 h-5 bg-[#5A7A9A]/20 rounded-full animate-float" style={{ animationDelay: '0.5s' }} />

      {/* Decorative top stripe */}
      <div className="w-full h-2 bg-gradient-to-r from-[#6B7B5E] via-[#8B7355] to-[#6B7B5E]" />

      {/* Header */}
      <header className="relative z-10 border-b-2 border-[#E8E2D0] bg-[#F5F0E1]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Back button - fun animated version */}
          <Link href="/" className="group relative flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 border-[#D4CDB8] hover:border-[#6B7B5E] bg-[#EFEAD9] hover:bg-[#E8E2D0] transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#6B7B5E]/10 group-hover:bg-[#6B7B5E] transition-all duration-300">
              <ArrowLeft className="w-4 h-4 text-[#6B7B5E] group-hover:text-[#F5F0E1] group-hover:-translate-x-0.5 transition-all duration-300" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-[#8B9B7E] uppercase tracking-wider font-bambino leading-none">back to</span>
              <span className="text-xs text-[#5A6A4D] uppercase tracking-wider font-bambino font-bold leading-tight">trenches</span>
            </div>
            {/* Animated underline */}
            <div className="absolute bottom-1 left-4 right-4 h-0.5 bg-[#6B7B5E] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
          </Link>

          {/* Center logo */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-60">
            <Image
              src="/brand/logo.png"
              alt="PumpBet"
              width={24}
              height={24}
              className="rounded"
            />
          </div>

          {/* Buy button - properly centered with glow */}
          <a
            href="https://pump.fun"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative px-5 py-2.5 bg-gradient-to-r from-[#6B7B5E] to-[#5A6A4D] hover:from-[#5A6A4D] hover:to-[#4A5A3D] text-[#F5F0E1] rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Button content */}
            <div className="relative flex items-center justify-center gap-2">
              <span className="text-xs font-bambino font-bold uppercase tracking-wider">buy $pumpbet</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-300" />
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-xl bg-[#6B7B5E] opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300 -z-10" />
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Main Title with animation */}
          <div className="text-center mb-8">
            <h1
              className="text-[clamp(3rem,12vw,9rem)] leading-[0.85] tracking-tight mb-6 animate-fade-in"
              style={{ fontFamily: 'Hyperbole, sans-serif' }}
            >
              <span className="text-[#5A6A4D] inline-block hover:scale-105 transition-transform cursor-default">THE</span>
              <br />
              <span className="text-[#6B7B5E] inline-block hover:scale-105 transition-transform cursor-default">FLYWHEEL</span>
            </h1>
            <p className="text-[#8B9B7E] text-sm uppercase tracking-[0.3em] max-w-md mx-auto font-bambino animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              bet more → fees stack → buybacks → number go up → repeat
            </p>
          </div>

          {/* Steps - No mascot overlapping */}
          <div className="relative max-w-3xl mx-auto mb-12">
            {/* Bouncing Flywheel Logo */}
            <div className="flex justify-center mb-8">
              <div className="animate-bounce-slow">
                <Image
                  src="/brand/flywheel.png?v=2"
                  alt="Flywheel"
                  width={160}
                  height={160}
                  className="drop-shadow-lg"
                  unoptimized
                />
              </div>
            </div>

            {/* Step buttons - properly centered text, no emojis */}
            <div className="flex justify-center gap-3 flex-wrap">
              {steps.map((step, idx) => {
                const StepIcon = step.Icon;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`px-4 py-3 border-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                      activeStep === idx
                        ? 'scale-105 shadow-lg'
                        : 'opacity-60 hover:opacity-90'
                    }`}
                    style={{
                      borderColor: activeStep === idx ? step.color : '#D4CDB8',
                      backgroundColor: activeStep === idx ? `${step.color}15` : '#EFEAD9',
                    }}
                  >
                    <StepIcon
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: activeStep === idx ? step.color : '#8B9B7E' }}
                    />
                    <span
                      className="text-xs font-bambino font-bold uppercase tracking-wider"
                      style={{ color: activeStep === idx ? step.color : '#8B9B7E' }}
                    >
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mascot - positioned separately, with fun animation */}
          <div className="flex justify-center mb-8">
            <div className="relative group cursor-pointer">
              <div
                className="absolute inset-0 rounded-full blur-2xl transition-all duration-500 group-hover:scale-110"
                style={{ backgroundColor: `${steps[activeStep].color}20` }}
              />
              <Image
                src="/brand/mascot.png"
                alt="PumpBet"
                width={100}
                height={100}
                className="relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
              />
              {/* Speech bubble on hover */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#6B7B5E] text-[#F5F0E1] px-3 py-1 rounded-lg text-xs font-bambino whitespace-nowrap">
                gm soldier
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-[#6B7B5E]" />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { value: '70%', label: 'TO BUYBACKS', color: '#5C8A4A' },
              { value: '20%', label: 'COMMUNITY', color: '#5A7A9A' },
              { value: '10%', label: 'DEVELOPMENT', color: '#8B7355' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-[#EFEAD9] border-2 border-[#D4CDB8] rounded-2xl p-6 text-center hover:border-[#6B7B5E] transition-all hover:scale-105 hover:shadow-lg cursor-default group"
              >
                <div
                  className="text-4xl md:text-5xl font-bold mb-2 transition-transform group-hover:scale-110"
                  style={{ fontFamily: 'Hyperbole, sans-serif', color: stat.color }}
                >
                  {stat.value}
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#8B9B7E] font-bambino font-bold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 border-t-2 border-[#E8E2D0] bg-[#EFEAD9]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 border-b-2 border-[#E8E2D0]">
            <div className="p-10 border-r-2 border-[#E8E2D0] group hover:bg-[#F5F0E1] transition-colors">
              <div className="inline-flex items-center justify-center gap-2 text-[#5C8A4A] text-[10px] uppercase tracking-[0.3em] mb-4 font-bambino font-bold">
                <span className="w-6 h-6 rounded-lg bg-[#5C8A4A]/20 flex items-center justify-center group-hover:scale-110 transition-transform">01</span>
              </div>
              <h3 className="text-2xl mb-4 text-[#3A4A2D]" style={{ fontFamily: 'Hyperbole, sans-serif' }}>DEGENS BET</h3>
              <p className="text-[#6B7B5E] text-sm leading-relaxed font-bambino">
                you ape into KOL predictions. will ansem hit 1M followers? will that shitcoin 100x?
                put your SOL where your mouth is, soldier.
              </p>
            </div>
            <div className="p-10 group hover:bg-[#F5F0E1] transition-colors">
              <div className="inline-flex items-center justify-center gap-2 text-[#5A7A9A] text-[10px] uppercase tracking-[0.3em] mb-4 font-bambino font-bold">
                <span className="w-6 h-6 rounded-lg bg-[#5A7A9A]/20 flex items-center justify-center group-hover:scale-110 transition-transform">02</span>
              </div>
              <h3 className="text-2xl mb-4 text-[#3A4A2D]" style={{ fontFamily: 'Hyperbole, sans-serif' }}>FEES STACK</h3>
              <p className="text-[#6B7B5E] text-sm leading-relaxed font-bambino">
                every bet generates fees. pump.fun gives us creator fees from 0.05% to 0.95%
                depending on market cap. it adds up fast.
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2">
            <div className="p-10 border-r-2 border-[#E8E2D0] group hover:bg-[#F5F0E1] transition-colors">
              <div className="inline-flex items-center justify-center gap-2 text-[#C45A4A] text-[10px] uppercase tracking-[0.3em] mb-4 font-bambino font-bold">
                <span className="w-6 h-6 rounded-lg bg-[#C45A4A]/20 flex items-center justify-center group-hover:scale-110 transition-transform">03</span>
              </div>
              <h3 className="text-2xl mb-4 text-[#3A4A2D]" style={{ fontFamily: 'Hyperbole, sans-serif' }}>WE BUYBACK</h3>
              <p className="text-[#6B7B5E] text-sm leading-relaxed font-bambino">
                70% of all fees go straight to buying $PUMPBET off the market.
                automatic. transparent. no bullshit.
              </p>
            </div>
            <div className="p-10 group hover:bg-[#F5F0E1] transition-colors">
              <div className="inline-flex items-center justify-center gap-2 text-[#5C8A4A] text-[10px] uppercase tracking-[0.3em] mb-4 font-bambino font-bold">
                <span className="w-6 h-6 rounded-lg bg-[#5C8A4A]/20 flex items-center justify-center group-hover:scale-110 transition-transform">04</span>
              </div>
              <h3 className="text-2xl mb-4 text-[#3A4A2D]" style={{ fontFamily: 'Hyperbole, sans-serif' }}>NUMBER GO UP</h3>
              <p className="text-[#6B7B5E] text-sm leading-relaxed font-bambino">
                more bets = more fees = more buybacks = less supply = higher price.
                simple math. the flywheel spins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fee tiers */}
      <section className="relative z-10 border-t-2 border-[#E8E2D0] py-16 px-6 bg-[#F5F0E1]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-3xl mb-2 text-[#3A4A2D]" style={{ fontFamily: 'Hyperbole, sans-serif' }}>
            PUMP.FUN FEES
          </h2>
          <p className="text-center text-[#8B9B7E] text-xs uppercase tracking-[0.2em] mb-10 font-bambino font-bold">
            what we earn as creators
          </p>

          {/* Table */}
          <div className="bg-[#EFEAD9] border-2 border-[#D4CDB8] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 gap-4 text-[#8B9B7E] text-xs uppercase tracking-wider p-4 border-b-2 border-[#E8E2D0] font-bambino font-bold text-center">
              <div>market cap</div>
              <div>creator fee</div>
              <div>protocol</div>
              <div>total</div>
            </div>

            {[
              { mcap: '< $10M', creator: '0.30%', protocol: '0.95%', total: '1.25%', active: false },
              { mcap: '$10M - $35M', creator: '0.95%', protocol: '0.05%', total: '1.20%', active: true },
              { mcap: '$35M - $100M', creator: '0.50%', protocol: '0.05%', total: '0.75%', active: false },
              { mcap: '> $2.3B', creator: '0.05%', protocol: '0.05%', total: '0.30%', active: false },
            ].map((tier, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-4 gap-4 p-4 border-l-4 transition-all font-bambino text-center ${
                  tier.active
                    ? 'border-[#5C8A4A] bg-[#5C8A4A]/10 text-[#3A4A2D]'
                    : 'border-transparent text-[#6B7B5E] hover:bg-[#F5F0E1]'
                }`}
              >
                <div className="font-medium">{tier.mcap}</div>
                <div className={tier.active ? 'text-[#5C8A4A] font-bold' : ''}>{tier.creator}</div>
                <div>{tier.protocol}</div>
                <div>{tier.total}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 border-2 border-dashed border-[#D4CDB8] rounded-xl text-center bg-[#EFEAD9]">
            <p className="text-[#6B7B5E] text-sm font-bambino">
              sweet spot is <span className="text-[#5C8A4A] font-bold">$10M-$35M mcap</span> where we earn max 0.95% creator fees
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 border-t-2 border-[#E8E2D0] py-16 px-6 bg-[#EFEAD9]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl mb-6 text-[#3A4A2D]" style={{ fontFamily: 'Hyperbole, sans-serif' }}>
            <span className="inline-block hover:scale-105 transition-transform">JOIN THE</span>
            <br />
            <span className="text-[#6B7B5E] inline-block hover:scale-105 transition-transform">FLYWHEEL</span>
          </h2>
          <p className="text-[#6B7B5E] text-sm mb-8 font-bambino">
            every bet you make feeds the machine
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://pump.fun"
              target="_blank"
              rel="noopener noreferrer"
              className="group px-8 py-4 bg-[#6B7B5E] text-[#F5F0E1] font-bambino font-bold uppercase tracking-wider text-sm rounded-xl transition-all hover:scale-105 hover:bg-[#5A6A4D] flex items-center justify-center gap-2 shadow-lg"
            >
              <span>buy $pumpbet</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <Link
              href="/"
              className="px-8 py-4 border-2 border-[#D4CDB8] text-[#6B7B5E] hover:text-[#3A4A2D] hover:border-[#6B7B5E] uppercase tracking-wider text-sm rounded-xl transition-all font-bambino font-bold bg-[#F5F0E1] flex items-center justify-center hover:scale-105"
            >
              start betting
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t-2 border-[#E8E2D0] py-6 px-6 bg-[#F5F0E1]">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[#8B9B7E] font-bambino font-bold">
          <div className="flex items-center gap-2">
            <Image
              src="/brand/logo.png"
              alt="PumpBet"
              width={20}
              height={20}
              className="rounded"
            />
            <span>pumpbet.fun</span>
          </div>
          <span>gm from the trenches</span>
        </div>
      </footer>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 6s linear infinite;
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
