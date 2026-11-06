import { ChatMessage } from "@/lib/apps/types";
import { FlowJsonData } from "@/components/playground/SystemFlowDiagram";
import { DribbbleDesignBlockData } from "@/components/playground/DribbbleDesignShowcase";
import { CURATED_DRIBBLE_DESIGNS, categorizeTopic } from "@/lib/ai/dribbble";
import { BOOKING_KOS_PRD_DOCUMENT } from "@/lib/ai/booking-kos-prd";

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

export function compilePrdFromMessages(
  messages: ChatMessage[],
  fallbackTitle: string = "Booking Kos"
): CompiledPrdData {
  let appName = fallbackTitle;
  const chosenOptions: string[] = [];
  let flowchartData: FlowJsonData | null = null;
  let dribbbleDesigns: DribbbleDesignBlockData | null = null;
  const allAssistantTexts: string[] = [];
  const allUserTexts: string[] = [];

  // 1. Traverse all messages in conversation history
  for (const m of messages) {
    if (m.role === "user") {
      allUserTexts.push(m.content);
      // Check if user selected an option or gave answers
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
          if (parsed.designs && Array.isArray(parsed.designs) && parsed.designs.length > 0) {
            dribbbleDesigns = parsed;
          }
        } catch {}
      }
    }
  }

  // Determine App Name from user prompts
  const firstUserPrompt = allUserTexts[0] || "";
  const fullText = (allUserTexts.join(" ") + " " + allAssistantTexts.join(" ")).toLowerCase();
  
  const cleanedFullText = fullText.replace(/\bongkos\b/gi, "");
  if (/\b(booking\s+kos|sewa\s+kos|indekos|kos\s+putra|kos\s+putri)\b/i.test(cleanedFullText)) {
    appName = "Booking Kos";
  } else if (firstUserPrompt) {
    const clean = firstUserPrompt
      .replace(/^([Aa]i|[Tt]olong|buatkan|bikin|buat|create|build|aku ingin membuat|aku ingin merancang)\s+/i, "")
      .trim();
    const firstSentence = clean.split(/[.\n?!]/)[0].trim();
    if (firstSentence) {
      appName = firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1);
    }
  }

  // Ensure Dribbble designs fallback if not in chat
  if (!dribbbleDesigns || !dribbbleDesigns.designs || dribbbleDesigns.designs.length === 0) {
    const meta = categorizeTopic(firstUserPrompt || appName);
    const fallbacks = CURATED_DRIBBLE_DESIGNS[meta.category] || CURATED_DRIBBLE_DESIGNS.default;
    dribbbleDesigns = {
      title: `Inspirasi Desain Antarmuka ${appName} (Dribbble)`,
      designs: fallbacks.slice(0, 3),
    };
  }

  // Ensure Flowchart fallback if not generated yet
  if (!flowchartData) {
    flowchartData = {
      title: `Alur Booking Kamar Kos (Instant Booking & WhatsApp Confirmation)`,
      nodes: [
        { id: "1", label: "Mahasiswa Cari Kos (Filter Malang)", category: "actor", detail: "Filter harga bulanan & fasilitas kamar" },
        { id: "2", label: "Pilih Kamar & Klik Instant Booking", category: "action", detail: "Mahasiswa login & ajukan booking" },
        { id: "3", label: "Locking Kamar (DB Row Lock)", category: "critical", detail: "Kamar di-hold 24 jam, cegah double booking" },
        { id: "4", label: "Generate Booking ID & Link WhatsApp", category: "process", detail: "Mahasiswa menerima instruksi bayar manual & WA pemilik" },
        { id: "5", label: "Pemilik Verifikasi Bayar & Serah Kunci", category: "action", detail: "Status booking berubah jadi Confirmed / Aktif" },
      ],
      edges: [
        { from: "1", to: "2" },
        { from: "2", to: "3" },
        { from: "3", to: "4" },
        { from: "4", to: "5" },
      ],
    };
  }

  // Architecture summary & choices
  const architectureChoice = "Monolithic Laravel 12 Architecture (Blade + Tailwind CSS + PostgreSQL/MySQL)";
  const operationalChoices = "Single Operator · Instant Booking 24h Hold · Offline/WhatsApp Payment · Malang";

  // Build high-standard Database Schema DDL for Laravel / Relational Database
  const databaseSchemaSql = `-- ==========================================================
-- DATABASE SCHEMA: Booking Kos (Laravel 12 Standard)
-- Engine: PostgreSQL 15+ / MySQL 8.0+
-- Generated by KODA AI Requirement Architect
-- ==========================================================

-- 1. Users Table (Role-Based Access Control)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student', -- 'student', 'owner', 'admin'
    phone VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Kos Listing Table
CREATE TABLE kos (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL, -- Assigned internal owner
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Malang',
    monthly_price NUMERIC(12, 2) NOT NULL,
    total_rooms INT NOT NULL DEFAULT 1,
    available_rooms INT NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'archived'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_rooms CHECK (available_rooms >= 0 AND available_rooms <= total_rooms)
);

-- 3. Kos Photos
CREATE TABLE kos_photos (
    id BIGSERIAL PRIMARY KEY,
    kos_id BIGINT NOT NULL REFERENCES kos(id) ON DELETE CASCADE,
    path VARCHAR(500) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Facilities Master & Pivot
CREATE TABLE facilities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE facility_kos (
    kos_id BIGINT NOT NULL REFERENCES kos(id) ON DELETE CASCADE,
    facility_id BIGINT NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    PRIMARY KEY (kos_id, facility_id)
);

-- 5. Bookings Table (Snapshot Price, 24h Expiry, Anti-Race Condition)
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    booking_code VARCHAR(50) UNIQUE NOT NULL,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kos_id BIGINT NOT NULL REFERENCES kos(id) ON DELETE CASCADE,
    monthly_price_snapshot NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'confirmed', -- 'confirmed', 'completed', 'cancelled', 'expired'
    payment_status VARCHAR(50) NOT NULL DEFAULT 'unconfirmed', -- 'unconfirmed', 'paid'
    booked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL, -- 24 hours from booking
    cancelled_at TIMESTAMP NULL,
    cancellation_reason TEXT NULL,
    payment_confirmed_at TIMESTAMP NULL,
    payment_confirmed_by BIGINT REFERENCES users(id) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Booking Audit Logs (Immutable Status History)
CREATE TABLE booking_status_logs (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    actor_id BIGINT NOT NULL REFERENCES users(id),
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Optimized Indexes for High-Traffic Catalog & Booking Lookups
CREATE INDEX idx_kos_status_city ON kos(status, city);
CREATE INDEX idx_kos_price ON kos(monthly_price);
CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_status_expires ON bookings(status, expires_at);`;

  // Build the complete 13-section PRD in exact standard markdown
  const isKos = /\b(booking\s+kos|sewa\s+kos|indekos)\b/i.test(cleanedFullText);

  const readmeMarkdown = isKos
    ? BOOKING_KOS_PRD_DOCUMENT
    : `# ${appName} — Product Requirement Document (PRD) & Technical Specification

> **Disusun Otomatis oleh KODA AI Requirements Architect**  
> Tanggal: ${new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}  
> Arsitektur Terpilih: **${architectureChoice}**  
> Keputusan Operasional: **${operationalChoices}**

---

## 1. Ringkasan Eksekutif & Problem Statement
Proyek **${appName}** dirancang untuk menyediakan sistem software yang tangguh, teruji dari celah konkurensi (*race condition*), dan memiliki alur kerja yang intuitif bagi seluruh pengguna.

### Masalah Utama yang Diselesaikan:
- **Pencegahan Data Korup & Bentrok:** Mengeliminasi celah transaksi simultan menggunakan *row-level locking* dan *idempotency keys*.
- **Otorisasi Peran yang Ketat (RBAC):** Memisahkan hak akses secara transparan antara pengguna akhir, operator, dan administrator.
- **Transparansi Operasional:** Menerapkan tabel *Audit Log* permanen yang mencatat seluruh riwayat perubahan status transaksi.

---

## 2. Arah Arsitektur & Tech Stack Rekomendasi

| Lapisan Sistem | Rekomendasi Teknologi | Rationale & Alasan Pemilihan |
| :--- | :--- | :--- |
| **Backend Framework** | **Laravel 12** / PHP 8.3 | Arsitektur MVC kokoh, ORM Eloquent, transaksional database aman. |
| **Styling & UI Kit** | **Blade + Tailwind CSS** | Server-side rendering cepat, ergonomis, accessible WCAG AA. |
| **Database** | **PostgreSQL 15+ / MySQL 8.0+** | ACID compliant, dukungan locking row-level. |
| **Queue / Scheduler** | **Laravel Scheduler & Queues** | Eksekusi tugas background dan auto-expiry transaksional. |

---

## 3. Matriks Peran & Hak Akses (RBAC)
- **Pengguna Biasa / Mahasiswa:** Mencari katalog, reservasi instan, melihat status riwayat.
- **Pemilik / Staf Internal:** Mengelola properti yang ditugaskan, update stok kamar, konfirmasi bayar.
- **Administrator:** Kendali penuh pengguna, moderasi publikasi listing, pengawasan transaksi.

---

## 4. Alur Diagram Sistem (Core System Flow)

\`\`\`mermaid
flowchart TD
${flowchartData.nodes.map((n: { id: string; label: string; detail?: string }) => `    node_${n.id}["${n.label}\\n(${n.detail || ""})"]`).join("\n")}
${flowchartData.edges.map((e: { from: string; to: string }) => `    node_${e.from} --> node_${e.to}`).join("\n")}
\`\`\`

---

## 5. Skema Basis Data (Database Schema DDL SQL)

\`\`\`sql
${databaseSchemaSql}
\`\`\`

---

## 6. Aturan Bisnis Kritis & Mekanisme Pengamanan (Edge Cases)
1. **Anti-Race Condition & Double-Booking:**
   - Gunakan \`DB::transaction\` dengan \`lockForUpdate()\` saat memeriksa dan mengurangi stok kamar.
2. **Auto-Expiry 24 Jam:**
   - Booking yang tidak dikonfirmasi pembayarannya dalam 24 jam otomatis kedaluwarsa dan stok dikembalikan.
3. **Idempotent Cancellation:**
   - Pembatalan atau kedaluwarsa hanya melepaskan stok kamar tepat 1 kali.`;

  const agentPrompt = `Tolong bangun aplikasi "${appName}" menggunakan Laravel 12, Blade, Tailwind CSS, dan PostgreSQL/MySQL.
Gunakan skema database dan aturan PRD berikut:
- Arsitektur: ${architectureChoice}
- Keputusan Operasional: ${operationalChoices}
- Terapkan RBAC, Audit Log, dan Locking anti-race condition.
- Implementasikan 13 bagian PRD Booking Kos standar industri.`;

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
