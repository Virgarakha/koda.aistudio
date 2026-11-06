"use client";

import React, { useState } from "react";
import { FileText, CheckSquare, Square } from "lucide-react";

export interface FinalQuestionOption {
  label: string;
  sublabel?: string;
}

export interface FinalQuestion {
  id: string;
  title: string;
  note?: string;
  type: "radio" | "checkbox";
  options: (string | FinalQuestionOption)[];
  default: string | string[];
}

export interface DiscoveryFinalQuestionsData {
  title?: string;
  description?: string;
  questions?: FinalQuestion[];
  buttonText?: string;
}

export function isDiscoveryFinalQuestionsJson(text: string, language?: string): boolean {
  if (language === "discovery-final-json" || language === "discovery-stage3-json") return true;
  if (!text || text.length < 20) return false;
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(text);
      if (
        parsed.isFinalStage ||
        (parsed.title && parsed.title.toLowerCase().includes("terakhir")) ||
        (parsed.questions && parsed.questions.some((q: any) => q.title?.toLowerCase().includes("hak akses pemilik")))
      ) {
        return true;
      }
    } catch {}
  }
  return false;
}

const DEFAULT_QUESTIONS: FinalQuestion[] = [
  {
    id: "1",
    title: "1. Hak akses pemilik kos",
    type: "radio",
    options: [
      "Pemilik hanya mengelola kos yang ditugaskan kepadanya.",
      "Semua akun pemilik internal bisa mengelola seluruh kos.",
      "Hanya admin yang mengelola data kos; akun pemilik tidak diperlukan pada MVP.",
    ],
    default: "Pemilik hanya mengelola kos yang ditugaskan kepadanya.",
  },
  {
    id: "2",
    title: "2. Kapan booking dianggap berhasil?",
    type: "radio",
    note: "Pilihan kedua lebih menyerupai request booking daripada instant booking.",
    options: [
      "Begitu mahasiswa mengonfirmasi booking dan stok tersedia, sistem mencatat booking serta mengurangi stok.",
      "Booking menjadi permintaan sementara; pemilik harus menyetujui sebelum stok dikurangi permanen.",
    ],
    default: "Begitu mahasiswa mengonfirmasi booking dan stok tersedia, sistem mencatat booking serta mengurangi stok.",
  },
  {
    id: "3",
    title: "3. Berapa lama kamar ditahan?",
    type: "radio",
    note: "Karena pembayaran berlangsung di luar platform, sistem tidak dapat mengetahui pembayaran berhasil tanpa konfirmasi manual.",
    options: [
      "Tidak ada batas waktu otomatis; booking aktif sampai dibatalkan atau diselesaikan.",
      "24 jam, lalu booking otomatis kedaluwarsa jika belum dikonfirmasi pembayarannya oleh pemilik.",
      "Admin atau pemilik mengakhiri booking secara manual.",
    ],
    default: "24 jam, lalu booking otomatis kedaluwarsa jika belum dikonfirmasi pembayarannya oleh pemilik.",
  },
  {
    id: "4",
    title: "4. Siapa yang dapat membatalkan booking?",
    type: "radio",
    options: [
      "Mahasiswa saja.",
      "Pemilik saja.",
      "Mahasiswa dan pemilik, dengan alasan pembatalan.",
      "Hanya admin yang bisa membatalkan.",
    ],
    default: "Mahasiswa dan pemilik, dengan alasan pembatalan.",
  },
  {
    id: "5",
    title: "5. Bagaimana listing ditayangkan?",
    type: "radio",
    options: [
      "Admin menyetujui publikasi listing, tanpa pemeriksaan dokumen.",
      "Pemilik dapat langsung menerbitkan listing sendiri.",
    ],
    default: "Admin menyetujui publikasi listing, tanpa pemeriksaan dokumen.",
  },
  {
    id: "6",
    title: "6. Apakah mahasiswa wajib login untuk booking?",
    type: "radio",
    options: [
      "Ya, wajib login agar riwayat dan status booking dapat diakses.",
      "Tidak, bisa booking sebagai tamu dengan nama dan nomor WhatsApp.",
    ],
    default: "Ya, wajib login agar riwayat dan status booking dapat diakses.",
  },
  {
    id: "7",
    title: "7. Fitur apa saja yang wajib masuk MVP?",
    type: "checkbox",
    note: "Fitur di bawah adalah kandidat awal. Pilih yang kamu inginkan.",
    options: [
      { label: "Pencarian kos", sublabel: "Cari berdasarkan nama atau lokasi." },
      { label: "Filter harga dan fasilitas", sublabel: "Filter harga bulanan dan fasilitas kamar." },
      { label: "Detail kos", sublabel: "Foto, alamat, harga, fasilitas, dan stok." },
      { label: "Booking dan riwayat", sublabel: "Buat booking dan pantau status." },
      { label: "Dashboard pemilik dan admin", sublabel: "Kelola kos, kamar, stok, dan booking." },
      { label: "Kontak WhatsApp", sublabel: "Hubungi pemilik untuk pembayaran langsung." },
      { label: "Favorit kos", sublabel: "Simpan listing untuk dibandingkan." },
      { label: "Peta lokasi", sublabel: "Lihat lokasi kos pada peta." },
      { label: "Ulasan mahasiswa", sublabel: "Berikan penilaian setelah menyewa." },
    ],
    default: [
      "Pencarian kos",
      "Filter harga dan fasilitas",
      "Detail kos",
      "Booking dan riwayat",
      "Dashboard pemilik dan admin",
      "Kontak WhatsApp",
    ],
  },
];

export function DiscoveryFinalQuestionsCard({
  rawJson,
  onSubmit,
}: {
  rawJson: string;
  onSubmit?: (compiledAnswer: string) => void;
}) {
  const data: DiscoveryFinalQuestionsData = React.useMemo(() => {
    try {
      return JSON.parse(rawJson);
    } catch {
      return {};
    }
  }, [rawJson]);

  const questions: FinalQuestion[] = data.questions && data.questions.length > 0 ? data.questions : DEFAULT_QUESTIONS;
  const buttonText = data.buttonText || "Susun PRD Lengkap";

  const [answers, setAnswers] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    questions.forEach((q) => {
      init[q.id] = q.default ?? (q.type === "checkbox" ? [] : "");
    });
    return init;
  });

  const handleRadioSelect = (questionId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  const handleCheckboxToggle = (questionId: string, label: string) => {
    setAnswers((prev) => {
      const currentList: string[] = Array.isArray(prev[questionId]) ? prev[questionId] : [];
      if (currentList.includes(label)) {
        return { ...prev, [questionId]: currentList.filter((x) => x !== label) };
      } else {
        return { ...prev, [questionId]: [...currentList, label] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;

    const compiled = questions
      .map((q) => {
        const val = answers[q.id];
        if (Array.isArray(val)) {
          return `**${q.title}:**\n${val.map((item) => `- ${item}`).join("\n")}`;
        }
        return `**${q.title}:** ${val || "Tidak dipilih"}`;
      })
      .join("\n\n");

    const fullMessage = `Berikut keputusan final sebelum penyusunan PRD:\n\n${compiled}\n\nMohon susun PRD lengkap dan buka Papan Interaktif (Stitch Board).`;
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

              {/* Title */}
              <div className="space-y-1">
                <h4 className="text-xs sm:text-[13px] font-semibold text-white tracking-tight">
                  {q.title}
                </h4>
                {q.note && (
                  <p className="text-[11.5px] text-[#9aa0a6] leading-relaxed">
                    {q.note}
                  </p>
                )}
              </div>

              {/* Radio Options */}
              {q.type === "radio" && (
                <div className="space-y-2.5 pt-1">
                  {q.options.map((opt) => {
                    const labelText = typeof opt === "string" ? opt : opt.label;
                    const isSelected = val === labelText;

                    return (
                      <label
                        key={labelText}
                        onClick={() => handleRadioSelect(q.id, labelText)}
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
                        <span className="leading-snug">{labelText}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Checkbox Options */}
              {q.type === "checkbox" && (
                <div className="space-y-3 pt-1">
                  {q.options.map((opt) => {
                    const labelText = typeof opt === "string" ? opt : opt.label;
                    const sublabelText = typeof opt === "string" ? undefined : opt.sublabel;
                    const isChecked = Array.isArray(val) && val.includes(labelText);

                    return (
                      <label
                        key={labelText}
                        onClick={() => handleCheckboxToggle(q.id, labelText)}
                        className="flex items-start gap-3 cursor-pointer select-none group py-0.5"
                      >
                        <div
                          className={`w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center border transition ${
                            isChecked
                              ? "bg-white border-white text-black"
                              : "border-[#5f6368] group-hover:border-[#9aa0a6] bg-transparent"
                          }`}
                        >
                          {isChecked && (
                            <svg
                              className="w-3 h-3 text-black stroke-[3]"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <span
                            className={`text-xs sm:text-[12.5px] font-medium leading-tight block ${
                              isChecked ? "text-white" : "text-[#c4c7c5]"
                            }`}
                          >
                            {labelText}
                          </span>
                          {sublabelText && (
                            <span className="text-[11px] text-[#9aa0a6] block leading-snug">
                              {sublabelText}
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-full bg-[#f1f3f4] hover:bg-white text-[#131314] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md active:scale-[0.99]"
          >
            <FileText className="w-4 h-4 text-[#131314]" />
            <span>{buttonText}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
