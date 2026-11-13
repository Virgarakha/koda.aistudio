"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ArrowLeft, ArrowRight, Play, Pause } from "lucide-react";

export function TestimonialSection({
  brandName = "Koda",
}: {
  brandName?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLQuoteElement>(null);

  const testimonials = [
    {
      id: "hospitality",
      image:
        "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=800&q=80",
      quote: `Kami memiliki platform reservasi kamar yang kerap menghadapi risiko race condition saat lonjakan pemesanan bersamaan. ${brandName} mampu menganalisis alur transaksi dari kacamata arsitektur teknis, merancang isolasi transaksi PostgreSQL yang kokoh, dan memetakan diagram alur sequence yang presisi. Tim developer kami kini mengakui bahwa ini adalah cetak biru teknis paling jelas dan siap eksekusi yang pernah kami miliki sebelum sprint dimulai.`,
      author: "Sarah Caruthers",
      role: "Head of Product & Architecture, TravelSuite",
      duration: "00:35 / 00:38",
      totalSeconds: 38,
    },
    {
      id: "fintech",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
      quote: `Tim engineering kami menggunakan ${brandName} untuk mengaudit mekanisme locking pembayaran terdistribusi dan migrasi database sebelum rilis produksi. Koda berhasil mendeteksi tiga skenario edge-case race condition yang tidak terdeteksi oleh linter konvensional. Rasanya seperti memiliki seorang Principal Software Architect yang memvalidasi keputusan teknis tim kami 24/7 sebelum sebaris kode pun ditulis.`,
      author: "Marcus Vance",
      role: "VP of Engineering, FinTech Core",
      duration: "00:42 / 00:45",
      totalSeconds: 45,
    },
    {
      id: "startup",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
      quote: `Sebagai founder, menerjemahkan ide bisnis menjadi dokumen PRD teknis 13 bab biasanya menghabiskan waktu berminggu-minggu dengan biaya konsultasi yang mahal. Dengan ${brandName}, saya memperoleh dokumen spesifikasi lengkap, skema DDL PostgreSQL, serta diagram alur sistem dalam hitungan menit, langsung siap dieksekusi oleh tim developer tanpa ada miskomunikasi logika.`,
      author: "Elena Rostova",
      role: "Founder & CEO, ScaleCommerce",
      duration: "00:28 / 00:30",
      totalSeconds: 30,
    },
  ];

  const current = testimonials[currentIndex];

  // Words breakdown for typewriter effect
  const words = useMemo(() => {
    return current.quote.trim().split(/\s+/);
  }, [current.quote]);

  // Scroll parallax progress tracking
  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        const targetEl = quoteRef.current || sectionRef.current;
        if (!targetEl) return;

        const rect = targetEl.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Reveal begins when the quote element reaches 82% of the viewport from top
        // Reaches full completion (100% white) when it ascends to 20% from top
        const startY = windowHeight * 0.82;
        const endY = windowHeight * 0.20;

        const raw = (startY - rect.top) / (startY - endY);
        const clamped = Math.min(1, Math.max(0, raw));
        setScrollProgress(clamped);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Audio playback simulation syncing with text typing
  useEffect(() => {
    if (!isPlayingAudio) return;

    const interval = setInterval(() => {
      setAudioProgress((prev) => {
        if (prev >= 1) {
          setIsPlayingAudio(false);
          return 1;
        }
        return Math.min(1, prev + 0.005);
      });
    }, 60);

    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    setIsPlayingAudio(false);
    setAudioProgress(0);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    setIsPlayingAudio(false);
    setAudioProgress(0);
  };

  const handleToggleAudio = () => {
    if (!isPlayingAudio && audioProgress >= 0.98) {
      setAudioProgress(0);
    }
    setIsPlayingAudio((prev) => !prev);
  };

  // Effective progress: if audio is actively playing, use audioProgress; otherwise max of scroll or audio
  const effectiveProgress = isPlayingAudio
    ? audioProgress
    : Math.max(scrollProgress, audioProgress);

  const totalWords = words.length;
  const activeWordIndex = Math.min(
    totalWords - 1,
    Math.floor(effectiveProgress * totalWords)
  );
  const hasStarted = effectiveProgress > 0.01;
  const isComplete = effectiveProgress >= 0.98;

  // Sound wave bar heights
  const waveHeights = [
    6, 12, 18, 10, 14, 20, 16, 22, 18, 14, 8, 16, 24, 18, 12, 20, 14, 22, 16,
    10, 14, 18, 12, 20, 16, 10, 6, 12, 8, 4,
  ];

  // Dynamic audio timestamp
  const elapsedSec = Math.min(
    current.totalSeconds,
    Math.floor(effectiveProgress * current.totalSeconds)
  );
  const formattedTime = `00:${String(elapsedSec).padStart(2, "0")} / 00:${String(
    current.totalSeconds
  ).padStart(2, "0")}`;

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#141413] text-[#FAF9F5] select-none py-20 md:py-28 px-6 overflow-hidden border-t border-white/[0.04]"
    >
      <div className="max-w-[1320px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* ================= LEFT COLUMN: CUSTOMER PHOTO WITH PARALLAX & ARROWS ================= */}
          <div className="lg:col-span-5 flex flex-col items-start">
            {/* Customer Photo Container with vertical parallax gliding */}
            <div
              className="relative w-full max-w-[460px] aspect-[4/3.8] rounded-3xl overflow-hidden bg-[#1C1B19] border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.6)] transition-transform duration-300 ease-out will-change-transform"
              style={{
                transform: `translateY(${(0.5 - effectiveProgress) * 24}px)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={current.id}
                src={current.image}
                alt={current.author}
                className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.04] transition-all duration-700 animate-in fade-in zoom-in-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Carousel Navigation Arrows */}
            <div className="mt-6 flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="w-9 h-9 rounded-full bg-[#201F1D] hover:bg-[#2A2927] border border-white/10 text-[#C4C2BC] hover:text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-sm"
                title="Studi kasus sebelumnya"
              >
                <ArrowLeft className="w-4 h-4 stroke-[1.8]" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="w-9 h-9 rounded-full bg-[#201F1D] hover:bg-[#2A2927] border border-white/10 text-[#C4C2BC] hover:text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-sm"
                title="Studi kasus berikutnya"
              >
                <ArrowRight className="w-4 h-4 stroke-[1.8]" />
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: PARALLAX TYPEWRITER QUOTE & AUDIO PLAYER ================= */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* The Large Serif Quote with Scroll & Audio Synchronized Typing Effect */}
            <blockquote
              ref={quoteRef}
              className="font-serif text-2xl sm:text-3xl md:text-[31px] lg:text-[33px] font-normal leading-[1.38] tracking-tight"
            >
              <span
                className={`transition-colors duration-200 ${
                  hasStarted ? "text-[#FAF9F5]" : "text-[#55524B]"
                }`}
              >
                &ldquo;
              </span>

              {words.map((word, idx) => {
                const isRevealed = hasStarted && idx <= activeWordIndex;
                const isCurrentActive =
                  hasStarted && idx === activeWordIndex && !isComplete;

                return (
                  <React.Fragment key={idx}>
                    <span
                      className={`transition-colors duration-150 ${
                        isRevealed
                          ? "text-[#FAF9F5] font-normal"
                          : "text-[#55524B]"
                      }`}
                    >
                      {word}
                    </span>

                    {/* Terracotta typing indicator cursor */}
                    {isCurrentActive && (
                      <span
                        className="inline-block w-[2.5px] h-[0.82em] bg-[#CC785C] ml-1.5 align-middle animate-pulse shadow-[0_0_8px_rgba(204,120,92,0.8)] rounded-sm"
                        aria-hidden="true"
                      />
                    )}

                    {idx < words.length - 1 ? " " : ""}
                  </React.Fragment>
                );
              })}

              <span
                className={`transition-colors duration-200 ${
                  isComplete ? "text-[#FAF9F5]" : "text-[#55524B]"
                }`}
              >
                &rdquo;
              </span>
            </blockquote>

            {/* Author Details & Title */}
            <div className="mt-8">
              <div className="text-[15px] sm:text-[16px] font-medium text-[#FAF9F5] tracking-tight">
                {current.author}
              </div>
              <div className="text-[12px] sm:text-[12.5px] text-[#8A8782] mt-0.5 font-normal">
                {current.role}
              </div>
            </div>

            {/* Audio Wave Player Component */}
            <div className="mt-6 flex items-center gap-3.5 pt-2">
              {/* Play / Pause button */}
              <button
                type="button"
                onClick={handleToggleAudio}
                className="w-9 h-9 rounded-full bg-white hover:bg-neutral-200 text-[#141413] flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
                title={isPlayingAudio ? "Jeda rekaman" : "Putar kutipan audio"}
              >
                {isPlayingAudio ? (
                  <Pause className="w-3.5 h-3.5 fill-[#141413]" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-[#141413] translate-x-0.5" />
                )}
              </button>

              {/* Dynamic Sound Wave Bars synced with typing progress */}
              <div className="flex items-center gap-[2.5px] h-6 px-1">
                {waveHeights.map((h, i) => {
                  const dynamicHeight = isPlayingAudio
                    ? Math.max(
                        4,
                        Math.round(h * (0.6 + Math.sin(i * 0.8 + elapsedSec * 2) * 0.4))
                      )
                    : h;
                  const isBarFilled = i / waveHeights.length <= effectiveProgress;

                  return (
                    <div
                      key={i}
                      className="w-[2px] rounded-full transition-all duration-150"
                      style={{
                        height: `${dynamicHeight}px`,
                        backgroundColor: isBarFilled ? "#FAF9F5" : "#45433E",
                      }}
                    />
                  );
                })}
              </div>

              {/* Timestamp Indicator */}
              <div className="text-[10.5px] font-mono text-[#8A8782] tracking-tighter shrink-0 pl-1">
                {formattedTime}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
