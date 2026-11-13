"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { ClaudeSunburst } from "./ClaudeSunburst";
import { KodaGeometricLogo } from "./KodaGeometricLogo";

export function LandingFooter({
  brandName = "Koda",
}: {
  brandName?: string;
}) {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();

  const handleMiniSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      router.push(
        `/playground/new_chat?prompt=${encodeURIComponent(prompt.trim())}`
      );
    } else {
      router.push("/playground/new_chat");
    }
  };

  const columns = [
    {
      groups: [
        {
          title: "Produk",
          links: [
            { label: brandName, href: "/playground" },
            { label: `${brandName} Studio`, href: "/playground" },
            { label: `${brandName} PRD Architect`, href: "/playground" },
            { label: `${brandName} Flow Engine`, href: "/playground" },
            { label: `${brandName} Schema DDL`, href: "/playground" },
            { label: `${brandName} Stitch`, href: "/playground" },
            { label: "Unduh Aplikasi", href: "/playground" },
            { label: "Paket Harga", href: "/playground" },
            { label: "Masuk", href: "/login" },
          ],
        },
        {
          title: "Kapabilitas",
          links: [
            { label: "Artefak PRD 13 Bab", href: "/playground" },
            { label: "Diagram Alur Interaktif", href: "/playground" },
            { label: "Skema DDL PostgreSQL", href: "/playground" },
            { label: "Token Desain & Warna", href: "/playground" },
            { label: "Integrasi Repositori", href: "/playground" },
          ],
        },
        {
          title: "Ekstensi",
          links: [
            { label: `${brandName} di VS Code`, href: "/playground" },
            { label: `${brandName} untuk GitHub`, href: "/playground" },
            { label: `${brandName} untuk Slack`, href: "/playground" },
          ],
        },
        {
          title: "Model & Mesin",
          links: [
            { label: `${brandName} Architect 3.5`, href: "/playground" },
            { label: `${brandName} Reasoning Core`, href: "/playground" },
            { label: `${brandName} Fast Engine`, href: "/playground" },
          ],
        },
      ],
    },
    {
      groups: [
        {
          title: "Enterprise",
          links: [
            { label: "Gambaran Solusi", href: "/playground" },
            { label: `${brandName} untuk Enterprise`, href: "/playground" },
          ],
        },
        {
          title: "Departemen",
          links: [
            { label: "Rekayasa Perangkat Lunak", href: "/playground" },
            { label: "Manajemen Produk", href: "/playground" },
            { label: "Desain UI/UX", href: "/playground" },
            { label: "Keamanan & Kepatuhan", href: "/playground" },
          ],
        },
        {
          title: "Industri",
          links: [
            { label: "Fintech & Pembayaran", href: "/playground" },
            { label: "E-Commerce & Logistik", href: "/playground" },
            { label: "Layanan Properti & Kost", href: "/playground" },
            { label: "SaaS B2B", href: "/playground" },
            { label: "Kesehatan & BioTech", href: "/playground" },
            { label: "Pendidikan & Kampus", href: "/playground" },
            { label: "Startup & Venture", href: "/playground" },
          ],
        },
        {
          title: "Program",
          links: [
            { label: "Program Akselerator", href: "/playground" },
            { label: "Akademi Arsitektur", href: "/playground" },
            { label: "Komunitas Pengembang", href: "/playground" },
            { label: "Hibah Riset Startup", href: "/playground" },
          ],
        },
      ],
    },
    {
      groups: [
        {
          title: "Pengembang",
          links: [
            { label: "Dokumentasi API", href: "/playground" },
            { label: "Blog Rekayasa", href: "/playground" },
            { label: "Komunitas Discord", href: "/playground" },
            { label: "Konsol Developer", href: "/playground" },
            { label: "Rekayasa di Koda AI", href: "/playground" },
          ],
        },
        {
          title: "Platform",
          links: [
            { label: "Gambaran Umum", href: "/playground" },
            { label: "Marketplace Plugin", href: "/playground" },
            { label: `${brandName} di AWS Cloud`, href: "/playground" },
            { label: "Google Cloud Platform", href: "/playground" },
            { label: "Microsoft Azure", href: "/playground" },
            { label: "Agen Otonom Mandiri", href: "/playground" },
          ],
        },
        {
          title: "Sumber Daya",
          links: [
            { label: "Artikel Teknis", href: "/playground" },
            { label: "Webinar Arsitektur", href: "/playground" },
            { label: `Jaringan Mitra ${brandName}`, href: "/playground" },
            { label: `Akademi ${brandName}`, href: "/playground" },
            { label: "Studi Kasus Pelanggan", href: "/playground" },
            { label: "Agenda Event & Workshop", href: "/playground" },
            { label: `Didukung oleh ${brandName}`, href: "/playground" },
          ],
        },
      ],
    },
    {
      groups: [
        {
          title: "Perusahaan",
          links: [
            { label: "Tentang Koda AI", href: "/playground" },
            { label: "Karir & Tim", href: "/playground" },
            { label: "Kebijakan AI & Etika", href: "/playground" },
            { label: "Riset Rekayasa", href: "/playground" },
            { label: "Kabar & Siaran Pers", href: "/playground" },
            { label: "Prinsip Skalabilitas Aman", href: "/playground" },
            { label: "Laporan Transparansi", href: "/playground" },
          ],
        },
        {
          title: "Syarat & Kebijakan",
          links: [
            { label: "Pilihan Privasi", href: "/playground" },
            { label: "Kebijakan Privasi", href: "/playground" },
            { label: "Pengungkapan Kerentanan", href: "/playground" },
            { label: "Ketentuan Layanan Komersial", href: "/playground" },
            { label: "Ketentuan Pengguna Akhir", href: "/playground" },
            { label: "Perjanjian Pemrosesan Data (DPA)", href: "/playground" },
            { label: "Kebijakan Penggunaan", href: "/playground" },
          ],
        },
      ],
    },
  ];

  return (
    <footer className="w-full bg-[#141413] text-[#FAF9F5] border-t border-white/[0.05] pt-16 sm:pt-20 pb-28 px-6 sm:px-10 md:px-16 select-none">
      <div className="max-w-[1380px] mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-20">
          
          {/* ================= LEFT BRAND & MINI PROMPT SEARCH BOX ================= */}
          <div className="w-full lg:w-[280px] shrink-0 flex flex-col items-start">
            <Link
              href="/"
              className="flex items-center gap-3 group cursor-pointer"
            >
              <KodaGeometricLogo className="w-7 h-[22px]" variant="terracotta" />
              <span className="font-serif text-[26px] font-normal tracking-tight text-[#FAF9F5]">
                {brandName}
              </span>
            </Link>

            {/* Mini Prompt Input Field */}
            <form
              onSubmit={handleMiniSubmit}
              className="mt-7 w-full max-w-[280px]"
            >
              <div className="flex items-center bg-[#232220] border border-white/[0.07] hover:border-white/[0.15] focus-within:border-white/[0.25] rounded-xl pl-3.5 pr-1.5 py-1.5 shadow-lg transition-all">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Bagaimana Koda bisa membantu hari ini?"
                  className="w-full bg-transparent text-[#FAF9F5] placeholder-[#73706A] text-[12.5px] outline-none pr-2 font-sans"
                />
                <button
                  type="submit"
                  className="shrink-0 w-7 h-7 rounded-lg bg-[#CC785C] hover:bg-[#B8684E] text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-sm"
                  title="Kirim"
                >
                  <ArrowUp className="w-3.5 h-3.5 stroke-[2.4]" />
                </button>
              </div>
            </form>
          </div>

          {/* ================= RIGHT 4-COLUMN LINK DIRECTORY ================= */}
          <div className="w-full lg:flex-1 grid grid-cols-2 sm:grid-cols-4 gap-x-8 sm:gap-x-10 lg:gap-x-12 gap-y-10">
            {columns.map((col, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-9">
                {col.groups.map((group, groupIdx) => (
                  <div key={groupIdx}>
                    <h4 className="text-[12.5px] font-sans text-[#78756E] mb-3.5 font-normal tracking-normal">
                      {group.title}
                    </h4>
                    <ul className="flex flex-col gap-2">
                      {group.links.map((link, lIdx) => (
                        <li key={lIdx}>
                          <Link
                            href={link.href}
                            className="text-[12.5px] font-sans text-[#A8A59D] hover:text-[#FAF9F5] transition-colors leading-relaxed block truncate"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>

        </div>
      </div>
    </footer>
  );
}
