"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronDown, Trash2, Plus, Sparkles, Check } from "lucide-react";

export interface StoredInstruction {
  id: string;
  title: string;
  content: string;
}

const DEFAULT_INSTRUCTIONS: StoredInstruction[] = [
  {
    id: "default-arch",
    title: "Senior Architect Tone",
    content: "Respond as a senior software architect. Emphasize system stability, edge-case coverage, idempotency, data models, and clear sequential steps.",
  },
  {
    id: "default-concise",
    title: "Concise & Bullet Points",
    content: "Keep answers brief, highly structured with bullet points, and directly answer questions without filler text or unnecessary pleasantries.",
  },
];

interface SystemInstructionsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  systemInstructions: string;
  onChangeSystemInstructions: (text: string) => void;
}

export function SystemInstructionsSidebar({
  isOpen,
  onClose,
  systemInstructions,
  onChangeSystemInstructions,
}: SystemInstructionsSidebarProps) {
  const [instructionsList, setInstructionsList] = useState<StoredInstruction[]>([]);
  const [selectedInstructionId, setSelectedInstructionId] = useState<string>("custom");
  const [instructionTitle, setInstructionTitle] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Load saved instructions from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("koda_system_instructions");
      if (stored) {
        setInstructionsList(JSON.parse(stored));
      } else {
        setInstructionsList(DEFAULT_INSTRUCTIONS);
        localStorage.setItem("koda_system_instructions", JSON.stringify(DEFAULT_INSTRUCTIONS));
      }
    } catch {
      setInstructionsList(DEFAULT_INSTRUCTIONS);
    }
  }, []);

  // Save current instruction when title changes or new created
  const saveToStorage = (newList: StoredInstruction[]) => {
    setInstructionsList(newList);
    try {
      localStorage.setItem("koda_system_instructions", JSON.stringify(newList));
    } catch (e) {
      console.warn("Failed to persist instructions in localStorage:", e);
    }
  };

  const handleCreateNew = () => {
    const newId = `inst-${Date.now()}`;
    const newInst: StoredInstruction = {
      id: newId,
      title: "New instruction",
      content: "",
    };
    const updated = [newInst, ...instructionsList];
    saveToStorage(updated);
    setSelectedInstructionId(newId);
    setInstructionTitle("New instruction");
    onChangeSystemInstructions("");
    setIsDropdownOpen(false);
  };

  const handleSelectSaved = (inst: StoredInstruction) => {
    setSelectedInstructionId(inst.id);
    setInstructionTitle(inst.title);
    onChangeSystemInstructions(inst.content);
    setIsDropdownOpen(false);
  };

  const handleTitleChange = (val: string) => {
    setInstructionTitle(val);
    const updated = instructionsList.map((item) =>
      item.id === selectedInstructionId ? { ...item, title: val } : item
    );
    saveToStorage(updated);
  };

  const handleContentChange = (val: string) => {
    onChangeSystemInstructions(val);
    const updated = instructionsList.map((item) =>
      item.id === selectedInstructionId ? { ...item, content: val } : item
    );
    saveToStorage(updated);
  };

  const handleDeleteCurrent = () => {
    const updated = instructionsList.filter((item) => item.id !== selectedInstructionId);
    saveToStorage(updated);
    setSelectedInstructionId("custom");
    setInstructionTitle("");
    onChangeSystemInstructions("");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Semi-transparent Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40 transition-opacity"
      />

      {/* Slide-in Sidebar (Right Side) */}
      <aside className="fixed top-0 right-0 z-50 w-full sm:w-[480px] md:w-[500px] h-screen bg-[#18191a] border-l border-[#282a2c] text-[#c4c7c5] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 select-none">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#282a2c]">
          <h2 className="text-[15px] font-semibold text-[#f1f3f4] tracking-tight">
            System instructions
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#282a2c] rounded-md transition"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 flex flex-col space-y-4 overflow-y-auto">
          {/* Dropdown / Preset Selector: "+ Create new instruction" */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between bg-[#212224] hover:bg-[#282a2c] border border-[#2e3032] hover:border-[#3c4043] rounded-lg px-3.5 py-2.5 text-xs text-[#f1f3f4] font-medium transition"
            >
              <div className="flex items-center gap-2">
                <span className="text-[#a8c7fa]">+</span>
                <span>
                  {selectedInstructionId !== "custom" && instructionTitle
                    ? instructionTitle
                    : "Create new instruction"}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-[#80868b]" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#212224] border border-[#2e3032] rounded-xl shadow-xl z-10 py-1.5 overflow-hidden animate-in fade-in-50 duration-150">
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-[#a8c7fa] hover:bg-[#282a2c] transition font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Create new instruction</span>
                </button>

                <div className="border-t border-[#2e3032]/70 my-1" />

                {instructionsList.map((item) => {
                  const isCurrent = selectedInstructionId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectSaved(item)}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs transition ${
                        isCurrent
                          ? "bg-[#282a2c] text-[#f1f3f4] font-medium"
                          : "text-[#c4c7c5] hover:bg-[#282a2c] hover:text-[#f1f3f4]"
                      }`}
                    >
                      <span className="truncate pr-2">{item.title}</span>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-[#d97736]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Title Row with Trash Action */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={instructionTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Title"
              className="flex-1 bg-[#212224] border border-[#2e3032] focus:border-[#d97736] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#f1f3f4] placeholder:text-[#80868b] transition"
            />
            {selectedInstructionId !== "custom" && (
              <button
                type="button"
                onClick={handleDeleteCurrent}
                className="p-2 text-[#80868b] hover:text-[#f28b82] hover:bg-[#282a2c] border border-[#2e3032] rounded-lg transition"
                title="Delete instruction"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Large Instruction Textarea */}
          <div className="flex-1 flex flex-col">
            <textarea
              value={systemInstructions}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Optional tone and style instructions for the model"
              className="flex-1 w-full min-h-[360px] bg-[#212224] border border-[#2e3032] focus:border-[#d97736] focus:outline-none rounded-xl p-4 text-xs text-[#e3e3e3] placeholder:text-[#80868b] leading-relaxed resize-none transition"
            />
          </div>
        </div>

        {/* Footer info: "Instructions are saved in local storage." */}
        <div className="px-5 py-3.5 border-t border-[#282a2c] bg-[#161718] text-[11px] text-[#80868b] flex items-center justify-between">
          <span>Instructions are saved in local storage.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-[#282a2c] hover:bg-[#35373a] text-[#f1f3f4] rounded-md font-medium text-xs transition"
          >
            Done
          </button>
        </div>
      </aside>
    </>
  );
}
