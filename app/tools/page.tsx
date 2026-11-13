"use client";

import React, { Suspense } from "react";
import { ToolsHubView } from "@/components/tools/ToolsHubView";

export default function ToolsPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-[#0B0909] flex items-center justify-center text-xs text-[#80868b]">
          Memuat AI Tools Directory...
        </div>
      }
    >
      <ToolsHubView />
    </Suspense>
  );
}
