"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  ArrowLeft,
  Plus,
  FileSpreadsheet,
  Trash2,
  Sparkles,
  Zap,
  Check,
  LogOut,
  SlidersHorizontal,
  ChevronRight,
  Clock,
  Settings,
} from "lucide-react";
import { PrdSession } from "@/lib/apps/prd-storage";
import { useUserProfile, type SubscriptionTier } from "@/hooks/use-user-profile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PrdSidebarProps {
  sessions: PrdSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function PrdSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  collapsed = false,
  onToggleCollapse,
}: PrdSidebarProps) {
  const { userEmail, userTier, avatarUrl, changeTier, signOut } = useUserProfile();
  const [imageError, setImageError] = useState(false);

  const getTierBadgeStyle = (tier: SubscriptionTier) => {
    switch (tier) {
      case "MAX":
        return "bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-indigo-500/20 text-[#B5B9F0] border border-[#B5B9F0]/40 hover:from-emerald-500/30 hover:to-indigo-500/30 shadow-[0_0_8px_rgba(181,185,240,0.2)]";
      case "PRO":
        return "bg-[#2E4540]/40 text-[#408175] border border-[#408175]/40 hover:bg-[#2E4540]/60";
      case "FREE":
      default:
        return "bg-[#1a1616] text-[#9aa0a6] hover:bg-[#241f1f] hover:text-[#f1f3f4] border border-[#241f1f]";
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMinutes < 5) return "Baru saja";
      if (diffMinutes < 60) return `${diffMinutes}m lalu`;
      if (diffHours < 24) return `${diffHours}j lalu`;
      if (diffDays === 1) return "Kemarin";
      if (diffDays < 7) return `${diffDays} hari lalu`;
      return date.toLocaleDateString("id-ID", { month: "short", day: "numeric" });
    } catch {
      return "Riwayat";
    }
  };

  return (
    <aside
      className={`h-screen flex flex-col justify-between border-r border-[#1f1a1a] bg-[#0B0909] text-[#c4c7c5] transition-all duration-200 select-none shrink-0 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Top Header & Navigation */}
      <div className="flex flex-col min-h-0 flex-1">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-3.5 py-3 border-b border-[#1f1a1a]">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onToggleCollapse}
              className="p-1.5 -ml-1 text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#1a1616] rounded-md transition"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            {!collapsed && (
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-semibold text-white text-sm">PRD Studio</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#2E4540]/40 text-[#408175] border border-[#408175]/30 font-medium">
                  Architect
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <Link
              href="/tools"
              className="p-1.5 text-[#9aa0a6] hover:text-white hover:bg-[#1a1616] rounded-lg transition text-xs flex items-center gap-1"
              title="Kembali ke Tools Directory"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tools Hub</span>
            </Link>
          )}
        </div>

        {/* Action: New PRD Chat Button */}
        <div className="p-3">
          <button
            type="button"
            onClick={onNewSession}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-medium text-xs transition border shadow-sm ${
              activeSessionId === null
                ? "bg-[#408175] text-white border-[#408175]"
                : "bg-[#141111] hover:bg-[#1a1616] text-white border-[#241f1f] hover:border-[#408175]/60"
            }`}
            title="Mulai obrolan PRD baru"
          >
            <Plus className="w-4 h-4" />
            {!collapsed && <span>Obrolan PRD Baru</span>}
          </button>
        </div>

        {/* PRD History Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 py-1">
          {!collapsed && (
            <div className="flex items-center justify-between px-2 pb-1 text-[11px] font-semibold text-[#80868b] tracking-wider uppercase">
              <span>Riwayat PRD ({sessions.length})</span>
            </div>
          )}

          {sessions.length === 0 ? (
            !collapsed && (
              <div className="p-4 text-center text-xs text-[#80868b]">
                Belum ada riwayat PRD tersimpan.
              </div>
            )
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? "bg-[#1a1616] text-white border border-[#241f1f]"
                      : "text-[#9aa0a6] hover:text-white hover:bg-[#141111]"
                  }`}
                  title={session.title}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <FileSpreadsheet
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-[#408175]" : "text-[#80868b]"
                      }`}
                    />
                    {!collapsed && (
                      <div className="flex flex-col min-w-0 pr-1">
                        <span className="truncate leading-tight text-white font-medium">
                          {session.title}
                        </span>
                        <span className="text-[10px] text-[#80868b] mt-0.5 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{formatRelativeTime(session.updatedAt)}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {!collapsed && (
                    <button
                      type="button"
                      onClick={(e) => onDeleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 hover:bg-[#241f1f] rounded-md transition shrink-0"
                      title="Hapus sesi PRD ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Area: User Profile */}
      <div className="p-3 space-y-2 border-t border-[#1f1a1a] bg-[#0B0909]">
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            {avatarUrl && !imageError ? (
              <img
                src={avatarUrl}
                alt={userEmail || "Avatar"}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-7 h-7 rounded-full object-cover shrink-0 shadow border border-white/10"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#2E4540] to-[#408175] text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow uppercase">
                {userEmail ? userEmail.charAt(0) : "V"}
              </div>
            )}
            {!collapsed && (
              <span
                className="text-xs text-[#e3e3e3] truncate max-w-[105px] font-normal"
                title={userEmail}
              >
                {userEmail || "virgakumara@..."}
              </span>
            )}
          </div>

          {!collapsed && (
            <div className="flex items-center gap-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold transition cursor-pointer select-none outline-none ${getTierBadgeStyle(
                    userTier
                  )}`}
                  title="Tier Subscription"
                >
                  {userTier}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  side="top"
                  className="w-56 bg-[#141111] border border-[#241f1f] text-[#f1f3f4] p-1.5 rounded-xl shadow-2xl z-50"
                >
                  <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-semibold text-[#80868b] uppercase tracking-wider">
                    Tier Subscription
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#241f1f] my-1" />

                  <DropdownMenuItem
                    onClick={() => changeTier("FREE")}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition ${
                      userTier === "FREE"
                        ? "bg-[#1a1616] text-white font-medium"
                        : "hover:bg-[#1a1616] text-[#c4c7c5]"
                    }`}
                  >
                    <span>FREE</span>
                    {userTier === "FREE" && <Check className="w-4 h-4 text-[#408175]" />}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => changeTier("PRO")}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition ${
                      userTier === "PRO"
                        ? "bg-[#2E4540]/40 text-[#408175] font-medium"
                        : "hover:bg-[#1a1616] text-[#c4c7c5]"
                    }`}
                  >
                    <span className="flex items-center gap-1 text-[#408175]">
                      <Zap className="w-3.5 h-3.5" /> PRO
                    </span>
                    {userTier === "PRO" && <Check className="w-4 h-4 text-[#408175]" />}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => changeTier("MAX")}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition ${
                      userTier === "MAX"
                        ? "bg-[#B5B9F0]/20 text-[#B5B9F0] font-medium"
                        : "hover:bg-[#1a1616] text-[#c4c7c5]"
                    }`}
                  >
                    <span className="flex items-center gap-1 text-[#B5B9F0]">
                      <Sparkles className="w-3.5 h-3.5" /> MAX
                    </span>
                    {userTier === "MAX" && <Check className="w-4 h-4 text-[#B5B9F0]" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                href="/settings"
                className="p-1 hover:text-white hover:bg-[#1a1616] rounded transition text-[#9aa0a6]"
                title="Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={signOut}
                className="p-1 hover:text-white hover:bg-[#1a1616] rounded transition text-[#9aa0a6]"
                title="Keluar"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
