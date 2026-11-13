"use client";

import React from "react";
import {
  Share2,
  Sparkles,
  Plus,
  MoreVertical,
  PanelRightOpen,
  PanelRightClose,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";

interface HeaderProps {
  onNewChat: () => void;
  isSettingsOpen: boolean;
  onToggleSettings: () => void;
  selectedModel?: string;
  onOpenModelSelection?: () => void;
  onCompilePRD?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function Header({
  onNewChat,
  isSettingsOpen,
  onToggleSettings,
  selectedModel,
  onOpenModelSelection,
  onCompilePRD,
  isSidebarCollapsed,
  onToggleSidebar,
}: HeaderProps) {
  return (
    <header className="h-14 border-b border-[#1f1a1a] flex items-center justify-between px-6 bg-[#0B0909] text-[#f1f3f4] shrink-0 select-none">
      <div className="flex items-center gap-3">
        {isSidebarCollapsed && onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 -ml-2 text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#1a1616] rounded-md transition cursor-pointer"
            title="Buka sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}
        <h2 className="text-base font-medium tracking-tight">Playground</h2>
      </div>

      <div className="flex items-center gap-2 text-[#9aa0a6]">
        {selectedModel && onOpenModelSelection && (
          <button
            onClick={onOpenModelSelection}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141111] hover:bg-[#1a1616] text-[#f1f3f4] border border-[#241f1f] hover:border-[#408175]/50 rounded-lg text-xs font-medium transition mr-1"
            title="Pilih Model AI"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#408175]" />
            <span>{selectedModel}</span>
            <span className="text-[10px] text-[#80868b]">▼</span>
          </button>
        )}

        <button
          className="p-2 hover:text-[#f1f3f4] hover:bg-[#1a1616] rounded-md transition"
          title="Share prompt"
        >
          <Share2 className="w-4 h-4" />
        </button>
        <button
          className="p-2 hover:text-[#f1f3f4] hover:bg-[#1a1616] rounded-md transition"
          title="Tuning & Insights"
        >
          <Sparkles className="w-4 h-4" />
        </button>
        <button
          onClick={onNewChat}
          className="p-2 hover:text-[#f1f3f4] hover:bg-[#1a1616] rounded-md transition"
          title="New prompt"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          className="p-2 hover:text-[#f1f3f4] hover:bg-[#1a1616] rounded-md transition"
          title="More options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleSettings}
          className="p-2 hover:text-[#f1f3f4] hover:bg-[#1a1616] rounded-md transition ml-1"
          title={isSettingsOpen ? "Tutup Run Settings" : "Buka Run Settings"}
        >
          {isSettingsOpen ? (
            <PanelRightClose className="w-4 h-4" />
          ) : (
            <PanelRightOpen className="w-4 h-4 text-[#408175]" />
          )}
        </button>
      </div>
    </header>
  );
}
