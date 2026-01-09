'use client';

import Image from 'next/image';
import { Grid, Zap, MessageSquare, BarChart2, Wallet, Bell, Calendar, Users } from 'lucide-react';
import { useStore } from '@/store';

export function NewTabPanel() {
  const { addTab, setSplitPanels, splitPanels, splitView, tabs } = useStore();

  const openPanel = (type: string, title: string, color: string) => {
    const newId = addTab({ type: type as any, title, color });
    // Replace current 'new' tab in split view with this panel
    if (splitView && newId) {
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
    { type: 'markets', title: 'Markets', icon: Grid, color: '#ff0000', desc: 'Browse all prediction markets' },
    { type: 'flow', title: 'Whale Flow', icon: Zap, color: '#22c55e', desc: 'Track large trades in real-time' },
    { type: 'chat', title: 'Quick Chat', icon: MessageSquare, color: '#f59e0b', desc: 'AI-powered market research' },
    { type: 'research', title: 'Research', icon: BarChart2, color: '#3b82f6', desc: 'Organize your market analysis' },
    { type: 'portfolio', title: 'Portfolio', icon: Wallet, color: '#8b5cf6', desc: 'Track your positions & P&L' },
    { type: 'alerts', title: 'Alerts', icon: Bell, color: '#ec4899', desc: 'Set price & volume alerts' },
    { type: 'calendar', title: 'Calendar', icon: Calendar, color: '#14b8a6', desc: 'Upcoming market resolutions' },
    { type: 'traders', title: 'Leaderboard', icon: Users, color: '#f97316', desc: 'Top traders rankings' },
  ];

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Animated texture accent bar */}
      <div
        className="w-full h-3 flex-shrink-0 animate-texture-scroll"
        style={{
          backgroundImage: 'url(/brand/pixel-texture.jpeg)',
          backgroundSize: '200% 100%',
          backgroundRepeat: 'repeat-x',
        }}
      />

      {/* Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 overflow-y-auto py-8">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/brand/icon.png"
            alt="Apella"
            width={48}
            height={48}
            className="opacity-90"
          />
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl md:text-4xl font-semibold text-white text-center mb-4 tracking-tight">
          What do you want to open?
        </h1>

        {/* Subheadline */}
        <p className="text-sm text-[#666] text-center max-w-md mb-8">
          Choose a panel to get started
        </p>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl w-full">
          {quickActions.map((action) => (
            <button
              key={action.type}
              onClick={() => openPanel(action.type, action.title, action.color)}
              className="flex flex-col items-center gap-2 p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg hover:border-[#333] hover:bg-[#0f0f0f] transition-all group"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                style={{ backgroundColor: `${action.color}20` }}
              >
                <action.icon className="w-5 h-5" style={{ color: action.color }} />
              </div>
              <span className="text-sm text-white font-medium">{action.title}</span>
              <span className="text-[10px] text-[#555] text-center leading-tight">{action.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
