"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateUniqueDocId, getLastActiveDocId } from "@/lib/apps/prd-document-storage";

export default function PrdEditorRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      let targetId = getLastActiveDocId();
      if (!targetId) {
        const active = localStorage.getItem("koda_active_prd_doc");
        if (active) {
          const parsed = JSON.parse(active);
          if (parsed.id) {
            targetId = parsed.id;
          } else if (parsed.appName || parsed.title) {
            targetId = generateUniqueDocId(parsed.appName || parsed.title);
          }
        }
      }

      if (!targetId) {
        targetId = generateUniqueDocId("ecommerce-mvp");
      }

      router.replace(`/tools/prd-editor/${targetId}`);
    } catch {
      router.replace(`/tools/prd-editor/${generateUniqueDocId("prd-document")}`);
    }
  }, [router]);

  return (
    <div className="h-screen w-full bg-[#0B0909] flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#408175] border-t-transparent animate-spin" />
        <p className="text-xs text-[#9aa0a6]">Mengalihkan ke Ruang Dokumen Unik...</p>
      </div>
    </div>
  );
}
