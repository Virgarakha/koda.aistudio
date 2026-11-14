"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PresentationDeck,
  SlideData,
  SlideLayout,
  SlideThemeId,
  SLIDE_THEMES,
} from "@/lib/slides/types";
import {
  getSavedDecks,
  saveDeck,
  createBlankDeck,
  getDefaultStarterDeck,
} from "@/lib/slides/storage";
import { SlideCanvas } from "./SlideCanvas";
import { SlideFilmstrip } from "./SlideFilmstrip";
import { PresentationMode } from "./PresentationMode";
import { AiSlidePromptModal } from "./AiSlidePromptModal";
import {
  ArrowLeft,
  Sparkles,
  Play,
  Printer,
  Download,
  Palette,
  Check,
  ChevronDown,
  LayoutTemplate,
  MessageSquare,
  Wand2,
  Trash2,
  Plus,
  Share2,
} from "lucide-react";

export function SlideEditorStudio() {
  const [decks, setDecks] = useState<PresentationDeck[]>([]);
  const [activeDeck, setActiveDeck] = useState<PresentationDeck | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isSavedRecently, setIsSavedRecently] = useState(false);
  const [quickTopic, setQuickTopic] = useState("");

  // Load decks on mount
  useEffect(() => {
    const loaded = getSavedDecks();
    setDecks(loaded);
    if (loaded.length > 0) {
      setActiveDeck(loaded[0]);
    } else {
      const def = getDefaultStarterDeck();
      setActiveDeck(def);
      saveDeck(def);
    }
  }, []);

  const handleCreateNewBlank = () => {
    const blank = createBlankDeck("Presentasi Baru", "terracotta");
    setActiveDeck(blank);
    setActiveSlideIndex(0);
    setDecks((prev) => [blank, ...prev.filter((d) => d.id !== blank.id)]);
  };

  // Sync auto-save
  const triggerSave = (updated: PresentationDeck) => {
    setActiveDeck(updated);
    saveDeck(updated);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2000);
  };

  if (!activeDeck) {
    return (
      <div className="h-screen w-screen bg-[#0B0909] flex items-center justify-center text-xs text-[#80868b]">
        Memuat Koda Slider Studio...
      </div>
    );
  }

  const currentTheme = SLIDE_THEMES[activeDeck.theme] || SLIDE_THEMES.terracotta;
  const currentSlide = activeDeck.slides[activeSlideIndex] || activeDeck.slides[0];

  // Slide CRUD Actions
  const handleUpdateCurrentSlide = (updatedSlide: SlideData) => {
    const updatedSlides = [...activeDeck.slides];
    updatedSlides[activeSlideIndex] = updatedSlide;
    const updatedDeck: PresentationDeck = {
      ...activeDeck,
      slides: updatedSlides,
    };
    triggerSave(updatedDeck);
  };

  const handleAddSlide = (layout: SlideLayout = "cards") => {
    const newSlide: SlideData = {
      id: `slide-${Date.now()}`,
      layout,
      title: "Slide Baru",
      subtitle: "Tambahkan poin atau penjelasan pendukung",
      badge: "KODA AI",
      cards:
        layout === "cards"
          ? [
              { id: "c-1", title: "Poin Pertama", description: "Penjelasan ringkas.", badge: "01" },
              { id: "c-2", title: "Poin Kedua", description: "Penjelasan ringkas.", badge: "02" },
              { id: "c-3", title: "Poin Ketiga", description: "Penjelasan ringkas.", badge: "03" },
            ]
          : undefined,
      bulletPoints: layout === "split" ? ["Poin penjelasan pertama...", "Poin penjelasan kedua..."] : undefined,
      speakerNotes: "Catatan presenter untuk slide ini.",
    };

    const newSlides = [...activeDeck.slides];
    newSlides.splice(activeSlideIndex + 1, 0, newSlide);
    const updatedDeck = { ...activeDeck, slides: newSlides };
    triggerSave(updatedDeck);
    setActiveSlideIndex(activeSlideIndex + 1);
  };

  const handleDuplicateSlide = (index: number) => {
    const target = activeDeck.slides[index];
    const duplicated: SlideData = {
      ...JSON.parse(JSON.stringify(target)),
      id: `slide-${Date.now()}`,
      title: `${target.title} (Salinan)`,
    };
    const newSlides = [...activeDeck.slides];
    newSlides.splice(index + 1, 0, duplicated);
    triggerSave({ ...activeDeck, slides: newSlides });
    setActiveSlideIndex(index + 1);
  };

  const handleDeleteSlide = (index: number) => {
    if (activeDeck.slides.length <= 1) return;
    const newSlides = activeDeck.slides.filter((_, i) => i !== index);
    const newIdx = Math.min(activeSlideIndex, newSlides.length - 1);
    triggerSave({ ...activeDeck, slides: newSlides });
    setActiveSlideIndex(newIdx);
  };

  const handleMoveSlide = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= activeDeck.slides.length) return;
    const newSlides = [...activeDeck.slides];
    const [moved] = newSlides.splice(fromIndex, 1);
    newSlides.splice(toIndex, 0, moved);
    triggerSave({ ...activeDeck, slides: newSlides });
    setActiveSlideIndex(toIndex);
  };

  const handleSwitchTheme = (themeId: SlideThemeId) => {
    triggerSave({ ...activeDeck, theme: themeId });
  };

  const handleSwitchLayout = (layout: SlideLayout) => {
    handleUpdateCurrentSlide({ ...currentSlide, layout });
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(activeDeck, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeDeck.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-slides.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleDeckGenerated = (newDeck: PresentationDeck) => {
    saveDeck(newDeck);
    setDecks(getSavedDecks());
    setActiveDeck(newDeck);
    setActiveSlideIndex(0);
  };

  return (
    <div className="h-screen w-screen bg-[#0B0909] text-[#f1f3f4] flex flex-col overflow-hidden select-none">
      {/* 1. TOP STUDIO NAVBAR */}
      <header className="h-14 border-b border-[#1f1a1a] bg-[#0E0C0C] px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/tools"
            className="p-1.5 text-[#9aa0a6] hover:text-white hover:bg-[#1a1616] rounded-lg transition"
            title="Kembali ke Tools Hub"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="h-4 w-px bg-[#262020]" />

          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-[#D97757] flex items-center gap-1.5">
              <span>Slider</span>
            </span>
            <span className="text-xs text-[#80868b]">/</span>
            <input
              type="text"
              value={activeDeck.title}
              onChange={(e) => triggerSave({ ...activeDeck, title: e.target.value })}
              className="font-semibold text-xs text-[#FAF6F4] bg-transparent outline-none border-b border-transparent hover:border-white/20 focus:border-[#D97757] transition max-w-[280px] sm:max-w-[400px] truncate"
              placeholder="Judul Presentasi..."
            />
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#408175] font-medium ml-2">
            <Check className="w-3.5 h-3.5" />
            <span>{isSavedRecently ? "Menyimpan..." : "Tersimpan otomatis"}</span>
          </div>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-2">
          {/* New Blank Deck Button */}
          <button
            onClick={handleCreateNewBlank}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2B1D19] bg-[#18110F] hover:bg-[#241916] text-[#C4B2AC] hover:text-[#FAF6F4] text-xs font-medium transition cursor-pointer"
            title="Mulai slide baru dari kosong"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Deck Kosong</span>
          </button>

          {/* New PPT with AI Button */}
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D97757]/15 hover:bg-[#D97757]/25 border border-[#D97757]/40 text-[#E88C6F] text-xs font-semibold transition cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Generate PPT</span>
            <span className="sm:hidden">AI</span>
          </button>

          {/* Theme Switcher Dropdown */}
          <div className="relative group">
            <select
              value={activeDeck.theme}
              onChange={(e) => handleSwitchTheme(e.target.value as SlideThemeId)}
              className="appearance-none px-3 py-1.5 pr-7 rounded-lg bg-[#1a1616] hover:bg-[#221c1c] border border-[#2a2424] text-xs font-medium text-[#c4c7c5] outline-none cursor-pointer transition"
            >
              {Object.values(SLIDE_THEMES).map((th) => (
                <option key={th.id} value={th.id}>
                  {th.name}
                </option>
              ))}
            </select>
            <Palette className="w-3.5 h-3.5 text-[#80868b] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Export / Print Button */}
          <div className="relative group">
            <button
              onClick={handlePrintPdf}
              className="p-1.5 text-[#9aa0a6] hover:text-white hover:bg-[#1a1616] rounded-lg transition cursor-pointer border border-[#241f1f]"
              title="Cetak atau Simpan PDF (16:9 Landscape)"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportJson}
            className="p-1.5 text-[#9aa0a6] hover:text-white hover:bg-[#1a1616] rounded-lg transition cursor-pointer border border-[#241f1f]"
            title="Download JSON Deck"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Present Mode Button */}
          <button
            onClick={() => setIsPresenting(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#408175] hover:bg-[#4ea092] text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-[#408175]/20"
            title="Mulai Presentasi Layar Penuh"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Presentasi</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE AREA */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: Slide Filmstrip Navigation */}
        <SlideFilmstrip
          slides={activeDeck.slides}
          activeSlideIndex={activeSlideIndex}
          theme={currentTheme}
          onSelectSlide={setActiveSlideIndex}
          onAddSlide={handleAddSlide}
          onDuplicateSlide={handleDuplicateSlide}
          onDeleteSlide={handleDeleteSlide}
          onMoveSlide={handleMoveSlide}
        />

        {/* Center: Slide Stage & Canvas */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#070505] overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {/* Quick AI Creation Box for Blank/Starter Decks */}
          {activeDeck.slides.length <= 1 && (
            <div className="w-full max-w-5xl mx-auto mb-4 p-4 rounded-xl border border-[#D97757]/30 bg-[#160E0C] shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#D97757]/20 border border-[#D97757]/40 flex items-center justify-center text-[#D97757] shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#FAF6F4] flex items-center gap-2">
                    <span>Mulai dengan AI Presentation Designer</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#D97757]/20 text-[#E88C6F] border border-[#D97757]/30">
                      Desain Otomatis
                    </span>
                  </h4>
                  <p className="text-[11px] text-[#A89892]">
                    Ketik topik materi yang ingin dibuat (misal: &ldquo;Materi PHP Dasar untuk Mahasiswa&rdquo;). AI akan menyusun gaya, tema warna, dan alur slide dari nol.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Ketik topik presentasi..."
                  value={quickTopic}
                  onChange={(e) => setQuickTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && quickTopic.trim()) {
                      setIsAiModalOpen(true);
                    }
                  }}
                  className="flex-1 sm:w-64 rounded-lg border border-[#332520] bg-[#1A1210] px-3 py-1.5 text-xs text-[#FAF6F4] placeholder-[#73635D] outline-none focus:border-[#D97757]"
                />
                <button
                  onClick={() => setIsAiModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#D97757] hover:bg-[#e28464] text-white text-xs font-bold transition cursor-pointer shrink-0 shadow-md shadow-[#D97757]/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Desain AI</span>
                </button>
              </div>
            </div>
          )}

          {/* Layout Selector Bar */}
          <div className="w-full max-w-5xl mx-auto mb-3 flex items-center justify-between text-xs text-[#80868b] shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              <span className="font-semibold text-[#80868b] mr-1 flex items-center gap-1">
                <LayoutTemplate className="w-3.5 h-3.5" />
                <span>Layout:</span>
              </span>
              {[
                { id: "title", label: "Cover" },
                { id: "split", label: "2 Kolom" },
                { id: "cards", label: "3 Kartu" },
                { id: "metrics", label: "Metrik Angka" },
                { id: "timeline", label: "Roadmap" },
                { id: "comparison", label: "Tabel Komparasi" },
                { id: "quote", label: "Kutipan" },
                { id: "conclusion", label: "Penutup CTA" },
              ].map((layoutItem) => {
                const isActive = currentSlide.layout === layoutItem.id;
                return (
                  <button
                    key={layoutItem.id}
                    onClick={() => handleSwitchLayout(layoutItem.id as SlideLayout)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer shrink-0 ${
                      isActive
                        ? "bg-[#D97757] text-white font-bold"
                        : "bg-[#181313] text-[#9aa0a6] hover:text-white hover:bg-[#221b1b]"
                    }`}
                  >
                    {layoutItem.label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                showNotes ? "bg-[#261f1c] text-[#D97757]" : "bg-[#141010] text-[#80868b] hover:text-white"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Catatan Pembicara</span>
            </button>
          </div>

          {/* Active 16:9 Slide Canvas */}
          <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col justify-center min-h-[400px]">
            <SlideCanvas
              slide={currentSlide}
              theme={currentTheme}
              slideNumber={activeSlideIndex + 1}
              totalSlides={activeDeck.slides.length}
              onUpdateSlide={handleUpdateCurrentSlide}
              readOnly={false}
            />
          </div>

          {/* Speaker Notes Drawer */}
          {showNotes && (
            <div className="w-full max-w-5xl mx-auto mt-4 p-4 rounded-xl border border-[#2b221f] bg-[#140F0E] space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between text-xs font-semibold text-[#D2C3BD]">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#D97757]" />
                  <span>Catatan Pembicara (Speaker Notes) — Slide {activeSlideIndex + 1}</span>
                </span>
                <span className="text-[11px] text-[#80868b] font-normal">
                  Hanya terlihat oleh Anda selama persiapan presentasi
                </span>
              </div>
              <textarea
                value={currentSlide.speakerNotes || ""}
                onChange={(e) =>
                  handleUpdateCurrentSlide({
                    ...currentSlide,
                    speakerNotes: e.target.value,
                  })
                }
                rows={3}
                placeholder="Tuliskan poin penting yang ingin Anda sampaikan secara lisan saat menampilkan slide ini..."
                className="w-full rounded-lg border border-[#332520] bg-[#1A1311] p-3 text-xs text-[#FAF6F4] placeholder-[#73635D] outline-none focus:border-[#D97757] resize-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. FULLSCREEN PRESENTATION MODE MODAL */}
      {isPresenting && (
        <PresentationMode
          slides={activeDeck.slides}
          theme={currentTheme}
          initialSlideIndex={activeSlideIndex}
          onClose={() => setIsPresenting(false)}
        />
      )}

      {/* 4. AI GENERATOR MODAL */}
      <AiSlidePromptModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onDeckGenerated={handleDeckGenerated}
        initialTopic={quickTopic}
      />

      {/* Print CSS for clean 16:9 PDF export */}
      <style jsx global>{`
        @media print {
          body {
            background: #000 !important;
            color: #fff !important;
          }
          header,
          aside,
          button,
          .select-none {
            display: none !important;
          }
          .aspect-video {
            page-break-after: always;
            width: 100vw !important;
            height: 100vh !important;
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 3rem !important;
          }
        }
      `}</style>
    </div>
  );
}
