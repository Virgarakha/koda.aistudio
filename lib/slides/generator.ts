import { PresentationDeck, SlideData, SlideThemeId } from "./types";

interface GenerateParams {
  topic: string;
  slideCount?: number;
  tone?: "pitch_deck" | "business_report" | "product_launch" | "education" | "technical" | string;
  theme?: SlideThemeId;
  targetAudience?: string;
}

export function generateLocalSlideDeck(params: GenerateParams): PresentationDeck {
  const {
    topic,
    slideCount = 6,
    tone = "education",
    targetAudience = "Peserta & Audiens",
  } = params;

  const deckId = `deck-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const cleanTopic = topic.trim() || "Materi Pembelajaran & Panduan";
  const lower = cleanTopic.toLowerCase();
  const now = new Date().toISOString();

  // Detect subject category to design theme and storyline appropriately
  const isCode = /php|code|coding|dev|script|python|java|html|css|sql|web|program|software|database|api/.test(lower);
  const isBusiness = /laporan|kinerja|sprint|evaluasi|sales|penjualan|keuangan|bisnis|profit|omzet|investor|pitch/.test(lower);
  const isEducation = /dasar|pemula|belajar|kuliah|mahasiswa|sekolah|edukasi|pelatihan|kursus|tutorial|materi/.test(lower);

  let chosenTheme: SlideThemeId = params.theme || "terracotta";
  if (!params.theme) {
    if (isCode) chosenTheme = "dark_cyber";
    else if (isBusiness) chosenTheme = "emerald";
    else if (isEducation) chosenTheme = "ocean_blue";
    else chosenTheme = "terracotta";
  }

  const slides: SlideData[] = [];

  if (isCode) {
    // 💻 Coding / Developer Presentation
    slides.push({
      id: `slide-${deckId}-1`,
      layout: "title",
      title: cleanTopic,
      subtitle: `Panduan Lengkap & Fundamental Pemrograman untuk ${targetAudience}`,
      badge: "KODE & TEKNOLOGI",
      footerText: `Koda Tech Studio · ${new Date().getFullYear()}`,
      speakerNotes: `Sapa ${targetAudience} dan jelaskan sasaran pembelajaran dari materi ${cleanTopic}.`,
    });

    slides.push({
      id: `slide-${deckId}-2`,
      layout: "split",
      title: "Konsep Dasar & Arsitektur",
      subtitle: `Memahami bagaimana ${cleanTopic} bekerja di balik layar`,
      badge: "ARSITEKTUR DASAR",
      bulletPoints: [
        `Prinsip kerja eksekusi program dan alur siklus hidup kode.`,
        `Perbedaan lingkungan runtime dan dependensi yang dibutuhkan.`,
        `Kelebihan ekosistem pendukung untuk mempercepat siklus pembuatan aplikasi.`,
      ],
      cards: [
        {
          id: `c-code-1`,
          title: "Runtime Environment",
          description: "Struktur eksekusi yang efisien dan mendukung skala aplikasi modern.",
          badge: "CORE ENGINE",
        },
      ],
      speakerNotes: "Jelaskan analogi sederhana agar audiens pemula mudah menangkap cara kerjanya.",
    });

    slides.push({
      id: `slide-${deckId}-3`,
      layout: "cards",
      title: "Sintaks & Aturan Penulisan",
      subtitle: "Fondasi tata bahasa pemrograman yang wajib dikuasai",
      badge: "SINTAKS DASAR",
      cards: [
        { id: `c-s-1`, title: "Struktur Tag & Deklarasi", description: "Format pembuka, penutup, dan tanda batas instruksi program.", badge: "ATURAN 01" },
        { id: `c-s-2`, title: "Variabel & Penamaan", description: "Menyimpan nilai ke dalam memori dengan aturan penamaan yang tepat.", badge: "ATURAN 02" },
        { id: `c-s-3`, title: "Komentar & Dokumentasi", description: "Membuat catatan penjelas pada kode agar mudah dipelihara.", badge: "ATURAN 03" },
      ],
      speakerNotes: "Tunjukkan contoh baris kode sederhana di slide ini.",
    });

    slides.push({
      id: `slide-${deckId}-4`,
      layout: "cards",
      title: "Tipe Data & Struktur Logika",
      subtitle: "Mengolah informasi dan mengendalikan alur eksekusi program",
      badge: "LOGIKA KONTROL",
      cards: [
        { id: `c-d-1`, title: "Tipe Data Primitif", description: "Angka (integer, float), teks (string), dan nilai kebenaran (boolean).", badge: "DATA" },
        { id: `c-d-2`, title: "Percabangan (If - Else)", description: "Membuat keputusan berdasarkan kondisi yang ditentukan.", badge: "KONTROL" },
        { id: `c-d-3`, title: "Perulangan (Looping)", description: "Mengeksekusi blok kode berulang tanpa menulis ulang secara manual.", badge: "ITERASI" },
      ],
      speakerNotes: "Tekankan pentingnya memahami logika percabangan untuk memecahkan masalah nyata.",
    });

    slides.push({
      id: `slide-${deckId}-5`,
      layout: "timeline",
      title: "Alur Pembelajaran & Latihan",
      subtitle: "Tahapan bertahap untuk menguasai materi dari awal hingga mahir",
      badge: "ROADMAP BELAJAR",
      timeline: [
        { id: `t-1`, phase: "Langkah 1", dateOrQuarter: "Hari 1-2", title: "Setup Environment", description: "Pasang editor kode dan server lokal penunjang." },
        { id: `t-2`, phase: "Langkah 2", dateOrQuarter: "Hari 3-5", title: "Praktik Kasus Sederhana", description: "Bangun program kalkulator atau pemroses form interaktif." },
        { id: `t-3`, phase: "Langkah 3", dateOrQuarter: "Pekan 2+", title: "Integrasi Database & Proyek", description: "Simpan dan ambil data dinamis untuk aplikasi utuh." },
      ],
      speakerNotes: "Berikan dorongan semangat bahwa belajar coding memerlukan latihan langsung.",
    });

    slides.push({
      id: `slide-${deckId}-6`,
      layout: "conclusion",
      title: "Rangkuman & Langkah Praktik",
      subtitle: `Siap mengeksplorasi lebih jauh dunia ${cleanTopic}`,
      badge: "KESIMPULAN",
      cards: [
        { id: `c-con-1`, title: "Mulai Tulis Kode", description: "Buka teks editor favorit Anda dan buat file pertama hari ini.", badge: "ACTION 1" },
        { id: `c-con-2`, title: "Eksplorasi Dokumentasi", description: "Manfaatkan dokumentasi resmi dan komunitas pengembang aktif.", badge: "ACTION 2" },
      ],
      footerText: "Koda AI Suite · Jangan ragu bereksperimen dengan kode Anda",
      speakerNotes: "Tutup presentasi dengan sesi tanya jawab interaktif.",
    });
  } else if (isBusiness) {
    // 📊 Business & Strategy Presentation
    slides.push({
      id: `slide-${deckId}-1`,
      layout: "title",
      title: cleanTopic,
      subtitle: `Laporan Strategis & Analisis Kinerja untuk ${targetAudience}`,
      badge: "LAPORAN EKSEKUTIF",
      footerText: `Koda Business Intelligence · ${new Date().getFullYear()}`,
      speakerNotes: `Sambut ${targetAudience} dan sampaikan ringkasan capaian utama.`,
    });

    slides.push({
      id: `slide-${deckId}-2`,
      layout: "metrics",
      title: "Metrik Kunci & Pencapaian",
      subtitle: "Indikator kinerja utama selama periode berjalan",
      badge: "KEY METRICS",
      metrics: [
        { id: `m-1`, value: "128%", label: "Pencapaian Target", detail: "Melebihi ekspektasi awal kuartal", change: "+28%" },
        { id: `m-2`, value: "94.2%", label: "Kepuasan Klien", detail: "Hasil survei umpan balik kuartalan", change: "+4.2%" },
        { id: `m-3`, value: "35%", label: "Efisiensi Biaya", detail: "Penghematan operasional terukur", change: "-15% cost" },
      ],
      speakerNotes: "Sorot angka-angka positif yang membuktikan pertumbuhan.",
    });

    slides.push({
      id: `slide-${deckId}-3`,
      layout: "cards",
      title: "Inisiatif Strategis Utama",
      subtitle: "Tiga pilar pendorong keberhasilan rencana bisnis",
      badge: "PILAR STRATEGI",
      cards: [
        { id: `c-1`, title: "Ekspansi Pasar", description: "Menjangkau segmen pelanggan baru dengan proposisi nilai terarah.", badge: "GROWTH" },
        { id: `c-2`, title: "Optimalisasi Operasi", description: "Otomasi alur kerja guna mempercepat *time-to-market*.", badge: "SPEED" },
        { id: `c-3`, title: "Retensi Pengguna", description: "Program loyalitas dan peningkatan kualitas layanan purnajual.", badge: "LOYALTY" },
      ],
      speakerNotes: "Jelaskan bagaimana ketiga pilar ini saling memperkuat.",
    });

    slides.push({
      id: `slide-${deckId}-4`,
      layout: "timeline",
      title: "Rencana Aksi & Roadmap Eksekusi",
      subtitle: "Jadwal implementasi fase lanjutan",
      badge: "TIMELINE",
      timeline: [
        { id: `t-1`, phase: "Q1", dateOrQuarter: "Bulan 1-3", title: "Konsolidasi Fondasi", description: "Penataan tim dan standarisasi sistem pelaporan." },
        { id: `t-2`, phase: "Q2", dateOrQuarter: "Bulan 4-6", title: "Peluncuran Fitur Baru", description: "Aktivasi saluran pemasaran dan integrasi produk." },
        { id: `t-3`, phase: "Q3+", dateOrQuarter: "Bulan 7+", title: "Skalabilitas Regional", description: "Pengembangan pasar ke cakupan yang lebih luas." },
      ],
      speakerNotes: "Paparkan komitmen tim terhadap batas waktu yang telah disepakati.",
    });

    slides.push({
      id: `slide-${deckId}-5`,
      layout: "conclusion",
      title: "Kesimpulan & Rekomendasi",
      subtitle: "Langkah strategis bersama pemangku kepentingan",
      badge: "NEXT STEPS",
      cards: [
        { id: `c-1`, title: "Persetujuan Rencana Anggaran", description: "Finalisasi alokasi dana untuk fase pertumbuhan berikutnya.", badge: "KEPUTUSAN" },
        { id: `c-2`, title: "Monitoring Kuartalan", description: "Evaluasi berkala setiap akhir bulan via dashboard terintegrasi.", badge: "PEMANTAUAN" },
      ],
      footerText: "Koda AI Suite · Melangkah pasti menuju target bersama",
      speakerNotes: "Buka sesi tanya jawab dan mintalah persetujuan pemangku kepentingan.",
    });
  } else {
    // 💡 General / Creative Topic Presentation
    slides.push({
      id: `slide-${deckId}-1`,
      layout: "title",
      title: cleanTopic,
      subtitle: `Eksplorasi Mendalam & Wawasan Strategis untuk ${targetAudience}`,
      badge: "PRESENTASI KODA",
      footerText: `Koda AI Studio · ${new Date().getFullYear()}`,
      speakerNotes: `Awali presentasi dengan memperkenalkan ide utama ${cleanTopic}.`,
    });

    slides.push({
      id: `slide-${deckId}-2`,
      layout: "split",
      title: "Latar Belakang & Konteks",
      subtitle: "Mengapa topik ini sangat penting untuk dibahas saat ini",
      badge: "KONTEKS PENTING",
      bulletPoints: [
        `Perkembangan pesat tren dan kebutuhan di bidang ${cleanTopic}.`,
        `Peluang besar yang dapat dioptimalkan dengan strategi yang terstruktur.`,
        `Langkah antisipasi terhadap berbagai tantangan nyata di lapangan.`,
      ],
      cards: [
        {
          id: `c-gen-1`,
          title: "Poin Krusial",
          description: "Pendekatan berbasis data meminimalisir risiko dan melipatgandakan dampak.",
          badge: "INSIGHT",
        },
      ],
      speakerNotes: "Hubungkan topik ini dengan pengalaman atau kebutuhan sehari-hari audiens.",
    });

    slides.push({
      id: `slide-${deckId}-3`,
      layout: "cards",
      title: "Pilar & Pembahasan Utama",
      subtitle: "Elemen kunci yang menyusun materi secara komprehensif",
      badge: "POIN UTAMA",
      cards: [
        { id: `c-p-1`, title: "Fondasi Awal", description: "Memahami prinsip dasar sebelum melangkah ke level lanjutan.", badge: "BAGIAN 1" },
        { id: `c-p-2`, title: "Penerapan Praktis", description: "Implementasi metode terbaik yang telah teruji efektivitasnya.", badge: "BAGIAN 2" },
        { id: `c-p-3`, title: "Evaluasi & Skalabilitas", description: "Menjaga kualitas hasil agar dapat terus berkembang secara konsisten.", badge: "BAGIAN 3" },
      ],
      speakerNotes: "Jelaskan keterkaitan antara pilar pertama, kedua, dan ketiga.",
    });

    slides.push({
      id: `slide-${deckId}-4`,
      layout: "conclusion",
      title: "Kesimpulan & Penutup",
      subtitle: "Rangkuman inti sari dan ajakan bertindak",
      badge: "PENUTUP",
      cards: [
        { id: `c-end-1`, title: "Terapkan Sekarang", description: "Ambil langkah pertama dan implementasikan wawasan yang telah dipelajari.", badge: "LANGKAH 1" },
        { id: `c-end-2`, title: "Diskusikan Bersama", description: "Buka ruang kolaborasi untuk mendiskusikan ide-ide kreatif lanjutan.", badge: "LANGKAH 2" },
      ],
      footerText: "Koda AI Suite · Solusi Cerdas untuk Presentasi Anda",
      speakerNotes: "Ucapkan terima kasih dan undang audiens untuk berdiskusi.",
    });
  }

  return {
    id: deckId,
    title: cleanTopic,
    description: `Presentasi mengenai ${cleanTopic}`,
    topic: cleanTopic,
    targetAudience,
    theme: chosenTheme,
    createdAt: now,
    updatedAt: now,
    slides,
  };
}
