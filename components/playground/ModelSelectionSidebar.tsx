"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  Sparkles,
  Star,
  Copy,
  ExternalLink,
  Info,
  Volume2,
  Key,
  ShieldCheck,
  Plus,
  Trash2,
  Check,
  Eye,
  EyeOff,
  Cpu,
  Globe,
  Lock,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import {
  CustomAIModelConfig,
  PROVIDER_PRESETS,
  getCustomModels,
  saveCustomModel,
  deleteCustomModel,
  setActiveCustomModelId,
} from "@/lib/apps/custom-models";

export interface AIModelOption {
  id: string;
  name: string;
  codeName: string;
  category: "Featured" | "Gemini" | "Live" | "Images" | "Video" | "Audio" | "Music" | "Agents" | "Gemma";
  isNew?: boolean;
  isPaid?: boolean;
  description: string;
  pricing: string;
  knowledgeCutoff: string;
  releaseDate: string;
  isAudio?: boolean;
}

export const AVAILABLE_MODELS: AIModelOption[] = [
  {
    id: "gemini-4-argon",
    name: "Gemini 4 Argon",
    codeName: "gemini-4-argon",
    category: "Featured",
    isNew: true,
    isPaid: true,
    description:
      "Our most capable model, built to solve the hardest problems with depth and precision across real-world software engineering and knowledge work.",
    pricing: "All context lengths • Input: $2.00 / Output: $10.00 through November 30, 2026",
    knowledgeCutoff: "See model card",
    releaseDate: "Oct 13, 2026",
  },
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    codeName: "gemini-3.8-flash",
    category: "Featured",
    isNew: true,
    description:
      "Our most intelligent Flash model, engineered for long-horizon software engineering, autonomous agents, and complex enterprise workflows.",
    pricing: "All context lengths • Input: $0.75 / Output: $3.75 through December 31, 2026",
    knowledgeCutoff: "See model card",
    releaseDate: "Sep 2, 2026",
  },
  {
    id: "gemini-3.8-flash-tts",
    name: "Gemini 3.8 Flash TTS",
    codeName: "gemini-3.8-flash-tts",
    category: "Audio",
    isNew: true,
    isAudio: true,
    description:
      "Flagship TTS model for Voice Design and dual-speaker screenplay control. Prompt custom vocal personas, direct line-by-line delivery, and add vocal bursts.",
    pricing: "Text In / Audio out • Input: $0.50 / Output: $9.00",
    knowledgeCutoff: "Jul 2026",
    releaseDate: "Sep 23, 2026",
  },
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    codeName: "gemini-3.5-flash",
    category: "Featured",
    description:
      "Engineered for long-horizon software requirements engineering, autonomous agent flow generation, and missing requirement detection.",
    pricing: "All context lengths • Input: $0.075 / Output: $0.30",
    knowledgeCutoff: "See model card",
    releaseDate: "Jun 15, 2026",
  },
  {
    id: "gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash Lite",
    codeName: "gemini-3.5-flash-lite",
    category: "Gemini",
    description:
      "Our fastest, most cost-effective 3.5 model for high-throughput execution, interactive chats, and high-frequency tasks.",
    pricing: "Input: $0.0375 / Output: $0.15",
    knowledgeCutoff: "Apr 2026",
    releaseDate: "Jul 10, 2026",
  },
  {
    id: "gemini-3.5-pro",
    name: "Gemini 3.5 Pro",
    codeName: "gemini-3.5-pro",
    category: "Gemini",
    description:
      "Advanced multimodal reasoning model tailored for intricate code architectures, formal PRDs, and deep mathematical reasoning.",
    pricing: "Input: $1.25 / Output: $5.00",
    knowledgeCutoff: "May 2026",
    releaseDate: "May 1, 2026",
  },
];

const CATEGORIES = [
  "All",
  "Featured",
  "Custom AI 🔒",
  "Gemini",
  "Live",
  "Images",
  "Video",
  "Audio",
  "Music",
  "Agents",
  "Gemma",
] as const;

interface ModelSelectionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onSelectModel: (modelName: string) => void;
}

export function ModelSelectionSidebar({
  isOpen,
  onClose,
  selectedModel,
  onSelectModel,
}: ModelSelectionSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Featured");
  const [, setCopiedId] = useState<string | null>(null);

  // Custom AI Models State
  const [customModels, setCustomModels] = useState<CustomAIModelConfig[]>([]);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [formDisplayName, setFormDisplayName] = useState("");
  const [formModelName, setFormModelName] = useState("");
  const [formEndpointUrl, setFormEndpointUrl] = useState("https://api.openai.com/v1");
  const [formApiKey, setFormApiKey] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("OpenAI");

  // Load custom models on mount and when changed
  useEffect(() => {
    const load = () => {
      setCustomModels(getCustomModels());
    };
    load();
    window.addEventListener("koda_custom_models_updated", load);
    return () => window.removeEventListener("koda_custom_models_updated", load);
  }, []);

  if (!isOpen) return null;

  // Handle Preset Selection (Auto-fills endpoint and model identifier)
  const handleSelectPreset = (presetName: string) => {
    setSelectedPreset(presetName);
    const found = PROVIDER_PRESETS.find((p) => p.name === presetName);
    if (found) {
      setFormEndpointUrl(found.endpoint);
      if (found.popularModels[0]) {
        setFormModelName(found.popularModels[0]);
        if (!formDisplayName) {
          setFormDisplayName(`${presetName} (${found.popularModels[0]})`);
        }
      }
    }
  };

  // Save new custom model with AES-256-GCM encryption
  const handleSaveCustomModel = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formModelName.trim()) {
      setFormError("Nama model (Model Identifier) wajib diisi, contoh: deepseek-chat, gpt-4o");
      return;
    }
    if (!formEndpointUrl.trim()) {
      setFormError("URL Endpoint API wajib diisi, contoh: https://api.deepseek.com/v1");
      return;
    }
    if (!formApiKey.trim()) {
      setFormError("API Key wajib diisi untuk otentikasi provider Anda.");
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveCustomModel({
        name: formDisplayName.trim() || formModelName.trim(),
        modelName: formModelName.trim(),
        endpointUrl: formEndpointUrl.trim(),
        apiKey: formApiKey.trim(),
        providerPreset: selectedPreset,
      });

      // Clear form
      setFormDisplayName("");
      setFormModelName("");
      setFormApiKey("");
      setIsAddingCustom(false);

      // Select newly added custom model immediately
      setActiveCustomModelId(saved.id);
      onSelectModel(saved.name);
      onClose();
    } catch (err: any) {
      setFormError(`Gagal mengenkripsi dan menyimpan model: ${err?.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete custom model
  const handleDeleteCustomModel = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCustomModel(id);
  };

  // Filter models
  const isCustomCategoryActive = activeCategory === "Custom AI 🔒";

  const filteredStandardModels = AVAILABLE_MODELS.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.codeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === "All" || model.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const filteredCustomModels = customModels.filter((cm) => {
    return (
      cm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cm.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cm.endpointUrl.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <>
      {/* Semi-transparent Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40 transition-opacity"
      />

      {/* Slide-in Model Selection Sidebar (Right Side) */}
      <aside className="fixed top-0 right-0 z-50 w-full sm:w-[500px] md:w-[540px] h-screen bg-[#0B0909] border-l border-[#1f1a1a] text-[#c4c7c5] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 select-none">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f1a1a] shrink-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[15px] font-semibold text-[#f1f3f4] tracking-tight">
              Model selection
            </h2>
            {customModels.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#408175]/20 text-[#408175] border border-[#408175]/30">
                {customModels.length} Custom Model
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#1a1616] rounded-md transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-5 pt-3.5 pb-2 shrink-0">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#80868b] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari model bawaan atau custom endpoint..."
              className="w-full bg-[#141111] border border-[#241f1f] focus:border-[#408175] focus:outline-none rounded-lg pl-9 pr-3 py-2 text-xs text-[#f1f3f4] placeholder:text-[#80868b] transition"
            />
          </div>
        </div>

        {/* Filter Pills Category */}
        <div className="px-5 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-[#1f1a1a] pb-3 shrink-0">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            const isCustomPill = cat === "Custom AI 🔒";

            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  if (isCustomPill) setIsAddingCustom(false);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                  isActive
                    ? isCustomPill
                      ? "bg-[#2E4540] text-emerald-300 border border-[#408175]"
                      : "bg-[#2E4540]/40 text-white border border-[#408175]/60"
                    : isCustomPill
                    ? "bg-[#161313] text-[#408175] hover:bg-[#1a1616] border border-[#408175]/30"
                    : "bg-[#141111] text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#1a1616] border border-transparent"
                }`}
              >
                <span>{cat}</span>
                {isCustomPill && customModels.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#408175] text-white text-[9px] font-bold flex items-center justify-center ml-0.5">
                    {customModels.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* =============================================================== */}
          {/* 1. BUTTON / FORM: INPUT MODEL AI SENDIRI (BYO KEY & ENDPOINT)   */}
          {/* =============================================================== */}
          {!isAddingCustom ? (
            <div
              onClick={() => {
                setIsAddingCustom(true);
                setActiveCategory("Custom AI 🔒");
              }}
              className="p-3.5 rounded-xl border border-dashed border-[#408175]/60 bg-[#141111]/80 hover:bg-[#1a1616] hover:border-[#408175] transition cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#2E4540]/50 border border-[#408175]/40 flex items-center justify-center text-[#408175] group-hover:scale-105 transition">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Input Model AI Sendiri (BYO API Key)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" />
                      AES-256
                    </span>
                  </h4>
                  <p className="text-[11px] text-[#9aa0a6] mt-0.5">
                    Gunakan endpoint OpenAI, DeepSeek, Groq, OpenRouter, atau Ollama lokal
                  </p>
                </div>
              </div>

              <div className="w-6 h-6 rounded-md bg-[#1a1616] border border-[#241f1f] flex items-center justify-center text-[#408175] group-hover:bg-[#408175] group-hover:text-white transition">
                <Plus className="w-3.5 h-3.5" />
              </div>
            </div>
          ) : (
            /* ENCRYPTED CUSTOM MODEL INPUT FORM */
            <form
              onSubmit={handleSaveCustomModel}
              className="p-4 rounded-xl border border-[#408175]/60 bg-[#141111] space-y-3.5 shadow-xl animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between border-b border-[#241f1f] pb-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#408175]" />
                  <h4 className="text-xs font-bold text-white">Konfigurasi Model AI Sendiri</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(false)}
                  className="text-xs text-[#9aa0a6] hover:text-white transition"
                >
                  Batal
                </button>
              </div>

              {/* Provider Quick Presets */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#f1f3f4] flex items-center justify-between">
                  <span>Pilih Provider Cepat:</span>
                  <span className="text-[10px] text-[#80868b]">Otomatis isi endpoint</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PROVIDER_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleSelectPreset(preset.name)}
                      className={`px-2 py-1 rounded-md text-[10px] font-medium border transition cursor-pointer ${
                        selectedPreset === preset.name
                          ? "bg-[#2E4540] text-emerald-300 border-[#408175]"
                          : "bg-[#1a1616] text-[#9aa0a6] hover:text-white border-[#241f1f]"
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 1: Display Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[#c4c7c5]">
                  Nama Tampilan (Opsional)
                </label>
                <input
                  type="text"
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
                  placeholder="Misal: DeepSeek V3 (Production)"
                  className="w-full bg-[#0B0909] border border-[#241f1f] focus:border-[#408175] rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-[#646a70] focus:outline-none"
                />
              </div>

              {/* Field 2: Model Name Identifier */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[#c4c7c5] flex items-center justify-between">
                  <span>Nama Model (Model Identifier) *</span>
                  <span className="text-[10px] text-[#80868b]">Contoh: deepseek-chat, gpt-4o</span>
                </label>
                <input
                  type="text"
                  required
                  value={formModelName}
                  onChange={(e) => setFormModelName(e.target.value)}
                  placeholder="Contoh: deepseek-chat, gpt-4o, llama-3.3-70b-versatile"
                  className="w-full bg-[#0B0909] border border-[#241f1f] focus:border-[#408175] rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-[#646a70] focus:outline-none font-mono"
                />
              </div>

              {/* Field 3: URL Endpoint */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[#c4c7c5] flex items-center justify-between">
                  <span>URL Endpoint API *</span>
                  <span className="text-[10px] text-[#80868b]">OpenAI-compatible baseUrl</span>
                </label>
                <input
                  type="url"
                  required
                  value={formEndpointUrl}
                  onChange={(e) => setFormEndpointUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="w-full bg-[#0B0909] border border-[#241f1f] focus:border-[#408175] rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-[#646a70] focus:outline-none font-mono"
                />
              </div>

              {/* Field 4: API Key with Show/Hide Toggle */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[#c4c7c5] flex items-center justify-between">
                  <span>API Key *</span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Enkripsi Otomatis AES-256
                  </span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showApiKey ? "text" : "password"}
                    required
                    value={formApiKey}
                    onChange={(e) => setFormApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full bg-[#0B0909] border border-[#241f1f] focus:border-[#408175] rounded-lg pl-3 pr-9 py-1.5 text-xs text-white placeholder:text-[#646a70] focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 text-[#80868b] hover:text-white transition"
                    title={showApiKey ? "Sembunyikan API Key" : "Tampilkan API Key"}
                  >
                    {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Security Assurance Notice */}
              <div className="p-2.5 rounded-lg bg-[#0B0909] border border-[#241f1f] text-[10px] text-[#9aa0a6] space-y-1 leading-relaxed">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Enkripsi Lokal Aman (Client-Side AES-GCM 256)</span>
                </div>
                <p>
                  API key Anda dienkripsi secara lokal di browser dan tidak pernah disimpan dalam format teks polos (plain-text). Kunci didekripsi hanya di memori sementara saat mengirimkan permintaan AI.
                </p>
              </div>

              {formError && (
                <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#141111] hover:bg-[#1a1616] text-xs text-[#9aa0a6] hover:text-white transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 rounded-lg bg-[#408175] hover:bg-[#4ea092] disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-[#408175]/20 cursor-pointer"
                >
                  <Lock className="w-3 h-3" />
                  <span>{isSaving ? "Mengenkripsi..." : "Simpan & Gunakan Model"}</span>
                </button>
              </div>
            </form>
          )}

          {/* =============================================================== */}
          {/* 2. CUSTOM MODELS LIST (IF ANY SAVED)                            */}
          {/* =============================================================== */}
          {customModels.length > 0 && (!isAddingCustom || isCustomCategoryActive) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#80868b] px-0.5">
                <span className="font-semibold text-white flex items-center gap-1">
                  <Key className="w-3 h-3 text-[#408175]" />
                  <span>Model AI Kustom Anda:</span>
                </span>
                <span className="text-emerald-400 font-mono text-[10px]">Terenkripsi AES-256</span>
              </div>

              <div className="space-y-2.5">
                {filteredCustomModels.map((cm) => {
                  const isSelected =
                    selectedModel.toLowerCase().trim() === cm.name.toLowerCase().trim() ||
                    selectedModel.toLowerCase().trim() === cm.modelName.toLowerCase().trim();

                  return (
                    <div
                      key={cm.id}
                      onClick={() => {
                        setActiveCustomModelId(cm.id);
                        onSelectModel(cm.name);
                        onClose();
                      }}
                      className={`group relative rounded-xl p-3.5 cursor-pointer transition border ${
                        isSelected
                          ? "bg-[#1a1616] border-[#408175] shadow-sm ring-1 ring-[#408175]/50"
                          : "bg-[#141111] border-[#241f1f] hover:border-[#408175]/60 hover:bg-[#1a1616]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <div className="mt-0.5 w-6 h-6 rounded-md bg-[#2E4540]/50 border border-[#408175]/40 flex items-center justify-center shrink-0 text-[#408175]">
                            <Cpu className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-xs text-white truncate">
                                {cm.name}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#408175]/20 text-[#408175] font-semibold">
                                {cm.providerPreset || "Custom"}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono flex items-center gap-0.5">
                                <Lock className="w-2 h-2" />
                                Encrypted
                              </span>
                            </div>

                            <p className="text-[11px] font-mono text-[#80868b] mt-1 truncate">
                              Model: <span className="text-[#c4c7c5]">{cm.modelName}</span>
                            </p>
                            <p className="text-[10px] font-mono text-[#646a70] truncate mt-0.5">
                              URL: {cm.endpointUrl} · Key: {cm.maskedKey}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#408175] text-white">
                              Aktif
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCustomModel(cm.id, e)}
                            className="p-1 rounded text-[#80868b] hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                            title="Hapus Model Kustom"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* 3. STANDARD BUILT-IN MODELS (Featured, Gemini, etc.)            */}
          {/* =============================================================== */}
          {!isCustomCategoryActive && (
            <div className="space-y-3">
              <div className="text-[11px] font-semibold text-[#80868b] px-0.5">
                Model Bawaan Koda Studio (Google Gemini Waterfall):
              </div>

              {filteredStandardModels.length === 0 ? (
                <div className="text-center py-8 text-[#80868b] text-xs">
                  Tidak ada model bawaan yang cocok dengan pencarian Anda.
                </div>
              ) : (
                filteredStandardModels.map((model) => {
                  const isSelected =
                    selectedModel.toLowerCase().trim() === model.name.toLowerCase().trim() ||
                    selectedModel.toLowerCase().trim() === model.codeName.toLowerCase().trim();

                  return (
                    <div
                      key={model.id}
                      onClick={() => {
                        setActiveCustomModelId(null);
                        onSelectModel(model.name);
                        onClose();
                      }}
                      className={`group relative rounded-xl p-4 cursor-pointer transition border ${
                        isSelected
                          ? "bg-[#1a1616] border-[#408175] shadow-sm ring-1 ring-[#408175]/40"
                          : "bg-[#141111] border-[#241f1f] hover:border-[#408175]/60 hover:bg-[#1a1616]"
                      }`}
                    >
                      {/* Top Row: Icon, Title, Badges & Action Buttons */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 w-6 h-6 rounded-md bg-[#1a1616] flex items-center justify-center shrink-0 border border-[#241f1f]">
                            {model.isAudio ? (
                              <Volume2 className="w-3.5 h-3.5 text-[#B5B9F0]" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5 text-[#408175]" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-[#f1f3f4]">
                                {model.name}
                              </span>
                              {model.isNew && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#2E4540]/40 text-[#408175] border border-[#408175]/40">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#408175]" />
                                  New
                                </span>
                              )}
                              {model.isPaid && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#B5B9F0]/15 text-[#B5B9F0] border border-[#B5B9F0]/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#B5B9F0]" />
                                  Paid
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-[#80868b] mt-0.5 block">
                              {model.codeName}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#408175] text-white shrink-0">
                            Aktif
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[#9aa0a6] mt-2.5 leading-relaxed">
                        {model.description}
                      </p>

                      {/* Pricing */}
                      <div className="flex items-center gap-1.5 text-xs text-[#80868b] mt-3">
                        <span className="text-[#9aa0a6]">$</span>
                        <span className="truncate">{model.pricing}</span>
                      </div>

                      {/* Footer Metadata */}
                      <div className="flex items-center justify-between text-[11px] text-[#646a70] mt-3 pt-2.5 border-t border-[#1f1a1a]">
                        <span>Knowledge cutoff: {model.knowledgeCutoff}</span>
                        <span>Release date: {model.releaseDate}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
