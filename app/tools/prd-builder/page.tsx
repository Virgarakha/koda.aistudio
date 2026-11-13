"use client";

import React, { Suspense } from "react";
import { PrdBuilderStudio } from "@/components/tools/PrdBuilderStudio";

export default function PrdBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-[#0B0909] flex items-center justify-center text-xs text-[#80868b]">
          Memuat AI PRD Builder Studio...
        </div>
      }
    >
      <PrdBuilderStudio />
    </Suspense>
  );
}
