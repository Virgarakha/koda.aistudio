"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";

export function AskClaudeCtaSection({
  brandName = "Koda",
}: {
  brandName?: string;
}) {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      router.push(
        `/playground/new_chat?prompt=${encodeURIComponent(prompt.trim())}`
      );
    } else {
      router.push("/playground/new_chat");
    }
  };

  return (
    <section className="relative w-full bg-[#262523] text-[#FAF9F5] py-28 sm:py-36 md:py-40 px-6 overflow-hidden border-t border-white/[0.05]">
      {/* Subtle warm center radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.015)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
        {/* ================= EDITORIAL HEADLINE ================= */}
        <h2 className="font-serif text-3xl sm:text-4xl md:text-[52px] lg:text-[56px] font-normal tracking-tight text-[#FAF9F5] leading-[1.2] max-w-2xl">
          Belum tahu harus mulai dari mana?
          <br />
          Tanyakan pada {brandName}.
        </h2>

        {/* ================= SUBTITLE ================= */}
        <p className="mt-4 sm:mt-5 text-[#9E9B93] text-sm sm:text-base md:text-[17px] font-sans font-normal max-w-xl leading-relaxed">
          {brandName} bekerja bersama Anda merancang PRD 13 bab, diagram alur sistem, dan arsitektur perangkat lunak yang tangguh.
        </p>

        {/* ================= INTERACTIVE INPUT BOX ================= */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 sm:mt-10 w-full max-w-[560px] mx-auto"
        >
          <div className="relative flex items-center bg-[#1D1C1B] border border-white/[0.08] hover:border-white/[0.16] focus-within:border-white/[0.25] rounded-2xl sm:rounded-full px-4 sm:px-5 py-2 shadow-2xl transition-all">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Bagaimana Koda bisa membantu proyek sistem Anda hari ini?"
              className="w-full bg-transparent text-[#FAF9F5] placeholder-[#78756E] text-xs sm:text-sm outline-none pr-3"
            />
            <button
              type="submit"
              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-[#CC785C] hover:bg-[#B8684E] text-white text-[12px] sm:text-[13px] font-medium transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>Tanya {brandName}</span>
              <ArrowUp className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
