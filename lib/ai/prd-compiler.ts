import { ChatMessage } from "@/lib/apps/types";
import { FlowJsonData } from "@/components/playground/SystemFlowDiagram";
import { DribbbleDesignBlockData } from "@/components/playground/DribbbleDesignShowcase";
import { CURATED_DRIBBLE_DESIGNS, categorizeTopic } from "@/lib/ai/dribbble";
import { BOOKING_KOS_PRD_DOCUMENT } from "@/lib/ai/booking-kos-prd";
import { generateDynamicPrdDocument } from "@/lib/ai/dynamic-prd";

export interface CompiledPrdData {
  appName: string;
  architectureSummary: string;
  chosenOptions: string[];
  flowchartData: FlowJsonData | null;
  dribbbleDesigns: DribbbleDesignBlockData | null;
  databaseSchemaSql: string;
  readmeMarkdown: string;
  agentPrompt: string;
}

export type AppDomain =
  | "travel_chatbot"
  | "general_chatbot"
  | "travel_tour"
  | "hotel"
  | "kos"
  | "pos"
  | "tiket"
  | "logistik"
  | "general";

export interface AppMetadata {
  appName: string;
  domain: AppDomain;
  targetUser: string;
}

/**
 * Strips conversational pleasantries and filler phrases to extract a clean app title.
 * E.g.: "aku mau bikin chatbot untuk bisnis travel ku" -> "Chatbot Bisnis Travel"
 */
export function extractCleanTitle(raw: string, fallback: string = "Sistem Aplikasi"): string {
  if (!raw || !raw.trim()) return fallback;

  let clean = raw.trim();

  // Strip conversational prefixes
  clean = clean
    .replace(
      /^(?:halo\s+|hai\s+|hi\s+|ai\s+|koda\s+)?(?:aku\s+mau\s+(?:bikin|buat)|aku\s+ingin\s+(?:membuat|merancang|bikin|buat)|saya\s+mau\s+(?:bikin|buat)|saya\s+ingin\s+(?:membuat|merancang|bikin|buat)|tolong\s+(?:buatkan|bikin|buat|rancang|desain)|buatkan(?:\s+saya)?|bikin(?:\s+saya)?|buat|rancang|desain|create(?:\s+a)?|build(?:\s+a)?|i\s+want\s+to\s+(?:build|create))\s+/i,
      ""
    )
    .trim();

  // Strip leading punctuation or symbols
  clean = clean.replace(/^[^\w\s]+/, "").trim();

  // Cut off at first sentence break
  clean = clean.split(/[.\n?!,;]/)[0].trim();

  // Strip trailing possessives / pronouns
  clean = clean.replace(/\s+(?:ku|saya|kami|kita|mu|anda)$/i, "").trim();

  // Strip leading generic qualifiers
  clean = clean.replace(/^(?:sebuah|suatu|seperti)\s+/i, "").trim();

  // Clean extra spaces
  clean = clean.replace(/\s+/g, " ").trim();

  if (!clean || clean.length < 3) return fallback;

  // Title-case words nicely
  const conjunctions = new Set([
    "dan", "untuk", "di", "ke", "dari", "yang", "pada", "atau", "dengan",
    "for", "and", "in", "to", "of", "with", "the"
  ]);

  const words = clean.split(" ");
  const formatted = words
    .map((w, idx) => {
      const lw = w.toLowerCase();
      if (idx > 0 && conjunctions.has(lw)) return lw;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");

  return formatted || fallback;
}

/**
 * Extracts app domain and metadata strictly from USER prompts (never assistant prompts).
 */
export function extractAppDomainAndMetadata(
  userTexts: string[],
  fallbackTitle: string = "Sistem Aplikasi"
): AppMetadata {
  // Find the first substantial user message
  let primaryPrompt = "";
  for (const text of userTexts) {
    const trimmed = text.trim();
    if (
      trimmed.length >= 6 &&
      !/^(halo|hai|hi|selamat\s+(?:pagi|siang|sore|malam)|assalamu['a]?laikum|p)\b/i.test(trimmed)
    ) {
      primaryPrompt = trimmed;
      break;
    }
  }

  if (!primaryPrompt && userTexts.length > 0) {
    primaryPrompt = userTexts[0].trim();
  }

  const cleanTitle = extractCleanTitle(primaryPrompt || fallbackTitle, fallbackTitle);
  const userCombined = (userTexts.join(" ") + " " + (primaryPrompt || fallbackTitle))
    .toLowerCase()
    .replace(/\bongkos\b/gi, "");

  const hasChatbot = /\b(chatbot|chat\s+bot|bot\s+wa|bot\s+whatsapp|bot|virtual\s+assistant|ai\s+assistant|agen\s+ai)\b/i.test(
    userCombined
  );
  const hasTravel = /\b(travel|tour|wisata|trip|itinerary|liburan|biro\s+perjalanan|agen\s+wisata|paket\s+tour)\b/i.test(
    userCombined
  );
  const hasHotel = /\b(hotel|resort|villa|hostel|penginapan|kamar\s+hotel|booking\s+hotel)\b/i.test(
    userCombined
  );
  const hasKos = /\b(booking\s+kos|sewa\s+kos|indekos|kamar\s+kos|kos\s+putra|kos\s+putri|kost|anak\s+kos)\b/i.test(
    userCombined
  );
  const hasPos = /\b(pos|kasir|point\s+of\s+sale|toko\s+kelontong|minimarket|sembako|retail|supermarket|warung)\b/i.test(
    userCombined
  );
  // STRICT: Only detect concert tickets when specifically requested (never for travel or general tickets)
  const hasConcertTickets = /\b(war\s+tiket|tiket\s+konser|ticket\s+konser|konser\s+musik|tiket\s+event|flash\s+sale\s+tiket)\b/i.test(
    userCombined
  );
  const hasLogistik = /\b(logistik|kargo|ekspedisi|truk|armada|kurir|pengiriman\s+barang)\b/i.test(
    userCombined
  );

  let domain: AppDomain = "general";
  let targetUser = "Pengguna Utama & Pengelola Sistem";
  let appName = cleanTitle;

  if (hasChatbot && hasTravel) {
    domain = "travel_chatbot";
    targetUser = "Calon Wisatawan & Pelanggan Bisnis Travel";
    if (appName === "Sistem Aplikasi" || appName.length < 5) {
      appName = "Chatbot Bisnis Travel";
    }
  } else if (hasChatbot) {
    domain = "general_chatbot";
    targetUser = "Pelanggan & Tim Customer Service";
    if (appName === "Sistem Aplikasi" || appName.length < 5) {
      appName = "AI Chatbot Customer Support";
    }
  } else if (hasTravel) {
    domain = "travel_tour";
    targetUser = "Wisatawan & Pelanggan Tour Travel";
    if (appName === "Sistem Aplikasi" || appName.length < 5) {
      appName = "Platform Tour & Travel Wisata";
    }
  } else if (hasHotel) {
    domain = "hotel";
    targetUser = "Tamu Hotel & Traveler";
    if (appName === "Sistem Aplikasi" || appName.length < 5) {
      appName = "Booking Hotel & Resort";
    }
  } else if (hasKos) {
    domain = "kos";
    targetUser = "Mahasiswa & Pencari Kos";
    if (appName === "Sistem Aplikasi" || appName.length < 5) {
      appName = "Booking Kos Mahasiswa Malang";
    }
  } else if (hasPos) {
    domain = "pos";
    targetUser = "Kasir & Pemilik Toko";
    if (appName === "Sistem Aplikasi" || appName.length < 5) {
      appName = "Aplikasi Kasir POS Multi-Outlet";
    }
  } else if (hasConcertTickets) {
    domain = "tiket";
    targetUser = "Penonton Konser & Pengunjung Event";
    if (appName === "Sistem Aplikasi" || appName.length < 5) {
      appName = "Flash Sale & War Tiket Konser";
    }
  } else if (hasLogistik) {
    domain = "logistik";
    targetUser = "Pengirim Kargo & Mitra Armada";
    if (appName === "Sistem Aplikasi" || appName.length < 5) {
      appName = "Marketplace Kargo & Logistik Escrow";
    }
  } else {
    domain = "general";
    if (userCombined.includes("klinik") || userCombined.includes("dokter")) {
      targetUser = "Pasien & Tenaga Medis / Pengelola Klinik";
    } else if (userCombined.includes("sekolah") || userCombined.includes("kursus")) {
      targetUser = "Siswa / Mahasiswa & Pengajar";
    } else if (userCombined.includes("resto") || userCombined.includes("makanan")) {
      targetUser = "Pelanggan Resto & Staf Operasional";
    } else if (userCombined.includes("laundry")) {
      targetUser = "Pelanggan Laundry & Pemilik Usaha";
    }
  }

  return { appName, domain, targetUser };
}

export function compilePrdFromMessages(
  messages: ChatMessage[],
  fallbackTitle: string = "Sistem Aplikasi Modern"
): CompiledPrdData {
  const chosenOptions: string[] = [];
  let flowchartData: FlowJsonData | null = null;
  let dribbbleDesigns: DribbbleDesignBlockData | null = null;
  const allAssistantTexts: string[] = [];
  const allUserTexts: string[] = [];

  // 1. Traverse all messages in conversation history
  for (const m of messages) {
    if (m.role === "user") {
      allUserTexts.push(m.content);
      if (
        /^[A-C]\.\s+/i.test(m.content) ||
        m.content.includes("1.") ||
        m.content.includes("2.") ||
        m.content.includes("keputusan")
      ) {
        chosenOptions.push(m.content);
      }
    } else if (m.role === "model") {
      allAssistantTexts.push(m.content);

      // Extract flow-json if present
      const flowMatch = m.content.match(/```(?:flow-json|sequence-flow)\s*([\s\S]*?)```/);
      if (flowMatch) {
        try {
          const parsed = JSON.parse(flowMatch[1]);
          if (parsed.nodes && parsed.edges) {
            flowchartData = parsed as FlowJsonData;
          }
        } catch {}
      }

      // Extract designs-json if present
      const designMatch = m.content.match(/```(?:designs-json|dribbble-json)\s*([\s\S]*?)```/);
      if (designMatch) {
        try {
          const parsed = JSON.parse(designMatch[1]);
          if (parsed.designs && Array.isArray(parsed.designs)) {
            dribbbleDesigns = parsed as DribbbleDesignBlockData;
          }
        } catch {}
      }
    }
  }

  // 2. Extract app domain and metadata strictly from USER prompts (NEVER assistant prompts)
  const meta = extractAppDomainAndMetadata(allUserTexts, fallbackTitle);
  const { appName, domain, targetUser } = meta;

  // 3. Ensure Dribbble designs fallback if not in chat
  if (!dribbbleDesigns || !dribbbleDesigns.designs || dribbbleDesigns.designs.length === 0) {
    const topicMeta = categorizeTopic(appName);
    const fallbacks = CURATED_DRIBBLE_DESIGNS[topicMeta.category] || CURATED_DRIBBLE_DESIGNS.default;
    dribbbleDesigns = {
      title: `Inspirasi Desain Antarmuka ${appName} (Dribbble)`,
      designs: fallbacks.slice(0, 3),
    };
  }

  // 4. Ensure Flowchart fallback tailored to the actual domain if not in chat
  if (!flowchartData) {
    switch (domain) {
      case "travel_chatbot":
        flowchartData = {
          title: "Alur Chatbot Bisnis Travel (NLU Intent, Kuota Paket Tour & Reservasi Instan)",
          nodes: [
            {
              id: "1",
              label: "Pelanggan Kirim Pesan (WhatsApp / Web)",
              category: "actor",
              detail: "Inisiasi chat tanya paket tour, destinasi, atau tanggal liburan",
            },
            {
              id: "2",
              label: "AI NLU Intent & Entity Recognition",
              category: "action",
              detail: "Ekstraksi intent (paket tour, cek kuota seat, booking, atau FAQ)",
            },
            {
              id: "3",
              label: "Cek Kuota Paket & Concurrency Lock",
              category: "critical",
              detail: "Validasi seat keberangkatan & hold kuota sementara, cegah overbooking",
            },
            {
              id: "4",
              label: "Instant Booking & Payment Link",
              category: "process",
              detail: "Kirim invoice ringkasan pesanan & tautan payment gateway otomatis",
            },
            {
              id: "5",
              label: "E-Itinerary PDF & Handover ke CS",
              category: "action",
              detail: "Kirim itinerary otomatis ke WhatsApp; eskalasi ke human CS jika ada custom request",
            },
          ],
          edges: [
            { from: "1", to: "2" },
            { from: "2", to: "3" },
            { from: "3", to: "4" },
            { from: "4", to: "5" },
          ],
        };
        break;

      case "general_chatbot":
        flowchartData = {
          title: "Alur Interaksi AI Chatbot & Eskalasi Customer Support",
          nodes: [
            {
              id: "1",
              label: "Pelanggan Mulai Obrolan",
              category: "actor",
              detail: "Kirim pertanyaan atau keluhan via chat widget / WhatsApp",
            },
            {
              id: "2",
              label: "NLU Intent & Entity Recognition",
              category: "action",
              detail: "Klasifikasi kategori keluhan, akun, atau nomor order",
            },
            {
              id: "3",
              label: "Knowledge Base & RAG Query",
              category: "process",
              detail: "Pencarian jawaban terverifikasi dari dokumentasi bisnis",
            },
            {
              id: "4",
              label: "AI Resolution / Automated Action",
              category: "critical",
              detail: "Kirim solusi instan atau eksekusi aksi API",
            },
            {
              id: "5",
              label: "Human Agent Handover & Ticket Sync",
              category: "action",
              detail: "Transfer ke CS manusia jika intent butuh verifikasi manual",
            },
          ],
          edges: [
            { from: "1", to: "2" },
            { from: "2", to: "3" },
            { from: "3", to: "4" },
            { from: "4", to: "5" },
          ],
        };
        break;

      case "travel_tour":
        flowchartData = {
          title: "Alur Pemesanan Paket Tour & Travel",
          nodes: [
            {
              id: "1",
              label: "Wisatawan Cari & Filter Paket Tour",
              category: "actor",
              detail: "Pilih destinasi wisata, tanggal keberangkatan, dan durasi",
            },
            {
              id: "2",
              label: "Pilih Paket & Input Data Peserta",
              category: "action",
              detail: "Isi nama peserta, nomor paspor/KTP, dan kontak darurat",
            },
            {
              id: "3",
              label: "Lock Kuota Seat Tour (Mutex DB Lock)",
              category: "critical",
              detail: "Kunci kuota rombongan sementara, cegah overbooking",
            },
            {
              id: "4",
              label: "Payment Gateway & Verifikasi Webhook",
              category: "process",
              detail: "Bayar uang muka (DP) atau lunas via VA / QRIS",
            },
            {
              id: "5",
              label: "Penerbitan E-Voucher & Itinerary Tour",
              category: "action",
              detail: "Kirim bukti booking dan panduan tour via email/WA",
            },
          ],
          edges: [
            { from: "1", to: "2" },
            { from: "2", to: "3" },
            { from: "3", to: "4" },
            { from: "4", to: "5" },
          ],
        };
        break;

      case "hotel":
        flowchartData = {
          title: "Alur Reservasi & Booking Hotel (Instant Booking & Room Concurrency Lock)",
          nodes: [
            {
              id: "1",
              label: "Tamu Cari & Filter Hotel",
              category: "actor",
              detail: "Filter kota, bintang, fasilitas & tanggal inap",
            },
            {
              id: "2",
              label: "Pilih Tipe Kamar & Reservasi",
              category: "action",
              detail: "Pilih kamar & masukkan data tamu",
            },
            {
              id: "3",
              label: "Locking Kamar (DB Row Lock & Mutex)",
              category: "critical",
              detail: "Kunci ketersediaan kamar, cegah double-booking",
            },
            {
              id: "4",
              label: "Payment Gateway / Konfirmasi",
              category: "process",
              detail: "Verifikasi pembayaran & generate booking voucher",
            },
            {
              id: "5",
              label: "Front Office Check-in & Kunci Kamar",
              category: "action",
              detail: "Check-in tamu & penerbitan kartu akses",
            },
          ],
          edges: [
            { from: "1", to: "2" },
            { from: "2", to: "3" },
            { from: "3", to: "4" },
            { from: "4", to: "5" },
          ],
        };
        break;

      case "kos":
        flowchartData = {
          title: "Alur Booking Kamar Kos (Instant Booking & WhatsApp Confirmation)",
          nodes: [
            {
              id: "1",
              label: "Mahasiswa Cari Kos (Filter Malang)",
              category: "actor",
              detail: "Filter harga bulanan & fasilitas kamar",
            },
            {
              id: "2",
              label: "Pilih Kamar & Klik Instant Booking",
              category: "action",
              detail: "Mahasiswa login & ajukan booking",
            },
            {
              id: "3",
              label: "Locking Kamar (DB Row Lock)",
              category: "critical",
              detail: "Kamar di-hold 24 jam, cegah double booking",
            },
            {
              id: "4",
              label: "Generate Booking ID & Link WhatsApp",
              category: "process",
              detail: "Mahasiswa menerima instruksi bayar manual & WA pemilik",
            },
            {
              id: "5",
              label: "Pemilik Verifikasi Bayar & Serah Kunci",
              category: "action",
              detail: "Status booking berubah jadi Confirmed / Aktif",
            },
          ],
          edges: [
            { from: "1", to: "2" },
            { from: "2", to: "3" },
            { from: "3", to: "4" },
            { from: "4", to: "5" },
          ],
        };
        break;

      case "pos":
        flowchartData = {
          title: "Alur Transaksi POS Kasir (Offline-First & Atomic Stock Deduction)",
          nodes: [
            {
              id: "1",
              label: "Kasir Buka Shift & Scan Produk",
              category: "actor",
              detail: "Pindai barcode item & input quantity",
            },
            {
              id: "2",
              label: "Keranjang & Kalkulasi Pajak/Diskon",
              category: "action",
              detail: "Hitung total belanja & promo aktif",
            },
            {
              id: "3",
              label: "Atomic Stock Deduction (SQLite/DB Lock)",
              category: "critical",
              detail: "Potong inventori lokal & cegah stok minus",
            },
            {
              id: "4",
              label: "Proses Pembayaran (Tunai / QRIS)",
              category: "process",
              detail: "Validasi nominal & cetak struk thermal",
            },
            {
              id: "5",
              label: "Sync Background ke Cloud Server",
              category: "action",
              detail: "Sinkronisasi laporan shift & mutasi laba rugi",
            },
          ],
          edges: [
            { from: "1", to: "2" },
            { from: "2", to: "3" },
            { from: "3", to: "4" },
            { from: "4", to: "5" },
          ],
        };
        break;

      case "tiket":
        flowchartData = {
          title: "Alur War Tiket Konser (Virtual Queue & Redis Distributed Lock)",
          nodes: [
            {
              id: "1",
              label: "Pengguna Masuk Waiting Room (FIFO Queue)",
              category: "actor",
              detail: "Manajemen antrean lonjakan traffic",
            },
            {
              id: "2",
              label: "Pilih Kategori Tiket & Kursi",
              category: "action",
              detail: "Batas waktu pemilihan 3 menit",
            },
            {
              id: "3",
              label: "Redis Distributed Lock (Hold 15 Menit)",
              category: "critical",
              detail: "Kunci kursi, cegah bot scalper & bentrok",
            },
            {
              id: "4",
              label: "Payment Gateway Webhook Verification",
              category: "process",
              detail: "Validasi transfer / e-wallet secara atomik",
            },
            {
              id: "5",
              label: "Terbitkan E-Ticket QR Code Anti-Screenshot",
              category: "action",
              detail: "Kirim tiket digital dengan dynamic QR",
            },
          ],
          edges: [
            { from: "1", to: "2" },
            { from: "2", to: "3" },
            { from: "3", to: "4" },
            { from: "4", to: "5" },
          ],
        };
        break;

      case "logistik":
        flowchartData = {
          title: "Alur Marketplace Logistik & Escrow Delivery",
          nodes: [
            {
              id: "1",
              label: "Pengirim Input Detail Muatan & Rute",
              category: "actor",
              detail: "Lokasi muat, bongkar, tonase, dan jenis armada",
            },
            {
              id: "2",
              label: "Matching Mitra Armada & Penawaran",
              category: "action",
              detail: "Pilih transporter berdasarkan tarif dan reputasi",
            },
            {
              id: "3",
              label: "Escrow Payment Deposit (Saldo Ditahan)",
              category: "critical",
              detail: "Dana ditahan sistem hingga barang sampai di tujuan",
            },
            {
              id: "4",
              label: "Armada Menjemput & Live GPS Tracking",
              category: "process",
              detail: "Pelacakan rute armada secara real-time",
            },
            {
              id: "5",
              label: "Penerima Konfirmasi POD & Rilis Dana",
              category: "action",
              detail: "Foto bukti serah terima (POD) & saldo dicairkan ke mitra",
            },
          ],
          edges: [
            { from: "1", to: "2" },
            { from: "2", to: "3" },
            { from: "3", to: "4" },
            { from: "4", to: "5" },
          ],
        };
        break;

      default:
        flowchartData = {
          title: `Alur Transaksi & Validasi Sistem ${appName}`,
          nodes: [
            {
              id: "1",
              label: `Pengguna Telusuri Layanan ${appName}`,
              category: "actor",
              detail: "Autentikasi & pemilihan item atau layanan",
            },
            {
              id: "2",
              label: "Konfirmasi Pesanan & Input Parameter",
              category: "action",
              detail: "Validasi formulir dan verifikasi data",
            },
            {
              id: "3",
              label: "Transaksional Lock & Atomic Mutex",
              category: "critical",
              detail: "Mencegah race condition & data ganda pada database",
            },
            {
              id: "4",
              label: "Verifikasi Status & Notifikasi Real-time",
              category: "process",
              detail: "Pencatatan status & penerbitan nomor referensi",
            },
            {
              id: "5",
              label: "Penyelesaian Transaksi & Audit Trail",
              category: "action",
              detail: "Layanan selesai & tercatat pada riwayat audit sistem",
            },
          ],
          edges: [
            { from: "1", to: "2" },
            { from: "2", to: "3" },
            { from: "3", to: "4" },
            { from: "4", to: "5" },
          ],
        };
        break;
    }
  }

  // Architecture summary & choices
  const architectureChoice = "Monolithic Laravel 12 Architecture (Blade + Tailwind CSS + PostgreSQL/MySQL)";
  const operationalChoices = "Single Operator · Instant Concurrency Lock · ACID Compliant · Audit Trail";

  // Build high-standard Database Schema DDL tailored to the domain
  let databaseSchemaSql = "";

  if (domain === "travel_chatbot") {
    databaseSchemaSql = `-- ==========================================================
-- DATABASE SCHEMA: ${appName} (Laravel 12 Standard)
-- Engine: PostgreSQL 15+ / MySQL 8.0+
-- Generated by KODA AI Requirement Architect
-- ==========================================================

-- 1. Users Table (Role-Based Access Control)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'customer', -- 'customer', 'travel_agent', 'admin'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Chat Sessions Table (Channel & Handover Tracking)
CREATE TABLE chat_sessions (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    channel VARCHAR(50) NOT NULL DEFAULT 'whatsapp', -- 'whatsapp', 'web_widget', 'telegram'
    external_sender_id VARCHAR(100) NOT NULL, -- WhatsApp phone number or session token
    assigned_agent_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'bot_active', -- 'bot_active', 'waiting_human', 'agent_handling', 'closed'
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Chat Messages Table (Intent & Conversation History)
CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender_role VARCHAR(50) NOT NULL, -- 'customer', 'bot', 'human_agent'
    message_text TEXT NOT NULL,
    detected_intent VARCHAR(100), -- 'ask_package', 'check_quota', 'book_tour', 'payment_status', 'complaint'
    confidence_score NUMERIC(5, 4),
    payload JSONB DEFAULT '{}'::jsonb, -- structured data like package_id or date queried
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Travel Packages Table (Destinations & Seat Quota)
CREATE TABLE travel_packages (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    destination VARCHAR(150) NOT NULL,
    duration_days INT NOT NULL DEFAULT 3,
    base_price NUMERIC(12, 2) NOT NULL,
    total_quota INT NOT NULL DEFAULT 20,
    available_quota INT NOT NULL DEFAULT 20,
    itinerary_details JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'published', -- 'draft', 'published', 'sold_out'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bookings Table (Pessimistic Lock & Concurrency Shield)
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    booking_code VARCHAR(50) UNIQUE NOT NULL,
    session_id BIGINT REFERENCES chat_sessions(id) ON DELETE SET NULL,
    customer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    package_id BIGINT NOT NULL REFERENCES travel_packages(id) ON DELETE CASCADE,
    departure_date DATE NOT NULL,
    pax_count INT NOT NULL DEFAULT 1,
    total_amount NUMERIC(12, 2) NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'expired', 'refunded'
    booking_status VARCHAR(50) NOT NULL DEFAULT 'confirmed', -- 'confirmed', 'completed', 'cancelled'
    payment_link_url TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Booking Status Logs (Audit Trail)
CREATE TABLE booking_status_logs (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    actor_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Fast Chat Lookups & Seat Locks
CREATE INDEX idx_chat_sessions_sender ON chat_sessions(external_sender_id, status);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id, created_at);
CREATE INDEX idx_travel_packages_dest ON travel_packages(destination, status);
CREATE INDEX idx_bookings_code ON bookings(booking_code);
CREATE INDEX idx_bookings_departure ON bookings(package_id, departure_date);`;
  } else if (domain === "general_chatbot") {
    databaseSchemaSql = `-- ==========================================================
-- DATABASE SCHEMA: ${appName} (Laravel 12 Standard)
-- Engine: PostgreSQL 15+ / MySQL 8.0+
-- Generated by KODA AI Requirement Architect
-- ==========================================================

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'customer', -- 'customer', 'agent', 'supervisor'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    channel VARCHAR(50) NOT NULL DEFAULT 'web_widget',
    status VARCHAR(50) NOT NULL DEFAULT 'bot_active',
    assigned_agent_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender_role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    intent VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE knowledge_base_articles (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE support_tickets (
    id BIGSERIAL PRIMARY KEY,
    ticket_code VARCHAR(50) UNIQUE NOT NULL,
    session_id BIGINT REFERENCES chat_sessions(id) ON DELETE SET NULL,
    customer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    priority VARCHAR(50) NOT NULL DEFAULT 'medium',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_session ON chat_messages(session_id);
CREATE INDEX idx_tickets_status ON support_tickets(status);`;
  } else if (domain === "hotel") {
    databaseSchemaSql = `-- ==========================================================
-- DATABASE SCHEMA: Booking Hotel & Resort (Laravel 12 Standard)
-- Engine: PostgreSQL 15+ / MySQL 8.0+
-- Generated by KODA AI Requirement Architect
-- ==========================================================

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'guest', -- 'guest', 'receptionist', 'admin'
    phone VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hotels (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    star_rating INT NOT NULL DEFAULT 3,
    status VARCHAR(50) NOT NULL DEFAULT 'published',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE room_types (
    id BIGSERIAL PRIMARY KEY,
    hotel_id BIGINT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    price_per_night NUMERIC(12, 2) NOT NULL,
    capacity INT NOT NULL DEFAULT 2,
    total_rooms INT NOT NULL DEFAULT 10,
    available_rooms INT NOT NULL DEFAULT 10,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    booking_code VARCHAR(50) UNIQUE NOT NULL,
    guest_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hotel_id BIGINT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_type_id BIGINT NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_nights INT NOT NULL DEFAULT 1,
    price_snapshot NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    booked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE booking_status_logs (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    actor_id BIGINT NOT NULL REFERENCES users(id),
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hotels_city ON hotels(city, status);
CREATE INDEX idx_room_types_hotel ON room_types(hotel_id);
CREATE INDEX idx_bookings_dates ON bookings(hotel_id, check_in_date, check_out_date);
CREATE INDEX idx_bookings_status ON bookings(status, payment_status);`;
  } else if (domain === "kos") {
    databaseSchemaSql = `-- ==========================================================
-- DATABASE SCHEMA: Booking Kos Mahasiswa Malang (Laravel 12 Standard)
-- Engine: PostgreSQL 15+ / MySQL 8.0+
-- Generated by KODA AI Requirement Architect
-- ==========================================================

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student',
    phone VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE kos (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Malang',
    monthly_price NUMERIC(12, 2) NOT NULL,
    total_rooms INT NOT NULL DEFAULT 1,
    available_rooms INT NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    booking_code VARCHAR(50) UNIQUE NOT NULL,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kos_id BIGINT NOT NULL REFERENCES kos(id) ON DELETE CASCADE,
    monthly_price_snapshot NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'unconfirmed',
    booked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE booking_status_logs (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    actor_id BIGINT NOT NULL REFERENCES users(id),
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kos_status_city ON kos(status, city);
CREATE INDEX idx_bookings_student ON bookings(student_id);`;
  } else if (domain === "pos") {
    databaseSchemaSql = `-- ==========================================================
-- DATABASE SCHEMA: Aplikasi Kasir POS Multi-Outlet (Laravel 12 Standard)
-- Engine: PostgreSQL 15+ / MySQL 8.0+
-- Generated by KODA AI Requirement Architect
-- ==========================================================

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'cashier', -- 'cashier', 'store_manager', 'owner'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE outlets (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    outlet_id BIGINT NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
    barcode VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    cost_price NUMERIC(12, 2) NOT NULL,
    selling_price NUMERIC(12, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    outlet_id BIGINT NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
    cashier_id BIGINT NOT NULL REFERENCES users(id),
    total_amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cash', -- 'cash', 'qris', 'debit'
    status VARCHAR(50) NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity INT NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL
);

CREATE TABLE stock_mutations (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'sale', 'restock', 'adjustment'
    quantity_change INT NOT NULL,
    balance_after INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_barcode ON products(outlet_id, barcode);
CREATE INDEX idx_orders_outlet ON orders(outlet_id, created_at);`;
  } else if (domain === "tiket") {
    databaseSchemaSql = `-- ==========================================================
-- DATABASE SCHEMA: Flash Sale & War Tiket Konser (Laravel 12 Standard)
-- Engine: PostgreSQL 15+ / MySQL 8.0+
-- Generated by KODA AI Requirement Architect
-- ==========================================================

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30) NOT NULL,
    password VARCHAR(255) NOT NULL,
    id_card_number VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'attendee',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    venue VARCHAR(255) NOT NULL,
    event_date TIMESTAMP NOT NULL,
    sale_start_at TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'published',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ticket_categories (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    max_per_transaction INT NOT NULL DEFAULT 2,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ticket_holds (
    id BIGSERIAL PRIMARY KEY,
    hold_token VARCHAR(100) UNIQUE NOT NULL,
    category_id BIGINT NOT NULL REFERENCES ticket_categories(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    expires_at TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'holding',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    total_amount NUMERIC(12, 2) NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tickets_category ON ticket_categories(event_id);
CREATE INDEX idx_holds_token ON ticket_holds(hold_token, status, expires_at);
CREATE INDEX idx_orders_code ON orders(order_code);`;
  } else {
    // Dynamic schema matching the custom appName
    databaseSchemaSql = `-- ==========================================================
-- DATABASE SCHEMA: ${appName} (Laravel 12 Standard)
-- Engine: PostgreSQL 15+ / MySQL 8.0+
-- Generated by KODA AI Requirement Architect
-- ==========================================================

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'user', 'operator', 'admin'
    phone VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE core_entities (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_id BIGINT REFERENCES core_entities(id) ON DELETE SET NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    actor_id BIGINT NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);`;
  }

  // 7. Check if assistant already generated a complete 13-section PRD in chat
  let readmeMarkdown = "";
  for (const text of allAssistantTexts) {
    if (text.includes("## 1. Latar belakang") && (text.includes("## 2. Pengguna") || text.includes("## 3. Fitur"))) {
      const prdStart = text.indexOf("# Product Requirements Document") !== -1
        ? text.indexOf("# Product Requirements Document")
        : text.indexOf("## 1. Latar belakang");
      if (prdStart !== -1) {
        readmeMarkdown = text.slice(prdStart).trim();
        break;
      }
    }
  }

  // If not in chat, generate dynamic 13-section PRD
  if (!readmeMarkdown) {
    if (domain === "kos") {
      readmeMarkdown = BOOKING_KOS_PRD_DOCUMENT;
    } else {
      readmeMarkdown = generateDynamicPrdDocument({
        idea: appName,
        target: targetUser,
        tech: "Laravel 12 / Modern Stack",
        platform: "Web Application",
      });
    }
  }

  const agentPrompt = `Tolong bangun aplikasi "${appName}" menggunakan Laravel 12, Blade, Tailwind CSS, dan PostgreSQL/MySQL.
Target Pengguna: ${targetUser}.
Gunakan skema database dan aturan PRD berikut:
- Arsitektur: ${architectureChoice}
- Keputusan Operasional: ${operationalChoices}
- Terapkan RBAC, Audit Log, dan Locking anti-race condition.
- Implementasikan 13 bagian PRD standar industri.`;

  return {
    appName,
    architectureSummary: architectureChoice,
    chosenOptions,
    flowchartData,
    dribbbleDesigns,
    databaseSchemaSql,
    readmeMarkdown,
    agentPrompt,
  };
}
