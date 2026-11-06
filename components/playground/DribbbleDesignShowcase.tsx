"use client";

import React, { useState } from "react";
import { ExternalLink, Maximize2, X, Sparkles, Layers } from "lucide-react";

export interface DesignInspiration {
  title: string;
  source?: string;
  url: string;
  author?: string;
  tags?: string[];
}

export interface DribbbleDesignBlockData {
  title?: string;
  designs: DesignInspiration[];
}

// Guaranteed verified Dribbble CDN UI screenshots (Mockups only, never humans)
const DRIBBLE_UI_SAFE_FALLBACKS = [
  "https://cdn.dribbble.com/userupload/46803046/file/d68200f76f87a585dd93df5e3e53570f.png?resize=1200x900&vertical=center",
  "https://cdn.dribbble.com/userupload/7265837/file/original-075fe36b14b580a2a961ebb2af612aa0.jpg?resize=1200x900&vertical=center",
  "https://cdn.dribbble.com/userupload/46547586/file/c00b9f32defb7e4016d1a0bf8017fa4e.png?resize=1200x900&vertical=center",
  "https://cdn.dribbble.com/userupload/12484875/file/original-d90573b0d9593de0cf3680629dc229e5.png?resize=1200x900&vertical=center",
  "https://cdn.dribbble.com/userupload/49434252/file/8d5100863a016d35fda5ca238a8de78a.png?resize=1200x900&vertical=center",
  "https://cdn.dribbble.com/userupload/17154627/file/original-444eb215abc1f61f1dbf9997fad57f3c.png?resize=1200x900&vertical=center",
];

export function isDribbbleDesignJson(text: string, language?: string): boolean {
  if (language === "designs-json" || language === "dribbble-json") return true;
  if (!text || text.length < 15) return false;

  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(text);
      if (parsed.designs && Array.isArray(parsed.designs) && parsed.designs.length > 0) {
        return true;
      }
    } catch {}
  }
  return false;
}

export function DribbbleDesignShowcase({ rawJson }: { rawJson: string }) {
  const [activeImage, setActiveImage] = useState<DesignInspiration | null>(null);

  const data: DribbbleDesignBlockData = React.useMemo(() => {
    try {
      const parsed = JSON.parse(rawJson);
      if (parsed.designs && Array.isArray(parsed.designs)) {
        // Sanitize: replace any legacy Unsplash or non-Dribbble URLs with verified Dribbble UI screenshots
        const cleanDesigns = parsed.designs.map((item: DesignInspiration, idx: number) => {
          let url = item.url || "";
          if (
            url.includes("unsplash.com") ||
            url.includes("pexels.com") ||
            (!url.includes("cdn.dribbble.com") && !url.includes("dribbble"))
          ) {
            url = DRIBBLE_UI_SAFE_FALLBACKS[idx % DRIBBLE_UI_SAFE_FALLBACKS.length];
          }
          return {
            ...item,
            url,
          };
        });
        return { ...parsed, designs: cleanDesigns };
      }
      return { designs: [] };
    } catch {
      return { designs: [] };
    }
  }, [rawJson]);

  if (!data.designs || data.designs.length === 0) return null;

  // Derive search query for external Dribbble button
  const topicKeyword = data.title?.replace(/inspirasi|desain|antarmuka|aplikasi|dribbble|\(|\)/gi, "").trim() || "dashboard ui";
  const dribbbleSearchUrl = `https://dribbble.com/search/${encodeURIComponent(topicKeyword)}`;

  return (
    <div className="my-6 space-y-4">
      {/* Grid of 3+ Designs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {data.designs.map((item, idx) => (
          <div
            key={idx}
            className="group relative rounded-xl overflow-hidden border border-[#2e3032] bg-[#1a1b1d] transition-all duration-200 flex flex-col shadow-md"
          >
            {/* Image Preview Container with zoom hover */}
            <div className="relative aspect-[16/10] overflow-hidden bg-[#0d0e0f]">
              <img
                src={item.url}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  // Fallback: guaranteed authentic Dribbble UI screenshot mockup
                  const fallbackUrl = DRIBBLE_UI_SAFE_FALLBACKS[idx % DRIBBLE_UI_SAFE_FALLBACKS.length];
                  if ((e.target as HTMLImageElement).src !== fallbackUrl) {
                    (e.target as HTMLImageElement).src = fallbackUrl;
                  }
                }}
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-3">
                <button
                  type="button"
                  onClick={() => setActiveImage(item)}
                  className="px-2.5 py-1 rounded-lg bg-black/75 hover:bg-[#fff] text-white hover:text-black text-[11px] font-medium flex items-center gap-1.5 backdrop-blur-sm transition"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Perbesar</span>
                </button>

                {item.source && (
                  <a
                    href={item.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-black/75 hover:bg-white hover:text-black text-white text-xs backdrop-blur-sm transition"
                    title="Buka shot di Dribbble"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Subtle top badge: Dribbble UI */}
          
            </div>

            {/* Caption & Author */}
            
          </div>
        ))}
      </div>

      {/* Lightbox Zoom Modal */}
      {activeImage && (
        <div
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full bg-[#161719] border border-[#2e3032] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#1b1c1e] border-b border-[#282a2c]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ea4c89]" />
                <h4 className="font-semibold text-sm text-white">
                  {activeImage.title}
                </h4>
                {activeImage.author && (
                  <span className="text-xs text-[#9aa0a6]">
                    ({activeImage.author})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeImage.source && (
                  <a
                    href={activeImage.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 text-xs text-[#c4c7c5] hover:text-white bg-[#25272a] hover:bg-[#2e3033] rounded-lg transition flex items-center gap-1.5 border border-[#3c4043]"
                  >
                    <ExternalLink className="w-3 h-3 text-[#ea4c89]" />
                    <span>Dribbble</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setActiveImage(null)}
                  className="p-1.5 text-[#9aa0a6] hover:text-white hover:bg-[#282a2c] rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Large Image Preview */}
            <div className="p-4 bg-[#0d0e0f] flex items-center justify-center max-h-[80vh] overflow-hidden">
              <img
                src={activeImage.url}
                alt={activeImage.title}
                className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
