"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

export interface ConflictItem {
  type: "success" | "warning" | "info";
  title: string;
  description: string;
}

export interface DiscoveryConflictData {
  title?: string;
  items?: ConflictItem[];
}

export function isDiscoveryConflictJson(text: string, language?: string): boolean {
  if (language === "discovery-conflict-json" || language === "conflict-analysis-json") return true;
  if (!text || text.length < 20) return false;
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(text);
      if (parsed.items && Array.isArray(parsed.items) && parsed.items[0]?.type) {
        return true;
      }
    } catch {}
  }
  return false;
}

const DEFAULT_ITEMS: ConflictItem[] = [
  {
    type: "success",
    title: "Sudah konsisten",
    description: "Satu operator mengelola bisnis kos, harga bulanan, target mahasiswa Malang, pembayaran di luar platform, serta dashboard admin dasar.",
  },
  {
    type: "warning",
    title: "Self-service pemilik perlu diperjelas",
    description: "Model managed berarti pemilik merupakan pengelola internal, bukan otomatis pemilik independen yang mendaftar bebas. Kita perlu menentukan apakah akun pemilik dapat mengelola kosnya sendiri.",
  },
  {
    type: "warning",
    title: "Instant booking tanpa pembayaran online",
    description: "Sistem perlu menentukan kapan kamar dianggap terpesan, berapa lama kamar ditahan, dan apa yang terjadi jika mahasiswa tidak melanjutkan pembayaran langsung kepada pemilik.",
  },
  {
    type: "warning",
    title: "Tanpa verifikasi khusus",
    description: "Tidak melakukan verifikasi dokumen tidak berarti semua listing harus langsung tayang. Hak publikasi dan pengelolaan listing tetap perlu ditentukan.",
  },
];

export function DiscoveryConflictCard({ rawJson }: { rawJson: string }) {
  const data: DiscoveryConflictData = React.useMemo(() => {
    try {
      return JSON.parse(rawJson);
    } catch {
      return {};
    }
  }, [rawJson]);

  const items = data.items && data.items.length > 0 ? data.items : DEFAULT_ITEMS;

  return (
    <div className="my-5 rounded-2xl border border-[#2e3032] bg-[#141517] p-5 sm:p-6 shadow-xl space-y-4">
      {items.map((item, idx) => {
        const isSuccess = item.type === "success";

        return (
          <div key={idx} className="space-y-1.5">
            {idx > 0 && <hr className="border-[#26282a] my-3.5" />}

            <div className="flex items-start gap-2.5">
              {isSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-[#34a853] shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-[#f2994a] shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <h4 className="text-xs sm:text-[13px] font-semibold text-white tracking-tight">
                  {item.title}
                </h4>
                <p className="text-xs text-[#9aa0a6] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
