"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SliderAliasPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/tools/slides");
  }, [router]);

  return (
    <div className="h-screen w-screen bg-[#0B0909] flex items-center justify-center text-xs text-[#80868b]">
      Mengarahkan ke Slider AI PPT Studio...
    </div>
  );
}
