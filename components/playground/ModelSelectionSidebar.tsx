"use client";

import React, { useState } from "react";
import {
  X,
  Search,
  Sparkles,
  Star,
  Copy,
  ExternalLink,
  Info,
  Volume2,
} from "lucide-react";

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

  if (!isOpen) return null;

  const filteredModels = AVAILABLE_MODELS.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.codeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === "All" || model.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCopyCodeName = (codeName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(codeName);
    setCopiedId(codeName);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <>
      {/* Semi-transparent Backdrop for focused selection */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40 transition-opacity"
      />

      {/* Slide-in Model Selection Sidebar (Right Side) */}
      <aside className="fixed top-0 right-0 z-50 w-full sm:w-[480px] md:w-[520px] h-screen bg-[#18191a] border-l border-[#282a2c] text-[#c4c7c5] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 select-none">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#282a2c]">
          <h2 className="text-[15px] font-semibold text-[#f1f3f4] tracking-tight">
            Model selection
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#282a2c] rounded-md transition"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-5 pt-3.5 pb-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#80868b] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a model or agent"
              className="w-full bg-[#212224] border border-[#2e3032] focus:border-[#d97736] focus:outline-none rounded-lg pl-9 pr-3 py-2 text-xs text-[#f1f3f4] placeholder:text-[#80868b] transition"
            />
          </div>
        </div>

        {/* Filter Pills Category */}
        <div className="px-5 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-[#282a2c]/60 pb-3">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? "bg-[#282a2c] text-[#f1f3f4] border border-[#5f6368]"
                    : "bg-[#212224] text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#282a2c] border border-transparent"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Model Cards List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
          {filteredModels.length === 0 ? (
            <div className="text-center py-12 text-[#80868b] text-xs">
              No models match your search criteria.
            </div>
          ) : (
            filteredModels.map((model) => {
              const isSelected =
                selectedModel.toLowerCase().trim() === model.name.toLowerCase().trim() ||
                selectedModel.toLowerCase().trim() === model.codeName.toLowerCase().trim();

              return (
                <div
                  key={model.id}
                  onClick={() => {
                    onSelectModel(model.name);
                    onClose();
                  }}
                  className={`group relative rounded-xl p-4 cursor-pointer transition border ${
                    isSelected
                      ? "bg-[#282a2c] border-[#d97736] shadow-sm ring-1 ring-[#d97736]/40"
                      : "bg-[#212224] border-[#2e3032] hover:border-[#444746] hover:bg-[#252729]"
                  }`}
                >
                  {/* Top Row: Icon, Title, Badges & Action Buttons */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 w-6 h-6 rounded-md bg-[#282a2c] flex items-center justify-center shrink-0 border border-[#3c4043]/50">
                        {model.isAudio ? (
                          <Volume2 className="w-3.5 h-3.5 text-[#a8c7fa]" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-[#a8c7fa]" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-[#f1f3f4]">
                            {model.name}
                          </span>
                          {model.isNew && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#1b2f27] text-[#6dd58c] border border-[#234838]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#6dd58c]" />
                              New
                            </span>
                          )}
                          {model.isPaid && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#242b35] text-[#a8c7fa] border border-[#344054]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#a8c7fa]" />
                              Paid
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-[#80868b] mt-0.5">
                          {model.codeName}
                        </p>
                      </div>
                    </div>

                    {/* Actions: Favorite & Copy */}
                    <div className="flex items-center gap-1 text-[#80868b] opacity-75 group-hover:opacity-100 transition">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="p-1 hover:text-[#f1f3f4] hover:bg-[#282a2c] rounded transition"
                        title="Favorite"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleCopyCodeName(model.codeName, e)}
                        className="p-1 hover:text-[#f1f3f4] hover:bg-[#282a2c] rounded transition"
                        title="Copy Model Name"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="p-1 hover:text-[#f1f3f4] hover:bg-[#282a2c] rounded transition"
                        title="Open Documentation"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-2.5 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-[#9aa0a6]">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#80868b]" />
                    <span>{model.description}</span>
                  </div>

                  {/* Pricing / Terms */}
                  <div className="mt-2 flex items-start justify-between gap-2 text-[11px] text-[#80868b]">
                    <div className="flex items-start gap-1.5">
                      <span className="font-semibold text-[#c4c7c5]">$</span>
                      <span>{model.pricing}</span>
                    </div>
                    <span className="text-[#a8c7fa] hover:underline whitespace-nowrap text-[11px]">
                      Learn more
                    </span>
                  </div>

                  {/* Cutoff & Release Date */}
                  <div className="mt-2 pt-2 border-t border-[#2e3032]/60 flex items-center justify-between text-[11px] text-[#80868b]">
                    <div className="flex items-center gap-1">
                      <span>Knowledge cutoff:</span>
                      <span className="text-[#a8c7fa] hover:underline">
                        {model.knowledgeCutoff}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Release date:</span>
                      <span className="text-[#c4c7c5]">{model.releaseDate}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
}
