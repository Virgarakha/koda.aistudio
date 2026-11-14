export type SlideLayout =
  | "title"
  | "cards"
  | "split"
  | "metrics"
  | "timeline"
  | "comparison"
  | "quote"
  | "conclusion";

export type SlideThemeId =
  | "terracotta"
  | "dark_cyber"
  | "emerald"
  | "ocean_blue"
  | "minimal_light";

export interface SlideCardItem {
  id: string;
  title: string;
  description: string;
  iconName?: string;
  badge?: string;
}

export interface SlideMetricItem {
  id: string;
  value: string;
  label: string;
  change?: string;
  detail?: string;
}

export interface SlideTimelineItem {
  id: string;
  phase: string;
  title: string;
  description: string;
  dateOrQuarter?: string;
}

export interface SlideComparisonItem {
  id: string;
  feature: string;
  optionA: string;
  optionB: string;
  highlight?: boolean;
}

export interface SlideData {
  id: string;
  layout: SlideLayout;
  title: string;
  subtitle?: string;
  badge?: string;
  bulletPoints?: string[];
  cards?: SlideCardItem[];
  metrics?: SlideMetricItem[];
  timeline?: SlideTimelineItem[];
  comparison?: SlideComparisonItem[];
  quoteAuthor?: string;
  quoteRole?: string;
  footerText?: string;
  speakerNotes?: string;
}

export interface PresentationDeck {
  id: string;
  title: string;
  description: string;
  topic: string;
  targetAudience?: string;
  theme: SlideThemeId;
  slides: SlideData[];
  createdAt: string;
  updatedAt: string;
  userEmail?: string;
}

export interface SlideThemeConfig {
  id: SlideThemeId;
  name: string;
  accentColor: string;
  canvasBg: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  badgeBg: string;
  badgeText: string;
  gradientBg: string;
}

export const SLIDE_THEMES: Record<SlideThemeId, SlideThemeConfig> = {
  terracotta: {
    id: "terracotta",
    name: "Terracotta Warm (Koda)",
    accentColor: "#D97757",
    canvasBg: "bg-[#140F0D]",
    cardBg: "bg-[#211714]/80",
    cardBorder: "border-[#4A2920]/60",
    textPrimary: "text-[#FAF6F4]",
    textSecondary: "text-[#C4B2AC]",
    badgeBg: "bg-[#D97757]/15",
    badgeText: "text-[#E68A6C]",
    gradientBg: "from-[#2A1712] via-[#140F0D] to-[#0A0706]",
  },
  dark_cyber: {
    id: "dark_cyber",
    name: "Obsidian Cyber",
    accentColor: "#A855F7",
    canvasBg: "bg-[#0B0914]",
    cardBg: "bg-[#161229]/80",
    cardBorder: "border-[#3B2D6B]/60",
    textPrimary: "text-[#F5F3FF]",
    textSecondary: "text-[#A7A1C7]",
    badgeBg: "bg-[#A855F7]/15",
    badgeText: "text-[#C084FC]",
    gradientBg: "from-[#1F143D] via-[#0B0914] to-[#05040A]",
  },
  emerald: {
    id: "emerald",
    name: "Emerald Executive",
    accentColor: "#408175",
    canvasBg: "bg-[#0A1210]",
    cardBg: "bg-[#132420]/80",
    cardBorder: "border-[#264D44]/60",
    textPrimary: "text-[#F0FDF4]",
    textSecondary: "text-[#9BC2B8]",
    badgeBg: "bg-[#408175]/15",
    badgeText: "text-[#5CB8A7]",
    gradientBg: "from-[#112923] via-[#0A1210] to-[#050A08]",
  },
  ocean_blue: {
    id: "ocean_blue",
    name: "Oceanic Blue",
    accentColor: "#0284C7",
    canvasBg: "bg-[#08121E]",
    cardBg: "bg-[#10233B]/80",
    cardBorder: "border-[#1E4373]/60",
    textPrimary: "text-[#F0F9FF]",
    textSecondary: "text-[#93BCE6]",
    badgeBg: "bg-[#0284C7]/15",
    badgeText: "text-[#38BDF8]",
    gradientBg: "from-[#0F294A] via-[#08121E] to-[#03070C]",
  },
  minimal_light: {
    id: "minimal_light",
    name: "Minimalist Light",
    accentColor: "#D97757",
    canvasBg: "bg-[#F8FAFC]",
    cardBg: "bg-[#FFFFFF]",
    cardBorder: "border-[#E2E8F0]",
    textPrimary: "text-[#0F172A]",
    textSecondary: "text-[#64748B]",
    badgeBg: "bg-[#D97757]/10",
    badgeText: "text-[#C25E3E]",
    gradientBg: "from-[#FFFFFF] via-[#F8FAFC] to-[#F1F5F9]",
  },
};
