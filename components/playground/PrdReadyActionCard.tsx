"use client";

import React, { useState } from "react";
import { Sparkles, Download, Copy, Check, ShieldCheck, CheckCircle2 } from "lucide-react";

export interface PrdReadyData {
  title?: string;
  appName?: string;
  summary?: string;
  buttonText?: string;
}

export function isPrdReadyJson(text: string, language?: string): boolean {
  if (language === "prd-ready-json" || language === "prd-action-json") return true;
  if (!text || text.length < 15) return false;

  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(text);
      if (parsed.status === "ready" || parsed.buttonText || (parsed.title && parsed.title.toLowerCase().includes("prd"))) {
        return true;
      }
    } catch {}
  }
  return false;
}

export function PrdReadyActionCard({
  rawJson,
  fullContent,
  onCompilePRD,
}: {
  rawJson: string;
  fullContent?: string;
  onCompilePRD?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const data: PrdReadyData = React.useMemo(() => {
    try {
      return JSON.parse(rawJson);
    } catch {
      return {};
    }
  }, [rawJson]);

  const title = data.title || "Dokumen PRD Lengkap Siap Digunakan";
  const appName = data.appName || "Platform Aplikasi";
  const summary =
    data.summary ||
    `Seluruh 13 bagian PRD ${appName}, skema relasional database, diagram alur, dan backlog MVP telah tuntas terverifikasi sesuai standar industri.`;
  const buttonText = data.buttonText || "Download PRD (.md)";

  const cleanPrdMarkdown = React.useMemo(() => {
    const raw = fullContent || "";
    return raw
      .replace(/```(?:prd-ready-json|prd-action-json)[\s\S]*?```/g, "")
      .replace(/```(?:interview-json|discovery-decisions-json|discovery-stage2-json|discovery-final-json|discovery-stage3-json)[\s\S]*?```/g, "")
      .replace(/```(?:designs-json|dribbble-json)[\s\S]*?```/g, "")
      .trim();
  }, [fullContent]);

  const handleDownload = () => {
    if (!cleanPrdMarkdown && onCompilePRD) {
      onCompilePRD();
      return;
    }

    const docText =
      cleanPrdMarkdown ||
      `# Product Requirements Document (PRD)\n\n# ${appName}\n\nDokumen PRD telah berhasil disusun.`;

    // Try extracting clean app name from the document heading
    const titleMatch = docText.match(/#\s*(?:Product Requirements Document\s*\(PRD\)\s*\n+#\s*)?([^\n—\-]+)/i);
    const resolvedName =
      data.appName && data.appName !== "Arsitektur Sistem Terverifikasi"
        ? data.appName
        : titleMatch
        ? titleMatch[1].trim()
        : appName;

    const cleanFileName =
      resolvedName
        .replace(/[^a-zA-Z0-9_\u0600-\u06FF\s-]/g, "")
        .trim()
        .replace(/\s+/g, "_") || "PRD_Dokumen";

    const blob = new Blob([docText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${cleanFileName}_PRD.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    const docText =
      cleanPrdMarkdown ||
      `# Product Requirements Document (PRD)\n\n# ${appName}\n\nDokumen PRD telah berhasil disusun.`;
    try {
      await navigator.clipboard.writeText(docText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn("Failed to copy PRD to clipboard:", err);
    }
  };

  return (
    <div className="not-prose font-sans my-6 rounded-2xl p-5 sm:p-6 space-y-4 max-w-full overflow-hidden text-left">
      {/* Header: Title, Summary, and Industry Standard Badge */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3.5 border-b border-[#282a2d]">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-inner">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
              {title}
            </h4>
            <p className="text-xs text-[#9aa0a6] mt-1 leading-relaxed">
              {summary}
            </p>
          </div>
        </div>

        <span className="self-start sm:self-center text-[11px] font-semibold px-3 py-1 rounded-full text-[#fff] border border-emerald-500/30 flex items-center gap-1.5 shrink-0 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Industry Standard PRD</span>
        </span>
      </div>

      {/* Checklist Items: Formatted as clean pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#dcdcdc] pt-1">
        <div className="flex items-center gap-2.5 bg-[#17181b] border border-[#282a2d] rounded-xl px-3.5 py-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#d97736] shrink-0" />
          <span className="font-medium text-[#f1f3f4]">13 Bagian dokumen PRD standar industri lengkap</span>
        </div>
        <div className="flex items-center gap-2.5 bg-[#17181b] border border-[#282a2d] rounded-xl px-3.5 py-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#d97736] shrink-0" />
          <span className="font-medium text-[#f1f3f4]">Alur flowchart alur sistem & diagram proses</span>
        </div>
        <div className="flex items-center gap-2.5 bg-[#17181b] border border-[#282a2d] rounded-xl px-3.5 py-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#d97736] shrink-0" />
          <span className="font-medium text-[#f1f3f4]">Business rules (BR-01 s/d BR-14) & Acceptance criteria</span>
        </div>
        <div className="flex items-center gap-2.5 bg-[#17181b] border border-[#282a2d] rounded-xl px-3.5 py-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#d97736] shrink-0" />
          <span className="font-medium text-[#f1f3f4]">Skema basis data relasional & Backlog engineering</span>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="pt-3 border-t border-[#282a2d] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
        <p className="text-xs text-[#9aa0a6] text-left leading-relaxed flex-1">
          Dokumen PRD lengkap telah ditulis oleh AI di atas. Silakan unduh berkas Markdown (<code className="text-[#e88b4d] font-mono">.md</code>) atau salin langsung untuk diberikan ke AI coding agent atau tim developer.
        </p>

        <div className="flex items-center gap-2.5 shrink-0 justify-end">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-[#3c4043] bg-[#212224] hover:bg-[#282a2c] active:bg-[#1a1b1d] text-[#f1f3f4] text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer select-none active:scale-[0.98]"
            title="Salin isi PRD ke clipboard"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#9aa0a6]" />
                <span>Salin PRD</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d97736] to-[#e88b4d] hover:from-[#c26629] hover:to-[#d97736] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(217,119,54,0.35)] hover:shadow-[0_0_25px_rgba(217,119,54,0.5)] transition-all cursor-pointer select-none active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>{buttonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

