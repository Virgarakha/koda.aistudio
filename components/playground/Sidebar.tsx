"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  SlidersHorizontal,
  History,
  Plus,
  LayoutGrid,
  Images,
  LayoutDashboard,
  FileText,
  ChevronRight,
  Bell,
  Settings,
  Search,
  Link2,
  Gift,
  LogOut,
  Check,
  Sparkles,
  Zap,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserProfile, type SubscriptionTier } from "@/hooks/use-user-profile";

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { userEmail, userTier, avatarUrl, changeTier, signOut } = useUserProfile();
  const [imageError, setImageError] = useState(false);

  const isPlaygroundActive = pathname?.startsWith("/playground");
  const isMyAppsActive = pathname === "/apps";

  const getTierBadgeStyle = (tier: SubscriptionTier) => {
    switch (tier) {
      case "MAX":
        return "bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 text-amber-300 border border-amber-500/40 hover:from-amber-500/30 hover:to-orange-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]";
      case "PRO":
        return "bg-[#d97736]/20 text-[#d97736] border border-[#d97736]/40 hover:bg-[#d97736]/30";
      case "FREE":
      default:
        return "bg-[#282a2c] text-[#9aa0a6] hover:bg-[#35373a] hover:text-[#f1f3f4] border border-[#3c4043]/50";
    }
  };

  return (
    <aside
      className={`h-screen flex flex-col justify-between border-r border-[#282a2c] bg-[#131314] text-[#c4c7c5] transition-all duration-200 select-none ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Top Header */}
      <div className="flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#282a2c]/60">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 -ml-1 text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#282a2c] rounded-md transition"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-base text-[#f1f3f4] tracking-tight flex items-center gap-1.5">
                <span className="text-white font-semibold">Koda</span>
                <span className="text-[#c4c7c5] font-normal">AI Studio</span>
              </span>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="px-2 py-3 space-y-5 overflow-y-auto max-h-[calc(100vh-240px)]">
          {/* EXPLORE */}
          <div>
            {!collapsed && (
              <p className="px-3 pb-1.5 text-[11px] font-semibold text-[#80868b] tracking-wider uppercase">
                Explore
              </p>
            )}
            <div className="space-y-0.5">
              <Link
                href="/playground/new_chat"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm group transition ${
                  isPlaygroundActive
                    ? "bg-[#282a2c] text-[#f1f3f4]"
                    : "text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#1e1f20]"
                }`}
              >
                <SlidersHorizontal
                  className={`w-4 h-4 ${
                    isPlaygroundActive ? "text-[#d97736]" : "text-[#9aa0a6]"
                  }`}
                />
                {!collapsed && <span>Playground</span>}
              </Link>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#1e1f20] text-sm transition">
                <History className="w-4 h-4" />
                {!collapsed && <span>History</span>}
              </button>
            </div>
          </div>

          {/* BUILD */}
          <div>
            {!collapsed && (
              <p className="px-3 pb-1.5 text-[11px] font-semibold text-[#80868b] tracking-wider uppercase">
                Build
              </p>
            )}
            <div className="space-y-0.5">
              <Link
                href="/playground/new_chat"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#1e1f20] text-sm transition"
              >
                <Plus className="w-4 h-4" />
                {!collapsed && <span>New app</span>}
              </Link>
              <Link
                href="/apps"
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isMyAppsActive
                    ? "bg-[#282a2c] text-[#f1f3f4]"
                    : "text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#1e1f20]"
                }`}
              >
                <LayoutGrid
                  className={`w-4 h-4 ${
                    isMyAppsActive ? "text-[#d97736]" : "text-[#9aa0a6]"
                  }`}
                />
                {!collapsed && <span>My apps</span>}
              </Link>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#1e1f20] text-sm transition">
                <Images className="w-4 h-4" />
                {!collapsed && <span>Gallery</span>}
              </button>
            </div>
          </div>


          {/* MANAGE */}
          <div>
            {!collapsed && (
              <p className="px-3 pb-1.5 text-[11px] font-semibold text-[#80868b] tracking-wider uppercase">
                Manage
              </p>
            )}
            <div className="space-y-0.5">
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#1e1f20] text-sm transition">
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4" />
                  {!collapsed && <span>Dashboard</span>}
                </div>
                {!collapsed && <ChevronRight className="w-3.5 h-3.5 text-[#5f6368]" />}
              </button>
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#1e1f20] text-sm transition">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4" />
                  {!collapsed && <span>Documentation</span>}
                </div>
                {!collapsed && <ChevronRight className="w-3.5 h-3.5 text-[#5f6368]" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Area */}
      <div className="p-3 space-y-3 border-t border-[#282a2c]/60">
        {/* Claim free API credits card */}
        {!collapsed ? (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1e1f20] to-[#25272a] border border-[#3c4043]/70 p-3 shadow-md hover:border-[#d97736]/50 transition cursor-pointer group">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#282a2c] text-[#d97736] group-hover:scale-105 transition">
                <Gift className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-[#f1f3f4] leading-snug">
                  Claim free API credits
                </h4>
                <p className="text-[11px] text-[#9aa0a6] leading-tight mt-0.5">
                  $10 monthly from the Google Developer Program.
                </p>
              </div>
            </div>
            {/* Subtle glow effect */}
            <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-[#d97736]/10 rounded-full blur-xl pointer-events-none" />
          </div>
        ) : (
          <div className="flex justify-center">
            <button className="p-2 rounded-lg bg-[#1e1f20] text-[#d97736] hover:bg-[#282a2c]" title="Claim free API credits">
              <Gift className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Utility Icons */}
        <div className={`flex items-center ${collapsed ? "flex-col gap-2" : "justify-around"} py-1 px-1 text-[#9aa0a6]`}>
          <button className="p-1.5 hover:text-[#f1f3f4] hover:bg-[#282a2c] rounded-md transition" title="Notifications">
            <Bell className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:text-[#f1f3f4] hover:bg-[#282a2c] rounded-md transition" title="Settings">
            <Settings className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:text-[#f1f3f4] hover:bg-[#282a2c] rounded-md transition" title="Search">
            <Search className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:text-[#f1f3f4] hover:bg-[#282a2c] rounded-md transition" title="Share link">
            <Link2 className="w-4 h-4" />
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center justify-between pt-1 border-t border-[#282a2c]/40">
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
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#ff4e00] to-[#ec1f27] text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow uppercase">
                {userEmail ? userEmail.charAt(0) : "K"}
              </div>
            )}
            {!collapsed && (
              <span
                className="text-xs text-[#e3e3e3] truncate max-w-[105px] font-normal"
                title={userEmail}
              >
                {userEmail}
              </span>
            )}
          </div>


          {!collapsed ? (
            <div className="flex items-center gap-1.5">
              {/* Subscription Tier Dropdown Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold transition cursor-pointer select-none outline-none ${getTierBadgeStyle(
                    userTier
                  )}`}
                  title="Klik untuk mengubah Tier Subscription"
                >
                  {userTier}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  side="top"
                  className="w-56 bg-[#1e1f20] border border-[#2e3032] text-[#f1f3f4] p-1.5 rounded-xl shadow-2xl z-50"
                >
                  <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-semibold text-[#80868b] uppercase tracking-wider">
                    Tier Subscription
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#282a2c] my-1" />

                  {/* FREE */}
                  <DropdownMenuItem
                    onClick={() => changeTier("FREE")}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition ${
                      userTier === "FREE"
                        ? "bg-[#282a2c] text-white font-medium"
                        : "hover:bg-[#282a2c]/60 text-[#c4c7c5]"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#f1f3f4]">FREE</span>
                      <span className="text-[10px] text-[#80868b]">
                        Akses dasar model &amp; tool
                      </span>
                    </div>
                    {userTier === "FREE" && (
                      <Check className="w-4 h-4 text-[#d97736]" />
                    )}
                  </DropdownMenuItem>

                  {/* PRO */}
                  <DropdownMenuItem
                    onClick={() => changeTier("PRO")}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition ${
                      userTier === "PRO"
                        ? "bg-[#282a2c] text-[#d97736] font-medium"
                        : "hover:bg-[#282a2c]/60 text-[#c4c7c5]"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold flex items-center gap-1 text-[#d97736]">
                        <Zap className="w-3.5 h-3.5" />
                        PRO
                      </span>
                      <span className="text-[10px] text-[#80868b]">
                        Gemini 3.8 Flash, Grounding Search
                      </span>
                    </div>
                    {userTier === "PRO" && (
                      <Check className="w-4 h-4 text-[#d97736]" />
                    )}
                  </DropdownMenuItem>

                  {/* MAX */}
                  <DropdownMenuItem
                    onClick={() => changeTier("MAX")}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition ${
                      userTier === "MAX"
                        ? "bg-[#282a2c] text-amber-300 font-medium"
                        : "hover:bg-[#282a2c]/60 text-[#c4c7c5]"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold flex items-center gap-1 text-amber-300">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        MAX
                      </span>
                      <span className="text-[10px] text-[#80868b]">
                        Autonomous Agents &amp; Max Reasoning
                      </span>
                    </div>
                    {userTier === "MAX" && (
                      <Check className="w-4 h-4 text-amber-400" />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={signOut}
                className="p-1 text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#282a2c] rounded-md transition ml-0.5"
                title="Keluar (Sign Out)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 mx-auto">
              {avatarUrl && !imageError ? (
                <img
                  src={avatarUrl}
                  alt={userEmail || "Avatar"}
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="w-7 h-7 rounded-full object-cover shrink-0 shadow border border-white/10"
                  title={userEmail}
                />
              ) : (
                <div
                  className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#ff4e00] to-[#ec1f27] text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow uppercase"
                  title={userEmail}
                >
                  {userEmail ? userEmail.charAt(0) : "K"}
                </div>
              )}
              <button
                type="button"
                onClick={signOut}
                className="p-1 text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#282a2c] rounded-md transition"
                title="Keluar (Sign Out)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>



      </div>
    </aside>
  );
}
