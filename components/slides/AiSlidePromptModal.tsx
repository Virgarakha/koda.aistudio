"use client";

import React, { useState } from "react";
import { SlideThemeId, SLIDE_THEMES, PresentationDeck } from "@/lib/slides/types";
import {
  Sparkles,
  X,
  Layers,
  Palette,
  Users,
  Compass,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

interface AiSlidePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeckGenerated: (deck: PresentationDeck) => void;
  initialTopic?: string;
}

const INSPIRATION_PROMPTS = [
  {
    title: "💻 Materi PHP Dasar untuk Mahasiswa",
    topic: "Materi Pembelajaran PHP Dasar untuk Mahasiswa: Konsep arsitektur server-side vs client-side, sintaks tag PHP, variabel & tipe data, struktur kontrol perulangan, array, dan langkah praktik.",
    tone: "education",
    slides: 6,
    theme: "auto",
  },
  {
    title: "🚀 Pitch Deck Startup AI",
    topic: "Pitch Deck Startup AI Coding Agent & Spec-Driven Platform: Problem kelemahan AI coding saat ini, Solusi arsitektur Koda 3 pilar, Pasar $15B, Model bisnis B2B SaaS, dan Traction 120+ tim.",
    tone: "pitch_deck",
    slides: 8,
    theme: "auto",
  },
  {
    title: "📊 Laporan Kinerja Bisnis & Sprint",
    topic: "Laporan Kinerja Bulanan & Evaluasi Sprint Q2: Pencapaian target 125%, Retensi pengguna 92%, Hambatan bug concurrency, dan Rencana aksi perbaikan kuartal berikutnya.",
    tone: "business_report",
    slides: 6,
    theme: "auto",
  },
  {
    title: "🛍️ Peluncuran Produk Baru",
    topic: "Product Launch Aplikasi E-Commerce Multi-Vendor: Fitur checkout kilat, Sistem penguncian stok otomatis anti-rebutan, Desain modern warm earthy, dan Program promo peluncuran.",
    tone: "product_launch",
    slides: 6,
    theme: "auto",
  },
];

export function AiSlidePromptModal({
  isOpen,
  onClose,
  onDeckGenerated,
  initialTopic = "",
}: AiSlidePromptModalProps) {
  const [topic, setTopic] = useState(initialTopic);
  const [slideCount, setSlideCount] = useState(6);
  const [tone, setTone] = useState("auto");
  const [theme, setTheme] = useState<string>("auto");
  const [targetAudience, setTargetAudience] = useState("Mahasiswa & Peserta");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepText, setCurrentStepText] = useState("");

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setCurrentStepText("Menganalisis topik dan target audiens...");

    const steps = [
      "Menganalisis topik dan target audiens...",
      "Merancang gaya visual & memilih tema warna...",
      "Menyusun alur cerita (Storyline) & struktur slide...",
      "Membuat konten mendalam & tata letak 16:9...",
      "Menyelesaikan slide deck siap edit...",
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setCurrentStepText(steps[stepIdx]);
      }
    }, 1100);

    try {
      const res = await fetch("/api/slides/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          slideCount,
          tone,
          theme,
          targetAudience,
        }),
      });

      clearInterval(interval);

      if (!res.ok) {
        throw new Error("Gagal membuat presentasi");
      }

      const data = await res.json();
      if (data.deck) {
        onDeckGenerated(data.deck);
        onClose();
      }
    } catch (err: any) {
      clearInterval(interval);
      console.error("Slide generation error:", err);
      alert("Terjadi kesalahan koneksi, silakan coba kembali.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyInspiration = (item: typeof INSPIRATION_PROMPTS[0]) => {
    setTopic(item.topic);
    setTone(item.tone);
    setSlideCount(item.slides);
    setTheme(item.theme);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#332520] bg-[#120E0D] shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[#D97757]/15 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#241a17]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D97757]/20 border border-[#D97757]/40 flex items-center justify-center text-[#D97757]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#FAF6F4] flex items-center gap-2">
                <span>Slider AI Generator</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#D97757]/20 text-[#E88C6F] border border-[#D97757]/30">
                  AI Design & Storyline
                </span>
              </h3>
              <p className="text-xs text-[#A89892]">
                Jelaskan apa yang ingin Anda presentasikan. AI akan mendesain gaya visual, alur materi, dan kontennya dari nol.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 rounded-lg text-[#80868b] hover:text-white hover:bg-[#221714] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Area */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#D2C3BD] mb-1.5">
              Topik & Rencana Presentasi Anda:
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isGenerating}
              rows={3}
              placeholder="Contoh: Buatkan materi pembelajaran PHP dasar untuk mahasiswa, jelaskan konsep arsitektur server-side, sintaks tag, variabel, tipe data, dan latihan kode..."
              className="w-full rounded-xl border border-[#332520] bg-[#1A1311] px-3.5 py-2.5 text-sm text-[#FAF6F4] placeholder-[#73635D] outline-none focus:border-[#D97757] focus:ring-1 focus:ring-[#D97757] transition resize-none"
            />
          </div>

          {/* Quick Inspiration Chips */}
          <div>
            <div className="text-[11px] font-medium text-[#8D7D77] mb-2 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#D97757]" />
              <span>Inspirasi Topik Cepat:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INSPIRATION_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyInspiration(item)}
                  disabled={isGenerating}
                  className="text-left p-2.5 rounded-lg border border-[#2B1D19] bg-[#18110F] hover:bg-[#241916] hover:border-[#D97757]/40 text-xs text-[#C4B2AC] hover:text-[#FAF6F4] transition cursor-pointer line-clamp-1"
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Slide Count */}
            <div>
              <label className="block text-[11px] font-semibold text-[#A89892] mb-1">
                Jumlah Slide:
              </label>
              <select
                value={slideCount}
                onChange={(e) => setSlideCount(Number(e.target.value))}
                disabled={isGenerating}
                className="w-full rounded-lg border border-[#332520] bg-[#1A1311] px-2.5 py-1.5 text-xs text-[#FAF6F4] outline-none focus:border-[#D97757]"
              >
                <option value={5}>5 Slide (Ringkas & Padat)</option>
                <option value={6}>6 Slide (Ideal Presentasi)</option>
                <option value={8}>8 Slide (Standar Komprehensif)</option>
                <option value={10}>10 Slide (Mendalam / Tutorial)</option>
                <option value={12}>12 Slide (Modul Lengkap)</option>
              </select>
            </div>

            {/* Tone / Gaya */}
            <div>
              <label className="block text-[11px] font-semibold text-[#A89892] mb-1">
                Gaya / Alur:
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                disabled={isGenerating}
                className="w-full rounded-lg border border-[#332520] bg-[#1A1311] px-2.5 py-1.5 text-xs text-[#FAF6F4] outline-none focus:border-[#D97757]"
              >
                <option value="auto">✨ AI Adaptif (Sesuai Topik)</option>
                <option value="education">🎓 Edukasi & Materi Kuliah</option>
                <option value="technical">💻 Teknis & Pemrograman</option>
                <option value="pitch_deck">🚀 Pitch Deck Startup</option>
                <option value="business_report">📊 Laporan Bisnis & Evaluasi</option>
                <option value="product_launch">🛍️ Peluncuran Produk</option>
              </select>
            </div>

            {/* Visual Theme */}
            <div>
              <label className="block text-[11px] font-semibold text-[#A89892] mb-1">
                Desain & Tema Warna:
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                disabled={isGenerating}
                className="w-full rounded-lg border border-[#332520] bg-[#1A1311] px-2.5 py-1.5 text-xs text-[#FAF6F4] outline-none focus:border-[#D97757]"
              >
                <option value="auto">🎨 Biarkan AI Desain Tema</option>
                <option value="dark_cyber">Obsidian Cyber (Coding & IT)</option>
                <option value="ocean_blue">Oceanic Blue (Data & Cloud)</option>
                <option value="emerald">Emerald (Bisnis & Medis)</option>
                <option value="terracotta">Terracotta Warm (Koda)</option>
                <option value="minimal_light">Minimalist Light (Akademik)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-[#241a17] flex items-center justify-between">
          <div className="text-xs text-[#A89892]">
            {isGenerating ? (
              <span className="flex items-center gap-2 text-[#D97757] animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#D97757]" />
                <span>{currentStepText}</span>
              </span>
            ) : (
              <span>AI akan menyusun narasi, desain layout, dan speaker notes.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[#80868b] hover:text-white hover:bg-[#1a1210] transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#D97757] hover:bg-[#e28464] disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-bold transition shadow-lg shadow-[#D97757]/20 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? "Mendesain..." : "Desain Presentasi Sekarang"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
