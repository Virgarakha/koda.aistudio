"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { ClaudeSunburst } from "./ClaudeSunburst";
import { KodaGeometricLogo } from "./KodaGeometricLogo";

export function LandingHeader({
  brandName = "Koda",
  onToggleBrand,
}: {
  brandName?: string;
  onToggleBrand?: () => void;
}) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navItems = [
    {
      name: "Produk",
      links: [
        {
          label: "Koda PRD Builder",
          desc: "Penyusun spesifikasi teknis 13 bab & aturan bisnis",
          href: "/playground/new_chat",
        },
        {
          label: "Flowchart & Sequence Engine",
          desc: "Visualisasi diagram alur sistem interaktif",
          href: "/playground/new_chat",
        },
        {
          label: "Koda Stitch Schema",
          desc: "Skema DDL PostgreSQL & validasi anti-race condition",
          href: "/playground/new_chat",
        },
      ],
    },
    {
      name: "Pengembang",
      links: [
        {
          label: "Referensi API",
          desc: "Integrasikan arsitektur Koda ke alur kerja tim",
          href: "/playground",
        },
        {
          label: "Dokumentasi & Panduan",
          desc: "Tutorial pembuatan PRD dan diagram sistem",
          href: "/playground",
        },
        {
          label: "Audit Log & Telemetri",
          desc: "Pelacakan keputusan arsitektur sistem secara transparan",
          href: "/playground",
        },
      ],
    },
    {
      name: "Enterprise",
      links: [
        {
          label: "Koda Enterprise Grid",
          desc: "Skalabilitas arsitektur untuk organisasi besar",
          href: "/playground",
        },
        {
          label: "Keamanan & Privasi Data",
          desc: "Enkripsi end-to-end dan kepatuhan standar industri",
          href: "/playground",
        },
      ],
    },
    {
      name: "Sumber Daya",
      links: [
        {
          label: "Riset Rekayasa AI",
          desc: "Pendekatan terbaru pembuatan arsitektur perangkat lunak",
          href: "/playground",
        },
        {
          label: "Studi Kasus",
          desc: "Cara tim engineering memangkas waktu delivery",
          href: "/playground",
        },
        {
          label: "Blog & Update",
          desc: "Fitur dan peningkatan sistem terbaru",
          href: "/playground",
        },
      ],
    },
    {
      name: "Harga",
      links: [
        {
          label: "Paket Pemula",
          desc: "Akses penuh fitur dasar untuk eksplorasi",
          href: "/playground",
        },
        {
          label: "Paket Profesional",
          desc: "Batas inferensi lebih tinggi & export dokumen lengkap",
          href: "/playground",
        },
        {
          label: "Paket Tim & Organisasi",
          desc: "Ruang kerja kolaboratif lintas tim pengembang",
          href: "/playground",
        },
      ],
    },
  ];

  return (
    <header className="relative z-50 w-full bg-[#141413] text-[#FAF9F5] select-none border-b border-[#262524]">
      {/* Main Navigation Bar */}
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="flex items-center gap-2.5 group cursor-pointer"
            title="Koda AI - Software & System Architect"
            onClick={(e) => {
              if (onToggleBrand) {
                e.preventDefault();
                onToggleBrand();
              }
            }}
          >
            <KodaGeometricLogo className="w-[24px] h-[20px]" variant="terracotta" />
            <span className="text-[20px] font-medium tracking-tight text-[#FAF9F5]">
              {brandName}
            </span>
          </Link>
        </div>

        {/* Center / Right Nav Items */}
        <nav className="hidden lg:flex items-center gap-6 text-[13.5px] text-[#C4C2BC]">
          {navItems.map((item) => (
            <div
              key={item.name}
              className="relative py-2"
              onMouseEnter={() => setActiveDropdown(item.name)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                className="flex items-center gap-1 hover:text-[#FAF9F5] transition-colors cursor-pointer py-1"
              >
                <span>{item.name}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60 transition-transform duration-150 group-hover:translate-y-0.5" />
              </button>

              {/* Dropdown Menu */}
              {activeDropdown === item.name && (
                <div className="absolute top-full left-0 w-72 p-2 bg-[#1C1B1A] border border-[#2F2E2C] rounded-2xl shadow-2xl backdrop-blur-md transition-all duration-150 animate-in fade-in slide-in-from-top-1">
                  {item.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="block p-2.5 rounded-xl hover:bg-[#282725] transition-colors group"
                    >
                      <div className="text-[13px] font-medium text-[#FAF9F5] group-hover:text-white flex items-center justify-between">
                        {link.label}
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-[11px] text-[#8E8C85] mt-0.5">
                        {link.desc}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 text-[13.5px]">
          <Link
            href="/login"
            className="text-[#C4C2BC] hover:text-[#FAF9F5] px-2 py-1 transition-colors"
          >
            Masuk
          </Link>

          <Link
            href="/playground/new_chat"
            className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-[#FAF9F5] transition-colors text-[13px] font-normal"
          >
            Hubungi Tim
          </Link>

          <Link
            href="/playground/new_chat"
            className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#FAF9F5] hover:bg-white text-[#141413] font-medium text-[13px] transition-all duration-150 shadow-sm"
          >
            Coba {brandName}
          </Link>
        </div>
      </div>

      {/* Sub-bar */}
      <div className="border-t border-white/[0.05] bg-[#141413]/95">
        <div className="max-w-[1440px] mx-auto px-6 h-9 flex items-center justify-between text-[11.5px] text-[#8E8C85]">
          <div className="flex items-center gap-2">
            <span className="font-normal text-[#FAF9F5]/90">Koda AI System Intelligence</span>
            <span className="hidden sm:inline text-white/20">&bull;</span>
            <span className="hidden sm:inline">Rancang PRD, arsitektur sistem, dan alur aplikasi secara instan</span>
          </div>

          <Link
            href="/playground/new_chat"
            className="flex items-center gap-1.5 cursor-pointer hover:text-[#FAF9F5] transition-colors"
          >
            <span>Buka Studio</span>
            <ChevronDown className="w-3 h-3 opacity-70 -rotate-90" />
          </Link>
        </div>
      </div>
    </header>
  );
}
