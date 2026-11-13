"use client";

import React from "react";

export function KodaGeometricLogo({
  className = "w-6 h-5",
  variant = "terracotta",
}: {
  className?: string;
  variant?: "terracotta" | "white";
}) {
  const src =
    variant === "white"
      ? "/images/koda-logo-white.png"
      : "/images/koda-logo-white.png";

  return (
    <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Koda Logo"
        className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      />
    </span>
  );
}
