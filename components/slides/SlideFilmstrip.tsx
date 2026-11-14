"use client";

import React from "react";
import { SlideData, SlideLayout, SlideThemeConfig } from "@/lib/slides/types";
import {
  Plus,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  LayoutTemplate,
  Layers,
} from "lucide-react";

interface SlideFilmstripProps {
  slides: SlideData[];
  activeSlideIndex: number;
  theme: SlideThemeConfig;
  onSelectSlide: (index: number) => void;
  onAddSlide: (layout?: SlideLayout) => void;
  onDuplicateSlide: (index: number) => void;
  onDeleteSlide: (index: number) => void;
  onMoveSlide: (fromIndex: number, toIndex: number) => void;
}

export function SlideFilmstrip({
  slides,
  activeSlideIndex,
  theme,
  onSelectSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onMoveSlide,
}: SlideFilmstripProps) {
  const getLayoutLabel = (layout: SlideLayout) => {
    switch (layout) {
      case "title":
        return "Cover";
      case "split":
        return "2 Kolom";
      case "cards":
        return "Kartu";
      case "metrics":
        return "Metrik";
      case "timeline":
        return "Roadmap";
      case "comparison":
        return "Tabel";
      case "quote":
        return "Kutipan";
      case "conclusion":
        return "Penutup";
      default:
        return "Slide";
    }
  };

  return (
    <div className="w-56 sm:w-64 border-r border-[#1f1a1a] bg-[#0E0C0C] flex flex-col h-full shrink-0 select-none">
      {/* Header */}
      <div className="p-3 border-b border-[#1f1a1a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#D97757]" />
          <span className="text-xs font-semibold text-[#f1f3f4]">
            Daftar Slide ({slides.length})
          </span>
        </div>
        <button
          onClick={() => onAddSlide("split")}
          className="p-1 hover:bg-[#1a1616] text-[#9aa0a6] hover:text-white rounded transition cursor-pointer"
          title="Tambah Slide Baru"
        >
          <Plus className="w-4 h-4 text-[#408175]" />
        </button>
      </div>

      {/* Slide Thumbnails List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {slides.map((s, idx) => {
          const isActive = idx === activeSlideIndex;
          return (
            <div
              key={s.id || idx}
              onClick={() => onSelectSlide(idx)}
              className={`group relative rounded-lg border p-2.5 transition cursor-pointer ${
                isActive
                  ? `border-[#D97757] bg-[#1a1412] shadow-[0_0_12px_rgba(217,119,87,0.15)] ring-1 ring-[#D97757]/40`
                  : `border-[#221c1c] bg-[#141010] hover:border-[#382d2d] hover:bg-[#181313]`
              }`}
            >
              {/* Top row: Number & Layout Badge */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] font-mono font-bold flex items-center justify-center ${
                      isActive
                        ? "bg-[#D97757] text-white"
                        : "bg-[#241f1f] text-[#80868b]"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-[10px] font-medium text-[#80868b] uppercase tracking-wider">
                    {getLayoutLabel(s.layout)}
                  </span>
                </div>

                {/* Quick actions on hover */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition">
                  <button
                    disabled={idx === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveSlide(idx, idx - 1);
                    }}
                    className="p-0.5 text-[#80868b] hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Pindah ke atas"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={idx === slides.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveSlide(idx, idx + 1);
                    }}
                    className="p-0.5 text-[#80868b] hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Pindah ke bawah"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateSlide(idx);
                    }}
                    className="p-0.5 text-[#80868b] hover:text-white cursor-pointer"
                    title="Duplikat slide"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {slides.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSlide(idx);
                      }}
                      className="p-0.5 text-red-400 hover:text-red-300 cursor-pointer"
                      title="Hapus slide"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Title preview */}
              <div className="text-xs font-semibold text-[#f1f3f4] line-clamp-1">
                {s.title || `Slide ${idx + 1}`}
              </div>
              <div className="text-[11px] text-[#80868b] line-clamp-1 mt-0.5">
                {s.subtitle || s.badge || "Tanpa deskripsi"}
              </div>

              {/* Mini aspect-video wireframe placeholder */}
              <div className="w-full aspect-[16/9] rounded bg-black/40 mt-2 border border-white/5 flex items-center justify-center p-1 overflow-hidden">
                <div className="w-full h-full flex flex-col justify-center items-center gap-0.5 opacity-30">
                  <div className="w-3/4 h-1 bg-current rounded-full" />
                  <div className="w-1/2 h-0.5 bg-current rounded-full" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action */}
      <div className="p-3 border-t border-[#1f1a1a] bg-[#0A0808]">
        <button
          onClick={() => onAddSlide("cards")}
          className="w-full py-2 px-3 rounded-lg bg-[#1a1412] hover:bg-[#261c18] border border-[#D97757]/30 text-[#D97757] hover:text-[#E88C6F] text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Slide Baru</span>
        </button>
      </div>
    </div>
  );
}
