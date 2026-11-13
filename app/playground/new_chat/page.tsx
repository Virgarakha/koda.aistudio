"use client";

import { Suspense } from "react";
import { PlaygroundView } from "@/components/playground/PlaygroundView";

export default function NewChatPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-[#0B0909] flex items-center justify-center text-xs text-[#80868b]">
          Menyiapkan obrolan AI...
        </div>
      }
    >
      <PlaygroundView />
    </Suspense>
  );
}
