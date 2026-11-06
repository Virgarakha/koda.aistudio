"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/playground/Sidebar";
import { RunSettings } from "@/components/playground/RunSettings";
import { Header } from "@/components/playground/Header";
import { HeroShowcase } from "@/components/playground/HeroShowcase";
import { PromptInput } from "@/components/playground/PromptInput";
import { GoogleIcon } from "@/components/playground/GoogleIcon";
import { useUserProfile } from "@/hooks/use-user-profile";
import { ChatMessage, KodaApp, FileAttachment } from "@/lib/apps/types";
import {
  saveApp,
  getAppById,
  generateTitleFromPrompt,
} from "@/lib/apps/storage";
import { compilePrdFromMessages } from "@/lib/ai/prd-compiler";
import {
  Sparkles,
  Bot,
  Copy,
  Check,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText,
  MessageSquare,
  Wrench,
} from "lucide-react";
import { MarkdownRenderer } from "@/components/playground/MarkdownRenderer";
import { AiTool, AVAILABLE_AI_TOOLS } from "@/lib/ai/tools";
import { ModelSelectionSidebar } from "@/components/playground/ModelSelectionSidebar";
import { SystemInstructionsSidebar } from "@/components/playground/SystemInstructionsSidebar";
import { ToolThread } from "@/lib/apps/types";
import {
  ProductDiscoveryCard,
  ProductDiscoveryData,
} from "@/components/playground/ProductDiscoveryCard";

interface PlaygroundViewProps {
  appId?: string;
}

export function PlaygroundView({ appId }: PlaygroundViewProps) {
  const router = useRouter();
  const { userEmail, userTier, avatarUrl } = useUserProfile();
  const [userImgError, setUserImgError] = useState(false);
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "K";

  const [currentAppId, setCurrentAppId] = useState<string | undefined>(appId);
  const [appTitle, setAppTitle] = useState<string>("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [isModelSelectionOpen, setIsModelSelectionOpen] = useState(false);
  const [isSystemInstructionsOpen, setIsSystemInstructionsOpen] = useState(false);
  const [systemInstructions, setSystemInstructions] = useState("");
  const [groundingEnabled, setGroundingEnabled] = useState(true);
  const [selectedModel, setSelectedModel] = useState("Gemini 3.5 Flash");
  const [thinkingLevel, setThinkingLevel] = useState("Medium");
  const [promptText, setPromptText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});

  // Active Thread & Tool Hierarchy (Parent Chat vs Child Tool Chat)
  const [activeThreadId, setActiveThreadId] = useState<string>("main"); // "main" = Obrolan Utama, else tool.id
  const [selectedTool, setSelectedTool] = useState<AiTool | null>(null);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);

  // Conversations: Obrolan Utama (mainMessages) & Obrolan Anak per Tool (toolThreads)
  const [mainMessages, setMainMessages] = useState<ChatMessage[]>([]);
  const [toolThreads, setToolThreads] = useState<Record<string, ToolThread>>({});

  const isChildThread = activeThreadId !== "main";
  const currentDisplayMessages: ChatMessage[] = isChildThread
    ? toolThreads[activeThreadId]?.messages || []
    : mainMessages;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  // Load existing app if appId is provided
  useEffect(() => {
    if (appId) {
      const app = getAppById(appId);
      if (app) {
        setCurrentAppId(app.id);
        setAppTitle(app.title);
        setMainMessages(app.messages || []);
        if (app.toolThreads) {
          setToolThreads(app.toolThreads);
        } else {
          setToolThreads({});
        }
        if (app.model) setSelectedModel(app.model);
      }
    } else {
      // New Chat
      setCurrentAppId(undefined);
      setAppTitle("");
      setMainMessages([]);
      setToolThreads({});
      setActiveThreadId("main");
      setSelectedTool(null);
    }
  }, [appId]);

  // Auto-scroll to bottom on new messages, loading state, or thread change
  useEffect(() => {
    if (currentDisplayMessages.length > 0) {
      scrollToBottom("smooth");
    }
  }, [currentDisplayMessages.length, isLoading, activeThreadId]);

  const handleSelectPrompt = (text: string) => {
    setPromptText(text);
  };

  const handleNewChat = () => {
    setCurrentAppId(undefined);
    setAppTitle("");
    setMainMessages([]);
    setToolThreads({});
    setActiveThreadId("main");
    setSelectedTool(null);
    setPromptText("");
    router.push("/playground/new_chat");
  };

  const toggleThought = (id: string) => {
    setExpandedThoughts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle Tool Activation (Creates or switches to child thread)
  const handleSelectTool = (tool: AiTool | null) => {
    setSelectedTool(tool);
    if (!tool) {
      setActiveThreadId("main");
    } else {
      setActiveThreadId(tool.id);
      setToolThreads((prev) => {
        if (prev[tool.id]) return prev;
        return {
          ...prev,
          [tool.id]: {
            toolId: tool.id,
            title: tool.name,
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        };
      });
    }
  };

  const handleSendMessage = async (
    textToSend: string,
    attachmentsToSend?: FileAttachment[]
  ) => {
    const hasText = textToSend && textToSend.trim().length > 0;
    const hasAttachments = attachmentsToSend && attachmentsToSend.length > 0;
    if ((!hasText && !hasAttachments) || isLoading) return;

    const userMsgId = `u-${Date.now()}`;
    const modelMsgId = `m-${Date.now()}`;

    const effectiveText = hasText
      ? textToSend.trim()
      : "Mohon analisis file atau foto yang saya lampirkan.";

    const userMessage: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: effectiveText,
      attachments: attachmentsToSend,
      createdAt: new Date().toISOString(),
    };

    const currentThreadMessages = isChildThread
      ? toolThreads[activeThreadId]?.messages || []
      : mainMessages;

    const newMessages: ChatMessage[] = [...currentThreadMessages, userMessage];

    // Optimistically update the active thread
    if (isChildThread) {
      setToolThreads((prev) => ({
        ...prev,
        [activeThreadId]: {
          ...(prev[activeThreadId] || {
            toolId: activeThreadId,
            title: selectedTool?.name || activeThreadId,
            createdAt: new Date().toISOString(),
          }),
          messages: newMessages,
          updatedAt: new Date().toISOString(),
        },
      }));
    } else {
      setMainMessages(newMessages);
    }

    setPromptText("");
    setIsLoading(true);
    setTimeout(() => scrollToBottom("smooth"), 50);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
            attachments: m.attachments,
          })),
          // Connect conversational memory from Obrolan Utama to child tool thread!
          parentMessages: isChildThread
            ? mainMessages.map((m) => ({
                role: m.role,
                content: m.content,
              }))
            : [],
          toolId: isChildThread
            ? activeThreadId
            : selectedTool
            ? selectedTool.id
            : null,
          model: selectedModel,
          thinkingLevel,
          groundingSearch: groundingEnabled,
          systemInstructions: systemInstructions.trim() || undefined,
        }),
      });

      const data = await response.json();
      const fullContent = data.content || "Tidak ada respon dari model.";

      // Initial empty model message for typing animation
      const placeholderModelMessage: ChatMessage = {
        id: modelMsgId,
        role: "model",
        content: "",
        thought: data.thought,
        sources: data.sources,
        tokens: data.tokens || 180,
        time: data.time || "1.0s",
        createdAt: new Date().toISOString(),
      };

      const messagesWithPlaceholder = [...newMessages, placeholderModelMessage];

      if (isChildThread) {
        setToolThreads((prev) => ({
          ...prev,
          [activeThreadId]: {
            ...(prev[activeThreadId] || {
              toolId: activeThreadId,
              title: selectedTool?.name || activeThreadId,
              createdAt: new Date().toISOString(),
            }),
            messages: messagesWithPlaceholder,
            updatedAt: new Date().toISOString(),
          },
        }));
      } else {
        setMainMessages(messagesWithPlaceholder);
      }

      setTypingMessageId(modelMsgId);
      setIsLoading(false); // Stop loading spinner, start typing
      setTimeout(() => scrollToBottom("smooth"), 50);

      // Smooth typewriter streaming animation
      let charIndex = 0;
      const totalLen = fullContent.length;
      const chunkStep = Math.max(2, Math.ceil(totalLen / 100));

      await new Promise<void>((resolve) => {
        let lastScrollHeight = 0;
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

          if (isChildThread) {
            setToolThreads((prev) => ({
              ...prev,
              [activeThreadId]: {
                ...(prev[activeThreadId] || {
                  toolId: activeThreadId,
                  title: selectedTool?.name || activeThreadId,
                  createdAt: new Date().toISOString(),
                }),
                messages: (prev[activeThreadId]?.messages || []).map((m) =>
                  m.id === modelMsgId ? { ...m, content: currentSlice } : m
                ),
                updatedAt: new Date().toISOString(),
              },
            }));
          } else {
            setMainMessages((prev) =>
              prev.map((m) =>
                m.id === modelMsgId ? { ...m, content: currentSlice } : m
              )
            );
          }

          if (chatContainerRef.current) {
            const el = chatContainerRef.current;
            const currentH = el.scrollHeight;
            if (currentH > lastScrollHeight + 20) {
              lastScrollHeight = currentH;
              el.scrollTop = currentH;
            }
          }
        }, 22);
      });

      const finalModelMessage: ChatMessage = {
        ...placeholderModelMessage,
        content: fullContent,
      };

      const finalMessages = [...newMessages, finalModelMessage];

      let updatedMain = mainMessages;
      let updatedThreads = toolThreads;

      if (isChildThread) {
        updatedThreads = {
          ...toolThreads,
          [activeThreadId]: {
            ...(toolThreads[activeThreadId] || {
              toolId: activeThreadId,
              title: selectedTool?.name || activeThreadId,
              createdAt: new Date().toISOString(),
            }),
            messages: finalMessages,
            updatedAt: new Date().toISOString(),
          },
        };
        setToolThreads(updatedThreads);
      } else {
        updatedMain = finalMessages;
        setMainMessages(updatedMain);
      }

      setTimeout(() => scrollToBottom("smooth"), 100);

      let activeId = currentAppId;
      let activeTitle = appTitle;

      if (!activeId) {
        activeId = `app-${Date.now()}`;
        activeTitle = generateTitleFromPrompt(textToSend);
        setCurrentAppId(activeId);
        setAppTitle(activeTitle);
        window.history.replaceState(null, "", `/playground/${activeId}`);
      }

      const appData: KodaApp = {
        id: activeId,
        title: activeTitle,
        description: textToSend.substring(0, 100),
        model: selectedModel,
        tier: userTier,
        status: "interviewing",
        messages: updatedMain,
        toolThreads: updatedThreads,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userEmail: userEmail || undefined,
      };

      await saveApp(appData);
    } catch (err) {
      console.error("Chat error:", err);
      const fallbackModelMessage: ChatMessage = {
        id: modelMsgId,
        role: "model",
        content:
          "Maaf, terjadi kesalahan saat menghubungi engine AI. Silakan coba kirim kembali.",
        time: "0.2s",
        createdAt: new Date().toISOString(),
      };

      if (isChildThread) {
        setToolThreads((prev) => ({
          ...prev,
          [activeThreadId]: {
            ...(prev[activeThreadId] || {
              toolId: activeThreadId,
              title: selectedTool?.name || activeThreadId,
              createdAt: new Date().toISOString(),
            }),
            messages: [...newMessages, fallbackModelMessage],
            updatedAt: new Date().toISOString(),
          },
        }));
      } else {
        setMainMessages([...newMessages, fallbackModelMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRun = async (attachments?: FileAttachment[]) => {
    await handleSendMessage(promptText, attachments);
  };

  // Handle Product Discovery Form Submit (starts child thread with structured info)
  const handleProductDiscoverySubmit = async (data: ProductDiscoveryData) => {
    const discoveryPrompt = `Saya ingin memulai Product Discovery untuk aplikasi ini:

1. **Ide Produk:** ${data.idea || "Belum ditentukan secara spesifik"}
2. **Latar Belakang / Pemahaman IT:** ${data.userBackground || "Awam / Non-IT (Pemula)"}
3. **Target Pengguna:** ${data.targetUser || "Umum / Pengguna aplikasi"}
4. **Platform Produk:** ${data.platform}
5. **Tahap Pengembangan:** ${data.stage}
6. **Tech Stack:** ${data.techStack || "Belum ditentukan (rekomendasikan yang terbaik)"}

Catatan Penting: Saya berlatar belakang "${data.userBackground || "Non-IT"}". Tolong gunakan bahasa dan analogi bisnis yang ramah, tidak terlalu rumit/teknis, dan jangan gunakan istilah server/jaringan yang membingungkan orang non-IT. Mohon pandu saya dengan opsi yang mudah dipahami.`;

    await handleSendMessage(discoveryPrompt);
  };

  // Compile / Download PRD: Downloads the complete PRD Markdown document directly
  const handleCompilePRD = async () => {
    let activeId = currentAppId;
    const prdMessages = toolThreads["prd_builder"]?.messages || [];
    const aggregatedMessages = [...mainMessages, ...prdMessages];

    if (!activeId && aggregatedMessages.length > 0) {
      activeId = `app-${Date.now()}`;
      const title =
        appTitle ||
        generateTitleFromPrompt(
          aggregatedMessages[0]?.content || "Aplikasi Baru"
        );
      const appData: KodaApp = {
        id: activeId,
        title,
        description:
          aggregatedMessages[0]?.content?.substring(0, 100) || "PRD Project",
        model: selectedModel,
        tier: userTier,
        status: "interviewing",
        messages: mainMessages,
        toolThreads,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userEmail: userEmail || undefined,
      };
      await saveApp(appData);
      setCurrentAppId(activeId);
    }

    // Find latest full PRD content in messages
    let prdContent = "";
    for (let i = aggregatedMessages.length - 1; i >= 0; i--) {
      const msg = aggregatedMessages[i];
      if (
        msg.role === "model" &&
        (msg.content.includes("## 1. Latar belakang") ||
          msg.content.includes("Product Requirements Document") ||
          msg.content.includes("prd-ready-json"))
      ) {
        prdContent = msg.content;
        break;
      }
    }

    if (!prdContent && aggregatedMessages.length > 0) {
      const compiled = compilePrdFromMessages(aggregatedMessages, appTitle || "Aplikasi");
      prdContent = compiled.readmeMarkdown;
    }

    const cleanContent = prdContent
      .replace(/```(?:prd-ready-json|prd-action-json)[\s\S]*?```/g, "")
      .trim();

    const fileName = (appTitle || "PRD_Dokumen")
      .replace(/[^a-zA-Z0-9_\u0600-\u06FF\s-]/g, "")
      .trim()
      .replace(/\s+/g, "_") || "PRD_Dokumen";

    const docText =
      cleanContent ||
      `# Product Requirements Document (PRD)\n\n# ${appTitle || "Aplikasi"}\n\nDokumen PRD telah berhasil disusun.`;

    const blob = new Blob([docText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}_PRD.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Extract last user idea from main chat to pre-fill discovery form
  const lastMainUserMsg =
    [...mainMessages].reverse().find((m) => m.role === "user")?.content || "";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#131314] text-[#f1f3f4] font-sans">
      {/* 1. Left Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* 2. Main Middle Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#131314]">
        {/* Top Header */}
        <Header
          onNewChat={handleNewChat}
          isSettingsOpen={settingsOpen}
          onToggleSettings={() => setSettingsOpen(!settingsOpen)}
          selectedModel={selectedModel}
          onOpenModelSelection={() => setIsModelSelectionOpen(true)}
          onCompilePRD={handleCompilePRD}
        />

        {/* Thread Navigation Bar: Obrolan Utama vs Obrolan Anak (Connected Memory) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2 border-b border-[#282a2c] bg-[#161718] text-xs shrink-0 select-none">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
            {/* Obrolan Utama Tab */}
            <button
              type="button"
              onClick={() => {
                setActiveThreadId("main");
                setSelectedTool(null);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium transition cursor-pointer shrink-0 ${
                activeThreadId === "main"
                  ? "bg-[#282a2c] text-white border border-[#3c4043] shadow-sm"
                  : "text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#202123]"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#8ab4f8]" />
              <span>Obrolan Utama</span>
              {mainMessages.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#3c4043] text-[#c4c7c5]">
                  {mainMessages.length}
                </span>
              )}
            </button>

            {/* Child Threads Tabs */}
            {Object.entries(toolThreads).map(([tId, thread]) => {
              const toolMeta = AVAILABLE_AI_TOOLS.find((t) => t.id === tId);
              const isActive = activeThreadId === tId;
              return (
                <div key={tId} className="flex items-center shrink-0">
                  <span className="text-[#5f6368] mx-0.5 text-xs">›</span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveThreadId(tId);
                      if (toolMeta) setSelectedTool(toolMeta);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                      isActive
                        ? "bg-[#2d3238] text-[#d97736] border border-[#d97736]/50 shadow-sm"
                        : "text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#202123]"
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5 text-[#d97736]" />
                    <span>{thread.title}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#1c1d20] border border-[#d97736]/30 text-[#d97736]">
                      Anak
                    </span>
                    {thread.messages.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#3c4043] text-[#c4c7c5]">
                        {thread.messages.length}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Memory Connection Status Badge */}
          {activeThreadId !== "main" ? (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#9aa0a6] bg-[#1e1f20] px-2.5 py-1 rounded-full border border-[#282a2c] shrink-0 ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[#c4c7c5]">Memori Terhubung dengan Obrolan Utama</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#9aa0a6] shrink-0 ml-2">
              <span>Konteks Obrolan Utama</span>
            </div>
          )}
        </div>

        {/* Center Canvas Body */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto flex flex-col justify-between relative"
        >
          {currentDisplayMessages.length === 0 ? (
            /* Empty State: Product Discovery Card for PRD Tool Child Thread or Hero Showcase */
            activeThreadId === "prd_builder" ? (
              <div className="my-auto py-6 px-4">
                <ProductDiscoveryCard
                  onSubmit={handleProductDiscoverySubmit}
                  initialIdea={lastMainUserMsg}
                  isLoading={isLoading}
                />
              </div>
            ) : (
              <div className="my-auto py-10">
                <HeroShowcase onSelectPrompt={handleSelectPrompt} />
              </div>
            )
          ) : (
            /* Active Conversation View */
            <div className="max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
              {appTitle && (
                <div className="text-center pb-2">
                  <h1 className="text-base font-semibold text-white tracking-tight">
                    {appTitle}
                  </h1>
                  <span className="text-[11px] text-[#80868b]">
                    Tersimpan di My apps • {currentDisplayMessages.length} pesan
                    {isChildThread ? ` (${toolThreads[activeThreadId]?.title || "Obrolan Anak"})` : ""}
                  </span>
                </div>
              )}

              {currentDisplayMessages.map((msg) => (
                <div key={msg.id} className="w-full">
                  {msg.role === "user" ? (
                    /* User Bubble: Right-aligned pill/rounded box with attachment previews */
                    <div className="flex flex-col items-end mb-6">
                      {/* Attachments preview if available */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2.5 justify-end mb-2 max-w-[85%] sm:max-w-[75%]">
                          {msg.attachments.map((att, idx) =>
                            att.type.startsWith("image/") ? (
                              <div
                                key={idx}
                                className="relative group rounded-2xl overflow-hidden border border-[#3c4043] bg-black/40 shadow-md max-w-[280px] max-h-[220px]"
                              >
                                <img
                                  src={att.data}
                                  alt={att.name}
                                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 flex items-center justify-between">
                                  <span className="text-[11px] text-white truncate max-w-[180px]">
                                    {att.name}
                                  </span>
                                  <span className="text-[10px] text-[#9aa0a6]">
                                    {(att.size / 1024).toFixed(0)} KB
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div
                                key={idx}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-[#282a2c] border border-[#3c4043] text-xs text-white shadow-sm"
                              >
                                <div className="p-1.5 rounded-lg bg-[#18191a] text-[#d97736]">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col min-w-0 pr-1">
                                  <span className="font-medium text-white truncate max-w-[160px]">
                                    {att.name}
                                  </span>
                                  <span className="text-[10px] text-[#9aa0a6]">
                                    {(att.size / 1024).toFixed(1)} KB
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                      <div className="max-w-[75%] sm:max-w-[70%] bg-[#282a2c] text-[#f1f3f4] px-6 py-3.5 rounded-3xl rounded-tr-md text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap selection:bg-[#3c4043] border border-[#37393b]/50 shadow-sm">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    /* AI Model: Full-width clean canvas flow (like Gemini / Claude) */
                    <div className="w-full space-y-3 mb-8">
                      {/* Optional thinking badge if exists */}
                      {msg.thought && (
                        <div className="mb-2">
                          <button
                            onClick={() => toggleThought(msg.id)}
                            className="inline-flex items-center gap-1.5 text-[11.5px] text-[#9aa0a6] hover:text-[#f1f3f4] font-medium py-1 transition"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Proses Berpikir</span>
                            {expandedThoughts[msg.id] ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                          {expandedThoughts[msg.id] && (
                            <p className="mt-1 text-xs leading-relaxed text-[#9aa0a6] font-mono bg-[#1a1b1d] border border-[#282a2c] p-3 rounded-xl whitespace-pre-wrap">
                              {msg.thought}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Main Clean Markdown Content with Interactive Interview Support & Typing Animation */}
                      <div className="text-sm leading-relaxed text-[#e3e3e3]">
                        <MarkdownRenderer
                          content={msg.content}
                          onAnswerQuestion={handleSendMessage}
                          onCompilePRD={handleCompilePRD}
                          isTyping={typingMessageId === msg.id}
                        />
                      </div>

                      {/* Clean Gemini Footer Toolbar: Thumbs up, Thumbs down, Copy, More */}
                      <div className="flex items-center gap-1 pt-2 text-[#9aa0a6]">
                        <button
                          type="button"
                          className="p-1.5 hover:text-white hover:bg-[#282a2c] rounded-md transition"
                          title="Bagus (Thumbs up)"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017a2 2 0 01-1.414-.586l-4.243-4.243A2 2 0 015 14.757V10a2 2 0 012-2h4l.879-3.515A2 2 0 0113.828 3h.172a2 2 0 012 2v5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="p-1.5 hover:text-white hover:bg-[#282a2c] rounded-md transition"
                          title="Kurang bagus (Thumbs down)"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 011.414.586l4.243 4.243A2 2 0 0119 9.243V14a2 2 0 01-2 2h-4l-.879 3.515A2 2 0 0110.172 21h-.172a2 2 0 01-2-2v-5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(msg.id, msg.content)}
                          className="p-1.5 hover:text-white hover:bg-[#282a2c] rounded-md transition"
                          title="Salin respon"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          className="p-1.5 hover:text-white hover:bg-[#282a2c] rounded-md transition"
                          title="Opsi lainnya"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="5" r="1.5" />
                            <circle cx="12" cy="12" r="1.5" />
                            <circle cx="12" cy="19" r="1.5" />
                          </svg>
                        </button>
                        {msg.time && (
                          <span className="text-[11px] font-mono opacity-60 ml-2">
                            {msg.time}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2.5 py-3 px-1 text-white animate-in fade-in duration-200">
                  <div className="w-3.5 h-3.5 border-2 border-white/25 border-t-white rounded-full animate-spin shrink-0" />
                  <span className="text-sm font-normal text-white tracking-wide">
                    Koda Thinking...
                  </span>
                </div>
              )}

              {/* Spacer anchor to ensure the last message and toolbar are comfortably visible above PromptInput */}
              <div ref={messagesEndRef} className="h-36 sm:h-44 pointer-events-none" />
            </div>
          )}

          {/* Floating Bottom Prompt Bar with Dynamic Tools */}
          <div className="sticky bottom-0 bg-gradient-to-t from-[#131314] via-[#131314] to-transparent pt-4">
            <PromptInput
              value={promptText}
              onChange={setPromptText}
              onSubmit={handleRun}
              isLoading={isLoading}
              groundingEnabled={groundingEnabled}
              onToggleGrounding={() => setGroundingEnabled(!groundingEnabled)}
              onOpenToolsModal={() => setSettingsOpen(true)}
              selectedTool={selectedTool}
              onSelectTool={handleSelectTool}
            />
          </div>
        </div>
      </div>

      {/* 3. Right Settings Sidebar */}
      <RunSettings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        groundingEnabled={groundingEnabled}
        setGroundingEnabled={setGroundingEnabled}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        thinkingLevel={thinkingLevel}
        setThinkingLevel={setThinkingLevel}
        systemInstructions={systemInstructions}
        setSystemInstructions={setSystemInstructions}
        onOpenModelSelection={() => setIsModelSelectionOpen(true)}
        onOpenSystemInstructions={() => setIsSystemInstructionsOpen(true)}
      />

      {/* 4. Model Selection Slide-in Sidebar (Google AI Studio) */}
      <ModelSelectionSidebar
        isOpen={isModelSelectionOpen}
        onClose={() => setIsModelSelectionOpen(false)}
        selectedModel={selectedModel}
        onSelectModel={(modelName) => setSelectedModel(modelName)}
      />

      {/* 5. System Instructions Slide-in Sidebar (Google AI Studio) */}
      <SystemInstructionsSidebar
        isOpen={isSystemInstructionsOpen}
        onClose={() => setIsSystemInstructionsOpen(false)}
        systemInstructions={systemInstructions}
        onChangeSystemInstructions={setSystemInstructions}
      />
    </div>
  );
}
