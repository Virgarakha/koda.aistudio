"use client";

import React, { useState } from "react";
import { X, Terminal, Copy, Check, ExternalLink, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

interface KodaCliConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  appName?: string;
}

export function KodaCliConnectModal({
  isOpen,
  onClose,
  sessionId,
  appName = "Aplikasi Koda",
}: KodaCliConnectModalProps) {
  const [activeTab, setActiveTab] = useState<"link" | "install">("link");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);

  if (!isOpen) return null;

  const linkCommand = `koda link ${sessionId}`;
  const installLocalCommand = `cd /home/okkata/develop/koda/ai-tools/cli && ./install.sh`;
  const installNpmCommand = `npm install -g /home/okkata/develop/koda/ai-tools/cli`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(linkCommand);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyInstall = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-[#332520] bg-[#120E0D] shadow-2xl p-6 sm:p-7 space-y-5 overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-[#D97757]/15 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#241a17]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D97757]/20 border border-[#D97757]/40 flex items-center justify-center text-[#D97757]">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#FAF6F4] flex items-center gap-2">
                <span>Hubungkan ke KODA Coding Agent CLI</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#D97757]/20 text-[#E88C6F] border border-[#D97757]/30">
                  @koda/cli
                </span>
              </h3>
              <p className="text-xs text-[#A89892]">
                Sinkronkan spesifikasi PRD {appName} langsung ke terminal coding lokal.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#80868b] hover:text-white hover:bg-[#221714] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#18110F] p-1 rounded-xl border border-[#2B1D19]">
          <button
            type="button"
            onClick={() => setActiveTab("link")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "link"
                ? "bg-[#D97757] text-white shadow-sm"
                : "text-[#A89892] hover:text-white"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>1. Hubungkan Proyek</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("install")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "install"
                ? "bg-[#D97757] text-white shadow-sm"
                : "text-[#A89892] hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>2. Panduan Install CLI</span>
          </button>
        </div>

        {activeTab === "link" ? (
          <>
            {/* Command Box */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#D2C3BD] block">
                Jalankan perintah ini di terminal proyek Anda:
              </label>
              <div className="p-3.5 rounded-xl border border-[#332520] bg-[#18110F] flex items-center justify-between gap-3 font-mono text-xs text-[#FAF6F4]">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="text-[#D97757] font-bold select-none">&gt;</span>
                  <span className="text-[#FAF6F4] font-semibold">{linkCommand}</span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-[#271A16] hover:bg-[#38241F] text-[#FAF6F4] text-xs font-medium transition flex items-center gap-1.5 shrink-0 border border-[#3D2822] cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#A89892]" />}
                  <span>{copiedLink ? "Tersalin!" : "Salin"}</span>
                </button>
              </div>
            </div>

            {/* 3 Step Workflow */}
            <div className="p-4 rounded-xl border border-[#2B1D19] bg-[#160E0C] space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D97757] block">
                Alur Kerja Ekosistem KODA:
              </span>

              <div className="space-y-2 text-xs text-[#C4B2AC]">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#271A16] text-[#D97757] font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#38241F]">
                    1
                  </span>
                  <div>
                    <strong className="text-white">Link ke Proyek:</strong> Perintah <code className="text-[#E88C6F] bg-[#1F1412] px-1 rounded">koda link</code> mengunduh spesifikasi PRD 13 Bab dan skema DDL ke folder <code className="text-[#E88C6F] bg-[#1F1412] px-1 rounded">.koda/specs.md</code>.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#271A16] text-[#D97757] font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#38241F]">
                    2
                  </span>
                  <div>
                    <strong className="text-white">Pecah Rencana Kerja:</strong> Jalankan <code className="text-[#E88C6F] bg-[#1F1412] px-1 rounded">koda plan</code> untuk memecah arsitektur menjadi daftar implementasi task bertahap.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#271A16] text-[#D97757] font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#38241F]">
                    3
                  </span>
                  <div>
                    <strong className="text-white">Eksekusi Coding Otonom:</strong> Jalankan <code className="text-[#E88C6F] bg-[#1F1412] px-1 rounded">koda</code> di terminal untuk membiarkan AI coding agent membaca file, mengedit kode, dan menjalankan test secara mandiri.
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Cara Install CLI Tab */
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Metode 1: Installer Script Otomatis (Cepat & Praktis)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">Rekomendasi</span>
              </div>
              <div className="p-3 rounded-xl border border-[#332520] bg-[#18110F] flex items-center justify-between gap-3 font-mono text-xs text-[#FAF6F4]">
                <div className="overflow-x-auto whitespace-nowrap">
                  <span className="text-[#D97757] font-bold mr-1">&gt;</span>
                  <span>{installLocalCommand}</span>
                </div>
                <button
                  onClick={() => handleCopyInstall(installLocalCommand)}
                  className="px-2.5 py-1 rounded-lg bg-[#271A16] hover:bg-[#38241F] text-[#FAF6F4] text-xs font-medium transition flex items-center gap-1.5 shrink-0 border border-[#3D2822] cursor-pointer"
                >
                  {copiedInstall ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#A89892]" />}
                  <span>Salin</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-white block">Metode 2: Lewat NPM Global</span>
              <div className="p-3 rounded-xl border border-[#332520] bg-[#18110F] flex items-center justify-between gap-3 font-mono text-xs text-[#FAF6F4]">
                <div className="overflow-x-auto whitespace-nowrap">
                  <span className="text-[#D97757] font-bold mr-1">&gt;</span>
                  <span>{installNpmCommand}</span>
                </div>
                <button
                  onClick={() => handleCopyInstall(installNpmCommand)}
                  className="px-2.5 py-1 rounded-lg bg-[#271A16] hover:bg-[#38241F] text-[#FAF6F4] text-xs font-medium transition flex items-center gap-1.5 shrink-0 border border-[#3D2822] cursor-pointer"
                >
                  {copiedInstall ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#A89892]" />}
                  <span>Salin</span>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-[#2B1D19] bg-[#160E0C] text-xs text-[#C4B2AC] space-y-1.5">
              <strong className="text-white block font-semibold">Langkah setelah instalasi:</strong>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Jalankan <code className="text-[#E88C6F] bg-[#1F1412] px-1 rounded">koda login</code> untuk autentikasi browser via Google.</li>
                <li>Jalankan <code className="text-[#E88C6F] bg-[#1F1412] px-1 rounded">koda doctor</code> untuk memeriksa kesiapan AI provider & koneksi cloud.</li>
                <li>Jalankan <code className="text-[#E88C6F] bg-[#1F1412] px-1 rounded">koda link {sessionId}</code> di folder proyek Anda.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-[#241a17]">
          <span className="text-[11px] text-[#8D7D77]">
            Terkoneksi via Supabase Cloud Database.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#1F1614] hover:bg-[#2B1E1B] text-white text-xs font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
