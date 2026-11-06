"use client";

import React from "react";
import { Home } from "lucide-react";

export interface SummaryItem {
  label: string;
  value: string;
}

export interface DiscoverySummaryData {
  appName?: string;
  category?: string;
  subtitle?: string;
  badge?: string;
  targetUser?: string;
  backend?: string;
  productStage?: string;
  platform?: string;
  items?: SummaryItem[];
  footer?: string;
}

export function isDiscoverySummaryJson(text: string, language?: string): boolean {
  if (language === "discovery-summary-json") return true;
  if (!text || text.length < 15) return false;
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(text);
      if (parsed.appName && (parsed.targetUser || parsed.backend || parsed.platform || parsed.items)) {
        return true;
      }
    } catch {}
  }
  return false;
}

export function DiscoverySummaryCard({ rawJson }: { rawJson: string }) {
  const data: DiscoverySummaryData = React.useMemo(() => {
    try {
      return JSON.parse(rawJson);
    } catch {
      return {};
    }
  }, [rawJson]);

  const appName = data.appName || "Project Concept";
  const subtitle = data.subtitle || data.category || "Product concept · MVP · Web application";
  const badge = data.badge;

  // If specific items array is provided (Tahap 2 layout - 8 points)
  if (data.items && data.items.length > 0) {
    return (
      <div className="my-4 rounded-2xl border border-[#2e3032] bg-[#141517] p-5 sm:p-6 shadow-md space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#26282a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#202124] border border-[#3c4043] flex items-center justify-center text-white shrink-0">
              <Home className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                {appName}
              </h3>
              <p className="text-[11.5px] text-[#9aa0a6] mt-0.5">{subtitle}</p>
            </div>
          </div>

          {badge && (
            <span className="text-[10px] font-medium font-mono px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
              {badge}
            </span>
          )}
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 pt-1 text-xs">
          {data.items.map((item, idx) => (
            <div key={idx}>
              <span className="text-[11px] text-[#80868b] block mb-0.5">{item.label}</span>
              <span className="font-semibold text-white text-xs sm:text-[13px]">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Footer info line if provided */}
        {data.footer && (
          <div className="pt-3 border-t border-[#26282a] text-[11px] text-[#80868b] font-mono">
            {data.footer}
          </div>
        )}
      </div>
    );
  }

  // Tahap 1 default 4-grid layout
  const targetUser = data.targetUser || "Mahasiswa / Pengguna";
  const backend = data.backend || "Laravel 12";
  const productStage = data.productStage || "MVP dari nol";
  const platform = data.platform || "Web responsif";

  return (
    <div className="my-4 rounded-2xl border border-[#2e3032] bg-[#141517] p-5 sm:p-6 shadow-md">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#26282a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#202124] border border-[#3c4043] flex items-center justify-center text-white shrink-0">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">
              {appName}
            </h3>
            <p className="text-[11.5px] text-[#9aa0a6] mt-0.5">{subtitle}</p>
          </div>
        </div>

        <span className="text-[10px] font-medium font-mono px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
          Discovery
        </span>
      </div>

      {/* 2x2 Grid Info */}
      <div className="grid grid-cols-2 gap-4 pt-4 text-xs">
        <div>
          <span className="text-[11px] text-[#80868b] block mb-0.5">Target pengguna</span>
          <span className="font-semibold text-white text-xs sm:text-[13px]">{targetUser}</span>
        </div>
        <div>
          <span className="text-[11px] text-[#80868b] block mb-0.5">Backend</span>
          <span className="font-semibold text-white text-xs sm:text-[13px]">{backend}</span>
        </div>
        <div>
          <span className="text-[11px] text-[#80868b] block mb-0.5">Tahap produk</span>
          <span className="font-semibold text-white text-xs sm:text-[13px]">{productStage}</span>
        </div>
        <div>
          <span className="text-[11px] text-[#80868b] block mb-0.5">Platform</span>
          <span className="font-semibold text-white text-xs sm:text-[13px]">{platform}</span>
        </div>
      </div>
    </div>
  );
}
