"use client";

import React from "react";
import { X, CheckCircle2, AlertCircle, HelpCircle, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { CompletenessResult, ChapterStatus } from "@/lib/ai/prd-export-helpers";

interface PrdCompletenessModalProps {
  isOpen: boolean;
  onClose: () => void;
  completeness: CompletenessResult;
  onCompleteChapter: (promptAction: string) => void;
}

export function PrdCompletenessModal({
  isOpen,
  onClose,
  completeness,
  onCompleteChapter,
}: PrdCompletenessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl border border-[#332520] bg-[#120E0D] shadow-2xl p-6 sm:p-7 space-y-5 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Subtle Background Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#408175]/15 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#241a17] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#408175]/20 border border-[#408175]/40 flex items-center justify-center text-[#408175]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#FAF6F4] flex items-center gap-2">
                <span>13 Bab Standar PRD Industri</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#2E4540]/30 text-[#408175] border border-[#408175]/30">
                  {completeness.scorePercent}% Lengkap
                </span>
              </h3>
              <p className="text-xs text-[#A89892]">
                Audit kelengkapan dokumen spesifikasi sistem sebelum diserahkan ke tim developer / coding agent.
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

        {/* Progress Metric Bar */}
        <div className="p-4 rounded-xl border border-[#2B1D19] bg-[#160E0C] space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#FAF6F4]">Tingkat Kesiapan Spesifikasi:</span>
            <span className="font-mono font-bold text-[#408175]">
              {completeness.completedCount} Lengkap · {completeness.partialCount} Perlu Detail · {completeness.missingCount} Belum Ada
            </span>
          </div>

          <div className="h-2 w-full bg-[#241A17] rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${(completeness.completedCount / 13) * 100}%` }}
              title="Lengkap"
            />
            <div
              className="h-full bg-amber-500 transition-all duration-500"
              style={{ width: `${(completeness.partialCount / 13) * 100}%` }}
              title="Perlu Detail"
            />
          </div>
        </div>

        {/* Chapter List (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
          {completeness.chapters.map((ch) => {
            const isComplete = ch.status === "complete";
            const isPartial = ch.status === "partial";
            return (
              <div
                key={ch.number}
                className="p-3.5 rounded-xl border border-[#241916] bg-[#160F0D] hover:bg-[#1D1310] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isPartial ? (
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <HelpCircle className="w-4 h-4 text-[#80868b]" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#FAF6F4]">
                        Bab {ch.number}: {ch.title}
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-[#241916] text-[#A89892]">
                        {ch.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A89892] leading-relaxed">
                      {ch.summary}
                    </p>
                  </div>
                </div>

                {!isComplete && (
                  <button
                    type="button"
                    onClick={() => {
                      onCompleteChapter(ch.promptAction);
                      onClose();
                    }}
                    className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-[#408175]/15 hover:bg-[#408175]/25 border border-[#408175]/40 text-[#5CB8A7] text-[11px] font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Lengkapi dengan AI</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#241a17] flex items-center justify-between shrink-0">
          <span className="text-xs text-[#8D7D77]">
            Format 13 Bab ini merupakan standar baku spesifikasi rekayasa perangkat lunak Koda.
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
