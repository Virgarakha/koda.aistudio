"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AbstractWireframe } from "./AbstractWireframe";

export interface FloatingCardProps {
  id: string;
  label: string;
  type: "image" | "wireframe";
  imageSrc?: string;
  wireframeVariant?: "qbr" | "survey" | "feedback" | "contract";
  style: React.CSSProperties;
  className?: string;
  width?: number;
  height?: number;
  hasVectorOverlay?: boolean;
  promptText?: string;
}

export function FloatingCard({
  id,
  label,
  type,
  imageSrc,
  wireframeVariant = "qbr",
  style,
  className = "",
  width = 145,
  height = 145,
  hasVectorOverlay = false,
  promptText,
}: FloatingCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`absolute transition-all duration-700 ease-out hover:z-40 group cursor-pointer ${className}`}
      style={style}
    >
      <Link
        href={
          promptText
            ? `/playground/new_chat?prompt=${encodeURIComponent(promptText)}`
            : "/playground/new_chat"
        }
        className="block"
      >
        {/* Card Body Container */}
        <div
          className="relative rounded-2xl overflow-hidden bg-[#1C1B19] border border-white/[0.08] shadow-[0_10px_35px_rgba(0,0,0,0.55)] group-hover:border-[#CC785C]/40 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(204,120,92,0.18)] transition-all duration-300 transform group-hover:scale-[1.06] group-hover:-translate-y-1.5"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          {type === "image" && imageSrc && !imgError ? (
            <div className="relative w-full h-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt={label}
                className="w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.05] group-hover:brightness-105 group-hover:contrast-[1.08] transition-all duration-500"
                onError={() => setImgError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

              {/* Vector Overlay */}
              {hasVectorOverlay && (
                <div className="absolute inset-0 pointer-events-none opacity-60 mix-blend-screen p-2">
                  <AbstractWireframe variant="qbr" className="w-full h-full" />
                </div>
              )}
            </div>
          ) : (
            /* Generative Doodle Wireframe */
            <div className="w-full h-full p-4 flex items-center justify-center bg-[#1A1918]">
              <AbstractWireframe
                variant={wireframeVariant}
                className="w-full h-full opacity-75 group-hover:opacity-100 transition-opacity"
              />
            </div>
          )}

          {/* Interactive Shimmer Sweep Effect on Hover */}
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </div>

          {/* Ambient Rim Ring Glow */}
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.05] pointer-events-none group-hover:ring-[#CC785C]/30 transition-all" />
        </div>

        {/* Caption Label underneath */}
        {label && (
          <div className="mt-2 text-left">
            <span className="text-[11.5px] font-sans font-normal text-[#8A8782] group-hover:text-[#FAF9F5] group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all tracking-tight">
              {label}
            </span>
          </div>
        )}
      </Link>
    </div>
  );
}
