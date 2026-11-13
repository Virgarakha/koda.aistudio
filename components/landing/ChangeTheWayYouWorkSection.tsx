"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ChangeTheWayYouWorkSection({
  brandName = "Koda",
}: {
  brandName?: string;
}) {
  const columns = [
    {
      number: "01",
      title: "Tak perlu istilah teknis yang kaku",
      desc: `Jelaskan apa yang ingin Anda bangun layaknya berbicara dengan rekan kerja. ${brandName} akan merumuskan tahapan teknis, menandai potensi bottleneck logika, dan menyajikan dokumen cetak biru sistem yang siap dieksekusi.`,
    },
    {
      number: "02",
      title: "Kendali penuh atas setiap keputusan arsitektur",
      desc: `${brandName} menyajikan dokumen PRD, diagram alur sistem, dan skema database secara transparan dengan alasan arsitektural yang jelas. Anda memegang kendali penuh untuk menyetujui setiap spesifikasi sebelum coding dimulai.`,
    },
    {
      number: "03",
      title: "Tidak perlu mengulang konteks dari awal",
      desc: `${brandName} mengingat riwayat percakapan, aturan bisnis, dan preferensi teknologi proyek Anda, memastikan konsistensi logika dari draf pertama hingga aplikasi siap berskala enterprise.`,
    },
  ];

  return (
    <section className="relative w-full bg-[#141413] text-[#FAF9F5] select-none pt-20 pb-28 px-6 overflow-hidden border-t border-white/[0.04]">
      {/* Background Ambient Radial Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.015)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-[1240px] mx-auto relative z-10">
        
        {/* ================= 1. SECTION HEADLINE ================= */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <h2 className="font-serif text-4xl sm:text-5xl md:text-[54px] font-normal tracking-tight text-[#FAF9F5] leading-[1.15]">
            Ubah cara tim Anda membangun perangkat lunak
          </h2>
        </div>

        {/* ================= 2. THREE-COLUMN FEATURES GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14 lg:gap-16 pt-8 border-t border-[#262524]">
          {columns.map((col) => (
            <div key={col.number} className="flex flex-col group">
              {/* Number Indicator */}
              <div className="text-[12px] font-sans font-normal text-[#8A8782] tracking-wider mb-3.5">
                {col.number}
              </div>

              {/* Serif Headline */}
              <h3 className="font-serif text-2xl sm:text-[25px] font-normal text-[#FAF9F5] leading-snug tracking-tight mb-3 group-hover:text-white transition-colors">
                {col.title}
              </h3>

              {/* Description Body */}
              <p className="text-[14px] sm:text-[14.5px] text-[#A3A09A] leading-relaxed font-sans font-normal">
                {col.desc}
              </p>
            </div>
          ))}
        </div>

        {/* ================= 3. SEE WHAT KODA CAN DO SUB-SECTION ================= */}
        <div className="mt-28 md:mt-36 text-center">
          <h3 className="font-serif text-3xl sm:text-4xl md:text-[44px] font-normal text-[#FAF9F5] tracking-tight mb-6">
            Jelajahi kapabilitas {brandName}
          </h3>

          <div className="inline-flex items-center justify-center">
            <Link
              href="/playground"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#242321] hover:bg-[#2C2B29] border border-white/10 hover:border-white/20 text-[#FAF9F5] text-[13.5px] font-normal transition-all duration-150 shadow-sm hover:scale-[1.02] active:scale-[0.98] group"
            >
              <span>Lihat semua kapabilitas {brandName}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C4C2BC] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
