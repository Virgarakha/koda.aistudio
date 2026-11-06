import { BOOKING_KOS_PRD_DOCUMENT } from "./booking-kos-prd";
import { generateDynamicPrdDocument } from "./dynamic-prd";

export interface DiscoveryContext {
  idea: string;
  target: string;
  userBg: string;
  platform: string;
  stage: string;
  tech: string;
  isKos: boolean;
}

export function extractDiscoveryContext(
  messages: any[],
  lastUserMessage: string
): DiscoveryContext {
  let idea = "";
  let target = "";
  let userBg = "";
  let platform = "";
  let stage = "";
  let tech = "";

  const allUserTexts = [
    ...messages.filter((m: any) => m.role === "user").map((m: any) => m.content || ""),
    lastUserMessage || "",
  ];

  for (const text of allUserTexts) {
    const ideaMatch =
      text.match(/(?:1\.\s*\*\*Ide Produk:\*\*|Ide Produk:)\s*([^\n]+)/i);
    if (ideaMatch && !idea) idea = ideaMatch[1].trim();

    const bgMatch =
      text.match(/(?:2\.\s*\*\*Latar Belakang \/ Pemahaman IT:\*\*|Pemahaman IT:)\s*([^\n]+)/i);
    if (bgMatch && !userBg) userBg = bgMatch[1].trim();

    const targetMatch =
      text.match(/(?:3\.\s*\*\*Target Pengguna:\*\*|Target Pengguna:)\s*([^\n]+)/i);
    if (targetMatch && !target) target = targetMatch[1].trim();

    const platformMatch =
      text.match(/(?:4\.\s*\*\*Platform Produk:\*\*|Platform Produk:)\s*([^\n]+)/i);
    if (platformMatch && !platform) platform = platformMatch[1].trim();

    const stageMatch =
      text.match(/(?:5\.\s*\*\*Tahap Pengembangan:\*\*|Tahap Pengembangan:)\s*([^\n]+)/i);
    if (stageMatch && !stage) stage = stageMatch[1].trim();

    const techMatch =
      text.match(/(?:6\.\s*\*\*Tech Stack:\*\*|Tech Stack:)\s*([^\n]+)/i);
    if (techMatch && !tech) tech = techMatch[1].trim();
  }

  // Fallback if user just entered an idea in their first chat
  if (!idea) {
    const firstPrompt = allUserTexts[0] || "";
    if (firstPrompt && !firstPrompt.includes("Product Discovery")) {
      const clean = firstPrompt
        .replace(/^([Aa]i|[Tt]olong|buatkan|bikin|buat|create|build|aku ingin membuat|saya ingin membuat|aku mau bikin)\s+/i, "")
        .trim();
      const firstSentence = clean.split(/[.\n?!]/)[0].trim();
      if (firstSentence.length > 2) idea = firstSentence;
    }
  }

  const cleanedIdea = (idea || "").toLowerCase().replace(/\bongkos\b/gi, "");
  const isKos =
    /\b(kos|kost|indekos|kamar\s+kos|booking\s+kos)\b/i.test(cleanedIdea) ||
    (/\b(booking\s+kos|sewa\s+kos)\b/i.test(
      allUserTexts.join(" ").toLowerCase().replace(/\bongkos\b/gi, "")
    ));

  if (!idea) idea = isKos ? "Booking Kos" : "Platform Aplikasi Digital";
  if (!target) target = isKos ? "Mahasiswa yang butuh kos" : "Pengguna Utama";
  if (!userBg) userBg = "Awam / Non-IT (Pemula)";
  if (!platform) platform = "Web App";
  if (!stage) stage = "MVP baru — mulai dari nol";
  if (!tech) tech = "Laravel 12";

  return { idea, target, userBg, platform, stage, tech, isKos };
}

export function getDiscoveryInitialResponse(ctx: DiscoveryContext): {
  thought: string;
  content: string;
} {
  const { idea, target, userBg, platform, stage, tech, isKos } = ctx;

  const thought = `KODA AI Requirement Engine memproses Product Discovery untuk "${idea}". Latar belakang pengguna: "${userBg}". Menyesuaikan tone bahasa agar ramah, jelas, dan bebas jargon server yang membingungkan.`;

  if (isKos) {
    const content = `Baik. Kita akan membangun **PRD untuk platform Booking Kos berbasis ${platform.toLowerCase()} menggunakan ${tech}**, dengan fokus pada ${target}.

Aku akan memulai dari *Product Discovery*, bukan langsung menetapkan fitur. Ada beberapa keputusan penting yang perlu kita validasi agar PRD tidak berisi asumsi yang keliru.

### Discovery 01 — Booking Kos

\`\`\`discovery-summary-json
{
  "appName": "Booking Kos",
  "category": "Product concept · MVP · Web application",
  "targetUser": "${target}",
  "backend": "${tech}",
  "productStage": "${stage.includes("MVP") ? "MVP dari nol" : stage}",
  "platform": "${platform.includes("Web") ? "Web responsif" : platform}"
}
\`\`\`

### 1. Pertanyaan inti yang perlu diputuskan
Jawab pertanyaan berikut sesuai visi produkmu. Pilih opsi yang paling mendekati; kita bisa mengubahnya nanti.

\`\`\`discovery-decisions-json
{
  "appName": "Booking Kos",
  "questions": [
    {
      "id": "1",
      "title": "1. Model bisnis dan operasional",
      "description": "Bagaimana platform ini mempertemukan mahasiswa dengan pemilik kos?",
      "type": "radio",
      "options": [
        "Marketplace — banyak pemilik kos dapat mendaftarkan kos mereka sendiri.",
        "Direktori — platform menampilkan kos, mahasiswa menghubungi pemilik secara langsung.",
        "Satu pengelola — platform hanya mengelola kos milik satu bisnis."
      ],
      "default": "Satu pengelola — platform hanya mengelola kos milik satu bisnis."
    },
    {
      "id": "2",
      "title": "2. Mekanisme booking",
      "description": "Apa yang terjadi saat mahasiswa ingin memesan kamar?",
      "type": "radio",
      "options": [
        "Request booking — mahasiswa mengajukan permintaan, pemilik menyetujui atau menolak.",
        "Instant booking — kamar langsung dipesan jika tersedia.",
        "Hubungi pemilik — melalui WhatsApp atau kontak yang tersedia.",
        "Jadwalkan survei — mahasiswa membuat janji untuk melihat kos terlebih dahulu."
      ],
      "default": "Instant booking — kamar langsung dipesan jika tersedia."
    },
    {
      "id": "3",
      "title": "3. Sistem pembayaran",
      "description": "Tentukan cakupan pembayaran yang ingin diuji pada MVP.",
      "type": "radio",
      "options": [
        "Tanpa pembayaran online — hanya pencarian dan booking.",
        "DP online — mahasiswa membayar uang muka melalui platform.",
        "Pembayaran penuh — mahasiswa membayar biaya kos secara online.",
        "Pembayaran langsung ke pemilik kos."
      ],
      "default": "Tanpa pembayaran online — hanya pencarian dan booking."
    },
    {
      "id": "4",
      "title": "4. Siapa yang mengelola data kos?",
      "type": "radio",
      "options": [
        "Pemilik kos mendaftar, mengelola properti, kamar, harga, dan ketersediaan sendiri.",
        "Admin platform memasukkan dan memperbarui semua data kos.",
        "Keduanya — pemilik mengelola kos, admin melakukan moderasi."
      ],
      "default": "Pemilik kos mendaftar, mengelola properti, kamar, harga, dan ketersediaan sendiri."
    },
    {
      "id": "5",
      "title": "5. Wilayah peluncuran",
      "description": "Kota atau area pertama menentukan strategi pengumpulan listing kos.",
      "type": "text",
      "placeholder": "Contoh: Malang, Surabaya, Jakarta",
      "default": "Malang"
    },
    {
      "id": "6",
      "title": "6. Fitur atau keunggulan utama",
      "description": "Apa masalah yang ingin kamu selesaikan lebih baik daripada mencari kos lewat media sosial atau marketplace umum?",
      "type": "textarea",
      "placeholder": "Ketik masalah atau keunggulan...",
      "default": "Harga murah"
    },
    {
      "id": "7",
      "title": "7. Role pengguna",
      "description": "Pilih aktor yang perlu ada dalam MVP.",
      "type": "checkbox",
      "options": [
        { "label": "Mahasiswa", "description": "Mencari dan memesan kos" },
        { "label": "Pemilik kos", "description": "Mengelola listing dan kamar" },
        { "label": "Admin", "description": "Memoderasi platform" },
        { "label": "Superadmin", "description": "Mengelola konfigurasi dan akses admin" }
      ],
      "default": ["Mahasiswa", "Pemilik kos"]
    },
    {
      "id": "8",
      "title": "8. Verifikasi kos",
      "type": "radio",
      "options": [
        "Tidak ada verifikasi khusus pada MVP.",
        "Admin memeriksa dan menyetujui listing sebelum ditayangkan.",
        "Pemilik wajib mengunggah dokumen pendukung kepemilikan atau pengelolaan kos."
      ],
      "default": "Tidak ada verifikasi khusus pada MVP."
    }
  ]
}
\`\`\`

### 2. Output yang akan kita hasilkan
Setelah keputusan inti jelas, aku akan menyusun PRD lengkap 13 bagian standar industri.`;
    return { thought, content };
  }

  // Dynamic discovery for any non-kos idea (e.g. Toko Benih, POS, Laundry, etc.)
  const content = `Baik. Kita akan membangun **PRD untuk platform ${idea} berbasis ${platform.toLowerCase()} menggunakan ${tech}**, dengan fokus pada ${target}.

Aku akan memulai dari *Product Discovery*, bukan langsung menetapkan fitur. Ada beberapa keputusan penting yang perlu kita validasi agar PRD tidak berisi asumsi yang keliru.

### Discovery 01 — ${idea}

\`\`\`discovery-summary-json
{
  "appName": "${idea}",
  "category": "Product concept · MVP · ${platform}",
  "targetUser": "${target}",
  "backend": "${tech}",
  "productStage": "${stage.includes("MVP") ? "MVP dari nol" : stage}",
  "platform": "${platform.includes("Web") ? "Web responsif" : platform}"
}
\`\`\`

### 1. Pertanyaan inti yang perlu diputuskan
Jawab pertanyaan berikut sesuai visi produkmu. Pilih opsi yang paling mendekati; kita bisa mengubahnya nanti.

\`\`\`discovery-decisions-json
{
  "appName": "${idea}",
  "questions": [
    {
      "id": "1",
      "title": "1. Model bisnis dan operasional",
      "description": "Bagaimana platform ini mempertemukan ${target} dengan ${idea.toLowerCase()}?",
      "type": "radio",
      "options": [
        "Satu pengelola — platform hanya mengelola produk/layanan milik satu bisnis mandiri.",
        "Marketplace / Multi-Vendor — banyak penjual/mitra dapat mendaftarkan produk mereka sendiri.",
        "Direktori / Katalog — platform menampilkan produk/layanan, ${target} menghubungi pengelola secara langsung."
      ],
      "default": "Satu pengelola — platform hanya mengelola produk/layanan milik satu bisnis mandiri."
    },
    {
      "id": "2",
      "title": "2. Mekanisme pemesanan & transaksi",
      "description": "Apa yang terjadi saat ${target} ingin memesan atau membeli?",
      "type": "radio",
      "options": [
        "Pesanan langsung (Instant Order) — pesanan langsung diproses jika stok tersedia.",
        "Request / Tanya ketersediaan dulu — pengelola mengonfirmasi ketersediaan sebelum pesanan disetujui.",
        "Hubungi pengelola — transaksi diarahkan melalui WhatsApp atau kontak langsung.",
        "Konsultasi & janji temu — ${target} berkonsultasi sebelum menentukan pesanan."
      ],
      "default": "Pesanan langsung (Instant Order) — pesanan langsung diproses jika stok tersedia."
    },
    {
      "id": "3",
      "title": "3. Sistem pembayaran",
      "description": "Tentukan cakupan pembayaran yang ingin diuji pada MVP.",
      "type": "radio",
      "options": [
        "Tanpa pembayaran online di platform — pemesanan dicatat, pembayaran langsung tunai/transfer.",
        "Pembayaran online otomatis / QRIS — pelanggan membayar langsung di website/aplikasi.",
        "Uang Muka (DP) online — membayar DP melalui platform, pelunasan saat barang/layanan diterima.",
        "Pembayaran saat barang sampai (Cash on Delivery / COD)."
      ],
      "default": "Tanpa pembayaran online di platform — pemesanan dicatat, pembayaran langsung tunai/transfer."
    },
    {
      "id": "4",
      "title": "4. Siapa yang mengelola katalog & stok?",
      "type": "radio",
      "options": [
        "Admin / Pemilik usaha memasukkan dan memperbarui seluruh data produk, harga, dan stok.",
        "Staf operasional / kasir dapat mengubah stok dan harga dengan hak akses terbatas.",
        "Multi-seller — setiap penjual mengelola tokonya masing-masing."
      ],
      "default": "Admin / Pemilik usaha memasukkan dan memperbarui seluruh data produk, harga, dan stok."
    },
    {
      "id": "5",
      "title": "5. Wilayah peluncuran / Target pasar",
      "description": "Area jangkauan pertama menentukan strategi distribusi dan operasional.",
      "type": "text",
      "placeholder": "Contoh: Lokal kota, Satu wilayah, atau Seluruh Indonesia",
      "default": "Nasional"
    },
    {
      "id": "6",
      "title": "6. Fitur atau keunggulan utama",
      "description": "Apa masalah yang ingin diselesaikan lebih baik daripada sistem manual/media sosial?",
      "type": "textarea",
      "placeholder": "Ketik masalah atau keunggulan...",
      "default": "Pencatatan rapi, kemudahan pesan untuk ${target}, dan ketersediaan stok akurat"
    },
    {
      "id": "7",
      "title": "7. Role pengguna",
      "description": "Pilih aktor yang perlu ada dalam MVP.",
      "type": "checkbox",
      "options": [
        { "label": "${target}", "description": "Mencari dan memesan produk/layanan" },
        { "label": "Pemilik / Operator Bisnis", "description": "Mengelola katalog, stok, dan pesanan" },
        { "label": "Admin Platform", "description": "Mengelola konfigurasi sistem dan laporan" }
      ],
      "default": ["${target}", "Pemilik / Operator Bisnis"]
    },
    {
      "id": "8",
      "title": "8. Verifikasi transaksi",
      "type": "radio",
      "options": [
        "Tidak ada verifikasi khusus pada MVP (langsung diproses).",
        "Pengelola memeriksa bukti transaksi secara manual sebelum pesanan dikirim.",
        "Wajib verifikasi nomor kontak / WhatsApp pelanggan."
      ],
      "default": "Tidak ada verifikasi khusus pada MVP (langsung diproses)."
    }
  ]
}
\`\`\`

### 2. Output yang akan kita hasilkan
Setelah keputusan inti jelas, aku akan menyusun PRD lengkap dengan struktur 13 bagian standar industri (Latar belakang, Role, Fitur fungsional, Business rules, Acceptance criteria, Arsitektur ${tech}, Skema database, Backlog P0-P2, NFR, KPI, Asumsi, DoD, dan Rekomendasi).`;

  return { thought, content };
}

export function getDiscoveryDecisionsAnswerResponse(ctx: DiscoveryContext): {
  thought: string;
  content: string;
} {
  const { idea, target, platform, stage, tech, isKos } = ctx;

  const thought = `KODA AI Requirement Engine memproses jawaban Discovery Tahap 1 untuk "${idea}". Menyusun Product Discovery Tahap 2: ringkasan keputusan sementara dan pertanyaan lanjutan.`;

  if (isKos) {
    const content = `# Product Discovery Booking Kos — Tahap 2

Jawabanmu menunjukkan satu pola yang menarik: kamu memilih **satu pengelola**, tetapi juga memilih bahwa **pemilik kos mendaftar dan mengelola propertinya sendiri**, serta role yang dipilih mencakup **mahasiswa dan pemilik kos**.

Selain itu, kamu memilih **instant booking tanpa pembayaran online**. Artinya, booking ini berfungsi sebagai pemesanan langsung tanpa uang muka di platform. Kita perlu memperjelas bagaimana sistem memastikan kamar benar-benar tersedia dan tidak terjadi *double booking*.

---

### 1. Ringkasan keputusan sementara

\`\`\`discovery-summary-json
{
  "appName": "Booking Kos",
  "category": "Product Discovery — Tahap 1",
  "items": [
    { "label": "Model bisnis", "value": "Satu pengelola — platform hanya mengelola kos milik satu bisnis" },
    { "label": "Target pasar", "value": "Malang — fokus mahasiswa" },
    { "label": "Mekanisme booking", "value": "Instant booking — kamar langsung dipesan jika tersedia" },
    { "label": "Pembayaran", "value": "Tanpa pembayaran online pada MVP" },
    { "label": "Pengelolaan listing", "value": "Pemilik kos mendaftar dan mengelola kamar sendiri" },
    { "label": "Keunggulan utama", "value": "Harga murah" },
    { "label": "Role yang dipilih", "value": "Mahasiswa dan Pemilik kos" },
    { "label": "Verifikasi khusus", "value": "Tidak ada verifikasi khusus pada MVP" }
  ],
  "footer": "Stack: ${tech} · ${platform} · ${stage}"
}
\`\`\`

---

### 2. Hal penting yang masih perlu diputuskan

\`\`\`discovery-stage2-json
{
  "title": "Discovery lanjutan",
  "description": "Pilih keputusan yang sesuai dengan model bisnis yang kamu inginkan. Jawabanmu akan menjadi dasar requirement PRD.",
  "buttonText": "📋 Konfirmasi Discovery",
  "stage": 2,
  "questions": [
    {
      "id": "1",
      "title": "1. Siapa pemilik kos dalam sistem?",
      "type": "radio",
      "options": [
        "Satu bisnis mengelola kos sendiri, pemilik adalah pengelola internal.",
        "Banyak pemilik kos independen bisa mendaftar, tetapi platform tetap dikelola satu operator.",
        "Hanya satu operator; semua data kos dimasukkan oleh operator, bukan pemilik."
      ],
      "default": "Satu bisnis mengelola kos sendiri, pemilik adalah pengelola internal."
    },
    {
      "id": "2",
      "title": "2. Bagaimana ketersediaan kamar dijaga?",
      "type": "radio",
      "options": [
        "Pemilik memperbarui jumlah kamar kosong; sistem mengurangi ketersediaan ketika booking berhasil.",
        "Mahasiswa memesan instan, tetapi pemilik memperbarui status kamar secara manual.",
        "Mahasiswa memilih tanggal masuk dan sistem memeriksa ketersediaan berdasarkan periode sewa."
      ],
      "default": "Pemilik memperbarui jumlah kamar kosong; sistem mengurangi ketersediaan ketika booking berhasil."
    },
    {
      "id": "3",
      "title": "3. Periode harga dan sewa",
      "type": "radio",
      "options": [
        "Harga bulanan saja (paling umum untuk mahasiswa).",
        "Pilihan fleksibel: bulanan, per 3 bulan, per 6 bulan, tahunan.",
        "Hanya informasi harga tanpa pemilihan durasi sewa saat booking."
      ],
      "default": "Harga bulanan saja (paling umum untuk mahasiswa)."
    },
    {
      "id": "4",
      "title": "4. Apa arti instant booking tanpa online payment?",
      "type": "radio",
      "options": [
        "Kamar langsung di-hold untuk mahasiswa; mahasiswa wajib konfirmasi/bayar manual dalam batas waktu.",
        "Booking langsung tercatat dan kamar berkurang; pembayaran diselesaikan langsung saat check-in.",
        "Booking hanya mencatat data pemesan; pemilik kos tetap harus menghubungi mahasiswa sebelum kamar dianggap resmi terisi."
      ],
      "default": "Kamar langsung di-hold untuk mahasiswa; mahasiswa wajib konfirmasi/bayar manual dalam batas waktu."
    }
  ]
}
\`\`\``;
    return { thought, content };
  }

  // Dynamic Stage 2 for any non-kos idea
  const content = `# Product Discovery [${idea}] — Tahap 2

Jawabanmu menunjukkan arah produk yang jelas untuk **${idea}** dengan fokus target **${target}**.

Kita telah merangkum model operasional, mekanisme transaksi, dan pengelolaan data produk. Sekarang kita pastikan konsistensi alur transaksi dan pengelolaan stok agar tidak terjadi celah logika bisnis atau penjualan ganda.

---

### 1. Ringkasan keputusan sementara

\`\`\`discovery-summary-json
{
  "appName": "${idea}",
  "category": "Product Discovery — Tahap 1",
  "items": [
    { "label": "Model operasional", "value": "Satu pengelola — platform mandiri untuk efisiensi bisnis" },
    { "label": "Target pengguna", "value": "${target}" },
    { "label": "Mekanisme pesanan", "value": "Pesanan langsung / Instant Order sesuai stok" },
    { "label": "Sistem pembayaran", "value": "Pencatatan langsung & konfirmasi luar platform pada MVP" },
    { "label": "Pengelolaan data", "value": "Admin/Pemilik bisnis mengelola produk dan stok langsung" },
    { "label": "Tech stack & platform", "value": "${tech} · ${platform}" }
  ],
  "footer": "Stack: ${tech} · ${platform} · ${stage}"
}
\`\`\`

---

### 2. Hal penting yang masih perlu diputuskan

\`\`\`discovery-stage2-json
{
  "title": "Discovery lanjutan — ${idea}",
  "description": "Pilih keputusan yang sesuai dengan alur operasional yang kamu inginkan. Jawabanmu akan menjadi dasar requirement PRD.",
  "buttonText": "📋 Konfirmasi Discovery",
  "stage": 2,
  "questions": [
    {
      "id": "1",
      "title": "1. Pengelolaan katalog produk/layanan",
      "type": "radio",
      "options": [
        "Satu pengelola internal mengelola seluruh item dan harga.",
        "Staf operasional dapat memperbarui stok harian secara mandiri.",
        "Admin platform memoderasi setiap perubahan produk."
      ],
      "default": "Satu pengelola internal mengelola seluruh item dan harga."
    },
    {
      "id": "2",
      "title": "2. Bagaimana ketersediaan stok dijaga?",
      "type": "radio",
      "options": [
        "Stok otomatis berkurang saat pesanan dibuat dan dikunci sementara (anti-race condition).",
        "Stok baru berkurang setelah pengelola mengonfirmasi pesanan secara manual.",
        "Tanpa pelacakan stok otomatis; konfirmasi ketersediaan manual via chat."
      ],
      "default": "Stok otomatis berkurang saat pesanan dibuat dan dikunci sementara (anti-race condition)."
    },
    {
      "id": "3",
      "title": "3. Batas waktu penyelesaian pesanan",
      "type": "radio",
      "options": [
        "24 jam, lalu pesanan otomatis batal (expired) dan stok dilepaskan kembali jika belum dibayar/dikonfirmasi.",
        "Tidak ada batas waktu otomatis; pembatalan hanya dilakukan manual oleh pengelola.",
        "12 jam untuk perputaran stok cepat."
      ],
      "default": "24 jam, lalu pesanan otomatis batal (expired) dan stok dilepaskan kembali jika belum dibayar/dikonfirmasi."
    },
    {
      "id": "4",
      "title": "4. Saluran bantuan & konfirmasi",
      "type": "radio",
      "options": [
        "Tombol WhatsApp langsung dengan pesan otomatis berisi kode pesanan.",
        "Pemberitahuan via email otomatis kepada pelanggan dan pengelola.",
        "Hanya melalui halaman riwayat pesanan di website."
      ],
      "default": "Tombol WhatsApp langsung dengan pesan otomatis berisi kode pesanan."
    }
  ]
}
\`\`\``;

  return { thought, content };
}

export function getDiscoveryStage2AnswerResponse(ctx: DiscoveryContext): {
  thought: string;
  content: string;
} {
  const { idea, target, tech, isKos } = ctx;

  const thought = `KODA AI Requirement Engine menganalisis hasil Discovery Tahap 2 untuk "${idea}". Menyajikan pertanyaan final sebelum penyusunan PRD.`;

  if (isKos) {
    const content = `Baik. Sebagian besar keputusan inti Booking Kos sudah jelas. Sekarang kita selesaikan **pertanyaan logika bisnis terakhir sebelum PRD Booking Kos disusun**.

### 1. Hasil analisis konflik

\`\`\`discovery-conflict-json
{
  "title": "Hasil analisis konflik",
  "items": [
    {
      "type": "success",
      "title": "Sudah konsisten",
      "description": "Satu operator mengelola bisnis kos, harga bulanan, target mahasiswa Malang, pembayaran di luar platform, serta dashboard admin dasar."
    },
    {
      "type": "warning",
      "title": "Self-service pemilik perlu diperjelas",
      "description": "Model managed berarti pemilik merupakan pengelola internal, bukan otomatis pemilik independen yang mendaftar bebas. Kita perlu menentukan apakah akun pemilik dapat mengelola kosnya sendiri."
    },
    {
      "type": "warning",
      "title": "Instant booking tanpa pembayaran online",
      "description": "Sistem perlu menentukan kapan kamar dianggap terpesan, berapa lama kamar ditahan, dan apa yang terjadi jika mahasiswa tidak melanjutkan pembayaran langsung kepada pemilik."
    }
  ]
}
\`\`\`

### 2. Pertanyaan terakhir sebelum penyusunan PRD

\`\`\`discovery-final-json
{
  "title": "Pertanyaan terakhir sebelum penyusunan PRD",
  "isFinalStage": true,
  "buttonText": "Susun PRD Lengkap",
  "questions": [
    {
      "id": "1",
      "title": "1. Hak akses pemilik kos",
      "type": "radio",
      "options": [
        "Pemilik hanya mengelola kos yang ditugaskan kepadanya.",
        "Semua akun pemilik internal bisa mengelola seluruh kos.",
        "Hanya admin yang mengelola data kos; akun pemilik tidak diperlukan pada MVP."
      ],
      "default": "Pemilik hanya mengelola kos yang ditugaskan kepadanya."
    },
    {
      "id": "2",
      "title": "2. Kapan booking dianggap berhasil?",
      "type": "radio",
      "options": [
        "Begitu mahasiswa mengonfirmasi booking dan stok tersedia, sistem mencatat booking serta mengurangi stok.",
        "Booking menjadi permintaan sementara; pemilik harus menyetujui sebelum stok dikurangi permanen."
      ],
      "default": "Begitu mahasiswa mengonfirmasi booking dan stok tersedia, sistem mencatat booking serta mengurangi stok."
    },
    {
      "id": "3",
      "title": "3. Berapa lama kamar ditahan?",
      "type": "radio",
      "options": [
        "24 jam, lalu booking otomatis kedaluwarsa jika belum dikonfirmasi pembayarannya oleh pemilik.",
        "Tidak ada batas waktu otomatis; booking aktif sampai dibatalkan atau diselesaikan.",
        "Admin atau pemilik mengakhiri booking secara manual."
      ],
      "default": "24 jam, lalu booking otomatis kedaluwarsa jika belum dikonfirmasi pembayarannya oleh pemilik."
    },
    {
      "id": "4",
      "title": "4. Apakah mahasiswa wajib login untuk booking?",
      "type": "radio",
      "options": [
        "Ya, wajib login agar riwayat dan status booking dapat diakses.",
        "Tidak, bisa booking sebagai tamu dengan nama dan nomor WhatsApp."
      ],
      "default": "Ya, wajib login agar riwayat dan status booking dapat diakses."
    },
    {
      "id": "5",
      "title": "5. Fitur apa saja yang wajib masuk MVP?",
      "type": "checkbox",
      "options": [
        { "label": "Pencarian kos", "sublabel": "Cari berdasarkan nama atau lokasi." },
        { "label": "Filter harga dan fasilitas", "sublabel": "Filter harga bulanan dan fasilitas kamar." },
        { "label": "Detail kos", "sublabel": "Foto, alamat, harga, fasilitas, dan stok." },
        { "label": "Booking dan riwayat", "sublabel": "Buat booking dan pantau status." },
        { "label": "Dashboard pemilik dan admin", "sublabel": "Kelola kos, kamar, stok, dan booking." },
        { "label": "Kontak WhatsApp", "sublabel": "Hubungi pemilik untuk pembayaran langsung." }
      ],
      "default": [
        "Pencarian kos",
        "Filter harga dan fasilitas",
        "Detail kos",
        "Booking dan riwayat",
        "Dashboard pemilik dan admin",
        "Kontak WhatsApp"
      ]
    }
  ]
}
\`\`\`

Setelah keputusan ini dikirim, aku akan langsung menyusun dokumen PRD lengkap 13 bagian standar industri beserta tombol download PRD (.md) di akhir.`;
    return { thought, content };
  }

  // Dynamic final questions for non-kos idea
  const content = `Baik. Seluruh keputusan inti untuk **${idea}** telah tervalidasi. Sekarang kita selesaikan beberapa pertanyaan terakhir sebelum **PRD ${idea} disusun secara lengkap**.

### 1. Hasil analisis konsistensi

\`\`\`discovery-conflict-json
{
  "title": "Hasil analisis konsistensi alur",
  "items": [
    {
      "type": "success",
      "title": "Model operasional konsisten",
      "description": "Pengelolaan terpusat untuk ${idea}, target ${target}, dengan stack ${tech}."
    },
    {
      "type": "success",
      "title": "Manajemen stok terstruktur",
      "description": "Pengurangan stok atomik dengan batas penahanan waktu untuk mencegah penjualan ganda."
    },
    {
      "type": "warning",
      "title": "Konfirmasi pembayaran manual",
      "description": "Status pembayaran dipisahkan dari status pesanan agar verifikasi tetap akurat."
    }
  ]
}
\`\`\`

### 2. Pertanyaan terakhir sebelum penyusunan PRD

\`\`\`discovery-final-json
{
  "title": "Pertanyaan terakhir sebelum penyusunan PRD",
  "isFinalStage": true,
  "buttonText": "Susun PRD Lengkap",
  "questions": [
    {
      "id": "1",
      "title": "1. Hak akses staf / pengelola",
      "type": "radio",
      "options": [
        "Pengelola hanya mengelola produk dan pesanan yang ditugaskan.",
        "Semua pengelola internal bisa melihat dan mengelola seluruh transaksi.",
        "Hanya admin utama yang mengelola data; staf operasional belum dibutuhkan pada MVP."
      ],
      "default": "Semua pengelola internal bisa melihat dan mengelola seluruh transaksi."
    },
    {
      "id": "2",
      "title": "2. Kapan pesanan dianggap berhasil?",
      "type": "radio",
      "options": [
        "Begitu pelanggan mengonfirmasi pesanan dan stok tersedia, sistem mencatat pesanan serta mengurangi stok.",
        "Pesanan menjadi permintaan sementara; pengelola harus menyetujui sebelum stok dikurangi permanen."
      ],
      "default": "Begitu pelanggan mengonfirmasi pesanan dan stok tersedia, sistem mencatat pesanan serta mengurangi stok."
    },
    {
      "id": "3",
      "title": "3. Berapa lama pesanan ditahan?",
      "type": "radio",
      "options": [
        "24 jam, lalu pesanan otomatis kedaluwarsa jika belum dikonfirmasi pembayarannya oleh pengelola.",
        "Tidak ada batas waktu otomatis; pesanan aktif sampai dibatalkan atau diselesaikan secara manual."
      ],
      "default": "24 jam, lalu pesanan otomatis kedaluwarsa jika belum dikonfirmasi pembayarannya oleh pengelola."
    },
    {
      "id": "4",
      "title": "4. Apakah pelanggan wajib login untuk memesan?",
      "type": "radio",
      "options": [
        "Ya, wajib login agar riwayat dan status pesanan dapat dipantau.",
        "Tidak, bisa pesan sebagai tamu dengan mengisi nama dan nomor WhatsApp."
      ],
      "default": "Ya, wajib login agar riwayat dan status pesanan dapat dipantau."
    },
    {
      "id": "5",
      "title": "5. Fitur apa saja yang wajib masuk MVP?",
      "type": "checkbox",
      "options": [
        { "label": "Katalog produk / layanan", "sublabel": "Daftar item dengan foto, deskripsi, harga, dan stok." },
        { "label": "Pencarian dan filter", "sublabel": "Cari berdasarkan nama atau kategori." },
        { "label": "Detail produk", "sublabel": "Spesifikasi lengkap dan ketersediaan stok." },
        { "label": "Checkout dan riwayat pesanan", "sublabel": "Pemesanan instan dan status transaksi." },
        { "label": "Dashboard operasional pengelola", "sublabel": "Kelola produk, stok, dan pesanan masuk." },
        { "label": "Tombol WhatsApp bantuan", "sublabel": "Kontak langsung pengelola untuk konfirmasi pesanan." }
      ],
      "default": [
        "Katalog produk / layanan",
        "Pencarian dan filter",
        "Detail produk",
        "Checkout dan riwayat pesanan",
        "Dashboard operasional pengelola",
        "Tombol WhatsApp bantuan"
      ]
    }
  ]
}
\`\`\`

Setelah keputusan ini dikirim, aku akan langsung menyusun dokumen PRD lengkap 13 bagian standar industri beserta tombol download PRD (.md) di akhir.`;

  return { thought, content };
}

export function getDiscoveryFinalAnswerResponse(ctx: DiscoveryContext): {
  thought: string;
  content: string;
} {
  const { idea, target, tech, platform, stage, userBg, isKos } = ctx;

  const thought = `KODA AI Requirement Engine menyusun Dokumen PRD Lengkap (13 Bagian) untuk "${idea}" sesuai format standar industri.`;

  const prdMarkdown = isKos
    ? BOOKING_KOS_PRD_DOCUMENT
    : generateDynamicPrdDocument({ idea, target, tech, platform, stage, userBg });

  const content = `${prdMarkdown}

\`\`\`prd-ready-json
{
  "title": "Spesifikasi PRD Memenuhi Standar Industri",
  "appName": "${idea}",
  "summary": "Seluruh 13 bagian PRD ${idea}, diagram alur sistem, skema database relasional, dan backlog MVP telah tuntas terverifikasi.",
  "buttonText": "Download PRD (.md)"
}
\`\`\``;

  return { thought, content };
}
