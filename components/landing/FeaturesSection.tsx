"use client";

import React, { useState } from "react";
import { Play, Pause, FileText, ChevronDown, Plus, Minus, Layers } from "lucide-react";

export function FeaturesSection({
  brandName = "Koda",
}: {
  brandName?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const demoTabs = [
    {
      title: "Sistem Pemesanan Multi-Tenant — PRD Teknis v2.0",
      date: "14 Nov 2026",
      author: "@KodaArchitect",
      desc: "Penanganan konkurensi booking real-time, isolasi transaksi PostgreSQL SERIALIZABLE, dan webhook payment gateway idempotent.",
      tag: "SPESIFIKASI PRD",
      badge: "SIAP KODING",
      subLabel: "Koda System Engine",
      subDesc: "Pencegahan Race Condition Terverifikasi",
    },
    {
      title: "Sequence Diagram & Alur Transaksi Sistem",
      date: "Sprint 14",
      author: "@SystemLead",
      desc: "Pemetaan 12 node transisi status reservasi: DRAFT → MENUNGGU PEMBAYARAN → TERKONFIRMASI → SELESAI, dengan auto-cancel kedaluwarsa.",
      tag: "DIAGRAM ALUR",
      badge: "TERVALIDASI",
      subLabel: "Koda Flowchart Core",
      subDesc: "Diagram Sequence Mermaid Interaktif",
    },
    {
      title: "Inspirasi UI/UX & Harmonisasi Desain Sistem",
      date: "Desain Sistem",
      author: "@UIArchitect",
      desc: "Harmonisasi palet warna modern (Terracotta #CC785C, Warm Sand #FAF9F5, Slate #141413) terintegrasi langsung ke token Tailwind CSS.",
      tag: "TOKEN DESAIN",
      badge: "AKTIF",
      subLabel: "Koda Design Token",
      subDesc: "Inspirasi Dribbble & Komponen Bersih",
    },
  ];

  const currentDoc = demoTabs[activeTab];

  const columns = [
    {
      number: "01",
      title: "Bebaskan tim dari beban teknis manual",
      desc: `Minta ${brandName} menyusun draf awal PRD 13 bab, memetakan aturan bisnis, dan merangkum kebutuhan kompleks menjadi spesifikasi yang terstruktur rapi.`,
    },
    {
      number: "02",
      title: "Ubah ide abstrak menjadi arsitektur nyata",
      desc: "Bawa ide produk yang masih mentah, dan Koda akan menghasilkan diagram alur sequence, skema DDL PostgreSQL, serta skenario edge case yang siap dikerjakan engineer.",
    },
    {
      number: "03",
      title: "Tingkatkan standar rekayasa perangkat lunak",
      desc: "Perjelas logika anti-race condition, sinkronkan ekspektasi antara PM, desainer antarmuka, dan developer, serta percepat delivery produk Anda.",
    },
  ];

  return (
    <section className="relative w-full bg-[#141413] text-[#FAF9F5] select-none pt-12 pb-24 px-6 overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.02)_0%,transparent_60%)] pointer-events-none" />

      {/* Ghosted Background Elements */}
      <div className="absolute top-10 left-12 w-32 h-32 rounded-2xl bg-[#1C1B19]/30 border border-white/[0.03] -rotate-6 pointer-events-none hidden lg:block" />
      <div className="absolute top-8 right-16 w-36 h-36 rounded-2xl bg-[#1C1B19]/30 border border-white/[0.03] rotate-12 pointer-events-none hidden lg:block" />

      <div className="max-w-[1240px] mx-auto relative z-10">
        {/* ================= 1. VIDEO / ARTIFACT PREVIEW CARD ================= */}
        <div className="flex justify-center mb-20 md:mb-28">
          <div className="relative w-full max-w-[700px] bg-[#FAF9F5] text-[#141413] rounded-[26px] md:rounded-[30px] p-6 sm:p-9 shadow-[0_25px_70px_rgba(0,0,0,0.6)] border border-white/10 transition-transform duration-300 hover:scale-[1.01]">
            
            {/* Top Toolbar of the Document */}
            <div className="flex items-center justify-between pb-6 border-b border-[#E6E4DD] text-[12px] text-[#6E6C66]">
              {/* Left: Tab Selector Dropdown */}
              <div
                className="flex items-center gap-1.5 bg-[#EAE8E1] hover:bg-[#E0DED7] px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                onClick={() => setActiveTab((prev) => (prev + 1) % demoTabs.length)}
              >
                <FileText className="w-3.5 h-3.5 opacity-70" />
                <span className="font-medium text-[#2E2D2B]">Tab {activeTab + 1} dari 3</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </div>

              {/* Right: Quick actions icons */}
              <div className="flex items-center gap-2.5 text-[#8A8780]">
                <button
                  type="button"
                  title="Ganti tab dokumen"
                  onClick={() => setActiveTab((prev) => (prev + 1) % demoTabs.length)}
                  className="hover:text-[#141413] transition-colors p-1"
                >
                  <Layers className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="hover:text-[#141413] transition-colors p-1">
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="hover:text-[#141413] transition-colors p-1">
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="pt-7 pb-4">
              {/* Document Title */}
              <h2 className="font-serif text-2xl sm:text-3xl md:text-[34px] font-medium text-[#1A1918] tracking-tight leading-snug">
                {currentDoc.title}
              </h2>

              {/* Metadata Badges */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-[11.5px]">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAE8E1] text-[#4E4D49] font-medium">
                  <span>📅</span>
                  <span>{currentDoc.date}</span>
                </div>
                <div className="px-2.5 py-0.5 rounded-full bg-[#EAE8E1] text-[#4E4D49] font-medium">
                  {currentDoc.author}
                </div>
                <div className="px-2 py-0.5 rounded-md bg-[#2E4540]/20 text-[#408175] text-[10px] font-semibold tracking-wider">
                  {currentDoc.tag}
                </div>
              </div>

              {/* Paragraph Preview */}
              <p className="mt-4 text-[13px] sm:text-[14px] text-[#55534E] leading-relaxed max-w-lg">
                {currentDoc.desc}
              </p>

              {/* Graphical Spec Diagram Preview */}
              <div className="mt-6 p-3.5 rounded-xl bg-[#F0EFEA] border border-[#E2E0D8] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E2E0D8] flex items-center justify-center font-serif font-bold text-xs text-[#2E2D2B]">
                    KD
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-[#1C1B1A]">
                      {currentDoc.subLabel}
                    </div>
                    <div className="text-[10px] text-[#7A7771]">
                      {currentDoc.subDesc}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#C75A38] text-white text-[10px] font-bold tracking-wider">
                  {currentDoc.badge}
                </div>
              </div>
            </div>

            {/* ================= CENTER PLAY BUTTON ================= */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(!isPlaying);
                  setActiveTab((prev) => (prev + 1) % demoTabs.length);
                }}
                className="pointer-events-auto w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#1C1B1A] hover:bg-[#2A2927] text-white flex items-center justify-center shadow-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 border border-white/10 group cursor-pointer"
                title={isPlaying ? "Jeda demo" : "Putar demo interaktif"}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white fill-white translate-x-0.5 transition-transform group-hover:scale-110" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ================= 2. THREE-COLUMN FEATURES GRID ================= */}
        <div className="pt-8 border-t border-[#262524]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 lg:gap-16">
            {columns.map((col) => (
              <div key={col.number} className="flex flex-col group">
                {/* Number Indicator */}
                <div className="text-[12px] font-sans font-normal text-[#8A8782] tracking-wider mb-3">
                  {col.number}
                </div>

                {/* Serif Column Headline */}
                <h3 className="font-serif text-2xl sm:text-[26px] font-normal text-[#FAF9F5] leading-snug tracking-tight mb-3 group-hover:text-white transition-colors">
                  {col.title}
                </h3>

                {/* Body Text */}
                <p className="text-[14px] sm:text-[14.5px] text-[#A3A09A] leading-relaxed font-sans font-normal">
                  {col.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
