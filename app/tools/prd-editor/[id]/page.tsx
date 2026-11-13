import React, { Suspense } from "react";
import { Metadata } from "next";
import { PrdEditorClientWrapper } from "./client-wrapper";

export const metadata: Metadata = {
  title: "PRD Document Editor — Koda AI Suite",
  description: "Dokumen editor interaktif PRD dual-pane dengan kolaborasi database real-time.",
};

export default function PrdEditorIdPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full bg-[#0B0909] flex items-center justify-center text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#408175] border-t-transparent animate-spin" />
            <p className="text-xs text-[#9aa0a6]">Menghubungkan Dokumen ke Database...</p>
          </div>
        </div>
      }
    >
      <PrdEditorClientWrapper />
    </Suspense>
  );
}
