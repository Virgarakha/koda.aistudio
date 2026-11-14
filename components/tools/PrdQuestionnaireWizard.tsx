"use client";

import React, { useState } from "react";
import { Sparkles, Layers, ArrowRight, Wand2, Check } from "lucide-react";

interface PrdQuestionnaireWizardProps {
  onSelectPrompt: (promptText: string) => void;
}

const APP_TYPES = [
  { id: "saas", label: "SaaS B2B", desc: "Multi-tenant & analitik" },
  { id: "mobile", label: "Mobile App B2C", desc: "Aplikasi konsumen cepat" },
  { id: "marketplace", label: "Marketplace & Rental", desc: "Multi-vendor & escrow" },
  { id: "pos", label: "POS Kasir Retail", desc: "Offline-first & struk" },
  { id: "flashsale", label: "War Tiket / Flash Sale", desc: "Beban tinggi & queue" },
];

const CONCURRENCY_MODES = [
  { id: "high", label: "High Concurrency (Anti-Race Condition)", tag: "FOR UPDATE Lock" },
  { id: "offline", label: "Offline-First Sync", tag: "SQLite + Cloud" },
  { id: "standard", label: "Standard Cloud CRUD", tag: "REST API Fast" },
];

const MONETIZATION_MODES = [
  { id: "subscription", label: "Subscription / Langganan Bulanan" },
  { id: "escrow", label: "Split Escrow / Komisi Transaksi" },
  { id: "free", label: "Gratis / Open Source" },
];

const TECH_STACKS = [
  { id: "next_supa", label: "Next.js 16 + Supabase PostgreSQL" },
  { id: "flutter_go", label: "Flutter Mobile + Golang Microservices" },
  { id: "rn_node", label: "React Native + Node.js Express" },
];

export function PrdQuestionnaireWizard({ onSelectPrompt }: PrdQuestionnaireWizardProps) {
  const [selectedType, setSelectedType] = useState<string>("marketplace");
  const [selectedConcurrency, setSelectedConcurrency] = useState<string>("high");
  const [selectedMonetization, setSelectedMonetization] = useState<string>("escrow");
  const [selectedStack, setSelectedStack] = useState<string>("next_supa");

  const buildPrompt = () => {
    const typeObj = APP_TYPES.find((t) => t.id === selectedType);
    const concObj = CONCURRENCY_MODES.find((c) => c.id === selectedConcurrency);
    const monObj = MONETIZATION_MODES.find((m) => m.id === selectedMonetization);
    const stackObj = TECH_STACKS.find((s) => s.id === selectedStack);

    return `Tolong rancang spesifikasi arsitektur sistem dan PRD 13 Bab lengkap untuk aplikasi bertipe ${typeObj?.label || "Platform Aplikasi"}.
Fitur & Karakteristik Utama:
- Skala & Concurrency: ${concObj?.label} (${concObj?.tag || ""})
- Model Bisnis: ${monObj?.label}
- Rekomendasi Tech Stack: ${stackObj?.label}

Mohon siapkan user journey, mitigasi edge cases, diagram alur sistem, dan skema database PostgreSQL 3NF anti-race condition.`;
  };

  const handleLaunch = () => {
    const finalPrompt = buildPrompt();
    onSelectPrompt(finalPrompt);
  };

  return (
    <div className="w-full rounded-2xl border border-[#2B2321] bg-gradient-to-br from-[#161110] via-[#120E0D] to-[#0A0707] p-4 sm:p-5 shadow-xl relative overflow-hidden space-y-4">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-52 h-52 bg-[#D97757]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#241A17]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#D97757]/20 border border-[#D97757]/40 flex items-center justify-center text-[#D97757]">
            <Wand2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-[#FAF6F4] flex items-center gap-2">
              <span>Smart Guided PRD Wizard</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#D97757]/20 text-[#E88C6F] border border-[#D97757]/30">
                1-Klik Racik
              </span>
            </h3>
            <p className="text-[11px] text-[#A89892]">
              Pilih karakteristik produk di bawah untuk merangkai spesifikasi arsitektur instan:
            </p>
          </div>
        </div>
      </div>

      {/* Chips Group 1: Tipe Aplikasi */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#C4B2AC] uppercase tracking-wider block">
          1. Tipe Aplikasi & Domain:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {APP_TYPES.map((item) => {
            const isSelected = selectedType === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedType(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? "bg-[#D97757]/20 border-[#D97757] text-[#FAF6F4] shadow-sm"
                    : "bg-[#18110F] border-[#291D19] text-[#A89892] hover:text-white hover:bg-[#201614]"
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-[#D97757]" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chips Group 2: Skala & Concurrency */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#C4B2AC] uppercase tracking-wider block">
          2. Skala Beban & Concurrency Locking:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CONCURRENCY_MODES.map((item) => {
            const isSelected = selectedConcurrency === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedConcurrency(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? "bg-[#408175]/20 border-[#408175] text-[#FAF6F4] shadow-sm"
                    : "bg-[#18110F] border-[#291D19] text-[#A89892] hover:text-white hover:bg-[#201614]"
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-[#408175]" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chips Group 3: Monetisasi & Tech Stack (2 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Monetisasi */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#C4B2AC] uppercase tracking-wider block">
            3. Model Bisnis:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {MONETIZATION_MODES.map((item) => {
              const isSelected = selectedMonetization === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedMonetization(item.id)}
                  className={`px-2.5 py-1.2 rounded-lg text-[11.5px] font-medium transition cursor-pointer flex items-center gap-1 border ${
                    isSelected
                      ? "bg-[#D97757]/20 border-[#D97757] text-[#FAF6F4]"
                      : "bg-[#18110F] border-[#291D19] text-[#A89892] hover:text-white"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-[#D97757]" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#C4B2AC] uppercase tracking-wider block">
            4. Rekomendasi Tech Stack:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {TECH_STACKS.map((item) => {
              const isSelected = selectedStack === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedStack(item.id)}
                  className={`px-2.5 py-1.2 rounded-lg text-[11.5px] font-medium transition cursor-pointer flex items-center gap-1 border ${
                    isSelected
                      ? "bg-sky-500/20 border-sky-500 text-sky-200"
                      : "bg-[#18110F] border-[#291D19] text-[#A89892] hover:text-white"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-sky-400" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-[#241A17] flex items-center justify-between">
        <span className="text-[11px] text-[#8D7D77]">
          Prompt otomatis dirangkai dengan spesifikasi arsitektur produksi.
        </span>

        <button
          type="button"
          onClick={handleLaunch}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D97757] hover:bg-[#e28464] text-white text-xs font-bold transition shadow-lg shadow-[#D97757]/20 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Racik & Generate PRD Sekarang</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
