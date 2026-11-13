"use client";

import { ChatMessage } from "@/lib/apps/types";

export interface PrdSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

const PRD_STORAGE_KEY = "koda_prd_sessions";

// Seed session: Booking Kos Mahasiswa Malang (Reference Industry Standard)
export const SEED_BOOKING_KOS_SESSION: PrdSession = {
  id: "session-booking-kos-seed",
  title: "Booking Kos Mahasiswa Malang (Standar Industri)",
  createdAt: new Date(Date.now() - 3600000).toISOString(),
  updatedAt: new Date(Date.now() - 3600000).toISOString(),
  messages: [
    {
      id: "seed-user-1",
      role: "user",
      content:
        "Saya ingin merancang sistem aplikasi Booking Kos Mahasiswa di Malang dengan harga terjangkau (Rp500rb - 1jt), instant booking, tanpa pembayaran online rumit, dan komunikasi via WhatsApp.",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "seed-model-1",
      role: "model",
      content: `Tentu! Ide **Booking Kos Mahasiswa** sangat potensial. Sebagai Chief Requirements Architect, saya akan memandu Anda merumuskan spesifikasi agar tidak terjadi asumsi liar, aplikasi rapuh, atau bentrok transaksi.

Tahap 1: Mari tentukan **Arsitektur Makro Sistem** dan telaah referensi desain antarmuka.

\`\`\`interview-json
{
  "title": "Pilihan Arsitektur Makro Sistem (Tahap 1)",
  "description": "Tentukan arsitektur backend dan presentation layer utama untuk platform Booking Kos:",
  "options": [
    {
      "id": "A",
      "label": "Monolithic Laravel 12 (Blade + Tailwind CSS)",
      "description": "Rekomendasi standar industri: Cepat dikembangkan, transaksional database ACID kokoh, dan satu basis kode."
    },
    {
      "id": "B",
      "label": "Decoupled Next.js 15 (Frontend) + NestJS (Backend REST/GraphQL)",
      "description": "Pemisahan ketat client-server, cocok jika tim web & mobile terpisah."
    },
    {
      "id": "C",
      "label": "Full Serverless (Next.js App Router + Supabase RLS)",
      "description": "Tanpa kelola server backend manual, mengandalkan Row-Level Security PostgreSQL."
    }
  ]
}
\`\`\`

\`\`\`designs-json
{
  "title": "Referensi Desain Antarmuka Booking Kos (Dribbble)",
  "category": "booking-property",
  "designs": [
    {
      "id": "kos-1",
      "title": "Kos & Rent Living Mobile Exploration",
      "author": "Pixel Architects",
      "imageUrl": "https://cdn.dribbble.com/userupload/11245781/file/original-d1c92a95e0c609c1fa6e2ca9c585bb24.png?format=webp&resize=1200x900",
      "likes": 284,
      "views": "4.2k",
      "tags": ["Listing Grid", "Price Badge", "Fast Search"]
    },
    {
      "id": "kos-2",
      "title": "Property Room Details & Amenity Badges",
      "author": "Vibe Studio",
      "imageUrl": "https://cdn.dribbble.com/userupload/9483210/file/original-4d3e2b10a9c8e7f6a5b4c3d2e1f0a9b8.png?format=webp&resize=1200x900",
      "likes": 412,
      "views": "6.8k",
      "tags": ["Room Photo", "WhatsApp CTA", "Instant Book"]
    },
    {
      "id": "kos-3",
      "title": "Operator Dashboard: Room Availability & Bookings",
      "author": "SaaS Foundry",
      "imageUrl": "https://cdn.dribbble.com/userupload/13498201/file/original-8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d.png?format=webp&resize=1200x900",
      "likes": 356,
      "views": "5.1k",
      "tags": ["Stock Manager", "Status 24h", "Audit Trail"]
    }
  ]
}
\`\`\``,
      createdAt: new Date(Date.now() - 3500000).toISOString(),
    },
    {
      id: "seed-user-2",
      role: "user",
      content: "A. Monolithic Laravel 12 (Blade + Tailwind CSS)",
      createdAt: new Date(Date.now() - 3400000).toISOString(),
    },
    {
      id: "seed-model-2",
      role: "model",
      content: `Pilihan yang sangat tepat. **Laravel 12** memberikan kestabilan transaksional tingkat tinggi dengan Blade + Tailwind CSS yang ringan dan accessible.

Tahap 2: Berikut adalah pemetaan **Alur Diagram Sistem (Sequence Flow)** beserta deteksi celah kritis (Missing Requirements Detector).

\`\`\`flow-json
{
  "title": "Alur Booking Instan & Mitigasi Concurrency",
  "nodes": [
    { "id": "1", "label": "Mahasiswa Login", "category": "actor", "detail": "Autentikasi role mahasiswa" },
    { "id": "2", "label": "Pilih Kos & Cek Stok", "category": "action", "detail": "Validasi listing published" },
    { "id": "3", "label": "Database Lock & Mutex", "category": "critical", "detail": "lockForUpdate() anti-double booking" },
    { "id": "4", "label": "Booking Confirmed", "category": "process", "detail": "Kurangi stok, tahan 24 jam" },
    { "id": "5", "label": "Kontak WhatsApp", "category": "action", "detail": "Pembayaran di luar platform" }
  ],
  "edges": [
    { "from": "1", "to": "2", "label": "Browse catalog" },
    { "from": "2", "to": "3", "label": "Pesan kamar" },
    { "from": "3", "to": "4", "label": "Stok berhasil dikunci" },
    { "from": "4", "to": "5", "label": "Kirim bukti transaksi" }
  ]
}
\`\`\`

\`\`\`interview-json
{
  "title": "Missing Requirements Detector: 2 Keputusan Penentu",
  "description": "Pilih mitigasi teknis untuk 2 celah kritis berikut sebelum menyusun PRD:",
  "questions": [
    {
      "id": "q1",
      "title": "1. Bagaimana mitigasi jika 2 mahasiswa menekan tombol booking untuk kamar terakhir secara bersamaan (Race Condition)?",
      "options": [
        { "id": "A", "label": "A. Database Row-Locking (DB::transaction + lockForUpdate)", "description": "Transaksi pertama sukses mengunci baris; request kedua otomatis menolak 'Kamar telah dipesan'." },
        { "id": "B", "label": "B. Antrean FIFO Redis Lock (Distributed Lock)", "description": "Request diantrekan secara berurutan dengan TTL 15 detik." },
        { "id": "C", "label": "C. Optimistic Locking (Kolom version pada database)", "description": "Jika version berubah saat commit, transaksi dibatalkan dan minta pengguna refresh." }
      ]
    },
    {
      "id": "q2",
      "title": "2. Bagaimana aturan kedaluwarsa 24 jam dan konfirmasi pembayaran manual?",
      "options": [
        { "id": "A", "label": "A. Scheduler Tiap 5 Menit: Kedaluwarsa Otomatis & Kembalikan Stok Tepat 1x", "description": "Jika belum dikonfirmasi dalam 24 jam, status jadi expired dan stok bertambah tepat satu unit secara idempoten." },
        { "id": "B", "label": "B. Pengingat WhatsApp 2 Jam Sebelum Hangus", "description": "Kirim notifikasi peringatan sebelum kamar dilepaskan ke publik." },
        { "id": "C", "label": "C. Masa Tahan 48 Jam (Fleksibilitas Tambahan untuk Mahasiswa Luar Kota)", "description": "Memberikan waktu lebih panjang untuk proses transfer perbankan." }
      ]
    }
  ]
}
\`\`\``,
      createdAt: new Date(Date.now() - 3300000).toISOString(),
    },
    {
      id: "seed-user-3",
      role: "user",
      content: "1. A (Database Row-Locking DB::transaction + lockForUpdate) dan 2. A (Scheduler Tiap 5 Menit: Kedaluwarsa Otomatis & Kembalikan Stok Tepat 1x)",
      createdAt: new Date(Date.now() - 3200000).toISOString(),
    },
    {
      id: "seed-model-3",
      role: "model",
      content: `Luar biasa! Seluruh keputusan arsitektur makro, mitigasi race condition, diagram alur, dan aturan bisnis pembayaran telah **tuntas tervalidasi memenuhi standar industri software engineering**.

Tidak ada asumsi liar yang tersisa. Sistem Anda siap dieksekusi oleh AI Coding Agent (Cursor, Devin, Claude Code) dengan kepastian bebas celah.

\`\`\`prd-ready-json
{
  "title": "Spesifikasi PRD Memenuhi Standar Industri",
  "appName": "Booking Kos Mahasiswa Malang",
  "summary": "Seluruh pertanyaan arsitektur (Laravel 12 Blade), diagram alur sequence, mitigasi concurrency lock, skema PostgreSQL DDL 3NF, dan aturan kedaluwarsa 24 jam telah terintegrasi.",
  "buttonText": "Buka & Sinkronkan ke Panel PRD Dokumen Lengkap"
}
\`\`\``,
      createdAt: new Date(Date.now() - 3100000).toISOString(),
    },
  ],
};

export function getPrdSessions(): PrdSession[] {
  if (typeof window === "undefined") return [SEED_BOOKING_KOS_SESSION];

  try {
    const raw = localStorage.getItem(PRD_STORAGE_KEY);
    if (!raw) {
      // Initialize with seed session
      localStorage.setItem(PRD_STORAGE_KEY, JSON.stringify([SEED_BOOKING_KOS_SESSION]));
      return [SEED_BOOKING_KOS_SESSION];
    }
    const list: PrdSession[] = JSON.parse(raw);
    if (!list || list.length === 0) {
      return [SEED_BOOKING_KOS_SESSION];
    }
    return list.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (e) {
    console.error("Failed to parse PRD sessions:", e);
    return [SEED_BOOKING_KOS_SESSION];
  }
}

export function getPrdSessionById(id: string): PrdSession | null {
  const sessions = getPrdSessions();
  return sessions.find((s) => s.id === id) || null;
}

export function savePrdSession(session: PrdSession): void {
  if (typeof window === "undefined") return;

  try {
    const sessions = getPrdSessions();
    const existingIndex = sessions.findIndex((s) => s.id === session.id);
    const updated: PrdSession = {
      ...session,
      updatedAt: new Date().toISOString(),
    };

    let nextSessions: PrdSession[];
    if (existingIndex >= 0) {
      nextSessions = [...sessions];
      nextSessions[existingIndex] = updated;
    } else {
      nextSessions = [updated, ...sessions];
    }

    localStorage.setItem(PRD_STORAGE_KEY, JSON.stringify(nextSessions));
  } catch (e) {
    console.error("Failed to save PRD session:", e);
  }
}

export function deletePrdSession(id: string): PrdSession[] {
  if (typeof window === "undefined") return [];

  try {
    const sessions = getPrdSessions();
    const nextSessions = sessions.filter((s) => s.id !== id);
    localStorage.setItem(PRD_STORAGE_KEY, JSON.stringify(nextSessions));
    return nextSessions;
  } catch (e) {
    console.error("Failed to delete PRD session:", e);
    return [];
  }
}
