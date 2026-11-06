"use client";

import React, { useState } from "react";
import { ClipboardList, ArrowRight, Check } from "lucide-react";

export interface Stage2Question {
  id: string;
  title: string;
  description?: string;
  type: "radio" | "textarea" | "text";
  options?: string[];
  default?: string;
  placeholder?: string;
}

export interface DiscoveryStage2Data {
  title?: string;
  description?: string;
  buttonText?: string;
  questions?: Stage2Question[];
}

export function isDiscoveryStage2Json(text: string, language?: string): boolean {
  if (language === "discovery-stage2-json" || language === "discovery-advanced-json") return true;
  if (!text || text.length < 20) return false;
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(text);
      if (parsed.stage === 2 || (parsed.title && parsed.title.toLowerCase().includes("lanjutan"))) {
        return true;
      }
    } catch {}
  }
  return false;
}

const DEFAULT_STAGE2_QUESTIONS: Stage2Question[] = [
  {
    id: "1",
    title: "1. Siapa pemilik kos dalam sistem?",
    type: "radio",
    options: [
      "Satu bisnis mengelola kos sendiri, pemilik adalah pengelola internal.",
      "Banyak pemilik kos independen bisa mendaftar, tetapi platform tetap dikelola satu operator.",
      "Hanya satu operator; semua data kos dimasukkan oleh operator, bukan pemilik.",
    ],
    default: "Satu bisnis mengelola kos sendiri, pemilik adalah pengelola internal.",
  },
  {
    id: "2",
    title: "2. Bagaimana ketersediaan kamar dijaga?",
    type: "radio",
    options: [
      "Pemilik memperbarui jumlah kamar kosong; sistem mengurangi ketersediaan ketika booking berhasil.",
      "Mahasiswa memesan instan, tetapi pemilik memperbarui status kamar secara manual.",
      "Mahasiswa memilih tanggal masuk dan sistem memeriksa ketersediaan berdasarkan periode sewa.",
    ],
    default: "Pemilik memperbarui jumlah kamar kosong; sistem mengurangi ketersediaan ketika booking berhasil.",
  },
  {
    id: "3",
    title: "3. Harga kos ditampilkan per periode apa?",
    type: "radio",
    options: [
      "Bulanan saja.",
      "Tahunan saja.",
      "Bulanan dan tahunan, tergantung kos.",
      "Harian, bulanan, atau tahunan sesuai kos.",
    ],
    default: "Bulanan saja.",
  },
  {
    id: "4",
    title: "4. Apa arti instant booking jika tidak ada pembayaran online?",
    type: "radio",
    options: [
      "Booking langsung tercatat dan kamar ditahan setelah mahasiswa mengonfirmasi pesanan.",
      "Mahasiswa harus menghubungi pemilik terlebih dahulu; booking baru tercatat setelah kesepakatan.",
      "Booking tercatat instan, tetapi pembayaran dan kesepakatan lanjutan dilakukan langsung dengan pemilik.",
    ],
    default: "Booking langsung tercatat dan kamar ditahan setelah mahasiswa mengonfirmasi pesanan.",
  },
  {
    id: "5",
    title: "5. Bagaimana komunikasi dan pembayaran berlangsung?",
    type: "radio",
    options: [
      "Melalui WhatsApp pemilik; pembayaran dilakukan di luar platform.",
      "Melalui detail booking di website, lalu pembayaran langsung kepada pemilik.",
      "Website menyediakan detail booking dan tombol WhatsApp pemilik.",
    ],
    default: "Melalui WhatsApp pemilik; pembayaran dilakukan di luar platform.",
  },
  {
    id: "6",
    title: "6. Apa batas harga yang ingin ditonjolkan?",
    description: "Ini untuk menentukan filter harga dan positioning. Batas ini belum dianggap sebagai harga pasar Malang.",
    type: "radio",
    options: [
      "Di bawah Rp500.000 per bulan",
      "Rp500.000–Rp1.000.000 per bulan",
      "Rp1.000.000–Rp1.500.000 per bulan",
      "Berbagai rentang harga, dengan prioritas opsi termurah.",
    ],
    default: "Rp500.000–Rp1.000.000 per bulan",
  },
  {
    id: "7",
    title: "7. Apakah admin diperlukan pada MVP?",
    type: "radio",
    options: [
      "Ya, admin internal untuk mengelola pengguna, listing, dan booking.",
      "Tidak ada dashboard admin khusus; pengelolaan dilakukan pemilik.",
      "Admin minimal untuk mengelola listing dan menangani masalah booking.",
    ],
    default: "Ya, admin internal untuk mengelola pengguna, listing, dan booking.",
  },
  {
    id: "8",
    title: "8. Catatan tambahan (opsional)",
    type: "textarea",
    placeholder: "Contoh: dekat kampus, kos putra/putri, kamar mandi dalam, Wi-Fi, fasilitas, atau batasan lainnya.",
    default: "",
  },
];

export function DiscoveryStage2Card({
  rawJson,
  onSubmit,
}: {
  rawJson: string;
  onSubmit?: (compiledAnswer: string) => void;
}) {
  const data: DiscoveryStage2Data = React.useMemo(() => {
    try {
      return JSON.parse(rawJson);
    } catch {
      return {};
    }
  }, [rawJson]);

  const cardTitle = data.title || "Discovery lanjutan";
  const cardDesc =
    data.description ||
    "Pilih keputusan yang sesuai dengan model bisnis yang kamu inginkan. Jawabanmu akan menjadi dasar requirement PRD.";
  const buttonText = data.buttonText || "Konfirmasi Discovery";

  const questions: Stage2Question[] =
    data.questions && data.questions.length > 0 ? data.questions : DEFAULT_STAGE2_QUESTIONS;

  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    questions.forEach((q) => {
      init[q.id] = q.default ?? "";
    });
    return init;
  });

  const handleSelect = (questionId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;

    const compiled = questions
      .map((q) => {
        const val = answers[q.id];
        return `**${q.title}:** ${val || "Tidak ada catatan"}`;
      })
      .join("\n\n");

    const fullMessage = `Berikut konfirmasi Discovery Lanjutan yang saya putuskan:\n\n${compiled}\n\nMohon buatkan PRD lengkap berstandar industri dengan diagram alur sistem dan skema teknis.`;
    onSubmit(fullMessage);
  };

  return (
    <div className="my-6 rounded-2xl border border-[#2e3032] bg-[#141517] p-5 sm:p-7 shadow-xl space-y-6">
      {/* Header */}
      <div className="space-y-1 pb-1">
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
          {cardTitle}
        </h3>
        <p className="text-xs text-[#9aa0a6] leading-relaxed">
          {cardDesc}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((q, idx) => {
          const val = answers[q.id];

          return (
            <div key={q.id} className="space-y-3">
              {idx > 0 && <hr className="border-[#26282a] my-4" />}

              {/* Title & Description */}
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-[13px] font-semibold text-white tracking-tight">
                  {q.title}
                </h4>
                {q.description && (
                  <p className="text-[11.5px] text-[#9aa0a6] leading-relaxed">
                    {q.description}
                  </p>
                )}
              </div>

              {/* Radio Options */}
              {q.type === "radio" && q.options && (
                <div className="space-y-2.5 pt-1">
                  {q.options.map((opt) => {
                    const isSelected = val === opt;

                    return (
                      <label
                        key={opt}
                        onClick={() => handleSelect(q.id, opt)}
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
                        <span className="leading-snug">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Textarea */}
              {q.type === "textarea" && (
                <div className="pt-1">
                  <textarea
                    rows={3}
                    value={val || ""}
                    onChange={(e) => handleSelect(q.id, e.target.value)}
                    placeholder={q.placeholder || "Ketik catatan..."}
                    className="w-full bg-[#111213] border border-[#3c4043] focus:border-[#5a5d61] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#80868b] focus:outline-none transition leading-relaxed resize-y"
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
            <ClipboardList className="w-4 h-4 text-[#131314]" />
            <span>{buttonText}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
