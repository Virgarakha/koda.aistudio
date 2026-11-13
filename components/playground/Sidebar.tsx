"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  SlidersHorizontal,
  Plus,
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
  Wrench,
  Trash2,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { useUserProfile, type SubscriptionTier } from "@/hooks/use-user-profile";
import { getSavedApps, deleteApp, saveApp } from "@/lib/apps/storage";
import { KodaApp } from "@/lib/apps/types";

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { userEmail, userTier, avatarUrl, changeTier, signOut } = useUserProfile();
  const [imageError, setImageError] = useState(false);
  const [savedApps, setSavedApps] = useState<KodaApp[]>([]);
  const [showAllChats, setShowAllChats] = useState(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingAppId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [editingAppId]);

  const isPlaygroundActive = pathname === "/playground/new_chat" || pathname === "/playground";
  const isToolsActive = pathname?.startsWith("/tools");

  // Load chat history and listen for updates
  useEffect(() => {
    const loadChats = () => {
      const apps = getSavedApps(userEmail || undefined);
      setSavedApps(apps);
    };

    loadChats();

    window.addEventListener("koda_apps_updated", loadChats);
    window.addEventListener("storage", loadChats);

    return () => {
      window.removeEventListener("koda_apps_updated", loadChats);
      window.removeEventListener("storage", loadChats);
    };
  }, [userEmail, pathname]);

  const handleDeleteChat = async (e: React.MouseEvent, appId: string) => {
    e.preventDefault();
    e.stopPropagation();
    await deleteApp(appId);
    setSavedApps((prev) => prev.filter((a) => a.id !== appId));
    if (pathname === `/playground/${appId}`) {
      router.push("/playground/new_chat");
    }
  };

  const handleStartRename = (app: KodaApp) => {
    setEditingAppId(app.id);
    setEditingTitle(app.title || "Obrolan Baru");
  };

  const handleSaveRename = async (app: KodaApp) => {
    if (!editingAppId) return;
    const trimmed = editingTitle.trim();
    if (trimmed && trimmed !== app.title) {
      const updated: KodaApp = { ...app, title: trimmed };
      await saveApp(updated);
      setSavedApps(getSavedApps(userEmail || undefined));
    }
    setEditingAppId(null);
  };

  const handleCancelRename = () => {
    setEditingAppId(null);
  };

  const handlePinChat = async (app: KodaApp) => {
    const updated: KodaApp = { ...app, pinned: !app.pinned };
    await saveApp(updated);
    setSavedApps(getSavedApps(userEmail || undefined));
  };

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

  return (
    <aside
      className={`h-screen flex flex-col justify-between border-r border-[#1f1a1a] bg-[#0B0909] text-[#c4c7c5] transition-all duration-200 select-none ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Top Header & Main Navigation */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Logo / Brand Header */}
        {!collapsed ? (
          <div className="flex items-center justify-between px-3.5 py-3 border-b border-[#1f1a1a] shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-base text-[#f1f3f4] tracking-tight flex items-center gap-1.5">
                <span className="text-white font-semibold">Koda</span>
                <span className="text-[#c4c7c5] font-normal">AI Studio</span>
              </span>
            </div>
            <button
              onClick={onToggleCollapse}
              className="p-1.5 text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#1a1616] rounded-md transition cursor-pointer"
              title="Tutup sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center py-3 border-b border-[#1f1a1a] shrink-0">
            <button
              onClick={onToggleCollapse}
              className="p-2 text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#1a1616] rounded-lg transition cursor-pointer"
              title="Buka sidebar"
            >
              <PanelLeftOpen className="w-5 h-5 text-[#9aa0a6] hover:text-white" />
            </button>
          </div>
        )}

        {/* Navigation Content Area */}
        <div className="flex-1 flex flex-col min-h-0 px-2 py-3 overflow-hidden">
          {/* EXPLORE (Playground & Tools) */}
          <div className="shrink-0 mb-3">
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
                    ? "bg-[#1a1616] text-[#f1f3f4]"
                    : "text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#141111]"
                }`}
                title="Playground"
              >
                <SlidersHorizontal
                  className={`w-4 h-4 ${
                    isPlaygroundActive ? "text-[#408175]" : "text-[#9aa0a6]"
                  }`}
                />
                {!collapsed && <span>Playground</span>}
              </Link>
              <Link
                href="/tools"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm group transition ${
                  isToolsActive
                    ? "bg-[#1a1616] text-[#f1f3f4]"
                    : "text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#141111]"
                }`}
                title="AI Tools & Specialized Studios"
              >
                <Wrench
                  className={`w-4 h-4 ${
                    isToolsActive ? "text-[#408175]" : "text-[#9aa0a6]"
                  }`}
                />
                {!collapsed && (
                  <div className="flex items-center justify-between flex-1">
                    <span>Tools</span>
                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-[#2E4540]/40 text-[#408175] border border-[#408175]/30">
                      Studio
                    </span>
                  </div>
                )}
              </Link>
            </div>
          </div>

          {/* CHAT HISTORY (Full List of Recent Chats) */}
          <div className="flex-1 min-h-0 flex flex-col pt-2 border-t border-[#1f1a1a]">
            {/* Header: Title + New Chat button */}
            {!collapsed ? (
              <div className="flex items-center justify-between px-3 pb-2 text-[11px] font-semibold text-[#80868b] tracking-wider uppercase shrink-0">
                <div className="flex items-center gap-1.5">
                  <span>Riwayat Chat</span>
                  {savedApps.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#1a1616] text-[#9aa0a6] font-normal border border-[#241f1f]">
                      {savedApps.length}
                    </span>
                  )}
                </div>
                <Link
                  href="/playground/new_chat"
                  className="p-1 text-[#80868b] hover:text-white hover:bg-[#1a1616] rounded-md transition"
                  title="Mulai Chat Baru"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="flex justify-center pb-2 shrink-0">
                <Link
                  href="/playground/new_chat"
                  className="p-2 text-[#9aa0a6] hover:text-white hover:bg-[#1a1616] rounded-lg transition"
                  title="New chat"
                >
                  <Plus className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Scrollable Chat History List */}
            <div className="flex-1 overflow-y-auto space-y-0.5 pr-0.5 custom-scrollbar">
              {savedApps.length === 0 ? (
                !collapsed ? (
                  <div className="px-3 py-6 text-center text-xs text-[#5f6368] space-y-2">
                    <p>Belum ada riwayat chat</p>
                    <Link
                      href="/playground/new_chat"
                      className="inline-flex items-center gap-1 text-[11px] text-[#408175] hover:underline"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Buat chat baru</span>
                    </Link>
                  </div>
                ) : null
              ) : (
                <>
                  {(showAllChats ? savedApps : savedApps.slice(0, 3)).map((app) => {
                    const isActive = pathname === `/playground/${app.id}`;
                    if (collapsed) {
                      return (
                        <div key={app.id} className="flex justify-center py-1">
                          <Link
                            href={`/playground/${app.id}`}
                            className={`p-2 rounded-lg transition cursor-pointer ${
                              isActive
                                ? "bg-[#1a1616] text-[#f1f3f4]"
                                : "text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#141111]"
                            }`}
                            title={app.title || "Obrolan Baru"}
                          >
                            <span
                              className={`block w-1.5 h-1.5 rounded-full border ${
                                isActive
                                  ? "border-[#408175] bg-[#408175]"
                                  : "border-[#717579]"
                              }`}
                            />
                          </Link>
                        </div>
                      );
                    }

                    const isEditing = editingAppId === app.id;

                    return (
                      <div key={app.id} className="relative group/chatitem">
                        <div
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                            isActive || isEditing
                              ? "bg-[#1a1616] text-[#f1f3f4]"
                              : "text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#141111]"
                          }`}
                        >
                          {isEditing ? (
                            <div
                              className="flex items-center gap-2.5 min-w-0 flex-1 py-0.5"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full border border-[#408175] bg-[#408175] shrink-0" />
                              <input
                                ref={renameInputRef}
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSaveRename(app);
                                  } else if (e.key === "Escape") {
                                    e.preventDefault();
                                    handleCancelRename();
                                  }
                                }}
                                onBlur={() => handleSaveRename(app)}
                                className="w-full bg-transparent text-[#f1f3f4] text-xs font-medium outline-none border-none p-0 selection:bg-[#408175]/40 selection:text-white"
                              />
                            </div>
                          ) : (
                            <Link
                              href={`/playground/${app.id}`}
                              className="flex items-center gap-2.5 min-w-0 flex-1 py-0.5"
                              title={app.title || "Obrolan Baru"}
                            >
                              {/* Bullet icon without chat bubble icon */}
                              <span
                                className={`w-1.5 h-1.5 rounded-full border shrink-0 transition-colors ${
                                  isActive
                                    ? "border-[#408175] bg-transparent"
                                    : "border-[#717579] group-hover/chatitem:border-[#c4c7c5]"
                                }`}
                              />
                              <span className="truncate">
                                {app.title || "Obrolan Baru"}
                              </span>
                            </Link>
                          )}

                          {/* 3-dots Settings Menu */}
                          {!isEditing && (
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                onClick={(e) => e.stopPropagation()}
                                className={`p-1 text-[#80868b] hover:text-[#f1f3f4] hover:bg-[#241f1f] rounded-md transition shrink-0 ml-1 opacity-0 group-hover/chatitem:opacity-100 data-open:opacity-100 data-popup-open:opacity-100 data-open:bg-[#241f1f] data-open:text-white cursor-pointer ${
                                  isActive ? "opacity-100" : ""
                                }`}
                                title="Pengaturan Chat"
                              >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                side="bottom"
                                sideOffset={4}
                                className="w-48 bg-[#141111] border border-[#241f1f] text-[#e3e3e3] rounded-xl p-1 shadow-2xl z-50 text-xs"
                              >
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePinChat(app);
                                  }}
                                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#1a1616] focus:bg-[#1a1616] text-[#e3e3e3] cursor-pointer text-xs"
                                >
                                  <span>{app.pinned ? "Unpin" : "Pin"}</span>
                                  <DropdownMenuShortcut className="text-[#80868b] font-mono text-[11px]">
                                    P
                                  </DropdownMenuShortcut>
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartRename(app);
                                  }}
                                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#1a1616] focus:bg-[#1a1616] text-[#e3e3e3] cursor-pointer text-xs"
                                >
                                  <span>Rename</span>
                                  <DropdownMenuShortcut className="text-[#80868b] font-mono text-[11px]">
                                    R
                                  </DropdownMenuShortcut>
                                </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#1a1616] focus:bg-[#1a1616] text-[#e3e3e3] cursor-pointer text-xs"
                              >
                                <span>Add to project</span>
                                <ChevronRight className="w-3.5 h-3.5 text-[#80868b]" />
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#1a1616] focus:bg-[#1a1616] text-[#e3e3e3] cursor-pointer text-xs"
                              >
                                <span>Move to group</span>
                                <ChevronRight className="w-3.5 h-3.5 text-[#80868b]" />
                              </DropdownMenuItem>

                              <DropdownMenuSeparator className="bg-[#241f1f] my-1" />

                              <DropdownMenuItem
                                onClick={(e) => handleDeleteChat(e, app.id)}
                                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 focus:bg-red-500/10 text-red-400 focus:text-red-400 cursor-pointer text-xs"
                              >
                                <span>Delete</span>
                                <DropdownMenuShortcut className="text-[#80868b] font-mono text-[11px]">
                                  D
                                </DropdownMenuShortcut>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                    );
                  })}

                  {/* View all toggle */}
                  {!collapsed && savedApps.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setShowAllChats(!showAllChats)}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-[#9aa0a6] hover:text-[#f1f3f4] transition cursor-pointer font-normal rounded-lg hover:bg-[#141111]"
                    >
                      {showAllChats ? "Show less" : "View all"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* MANAGE (Dashboard & Documentation) */}
          <div className="shrink-0 pt-2 border-t border-[#1f1a1a]">
            {!collapsed && (
              <p className="px-3 pb-1.5 text-[11px] font-semibold text-[#80868b] tracking-wider uppercase">
                Manage
              </p>
            )}
            <div className="space-y-0.5">
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#141111] text-sm transition">
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4" />
                  {!collapsed && <span>Dashboard</span>}
                </div>
                {!collapsed && <ChevronRight className="w-3.5 h-3.5 text-[#5f6368]" />}
              </button>
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#141111] text-sm transition">
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

      {/* Bottom Area (Credits, Utilities & Profile) */}
      <div className="p-3 space-y-3 border-t border-[#1f1a1a] shrink-0">
        {/* Claim free API credits card */}
        {!collapsed ? (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#141111] to-[#1c1818] border border-[#241f1f] p-3 shadow-md hover:border-[#408175]/50 transition cursor-pointer group">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#2E4540]/30 text-[#408175] group-hover:scale-105 transition">
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
            <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-[#408175]/15 rounded-full blur-xl pointer-events-none" />
          </div>
        ) : (
          <div className="flex justify-center">
            <button className="p-2 rounded-lg bg-[#141111] text-[#408175] hover:bg-[#1a1616]" title="Claim free API credits">
              <Gift className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Utility Icons */}
        <div className={`flex items-center ${collapsed ? "flex-col gap-2" : "justify-around"} py-1 px-1 text-[#9aa0a6]`}>
          <button className="p-1.5 hover:text-[#f1f3f4] hover:bg-[#1a1616] rounded-md transition" title="Notifications">
            <Bell className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push("/settings")}
            className={`p-1.5 rounded-md transition ${
              pathname === "/settings"
                ? "text-white bg-[#1a1616]"
                : "hover:text-[#f1f3f4] hover:bg-[#1a1616]"
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:text-[#f1f3f4] hover:bg-[#1a1616] rounded-md transition" title="Search">
            <Search className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:text-[#f1f3f4] hover:bg-[#1a1616] rounded-md transition" title="Share link">
            <Link2 className="w-4 h-4" />
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center justify-between pt-1 border-t border-[#1f1a1a]">
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
                  className="w-56 bg-[#141111] border border-[#241f1f] text-[#f1f3f4] p-1.5 rounded-xl shadow-2xl z-50"
                >
                  <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-semibold text-[#80868b] uppercase tracking-wider">
                    Tier Subscription
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#241f1f] my-1" />

                  {/* FREE */}
                  <DropdownMenuItem
                    onClick={() => changeTier("FREE")}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition ${
                      userTier === "FREE"
                        ? "bg-[#1a1616] text-white font-medium"
                        : "hover:bg-[#1a1616]/60 text-[#c4c7c5]"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#f1f3f4]">FREE</span>
                      <span className="text-[10px] text-[#80868b]">
                        Akses dasar model &amp; tool
                      </span>
                    </div>
                    {userTier === "FREE" && (
                      <Check className="w-4 h-4 text-[#408175]" />
                    )}
                  </DropdownMenuItem>

                  {/* PRO */}
                  <DropdownMenuItem
                    onClick={() => changeTier("PRO")}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition ${
                      userTier === "PRO"
                        ? "bg-[#2E4540]/30 text-[#408175] font-medium"
                        : "hover:bg-[#1a1616]/60 text-[#c4c7c5]"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold flex items-center gap-1 text-[#408175]">
                        <Zap className="w-3.5 h-3.5" />
                        PRO
                      </span>
                      <span className="text-[10px] text-[#80868b]">
                        Gemini 3.8 Flash, Grounding Search
                      </span>
                    </div>
                    {userTier === "PRO" && (
                      <Check className="w-4 h-4 text-[#408175]" />
                    )}
                  </DropdownMenuItem>

                  {/* MAX */}
                  <DropdownMenuItem
                    onClick={() => changeTier("MAX")}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition ${
                      userTier === "MAX"
                        ? "bg-[#1a1616] text-[#B5B9F0] font-medium"
                        : "hover:bg-[#1a1616]/60 text-[#c4c7c5]"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold flex items-center gap-1 text-[#B5B9F0]">
                        <Sparkles className="w-3.5 h-3.5 text-[#B5B9F0]" />
                        MAX
                      </span>
                      <span className="text-[10px] text-[#80868b]">
                        Autonomous Agents &amp; Max Reasoning
                      </span>
                    </div>
                    {userTier === "MAX" && (
                      <Check className="w-4 h-4 text-[#B5B9F0]" />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={signOut}
                className="p-1 text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#1a1616] rounded-md transition ml-0.5 cursor-pointer"
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
                  className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#2E4540] to-[#408175] text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow uppercase"
                  title={userEmail}
                >
                  {userEmail ? userEmail.charAt(0) : "K"}
                </div>
              )}
              <button
                type="button"
                onClick={signOut}
                className="p-1 text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#1a1616] rounded-md transition cursor-pointer"
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
