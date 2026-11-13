"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FloatingCard } from "./FloatingCard";

export function ClaudeHeroCanvas({
  brandName = "Koda",
}: {
  brandName?: string;
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animationFrameId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse offset (-25px to +25px)
      targetX = (e.clientX / window.innerWidth - 0.5) * 36;
      targetY = (e.clientY / window.innerHeight - 0.5) * 36;
    };

    // Smooth lerp loop for liquid, luxurious mouse tracking
    const loop = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      setMousePos({ x: currentX, y: currentY });
      animationFrameId = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animationFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="relative w-full min-h-[calc(100vh-100px)] overflow-hidden bg-[#141413] flex items-center justify-center select-none py-16 px-4">
      {/* ================= 1. AMBIENT LIVING LIGHTING & GLOW AURA ================= */}
      {/* Central Breathing Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[400px] rounded-full bg-[radial-gradient(ellipse,rgba(204,120,92,0.075)_0%,transparent_65%)] animate-ambient-pulse pointer-events-none" />

      {/* Subtle Ambient Radial Lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.015)_0%,transparent_75%)] pointer-events-none" />

      {/* Ambient Celestial Specks (Drifting dust particles) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[20%] left-[25%] w-1 h-1 rounded-full bg-[#FAF9F5] animate-ping" style={{ animationDuration: "5s" }} />
        <div className="absolute top-[35%] right-[22%] w-1 h-1 rounded-full bg-[#CC785C] animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute bottom-[28%] left-[30%] w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" style={{ animationDuration: "6s" }} />
        <div className="absolute bottom-[35%] right-[28%] w-1 h-1 rounded-full bg-[#FAF9F5]/30 animate-ping" style={{ animationDuration: "7s" }} />
      </div>

      {/* ================= 2. MULTI-PLANE PARALLAX FLOATING CARDS ================= */}
      <div className="hidden md:block absolute inset-0 pointer-events-auto">
        
        {/* ================= PLANE 1: BACKGROUND LAYER (Slow Parallax 0.25x) ================= */}
        <div
          className="absolute inset-0 transition-transform duration-300 ease-out pointer-events-none"
          style={{
            transform: `translate3d(${mousePos.x * 0.25}px, ${mousePos.y * 0.25}px, 0)`,
          }}
        >
          {/* Far Left Mid Edge (Person at work) */}
          <FloatingCard
            id="far-left-worker"
            label=""
            type="image"
            imageSrc="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
            width={125}
            height={145}
            style={{ top: "58%", left: "-3%" }}
            className="opacity-75 hover:opacity-100 animate-float-4 pointer-events-auto"
            promptText="Tinjau logika bisnis dan audit kepatuhan sistem aplikasi"
          />

          {/* Upper Far-Left Edge Card (Doodle loops) */}
          <FloatingCard
            id="feedback-card"
            label=""
            type="wireframe"
            wireframeVariant="feedback"
            width={130}
            height={135}
            style={{ top: "17%", left: "-2%" }}
            className="opacity-70 hover:opacity-100 animate-float-3 pointer-events-auto"
            promptText="Sintesis umpan balik pengguna menjadi backlog prioritas MVP"
          />

          {/* Far Right Edge Top (Contract review) */}
          <FloatingCard
            id="contract-review"
            label="Kontrak API & SLA"
            type="wireframe"
            wireframeVariant="contract"
            width={130}
            height={140}
            style={{ top: "21%", left: "97%" }}
            className="opacity-70 hover:opacity-100 animate-float-4 pointer-events-auto"
            promptText="Susun spesifikasi REST OpenAPI dan perjanjian tingkat layanan (SLA)"
          />

          {/* Far Right Edge Bottom (Action tracker) */}
          <FloatingCard
            id="action-tracker"
            label="Pelacak Sprint MVP"
            type="wireframe"
            wireframeVariant="qbr"
            width={130}
            height={135}
            style={{ top: "64%", left: "97%" }}
            className="opacity-70 hover:opacity-100 animate-float-5 pointer-events-auto"
            promptText="Kelola milestone teknis dan daftar periksa kesiapan peluncuran"
          />

          {/* Bottom Right Deep Thumbnail */}
          <FloatingCard
            id="market-brief"
            label=""
            type="image"
            imageSrc="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80"
            width={135}
            height={100}
            style={{ top: "87%", left: "71%" }}
            className="opacity-65 hover:opacity-100 animate-float-1 pointer-events-auto"
            promptText="Lakukan benchmark fitur kompetitor dan analisis positioning produk"
          />
        </div>

        {/* ================= PLANE 2: MIDGROUND LAYER (Medium Parallax 0.55x) ================= */}
        <div
          className="absolute inset-0 transition-transform duration-300 ease-out pointer-events-none"
          style={{
            transform: `translate3d(${mousePos.x * 0.55}px, ${mousePos.y * 0.55}px, 0)`,
          }}
        >
          {/* Ringkasan Feedback Label */}
          <div
            className="absolute z-20 pointer-events-none"
            style={{ top: "10%", left: "21%" }}
          >
            <span className="text-[11.5px] font-sans text-[#8A8782] tracking-tight">
              Ringkasan feedback
            </span>
          </div>

          {/* Presentasi Arsitektur (Mid Left) */}
          <FloatingCard
            id="qbr-deck"
            label="Presentasi Arsitektur"
            type="wireframe"
            wireframeVariant="qbr"
            width={150}
            height={145}
            style={{ top: "44%", left: "12%" }}
            className="animate-float-2 pointer-events-auto"
            promptText="Susun kerangka presentasi arsitektur sistem dan roadmap teknis"
          />

          {/* Rencana Anggaran Cloud (Mid Right portrait) */}
          <FloatingCard
            id="budget-reforecast"
            label="Rencana Anggaran Cloud"
            type="image"
            imageSrc="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
            width={150}
            height={148}
            style={{ top: "37%", left: "80%" }}
            className="animate-float-2 pointer-events-auto"
            promptText="Hitung estimasi konsumsi compute, database cluster, dan bandwidth cloud"
          />

          {/* Hasil Survei Pengguna (Bottom Right doodle) */}
          <FloatingCard
            id="survey-readout"
            label="Hasil Survei Pengguna"
            type="wireframe"
            wireframeVariant="survey"
            width={140}
            height={140}
            style={{ top: "65%", left: "78%" }}
            className="animate-float-3 pointer-events-auto"
            promptText="Ekstrak temuan riset pengguna menjadi daftar user stories terstruktur"
          />
        </div>

        {/* ================= PLANE 3: FOREGROUND LAYER (Fast Parallax 0.95x) ================= */}
        <div
          className="absolute inset-0 transition-transform duration-300 ease-out pointer-events-none"
          style={{
            transform: `translate3d(${mousePos.x * 0.95}px, ${mousePos.y * 0.95}px, 0)`,
          }}
        >
          {/* Desain Aset & UI (Top Left) */}
          <FloatingCard
            id="asset-creation"
            label="Desain Aset & UI"
            type="image"
            imageSrc="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
            width={140}
            height={148}
            style={{ top: "15%", left: "14%" }}
            className="animate-float-1 pointer-events-auto"
            promptText="Buat rekomendasi token desain UI dan sistem komponen antarmuka"
          />

          {/* Analisis Metrik & Alur (Bottom Left desk workspace) */}
          <FloatingCard
            id="campaign-readout"
            label="Analisis Metrik & Alur"
            type="image"
            imageSrc="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80"
            width={160}
            height={145}
            style={{ top: "69%", left: "15%" }}
            className="animate-float-5 pointer-events-auto"
            promptText="Petakan conversion funnel dan optimasi throughput API"
          />

          {/* Skema Basis Data (Top Right portrait with vector overlay) */}
          <FloatingCard
            id="merit-analysis"
            label="Skema Basis Data"
            type="image"
            imageSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
            width={150}
            height={155}
            hasVectorOverlay={true}
            style={{ top: "12%", left: "76%" }}
            className="animate-float-1 pointer-events-auto"
            promptText="Rancang skema tabel PostgreSQL dengan indexing dan foreign keys"
          />
        </div>

      </div>

      {/* ================= 3. HERO CENTER CONTENT ================= */}
      <div className="relative z-20 max-w-2xl mx-auto text-center px-4">
        {/* Main Serif Headline with subtle elevation */}
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-normal tracking-tight text-[#FAF9F5] leading-[1.08] drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] transition-all duration-300">
          Bangun lebih banyak bersama {brandName}
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-[15px] sm:text-base md:text-[17px] text-[#A8A6A0] leading-relaxed font-sans max-w-xl mx-auto font-normal">
          Berikan {brandName} sebuah proyek, bukan sekadar pertanyaan. Rancang PRD 13 bab,
          alur sistem, diagram alur kerja, hingga arsitektur teknis yang kokoh.
        </p>

        {/* CTA Action Buttons */}
        <div className="mt-8 flex items-center justify-center gap-3">
          {/* Primary CTA with subtle hover glow */}
          <Link
            href="/playground/new_chat"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#FAF9F5] hover:bg-white text-[#141413] font-medium text-sm transition-all duration-200 shadow-[0_4px_16px_rgba(255,255,255,0.12)] hover:shadow-[0_6px_24px_rgba(255,255,255,0.25)] hover:scale-[1.03] active:scale-[0.98]"
          >
            Coba {brandName}
          </Link>

          {/* Secondary CTA */}
          <Link
            href="/playground/new_chat"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#262524] hover:bg-[#2F2E2C] text-[#FAF9F5] border border-white/10 text-sm font-normal transition-all duration-200 hover:border-white/25 hover:scale-[1.02] active:scale-[0.98]"
          >
            Buka Studio Arsitektur
          </Link>
        </div>
      </div>

      {/* Mobile Horizontal Carousel */}
      <div className="md:hidden mt-16 w-full max-w-sm mx-auto overflow-x-auto pb-4 flex gap-4 scrollbar-none snap-x">
        <div className="snap-center shrink-0 w-36">
          <FloatingCard
            id="m-asset"
            label="Desain Aset & UI"
            type="image"
            imageSrc="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
            width={140}
            height={140}
            style={{ position: "relative" }}
          />
        </div>
        <div className="snap-center shrink-0 w-36">
          <FloatingCard
            id="m-qbr"
            label="Presentasi Arsitektur"
            type="wireframe"
            wireframeVariant="qbr"
            width={140}
            height={140}
            style={{ position: "relative" }}
          />
        </div>
        <div className="snap-center shrink-0 w-36">
          <FloatingCard
            id="m-merit"
            label="Skema Basis Data"
            type="image"
            imageSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
            width={140}
            height={140}
            style={{ position: "relative" }}
          />
        </div>
        <div className="snap-center shrink-0 w-36">
          <FloatingCard
            id="m-budget"
            label="Anggaran Cloud"
            type="image"
            imageSrc="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
            width={140}
            height={140}
            style={{ position: "relative" }}
          />
        </div>
      </div>
    </section>
  );
}
