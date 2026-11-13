export interface DesignStyle {
  id: "A" | "B" | "C" | "D";
  name: string;
  subtitle: string;
  mood: string;
  typography: string;
  palette: {
    primary: { hex: string; name: string };
    secondary: { hex: string; name: string };
    background: { hex: string; name: string };
    surface: { hex: string; name: string };
    textPrimary: { hex: string; name: string };
    textSecondary: { hex: string; name: string };
    accent: { hex: string; name: string };
    border: { hex: string; name: string };
  };
  tailwindTokens: {
    bgApp: string;
    bgCard: string;
    border: string;
    btnPrimary: string;
    textPrimary: string;
    textSecondary: string;
  };
}

export const DESIGN_STYLES: Record<"A" | "B" | "C" | "D", DesignStyle> = {
  A: {
    id: "A",
    name: "Modern Clean SaaS",
    subtitle: "Indigo & Slate Minimalist",
    mood: "Profesional, terstruktur, clean, modern, dan sangat nyaman untuk pembacaan data katalog & transaksi",
    typography: "Plus Jakarta Sans / Inter",
    palette: {
      primary: { hex: "#4F46E5", name: "Indigo 600 (Aksi Utama & Brand)" },
      secondary: { hex: "#06B6D4", name: "Cyan 500 (Badge & Aksen Interaktif)" },
      background: { hex: "#F8FAFC", name: "Slate 50 (Background Halaman Bersih)" },
      surface: { hex: "#FFFFFF", name: "Pure White (Kartu & Modal Kontainer)" },
      textPrimary: { hex: "#0F172A", name: "Slate 900 (Teks Utama Kontras Tinggi)" },
      textSecondary: { hex: "#64748B", name: "Slate 500 (Sublabel & Keterangan)" },
      accent: { hex: "#10B981", name: "Emerald 500 (Status Sukses & Stok Ada)" },
      border: { hex: "#E2E8F0", name: "Slate 200 (Garis Pemisah Halus)" },
    },
    tailwindTokens: {
      bgApp: "bg-slate-50",
      bgCard: "bg-white shadow-sm border border-slate-200",
      border: "border-slate-200",
      btnPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition",
      textPrimary: "text-slate-900",
      textSecondary: "text-slate-500",
    },
  },
  B: {
    id: "B",
    name: "Warm Earthy & Terracotta",
    subtitle: "Terracotta, Amber & Warm Gray",
    mood: "Hangat, ramah, membumi, bersahabat, sangat cocok untuk retail lokal, toko kebutuhan harian, dan kuliner",
    typography: "Plus Jakarta Sans / Outfit",
    palette: {
      primary: { hex: "#D97706", name: "Amber 600 / Terracotta (Aksi Utama & Kehangatan)" },
      secondary: { hex: "#F59E0B", name: "Amber 500 (Highlight & Promo)" },
      background: { hex: "#FAFAF9", name: "Stone 50 (Background Hangat Natural)" },
      surface: { hex: "#FFFFFF", name: "Pure White (Card & Section)" },
      textPrimary: { hex: "#1C1917", name: "Stone 900 (Teks Gelap Hangat)" },
      textSecondary: { hex: "#78716C", name: "Stone 500 (Label Halus)" },
      accent: { hex: "#15803D", name: "Forest Green (Stok Tersedia & Sukses)" },
      border: { hex: "#E7E5E4", name: "Stone 200 (Border Lembut)" },
    },
    tailwindTokens: {
      bgApp: "bg-stone-50",
      bgCard: "bg-white shadow-sm border border-stone-200",
      border: "border-stone-200",
      btnPrimary: "bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-sm transition",
      textPrimary: "text-stone-900",
      textSecondary: "text-stone-500",
    },
  },
  C: {
    id: "C",
    name: "Sleek Dark Mode & Cyan Neon",
    subtitle: "Obsidian Slate & Electric Cyan",
    mood: "Modern futuristik, premium, kontras tinggi, fokus tajam untuk dashboard analitik & POS modern",
    typography: "Geist / Space Grotesk / Inter",
    palette: {
      primary: { hex: "#06B6D4", name: "Cyan 500 (Aksi Neon Utama & Fokus)" },
      secondary: { hex: "#8B5CF6", name: "Violet 500 (Aksen Sekunder Futuristik)" },
      background: { hex: "#0B0F17", name: "Deep Obsidian (Background Gelap Pekat)" },
      surface: { hex: "#161F30", name: "Navy Surface (Card & Kontainer Elevasi)" },
      textPrimary: { hex: "#F1F5F9", name: "Slate 100 (Teks Putih Lembut)" },
      textSecondary: { hex: "#94A3B8", name: "Slate 400 (Teks Keterangan Redup)" },
      accent: { hex: "#10B981", name: "Emerald 400 (Indikator Aktif / Online)" },
      border: { hex: "#1E293B", name: "Slate 800 (Border Redup Halus)" },
    },
    tailwindTokens: {
      bgApp: "bg-[#0B0F17]",
      bgCard: "bg-[#161F30] border border-slate-800 shadow-md",
      border: "border-slate-800",
      btnPrimary: "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-cyan-500/20 shadow-lg transition",
      textPrimary: "text-slate-100",
      textSecondary: "text-slate-400",
    },
  },
  D: {
    id: "D",
    name: "Fresh Organic & Emerald Mint",
    subtitle: "Emerald Mint & Botanical Green",
    mood: "Segar, organik, terpercaya, tenang, sangat ideal untuk sembako, hasil bumi, makanan sehat, atau living space",
    typography: "Plus Jakarta Sans / DM Sans",
    palette: {
      primary: { hex: "#059669", name: "Emerald 600 (Warna Brand Utama)" },
      secondary: { hex: "#10B981", name: "Mint 500 (Tombol & Badge Interaksi)" },
      background: { hex: "#F0FDF4", name: "Green 50 (Nuansa Segar Lembut)" },
      surface: { hex: "#FFFFFF", name: "Pure White (Card Kontainer Bersih)" },
      textPrimary: { hex: "#064E3B", name: "Emerald 950 (Teks Gelap Kontras)" },
      textSecondary: { hex: "#047857", name: "Emerald 700 (Sublabel & Keterangan)" },
      accent: { hex: "#D97706", name: "Warm Amber (Badge Promo & Rating)" },
      border: { hex: "#D1FAE5", name: "Emerald 100 (Border Organik Halus)" },
    },
    tailwindTokens: {
      bgApp: "bg-[#F0FDF4]/60",
      bgCard: "bg-white shadow-sm border border-emerald-100",
      border: "border-emerald-100",
      btnPrimary: "bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition",
      textPrimary: "text-emerald-950",
      textSecondary: "text-emerald-700",
    },
  },
};

/**
 * Detect whether the user is choosing one of the design style options (A, B, C, D)
 */
export function detectChosenDesignStyle(text: string, isContextWaiting: boolean = false): DesignStyle | null {
  if (!text) return null;
  const lower = text.toLowerCase().trim();

  // Explicit option match or keywords
  if (
    /^(?:opsi\s*)?a(?:\.|\b)/i.test(lower) ||
    lower.includes("opsi a") ||
    lower.includes("modern clean saas") ||
    lower.includes("clean saas") ||
    lower.includes("indigo") ||
    (isContextWaiting && (/^1(?:\.|\b)/.test(lower) || lower.includes("clean") || lower.includes("saas") || lower === "a"))
  ) {
    return DESIGN_STYLES.A;
  }

  if (
    /^(?:opsi\s*)?b(?:\.|\b)/i.test(lower) ||
    lower.includes("opsi b") ||
    lower.includes("warm earthy") ||
    lower.includes("terracotta") ||
    lower.includes("terracota") ||
    lower.includes("amber & stone") ||
    (isContextWaiting && (/^2(?:\.|\b)/.test(lower) || lower.includes("earthy") || lower.includes("warm") || lower === "b"))
  ) {
    return DESIGN_STYLES.B;
  }

  if (
    /^(?:opsi\s*)?c(?:\.|\b)/i.test(lower) ||
    lower.includes("opsi c") ||
    lower.includes("sleek dark") ||
    lower.includes("dark mode") ||
    lower.includes("obsidian") ||
    lower.includes("cyan neon") ||
    (isContextWaiting && (/^3(?:\.|\b)/.test(lower) || lower.includes("dark") || lower.includes("sleek") || lower === "c"))
  ) {
    return DESIGN_STYLES.C;
  }

  if (
    /^(?:opsi\s*)?d(?:\.|\b)/i.test(lower) ||
    lower.includes("opsi d") ||
    lower.includes("fresh organic") ||
    lower.includes("emerald") ||
    lower.includes("mint") ||
    lower.includes("botanical") ||
    (isContextWaiting && (/^4(?:\.|\b)/.test(lower) || lower.includes("mint") || lower.includes("organic") || lower === "d"))
  ) {
    return DESIGN_STYLES.D;
  }

  return null;
}

/**
 * Check if the conversation context is currently waiting for design style selection
 */
export function isWaitingForDesignStyle(messages: any[]): boolean {
  if (!messages || messages.length === 0) return false;
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  if (!lastAssistant) return false;
  const content = lastAssistant.content || "";
  return (
    content.includes("Pilihan Style Desain & Color Palette") ||
    content.includes("Opsi Style Desain & Color Palette") ||
    (content.includes("Spesifikasi PRD telah siap") && content.includes("interview-json")) ||
    (content.includes("PRD sudah siap") && content.includes("interview-json"))
  );
}

/**
 * Generate the interactive interview block and Dribbble showcase for design style selection
 */
export function generateDesignSelectionResponse(
  appName: string,
  targetUser: string,
  dribbbleDesigns: any[] = []
): { thought: string; content: string } {
  const thought = `KODA AI Requirement Engine memverifikasi seluruh kebutuhan sistem "${appName}". Spesifikasi PRD telah siap! Menampilkan kurasi Style Desain UI/UX & Color Palette sebelum PRD lengkap dikompilasi.`;

  const fallbackDesigns = [
    {
      title: "Clean Modern Dashboard & Catalog UI",
      author: "Ananto Nugroho",
      url: "https://cdn.dribbble.com/userupload/46547586/file/c00b9f32defb7e4016d1a0bf8017fa4e.png?resize=1200x900&vertical=center",
      source: "https://dribbble.com/tags/dashboard-ui",
      tags: ["Clean", "Minimalist", "SaaS"],
    },
    {
      title: "Retail POS & Warm Storefront Management",
      author: "Makrand Patwardhan",
      url: "https://cdn.dribbble.com/userupload/12484875/file/original-d90573b0d9593de0cf3680629dc229e5.png?resize=1200x900&vertical=center",
      source: "https://dribbble.com/tags/retail-app",
      tags: ["Warm", "Earthy", "Storefront"],
    },
    {
      title: "Dark High-Contrast Inventory & Analytics",
      author: "Annisa Salma",
      url: "https://cdn.dribbble.com/userupload/14724415/file/original-ad1bd79e6707fbb39e38d9691eee3635.png?resize=1200x900&vertical=center",
      source: "https://dribbble.com/tags/inventory-app",
      tags: ["DarkMode", "Sleek", "Analytics"],
    },
  ];

  const designsToShow = dribbbleDesigns.length >= 3 ? dribbbleDesigns.slice(0, 3) : fallbackDesigns;

  const content = `### Spesifikasi PRD telah siap!

Seluruh kebutuhan inti, logika transaksi atomik, pencegahan *race condition*, dan skema database untuk **${appName}** telah tuntas terverifikasi dan memenuhi standar industri.

Sebelum menyusun dokumen PRD lengkap, silakan tentukan **Style Desain UI/UX & Color Palette** yang paling sesuai dengan identitas produk Anda. Pilihan ini akan langsung dimasukkan ke dalam **Bagian 3 (Design System)** dan **Bagian 6 (Design Tokens Tailwind CSS)** pada PRD:

---

\`\`\`designs-json
${JSON.stringify(
  {
    title: "Inspirasi UI/UX & Layout Antarmuka (Dribbble)",
    designs: designsToShow,
  },
  null,
  2
)}
\`\`\`

### Pilihan Style Desain & Color Palette

Silakan klik salah satu opsi style di bawah ini untuk langsung menyusun PRD lengkap:

\`\`\`interview-json
{
  "title": "Pilih Style Desain & Color Palette untuk PRD",
  "options": [
    {
      "id": "A",
      "label": "Modern Clean SaaS (Indigo & Slate)",
      "description": "Primary: #4F46E5 | Background: #F8FAFC | Font: Plus Jakarta Sans. Bersih, profesional, dan nyaman untuk katalog & transaksi."
    },
    {
      "id": "B",
      "label": "Warm Earthy & Terracotta (Amber & Stone)",
      "description": "Primary: #D97706 | Background: #FAFAF9 | Font: Plus Jakarta Sans. Hangat, bersahabat, ramah untuk UMKM dan kebutuhan harian."
    },
    {
      "id": "C",
      "label": "Sleek Dark Mode (Obsidian & Electric Cyan)",
      "description": "Primary: #06B6D4 | Background: #0B0F17 | Font: Geist. Futuristik, kontras tinggi, modern untuk analitik & POS."
    },
    {
      "id": "D",
      "label": "Fresh Organic & Emerald Mint (Green & Botanical)",
      "description": "Primary: #059669 | Background: #F0FDF4 | Font: DM Sans. Segar, natural, tenang, ideal untuk sembako & living space."
    }
  ]
}
\`\`\`

*Pilih salah satu style di atas, dan AI akan langsung men-generate dokumen PRD 13 bagian lengkap beserta tombol download PRD.*`;

  return { thought, content };
}

/**
 * Injects the chosen design style system and color palette into the PRD markdown
 */
export function injectDesignStyleToPrd(prdMarkdown: string, style: DesignStyle): string {
  const designSystemSection = `
### 3.0 Desain UI/UX & Design System Terpilih
Aplikasi menggunakan tema **${style.name} (${style.subtitle})** dengan spesifikasi:
- **Karakter & Mood:** ${style.mood}
- **Typography Utama:** ${style.typography}

#### Palet Warna (Color Palette):
| Token Warna | HEX Code | Peran / Penggunaan |
| :--- | :--- | :--- |
| **Primary** | \`${style.palette.primary.hex}\` | ${style.palette.primary.name} |
| **Secondary** | \`${style.palette.secondary.hex}\` | ${style.palette.secondary.name} |
| **Background** | \`${style.palette.background.hex}\` | ${style.palette.background.name} |
| **Surface / Card** | \`${style.palette.surface.hex}\` | ${style.palette.surface.name} |
| **Text Primary** | \`${style.palette.textPrimary.hex}\` | ${style.palette.textPrimary.name} |
| **Text Secondary** | \`${style.palette.textSecondary.hex}\` | ${style.palette.textSecondary.name} |
| **Accent / Highlight** | \`${style.palette.accent.hex}\` | ${style.palette.accent.name} |
| **Border Divider** | \`${style.palette.border.hex}\` | ${style.palette.border.name} |

#### Utility Classes Frontend (Tailwind CSS Tokens):
\`\`\`css
/* Tailwind CSS Design Tokens - Theme: ${style.name} */
--color-primary: ${style.palette.primary.hex};
--color-secondary: ${style.palette.secondary.hex};
--color-bg-app: ${style.palette.background.hex};
--color-surface: ${style.palette.surface.hex};
--color-text-main: ${style.palette.textPrimary.hex};
--color-border: ${style.palette.border.hex};
\`\`\`
- Layout Background: \`${style.tailwindTokens.bgApp}\`
- Kontainer Kartu: \`${style.tailwindTokens.bgCard}\`
- Tombol Aksi Utama: \`${style.tailwindTokens.btnPrimary}\`
- Teks Utama / Judul: \`${style.tailwindTokens.textPrimary}\`
- Teks Keterangan: \`${style.tailwindTokens.textSecondary}\`
`;

  // Inject right after "## 3. Ruang lingkup dan fitur fungsional"
  if (prdMarkdown.includes("## 3. Ruang lingkup dan fitur fungsional")) {
    return prdMarkdown.replace(
      "## 3. Ruang lingkup dan fitur fungsional",
      `## 3. Ruang lingkup dan fitur fungsional\n${designSystemSection}`
    );
  }

  // Fallback: prepend to section 3.1
  if (prdMarkdown.includes("### 3.1")) {
    return prdMarkdown.replace("### 3.1", `${designSystemSection}\n### 3.1`);
  }

  return prdMarkdown + "\n\n" + designSystemSection;
}
