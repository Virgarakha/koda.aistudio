"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Plus,
  SlidersHorizontal,
  Mic,
  X,
  Sparkles,
  Wrench,
  FileSpreadsheet,
  Palette,
  Atom,
  Telescope,
  Check,
  ChevronUp,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { GoogleIcon } from "./GoogleIcon";
import { AiTool, AVAILABLE_AI_TOOLS } from "@/lib/ai/tools";
import { FileAttachment } from "@/lib/apps/types";

interface PromptInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (attachments?: FileAttachment[]) => void;
  isLoading?: boolean;
  groundingEnabled: boolean;
  onToggleGrounding: () => void;
  onOpenToolsModal?: () => void;
  selectedTool: AiTool | null;
  onSelectTool: (tool: AiTool | null) => void;
}

export function PromptInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  groundingEnabled,
  onToggleGrounding,
  onOpenToolsModal,
  selectedTool,
  onSelectTool,
}: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [value]);

  // Click outside to close tools dropup
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        toolsMenuRef.current &&
        !toolsMenuRef.current.contains(event.target as Node)
      ) {
        setToolsOpen(false);
      }
    }
    if (toolsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [toolsOpen]);

  const addAttachmentFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        // If image was pasted from clipboard with generic name, provide descriptive timestamped name
        const isGenericImage = file.name === "image.png" || !file.name;
        const timestamp = new Date()
          .toTimeString()
          .split(" ")[0]
          .replace(/:/g, "");
        const fileName = isGenericImage
          ? `Pasted_Image_${timestamp}.png`
          : file.name;

        setAttachments((prev) => [
          ...prev,
          {
            name: fileName,
            type: file.type || (isGenericImage ? "image/png" : "application/octet-stream"),
            size: file.size,
            data: base64Url,
          },
        ]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      addAttachmentFromFile(file);
    });

    // Reset input so same file can be selected again
    e.target.value = "";
  };

  // Ref to strictly prevent duplicate paste events from firing
  const lastPasteTimestampRef = useRef<number>(0);

  // Clipboard Paste handler (Ctrl + V for images) - single strictly debounced handler
  const handlePaste = (e: React.ClipboardEvent) => {
    // 1. Prevent any duplicate triggers within 500ms
    const now = Date.now();
    if (now - lastPasteTimestampRef.current < 500) {
      e.stopPropagation();
      return;
    }

    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const items = clipboardData.items;
    let imagePasted = false;

    // Check items first (standard in modern browsers)
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            imagePasted = true;
            lastPasteTimestampRef.current = now;
            addAttachmentFromFile(file);
            break; // Stop after 1 image to prevent duplicate MIME formats in clipboard
          }
        }
      }
    }

    // Fallback: check files if items did not yield an image
    if (!imagePasted && clipboardData.files && clipboardData.files.length > 0) {
      for (let i = 0; i < clipboardData.files.length; i++) {
        const file = clipboardData.files[i];
        if (file.type.startsWith("image/")) {
          imagePasted = true;
          lastPasteTimestampRef.current = now;
          addAttachmentFromFile(file);
          break; // Stop after 1 image
        }
      }
    }

    if (imagePasted) {
      e.stopPropagation();
      // If user pasted only an image without text, prevent raw junk characters
      const textData = clipboardData.getData("text/plain");
      if (!textData) {
        e.preventDefault();
      }
    }
  };

  // Drag and Drop state & handlers
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        addAttachmentFromFile(file);
      });
    }
  };

  const handleRemoveAttachment = (indexToRemove: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleTriggerSubmit = () => {
    if ((!value.trim() && attachments.length === 0) || isLoading) return;
    const currentAttachments = [...attachments];
    setAttachments([]);
    onSubmit(currentAttachments);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey || !e.shiftKey)) {
      e.preventDefault();
      handleTriggerSubmit();
    }
  };

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case "FileSpreadsheet":
        return <FileSpreadsheet className="w-4 h-4 text-[#d97736]" />;
      case "Palette":
        return <Palette className="w-4 h-4 text-[#f28b82]" />;
      case "Atom":
        return <Atom className="w-4 h-4 text-[#81c995]" />;
      case "Telescope":
        return <Telescope className="w-4 h-4 text-[#c58af9]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#d97736]" />;
    }
  };

  const currentPlaceholder = selectedTool
    ? selectedTool.placeholder
    : "Ketik pesan untuk obrolan biasa atau pilih Tools untuk spesialisasi...";

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4">
      {/* Main Prompt Input Box with Clean Gray Border & Clipboard Paste (Ctrl+V) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-2xl bg-[#1e1f20] border transition-all duration-200 shadow-2xl ${
          isDraggingOver
            ? "border-[#d97736] ring-2 ring-[#d97736]/30 bg-[#252321]"
            : "border-[#3c4043] focus-within:border-[#5a5d61]"
        }`}
      >
        {/* Drag & drop overlay indicator */}
        {isDraggingOver && (
          <div className="absolute inset-0 z-20 rounded-2xl bg-[#1e1f20]/95 border-2 border-dashed border-[#d97736] flex items-center justify-center pointer-events-none backdrop-blur-xs">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#d97736] bg-[#29221d] px-4 py-2 rounded-xl border border-[#d97736]/40 shadow-lg">
              <ImageIcon className="w-5 h-5 animate-pulse" />
              <span>Lepaskan gambar di sini untuk dilampirkan</span>
            </div>
          </div>
        )}
        
        {/* Active Embedded Tool Banner */}
        {selectedTool && (
          <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#252729] border-b border-[#35373a] rounded-t-2xl text-xs animate-in fade-in slide-in-from-bottom-1 duration-150">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-[#18191a]">
                {getToolIcon(selectedTool.iconName)}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white">
                  {selectedTool.name}
                </span>
                {selectedTool.badge && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#35373a] text-[#c4c7c5]">
                    {selectedTool.badge}
                  </span>
                )}
                <span className="text-[11px] text-[#9aa0a6] hidden sm:inline">
                  • {selectedTool.shortDesc}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectTool(null)}
              className="flex items-center gap-1 text-[11px] text-[#9aa0a6] hover:text-white px-2 py-0.5 rounded hover:bg-[#35373a] transition"
              title="Kembali ke obrolan AI biasa"
            >
              <span>Lepas Tool</span>
              <X className="w-3.5 h-3.5 text-[#9aa0a6]" />
            </button>
          </div>
        )}

        {/* Hidden File Input for photos and documents */}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*,application/pdf,text/*,.csv,.json,.md,.txt,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Attachment Previews Strip */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5 px-4 pt-3 pb-1 border-b border-[#2d3032] animate-in fade-in duration-150">
            {attachments.map((file, idx) => (
              <div
                key={idx}
                className="relative group flex items-center gap-2 bg-[#282a2c] hover:bg-[#303336] border border-[#3c4043] rounded-xl px-2.5 py-1.5 transition text-xs shadow-sm"
              >
                {file.type.startsWith("image/") ? (
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-[#444746] bg-black/40">
                    <img
                      src={file.data}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="p-1.5 rounded-lg bg-[#1f2022] text-[#d97736] shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                )}
                
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-[12px] font-medium text-white truncate max-w-[130px]" title={file.name}>
                    {file.name}
                  </span>
                  <span className="text-[10px] text-[#9aa0a6]">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(idx)}
                  className="p-1 text-[#9aa0a6] hover:text-red-400 hover:bg-[#3c4043] rounded-full transition"
                  title="Hapus file"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Input Area with Paste support */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          rows={1}
          placeholder={currentPlaceholder}
          className="w-full bg-transparent text-[#f1f3f4] placeholder:text-[#80868b] text-[15px] sm:text-base px-5 pt-4 pb-2.5 resize-none outline-none leading-relaxed min-h-[52px]"
        />

        {/* Action Toolbar */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          {/* Left Controls */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Add Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#282a2c] rounded-full transition"
              title="Unggah berkas atau tekan Ctrl+V untuk menempelkan gambar dari clipboard"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Tune Button */}
            <button
              type="button"
              onClick={onOpenToolsModal}
              className="p-1.5 text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#282a2c] rounded-full transition"
              title="Tune parameters & settings"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Tools Dropup Menu Container */}
            <div className="relative" ref={toolsMenuRef}>
              <button
                type="button"
                onClick={() => setToolsOpen(!toolsOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg transition ${
                  selectedTool
                    ? "bg-[#2d3238] text-[#d97736] border border-[#d97736]/40"
                    : "text-[#c4c7c5] hover:text-white hover:bg-[#282a2c]"
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span className="font-medium">
                  {selectedTool ? selectedTool.name : "Tools"}
                </span>
                <ChevronUp
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    toolsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropup Menu Popover */}
              {toolsOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-80 sm:w-96 bg-[#1e1f20] border border-[#3c4043] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="px-3 py-2 border-b border-[#2e3032] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-white">
                        Pilih AI Tool / Konteks
                      </h4>
                      <p className="text-[11px] text-[#9aa0a6]">
                        Konteks AI akan otomatis tertanam ke dalam chat
                      </p>
                    </div>
                    {selectedTool && (
                      <button
                        onClick={() => {
                          onSelectTool(null);
                          setToolsOpen(false);
                        }}
                        className="text-[10.5px] text-[#d97736] hover:underline"
                      >
                        Reset ke Biasa
                      </button>
                    )}
                  </div>

                  <div className="py-1 space-y-1 max-h-72 overflow-y-auto">
                    {/* General Chat Option */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTool(null);
                        setToolsOpen(false);
                      }}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition ${
                        selectedTool === null
                          ? "bg-[#2a2c2e] border border-[#444746]"
                          : "hover:bg-[#282a2c]"
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-[#18191a] text-[#9aa0a6] shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">
                            Obrolan Biasa
                          </span>
                          {selectedTool === null && (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#9aa0a6] leading-relaxed">
                          Asisten AI serbaguna untuk percakapan santai, tanya jawab umum, dan ide bebas tanpa konteks khusus.
                        </p>
                      </div>
                    </button>

                    {/* Specialized AI Tools */}
                    {AVAILABLE_AI_TOOLS.map((tool) => {
                      const isSelected = selectedTool?.id === tool.id;
                      return (
                        <button
                          key={tool.id}
                          type="button"
                          onClick={() => {
                            onSelectTool(tool);
                            setToolsOpen(false);
                          }}
                          className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition ${
                            isSelected
                              ? "bg-[#2a2c2e] border border-[#d97736]/50"
                              : "hover:bg-[#282a2c]"
                          }`}
                        >
                          <div className="p-2 rounded-lg bg-[#18191a] shrink-0 mt-0.5">
                            {getToolIcon(tool.iconName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-white">
                                  {tool.name}
                                </span>
                                {tool.badge && (
                                  <span className="text-[9.5px] font-medium px-1.5 py-0.2 rounded bg-[#35373a] text-[#d97736]">
                                    {tool.badge}
                                  </span>
                                )}
                              </div>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-[#d97736]" />
                              )}
                            </div>
                            <p className="text-[11px] text-[#9aa0a6] leading-relaxed mt-0.5 line-clamp-2">
                              {tool.shortDesc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Grounding Active Badge */}
            {groundingEnabled && (
              <div className="inline-flex items-center gap-1.5 bg-[#282a2c] border border-[#3c4043] rounded-full px-2.5 py-1 text-xs text-[#f1f3f4] animate-in fade-in zoom-in-95 duration-150">
                <GoogleIcon className="w-3 h-3" />
                <span className="text-[11.5px] font-medium">
                  Grounding with Google Search
                </span>
                <button
                  type="button"
                  onClick={onToggleGrounding}
                  className="hover:text-red-400 p-0.5 rounded-full hover:bg-[#3c4043] transition ml-0.5"
                  title="Remove search grounding"
                >
                  <X className="w-3 h-3 text-[#9aa0a6]" />
                </button>
              </div>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Mic */}
            <button
              type="button"
              className="p-2 text-[#9aa0a6] hover:text-[#f1f3f4] hover:bg-[#282a2c] rounded-full transition"
              title="Voice input"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Run Button (Claude Warm Terracotta Orange) */}
            <button
              type="button"
              onClick={handleTriggerSubmit}
              disabled={(!value.trim() && attachments.length === 0) || isLoading}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                (value.trim() || attachments.length > 0) && !isLoading
                  ? "bg-[#d97736] text-white hover:bg-[#e58849] shadow-md cursor-pointer"
                  : "bg-[#282a2c] text-[#80868b] cursor-not-allowed"
              }`}
            >
              <span>Run</span>
              <kbd className="text-[10px] font-mono bg-black/20 px-1 py-0.5 rounded text-current opacity-70">
                Ctrl ↵
              </kbd>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

