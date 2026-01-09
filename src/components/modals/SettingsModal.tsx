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
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="relative bg-[#0a0a0a] border border-[#ff0000]/20 rounded-lg w-full max-w-md overflow-hidden animate-scale-in">
        {/* Animated pixel texture bar */}
        <div
          className="h-3 w-full animate-texture-scroll"
          style={{
            backgroundImage: 'url(/brand/pixel-texture.jpeg)',
            backgroundSize: '200% 100%',
            backgroundRepeat: 'repeat-x',
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ff0000]/10 border border-[#ff0000]/20 flex items-center justify-center">
              <Image
                src="/brand/icon.png"
                alt=""
                width={24}
                height={24}
              />
            </div>
            <div>
              <h2 className="text-base font-medium text-white">Settings</h2>
              <p className="text-[11px] text-[#555]">Customize your experience</p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(false)}
            className="p-2 hover:bg-[#141414] rounded-lg transition-colors group"
          >
            <X className="w-5 h-5 text-[#555] group-hover:text-[#ff0000] transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Wallet Section */}
          <section>
            <h3 className="text-[10px] text-[#555] uppercase tracking-[0.15em] font-medium mb-3">
              WALLET
            </h3>
            <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#ff0000] flex items-center justify-center">
                  <Image
                    src="/brand/icon.png"
                    alt=""
                    width={24}
                    height={24}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-mono">{walletAddress}</span>
                    <button
                      onClick={copyAddress}
                      className="p-1 hover:bg-[#1a1a1a] rounded transition-colors"
                      title="Copy address"
                    >
                      {copied ? (
                        <Check className="w-3 h-3 text-[#22c55e]" />
                      ) : (
                        <Copy className="w-3 h-3 text-[#555]" />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#555] mt-1">Self-custody wallet</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#1a1a1a]">
                <span className="text-[11px] text-[#555] uppercase">Balance</span>
                <span className="text-lg text-[#22c55e] font-medium">
                  {balance.toLocaleString()} {walletType === 'solana' ? 'SOL' : walletType === 'ethereum' ? 'ETH' : ''}
                </span>
              </div>
            </div>
          </section>

          {/* Trading Venues */}
          <section>
            <h3 className="text-[10px] text-[#555] uppercase tracking-[0.15em] font-medium mb-3">
              TRADING VENUES
            </h3>
            <div className="space-y-2">
              {/* Polymarket */}
              <div className={`flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg border transition-colors ${settings.polymarketEnabled ? 'border-[#ff0000]/30' : 'border-[#1a1a1a] hover:border-[#333]'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#111] flex items-center justify-center overflow-hidden">
                    <PolymarketLogo className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-sm text-white font-medium block">Polymarket</span>
                    <span className="text-[10px] text-[#555]">Prediction markets</span>
                  </div>
                </div>
                <button
                  onClick={() => updateSettings({ polymarketEnabled: !settings.polymarketEnabled })}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.polymarketEnabled ? 'bg-[#ff0000]' : 'bg-[#1a1a1a]'
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
              <div className={`flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg border transition-colors ${settings.kalshiEnabled ? 'border-[#ff0000]/30' : 'border-[#1a1a1a] hover:border-[#333]'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#111] flex items-center justify-center overflow-hidden">
                    <KalshiLogo className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-sm text-white font-medium block">Kalshi</span>
                    <span className="text-[10px] text-[#555]">Event contracts</span>
                  </div>
                </div>
                <button
                  onClick={() => updateSettings({ kalshiEnabled: !settings.kalshiEnabled })}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.kalshiEnabled ? 'bg-[#ff0000]' : 'bg-[#1a1a1a]'
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
            <h3 className="text-[10px] text-[#555] uppercase tracking-[0.15em] font-medium mb-3">
              SECURITY
            </h3>
            <button className="flex items-center gap-3 p-3 bg-[#0f0f0f] rounded-lg border border-[#1a1a1a] w-full hover:border-[#ff0000]/30 transition-colors text-left group">
              <div className="w-10 h-10 rounded-lg bg-[#141414] group-hover:bg-[#ff0000]/10 flex items-center justify-center transition-colors">
                <Key className="w-5 h-5 text-[#555] group-hover:text-[#ff0000] transition-colors" />
              </div>
              <div className="flex-1">
                <span className="text-sm text-white block font-medium">Export Private Key</span>
                <span className="text-[10px] text-[#555]">Backup your wallet</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#333] group-hover:text-[#ff0000] transition-colors" />
            </button>
          </section>

          {/* Help */}
          <section>
            <h3 className="text-[10px] text-[#555] uppercase tracking-[0.15em] font-medium mb-3">
              HELP
            </h3>
            <button
              onClick={() => {
                localStorage.removeItem('tutorialCompleted');
                setShowTutorial(true);
                setShowSettings(false);
              }}
              className="flex items-center gap-3 p-3 bg-[#0f0f0f] rounded-lg border border-[#1a1a1a] w-full hover:border-[#333] transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#141414] group-hover:bg-[#1a1a1a] flex items-center justify-center transition-colors">
                <HelpCircle className="w-5 h-5 text-[#555] group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <span className="text-sm text-white block font-medium">Show Tutorial</span>
                <span className="text-[10px] text-[#555]">View the intro walkthrough again</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#333] group-hover:text-white transition-colors" />
            </button>
          </section>

          {/* Community */}
          <section>
            <h3 className="text-[10px] text-[#555] uppercase tracking-[0.15em] font-medium mb-3">
              COMMUNITY
            </h3>
            <div className="space-y-2">
              <a
                href="https://x.com/ApellaDotFun"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg border border-[#1a1a1a] hover:border-white/20 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#141414] group-hover:bg-white/10 flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4 text-[#555] group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <span className="text-sm text-white font-medium">Follow on X</span>
                </div>
                <ExternalLink className="w-4 h-4 text-[#333] group-hover:text-white transition-colors" />
              </a>

              <a
                href="https://pump.fun"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg border border-[#1a1a1a] hover:border-[#ff0000]/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#141414] group-hover:bg-[#ff0000]/10 flex items-center justify-center transition-colors">
                    <span className="text-xs font-bold text-[#555] group-hover:text-[#ff0000] transition-colors">$</span>
                  </div>
                  <span className="text-sm text-white font-medium">Buy $APELLA</span>
                </div>
                <ExternalLink className="w-4 h-4 text-[#333] group-hover:text-[#ff0000] transition-colors" />
              </a>
            </div>
          </section>

          {/* Mascot accent */}
          <div className="flex justify-center pt-4">
            <Image
              src="/brand/mascot.png"
              alt=""
              width={40}
              height={56}
              className="opacity-15 grayscale hover:opacity-30 hover:grayscale-0 transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#1a1a1a] bg-[#0f0f0f]">
          <button
            onClick={() => setShowSettings(false)}
            className="w-full py-3 bg-[#ff0000] hover:bg-[#cc0000] rounded-lg text-white font-medium transition-colors text-sm"
          >
            Done
          </button>
          <p className="text-[10px] text-[#444] text-center mt-3">
            apella.fun v0.1.0 - <span className="text-[#ff0000]">conquer the markets</span>
          </p>
        </div>
      </div>
    </div>
  );
}
