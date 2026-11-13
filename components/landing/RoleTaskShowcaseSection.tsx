"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface RoleItem {
  id: string;
  name: string;
  defaultTask: string;
}

interface TaskItem {
  id: string;
  name: string;
  roleId: string;
  documentType: "presentation" | "spreadsheet" | "document";
  docTitle: string;
  slideHeadline: string;
  slideSubheadline: string;
  slideBody: string;
  accentColor: string;
}

export function RoleTaskShowcaseSection({
  brandName = "Koda",
}: {
  brandName?: string;
}) {
  const roles: RoleItem[] = [
    { id: "product", name: "Manajemen Produk", defaultTask: "prd-spec" },
    { id: "architecture", name: "Arsitektur Sistem", defaultTask: "sequence-flow" },
    { id: "engineering", name: "Rekayasa Perangkat Lunak", defaultTask: "postgres-ddl" },
    { id: "design", name: "Desain UI/UX", defaultTask: "token-ui" },
    { id: "security", name: "Keamanan & QA", defaultTask: "anti-race" },
    { id: "leadership", name: "Pimpinan Teknik", defaultTask: "sprint-review" },
  ];

  const tasks: TaskItem[] = [
    {
      id: "prd-spec",
      name: "Spesifikasi PRD 13 Bab",
      roleId: "product",
      documentType: "document",
      docTitle: "Spesifikasi PRD Teknis — Platform Pemesanan Multi-Tenant.docx",
      slideHeadline: "Spesifikasi PRD Teknis",
      slideSubheadline: "Standar Industri 13 Bab",
      slideBody:
        "Menyusun aturan bisnis terperinci, hierarki user story, acceptance criteria teruji, dan matriks pencegahan edge cases tanpa ambivalensi logika.",
      accentColor: "#5B92D1",
    },
    {
      id: "sequence-flow",
      name: "Diagram Alur Sequence",
      roleId: "architecture",
      documentType: "presentation",
      docTitle: "Diagram Sequence Transaksi Pemesanan.pptx - Koda Studio",
      slideHeadline: "Diagram Alur Transaksi",
      slideSubheadline: "Pemetaan Sequence 12 Node",
      slideBody:
        "Memetakan alur otorisasi token, pengecekan inventaris kamar real-time, penguncian baris database, dan callback webhook payment gateway.",
      accentColor: "#4B8272",
    },
    {
      id: "postgres-ddl",
      name: "Skema DDL PostgreSQL",
      roleId: "engineering",
      documentType: "spreadsheet",
      docTitle: "Skema Database & DDL Indexing.sql - PostgreSQL",
      slideHeadline: "Skema DDL Database",
      slideSubheadline: "PostgreSQL & Indexing",
      slideBody:
        "Definisi tabel multi-tenant terisolasi, constraint unik majemuk, trigger riwayat status, dan strategi partisi tabel log berkinerja tinggi.",
      accentColor: "#3F7C6B",
    },
    {
      id: "token-ui",
      name: "Desain Token & Palet UI",
      roleId: "design",
      documentType: "presentation",
      docTitle: "Token Desain & Komponen Antarmuka.pptx - Koda Design",
      slideHeadline: "Token Desain UI/UX",
      slideSubheadline: "Palet Terracotta & Sand",
      slideBody:
        "Harmonisasi warna modern (#CC785C, #141413, #FAF9F5), kurva radius sudut, tipografi serif Newsreader, dan token Tailwind CSS terstandarisasi.",
      accentColor: "#9E5A44",
    },
    {
      id: "anti-race",
      name: "Pencegahan Race Condition",
      roleId: "security",
      documentType: "document",
      docTitle: "Audit Keamanan Konkurensi & Mutex.docx - Security Memo",
      slideHeadline: "Validasi Anti-Race Condition",
      slideSubheadline: "Isolasi Transaksi & Mutex",
      slideBody:
        "Mencegah pemesanan ganda (double-booking) dengan klausa FOR UPDATE NOWAIT, kunci terdistribusi Redis, dan penanganan timeout otomatis.",
      accentColor: "#7B6256",
    },
    {
      id: "sprint-review",
      name: "Evaluasi Arsitektur Sprint",
      roleId: "leadership",
      documentType: "presentation",
      docTitle: "Presentasi Evaluasi Sprint Arsitektur.pptx - PowerPoint",
      slideHeadline: "Evaluasi Arsitektur Sprint",
      slideSubheadline: "Skalabilitas & Milestone MVP",
      slideBody:
        "Ringkasan kesiapan teknis: 0 celah race condition, audit kepatuhan data lolos 100%, dan estimasi konsumsi cloud hemat 32% dibanding proyeksi awal.",
      accentColor: "#557B83",
    },
    {
      id: "api-contract",
      name: "Kontrak API REST & OpenAPI",
      roleId: "engineering",
      documentType: "document",
      docTitle: "Spesifikasi Kontrak REST API v2.yaml - Swagger",
      slideHeadline: "Kontrak API REST",
      slideSubheadline: "Spesifikasi OpenAPI 3.1",
      slideBody:
        "Definisi skema payload request/response JSON Schema, kode status HTTP semantik, batas laju rate-limit, dan validasi token JWT.",
      accentColor: "#4A6FA5",
    },
    {
      id: "audit-log",
      name: "Audit Log & Jejak Riwayat",
      roleId: "security",
      documentType: "spreadsheet",
      docTitle: "Arsitektur Audit Trail & Event Sourcing.xlsx",
      slideHeadline: "Audit Trail Enterprise",
      slideSubheadline: "Pencatatan Jejak Transaksi",
      slideBody:
        "Pencatatan tamper-proof setiap mutasi status akun, alamat IP penyerang, timestamp epoch mikrodetik, dan mekanisme kepatuhan SOC-2.",
      accentColor: "#6B588A",
    },
    {
      id: "feature-matrix",
      name: "Matriks Prioritas Fitur",
      roleId: "product",
      documentType: "presentation",
      docTitle: "Matriks Prioritas RICE & Ruang Lingkup MVP.pptx",
      slideHeadline: "Matriks Prioritas Fitur",
      slideSubheadline: "Metodologi RICE & MVP",
      slideBody:
        "Pemetaan skor dampak bisnis versus kompleksitas teknis backend guna menentukan fitur esensial rilis fase 1 tanpa over-engineering.",
      accentColor: "#617A88",
    },
    {
      id: "state-machine",
      name: "Aturan Bisnis & State Machine",
      roleId: "architecture",
      documentType: "document",
      docTitle: "Dokumentasi State Machine Status Pesanan.docx",
      slideHeadline: "Pemodelan State Machine",
      slideSubheadline: "Transisi Status Deterministik",
      slideBody:
        "Memastikan tidak ada loncatan status tidak valid dari DRAFT langsung ke SELESAI tanpa melewati verifikasi pembayaran dan settlement.",
      accentColor: "#396B5B",
    },
    {
      id: "edge-cases",
      name: "Skenario Edge Cases",
      roleId: "security",
      documentType: "document",
      docTitle: "Daftar Uji Skenario Kegagalan Sistem.docx",
      slideHeadline: "Pengujian Edge Cases",
      slideSubheadline: "Resiliensi Gangguan Jaringan",
      slideBody:
        "Simulasi putus koneksi saat gateway checkout, callback webhook tertunda 24 jam, dan penanganan auto-refund saldo pengguna.",
      accentColor: "#6B5850",
    },
    {
      id: "cloud-budget",
      name: "Estimasi Biaya Cloud",
      roleId: "leadership",
      documentType: "spreadsheet",
      docTitle: "Model Biaya Infrastruktur AWS & GCP.xlsx",
      slideHeadline: "Optimasi Anggaran Cloud",
      slideSubheadline: "Proyeksi Beban 100k Pengguna",
      slideBody:
        "Kalkulasi kebutuhan serverless compute, ukuran memori cache Redis, throughput bandwidth egress, dan cadangan anggaran bulanan.",
      accentColor: "#3B6955",
    },
    {
      id: "webhook-idempotent",
      name: "Integrasi Webhook Idempotent",
      roleId: "engineering",
      documentType: "document",
      docTitle: "Spesifikasi Idempotency Key Gateway.docx",
      slideHeadline: "Webhook Idempotent",
      slideSubheadline: "Pencegahan Event Ganda",
      slideBody:
        "Penyimpanan Idempotency-Key di header HTTP dengan validasi Redis TTL 24 jam untuk mencegah eksekusi ulang notifikasi pembayaran ganda.",
      accentColor: "#4F6D7A",
    },
    {
      id: "user-insights",
      name: "Riset Umpan Balik Pengguna",
      roleId: "product",
      documentType: "presentation",
      docTitle: "Sintesis Riset Kebutuhan Pengguna Kos.pptx",
      slideHeadline: "Sintesis Riset Pengguna",
      slideSubheadline: "Analisis Kebutuhan Penyewa",
      slideBody:
        "78% calon penyewa menginginkan verifikasi ketersediaan kamar instan tanpa harus menunggu balasan WhatsApp manual dari pengelola properti.",
      accentColor: "#7D5344",
    },
    {
      id: "tailwind-components",
      name: "Struktur Komponen Tailwind",
      roleId: "design",
      documentType: "presentation",
      docTitle: "Arsitektur Komponen UI Tailwind React.pptx",
      slideHeadline: "Komponen Antarmuka",
      slideSubheadline: "Sistem Moduler Terpadu",
      slideBody:
        "Pustaka komponen React berbasis Tailwind: kartu status kamar, date picker ketersediaan, pemilih metode pembayaran, dan modal konfirmasi.",
      accentColor: "#4E7082",
    },
    {
      id: "rbac-permission",
      name: "Penyelarasan Hak Akses RBAC",
      roleId: "architecture",
      documentType: "document",
      docTitle: "Matriks Hak Akses RBAC Multi-Tenant.docx",
      slideHeadline: "Otorisasi RBAC",
      slideSubheadline: "Isolasi Tenant & Peran",
      slideBody:
        "Pemisahan tegas hak akses antara Super Admin Platform, Pemilik Properti, Pengelola Lapangan, dan Penyewa Kamar secara granular.",
      accentColor: "#5E4D74",
    },
    {
      id: "mvp-blueprint",
      name: "Cetak Biru MVP Siap Rilis",
      roleId: "leadership",
      documentType: "presentation",
      docTitle: "Cetak Biru Peluncuran MVP Kuartal 4.pptx",
      slideHeadline: "Cetak Biru Rilis MVP",
      slideSubheadline: "Strategi Go-to-Market",
      slideBody:
        "Paket arsitektur menyeluruh siap diserahkan kepada tim pengembang, memangkas masa persiapan teknis dari 6 minggu menjadi hanya 2 hari kerja.",
      accentColor: "#614F44",
    },
  ];

  const [activeRoleId, setActiveRoleId] = useState<string>("product");
  const [activeTaskId, setActiveTaskId] = useState<string>("prd-spec");

  const activeRole = roles.find((r) => r.id === activeRoleId) || roles[0];
  const activeTask = tasks.find((t) => t.id === activeTaskId) || tasks[0];

  const handleSelectRole = (r: RoleItem) => {
    setActiveRoleId(r.id);
    const matchingTask = tasks.find((t) => t.roleId === r.id);
    if (matchingTask) {
      setActiveTaskId(matchingTask.id);
    }
  };

  const handleSelectTask = (t: TaskItem) => {
    setActiveTaskId(t.id);
    setActiveRoleId(t.roleId);
  };

  return (
    <section className="relative w-full bg-[#141413] text-[#FAF9F5] select-none py-20 md:py-28 px-6 overflow-hidden border-t border-white/[0.04]">
      {/* Background Subtle Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.012)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-[1360px] mx-auto relative z-10">
        
        {/* ================= 1. DYNAMIC EDITORIAL HEADLINE ================= */}
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-[46px] font-normal tracking-tight text-[#FAF9F5] leading-[1.25]">
            Saya bekerja di bidang{" "}
            <span
              className="underline underline-offset-8 decoration-white/40 hover:decoration-white cursor-pointer transition-colors"
              title="Klik peran untuk mengganti"
            >
              {activeRole.name}
            </span>{" "}
            dan saya perlu membuat{" "}
            <span
              className="underline underline-offset-8 decoration-white/40 hover:decoration-white cursor-pointer transition-colors"
              title="Klik tugas untuk mengganti"
            >
              {activeTask.name}
            </span>
            .
          </h2>
        </div>

        {/* ================= 2. THREE-COLUMN SHOWCASE LAYOUT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* ================= COLUMN 1: ROLE SELECTOR LIST ================= */}
          <div className="lg:col-span-2">
            <h3 className="font-serif text-xl md:text-2xl font-normal text-[#FAF9F5] mb-6">
              Peran
            </h3>

            <div className="flex flex-wrap lg:flex-col gap-2 lg:gap-3.5">
              {roles.map((r) => {
                const isSelected = r.id === activeRoleId;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelectRole(r)}
                    className={`text-left text-[14px] sm:text-[14.5px] transition-colors cursor-pointer flex items-center gap-2 py-1 ${
                      isSelected
                        ? "text-[#FAF9F5] font-medium"
                        : "text-[#75726C] hover:text-[#C4C2BC] font-normal"
                    }`}
                  >
                    <span className={`w-3 h-[1.5px] transition-all ${isSelected ? "bg-[#FAF9F5] w-3.5" : "bg-transparent"}`} />
                    <span className="truncate">{r.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= COLUMN 2: CENTER STACKED CANVAS & DOCUMENT DECK ================= */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full max-w-[620px]">
              
              {/* Stacked Tabs Behind */}
              <div className="w-[88%] mx-auto h-2.5 bg-[#408175] rounded-t-2xl opacity-90 shadow-sm" />
              <div className="w-[94%] mx-auto h-2.5 bg-[#BEC4CB] rounded-t-2xl -mt-1 opacity-90 shadow-sm" />

              {/* Main Sage/Mint Canvas Card */}
              <div
                className="relative w-full rounded-3xl p-5 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500"
                style={{ backgroundColor: "#AFC1B7" }}
              >
                {/* Abstract Wavy Strokes */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
                  viewBox="0 0 600 400"
                  fill="none"
                >
                  <path
                    d="M50 80 Q 200 40, 350 160 T 550 200 T 580 350"
                    stroke="#FAF9F5"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M20 280 Q 180 120, 300 300 T 580 100"
                    stroke="#FAF9F5"
                    strokeWidth="1.5"
                  />
                </svg>

                {/* Presentation Slide Window Mockup */}
                <div className="relative z-10 w-full rounded-2xl overflow-hidden bg-white shadow-2xl border border-black/10">
                  
                  {/* Window Title Bar */}
                  <div className="bg-[#C84B31] text-white px-3.5 py-2 flex items-center justify-between text-[11px] font-sans font-medium">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-bold bg-white text-[#C84B31] px-1 rounded-sm text-[9px]">K</span>
                      <span className="truncate">{activeTask.docTitle}</span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-80 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-white/40" />
                      <span className="w-2 h-2 rounded-full bg-white/40" />
                    </div>
                  </div>

                  {/* Window Interior: Thumbnail Sidebar + Main Slide Preview */}
                  <div className="flex bg-[#F2F1ED] p-2 gap-2 min-h-[260px] sm:min-h-[290px]">
                    {/* Left Thumbnail Sidebar */}
                    <div className="w-16 sm:w-20 flex flex-col gap-1.5 shrink-0 select-none">
                      {/* Active Slide Thumbnail */}
                      <div className="rounded border-2 border-[#C84B31] bg-white p-1 shadow-sm">
                        <div
                          className="w-full h-8 sm:h-9 rounded-sm flex items-center justify-center text-[7px] text-white font-bold text-center px-0.5 leading-tight"
                          style={{ backgroundColor: activeTask.accentColor }}
                        >
                          DOKUMEN
                        </div>
                      </div>
                      {/* Dummy Slide 2 */}
                      <div className="rounded border border-black/10 bg-white p-1 opacity-70">
                        <div className="w-full h-7 sm:h-8 rounded-sm bg-[#E0DED7] flex flex-col justify-center gap-0.5 px-1">
                          <div className="w-3/4 h-1 bg-[#8A8782] rounded-xs" />
                          <div className="w-1/2 h-1 bg-[#BBB8B0] rounded-xs" />
                        </div>
                      </div>
                      {/* Dummy Slide 3 */}
                      <div className="rounded border border-black/10 bg-white p-1 opacity-70">
                        <div className="w-full h-7 sm:h-8 rounded-sm bg-[#E0DED7] flex flex-col justify-center gap-0.5 px-1">
                          <div className="w-2/3 h-1 bg-[#8A8782] rounded-xs" />
                          <div className="w-1/3 h-1 bg-[#BBB8B0] rounded-xs" />
                        </div>
                      </div>
                      {/* Dummy Slide 4 */}
                      <div className="rounded border border-black/10 bg-white p-1 opacity-60">
                        <div className="w-full h-7 rounded-sm bg-[#E0DED7]" />
                      </div>
                    </div>

                    {/* Main Slide Canvas */}
                    <div
                      className="flex-1 rounded-xl p-5 sm:p-7 flex flex-col justify-between text-white shadow-inner transition-colors duration-500"
                      style={{ backgroundColor: activeTask.accentColor }}
                    >
                      <div>
                        {/* Eyebrow Label */}
                        <div className="text-[9px] sm:text-[10px] tracking-wider uppercase font-mono opacity-80 mb-3 border-b border-white/20 pb-1 inline-block">
                          {activeRole.name.toUpperCase()} &bull; CETAK BIRU KODA
                        </div>

                        {/* Slide Badges */}
                        <div className="flex flex-col gap-2 items-start">
                          <div className="inline-block px-4 py-1.5 rounded-full bg-white text-[#1C1B1A] font-serif font-bold text-base sm:text-lg md:text-xl shadow-sm">
                            {activeTask.slideHeadline}
                          </div>
                          <div className="inline-block px-4 py-1 rounded-full bg-white text-[#1C1B1A] font-serif font-medium text-sm sm:text-base shadow-sm">
                            {activeTask.slideSubheadline}
                          </div>
                        </div>

                        {/* Slide Body Text */}
                        <p className="mt-4 text-[11px] sm:text-[12px] text-white/90 leading-relaxed font-sans max-w-sm">
                          {activeTask.slideBody}
                        </p>
                      </div>

                      {/* Footer Info */}
                      <div className="pt-3 border-t border-white/20 flex items-center justify-between text-[9px] opacity-75 font-mono">
                        <span>KODA AI SYSTEM ARCHITECT</span>
                        <span>1 dari 7</span>
                      </div>
                    </div>
                  </div>

                  {/* Window Bottom Status Bar */}
                  <div className="bg-[#E6E4DE] px-3 py-1 flex items-center justify-center text-[10px] text-[#73706A]">
                    <span>Dokumen 1 dari 7 • Siap Eksekusi</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-5 flex justify-end">
                  <Link
                    href={`/playground/new_chat?prompt=${encodeURIComponent(
                      `Bantu saya mengerjakan ${activeTask.name} untuk peran ${activeRole.name}: ${activeTask.slideBody}`
                    )}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#FAF9F5] text-[#141413] text-[12px] font-medium shadow-md transition-all hover:scale-105 active:scale-95"
                  >
                    <span>Coba kasus penggunaan ini</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#141413]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ================= COLUMN 3: TASK SELECTOR LIST ================= */}
          <div className="lg:col-span-3">
            <h3 className="font-serif text-xl md:text-2xl font-normal text-[#FAF9F5] mb-6">
              Tugas
            </h3>

            <div className="flex flex-wrap lg:flex-col gap-1.5 lg:gap-2 max-h-[460px] overflow-y-auto scrollbar-none pr-1">
              {tasks.map((t) => {
                const isSelected = t.id === activeTaskId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTask(t)}
                    className={`text-left text-[13px] sm:text-[13.5px] transition-colors cursor-pointer py-0.5 truncate block w-full ${
                      isSelected
                        ? "text-[#FAF9F5] font-semibold"
                        : "text-[#75726C] hover:text-[#C4C2BC] font-normal"
                    }`}
                    title={t.name}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
