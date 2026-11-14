"use client";

import React, { Suspense } from "react";
import { SlideEditorStudio } from "@/components/slides/SlideEditorStudio";

export default function SlidesPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-[#0B0909] flex items-center justify-center text-xs text-[#80868b]">
          Memuat Slider AI Presentation Studio...
        </div>
      }
    >
      <SlideEditorStudio />
    </Suspense>
  );
}
