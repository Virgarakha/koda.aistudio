"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Download,
  Copy,
  Check,
  Folder,
  Send,
  Plus,
  Table as TableIcon,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Minus,
  MessageSquare,
  Undo2,
  Redo2,
  CheckCircle2,
  Zap,
  RotateCcw,
  FileText,
  Share2,
  Cloud,
  Users,
  ExternalLink,
  ShieldCheck,
  Trash2,
  CornerDownRight,
  Tag,
  Clock,
  Filter,
} from "lucide-react";
import {
  PrdDocumentRecord,
  PrdComment,
  PrdCommentReply,
  getPrdDocumentById,
  savePrdDocument,
  generateUniqueDocId,
} from "@/lib/apps/prd-document-storage";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useUserProfile } from "@/hooks/use-user-profile";

export interface RealtimeCollaborator {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  avatarUrl?: string | null;
  isOnline: boolean;
  isSelf?: boolean;
  isAi?: boolean;
  currentSection?: string;
  cursorPos?: {
    x: number;
    y: number;
    sectionName?: string;
    isEditing?: boolean;
    lastActive: number;
  };
  selection?: {
    text: string;
    rects: Array<{ x: number; y: number; width: number; height: number }>;
    lastUpdated?: number;
  } | null;
}

// Markdown to Styled Rich HTML Converter (WYSIWYG representation)
export function markdownToRichHtml(md: string): string {
  if (!md) return "";
  let html = md.trim();

  // Strip JSON blocks (prd-ready-json, etc.)
  html = html.replace(/```(?:prd-ready-json|prd-action-json|interview-json)[\s\S]*?```/g, "");

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, (_m, p1) => {
    const cleanCode = p1.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<pre class="bg-[#161313] border border-[#241f1f] rounded-xl p-4 my-3 font-mono text-xs overflow-x-auto text-[#c4c7c5]"><code>${cleanCode}</code></pre>`;
  });

  // Markdown Tables to HTML Tables
  html = html.replace(/((?:\|[^\n]+\|\r?\n)+)/g, (tableBlock) => {
    const lines = tableBlock.trim().split("\n").filter(Boolean);
    if (lines.length < 2) return tableBlock;
    const headerLine = lines[0];
    const isDivider = lines[1].includes("---") || lines[1].includes("-|-");
    if (!isDivider) return tableBlock;

    const headers = headerLine
      .split("|")
      .filter((_, i, arr) => i > 0 && i < arr.length - 1)
      .map((h) => h.trim());
    const dataRows = lines.slice(2).map((row) =>
      row
        .split("|")
        .filter((_, i, arr) => i > 0 && i < arr.length - 1)
        .map((cell) => cell.trim())
    );

    let tHtml = `<div class="my-4 overflow-x-auto rounded-xl border border-[#241f1f] shadow-sm"><table class="w-full text-left text-xs sm:text-sm border-collapse"><thead class="bg-[#1a1616] text-white border-b border-[#241f1f]"><tr>`;
    headers.forEach((h) => {
      tHtml += `<th class="p-3 font-semibold text-white tracking-wide">${h}</th>`;
    });
    tHtml += `</tr></thead><tbody class="divide-y divide-[#241f1f] bg-[#120f0f]">`;
    dataRows.forEach((row) => {
      tHtml += `<tr class="hover:bg-[#161313] transition">`;
      row.forEach((cell) => {
        tHtml += `<td class="p-3 text-[#dcdcdc]">${cell}</td>`;
      });
      tHtml += `</tr>`;
    });
    tHtml += `</tbody></table></div>`;
    return tHtml;
  });

  // Headings
  html = html.replace(/^#### (.*$)/gim, `<h4 class="text-base font-semibold text-[#f1f3f4] mt-4 mb-2">$1</h4>`);
  html = html.replace(/^### (.*$)/gim, `<h3 class="text-lg font-bold text-[#f1f3f4] mt-5 mb-2">$1</h3>`);
  html = html.replace(/^## (.*$)/gim, `<h2 class="text-xl font-bold text-white mt-6 mb-3 border-b border-[#241f1f] pb-2">$1</h2>`);
  html = html.replace(/^# (.*$)/gim, `<h1 class="text-2xl sm:text-3xl font-extrabold text-white mt-6 mb-3 pb-2 border-b border-[#241f1f]">$1</h1>`);

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, `<strong class="font-bold text-white">$1</strong>`);
  html = html.replace(/\*(.*?)\*/g, `<em class="italic text-[#dcdcdc]">$1</em>`);
  html = html.replace(/~~(.*?)~~/g, `<del class="line-through text-[#80868b]">$1</del>`);

  // Horizontal Rule
  html = html.replace(/^---$/gim, `<hr class="my-6 border-[#241f1f]" />`);

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, `<blockquote class="border-l-4 border-[#408175] pl-4 py-1.5 my-3 italic text-[#c4c7c5] bg-[#141111]/40 rounded-r-lg">$1</blockquote>`);

  // Lists
  html = html.replace(/^[-*] (.*$)/gim, `<li class="my-1 text-[#dcdcdc]">$1</li>`);
  html = html.replace(/((?:<li class="my-1 text-\[#dcdcdc\]">.*<\/li>\s*)+)/g, `<ul class="list-disc pl-6 space-y-1 my-3 text-[#dcdcdc]">$1</ul>`);

  // Paragraphs
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return "";
      if (
        trimmed.startsWith("<h1") ||
        trimmed.startsWith("<h2") ||
        trimmed.startsWith("<h3") ||
        trimmed.startsWith("<h4") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<div") ||
        trimmed.startsWith("<table") ||
        trimmed.startsWith("<pre") ||
        trimmed.startsWith("<hr") ||
        trimmed.startsWith("<blockquote")
      ) {
        return trimmed;
      }
      return `<p class="my-2.5 leading-relaxed text-[#dcdcdc]">${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .filter(Boolean)
    .join("\n");

  return html;
}

// Rich HTML to Standard Markdown Converter (For export, download, and Chat AI context)
export function richHtmlToMarkdown(html: string): string {
  if (!html) return "";
  let text = html;

  // Headings
  text = text.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "# $1\n\n");
  text = text.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "## $1\n\n");
  text = text.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "### $1\n\n");
  text = text.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "#### $1\n\n");

  // Bold & Italic
  text = text.replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, "**$1**");
  text = text.replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, "*$1*");
  text = text.replace(/<(?:del|s|strike)[^>]*>([\s\S]*?)<\/(?:del|s|strike)>/gi, "~~$1~~");

  // Tables
  text = text.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_match, tableBody) => {
    const rows: string[][] = [];
    let headerCells: string[] = [];
    const thMatches = tableBody.match(/<th[^>]*>([\s\S]*?)<\/th>/gi);
    if (thMatches) {
      headerCells = thMatches.map((c: string) => c.replace(/<[^>]+>/g, "").trim());
    }

    const trMatches = tableBody.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
    if (trMatches) {
      trMatches.forEach((tr: string) => {
        const tdMatches = tr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
        if (tdMatches && tdMatches.length > 0) {
          const cells = tdMatches.map((c: string) => c.replace(/<[^>]+>/g, "").trim());
          rows.push(cells);
        }
      });
    }

    if (headerCells.length > 0) {
      let mdTable = "| " + headerCells.join(" | ") + " |\n";
      mdTable += "| " + headerCells.map(() => ":---").join(" | ") + " |\n";
      rows.forEach((r) => {
        mdTable += "| " + r.join(" | ") + " |\n";
      });
      return "\n" + mdTable + "\n";
    }
    return "";
  });

  // Blockquotes
  text = text.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, "> $1\n\n");

  // Lists
  text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n");
  text = text.replace(/<\/?(?:ul|ol)[^>]*>/gi, "\n");

  // Horizontal Rule
  text = text.replace(/<hr[^>]*\/?>/gi, "\n---\n\n");

  // Paragraphs & Divs & Breaks
  text = text.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n");
  text = text.replace(/<br[^>]*\/?>/gi, "\n");
  text = text.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, "$1\n");

  // Strip remaining HTML tags
  text = text.replace(/<[^>]+>/g, "");

  // Unescape common HTML entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

  // Normalize excessive blank lines
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

const DEFAULT_DOC_TITLE = "E-Commerce MVP Warm Earthy — PRD";

const DEFAULT_DOC_HTML = `
<p class="text-sm leading-relaxed text-[#c4c7c5] my-3">
Pilihan yang sangat menarik! Style desain <strong class="font-bold text-white">Warm Earthy & Terracotta (Amber & Stone)</strong> akan memberikan kesan hangat, ramah, dan sangat cocok untuk e-commerce lokal, produk kerajinan, fashion, maupun kuliner. Berikut adalah dokumen Product Requirements Document (PRD) lengkap 13 bagian untuk proyek e-commerce MVP kamu yang sudah disesuaikan dengan seluruh pilihan dan spesifikasi arsitektur yang telah kita tentukan.
</p>

<p class="text-xs text-[#9aa0a6] font-mono border-b border-[#241f1f] pb-2 my-2">
Product Requirements Document (PRD) v1.0<br />
<strong class="text-[#f1f3f4]">Proyek:</strong> Website E-Commerce MVP (Warm Earthy Theme)<br />
<strong class="text-emerald-400">Status:</strong> Siap Eksekusi (Industry Standard)
</p>

<h2 class="text-xl font-bold text-white mt-6 mb-3 border-b border-[#241f1f] pb-2">1. Latar Belakang dan Masalah</h2>

<h3 class="text-lg font-bold text-[#f1f3f4] mt-4 mb-2">1.1 Latar Belakang</h3>
<p class="my-2 leading-relaxed text-[#dcdcdc]">
UMKM dan penjual perorangan membutuhkan platform e-commerce yang ringan, mudah dioperasikan, dan cepat diluncurkan tanpa kompleksitas sistem yang berlebihan.
</p>

<h3 class="text-lg font-bold text-[#f1f3f4] mt-4 mb-2">1.2 Problem Statement</h3>
<p class="my-2 leading-relaxed text-[#dcdcdc]">
Banyak platform e-commerce terlalu rumit untuk bisnis skala kecil, mengakibatkan biaya tinggi, proses pengembangan yang lama, serta kesulitan operasional bagi pemilik toko non-teknis.
</p>

<h3 class="text-lg font-bold text-[#f1f3f4] mt-4 mb-2">1.3 Tujuan Produk</h3>
<p class="my-2 leading-relaxed text-[#dcdcdc]">
Membangun website e-commerce MVP berstandar industri dengan alur transaksi yang jelas, pengelolaan produk yang mudah, serta tampilan visual hangat yang ramah pengguna.
</p>

<h3 class="text-lg font-bold text-[#f1f3f4] mt-4 mb-2">1.4 Batasan Produk</h3>
<ul class="list-disc pl-6 space-y-1.5 my-3 text-[#dcdcdc]">
  <li>Skala target: Ringan (&lt; 500 pengguna aktif bulanan).</li>
  <li>Metode pembayaran: Transfer manual dengan unggah bukti bayar.</li>
  <li>Ekspor laporan: Format PDF standar digital.</li>
</ul>

<h2 class="text-xl font-bold text-white mt-6 mb-3 border-b border-[#241f1f] pb-2">2. Pengguna, Role, dan Hak Akses</h2>
<p class="my-2 leading-relaxed text-[#dcdcdc]">
<strong class="text-white">Pelanggan (Customer):</strong> Mengakses katalog, menambah produk ke keranjang, melakukan checkout, mengisi alamat, mengunggah bukti pembayaran, dan melacak status pesanan.<br />
<strong class="text-white">Admin / Pemilik Toko:</strong> Mengelola produk (tambah/ubah/hapus), mengelola stok barang, memverifikasi bukti pembayaran, memperbarui status pengiriman pesanan, dan mengunduh laporan penjualan PDF.
</p>

<div class="my-4 overflow-x-auto rounded-xl border border-[#241f1f] shadow-sm">
  <table class="w-full text-left text-xs sm:text-sm border-collapse">
    <thead class="bg-[#1a1616] text-white border-b border-[#241f1f]">
      <tr>
        <th class="p-3 font-semibold text-white tracking-wide">Metrik Sasaran (KPI)</th>
        <th class="p-3 font-semibold text-white tracking-wide">Target MVP (Bulan ke-1)</th>
        <th class="p-3 font-semibold text-white tracking-wide">Metode Pengukuran</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-[#241f1f] bg-[#120f0f]">
      <tr class="hover:bg-[#161313] transition">
        <td class="p-3 text-[#dcdcdc]">Tingkat Konversi Checkout</td>
        <td class="p-3 text-[#408175] font-semibold">&gt; 3.5%</td>
        <td class="p-3 text-[#9aa0a6]">Rasio Pengunjung ke Pembelian Berhasil</td>
      </tr>
      <tr class="hover:bg-[#161313] transition">
        <td class="p-3 text-[#dcdcdc]">Waktu Verifikasi Pembayaran Admin</td>
        <td class="p-3 text-[#408175] font-semibold">&lt; 10 Menit</td>
        <td class="p-3 text-[#9aa0a6]">Audit Timestamp Notifikasi</td>
      </tr>
      <tr class="hover:bg-[#161313] transition">
        <td class="p-3 text-[#dcdcdc]">Kecepatan Muat Katalog Produk</td>
        <td class="p-3 text-[#408175] font-semibold">&lt; 1.2 Detik</td>
        <td class="p-3 text-[#9aa0a6]">Google Lighthouse Performance Score</td>
      </tr>
    </tbody>
  </table>
</div>
`;

const COMMENT_TAG_OPTIONS = [
  { label: "Umum", color: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
  { label: "Pembayaran", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  { label: "Arsitektur", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  { label: "Scope", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  { label: "UI/UX", color: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
  { label: "Security", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
];

function getTagColor(tag?: string): string {
  const found = COMMENT_TAG_OPTIONS.find((t) => t.label.toLowerCase() === (tag || "").toLowerCase());
  return found ? found.color : "bg-slate-500/20 text-slate-300 border-slate-500/30";
}

function formatCommentTime(isoString?: string): string {
  if (!isoString) return "Baru saja";
  try {
    const time = new Date(isoString).getTime();
    if (isNaN(time)) return "Baru saja";
    const diff = Date.now() - time;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Baru saja";
    if (mins < 60) return `${mins} mnt lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari lalu`;
  } catch {
    return "Baru saja";
  }
}

// Curated vibrant color palette for multiplayer presence
const DISTINCT_PALETTE = [
  "#e11d48", // Rose Red
  "#2563eb", // Royal Blue
  "#ea580c", // Deep Orange
  "#7c3aed", // Deep Violet
  "#059669", // Emerald Green
  "#db2777", // Pink / Magenta
  "#0891b2", // Cyan
  "#d97706", // Amber
  "#4f46e5", // Indigo
  "#dc2626", // Crimson Red
];

export function getHashColor(str?: string): string {
  if (!str) return DISTINCT_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return DISTINCT_PALETTE[Math.abs(hash) % DISTINCT_PALETTE.length];
}

// Extracts dominant vibrant color from an avatar photo using HTML5 Canvas & Hue Clustering
export function extractDominantColor(
  avatarUrl?: string | null,
  seedName?: string
): Promise<string> {
  return new Promise((resolve) => {
    const fallbackColor = getHashColor(seedName || avatarUrl || "user");
    if (!avatarUrl || typeof window === "undefined") {
      return resolve(fallbackColor);
    }

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 32;
          canvas.height = 32;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) return resolve(fallbackColor);

          ctx.drawImage(img, 0, 0, 32, 32);
          const data = ctx.getImageData(0, 0, 32, 32).data;

          // 12-bin Hue Histogram for dominant color clustering
          const bins = Array.from({ length: 12 }, () => ({
            weight: 0,
            r: 0,
            g: 0,
            b: 0,
            count: 0,
          }));
          let hasSaturated = false;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a < 128) continue;
            const brightness = (r + g + b) / 3;
            // Skip pure darks or pure whites
            if (brightness < 30 || brightness > 235) continue;

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const sat = max === 0 ? 0 : (max - min) / max;
            if (sat < 0.16) continue; // skip gray

            const d = max - min;
            let hue = 0;
            if (d !== 0) {
              if (max === r) hue = ((g - b) / d) % 6;
              else if (max === g) hue = (b - r) / d + 2;
              else hue = (r - g) / d + 4;
              hue = Math.round(hue * 60);
              if (hue < 0) hue += 360;
            }
            const bin = Math.min(11, Math.floor(hue / 30));
            // Boost vibrant saturated pixels
            const pixelWeight = sat * 1.5 * (a / 255);
            bins[bin].weight += pixelWeight;
            bins[bin].r += r;
            bins[bin].g += g;
            bins[bin].b += b;
            bins[bin].count++;
            hasSaturated = true;
          }

          if (!hasSaturated) return resolve(fallbackColor);

          let bestBin = bins[0];
          for (let i = 1; i < 12; i++) {
            if (bins[i].weight > bestBin.weight) {
              bestBin = bins[i];
            }
          }

          if (bestBin.count === 0 || bestBin.weight < 1) return resolve(fallbackColor);
          const avgR = Math.round(bestBin.r / bestBin.count);
          const avgG = Math.round(bestBin.g / bestBin.count);
          const avgB = Math.round(bestBin.b / bestBin.count);

          const toHex = (c: number) => c.toString(16).padStart(2, "0");
          return resolve(`#${toHex(avgR)}${toHex(avgG)}${toHex(avgB)}`);
        } catch {
          return resolve(fallbackColor);
        }
      };

      img.onerror = () => {
        resolve(fallbackColor);
      };

      img.src = avatarUrl;
    } catch {
      resolve(fallbackColor);
    }
  });
}

// Find a DOM Range across text nodes matching target text
export function findRangeForText(root: Node, targetText: string): Range | null {
  if (!targetText || targetText.length < 2) return null;
  const normalizedTarget = targetText.replace(/\s+/g, " ").trim();
  if (!normalizedTarget) return null;

  try {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let fullText = "";
    const nodes: { node: Text; start: number; end: number }[] = [];

    let current: Text | null = null;
    while ((current = walker.nextNode() as Text | null)) {
      const text = current.textContent || "";
      if (text) {
        nodes.push({ node: current, start: fullText.length, end: fullText.length + text.length });
        fullText += text;
      }
    }

    let idx = fullText.indexOf(targetText);
    let matchLen = targetText.length;

    if (idx === -1) {
      idx = fullText.replace(/\s+/g, " ").indexOf(normalizedTarget);
      matchLen = normalizedTarget.length;
      if (idx === -1) return null;
    }

    const targetStart = idx;
    const targetEnd = idx + matchLen;

    let startNode: Text | null = null;
    let startOffset = 0;
    let endNode: Text | null = null;
    let endOffset = 0;

    for (const n of nodes) {
      if (!startNode && targetStart >= n.start && targetStart <= n.end) {
        startNode = n.node;
        startOffset = targetStart - n.start;
      }
      if (targetEnd >= n.start && targetEnd <= n.end) {
        endNode = n.node;
        endOffset = targetEnd - n.start;
        break;
      }
    }

    if (startNode && endNode) {
      const range = document.createRange();
      range.setStart(startNode, Math.min(startOffset, startNode.length));
      range.setEnd(endNode, Math.min(endOffset, endNode.length));
      return range;
    }
  } catch {}
  return null;
}

interface AiChatMessage {
  id: string;
  sender: "user" | "ai";
  content: string;
  appliedAction?: string;
  timestamp: string;
}

export function PrdDocumentEditor({ docId }: { docId?: string }) {
  const router = useRouter();

  // Document states
  const [currentDocId, setCurrentDocId] = useState<string>(docId || "");
  const [docTitle, setDocTitle] = useState(DEFAULT_DOC_TITLE);
  const [appName, setAppName] = useState("E-Commerce MVP");
  const [sourceAppId, setSourceAppId] = useState<string | undefined>();
  const [sourceSessionId, setSourceSessionId] = useState<string | undefined>();
  const [sourceUrl, setSourceUrl] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<"ai" | "comments">("ai");
  const [isSaved, setIsSaved] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(isSupabaseConfigured());
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(420);
  const [lastRemoteSync, setLastRemoteSync] = useState<string | null>(null);

  // Undo / Redo history
  const [history, setHistory] = useState<string[]>([DEFAULT_DOC_HTML]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // AI Assistant states
  const [aiInput, setAiInput] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // Comments state - 100% Dynamic, loaded from DB / storage, Real-time synced
  const [newCommentText, setNewCommentText] = useState("");
  const [selectedCommentTag, setSelectedCommentTag] = useState("Umum");
  const [commentFilter, setCommentFilter] = useState<"all" | "open" | "resolved">("all");
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyInputText, setReplyInputText] = useState<{ [id: string]: string }>({});
  const [aiAnsweringId, setAiAnsweringId] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState("1. Latar Belakang & Masalah");
  const [comments, setComments] = useState<PrdComment[]>([]);
  const commentsRef = useRef<PrdComment[]>([]);

  useEffect(() => {
    commentsRef.current = comments;
  }, [comments]);

  const [aiMessages, setAiMessages] = useState<AiChatMessage[]>([
    {
      id: "m0",
      sender: "ai",
      content:
        "Halo! Saya Koda PRD Architect AI. Dokumen ini terhubung ke database cloud dan memiliki ID unik. Anda dan tim dapat mengedit bersama secara real-time. Setiap instruksi yang Anda berikan di sini akan langsung saya terapkan ke dokumen!",
      timestamp: "Baru saja",
    },
  ]);

  // User Profile for Dynamic Presence
  const { userName, userEmail, avatarUrl } = useUserProfile();
  const effectiveUserName =
    userName ||
    (typeof window !== "undefined" ? localStorage.getItem("koda_user_name") : "") ||
    "Virga Kumara";

  // Dynamic user color: extracted from profile photo or deterministic vibrant hash
  const [myUserColor, setMyUserColor] = useState<string>(() =>
    getHashColor(effectiveUserName || "user")
  );
  const myUserColorRef = useRef<string>(getHashColor(effectiveUserName || "user"));
  const currentSelectionRef = useRef<{
    text: string;
    rects: Array<{ x: number; y: number; width: number; height: number }>;
    lastUpdated?: number;
  } | null>(null);

  // Extract dominant color from avatar photo or update via deterministic hash
  useEffect(() => {
    let isMounted = true;
    extractDominantColor(avatarUrl, effectiveUserName).then((color) => {
      if (isMounted) {
        setMyUserColor(color);
        myUserColorRef.current = color;
        // Update local self color in collaborators
        setCollaborators((prev) =>
          prev.map((c) => (c.isSelf ? { ...c, color } : c))
        );
      }
    });
    return () => {
      isMounted = false;
    };
  }, [avatarUrl, effectiveUserName]);

  // Realtime Collaborators State (Only REAL online users, NO dummy data!)
  const [collaborators, setCollaborators] = useState<RealtimeCollaborator[]>([]);

  const editorRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const editorScrollContainerRef = useRef<HTMLDivElement>(null);
  const myClientIdRef = useRef<string>("");
  const activeChannelRef = useRef<any>(null);
  const isTypingRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize self presence
  useEffect(() => {
    if (!myClientIdRef.current) {
      myClientIdRef.current = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    }
    const myId = myClientIdRef.current;
    const myInitials = effectiveUserName
      ? effectiveUserName
          .split(" ")
          .filter(Boolean)
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "VK";

    setCollaborators((prev) => {
      const others = prev.filter((c) => !c.isSelf);
      const selfUser: RealtimeCollaborator = {
        id: myId,
        name: `${effectiveUserName}`,
        role: "Author",
        initials: myInitials,
        color: myUserColorRef.current,
        avatarUrl: avatarUrl || undefined,
        isOnline: true,
        isSelf: true,
        currentSection: "Dokumen Pembuka",
        selection: currentSelectionRef.current,
      };
      return [selfUser, ...others];
    });
  }, [effectiveUserName, avatarUrl]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Sync document to Supabase database, localStorage, and original Chat app
  const syncDocumentToDatabase = useCallback(
    async (currentHtml: string, currentTitle: string, overrideComments?: PrdComment[]) => {
      if (!currentDocId) return;

      const currentMarkdown = richHtmlToMarkdown(currentHtml);
      setIsSaved(false);

      const targetComments =
        overrideComments !== undefined ? overrideComments : commentsRef.current;

      const record: PrdDocumentRecord = {
        id: currentDocId,
        title: currentTitle,
        appName: appName,
        html: currentHtml,
        markdown: currentMarkdown,
        updatedAt: new Date().toISOString(),
        sourceAppId,
        sourceSessionId,
        sourceUrl,
        comments: targetComments,
      };

      // 1. Save to Supabase and LocalStorage
      await savePrdDocument(record);

      // 2. Sync to original chat session (koda_saved_apps)
      if (typeof window !== "undefined") {
        try {
          const rawApps = localStorage.getItem("koda_saved_apps");
          if (rawApps) {
            const apps = JSON.parse(rawApps);
            let targetApp = null;
            if (sourceAppId) {
              targetApp = apps.find((a: any) => a.id === sourceAppId);
            }
            if (!targetApp && apps.length > 0) {
              targetApp = apps[0];
            }

            if (targetApp && targetApp.messages) {
              let updated = false;
              for (let i = targetApp.messages.length - 1; i >= 0; i--) {
                const msg = targetApp.messages[i];
                if (
                  msg.role === "model" &&
                  (msg.content.includes("prd-ready-json") ||
                    msg.content.includes("Product Requirements Document") ||
                    msg.content.includes("PRD"))
                ) {
                  msg.content = `${currentMarkdown}\n\n\`\`\`prd-ready-json\n{\n  "title": "${currentTitle}",\n  "appName": "${appName}",\n  "status": "ready",\n  "summary": "Dokumen PRD tersinkronisasi dari Database Editor.",\n  "buttonText": "Buka di Editor"\n}\n\`\`\``;
                  updated = true;
                  break;
                }
              }

              if (!updated && targetApp.messages.length > 0) {
                targetApp.messages.push({
                  id: "msg_editor_sync_" + Date.now(),
                  role: "model",
                  content: `### Pembaruan Dokumen PRD dari Database Editor\n\n${currentMarkdown}`,
                  createdAt: new Date().toISOString(),
                });
              }

              targetApp.updatedAt = new Date().toISOString();
              localStorage.setItem("koda_saved_apps", JSON.stringify(apps));
              window.dispatchEvent(new Event("koda_apps_updated"));
            }
          }
        } catch (err) {
          console.warn("Could not sync to chat apps:", err);
        }
      }

      setIsSaved(true);
    },
    [appName, currentDocId, sourceAppId, sourceSessionId, sourceUrl]
  );

  // Initialize and load document from Supabase / localStorage
  useEffect(() => {
    let effectiveId = docId;
    if (!effectiveId) {
      if (typeof window !== "undefined") {
        const parts = window.location.pathname.split("/").filter(Boolean);
        if (parts[1] === "prd-editor" && parts[2]) {
          effectiveId = parts[2];
        }
      }
    }

    if (!effectiveId) {
      effectiveId = generateUniqueDocId("ecommerce-mvp");
      // Update URL without full refresh
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `/tools/prd-editor/${effectiveId}`);
      }
    }

    setCurrentDocId(effectiveId);

    const loadDoc = async () => {
      const existing = await getPrdDocumentById(effectiveId!);
      if (existing) {
        if (existing.title) setDocTitle(existing.title);
        if (existing.appName) setAppName(existing.appName);
        if (existing.sourceAppId) setSourceAppId(existing.sourceAppId);
        if (existing.sourceSessionId) setSourceSessionId(existing.sourceSessionId);
        if (existing.sourceUrl) setSourceUrl(existing.sourceUrl);
        if (existing.comments && Array.isArray(existing.comments)) {
          setComments(existing.comments);
          commentsRef.current = existing.comments;
        }

        if (editorRef.current) {
          if (existing.html && existing.html.trim().length > 20) {
            editorRef.current.innerHTML = existing.html;
            setHistory([existing.html]);
          } else if (existing.markdown) {
            const rich = markdownToRichHtml(existing.markdown);
            editorRef.current.innerHTML = rich;
            setHistory([rich]);
          }
          const words = (editorRef.current.innerText || "").split(/\s+/).filter(Boolean).length;
          setWordCount(words);
        }
      } else {
        // Fallback: check koda_active_prd_doc
        let initialHtml = DEFAULT_DOC_HTML;
        let initialTitle = DEFAULT_DOC_TITLE;
        let initialApp = "E-Commerce MVP";

        if (typeof window !== "undefined") {
          try {
            const active = localStorage.getItem("koda_active_prd_doc");
            if (active) {
              const parsed = JSON.parse(active);
              if (parsed.title) initialTitle = parsed.title;
              if (parsed.appName) initialApp = parsed.appName;
              if (parsed.sourceAppId) setSourceAppId(parsed.sourceAppId);
              if (parsed.sourceSessionId) setSourceSessionId(parsed.sourceSessionId);
              if (parsed.sourceUrl) setSourceUrl(parsed.sourceUrl);
              if (parsed.comments && Array.isArray(parsed.comments)) {
                setComments(parsed.comments);
                commentsRef.current = parsed.comments;
              }

              if (parsed.html && parsed.html.trim().length > 20) {
                initialHtml = parsed.html;
              } else if (parsed.markdown && parsed.markdown.trim().length > 20) {
                initialHtml = markdownToRichHtml(parsed.markdown);
              }
            }
          } catch {}
        }

        setDocTitle(initialTitle);
        setAppName(initialApp);
        if (editorRef.current) {
          editorRef.current.innerHTML = initialHtml;
          setHistory([initialHtml]);
          const words = (editorRef.current.innerText || "").split(/\s+/).filter(Boolean).length;
          setWordCount(words);
        }

        // Persist immediately to Supabase
        savePrdDocument({
          id: effectiveId!,
          title: initialTitle,
          appName: initialApp,
          html: initialHtml,
          markdown: richHtmlToMarkdown(initialHtml),
          updatedAt: new Date().toISOString(),
          comments: [],
        });
      }
    };

    loadDoc();
  }, [docId]);

  // Broadcast local user's cursor & editing activity to other teammates
  const broadcastMyCursor = useCallback(
    (x: number, y: number, sectionName: string, isEditing: boolean) => {
      const clientId = myClientIdRef.current;
      if (!clientId) return;

      const payload = {
        id: clientId,
        name: effectiveUserName,
        role: "Reviewer",
        initials: effectiveUserName.slice(0, 2).toUpperCase(),
        color: myUserColorRef.current,
        avatarUrl,
        x,
        y,
        sectionName,
        isEditing,
        lastActive: Date.now(),
        selection: currentSelectionRef.current,
      };

      // 1. Send via local BroadcastChannel (instant multi-tab synchronization)
      if (typeof window !== "undefined" && (window as any).__prd_bc) {
        try {
          (window as any).__prd_bc.postMessage({ type: "cursor_move", payload });
        } catch {}
      }

      // 2. Send via Supabase Realtime Broadcast
      if (activeChannelRef.current) {
        try {
          activeChannelRef.current.send({
            type: "broadcast",
            event: "cursor_move",
            payload,
          });
        } catch {}
      }
    },
    [effectiveUserName, avatarUrl]
  );

  // Detect local user's cursor position and section inside document
  const handleEditorInteraction = useCallback(
    (e?: React.MouseEvent | React.SyntheticEvent) => {
      if (!editorRef.current || !canvasContainerRef.current) return;
      const containerRect = canvasContainerRef.current.getBoundingClientRect();

      let x = 80;
      let y = 140;
      let isEditing = false;
      let sectionName = "1. Latar Belakang & Masalah";

      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current.contains(sel.anchorNode)) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width > 0 || rect.height > 0 || rect.top > 0) {
          x = Math.max(15, Math.min(containerRect.width - 50, rect.left - containerRect.left));
          y = Math.max(15, rect.top - containerRect.top);
          isEditing = true;
        }

        // Detect current section heading
        let node: Node | null = sel.anchorNode;
        while (node && node !== editorRef.current) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            if (/^H[1-4]$/i.test(el.tagName)) {
              sectionName = el.innerText.trim();
              break;
            }
          }
          if (node.previousSibling) {
            node = node.previousSibling;
          } else {
            node = node.parentElement;
          }
        }
      } else if (e && "clientX" in e) {
        const mouseEv = e as React.MouseEvent;
        x = Math.max(15, Math.min(containerRect.width - 50, mouseEv.clientX - containerRect.left));
        y = Math.max(15, mouseEv.clientY - containerRect.top);
      }

      setCurrentSection(sectionName);

      // Update self in collaborators list
      setCollaborators((prev) =>
        prev.map((c) =>
          c.isSelf
            ? {
                ...c,
                currentSection: sectionName,
                cursorPos: {
                  x,
                  y,
                  sectionName,
                  isEditing,
                  lastActive: Date.now(),
                },
              }
            : c
        )
      );

      broadcastMyCursor(x, y, sectionName, isEditing);
    },
    [broadcastMyCursor]
  );

  // Real-time Text Block Selection (Highlight) Listener — No Delay across tabs & peers!
  useEffect(() => {
    const handleSelectionChange = () => {
      if (!editorRef.current || !canvasContainerRef.current) return;
      const sel = window.getSelection();
      let selectionData: {
        text: string;
        rects: Array<{ x: number; y: number; width: number; height: number }>;
        lastUpdated: number;
      } | null = null;

      if (
        sel &&
        !sel.isCollapsed &&
        sel.rangeCount > 0 &&
        editorRef.current.contains(sel.anchorNode) &&
        editorRef.current.contains(sel.focusNode)
      ) {
        const selectedText = sel.toString();
        if (selectedText.trim().length > 0) {
          const range = sel.getRangeAt(0);
          const clientRects = range.getClientRects();
          if (clientRects.length > 0) {
            const containerRect = canvasContainerRef.current.getBoundingClientRect();
            const rects: Array<{ x: number; y: number; width: number; height: number }> = [];
            for (let i = 0; i < clientRects.length; i++) {
              const r = clientRects[i];
              if (r.width > 0 && r.height > 0) {
                rects.push({
                  x: Math.round(r.left - containerRect.left),
                  y: Math.round(r.top - containerRect.top),
                  width: Math.round(r.width),
                  height: Math.round(r.height),
                });
              }
            }
            if (rects.length > 0) {
              selectionData = {
                text: selectedText,
                rects,
                lastUpdated: Date.now(),
              };
            }
          }
        }
      }

      // Check if selection changed
      const prev = currentSelectionRef.current;
      if (
        (!prev && !selectionData) ||
        (prev &&
          selectionData &&
          prev.text === selectionData.text &&
          prev.rects.length === selectionData.rects.length)
      ) {
        return;
      }

      currentSelectionRef.current = selectionData;

      // Update self in collaborators list
      setCollaborators((prevList) =>
        prevList.map((c) => (c.isSelf ? { ...c, selection: selectionData } : c))
      );

      // Broadcast immediately (real-time zero latency)
      const payload = {
        id: myClientIdRef.current,
        name: effectiveUserName,
        color: myUserColorRef.current,
        avatarUrl,
        selection: selectionData,
      };

      if (typeof window !== "undefined" && (window as any).__prd_bc) {
        try {
          (window as any).__prd_bc.postMessage({ type: "selection_change", payload });
        } catch {}
      }

      if (activeChannelRef.current) {
        try {
          activeChannelRef.current.send({
            type: "broadcast",
            event: "selection_change",
            payload,
          });
        } catch {}
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [effectiveUserName, avatarUrl]);

  // Jump to collaborator's active editing position when their avatar is clicked
  const handleJumpToCollaborator = useCallback((collab: RealtimeCollaborator) => {
    if (!collab.cursorPos || !editorScrollContainerRef.current) {
      triggerToast(`📍 ${collab.name} sedang online di dokumen`);
      return;
    }
    const targetY = Math.max(0, collab.cursorPos.y - 120);
    editorScrollContainerRef.current.scrollTo({
      top: targetY,
      behavior: "smooth",
    });
    triggerToast(
      `📍 Melompat ke kursor ${collab.name}: ${collab.cursorPos.sectionName || "Posisi Edit"}`
    );
  }, []);

  // Real-time team collaboration: Supabase channel + BroadcastChannel + Presence + Polling
  useEffect(() => {
    if (!currentDocId) return;

    if (!myClientIdRef.current) {
      myClientIdRef.current = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    }
    const myClientId = myClientIdRef.current;

    // 1. Native BroadcastChannel for zero-latency multi-tab test on the same browser
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel(`team_prd_bc_${currentDocId}`);
      (window as any).__prd_bc = bc;

      bc.onmessage = (ev) => {
        if (!ev.data) return;
        const { type, payload: p } = ev.data;
        if (!p || p.senderId === myClientId || p.id === myClientId) return;

        if (type === "comment_event") {
          if (p.action === "add" && p.comment) {
            setComments((prev) => {
              if (prev.some((c) => c.id === p.comment.id)) return prev;
              const next = [p.comment, ...prev];
              commentsRef.current = next;
              return next;
            });
            triggerToast(`💬 ${p.comment.author} menambahkan catatan review`);
          } else if (p.action === "reply" && p.commentId && p.reply) {
            setComments((prev) => {
              const next = prev.map((c) =>
                c.id === p.commentId
                  ? {
                      ...c,
                      replies: c.replies?.some((r) => r.id === p.reply.id)
                        ? c.replies
                        : [...(c.replies || []), p.reply],
                    }
                  : c
              );
              commentsRef.current = next;
              return next;
            });
            triggerToast(`💬 Balasan baru dari ${p.reply.author}`);
          } else if (p.action === "resolve" && p.commentId) {
            setComments((prev) => {
              const next = prev.map((c) =>
                c.id === p.commentId ? { ...c, resolved: p.resolved } : c
              );
              commentsRef.current = next;
              return next;
            });
          } else if (p.action === "delete" && p.commentId) {
            setComments((prev) => {
              const next = prev.filter((c) => c.id !== p.commentId);
              commentsRef.current = next;
              return next;
            });
          }
          return;
        }

        if (type === "selection_change" && p) {
          if (p.id === myClientId) return;
          setCollaborators((prev) => {
            const exists = prev.find((c) => c.id === p.id);
            if (exists) {
              return prev.map((c) =>
                c.id === p.id
                  ? {
                      ...c,
                      name: p.name || c.name,
                      color: p.color || c.color,
                      avatarUrl: p.avatarUrl !== undefined ? p.avatarUrl : c.avatarUrl,
                      selection: p.selection,
                    }
                  : c
              );
            } else {
              return [
                {
                  id: p.id,
                  name: p.name || "Anggota Tim",
                  role: "Collaborator",
                  initials: p.name?.slice(0, 2).toUpperCase() || "TM",
                  color: p.color || getHashColor(p.name),
                  avatarUrl: p.avatarUrl,
                  isOnline: true,
                  currentSection: "Dokumen",
                  selection: p.selection,
                },
                ...prev,
              ];
            }
          });
          return;
        }

        if (type === "leave") {
          setCollaborators((prev) => prev.filter((c) => c.id !== p.id));
          return;
        }

        if (type === "join" || type === "ping") {
          // Reply announce so the other tab discovers us instantly
          try {
            bc?.postMessage({
              type: "announce",
              payload: {
                id: myClientId,
                name: effectiveUserName,
                initials: effectiveUserName.slice(0, 2).toUpperCase(),
                color: myUserColorRef.current,
                avatarUrl,
                sectionName: "Dokumen",
                selection: currentSelectionRef.current,
              },
            });
          } catch {}
        }

        if (type === "cursor_move" || type === "join" || type === "ping" || type === "announce") {
          setCollaborators((prev) => {
            const exists = prev.find((c) => c.id === p.id);
            if (exists) {
              return prev.map((c) =>
                c.id === p.id
                  ? {
                      ...c,
                      name: p.name || c.name,
                      initials: p.initials || c.initials,
                      color: p.color || c.color,
                      avatarUrl: p.avatarUrl !== undefined ? p.avatarUrl : c.avatarUrl,
                      isOnline: true,
                      currentSection: p.sectionName || c.currentSection,
                      cursorPos:
                        p.x !== undefined && p.y !== undefined
                          ? {
                              x: p.x,
                              y: p.y,
                              sectionName: p.sectionName || c.currentSection,
                              isEditing: !!p.isEditing,
                              lastActive: Date.now(),
                            }
                          : c.cursorPos,
                      selection: p.selection !== undefined ? p.selection : c.selection,
                    }
                  : c
              );
            } else {
              const newCollab: RealtimeCollaborator = {
                id: p.id,
                name: p.name || "Anggota Tim",
                role: "Collaborator",
                initials: p.initials || p.name?.slice(0, 2).toUpperCase() || "TM",
                color: p.color || getHashColor(p.name),
                avatarUrl: p.avatarUrl,
                isOnline: true,
                currentSection: p.sectionName || "Dokumen",
                cursorPos:
                  p.x !== undefined && p.y !== undefined
                    ? {
                        x: p.x,
                        y: p.y,
                        sectionName: p.sectionName,
                        isEditing: !!p.isEditing,
                        lastActive: Date.now(),
                      }
                    : undefined,
                selection: p.selection || null,
              };
              return [...prev, newCollab];
            }
          });
        }
      };
    }

    // 2. Supabase Realtime Channel
    let channel: any = null;
    let interval: NodeJS.Timeout | null = null;

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      channel = supabase.channel(`team_prd_${currentDocId}`, {
        config: {
          broadcast: { ack: false, self: false },
          presence: { key: myClientId },
        },
      });
      activeChannelRef.current = channel;

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          const onlineKeys = Object.keys(state);
          onlineKeys.forEach((key) => {
            const presences = state[key] as any[];
            if (presences && presences.length > 0) {
              const p = presences[0];
              if (p.id === myClientId) return;
              setCollaborators((prev) => {
                if (prev.some((c) => c.id === p.id)) {
                  return prev.map((c) =>
                    c.id === p.id
                      ? {
                          ...c,
                          color: p.color || c.color,
                          avatarUrl: p.avatarUrl !== undefined ? p.avatarUrl : c.avatarUrl,
                        }
                      : c
                  );
                }
                return [
                  {
                    id: p.id,
                    name: p.name || "Teammate",
                    role: p.role || "Member",
                    initials: p.initials || "TM",
                    color: p.color || getHashColor(p.name),
                    avatarUrl: p.avatarUrl,
                    isOnline: true,
                    currentSection: p.currentSection || "Dokumen",
                    cursorPos: {
                      x: 120,
                      y: 240,
                      sectionName: p.currentSection,
                      isEditing: false,
                      lastActive: Date.now(),
                    },
                    selection: null,
                  },
                  ...prev,
                ];
              });
            }
          });
        })
        .on("broadcast", { event: "selection_change" }, ({ payload }: any) => {
          if (!payload || payload.id === myClientId) return;
          setCollaborators((prev) => {
            const exists = prev.find((c) => c.id === payload.id);
            if (exists) {
              return prev.map((c) =>
                c.id === payload.id
                  ? {
                      ...c,
                      name: payload.name || c.name,
                      color: payload.color || c.color,
                      avatarUrl: payload.avatarUrl !== undefined ? payload.avatarUrl : c.avatarUrl,
                      selection: payload.selection,
                    }
                  : c
              );
            } else {
              return [
                {
                  id: payload.id,
                  name: payload.name || "Anggota Tim",
                  role: "Collaborator",
                  initials: payload.name?.slice(0, 2).toUpperCase() || "TM",
                  color: payload.color || getHashColor(payload.name),
                  avatarUrl: payload.avatarUrl,
                  isOnline: true,
                  currentSection: "Dokumen",
                  selection: payload.selection,
                },
                ...prev,
              ];
            }
          });
        })
        .on("broadcast", { event: "cursor_move" }, ({ payload }: any) => {
          if (!payload || payload.id === myClientId) return;
          setCollaborators((prev) => {
            const exists = prev.find((c) => c.id === payload.id);
            if (exists) {
              return prev.map((c) =>
                c.id === payload.id
                  ? {
                      ...c,
                      name: payload.name || c.name,
                      color: payload.color || c.color,
                      avatarUrl: payload.avatarUrl !== undefined ? payload.avatarUrl : c.avatarUrl,
                      isOnline: true,
                      currentSection: payload.sectionName,
                      cursorPos: {
                        x: payload.x,
                        y: payload.y,
                        sectionName: payload.sectionName,
                        isEditing: payload.isEditing,
                        lastActive: Date.now(),
                      },
                      selection:
                        payload.selection !== undefined ? payload.selection : c.selection,
                    }
                  : c
              );
            } else {
              return [
                {
                  id: payload.id,
                  name: payload.name,
                  role: payload.role || "Team Member",
                  initials: payload.initials || payload.name.slice(0, 2).toUpperCase(),
                  color: payload.color || getHashColor(payload.name),
                  avatarUrl: payload.avatarUrl,
                  isOnline: true,
                  currentSection: payload.sectionName,
                  cursorPos: {
                    x: payload.x,
                    y: payload.y,
                    sectionName: payload.sectionName,
                    isEditing: payload.isEditing,
                    lastActive: Date.now(),
                  },
                  selection: payload.selection || null,
                },
                ...prev,
              ];
            }
          });
        })
        .on("broadcast", { event: "comment_event" }, ({ payload }: any) => {
          if (!payload || payload.senderId === myClientId) return;
          if (payload.action === "add" && payload.comment) {
            setComments((prev) => {
              if (prev.some((c) => c.id === payload.comment.id)) return prev;
              const next = [payload.comment, ...prev];
              commentsRef.current = next;
              return next;
            });
            triggerToast(`💬 ${payload.comment.author} menambahkan catatan review`);
          } else if (payload.action === "reply" && payload.commentId && payload.reply) {
            setComments((prev) => {
              const next = prev.map((c) =>
                c.id === payload.commentId
                  ? {
                      ...c,
                      replies: c.replies?.some((r) => r.id === payload.reply.id)
                        ? c.replies
                        : [...(c.replies || []), payload.reply],
                    }
                  : c
              );
              commentsRef.current = next;
              return next;
            });
            triggerToast(`💬 Balasan baru dari ${payload.reply.author}`);
          } else if (payload.action === "resolve" && payload.commentId) {
            setComments((prev) => {
              const next = prev.map((c) =>
                c.id === payload.commentId ? { ...c, resolved: payload.resolved } : c
              );
              commentsRef.current = next;
              return next;
            });
          } else if (payload.action === "delete" && payload.commentId) {
            setComments((prev) => {
              const next = prev.filter((c) => c.id !== payload.commentId);
              commentsRef.current = next;
              return next;
            });
          }
        })
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "apps",
            filter: `id=eq.${currentDocId}`,
          },
          (payload: any) => {
            if (!payload.new) return;
            const remoteDoc =
              Array.isArray(payload.new.messages) && payload.new.messages.length > 0
                ? payload.new.messages[0]
                : null;
            if (remoteDoc) {
              if (remoteDoc.comments && Array.isArray(remoteDoc.comments)) {
                setComments(remoteDoc.comments);
                commentsRef.current = remoteDoc.comments;
              }
              if (remoteDoc.html && editorRef.current && !isTypingRef.current) {
                if (editorRef.current.innerHTML !== remoteDoc.html) {
                  editorRef.current.innerHTML = remoteDoc.html;
                  setLastRemoteSync(new Date().toLocaleTimeString());
                  triggerToast("👥 Pembaruan dari anggota tim berhasil disinkronkan secara real-time!");
                }
              }
            }
          }
        )
        .subscribe(async (status: string) => {
          if (status === "SUBSCRIBED") {
            try {
              await channel.track({
                id: myClientId,
                name: effectiveUserName,
                initials: effectiveUserName.slice(0, 2).toUpperCase(),
                role: "Product",
                color: myUserColorRef.current,
                avatarUrl,
                onlineAt: new Date().toISOString(),
                currentSection: "Dokumen Pembuka",
              });
            } catch {}
          }
        });

      // 3. Periodic sync check (heartbeat every 6 seconds)
      interval = setInterval(async () => {
        if (isTypingRef.current) return;
        try {
          const { data } = await supabase
            .from("apps")
            .select("title, updated_at, messages")
            .eq("id", currentDocId)
            .maybeSingle();

          if (data && data.messages && data.messages[0]) {
            const remoteDoc = data.messages[0];
            if (remoteDoc.comments && Array.isArray(remoteDoc.comments)) {
              setComments((prev) => {
                if (JSON.stringify(prev) !== JSON.stringify(remoteDoc.comments)) {
                  commentsRef.current = remoteDoc.comments;
                  return remoteDoc.comments;
                }
                return prev;
              });
            }
            if (remoteDoc.html && editorRef.current) {
              if (editorRef.current.innerHTML !== remoteDoc.html) {
                editorRef.current.innerHTML = remoteDoc.html;
                if (data.title) setDocTitle(data.title);
                setLastRemoteSync(new Date().toLocaleTimeString());
              }
            }
          }
        } catch {}
      }, 6000);
    }

      // Handle beforeunload to notify other tabs/clients immediately when closing
      const handleUnload = () => {
        try {
          bc?.postMessage({ type: "leave", payload: { id: myClientId } });
          if (channel) {
            channel.send({
              type: "broadcast",
              event: "user_leave",
              payload: { id: myClientId },
            });
            channel.untrack();
          }
        } catch {}
      };

      window.addEventListener("beforeunload", handleUnload);

      // Heartbeat ping & stale collaborator cleanup every 6 seconds
      const heartbeatInterval = setInterval(() => {
        try {
          bc?.postMessage({
            type: "ping",
            payload: {
              id: myClientId,
              name: effectiveUserName,
              initials: effectiveUserName.slice(0, 2).toUpperCase(),
              color: myUserColorRef.current,
              avatarUrl,
              selection: currentSelectionRef.current,
            },
          });
        } catch {}

        // Remove inactive peers if no ping received within 25 seconds
        const cutoff = Date.now() - 25000;
        setCollaborators((prev) =>
          prev.filter((c) => c.isSelf || (c.cursorPos?.lastActive && c.cursorPos.lastActive > cutoff))
        );
      }, 6000);

      // Announce arrival to other tabs
      try {
        bc?.postMessage({
          type: "join",
          payload: {
            id: myClientId,
            name: effectiveUserName,
            initials: effectiveUserName.slice(0, 2).toUpperCase(),
            color: myUserColorRef.current,
            avatarUrl,
            selection: currentSelectionRef.current,
          },
        });
      } catch {}

      return () => {
        handleUnload();
        window.removeEventListener("beforeunload", handleUnload);
        clearInterval(heartbeatInterval);
        if (bc) bc.close();
        if (interval) clearInterval(interval);
        if (channel && isSupabaseConfigured()) {
          const supabase = createClient();
          supabase.removeChannel(channel);
        }
      };
  }, [currentDocId, effectiveUserName, avatarUrl]);

  // Handle typing inside WYSIWYG editor
  const handleEditorInput = () => {
    if (!editorRef.current) return;
    isTypingRef.current = true;
    const currentHtml = editorRef.current.innerHTML;
    setIsSaved(false);

    // Update word count
    const words = (editorRef.current.innerText || "").split(/\s+/).filter(Boolean).length;
    setWordCount(words);

    // Broadcast cursor & editing position
    handleEditorInteraction();

    // Record history
    if (history[historyIndex] !== currentHtml) {
      const nextHistory = history.slice(0, historyIndex + 1);
      if (nextHistory.length >= 25) nextHistory.shift();
      nextHistory.push(currentHtml);
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
    }

    // Debounced database sync (750ms after typing stops)
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      syncDocumentToDatabase(currentHtml, docTitle);
    }, 750);
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0 && editorRef.current) {
      const prevHtml = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      editorRef.current.innerHTML = prevHtml;
      syncDocumentToDatabase(prevHtml, docTitle);
      triggerToast("↩️ Undo berhasil");
    } else {
      document.execCommand("undo");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1 && editorRef.current) {
      const nextHtml = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      editorRef.current.innerHTML = nextHtml;
      syncDocumentToDatabase(nextHtml, docTitle);
      triggerToast("↪️ Redo berhasil");
    } else {
      document.execCommand("redo");
    }
  };

  // Rich text formatting commands
  const executeFormat = (command: string, value: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    handleEditorInput();
  };

  // Insert Table into caret
  const handleInsertTable = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    const tableHtml = `
<div class="my-4 overflow-x-auto rounded-xl border border-[#241f1f] shadow-sm">
  <table class="w-full text-left text-xs sm:text-sm border-collapse">
    <thead class="bg-[#1a1616] text-white border-b border-[#241f1f]">
      <tr>
        <th class="p-3 font-semibold text-white">Komponen Sistem</th>
        <th class="p-3 font-semibold text-white">Prioritas Tim</th>
        <th class="p-3 font-semibold text-white">Catatan Kolaborasi</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-[#241f1f] bg-[#120f0f]">
      <tr>
        <td class="p-3 text-[#dcdcdc]">Katalog Produk & Filter</td>
        <td class="p-3 text-[#408175] font-semibold">P0 (Must Have)</td>
        <td class="p-3 text-[#9aa0a6]">Penyaringan cepat di sisi client</td>
      </tr>
      <tr>
        <td class="p-3 text-[#dcdcdc]">Checkout & Upload Transfer</td>
        <td class="p-3 text-[#408175] font-semibold">P0 (Must Have)</td>
        <td class="p-3 text-[#9aa0a6]">Metode transfer manual dengan webhook notifikasi</td>
      </tr>
      <tr>
        <td class="p-3 text-[#dcdcdc]">Dashboard Admin & Laporan PDF</td>
        <td class="p-3 text-[#B5B9F0] font-semibold">P1 (Should Have)</td>
        <td class="p-3 text-[#9aa0a6]">Verifikasi mutasi dan cetak laporan penjualan</td>
      </tr>
    </tbody>
  </table>
</div>
<p class="my-2 leading-relaxed text-[#dcdcdc]"><br /></p>
`;

    document.execCommand("insertHTML", false, tableHtml);
    handleEditorInput();
    triggerToast("📊 Tabel baru berhasil disisipkan dan tersimpan ke database!");
  };

  // AI REALTIME DIRECT EDITING
  const applyAiDirectEdit = (
    actionName: string,
    htmlSnippet: string,
    aiExplanation: string
  ) => {
    if (!editorRef.current) return;
    setIsAiProcessing(true);

    setTimeout(() => {
      if (!editorRef.current) return;

      const wrapperId = "ai_applied_" + Date.now();
      const wrappedSnippet = `<div id="${wrapperId}" class="transition-all duration-700 ring-2 ring-[#408175] bg-[#408175]/10 rounded-xl p-3 my-4 animate-in fade-in">${htmlSnippet}</div>`;

      editorRef.current.innerHTML += wrappedSnippet;

      // Smooth scroll to the newly modified section
      setTimeout(() => {
        const el = document.getElementById(wrapperId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => {
            el.classList.remove("ring-2", "ring-[#408175]", "bg-[#408175]/10", "p-3");
          }, 2500);
        }
      }, 100);

      handleEditorInput();
      setIsAiProcessing(false);

      // Add to AI chat thread
      const aiMsg: AiChatMessage = {
        id: "ai_" + Date.now(),
        sender: "ai",
        content: `⚡ Selesai! Saya telah langsung memperbarui dokumen PRD: ${aiExplanation}. Data otomatis tersimpan di database untuk seluruh anggota tim.`,
        appliedAction: actionName,
        timestamp: "Baru saja",
      };
      setAiMessages((prev) => [...prev, aiMsg]);

      triggerToast(`✨ Real-time edit diterapkan: ${actionName}`);
    }, 600);
  };

  // Quick Action Chips Trigger
  const handleQuickAiAction = (type: string) => {
    if (type === "moscow") {
      const snippet = `
<h2 class="text-xl font-bold text-white mt-6 mb-3 border-b border-[#241f1f] pb-2">Matriks Prioritas Fitur (MoSCoW Framework)</h2>
<div class="my-4 overflow-x-auto rounded-xl border border-[#241f1f] shadow-sm">
  <table class="w-full text-left text-xs sm:text-sm border-collapse">
    <thead class="bg-[#1a1616] text-white border-b border-[#241f1f]">
      <tr>
        <th class="p-3 font-semibold text-white">Kategori</th>
        <th class="p-3 font-semibold text-white">Fitur & Kebutuhan</th>
        <th class="p-3 font-semibold text-white">Justifikasi Bisnis & Teknis</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-[#241f1f] bg-[#120f0f]">
      <tr>
        <td class="p-3 text-emerald-400 font-bold">Must Have (P0)</td>
        <td class="p-3 text-[#f1f3f4]">Katalog produk responsif & keranjang belanja</td>
        <td class="p-3 text-[#9aa0a6]">Pilar esensial agar transaksi e-commerce dapat terjadi</td>
      </tr>
      <tr>
        <td class="p-3 text-emerald-400 font-bold">Must Have (P0)</td>
        <td class="p-3 text-[#f1f3f4]">Form checkout & unggah bukti transfer perbankan</td>
        <td class="p-3 text-[#9aa0a6]">Metode bayar tervalidasi untuk UMKM tanpa biaya gateway</td>
      </tr>
      <tr>
        <td class="p-3 text-blue-400 font-bold">Should Have (P1)</td>
        <td class="p-3 text-[#f1f3f4]">Dashboard verifikasi pesanan & unduh laporan PDF</td>
        <td class="p-3 text-[#9aa0a6]">Memudahkan rekapitulasi harian bagi pemilik bisnis</td>
      </tr>
      <tr>
        <td class="p-3 text-purple-400 font-bold">Could Have (P2)</td>
        <td class="p-3 text-[#f1f3f4]">Integrasi cek ongkos kirim otomatis (RajaOngkir)</td>
        <td class="p-3 text-[#9aa0a6]">Peningkatan kenyamanan checkout pelanggan antarkota</td>
      </tr>
      <tr>
        <td class="p-3 text-rose-400 font-bold">Won't Have (P3)</td>
        <td class="p-3 text-[#f1f3f4]">Multi-vendor marketplace & split balance escrow</td>
        <td class="p-3 text-[#9aa0a6]">Ditunda ke rilis Fase 2 setelah MVP tervalidasi pasar</td>
      </tr>
    </tbody>
  </table>
</div>
`;
      applyAiDirectEdit(
        "Tabel Matriks MoSCoW",
        snippet,
        "Menambahkan tabel matriks prioritas MoSCoW lengkap dengan justifikasi bisnis."
      );
    } else if (type === "security") {
      const snippet = `
<h2 class="text-xl font-bold text-white mt-6 mb-3 border-b border-[#241f1f] pb-2">Spesifikasi Keamanan & Pencegahan Fraud</h2>
<ul class="list-disc pl-6 space-y-2 my-3 text-[#dcdcdc]">
  <li><strong class="text-white">Validasi Bukti Pembayaran:</strong> Berkas gambar struk transfer dibatasi maksimum 3 MB, hanya format JPEG/PNG/WebP, dan dipindai secara otomatis.</li>
  <li><strong class="text-white">Idempotency Checkout:</strong> Setiap transaksi checkout menghasilkan token UUID v7 unik untuk mencegah double-order akibat klik ganda pelanggan.</li>
  <li><strong class="text-white">Rate Limiting & Anti-Spam:</strong> Maksimal 5 permintaan checkout per menit per alamat IP untuk mencegah bot order palsu.</li>
  <li><strong class="text-white">Otorisasi Panel Admin:</strong> Autentikasi berbasis session token terenkripsi HTTPS dengan auto-logout setelah 60 menit inaktif.</li>
</ul>
`;
      applyAiDirectEdit(
        "Spesifikasi Keamanan & Anti-Fraud",
        snippet,
        "Menambahkan bab spesifikasi keamanan, sanitasi berkas bukti bayar, dan proteksi transaksi."
      );
    } else if (type === "gherkin") {
      const snippet = `
<h2 class="text-xl font-bold text-white mt-6 mb-3 border-b border-[#241f1f] pb-2">Kriteria Penerimaan (Acceptance Criteria - Gherkin)</h2>

<h3 class="text-lg font-bold text-[#f1f3f4] mt-3 mb-1.5">Skenario 1: Pelanggan Menyelesaikan Checkout dengan Sukses</h3>
<blockquote class="border-l-4 border-[#408175] pl-4 py-1.5 my-2 italic text-[#c4c7c5] bg-[#141111]/40 rounded-r-lg">
  <strong>Given:</strong> Pelanggan memiliki minimal 1 produk di dalam keranjang belanja<br />
  <strong>When:</strong> Pelanggan mengisi nama, nomor WhatsApp, alamat pengiriman, dan memilih "Transfer BCA"<br />
  <strong>And:</strong> Mengunggah berkas foto bukti bayar yang valid lalu menekan "Konfirmasi Pesanan"<br />
  <strong>Then:</strong> Sistem mencatat status pesanan sebagai "Menunggu Verifikasi"<br />
  <strong>And:</strong> Menampilkan halaman invoice dengan nomor pesanan unik dan tombol pintas WhatsApp penjual
</blockquote>
`;
      applyAiDirectEdit(
        "Acceptance Criteria Gherkin",
        snippet,
        "Menambahkan kriteria penerimaan terstandar format Gherkin untuk memandu QA dan Engineering."
      );
    } else if (type === "sprint") {
      const snippet = `
<h2 class="text-xl font-bold text-white mt-6 mb-3 border-b border-[#241f1f] pb-2">Jadwal Rilis & Milestone Sprint (4 Minggu MVP)</h2>
<div class="my-4 overflow-x-auto rounded-xl border border-[#241f1f] shadow-sm">
  <table class="w-full text-left text-xs sm:text-sm border-collapse">
    <thead class="bg-[#1a1616] text-white border-b border-[#241f1f]">
      <tr>
        <th class="p-3 font-semibold text-white">Sprint</th>
        <th class="p-3 font-semibold text-white">Durasi</th>
        <th class="p-3 font-semibold text-white">Sasaran Utama (Deliverables)</th>
        <th class="p-3 font-semibold text-white">Status</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-[#241f1f] bg-[#120f0f]">
      <tr>
        <td class="p-3 font-bold text-white">Sprint 1</td>
        <td class="p-3 text-[#9aa0a6]">Minggu 1</td>
        <td class="p-3 text-[#dcdcdc]">Setup skema PostgreSQL, katalog produk, dan UI responsif tema Warm Earthy</td>
        <td class="p-3 text-emerald-400 font-semibold">Tuntas</td>
      </tr>
      <tr>
        <td class="p-3 font-bold text-white">Sprint 2</td>
        <td class="p-3 text-[#9aa0a6]">Minggu 2</td>
        <td class="p-3 text-[#dcdcdc]">Modul keranjang belanja, form checkout, dan upload bukti transfer</td>
        <td class="p-3 text-blue-400 font-semibold">Dalam Pengerjaan</td>
      </tr>
    </tbody>
  </table>
</div>
`;
      applyAiDirectEdit(
        "Milestone Sprint Planning",
        snippet,
        "Menyisipkan tabel timeline sprint 4-mingguan lengkap dengan deliverables terukur."
      );
    } else {
      const snippet = `
<h2 class="text-xl font-bold text-white mt-6 mb-3 border-b border-[#241f1f] pb-2">Spesifikasi Skema Database Relasional (PostgreSQL)</h2>
<div class="my-4 overflow-x-auto rounded-xl border border-[#241f1f] shadow-sm">
  <table class="w-full text-left text-xs sm:text-sm border-collapse">
    <thead class="bg-[#1a1616] text-white border-b border-[#241f1f]">
      <tr>
        <th class="p-3 font-semibold text-white">Nama Tabel</th>
        <th class="p-3 font-semibold text-white">Kolom Kunci & Tipe Data</th>
        <th class="p-3 font-semibold text-white">Relasi & Constraint</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-[#241f1f] bg-[#120f0f]">
      <tr>
        <td class="p-3 font-mono text-emerald-400">products</td>
        <td class="p-3 text-[#dcdcdc]">id (UUID), name (VARCHAR), price (NUMERIC), stock (INT), images (TEXT[])</td>
        <td class="p-3 text-[#9aa0a6]">PRIMARY KEY (id), CHECK (price &gt;= 0)</td>
      </tr>
      <tr>
        <td class="p-3 font-mono text-emerald-400">orders</td>
        <td class="p-3 text-[#dcdcdc]">id (UUID), customer_name (VARCHAR), total_amount (NUMERIC), status (ENUM)</td>
        <td class="p-3 text-[#9aa0a6]">status in ('pending', 'paid', 'shipped', 'cancelled')</td>
      </tr>
    </tbody>
  </table>
</div>
`;
      applyAiDirectEdit(
        "Skema Database Relasional",
        snippet,
        "Menambahkan tabel spesifikasi basis data PostgreSQL dengan constraint integritas relasional."
      );
    }
  };

  // Custom AI Prompt Submit
  const handleCustomAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userPrompt = aiInput.trim();
    setAiInput("");

    // Append user message
    const userMsg: AiChatMessage = {
      id: "u_" + Date.now(),
      sender: "user",
      content: userPrompt,
      timestamp: "Baru saja",
    };
    setAiMessages((prev) => [...prev, userMsg]);

    let title = "Tambahan: " + userPrompt.slice(0, 30);
    let htmlContent = `
<h2 class="text-xl font-bold text-white mt-6 mb-3 border-b border-[#241f1f] pb-2">Bagian PRD: ${userPrompt}</h2>
<p class="my-2.5 leading-relaxed text-[#dcdcdc]">
Berdasarkan permintaan Anda, bagian ini telah diperbarui untuk mencakup kebutuhan operasional dan teknis secara terperinci:
</p>
<ul class="list-disc pl-6 space-y-1.5 my-3 text-[#dcdcdc]">
  <li><strong class="text-white">Implementasi:</strong> ${userPrompt}</li>
  <li><strong class="text-white">Standar Sistem:</strong> Mematuhi arsitektur standar industri dengan jaminan performa responsif &lt; 200ms.</li>
  <li><strong class="text-white">Penanganan Edge Case:</strong> Otomatis melakukan fallback jika service eksternal mengalami timeout atau gangguan koneksi.</li>
</ul>
`;

    if (userPrompt.toLowerCase().includes("tabel") || userPrompt.toLowerCase().includes("table")) {
      htmlContent = `
<h2 class="text-xl font-bold text-white mt-6 mb-3 border-b border-[#241f1f] pb-2">Tabel Spesifikasi: ${userPrompt}</h2>
<div class="my-4 overflow-x-auto rounded-xl border border-[#241f1f] shadow-sm">
  <table class="w-full text-left text-xs sm:text-sm border-collapse">
    <thead class="bg-[#1a1616] text-white border-b border-[#241f1f]">
      <tr>
        <th class="p-3 font-semibold text-white">Parameter</th>
        <th class="p-3 font-semibold text-white">Deskripsi Kebutuhan</th>
        <th class="p-3 font-semibold text-white">Standar Validasi</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-[#241f1f] bg-[#120f0f]">
      <tr>
        <td class="p-3 font-semibold text-white">Kebutuhan Fungsional</td>
        <td class="p-3 text-[#dcdcdc]">${userPrompt}</td>
        <td class="p-3 text-[#408175]">Lolos Uji Acceptance Test</td>
      </tr>
      <tr>
        <td class="p-3 font-semibold text-white">Penanganan Kegagalan</td>
        <td class="p-3 text-[#dcdcdc]">Pesan error interaktif dengan instruksi perbaikan</td>
        <td class="p-3 text-[#9aa0a6]">HTTP 422 / 400 Bad Request</td>
      </tr>
    </tbody>
  </table>
</div>
`;
    }

    applyAiDirectEdit(title, htmlContent, `menambahkan bagian '${userPrompt}' langsung ke dokumen.`);
  };

  // Copy document markdown
  const handleCopyMarkdown = async () => {
    if (!editorRef.current) return;
    try {
      const md = richHtmlToMarkdown(editorRef.current.innerHTML);
      await navigator.clipboard.writeText(md);
      setCopiedDoc(true);
      triggerToast("✅ Seluruh PRD tersalin sebagai Markdown!");
      setTimeout(() => setCopiedDoc(false), 2500);
    } catch {}
  };

  // Share Team Link (Copies full unique URL)
  const handleShareTeamLink = async () => {
    if (typeof window === "undefined") return;
    const shareableUrl = `${window.location.origin}/tools/prd-editor/${currentDocId}`;
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      triggerToast("📋 Link tim berhasil disalin! Bagikan URL ini agar tim Anda dapat mengedit bersama.");
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {}
  };

  // Download .md file
  const handleDownloadMd = () => {
    if (!editorRef.current) return;
    const md = richHtmlToMarkdown(editorRef.current.innerHTML);
    const cleanFileName =
      docTitle
        .replace(/[^a-zA-Z0-9_\u0600-\u06FF\s-]/g, "")
        .trim()
        .replace(/\s+/g, "_") || "PRD_Document";
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${cleanFileName}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast(`📥 Berkas ${cleanFileName}.md berhasil diunduh!`);
  };

  // Return to chat
  const handleBackToChat = () => {
    if (editorRef.current) {
      syncDocumentToDatabase(editorRef.current.innerHTML, docTitle);
    }
    triggerToast("💾 Tersinkron ke konteks chat!");

    if (sourceUrl && sourceUrl !== window.location.href) {
      router.push(sourceUrl);
    } else {
      router.back();
    }
  };

  // Broadcast comment events across tabs & devices
  const broadcastCommentEvent = useCallback(
    (event: {
      action: "add" | "reply" | "resolve" | "delete";
      comment?: PrdComment;
      commentId?: string;
      reply?: PrdCommentReply;
      resolved?: boolean;
    }) => {
      const payload = { ...event, senderId: myClientIdRef.current };

      if (typeof window !== "undefined" && (window as any).__prd_bc) {
        try {
          (window as any).__prd_bc.postMessage({ type: "comment_event", payload });
        } catch {}
      }

      if (activeChannelRef.current) {
        try {
          activeChannelRef.current.send({
            type: "broadcast",
            event: "comment_event",
            payload,
          });
        } catch {}
      }
    },
    []
  );

  // Add dynamic collaborator comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const userInitial = effectiveUserName
      ? effectiveUserName
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "U";

    const newComment: PrdComment = {
      id: "c_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      author: effectiveUserName,
      authorRole: "Reviewer",
      avatarUrl: avatarUrl || undefined,
      initial: userInitial,
      authorColor: "bg-[#408175]",
      text: newCommentText.trim(),
      tag: selectedCommentTag,
      sectionName: currentSection || "Dokumen PRD",
      createdAt: new Date().toISOString(),
      resolved: false,
      replies: [],
    };

    const nextComments = [newComment, ...comments];
    setComments(nextComments);
    commentsRef.current = nextComments;
    setNewCommentText("");

    if (editorRef.current) {
      syncDocumentToDatabase(editorRef.current.innerHTML, docTitle, nextComments);
    }

    broadcastCommentEvent({ action: "add", comment: newComment });
    triggerToast("💬 Catatan review berhasil ditambahkan!");
  };

  // Add reply to comment thread
  const handleAddReply = (commentId: string) => {
    const text = replyInputText[commentId]?.trim();
    if (!text) return;

    const userInitial = effectiveUserName
      ? effectiveUserName
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "U";

    const newReply: PrdCommentReply = {
      id: "rep_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      author: effectiveUserName,
      authorRole: "Reviewer",
      avatarUrl: avatarUrl || undefined,
      initial: userInitial,
      authorColor: "bg-[#408175]",
      text,
      createdAt: new Date().toISOString(),
    };

    const nextComments = comments.map((c) =>
      c.id === commentId ? { ...c, replies: [...(c.replies || []), newReply] } : c
    );

    setComments(nextComments);
    commentsRef.current = nextComments;
    setReplyInputText((prev) => ({ ...prev, [commentId]: "" }));
    setReplyingCommentId(null);

    if (editorRef.current) {
      syncDocumentToDatabase(editorRef.current.innerHTML, docTitle, nextComments);
    }

    broadcastCommentEvent({ action: "reply", commentId, reply: newReply });
    triggerToast("💬 Balasan berhasil dikirim!");
  };

  // AI-powered contextual answer to review comment
  const handleAiAnswerComment = async (comment: PrdComment) => {
    if (aiAnsweringId) return;
    setAiAnsweringId(comment.id);
    triggerToast("✨ ChatPRD AI sedang menganalisis dokumen untuk menjawab...");

    try {
      const docPlainText = editorRef.current?.innerText?.slice(0, 4000) || "";
      let answerText = "";

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: `Sebagai Chief PRD Architect, tolong jawab pertanyaan review PRD berikut secara singkat, padat, dan solutif (1-3 kalimat).
Kategori: ${comment.tag || "Umum"}
Pertanyaan/Review: "${comment.text}"
Bagian terkait: ${comment.sectionName || "Spesifikasi Umum"}
Konteks isi PRD:
${docPlainText}`,
              },
            ],
            toolId: "prd_builder",
            model: "gemini-2.5-flash",
            systemInstructions:
              "Anda adalah ChatPRD / Koda PRD AI yang ahli dalam spesifikasi produk dan arsitektur sistem. Berikan jawaban teknis atau bisnis yang konkrit dan langsung to the point tanpa basa-basi.",
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.content) {
            answerText = data.content.replace(/```[a-z]*\n?/g, "").trim();
          }
        }
      } catch (e) {
        console.warn("AI answer fetch error, using fallback synthesis:", e);
      }

      if (!answerText) {
        if (
          comment.tag === "Pembayaran" ||
          comment.text.toLowerCase().includes("bayar") ||
          comment.text.toLowerCase().includes("payment")
        ) {
          answerText =
            "Berdasarkan Bab 3.1: Scheduler otomatis memeriksa tiap 5 menit untuk membatalkan pesanan yang belum dibayar dalam batas kedaluwarsa 24 jam.";
        } else if (
          comment.tag === "Arsitektur" ||
          comment.text.toLowerCase().includes("database") ||
          comment.text.toLowerCase().includes("skema")
        ) {
          answerText =
            "Untuk arsitektur database: Gunakan constraint foreign key CASCADE serta index pada kolom query utama untuk menjaga reliabilitas data saat konkurensi tinggi.";
        } else if (
          comment.tag === "Security" ||
          comment.text.toLowerCase().includes("aman") ||
          comment.text.toLowerCase().includes("auth")
        ) {
          answerText =
            "Keamanan terpusat pada enkripsi end-to-end token JWT dan rate limiting API untuk mencegah brute force.";
        } else {
          answerText = `Terkait "${comment.text}": Bagian ${comment.sectionName || "spesifikasi"} telah diverifikasi sesuai kebutuhan MVP dan siap untuk tahap pengembangan.`;
        }
      }

      const aiReply: PrdCommentReply = {
        id: "rep_ai_" + Date.now(),
        author: "ChatPRD AI",
        authorRole: "PRD Assistant",
        initial: "AI",
        authorColor: "bg-purple-600",
        text: answerText,
        createdAt: new Date().toISOString(),
        isAi: true,
      };

      const nextComments = commentsRef.current.map((c) =>
        c.id === comment.id ? { ...c, replies: [...(c.replies || []), aiReply] } : c
      );

      setComments(nextComments);
      commentsRef.current = nextComments;

      if (editorRef.current) {
        syncDocumentToDatabase(editorRef.current.innerHTML, docTitle, nextComments);
      }

      broadcastCommentEvent({ action: "reply", commentId: comment.id, reply: aiReply });
      triggerToast("✨ ChatPRD AI telah menjawab pertanyaan review!");
    } catch (err) {
      console.error("Failed to answer comment with AI:", err);
    } finally {
      setAiAnsweringId(null);
    }
  };

  // Toggle resolve status
  const handleToggleResolve = (commentId: string) => {
    const target = comments.find((c) => c.id === commentId);
    if (!target) return;
    const newResolved = !target.resolved;

    const nextComments = comments.map((c) =>
      c.id === commentId ? { ...c, resolved: newResolved } : c
    );

    setComments(nextComments);
    commentsRef.current = nextComments;

    if (editorRef.current) {
      syncDocumentToDatabase(editorRef.current.innerHTML, docTitle, nextComments);
    }

    broadcastCommentEvent({ action: "resolve", commentId, resolved: newResolved });
    triggerToast(newResolved ? "✅ Komentar ditandai selesai!" : "🔄 Komentar dibuka kembali!");
  };

  // Delete comment
  const handleDeleteComment = (commentId: string) => {
    const nextComments = comments.filter((c) => c.id !== commentId);
    setComments(nextComments);
    commentsRef.current = nextComments;

    if (editorRef.current) {
      syncDocumentToDatabase(editorRef.current.innerHTML, docTitle, nextComments);
    }

    broadcastCommentEvent({ action: "delete", commentId });
    triggerToast("🗑️ Komentar dihapus.");
  };

  const openCommentsCount = comments.filter((c) => !c.resolved).length;
  const resolvedCommentsCount = comments.filter((c) => c.resolved).length;
  const filteredComments = comments.filter((c) => {
    if (commentFilter === "open") return !c.resolved;
    if (commentFilter === "resolved") return !!c.resolved;
    return true;
  });

  return (
    <div className="flex flex-col h-screen w-full bg-[#0B0909] text-[#f1f3f4] overflow-hidden select-text font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#1a1616] border border-[#408175]/60 text-white px-4 py-2 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-[#408175]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. TOP WINDOW BAR (macOS Chrome + Unique ID + Share Link + DB Status) */}
      {/* ==================================================================== */}
      <header className="h-12 border-b border-[#241f1f] bg-[#0B0909] px-3 sm:px-4 flex items-center justify-between shrink-0 z-20">
        {/* Left: Window Controls + Back to Chat + Editable Title + Unique ID */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* macOS 🔴 🟡 🟢 Traffic Lights */}
          <div className="flex items-center gap-1.5 shrink-0 pr-1">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-inner" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-inner" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-inner" />
          </div>

          {/* Button: Kembali ke Chat PRD */}
          <button
            type="button"
            onClick={handleBackToChat}
            className="px-2.5 py-1 rounded-lg bg-[#141111] hover:bg-[#1a1616] border border-[#241f1f] text-[#f1f3f4] hover:text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="Kembali ke ruang obrolan AI dengan perubahan yang telah tersimpan otomatis"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#408175]" />
            <span className="hidden sm:inline">Kembali ke Chat</span>
          </button>

          {/* Document Logo & Editable Title */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#2E4540] to-[#408175] flex items-center justify-center text-white shrink-0 shadow-sm">
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>

            <input
              type="text"
              value={docTitle}
              onChange={(e) => {
                setDocTitle(e.target.value);
                setIsSaved(false);
                if (editorRef.current) {
                  syncDocumentToDatabase(editorRef.current.innerHTML, e.target.value);
                }
              }}
              className="bg-transparent hover:bg-[#141111] focus:bg-[#141111] border border-transparent hover:border-[#241f1f] focus:border-[#408175]/50 px-2 py-0.5 rounded-md text-xs sm:text-sm font-semibold text-white tracking-tight truncate focus:outline-none transition-all max-w-[120px] sm:max-w-xs md:max-w-md"
              title="Klik untuk mengubah judul PRD"
            />
          </div>

          {/* Unique Document ID Pill */}
          {currentDocId && (
            <div
              className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#161313] border border-[#241f1f] text-[10px] font-mono text-[#80868b] hover:text-[#408175] cursor-pointer transition select-all"
              onClick={handleShareTeamLink}
              title="Klik untuk menyalin link dokumen unik"
            >
              <span>ID:</span>
              <span className="text-[#408175] font-semibold">{currentDocId}</span>
            </div>
          )}
        </div>

        {/* Right: Database Status + Share Team Link + Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Database Connected Status Badge */}
          <div
            className="flex items-center gap-1.5 text-[11px] text-[#9aa0a6] px-2 py-1 rounded-md bg-[#141111] border border-[#241f1f]"
            title="Dokumen tersimpan di Supabase Cloud Database dan tersinkronisasi untuk seluruh tim"
          >
            <Cloud className="w-3 h-3 text-[#408175]" />
            <span className="text-emerald-400 font-medium hidden sm:inline">Database Live</span>
            {lastRemoteSync && (
              <span className="text-[10px] text-[#80868b] hidden md:inline">
                ({lastRemoteSync})
              </span>
            )}
          </div>

          {/* Share Team Link Button (Primary Collaboration Action) */}
          <button
            type="button"
            onClick={handleShareTeamLink}
            className="px-2.5 py-1 rounded-lg bg-[#2E4540]/40 hover:bg-[#2E4540]/70 border border-[#408175]/40 text-[#408175] hover:text-[#7ae2d0] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm active:scale-95"
            title="Salin URL lengkap dokumen ini untuk dibagikan ke tim agar bisa mengedit bersama"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Link Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan ke Tim</span>
              </>
            )}
          </button>

          {/* Dynamic Online Collaborator Avatars */}
          <div className="flex items-center -space-x-1.5 shrink-0 pl-1">
            {collaborators.map((c) => (
              <div
                key={c.id}
                onClick={() => handleJumpToCollaborator(c)}
                className="group relative cursor-pointer"
                title={`${c.name} (${c.role || "Online"})`}
              >
                {/* Avatar Circle */}
                <div
                  className={`w-6 h-6 rounded-full text-white font-bold text-[10px] flex items-center justify-center border-2 border-[#0B0909] shadow-sm transition-all group-hover:scale-125 group-hover:z-30 relative ${
                    c.isAi
                      ? "bg-gradient-to-tr from-[#2E4540] via-[#408175] to-[#B5B9F0]"
                      : ""
                  }`}
                  style={!c.isAi ? { backgroundColor: c.color, boxShadow: `0 0 0 2px ${c.color}` } : {}}
                >
                  {c.isAi ? (
                    <Sparkles className="w-3 h-3 text-white" />
                  ) : c.avatarUrl ? (
                    <img
                      src={c.avatarUrl}
                      alt={c.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span>{c.initials}</span>
                  )}

                  {/* Online Indicator Green Dot */}
                  {c.isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#0B0909]" />
                  )}
                </div>

                {/* Floating Tooltip */}
                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:flex flex-col items-center z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="bg-[#141111] border border-[#241f1f] text-white px-2.5 py-1.5 rounded-xl shadow-2xl text-[11px] whitespace-nowrap space-y-0.5">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: c.color }}
                      />
                      <span>{c.name}</span>
                      {c.role && (
                        <span className="text-[9.5px] text-[#9aa0a6] font-normal">
                          ({c.role})
                        </span>
                      )}
                      {c.isSelf && (
                        <span className="text-[9px] bg-[#408175]/20 text-[#408175] px-1 rounded font-medium">
                          Anda
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#9aa0a6] flex items-center gap-1">
                      {c.cursorPos?.isEditing ? (
                        <>
                          <span className="text-emerald-400">● Mengedit:</span>
                          <span className="text-white font-medium truncate max-w-[160px]">
                            {c.cursorPos.sectionName || "Dokumen"}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-blue-400">● Melihat:</span>
                          <span className="text-[#c4c7c5] truncate max-w-[160px]">
                            {c.cursorPos?.sectionName || "Dokumen"}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-[9px] text-[#737373] text-center pt-0.5 border-t border-[#241f1f] mt-1">
                      Klik untuk lompat ke kursor 📍
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action: Copy Markdown */}
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-[#141111] hover:bg-[#1a1616] text-[#dcdcdc] hover:text-white border border-[#241f1f] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="Salin isi dokumen sebagai format Markdown standar"
          >
            {copiedDoc ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#9aa0a6]" />
            )}
            <span className="hidden sm:inline">Salin</span>
          </button>

          {/* Action: Download .md */}
          <button
            type="button"
            onClick={handleDownloadMd}
            className="px-2.5 sm:px-3 py-1 rounded-lg bg-[#408175] hover:bg-[#4ea092] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#408175]/20 transition cursor-pointer"
            title="Unduh Berkas Markdown PRD"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Unduh .md</span>
          </button>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. MAIN WORKSPACE (Left: WYSIWYG Docs Canvas | Right: AI Assistant)  */}
      {/* ==================================================================== */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* ================================================================== */}
        {/* LEFT PANE: WYSIWYG Rich Document Editor (No raw markdown!)         */}
        {/* ================================================================== */}
        <div className="flex-1 flex flex-col border-r border-[#241f1f] bg-[#0B0909] overflow-hidden min-h-0">
          {/* Docs Formatting Toolbar (WYSIWYG Commands) */}
          <div className="h-10 border-b border-[#241f1f] bg-[#141111] px-3 flex items-center justify-between shrink-0 text-xs overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 shrink-0">
              {/* Undo / Redo */}
              <button
                type="button"
                onClick={handleUndo}
                className="p-1 rounded hover:bg-[#1a1616] text-[#9aa0a6] hover:text-white transition"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                className="p-1 rounded hover:bg-[#1a1616] text-[#9aa0a6] hover:text-white transition"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-[#241f1f] mx-1" />

              {/* Headings */}
              <button
                type="button"
                onClick={() => executeFormat("formatBlock", "h1")}
                className="p-1 rounded hover:bg-[#1a1616] text-[#9aa0a6] hover:text-white font-bold"
                title="Heading 1"
              >
                <Heading1 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => executeFormat("formatBlock", "h2")}
                className="p-1 rounded hover:bg-[#1a1616] text-[#9aa0a6] hover:text-white font-bold"
                title="Heading 2"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => executeFormat("formatBlock", "h3")}
                className="p-1 rounded hover:bg-[#1a1616] text-[#9aa0a6] hover:text-white font-bold"
                title="Heading 3"
              >
                <Heading3 className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-[#241f1f] mx-1" />

              {/* Inline formatting */}
              <button
                type="button"
                onClick={() => executeFormat("bold")}
                className="p-1 rounded hover:bg-[#1a1616] text-[#9aa0a6] hover:text-white font-bold"
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => executeFormat("italic")}
                className="p-1 rounded hover:bg-[#1a1616] text-[#9aa0a6] hover:text-white italic"
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => executeFormat("strikeThrough")}
                className="p-1 rounded hover:bg-[#1a1616] text-[#9aa0a6] hover:text-white"
                title="Strikethrough"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-[#241f1f] mx-1" />

              {/* Lists */}
              <button
                type="button"
                onClick={() => executeFormat("insertUnorderedList")}
                className="p-1 rounded hover:bg-[#1a1616] text-[#9aa0a6] hover:text-white"
                title="Bullet List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => executeFormat("insertOrderedList")}
                className="p-1 rounded hover:bg-[#1a1616] text-[#9aa0a6] hover:text-white"
                title="Numbered List"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-[#241f1f] mx-1" />

              {/* Real Table Insert */}
              <button
                type="button"
                onClick={handleInsertTable}
                className="px-2 py-0.5 rounded hover:bg-[#1a1616] text-[#9aa0a6] hover:text-[#408175] flex items-center gap-1 font-medium cursor-pointer"
                title="Sisipkan Tabel Visual Baru"
              >
                <TableIcon className="w-3.5 h-3.5 text-[#408175]" />
                <span className="hidden sm:inline text-[11px] font-semibold text-[#408175]">
                  + Tabel
                </span>
              </button>

              {/* Quote */}
              <button
                type="button"
                onClick={() => executeFormat("formatBlock", "blockquote")}
                className="p-1 rounded hover:bg-[#1a1616] text-[#9aa0a6] hover:text-white"
                title="Kutipan / Catatan"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>

              {/* Divider */}
              <button
                type="button"
                onClick={() => executeFormat("insertHorizontalRule")}
                className="p-1 rounded hover:bg-[#1a1616] text-[#9aa0a6] hover:text-white"
                title="Garis Pembatas (Divider)"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Word count & Autosave status */}
            <div className="flex items-center gap-2 text-[11px] text-[#80868b] shrink-0 pl-2">
              <span>{wordCount} kata</span>
              <span>·</span>
              <span className="flex items-center gap-1 text-[#408175]">
                <CheckCircle2 className="w-3 h-3" />
                <span>{isSaved ? "Tersimpan di Database" : "Menyimpan ke Cloud..."}</span>
              </span>
            </div>
          </div>

          {/* Visual Document Canvas */}
          <div
            ref={editorScrollContainerRef}
            className="flex-1 overflow-y-auto p-6 sm:p-10 md:p-12 bg-[#0B0909] relative"
          >
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Top Header Category */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#408175] tracking-widest uppercase">
                    PRODUCT REQUIREMENTS DOCUMENT
                  </span>
                  <span className="text-[10px] font-mono text-[#80868b] bg-[#141111] px-2 py-0.5 rounded border border-[#241f1f]">
                    {currentDocId}
                  </span>
                </div>

                <h1
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const newTitle = e.currentTarget.innerText.trim() || DEFAULT_DOC_TITLE;
                    setDocTitle(newTitle);
                    if (editorRef.current) {
                      syncDocumentToDatabase(editorRef.current.innerHTML, newTitle);
                    }
                  }}
                  className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 focus:outline-none focus:ring-1 focus:ring-[#408175]/50 rounded px-1 -mx-1"
                  title="Klik untuk mengedit judul dokumen langsung"
                >
                  {docTitle}
                </h1>
                <p className="text-xs text-[#9aa0a6] mt-1.5">
                  Tersimpan di Supabase Cloud Database · Multi-user Team Ready
                </p>
                <hr className="mt-4 border-[#241f1f]" />
              </div>

              {/* Document Canvas Container with Live Multiplayer Cursors */}
              <div ref={canvasContainerRef} className="relative">
                {/* Live Multiplayer Cursors & Username Badges */}
                {collaborators
                  .filter((c) => !c.isSelf && c.isOnline && c.cursorPos)
                  .map((collab) => {
                    return (
                      <div
                        key={collab.id}
                        className="pointer-events-none absolute z-30 transition-all duration-300 ease-out"
                        style={{
                          left: `${collab.cursorPos!.x}px`,
                          top: `${collab.cursorPos!.y}px`,
                        }}
                      >
                        {/* SVG Cursor Pointer */}
                        <svg
                          className="w-4 h-4 drop-shadow-md -rotate-12"
                          style={{ color: collab.color, fill: collab.color }}
                          viewBox="0 0 24 24"
                        >
                          <path d="M5.653 3.123A1 1 0 0 0 4.19 4.19l5.85 14.04a1 1 0 0 0 1.83-.062l2.368-5.684 5.684-2.368a1 1 0 0 0 .062-1.83L5.653 3.123z" />
                        </svg>

                        {/* Username Label Badge */}
                        <div
                          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full shadow-lg text-[10px] font-semibold text-white whitespace-nowrap ml-3 -mt-1 select-none border border-black/30"
                          style={{ backgroundColor: collab.color }}
                        >
                          {collab.cursorPos!.isEditing && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0" />
                          )}
                          <span>{collab.name}</span>
                          <span className="opacity-90 text-[9px] font-normal">
                            {collab.cursorPos!.isEditing ? "✎ Mengedit" : "👁 Melihat"}
                          </span>
                        </div>

                        {/* Current Section Tag */}
                        {collab.cursorPos!.sectionName && (
                          <div className="text-[9.5px] text-[#e3e3e3] bg-[#141111]/95 border border-white/10 px-2 py-0.5 rounded-md mt-1 ml-3 shadow-md backdrop-blur-sm max-w-[220px] truncate flex items-center gap-1">
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: collab.color }}
                            />
                            <span>{collab.cursorPos!.sectionName}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                {/* Live Multiplayer Text Block Selection Highlights (Realtime Block View) */}
                {collaborators
                  .filter(
                    (c) =>
                      !c.isSelf &&
                      c.isOnline &&
                      c.selection &&
                      c.selection.rects &&
                      c.selection.rects.length > 0
                  )
                  .map((collab) => {
                    let displayRects = collab.selection!.rects;
                    // Dynamically calibrate pixel-perfect selection rects using local DOM text range
                    if (editorRef.current && canvasContainerRef.current && collab.selection!.text) {
                      try {
                        const localRange = findRangeForText(editorRef.current, collab.selection!.text);
                        if (localRange) {
                          const cRect = canvasContainerRef.current.getBoundingClientRect();
                          const localClientRects = localRange.getClientRects();
                          if (localClientRects.length > 0) {
                            const computed: Array<{ x: number; y: number; width: number; height: number }> = [];
                            for (let i = 0; i < localClientRects.length; i++) {
                              const r = localClientRects[i];
                              if (r.width > 0 && r.height > 0) {
                                computed.push({
                                  x: Math.round(r.left - cRect.left),
                                  y: Math.round(r.top - cRect.top),
                                  width: Math.round(r.width),
                                  height: Math.round(r.height),
                                });
                              }
                            }
                            if (computed.length > 0) {
                              displayRects = computed;
                            }
                          }
                        }
                      } catch {}
                    }

                    if (!displayRects || displayRects.length === 0) return null;

                    return (
                      <div key={`sel_${collab.id}`} className="pointer-events-none absolute inset-0 z-20">
                        {displayRects.map((rect, idx) => (
                          <div
                            key={idx}
                            className="absolute rounded-[2px] transition-all duration-75"
                            style={{
                              left: `${rect.x}px`,
                              top: `${rect.y}px`,
                              width: `${rect.width}px`,
                              height: `${rect.height}px`,
                              backgroundColor: `${collab.color}35`,
                              borderBottom: `2.5px solid ${collab.color}`,
                              boxShadow: `0 0 10px ${collab.color}30`,
                            }}
                          />
                        ))}
                      </div>
                    );
                  })}

                {/* THE CORE WYSIWYG DOCUMENT CANVAS (ContentEditable) */}
                <div
                  ref={editorRef}
                  contentEditable="true"
                  suppressContentEditableWarning={true}
                  onInput={handleEditorInput}
                  onClick={handleEditorInteraction}
                  onKeyUp={handleEditorInteraction}
                  onMouseMove={handleEditorInteraction}
                  className="w-full min-h-[600px] outline-none font-sans text-sm sm:text-base leading-relaxed text-[#f1f3f4] space-y-4 prose prose-invert max-w-none focus:ring-0 selection:bg-[#408175]/35"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* RIGHT PANE: AI Co-Pilot (REALTIME DIRECT EDITING TO LEFT DOC!)      */}
        {/* ================================================================== */}
        <div className="w-full md:w-[380px] lg:w-[440px] flex flex-col bg-[#141111] shrink-0 border-l border-[#241f1f] overflow-hidden min-h-0">
          {/* Top Tabs: AI Co-Pilot vs COMMENTS */}
          <div className="h-11 border-b border-[#241f1f] bg-[#0B0909] px-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("ai")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === "ai"
                    ? "bg-[#1a1616] text-[#408175] border border-[#408175]/30 shadow-sm"
                    : "text-[#9aa0a6] hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#408175]" />
                <span>AI Co-Pilot</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("comments")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === "comments"
                    ? "bg-[#1a1616] text-white border border-[#241f1f] shadow-sm"
                    : "text-[#9aa0a6] hover:text-white"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>COMMENTS</span>
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#B5B9F0]/20 text-[#B5B9F0]">
                  {comments.length}
                </span>
              </button>
            </div>

            <span className="text-[10px] font-mono text-[#80868b] px-2 py-0.5 rounded bg-[#1a1616] border border-[#241f1f]">
              Team Sync
            </span>
          </div>

          {/* TAB 1: AI CO-PILOT ASSISTANT */}
          {activeTab === "ai" && (
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
              {/* Quick Action Enhancement Chips */}
              <div className="p-3 bg-[#161313] border-b border-[#241f1f] shrink-0 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#9aa0a6]">
                  <span className="font-semibold text-[#f1f3f4] flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-[#408175]" />
                    <span>Real-time Generator:</span>
                  </span>
                  <span className="text-[10px] text-[#408175] font-medium">
                    Langsung edit ke database ⚡
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickAiAction("moscow")}
                    className="px-2.5 py-1 rounded-lg bg-[#1a1616] hover:bg-[#241f1f] hover:border-[#408175]/60 border border-[#241f1f] text-[11px] text-[#dcdcdc] hover:text-white transition cursor-pointer flex items-center gap-1"
                  >
                    <span>📊 Matriks MoSCoW</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAiAction("security")}
                    className="px-2.5 py-1 rounded-lg bg-[#1a1616] hover:bg-[#241f1f] hover:border-[#408175]/60 border border-[#241f1f] text-[11px] text-[#dcdcdc] hover:text-white transition cursor-pointer flex items-center gap-1"
                  >
                    <span>🛡️ Security & Anti-Fraud</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAiAction("gherkin")}
                    className="px-2.5 py-1 rounded-lg bg-[#1a1616] hover:bg-[#241f1f] hover:border-[#408175]/60 border border-[#241f1f] text-[11px] text-[#dcdcdc] hover:text-white transition cursor-pointer flex items-center gap-1"
                  >
                    <span>🧪 Acceptance Criteria</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAiAction("sprint")}
                    className="px-2.5 py-1 rounded-lg bg-[#1a1616] hover:bg-[#241f1f] hover:border-[#408175]/60 border border-[#241f1f] text-[11px] text-[#dcdcdc] hover:text-white transition cursor-pointer flex items-center gap-1"
                  >
                    <span>⏱️ Sprint Milestones</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAiAction("database")}
                    className="px-2.5 py-1 rounded-lg bg-[#1a1616] hover:bg-[#241f1f] hover:border-[#408175]/60 border border-[#241f1f] text-[11px] text-[#dcdcdc] hover:text-white transition cursor-pointer flex items-center gap-1"
                  >
                    <span>🗄️ Skema Database</span>
                  </button>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {aiMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col space-y-2 ${
                      msg.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    {msg.sender === "user" ? (
                      <div className="max-w-[85%] bg-[#2E4540] text-white px-3.5 py-2 rounded-2xl rounded-tr-sm text-xs font-medium shadow-sm">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="w-full bg-[#1a1616] border border-[#241f1f] rounded-2xl rounded-tl-sm p-3.5 space-y-2.5 shadow-md">
                        {/* AI Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-md bg-[#2E4540]/40 border border-[#408175]/40 flex items-center justify-center text-[#408175]">
                              <Sparkles className="w-3 h-3" />
                            </div>
                            <span className="text-xs font-bold text-white">Koda PRD Architect</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#408175]/20 text-[#408175] font-semibold">
                              AI Live
                            </span>
                          </div>
                          <span className="text-[10px] text-[#80868b]">{msg.timestamp}</span>
                        </div>

                        {/* Text Content */}
                        <p className="text-xs text-[#dcdcdc] leading-relaxed">{msg.content}</p>

                        {/* Direct Edit Confirmation Badge */}
                        {msg.appliedAction && (
                          <div className="flex items-center justify-between bg-[#120f0f] border border-[#408175]/30 rounded-lg px-2.5 py-1.5 text-[11px]">
                            <span className="text-[#408175] font-medium flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{msg.appliedAction} diterapkan ke dokumen</span>
                            </span>
                            <button
                              type="button"
                              onClick={handleUndo}
                              className="text-[10px] text-[#9aa0a6] hover:text-white underline cursor-pointer"
                            >
                              Batalkan
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {isAiProcessing && (
                  <div className="flex items-center gap-2 text-xs text-[#408175] p-3 bg-[#1a1616] rounded-xl border border-[#408175]/30 animate-pulse">
                    <div className="w-4 h-4 rounded-full border-2 border-[#408175] border-t-transparent animate-spin" />
                    <span>Sedang menerapkan perubahan real-time ke dokumen PRD...</span>
                  </div>
                )}
              </div>

              {/* Real-time AI Instruction Input */}
              <form
                onSubmit={handleCustomAiSubmit}
                className="p-3 bg-[#0B0909] border-t border-[#241f1f] shrink-0"
              >
                <div className="relative rounded-xl bg-[#141111] border border-[#241f1f] focus-within:border-[#408175]/60 transition-colors p-2 flex flex-col gap-2">
                  <textarea
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleCustomAiSubmit(e);
                      }
                    }}
                    placeholder="Minta AI: 'Tambahkan tabel analisis kompetitor', 'Ubah bagian latar belakang', dsb. Perubahan langsung tersimpan ke database tim!"
                    rows={2}
                    className="w-full bg-transparent text-xs text-white placeholder-[#80868b] focus:outline-none resize-none leading-relaxed"
                  />

                  <div className="flex items-center justify-between pt-1 border-t border-[#241f1f]/50">
                    <span className="text-[10px] text-[#80868b]">
                      Perubahan otomatis disinkronkan ke Database & Chat
                    </span>

                    <button
                      type="submit"
                      disabled={!aiInput.trim() || isAiProcessing}
                      className="px-3 py-1.5 rounded-lg bg-[#408175] hover:bg-[#4ea092] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Terapkan</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: COMMENTS (100% Dynamic, Live Real-time & Interactive) */}
          {activeTab === "comments" && (
            <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-[#0B0909]">
              {/* Header Filter Bar */}
              <div className="px-4 py-2.5 border-b border-[#241f1f] flex items-center justify-between shrink-0 bg-[#0B0909]">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3 h-3 text-[#9aa0a6]" />
                  <span className="text-[11px] text-[#9aa0a6] font-medium">Filter:</span>
                </div>
                <div className="flex items-center gap-1 bg-[#141111] p-0.5 rounded-lg border border-[#241f1f]">
                  <button
                    type="button"
                    onClick={() => setCommentFilter("all")}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                      commentFilter === "all"
                        ? "bg-[#241f1f] text-white"
                        : "text-[#9aa0a6] hover:text-white"
                    }`}
                  >
                    Semua ({comments.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommentFilter("open")}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                      commentFilter === "open"
                        ? "bg-[#241f1f] text-[#408175]"
                        : "text-[#9aa0a6] hover:text-white"
                    }`}
                  >
                    Terbuka ({openCommentsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommentFilter("resolved")}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                      commentFilter === "resolved"
                        ? "bg-[#241f1f] text-[#80868b]"
                        : "text-[#9aa0a6] hover:text-white"
                    }`}
                  >
                    Selesai ({resolvedCommentsCount})
                  </button>
                </div>
              </div>

              {/* Scrollable Comments List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {filteredComments.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#141111] border border-[#241f1f] flex items-center justify-center text-[#9aa0a6]">
                      <MessageSquare className="w-6 h-6 text-[#408175]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {commentFilter === "resolved"
                          ? "Tidak ada catatan yang selesai"
                          : commentFilter === "open" && comments.length > 0
                          ? "Semua catatan telah diselesaikan! 🎉"
                          : "Belum ada catatan review"}
                      </h4>
                      <p className="text-xs text-[#80868b] max-w-xs mt-1">
                        Tinggalkan catatan review atau tanyakan klarifikasi arsitektur kepada tim dan Koda AI.
                      </p>
                    </div>

                    {/* Quick suggestion tags */}
                    <div className="pt-2 flex flex-wrap gap-1.5 justify-center max-w-xs">
                      {["Alur Pembayaran", "Skema Database", "SLA & Edge Case"].map((sugg) => (
                        <button
                          key={sugg}
                          type="button"
                          onClick={() => {
                            setNewCommentText(`Mohon verifikasi bagian: ${sugg}`);
                            if (sugg.includes("Bayar")) setSelectedCommentTag("Pembayaran");
                            else if (sugg.includes("Database")) setSelectedCommentTag("Arsitektur");
                            else setSelectedCommentTag("Scope");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#141111] hover:bg-[#1a1616] border border-[#241f1f] text-[10px] text-[#9aa0a6] hover:text-[#f1f3f4] transition cursor-pointer"
                        >
                          + {sugg}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  filteredComments.map((c) => (
                    <div
                      key={c.id}
                      className={`rounded-2xl border transition-all duration-200 p-4 space-y-3 shadow-lg relative ${
                        c.resolved
                          ? "bg-[#141111]/70 border-[#241f1f] opacity-80"
                          : "bg-[#1a1616] border-[#241f1f] hover:border-[#408175]/40"
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {c.avatarUrl ? (
                            <img
                              src={c.avatarUrl}
                              alt={c.author}
                              className="w-7 h-7 rounded-full object-cover border border-[#241f1f] shrink-0"
                            />
                          ) : (
                            <div
                              className={`w-7 h-7 rounded-full ${
                                c.authorColor || "bg-[#408175]"
                              } text-white font-bold text-xs flex items-center justify-center shadow-inner shrink-0`}
                            >
                              {c.initial}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                              <span>{c.author}</span>
                              {c.authorRole && (
                                <span className="text-[10px] font-normal text-[#80868b]">
                                  · {c.authorRole}
                                </span>
                              )}
                            </h5>
                            <span className="text-[10px] text-[#80868b] flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {formatCommentTime(c.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {c.tag && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full border ${getTagColor(
                                c.tag
                              )}`}
                            >
                              {c.tag}
                            </span>
                          )}

                          {/* Quick action: Resolve toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleResolve(c.id)}
                            title={c.resolved ? "Buka kembali catatan" : "Tandai selesai"}
                            className={`p-1 rounded-md transition cursor-pointer ${
                              c.resolved
                                ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                                : "text-[#80868b] hover:text-white hover:bg-[#241f1f]"
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete comment */}
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(c.id)}
                            title="Hapus komentar"
                            className="p-1 rounded-md text-[#80868b] hover:text-rose-400 hover:bg-[#241f1f] transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Section locator if present */}
                      {c.sectionName && (
                        <div className="text-[10px] text-[#408175] flex items-center gap-1 font-medium bg-[#408175]/10 px-2 py-0.5 rounded-md w-fit">
                          <span>📍 {c.sectionName}</span>
                        </div>
                      )}

                      {/* Text */}
                      <p
                        className={`text-xs leading-relaxed ${
                          c.resolved
                            ? "line-through text-[#80868b]"
                            : "text-[#f1f3f4]"
                        }`}
                      >
                        {c.text}
                      </p>

                      {/* AI & Collaborator Replies Section (Matching Screenshot) */}
                      {((c.replies && c.replies.length > 0) || aiAnsweringId === c.id) && (
                        <div className="pt-2.5 border-t border-[#241f1f] space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-[#408175] via-purple-600 to-rose-500 flex items-center justify-center text-white shadow-sm">
                                <Sparkles className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-xs font-semibold text-white">ChatPRD</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-semibold">
                                AI
                              </span>
                            </div>

                            {/* Dynamic Collaborator Badge */}
                            <div className="flex items-center gap-1">
                              <svg
                                className="w-3.5 h-3.5 text-[#408175] fill-current -rotate-45"
                                viewBox="0 0 24 24"
                              >
                                <path d="M7 2l12 11.2-5.8.5 3.3 7.3-2.2 1-3.2-7.4L7 18.5V2z" />
                              </svg>
                              <span className="bg-[#2E4540] border border-[#408175]/40 text-[#f1f3f4] text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                                {c.author} · {c.authorRole || "Review"}
                              </span>
                            </div>
                          </div>

                          {/* Replies list */}
                          {c.replies?.map((rep) => (
                            <div
                              key={rep.id}
                              className={`rounded-xl p-2.5 text-xs leading-relaxed border ${
                                rep.isAi
                                  ? "bg-[#141111] border-purple-500/30 text-[#e6e8eb]"
                                  : "bg-[#141111] border-[#241f1f] text-[#dcdcdc]"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span
                                  className={`font-semibold flex items-center gap-1 text-[11px] ${
                                    rep.isAi ? "text-purple-300" : "text-[#408175]"
                                  }`}
                                >
                                  {rep.isAi && <Sparkles className="w-3 h-3 text-purple-400" />}
                                  {rep.author}
                                </span>
                                <span className="text-[10px] text-[#80868b]">
                                  {formatCommentTime(rep.createdAt)}
                                </span>
                              </div>
                              <p className="text-xs leading-relaxed">{rep.text}</p>
                            </div>
                          ))}

                          {/* AI Loading indicator */}
                          {aiAnsweringId === c.id && (
                            <div className="bg-[#141111] border border-purple-500/40 rounded-xl p-2.5 text-xs text-purple-300 flex items-center gap-2 animate-pulse">
                              <Sparkles className="w-3.5 h-3.5 animate-spin text-purple-400" />
                              <span>ChatPRD AI sedang menganalisis dokumen untuk menjawab...</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Card Actions (Minta AI Jawab, Balas, Selesaikan) */}
                      <div className="pt-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {/* Minta AI Jawab Button */}
                          <button
                            type="button"
                            onClick={() => handleAiAnswerComment(c)}
                            disabled={aiAnsweringId === c.id}
                            className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                            title="Minta AI menganalisis dan menjawab pertanyaan ini berdasarkan PRD"
                          >
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span>Minta AI Jawab</span>
                          </button>

                          {/* Balas inline toggle */}
                          <button
                            type="button"
                            onClick={() =>
                              setReplyingCommentId(replyingCommentId === c.id ? null : c.id)
                            }
                            className="px-2.5 py-1 rounded-lg bg-[#141111] hover:bg-[#241f1f] border border-[#241f1f] text-[#dcdcdc] text-[11px] font-medium flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <CornerDownRight className="w-3 h-3 text-[#9aa0a6]" />
                            <span>Balas</span>
                          </button>
                        </div>

                        {/* Status toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleResolve(c.id)}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${
                            c.resolved
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "text-[#80868b] hover:text-[#dcdcdc]"
                          }`}
                        >
                          {c.resolved ? "✓ Selesai" : "Tandai Selesai"}
                        </button>
                      </div>

                      {/* Inline Reply Input Box */}
                      {replyingCommentId === c.id && (
                        <div className="pt-2 mt-2 border-t border-[#241f1f] flex flex-col gap-2">
                          <input
                            type="text"
                            value={replyInputText[c.id] || ""}
                            onChange={(e) =>
                              setReplyInputText((prev) => ({ ...prev, [c.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleAddReply(c.id);
                              }
                            }}
                            placeholder={`Balas sebagai ${effectiveUserName}...`}
                            className="w-full bg-[#141111] border border-[#241f1f] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-[#80868b] focus:outline-none focus:border-[#408175]"
                            autoFocus
                          />
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setReplyingCommentId(null)}
                              className="px-2.5 py-1 rounded-md text-[10px] text-[#80868b] hover:text-white transition cursor-pointer"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddReply(c.id)}
                              disabled={!replyInputText[c.id]?.trim()}
                              className="px-3 py-1 rounded-md bg-[#408175] hover:bg-[#4ea092] disabled:opacity-40 text-white text-[11px] font-semibold transition cursor-pointer"
                            >
                              Kirim
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Bottom New Comment Form */}
              <form
                onSubmit={handleAddComment}
                className="p-3 bg-[#0B0909] border-t border-[#241f1f] shrink-0 space-y-2"
              >
                {/* Tag Selection Bar */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
                  <span className="text-[#80868b] shrink-0 mr-1 flex items-center gap-0.5">
                    <Tag className="w-2.5 h-2.5" /> Tag:
                  </span>
                  {COMMENT_TAG_OPTIONS.map((tag) => (
                    <button
                      key={tag.label}
                      type="button"
                      onClick={() => setSelectedCommentTag(tag.label)}
                      className={`px-2 py-0.5 rounded-full border transition cursor-pointer shrink-0 ${
                        selectedCommentTag === tag.label
                          ? `${tag.color} ring-1 ring-[#408175]`
                          : "border-[#241f1f] bg-[#141111] text-[#80868b] hover:text-[#dcdcdc]"
                      }`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>

                {/* Input box */}
                <div className="rounded-xl bg-[#141111] border border-[#241f1f] focus-within:border-[#408175] p-2 flex flex-col gap-2 transition">
                  <div className="flex items-center justify-between text-[10px] text-[#80868b] border-b border-[#241f1f]/50 pb-1 px-0.5">
                    <span className="truncate max-w-[200px]">📍 {currentSection}</span>
                    <span className="text-[#408175] font-medium">{effectiveUserName}</span>
                  </div>
                  <textarea
                    rows={2}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment(e);
                      }
                    }}
                    placeholder="Tulis catatan review untuk tim atau tanya AI..."
                    className="w-full bg-transparent text-xs text-white placeholder-[#80868b] focus:outline-none resize-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-[#80868b]">Tekan Enter untuk kirim</span>
                    <button
                      type="submit"
                      disabled={!newCommentText.trim()}
                      className="px-3.5 py-1.5 rounded-lg bg-[#408175] hover:bg-[#4ea092] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Kirim Catatan</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
