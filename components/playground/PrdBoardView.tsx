"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Check,
  Download,
  Sparkles,
  Layers,
  FileText,
  Database,
  Image as ImageIcon,
  Terminal,
  Play,
  Pause,
  ExternalLink,
  Code,
  Eye,
  CheckCircle2,
  Cpu,
} from "lucide-react";
import { getAppById } from "@/lib/apps/storage";
import { ChatMessage, KodaApp } from "@/lib/apps/types";
import { compilePrdFromMessages, CompiledPrdData } from "@/lib/ai/prd-compiler";
import { SystemFlowDiagram } from "@/components/playground/SystemFlowDiagram";
import { DribbbleDesignShowcase } from "@/components/playground/DribbbleDesignShowcase";
import { MarkdownRenderer } from "@/components/playground/MarkdownRenderer";

interface PrdBoardViewProps {
  appId?: string;
}

export function PrdBoardView({ appId }: PrdBoardViewProps) {
  const router = useRouter();
  const [app, setApp] = useState<KodaApp | null>(null);
  const [activeTab, setActiveTab] = useState<"readme" | "flow" | "database" | "designs" | "agent">("readme");
  const [readmeViewMode, setReadmeViewMode] = useState<"preview" | "raw">("preview");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Animated Agent Cursor States
  const [isCursorActive, setIsCursorActive] = useState(true);
  const [cursorPos, setCursorPos] = useState({ x: 260, y: 180 });
  const [cursorStep, setCursorStep] = useState(0);
  const [cursorMessage, setCursorMessage] = useState("KODA Architect: Membaca memori percakapan...");

  // Load app data from local storage
  useEffect(() => {
    if (appId) {
      const loaded = getAppById(appId);
      if (loaded) {
        setApp(loaded);
        return;
      }
    }

    // Fallback: check recent saved app
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("koda_saved_apps");
        if (raw) {
          const list = JSON.parse(raw);
          if (list && list.length > 0) {
            setApp(list[0]);
          }
        }
      } catch (e) {}
    }
  }, [appId]);

  // Compile PRD from messages
  const compiledData: CompiledPrdData = React.useMemo(() => {
    const msgs: ChatMessage[] = app?.messages || [];
    return compilePrdFromMessages(msgs, app?.title || "Sistem Aplikasi Modern");
  }, [app]);

  // Animated Cursor Simulation (Stitch-style interactive board tour)
  useEffect(() => {
    if (!isCursorActive) return;

    const tourSteps = [
      {
        x: 240,
        y: 190,
        tab: "readme" as const,
        msg: "KODA Agent: Menggabungkan keputusan arsitektur & aturan bisnis...",
      },
      {
        x: 420,
        y: 260,
        tab: "flow" as const,
        msg: "KODA Agent: Memetakan alur sequence & validasi anti-race condition...",
      },
      {
        x: 580,
        y: 220,
        tab: "database" as const,
        msg: "KODA Agent: Merancang skema PostgreSQL DDL & audit log...",
      },
      {
        x: 740,
        y: 200,
        tab: "designs" as const,
        msg: "KODA Agent: Menyelaraskan inspirasi mockup antarmuka Dribbble...",
      },
      {
        x: 360,
        y: 180,
        tab: "readme" as const,
        msg: "Selesai! PRD & README.md siap diunduh dan dieksekusi AI Coding Agent.",
      },
    ];

    const timer = setInterval(() => {
      setCursorStep((prev) => {
        const next = (prev + 1) % tourSteps.length;
        const target = tourSteps[next];
        setCursorPos({ x: target.x, y: target.y });
        setCursorMessage(target.msg);
        return next;
      });
    }, 4200);

    return () => clearInterval(timer);
  }, [isCursorActive]);

  const handleCopy = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleDownloadReadme = () => {
    const element = document.createElement("a");
    const file = new Blob([compiledData.readmeMarkdown], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `${compiledData.appName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_README.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-[#0B0909] text-[#f1f3f4] flex flex-col font-sans select-none overflow-x-hidden relative">
      {/* ✦ Virtual AI Agent Cursor (Stitch Style) */}
      {isCursorActive && (
        <div
          className="fixed pointer-events-none z-50 transition-all duration-1000 ease-out hidden md:flex items-center gap-2"
          style={{
            transform: `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0)`,
          }}
        >
          {/* Glowing cursor arrow */}
          <svg className="w-5 h-5 text-[#408175] drop-shadow-[0_0_8px_rgba(64,129,117,0.8)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3l7 18 3-7 7-3L3 3z" />
          </svg>
          {/* Floating Agent Badge */}
          <div className="bg-[#141111]/95 text-white border border-[#408175]/60 px-2.5 py-1 rounded-full text-[11px] font-medium shadow-2xl backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap animate-in fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-[#408175] animate-ping" />
            <span>{cursorMessage}</span>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="h-14 border-b border-[#1f1a1a] bg-[#141111] px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-1.5 rounded-lg text-[#9aa0a6] hover:text-white hover:bg-[#1a1616] transition flex items-center gap-1.5 text-xs font-medium"
            title="Kembali ke Chat Playground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali ke Obrolan</span>
          </button>

          <div className="h-4 w-px bg-[#241f1f]" />

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#2E4540]/30 text-[#408175] flex items-center justify-center font-bold text-xs border border-[#408175]/30">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <span>{compiledData.appName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1616] text-[#408175] border border-[#408175]/40 font-mono">
                  PRD Board
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-2">
          {/* Cursor tour toggle */}
          <button
            type="button"
            onClick={() => setIsCursorActive(!isCursorActive)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 border ${
              isCursorActive
                ? "bg-[#2E4540]/30 border-[#408175]/50 text-[#408175]"
                : "bg-transparent border-[#241f1f] text-[#9aa0a6] hover:text-white"
            }`}
            title="Toggle Animasi Kursor AI"
          >
            {isCursorActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isCursorActive ? "Pause Agent" : "Live Agent"}</span>
          </button>

          <button
            type="button"
            onClick={() => handleCopy(compiledData.readmeMarkdown, "readme_top")}
            className="px-3 py-1.5 rounded-lg bg-[#1a1616] hover:bg-[#241f1f] text-white text-xs font-medium transition flex items-center gap-1.5 border border-[#241f1f]"
            title="Salin README.md ke Clipboard"
          >
            {copiedSection === "readme_top" ? (
              <Check className="w-3.5 h-3.5 text-[#408175]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Salin README.md</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadReadme}
            className="px-3.5 py-1.5 rounded-lg bg-[#408175] hover:bg-[#4ea092] text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-md shadow-[#408175]/20"
            title="Unduh README.md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh .md</span>
          </button>
        </div>
      </header>

      {/* Main Board Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Stitch-Style Step Progress Tracker */}
        <div className="rounded-2xl border border-[#241f1f] bg-[#141111] p-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#241f1f]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9aa0a6]">
                Alur Konstruksi Arsitektur (KODA Stitch Engine)
              </span>
            </div>
            <div className="text-[11px] text-[#80868b] font-mono">
              Status: <span className="text-emerald-400 font-semibold">Tersintesis Penuh</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3.5">
            {[
              {
                step: "01",
                title: "Sintesis Memori",
                desc: `${compiledData.chosenOptions.length} Keputusan Tercatat`,
                done: true,
              },
              {
                step: "02",
                title: "System Flowchart",
                desc: `${compiledData.flowchartData?.nodes.length || 0} Langkah Terpetakan`,
                done: true,
              },
              {
                step: "03",
                title: "Database Schema",
                desc: "PostgreSQL DDL + Locking",
                done: true,
              },
              {
                step: "04",
                title: "README.md Final",
                desc: "Spesifikasi Siap Produksi",
                done: true,
              },
            ].map((st, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-[#241f1f] bg-[#1a1616] flex items-start gap-2.5"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-[#80868b]">{st.step}.</span>
                    <span>{st.title}</span>
                  </div>
                  <p className="text-[11px] text-[#9aa0a6] mt-0.5 leading-tight">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[#241f1f]">
          {[
            { id: "readme", label: "README.md Dokumen PRD", icon: FileText },
            { id: "flow", label: "Diagram Alur Sistem", icon: Layers },
            { id: "database", label: "Skema Database SQL", icon: Database },
            { id: "designs", label: "Mockup UI Dribbble", icon: ImageIcon },
            { id: "agent", label: "Prompt AI Coding Agent", icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap border ${
                  isActive
                    ? "bg-[#2E4540]/30 text-white border-[#408175] shadow-md"
                    : "bg-transparent text-[#9aa0a6] border-transparent hover:text-white hover:bg-[#141111]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#408175]" : "text-[#80868b]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: README.md Panel */}
        {activeTab === "readme" && (
          <div className="rounded-2xl border border-[#241f1f] bg-[#141111] shadow-2xl overflow-hidden flex flex-col">
            {/* README Panel Sub-header */}
            <div className="px-5 py-3.5 bg-[#1a1616] border-b border-[#241f1f] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#408175]">README.md</span>
                <span className="text-[11px] text-[#80868b]">
                  • Disusun berdasarkan seluruh jawaban wawancara arsitektur
                </span>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                {/* View Mode Toggle: Preview vs Raw */}
                <div className="bg-[#141111] p-0.5 rounded-lg border border-[#241f1f] flex items-center">
                  <button
                    type="button"
                    onClick={() => setReadmeViewMode("preview")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition ${
                      readmeViewMode === "preview" ? "bg-[#2E4540]/40 text-white shadow" : "text-[#9aa0a6] hover:text-white"
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Tampilan Rapi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReadmeViewMode("raw")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition ${
                      readmeViewMode === "raw" ? "bg-[#2E4540]/40 text-white shadow" : "text-[#9aa0a6] hover:text-white"
                    }`}
                  >
                    <Code className="w-3 h-3" />
                    <span>Raw Markdown</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(compiledData.readmeMarkdown, "readme_body")}
                  className="px-2.5 py-1 rounded-lg bg-[#141111] hover:bg-[#1a1616] text-[#c4c7c5] hover:text-white text-[11px] font-medium flex items-center gap-1.5 border border-[#241f1f] transition"
                >
                  {copiedSection === "readme_body" ? <Check className="w-3 h-3 text-[#408175]" /> : <Copy className="w-3 h-3" />}
                  <span>Salin Dokumen</span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 sm:p-8 bg-[#0B0909]">
              {readmeViewMode === "preview" ? (
                <div className="max-w-4xl mx-auto prose prose-invert prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-p:text-[#d0d0d0] prose-li:text-[#d0d0d0]">
                  <MarkdownRenderer content={compiledData.readmeMarkdown} />
                </div>
              ) : (
                <pre className="max-w-5xl mx-auto font-mono text-[12.5px] leading-relaxed text-[#c4c7c5] bg-[#0B0909] p-5 rounded-xl border border-[#241f1f] overflow-x-auto whitespace-pre-wrap select-text">
                  {compiledData.readmeMarkdown}
                </pre>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: System Flow Diagram */}
        {activeTab === "flow" && (
          <div className="space-y-4">
            {compiledData.flowchartData ? (
              <SystemFlowDiagram
                rawCode={JSON.stringify(compiledData.flowchartData, null, 2)}
                language="flow-json"
              />
            ) : (
              <div className="p-8 text-center text-xs text-[#80868b] border border-[#241f1f] rounded-2xl bg-[#141111]">
                Belum ada diagram alur yang dihasilkan di sesi obrolan ini.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Database Schema SQL */}
        {activeTab === "database" && (
          <div className="rounded-2xl border border-[#241f1f] bg-[#141111] shadow-xl overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 bg-[#1a1616] border-b border-[#241f1f] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#408175]" />
                <span className="text-xs font-semibold text-white">PostgreSQL 15+ Schema DDL (Anti-Race Condition)</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(compiledData.databaseSchemaSql, "db_sql")}
                className="px-2.5 py-1 rounded-lg bg-[#141111] hover:bg-[#1a1616] text-[#c4c7c5] hover:text-white text-[11px] font-medium flex items-center gap-1.5 border border-[#241f1f] transition"
              >
                {copiedSection === "db_sql" ? <Check className="w-3 h-3 text-[#408175]" /> : <Copy className="w-3 h-3" />}
                <span>Salin Script SQL</span>
              </button>
            </div>
            <div className="p-5 bg-[#0B0909] overflow-x-auto">
              <pre className="font-mono text-xs text-[#408175] leading-relaxed select-text">
                {compiledData.databaseSchemaSql}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 4: Dribbble Mockups */}
        {activeTab === "designs" && (
          <div>
            {compiledData.dribbbleDesigns ? (
              <DribbbleDesignShowcase
                rawJson={JSON.stringify(compiledData.dribbbleDesigns, null, 2)}
              />
            ) : (
              <div className="p-8 text-center text-xs text-[#80868b] border border-[#241f1f] rounded-2xl bg-[#141111]">
                Belum ada inspirasi desain Dribbble yang terhubung.
              </div>
            )}
          </div>
        )}

        {/* Tab 5: AI Coding Agent Prompt */}
        {activeTab === "agent" && (
          <div className="rounded-2xl border border-[#241f1f] bg-[#141111] shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#241f1f]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#2E4540]/30 text-[#408175] flex items-center justify-center font-bold text-xs border border-[#408175]/30">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white">
                    Master Prompt untuk AI Coding Agent (Cursor, Devin, Claude Code, v0)
                  </h4>
                  <p className="text-[11px] text-[#9aa0a6]">
                    Salin prompt ini langsung ke AI coding agent Anda untuk mulai meng-coding aplikasi ini tanpa tebak-tebakan
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(compiledData.agentPrompt, "agent_prompt")}
                className="px-3 py-1.5 rounded-lg bg-[#408175] hover:bg-[#4ea092] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow shadow-[#408175]/20"
              >
                {copiedSection === "agent_prompt" ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Salin Prompt Master</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0909] border border-[#241f1f]">
              <pre className="font-mono text-xs text-[#e3e3e3] leading-relaxed whitespace-pre-wrap select-text">
                {compiledData.agentPrompt}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
