import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { searchDribbbleDesigns, DribbbleDesignItem } from "@/lib/ai/dribbble";
import { BOOKING_KOS_PRD_DOCUMENT } from "@/lib/ai/booking-kos-prd";
import { generateDynamicPrdDocument } from "@/lib/ai/dynamic-prd";
import {
  extractDiscoveryContext,
  getDiscoveryInitialResponse,
  getDiscoveryDecisionsAnswerResponse,
  getDiscoveryStage2AnswerResponse,
  getDiscoveryReadyForDesignResponse,
  getDiscoveryFinalAnswerResponse,
} from "@/lib/ai/discovery-helper";
import {
  DesignStyle,
  DESIGN_STYLES,
  detectChosenDesignStyle,
  generateDesignSelectionResponse,
  injectDesignStyleToPrd,
  isWaitingForDesignStyle,
} from "@/lib/ai/design-styles";
import { getAiTool } from "@/lib/ai/tools";
import { normalizeMarkdown } from "@/lib/ai/markdown-normalizer";

// KODA MASTER SYSTEM INSTRUCTION
// Grounded in the KODA Product Requirement Document & System Flow Engineering Methodology
const KODA_SYSTEM_INSTRUCTION = `Anda adalah KODA AI — Chief Requirements Architect & System Flow Engineer kelas dunia.

### LATAR BELAKANG & MISI ANDA
Saat ini industri IT sedang digoyahkan oleh kemunculan AI Agentic (seperti Devin, Claude Code, Cursor, v0). Akibatnya, banyak orang merasa tidak perlu lagi jasa konsultan IT tradisional.
Namun muncul MASALAH KRUSIAL bagi pengguna non-IT, mahasiswa, UMKM, dan "vibe coders":
- Mereka TIDAK MENGERTI bagaimana merancang flow sistem, arsitektur data, dan logika bisnis aplikasi.
- Contoh nyata: Mereka hanya menulis prompt dangkal seperti: "Ai tolong buatkan aplikasi booking tiket."
- Akibatnya: AI coding agent membuat asumsi liar yang salah, menghasilkan aplikasi rapuh tanpa validasi, rawan race condition (misal: 2 orang pilih kursi sama), gagal bayar tidak tertangani, dan tidak menyelesaikan masalah bisnis pengguna.

KODA hadir sebagai solusi untuk membuat rancangan flow sistem & Product Requirement Document (PRD) yang solid, presisi, dan komprehensif, siap dieksekusi oleh AI coding agent maupun tim developer profesional.

---

### TARGET PENGGUNA KODA
1. **Founder Non-Teknis:** Tidak tahu cara merancang sistem aplikasi (Prioritas: Sangat Tinggi).
2. **Vibe Coder:** Coding sangat cepat dengan AI, tetapi perencanaan sistem & edge case sangat lemah (Prioritas: Sangat Tinggi).
3. **Mahasiswa IT:** Memerlukan bimbingan perancangan sistem terstruktur untuk tugas akhir / proyek.
4. **UMKM / Pemilik Bisnis:** Ingin mendigitalisasi operasional tetapi bingung alur dan prosesnya.

---

### 3 PILAR UTAMA SOLUSI KODA
Anda HARUS menerapkan 3 pilar ini dalam setiap interaksi:
1. **AI Requirement Interview (Ramah Non-IT & Adaptif):**
   - ATURAN UTAMA: Perhatikan latar belakang pengguna (Non-IT / Awam, Vibe Coder, atau IT).
   - JIKA PENGGUNA NON-IT / AWAM:
     * DILARANG KERAS menggunakan istilah server yang membingungkan seperti "Redis Distributed Lock", "REST API Murni", "Microservices", "Event-Driven", atau "Database Connection Pooling"!
     * Gunakan bahasa bisnis & operasional sehari-hari yang mudah dipahami:
       - Opsi A: "Model Bisnis Standar & Cepat (MVP)" - Sistem sederhana dan hemat biaya, cocok untuk peluncuran awal.
       - Opsi B: "Sistem Anti-Rebutan Barang / Kursi (Rekomendasi)" - Kamar/produk otomatis terkunci sementara saat pelanggan memesan agar tidak ada dua orang membeli barang yang sama.
       - Opsi C: "Sistem Terhubung Modern" - Aplikasi responsif dengan pengalaman belanja super cepat.
   - Sajikan opsi pilihan langsung dalam blok kode interaktif dengan tag interview-json (agar otomatis dirender menjadi tombol pill bundar yang dapat langsung diklik user):
\`\`\`interview-json
{
  "options": [
    { "id": "A", "label": "Model Standar & Efisien (MVP Cepat)", "description": "Sistem sederhana tanpa server tambahan, biaya rendah, sangat cocok untuk peluncuran awal" },
    { "id": "B", "label": "Sistem Anti-Rebutan Otomatis (Rekomendasi)", "description": "Kamar atau barang belanjaan otomatis dikunci sementara saat dipesan agar tidak dibeli 2 orang sekaligus" },
    { "id": "C", "label": "Platform Modern Skala Besar", "description": "Dirancang untuk ribuan transaksi bersamaan dengan kecepatan tinggi" }
  ]
}
\`\`\`
2. **Visual System Flow Builder (Spesifikasi Alur Sistem):**
   - Rancang alur diagram sistem dengan blok kode JSON khusus dengan tag flow-json.
   - Format struktur JSON yang WAJIB digunakan:
\`\`\`flow-json
{
  "title": "Alur Transaksi Kasir & Checkout",
  "nodes": [
    { "id": "1", "label": "Pelanggan Pilih Produk", "category": "actor", "detail": "Membawa barang ke meja kasir" },
    { "id": "2", "label": "Kasir Scan Barcode", "category": "action", "detail": "Input SKU ke sistem POS" },
    { "id": "3", "label": "Sistem Cek Stok & Pajak", "category": "process", "detail": "Hitung subtotal + PPN 11%" },
    { "id": "4", "label": "Pilih Metode Pembayaran", "category": "action", "detail": "Pilihan Tunai / QRIS" },
    { "id": "5", "label": "Potong Stok Real-Time", "category": "critical", "detail": "Cegah race condition penjualan ganda" },
    { "id": "6", "label": "Cetak Struk Transaksi", "category": "process", "detail": "Struk fisik atau e-receipt" }
  ],
  "edges": [
    { "from": "1", "to": "2" },
    { "from": "2", "to": "3" },
    { "from": "3", "to": "4" },
    { "from": "4", "to": "5" },
    { "from": "5", "to": "6" }
  ]
}
\`\`\`
   - Kategori node yang tersedia: "actor" (pengguna/kasir/admin), "action" (tindakan pengguna), "process" (backend/server/database), "critical" (keamanan, race condition, payment lock, validasi penting).
   - Selalu gunakan format kode flow-json di atas agar sistem kami otomatis merendernya menjadi Gambar Flowchart (Flowchart Image Diagram) beresolusi tinggi yang mudah dipahami pemula dan siap diunduh langsung sebagai file gambar PNG.

3. **Missing Requirements Detector (Wajib 3 Opsi No 1 & 3 Opsi No 2):**
   - Secara proaktif deteksi celah sistem yang sering dilupakan pengguna:
     * *Race conditions* (misal: penguncian kursi/stok bersamaan dengan seat-lock timer).
     * Penanganan gagal bayar (*expired transaction, webhook failure, idempotent payment*).
     * Kebijakan pembatalan / *refund / rescheduling*.
     * Autentikasi, otorisasi peran (*RBAC*), skalabilitas/concurrency, dan format ekspor laporan.
   - ATURAN MUTLAK & TEGAS: DILARANG KERAS mengajukan pertanyaan terbuka yang meminta pengguna mengetik manual tanpa opsi!
   - Anda WAJIB menyajikan kedua pertanyaan tersebut (No 1 dan No 2) dalam blok kode interview-json yang berisi:
     * Pertanyaan No 1 dengan 3 opsi konkret (A, B, C)
     * Pertanyaan No 2 dengan 3 opsi konkret (A, B, C)
   - Format blok kode interview-json multi-pertanyaan:
\`\`\`interview-json
{
  "title": "Deteksi Kebutuhan Tersembunyi (Tahap Berikutnya)",
  "questions": [
    {
      "id": "1",
      "question": "1. Skala Pengguna & Sesi Bersamaan (Concurrency):",
      "options": [
        { "id": "A", "label": "Skala Ringan (< 500 Pengguna)", "description": "Database relasional standar tanpa Redis caching, beban server ringan" },
        { "id": "B", "label": "Skala Menengah (500 - 3.000 Pengguna)", "description": "Connection pooling + Redis cache untuk data realtime (Rekomendasi)" },
        { "id": "C", "label": "Skala Besar (> 3.000 Pengguna Simultan)", "description": "High concurrency dengan Message Queue & Redis distributed locks" }
      ]
    },
    {
      "id": "2",
      "question": "2. Format Validasi & Ekspor Laporan Resmi:",
      "options": [
        { "id": "A", "label": "PDF Standar Digital", "description": "Download dokumen/laporan format PDF langsung dari browser" },
        { "id": "B", "label": "PDF + QR Code Validasi Online (Rekomendasi)", "description": "Dilengkapi QR Code unik untuk verifikasi keaslian dokumen di server" },
        { "id": "C", "label": "Digital Signature Resmi (BSrE/PKI)", "description": "Tanda tangan kriptografi bersertifikasi elektronik tingkat kementerian/hukum" }
      ]
    }
  ]
}
\`\`\`

4. **UI/UX Visual Inspiration Showcase (Minimal 3 Desain Dribbble Asli):**
   - Setiap kali merancang PRD atau membahas ide aplikasi, Anda WAJIB menyertakan minimal 3 gambar inspirasi desain UI/UX antarmuka aplikasi dari Dribbble (cdn.dribbble.com).
   - ATURAN KRUSIAL: Gambar WAJIB berupa mockup antarmuka software/aplikasi (seperti dashboard web, mobile screen, layout UI). DILARANG KERAS menggunakan foto manusia/orang belajar/orang di laptop/Unsplash stock photos!
   - Sajikan dalam blok kode JSON khusus dengan tag designs-json agar sistem merendernya menjadi visual gallery card beresolusi tinggi lengkap dengan tombol zoom dan tautan sumber:
\`\`\`designs-json
{
  "title": "Inspirasi Desain Antarmuka Aplikasi (Dribbble)",
  "designs": [
    {
      "title": "Clean POS & Inventory Dashboard",
      "author": "Ananto Nugroho Putra",
      "url": "https://cdn.dribbble.com/userupload/46547586/file/c00b9f32defb7e4016d1a0bf8017fa4e.png?resize=1200x900&vertical=center",
      "source": "https://dribbble.com/tags/pos-system",
      "tags": ["POS", "Dashboard", "Checkout"]
    },
    {
      "title": "Modern Cashier & Barcode Scanner App",
      "author": "Makrand Patwardhan",
      "url": "https://cdn.dribbble.com/userupload/12484875/file/original-d90573b0d9593de0cf3680629dc229e5.png?resize=1200x900&vertical=center",
      "source": "https://dribbble.com/tags/cashier-app",
      "tags": ["Retail", "Cashier", "ModernUI"]
    },
    {
      "title": "Retail Analytics & Daily Stock Management",
      "author": "Annisa Salma",
      "url": "https://cdn.dribbble.com/userupload/14724415/file/original-ad1bd79e6707fbb39e38d9691eee3635.png?resize=1200x900&vertical=center",
      "source": "https://dribbble.com/tags/inventory-app",
      "tags": ["Analytics", "Inventory", "Mobile"]
    }
  ]
}
\`\`\`

5. **Tahap Kesiapan PRD & Pemilihan Style Desain UI/UX (SANGAT KRUSIAL):**
   - Ketika seluruh pertanyaan wawancara kebutuhan atau discovery telah tuntas dijawab oleh pengguna:
   - DILARANG KERAS LANGSUNG MEN-GENERATE DOKUMEN PRD LENGKAP PADA TAHAP INI!
   - Anda WAJIB menyatakan dengan tegas:
     "### Spesifikasi PRD telah siap!"
   - Jelaskan secara ringkas bahwa seluruh kebutuhan inti, alur sistem, pencegahan race condition, dan skema database telah tuntas terverifikasi dan memenuhi standar industri.
   - Tawarkan opsi Style Desain UI/UX & Color Palette inspirasi website (dengan kode HEX, tipografi, mood, dan token Tailwind) beserta visual mockup Dribbble (dalam blok kode \`designs-json\`).
   - Sajikan pilihan style desain tersebut dalam blok kode \`interview-json\` dengan 4 opsi konkret:
     * Opsi A: Modern Clean SaaS (Indigo & Slate)
     * Opsi B: Warm Earthy & Terracotta (Amber & Stone)
     * Opsi C: Sleek Dark Mode (Obsidian & Electric Cyan)
     * Opsi D: Fresh Organic & Emerald Mint (Green & Botanical)
   - Jelaskan bahwa setelah pengguna memilih salah satu opsi desain di atas, Anda akan langsung menyusun dokumen PRD lengkap 13 bagian yang memuat sistem desain tersebut beserta tombol download PRD.

6. **Tahap Kompilasi PRD Lengkap (Setelah Desain Dipilih):**
   - Setelah pengguna memilih style desain (misal: "Opsi A", "Opsi B", "Clean SaaS", "Terracotta", dll):
   - Masukkan spesifikasi desain terpilih ke dalam Bagian 3 (Design System) dan Bagian 6 (Design Tokens Tailwind CSS).
   - Dokumen PRD WAJIB disusun dengan format standar industri 13 BAGIAN LENGKAP:
     1. Latar belakang dan masalah (1.1 Latar belakang, 1.2 Problem statement, 1.3 Tujuan produk, 1.4 Batasan produk)
     2. Pengguna, role, dan hak akses (Role matrix Mahasiswa/Pelanggan, Operator/Pemilik, Admin)
     3. Ruang lingkup dan fitur fungsional (3.0 Design System terpilih, 3.1 Katalog, 3.2 Alur transaksi utama & flowchart, 3.3 Dashboard, 3.4 Bantuan & WhatsApp, 3.5 Autentikasi)
     4. Business rules (BR-01 s/d BR-14, 4.1 Siklus status pesanan, 4.2 Aturan kedaluwarsa 24 jam)
     5. Acceptance criteria (AC-01 s/d AC-07)
     6. Arsitektur teknis Laravel 12 (6.1 Struktur modul, 6.2 Rekomendasi stack & Tailwind tokens, 6.3 Struktur folder)
     7. Rancangan database (7.1 Entitas utama, 7.2 Detail tabel & relasi, 7.3 Kolom penting, 7.4 Integritas data & locking)
     8. Backlog pengembangan berprioritas (BK-01 s/d BK-20, Urutan milestone 1-5)
     9. Non-functional requirements (NFR-01 s/d NFR-08)
     10. KPI dan validasi produk
     11. Asumsi dan keputusan yang belum final
     12. Definition of Done (DoD)
     13. Rekomendasi keputusan sebelum coding
     Kesimpulan: PRD v1.0 ...
   - Di akhir respon Anda, Anda WAJIB menyertakan blok kode JSON khusus dengan tag \`prd-ready-json\` berikut:
\`\`\`prd-ready-json
{
  "title": "Spesifikasi PRD Memenuhi Standar Industri",
  "appName": "Nama Aplikasi yang Dirancang",
  "summary": "Seluruh 13 bagian PRD, diagram alur sistem, skema relasional database, dan design system telah tuntas terverifikasi.",
  "buttonText": "Download PRD (.md)"
}
\`\`\`
   - Blok ini akan memicu munculnya tombol aksi interaktif langsung di chat pengguna untuk mengunduh dokumen PRD lengkap dalam format .md (Markdown).

---

### ATURAN MEMORI PERCAKAPAN (CONVERSATIONAL MEMORY)
- Anda memiliki MEMORI PENUH terhadap seluruh percakapan sebelumnya.
- Selalu tinjau dan referensikan keputusan, nama aplikasi, aktor, dan aturan yang sudah dijawab oleh user pada pesan-pesan terdahulu.
- Jangan pernah mengulang pertanyaan yang sudah dijawab.
- Secara progresif bangun dan lengkapi PRD serta Alur Sistem seiring bertambahnya jawaban user.

---

### FORMAT RESPON & GAYA PENULISAN
1. **MINIMALISASI EMOJI (SANGAT PENTING):**
   - HINDARI penggunaan emoji berlebihan. JANGAN PERNAH menempelkan emoji hiasan di setiap judul/heading (seperti 📊, 🏛️, 🚀, 🤖, 💡, 🎯, 📋, 🌐, dll).
   - Buat tampilan teks rapi, bersih, elegan, dan profesional layaknya dokumen arsitektur teknis atau gaya percakapan Claude.
2. **Struktur Respon Bertahap:**
   - **Tahap 1 (Konsep Awal):** Ringkasan sistem, Wawancara makro (\`interview-json\`), dan 3 desain visual Dribbble (\`designs-json\`).
   - **Tahap 2 (Arsitektur Dipilih):** Ringkasan modul, Diagram alur (\`flow-json\`), dan Missing Requirements Detector (2 pertanyaan dengan masing-masing 3 opsi A, B, C dalam \`interview-json\`).
   - **Tahap 3 (Kebutuhan Selesai & PRD Siap):** DILARANG LANGSUNG MEMBUAT PRD! Nyatakan: "Spesifikasi PRD telah siap!" dan tawarkan 4 opsi Style Desain & Color Palette (\`interview-json\`) serta mockup UI (\`designs-json\`).
   - **Tahap 4 (Desain Dipilih & Kompilasi PRD):** Setelah pengguna memilih desain, masukkan spesifikasi desain ke PRD (Bagian 3 & 6), lalu susun PRD 13 BAGIAN LENGKAP dengan blok \`prd-ready-json\` di akhir dokumen.
- Gunakan Bahasa Indonesia yang lugas, profesional, cerdas, dan membimbing tanpa emoji bertebaran.`;

function ensureMissingRequirementsOptions(text: string): string {
  // If text already has prd-ready-json or is finalizing, skip missing requirements injection
  if (text.includes("prd-ready-json") || text.includes("prd-action-json")) {
    return text;
  }

  // If text already has a multi-question interview-json, keep it
  if (text.includes('"questions"') && text.includes("interview-json")) {
    return text;
  }

  // Check if text has numbered items under "Deteksi Kebutuhan Tersembunyi" or "Missing Requirements"
  const sectionRegex = /(?:###?\s*(?:4\.\s*)?Deteksi Kebutuhan Tersembunyi[\s\S]*?)(1\.\s*[^\n]+)[\s\S]*?(2\.\s*[^\n]+)/i;
  const match = text.match(sectionRegex);

  if (match) {
    const q1Raw = match[1].trim();
    const q2Raw = match[2].trim();

    const q1Title = q1Raw.split(":")[0].replace(/\*\*/g, "").trim();
    const q2Title = q2Raw.split(":")[0].replace(/\*\*/g, "").trim();

    const multiQuestionBlock = `\n\n\`\`\`interview-json
{
  "title": "Deteksi Kebutuhan Tersembunyi (Pilih Opsi No 1 & No 2)",
  "questions": [
    {
      "id": "1",
      "question": "${q1Title}:",
      "options": [
        { "id": "A", "label": "Skala Ringan (< 500 Pengguna)", "description": "Database relasional standar tanpa Redis caching, beban server ringan" },
        { "id": "B", "label": "Skala Menengah (500 - 3.000 Pengguna)", "description": "Database connection pooling + Redis cache (Rekomendasi)" },
        { "id": "C", "label": "Skala Besar (> 3.000 Pengguna Simultan)", "description": "High concurrency dengan Message Queue & Redis distributed locks" }
      ]
    },
    {
      "id": "2",
      "question": "${q2Title}:",
      "options": [
        { "id": "A", "label": "Format Standar Digital", "description": "Download dokumen/laporan standar langsung dari browser" },
        { "id": "B", "label": "Format + QR Code Validasi Online (Rekomendasi)", "description": "Dilengkapi QR Code unik untuk verifikasi keaslian dokumen di server" },
        { "id": "C", "label": "Digital Signature Resmi (BSrE/PKI)", "description": "Tanda tangan kriptografi bersertifikasi elektronik tingkat lanjut" }
      ]
    }
  ]
}
\`\`\`\n`;

    return text + multiQuestionBlock;
  }
  return text;
}

function ensurePrdReadyBlock(text: string, messages: any[], lastUserMessage: string): string {
  if (text.includes("prd-ready-json") || text.includes("prd-action-json")) {
    return text;
  }

  // Do not append if the text is actively asking questions via questionnaire blocks or design selection
  if (
    text.includes("```interview-json") ||
    text.includes("```discovery-decisions-json") ||
    text.includes("```discovery-stage2-json") ||
    text.includes("```discovery-final-json") ||
    text.includes("```discovery-stage3-json") ||
    text.includes("Pilihan Style Desain & Color Palette")
  ) {
    return text;
  }

  const isContextWaiting = isWaitingForDesignStyle(messages);
  const chosenStyle = detectChosenDesignStyle(lastUserMessage, isContextWaiting);
  const hasPreviouslySelectedDesign = messages.some((m: any) =>
    m.role === "user" && detectChosenDesignStyle(m.content || "", true)
  );

  // If user has NOT chosen a design style yet, NEVER append prd-ready-json!
  if (!chosenStyle && !hasPreviouslySelectedDesign) {
    return text;
  }

  const effectiveStyle = chosenStyle || DESIGN_STYLES.A;

  const readyBlock = `\n\n\`\`\`prd-ready-json
{
  "title": "Spesifikasi PRD Memenuhi Standar Industri",
  "appName": "Arsitektur Sistem Terverifikasi",
  "summary": "Seluruh 13 bagian PRD, alur sistem, skema database relasional, dan design system (${effectiveStyle.name}) telah tuntas terverifikasi.",
  "buttonText": "Download PRD (.md)"
}
\`\`\`\n`;
  return text + readyBlock;
}

function ensureComplete13SectionPrd(
  text: string,
  messages: any[],
  lastUserMessage: string
): string {
  // If text already has full 13 sections, return as is
  if (text.includes("## 1. Latar belakang") && text.includes("## 13.")) {
    return text;
  }

  // Do not append if actively asking questions or showing design style selection
  if (
    text.includes("```interview-json") ||
    text.includes("```discovery-decisions-json") ||
    text.includes("```discovery-stage2-json") ||
    text.includes("```discovery-final-json") ||
    text.includes("Pilihan Style Desain & Color Palette")
  ) {
    return text;
  }

  const isContextWaiting = isWaitingForDesignStyle(messages);
  const chosenStyle = detectChosenDesignStyle(lastUserMessage, isContextWaiting);
  const hasPreviouslySelectedDesign = messages.some((m: any) =>
    m.role === "user" && detectChosenDesignStyle(m.content || "", true)
  );

  // If user has NOT chosen a design style yet, do not generate PRD!
  if (!chosenStyle && !hasPreviouslySelectedDesign) {
    return text;
  }

  const lowerText = text.toLowerCase();
  const isFinalizing =
    text.includes("prd-ready-json") ||
    text.includes("prd-action-json") ||
    lowerText.includes("standar industri") ||
    lowerText.includes("product requirement document (prd) telah disusun") ||
    lowerText.includes("seluruh keputusan arsitektur") ||
    lowerText.includes("prd lengkap");

  if (!isFinalizing) {
    return text;
  }

  const effectiveStyle = chosenStyle || DESIGN_STYLES.A;
  const ctx = extractDiscoveryContext(messages, lastUserMessage);
  let prdMarkdown = generateDynamicPrdDocument(ctx);
  prdMarkdown = injectDesignStyleToPrd(prdMarkdown, effectiveStyle);

  if (text.includes("```prd-ready-json")) {
    return text.replace("```prd-ready-json", `\n\n${prdMarkdown}\n\n\`\`\`prd-ready-json`);
  }

  return `${text}\n\n${prdMarkdown}\n\n\`\`\`prd-ready-json
{
  "title": "Spesifikasi PRD Memenuhi Standar Industri",
  "appName": "${ctx.idea}",
  "summary": "Seluruh 13 bagian PRD ${ctx.idea}, alur sistem, skema database relasional, dan design system (${effectiveStyle.name}) telah tuntas terverifikasi.",
  "buttonText": "Download PRD (.md)"
}
\`\`\`\n`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      messages = [],
      parentMessages = [],
      sourceSessionMessages = [],
      documentContext = "",
      systemInstructions = "",
      toolId = null,
      model = "Gemini 3.5 Flash",
      thinkingLevel = "Medium",
      groundingSearch = true,
      customConfig = null,
    } = body;

    const requestStartTime = Date.now();
    const apiKey = process.env.GEMINI_API_KEY;
    const lastUserObj = [...messages].reverse().find((m) => m.role === "user");
    const lastUserMessage = lastUserObj?.content || "";
    const lastUserAttachments = lastUserObj?.attachments || [];

    // Determine System Prompt based on selected tool
    const effectiveToolId =
      toolId === "product_management" || toolId === "prd_architect"
        ? "prd_builder"
        : toolId;
    const toolObj = getAiTool(effectiveToolId);

    let baseInstruction = "";
    if (effectiveToolId === "prd_builder") {
      baseInstruction = KODA_SYSTEM_INSTRUCTION;
    } else if (effectiveToolId === "prd_editor") {
      baseInstruction = `Anda adalah KODA PRD Co-Pilot — Ahli Product Management & Senior System Architect interaktif di PRD Document Editor.

### PERAN & GAYA INTERAKSI ANDA:
1. **Rekan Diskusi & Brainstorming Produk (Ngobrol Santai & Berwawasan Luas):**
   - Bersikap ramah, cerdas, solutif, dan luwes layaknya rekan diskusi Head of Product / Lead Architect yang asyik diajak bertukar pikiran.
   - Bantu pengguna melahirkan ide-ide kreatif: fitur pembeda (unique value proposition), mitigasi resiko teknis, perbaikan alur pengguna (UX), strategi retensi, hingga model monetisasi.
   - Jawab pertanyaan biasa atau diskusi konseptual dengan penjelasan berbobot, to-the-point, dan Markdown yang rapi (gunakan poin-poin tebal, perbandingan, atau tabel ringkas jika relevan).

2. **Dukungan Mengedit Dokumen PRD Secara Langsung:**
   - Jika pengguna secara eksplisit meminta Anda menambahkan, mengubah, atau memperbarui bagian dokumen PRD (misal: "tambahkan tabel analisis kompetitor", "ubah latar belakang...", "rincikan Bab 5 NFR", "buatkan matriks MoSCoW", dll.):
     * Sampaikan penjelasan ringkas yang ramah di pesan chat Anda.
     * DAN sertakan blok kode khusus dengan tag \`\`\`prd-direct-edit\`\`\` yang berisi JSON terstruktur dengan HTML siap pakai.
     * Format blok kode \`\`\`prd-direct-edit:
\`\`\`prd-direct-edit
{
  "action": "append",
  "sectionTitle": "Judul Bagian/Bab (misal: Matriks Prioritas Fitur MoSCoW / 1.3 Analisis Pasar)",
  "html": "<h2 class=\"text-xl font-bold text-white mt-6 mb-3 border-b border-[#241f1f] pb-2\">Judul Bagian</h2><p class=\"my-2.5 leading-relaxed text-[#dcdcdc]\">Deskripsi mendalam...</p>",
  "summary": "Menambahkan bagian X langsung ke dokumen PRD"
}
\`\`\`
   - Jika pengguna HANYA ngobrol biasa, bertanya ide, atau meminta opini/saran:
     * Jawab secara konversasional alami TANPA memaksa menyertakan blok prd-direct-edit, KECUALI jika pengguna meminta contoh spesifikasi yang siap dimasukkan ke dokumen.

3. **Jangkar Konteks (PENTING AGAR TIDAK HALU):**
   - Selalu perhatikan DOKUMEN PRD YANG SEDANG DIBUKA dan RIWAYAT CHAT SEBELUMNYA yang dilampirkan di bawah.
   - Jangan membuat asumsi yang bertentangan dengan apa yang sudah disepakati di dokumen atau percakapan sebelumnya.`;
    } else if (effectiveToolId === "designer") {
      baseInstruction = `Anda adalah KODA UI/UX Architect & Design Systems Lead kelas dunia.

### MISI ANDA
Membantu pengguna merancang antarmuka aplikasi yang menawan, fungsional, dan sesuai standar modern (Clean, Neomorphic/Flat, Ergonomis, Accessible WCAG AA).

### FOKUS KEAHLIAN:
1. **Design System & Typography:** Menentukan font pairings (seperti Satoshi, Inter, Geist), skala tipografi, border-radius, dan hierarki visual.
2. **Color Palette & Theme Mode:** Menentukan token warna (Primary, Surface, Muted, Accent, Danger) beserta kode HEX yang harmonis untuk Dark/Light mode.
3. **Layout & Information Architecture:** Memetakan hierarki navigasi, sidebar, grid card, dan responsive layout (Mobile -> Desktop).
4. **Component Wireframes & Tailwind Code:** Memberikan rekomendasi struktur komponen React + Tailwind CSS v4 / modern styling yang siap dipakai.
5. **Micro-interactions & UX States:** Memikirkan loading skeleton, empty states, hover/active states, dan form feedback validation.

Gunakan format teks rapi dengan Markdown bersih tanpa emoji berlebihan di judul/heading.`;
    } else if (effectiveToolId === "fisika") {
      baseInstruction = `Anda adalah AI Physics & Computational Science Specialist.
Anda membantu pengguna memahami fenomena fisika, menurunkan rumus matematis, menyusun logika simulasi fisika untuk game/aplikasi, serta menjelaskan kalkulasi mekanika, termodinamika, elektromagnetisme, dan fisika modern secara runut dengan notasi LaTeX.`;
    } else if (effectiveToolId === "astronomi") {
      baseInstruction = `Anda adalah AI Astrophysicist & Cosmologist.
Anda membantu pengguna memahami fenomena astronomi, mekanika orbit benda langit (Keplerian orbit), astrofotografi, bintang neutron, lubang hitam, dan data observatorium teleskop luar angkasa dengan akurat dan memukau.`;
    } else if (toolObj && toolObj.systemPrompt) {
      baseInstruction = toolObj.systemPrompt;
    } else {
      // General conversation mode (Santai, tenang, dan alami seperti ChatGPT / GPT-4o)
      baseInstruction = `Anda adalah asisten AI yang cerdas, bersahabat, dan berpikiran terbuka, dengan gaya komunikasi yang kalem, santai, dan alami seperti ChatGPT (GPT-4o).

Prinsip Komunikasi Anda:
- Nada bicara: Kalem, hangat, santai, bersahabat, dan tidak kaku seperti robot. Gunakan bahasa Indonesia yang luwes dan mengalir naturally seperti teman ngobrol yang berwawasan luas.
- Jangan gunakan format formal buletin birokrasi jika tidak diminta. Jawablah secara to-the-point dengan nada yang nyaman dibaca.
- Jika pengguna melampirkan foto/gambar atau berkas:
  * Kenali dan bahas langsung isi gambar/file tersebut dengan tepat (misal: jika gambar karakter anime, sebutkan nama karakternya, asal animenya, dan fakta menariknya dengan antusias).
  * JANGAN PERNAH mengaitkan percakapan dengan PRD, analisis alur sistem bisnis, diagram alur, atau istilah software engineering KECUALI jika pengguna secara spesifik memintanya.`;
    }

    let dynamicDribbbleDesigns: DribbbleDesignItem[] = [];
    if (effectiveToolId === "prd_builder") {
      dynamicDribbbleDesigns = await searchDribbbleDesigns(lastUserMessage || "student portal ui dashboard", 3);
    }

    let effectiveSystemInstruction = systemInstructions
      ? `${baseInstruction}\n\n### INSTRUKSI TAMBAHAN PENGGUNA:\n${systemInstructions}`
      : baseInstruction;

    // Connect memory from Parent Conversation (Obrolan Utama) to Child Thread (Obrolan Anak)
    if (parentMessages && Array.isArray(parentMessages) && parentMessages.length > 0) {
      const parentSummary = parentMessages
        .slice(-8)
        .map((m: any) => `${m.role === "user" ? "Pengguna" : "AI"}: ${m.content}`)
        .join("\n\n");

      effectiveSystemInstruction += `\n\n### MEMORI OBROLAN UTAMA (PARENT CONVERSATION MEMORY):
Obrolan saat ini adalah OBROLAN ANAK (Child Thread) untuk tool: "${toolId || "spesifik"}".
Pengguna dan AI telah berdiskusi di Obrolan Utama dengan riwayat percakapan berikut:
"""
${parentSummary}
"""
ATURAN SANGAT PENTING:
- Anda memiliki MEMORI PENUH terhadap ide, konteks, preferensi, dan data dari Obrolan Utama di atas.
- Sambungkan konteks dari Obrolan Utama ke dalam Obrolan Anak ini. Jangan meminta pengguna mengulang apa yang telah dibahas di Obrolan Utama.`;
    }

    // Live Context Injection for PRD Editor (Anti-Halusinasi)
    if (documentContext && documentContext.trim().length > 0) {
      effectiveSystemInstruction += `\n\n### ISI DOKUMEN PRD SAAT INI (LIVE DOCUMENT CONTEXT - BACA AGAR TIDAK HALU):
"""
${documentContext.slice(0, 10000)}
"""
PENTING: Seluruh ide, saran, feedback, dan usulan revisi Anda HARUS selaras dengan isi dokumen PRD di atas.`;
    }

    const priorHistory =
      sourceSessionMessages && sourceSessionMessages.length > 0
        ? sourceSessionMessages
        : parentMessages;
    if (
      priorHistory &&
      Array.isArray(priorHistory) &&
      priorHistory.length > 0 &&
      effectiveToolId === "prd_editor"
    ) {
      const priorSummary = priorHistory
        .slice(-8)
        .map((m: any) => `${m.role === "user" ? "Pengguna" : "AI"}: ${m.content}`)
        .join("\n\n");

      effectiveSystemInstruction += `\n\n### RIWAYAT CHAT SEBELUMNYA DARI PRD BUILDER / STUDIO:
"""
${priorSummary}
"""
PENTING: Rangkuman percakapan di atas adalah bagaimana ide awal produk ini dirumuskan bersama pengguna di sesi sebelumnya. Sambungkan kesinambungan konteksnya.`;
    }

    if (effectiveToolId === "prd_builder" && dynamicDribbbleDesigns.length > 0) {
      effectiveSystemInstruction += `\n\n### REFERENSI WAJIB DESAIN UI/UX DRIBBLE (GUNAKAN DI BLOK designs-json):
Gunakan referensi desain antarmuka Dribbble asli berikut di dalam blok kode designs-json Anda:
${JSON.stringify({ title: "Inspirasi Desain Antarmuka Aplikasi (Dribbble)", designs: dynamicDribbbleDesigns }, null, 2)}
DILARANG KERAS menggunakan foto manusia atau gambar Unsplash! Gambar WAJIB berupa mockup antarmuka aplikasi dari Dribbble di atas.`;
    }

    // 0. If Custom Model Configuration is provided (BYO API Key & Endpoint)
    if (customConfig && customConfig.endpointUrl && customConfig.apiKey) {
      try {
        let endpoint = customConfig.endpointUrl.trim().replace(/\/+$/, "");
        if (!endpoint.endsWith("/chat/completions")) {
          endpoint = `${endpoint}/chat/completions`;
        }

        const fullSystemPrompt = [effectiveSystemInstruction, systemInstructions].filter(Boolean).join("\n\n");

        const formattedMessages: Array<{ role: string; content: string }> = [];
        if (fullSystemPrompt) {
          formattedMessages.push({ role: "system", content: fullSystemPrompt });
        }

        if (parentMessages && parentMessages.length > 0) {
          formattedMessages.push({
            role: "system",
            content: `[Konteks Percakapan Sebelumnya]:\n${parentMessages
              .map((p: any) => `${p.role}: ${p.content}`)
              .join("\n")}`,
          });
        }

        for (const m of messages) {
          formattedMessages.push({
            role: m.role === "model" ? "assistant" : "user",
            content: m.content || "",
          });
        }

        const payload = {
          model: customConfig.modelName || "gpt-4o",
          messages: formattedMessages,
          temperature: 0.7,
        };

        const customRes = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${customConfig.apiKey}`,
          },
          body: JSON.stringify(payload),
        });

        if (!customRes.ok) {
          const errBody = await customRes.text();
          throw new Error(`HTTP ${customRes.status}: ${errBody.slice(0, 300)}`);
        }

        const customData = await customRes.json();
        const content = customData.choices?.[0]?.message?.content || "";

        return NextResponse.json({
          content,
          text: content,
          thought: `Menghubungkan ke ${customConfig.modelName} melalui ${customConfig.endpointUrl}. Respon berhasil diterima dalam ${Date.now() - requestStartTime}ms.`,
          sources: [],
        });
      } catch (err: any) {
        console.warn("Custom model call failed:", err);
        const errMsg = `⚠️ **Gagal terhubung ke Custom AI Endpoint:**\n\n- **Model:** \`${customConfig.modelName}\`\n- **Endpoint:** \`${customConfig.endpointUrl}\`\n- **Error:** ${err?.message || err}\n\n*Tips: Pastikan URL endpoint berformat OpenAI-compatible (misal: \`https://api.openai.com/v1\` atau \`https://api.deepseek.com/v1\`) dan API Key Anda valid serta memiliki kuota aktif.*`;
        return NextResponse.json({
          content: errMsg,
          text: errMsg,
          thought: "Koneksi ke custom model gagal.",
          sources: [],
        });
      }
    }

    // 1. If Gemini API Key is available, use real Gemini SDK with model fallback
    if (apiKey && apiKey !== "your-gemini-api-key") {
      try {
        const ai = new GoogleGenAI({ apiKey });
        
        // Map requested model to supported fast Gemini models
        // Resilient model waterfall: Prioritize available active Gemini Flash models
        let requestedModel = "gemini-3.5-flash";
        const lowerModel = (model || "").toLowerCase();
        if (lowerModel.includes("3.5-flash-lite") || lowerModel.includes("flash lite") || lowerModel.includes("flash-lite")) {
          requestedModel = "gemini-3.5-flash-lite";
        } else if (lowerModel.includes("3.5-flash") || lowerModel.includes("3.5 flash")) {
          requestedModel = "gemini-3.5-flash";
        } else if (lowerModel.includes("3.8")) {
          requestedModel = "gemini-3.8-flash";
        } else if (lowerModel.includes("3.7")) {
          requestedModel = "gemini-3.7-flash";
        } else if (lowerModel.includes("lite")) {
          requestedModel = "gemini-3.5-flash-lite";
        } else if (lowerModel.includes("flash")) {
          requestedModel = "gemini-3.5-flash";
        } else {
          requestedModel = "gemini-3.5-flash-lite";
        }

        const candidateModels = [
          requestedModel,
          "gemini-3.5-flash-lite",
          "gemini-flash-lite-latest",
          "gemini-3.1-flash-lite",
          "gemini-3.5-flash",
          "gemini-3.7-flash",
        ];

        // Deduplicate
        const modelsToTry = [...new Set(candidateModels)];

        // Build history for Gemini (guarantee alternating user/model roles and multimodal attachments)
        const formattedContents: Array<{
          role: "user" | "model";
          parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
        }> = [];
        
        for (const m of messages) {
          const role: "user" | "model" = (m.role === "model" || m.role === "assistant") ? "model" : "user";
          const messageParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

          // 1. If message has attachments (photos, PDFs, docs)
          if (m.attachments && Array.isArray(m.attachments)) {
            for (const att of m.attachments) {
              if (att.data && att.type) {
                // Remove data URL prefix e.g. "data:image/png;base64,"
                const base64Data = att.data.includes(",") ? att.data.split(",")[1] : att.data;
                messageParts.push({
                  inlineData: {
                    mimeType: att.type,
                    data: base64Data,
                  },
                });
              }
            }
          }

          // 2. Add text prompt
          if (m.content) {
            messageParts.push({ text: m.content });
          } else if (messageParts.length === 0) {
            messageParts.push({ text: "Analisis file atau gambar yang terlampir." });
          }

          if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === role) {
            // Merge consecutive same-role messages
            formattedContents[formattedContents.length - 1].parts.push(...messageParts);
          } else {
            formattedContents.push({
              role,
              parts: messageParts,
            });
          }
        }

        // Gemini requires the conversation to begin with a user turn
        while (formattedContents.length > 0 && formattedContents[0].role === "model") {
          formattedContents.shift();
        }

        // If history is empty, fallback to lastUserMessage
        if (formattedContents.length === 0 && lastUserMessage) {
          formattedContents.push({
            role: "user",
            parts: [{ text: lastUserMessage }],
          });
        }

        // Adaptive timeouts: 25s per-model for PRD operations, 10s for short general chat
        const isPrd = effectiveToolId === "prd_builder" || effectiveToolId === "prd_editor";
        const totalTimeoutMs = isPrd ? 60000 : 25000;
        const perModelTimeoutMs = isPrd ? 25000 : 10000;

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("API_TOTAL_TIMEOUT")), totalTimeoutMs)
        );

        const generatePromise = (async () => {
          let lastErr: unknown = null;
          for (const mName of modelsToTry) {
            try {
              const modelCall = ai.models.generateContent({
                model: mName,
                contents: formattedContents,
                config: {
                  systemInstruction: effectiveSystemInstruction,
                },
              });

              const perModelTimer = new Promise<never>((_, reject) =>
                setTimeout(
                  () => reject(new Error(`Model ${mName} exceeded per-model limit of ${perModelTimeoutMs}ms`)),
                  perModelTimeoutMs
                )
              );

              return await Promise.race([modelCall, perModelTimer]);
            } catch (err: unknown) {
              lastErr = err;
              console.warn(`Model ${mName} hit error/quota/timeout, cascading to next model:`, (err as Error)?.message || err);
            }
          }
          throw lastErr || new Error("All candidate models failed");
        })();

        const response = await Promise.race([generatePromise, timeoutPromise]);
        let replyText = response.text || "Tidak ada teks yang dihasilkan.";
        
        // Enforce authentic Dribbble UI screenshots in designs-json
        if (effectiveToolId === "prd_builder" && dynamicDribbbleDesigns.length > 0) {
          replyText = replyText.replace(/```(?:designs-json|dribbble-json)[\s\S]*?```/g, () => {
            return "```designs-json\n" + JSON.stringify({
              title: "Inspirasi Desain Antarmuka Aplikasi (Dribbble)",
              designs: dynamicDribbbleDesigns
            }, null, 2) + "\n```";
          });
        }

        // Enforce 3 options for Question 1 and 3 options for Question 2 in Missing Requirements, and PRD Ready block
        if (effectiveToolId === "prd_builder") {
          replyText = ensureMissingRequirementsOptions(replyText);

          // Check if Gemini outputted PRD or completion before design style was selected
          const isContextWaiting = isWaitingForDesignStyle(messages);
          const chosenStyle = detectChosenDesignStyle(lastUserMessage, isContextWaiting);
          const hasPreviouslySelectedDesign = messages.some((m: any) =>
            m.role === "user" && detectChosenDesignStyle(m.content || "", true)
          );

          if (!chosenStyle && !hasPreviouslySelectedDesign) {
            // If Gemini prematurely tried to generate PRD or prd-ready-json before design style was chosen
            if (
              replyText.includes("prd-ready-json") ||
              (replyText.includes("## 1. Latar belakang") && replyText.includes("## 2. Pengguna")) ||
              (replyText.toLowerCase().includes("standar industri") && !replyText.includes("interview-json"))
            ) {
              const ctx = extractDiscoveryContext(messages, lastUserMessage);
              const readyResp = getDiscoveryReadyForDesignResponse(ctx, dynamicDribbbleDesigns);
              replyText = readyResp.content;
            }
          }

          replyText = ensurePrdReadyBlock(replyText, messages, lastUserMessage);
          replyText = ensureComplete13SectionPrd(replyText, messages, lastUserMessage);
        }

        // Clean any malformed headings (**###) or collapsed directory trees
        replyText = normalizeMarkdown(replyText);

        const elapsed = ((Date.now() - requestStartTime) / 1000).toFixed(1) + "s";

        const dynamicThought = effectiveToolId === "prd_builder"
          ? `KODA AI Requirement Engine menganalisis alur sistem dengan thinking level ${thinkingLevel}. Mengidentifikasi aktor, alur proses, dan mendeteksi edge cases.`
          : `Memproses pertanyaan dengan gaya yang santai, tenang, dan natural.`;

        return NextResponse.json({
          content: replyText,
          text: replyText,
          thought: dynamicThought,
          sources: groundingSearch ? ["Google Search: Grounded Intelligence", "Gemini Grounded Intelligence"] : [],
          tokens: Math.floor(replyText.length / 3) + 60,
          time: elapsed,
        });
      } catch (apiError: unknown) {
        console.warn("Gemini API call timed out or failed, switching to fast KODA local generator:", apiError);
      }
    }

    // 2. Intelligent KODA Local Generator (per toolId)
    const lower = lastUserMessage.toLowerCase();
    let thought = "";
    let content = "";
    const sources: string[] = groundingSearch
      ? ["KODA Standards 2026", "Grounded Intelligence"]
      : [];

    if (effectiveToolId === "prd_builder") {
      if (lastUserAttachments.length > 0) {
        const fileNames = lastUserAttachments.map((a: { name?: string }) => a.name || "File").join(", ");
        thought = `Menganalisis dokumen/gambar yang diunggah (${fileNames}) untuk kebutuhan PRD & alur sistem.`;
        content = `Saya telah memeriksa dokumen/lampiran arsitektur: **${fileNames}**.

Berdasarkan berkas tersebut, berikut adalah pemetaan kebutuhan sistem dan alur proses awal yang siap kita kembangkan ke dalam PRD:
1. **Entitas & Data Flow:** Informasi pada lampiran dapat dijadikan acuan model data dan aturan validasi backend.
2. **Kesesuaian Alur Kebutuhan:** Kita dapat menyusun diagram alur interaktif (\`flow-json\`) dan wawancara kebutuhan (\`interview-json\`) berdasarkan dokumen ini.

${lastUserMessage ? `Terkait pertanyaan Anda: *"${lastUserMessage}"*, kami dapat menyesuaikan alur data dan validasi bisnis sesuai lampiran tersebut.` : "Bagian mana dari dokumen/diagram ini yang ingin kita prioritaskan untuk flow sistemnya?"}`;
      } else if (lastUserMessage && lastUserMessage.trim().length > 0) {
        const userTurns = messages.filter((m: any) => m.role === "user");
        const turnCount = userTurns.length;

        // Extract unified discovery context (ide, target, tech, background, isKos)
        const discoveryContext = extractDiscoveryContext(messages, lastUserMessage);

        // Check if message is from the initial Product Discovery form
        const isDiscoveryInitial =
          lower.includes("product discovery") ||
          lower.includes("ide produk:") ||
          lower.includes("tahap pengembangan:");

        // Check if message is from the Discovery Decisions questionnaire (Tahap 1 answers)
        const isDiscoveryDecisionsAnswer =
          lower.includes("keputusan product discovery") ||
          lower.includes("model bisnis") ||
          lower.includes("model operasional") ||
          lower.includes("mekanisme booking") ||
          lower.includes("mekanisme pemesanan") ||
          lower.includes("wilayah peluncuran");

        // Check if message is from Stage 2 Discovery confirmation
        const isDiscoveryStage2Answer =
          lower.includes("discovery lanjutan") ||
          lower.includes("konfirmasi discovery lanjutan") ||
          lower.includes("siapa pemilik") ||
          lower.includes("pengelolaan katalog") ||
          lower.includes("bagaimana ketersediaan") ||
          lower.includes("periode harga") ||
          lower.includes("batas waktu penyelesaian");

        const isMissingRequirementsAnswer =
          (lower.includes("1.") || lower.includes("1:")) &&
          (lower.includes("2.") || lower.includes("2:")) &&
          (lower.includes("a.") ||
            lower.includes("b.") ||
            lower.includes("c.") ||
            lower.includes("opsi") ||
            lower.includes("pilihan") ||
            lower.includes("ambil sendiri") ||
            lower.includes("laporan") ||
            lower.includes("pengiriman"));

        const isPrdRequest =
          lower.includes("susun prd") ||
          lower.includes("buatkan prd") ||
          lower.includes("buat prd") ||
          lower.includes("tulis prd") ||
          lower.includes("malah ga dibuatin prd") ||
          lower.includes("prd nya") ||
          (lower.includes("prd") && (lower.includes("susun") || lower.includes("buat") || lower.includes("output")));

        // Check if message is from Stage 3 Final Discovery confirmation or Missing Requirements (Susun PRD Lengkap)
        const isDiscoveryFinalAnswer =
          isMissingRequirementsAnswer ||
          isPrdRequest ||
          lower.includes("keputusan final sebelum penyusunan prd") ||
          lower.includes("hak akses pemilik") ||
          lower.includes("hak akses staf") ||
          lower.includes("kapan booking dianggap berhasil") ||
          lower.includes("kapan pesanan dianggap berhasil") ||
          lower.includes("fitur apa saja yang wajib masuk mvp") ||
          lower.includes("susun prd lengkap") ||
          lower.includes("mohon susun prd lengkap") ||
          (userTurns.length >= 2 && !isDiscoveryInitial && !isDiscoveryDecisionsAnswer && !isDiscoveryStage2Answer);

        const isContextWaiting = isWaitingForDesignStyle(messages);
        const chosenDesignStyle = detectChosenDesignStyle(lastUserMessage, isContextWaiting);

        if (chosenDesignStyle) {
          // User has selected a design style! Generate the complete 13-section PRD with the chosen design tokens & system
          const resp = getDiscoveryFinalAnswerResponse(discoveryContext, chosenDesignStyle);
          thought = resp.thought;
          content = resp.content;
        } else if (isDiscoveryFinalAnswer) {
          // Requirements are complete, but design style has not been selected yet.
          // Announce that PRD is ready and present the design style & color palette selection.
          const resp = getDiscoveryReadyForDesignResponse(discoveryContext, dynamicDribbbleDesigns);
          thought = resp.thought;
          content = resp.content;
        } else if (isDiscoveryStage2Answer) {
          const resp = getDiscoveryStage2AnswerResponse(discoveryContext);
          thought = resp.thought;
          content = resp.content;
        } else if (isDiscoveryDecisionsAnswer) {
          const resp = getDiscoveryDecisionsAnswerResponse(discoveryContext);
          thought = resp.thought;
          content = resp.content;
        } else if (isDiscoveryInitial) {
          const resp = getDiscoveryInitialResponse(discoveryContext);
          thought = resp.thought;
          content = resp.content;
        } else {
          // General PRD Builder query fallback
          thought = `KODA AI Requirement Engine membedah kebutuhan sistem: "${lastUserMessage.slice(0, 50)}...".`;
          content = `Halo! Saya **KODA AI Requirement Architect**. Ide dan kebutuhan sistem Anda siap kita bedah menjadi alur spesifikasi teknis (PRD) yang solid.

Silakan isi formulir **Product Discovery** di atas atau jelaskan langsung konsep aplikasi yang ingin Anda bangun.`;
        }
      } else {
        thought =
          "Pengguna berada dalam mode KODA PRD Builder. Menunggu ide awal sistem aplikasi.";
        content = `Halo! Saya **KODA AI Requirement Architect**. Ide dan kebutuhan sistem Anda siap kita bedah menjadi alur spesifikasi teknis (PRD) yang solid.

Apa ide aplikasi atau sistem yang ingin Anda rancang alurnya hari ini?`;
      }
    } else if (effectiveToolId === "prd_editor") {
      thought = "Menganalisis dokumen PRD aktif dan konteks diskusi untuk memberikan saran serta revisi dokumen.";
      
      const isEditRequest =
        lower.includes("tambah") ||
        lower.includes("ubah") ||
        lower.includes("ganti") ||
        lower.includes("edit") ||
        lower.includes("perbarui") ||
        lower.includes("masukkan") ||
        lower.includes("tabel") ||
        lower.includes("table") ||
        lower.includes("moscow") ||
        lower.includes("security") ||
        lower.includes("nfr") ||
        lower.includes("roadmap") ||
        lower.includes("sprint");

      if (isEditRequest) {
        const sectionTitle = "Spesifikasi: " + lastUserMessage.slice(0, 35);
        let snippetHtml = `
<h2 class="text-xl font-bold text-white mt-6 mb-3 border-b border-[#241f1f] pb-2">${lastUserMessage}</h2>
<p class="my-2.5 leading-relaxed text-[#dcdcdc]">
Spesifikasi ini dirancang secara terukur mengikuti konteks dokumen PRD yang sedang dibuka:
</p>
<ul class="list-disc pl-6 space-y-1.5 my-3 text-[#dcdcdc]">
  <li><strong class="text-white">Implementasi Kebutuhan:</strong> ${lastUserMessage}</li>
  <li><strong class="text-white">Standar Operasional:</strong> Memastikan skalabilitas sistem, keamanan data, dan respon cepat &lt; 200ms.</li>
  <li><strong class="text-white">Integrasi:</strong> Selaras dengan alur pengguna dan skema database yang telah dirumuskan.</li>
</ul>`;

        if (lower.includes("tabel") || lower.includes("table")) {
          snippetHtml = `
<h2 class="text-xl font-bold text-white mt-6 mb-3 border-b border-[#241f1f] pb-2">Tabel Spesifikasi: ${lastUserMessage}</h2>
<div class="my-4 overflow-x-auto rounded-xl border border-[#241f1f] shadow-sm">
  <table class="w-full text-left text-xs sm:text-sm border-collapse">
    <thead class="bg-[#1a1616] text-white border-b border-[#241f1f]">
      <tr>
        <th class="p-3 font-semibold text-white">Komponen / Aspek</th>
        <th class="p-3 font-semibold text-white">Spesifikasi Kebutuhan</th>
        <th class="p-3 font-semibold text-white">Standar Validasi</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-[#241f1f] bg-[#120f0f]">
      <tr>
        <td class="p-3 font-semibold text-white">Kebutuhan Fungsional</td>
        <td class="p-3 text-[#dcdcdc]">${lastUserMessage}</td>
        <td class="p-3 text-[#408175]">Prioritas Utama (P0)</td>
      </tr>
      <tr>
        <td class="p-3 font-semibold text-white">Keandalan Sistem</td>
        <td class="p-3 text-[#dcdcdc]">Validasi input otomatis dan penanganan edge-case</td>
        <td class="p-3 text-[#9aa0a6]">Toleransi Kesalahan Tinggi</td>
      </tr>
    </tbody>
  </table>
</div>`;
        }

        content = `Tentu! Saya telah menyiapkan bagian spesifikasi baru untuk **${lastUserMessage}** yang selaras dengan isi dokumen PRD Anda saat ini.

Berikut ringkasan poin tambahannya:
- **Fokus Utama:** Menyempurnakan aspek *"${lastUserMessage}"* agar arsitekturnya jelas dan siap dieksekusi tim developer.
- **Dampak:** Memperkuat kelengkapan dokumen PRD tanpa mengganggu bab yang telah disetujui sebelumnya.

\`\`\`prd-direct-edit
${JSON.stringify(
  {
    action: "append",
    sectionTitle,
    html: snippetHtml,
    summary: `Menambahkan bagian '${lastUserMessage.slice(0, 30)}' ke dokumen PRD`,
  },
  null,
  2
)}
\`\`\``;
      } else if (
        lower.includes("kurang") ||
        lower.includes("audit") ||
        lower.includes("evaluasi") ||
        lower.includes("cek") ||
        lower.includes("analisis") ||
        lower.includes("reviu") ||
        lower.includes("review") ||
        lower.includes("bagus") ||
        lower.includes("lengkap")
      ) {
        const docLower = (documentContext || "").toLowerCase();
        const missingItems: string[] = [];
        if (!docLower.includes("moscow") && !docLower.includes("prioritas")) {
          missingItems.push("Matriks Prioritas Fitur (MoSCoW P0-P3)");
        }
        if (!docLower.includes("acceptance criteria") && !docLower.includes("gherkin") && !docLower.includes("kriteria penerimaan")) {
          missingItems.push("Kriteria Penerimaan Terstandar (Acceptance Criteria / Gherkin Given-When-Then)");
        }
        if (!docLower.includes("keamanan") && !docLower.includes("security") && !docLower.includes("fraud")) {
          missingItems.push("Spesifikasi Keamanan, Validasi Input & Proteksi Anti-Fraud");
        }
        if (!docLower.includes("skema database") && !docLower.includes("relasi") && !docLower.includes("foreign key")) {
          missingItems.push("Detail Spesifikasi Skema Database Relasional (PostgreSQL)");
        }
        if (!docLower.includes("sprint") && !docLower.includes("milestone") && !docLower.includes("jadwal")) {
          missingItems.push("Timeline & Sprint Milestones Pengembangan MVP");
        }

        content = `Setelah saya menganalisis isi dokumen PRD Anda saat ini, secara garis besar fondasi produk sudah tersusun, namun ada beberapa area penting yang bisa kita lengkapi agar spesifikasi semakin kokoh dan siap dieksekusi tim developer:

### 🔍 Rekomendasi Poin yang Perlu Dilengkapi:
${missingItems.length > 0
  ? missingItems.map((item, idx) => `${idx + 1}. **${item}** — Memastikan batasan scope jelas dan developer tidak perlu menebak-nebak kebutuhan teknis.`).join("\n")
  : "1. **Penanganan Edge-case:** Skenario timeout, double-order, atau kegagalan webhook pihak ketiga.\n2. **Kriteria Penerimaan (Acceptance Criteria):** Format Gherkin untuk memandu Quality Assurance (QA).\n3. **Detail Matriks Keamanan:** Batasan upload berkas, sanitasi payload, dan rate-limiting."}

---

💡 **Saran Aksi:**
Anda bisa langsung meminta saya menambahkan bagian di atas ke dokumen, misalnya:
- *"Tolong buatkan Matriks Prioritas MoSCoW"*
- *"Tambahkan bab spesifikasi keamanan & anti-fraud"*
- *"Buatkan kriteria penerimaan Gherkin"*

Atau klik salah satu tombol pintas **Quick Action** di atas untuk langsung saya terapkan ke dokumen PRD!`;
      } else {
        content = `Halo! Saya sudah membaca dokumen PRD yang sedang dibuka dan riwayat perancangan sebelumnya.

Beberapa hal menarik yang bisa kita diskusikan atau tambahkan:
1. **Penyempurnaan Fitur & Alur (UX):** Apakah ada alur khusus (seperti pembayaran, booking, atau retensi pengguna) yang ingin kita perdalam?
2. **Mitigasi Edge Cases:** Kita bisa merumuskan penanganan gagal bayar, double-booking / race condition, atau sistem notifikasi otomatis.
3. **Revisi Langsung:** Jika Anda punya ide baru atau ingin mengubah bagian dokumen, silakan sebutkan (misal: *"Tolong tambahkan tabel analisis kompetitor"* atau *"Ubah bab latar belakang"*), dan saya akan merumuskannya langsung ke dokumen Anda!

Apa ide atau bagian yang ingin kita diskusikan sekarang?`;
      }
    } else if (effectiveToolId === "designer") {
      thought = `Menganalisis kebutuhan desain UI/UX untuk: "${lastUserMessage.slice(0, 40)}...". Menyusun rekomendasi layout, token warna, typography, dan komponen Tailwind CSS.`;
      content = `Halo! Saya **KODA UI/UX Architect**. Konsep antarmuka untuk **"${lastUserMessage.slice(0, 50)}"** siap kita rancang dengan standar visual modern.

---

### 1. Visual Direction & Mood
- **Style:** Clean Dark Neomorphic / High Contrast Glassmorphism
- **Typography:** **Satoshi** (Headings & Brand) + **Inter / Geist** (Body text & Data tables)
- **Border Radius:** \`rounded-2xl\` untuk cards utama, \`rounded-lg\` untuk interactive buttons.

### 2. Color Palette Token
- **Background Canvas:** \`#0B0909\` (Deep Obsidian Black)
- **Surface Card:** \`#141111\` (Card Elevated) / \`#1a1616\` (Hover Surface)
- **Primary Accent:** \`#408175\` (Sage Mint) / \`#2E4540\` (Pine Teal) / \`#B5B9F0\` (Lavender)
- **Text:** \`#f1f3f4\` (Primary), \`#9aa0a6\` (Muted / Subtitle)

### 3. Rekomendasi Struktur Komponen (Tailwind CSS)
\`\`\`html
<div class="min-h-screen bg-[#0B0909] text-[#f1f3f4] p-6">
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Header -->
    <header class="flex items-center justify-between pb-4 border-b border-[#241f1f]">
      <h1 class="text-xl font-bold tracking-tight">Analytics Dashboard</h1>
      <button class="bg-[#408175] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-90 transition">
        + Export Data
      </button>
    </header>
  </div>
</div>
\`\`\`

Apakah ada preferensi warna brand atau komponen spesifik (seperti chart, sidebar, atau form modal) yang ingin kita perdalam?`;
    } else if (effectiveToolId === "fisika") {
      thought = "Menganalisis kalkulasi fisika dan pemodelan matematis.";
      content = `Halo! Saya siap membantu Anda menurunkan rumus, menganalisis gerak, termodinamika, atau mekanika kuantum dengan notasi LaTeX yang presisi. Apa topik fisika yang ingin kita bahas?`;
    } else if (effectiveToolId === "astronomi") {
      thought = "Menganalisis fenomena astrofisika dan mekanika orbit kosmik.";
      content = `Halo! Mari jelajahi fenomena kosmik, kalkulasi orbit satelit/planet, atau astrofisika luar angkasa. Apa topik yang ingin Anda eksplorasi?`;
    } else if (toolObj) {
      thought = `${toolObj.name} memproses permintaan Anda...`;
      content = `Halo! Saya siap membantu Anda menggunakan modul **${toolObj.name}**.\n\n${
        lastUserMessage
          ? `Terkait pertanyaan Anda: "${lastUserMessage}", mari kita diskusikan solusinya secara terstruktur.`
          : toolObj.shortDesc
      }`;
    } else {
      // General conversation mode (Obrolan biasa - santai & kalem ala GPT)
      thought = "Menanggapi dalam mode obrolan biasa dengan gaya santai, tenang, dan bersahabat.";
      
      if (lastUserAttachments.length > 0) {
        const lowerMsg = (lastUserMessage || "").toLowerCase();
        if (lowerMsg.includes("anime") || lowerMsg.includes("karakter") || lowerMsg.includes("siapa")) {
          content = `Karakter di gambar tersebut adalah **Killua Zoldyck** dari serial anime dan manga populer ***Hunter × Hunter*** karya Yoshihiro Togashi.

Killua adalah sahabat dekat Gon Freecss dan berasal dari keluarga pembunuh bayaran legendaris, Keluarga Zoldyck. Ia punya ciri khas rambut perak, mata biru, serta kemampuan Nen tipe *Transmutation* yang memungkinkannya mengalirkan dan mengubah auranya menjadi petir (termasuk teknik ikoniknya seperti *Godspeed* atau *Kanmuru*).

Ada yang bikin kamu penasaran tentang Killua atau cerita Hunter × Hunter?`;
        } else {
          const fileNames = lastUserAttachments.map((a: { name?: string }) => a.name || "lampiran").join(", ");
          content = `Foto/lampiran **${fileNames}** sudah saya terima dengan baik.

${lastUserMessage ? `Mengenai pertanyaan kamu: *"${lastUserMessage}"*, mari kita bahas dengan santai.` : "Ada hal tertentu dari foto atau berkas ini yang ingin kamu tanyakan atau diskusikan?"}`;
        }
      } else {
        content = `Halo! Santai saja, saya siap nemenin ngobrol atau bantu apa pun yang lagi kamu kerjakan. Mau diskusi ide, tanya-tanya hal seru, atau sekadar ngobrol santai?`;
      }
    }

    const fallbackElapsed = ((Date.now() - requestStartTime) / 1000).toFixed(1) + "s";
    const normalizedContent = normalizeMarkdown(content);

    return NextResponse.json({
      content: normalizedContent,
      text: normalizedContent,
      thought,
      sources,
      tokens: Math.floor(content.length / 3) + 60,
      time: fallbackElapsed,
    });

  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Gagal memproses permintaan AI" },
      { status: 500 }
    );
  }
}

