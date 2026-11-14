"use client";

import React, { useMemo } from "react";
import { Check, Sparkles, ArrowRight, CornerDownRight } from "lucide-react";

interface PrdDecisionChipsProps {
  lastMessageContent: string;
  onSelectOption: (optionText: string) => void;
  disabled?: boolean;
}

interface ParsedOption {
  label: string;
  actionText: string;
  isRecommended?: boolean;
}

export function PrdDecisionChips({
  lastMessageContent,
  onSelectOption,
  disabled = false,
}: PrdDecisionChipsProps) {
  // Dynamically parse choices from message content or generate contextual next steps
  const options = useMemo<ParsedOption[]>(() => {
    if (!lastMessageContent) return [];

    const list: ParsedOption[] = [];
    const text = lastMessageContent;

    // Pattern 1: Opsi A vs Opsi B
    if (/opsi\s+a/i.test(text) && /opsi\s+b/i.test(text)) {
      list.push({
        label: "✓ Setujui Opsi A (Monolitik Modular)",
        actionText: "Saya memilih Opsi A (Monolitik Modular). Tolong lanjutkan perancangan spesifikasi sistem dengan pendekatan ini.",
        isRecommended: true,
      });
      list.push({
        label: "Pilih Opsi B (Event-Driven Microservices)",
        actionText: "Saya lebih memilih Opsi B (Event-Driven Microservices). Silakan detailkan arsitektur queue dan event bus-nya.",
      });
    }

    // Pattern 2: Payment or checkout
    if (/pembayaran|payment|gateway|checkout|transaksi/i.test(text) && !/opsi\s+a/i.test(text)) {
      list.push({
        label: "💳 Integrasikan Payment Gateway Otomatis (Midtrans/Xendit)",
        actionText: "Gunakan Payment Gateway otomatis (Midtrans/Xendit) dengan webhook signature verification dan auto-expire 15 menit.",
        isRecommended: true,
      });
      list.push({
        label: "🏦 Gunakan Transfer Bank Manual / WhatsApp",
        actionText: "Gunakan transfer bank manual dengan konfirmasi bukti transfer via WhatsApp ke admin.",
      });
    }

    // Pattern 3: Concurrency & Locking
    if (/race condition|concurrency|double-booking|stok/i.test(text)) {
      list.push({
        label: "🔒 Terapkan Row Lock 'SELECT ... FOR UPDATE'",
        actionText: "Tolong detailkan mitigasi race condition menggunakan row lock 'SELECT ... FOR UPDATE' di level PostgreSQL.",
        isRecommended: true,
      });
    }

    // Fallback contextual options if no specific patterns triggered
    if (list.length === 0) {
      list.push({
        label: "✨ Lengkapi Skema Database 3NF & DDL",
        actionText: "Tolong lengkapi skema database PostgreSQL 3NF lengkap dengan foreign keys dan audit timestamps.",
        isRecommended: true,
      });
      list.push({
        label: "⚡ Rincikan Mitigasi Edge Case & Concurrency",
        actionText: "Jelaskan seluruh skenario edge cases dan bagaimana sistem menangani kegagalan jaringan atau request bersamaan.",
      });
      list.push({
        label: "🎯 Susun Sprint Roadmap & Tiket Kerja",
        actionText: "Susun pembagian tugas Sprint Roadmap 2 mingguan untuk tim developer.",
      });
    }

    return list;
  }, [lastMessageContent]);

  if (options.length === 0) return null;

  return (
    <div className="pt-2 pb-1 space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8D7D77]">
        <CornerDownRight className="w-3.5 h-3.5 text-[#D97757]" />
        <span>Respon Cepat / Pilihan Keputusan:</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {options.map((opt, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelectOption(opt.actionText)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 border shadow-sm ${
              opt.isRecommended
                ? "bg-[#D97757]/15 hover:bg-[#D97757]/25 border-[#D97757]/50 text-[#FAF6F4] hover:border-[#D97757]"
                : "bg-[#18110F] hover:bg-[#221614] border-[#2B1D19] text-[#C4B2AC] hover:text-white"
            } disabled:opacity-50 disabled:pointer-events-none`}
          >
            {opt.isRecommended ? (
              <Sparkles className="w-3 h-3 text-[#D97757] shrink-0" />
            ) : (
              <ArrowRight className="w-3 h-3 text-[#80868b] shrink-0" />
            )}
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
