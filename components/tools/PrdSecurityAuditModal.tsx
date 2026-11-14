"use client";

import React from "react";
import { X, ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { AuditResult, AuditCheckItem } from "@/lib/ai/prd-export-helpers";

interface PrdSecurityAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditResult: AuditResult;
  onFixWithAi: (promptAction: string) => void;
}

export function PrdSecurityAuditModal({
  isOpen,
  onClose,
  auditResult,
  onFixWithAi,
}: PrdSecurityAuditModalProps) {
  if (!isOpen) return null;

  const handleFixAction = (item: AuditCheckItem) => {
    const prompt = `Tolong perbaiki dan mitigasi temuan audit berikut: "${item.title}". Rekomendasi: ${item.recommendation || "Detailkan proteksi sistem secara ketat."}. Perbarui spesifikasi PRD dan skema database yang relevan.`;
    onFixWithAi(prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#332520] bg-[#120E0D] shadow-2xl p-6 sm:p-7 space-y-5 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#241a17] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#FAF6F4] flex items-center gap-2">
                <span>Audit Keamanan & Kesiapan Produksi</span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Grade {auditResult.grade} ({auditResult.overallScore}/100)
                </span>
              </h3>
              <p className="text-xs text-[#A89892]">
                Evaluasi otomatis mitigasi race condition, integritas 3NF, dan keamanan otentikasi.
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

        {/* Score Banner */}
        <div className="p-4 rounded-xl border border-[#2B1D19] bg-[#160E0C] flex items-center justify-between gap-4 shrink-0">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D97757] block">
              Status Kesiapan Arsitektur:
            </span>
            <p className="text-xs text-[#FAF6F4] font-medium mt-0.5">
              {auditResult.summaryText}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-2xl font-black font-mono text-emerald-400">
              {auditResult.overallScore}
            </span>
            <span className="text-xs text-[#8D7D77]"> / 100</span>
          </div>
        </div>

        {/* Audit Check Items */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
          {auditResult.checks.map((item) => {
            const isPass = item.status === "pass";
            const isCritical = item.status === "critical";
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-[#261A17] bg-[#160F0E] space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">
                      {isPass ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCritical ? (
                        <AlertOctagon className="w-4 h-4 text-rose-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{item.title}</span>
                        <span
                          className={`text-[9.5px] px-1.5 py-0.2 rounded font-mono uppercase ${
                            isPass
                              ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                              : isCritical
                              ? "bg-rose-950/60 text-rose-300 border border-rose-500/30"
                              : "bg-amber-950/60 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {item.status}
                        </span>
                      </h5>
                      <p className="text-[11px] text-[#A89892] leading-relaxed mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {!isPass && item.recommendation && (
                    <button
                      type="button"
                      onClick={() => handleFixAction(item)}
                      className="px-2.5 py-1 rounded-lg bg-[#D97757]/15 hover:bg-[#D97757]/25 text-[#E88C6F] border border-[#D97757]/30 text-[10.5px] font-semibold transition cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Perbaiki AI</span>
                    </button>
                  )}
                </div>

                {!isPass && item.recommendation && (
                  <div className="p-2.5 rounded-lg bg-[#1D1412] text-[11px] text-[#D2C3BD] border-l-2 border-[#D97757] ml-6">
                    <strong className="text-white">Rekomendasi Aksi:</strong> {item.recommendation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#241a17] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#8D7D77]">
            Audit dijalankan berdasarkan standar Concurrency & Security Engineering Koda.
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
