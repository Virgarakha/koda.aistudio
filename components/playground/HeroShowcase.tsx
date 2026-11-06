"use client";

import React from "react";
import { ArrowUp, ArrowRight, Sparkles } from "lucide-react";

interface HeroShowcaseProps {
  onSelectPrompt: (promptText: string) => void;
}

export function HeroShowcase({ onSelectPrompt }: HeroShowcaseProps) {
  const quickPrompts = [
    "Turn a hand-drawn sketch into a live UI",
    "Extract structured JSON from messy receipts",
    "Compare live flight & weather disruptions",
  ];

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center px-4 select-none">
      {/* Left Column: Heading & Quick Prompts */}
      <div className="lg:col-span-5 space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#f1f3f4] tracking-tight leading-tight">
            Start building with <br />
            <span className="text-white font-bold bg-gradient-to-r from-white via-[#fed7aa] to-[#d97736] bg-clip-text text-transparent">
              Gemini 3.8 Flash
            </span>
          </h1>
          <p className="text-sm text-[#9aa0a6] leading-relaxed max-w-md">
            Fast, frontier-class multimodal intelligence built for responsive
            apps and high-throughput workflows.
          </p>
        </div>

        {/* 3 Quick Prompt buttons */}
        <div className="space-y-2 pt-2">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt(prompt)}
              className="w-full text-left px-3.5 py-2.5 rounded-xl bg-[#1e1f20]/90 hover:bg-[#282a2c] border border-[#2e3032] hover:border-[#3c4043] text-xs text-[#c4c7c5] hover:text-[#f1f3f4] transition duration-150 flex items-center justify-between group shadow-sm"
            >
              <span className="truncate pr-2">{prompt}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#80868b] group-hover:text-[#d97736] group-hover:translate-x-0.5 transition" />
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Visual Showcase Cards */}
      <div className="lg:col-span-7 flex flex-col gap-3">
        {/* Top Showcase Card: Financial Research Agent */}
        <div
          onClick={() =>
            onSelectPrompt(
              "Analyze real-time market data for NASDAQ tech stocks and forecast potential portfolio returns."
            )
          }
          className="group relative rounded-2xl bg-gradient-to-b from-[#1b1c1e] to-[#141517] border border-[#2e3032] hover:border-[#444746] p-5 cursor-pointer transition overflow-hidden shadow-xl"
        >
          {/* Subtle background grid & code lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#282a2c_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* Floating Financial Cards */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 py-3">
            {/* Main Stock Card */}
            <div className="bg-white text-neutral-900 rounded-2xl p-4 shadow-2xl w-56 transform group-hover:-translate-y-0.5 transition duration-200">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tracking-tight text-neutral-900">
                  $181
                </span>
                <span className="text-base font-semibold text-neutral-600">
                  .69
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                  NASDAQ
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  +0.79%
                </span>
              </div>
              {/* Sparkline line */}
              <div className="mt-3 h-8 w-full flex items-end">
                <svg
                  className="w-full h-full stroke-emerald-500 fill-none"
                  viewBox="0 0 100 30"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 0 25 Q 20 28, 40 18 T 75 14 T 100 5"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 0 25 Q 20 28, 40 18 T 75 14 T 100 5 L 100 30 L 0 30 Z"
                    className="fill-emerald-500/10"
                  />
                </svg>
              </div>
            </div>

            {/* Smaller floating metric card */}
            <div className="bg-[#eef2f6] text-neutral-900 rounded-2xl p-3.5 shadow-xl flex items-center gap-3 transform group-hover:scale-105 transition duration-200">
              <div>
                <p className="text-sm font-bold text-neutral-900">$510.13</p>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-0.5">
                  <span>+0.54%</span>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                <ArrowUp className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Bottom tag pill */}
          <div className="mt-2 flex justify-start">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#282a2c]/90 text-[11px] font-medium text-[#c4c7c5] border border-[#3c4043]/60 group-hover:text-white transition">
              Financial Research Agent
            </span>
          </div>
        </div>

        {/* Bottom 2 Showcase Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Card 1: The Urban Hive Project */}
          <div
            onClick={() =>
              onSelectPrompt(
                "Create an interactive annual sustainability report layout for The Urban Hive Project with impact charts."
              )
            }
            className="group relative rounded-2xl bg-gradient-to-br from-[#1c241e] via-[#161a17] to-[#121413] border border-[#2e3032] hover:border-[#34d399]/40 p-4 h-36 flex flex-col justify-between cursor-pointer transition overflow-hidden shadow-lg"
          >
            {/* Visual foliage pattern backdrop */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,#10b981_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute top-2 right-2 text-2xl opacity-40 select-none">
              🌿
            </div>

            <div className="relative z-10">
              <span className="text-[10px] tracking-widest uppercase font-semibold text-emerald-400/90 block mb-1">
                ANNUAL SUSTAINABILITY
              </span>
              <h3 className="font-serif text-lg text-white font-medium tracking-wide">
                The Urban Hive Project
              </h3>
            </div>

            <div className="relative z-10">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#1e2022]/90 text-[10.5px] font-medium text-[#c4c7c5] border border-[#3c4043]/60 group-hover:text-white transition">
                Interactive Annual Report
              </span>
            </div>
          </div>

          {/* Card 2: Dinosaur Fossil Explorer */}
          <div
            onClick={() =>
              onSelectPrompt(
                "Build an interactive world map highlighting Cretaceous dinosaur fossil discovery sites and 3D skeleton models."
              )
            }
            className="group relative rounded-2xl bg-gradient-to-br from-[#0c242b] via-[#091b20] to-[#071317] border border-[#06b6d4]/40 hover:border-[#22c55e] p-4 h-36 flex flex-col justify-between cursor-pointer transition overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]"
          >
            {/* Background cyan map texture & green pixel dino */}
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[10px] tracking-wider uppercase font-semibold text-cyan-300">
                PALEONTOLOGY ARCHIVE
              </span>
              {/* Dino Pixel Art representation */}
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-xl group-hover:scale-110 transition">
                🦖
              </div>
            </div>

            <div className="relative z-10">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#142328]/90 text-[10.5px] font-medium text-cyan-200 border border-cyan-500/30 group-hover:text-white transition">
                Dinosaur Fossil Explorer
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
