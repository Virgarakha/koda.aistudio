"use client";

import React, { useState } from "react";
import {
  Smartphone,
  Monitor,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  MessageCircle,
  ShoppingCart,
  QrCode,
} from "lucide-react";

interface InteractivePrototypePreviewProps {
  appName: string;
  architectureSummary?: string;
}

export function InteractivePrototypePreview({
  appName,
  architectureSummary,
}: InteractivePrototypePreviewProps) {
  const [deviceMode, setDeviceMode] = useState<"mobile" | "desktop">("mobile");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState("1 Bulan");
  const [activeScreen, setActiveScreen] = useState<"detail" | "checkout">("detail");

  const cleanTitle = appName || "Aplikasi Koda";
  const isKos = /kos|kontrakan|kamar/i.test(cleanTitle);
  const isPos = /pos|kasir|retail|toko/i.test(cleanTitle);
  const isWarTiket = /tiket|konser|flash|war/i.test(cleanTitle);

  const handleActionClick = () => {
    setBookingConfirmed(true);
    setTimeout(() => {
      setBookingConfirmed(false);
      setActiveScreen("detail");
    }, 3500);
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0808] rounded-xl border border-[#241A17] overflow-hidden select-none">
      {/* Top Prototype Controls */}
      <div className="p-3 border-b border-[#241A17] bg-[#140F0E] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#D97757]/20 border border-[#D97757]/40 flex items-center justify-center text-[#D97757]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#FAF6F4] flex items-center gap-1.5">
              <span>Interactive UI Prototype</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#D97757]/20 text-[#E88C6F]">
                Live Wireframe
              </span>
            </h4>
            <p className="text-[11px] text-[#8D7D77]">
              Simulasi alur pengguna sesuai spesifikasi PRD yang sedang disusun.
            </p>
          </div>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center bg-[#1A1210] border border-[#2E201C] rounded-lg p-0.5">
          <button
            onClick={() => setDeviceMode("mobile")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
              deviceMode === "mobile"
                ? "bg-[#D97757] text-white font-bold"
                : "text-[#80868b] hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile (iPhone)</span>
          </button>
          <button
            onClick={() => setDeviceMode("desktop")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
              deviceMode === "desktop"
                ? "bg-[#D97757] text-white font-bold"
                : "text-[#80868b] hover:text-white"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop Web</span>
          </button>
        </div>
      </div>

      {/* Main Preview Stage */}
      <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center bg-[radial-gradient(#1F1614_1px,transparent_1px)] [background-size:20px_20px] custom-scrollbar">
        {deviceMode === "mobile" ? (
          /* ================= MOBILE PHONE FRAME ================= */
          <div className="w-[320px] sm:w-[350px] rounded-[36px] border-[6px] border-[#2E221F] bg-[#120E0D] shadow-2xl overflow-hidden relative flex flex-col min-h-[580px] animate-in fade-in duration-200">
            {/* Phone Notch & Status Bar */}
            <div className="h-6 bg-[#1A1412] px-5 flex items-center justify-between text-[10px] text-[#A89892] shrink-0 border-b border-[#261A17]">
              <span>09:41</span>
              <div className="w-16 h-3.5 bg-black rounded-b-xl mx-auto" />
              <span>5G 100%</span>
            </div>

            {/* Mobile App Header */}
            <div className="p-3.5 bg-[#18110F] border-b border-[#261A17] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D97757]">
                  {cleanTitle}
                </span>
                <h5 className="text-xs font-bold text-white">
                  {isKos
                    ? "Kost Putra Eksklusif Malang"
                    : isPos
                    ? "Kasir Terminal #01"
                    : isWarTiket
                    ? "War Tiket Konser 2026"
                    : "Layanan Aplikasi"}
                </h5>
              </div>
              <div className="w-6 h-6 rounded-full bg-[#D97757]/20 border border-[#D97757]/40 flex items-center justify-center text-[#D97757] text-[10px] font-bold">
                K
              </div>
            </div>

            {/* Mobile Screen Content */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3.5 text-xs text-[#FAF6F4]">
              {/* Product Card Showcase */}
              <div className="rounded-xl border border-[#2B1D19] bg-[#1A1210] p-3 space-y-2">
                <div className="h-28 rounded-lg bg-gradient-to-tr from-[#2E1812] to-[#1F120E] border border-[#3E251E] flex flex-col justify-end p-2.5 relative overflow-hidden">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#D97757] text-white w-fit mb-1">
                    {isKos ? "Tersedia 1 Kamar Terakhir" : isWarTiket ? "Sisa 50 Tiket" : "Sistem Siap"}
                  </span>
                  <p className="text-xs font-bold text-white leading-tight">
                    {isKos
                      ? "Kamar Tipe Deluxe A1 (AC & Wi-Fi)"
                      : isPos
                      ? "Transaksi Shift Siang"
                      : isWarTiket
                      ? "VIP Section - Row A"
                      : "Fitur Unggulan"}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-[#A89892]">
                    {isKos ? "Tarif Sewa:" : isWarTiket ? "Harga Tiket:" : "Status Layanan:"}
                  </span>
                  <span className="font-bold text-[#E88C6F]">
                    {isKos ? "Rp 850.000 / bln" : isWarTiket ? "Rp 1.500.000" : "Aktif"}
                  </span>
                </div>
              </div>

              {/* Dynamic Action Details */}
              <div className="space-y-2 p-3 rounded-xl border border-[#261A17] bg-[#150F0D]">
                <span className="text-[10px] font-semibold text-[#8D7D77] uppercase tracking-wider block">
                  Pilihan Durasi / Opsi:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {["1 Bulan", "3 Bulan", "1 Tahun"].map((dur) => (
                    <button
                      key={dur}
                      onClick={() => setSelectedDuration(dur)}
                      className={`p-1.5 rounded-lg text-[10px] font-medium border text-center transition cursor-pointer ${
                        selectedDuration === dur
                          ? "bg-[#D97757]/20 border-[#D97757] text-[#FAF6F4]"
                          : "bg-[#18100E] border-[#2A1D1A] text-[#8D7D77] hover:text-white"
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>

                <div className="pt-2 text-[10px] text-[#A89892] flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Mitigasi Race condition: Dilindungi PostgreSQL row-lock.</span>
                </div>
              </div>

              {/* Toast Feedback */}
              {bookingConfirmed && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-[11px] flex items-center gap-2 animate-in zoom-in-95 duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold">Permintaan Berhasil Dikunci!</p>
                    <p className="text-[10px] text-emerald-300/80">
                      Slot telah direservasi tanpa risiko double-booking.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Bottom Action Bar */}
            <div className="p-3.5 bg-[#1A1210] border-t border-[#261A17]">
              <button
                type="button"
                onClick={handleActionClick}
                disabled={bookingConfirmed}
                className="w-full py-2.5 rounded-xl bg-[#D97757] hover:bg-[#e28464] disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#D97757]/20"
              >
                {isKos ? (
                  <>
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Booking Instan via WhatsApp</span>
                  </>
                ) : isWarTiket ? (
                  <>
                    <Clock className="w-3.5 h-3.5" />
                    <span>Amankan Tiket (15 Menit)</span>
                  </>
                ) : (
                  <>
                    <span>Eksekusi Aksi Utama</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ================= DESKTOP WEB FRAME ================= */
          <div className="w-full max-w-2xl rounded-2xl border border-[#2E221F] bg-[#120E0D] shadow-2xl overflow-hidden flex flex-col min-h-[460px] animate-in fade-in duration-200">
            {/* Browser Top Window Bar */}
            <div className="h-8 bg-[#18110F] px-4 flex items-center gap-2 border-b border-[#241A17]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex-1 max-w-xs mx-auto h-5 bg-[#100B0A] rounded-md border border-[#241A17] text-[10px] text-[#8D7D77] flex items-center justify-center font-mono">
                https://{cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, "")}.koda.app
              </div>
            </div>

            {/* Desktop Web Body */}
            <div className="p-6 space-y-5 flex-1">
              <div className="flex items-center justify-between pb-4 border-b border-[#241A17]">
                <div>
                  <h3 className="text-base font-bold text-white">{cleanTitle} — Portal Dashboard</h3>
                  <p className="text-xs text-[#8D7D77]">
                    Tampilan dashboard manajemen sesuai rancangan spesifikasi Bab 4 & Bab 11 PRD.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleActionClick}
                  className="px-4 py-2 rounded-lg bg-[#D97757] hover:bg-[#e28464] text-white text-xs font-bold transition cursor-pointer"
                >
                  Uji Alur Transaksi
                </button>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-[#2B1D19] bg-[#160E0C]">
                  <span className="text-[10px] text-[#8D7D77]">Total Transaksi</span>
                  <p className="text-lg font-mono font-bold text-[#FAF6F4]">1.428</p>
                </div>
                <div className="p-3 rounded-xl border border-[#2B1D19] bg-[#160E0C]">
                  <span className="text-[10px] text-[#8D7D77]">Tingkat Ketersediaan</span>
                  <p className="text-lg font-mono font-bold text-emerald-400">99.8%</p>
                </div>
                <div className="p-3 rounded-xl border border-[#2B1D19] bg-[#160E0C]">
                  <span className="text-[10px] text-[#8D7D77]">P95 Latensi Query</span>
                  <p className="text-lg font-mono font-bold text-sky-400">&lt; 120ms</p>
                </div>
              </div>

              {bookingConfirmed && (
                <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sistem berhasil memvalidasi transaksi secara idempotent dan anti-race condition.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
