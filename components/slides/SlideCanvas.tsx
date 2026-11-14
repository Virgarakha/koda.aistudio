"use client";

import React from "react";
import {
  SlideData,
  SlideLayout,
  SlideThemeConfig,
  SlideCardItem,
  SlideMetricItem,
  SlideTimelineItem,
  SlideComparisonItem,
} from "@/lib/slides/types";
import {
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Quote,
  Clock,
  Plus,
  Trash2,
  Edit2,
  LayoutGrid,
} from "lucide-react";

interface SlideCanvasProps {
  slide: SlideData;
  theme: SlideThemeConfig;
  slideNumber: number;
  totalSlides: number;
  onUpdateSlide: (updated: SlideData) => void;
  readOnly?: boolean;
}

export function SlideCanvas({
  slide,
  theme,
  slideNumber,
  totalSlides,
  onUpdateSlide,
  readOnly = false,
}: SlideCanvasProps) {
  // Helpers to update slide fields
  const handleTextChange = (field: keyof SlideData, val: any) => {
    if (readOnly) return;
    onUpdateSlide({ ...slide, [field]: val });
  };

  const handleUpdateBullet = (index: number, val: string) => {
    if (readOnly) return;
    const bullets = [...(slide.bulletPoints || [])];
    bullets[index] = val;
    onUpdateSlide({ ...slide, bulletPoints: bullets });
  };

  const handleAddBullet = () => {
    if (readOnly) return;
    const bullets = [...(slide.bulletPoints || []), "Poin baru..."];
    onUpdateSlide({ ...slide, bulletPoints: bullets });
  };

  const handleRemoveBullet = (index: number) => {
    if (readOnly) return;
    const bullets = (slide.bulletPoints || []).filter((_, i) => i !== index);
    onUpdateSlide({ ...slide, bulletPoints: bullets });
  };

  const handleUpdateCard = (cardIndex: number, field: keyof SlideCardItem, val: string) => {
    if (readOnly) return;
    const cards = [...(slide.cards || [])];
    cards[cardIndex] = { ...cards[cardIndex], [field]: val };
    onUpdateSlide({ ...slide, cards });
  };

  const handleAddCard = () => {
    if (readOnly) return;
    const newCard: SlideCardItem = {
      id: `card-${Date.now()}`,
      title: "Kartu Baru",
      description: "Deskripsi singkat mengenai fitur atau poin ini.",
      badge: "INFO",
    };
    onUpdateSlide({ ...slide, cards: [...(slide.cards || []), newCard] });
  };

  const handleRemoveCard = (cardIndex: number) => {
    if (readOnly) return;
    const cards = (slide.cards || []).filter((_, i) => i !== cardIndex);
    onUpdateSlide({ ...slide, cards });
  };

  const handleUpdateMetric = (mIndex: number, field: keyof SlideMetricItem, val: string) => {
    if (readOnly) return;
    const metrics = [...(slide.metrics || [])];
    metrics[mIndex] = { ...metrics[mIndex], [field]: val };
    onUpdateSlide({ ...slide, metrics });
  };

  const handleUpdateTimeline = (tIndex: number, field: keyof SlideTimelineItem, val: string) => {
    if (readOnly) return;
    const timeline = [...(slide.timeline || [])];
    timeline[tIndex] = { ...timeline[tIndex], [field]: val };
    onUpdateSlide({ ...slide, timeline });
  };

  const handleUpdateComparison = (cIndex: number, field: keyof SlideComparisonItem, val: any) => {
    if (readOnly) return;
    const comparison = [...(slide.comparison || [])];
    comparison[cIndex] = { ...comparison[cIndex], [field]: val };
    onUpdateSlide({ ...slide, comparison });
  };

  return (
    <div
      className={`relative w-full aspect-video rounded-xl shadow-2xl border ${theme.cardBorder} ${theme.canvasBg} overflow-hidden flex flex-col justify-between p-8 sm:p-12 transition-all select-none`}
    >
      {/* Background Gradient Glow Accents */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: theme.accentColor }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: theme.accentColor }}
      />

      {/* Top Header Bar of Slide (Badge & Slide #) */}
      <div className="relative z-10 flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          {readOnly ? (
            <span
              className={`text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full ${theme.badgeBg} ${theme.badgeText} border border-current/20`}
            >
              {slide.badge || "KODA PRESENTATION"}
            </span>
          ) : (
            <input
              type="text"
              value={slide.badge || ""}
              onChange={(e) => handleTextChange("badge", e.target.value)}
              placeholder="BADGE SLIDE"
              className={`text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full ${theme.badgeBg} ${theme.badgeText} border border-current/20 outline-none focus:ring-1 focus:ring-current bg-transparent max-w-[200px]`}
            />
          )}
        </div>
        <div className={`text-xs font-mono font-medium opacity-50 ${theme.textSecondary}`}>
          {slideNumber} / {totalSlides}
        </div>
      </div>

      {/* Middle Content Area Depending on Layout */}
      <div className="relative z-10 flex-1 flex flex-col justify-center min-h-0 py-2">
        {/* ================= LAYOUT: TITLE ================= */}
        {slide.layout === "title" && (
          <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto space-y-4 my-auto">
            {readOnly ? (
              <h1 className={`text-3xl sm:text-5xl font-extrabold tracking-tight ${theme.textPrimary} leading-tight`}>
                {slide.title}
              </h1>
            ) : (
              <input
                type="text"
                value={slide.title}
                onChange={(e) => handleTextChange("title", e.target.value)}
                placeholder="Judul Presentasi..."
                className={`w-full text-center text-3xl sm:text-5xl font-extrabold tracking-tight ${theme.textPrimary} bg-transparent outline-none border-b border-transparent hover:border-current/30 focus:border-current transition`}
              />
            )}

            {readOnly ? (
              <p className={`text-base sm:text-xl font-normal ${theme.textSecondary} max-w-2xl`}>
                {slide.subtitle || ""}
              </p>
            ) : (
              <textarea
                value={slide.subtitle || ""}
                onChange={(e) => handleTextChange("subtitle", e.target.value)}
                placeholder="Subtitle atau penjelasan pembuka..."
                rows={2}
                className={`w-full text-center text-base sm:text-xl font-normal ${theme.textSecondary} bg-transparent outline-none border border-transparent hover:border-current/20 focus:border-current/40 rounded p-1 resize-none transition`}
              />
            )}

            <div className="pt-4 flex items-center justify-center gap-3">
              <div
                className="h-1 w-16 rounded-full"
                style={{ backgroundColor: theme.accentColor }}
              />
            </div>
          </div>
        )}

        {/* ================= LAYOUT: SPLIT (2 COLUMNS) ================= */}
        {slide.layout === "split" && (
          <div className="flex flex-col justify-center h-full space-y-4">
            <div className="shrink-0">
              {readOnly ? (
                <h2 className={`text-2xl sm:text-4xl font-bold tracking-tight ${theme.textPrimary}`}>
                  {slide.title}
                </h2>
              ) : (
                <input
                  type="text"
                  value={slide.title}
                  onChange={(e) => handleTextChange("title", e.target.value)}
                  className={`w-full text-2xl sm:text-4xl font-bold tracking-tight ${theme.textPrimary} bg-transparent outline-none border-b border-transparent hover:border-current/20 focus:border-current`}
                />
              )}
              {slide.subtitle && (
                <p className={`text-xs sm:text-sm mt-1 ${theme.textSecondary}`}>
                  {slide.subtitle}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1 items-center">
              {/* Left Column: Bullets */}
              <div className="space-y-3">
                {(slide.bulletPoints || []).map((bp, idx) => (
                  <div key={idx} className="flex items-start gap-3 group">
                    <div
                      className="w-2 h-2 rounded-full mt-2 shrink-0"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                    {readOnly ? (
                      <p className={`text-xs sm:text-sm leading-relaxed ${theme.textPrimary}`}>
                        {bp}
                      </p>
                    ) : (
                      <div className="flex items-center gap-2 flex-1">
                        <textarea
                          value={bp}
                          onChange={(e) => handleUpdateBullet(idx, e.target.value)}
                          rows={2}
                          className={`w-full text-xs sm:text-sm leading-relaxed ${theme.textPrimary} bg-transparent outline-none border border-transparent hover:border-current/20 focus:border-current/40 rounded p-1 resize-none`}
                        />
                        <button
                          onClick={() => handleRemoveBullet(idx)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1 transition"
                          title="Hapus poin"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {!readOnly && (
                  <button
                    onClick={handleAddBullet}
                    className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 mt-2 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <Plus className="w-3 h-3" /> Tambah Poin
                  </button>
                )}
              </div>

              {/* Right Column: Highlight Card */}
              <div>
                {(slide.cards || []).slice(0, 1).map((card, idx) => (
                  <div
                    key={card.id || idx}
                    className={`p-6 rounded-xl border ${theme.cardBorder} ${theme.cardBg} backdrop-blur-sm space-y-3 shadow-lg`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText}`}>
                        {card.badge || "KEY TAKEAWAY"}
                      </span>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    </div>
                    {readOnly ? (
                      <h4 className={`text-base sm:text-lg font-bold ${theme.textPrimary}`}>
                        {card.title}
                      </h4>
                    ) : (
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) => handleUpdateCard(idx, "title", e.target.value)}
                        className={`w-full text-base sm:text-lg font-bold ${theme.textPrimary} bg-transparent outline-none border-b border-transparent hover:border-current/20 focus:border-current`}
                      />
                    )}
                    {readOnly ? (
                      <p className={`text-xs sm:text-sm ${theme.textSecondary} leading-relaxed`}>
                        {card.description}
                      </p>
                    ) : (
                      <textarea
                        value={card.description}
                        onChange={(e) => handleUpdateCard(idx, "description", e.target.value)}
                        rows={3}
                        className={`w-full text-xs sm:text-sm ${theme.textSecondary} leading-relaxed bg-transparent outline-none border border-transparent hover:border-current/20 focus:border-current/40 rounded p-1 resize-none`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= LAYOUT: CARDS (GRID) ================= */}
        {slide.layout === "cards" && (
          <div className="flex flex-col justify-center h-full space-y-4">
            <div className="shrink-0">
              {readOnly ? (
                <h2 className={`text-2xl sm:text-4xl font-bold tracking-tight ${theme.textPrimary}`}>
                  {slide.title}
                </h2>
              ) : (
                <input
                  type="text"
                  value={slide.title}
                  onChange={(e) => handleTextChange("title", e.target.value)}
                  className={`w-full text-2xl sm:text-4xl font-bold tracking-tight ${theme.textPrimary} bg-transparent outline-none border-b border-transparent hover:border-current/20 focus:border-current`}
                />
              )}
              {slide.subtitle && (
                <p className={`text-xs sm:text-sm mt-1 ${theme.textSecondary}`}>
                  {slide.subtitle}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 items-center">
              {(slide.cards || []).map((card, idx) => (
                <div
                  key={card.id || idx}
                  className={`p-5 rounded-xl border ${theme.cardBorder} ${theme.cardBg} backdrop-blur-sm space-y-2.5 h-full flex flex-col justify-between group transition hover:border-current/40`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText}`}>
                        {card.badge || `0${idx + 1}`}
                      </span>
                      {!readOnly && (
                        <button
                          onClick={() => handleRemoveCard(idx)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-0.5 transition"
                          title="Hapus kartu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {readOnly ? (
                      <h4 className={`text-sm sm:text-base font-bold ${theme.textPrimary}`}>
                        {card.title}
                      </h4>
                    ) : (
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) => handleUpdateCard(idx, "title", e.target.value)}
                        className={`w-full text-sm sm:text-base font-bold ${theme.textPrimary} bg-transparent outline-none border-b border-transparent hover:border-current/20 focus:border-current`}
                      />
                    )}
                    {readOnly ? (
                      <p className={`text-xs ${theme.textSecondary} leading-relaxed`}>
                        {card.description}
                      </p>
                    ) : (
                      <textarea
                        value={card.description}
                        onChange={(e) => handleUpdateCard(idx, "description", e.target.value)}
                        rows={3}
                        className={`w-full text-xs ${theme.textSecondary} leading-relaxed bg-transparent outline-none border border-transparent hover:border-current/20 focus:border-current/40 rounded p-1 resize-none`}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!readOnly && (slide.cards || []).length < 4 && (
              <div className="shrink-0">
                <button
                  onClick={handleAddCard}
                  className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Kartu
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= LAYOUT: METRICS ================= */}
        {slide.layout === "metrics" && (
          <div className="flex flex-col justify-center h-full space-y-6">
            <div className="shrink-0 text-center">
              {readOnly ? (
                <h2 className={`text-2xl sm:text-4xl font-bold tracking-tight ${theme.textPrimary}`}>
                  {slide.title}
                </h2>
              ) : (
                <input
                  type="text"
                  value={slide.title}
                  onChange={(e) => handleTextChange("title", e.target.value)}
                  className={`w-full text-center text-2xl sm:text-4xl font-bold tracking-tight ${theme.textPrimary} bg-transparent outline-none border-b border-transparent hover:border-current/20 focus:border-current`}
                />
              )}
              {slide.subtitle && (
                <p className={`text-xs sm:text-sm mt-1.5 ${theme.textSecondary}`}>
                  {slide.subtitle}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 items-center">
              {(slide.metrics || []).map((m, idx) => (
                <div
                  key={m.id || idx}
                  className={`p-5 rounded-xl border ${theme.cardBorder} ${theme.cardBg} backdrop-blur-sm text-center space-y-2 h-full flex flex-col justify-center`}
                >
                  {readOnly ? (
                    <div
                      className="text-3xl sm:text-5xl font-extrabold tracking-tight"
                      style={{ color: theme.accentColor }}
                    >
                      {m.value}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={m.value}
                      onChange={(e) => handleUpdateMetric(idx, "value", e.target.value)}
                      className="w-full text-center text-3xl sm:text-5xl font-extrabold tracking-tight bg-transparent outline-none"
                      style={{ color: theme.accentColor }}
                    />
                  )}

                  {readOnly ? (
                    <div className={`text-xs sm:text-sm font-semibold ${theme.textPrimary}`}>
                      {m.label}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={m.label}
                      onChange={(e) => handleUpdateMetric(idx, "label", e.target.value)}
                      className={`w-full text-center text-xs sm:text-sm font-semibold ${theme.textPrimary} bg-transparent outline-none border-b border-transparent hover:border-current/20`}
                    />
                  )}

                  {m.detail && (
                    <p className={`text-[11px] ${theme.textSecondary} line-clamp-2`}>
                      {m.detail}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= LAYOUT: TIMELINE ================= */}
        {slide.layout === "timeline" && (
          <div className="flex flex-col justify-center h-full space-y-6">
            <div className="shrink-0">
              {readOnly ? (
                <h2 className={`text-2xl sm:text-4xl font-bold tracking-tight ${theme.textPrimary}`}>
                  {slide.title}
                </h2>
              ) : (
                <input
                  type="text"
                  value={slide.title}
                  onChange={(e) => handleTextChange("title", e.target.value)}
                  className={`w-full text-2xl sm:text-4xl font-bold tracking-tight ${theme.textPrimary} bg-transparent outline-none border-b border-transparent hover:border-current/20 focus:border-current`}
                />
              )}
              {slide.subtitle && (
                <p className={`text-xs sm:text-sm mt-1 ${theme.textSecondary}`}>
                  {slide.subtitle}
                </p>
              )}
            </div>

            {/* Horizontal Timeline Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 flex-1 items-center relative">
              {(slide.timeline || []).map((step, idx) => (
                <div
                  key={step.id || idx}
                  className={`p-4 rounded-xl border ${theme.cardBorder} ${theme.cardBg} backdrop-blur-sm space-y-2 relative h-full flex flex-col justify-between`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${theme.badgeBg} ${theme.badgeText}`}>
                        {step.phase}
                      </span>
                      <span className={`text-[10px] font-mono ${theme.textSecondary}`}>
                        {step.dateOrQuarter}
                      </span>
                    </div>
                    {readOnly ? (
                      <h4 className={`text-xs sm:text-sm font-bold ${theme.textPrimary}`}>
                        {step.title}
                      </h4>
                    ) : (
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => handleUpdateTimeline(idx, "title", e.target.value)}
                        className={`w-full text-xs sm:text-sm font-bold ${theme.textPrimary} bg-transparent outline-none border-b border-transparent hover:border-current/20 focus:border-current`}
                      />
                    )}
                    {readOnly ? (
                      <p className={`text-[11px] ${theme.textSecondary} leading-relaxed`}>
                        {step.description}
                      </p>
                    ) : (
                      <textarea
                        value={step.description}
                        onChange={(e) => handleUpdateTimeline(idx, "description", e.target.value)}
                        rows={3}
                        className={`w-full text-[11px] ${theme.textSecondary} leading-relaxed bg-transparent outline-none border border-transparent hover:border-current/20 rounded p-1 resize-none`}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= LAYOUT: COMPARISON ================= */}
        {slide.layout === "comparison" && (
          <div className="flex flex-col justify-center h-full space-y-4">
            <div className="shrink-0">
              {readOnly ? (
                <h2 className={`text-2xl sm:text-4xl font-bold tracking-tight ${theme.textPrimary}`}>
                  {slide.title}
                </h2>
              ) : (
                <input
                  type="text"
                  value={slide.title}
                  onChange={(e) => handleTextChange("title", e.target.value)}
                  className={`w-full text-2xl sm:text-4xl font-bold tracking-tight ${theme.textPrimary} bg-transparent outline-none border-b border-transparent hover:border-current/20 focus:border-current`}
                />
              )}
              {slide.subtitle && (
                <p className={`text-xs sm:text-sm mt-1 ${theme.textSecondary}`}>
                  {slide.subtitle}
                </p>
              )}
            </div>

            <div className={`rounded-xl border ${theme.cardBorder} ${theme.cardBg} backdrop-blur-sm overflow-hidden flex-1 flex flex-col justify-center`}>
              <div className="grid grid-cols-3 p-3 bg-black/20 font-bold text-xs uppercase tracking-wider text-muted-foreground border-b border-white/5">
                <div>Kriteria / Fitur</div>
                <div style={{ color: theme.accentColor }}>Solusi Koda AI</div>
                <div>Cara Konvensional</div>
              </div>
              <div className="divide-y divide-white/5">
                {(slide.comparison || []).map((row, idx) => (
                  <div key={row.id || idx} className="grid grid-cols-3 p-3 text-xs items-center gap-2">
                    <div className={`font-semibold ${theme.textPrimary}`}>
                      {row.feature}
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{row.optionA}</span>
                    </div>
                    <div className={`opacity-60 ${theme.textSecondary}`}>
                      {row.optionB}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= LAYOUT: QUOTE ================= */}
        {slide.layout === "quote" && (
          <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto space-y-6 my-auto">
            <Quote className="w-12 h-12 opacity-30" style={{ color: theme.accentColor }} />
            {readOnly ? (
              <blockquote className={`text-lg sm:text-2xl font-serif italic ${theme.textPrimary} leading-relaxed`}>
                {(slide.bulletPoints && slide.bulletPoints[0]) || slide.subtitle || "Kutipan inspiratif..."}
              </blockquote>
            ) : (
              <textarea
                value={(slide.bulletPoints && slide.bulletPoints[0]) || slide.subtitle || ""}
                onChange={(e) => handleTextChange("bulletPoints", [e.target.value])}
                rows={3}
                className={`w-full text-center text-lg sm:text-2xl font-serif italic ${theme.textPrimary} leading-relaxed bg-transparent outline-none border border-transparent hover:border-current/20 focus:border-current/40 rounded p-2 resize-none`}
              />
            )}

            <div className="space-y-1">
              <div className={`text-sm sm:text-base font-bold ${theme.textPrimary}`}>
                {slide.quoteAuthor || "Nama Pembicara / Author"}
              </div>
              <div className={`text-xs ${theme.textSecondary}`}>
                {slide.quoteRole || "Jabatan / Organisasi"}
              </div>
            </div>
          </div>
        )}

        {/* ================= LAYOUT: CONCLUSION ================= */}
        {slide.layout === "conclusion" && (
          <div className="flex flex-col justify-center items-center text-center h-full space-y-6 max-w-3xl mx-auto">
            <div className="space-y-2">
              <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${theme.textPrimary}`}>
                {slide.title}
              </h2>
              {slide.subtitle && (
                <p className={`text-xs sm:text-base ${theme.textSecondary}`}>
                  {slide.subtitle}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {(slide.cards || []).map((card, idx) => (
                <div
                  key={card.id || idx}
                  className={`p-5 rounded-xl border ${theme.cardBorder} ${theme.cardBg} backdrop-blur-sm space-y-2 text-left`}
                >
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText}`}>
                    {card.badge || "ACTION"}
                  </span>
                  <h4 className={`text-sm sm:text-base font-bold ${theme.textPrimary}`}>
                    {card.title}
                  </h4>
                  <p className={`text-xs ${theme.textSecondary} leading-relaxed`}>
                    {card.description}
                  </p>
                </div>
              ))}
            </div>

            {slide.footerText && (
              <p className={`text-xs font-mono opacity-60 ${theme.textSecondary}`}>
                {slide.footerText}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Footer Area */}
      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/5 text-[11px] opacity-40 shrink-0">
        <div>{slide.footerText || "Koda Slider Presentation"}</div>
        <div className="font-mono">16:9 HD</div>
      </div>
    </div>
  );
}
