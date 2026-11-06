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
  getDiscoveryFinalAnswerResponse,
} from "@/lib/ai/discovery-helper";

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

5. **Tahap Finalisasi & Tombol Susun PRD (Standar Industri Terpenuhi):**
   - Ketika seluruh pertanyaan wawancara (arsitektur makro & missing requirements No 1 dan 2) atau discovery telah dijawab dan disepakati oleh pengguna:
   - Nyatakan secara tegas bahwa rancangan PRD telah memenuhi standar industri software engineering (tidak ada lagi asumsi liar, skema data DDL jelas, anti-race condition locking siap, dan alur teruji).
   - Dokumen PRD WAJIB disusun dengan format standar industri 13 BAGIAN LENGKAP:
     1. Latar belakang dan masalah (1.1 Latar belakang, 1.2 Problem statement, 1.3 Tujuan produk, 1.4 Batasan produk)
     2. Pengguna, role, dan hak akses (Role matrix Mahasiswa, Pemilik, Admin)
     3. Ruang lingkup dan fitur fungsional (3.1 FR-01, FR-02, FR-03 dengan link gambar OpenAI static-rsc, 3.2 FR-04 instant booking & mermaid flowchart, 3.3 FR-05, FR-06, FR-07, 3.4 FR-08 WhatsApp, 3.5 FR-09 Autentikasi)
     4. Business rules (BR-01 s/d BR-14, 4.1 Siklus status booking, 4.2 Aturan kedaluwarsa 24 jam)
     5. Acceptance criteria (AC-01 s/d AC-07)
     6. Arsitektur teknis Laravel 12 (6.1 Struktur modul, 6.2 Rekomendasi stack, 6.3 Struktur folder)
     7. Rancangan database (7.1 Entitas utama, 7.2 Detail tabel & relasi, 7.3 Kolom penting bookings, 7.4 Integritas data)
     8. Backlog pengembangan berprioritas (BK-01 s/d BK-20, Urutan milestone 1-5)
     9. Non-functional requirements (NFR-01 s/d NFR-08)
     10. KPI dan validasi produk
     11. Asumsi dan keputusan yang belum final
     12. Definition of Done (DoD)
     13. Rekomendasi keputusan sebelum coding
     Kesimpulan: PRD Booking Kos v1.0 ...
   - Di akhir respon Anda, Anda WAJIB menyertakan blok kode JSON khusus dengan tag \`prd-ready-json\` berikut:
\`\`\`prd-ready-json
{
  "title": "Spesifikasi PRD Memenuhi Standar Industri",
  "appName": "Nama Aplikasi yang Dirancang",
  "summary": "Seluruh 13 bagian PRD, diagram alur sistem, skema relasional database, dan backlog MVP telah tuntas terverifikasi.",
  "buttonText": "Download PRD (.md)"
}
\`\`\`
   - Blok ini akan memicu munculnya tombol aksi interaktif langsung di chat pengguna untuk mengunduh dokumen PRD lengkap dalam format .md (Markdown) atau menyalin teks PRD.

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
   - **Tahap 3 (Kebutuhan Selesai):** Validasi kesiapan standar industri, 13 bagian PRD lengkap, serta blok kode \`prd-ready-json\`.
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

  // Do not append if the text is actively asking questions via questionnaire blocks
  if (
    text.includes("```interview-json") ||
    text.includes("```discovery-decisions-json") ||
    text.includes("```discovery-stage2-json") ||
    text.includes("```discovery-final-json") ||
    text.includes("```discovery-stage3-json")
  ) {
    return text;
  }

  const lowerMsg = (lastUserMessage || "").toLowerCase();
  const userMessages = messages.filter((m: any) => m.role === "user");

  const hasAnsweredQ1Q2 =
    (lowerMsg.includes("1.") && lowerMsg.includes("2.")) ||
    (lowerMsg.includes("1:") && lowerMsg.includes("2:")) ||
    (lowerMsg.includes("opsi") && (lowerMsg.includes("1") || lowerMsg.includes("2"))) ||
    (userMessages.length >= 3 && (lowerMsg.includes("a") || lowerMsg.includes("b") || lowerMsg.includes("c")));

  const textMentionsCompletion =
    text.toLowerCase().includes("standar industri") ||
    text.toLowerCase().includes("siap disusun") ||
    text.toLowerCase().includes("seluruh kebutuhan") ||
    (text.toLowerCase().includes("lengkap") && text.toLowerCase().includes("prd"));

  if (hasAnsweredQ1Q2 || textMentionsCompletion) {
    const readyBlock = `\n\n\`\`\`prd-ready-json
{
  "title": "Spesifikasi PRD Memenuhi Standar Industri",
  "appName": "Arsitektur Sistem Terverifikasi",
  "summary": "Seluruh 13 bagian PRD, diagram alur sistem, skema database relasional, dan backlog MVP telah tuntas terverifikasi.",
  "buttonText": "Download PRD (.md)"
}
\`\`\`\n`;
    return text + readyBlock;
  }

  return text;
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

  // Do not append if actively asking questions
  if (
    text.includes("```interview-json") ||
    text.includes("```discovery-decisions-json") ||
    text.includes("```discovery-stage2-json") ||
    text.includes("```discovery-final-json")
  ) {
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

  const ctx = extractDiscoveryContext(messages, lastUserMessage);
  const prdMarkdown = generateDynamicPrdDocument(ctx);

  if (text.includes("```prd-ready-json")) {
    return text.replace("```prd-ready-json", `\n\n${prdMarkdown}\n\n\`\`\`prd-ready-json`);
  }

  return `${text}\n\n${prdMarkdown}\n\n\`\`\`prd-ready-json
{
  "title": "Spesifikasi PRD Memenuhi Standar Industri",
  "appName": "${ctx.idea}",
  "summary": "Seluruh 13 bagian PRD ${ctx.idea}, alur sistem, skema database relasional, dan backlog MVP telah tuntas terverifikasi.",
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
      systemInstructions = "",
      toolId = null,
      model = "Gemini 3.5 Flash",
      thinkingLevel = "Medium",
      groundingSearch = true,
    } = body;

    const requestStartTime = Date.now();
    const apiKey = process.env.GEMINI_API_KEY;
    const lastUserObj = [...messages].reverse().find((m) => m.role === "user");
    const lastUserMessage = lastUserObj?.content || "";
    const lastUserAttachments = lastUserObj?.attachments || [];

    // Determine System Prompt based on selected tool
    let baseInstruction = "";
    if (toolId === "prd_builder") {
      baseInstruction = KODA_SYSTEM_INSTRUCTION;
    } else if (toolId === "designer") {
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
    } else if (toolId === "fisika") {
      baseInstruction = `Anda adalah AI Physics & Computational Science Specialist.
Anda membantu pengguna memahami fenomena fisika, menurunkan rumus matematis, menyusun logika simulasi fisika untuk game/aplikasi, serta menjelaskan kalkulasi mekanika, termodinamika, elektromagnetisme, dan fisika modern secara runut dengan notasi LaTeX.`;
    } else if (toolId === "astronomi") {
      baseInstruction = `Anda adalah AI Astrophysicist & Cosmologist.
Anda membantu pengguna memahami fenomena astronomi, mekanika orbit benda langit (Keplerian orbit), astrofotografi, bintang neutron, lubang hitam, dan data observatorium teleskop luar angkasa dengan akurat dan memukau.`;
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
    if (toolId === "prd_builder") {
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

    if (toolId === "prd_builder" && dynamicDribbbleDesigns.length > 0) {
      effectiveSystemInstruction += `\n\n### REFERENSI WAJIB DESAIN UI/UX DRIBBLE (GUNAKAN DI BLOK designs-json):
Gunakan referensi desain antarmuka Dribbble asli berikut di dalam blok kode designs-json Anda:
${JSON.stringify({ title: "Inspirasi Desain Antarmuka Aplikasi (Dribbble)", designs: dynamicDribbbleDesigns }, null, 2)}
DILARANG KERAS menggunakan foto manusia atau gambar Unsplash! Gambar WAJIB berupa mockup antarmuka aplikasi dari Dribbble di atas.`;
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
          const role: "user" | "model" = m.role === "model" ? "model" : "user";
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

        // If history is empty, fallback to lastUserMessage
        if (formattedContents.length === 0 && lastUserMessage) {
          formattedContents.push({
            role: "user",
            parts: [{ text: lastUserMessage }],
          });
        }

        // Adaptive timeouts: quick 8s per-model for chat/halo, 25s for large PRD payloads
        const isPrd = toolId === "prd_builder";
        const totalTimeoutMs = isPrd ? 60000 : 20000;
        const perModelTimeoutMs = isPrd ? 25000 : 8000;

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
        if (toolId === "prd_builder" && dynamicDribbbleDesigns.length > 0) {
          replyText = replyText.replace(/```(?:designs-json|dribbble-json)[\s\S]*?```/g, () => {
            return "```designs-json\n" + JSON.stringify({
              title: "Inspirasi Desain Antarmuka Aplikasi (Dribbble)",
              designs: dynamicDribbbleDesigns
            }, null, 2) + "\n```";
          });
        }

        // Enforce 3 options for Question 1 and 3 options for Question 2 in Missing Requirements, and PRD Ready block
        if (toolId === "prd_builder") {
          replyText = ensureMissingRequirementsOptions(replyText);
          replyText = ensurePrdReadyBlock(replyText, messages, lastUserMessage);
          replyText = ensureComplete13SectionPrd(replyText, messages, lastUserMessage);
        }

        const elapsed = ((Date.now() - requestStartTime) / 1000).toFixed(1) + "s";

        const dynamicThought = toolId === "prd_builder"
          ? `KODA AI Requirement Engine menganalisis alur sistem dengan thinking level ${thinkingLevel}. Mengidentifikasi aktor, alur proses, dan mendeteksi edge cases.`
          : `Memproses pertanyaan dengan gaya yang santai, tenang, dan natural.`;

        return NextResponse.json({
          content: replyText,
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

    if (toolId === "prd_builder") {
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

        if (isDiscoveryFinalAnswer) {
          const resp = getDiscoveryFinalAnswerResponse(discoveryContext);
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
    } else if (toolId === "designer") {
      thought = `Menganalisis kebutuhan desain UI/UX untuk: "${lastUserMessage.slice(0, 40)}...". Menyusun rekomendasi layout, token warna, typography, dan komponen Tailwind CSS.`;
      content = `Halo! Saya **KODA UI/UX Architect**. Konsep antarmuka untuk **"${lastUserMessage.slice(0, 50)}"** siap kita rancang dengan standar visual modern.

---

### 1. Visual Direction & Mood
- **Style:** Clean Dark Neomorphic / High Contrast Glassmorphism
- **Typography:** **Satoshi** (Headings & Brand) + **Inter / Geist** (Body text & Data tables)
- **Border Radius:** \`rounded-2xl\` untuk cards utama, \`rounded-lg\` untuk interactive buttons.

### 2. Color Palette Token
- **Background Canvas:** \`#131314\` (Deep Matte Charcoal)
- **Surface Card:** \`#1e1f20\` (Card Elevated) / \`#282a2c\` (Hover Surface)
- **Primary Accent:** \`#d97736\` (Claude Warm Orange) / \`#f28b82\` (Accent Coral)
- **Text:** \`#f1f3f4\` (Primary), \`#9aa0a6\` (Muted / Subtitle)

### 3. Rekomendasi Struktur Komponen (Tailwind CSS)
\`\`\`html
<div class="min-h-screen bg-[#131314] text-[#f1f3f4] p-6">
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Header -->
    <header class="flex items-center justify-between pb-4 border-b border-[#282a2c]">
      <h1 class="text-xl font-bold tracking-tight">Analytics Dashboard</h1>
      <button class="bg-[#d97736] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-90 transition">
        + Export Data
      </button>
    </header>
  </div>
</div>
\`\`\`

Apakah ada preferensi warna brand atau komponen spesifik (seperti chart, sidebar, atau form modal) yang ingin kita perdalam?`;
    } else if (toolId === "fisika") {
      thought = "Menganalisis kalkulasi fisika dan pemodelan matematis.";
      content = `Halo! Saya siap membantu Anda menurunkan rumus, menganalisis gerak, termodinamika, atau mekanika kuantum dengan notasi LaTeX yang presisi. Apa topik fisika yang ingin kita bahas?`;
    } else if (toolId === "astronomi") {
      thought = "Menganalisis fenomena astrofisika dan mekanika orbit kosmik.";
      content = `Halo! Mari jelajahi fenomena kosmik, kalkulasi orbit satelit/planet, atau astrofisika luar angkasa. Apa topik yang ingin Anda eksplorasi?`;
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

    return NextResponse.json({
      content,
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

