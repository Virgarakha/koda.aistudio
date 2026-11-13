"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  MessageSquare,
  Clock,
  Trash2,
  ExternalLink,
  Sparkles,
  LayoutGrid,
  SlidersHorizontal,
  Bot,
  Zap,
} from "lucide-react";
import { Sidebar } from "@/components/playground/Sidebar";
import { useUserProfile, type SubscriptionTier } from "@/hooks/use-user-profile";
import { useSidebarCollapse } from "@/hooks/use-sidebar-collapse";
import { KodaApp } from "@/lib/apps/types";
import { getSavedApps, deleteApp } from "@/lib/apps/storage";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function MyAppsPage() {
  const router = useRouter();
  const { userEmail } = useUserProfile();
  const { sidebarCollapsed, setSidebarCollapsed, toggleSidebar } = useSidebarCollapse();
  const [apps, setApps] = useState<KodaApp[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadedApps = getSavedApps(userEmail);
    setApps(loadedApps);
    setIsLoaded(true);
  }, [userEmail]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm("Apakah Anda yakin ingin menghapus aplikasi/chat ini?")) {
      await deleteApp(id);
      setApps((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const filteredApps = apps.filter(
    (app) =>
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTierBadgeStyle = (tier: SubscriptionTier) => {
    switch (tier) {
      case "MAX":
        return "bg-[#B5B9F0]/15 text-[#B5B9F0] border-[#B5B9F0]/30";
      case "PRO":
        return "bg-[#2E4540]/40 text-[#408175] border-[#408175]/30";
      case "FREE":
      default:
        return "bg-[#1a1616] text-[#9aa0a6] border-[#241f1f]";
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0909] text-[#f1f3f4] font-sans">
      {/* 1. Left Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#0B0909]">
        {/* Top Header */}
        <header className="h-14 border-b border-[#1f1a1a] flex items-center justify-between px-6 bg-[#0B0909] shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-[#408175]" />
              <span>My apps</span>
            </h2>
            <span className="text-xs text-[#80868b] bg-[#141111] px-2 py-0.5 rounded-full border border-[#241f1f]">
              {apps.length} project
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/playground/new_chat"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#408175] text-white font-semibold text-xs hover:bg-[#4ea092] transition shadow-md shadow-[#408175]/20"
            >
              <Plus className="w-4 h-4" />
              <span>New app</span>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#80868b]" />
                <Input
                  type="text"
                  placeholder="Cari aplikasi atau rancangan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-[#141111] border-[#241f1f] text-xs text-white placeholder:text-[#80868b] rounded-xl h-10 focus-visible:ring-1 focus-visible:ring-[#408175]"
                />
              </div>

              <div className="text-xs text-[#9aa0a6] self-end sm:self-center">
                Menampilkan {filteredApps.length} dari {apps.length} aplikasi
              </div>
            </div>

            {/* Apps Grid */}
            {filteredApps.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredApps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => router.push(`/playground/${app.id}`)}
                    className="group relative rounded-2xl bg-[#141111] border border-[#241f1f] hover:border-[#408175]/50 p-5 flex flex-col justify-between cursor-pointer transition shadow-lg hover:shadow-2xl"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-[#2E4540]/30 text-[#408175] border-[#408175]/30 text-[10.5px] px-2 py-0.5"
                          >
                            <Bot className="w-3 h-3 mr-1" />
                            {app.model}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-2 py-0.5 font-semibold ${getTierBadgeStyle(
                              app.tier
                            )}`}
                          >
                            {app.tier}
                          </Badge>
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, app.id)}
                          className="p-1.5 text-[#80868b] hover:text-red-400 hover:bg-red-950/30 rounded-lg transition opacity-60 group-hover:opacity-100"
                          title="Hapus aplikasi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-base text-[#f1f3f4] group-hover:text-white transition line-clamp-1 mb-1.5">
                        {app.title}
                      </h3>

                      {/* Description / Preview */}
                      <p className="text-xs text-[#9aa0a6] line-clamp-2 leading-relaxed mb-4">
                        {app.description || "Tidak ada deskripsi"}
                      </p>
                    </div>

                    {/* Footer Meta */}
                    <div className="pt-3 border-t border-[#1f1a1a] flex items-center justify-between text-[11px] text-[#80868b]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDate(app.updatedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#408175]">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{app.messages?.length || 0} pesan</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : isLoaded ? (
              /* Empty State */
              <div className="rounded-2xl bg-[#141111] border border-[#241f1f] p-12 text-center max-w-lg mx-auto space-y-4 my-12">
                <div className="w-14 h-14 rounded-2xl bg-[#2E4540]/30 text-[#408175] border border-[#408175]/30 flex items-center justify-center mx-auto shadow-md">
                  <LayoutGrid className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-semibold text-white">
                    {searchQuery ? "Tidak ditemukan" : "Belum ada aplikasi yang disimpan"}
                  </h3>
                  <p className="text-xs text-[#9aa0a6] leading-relaxed max-w-sm mx-auto">
                    {searchQuery
                      ? `Tidak ada aplikasi yang cocok dengan kata kunci "${searchQuery}".`
                      : "Semua obrolan dan rancangan sistem yang Anda buat di Playground akan otomatis tersimpan di sini."}
                  </p>
                </div>
                {!searchQuery && (
                  <div className="pt-2">
                    <Link
                      href="/playground/new_chat"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#408175] text-white font-semibold text-xs hover:bg-[#4ea092] transition shadow-md shadow-[#408175]/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Mulai Chat Baru di Playground</span>
                    </Link>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
