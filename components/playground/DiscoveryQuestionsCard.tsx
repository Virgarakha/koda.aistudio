"use client";

import React, { useState } from "react";
import { ArrowRight, Check, CheckSquare, Square } from "lucide-react";

export interface DecisionOption {
  label: string;
  description?: string;
}

export interface DecisionQuestion {
  id: string;
  title: string;
  description?: string;
  type: "radio" | "text" | "textarea" | "checkbox";
  options?: (string | DecisionOption)[];
  default?: string | string[];
  placeholder?: string;
}

export interface DiscoveryDecisionsData {
  appName?: string;
  title?: string;
  questions?: DecisionQuestion[];
}

export function isDiscoveryDecisionsJson(text: string, language?: string): boolean {
  if (language === "discovery-decisions-json" || language === "discovery-questions-json") return true;
  if (!text || text.length < 20) return false;
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(text);
      if (parsed.questions && Array.isArray(parsed.questions)) {
        return true;
      }
    } catch {}
  }
  return false;
}

const DEFAULT_QUESTIONS: DecisionQuestion[] = [
  {
    id: "1",
    title: "1. Model bisnis dan operasional",
    description: "Bagaimana platform ini mempertemukan pengguna dengan layanan/produk?",
    type: "radio",
    options: [
      "Marketplace — banyak pemilik listing dapat mendaftarkan properti mereka sendiri.",
      "Direktori — platform menampilkan listing, pengguna menghubungi pemilik secara langsung.",
      "Satu pengelola — platform hanya mengelola listing milik satu bisnis.",
    ],
    default: "Satu pengelola — platform hanya mengelola listing milik satu bisnis.",
  },
  {
    id: "2",
    title: "2. Mekanisme booking",
    description: "Apa yang terjadi saat pengguna ingin memesan/transaksi?",
    type: "radio",
    options: [
      "Request booking — pengguna mengajukan permintaan, pemilik menyetujui atau menolak.",
      "Instant booking — kamar/slot langsung dipesan jika tersedia.",
      "Hubungi pemilik — melalui WhatsApp atau kontak yang tersedia.",
      "Jadwalkan survei — pengguna membuat janji untuk survei terlebih dahulu.",
    ],
    default: "Instant booking — kamar/slot langsung dipesan jika tersedia.",
  },
  {
    id: "3",
    title: "3. Sistem pembayaran",
    description: "Tentukan cakupan pembayaran yang ingin diuji pada MVP.",
    type: "radio",
    options: [
      "Tanpa pembayaran online — hanya pencarian dan booking.",
      "DP online — pengguna membayar uang muka melalui platform.",
      "Pembayaran penuh — pengguna membayar biaya penuh secara online.",
      "Pembayaran langsung ke pemilik.",
    ],
    default: "Tanpa pembayaran online — hanya pencarian dan booking.",
  },
  {
    id: "4",
    title: "4. Siapa yang mengelola data?",
    type: "radio",
    options: [
      "Pemilik listing mendaftar, mengelola properti, harga, dan ketersediaan sendiri.",
      "Admin platform memasukkan dan memperbarui semua data listing.",
      "Keduanya — pemilik mengelola listing, admin melakukan moderasi.",
    ],
    default: "Pemilik listing mendaftar, mengelola properti, harga, dan ketersediaan sendiri.",
  },
  {
    id: "5",
    title: "5. Wilayah peluncuran",
    description: "Kota atau area pertama menentukan strategi pengumpulan listing.",
    type: "text",
    placeholder: "Contoh: Malang, Surabaya, Jakarta",
    default: "Malang",
  },
  {
    id: "6",
    title: "6. Fitur atau keunggulan utama",
    description: "Apa masalah yang ingin kamu selesaikan lebih baik daripada mencari lewat media sosial atau marketplace umum?",
    type: "textarea",
    placeholder: "Contoh: Harga murah, lokasi terverifikasi akurat, respon cepat...",
    default: "Harga murah dan lokasi akurat",
  },
  {
    id: "7",
    title: "7. Role pengguna",
    description: "Pilih aktor yang perlu ada dalam MVP.",
    type: "checkbox",
    options: [
      { label: "Pengguna / Mahasiswa", description: "Mencari dan memesan listing" },
      { label: "Pemilik / Mitra", description: "Mengelola listing dan ketersediaan" },
      { label: "Admin", description: "Memoderasi platform" },
      { label: "Superadmin", description: "Mengelola konfigurasi dan akses admin" },
    ],
    default: ["Pengguna / Mahasiswa", "Pemilik / Mitra"],
  },
  {
    id: "8",
    title: "8. Verifikasi listing",
    type: "radio",
    options: [
      "Tidak ada verifikasi khusus pada MVP.",
      "Admin memeriksa dan menyetujui listing sebelum ditayangkan.",
      "Pemilik wajib mengunggah dokumen pendukung kepemilikan atau pengelolaan.",
    ],
    default: "Tidak ada verifikasi khusus pada MVP.",
  },
];

export function DiscoveryQuestionsCard({
  rawJson,
  onSubmit,
}: {
  rawJson: string;
  onSubmit?: (compiledAnswer: string) => void;
}) {
  const data: DiscoveryDecisionsData = React.useMemo(() => {
    try {
      return JSON.parse(rawJson);
    } catch {
      return {};
    }
  }, [rawJson]);

  const questions: DecisionQuestion[] = data.questions && data.questions.length > 0
    ? data.questions
    : DEFAULT_QUESTIONS;

  // Answers State
  const [answers, setAnswers] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    questions.forEach((q) => {
      initial[q.id] = q.default ?? (q.type === "checkbox" ? [] : "");
    });
    return initial;
  });

  const handleRadioChange = (questionId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  const handleCheckboxToggle = (questionId: string, optionLabel: string) => {
    setAnswers((prev) => {
      const currentList: string[] = Array.isArray(prev[questionId]) ? prev[questionId] : [];
      if (currentList.includes(optionLabel)) {
        return { ...prev, [questionId]: currentList.filter((x) => x !== optionLabel) };
      } else {
        return { ...prev, [questionId]: [...currentList, optionLabel] };
      }
    });
  };

  const handleTextChange = (questionId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;

    // Compile answers into a clear markdown response
    const compiled = questions
      .map((q) => {
        const val = answers[q.id];
        if (Array.isArray(val)) {
          return `**${q.title}:**\n${val.map((item) => `- ${item}`).join("\n")}`;
        }
        return `**${q.title}:** ${val || "Belum ditentukan"}`;
      })
      .join("\n\n");

    const fullMessage = `Berikut keputusan Product Discovery yang saya pilih:\n\n${compiled}\n\nSilakan lanjutkan ke spesifikasi alur sistem dan PRD lengkap.`;
    onSubmit(fullMessage);
  };

  return (
    <div className="my-6 rounded-2xl border border-[#2e3032] bg-[#141517] p-5 sm:p-7 shadow-xl space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((q, idx) => {
          const val = answers[q.id];

          return (
            <div key={q.id} className="space-y-3">
              {idx > 0 && <hr className="border-[#26282a] my-4" />}

              {/* Title & Description */}
              <div className="space-y-0.5">
                <h3 className="text-xs sm:text-[13px] font-semibold text-white tracking-tight">
                  {q.title}
                </h3>
                {q.description && (
                  <p className="text-[11.5px] text-[#9aa0a6] leading-relaxed">
                    {q.description}
                  </p>
                )}
              </div>

              {/* Field by Type */}
              {q.type === "radio" && q.options && (
                <div className="space-y-2.5 pt-1">
                  {q.options.map((optRaw) => {
                    const optLabel = typeof optRaw === "string" ? optRaw : optRaw.label;
                    const optDesc = typeof optRaw === "object" ? optRaw.description : undefined;
                    const isSelected = val === optLabel;

                    return (
                      <label
                        key={optLabel}
                        onClick={() => handleRadioChange(q.id, optLabel)}
                        className="flex items-start gap-3 cursor-pointer text-xs sm:text-[12.5px] text-[#e3e3e3] select-none hover:text-white transition group py-0.5"
                      >
                        <div
                          className={`w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center transition ${
                            isSelected
                              ? "border-white bg-transparent"
                              : "border-[#5f6368] group-hover:border-[#9aa0a6]"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="leading-snug">{optLabel}</span>
                          {optDesc && (
                            <span className="text-[11px] text-[#80868b] mt-0.5">{optDesc}</span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {q.type === "checkbox" && q.options && (
                <div className="space-y-2.5 pt-1">
                  {q.options.map((optRaw) => {
                    const optLabel = typeof optRaw === "string" ? optRaw : optRaw.label;
                    const optDesc = typeof optRaw === "object" ? optRaw.description : undefined;
                    const checkedList: string[] = Array.isArray(val) ? val : [];
                    const isChecked = checkedList.includes(optLabel);

                    return (
                      <label
                        key={optLabel}
                        onClick={() => handleCheckboxToggle(q.id, optLabel)}
                        className="flex items-start gap-3 cursor-pointer text-xs sm:text-[12.5px] text-[#e3e3e3] select-none hover:text-white transition group py-0.5"
                      >
                        <div
                          className={`w-4 h-4 rounded-md border shrink-0 mt-0.5 flex items-center justify-center transition ${
                            isChecked
                              ? "border-white bg-white text-[#131314]"
                              : "border-[#5f6368] group-hover:border-[#9aa0a6]"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="leading-snug font-medium text-white">{optLabel}</span>
                          {optDesc && (
                            <span className="text-[11px] text-[#9aa0a6] mt-0.5">{optDesc}</span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {q.type === "text" && (
                <div className="pt-1">
                  <input
                    type="text"
                    value={val || ""}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    placeholder={q.placeholder || "Ketik jawaban..."}
                    className="w-full bg-[#111213] border border-[#3c4043] focus:border-[#5a5d61] rounded-full px-4 py-2 text-xs sm:text-sm text-white placeholder-[#80868b] focus:outline-none transition"
                  />
                </div>
              )}

              {q.type === "textarea" && (
                <div className="pt-1">
                  <textarea
                    rows={2}
                    value={val || ""}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    placeholder={q.placeholder || "Ketik penjelasan..."}
                    className="w-full bg-[#111213] border border-[#3c4043] focus:border-[#5a5d61] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-[#80868b] focus:outline-none transition leading-relaxed resize-y"
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Action Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-full bg-[#f1f3f4] hover:bg-white text-[#131314] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md active:scale-[0.99]"
          >
            <span>Lanjutkan Discovery</span>
            <ArrowRight className="w-4 h-4 text-[#131314]" />
          </button>
        </div>
      </form>
    </div>
  );
}
