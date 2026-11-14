"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Copy,
  Check,
  Download,
  FileEdit,
  Share2,
  RefreshCw,
  Eye,
  Code2,
  Database,
  Workflow,
  Image as ImageIcon,
  CheckCircle2,
  ShieldCheck,
  SlidersHorizontal,
  ChevronRight,
  Maximize2,
  Plus,
  Play,
  RotateCcw,
  Clock,
  Home,
  ShoppingCart,
  Ticket,
  Package,
  Cpu,
  Terminal,
  Smartphone,
  Printer,
  Table as TableIcon,
} from "lucide-react";
import { PrdSidebar } from "@/components/tools/PrdSidebar";
import { MarkdownRenderer } from "@/components/playground/MarkdownRenderer";
import { SystemFlowDiagram } from "@/components/playground/SystemFlowDiagram";
import { DribbbleDesignShowcase } from "@/components/playground/DribbbleDesignShowcase";
import { PromptInput } from "@/components/playground/PromptInput";
import { compilePrdFromMessages, CompiledPrdData, extractCleanTitle } from "@/lib/ai/prd-compiler";
import { savePrdDocument, generateUniqueDocId } from "@/lib/apps/prd-document-storage";
import { markdownToRichHtml } from "@/components/editor/PrdDocumentEditor";
import {
  PrdSession,
  getPrdSessions,
  getPrdSessionById,
  savePrdSession,
  deletePrdSession,
  SEED_BOOKING_KOS_SESSION,
} from "@/lib/apps/prd-storage";
import { ChatMessage, FileAttachment } from "@/lib/apps/types";
import { useUserProfile } from "@/hooks/use-user-profile";
import { PrdQuestionnaireWizard } from "@/components/tools/PrdQuestionnaireWizard";
import { PrdDecisionChips } from "@/components/tools/PrdDecisionChips";
import { PrdCompletenessModal } from "@/components/tools/PrdCompletenessModal";
import { VisualErdDiagram } from "@/components/playground/VisualErdDiagram";
import { InteractivePrototypePreview } from "@/components/playground/InteractivePrototypePreview";
import { KodaCliConnectModal } from "@/components/tools/KodaCliConnectModal";
import { PrdSecurityAuditModal } from "@/components/tools/PrdSecurityAuditModal";
import {
  computePrdCompleteness,
  computePrdSecurityAudit,
  generateLinearJiraTasks,
} from "@/lib/ai/prd-export-helpers";

const STARTER_PRD_IDEAS = [
  {
    icon: Home,
    title: "Booking Kos & Kontrakan Mahasiswa",
    desc: "Instant booking tanpa pembayaran online, mitigasi race condition double-booking, dan integrasi WhatsApp.",
    prompt:
      "Saya ingin merancang sistem aplikasi Booking Kos Mahasiswa di Malang dengan harga terjangkau (Rp500rb - 1jt), instant booking, mitigasi double-booking, dan komunikasi via WhatsApp.",
  },
  {
    icon: ShoppingCart,
    title: "Aplikasi Kasir POS Multi-Outlet",
    desc: "POS kasir retail modern, offline-first sync SQLite, cetak struk thermal Bluetooth, dan laporan laba rugi.",
    prompt:
      "Tolong rancang sistem POS Kasir Multi-Outlet untuk toko retail dengan offline-first sync SQLite, manajemen shift kasir, cetak struk thermal, dan deteksi selisih stok.",
  },
  {
    icon: Ticket,
    title: "Flash Sale & War Tiket Konser",
    desc: "Pemesanan high concurrency, antrean FIFO Redis lock, payment gateway webhook, dan auto-release 15 menit.",
    prompt:
      "Saya ingin merancang sistem flash sale war tiket konser dengan beban tinggi, antrean FIFO Redis distributed lock, mitigasi bot scalper, dan batas bayar 15 menit.",
  },
  {
    icon: Package,
    title: "Marketplace Logistik & Escrow",
    desc: "Marketplace sewa armada logistik dengan split payment, penahanan saldo escrow, dan live tracking kurir.",
    prompt:
      "Rancang marketplace pengiriman kargo & logistik dengan sistem split payment escrow, pelacakan armada real-time, dan konfirmasi bukti serah terima (POD).",
  },
];

// Animated Processing Card: "KODA Memproses"
function KodaProcessingCard() {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    {
      title: "Menganalisis Kebutuhan Sistem & Domain Aplikasi",
      desc: "KODA Architect memetakan batasan produk, aktor pengguna, dan alur operasional...",
    },
    {
      title: "Mendeteksi Edge Cases & Mitigasi Concurrency",
      desc: "Memeriksa risiko race condition, locking database baris, dan idempotency...",
    },
    {
      title: "Menyusun Diagram Alur & Pilihan Arsitektur",
      desc: "Menghubungkan sequence flow dan opsi arsitektur makro (A, B, C)...",
    },
    {
      title: "Mempersiapkan Kanvas 13 Bab PRD & Skema Data",
      desc: "Mengompilasi skema PostgreSQL DDL 3NF dan inspirasi desain antarmuka Dribbble...",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 2200);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="w-full rounded-2xl border border-[#408175]/40 bg-gradient-to-br from-[#141111] via-[#161313] to-[#0B0909] p-4 sm:p-5 shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
      {/* Background photon glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#408175]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-start gap-3.5 relative z-10">
        {/* Animated Koda Processing Icon with rotating ring */}
        <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
          <div className="absolute inset-0 rounded-xl border border-[#408175]/50 animate-ping opacity-25" />
          <div className="absolute inset-0 rounded-xl border-2 border-transparent border-t-[#408175] border-r-[#408175]/50 animate-spin" />
          <div className="w-8 h-8 rounded-lg bg-[#2E4540]/40 text-[#408175] flex items-center justify-center border border-[#408175]/60 shadow-md">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white tracking-tight">
                KODA Architect sedang memproses...
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2E4540]/30 text-[#408175] border border-[#408175]/30 font-mono animate-pulse">
                Tahap {stepIndex + 1}/4
              </span>
            </div>

            {/* Equalizer Wave Bars */}
            <div className="flex items-end gap-1 h-3.5">
              <span className="w-1 bg-[#408175] rounded-full animate-bounce [animation-delay:0ms] h-full" />
              <span className="w-1 bg-[#408175]/80 rounded-full animate-bounce [animation-delay:150ms] h-2/3" />
              <span className="w-1 bg-[#408175] rounded-full animate-bounce [animation-delay:300ms] h-5/6" />
              <span className="w-1 bg-[#408175]/60 rounded-full animate-bounce [animation-delay:450ms] h-1/2" />
            </div>
          </div>

          <div className="space-y-0.5">
            <p className="text-xs text-[#f1f3f4] font-medium transition-all duration-300">
              {steps[stepIndex].title}
            </p>
            <p className="text-[11px] text-[#9aa0a6] leading-relaxed transition-all duration-300">
              {steps[stepIndex].desc}
            </p>
          </div>

          {/* Shimmering Progress Bar */}
          <div className="h-1.5 w-full bg-[#1a1616] rounded-full overflow-hidden relative mt-2 border border-[#241f1f]">
            <div className="h-full bg-gradient-to-r from-[#2E4540] via-[#408175] to-[#2E4540] rounded-full animate-pulse w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrdBuilderStudio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userEmail } = useUserProfile();

  // User display name (e.g. Virga from virgakumara@...)
  const displayName = useMemo(() => {
    if (!userEmail) return "Virga";
    const prefix = userEmail.split("@")[0].toLowerCase();
    if (prefix.startsWith("virga")) return "Virga";
    const clean = prefix.split(/[._-]/)[0];
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }, [userEmail]);

  // Sidebar & Sessions State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sessions, setSessions] = useState<PrdSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [promptText, setPromptText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);

  // Right pane tab: 'prd' | 'flow' | 'database' | 'mockup' | 'designs'
  const [activeTab, setActiveTab] = useState<"prd" | "flow" | "database" | "mockup" | "designs">("prd");
  const [prdViewMode, setPrdViewMode] = useState<"preview" | "raw">("preview");
  const [dbViewMode, setDbViewMode] = useState<"erd" | "ddl">("erd");
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [activeChapter, setActiveChapter] = useState<number>(1);
  const [isCompletenessModalOpen, setIsCompletenessModalOpen] = useState(false);
  const [isCliModalOpen, setIsCliModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [manualRightPaneOpen, setManualRightPaneOpen] = useState<boolean | null>(null);

  // The right pane should open automatically when the AI has actually produced a model response
  // (or when viewing a saved session that already has assistant responses),
  // OR manually if the user clicks the toggle button.
  const hasModelResponse = useMemo(() => {
    return messages.some((m) => m.role === "model" && m.content.trim().length > 0);
  }, [messages]);

  const isRightPaneOpen = useMemo(() => {
    if (manualRightPaneOpen !== null) return manualRightPaneOpen;
    if (activeSessionId === SEED_BOOKING_KOS_SESSION.id && messages.length > 0) return true;
    return hasModelResponse;
  }, [manualRightPaneOpen, hasModelResponse, activeSessionId, messages.length]);

  // Load sessions from storage on mount
  useEffect(() => {
    const list = getPrdSessions();
    setSessions(list);

    // If query param 'demo' is passed, load seed
    const demoParam = searchParams?.get("demo");
    if (demoParam === "booking-kos") {
      setActiveSessionId(SEED_BOOKING_KOS_SESSION.id);
      setMessages(SEED_BOOKING_KOS_SESSION.messages);
      return;
    }

    // Default to New Chat mode as requested by user
    setActiveSessionId(null);
    setMessages([]);
  }, [searchParams]);

  // Compile PRD Data dynamically from conversation
  const compiledData: CompiledPrdData = useMemo(() => {
    if (messages.length === 0) {
      return compilePrdFromMessages([], "Sistem Aplikasi Baru");
    }
    const currentSession = sessions.find((s) => s.id === activeSessionId);
    const sessionTitle =
      currentSession?.title ||
      (messages[0]?.content ? extractCleanTitle(messages[0].content, "Sistem Aplikasi") : "Sistem Aplikasi");
    return compilePrdFromMessages(messages, sessionTitle);
  }, [messages, sessions, activeSessionId]);

  // Readme / PRD markdown source
  const prdMarkdownSource = useMemo(() => {
    return compiledData.readmeMarkdown;
  }, [compiledData]);

  // PRD Completeness & Security Audit Calculations
  const completenessResult = useMemo(() => {
    return computePrdCompleteness(prdMarkdownSource);
  }, [prdMarkdownSource]);

  const securityAuditResult = useMemo(() => {
    return computePrdSecurityAudit(prdMarkdownSource, compiledData.databaseSchemaSql);
  }, [prdMarkdownSource, compiledData.databaseSchemaSql]);

  const lastModelMessageId = useMemo(() => {
    const modelMsgs = messages.filter((m) => m.role === "model");
    return modelMsgs.length > 0 ? modelMsgs[modelMsgs.length - 1].id : null;
  }, [messages]);

  const handleDownloadLinearJira = () => {
    const { csvContent } = generateLinearJiraTasks(compiledData.appName, prdMarkdownSource);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const fileName = (compiledData.appName || "PRD_Tasks").toLowerCase().replace(/[^a-z0-9]/g, "_");
    link.download = `${fileName}_Linear_Jira_Tasks.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintPrd = () => {
    window.print();
  };

  // Scroll chat to bottom helper
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom("auto");
    }
  }, [messages.length, isLoading]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    setTimeout(() => setCopiedItem(null), 2500);
  };

  const handleDownloadPrd = () => {
    const blob = new Blob([prdMarkdownSource], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const fileName = (compiledData.appName || "PRD_Document")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_");
    link.download = `${fileName}_PRD.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenInEditor = () => {
    if (!prdMarkdownSource) return;
    const currentSession = sessions.find((s) => s.id === activeSessionId);
    const docTitle = currentSession?.title || compiledData.appName || "Platform Aplikasi";
    const docId = activeSessionId ? `doc-${activeSessionId}` : generateUniqueDocId(docTitle);
    const richHtml = markdownToRichHtml(prdMarkdownSource);

    try {
      savePrdDocument({
        id: docId,
        title: `${docTitle} — PRD`,
        appName: docTitle,
        html: richHtml,
        markdown: prdMarkdownSource,
        updatedAt: new Date().toISOString(),
        sourceSessionId: activeSessionId || undefined,
        sourceUrl: typeof window !== "undefined" ? window.location.href : undefined,
      });
    } catch (err) {
      console.warn("Failed to persist active PRD for editor:", err);
    }
    router.push(`/tools/prd-editor/${docId}`);
  };

  // Start a new chat session
  const handleNewSession = () => {
    setActiveSessionId(null);
    setMessages([]);
    setPromptText("");
    setActiveTab("prd");
    setManualRightPaneOpen(null);
  };

  // Select an existing session from history
  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    const target = sessions.find((s) => s.id === id);
    if (target) {
      setMessages(target.messages);
    }
  };

  // Delete a session from history
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deletePrdSession(id);
    setSessions(updated);
    if (activeSessionId === id) {
      handleNewSession();
    }
  };

  // Direct send message
  const handleSendMessageDirect = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    let currentId = activeSessionId;
    let currentTitle = "Sistem Baru";

    // If starting a new session
    if (!currentId) {
      currentId = `session-${Date.now()}`;
      currentTitle = extractCleanTitle(textToSend, "Sistem Baru");
      setActiveSessionId(currentId);
    } else {
      const existing = sessions.find((s) => s.id === currentId);
      if (existing) currentTitle = existing.title;
      else currentTitle = extractCleanTitle(textToSend, "Sistem Baru");
    }

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
      createdAt: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setPromptText("");
    setIsLoading(true);
    setTimeout(() => scrollToBottom("smooth"), 50);

    const modelMsgId = `model-${Date.now()}`;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          toolId: "prd_builder",
          model: "gemini-2.5-flash",
          systemInstructions:
            "Anda adalah KODA AI Chief Requirements Architect & System Flow Engineer. Jawab secara presisi, gunakan interview-json dengan opsi A, B, C untuk wawancara, gunakan flow-json untuk diagram alur, dan prd-ready-json bila spesifikasi telah lengkap.",
        }),
      });

      const data = await response.json();
      const fullContent = data.content || "Spesifikasi diperbarui.";

      const placeholderModelMessage: ChatMessage = {
        id: modelMsgId,
        role: "model",
        content: "",
        createdAt: new Date().toISOString(),
      };

      const withPlaceholder = [...newMessages, placeholderModelMessage];
      setMessages(withPlaceholder);
      setTypingMessageId(modelMsgId);
      setIsLoading(false);

      // Typewriter animation
      let charIndex = 0;
      const totalLen = fullContent.length;
      const chunkStep = Math.max(3, Math.ceil(totalLen / 80));

      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          charIndex += chunkStep;
          if (charIndex >= totalLen) {
            charIndex = totalLen;
            clearInterval(interval);
            setTypingMessageId(null);
            setTimeout(() => scrollToBottom("smooth"), 50);
            resolve();
          }

          const currentSlice = fullContent.slice(0, charIndex);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === modelMsgId ? { ...m, content: currentSlice } : m
            )
          );
        }, 18);
      });

      const finalMessages = newMessages.map((m) => m);
      finalMessages.push({
        ...placeholderModelMessage,
        content: fullContent,
      });

      setMessages(finalMessages);

      // Save to localStorage sessions
      const finalTitle =
        compiledData.appName &&
        compiledData.appName !== "Sistem Aplikasi" &&
        compiledData.appName !== "Sistem Baru"
          ? compiledData.appName
          : currentTitle;

      const sessionToSave: PrdSession = {
        id: currentId,
        title: finalTitle,
        messages: finalMessages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      savePrdSession(sessionToSave);
      setSessions(getPrdSessions());
    } catch (e) {
      setIsLoading(false);
      setTypingMessageId(null);
    }
  };

  const handlePromptSubmit = (attachments?: FileAttachment[]) => {
    handleSendMessageDirect(promptText);
  };

  // Chapter jump list for 13 Bab PRD
  const chapterTitles = [
    { num: 1, title: "Latar Belakang & Masalah" },
    { num: 2, title: "Pengguna & Hak Akses" },
    { num: 3, title: "Fitur Fungsional" },
    { num: 4, title: "Business Rules" },
    { num: 5, title: "Acceptance Criteria" },
    { num: 6, title: "Arsitektur Laravel 12" },
    { num: 7, title: "Rancangan Database" },
    { num: 8, title: "Backlog P0-P2" },
    { num: 9, title: "Non-Functional Req" },
    { num: 10, title: "KPI Produk" },
    { num: 11, title: "Asumsi & Keputusan" },
    { num: 12, title: "Definition of Done" },
    { num: 13, title: "Rekomendasi Final" },
  ];

  return (
    <div className="flex h-screen bg-[#0B0909] text-[#f1f3f4] font-sans overflow-hidden select-none">
      {/* 1. DEDICATED PRD SIDEBAR (Replaces main global sidebar) */}
      <PrdSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* 2. Main Studio Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Studio Header */}
        <header className="h-14 border-b border-[#1f1a1a] bg-[#0B0909] px-4 sm:px-6 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-3">
            <Link
              href="/tools"
              className="p-1.5 rounded-lg text-[#9aa0a6] hover:text-white hover:bg-[#1a1616] transition flex items-center gap-1.5 text-xs font-medium border border-transparent hover:border-[#241f1f]"
              title="Kembali ke Tools Directory"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Tools Directory</span>
            </Link>

            <div className="h-4 w-px bg-[#241f1f]" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#2E4540]/30 text-[#408175] flex items-center justify-center border border-[#408175]/40">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-xs sm:text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                  <span>
                    {activeSessionId
                      ? sessions.find((s) => s.id === activeSessionId)?.title ||
                        (compiledData.appName && compiledData.appName !== "Sistem Aplikasi"
                          ? compiledData.appName
                          : "PRD Session")
                      : "Obrolan PRD Baru"}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#141111] text-[#408175] border border-[#408175]/30 font-mono">
                    Studio
                  </span>
                </h1>
              </div>
            </div>
          </div>

          {/* Right Header Actions (Shown when PRD is compiled or active) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isRightPaneOpen ? (
              <>
                {/* 13-Bab Completeness Gauge */}
                <button
                  type="button"
                  onClick={() => setIsCompletenessModalOpen(true)}
                  className="px-2.5 py-1 rounded-full bg-[#16100E] border border-[#38241F] hover:border-[#D97757] text-[#FAF6F4] text-[11px] font-medium transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Klik untuk membuka Checklist 13 Bab PRD"
                >
                  <span className="w-2 h-2 rounded-full bg-[#D97757] animate-pulse" />
                  <span className="font-bold text-[#E88C6F]">{completenessResult.scorePercent}%</span>
                  <span className="text-[#A89892] hidden md:inline">({completenessResult.completedCount}/13 Bab)</span>
                </button>

                {/* Pre-production Security & Architecture Audit */}
                <button
                  type="button"
                  onClick={() => setIsAuditModalOpen(true)}
                  className="px-2.5 py-1 rounded-full bg-[#101815] border border-emerald-900/60 hover:border-emerald-500/60 text-emerald-300 text-[11px] font-medium transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Klik untuk melihat Laporan Audit Kesiapan Produksi"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold">Audit {securityAuditResult.grade}</span>
                </button>

                {/* Connect to Koda CLI Button */}
                <button
                  type="button"
                  onClick={() => setIsCliModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#18110F] hover:bg-[#261713] text-[#FAF6F4] border border-[#38241F] hover:border-[#D97757]/50 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  title="Hubungkan ke Coding Agent CLI di Terminal"
                >
                  <Terminal className="w-3.5 h-3.5 text-[#D97757]" />
                  <span className="hidden sm:inline">Koda CLI</span>
                </button>

                {/* Linear / Jira Tasks CSV Export */}
                <button
                  type="button"
                  onClick={handleDownloadLinearJira}
                  className="px-2.5 py-1.5 rounded-lg bg-[#141111] hover:bg-[#1a1616] text-[#C4B2AC] hover:text-white text-xs font-medium transition flex items-center gap-1.5 border border-[#241f1f] cursor-pointer"
                  title="Unduh Tiket Sprint Linear / Jira (.csv)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden lg:inline">Linear/Jira CSV</span>
                </button>

                {/* Copy Markdown */}
                <button
                  type="button"
                  onClick={() => handleCopy(prdMarkdownSource, "header_copy")}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#141111] hover:bg-[#1a1616] text-white text-xs font-medium transition flex items-center gap-1.5 border border-[#241f1f]"
                  title="Salin Dokumen PRD"
                >
                  {copiedItem === "header_copy" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden xl:inline">Salin</span>
                </button>

                {/* Print PDF */}
                <button
                  type="button"
                  onClick={handlePrintPrd}
                  className="p-1.5 rounded-lg bg-[#141111] hover:bg-[#1a1616] text-[#C4B2AC] hover:text-white transition border border-[#241f1f] cursor-pointer"
                  title="Cetak Dokumen PRD Resmi (PDF)"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>

                {/* Open in PRD Editor */}
                <button
                  type="button"
                  onClick={handleOpenInEditor}
                  className="px-3 sm:px-3.5 py-1.5 rounded-lg bg-[#408175] hover:bg-[#4ea092] text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-md shadow-[#408175]/20 cursor-pointer"
                  title="Buka dokumen di PRD Editor dual-pane"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Editor</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setManualRightPaneOpen(true);
                    setActiveTab("database");
                  }}
                  className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#141111] hover:bg-[#1a1616] text-[#FAF6F4] hover:text-white text-xs font-medium transition flex items-center gap-1.5 border border-[#241f1f] cursor-pointer"
                  title="Buka panel dan lihat tab Database (ERD & DDL)"
                >
                  <Database className="w-3.5 h-3.5 text-sky-400" />
                  <span>Tab Database (ERD)</span>
                </button>
                <div className="hidden md:flex items-center gap-1.5 text-xs text-[#80868b] px-3 py-1 rounded-full bg-[#141111] border border-[#241f1f]">
                  <Sparkles className="w-3.5 h-3.5 text-[#408175]" />
                  <span>Kanvas Siap Menunggu Input</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* 3. Dual-Pane Split Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-56px)] overflow-hidden">
          {/* ========================================================= */}
          {/* LEFT PANE: Requirements Architect Chat                    */}
          {/* (Fullscreen when new chat; Splits to 50% when active)      */}
          {/* ========================================================= */}
          <div
            className={`flex flex-col h-full bg-[#0B0909] transition-all duration-500 ease-in-out ${
              isRightPaneOpen
                ? "w-full lg:w-1/2 border-r border-[#1f1a1a]"
                : "w-full flex-1"
            }`}
          >
            {/* Left Pane Sub-header */}
            <div className="px-4 py-2.5 border-b border-[#1f1a1a] bg-[#0B0909] flex items-center justify-between shrink-0 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#408175] animate-pulse" />
                <span className="font-semibold text-white">KODA Architect Chat</span>
                <button
                  type="button"
                  onClick={() => setManualRightPaneOpen((prev) => (prev === null ? !isRightPaneOpen : !prev))}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-[#141111] text-[#9aa0a6] hover:text-white font-mono border border-[#241f1f] transition cursor-pointer flex items-center gap-1"
                  title={isRightPaneOpen ? "Sembunyikan panel spesifikasi untuk fokus chat" : "Buka panel spesifikasi (PRD, Flowchart, Database ERD)"}
                >
                  <span>{isRightPaneOpen ? "Dual-Sync (Tutup Panel)" : "Buka Panel (ERD & PRD)"}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleNewSession}
                    className="p-1 rounded-md text-[#80868b] hover:text-white hover:bg-[#1a1616] transition flex items-center gap-1 text-[11px]"
                    title="Mulai obrolan baru"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Baru</span>
                  </button>
                )}
              </div>
            </div>

            {/* Chat Messages Body */}
            <div
              ref={chatContainerRef}
              className={`flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 ${
                !isRightPaneOpen ? "max-w-4xl mx-auto w-full" : "w-full"
              }`}
            >
              {/* EMPTY STATE: "Virga, apa yang mau dibangun?" (Fullscreen centered) */}
              {messages.length === 0 ? (
                <div className="my-auto py-12 px-4 max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
                  <div className="text-center space-y-3">
                    <div className="inline-flex p-3.5 rounded-2xl bg-[#2E4540]/30 text-[#408175] border border-[#408175]/30 mb-1 shadow-lg shadow-[#408175]/10">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      {displayName}, apa yang mau dibangun?
                    </h2>
                    <p className="text-xs sm:text-sm text-[#9aa0a6] leading-relaxed max-w-lg mx-auto">
                      KODA AI Chief Requirements Architect akan memandu perancangan spesifikasi
                      sistem lengkap 13 Bab PRD, visual flowchart, dan skema PostgreSQL anti-race
                      condition.
                    </p>
                  </div>

                  {/* 1. Smart Guided Questionnaire Wizard */}
                  <PrdQuestionnaireWizard onSelectPrompt={handleSendMessageDirect} />

                  {/* 2. Ready-Made Idea Cards Section */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="h-px flex-1 bg-[#241F1F]" />
                    <span className="text-[11px] font-semibold text-[#80868B] uppercase tracking-wider">
                      Atau Pilih Kasus Proyek Siap Pakai:
                    </span>
                    <div className="h-px flex-1 bg-[#241F1F]" />
                  </div>

                  {/* Starter Idea Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {STARTER_PRD_IDEAS.map((item, idx) => {
                      const IconComp = item.icon;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessageDirect(item.prompt)}
                          className="p-4 rounded-2xl bg-[#141111] hover:bg-[#1a1616] border border-[#241f1f] hover:border-[#408175]/60 transition-all text-left space-y-2 group cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-0.5 duration-200"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-[#1a1616] text-[#408175] group-hover:scale-105 transition-transform border border-[#241f1f]">
                              <IconComp className="w-4 h-4" />
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#408175] transition-colors">
                              {item.title}
                            </span>
                          </div>
                          <p className="text-[11.5px] text-[#80868b] leading-relaxed line-clamp-2">
                            {item.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[11px] font-semibold text-[#80868b]">
                        {msg.role === "user" ? `${displayName} (Product Owner)` : "KODA Architect"}
                      </span>
                    </div>

                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-full ${
                        msg.role === "user"
                          ? "bg-[#1a1616] text-white border border-[#241f1f]"
                          : "bg-[#141111] text-[#e3e3e3] border border-[#241f1f] shadow-sm w-full"
                      }`}
                    >
                      <MarkdownRenderer
                        content={msg.content}
                        onAnswerQuestion={handleSendMessageDirect}
                        onCompilePRD={() => {
                          setActiveTab("prd");
                          handleCopy(prdMarkdownSource, "auto_sync");
                        }}
                        isTyping={typingMessageId === msg.id}
                      />

                      {/* Interactive Decision Chips for latest Assistant message */}
                      {msg.role === "model" && msg.id === lastModelMessageId && (
                        <PrdDecisionChips
                          lastMessageContent={msg.content}
                          onSelectOption={handleSendMessageDirect}
                          disabled={isLoading}
                        />
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* DYNAMIC PROCESSING ANIMATION: "KODA Memproses" */}
              {isLoading && <KodaProcessingCard />}
            </div>

            {/* Bottom Chat Prompt Input */}
            <div
              className={`p-3 border-t border-[#1f1a1a] bg-[#0B0909] ${
                !isRightPaneOpen ? "max-w-4xl mx-auto w-full" : "w-full"
              }`}
            >
              <PromptInput
                value={promptText}
                onChange={setPromptText}
                onSubmit={handlePromptSubmit}
                isLoading={isLoading}
                groundingEnabled={false}
                onToggleGrounding={() => {}}
                showToolsMenu={false}
                placeholder="Deskripsikan ide aplikasi, aturan bisnis, atau pilih opsi arsitektur di atas..."
              />
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT PANE: Live Interactive PRD & System Inspector       */}
          {/* (Hidden in new chat, Slides in from Right to Left on start) */}
          {/* ========================================================= */}
          {isRightPaneOpen && (
            <div className="flex-1 lg:w-1/2 flex flex-col h-full bg-[#0B0909] border-l border-[#1f1a1a] animate-in slide-in-from-right duration-500 ease-out transition-all">
              {/* Right Pane Navigation Tabs */}
              <div className="px-4 py-2 border-b border-[#1f1a1a] bg-[#0B0909] flex items-center justify-between shrink-0 select-none">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("prd")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer shrink-0 ${
                      activeTab === "prd"
                        ? "bg-[#1a1616] text-white border border-[#241f1f] shadow-sm"
                        : "text-[#9aa0a6] hover:text-white hover:bg-[#141111]"
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#408175]" />
                    <span>PRD 13 Bab</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("flow")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer shrink-0 ${
                      activeTab === "flow"
                        ? "bg-[#1a1616] text-white border border-[#241f1f] shadow-sm"
                        : "text-[#9aa0a6] hover:text-white hover:bg-[#141111]"
                    }`}
                  >
                    <Workflow className="w-3.5 h-3.5 text-[#8ab4f8]" />
                    <span>System Flowchart</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("database")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer shrink-0 ${
                      activeTab === "database"
                        ? "bg-[#1a1616] text-white border border-[#241f1f] shadow-sm"
                        : "text-[#9aa0a6] hover:text-white hover:bg-[#141111]"
                    }`}
                  >
                    <Database className="w-3.5 h-3.5 text-sky-400" />
                    <span>Database (ERD & DDL)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("designs")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer shrink-0 ${
                      activeTab === "designs"
                        ? "bg-[#1a1616] text-white border border-[#241f1f] shadow-sm"
                        : "text-[#9aa0a6] hover:text-white hover:bg-[#141111]"
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                    <span>UI Mockups</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("mockup")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer shrink-0 ${
                      activeTab === "mockup"
                        ? "bg-[#1a1616] text-white border border-[#241f1f] shadow-sm"
                        : "text-[#9aa0a6] hover:text-white hover:bg-[#141111]"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-[#D97757]" />
                    <span>Live Prototype</span>
                  </button>
                </div>

                {/* Secondary actions in right tab */}
                {activeTab === "prd" && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center bg-[#141111] p-0.5 rounded-lg border border-[#241f1f]">
                      <button
                        type="button"
                        onClick={() => setPrdViewMode("preview")}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                          prdViewMode === "preview"
                            ? "bg-[#1a1616] text-white"
                            : "text-[#80868b] hover:text-white"
                        }`}
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrdViewMode("raw")}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                          prdViewMode === "raw"
                            ? "bg-[#1a1616] text-white"
                            : "text-[#80868b] hover:text-white"
                        }`}
                      >
                        Raw
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "database" && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center bg-[#141111] p-0.5 rounded-lg border border-[#241f1f]">
                      <button
                        type="button"
                        onClick={() => setDbViewMode("erd")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                          dbViewMode === "erd"
                            ? "bg-[#1a1616] text-[#FAF6F4] font-bold"
                            : "text-[#80868b] hover:text-white"
                        }`}
                      >
                        Visual ERD
                      </button>
                      <button
                        type="button"
                        onClick={() => setDbViewMode("ddl")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                          dbViewMode === "ddl"
                            ? "bg-[#1a1616] text-[#FAF6F4] font-bold"
                            : "text-[#80868b] hover:text-white"
                        }`}
                      >
                        DDL SQL
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Pane Body Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {/* BLUEPRINT LOADING STATE while AI is initially generating */}
                {isLoading && (!compiledData.readmeMarkdown || compiledData.readmeMarkdown.length < 50) ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-5 animate-in fade-in duration-300">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-[#408175]/40 animate-spin [animation-duration:8s]" />
                      <div className="w-12 h-12 rounded-xl bg-[#2E4540]/30 text-[#408175] flex items-center justify-center border border-[#408175]/60 shadow-lg shadow-[#408175]/20">
                        <FileSpreadsheet className="w-6 h-6 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-1.5 max-w-sm">
                      <h3 className="text-sm font-semibold text-white">Menyusun Kanvas Arsitektur PRD</h3>
                      <p className="text-xs text-[#9aa0a6] leading-relaxed">
                        KODA Engine sedang menyelaraskan alur sequence, relasi database 3NF, dan spesifikasi 13 Bab secara real-time...
                      </p>
                    </div>
                    <div className="w-56 h-1.5 bg-[#141111] rounded-full overflow-hidden relative border border-[#241f1f]">
                      <div className="h-full bg-gradient-to-r from-transparent via-[#408175] to-transparent rounded-full animate-pulse w-3/4" />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* TAB 1: PRD 13 BAB */}
                    {activeTab === "prd" && (
                      <div className="space-y-6 max-w-4xl mx-auto">
                        {/* Quick Chapter Navigator Pills */}
                        <div className="rounded-2xl border border-[#241f1f] bg-[#141111] p-3.5 space-y-2">
                          <span className="text-[11px] font-semibold text-[#80868b] uppercase tracking-wider block">
                            Daftar Bab PRD Standar Industri:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {chapterTitles.map((ch) => (
                              <button
                                key={ch.num}
                                type="button"
                                onClick={() => {
                                  setActiveChapter(ch.num);
                                  const el = document.getElementById(`bab-${ch.num}`);
                                  if (el) el.scrollIntoView({ behavior: "smooth" });
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 border ${
                                  activeChapter === ch.num
                                    ? "bg-[#2E4540]/30 border-[#408175]/60 text-[#408175]"
                                    : "bg-[#1a1616] border-[#241f1f] text-[#9aa0a6] hover:text-white hover:bg-[#241f1f]"
                                }`}
                              >
                                <span className="font-mono text-[10px]">#{ch.num}</span>
                                <span>{ch.title}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Render Document */}
                        {prdViewMode === "preview" ? (
                          <div className="rounded-3xl border border-[#241f1f] bg-[#141111] p-6 sm:p-8 shadow-xl">
                            <MarkdownRenderer content={prdMarkdownSource} />
                          </div>
                        ) : (
                          <div className="relative rounded-2xl border border-[#241f1f] bg-[#0B0909] p-4 font-mono text-xs text-[#c4c7c5] overflow-x-auto shadow-inner">
                            <button
                              type="button"
                              onClick={() => handleCopy(prdMarkdownSource, "raw_copy")}
                              className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-[#141111] hover:bg-[#1a1616] text-white text-[11px] flex items-center gap-1 border border-[#241f1f]"
                            >
                              {copiedItem === "raw_copy" ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>Salin Raw</span>
                            </button>
                            <pre className="whitespace-pre-wrap leading-relaxed">
                              {prdMarkdownSource}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 2: SYSTEM FLOWCHART */}
                    {activeTab === "flow" && (
                      <div className="space-y-6 max-w-4xl mx-auto">
                        <div className="rounded-2xl border border-[#241f1f] bg-[#141111] p-4 flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-white">
                              Diagram Alur Sistem (Sequence Flow)
                            </h3>
                            <p className="text-xs text-[#80868b]">
                              Pemetaan proses bisnis dengan pengamanan Redis Lock dan batas waktu 24 jam
                            </p>
                          </div>
                          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                            Race Condition Mitigated
                          </span>
                        </div>

                        {compiledData.flowchartData ? (
                          <SystemFlowDiagram
                            rawCode={JSON.stringify(compiledData.flowchartData, null, 2)}
                            language="flow-json"
                          />
                        ) : (
                          <div className="rounded-2xl border border-[#241f1f] bg-[#141111] p-8 text-center text-xs text-[#80868b]">
                            Memuat diagram alur sistem...
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 3: POSTGRESQL SCHEMA (Visual ERD vs DDL SQL) */}
                    {activeTab === "database" && (
                      <div className="space-y-4 max-w-5xl mx-auto h-full flex flex-col">
                        <div className="rounded-2xl border border-[#241f1f] bg-[#141111] p-4 flex items-center justify-between shrink-0">
                          <div>
                            <h3 className="text-sm font-semibold text-white">
                              Skema PostgreSQL DDL (Normalisasi 3NF)
                            </h3>
                            <p className="text-xs text-[#80868b]">
                              Didukung UUID v7, foreign key cascading, index B-Tree, dan snapshot harga atomik
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(compiledData.databaseSchemaSql, "sql_copy")}
                            className="px-3 py-1.5 rounded-lg bg-[#141111] hover:bg-[#1a1616] text-white text-xs font-medium transition flex items-center gap-1.5 border border-[#241f1f]"
                          >
                            {copiedItem === "sql_copy" ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>Salin SQL</span>
                          </button>
                        </div>

                        {dbViewMode === "erd" ? (
                          <div className="flex-1 min-h-[460px]">
                            <VisualErdDiagram sql={compiledData.databaseSchemaSql} />
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-[#241f1f] bg-[#0B0909] p-5 font-mono text-xs text-sky-300 overflow-x-auto shadow-inner leading-relaxed">
                            <pre className="whitespace-pre">
                              {compiledData.databaseSchemaSql}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 4: LIVE WIREFRAME PROTOTYPE */}
                    {activeTab === "mockup" && (
                      <div className="space-y-6 max-w-5xl mx-auto h-full flex flex-col">
                        <InteractivePrototypePreview
                          appName={compiledData.appName}
                          architectureSummary={compiledData.architectureSummary}
                        />
                      </div>
                    )}

                    {/* TAB 5: UI MOCKUPS (DRIBBBLE) */}
                    {activeTab === "designs" && (
                      <div className="space-y-6 max-w-4xl mx-auto">
                        <div className="rounded-2xl border border-[#241f1f] bg-[#141111] p-4 flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-white">
                              Inspirasi Desain Antarmuka (Dribbble UI)
                            </h3>
                            <p className="text-xs text-[#80868b]">
                              Mockup aplikasi asli beresolusi tinggi sebagai acuan UI/UX engineering
                            </p>
                          </div>
                        </div>

                        {compiledData.dribbbleDesigns ? (
                          <DribbbleDesignShowcase
                            rawJson={JSON.stringify(compiledData.dribbbleDesigns, null, 2)}
                          />
                        ) : (
                          <div className="rounded-2xl border border-[#241f1f] bg-[#141111] p-8 text-center text-xs text-[#80868b]">
                            Memuat mockup antarmuka...
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. MODALS (Completeness, CLI Connect, Security Audit) */}
      <PrdCompletenessModal
        isOpen={isCompletenessModalOpen}
        onClose={() => setIsCompletenessModalOpen(false)}
        completeness={completenessResult}
        onCompleteChapter={handleSendMessageDirect}
      />

      <KodaCliConnectModal
        isOpen={isCliModalOpen}
        onClose={() => setIsCliModalOpen(false)}
        sessionId={activeSessionId || "session-booking-kos"}
        appName={compiledData.appName}
      />

      <PrdSecurityAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        auditResult={securityAuditResult}
        onFixWithAi={handleSendMessageDirect}
      />
    </div>
  );
}
