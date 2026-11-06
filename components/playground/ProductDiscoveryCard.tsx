"use client";

import React, { useState } from "react";
import { Sparkles, Layers, UserCircle, HelpCircle } from "lucide-react";

export interface ProductDiscoveryData {
  idea: string;
  targetUser: string;
  userBackground: string; // Ceritakan tentang dirimu / Apakah kamu tahu tentang IT?
  platform: string;
  stage: string;
  techStack: string;
}

interface ProductDiscoveryCardProps {
  onSubmit: (data: ProductDiscoveryData) => void;
  initialIdea?: string;
  isLoading?: boolean;
}

const IT_BACKGROUND_OPTIONS = [
  {
    id: "non_it",
    label: "Awam / Non-IT (Pemula)",
    description: "Saya pebisnis/umum/non-IT. Jelaskan dengan bahasa bisnis sederhana tanpa istilah teknis yang rumit.",
  },
  {
    id: "vibe_coder",
    label: "Vibe Coder / AI Enthusiast",
    description: "Saya sering pakai AI coding tool (Cursor/Claude/v0), paham konsep dasar tapi butuh panduan alur logika & database.",
  },
  {
    id: "it_tech",
    label: "Background IT / Developer / Mahasiswa IT",
    description: "Saya paham teknis IT, database relasional, API, dan arsitektur backend.",
  },
];

const PLATFORM_OPTIONS = [
  "Web App",
  "Mobile App",
  "Web + Mobile",
  "SaaS / AI Platform",
  "Belum ditentukan",
];

const STAGE_OPTIONS = [
  "MVP baru — mulai dari nol",
  "Pengembangan fitur produk yang sudah ada",
  "Redesign atau rebuild",
  "Produk production-ready",
];

export function ProductDiscoveryCard({
  onSubmit,
  initialIdea = "",
  isLoading = false,
}: ProductDiscoveryCardProps) {
  const [idea, setIdea] = useState(initialIdea);
  const [targetUser, setTargetUser] = useState("");
  const [userBackground, setUserBackground] = useState("non_it");
  const [platform, setPlatform] = useState("Web App");
  const [stage, setStage] = useState("MVP baru — mulai dari nol");
  const [techStack, setTechStack] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    const bgLabel = IT_BACKGROUND_OPTIONS.find((b) => b.id === userBackground)?.label || "Awam / Non-IT (Pemula)";

    onSubmit({
      idea: idea.trim(),
      targetUser: targetUser.trim(),
      userBackground: bgLabel,
      platform,
      stage,
      techStack: techStack.trim(),
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-4 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="mb-4 px-1">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1.5">
          Mari mulai membangun PRD
        </h1>
        <p className="text-[13px] sm:text-sm text-[#9aa0a6] leading-relaxed">
          Ceritakan ide produkmu dengan bahasa bebas. Tidak harus sudah lengkap atau teknis—kami sesuaikan bahasa penjelasan dengan latar belakangmu.
        </p>
      </div>

      {/* Main Card Container */}
      <div className="rounded-2xl border border-[#2e3032] bg-[#161718] p-5 sm:p-7 shadow-xl space-y-5">
        {/* Card Header */}
        <div className="space-y-1 pb-1">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Product Discovery
          </h2>
          <p className="text-xs text-[#9aa0a6] leading-relaxed">
            Isi informasi yang sudah kamu ketahui. Bagian yang belum diketahui boleh dikosongkan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question 1: Apa ide produk yang ingin kamu bangun? */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#e3e3e3] block">
              1. Apa ide produk yang ingin kamu bangun?
            </label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={3}
              placeholder="Contoh: Platform booking kos mahasiswa di Malang, toko online thrift shop, aplikasi kasir laundry..."
              className="w-full bg-[#111213] border border-[#3c4043] focus:border-[#5a5d61] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#80868b] focus:outline-none transition leading-relaxed resize-y"
            />
          </div>

          {/* Question 2: Ceritakan tentang dirimu (Pemahaman tentang IT) */}
          <div className="space-y-2 pt-1 border-t border-[#26282a] pt-3.5">
            <div className="space-y-0.5">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <UserCircle className="w-4 h-4 text-[#d97736]" />
                <span>2. Ceritakan tentang dirimu: Apakah kamu tahu tentang IT?</span>
              </label>
              <p className="text-[11.5px] text-[#9aa0a6] leading-relaxed">
                Kami menyesuaikan tingkat kedalaman teknis agar pertanyaan dan panduan alur mudah kamu pahami.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              {IT_BACKGROUND_OPTIONS.map((opt) => {
                const isSelected = userBackground === opt.id;
                return (
                  <label
                    key={opt.id}
                    onClick={() => setUserBackground(opt.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition ${
                      isSelected
                        ? "border-[#d97736] bg-[#d97736]/10 text-white"
                        : "border-[#2e3032] bg-[#121314] text-[#c4c7c5] hover:border-[#444746] hover:text-white"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 transition ${
                        isSelected
                          ? "border-[#d97736] bg-transparent"
                          : "border-[#5f6368]"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-[#d97736]" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs sm:text-[12.5px] font-semibold leading-tight block">
                        {opt.label}
                      </span>
                      <span className="text-[11px] text-[#9aa0a6] block leading-relaxed">
                        {opt.description}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Question 3: Siapa target penggunanya? */}
          <div className="space-y-1.5 pt-1 border-t border-[#26282a] pt-3.5">
            <label className="text-xs font-medium text-[#e3e3e3] block">
              3. Siapa target penggunanya?
            </label>
            <input
              type="text"
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
              placeholder="Contoh: Mahasiswa, anak kos, pemilik kos, pelanggan umum"
              className="w-full bg-[#111213] border border-[#3c4043] focus:border-[#5a5d61] rounded-full px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#80868b] focus:outline-none transition"
            />
          </div>

          {/* Question 4: Platform produk */}
          <div className="space-y-2 pt-1 border-t border-[#26282a] pt-3.5">
            <label className="text-xs font-medium text-[#e3e3e3] block">
              4. Platform produk
            </label>
            <div className="space-y-2.5 pt-0.5">
              {PLATFORM_OPTIONS.map((opt) => {
                const isSelected = platform === opt;
                return (
                  <label
                    key={opt}
                    onClick={() => setPlatform(opt)}
                    className="flex items-center gap-3 cursor-pointer text-xs sm:text-[13px] text-[#e3e3e3] select-none hover:text-white transition group"
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                        isSelected
                          ? "border-white bg-transparent"
                          : "border-[#5f6368] group-hover:border-[#9aa0a6]"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Question 5: Tahap pengembangan */}
          <div className="space-y-2 pt-1 border-t border-[#26282a] pt-3.5">
            <label className="text-xs font-medium text-[#e3e3e3] block">
              5. Tahap pengembangan
            </label>
            <div className="space-y-2.5 pt-0.5">
              {STAGE_OPTIONS.map((opt) => {
                const isSelected = stage === opt;
                return (
                  <label
                    key={opt}
                    onClick={() => setStage(opt)}
                    className="flex items-center gap-3 cursor-pointer text-xs sm:text-[13px] text-[#e3e3e3] select-none hover:text-white transition group"
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                        isSelected
                          ? "border-white bg-transparent"
                          : "border-[#5f6368] group-hover:border-[#9aa0a6]"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Question 6: Tech stack (opsional) */}
          <div className="space-y-1.5 pt-1 border-t border-[#26282a] pt-3.5">
            <label className="text-xs font-medium text-[#e3e3e3] block">
              6. Tech stack (opsional)
            </label>
            <input
              type="text"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="Contoh: Laravel 12, React, atau biarkan kosong jika Anda non-IT"
              className="w-full bg-[#111213] border border-[#3c4043] focus:border-[#5a5d61] rounded-full px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#80868b] focus:outline-none transition"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 sm:py-3 px-4 rounded-full bg-[#f1f3f4] hover:bg-white text-[#131314] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md active:scale-[0.99] disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-[#131314]" />
              <span>{isLoading ? "Menghubungkan ke Engine..." : "Mulai Product Discovery"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
