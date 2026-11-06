"use client";

import React from "react";
import {
  Share2,
  Sparkles,
  Plus,
  MoreVertical,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react";

interface HeaderProps {
  onNewChat: () => void;
  isSettingsOpen: boolean;
  onToggleSettings: () => void;
  selectedModel?: string;
  onOpenModelSelection?: () => void;
  onCompilePRD?: () => void;
}

export function Header({
  onNewChat,
  isSettingsOpen,
  onToggleSettings,
  selectedModel,
  onOpenModelSelection,
  onCompilePRD,
}: HeaderProps) {
  return (
    <header className="h-14 border-b border-[#282a2c] flex items-center justify-between px-6 bg-[#131314] text-[#f1f3f4] shrink-0 select-none">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-medium tracking-tight">Playground</h2>
      </div>

      <div className="flex items-center gap-2 text-[#9aa0a6]">
        {selectedModel && onOpenModelSelection && (
          <button
            onClick={onOpenModelSelection}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#212224] hover:bg-[#282a2c] text-[#f1f3f4] border border-[#2e3032] hover:border-[#5a5d61] rounded-lg text-xs font-medium transition mr-1"
            title="Pilih Model AI"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#d97736]" />
            <span>{selectedModel}</span>
            <span className="text-[10px] text-[#80868b]">▼</span>
          </button>
        )}

        <button
          className="p-2 hover:text-[#f1f3f4] hover:bg-[#282a2c] rounded-md transition"
          title="Share prompt"
        >
          <Share2 className="w-4 h-4" />
        </button>
        <button
          className="p-2 hover:text-[#f1f3f4] hover:bg-[#282a2c] rounded-md transition"
          title="Tuning & Insights"
        >
          <Sparkles className="w-4 h-4" />
        </button>
        <button
          onClick={onNewChat}
          className="p-2 hover:text-[#f1f3f4] hover:bg-[#282a2c] rounded-md transition"
          title="New prompt"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          className="p-2 hover:text-[#f1f3f4] hover:bg-[#282a2c] rounded-md transition"
          title="More options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {!isSettingsOpen && (
          <button
            onClick={onToggleSettings}
            className="p-2 hover:text-[#f1f3f4] hover:bg-[#282a2c] rounded-md transition ml-1"
            title="Open Run Settings"
          >
            <PanelRightOpen className="w-4 h-4 text-[#d97736]" />
          </button>
        )}
      </div>
    </header>
  );
}
