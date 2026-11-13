"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useUserProfile } from "@/hooks/use-user-profile";

interface HeroShowcaseProps {
  onSelectPrompt?: (promptText: string) => void;
}

const GREETING_TEMPLATES = [
  "Sudah siap nih, {name}?",
  "Mau bikin apa hari ini, {name}?",
  "Ada ide brilian apa, {name}?",
  "Siap eksplorasi hal baru, {name}?",
  "Yuk bangun sesuatu yang keren, {name}!",
  "Apa yang mau kita rancang, {name}?",
  "What shall we think through, {name}?",
];

export function HeroShowcase({ onSelectPrompt }: HeroShowcaseProps) {
  const { userName, userEmail } = useUserProfile();

  const resolvedName = useMemo(() => {
    if (userName) return userName;
    if (userEmail) {
      const part = userEmail.split("@")[0].split(/[._-]/)[0];
      if (part && part.toLowerCase().includes("virga")) return "Virga";
      if (part && part.length > 1) return part.charAt(0).toUpperCase() + part.slice(1);
    }
    return "Virga";
  }, [userName, userEmail]);

  const [greetingIndex, setGreetingIndex] = useState(0);

  useEffect(() => {
    // Pick a random greeting on client mount
    const randomIndex = Math.floor(Math.random() * GREETING_TEMPLATES.length);
    setGreetingIndex(randomIndex);
  }, []);

  const handleNextGreeting = () => {
    setGreetingIndex((prev) => (prev + 1) % GREETING_TEMPLATES.length);
  };

  const currentTemplate = GREETING_TEMPLATES[greetingIndex];
  const greetingText = currentTemplate.replace("{name}", resolvedName);

  return (
    <div className="w-full flex items-center justify-center select-none px-4 py-8 animate-in fade-in duration-300">
      <div
        onClick={handleNextGreeting}
        className="flex items-center justify-center gap-3.5 sm:gap-4.5 text-center cursor-pointer transition-opacity hover:opacity-90 group"
        title="Klik untuk sapaan lain"
      >
        <div className="relative w-8 h-8 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center">
          <Image
            src="/images/koda-logo-white.png"
            alt="Koda Logo"
            width={40}
            height={30}
            className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
            priority
          />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-[42px] text-[#ededed] font-normal tracking-tight leading-none">
          {greetingText}
        </h1>
      </div>
    </div>
  );
}
