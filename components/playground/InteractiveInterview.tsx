"use client";

import React, { useState } from "react";
import { Check, ArrowRight, HelpCircle } from "lucide-react";

export interface InterviewOption {
  id: string;
  label: string;
  description?: string;
}

export interface InterviewQuestion {
  id: string;
  question?: string;
  title?: string;
  type?: "boolean" | "multiple_choice";
  options?: InterviewOption[];
}

export interface InterviewBlockData {
  title?: string;
  description?: string;
  promptText?: string;
  questions?: InterviewQuestion[];
  options?: InterviewOption[];
}

export function isInterviewJson(text: string, language?: string): boolean {
  if (language === "interview-json" || language === "qa-json") return true;
  // If language is specifically another known tool block, do not treat as interview-json
  if (
    language &&
    (language.startsWith("discovery-") ||
      language.startsWith("flow-") ||
      language.startsWith("designs-") ||
      language.startsWith("prd-"))
  ) {
    return false;
  }

  if (!text || text.length < 15) return false;

  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(text);
      // If it has discovery-specific keys or schema, ignore
      if (parsed.isFinalStage || parsed.category || parsed.backend || (parsed.appName && parsed.questions && parsed.questions.some((q: any) => q.type === "radio" || q.type === "textarea"))) {
        return false;
      }
      if (
        (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) ||
        (parsed.options && Array.isArray(parsed.options) && parsed.options.length > 0)
      ) {
        return true;
      }
    } catch {}
  }
  return false;
}

export function InteractiveInterview({
  rawJson,
  onSubmitAnswers,
}: {
  rawJson: string;
  onSubmitAnswers?: (formattedAnswer: string) => void;
}) {
  const data: InterviewBlockData = React.useMemo(() => {
    try {
      return JSON.parse(rawJson);
    } catch {
      return {};
    }
  }, [rawJson]);

  // Determine if this is multi-question mode or single-question mode
  const isMultiQuestion = Boolean(
    data.questions && Array.isArray(data.questions) && data.questions.length > 1
  );

  const questionsList: InterviewQuestion[] = React.useMemo(() => {
    if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
      return data.questions.map((q, idx) => {
        let rawOptions = q.options;
        let normalizedOptions: InterviewOption[] = [];

        if (Array.isArray(rawOptions) && rawOptions.length > 0) {
          normalizedOptions = rawOptions.map((opt: any, optIdx: number) => {
            if (typeof opt === "string") {
              const letter = String.fromCharCode(65 + optIdx);
              return { id: letter, label: opt };
            }
            const fallbackId = String.fromCharCode(65 + optIdx);
            return {
              id: opt.id || fallbackId,
              label: opt.label || opt.text || opt.title || `Opsi ${opt.id || fallbackId}`,
              description: opt.description,
            };
          });
        } else if (q.type === "boolean") {
          normalizedOptions = [
            { id: "A", label: "Ya, Terapkan aturan ini" },
            { id: "B", label: "Tidak, Buat alternatif yang lebih fleksibel" },
          ];
        } else {
          normalizedOptions = [
            { id: "A", label: "Opsi Standar / Rekomendasi" },
            { id: "B", label: "Opsi Lanjutan / Skalabilitas Tinggi" },
            { id: "C", label: "Opsi Minimalis / Ringan" },
          ];
        }

        return {
          ...q,
          id: q.id || String(idx + 1),
          options: normalizedOptions,
        };
      });
    }

    if (data.options && Array.isArray(data.options) && data.options.length > 0) {
      const normalizedOptions = data.options.map((opt: any, optIdx: number) => {
        if (typeof opt === "string") {
          const letter = String.fromCharCode(65 + optIdx);
          return { id: letter, label: opt };
        }
        const fallbackId = String.fromCharCode(65 + optIdx);
        return {
          id: opt.id || fallbackId,
          label: opt.label || opt.text || opt.title || `Opsi ${opt.id || fallbackId}`,
          description: opt.description,
        };
      });

      return [
        {
          id: "1",
          question: data.title || "Pilih salah satu opsi arsitektur:",
          options: normalizedOptions,
        },
      ];
    }

    return [];
  }, [data]);

  // State for selections: { [questionId: string]: InterviewOption }
  const [selectedMap, setSelectedMap] = useState<Record<string, InterviewOption>>({});
  const [submitted, setSubmitted] = useState(false);

  // Single question 1-click handler
  const handleSingleSelect = (opt: InterviewOption) => {
    if (submitted) return;
    setSelectedMap({ "1": opt });
    if (onSubmitAnswers) {
      setSubmitted(true);
      const answerPayload = `${opt.id}. ${opt.label}`;
      onSubmitAnswers(answerPayload);
    }
  };

  // Multi-question option toggle
  const handleMultiSelectOption = (qId: string, opt: InterviewOption) => {
    if (submitted) return;
    setSelectedMap((prev) => ({
      ...prev,
      [qId]: opt,
    }));
  };

  // Submit all answered multi-questions
  const handleMultiSubmit = () => {
    if (submitted || !onSubmitAnswers) return;
    const answeredCount = Object.keys(selectedMap).length;
    if (answeredCount === 0) return;

    setSubmitted(true);
    // Format response e.g. "1. [Judul Q1]: B. [Label] | 2. [Judul Q2]: A. [Label]"
    const formatted = questionsList
      .map((q, idx) => {
        const choice = selectedMap[q.id];
        const qTitle = q.question || q.title || `Pertanyaan ${idx + 1}`;
        // Clean question title to short summary
        const shortQ = qTitle.replace(/^\d+[\.\s]+/, "").split(":")[0].trim();
        return choice
          ? `${idx + 1}. ${shortQ}: ${choice.id}. ${choice.label}`
          : `${idx + 1}. ${shortQ}: (Belum dipilih)`;
      })
      .join(" | ");

    onSubmitAnswers(formatted);
  };

  if (!questionsList || questionsList.length === 0) {
    return null;
  }

  // 1. Single Question Layout (Direct 1-click pill buttons)
  if (!isMultiQuestion) {
    const singleQ = questionsList[0];
    const options = singleQ.options || [];

    return (
      <div className="my-4 space-y-3 w-full">
        {data.title && (
          <div className="text-xs font-semibold text-[#9aa0a6] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#d97736]" />
            <span>{data.title}</span>
          </div>
        )}
        {options.map((opt) => {
          const isSelected = selectedMap["1"]?.id === opt.id;
          const labelStr = opt.label || "";
          const fullText = opt.description ? `${labelStr} - ${opt.description}` : labelStr;
          const optPrefix = opt.id ? `${opt.id}. ` : "";
          const cleanText =
            typeof fullText === "string" && optPrefix && fullText.startsWith(optPrefix)
              ? fullText.slice(optPrefix.length)
              : String(fullText || "");

          return (
            <button
              key={opt.id}
              type="button"
              disabled={submitted}
              onClick={() => handleSingleSelect(opt)}
              className={`w-full group text-left px-6 py-3.5 sm:py-4 rounded-3xl sm:rounded-full border transition-all duration-150 flex items-center justify-between gap-4 select-none ${
                isSelected
                  ? "bg-[#282a2c] border-[#d97736] text-white ring-1 ring-[#d97736]/50 shadow-md"
                  : submitted
                  ? "bg-[#18191a]/60 border-[#2e3032] text-[#80868b] cursor-not-allowed opacity-60"
                  : "bg-transparent border-[#3c4043] hover:border-[#5f6368] hover:bg-[#212224] text-[#e3e3e3] cursor-pointer"
              }`}
            >
              <div className="flex-1 text-[13.5px] sm:text-[14px] leading-relaxed font-sans font-normal text-left whitespace-normal break-words">
                <span className="font-semibold text-white">{opt.id}. </span>
                <span>{cleanText}</span>
              </div>

              {isSelected && (
                <div className="shrink-0 w-5 h-5 rounded-full bg-[#d97736] flex items-center justify-center text-white self-center">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // 2. Multi-Question Layout (Question 1 with 3 options, Question 2 with 3 options, etc.)
  const totalQuestions = questionsList.length;
  const answeredCount = Object.keys(selectedMap).length;
  const allAnswered = answeredCount >= totalQuestions;

  return (
    <div className="my-5 rounded-2xl border border-[#2e3032] bg-[#141517] p-4 sm:p-5 shadow-2xl space-y-5 w-full">
      {/* Header */}
      {data.title && (
        <div className="pb-3 border-b border-[#282a2c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#d97736]" />
            <h4 className="text-xs sm:text-sm font-semibold text-white tracking-tight">
              {data.title}
            </h4>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#202124] text-[#9aa0a6] border border-[#3c4043]">
            {answeredCount} / {totalQuestions} Terpilih
          </span>
        </div>
      )}

      {/* Render each Question with its 3 pill options */}
      <div className="space-y-6">
        {questionsList.map((q, qIdx) => {
          const selectedForThisQ = selectedMap[q.id];
          const questionLabel = q.question || q.title || `Pertanyaan ${qIdx + 1}`;

          return (
            <div key={q.id} className="space-y-2.5">
              {/* Question Heading */}
              <div className="flex items-start justify-between gap-2">
                <h5 className="text-[13.5px] sm:text-[14px] font-semibold text-[#f1f3f4] leading-snug">
                  {questionLabel}
                </h5>
                {selectedForThisQ && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#d97736]/20 text-[#d97736] border border-[#d97736]/40 shrink-0">
                    Opsi {selectedForThisQ.id}
                  </span>
                )}
              </div>

              {/* 3 Options Pill List */}
              <div className="space-y-2">
                {(q.options || []).map((opt) => {
                  const isSelected = selectedForThisQ?.id === opt.id;
                  const labelStr = opt.label || "";
                  const fullText = opt.description ? `${labelStr} - ${opt.description}` : labelStr;
                  const optPrefix = opt.id ? `${opt.id}. ` : "";
                  const cleanText =
                    typeof fullText === "string" && optPrefix && fullText.startsWith(optPrefix)
                      ? fullText.slice(optPrefix.length)
                      : String(fullText || "");

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleMultiSelectOption(q.id, opt)}
                      className={`w-full group text-left px-5 py-3 rounded-2xl sm:rounded-full border transition-all duration-150 flex items-center justify-between gap-3 select-none ${
                        isSelected
                          ? "bg-[#282a2c] border-[#d97736] text-white ring-1 ring-[#d97736]/50 shadow-md"
                          : submitted
                          ? "bg-[#18191a]/60 border-[#2e3032] text-[#80868b] cursor-not-allowed opacity-60"
                          : "bg-[#18191a]/80 border-[#3c4043] hover:border-[#5f6368] hover:bg-[#212224] text-[#e3e3e3] cursor-pointer"
                      }`}
                    >
                      <div className="flex-1 text-[13px] sm:text-[13.5px] leading-relaxed font-sans font-normal text-left whitespace-normal break-words">
                        <span className="font-semibold text-white">{opt.id}. </span>
                        <span>{cleanText}</span>
                      </div>

                      {isSelected && (
                        <div className="shrink-0 w-4.5 h-4.5 rounded-full bg-[#d97736] flex items-center justify-center text-white self-center">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Submit Button for Multi-Question */}
      <div className="pt-2 border-t border-[#282a2c] flex items-center justify-between gap-3">
        <p className="text-[11px] text-[#9aa0a6]">
          {submitted
            ? "Pilihan Anda telah dikirim ke AI."
            : allAnswered
            ? "Semua opsi telah dipilih, klik tombol untuk mengirim."
            : "Silakan pilih satu opsi untuk setiap pertanyaan di atas."}
        </p>

        {!submitted && (
          <button
            type="button"
            disabled={!allAnswered}
            onClick={handleMultiSubmit}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              allAnswered
                ? "bg-[#d97736] hover:bg-[#c26629] text-white shadow-lg cursor-pointer"
                : "bg-[#282a2c] text-[#80868b] cursor-not-allowed border border-[#3c4043]/50"
            }`}
          >
            <span>Kirim Pilihan ({answeredCount}/{totalQuestions})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
