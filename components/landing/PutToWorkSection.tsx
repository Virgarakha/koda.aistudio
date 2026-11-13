"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PutToWorkSection({
  brandName = "Koda",
}: {
  brandName?: string;
}) {
  const [activeTab, setActiveTab] = useState<string>("everyone");

  const roles = [
    {
      id: "everyone",
      title: "Semua Tim",
      desc: "Serahkan tugas teknis apa pun.",
      example: "Ubah ide kasar, dokumen riset, atau alur kerja harian menjadi spesifikasi sistem yang matang, teruji, dan siap dieksekusi.",
      badge: "Produktivitas Umum",
    },
    {
      id: "product",
      title: "Manajemen Produk",
      desc: "Spesifikasi PRD 13 bab instan.",
      example: "Susun user stories komprehensif, acceptance criteria, dan matriks prioritas fitur tanpa melewatkan aturan bisnis penting.",
      badge: "PRD & Roadmap",
    },
    {
      id: "architect",
      title: "Arsitek Sistem",
      desc: "Skema DDL & anti-race condition.",
      example: "Rancang isolasi transaksi PostgreSQL, pemetaan state machine, dan diagram sequence interaktif yang bebas celah konkurensi.",
      badge: "Arsitektur & Basis Data",
    },
    {
      id: "tech-lead",
      title: "Tech Lead",
      desc: "Dari ide bisnis ke tiket coding.",
      example: "Pecah dokumen arsitektur menjadi sub-task engineering, kontrak API REST/GraphQL, dan strategi caching data yang presisi.",
      badge: "Rekayasa Sistem",
    },
    {
      id: "design",
      title: "Desain UI/UX",
      desc: "Harmoni palet & antarmuka.",
      example: "Dapatkan inspirasi palet warna modern, token Tailwind CSS, dan alur interaksi pengguna yang sinkron dengan aturan backend.",
      badge: "Desain & Token UI",
    },
    {
      id: "security",
      title: "Keamanan & QA",
      desc: "Audit trail & edge cases.",
      example: "Identifikasi titik kegagalan sistem, validasi otorisasi RBAC, enkripsi data sensitif, dan skenario pengujian komprehensif.",
      badge: "Kepatuhan & Pengujian",
    },
    {
      id: "executive",
      title: "Founder & Eksekutif",
      desc: "Validasi MVP & cetak biru.",
      example: "Wujudkan visi produk digital Anda menjadi dokumen cetak biru sistem berstandar industri yang meyakinkan bagi investor dan tim.",
      badge: "Strategi & Skala",
    },
  ];

  const currentRole = roles.find((r) => r.id === activeTab) || roles[0];

  return (
    <section className="relative w-full bg-[#141413] text-[#FAF9F5] select-none pt-20 pb-28 px-6 overflow-hidden border-t border-white/[0.04]">
      {/* Background Ambient Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.015)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-[1360px] mx-auto relative z-10">
        {/* ================= 1. SECTION HEADLINE & SUBTITLE ================= */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <h2 className="font-serif text-4xl sm:text-5xl md:text-[62px] font-normal tracking-tight text-[#FAF9F5] leading-[1.1]">
            Gunakan {brandName} untuk seluruh tim
          </h2>

          <p className="mt-5 text-[15px] sm:text-base md:text-[17px] text-[#A8A6A0] leading-relaxed font-sans max-w-2xl mx-auto font-normal">
            Serahkan tugas arsitektur kapan saja, arahkan dari mana saja, dan sempurnakan
            spesifikasi sebelum dieksekusi engineer. Lihat bagaimana tim modern berkolaborasi bersama {brandName}.
          </p>
        </div>

        {/* ================= 2. HORIZONTAL ROLE CARDS ROW ================= */}
        <div className="w-full overflow-x-auto scrollbar-none pb-4">
          <div className="flex items-stretch gap-2.5 sm:gap-3 min-w-max lg:min-w-0 lg:grid lg:grid-cols-7">
            {roles.map((role) => {
              const isActive = activeTab === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setActiveTab(role.id)}
                  className={`text-left p-4 sm:p-4.5 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                    isActive
                      ? "bg-[#1E1D1B] border border-white/15 shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
                      : "bg-transparent border border-transparent hover:bg-white/[0.03] hover:border-white/[0.05]"
                  }`}
                  style={{ minWidth: "160px" }}
                >
                  <div>
                    {/* Role Title */}
                    <div
                      className={`text-[13.5px] sm:text-[14px] font-medium transition-colors ${
                        isActive
                          ? "text-[#FAF9F5]"
                          : "text-[#FAF9F5]/90 group-hover:text-white"
                      }`}
                    >
                      {role.title}
                    </div>

                    {/* Role Tagline / Desc */}
                    <div className="text-[11.5px] text-[#8A8782] leading-relaxed mt-1 font-normal group-hover:text-[#A3A09A] transition-colors">
                      {role.desc}
                    </div>
                  </div>

                  {/* Active Indicator dot */}
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#CC785C] mt-3" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= 3. ACTIVE ROLE DETAIL PREVIEW ================= */}
        <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-[#191817] border border-white/[0.08] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-300">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-semibold text-[#CC785C] uppercase tracking-wider px-2 py-0.5 rounded bg-[#CC785C]/10 border border-[#CC785C]/20">
                {currentRole.badge}
              </span>
              <span className="text-xs text-[#8A8782]">• Alur Kerja {currentRole.title}</span>
            </div>
            <p className="text-sm sm:text-base text-[#D4D2CB] leading-relaxed font-sans">
              {currentRole.example}
            </p>
          </div>

          <Link
            href={`/playground/new_chat?prompt=${encodeURIComponent(
              `Bantu saya untuk tugas ${currentRole.title}: ${currentRole.desc}`
            )}`}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FAF9F5] hover:bg-white text-[#141413] text-[13px] font-medium transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Coba untuk {currentRole.title}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
