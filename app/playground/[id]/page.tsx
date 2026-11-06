"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { PlaygroundView } from "@/components/playground/PlaygroundView";

function PlaygroundAppContent() {
  const params = useParams();
  const id = params?.id as string | undefined;

  return <PlaygroundView appId={id} />;
}

export default function ExistingAppPlaygroundPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-[#131314] flex items-center justify-center text-xs text-[#80868b]">
          Memuat aplikasi...
        </div>
      }
    >
      <PlaygroundAppContent />
    </Suspense>
  );
}
