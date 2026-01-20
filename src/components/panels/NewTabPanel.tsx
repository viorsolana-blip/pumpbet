'use client';

import Image from 'next/image';
import { Grid, Zap, MessageSquare, BarChart2, Wallet, Bell, Calendar, Users, Flame, ThumbsUp, Target, Swords, Rocket } from 'lucide-react';
import { useStore } from '@/store';

export function NewTabPanel() {
  const { addTab, setSplitPanels, setActiveTab } = useStore();

  const openPanel = (type: string, title: string, color: string) => {
    // Get fresh state from store to avoid stale closure issues
    const { splitView, splitPanels, tabs } = useStore.getState();

    const newId = addTab({ type: type as any, title, color });

    if (!newId) return;

    // Set as active tab (works for single-panel mode)
    setActiveTab(newId);

    // In split view, replace the current 'new' panel with the new panel
    if (splitView) {
      const currentTabIndex = splitPanels.findIndex(id => {
        const tab = tabs.find(t => t.id === id);
        return tab?.type === 'new';
      });
      if (currentTabIndex !== -1) {
        const newPanels = [...splitPanels];
        newPanels[currentTabIndex] = newId;
        setSplitPanels(newPanels);
      }
    }
  };

  const quickActions = [
    { type: 'launch', title: 'Launch', icon: Rocket, color: '#D4A060', desc: 'Create a prediction' },
    { type: 'trenches', title: 'Trenches', icon: Swords, color: '#6B7B5E', desc: 'Bet on KOL milestones' },
    { type: 'traders', title: 'Leaderboard', icon: Users, color: '#8B7355', desc: 'Top traders' },
    { type: 'flow', title: 'Whale Flow', icon: Zap, color: '#5A7A9A', desc: 'Track large trades' },
    { type: 'chat', title: 'Quick Chat', icon: MessageSquare, color: '#8B9B7E', desc: 'AI market research' },
    { type: 'markets', title: 'Markets', icon: Grid, color: '#6B7B5E', desc: 'Browse all markets' },
    { type: 'portfolio', title: 'Portfolio', icon: Wallet, color: '#A08B70', desc: 'Track positions' },
    { type: 'research', title: 'Research', icon: BarChart2, color: '#5A7A9A', desc: 'Organize analysis' },
    { type: 'alerts', title: 'Alerts', icon: Bell, color: '#C45A4A', desc: 'Set price alerts' },
    { type: 'calendar', title: 'Calendar', icon: Calendar, color: '#8B9B7E', desc: 'Market resolutions' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#F5F0E1]">
      {/* Decorative top stripe */}
      <div className="w-full h-2 bg-gradient-to-r from-[#6B7B5E] via-[#8B7355] to-[#6B7B5E]" />

      {/* Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 overflow-y-auto py-8">
        {/* Mascot */}
        <div className="mb-6 relative">
          <div className="absolute -inset-4 bg-[#6B7B5E]/10 rounded-full blur-2xl" />
          <Image
            src="/brand/mascot.png"
            alt="dumpbet.fun"
            width={80}
            height={80}
            className="relative mascot-bounce"
          />
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl md:text-4xl text-[#3A4A2D] text-center mb-2 tracking-tight">
          <span className="font-hyperbole text-[#5A6A4D]">What</span>
          <span className="font-bambino"> do you want to open?</span>
        </h1>

        {/* Subheadline */}
        <p className="text-sm text-[#8B9B7E] text-center max-w-md mb-8 font-bambino">
          Choose a panel to get started, soldier
        </p>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-4xl w-full">
          {quickActions.map((action) => (
            <button
              key={action.type}
              onClick={() => openPanel(action.type, action.title, action.color)}
              className="flex flex-col items-center gap-2 p-4 bg-[#EFEAD9] border-2 border-[#D4CDB8] rounded-xl hover:border-[#6B7B5E] hover:bg-[#E8E2D0] transition-all group hover:scale-105 hover:shadow-lg"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                style={{ backgroundColor: `${action.color}20` }}
              >
                <action.icon className="w-6 h-6" style={{ color: action.color }} />
              </div>
              <span className="text-sm text-[#3A4A2D] font-bold font-bambino">{action.title}</span>
              <span className="text-[10px] text-[#8B9B7E] text-center leading-tight font-bambino">{action.desc}</span>
            </button>
          ))}
        </div>

        {/* Fun footer message */}
        <div className="mt-8 flex items-center gap-2 text-[#9AAA8D]">
          <div className="w-8 h-px bg-[#D4CDB8]" />
          <span className="text-xs font-bambino">gm from the trenches</span>
          <div className="w-8 h-px bg-[#D4CDB8]" />
        </div>
      </div>
    </div>
  );
}
