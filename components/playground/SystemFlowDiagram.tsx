"use client";

import React, { useState, useMemo } from "react";
import {
  Code,
  Copy,
  Check,
  Download,
  Maximize2,
  ArrowDown,
  ShieldAlert,
  User,
  Server,
  Zap,
  Image as ImageIcon,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export interface FlowJsonData {
  title?: string;
  nodes: Array<{
    id: string;
    label: string;
    category?: "actor" | "action" | "process" | "critical";
    detail?: string;
  }>;
  edges: Array<{
    from: string;
    to: string;
    label?: string;
  }>;
}

// Check if string is flow-json, flowchart-json, mermaid, or contains flowchart data
export function isSequenceFlow(text: string, language?: string): boolean {
  if (language === "flow-json" || language === "flowchart-json" || language === "mermaid") return true;
  if (!text || text.length < 10) return false;

  const trimmed = text.trim();

  // Try JSON test
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(text);
      if (parsed.nodes && Array.isArray(parsed.nodes)) return true;
    } catch {}
  }

  // Check if Mermaid
  if (trimmed.startsWith("graph ") || trimmed.startsWith("flowchart ")) return true;

  const hasArrows =
    text.includes("->") ||
    text.includes("-->") ||
    text.includes("--->") ||
    text.includes("<-") ||
    text.includes("<--") ||
    text.includes("├──") ||
    text.includes("└──");

  const hasKeywords =
    (text.includes("[") && text.includes("]")) ||
    text.toLowerCase().includes("kasir") ||
    text.toLowerCase().includes("pelanggan") ||
    text.toLowerCase().includes("sistem") ||
    text.toLowerCase().includes("booking") ||
    text.toLowerCase().includes("stok");

  return hasArrows && hasKeywords;
}

// Safely extract or parse JSON flow data, with smart fallback to clean step extractor and mermaid
export function resolveFlowData(rawText: string): FlowJsonData {
  // Case 1: Pure JSON format
  const jsonMatch = rawText.match(/\{[\s\S]*"nodes"[\s\S]*"edges"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
        return parsed as FlowJsonData;
      }
    } catch {}
  }

  // Case 2: Mermaid syntax parser
  if (rawText.includes("graph ") || rawText.includes("flowchart ") || (rawText.includes("-->") && rawText.includes("["))) {
    const nodes: FlowJsonData["nodes"] = [];
    const edges: FlowJsonData["edges"] = [];
    const nodeMap = new Map<string, FlowJsonData["nodes"][0]>();

    const lines = rawText.split("\n");
    for (const line of lines) {
      const edgeMatch = line.match(
        /([a-zA-Z0-9_-]+)\s*(?:\[([^\]]+)\]|\(([^\)]+)\)|\{([^\}]+)\})?\s*-->\s*(?:\|([^\|]+)\|)?\s*([a-zA-Z0-9_-]+)\s*(?:\[([^\]]+)\]|\(([^\)]+)\)|\{([^\}]+)\})?/
      );
      if (edgeMatch) {
        const fromId = edgeMatch[1];
        const fromLabel = edgeMatch[2] || edgeMatch[3] || edgeMatch[4] || fromId;
        const edgeLabel = edgeMatch[5] || "";
        const toId = edgeMatch[6];
        const toLabel = edgeMatch[7] || edgeMatch[8] || edgeMatch[9] || toId;

        const getCategory = (lbl: string): "actor" | "action" | "process" | "critical" => {
          const lower = lbl.toLowerCase();
          if (lower.includes("pelanggan") || lower.includes("user") || lower.includes("kasir") || lower.includes("admin")) return "actor";
          if (lower.includes("lock") || lower.includes("race") || lower.includes("aman") || lower.includes("validasi")) return "critical";
          if (lower.includes("scan") || lower.includes("input") || lower.includes("klik") || lower.includes("pilih")) return "action";
          return "process";
        };

        if (!nodeMap.has(fromId)) {
          const nodeItem = { id: fromId, label: fromLabel, category: getCategory(fromLabel) };
          nodeMap.set(fromId, nodeItem);
          nodes.push(nodeItem);
        } else if (fromLabel !== fromId && nodeMap.get(fromId)!.label === fromId) {
          nodeMap.get(fromId)!.label = fromLabel;
        }

        if (!nodeMap.has(toId)) {
          const nodeItem = { id: toId, label: toLabel, category: getCategory(toLabel) };
          nodeMap.set(toId, nodeItem);
          nodes.push(nodeItem);
        } else if (toLabel !== toId && nodeMap.get(toId)!.label === toId) {
          nodeMap.get(toId)!.label = toLabel;
        }

        edges.push({ from: fromId, to: toId, label: edgeLabel });
      }
    }

    if (nodes.length > 0) {
      return {
        title: "Alur Sistem & Flowchart",
        nodes,
        edges,
      };
    }
  }

  // Case 3: Structured fallback extraction for legacy ASCII / lines
  const lines = rawText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0 && l !== "|");
  const extractedNodes: FlowJsonData["nodes"] = [];
  const extractedEdges: FlowJsonData["edges"] = [];
  const seen = new Set<string>();

  let counter = 1;

  for (const line of lines) {
    if (line === "|" || line === "├──" || line === "└──" || line.startsWith("---")) continue;

    if (line.includes("->") || line.includes("-->") || line.includes("<-") || line.includes("<--")) {
      const parts = line.split(/(?:--->|-->|->|<---|--<|<-)/).map((p) => p.replace(/[|\\/\[\]]/g, "").trim()).filter((p) => p.length > 1);
      for (const part of parts) {
        if (!seen.has(part) && part !== "Kasir" && part !== "Sistem") {
          seen.add(part);
          const id = String(counter++);
          const isCrit = part.toLowerCase().includes("lock") || part.toLowerCase().includes("potong") || part.toLowerCase().includes("bayar");
          const isAct = part.toLowerCase().includes("pelanggan") || part.toLowerCase().includes("kasir");
          extractedNodes.push({
            id,
            label: part,
            category: isAct ? "actor" : isCrit ? "critical" : "process",
          });
          if (extractedNodes.length > 1) {
            extractedEdges.push({ from: extractedNodes[extractedNodes.length - 2].id, to: id });
          }
        }
      }
      continue;
    }

    const cleanLine = line.replace(/^[|\\/\-\s]+|[|\\/\-\s]+$/g, "").replace(/[\[\]]/g, "").trim();
    if (cleanLine.length > 2 && !seen.has(cleanLine) && !cleanLine.startsWith("(") && cleanLine !== "||" && cleanLine !== "▼ ▼") {
      seen.add(cleanLine);
      const id = String(counter++);
      extractedNodes.push({
        id,
        label: cleanLine,
        category: "process",
      });
      if (extractedNodes.length > 1) {
        extractedEdges.push({ from: extractedNodes[extractedNodes.length - 2].id, to: id });
      }
    }
  }

  return {
    title: "Alur Sistem",
    nodes: extractedNodes,
    edges: extractedEdges,
  };
}

export function SystemFlowDiagram({ rawCode, language }: { rawCode: string; language?: string }) {
  const [viewMode, setViewMode] = useState<"image" | "raw">("image");
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const flowData = useMemo(() => resolveFlowData(rawCode), [rawCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPng = () => {
    if (typeof window === "undefined") return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = 2; // 2x Retina scale for crisp image
    const width = 840;
    const paddingX = 40;
    const paddingTop = 45;
    const cardWidth = width - paddingX * 2;
    const cardHeight = 76;
    const arrowHeight = 44;
    const nodeCount = flowData.nodes.length;
    const totalHeight = paddingTop + 65 + nodeCount * cardHeight + (nodeCount - 1) * arrowHeight + 50;

    canvas.width = width * scale;
    canvas.height = totalHeight * scale;
    ctx.scale(scale, scale);

    // 1. Dark Canvas Background
    ctx.fillStyle = "#121314";
    ctx.fillRect(0, 0, width, totalHeight);

    // 2. Subtle Grid Background Dots
    ctx.fillStyle = "#222426";
    for (let x = 20; x < width; x += 24) {
      for (let y = 20; y < totalHeight; y += 24) {
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }

    // 3. Header Title & Brand
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 19px sans-serif";
    ctx.fillText(flowData.title || "Visual System Flow Architecture", paddingX, paddingTop + 10);

    ctx.fillStyle = "#9aa0a6";
    ctx.font = "12px sans-serif";
    ctx.fillText(`${nodeCount} Langkah Alur Sistem • KODA AI Flowchart Architecture`, paddingX, paddingTop + 32);

    // 4. Render Step Cards & Arrows
    let currentY = paddingTop + 62;

    flowData.nodes.forEach((node, idx) => {
      const isCritical = node.category === "critical" || node.label.toLowerCase().includes("lock");
      const isActor = node.category === "actor" || node.label.toLowerCase().includes("pelanggan") || node.label.toLowerCase().includes("kasir");
      const isAction = node.category === "action";

      // Card Background
      ctx.fillStyle = "#1c1d1f";
      ctx.beginPath();
      ctx.roundRect(paddingX, currentY, cardWidth, cardHeight, 14);
      ctx.fill();

      // Card Border Accent
      ctx.strokeStyle = isCritical ? "#d97736" : isActor ? "#d97736" : "#2e3032";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Step Number Badge (Pill)
      ctx.fillStyle = isActor ? "#2a1d17" : isCritical ? "#2d1c10" : "#242628";
      ctx.beginPath();
      ctx.roundRect(paddingX + 16, currentY + 16, 36, 44, 8);
      ctx.fill();

      ctx.fillStyle = isActor || isCritical ? "#d97736" : "#9aa0a6";
      ctx.font = "bold 15px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(idx + 1), paddingX + 34, currentY + 38);

      // Node Content
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";

      // Category Chip
      const badgeText = (
        isCritical
          ? "VALIDASI KRITIS & KEAMANAN"
          : isActor
          ? "AKTOR UTAMA"
          : isAction
          ? "TINDAKAN PENGGUNA"
          : "PROSES SERVER & DATABASE"
      );
      ctx.font = "bold 10px sans-serif";
      ctx.fillStyle = isCritical ? "#fbbf24" : isActor ? "#d97736" : isAction ? "#38bdf8" : "#34d399";
      ctx.fillText(badgeText, paddingX + 66, currentY + 28);

      // Main Title
      ctx.fillStyle = "#f1f3f4";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(node.label, paddingX + 66, currentY + 47);

      // Detail subtitle
      if (node.detail) {
        ctx.fillStyle = "#9aa0a6";
        ctx.font = "11.5px sans-serif";
        ctx.fillText(node.detail, paddingX + 66, currentY + 65);
      }

      currentY += cardHeight;

      // Draw Arrow Connector to Next Card
      if (idx < nodeCount - 1) {
        const arrowStartY = currentY;
        const arrowEndY = currentY + arrowHeight;
        const arrowX = paddingX + cardWidth / 2;

        ctx.strokeStyle = "#3c4043";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowStartY + 4);
        ctx.lineTo(arrowX, arrowEndY - 8);
        ctx.stroke();

        // Arrow head
        ctx.fillStyle = "#d97736";
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowEndY - 3);
        ctx.lineTo(arrowX - 5, arrowEndY - 11);
        ctx.lineTo(arrowX + 5, arrowEndY - 11);
        ctx.closePath();
        ctx.fill();

        // Edge label if present
        const edge = flowData.edges.find((e) => e.from === node.id || e.from === String(idx + 1));
        if (edge?.label) {
          ctx.fillStyle = "#25272a";
          ctx.beginPath();
          ctx.roundRect(arrowX + 12, arrowStartY + 10, 110, 22, 6);
          ctx.fill();

          ctx.strokeStyle = "#3c4043";
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = "#d97736";
          ctx.font = "bold 10px sans-serif";
          ctx.fillText(edge.label, arrowX + 18, arrowStartY + 25);
        }

        currentY += arrowHeight;
      }
    });

    // 5. Trigger Instant Download
    const fileName = `${(flowData.title || "koda-flowchart").toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`;
    const link = document.createElement("a");
    link.download = fileName;
    link.href = canvas.toDataURL("image/png");
    link.click();

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  if (viewMode === "raw") {
    return (
      <div className="my-4 rounded-2xl overflow-hidden border border-[#2e3032] bg-[#141517] shadow-xl">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#1b1c1e] border-b border-[#282a2c] text-xs text-[#9aa0a6]">
          <span className="font-mono text-xs uppercase tracking-wider text-[#c4c7c5]">
            RAW FLOW DATA (JSON)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("image")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-[#d97736] hover:bg-[#282a2c] transition"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Lihat Gambar Flowchart</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-[#c4c7c5] hover:text-white hover:bg-[#282a2c] transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Tersalin" : "Salin"}</span>
            </button>
          </div>
        </div>
        <pre className="p-4 text-xs font-mono text-[#f1f3f4] overflow-x-auto leading-relaxed">
          <code>{rawCode}</code>
        </pre>
      </div>
    );
  }

  return (
    <>
      {/* Main Flowchart Image Card Container */}
      <div className="my-5 rounded-2xl    overflow-hidden animate-in fade-in duration-200">
        
        {/* Top Header Controls Bar */}
        

        {/* Clean Static Flowchart Diagram Display with Gradual Fade & Show More */}
        <div className="relative">
          <div
            className={`p-5 sm:p-7 bg-[#121314] overflow-hidden transition-all duration-300 ${
              isExpanded || flowData.nodes.length <= 2 ? "max-h-none" : "max-h-[380px]"
            }`}
          >
            <div className="max-w-2xl mx-auto space-y-0">
              {flowData.nodes.map((node, idx) => {
                const isCritical = node.category === "critical" || node.label.toLowerCase().includes("lock");
                const isActor = node.category === "actor" || node.label.toLowerCase().includes("pelanggan") || node.label.toLowerCase().includes("kasir");
                const isAction = node.category === "action";
                const isLast = idx === flowData.nodes.length - 1;

                // Find edge label from this node to the next
                const edge = flowData.edges.find((e) => e.from === node.id || e.from === String(idx + 1));

                return (
                  <div key={node.id || idx} className="flex flex-col items-center">
                    {/* Step Card */}
                    <div
                      className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border transition shadow-lg ${
                        isCritical
                          ? ""
                          : isActor
                          ? ""
                          : isAction
                          ? ""
                          : ""
                      }`}
                    >
                      {/* Step Number Circle */}
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm shrink-0 shadow-inner ${
                          isActor || isCritical
                            ? ""
                            : isAction
                            ? ""
                            : ""
                        }`}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                              isCritical
                                ? " text-amber-300 border "
                                : isActor
                                ? " text-[#f39c6b] border "
                                : isAction
                                ? " text-sky-300 border "
                                : " text-emerald-300 border "
                            }`}
                          >
                            {isCritical ? (
                              <>
                                <ShieldAlert className="w-3 h-3" />
                                <span>Validasi Kritis &amp; Keamanan</span>
                              </>
                            ) : isActor ? (
                              <>
                                <User className="w-3 h-3" />
                                <span>Aktor Utama</span>
                              </>
                            ) : isAction ? (
                              <>
                                <Zap className="w-3 h-3" />
                                <span>Tindakan Pengguna</span>
                              </>
                            ) : (
                              <>
                                <Server className="w-3 h-3" />
                                <span>Proses Sistem &amp; DB</span>
                              </>
                            )}
                          </span>
                        </div>

                        <h4 className="text-sm sm:text-[15px] font-semibold text-white tracking-tight leading-snug">
                          {node.label}
                        </h4>

                        {node.detail && (
                          <p className="text-xs text-[#9aa0a6] leading-relaxed mt-0.5">
                            {node.detail}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Flow Connector Arrow */}
                    {!isLast && (
                      <div className="flex flex-col items-center my-1.5 py-1">
                        <div className="w-[1.5px] h-3 bg-gradient-to-b from-[#3c4043] to-[#d97736]" />
                        
                        {edge?.label && (
                          <div className="my-0.5 px-2.5 py-0.5 rounded-full bg-[#25272a] border border-[#3c4043] text-[10.5px] font-medium text-[#f39c6b] shadow-sm">
                            {edge.label}
                          </div>
                        )}

                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1e1f20] border border-[#3c4043] text-[#d97736] shadow-sm">
                          <ArrowDown className="w-3 h-3" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Opacity Gradient Overlay & Show More Button when collapsed */}
          {!isExpanded && flowData.nodes.length > 2 && (
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#121314] via-[#121314]/85 to-transparent flex items-end justify-center pb-3 pointer-events-none">
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-[#212224] hover:bg-[#282a2c] text-[#f1f3f4] hover:text-white border border-[#3c4043] hover:border-[#5a5d61] shadow-xl text-xs font-medium transition group"
              >
                <span>Lihat Seluruh Alur ({flowData.nodes.length} Langkah)</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#d97736] group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Toolbar Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#121314] border-t border-[#282a2c]/40">
          <div>
            {isExpanded && flowData.nodes.length > 2 && (
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="flex items-center gap-1.5 text-xs text-[#9aa0a6] hover:text-[#f1f3f4] font-medium transition"
              >
                <ChevronUp className="w-3.5 h-3.5 text-[#d97736]" />
                <span>Tutup Alur</span>
              </button>
            )}
          </div>
          
          <div className="flex justify-end items-center gap-1.5">
            {/* Download as PNG button */}
            <button
              onClick={handleDownloadPng}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[#9aa0a6] hover:text-white hover:bg-[#282a2c] rounded-lg transition font-medium"
              title="Unduh diagram ini sebagai file gambar PNG beresolusi tinggi"
            >
              {downloaded ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
              <span className="text-[11px] hidden sm:inline">{downloaded ? "Tersimpan" : "Unduh PNG"}</span>
            </button>

            {/* Lightbox Zoom button */}
            <button
              onClick={() => setIsLightboxOpen(true)}
              className="p-1.5 text-[#9aa0a6] hover:text-white hover:bg-[#282a2c] rounded-lg transition"
              title="Perbesar gambar ukuran penuh"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Raw JSON toggle */}
            <button
              onClick={() => setViewMode("raw")}
              className="p-1.5 text-[#9aa0a6] hover:text-white hover:bg-[#282a2c] rounded-lg transition"
              title="Lihat format raw data JSON"
            >
              <Code className="w-3.5 h-3.5" />
            </button>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="p-1.5 text-[#9aa0a6] hover:text-white hover:bg-[#282a2c] rounded-lg transition"
              title="Salin data flow"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Card Footer Hint */}
       
      </div>

      {/* Lightbox Modal (Zoom Fullscreen) */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#121314] border border-[#2e3032] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#18191b] border-b border-[#282a2c]">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#d97736]" />
                <h3 className="font-semibold text-sm text-white">
                  {flowData.title || "Diagram Alur Sistem"}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPng}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#d97736] hover:bg-[#e58849] text-white text-xs rounded-lg font-medium transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PNG</span>
                </button>
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="p-1.5 text-[#9aa0a6] hover:text-white hover:bg-[#282a2c] rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-3">
              {flowData.nodes.map((node, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 bg-[#1c1d1f] border border-[#2e3032] rounded-xl">
                  <span className="w-7 h-7 rounded-lg bg-[#282a2c] text-[#d97736] font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h5 className="font-semibold text-xs sm:text-sm text-white">{node.label}</h5>
                    {node.detail && <p className="text-xs text-[#9aa0a6] mt-0.5">{node.detail}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
