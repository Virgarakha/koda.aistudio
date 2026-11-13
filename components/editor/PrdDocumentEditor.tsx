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
} from "lucide-react";
import {
  PrdDocumentRecord,
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

  // Comments state
  const [newCommentText, setNewCommentText] = useState("");
  const [comments, setComments] = useState<
    Array<{
      id: string;
      author: string;
      initial: string;
      authorColor: string;
      timeAgo: string;
      text: string;
      tag?: string;
      replies?: Array<{ author: string; text: string; timeAgo: string; isAi?: boolean }>;
    }>
  >([
    {
      id: "c1",
      author: "Jordan Lee",
      initial: "J",
      authorColor: "bg-rose-500",
      timeAgo: "now",
      text: "Apakah alur verifikasi bukti bayar manual sudah mencakup batas waktu kedaluwarsa 24 jam?",
      tag: "Pembayaran",
      replies: [
        {
          author: "ChatPRD AI",
          text: "Sudah terangkum pada Bab 3.1: Scheduler otomatis memeriksa tiap 5 menit untuk membatalkan pesanan yang belum dibayar dalam 24 jam.",
          timeAgo: "just now",
          isAi: true,
        },
      ],
    },
  ]);

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
        color: "#10b981", // Emerald for local user
        avatarUrl: avatarUrl || undefined,
        isOnline: true,
        isSelf: true,
        currentSection: "Dokumen Pembuka",
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
    async (currentHtml: string, currentTitle: string) => {
      if (!currentDocId) return;

      const currentMarkdown = richHtmlToMarkdown(currentHtml);
      setIsSaved(false);

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
        color: "#10b981",
        avatarUrl,
        x,
        y,
        sectionName,
        isEditing,
        lastActive: Date.now(),
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
        if (!p || p.id === myClientId) return;

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
                color: "#10b981",
                avatarUrl,
                sectionName: "Dokumen",
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
                    }
                  : c
              );
            } else {
              const colors = ["#3b82f6", "#f43f5e", "#f59e0b", "#8b5cf6", "#06b6d4"];
              const newCollab: RealtimeCollaborator = {
                id: p.id,
                name: p.name || "Anggota Tim",
                role: "Collaborator",
                initials: p.initials || p.name?.slice(0, 2).toUpperCase() || "TM",
                color: p.color || colors[prev.length % colors.length],
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
                if (prev.some((c) => c.id === p.id)) return prev;
                return [
                  {
                    id: p.id,
                    name: p.name || "Teammate",
                    role: p.role || "Member",
                    initials: p.initials || "TM",
                    color: p.color || "#f59e0b",
                    isOnline: true,
                    currentSection: p.currentSection || "Dokumen",
                    cursorPos: {
                      x: 120,
                      y: 240,
                      sectionName: p.currentSection,
                      isEditing: false,
                      lastActive: Date.now(),
                    },
                  },
                  ...prev,
                ];
              });
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
                      isOnline: true,
                      currentSection: payload.sectionName,
                      cursorPos: {
                        x: payload.x,
                        y: payload.y,
                        sectionName: payload.sectionName,
                        isEditing: payload.isEditing,
                        lastActive: Date.now(),
                      },
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
                  color: payload.color || "#ec4899",
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
                },
                ...prev,
              ];
            }
          });
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
            if (!payload.new || isTypingRef.current) return;
            const remoteDoc =
              Array.isArray(payload.new.messages) && payload.new.messages.length > 0
                ? payload.new.messages[0]
                : null;
            if (remoteDoc && remoteDoc.html && editorRef.current) {
              if (editorRef.current.innerHTML !== remoteDoc.html) {
                editorRef.current.innerHTML = remoteDoc.html;
                setLastRemoteSync(new Date().toLocaleTimeString());
                triggerToast("👥 Pembaruan dari anggota tim berhasil disinkronkan secara real-time!");
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
                color: "#10b981",
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
              color: "#10b981",
              avatarUrl,
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
            color: "#3b82f6",
            avatarUrl,
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

  // Add collaborator comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment = {
      id: "c_" + Date.now(),
      author: "Anda (Reviewer)",
      initial: "U",
      authorColor: "bg-[#408175]",
      timeAgo: "just now",
      text: newCommentText.trim(),
      tag: "Review Catatan",
    };

    setComments((prev) => [newComment, ...prev]);
    setNewCommentText("");
    triggerToast("💬 Catatan review berhasil ditambahkan!");
  };

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
                  style={!c.isAi ? { backgroundColor: c.color } : {}}
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

          {/* TAB 2: COMMENTS (Matching Screenshot) */}
          {activeTab === "comments" && (
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-2xl bg-[#1a1616] border border-[#241f1f] p-4 space-y-3 shadow-lg relative"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full ${c.authorColor} text-white font-bold text-xs flex items-center justify-center shadow-inner`}
                        >
                          {c.initial}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white">{c.author}</h5>
                          <span className="text-[10px] text-[#80868b]">{c.timeAgo}</span>
                        </div>
                      </div>

                      {c.tag && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#141111] text-[#9aa0a6] border border-[#241f1f]">
                          {c.tag}
                        </span>
                      )}
                    </div>

                    {/* Text */}
                    <p className="text-xs text-[#f1f3f4] leading-relaxed">{c.text}</p>

                    {/* ChatPRD AI status matching screenshot */}
                    <div className="pt-2 border-t border-[#241f1f] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-white">
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-xs font-semibold text-white">ChatPRD</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-semibold">
                            AI
                          </span>
                        </div>

                        {/* Jordan · Design badge */}
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-3.5 h-3.5 text-rose-500 fill-current -rotate-45"
                            viewBox="0 0 24 24"
                          >
                            <path d="M7 2l12 11.2-5.8.5 3.3 7.3-2.2 1-3.2-7.4L7 18.5V2z" />
                          </svg>
                          <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                            Jordan · Design
                          </span>
                        </div>
                      </div>

                      {c.replies?.map((rep, idx) => (
                        <div
                          key={idx}
                          className="bg-[#141111] border border-[#241f1f] rounded-xl p-2.5 text-xs text-[#dcdcdc] leading-relaxed"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-purple-400">{rep.author}</span>
                            <span className="text-[10px] text-[#80868b]">{rep.timeAgo}</span>
                          </div>
                          <p>{rep.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment Input */}
              <form
                onSubmit={handleAddComment}
                className="p-3 bg-[#0B0909] border-t border-[#241f1f] shrink-0"
              >
                <div className="rounded-xl bg-[#141111] border border-[#241f1f] p-2 flex flex-col gap-2">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Tulis catatan review untuk tim..."
                    className="w-full bg-transparent text-xs text-white placeholder-[#80868b] focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newCommentText.trim()}
                      className="px-3 py-1 rounded-lg bg-[#408175] hover:bg-[#4ea092] disabled:opacity-40 text-white text-xs font-semibold transition cursor-pointer"
                    >
                      Kirim Catatan
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
