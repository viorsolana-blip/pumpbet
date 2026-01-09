'use client';

import Image from 'next/image';
import { X, Plus, Columns, Square, MessageSquare, RotateCcw, MoreHorizontal } from 'lucide-react';
import { useStore, Tab } from '@/store';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
  onAddTab: () => void;
}

export function TabBar({ tabs, activeTabId, onTabClick, onTabClose, onAddTab }: TabBarProps) {
  return (
    <div className="h-10 bg-[#050505] flex items-center border-b border-[#1a1a1a]">
      {/* Tabs */}
      <div className="flex items-center flex-1 overflow-x-auto">
        {tabs.map((tab, idx) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            onClick={() => onTabClick(tab.id)}
            onClose={() => onTabClose(tab.id)}
            index={idx}
          />
        ))}
        <button
          onClick={onAddTab}
          className="p-2 hover:bg-[#141414] rounded-lg transition-colors ml-1 group"
          title="New Tab"
        >
          <Plus className="w-4 h-4 text-[#444] group-hover:text-[#ff0000] transition-colors" />
        </button>
      </div>

      {/* Tab Actions */}
      <div className="flex items-center gap-0.5 px-2 border-l border-[#1a1a1a]">
        <button
          className="p-1.5 hover:bg-[#141414] rounded-lg transition-colors group"
          title="Split View"
        >
          <Columns className="w-4 h-4 text-[#444] group-hover:text-white transition-colors" />
        </button>
        <button
          className="p-1.5 hover:bg-[#141414] rounded-lg transition-colors group"
          title="Maximize"
        >
          <Square className="w-4 h-4 text-[#444] group-hover:text-white transition-colors" />
        </button>
        <button
          className="p-1.5 hover:bg-[#141414] rounded-lg transition-colors group"
          title="Quick Chat"
        >
          <MessageSquare className="w-4 h-4 text-[#444] group-hover:text-white transition-colors" />
        </button>
        <button
          className="p-1.5 hover:bg-[#141414] rounded-lg transition-colors group"
          title="More Options"
        >
          <MoreHorizontal className="w-4 h-4 text-[#444] group-hover:text-white transition-colors" />
        </button>
      </div>
    </div>
  );
}

function TabItem({
  tab,
  isActive,
  onClick,
  onClose,
  index,
}: {
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
  onClose: () => void;
  index: number;
}) {
  return (
    <div
      className={`group flex items-center gap-2 px-3 py-2 border-r border-[#1a1a1a] cursor-pointer transition-all relative ${
        isActive
          ? 'bg-[#0a0a0a]'
          : 'bg-[#050505] hover:bg-[#0a0a0a]'
      }`}
      onClick={onClick}
    >
      {/* Active indicator bar */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff0000]" />
      )}

      {/* Tab icon/color */}
      <div
        className={`w-2 h-2 rounded-full transition-all ${
          isActive ? 'scale-110' : 'scale-100'
        }`}
        style={{ backgroundColor: tab.color || '#ff0000' }}
      />

      {/* Tab title */}
      <span className={`text-sm transition-colors max-w-[120px] truncate ${
        isActive ? 'text-white' : 'text-[#666] group-hover:text-[#888]'
      }`}>
        {tab.title}
      </span>

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[#1a1a1a] rounded transition-all ml-1"
        title="Close Tab"
      >
        <X className="w-3 h-3 text-[#555] hover:text-[#ff0000]" />
      </button>

      {/* Keyboard shortcut hint for first 9 tabs */}
      {index < 9 && isActive && (
        <span className="text-[8px] text-[#333] ml-1 hidden lg:block">⌘{index + 1}</span>
      )}
    </div>
  );
}
