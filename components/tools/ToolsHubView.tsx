"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Plus,
  ChevronDown,
  MessageSquare,
  Check,
  Layers,
  Box,
  TrendingUp,
  CheckSquare,
  Store,
  Users,
  Megaphone,
  MapPin,
  Film,
  GraduationCap,
  FileSpreadsheet,
  Database,
  ExternalLink,
  GitBranch,
  Cloud,
  FileText,
  Hash,
  PenTool,
  Globe,
  Palette,
  Workflow,
  Terminal,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import { Sidebar } from "@/components/playground/Sidebar";
import { useSidebarCollapse } from "@/hooks/use-sidebar-collapse";

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  byline: string;
  category: "skills" | "connectors" | "plugins";
  section?: "for_you" | "new_skills";
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}

// 1. Featured Green Banner Data
const FEATURED_HERO = {
  overline: "From Anthropic",
  title: "Data",
  description:
    "Query, chart and explain your data — SQL, spreadsheets and dashboards in one place.",
  buttonText: "Add",
  href: "/playground/new_chat?tool=data",
};

// 2. "For you" Skills List
const FOR_YOU_SKILLS: ToolItem[] = [
  {
    id: "productivity",
    name: "Productivity",
    description:
      "Manage tasks, plan your day, and build up memory of important context about your...",
    byline: "by Anthropic · 3.4M Installs",
    category: "skills",
    section: "for_you",
    icon: Layers,
    href: "/tools/prd-builder?tool=productivity",
  },
  {
    id: "product_management",
    name: "Product Management",
    description:
      "Write feature specs, plan roadmaps, and synthesize user research faster. Keep...",
    byline: "by Anthropic · 1.8M Installs",
    category: "skills",
    section: "for_you",
    icon: Box,
    href: "/tools/prd-builder",
  },
  {
    id: "sales",
    name: "Sales",
    description:
      "Prep calls, summarize and follow up, research accounts, review deals and...",
    byline: "by Anthropic · 1.6M Installs",
    category: "skills",
    section: "for_you",
    icon: TrendingUp,
    href: "/tools/prd-builder?tool=sales",
  },
  {
    id: "operations",
    name: "Operations",
    description:
      "Optimize business operations — vendor management, process documentation,...",
    byline: "by Anthropic · 1.5M Installs",
    category: "skills",
    section: "for_you",
    icon: CheckSquare,
    href: "/tools/prd-builder?tool=operations",
  },
  {
    id: "small_business",
    name: "Small Business",
    description:
      "Pre-built small business workflows to help you run and grow your business. Supports...",
    byline: "by Anthropic · 1.2M Installs",
    category: "skills",
    section: "for_you",
    icon: Store,
    href: "/tools/prd-builder?tool=small_business",
  },
  {
    id: "human_resources",
    name: "Human Resources",
    description:
      "Streamline people operations — recruiting, onboarding, performance reviews,...",
    byline: "by Anthropic · 899.8K Installs",
    category: "skills",
    section: "for_you",
    icon: Users,
    href: "/tools/prd-builder?tool=hr",
  },
];

// 3. "New skills" List
const NEW_SKILLS: ToolItem[] = [
  {
    id: "black_seo",
    name: "Black SEO Analyzer",
    description:
      "Technical SEO audits from Claude, run on Black SEO Analyzer's servers: check one...",
    byline: "Anthropic Directory",
    category: "skills",
    section: "new_skills",
    icon: Megaphone,
    href: "/tools/prd-builder?tool=seo",
  },
  {
    id: "brek_hotels",
    name: "Brek Hotels",
    description:
      "Search hotels by destination and check a named hotel's room prices for the traveler'...",
    byline: "Anthropic Directory",
    category: "skills",
    section: "new_skills",
    icon: MapPin,
    href: "/tools/prd-builder?tool=hotels",
  },
  {
    id: "captino",
    name: "Captino",
    description:
      "Generate captions, subtitles, and transcription for video content with AI timing...",
    byline: "Anthropic Directory",
    category: "skills",
    section: "new_skills",
    icon: Film,
    href: "/tools/prd-builder?tool=captino",
  },
  {
    id: "learn",
    name: "learn",
    description:
      "Master any technical topic with adaptive spaced repetition and coding flashcards...",
    byline: "Anthropic Directory",
    category: "skills",
    section: "new_skills",
    icon: GraduationCap,
    href: "/tools/prd-builder?tool=learn",
  },
  {
    id: "prd_builder",
    name: "PRD & Concurrency Architect",
    description:
      "13 Bab PRD, interactive sequence flow, concurrency locking, and PostgreSQL 3NF DDL...",
    byline: "Official Studio · 2.5M Installs",
    category: "skills",
    section: "new_skills",
    icon: FileSpreadsheet,
    href: "/tools/prd-builder",
  },
  {
    id: "postgres_schema",
    name: "PostgreSQL Schema Engine",
    description:
      "Design production-ready PostgreSQL schemas, UUID v7, indexing, and ACID audit triggers...",
    byline: "Anthropic Directory · 1.1M Installs",
    category: "skills",
    section: "new_skills",
    icon: Database,
    href: "/tools/prd-builder?tool=postgres",
  },
];

// 4. Connectors Tab List
const CONNECTORS_LIST: ToolItem[] = [
  {
    id: "github",
    name: "GitHub",
    description:
      "Sync repositories, review pull requests, create issues and automate CI/CD actions.",
    byline: "by Anthropic · 4.2M Installs",
    category: "connectors",
    icon: GitBranch,
    href: "/tools/prd-builder?connector=github",
  },
  {
    id: "postgres_conn",
    name: "PostgreSQL & Supabase",
    description:
      "Direct database queries, schema inspection, live migrations, and row-level security.",
    byline: "by Anthropic · 3.1M Installs",
    category: "connectors",
    icon: Database,
    href: "/tools/prd-builder?connector=postgres",
  },
  {
    id: "google_drive",
    name: "Google Drive & Docs",
    description:
      "Access team folders, read research documents, and extract product requirements.",
    byline: "by Anthropic · 2.8M Installs",
    category: "connectors",
    icon: Cloud,
    href: "/tools/prd-builder?connector=gdrive",
  },
  {
    id: "notion",
    name: "Notion",
    description:
      "Bi-directional sync with product roadmaps, sprint backlogs, and engineering specs.",
    byline: "by Anthropic · 2.4M Installs",
    category: "connectors",
    icon: FileText,
    href: "/tools/prd-builder?connector=notion",
  },
  {
    id: "slack",
    name: "Slack",
    description:
      "Send deployment notifications, channel summaries, and AI agent status updates.",
    byline: "by Anthropic · 1.9M Installs",
    category: "connectors",
    icon: Hash,
    href: "/tools/prd-builder?connector=slack",
  },
  {
    id: "figma",
    name: "Figma",
    description:
      "Inspect design tokens, color variables, typography scales, and UI component layouts.",
    byline: "by Anthropic · 2.7M Installs",
    category: "connectors",
    icon: PenTool,
    href: "/tools/prd-builder?connector=figma",
  },
];

// 5. Plugins Tab List
const PLUGINS_LIST: ToolItem[] = [
  {
    id: "web_search",
    name: "Web Grounding & Live Search",
    description:
      "Real-time web search for market research, tech stacks, documentation, and benchmarks.",
    byline: "by Anthropic · 5.1M Installs",
    category: "plugins",
    icon: Globe,
    href: "/tools/prd-builder?plugin=search",
  },
  {
    id: "dribbble_scout",
    name: "Dribbble UI Scout",
    description:
      "Live curated UI/UX mockups, designer profiles, and modern component visual palettes.",
    byline: "by Anthropic · 1.4M Installs",
    category: "plugins",
    icon: Palette,
    href: "/tools/prd-builder?plugin=dribbble",
  },
  {
    id: "mermaid_flow",
    name: "Mermaid Flowchart Engine",
    description:
      "Render visual interactive flowcharts, sequence diagrams, and architecture state machines.",
    byline: "by Anthropic · 2.2M Installs",
    category: "plugins",
    icon: Workflow,
    href: "/tools/prd-builder?plugin=mermaid",
  },
  {
    id: "code_sandbox",
    name: "Code Sandbox Executor",
    description:
      "Safe isolated sandbox environment to run, test, and verify TypeScript and SQL snippets.",
    byline: "by Anthropic · 3.0M Installs",
    category: "plugins",
    icon: Terminal,
    href: "/tools/prd-builder?plugin=sandbox",
  },
];

export function ToolsHubView() {
  const router = useRouter();
  const { sidebarCollapsed, setSidebarCollapsed, toggleSidebar } = useSidebarCollapse();

  // Filter & Nav States
  const [activeCategory, setActiveCategory] = useState<"skills" | "connectors" | "plugins">("skills");
  const [activeView, setActiveView] = useState<"yours" | "discover">("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Track installed tools
  const [installedIds, setInstalledIds] = useState<Set<string>>(
    new Set(["product_management", "prd_builder"])
  );

  const toggleInstall = (id: string, name: string) => {
    setInstalledIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        triggerToast(`"${name}" dihapus dari Yours.`);
      } else {
        next.add(id);
        triggerToast(`"${name}" ditambahkan ke Yours.`);
      }
      return next;
    });
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Filtered skills for "For you"
  const filteredForYou = useMemo(() => {
    let list = FOR_YOU_SKILLS;
    if (activeView === "yours") {
      list = list.filter((item) => installedIds.has(item.id));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.byline.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeView, installedIds, searchQuery]);

  // Filtered skills for "New skills"
  const filteredNewSkills = useMemo(() => {
    let list = NEW_SKILLS;
    if (activeView === "yours") {
      list = list.filter((item) => installedIds.has(item.id));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.byline.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeView, installedIds, searchQuery]);

  // Filtered connectors
  const filteredConnectors = useMemo(() => {
    let list = CONNECTORS_LIST;
    if (activeView === "yours") {
      list = list.filter((item) => installedIds.has(item.id));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.byline.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeView, installedIds, searchQuery]);

  // Filtered plugins
  const filteredPlugins = useMemo(() => {
    let list = PLUGINS_LIST;
    if (activeView === "yours") {
      list = list.filter((item) => installedIds.has(item.id));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.byline.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeView, installedIds, searchQuery]);

  // Render a single Customize card
  const renderCard = (item: ToolItem) => {
    const IconComp = item.icon;
    const isInstalled = installedIds.has(item.id);

    return (
      <div
        key={item.id}
        className="group rounded-2xl bg-[#141111] hover:bg-[#1a1616] border border-[#241f1f] hover:border-[#408175]/40 p-4 transition duration-200 flex items-start justify-between gap-3.5 shadow-sm"
      >
        {/* Left: Icon inside rounded dark container */}
        <div className="w-10 h-10 rounded-xl bg-[#1a1616] border border-[#241f1f] flex items-center justify-center shrink-0 text-[#a8abb0] group-hover:text-white transition-colors">
          <IconComp className="w-5 h-5" />
        </div>

        {/* Middle: Content */}
        <div className="flex-1 min-w-0 pr-1">
          <h4 className="text-sm font-semibold text-[#f1f3f4] tracking-tight group-hover:text-white transition-colors truncate">
            {item.name}
          </h4>
          <p className="text-xs text-[#9aa0a6] leading-relaxed line-clamp-2 mt-1">
            {item.description}
          </p>
          <p className="text-[11px] text-[#6e7277] font-normal mt-1.5 truncate">
            {item.byline}
          </p>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
          {/* Try button */}
          <Link
            href={
              item.id === "product_management" ||
              item.id === "prd_builder" ||
              item.id === "prd_architect"
                ? "/playground/new_chat?tool=prd_builder"
                : `/playground/new_chat?tool=${item.id}`
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1616] hover:bg-[#241f1f] text-white text-xs font-medium border border-[#241f1f] hover:border-[#408175]/40 transition cursor-pointer shadow-sm active:scale-95"
            title={`Coba ${item.name}`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#9aa0a6]" />
            <span>Try</span>
          </Link>

          {/* Add / Install button */}
          <button
            type="button"
            onClick={() => toggleInstall(item.id, item.name)}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border transition cursor-pointer shadow-sm active:scale-95 ${
              isInstalled
                ? "bg-[#2E4540]/40 border-[#408175]/60 text-[#408175] hover:bg-[#2E4540]/60"
                : "bg-[#1a1616] hover:bg-[#241f1f] border-[#241f1f] text-[#9aa0a6] hover:text-white"
            }`}
            title={isInstalled ? "Terpasang (Klik untuk hapus)" : "Tambah ke koleksi Anda"}
          >
            {isInstalled ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#0B0909] text-[#f1f3f4] font-sans overflow-hidden select-none">
      {/* 1. Left Collapsible Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* 2. Main Customize View */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#141111] border border-[#241f1f] text-white text-xs font-medium shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <Check className="w-4 h-4 text-[#408175] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Inner Content Container */}
        <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-8 sm:py-10 space-y-7">
          {/* A. Top Title */}
          <div className="flex items-center gap-3">
            {sidebarCollapsed && (
              <button
                type="button"
                onClick={toggleSidebar}
                className="p-1.5 -ml-1 text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#1a1616] rounded-lg transition cursor-pointer"
                title="Buka sidebar"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-3xl sm:text-4xl font-serif text-[#f1f3f4] font-normal tracking-tight">
              Customize
            </h1>
          </div>

          {/* B. Controls Bar (Pills + Search + Add) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
            {/* Left Pill Button Groups */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Category Segment: Skills | Connectors | Plugins */}
              <div className="flex items-center bg-[#141111] p-1 rounded-xl border border-[#241f1f]">
                <button
                  type="button"
                  onClick={() => setActiveCategory("skills")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeCategory === "skills"
                      ? "bg-[#2E4540]/40 text-[#408175] shadow-sm border border-[#408175]/40"
                      : "text-[#9aa0a6] hover:text-[#f1f3f4]"
                  }`}
                >
                  Skills
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory("connectors")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeCategory === "connectors"
                      ? "bg-[#2E4540]/40 text-[#408175] shadow-sm border border-[#408175]/40"
                      : "text-[#9aa0a6] hover:text-[#f1f3f4]"
                  }`}
                >
                  Connectors
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory("plugins")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeCategory === "plugins"
                      ? "bg-[#2E4540]/40 text-[#408175] shadow-sm border border-[#408175]/40"
                      : "text-[#9aa0a6] hover:text-[#f1f3f4]"
                  }`}
                >
                  Plugins
                </button>
              </div>

              {/* View Segment: Yours | Discover */}
              <div className="flex items-center bg-[#141111] p-1 rounded-xl border border-[#241f1f]">
                <button
                  type="button"
                  onClick={() => setActiveView("yours")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeView === "yours"
                      ? "bg-[#2E4540]/40 text-[#408175] shadow-sm border border-[#408175]/40"
                      : "text-[#9aa0a6] hover:text-[#f1f3f4]"
                  }`}
                >
                  Yours
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView("discover")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeView === "discover"
                      ? "bg-[#2E4540]/40 text-[#408175] shadow-sm border border-[#408175]/40"
                      : "text-[#9aa0a6] hover:text-[#f1f3f4]"
                  }`}
                >
                  Discover
                </button>
              </div>
            </div>

            {/* Right Controls: Search, Filter, Sort, + Add Button */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search Box */}
              <div className="relative w-52 sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#717579] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#141111] border border-[#241f1f] focus:border-[#408175]/60 rounded-lg text-[#f1f3f4] placeholder-[#717579] outline-none transition"
                />
              </div>

              {/* Filter Button */}
              <button
                type="button"
                className="p-2 rounded-lg bg-[#141111] hover:bg-[#1a1616] border border-[#241f1f] text-[#9aa0a6] hover:text-white transition cursor-pointer"
                title="Filter"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>

              {/* Sort Button */}
              <button
                type="button"
                className="p-2 rounded-lg bg-[#141111] hover:bg-[#1a1616] border border-[#241f1f] text-[#9aa0a6] hover:text-white transition cursor-pointer"
                title="Sort"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>

              {/* + Add Dropdown Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#e5e5e5] text-[#0B0909] text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#0B0909]" />
                  <span>Add</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#0B0909] opacity-70" />
                </button>

                {showAddMenu && (
                  <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl bg-[#141111] border border-[#241f1f] py-1 shadow-2xl z-30 animate-in fade-in duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddMenu(false);
                        router.push("/tools/prd-builder");
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-[#f1f3f4] hover:bg-[#1a1616] flex items-center gap-2.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#408175]" />
                      <span>Buat Custom Skill Baru</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddMenu(false);
                        triggerToast("Membuka dialog OpenAPI Schema...");
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-[#f1f3f4] hover:bg-[#1a1616] flex items-center gap-2.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#8ab4f8]" />
                      <span>Import OpenAPI / Swagger</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddMenu(false);
                        triggerToast("Membuka konfigurasi MCP Server...");
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-[#f1f3f4] hover:bg-[#1a1616] flex items-center gap-2.5 transition"
                    >
                      <Terminal className="w-3.5 h-3.5 text-[#408175]" />
                      <span>Connect MCP Server (JSON)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* C. FEATURED HERO BANNER ("Data" / Anthropic Green Card) */}
          {activeCategory === "skills" && activeView === "discover" && !searchQuery && (
            <div className="relative rounded-2xl bg-[#152a1e] border border-[#264834] p-6 sm:p-7 overflow-hidden shadow-lg transition-all">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                <div className="space-y-1.5 max-w-xl">
                  <span className="text-[13px] font-medium text-[#8ebf9f]">
                    {FEATURED_HERO.overline}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif text-white font-normal tracking-tight">
                    {FEATURED_HERO.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#a3c4b0] leading-relaxed pt-1 max-w-lg">
                    {FEATURED_HERO.description}
                  </p>
                  <div className="pt-3">
                    <Link
                      href={FEATURED_HERO.href}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-white hover:bg-[#e5e5e5] text-[#0B0909] text-xs font-semibold transition shadow-sm"
                    >
                      <span>{FEATURED_HERO.buttonText}</span>
                    </Link>
                  </div>
                </div>

                {/* Right Side Illustration: Crisp SVG Spreadsheet + Trendline Badge */}
                <div className="shrink-0 self-center sm:self-auto pr-2">
                  <svg
                    viewBox="0 0 110 90"
                    fill="none"
                    className="w-24 sm:w-28 h-20 sm:h-24 text-white drop-shadow-md"
                  >
                    {/* Spreadsheet outer frame */}
                    <rect
                      x="4"
                      y="4"
                      width="76"
                      height="60"
                      rx="6"
                      stroke="#8ebf9f"
                      strokeWidth="2.5"
                      fill="#12241a"
                    />
                    {/* Horizontal rows */}
                    <line x1="4" y1="24" x2="80" y2="24" stroke="#8ebf9f" strokeWidth="2" />
                    <line x1="4" y1="44" x2="80" y2="44" stroke="#8ebf9f" strokeWidth="2" />
                    {/* Vertical columns */}
                    <line x1="28" y1="4" x2="28" y2="64" stroke="#8ebf9f" strokeWidth="2" />
                    <line x1="54" y1="4" x2="54" y2="64" stroke="#8ebf9f" strokeWidth="2" />

                    {/* Circular trendline badge overlay on bottom right */}
                    <circle
                      cx="66"
                      cy="56"
                      r="20"
                      fill="#152a1e"
                      stroke="#8ebf9f"
                      strokeWidth="2.5"
                    />
                    {/* Trendline graph curve inside badge */}
                    <path
                      d="M54 62 L60 55 L65 59 L74 48 L78 52"
                      stroke="#8ebf9f"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="74" cy="48" r="2" fill="#8ebf9f" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* D. SECTION 1: "For you" (Skills Tab) */}
          {activeCategory === "skills" && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#f1f3f4]">
                  {activeView === "yours" ? "Your skills" : "For you"}
                </h3>
              </div>

              {filteredForYou.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#141111] border border-[#241f1f] text-center space-y-2">
                  <p className="text-xs text-[#9aa0a6]">
                    {searchQuery
                      ? "Tidak ada skill yang cocok dengan pencarian."
                      : "Belum ada skill yang ditambahkan ke koleksi Yours."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredForYou.map(renderCard)}
                </div>
              )}
            </div>
          )}

          {/* E. SECTION 2: "New skills" (Skills Tab) */}
          {activeCategory === "skills" && activeView === "discover" && (
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#f1f3f4]">New skills</h3>
                <Link
                  href="/tools/prd-builder"
                  className="text-xs text-[#9aa0a6] hover:text-white flex items-center gap-1 transition"
                >
                  <span>Show all</span>
                  <span>→</span>
                </Link>
              </div>

              {filteredNewSkills.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#141111] border border-[#241f1f] text-center space-y-2">
                  <p className="text-xs text-[#9aa0a6]">
                    Tidak ada skill yang cocok dengan pencarian.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredNewSkills.map(renderCard)}
                </div>
              )}
            </div>
          )}

          {/* F. CONNECTORS TAB VIEW */}
          {activeCategory === "connectors" && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#f1f3f4]">
                  {activeView === "yours" ? "Your Connectors" : "All Connectors"}
                </h3>
              </div>

              {filteredConnectors.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#141111] border border-[#241f1f] text-center space-y-2">
                  <p className="text-xs text-[#9aa0a6]">
                    Tidak ada connector yang cocok dengan filter atau pencarian.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredConnectors.map(renderCard)}
                </div>
              )}
            </div>
          )}

          {/* G. PLUGINS TAB VIEW */}
          {activeCategory === "plugins" && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#f1f3f4]">
                  {activeView === "yours" ? "Your Plugins" : "Available Plugins"}
                </h3>
              </div>

              {filteredPlugins.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#141111] border border-[#241f1f] text-center space-y-2">
                  <p className="text-xs text-[#9aa0a6]">
                    Tidak ada plugin yang cocok dengan filter atau pencarian.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredPlugins.map(renderCard)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
