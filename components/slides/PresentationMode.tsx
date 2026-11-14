"use client";

import React, { useState, useEffect } from "react";
import { SlideData, SlideThemeConfig } from "@/lib/slides/types";
import { SlideCanvas } from "./SlideCanvas";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  Play,
} from "lucide-react";

interface PresentationModeProps {
  slides: SlideData[];
  theme: SlideThemeConfig;
  initialSlideIndex?: number;
  onClose: () => void;
}

export function PresentationMode({
  slides,
  theme,
  initialSlideIndex = 0,
  onClose,
}: PresentationModeProps) {
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length, onClose]);

  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <div className="fixed inset-0 z-50 bg-[#050404] flex flex-col items-center justify-center p-4 sm:p-8 select-none">
      {/* 16:9 Presentation Stage Container */}
      <div className="w-full max-w-6xl max-h-[85vh] flex items-center justify-center">
        <SlideCanvas
          slide={currentSlide}
          theme={theme}
          slideNumber={currentIndex + 1}
          totalSlides={slides.length}
          onUpdateSlide={() => {}}
          readOnly={true}
        />
      </div>

      {/* Floating Bottom Control Bar */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-black/80 backdrop-blur-md border border-white/10 shadow-2xl transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
          className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white disabled:opacity-20 cursor-pointer transition"
          title="Slide Sebelumnya (Panah Kiri)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-mono font-medium text-white/80 px-2">
          {currentIndex + 1} / {slides.length}
        </span>

        <button
          disabled={currentIndex === slides.length - 1}
          onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1))}
          className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white disabled:opacity-20 cursor-pointer transition"
          title="Slide Berikutnya (Panah Kanan / Spasi)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="w-px h-4 bg-white/20 mx-1" />

        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white cursor-pointer transition"
          title="Layar Penuh (F)"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-red-500/20 text-white/80 hover:text-red-400 cursor-pointer transition"
          title="Keluar Presentasi (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
