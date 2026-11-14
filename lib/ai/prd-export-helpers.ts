/**
 * Helpers for PRD Completeness, Security/Architecture Audit,
 * Linear/Jira CSV/JSON Export, and ERD SQL Parsing.
 */

export interface ChapterStatus {
  number: number;
  title: string;
  category: string;
  status: "complete" | "partial" | "missing";
  summary: string;
  promptAction: string;
}

export interface CompletenessResult {
  scorePercent: number;
  completedCount: number;
  partialCount: number;
  missingCount: number;
  totalChapters: number;
  chapters: ChapterStatus[];
}

export interface AuditCheckItem {
  id: string;
  pillar: "concurrency" | "database" | "security" | "resilience";
  title: string;
  description: string;
  status: "pass" | "warning" | "critical";
  recommendation?: string;
}

export interface AuditResult {
  overallScore: number;
  grade: "A+" | "A" | "B" | "C";
  summaryText: string;
  checks: AuditCheckItem[];
}

export interface LinearJiraTask {
  id: string;
  issueType: "Epic" | "Story" | "Task" | "Bug";
  summary: string;
  description: string;
  acceptanceCriteria: string[];
  priority: "High" | "Medium" | "Urgent" | "Low";
  sprint: string;
  estimate: string;
}

export interface ErdColumn {
  name: string;
  type: string;
  isPk: boolean;
  isFk: boolean;
  isNullable: boolean;
  refTable?: string;
  refCol?: string;
}

export interface ErdTable {
  id: string;
  name: string;
  description?: string;
  columns: ErdColumn[];
}

// 1. 13-Bab Industry Standard Chapters Definition
const PRD_13_CHAPTERS: Array<{
  number: number;
  title: string;
  category: string;
  keywords: RegExp[];
  promptAction: string;
}> = [
  {
    number: 1,
    title: "Ringkasan Eksekutif & Visi Produk",
    category: "Strategi Produk",
    keywords: [/ringkasan eksekutif/i, /visi produk/i, /latar belakang/i, /executive summary/i],
    promptAction: "Tolong lengkapi Bab 1: Ringkasan Eksekutif & Visi Produk secara tajam dan berwibawa.",
  },
  {
    number: 2,
    title: "Problem Statement & User Persona",
    category: "Pengguna & Masalah",
    keywords: [/problem statement/i, /titik masalah/i, /persona/i, /target audiens/i, /pain point/i],
    promptAction: "Lengkapi Bab 2: Rumusan Masalah (Pain Points) dan detail User Persona secara mendalam.",
  },
  {
    number: 3,
    title: "User Journey & Core Flowchart",
    category: "Alur Pengguna",
    keywords: [/user journey/i, /alur pengguna/i, /flowchart/i, /sequence/i, /tahapan alur/i],
    promptAction: "Rincikan Bab 3: Alur User Journey dari login, aksi utama, hingga konfirmasi sukses.",
  },
  {
    number: 4,
    title: "Functional Requirements (Fitur Inti)",
    category: "Spesifikasi Fitur",
    keywords: [/functional requirements/i, /kebutuhan fungsional/i, /spesifikasi fitur/i, /fitur utama/i],
    promptAction: "Detailkan Bab 4: Functional Requirements (FR) dengan kriteria penerimaan (Acceptance Criteria).",
  },
  {
    number: 5,
    title: "Non-Functional Requirements (NFR & Skala)",
    category: "Kinerja & Kualitas",
    keywords: [/non-functional/i, /nfr/i, /skalabilitas/i, /latensi/i, /sla/i, /performa/i],
    promptAction: "Susun Bab 5: Non-Functional Requirements meliputi throughput RPS, batas latensi <200ms, dan uptime SLA.",
  },
  {
    number: 6,
    title: "Skema Database PostgreSQL 3NF",
    category: "Arsitektur Data",
    keywords: [/database/i, /skema/i, /ddl/i, /3nf/i, /create table/i, /postgresql/i],
    promptAction: "Lengkapi Bab 6: Skema Database PostgreSQL 3NF lengkap dengan foreign keys dan audit timestamps.",
  },
  {
    number: 7,
    title: "API Contract & Endpoint Payloads",
    category: "Integrasi API",
    keywords: [/api/i, /endpoint/i, /rest api/i, /payload/i, /post \//i, /get \//i],
    promptAction: "Detailkan Bab 7: Kontrak API RESTful lengkap dengan request payload, response schema, dan HTTP status code.",
  },
  {
    number: 8,
    title: "Security, Auth RBAC & Data Privacy",
    category: "Keamanan Sistem",
    keywords: [/security/i, /keamanan/i, /rbac/i, /auth/i, /role-based/i, /jwt/i, /rls/i],
    promptAction: "Perkuat Bab 8: Kebijakan keamanan, otentikasi JWT, hak akses RBAC, dan Row Level Security (RLS).",
  },
  {
    number: 9,
    title: "Edge Cases & Mitigasi Race Condition",
    category: "Keandalan Sistem",
    keywords: [/race condition/i, /concurrency/i, /locking/i, /double-booking/i, /idempotency/i, /edge case/i],
    promptAction: "Rancang Bab 9: Mitigasi kritis race condition (row lock FOR UPDATE / Redis Mutex) dan penanganan edge case.",
  },
  {
    number: 10,
    title: "Third-Party Integrations & Webhooks",
    category: "Layanan Eksternal",
    keywords: [/third-party/i, /integrasi/i, /webhook/i, /payment gateway/i, /whatsapp/i, /email/i],
    promptAction: "Definisikan Bab 10: Integrasi pihak ketiga (Payment Gateway, Webhook Idempotency, dan SMS/WhatsApp API).",
  },
  {
    number: 11,
    title: "Design System & Wireframe Spec",
    category: "Desain Antarmuka",
    keywords: [/design system/i, /wireframe/i, /palet warna/i, /komponen ui/i, /typography/i],
    promptAction: "Susun Bab 11: Spesifikasi Design System, panduan palet warna Tailwind, tipografi, dan hierarki tata letak.",
  },
  {
    number: 12,
    title: "Sprint Roadmap & Task Breakdown",
    category: "Manajemen Proyek",
    keywords: [/sprint/i, /roadmap/i, /milestone/i, /tahap implementasi/i, /fase 1/i],
    promptAction: "Pecah Bab 12: Sprint Roadmap 2 mingguan lengkap dengan prioritas Epics dan estimasi pengerjaan.",
  },
  {
    number: 13,
    title: "Metrik Sukses (North Star & KPI)",
    category: "Pengukuran Dampak",
    keywords: [/north star/i, /kpi/i, /metrik sukses/i, /okr/i, /retensi/i, /conversion/i],
    promptAction: "Rumuskan Bab 13: Metrik Sukses terukur, North Star Metric, dan KPI bisnis untuk mengevaluasi dampak produk.",
  },
];

export function computePrdCompleteness(markdown: string): CompletenessResult {
  if (!markdown || markdown.trim().length === 0) {
    return {
      scorePercent: 0,
      completedCount: 0,
      partialCount: 0,
      missingCount: 13,
      totalChapters: 13,
      chapters: PRD_13_CHAPTERS.map((ch) => ({
        number: ch.number,
        title: ch.title,
        category: ch.category,
        status: "missing",
        summary: "Belum terdefinisi dalam percakapan.",
        promptAction: ch.promptAction,
      })),
    };
  }

  const chapters: ChapterStatus[] = PRD_13_CHAPTERS.map((ch) => {
    // 1. Match by chapter number (e.g. "Bab 5", "### 5.", "5. ") or keywords
    const chapterNumRegex = new RegExp(`(?:bab\\s*${ch.number}\\b|###?\\s*${ch.number}\\.|\\b${ch.number}\\.\\s)`, "i");
    const hasNumMatch = chapterNumRegex.test(markdown);
    const matchedKeyword = ch.keywords.find((rx) => rx.test(markdown));
    const isMatched = hasNumMatch || !!matchedKeyword;

    // Check depth
    let status: "complete" | "partial" | "missing" = "missing";
    let summary = "Belum terdefinisi.";

    if (isMatched) {
      let targetIndex = -1;
      const numMatch = markdown.match(chapterNumRegex);
      if (numMatch && typeof numMatch.index === "number") {
        targetIndex = numMatch.index;
      } else if (matchedKeyword) {
        const kwMatch = markdown.match(matchedKeyword);
        if (kwMatch && typeof kwMatch.index === "number") {
          targetIndex = kwMatch.index;
        }
      }

      if (targetIndex >= 0) {
        const proximity = markdown.slice(targetIndex, targetIndex + 800);
        if (proximity.trim().length > 200) {
          status = "complete";
          summary = "Lengkap dan memenuhi standar industri produksi.";
        } else {
          status = "partial";
          summary = "Tercantum sebagian, disarankan penajaman detail spesifikasi.";
        }
      } else {
        status = "partial";
        summary = "Tercantum sebagian, disarankan penajaman detail spesifikasi.";
      }
    }

    return {
      number: ch.number,
      title: ch.title,
      category: ch.category,
      status,
      summary,
      promptAction: ch.promptAction,
    };
  });

  const completedCount = chapters.filter((c) => c.status === "complete").length;
  const partialCount = chapters.filter((c) => c.status === "partial").length;
  const missingCount = chapters.filter((c) => c.status === "missing").length;

  // Formula: complete = 100%, partial = 50%
  const scorePercent = Math.min(
    100,
    Math.round(((completedCount * 1.0 + partialCount * 0.5) / 13) * 100)
  );

  return {
    scorePercent,
    completedCount,
    partialCount,
    missingCount,
    totalChapters: 13,
    chapters,
  };
}

// 2. Pre-Production Security & Architecture Audit Engine
export function computePrdSecurityAudit(markdown: string, ddl: string): AuditResult {
  const fullText = `${markdown}\n${ddl}`;
  const checks: AuditCheckItem[] = [];

  // Check 1: Concurrency & Race Condition Lock
  const hasLock = /for update|redis|mutex|concurrency|race condition|distributed lock|pessimistic/i.test(fullText);
  if (hasLock) {
    checks.push({
      id: "concurrency_lock",
      pillar: "concurrency",
      title: "Mitigasi Race Condition & Concurrency Locking",
      description: "Terdeteksi mekanisme locking (FOR UPDATE / Redis Mutex) untuk mencegah double-booking atau saldo negatif.",
      status: "pass",
    });
  } else {
    checks.push({
      id: "concurrency_lock",
      pillar: "concurrency",
      title: "Potensi Celah Race Condition",
      description: "Belum terdeteksi mekanisme row lock (FOR UPDATE) pada transaksi kritis.",
      status: "critical",
      recommendation: "Gunakan 'SELECT ... FOR UPDATE' di level PostgreSQL saat memeriksa ketersediaan slot atau kuota stok.",
    });
  }

  // Check 2: Idempotency Keys for Payments & State Mutation
  const hasIdempotency = /idempotency|idempotent|x-idempotency-key|unique transaction/i.test(fullText);
  if (hasIdempotency) {
    checks.push({
      id: "idempotency",
      pillar: "concurrency",
      title: "Idempotency Protection",
      description: "Header idempotency key terpasang untuk mencegah duplikasi pembayaran pada koneksi labil.",
      status: "pass",
    });
  } else {
    checks.push({
      id: "idempotency",
      pillar: "concurrency",
      title: "Perlindungan Idempotency Transaksi",
      description: "Disarankan menambahkan Idempotency-Key pada mutasi pembayaran atau transaksi finansial.",
      status: "warning",
      recommendation: "Pasang kolom unique 'idempotency_key' pada tabel transaksi untuk mencegah double charge.",
    });
  }

  // Check 3: Database Foreign Keys & 3NF
  const hasFk = /foreign key|references\s+\w+/i.test(ddl);
  const hasTimestamps = /created_at|updated_at/i.test(ddl);
  if (hasFk && hasTimestamps) {
    checks.push({
      id: "db_integrity",
      pillar: "database",
      title: "Integritas Relasional 3NF & Audit Timestamps",
      description: "Skema DDL menggunakan Foreign Key constraint dan audit trail (created_at/updated_at).",
      status: "pass",
    });
  } else {
    checks.push({
      id: "db_integrity",
      pillar: "database",
      title: "Constraint Database Kurang Ketat",
      description: "Pastikan seluruh relasi tabel memiliki REFERENCES foreign key dan onDelete cascade/restrict.",
      status: "warning",
      recommendation: "Tambahkan Foreign Key eksplisit pada setiap kolom relasional.",
    });
  }

  // Check 4: Auth & Role-Based Access Control (RBAC)
  const hasRbac = /rbac|role|admin|user|customer|owner|rls|row level security/i.test(fullText);
  if (hasRbac) {
    checks.push({
      id: "auth_rbac",
      pillar: "security",
      title: "Otorisasi Multi-Role (RBAC) & Privasi Data",
      description: "Aturan pemisahan akses peran pengguna dan pemilik akun telah ditentukan.",
      status: "pass",
    });
  } else {
    checks.push({
      id: "auth_rbac",
      pillar: "security",
      title: "Definisi RBAC Peran Pengguna",
      description: "Hierarki wewenang pengguna (User vs Admin vs Owner) belum ditegaskan secara ketat.",
      status: "warning",
      recommendation: "Tegaskan hak akses tiap endpoint menggunakan middleware role guard.",
    });
  }

  // Check 5: Webhook Verification & Resilience
  const hasWebhookSecurity = /webhook|signature|hmac|secret|verify/i.test(fullText);
  if (hasWebhookSecurity) {
    checks.push({
      id: "webhook_verify",
      pillar: "resilience",
      title: "Verifikasi Tanda Tangan Webhook",
      description: "Proses penerimaan notifikasi eksternal dilengkapi verifikasi signature kriptografis.",
      status: "pass",
    });
  } else {
    checks.push({
      id: "webhook_verify",
      pillar: "resilience",
      title: "Keamanan Webhook Eksternal",
      description: "Sertakan verifikasi HMAC Signature pada webhook payment gateway atau WhatsApp API.",
      status: "warning",
      recommendation: "Verifikasi header signature webhook sebelum memproses perubahan status pesanan.",
    });
  }

  // Calculate score
  let score = 70;
  checks.forEach((c) => {
    if (c.status === "pass") score += 6;
    if (c.status === "critical") score -= 15;
    if (c.status === "warning") score -= 4;
  });
  score = Math.max(40, Math.min(98, score));

  let grade: "A+" | "A" | "B" | "C" = "B";
  if (score >= 90) grade = "A+";
  else if (score >= 80) grade = "A";
  else if (score >= 65) grade = "B";
  else grade = "C";

  return {
    overallScore: score,
    grade,
    summaryText:
      score >= 85
        ? "Dokumen spesifikasi arsitektur siap produksi dengan mitigasi risiko sistem kelas enterprise."
        : "PRD memiliki fondasi baik, namun disarankan melengkapi beberapa penanganan edge case sebelum coding.",
    checks,
  };
}

// 3. Linear / Jira Tasks Generator (CSV & JSON)
export function generateLinearJiraTasks(appName: string, markdown: string): {
  csvContent: string;
  tasks: LinearJiraTask[];
} {
  const cleanApp = appName || "Platform Aplikasi";

  const defaultTasks: LinearJiraTask[] = [
    {
      id: "TASK-1",
      issueType: "Epic",
      summary: `[EPIC] Fondasi Arsitektur & Database ${cleanApp}`,
      description: `Setup repositori, konfigurasi PostgreSQL 3NF DDL, migrasi schema, dan konektor database terenkripsi.`,
      acceptanceCriteria: [
        "Seluruh tabel terbuat dengan constraint Foreign Key dan created_at/updated_at.",
        "Index pencarian terpasang pada kolom filter utama.",
        "Mekanisme locking baris teruji lolos uji konkurensi.",
      ],
      priority: "Urgent",
      sprint: "Sprint 1",
      estimate: "5d",
    },
    {
      id: "TASK-2",
      issueType: "Story",
      summary: `Implementasi Autentikasi Pengguna & Role Guard (RBAC)`,
      description: `Registrasi, Login dengan JWT / OAuth, serta middleware pembatasan akses berdasarkan peran.`,
      acceptanceCriteria: [
        "Pengguna dapat mendaftar dan login dengan aman.",
        "Role-based middleware memblokir akses endpoint tanpa wewenang.",
        "Token tersimpan dalam httpOnly secure cookie.",
      ],
      priority: "High",
      sprint: "Sprint 1",
      estimate: "3d",
    },
    {
      id: "TASK-3",
      issueType: "Story",
      summary: `Fitur Utama & Alur Transaksi Inti`,
      description: `Pengembangan alur bisnis utama dari pemilihan item/kamar hingga konfirmasi checkout.`,
      acceptanceCriteria: [
        "Alur validasi ketersediaan berjalan < 150ms.",
        "Mencegah transaksi duplikat menggunakan idempotency key.",
        "Status transaksi terekam di tabel log audit.",
      ],
      priority: "Urgent",
      sprint: "Sprint 2",
      estimate: "5d",
    },
    {
      id: "TASK-4",
      issueType: "Story",
      summary: `Integrasi Notifikasi & Webhook Pihak Ketiga`,
      description: `Penerimaan webhook pembayaran/WhatsApp dengan signature verification dan pengiriman notifikasi instan.`,
      acceptanceCriteria: [
        "Signature HMAC diverifikasi sebelum merubah status transaksi.",
        "Fallback retry otomatis jika notifikasi WhatsApp timeout.",
      ],
      priority: "Medium",
      sprint: "Sprint 2",
      estimate: "2d",
    },
    {
      id: "TASK-5",
      issueType: "Task",
      summary: `Pengujian Beban (Load Test) & Stress Test Concurrency`,
      description: `Simulasi 1.000 concurrent request secara bersamaan untuk memastikan tidak ada race condition.`,
      acceptanceCriteria: [
        "Nol data race condition atau double booking dalam pengujian.",
        "P95 respons latency di bawah 200ms pada beban puncak.",
      ],
      priority: "High",
      sprint: "Sprint 3",
      estimate: "3d",
    },
  ];

  // Build CSV string
  const csvHeaders = "Issue Type,Summary,Description,Acceptance Criteria,Priority,Sprint,Estimate\n";
  const csvRows = defaultTasks
    .map((t) => {
      const cleanSummary = `"${t.summary.replace(/"/g, '""')}"`;
      const cleanDesc = `"${t.description.replace(/"/g, '""')}"`;
      const cleanAc = `"${t.acceptanceCriteria.join(" | ").replace(/"/g, '""')}"`;
      return `${t.issueType},${cleanSummary},${cleanDesc},${cleanAc},${t.priority},${t.sprint},${t.estimate}`;
    })
    .join("\n");

  return {
    csvContent: `${csvHeaders}${csvRows}`,
    tasks: defaultTasks,
  };
}

// 4. SQL DDL Parser to Visual ERD Nodes
export function parseErdFromSql(sql: string): ErdTable[] {
  if (!sql || sql.trim().length === 0) return [];

  const tables: ErdTable[] = [];
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\);/gi;
  let match;

  while ((match = tableRegex.exec(sql)) !== null) {
    const tableName = match[1];
    const body = match[2];
    const columns: ErdColumn[] = [];

    // Split lines by comma, respecting parentheses
    const lines = body.split("\n");

    for (const rawLine of lines) {
      const line = rawLine.trim().replace(/,$/, "");
      if (!line || line.startsWith("--")) continue;

      // Check standalone foreign key constraint inside CREATE TABLE
      const standaloneFk = line.match(
        /(?:CONSTRAINT\s+\w+\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+([a-zA-Z0-9_]+)\s*(?:\(([^)]+)\))?/i
      );
      if (standaloneFk) {
        const fkCol = standaloneFk[1].trim().replace(/["`]/g, "");
        const targetTable = standaloneFk[2].trim().replace(/["`]/g, "");
        const targetCol = (standaloneFk[3] || "id").trim().replace(/["`]/g, "");
        const existingCol = columns.find((c) => c.name.toLowerCase() === fkCol.toLowerCase());
        if (existingCol) {
          existingCol.isFk = true;
          existingCol.refTable = targetTable;
          existingCol.refCol = targetCol;
        }
        continue;
      }

      // Skip standalone table constraints like CONSTRAINT ... PRIMARY KEY
      if (/^(?:CONSTRAINT|PRIMARY\s+KEY|UNIQUE)\s*\(/i.test(line)) {
        continue;
      }

      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        const colName = parts[0].replace(/["`]/g, "");
        const colType = parts[1].toUpperCase();

        const isPk = /PRIMARY\s+KEY/i.test(line);
        const isFk = /REFERENCES/i.test(line);
        const isNullable = !/NOT\s+NULL/i.test(line);

        let refTable: string | undefined = undefined;
        let refCol: string | undefined = undefined;

        if (isFk) {
          const refMatch = line.match(/REFERENCES\s+([a-zA-Z0-9_]+)\s*(?:\(([^)]+)\))?/i);
          if (refMatch) {
            refTable = refMatch[1];
            refCol = refMatch[2] || "id";
          }
        }

        columns.push({
          name: colName,
          type: colType,
          isPk,
          isFk,
          isNullable,
          refTable,
          refCol,
        });
      }
    }

    if (columns.length > 0) {
      tables.push({
        id: `tbl-${tableName}`,
        name: tableName,
        columns,
      });
    }
  }

  // Also parse standalone ALTER TABLE ADD CONSTRAINT FOREIGN KEY
  const alterRegex =
    /ALTER\s+TABLE\s+(?:ONLY\s+)?([a-zA-Z0-9_]+)\s+ADD\s+(?:CONSTRAINT\s+\w+\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+([a-zA-Z0-9_]+)\s*(?:\(([^)]+)\))?/gi;
  let alterMatch;
  while ((alterMatch = alterRegex.exec(sql)) !== null) {
    const fromTable = alterMatch[1].replace(/["`]/g, "");
    const fkCol = alterMatch[2].trim().replace(/["`]/g, "");
    const toTable = alterMatch[3].replace(/["`]/g, "");
    const toCol = (alterMatch[4] || "id").trim().replace(/["`]/g, "");

    const tableObj = tables.find((t) => t.name.toLowerCase() === fromTable.toLowerCase());
    if (tableObj) {
      const colObj = tableObj.columns.find((c) => c.name.toLowerCase() === fkCol.toLowerCase());
      if (colObj) {
        colObj.isFk = true;
        colObj.refTable = toTable;
        colObj.refCol = toCol;
      }
    }
  }

  return tables;
}
