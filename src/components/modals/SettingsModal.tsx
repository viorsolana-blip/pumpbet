'use client';

import Image from 'next/image';
import { X, ExternalLink, Key, Copy, Check, ChevronRight, HelpCircle } from 'lucide-react';
import { useStore } from '@/store';
import { useState } from 'react';
import { PolymarketLogo, KalshiLogo } from '@/components/icons/Logos';

export function SettingsModal() {
  const { showSettings, setShowSettings, settings, updateSettings, walletAddress, balance, walletType, setShowTutorial } = useStore();
  const [copied, setCopied] = useState(false);

  if (!showSettings) return null;

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#3A4A2D]/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
        {/* Decorative top bar */}
        <div className="h-2 w-full bg-gradient-to-r from-[#6B7B5E] via-[#8B7355] to-[#6B7B5E]" />

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b-2 border-[#E8E2D0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6B7B5E]/10 border-2 border-[#6B7B5E]/20 flex items-center justify-center">
              <Image
                src="/brand/helmet-logo.png"
                alt=""
                width={24}
                height={24}
              />
            </div>
            <div>
              <h2 className="text-base font-bambino font-bold text-[#3A4A2D]">Settings</h2>
              <p className="text-[11px] text-[#8B9B7E] font-bambino">Customize your experience</p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(false)}
            className="p-2 hover:bg-[#EFEAD9] rounded-xl transition-colors group"
          >
            <X className="w-5 h-5 text-[#8B9B7E] group-hover:text-[#C45A4A] transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 max-h-[60vh] overflow-y-auto bg-[#EFEAD9]">
          {/* Wallet Section */}
          <section>
            <h3 className="text-[10px] text-[#8B9B7E] uppercase tracking-[0.15em] font-bambino font-bold mb-3">
              WALLET
            </h3>
            <div className="bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6B7B5E] to-[#8B7355] flex items-center justify-center shadow-lg">
                  <Image
                    src="/brand/helmet-logo.png"
                    alt=""
                    width={24}
                    height={24}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#3A4A2D] font-mono font-medium">{walletAddress}</span>
                    <button
                      onClick={copyAddress}
                      className="p-1 hover:bg-[#EFEAD9] rounded-lg transition-colors"
                      title="Copy address"
                    >
                      {copied ? (
                        <Check className="w-3 h-3 text-[#5C8A4A]" />
                      ) : (
                        <Copy className="w-3 h-3 text-[#8B9B7E]" />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#8B9B7E] mt-1 font-bambino">Self-custody wallet</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t-2 border-[#E8E2D0]">
                <span className="text-[11px] text-[#8B9B7E] uppercase font-bambino font-bold">Balance</span>
                <span className="text-lg text-[#5C8A4A] font-bold font-satoshi">
                  {balance.toLocaleString()} {walletType === 'solana' ? 'SOL' : walletType === 'ethereum' ? 'ETH' : ''}
                </span>
              </div>
            </div>
          </section>

          {/* Trading Venues */}
          <section>
            <h3 className="text-[10px] text-[#8B9B7E] uppercase tracking-[0.15em] font-bambino font-bold mb-3">
              TRADING VENUES
            </h3>
            <div className="space-y-2">
              {/* Polymarket */}
              <div className={`flex items-center justify-between p-3 bg-[#F5F0E1] rounded-xl border-2 transition-colors ${settings.polymarketEnabled ? 'border-[#6B7B5E]' : 'border-[#D4CDB8] hover:border-[#8B9B7E]'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EFEAD9] border-2 border-[#E8E2D0] flex items-center justify-center overflow-hidden">
                    <PolymarketLogo className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-sm text-[#3A4A2D] font-bambino font-bold block">Polymarket</span>
                    <span className="text-[10px] text-[#8B9B7E] font-bambino">Prediction markets</span>
                  </div>
                </div>
                <button
                  onClick={() => updateSettings({ polymarketEnabled: !settings.polymarketEnabled })}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.polymarketEnabled ? 'bg-[#6B7B5E]' : 'bg-[#D4CDB8]'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${
                      settings.polymarketEnabled ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Kalshi */}
              <div className={`flex items-center justify-between p-3 bg-[#F5F0E1] rounded-xl border-2 transition-colors ${settings.kalshiEnabled ? 'border-[#6B7B5E]' : 'border-[#D4CDB8] hover:border-[#8B9B7E]'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EFEAD9] border-2 border-[#E8E2D0] flex items-center justify-center overflow-hidden">
                    <KalshiLogo className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-sm text-[#3A4A2D] font-bambino font-bold block">Kalshi</span>
                    <span className="text-[10px] text-[#8B9B7E] font-bambino">Event contracts</span>
                  </div>
                </div>
                <button
                  onClick={() => updateSettings({ kalshiEnabled: !settings.kalshiEnabled })}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.kalshiEnabled ? 'bg-[#6B7B5E]' : 'bg-[#D4CDB8]'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${
                      settings.kalshiEnabled ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Security */}
          <section>
            <h3 className="text-[10px] text-[#8B9B7E] uppercase tracking-[0.15em] font-bambino font-bold mb-3">
              SECURITY
            </h3>
            <button className="flex items-center gap-3 p-3 bg-[#F5F0E1] rounded-xl border-2 border-[#D4CDB8] w-full hover:border-[#C45A4A]/50 transition-colors text-left group">
              <div className="w-10 h-10 rounded-xl bg-[#EFEAD9] group-hover:bg-[#C45A4A]/10 flex items-center justify-center transition-colors border-2 border-[#E8E2D0]">
                <Key className="w-5 h-5 text-[#8B9B7E] group-hover:text-[#C45A4A] transition-colors" />
              </div>
              <div className="flex-1">
                <span className="text-sm text-[#3A4A2D] block font-bambino font-bold">Export Private Key</span>
                <span className="text-[10px] text-[#8B9B7E] font-bambino">Backup your wallet</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#D4CDB8] group-hover:text-[#C45A4A] transition-colors" />
            </button>
          </section>

          {/* Help */}
          <section>
            <h3 className="text-[10px] text-[#8B9B7E] uppercase tracking-[0.15em] font-bambino font-bold mb-3">
              HELP
            </h3>
            <button
              onClick={() => {
                localStorage.removeItem('tutorialCompleted');
                setShowTutorial(true);
                setShowSettings(false);
              }}
              className="flex items-center gap-3 p-3 bg-[#F5F0E1] rounded-xl border-2 border-[#D4CDB8] w-full hover:border-[#6B7B5E] transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EFEAD9] group-hover:bg-[#6B7B5E]/10 flex items-center justify-center transition-colors border-2 border-[#E8E2D0]">
                <HelpCircle className="w-5 h-5 text-[#8B9B7E] group-hover:text-[#6B7B5E] transition-colors" />
              </div>
              <div className="flex-1">
                <span className="text-sm text-[#3A4A2D] block font-bambino font-bold">Show Tutorial</span>
                <span className="text-[10px] text-[#8B9B7E] font-bambino">View the intro walkthrough again</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#D4CDB8] group-hover:text-[#6B7B5E] transition-colors" />
            </button>
          </section>

          {/* Community */}
          <section>
            <h3 className="text-[10px] text-[#8B9B7E] uppercase tracking-[0.15em] font-bambino font-bold mb-3">
              COMMUNITY
            </h3>
            <div className="space-y-2">
              <a
                href="https://x.com/PumpBetFun"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-[#F5F0E1] rounded-xl border-2 border-[#D4CDB8] hover:border-[#3A4A2D]/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EFEAD9] group-hover:bg-[#3A4A2D]/10 flex items-center justify-center transition-colors border-2 border-[#E8E2D0]">
                    <svg className="w-4 h-4 text-[#8B9B7E] group-hover:text-[#3A4A2D] transition-colors" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <span className="text-sm text-[#3A4A2D] font-bambino font-bold">Follow on X</span>
                </div>
                <ExternalLink className="w-4 h-4 text-[#D4CDB8] group-hover:text-[#3A4A2D] transition-colors" />
              </a>

              <a
                href="https://pump.fun"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-[#F5F0E1] rounded-xl border-2 border-[#D4CDB8] hover:border-[#5C8A4A]/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EFEAD9] group-hover:bg-[#5C8A4A]/10 flex items-center justify-center transition-colors border-2 border-[#E8E2D0]">
                    <span className="text-xs font-bold text-[#8B9B7E] group-hover:text-[#5C8A4A] transition-colors">$</span>
                  </div>
                  <span className="text-sm text-[#3A4A2D] font-bambino font-bold">Buy $PUMPBET</span>
                </div>
                <ExternalLink className="w-4 h-4 text-[#D4CDB8] group-hover:text-[#5C8A4A] transition-colors" />
              </a>
            </div>
          </section>

          {/* Mascot accent */}
          <div className="flex justify-center pt-4">
            <Image
              src="/brand/mascot.png"
              alt=""
              width={40}
              height={40}
              className="opacity-20 hover:opacity-40 transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t-2 border-[#E8E2D0] bg-[#F5F0E1]">
          <button
            onClick={() => setShowSettings(false)}
            className="w-full py-3 bg-[#6B7B5E] hover:bg-[#5A6A4D] rounded-xl text-[#F5F0E1] font-bambino font-bold transition-colors text-sm shadow-lg"
          >
            Done
          </button>
          <p className="text-[10px] text-[#8B9B7E] text-center mt-3 font-bambino">
            pumpbet.fun v0.1.0 - <span className="text-[#6B7B5E] font-bold">gm from the trenches</span>
          </p>
        </div>
      </div>
    </div>
  );
}
