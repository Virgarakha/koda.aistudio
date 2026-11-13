"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ClaudeSunburst } from "./ClaudeSunburst";

export function MindMapSection({
  brandName = "Koda",
}: {
  brandName?: string;
}) {
  const [activeHubIndex, setActiveHubIndex] = useState(0);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Center Root
  const centerNode = { x: 500, y: 260 };

  // 6 Main Hubs arranged clockwise
  const hubs = useMemo(
    () => [
      {
        id: "prd-planning",
        title: "Perencanaan PRD",
        x: 350,
        y: 120,
        subNodes: [
          { label: "PRD 13 Bab Lengkap", x: 375, y: 50 },
          { label: "Aturan Bisnis & Logika", x: 230, y: 70 },
          { label: "User Stories & Kriteria", x: 195, y: 130 },
          { label: "Matriks Prioritas MVP", x: 205, y: 185 },
          { label: "Analisis Edge Cases", x: 230, y: 240 },
          { label: "Roadmap Sprint", x: 385, y: 220 },
        ],
      },
      {
        id: "system-architecture",
        title: "Arsitektur Sistem",
        x: 620,
        y: 110,
        subNodes: [
          { label: "Diagram Alur Sequence", x: 550, y: 50 },
          { label: "State Machine", x: 630, y: 45 },
          { label: "Pencegahan Race Condition", x: 745, y: 70 },
          { label: "Isolasi Transaksi", x: 755, y: 120 },
          { label: "Arsitektur Layanan", x: 740, y: 175 },
        ],
      },
      {
        id: "database-schema",
        title: "Basis Data",
        x: 680,
        y: 260,
        subNodes: [
          { label: "Skema DDL PostgreSQL", x: 720, y: 205 },
          { label: "Indexing & Relasi Tabel", x: 785, y: 255 },
          { label: "Audit Log & Jejak Riwayat", x: 790, y: 310 },
        ],
      },
      {
        id: "ui-ux-design",
        title: "Desain Antarmuka",
        x: 640,
        y: 390,
        subNodes: [
          { label: "Palet Warna Modern", x: 660, y: 320 },
          { label: "Inspirasi UI Dribbble", x: 770, y: 385 },
          { label: "Token Desain Tailwind", x: 740, y: 445 },
        ],
      },
      {
        id: "api-integration",
        title: "Integrasi & API",
        x: 490,
        y: 445,
        subNodes: [
          { label: "Spesifikasi REST OpenAPI", x: 590, y: 400 },
          { label: "Webhook Idempotent", x: 540, y: 435 },
          { label: "Autentikasi & RBAC", x: 600, y: 470 },
          { label: "Integrasi Repositori GitHub", x: 490, y: 495 },
          { label: "Sinkronisasi Cloud", x: 395, y: 490 },
        ],
      },
      {
        id: "memory-execution",
        title: "Memori & Eksekusi",
        x: 315,
        y: 370,
        subNodes: [
          { label: "Artefak Dokumen Unduh", x: 280, y: 290 },
          { label: "Diagram Visual Interaktif", x: 345, y: 315 },
          { label: "Memori Konteks Proyek", x: 205, y: 410 },
          { label: "Katalog Aplikasi Koda", x: 260, y: 425 },
          { label: "Instruksi Sistem Kustom", x: 295, y: 475 },
        ],
      },
    ],
    []
  );

  // Determine active hub based on auto-rotation or user hover
  const currentActiveHubId = useMemo(() => {
    if (!hoveredNode) {
      return hubs[activeHubIndex]?.id;
    }
    if (hoveredNode === "center") {
      return hubs[activeHubIndex]?.id;
    }
    // Check if hoveredNode is a hub id
    const matchingHub = hubs.find((h) => h.id === hoveredNode);
    if (matchingHub) return matchingHub.id;

    // Check if hoveredNode is a sub-node label
    const parentHub = hubs.find((h) =>
      h.subNodes.some((s) => s.label === hoveredNode)
    );
    if (parentHub) return parentHub.id;

    return hubs[activeHubIndex]?.id;
  }, [hoveredNode, activeHubIndex, hubs]);

  // Clockwise auto-rotation interval (pauses while user hovers)
  useEffect(() => {
    if (hoveredNode !== null) return;

    const timer = setInterval(() => {
      setActiveHubIndex((prev) => (prev + 1) % hubs.length);
    }, 2500);

    return () => clearInterval(timer);
  }, [hoveredNode, hubs.length]);

  // Compute rotation angle for Sunburst icon pointing to the active hub
  const activeHubObj = hubs.find((h) => h.id === currentActiveHubId) || hubs[0];
  const sunburstAngle = useMemo(() => {
    const dx = activeHubObj.x - centerNode.x;
    const dy = activeHubObj.y - centerNode.y;
    return Math.round(Math.atan2(dy, dx) * (180 / Math.PI));
  }, [activeHubObj, centerNode]);

  return (
    <section className="relative w-full bg-[#141413] text-[#FAF9F5] select-none py-24 md:py-32 px-4 overflow-hidden border-t border-white/[0.04]">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(204,120,92,0.03)_0%,transparent_75%)] pointer-events-none" />

      <div className="max-w-[1360px] mx-auto relative z-10 flex flex-col items-center">
        
        {/* ================= SVG CONSTELLATION GRAPH CANVAS ================= */}
        <div className="relative w-full max-w-[1100px] aspect-[1000/520] min-h-[460px] sm:min-h-[500px]">
          <svg
            className="w-full h-full"
            viewBox="0 0 1000 520"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Terracotta glow filter for active lines and nodes */}
              <filter id="terracotta-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Radial aura gradient for active hub */}
              <radialGradient id="hub-aura" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#CC785C" stopOpacity="0.32" />
                <stop offset="60%" stopColor="#CC785C" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#CC785C" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Horizontal bridge between Perencanaan PRD and Arsitektur Sistem */}
            <line
              x1="350"
              y1="120"
              x2="620"
              y2="110"
              stroke={
                currentActiveHubId === "prd-planning" ||
                currentActiveHubId === "system-architecture"
                  ? "#CC785C"
                  : "#2E2C29"
              }
              strokeOpacity={
                currentActiveHubId === "prd-planning" ||
                currentActiveHubId === "system-architecture"
                  ? 0.45
                  : 0.6
              }
              strokeWidth="1"
              strokeDasharray="3 3"
              className="transition-colors duration-500"
            />

            {/* Connecting Lines from Center to Main Hubs */}
            {hubs.map((hub, index) => {
              const isActive = currentActiveHubId === hub.id;
              return (
                <g key={`line-center-group-${hub.id}`}>
                  {/* Inactive or base line */}
                  <line
                    x1={centerNode.x}
                    y1={centerNode.y}
                    x2={hub.x}
                    y2={hub.y}
                    stroke={isActive ? "#CC785C" : "#302E2B"}
                    strokeWidth={isActive ? "1.8" : "1"}
                    className="transition-colors duration-500"
                  />

                  {/* Active beam glow underlay and traveling laser particle */}
                  {isActive && (
                    <>
                      {/* Soft glow stroke underlay */}
                      <line
                        x1={centerNode.x}
                        y1={centerNode.y}
                        x2={hub.x}
                        y2={hub.y}
                        stroke="#CC785C"
                        strokeWidth="4"
                        strokeOpacity="0.35"
                        filter="url(#terracotta-glow)"
                      />

                      {/* Laser pulse traveling from center to hub */}
                      <circle r="3" fill="#FAF9F5" filter="url(#terracotta-glow)">
                        <animate
                          attributeName="cx"
                          from={centerNode.x}
                          to={hub.x}
                          dur="1.2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="cy"
                          from={centerNode.y}
                          to={hub.y}
                          dur="1.2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0;1;1;0"
                          keyTimes="0;0.15;0.85;1"
                          dur="1.2s"
                          repeatCount="indefinite"
                        />
                      </circle>

                      {/* Hub radiant aura */}
                      <circle
                        cx={hub.x}
                        cy={hub.y}
                        r="32"
                        fill="url(#hub-aura)"
                        className="animate-pulse"
                      />
                    </>
                  )}
                </g>
              );
            })}

            {/* Connecting Lines from Hubs to Sub-Nodes */}
            {hubs.map((hub) => {
              const isHubActive = currentActiveHubId === hub.id;
              return hub.subNodes.map((sub, idx) => {
                const isSubHovered = hoveredNode === sub.label;
                return (
                  <line
                    key={`line-${hub.id}-${idx}`}
                    x1={hub.x}
                    y1={hub.y}
                    x2={sub.x}
                    y2={sub.y}
                    stroke={
                      isSubHovered
                        ? "#FAF9F5"
                        : isHubActive
                        ? "#CC785C"
                        : "#262422"
                    }
                    strokeOpacity={isSubHovered ? 1 : isHubActive ? 0.45 : 0.6}
                    strokeWidth={isSubHovered ? "1.2" : isHubActive ? "1" : "0.75"}
                    className="transition-all duration-500"
                    style={{
                      transitionDelay: isHubActive ? `${idx * 45}ms` : "0ms",
                    }}
                  />
                );
              });
            })}

            {/* Sub-Node Labels */}
            {hubs.map((hub) => {
              const isHubActive = currentActiveHubId === hub.id;
              return hub.subNodes.map((sub, idx) => {
                const isSubHovered = hoveredNode === sub.label;
                return (
                  <g
                    key={`text-sub-${hub.id}-${idx}`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredNode(sub.label)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <text
                      x={sub.x}
                      y={sub.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={
                        isSubHovered
                          ? "#FAF9F5"
                          : isHubActive
                          ? "#D0CDC5"
                          : "#605E58"
                      }
                      fontSize="10.5"
                      fontFamily="var(--font-sans), sans-serif"
                      fontWeight={isSubHovered ? "500" : isHubActive ? "450" : "400"}
                      className="transition-colors duration-400 select-none"
                      style={{
                        transitionDelay: isHubActive ? `${idx * 45}ms` : "0ms",
                      }}
                    >
                      {sub.label}
                    </text>
                  </g>
                );
              });
            })}

            {/* Main Hub Titles */}
            {hubs.map((hub, index) => {
              const isActive = currentActiveHubId === hub.id;
              const isDirectlyHovered = hoveredNode === hub.id;
              return (
                <g
                  key={`text-hub-${hub.id}`}
                  className="cursor-pointer group"
                  onClick={() => setActiveHubIndex(index)}
                  onMouseEnter={() => setHoveredNode(hub.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <text
                    x={hub.x}
                    y={hub.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isActive ? "#FAF9F5" : "#8E8B84"}
                    fontSize={isActive ? "18" : "17"}
                    fontFamily="var(--font-serif), Georgia, serif"
                    fontWeight="400"
                    className="transition-all duration-400 select-none"
                    style={{
                      filter: isActive
                        ? "drop-shadow(0 0 10px rgba(204,120,92,0.7))"
                        : "none",
                    }}
                  >
                    {hub.title}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* ================= CENTER ROOT NODE ================= */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full cursor-pointer group transition-all duration-300 bg-[#141413]/90 border border-white/10 shadow-[0_0_25px_rgba(204,120,92,0.2)] hover:border-[#CC785C]/50 hover:scale-105"
            onMouseEnter={() => setHoveredNode("center")}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <div
              className="w-6 h-6 flex items-center justify-center transition-transform duration-700 ease-out"
              style={{
                transform: `rotate(${sunburstAngle}deg)`,
              }}
            >
              <ClaudeSunburst className="w-6 h-6 text-[#CC785C]" />
            </div>
            <span className="font-medium text-2xl text-[#FAF9F5] tracking-tight">
              {brandName}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
