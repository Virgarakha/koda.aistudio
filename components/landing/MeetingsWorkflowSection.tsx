"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ArrowUp,
  Plus,
  RotateCcw,
} from "lucide-react";
import { ClaudeSunburst } from "./ClaudeSunburst";

export function MeetingsWorkflowSection({
  brandName = "Koda",
}: {
  brandName?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [currentStep, setCurrentStep] = useState(0); // 0 = 08:00, 1 = 12:00, 2 = 16:00
  const [isReplaying, setIsReplaying] = useState(false);
  const isAnimatingRef = useRef(false);

  // 3 Workflows corresponding to 08:00, 12:00, 16:00
  const workflows = [
    {
      time: "08:00",
      category: "Untuk seluruh tim",
      title: "Kelola ide, rapat perencanaan, dan backlog tanpa jeda",
      desc: `${brandName} membaca setiap transkrip rapat teknis, merangkum keputusan arsitektur dan penanggung jawab ke satu daftar terpadu, mengirimkannya ke kanal tim di Slack, dan memantau status sebelum sync berikutnya di Google Calendar.`,
      cardColor: "#E9C0A9", // Peach
      patternColor: "#FAF9F5",
      prompt: `Setelah setiap rapat arsitektur minggu ini, baca transkripnya dan pisahkan keputusan teknis dari action items. Kirimkan daftar berjalan ke kanal tim #dev-core dan ingatkan penanggung jawab 2 hari sebelum sprint review jika tugas masih terbuka.`,
      model: `${brandName} Architect Core`,
      steps: [
        {
          type: "koda",
          text: "Memisahkan keputusan teknis dari daftar action items",
        },
        {
          type: "calendar",
          text: "Cek jadwal sync mingguan, evaluasi tim berikutnya Kamis",
        },
        {
          type: "slack",
          text: "Kirim ringkasan backlog ke kanal #dev-core",
          hasChevron: true,
        },
        {
          type: "check",
          text: "Terjadwal otomatis: setelah setiap sesi rapat teknis",
        },
      ],
      sources: ["Dari Kalender", "Dari Slack"],
      activeDockIcons: ["calendar", "slack", "ai"],
    },
    {
      time: "12:00",
      category: "Untuk produk & rekayasa sistem",
      title: "Sintesis wawancara pengguna & PRD teknis 13 bab",
      desc: `${brandName} menyaring rekaman sesi pengguna siang hari, mengekstrak pain point utama, merancang acceptance criteria, dan menyusun spesifikasi PRD lengkap siap eksekusi ke Notion dan GitHub issues.`,
      cardColor: "#BEC4CB", // Slate Lavender
      patternColor: "#FAF9F5",
      prompt: `Ambil seluruh transkrip feedback pengguna pada sprint ini. Kelompokkan kebutuhan fitur, tulis user stories lengkap dengan acceptance criteria, dan hasilkan dokumen PRD teknis 13 bab beserta diagram alur sistem.`,
      model: `${brandName} Reasoning Pro`,
      steps: [
        {
          type: "koda",
          text: "Mengelompokkan pain point & kebutuhan fitur pengguna",
        },
        {
          type: "drive",
          text: "Memindai dokumen transkrip dari Google Drive",
        },
        {
          type: "notion",
          text: "Sinkronisasi dokumen PRD & user stories ke Notion workspace",
          hasChevron: true,
        },
        {
          type: "check",
          text: "Pemicu otomatis: setiap akhir siklus wawancara pengguna",
        },
      ],
      sources: ["Dari Drive", "Dari Notion"],
      activeDockIcons: ["drive", "notion", "ai"],
    },
    {
      time: "16:00",
      category: "Untuk rilis & pipeline produksi",
      title: "Audit locking database & otomatisasi checklist rilis",
      desc: `${brandName} mengaudit isolasi transaksi PostgreSQL, mendeteksi potensi race condition, memvalidasi skema migrasi database, dan mengirimkan checklist kesiapan deploy ke tim DevOps sebelum rilis produksi.`,
      cardColor: "#B2C4BC", // Mint / Sage Green
      patternColor: "#FAF9F5",
      prompt: `Audit seluruh PR migrasi database yang dijadwalkan deploy sore ini. Verifikasi locking pada tabel transaksi keuangan, pastikan indeks query optimal, dan posting ringkasan kesiapan ke PR GitHub serta kanal #devops-deploy.`,
      model: `${brandName} Systems Architect`,
      steps: [
        {
          type: "koda",
          text: "Audit mekanisme locking & race condition pada PostgreSQL",
        },
        {
          type: "github",
          text: "Memvalidasi commit migrasi & PR pull request #142",
        },
        {
          type: "slack",
          text: "Kirim konfirmasi approval ke kanal #devops-deploy",
          hasChevron: true,
        },
        {
          type: "check",
          text: "Verifikasi selesai: checklist rilis produksi 100% aman",
        },
      ],
      sources: ["Dari GitHub", "Dari Slack"],
      activeDockIcons: ["github", "slack", "ai"],
    },
  ];

  const currentWf = workflows[currentStep];

  // Intercept scroll wheel and touch events to stay STUCK until 3 canvases are thrown
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleWheel = (e: WheelEvent) => {
      const rect = section.getBoundingClientRect();
      // Section is active when its top is within the upper viewport and bottom is in lower viewport
      const isInFocus =
        rect.top <= 120 && rect.bottom >= window.innerHeight - 120;

      if (!isInFocus) return;

      // Scrolling DOWN
      if (e.deltaY > 18) {
        if (currentStep < 2) {
          e.preventDefault();
          if (isAnimatingRef.current) return;
          isAnimatingRef.current = true;

          // Smoothly align the section to screen top if slightly misaligned
          if (Math.abs(rect.top) > 10) {
            section.scrollIntoView({ behavior: "smooth", block: "start" });
          }

          setCurrentStep((prev) => Math.min(2, prev + 1));
          setTimeout(() => {
            isAnimatingRef.current = false;
          }, 650);
        }
        // If currentStep === 2 (canvas terakhir), e.preventDefault is NOT called,
        // allowing natural scrolling to continue down to Section 5!
      }
      // Scrolling UP
      else if (e.deltaY < -18) {
        if (currentStep > 0) {
          e.preventDefault();
          if (isAnimatingRef.current) return;
          isAnimatingRef.current = true;

          if (Math.abs(rect.top) > 10) {
            section.scrollIntoView({ behavior: "smooth", block: "start" });
          }

          setCurrentStep((prev) => Math.max(0, prev - 1));
          setTimeout(() => {
            isAnimatingRef.current = false;
          }, 650);
        }
        // If currentStep === 0, e.preventDefault is NOT called,
        // allowing natural scrolling to continue up to Section 3!
      }
    };

    // Mobile touch handling
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchCurrentY = e.touches[0].clientY;
      const deltaY = touchStartY - touchCurrentY;
      const rect = section.getBoundingClientRect();
      const isInFocus =
        rect.top <= 120 && rect.bottom >= window.innerHeight - 120;

      if (!isInFocus) return;

      if (deltaY > 35 && currentStep < 2) {
        if (e.cancelable) e.preventDefault();
        if (isAnimatingRef.current) return;
        isAnimatingRef.current = true;
        setCurrentStep((prev) => Math.min(2, prev + 1));
        setTimeout(() => {
          isAnimatingRef.current = false;
        }, 650);
      } else if (deltaY < -35 && currentStep > 0) {
        if (e.cancelable) e.preventDefault();
        if (isAnimatingRef.current) return;
        isAnimatingRef.current = true;
        setCurrentStep((prev) => Math.max(0, prev - 1));
        setTimeout(() => {
          isAnimatingRef.current = false;
        }, 650);
      }
    };

    section.addEventListener("wheel", handleWheel, { passive: false });
    section.addEventListener("touchstart", handleTouchStart, { passive: true });
    section.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      section.removeEventListener("wheel", handleWheel);
      section.removeEventListener("touchstart", handleTouchStart);
      section.removeEventListener("touchmove", handleTouchMove);
    };
  }, [currentStep]);

  const handleReplay = () => {
    setIsReplaying(true);
    setTimeout(() => setIsReplaying(false), 700);
  };

  const renderStepIcon = (iconType: string) => {
    switch (iconType) {
      case "koda":
        return <ClaudeSunburst className="w-4 h-4 text-[#CC785C] shrink-0" />;
      case "calendar":
        return (
          <div className="w-4 h-4 shrink-0 flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="3" fill="#4285F4" />
              <path d="M3 9H21V20C21 21.1 20.1 22 19 22H5C3.9 22 3 21.1 3 20V9Z" fill="white" />
              <text x="12" y="18" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#4285F4">31</text>
              <rect x="7" y="2" width="2" height="4" rx="1" fill="#1967D2" />
              <rect x="15" y="2" width="2" height="4" rx="1" fill="#1967D2" />
            </svg>
          </div>
        );
      case "drive":
        return (
          <div className="w-4 h-4 shrink-0 flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M8.5 3L15.5 3L22 14.5L15 14.5L8.5 3Z" fill="#FFBA00" />
              <path d="M2 14.5L8.5 3L12 9L5.5 20.5L2 14.5Z" fill="#00AC47" />
              <path d="M5.5 20.5L12 9L22 14.5L15.5 20.5L5.5 20.5Z" fill="#0066DA" />
            </svg>
          </div>
        );
      case "notion":
        return (
          <div className="w-4 h-4 rounded bg-[#1C1B1A] text-white flex items-center justify-center font-serif text-[10px] font-bold shrink-0">
            N
          </div>
        );
      case "github":
        return (
          <div className="w-4 h-4 rounded bg-[#1C1B1A] text-white flex items-center justify-center font-mono text-[9px] font-bold shrink-0">
            GH
          </div>
        );
      case "slack":
        return (
          <div className="w-4 h-4 shrink-0 flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M6 15a2 2 0 1 1-2-2h2v2zm1 0a2 2 0 1 1 2 2v-2H7zm0-1a2 2 0 1 1 2-2H7v2zm-1-5a2 2 0 1 1-2 2h2V9zm6 0a2 2 0 1 1 2-2v2h-2zm-1 0a2 2 0 1 1-2 2V9h2zm0 1a2 2 0 1 1-2 2h2v-2zm5 6a2 2 0 1 1 2-2h-2v2zm-1 0a2 2 0 1 1-2-2v2h2zm0-1a2 2 0 1 1-2 2h2v-2z" fill="#E01E5A" />
            </svg>
          </div>
        );
      case "check":
      default:
        return (
          <div className="w-3.5 h-3.5 rounded-full bg-[#E2E0D8] text-[#1C1B1A] flex items-center justify-center text-[9px] font-bold shrink-0">
            ✓
          </div>
        );
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen bg-[#141413] text-[#FAF9F5] select-none py-16 md:py-24 px-4 sm:px-6 md:px-8 flex flex-col justify-center overflow-hidden border-t border-white/[0.04]"
    >
      <div className="max-w-[1360px] w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* ================= LEFT SIDE: TIMELINE AXIS & WORKFLOW CONTENT ================= */}
          <div className="lg:col-span-5 flex items-start gap-6 sm:gap-8">
            {/* Timeline Axis (08:00 — 12:00 — 16:00) */}
            <div className="flex flex-col items-center shrink-0 pt-1 text-[11px] font-mono select-none">
              {/* 08:00 */}
              <button
                type="button"
                onClick={() => setCurrentStep(0)}
                className={`flex items-center gap-2 cursor-pointer transition-colors duration-300 text-left ${
                  currentStep === 0
                    ? "text-[#FAF9F5] font-semibold"
                    : "text-[#7D7A74] hover:text-[#C4C2BC]"
                }`}
                title="Ke jadwal 08:00"
              >
                <span
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentStep === 0
                      ? "bg-[#CC785C] shadow-[0_0_8px_rgba(204,120,92,0.9)] scale-125"
                      : "bg-[#45433F]"
                  }`}
                />
                <span>08:00</span>
              </button>

              {/* Vertical Connector Line 1 */}
              <div className="relative w-[1.5px] h-20 sm:h-24 my-2.5 bg-[#2E2C29] overflow-hidden rounded-full">
                <div
                  className="absolute top-0 left-0 w-full bg-[#CC785C] transition-all duration-500"
                  style={{
                    height: currentStep >= 1 ? "100%" : "0%",
                  }}
                />
              </div>

              {/* 12:00 */}
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`flex items-center gap-2 cursor-pointer transition-colors duration-300 text-left ${
                  currentStep === 1
                    ? "text-[#FAF9F5] font-semibold"
                    : "text-[#7D7A74] hover:text-[#C4C2BC]"
                }`}
                title="Ke jadwal 12:00"
              >
                <span
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentStep === 1
                      ? "bg-[#CC785C] shadow-[0_0_8px_rgba(204,120,92,0.9)] scale-125"
                      : "bg-[#45433F]"
                  }`}
                />
                <span>12:00</span>
              </button>

              {/* Vertical Connector Line 2 */}
              <div className="relative w-[1.5px] h-20 sm:h-24 my-2.5 bg-[#2E2C29] overflow-hidden rounded-full">
                <div
                  className="absolute top-0 left-0 w-full bg-[#CC785C] transition-all duration-500"
                  style={{
                    height: currentStep >= 2 ? "100%" : "0%",
                  }}
                />
              </div>

              {/* 16:00 */}
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`flex items-center gap-2 cursor-pointer transition-colors duration-300 text-left ${
                  currentStep === 2
                    ? "text-[#FAF9F5] font-semibold"
                    : "text-[#7D7A74] hover:text-[#C4C2BC]"
                }`}
                title="Ke jadwal 16:00"
              >
                <span
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentStep === 2
                      ? "bg-[#CC785C] shadow-[0_0_8px_rgba(204,120,92,0.9)] scale-125"
                      : "bg-[#45433F]"
                  }`}
                />
                <span>16:00</span>
              </button>
            </div>

            {/* Dynamic Content Typography */}
            <div className="flex-1 min-h-[220px] flex flex-col justify-center">
              {/* Category Pill Dropdown */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#201F1D] border border-white/10 text-[11.5px] text-[#A8A6A0] hover:text-[#FAF9F5] cursor-pointer transition-colors w-fit"
                onClick={() => setCurrentStep((prev) => (prev + 1) % 3)}
                title="Klik untuk berpindah ke alur kerja berikutnya"
              >
                <span>{currentWf.category}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </div>

              {/* Headline */}
              <h3
                key={`title-${currentStep}`}
                className="font-serif text-3xl sm:text-4xl md:text-[40px] font-normal text-[#FAF9F5] leading-[1.18] tracking-tight mt-5 mb-5 transition-all duration-500 animate-in fade-in"
              >
                {currentWf.title}
              </h3>

              {/* Descriptive Paragraph */}
              <p
                key={`desc-${currentStep}`}
                className="text-[14.5px] sm:text-[15px] text-[#A3A09A] leading-relaxed font-sans transition-all duration-500 animate-in fade-in"
              >
                {currentWf.desc}
              </p>
            </div>
          </div>

          {/* ================= RIGHT SIDE: 3 STACKED DISMISSIBLE CANVASES ================= */}
          <div className="lg:col-span-7 relative flex items-center justify-center">
            <div className="relative w-full max-w-[620px] h-[450px] sm:h-[480px]">
              
              {/* ---------------- CARD 3: 16:00 (Mint / Sage Green, Bottom Layer) ---------------- */}
              {(() => {
                const wf = workflows[2];
                // Card 3 moves from scale 0.92 (-20px) to 0.96 (-10px) to 1.00 (0px)
                const scale =
                  currentStep === 0 ? 0.92 : currentStep === 1 ? 0.96 : 1.0;
                const translateY =
                  currentStep === 0 ? -20 : currentStep === 1 ? -10 : 0;

                return (
                  <div
                    className="absolute inset-0 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-700 ease-out will-change-transform"
                    style={{
                      zIndex: 10,
                      backgroundColor: wf.cardColor,
                      transform: `translateY(${translateY}px) scale(${scale})`,
                      transformOrigin: "center bottom",
                    }}
                  >
                    {/* Criss-Cross Abstract Background Lines */}
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
                      viewBox="0 0 600 400"
                      fill="none"
                    >
                      <line x1="0" y1="80" x2="600" y2="320" stroke={wf.patternColor} strokeWidth="1.2" />
                      <line x1="120" y1="0" x2="480" y2="400" stroke={wf.patternColor} strokeWidth="1.2" />
                      <line x1="0" y1="280" x2="500" y2="20" stroke={wf.patternColor} strokeWidth="1" />
                      <line x1="250" y1="0" x2="600" y2="250" stroke={wf.patternColor} strokeWidth="1" />
                    </svg>

                    <div className="relative z-10 flex flex-col gap-5 sm:gap-6">
                      {/* Top-Right: User Prompt Input Bubble */}
                      <div className="self-end w-full max-w-[390px] bg-white text-[#1C1B1A] rounded-2xl p-4 sm:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-black/[0.04]">
                        <p className="text-[12px] sm:text-[12.8px] leading-relaxed text-[#242321] font-sans">
                          {wf.prompt}
                        </p>

                        <div className="mt-3.5 pt-3 border-t border-[#F0EFEA] flex items-center justify-between">
                          <button
                            type="button"
                            className="w-6 h-6 rounded-md hover:bg-[#F0EFEA] flex items-center justify-center text-[#7A7771] transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-[11px] text-[#6E6C66] font-medium px-2 py-0.5 rounded-md hover:bg-[#F0EFEA] cursor-pointer">
                              <span>{wf.model}</span>
                              <ChevronDown className="w-3 h-3 opacity-60" />
                            </div>

                            <div className="w-6 h-6 rounded-lg bg-[#CC785C] hover:bg-[#BA694E] flex items-center justify-center text-white cursor-pointer shadow-sm transition-colors">
                              <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom-Left: Automated Execution Card */}
                      <div className="self-start w-full max-w-[400px]">
                        <div className="bg-white text-[#1C1B1A] rounded-2xl p-4 sm:p-5 shadow-[0_12px_36px_rgba(0,0,0,0.12)] border border-black/[0.04] space-y-2.5 sm:space-y-3">
                          {wf.steps.map((st, sIdx) => (
                            <div
                              key={sIdx}
                              className={`flex items-center justify-between text-[12px] sm:text-[12.5px] text-[#242321] ${
                                sIdx === 3 ? "pt-2 border-t border-[#F0EFEA] text-[11px] text-[#73706A]" : ""
                              }`}
                            >
                              <div className="flex items-center gap-2.5 sm:gap-3">
                                {renderStepIcon(st.type)}
                                <span className="leading-snug">{st.text}</span>
                              </div>
                              {st.hasChevron && (
                                <ChevronDown className="w-3.5 h-3.5 text-[#9E9B93] shrink-0" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="mt-5 sm:mt-6 pt-3.5 border-t border-black/10 flex items-center justify-between text-[11.5px] text-[#554F49]">
                      <div className="flex items-center gap-2">
                        {wf.sources.map((src, sIdx) => (
                          <span key={sIdx} className="px-2 py-0.5 rounded-md bg-white/40 font-medium">
                            {src}
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleReplay}
                        className="flex items-center gap-1.5 text-[#423C36] hover:text-black font-medium transition-colors cursor-pointer"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${isReplaying ? "animate-spin" : ""}`} />
                        <span>Putar Ulang</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* ---------------- CARD 2: 12:00 (Slate Lavender, Middle Layer) ---------------- */}
              {(() => {
                const wf = workflows[1];
                // In step 0: waiting at scale 0.96 (-10px)
                // In step 1: active at center scale 1.0 (0px)
                // In step >= 2: thrown away to the right!
                const isDismissed = currentStep >= 2;
                const scale = currentStep === 0 ? 0.96 : 1.0;
                const translateY = currentStep === 0 ? -10 : isDismissed ? -35 : 0;
                const translateX = isDismissed ? "140%" : "0%";
                const rotate = isDismissed ? "18deg" : "0deg";
                const opacity = isDismissed ? 0 : 1;

                return (
                  <div
                    className="absolute inset-0 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-700 ease-out will-change-transform"
                    style={{
                      zIndex: 20,
                      backgroundColor: wf.cardColor,
                      transform: `translateX(${translateX}) translateY(${translateY}px) rotate(${rotate}) scale(${scale})`,
                      transformOrigin: "center bottom",
                      opacity: opacity,
                      pointerEvents: isDismissed ? "none" : "auto",
                    }}
                  >
                    {/* Criss-Cross Abstract Background Lines */}
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
                      viewBox="0 0 600 400"
                      fill="none"
                    >
                      <line x1="0" y1="80" x2="600" y2="320" stroke={wf.patternColor} strokeWidth="1.2" />
                      <line x1="120" y1="0" x2="480" y2="400" stroke={wf.patternColor} strokeWidth="1.2" />
                      <line x1="0" y1="280" x2="500" y2="20" stroke={wf.patternColor} strokeWidth="1" />
                      <line x1="250" y1="0" x2="600" y2="250" stroke={wf.patternColor} strokeWidth="1" />
                    </svg>

                    <div className="relative z-10 flex flex-col gap-5 sm:gap-6">
                      {/* Top-Right: User Prompt Input Bubble */}
                      <div className="self-end w-full max-w-[390px] bg-white text-[#1C1B1A] rounded-2xl p-4 sm:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-black/[0.04]">
                        <p className="text-[12px] sm:text-[12.8px] leading-relaxed text-[#242321] font-sans">
                          {wf.prompt}
                        </p>

                        <div className="mt-3.5 pt-3 border-t border-[#F0EFEA] flex items-center justify-between">
                          <button
                            type="button"
                            className="w-6 h-6 rounded-md hover:bg-[#F0EFEA] flex items-center justify-center text-[#7A7771] transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-[11px] text-[#6E6C66] font-medium px-2 py-0.5 rounded-md hover:bg-[#F0EFEA] cursor-pointer">
                              <span>{wf.model}</span>
                              <ChevronDown className="w-3 h-3 opacity-60" />
                            </div>

                            <div className="w-6 h-6 rounded-lg bg-[#CC785C] hover:bg-[#BA694E] flex items-center justify-center text-white cursor-pointer shadow-sm transition-colors">
                              <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom-Left: Automated Execution Card */}
                      <div className="self-start w-full max-w-[400px]">
                        <div className="bg-white text-[#1C1B1A] rounded-2xl p-4 sm:p-5 shadow-[0_12px_36px_rgba(0,0,0,0.12)] border border-black/[0.04] space-y-2.5 sm:space-y-3">
                          {wf.steps.map((st, sIdx) => (
                            <div
                              key={sIdx}
                              className={`flex items-center justify-between text-[12px] sm:text-[12.5px] text-[#242321] ${
                                sIdx === 3 ? "pt-2 border-t border-[#F0EFEA] text-[11px] text-[#73706A]" : ""
                              }`}
                            >
                              <div className="flex items-center gap-2.5 sm:gap-3">
                                {renderStepIcon(st.type)}
                                <span className="leading-snug">{st.text}</span>
                              </div>
                              {st.hasChevron && (
                                <ChevronDown className="w-3.5 h-3.5 text-[#9E9B93] shrink-0" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="mt-5 sm:mt-6 pt-3.5 border-t border-black/10 flex items-center justify-between text-[11.5px] text-[#554F49]">
                      <div className="flex items-center gap-2">
                        {wf.sources.map((src, sIdx) => (
                          <span key={sIdx} className="px-2 py-0.5 rounded-md bg-white/40 font-medium">
                            {src}
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleReplay}
                        className="flex items-center gap-1.5 text-[#423C36] hover:text-black font-medium transition-colors cursor-pointer"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${isReplaying ? "animate-spin" : ""}`} />
                        <span>Putar Ulang</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* ---------------- CARD 1: 08:00 (Warm Peach, Top Layer) ---------------- */}
              {(() => {
                const wf = workflows[0];
                // In step 0: active at center scale 1.0 (0px)
                // In step >= 1: thrown away to the right!
                const isDismissed = currentStep >= 1;
                const translateY = isDismissed ? -35 : 0;
                const translateX = isDismissed ? "140%" : "0%";
                const rotate = isDismissed ? "18deg" : "0deg";
                const opacity = isDismissed ? 0 : 1;

                return (
                  <div
                    className="absolute inset-0 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-700 ease-out will-change-transform"
                    style={{
                      zIndex: 30,
                      backgroundColor: wf.cardColor,
                      transform: `translateX(${translateX}) translateY(${translateY}px) rotate(${rotate}) scale(1)`,
                      transformOrigin: "center bottom",
                      opacity: opacity,
                      pointerEvents: isDismissed ? "none" : "auto",
                    }}
                  >
                    {/* Criss-Cross Abstract Background Lines */}
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
                      viewBox="0 0 600 400"
                      fill="none"
                    >
                      <line x1="0" y1="80" x2="600" y2="320" stroke={wf.patternColor} strokeWidth="1.2" />
                      <line x1="120" y1="0" x2="480" y2="400" stroke={wf.patternColor} strokeWidth="1.2" />
                      <line x1="0" y1="280" x2="500" y2="20" stroke={wf.patternColor} strokeWidth="1" />
                      <line x1="250" y1="0" x2="600" y2="250" stroke={wf.patternColor} strokeWidth="1" />
                    </svg>

                    <div className="relative z-10 flex flex-col gap-5 sm:gap-6">
                      {/* Top-Right: User Prompt Input Bubble */}
                      <div className="self-end w-full max-w-[390px] bg-white text-[#1C1B1A] rounded-2xl p-4 sm:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-black/[0.04]">
                        <p className="text-[12px] sm:text-[12.8px] leading-relaxed text-[#242321] font-sans">
                          {wf.prompt}
                        </p>

                        <div className="mt-3.5 pt-3 border-t border-[#F0EFEA] flex items-center justify-between">
                          <button
                            type="button"
                            className="w-6 h-6 rounded-md hover:bg-[#F0EFEA] flex items-center justify-center text-[#7A7771] transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-[11px] text-[#6E6C66] font-medium px-2 py-0.5 rounded-md hover:bg-[#F0EFEA] cursor-pointer">
                              <span>{wf.model}</span>
                              <ChevronDown className="w-3 h-3 opacity-60" />
                            </div>

                            <div className="w-6 h-6 rounded-lg bg-[#CC785C] hover:bg-[#BA694E] flex items-center justify-center text-white cursor-pointer shadow-sm transition-colors">
                              <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom-Left: Automated Execution Card */}
                      <div className="self-start w-full max-w-[400px]">
                        <div className="bg-white text-[#1C1B1A] rounded-2xl p-4 sm:p-5 shadow-[0_12px_36px_rgba(0,0,0,0.12)] border border-black/[0.04] space-y-2.5 sm:space-y-3">
                          {wf.steps.map((st, sIdx) => (
                            <div
                              key={sIdx}
                              className={`flex items-center justify-between text-[12px] sm:text-[12.5px] text-[#242321] ${
                                sIdx === 3 ? "pt-2 border-t border-[#F0EFEA] text-[11px] text-[#73706A]" : ""
                              }`}
                            >
                              <div className="flex items-center gap-2.5 sm:gap-3">
                                {renderStepIcon(st.type)}
                                <span className="leading-snug">{st.text}</span>
                              </div>
                              {st.hasChevron && (
                                <ChevronDown className="w-3.5 h-3.5 text-[#9E9B93] shrink-0" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="mt-5 sm:mt-6 pt-3.5 border-t border-black/10 flex items-center justify-between text-[11.5px] text-[#554F49]">
                      <div className="flex items-center gap-2">
                        {wf.sources.map((src, sIdx) => (
                          <span key={sIdx} className="px-2 py-0.5 rounded-md bg-white/40 font-medium">
                            {src}
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleReplay}
                        className="flex items-center gap-1.5 text-[#423C36] hover:text-black font-medium transition-colors cursor-pointer"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${isReplaying ? "animate-spin" : ""}`} />
                        <span>Putar Ulang</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

            </div>
          </div>

        </div>

        {/* ================= APP INTEGRATION DOCK ================= */}
        <div className="mt-12 sm:mt-16 pt-6 border-t border-white/[0.04] flex items-center justify-center">
          <div className="flex items-center gap-4 sm:gap-6 px-6 py-2.5 rounded-2xl bg-[#1C1B19] border border-white/[0.08] shadow-lg">
            
            {/* 1. Email */}
            <div
              className="flex flex-col items-center gap-1 cursor-pointer opacity-40 hover:opacity-100 transition-opacity"
              title="Email Sync"
            >
              <div className="w-7 h-7 rounded-lg bg-[#282725] flex items-center justify-center p-1.5">
                <svg viewBox="0 0 24 24" className="w-full h-full">
                  <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z" fill="#EA4335" />
                  <path d="M12 13L2 6.5V6L12 12.5L22 6V6.5L12 13Z" fill="white" />
                </svg>
              </div>
              <span className="w-1 h-1 rounded-full bg-transparent" />
            </div>

            {/* 2. Google Calendar */}
            {(() => {
              const isActive = currentWf.activeDockIcons.includes("calendar");
              return (
                <div
                  className={`flex flex-col items-center gap-1 cursor-pointer transition-opacity ${
                    isActive ? "opacity-100" : "opacity-40 hover:opacity-100"
                  }`}
                  title="Google Calendar"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#282725] flex items-center justify-center p-1.5">
                    <svg viewBox="0 0 24 24" className="w-full h-full">
                      <rect x="2" y="3" width="20" height="18" rx="3" fill="#4285F4" />
                      <path d="M2 8H22V18C22 19.66 20.66 21 19 21H5C3.34 21 2 19.66 2 18V8Z" fill="white" />
                      <text x="12" y="17" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#4285F4">31</text>
                    </svg>
                  </div>
                  <span className={`w-1 h-1 rounded-full ${isActive ? "bg-[#FAF9F5]" : "bg-transparent"}`} />
                </div>
              );
            })()}

            {/* 3. Google Drive */}
            {(() => {
              const isActive = currentWf.activeDockIcons.includes("drive");
              return (
                <div
                  className={`flex flex-col items-center gap-1 cursor-pointer transition-opacity ${
                    isActive ? "opacity-100" : "opacity-40 hover:opacity-100"
                  }`}
                  title="Google Drive"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#282725] flex items-center justify-center p-1.5">
                    <svg viewBox="0 0 24 24" className="w-full h-full">
                      <path d="M8.5 3L15.5 3L22 14.5L15 14.5L8.5 3Z" fill="#FFBA00" />
                      <path d="M2 14.5L8.5 3L12 9L5.5 20.5L2 14.5Z" fill="#00AC47" />
                      <path d="M5.5 20.5L12 9L22 14.5L15.5 20.5L5.5 20.5Z" fill="#0066DA" />
                    </svg>
                  </div>
                  <span className={`w-1 h-1 rounded-full ${isActive ? "bg-[#FAF9F5]" : "bg-transparent"}`} />
                </div>
              );
            })()}

            {/* 4. Notion / Docs */}
            {(() => {
              const isActive = currentWf.activeDockIcons.includes("notion");
              return (
                <div
                  className={`flex flex-col items-center gap-1 cursor-pointer transition-opacity ${
                    isActive ? "opacity-100" : "opacity-40 hover:opacity-100"
                  }`}
                  title="Notion Docs"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#282725] flex items-center justify-center p-1.5 text-white font-serif font-bold text-xs">
                    N
                  </div>
                  <span className={`w-1 h-1 rounded-full ${isActive ? "bg-[#FAF9F5]" : "bg-transparent"}`} />
                </div>
              );
            })()}

            {/* 5. GitHub Repositories */}
            {(() => {
              const isActive = currentWf.activeDockIcons.includes("github");
              return (
                <div
                  className={`flex flex-col items-center gap-1 cursor-pointer transition-opacity ${
                    isActive ? "opacity-100" : "opacity-40 hover:opacity-100"
                  }`}
                  title="GitHub Issues"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#282725] flex items-center justify-center p-1.5 text-white font-mono font-bold text-xs">
                    GH
                  </div>
                  <span className={`w-1 h-1 rounded-full ${isActive ? "bg-[#FAF9F5]" : "bg-transparent"}`} />
                </div>
              );
            })()}

            {/* 6. Slack */}
            {(() => {
              const isActive = currentWf.activeDockIcons.includes("slack");
              return (
                <div
                  className={`flex flex-col items-center gap-1 cursor-pointer transition-opacity ${
                    isActive ? "opacity-100" : "opacity-40 hover:opacity-100"
                  }`}
                  title="Slack"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#282725] flex items-center justify-center p-1.5">
                    <svg viewBox="0 0 24 24" className="w-full h-full">
                      <path d="M6 15a2 2 0 1 1-2-2h2v2zm1 0a2 2 0 1 1 2 2v-2H7zm0-1a2 2 0 1 1 2-2H7v2zm-1-5a2 2 0 1 1-2 2h2V9zm6 0a2 2 0 1 1 2-2v2h-2zm-1 0a2 2 0 1 1-2 2V9h2zm0 1a2 2 0 1 1-2 2h2v-2zm5 6a2 2 0 1 1 2-2h-2v2zm-1 0a2 2 0 1 1-2-2v2h2zm0-1a2 2 0 1 1-2 2h2v-2z" fill="#E01E5A" />
                    </svg>
                  </div>
                  <span className={`w-1 h-1 rounded-full ${isActive ? "bg-[#FAF9F5]" : "bg-transparent"}`} />
                </div>
              );
            })()}

            {/* 7. Koda Sunburst Engine */}
            <div
              className="flex flex-col items-center gap-1 cursor-pointer opacity-100 transition-opacity"
              title={`${brandName} Engine`}
            >
              <div className="w-7 h-7 rounded-lg bg-[#282725] flex items-center justify-center p-1.5">
                <ClaudeSunburst className="w-4 h-4 text-[#CC785C]" />
              </div>
              <span className="w-1 h-1 rounded-full bg-[#FAF9F5]" />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
