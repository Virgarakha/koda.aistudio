import { Suspense } from "react";
import { SettingsView } from "@/components/settings/SettingsView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings - Koda AI Studio",
  description: "Account details, custom AI models, and workspace configuration",
};

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-[#0B0909] text-[#9aa0a6]">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 border-2 border-[#408175] border-t-transparent rounded-full animate-spin" />
            <span>Memuat pengaturan...</span>
          </div>
        </div>
      }
    >
      <SettingsView />
    </Suspense>
  );
}
