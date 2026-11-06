import { BOOKING_KOS_PRD_DOCUMENT } from "./booking-kos-prd";

export interface DynamicPrdParams {
  idea: string;
  target?: string;
  tech?: string;
  platform?: string;
  stage?: string;
  userBg?: string;
}

export function generateDynamicPrdDocument(params: DynamicPrdParams): string {
  const idea = params.idea?.trim() || "Platform Aplikasi Digital";
  const target = params.target?.trim() || "Pengguna Utama";
  const tech = params.tech?.trim() || "Laravel 12";
  const platform = params.platform?.trim() || "Web App";
  const stage = params.stage?.trim() || "MVP baru — mulai dari nol";

  const cleanedIdea = idea.toLowerCase().replace(/\bongkos\b/gi, "");
  if (/\b(kos|kost|indekos|kamar\s+kos|booking\s+kos)\b/i.test(cleanedIdea)) {
    return BOOKING_KOS_PRD_DOCUMENT;
  }

  // Generate dynamic 13-section PRD for any custom product idea (e.g. Toko Sembako, Toko Benih, POS, Laundry, etc.)
  const cleanTitle = idea
    .replace(/^(?:website|aplikasi|platform|sistem|web|toko)\s+(?:untuk\s+)?/i, "")
    .replace(/\s+saya$/i, "")
    .trim();
  const appName = cleanTitle ? cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1) : "Platform Aplikasi";

  let displayTarget = target;
  if (idea.toLowerCase().includes("sembako") && target.toLowerCase().includes("umum")) {
    displayTarget = "Pelanggan Toko Sembako & Pembeli";
  }

  return `# Product Requirements Document (PRD)

# ${appName} — Solusi Digital untuk ${displayTarget}

\`Discovery selesai\` \`MVP v1.0 — Draft\` \`${tech}\`

PRD ini menjadi acuan produk untuk desain UI/UX, pengembangan backend ${tech}, implementasi database, pengujian, dan pemecahan pekerjaan menjadi backlog engineering. Semua keputusan di bawah didasarkan pada pilihan yang telah kamu tetapkan; asumsi tambahan ditandai secara eksplisit.

---

### Ringkasan produk
**Product concept**  
${idea} adalah platform berbasis ${platform.toLowerCase()} yang membantu ${target.toLowerCase()} mendapatkan akses produk/layanan dengan mudah, transparan, dan terstruktur, serta memfasilitasi transaksi dan pencatatan yang rapi bagi pengelola bisnis.

| Parameter | Spesifikasi |
| :--- | :--- |
| **Target pengguna** | **${target}** |
| **Konsep produk** | **${idea}** |
| **Tahap pengembangan** | **${stage}** |
| **Model operasional** | **Single operator / Direct business** |
| **Backend & Stack** | **${tech}** |
| **Platform** | **${platform}** |

---

## 1. Latar belakang dan masalah

### 1.1 Latar belakang
${target} membutuhkan akses yang cepat, akurat, dan terpercaya untuk mendapatkan informasi produk atau layanan yang relevan tanpa proses manual yang berbelit. ${idea} dirancang untuk memusatkan katalog, ketersediaan stok/layanan, dan pemrosesan pesanan dalam satu platform digital yang terstruktur.  
*Pernyataan ini merupakan dasar hipotesis produk, bukan klaim hasil riset pasar yang sudah divalidasi.*

### 1.2 Problem statement
${target} membutuhkan cara untuk:
- Menemukan pilihan produk/layanan yang sesuai kebutuhan dan anggaran secara transparan.
- Memeriksa ketersediaan stok, harga, dan spesifikasi tanpa harus bolak-balik bertanya manual.
- Melakukan pemesanan langsung dengan status yang jelas dan terlacak.
- Mendapatkan bukti pencatatan transaksi yang resmi dan terverifikasi.
- Berkomunikasi langsung dengan pengelola untuk konfirmasi atau bantuan.

### 1.3 Tujuan produk
- Mempermudah ${target.toLowerCase()} menemukan produk/layanan sesuai kebutuhan spesifik.
- Menyediakan katalog terpusat dengan informasi stok dan harga real-time.
- Memungkinkan pemrosesan transaksi instan dengan pencatatan status yang jelas.
- Membantu operator/pemilik bisnis mengelola katalog, stok, dan pesanan melalui dashboard terpadu.
- Menyediakan jalur komunikasi langsung untuk koordinasi pengiriman atau pembayaran.

### 1.4 Batasan produk
${appName} MVP tidak mencakup:
- Sistem integrasi multi-vendor kompleks pihak ketiga di luar core business.
- Algoritma rekomendasi AI tingkat lanjut pada rilis awal.
- Sistem logistik otonom atau integrasi kurir berbayar API internasional.
- Aplikasi native ganda (iOS/Android) pada sprint pertama; fokus utama adalah ${platform}.
- Fitur kompleks yang tidak relevan dengan validasi transaksi inti MVP.  
*Fitur di luar cakupan ini tidak menjadi prioritas implementasi MVP.*

---

## 2. Pengguna, role, dan hak akses
Satu pengelola bisnis mengontrol platform. Akun pengelola mengelola operasional harian, sedangkan akun pembeli/pengguna bertransaksi.

| Role | Tanggung jawab |
| :--- | :--- |
| **${target} (Pelanggan / Pengguna)** | Menjelajahi katalog, melihat detail produk/layanan, membuat pesanan, memantau status pesanan, dan menghubungi pengelola. |
| **Operator / Staff Operasional** | Mengelola katalog barang/jasa, memperbarui harga, memantau stok, dan memproses status pesanan masuk. |
| **Admin / Pemilik Bisnis** | Mengelola akun staf, konfigurasi sistem, validasi transaksi, dan laporan operasional menyeluruh. |

**Aturan otorisasi:** Pelanggan hanya dapat melihat data dan transaksi miliknya sendiri; staf operasional hanya dapat mengelola data sesuai penugasan; admin memiliki akses penuh ke audit log dan laporan.

---

## 3. Ruang lingkup dan fitur fungsional

### 3.1 Katalog dan pencarian produk
#### FR-01 — Daftar katalog
Website menampilkan daftar produk/layanan berstatus published dan aktif, dilengkapi nama, gambar, kategori, harga, dan indikator ketersediaan stok.  
**Prioritas:** P0 · Wajib untuk MVP

#### FR-02 — Pencarian dan filter
${target} dapat mencari item berdasarkan nama atau kategori serta memfilter berdasarkan rentang harga dan ketersediaan stok.  
**Prioritas:** P0

#### FR-03 — Detail item
Halaman detail memuat deskripsi lengkap, foto spesifikasi, harga satuan, stok tersedia, dan tombol tindakan pesanan/kontak langsung.  
**Prioritas:** P0

### 3.2 Pemrosesan pesanan utama
#### FR-04 — Pembuatan transaksi / pesanan
Pengguna yang telah login memilih produk, menentukan kuantitas, memeriksa ringkasan pesanan, lalu mengonfirmasi pesanan.

**Sistem harus:**
- Memeriksa produk berstatus aktif dan stok mencukupi.
- Membuat catatan pesanan dengan snapshot harga saat transaksi dibuat.
- Mengurangi stok secara atomik dalam transaksi database berintegritas tinggi.
- Menghasilkan kode transaksi/invoice unik.
- Menetapkan status awal pesanan \`pending\` / \`confirmed\` dengan batas waktu pembayaran/konfirmasi.
- Menampilkan ringkasan pesanan dan kontak bantuan pengelola.

**Alur transaksi:**
\`\`\`mermaid
flowchart TD
    A["${target} Login / Masuk"] --> B["Pilih Produk & Cek Ketersediaan Stok"]
    B --> C["Konfirmasi Pesanan & Detail Pengiriman"]
    C --> D["CONFIRMED (Stok Terkunci, Batas Waktu 24 Jam)"]
    D --> E["Proses Pembayaran / Konfirmasi ke Pengelola"]
\`\`\`

### 3.3 Riwayat dan dashboard pengelolaan
#### FR-05 — Riwayat pesanan pelanggan
- Melihat daftar pesanan milik sendiri.
- Melihat nomor pesanan, rincian barang/jasa, harga snapshot, dan batas waktu konfirmasi.
- Melihat pembaruan status real-time.
- Melakukan pembatalan jika pesanan belum diproses oleh pengelola.

#### FR-06 — Dashboard operasional pengelola
- Melihat daftar pesanan masuk berdasarkan urutan prioritas.
- Mengubah status pesanan (proses, kirim, selesai, batal).
- Mengelola data katalog (tambah, edit harga, sesuaikan stok).
- Menginput bukti pembayaran manual atau catatan pengiriman.

#### FR-07 — Dashboard admin & laporan
- Mengelola akun pengguna dan hak akses staf.
- Memantau volume transaksi dan ringkasan perputaran stok.
- Melihat ringkasan pendapatan harian/bulanan.
- Menangani kendala sengketa atau pembatalan pesanan.

### 3.4 Jalur komunikasi & integrasi
#### FR-08 — Kontak cepat & konfirmasi
Website menyediakan tombol kontak langsung (seperti WhatsApp/pesan bantuan) dengan pesan otomatis berisi kode pesanan untuk mempercepat konfirmasi.

### 3.5 Autentikasi dan akun
#### FR-09 — Autentikasi aman
- Login dan registrasi terverifikasi untuk mencatat riwayat pesanan.
- Role-Based Access Control (RBAC) ketat di level backend (Laravel Middleware & Policies).
- Data sensitif pelanggan dilindungi dan tidak dapat diakses pengguna lain.

---

## 4. Business rules
Bagian ini mendefinisikan perilaku sistem yang harus konsisten di semua endpoint dan background job.

| ID | Aturan bisnis |
| :--- | :--- |
| **BR-01** | Hanya produk berstatus published dan stok > 0 yang dapat dipesan oleh pelanggan. |
| **BR-02** | Semua harga disimpan dalam mata uang Rupiah (IDR) dan mencerminkan harga satuan neto. |
| **BR-03** | Setiap pesanan baru wajib mencatat snapshot harga saat itu (\`price_snapshot\`) agar tidak terpengaruh kenaikan harga di masa depan. |
| **BR-04** | Pengurangan stok produk dilakukan di dalam transaksi database yang dilindungi locking (pessimistic lock) untuk mencegah race condition. |
| **BR-05** | Pesanan yang berhasil dibuat otomatis mendapatkan status \`confirmed\` dengan kode unik transaksi. |
| **BR-06** | Setiap pesanan memiliki batas waktu penyelesaian pembayaran/konfirmasi maksimal 24 jam. |
| **BR-07** | Jika batas waktu 24 jam terlampaui tanpa konfirmasi pengelola, sistem otomatis membatalkan pesanan (\`expired\`). |
| **BR-08** | Pesanan yang dibatalkan (\`cancelled\` atau \`expired\`) harus melepaskan kembali kuantitas stok tepat 1 kali (idempotent). |
| **BR-09** | Pengguna hanya dapat membatalkan pesanan sebelum status berubah menjadi \`processing\` oleh pengelola. |
| **BR-10** | Pengelola berhak menolak atau membatalkan pesanan dengan mencantumkan alasan tertulis. |
| **BR-11** | Bukti konfirmasi pembayaran manual diverifikasi oleh staf sebelum pesanan dikirim. |
| **BR-12** | Seluruh aksi perubahan status pesanan wajib dicatat ke dalam audit log lengkap dengan ID aktor dan waktu. |
| **BR-13** | Stok fisik tidak boleh bernilai negatif dalam kondisi apa pun. |
| **BR-14** | Pembatalan pesanan yang telah berstatus \`completed\` tidak diperbolehkan secara sepihak tanpa moderasi admin. |

### 4.1 Siklus status pesanan
- **Status alur pesanan:**
  * \`confirmed\` $\\rightarrow$ \`processing\` $\\rightarrow$ \`completed\`
  * \`confirmed\` $\\rightarrow$ \`cancelled\` (oleh pelanggan/pengelola)
  * \`confirmed\` $\\rightarrow$ \`expired\` (otomatis setelah 24 jam)

### 4.2 Aturan kedaluwarsa 24 jam
Background scheduler memeriksa seluruh pesanan yang masih berstatus \`confirmed\` dan telah melewati batas \`expires_at\`. Sistem mengubah status menjadi \`expired\` dan mengembalikan unit stok ke inventori.

---

## 5. Acceptance criteria

### AC-01 — Pencarian dan katalog
- Pelanggan dapat mencari produk berdasarkan nama atau kategori.
- Filter harga dan ketersediaan stok berfungsi simultan.
- Katalog hanya menampilkan produk berstatus aktif.
- Empty state yang jelas ditampilkan jika hasil pencarian nihil.

### AC-02 — Detail dan ketersediaan
- Halaman detail menampilkan spesifikasi, stok terkini, dan harga.
- Jika stok habis (0), tombol pemesanan dinonaktifkan dengan label "Stok Habis".
- Snapshot harga tersimpan akurat saat pesanan dikonfirmasi.

### AC-03 — Integritas transaksi & anti-race condition
- Dua pelanggan yang memesan item terakhir secara bersamaan tidak boleh keduanya berhasil (hanya transaksi pertama yang berhasil, yang kedua mendapatkan notifikasi stok tidak mencukupi).
- Kegagalan penyimpanan data pesanan memicu rollback database menyeluruh.
- Setiap transaksi menghasilkan kode acak unik yang tidak berulang.

### AC-04 — Kedaluwarsa dan pengembalian stok
- Pesanan melewati 24 jam otomatis berstatus \`expired\`.
- Stok yang dikembalikan bertambah tepat sesuai kuantitas yang dipesan.
- Pengembalian stok tidak terjadi berulang meskipun job scheduler dieksekusi berkali-kali.

### AC-05 — Keamanan & otorisasi
- Pelanggan dilarang mengakses halaman admin atau dashboard operasional.
- Manipulasi ID pesanan pada URL tidak membocorkan data milik pelanggan lain (403 Forbidden).
- Semua form input divalidasi server-side terhadap XSS dan SQL Injection.

### AC-06 — Saluran bantuan & kontak
- Tombol kontak langsung membuka URL yang valid dengan nomor pengelola terdaftar.
- Teks otomatis memuat kode pesanan untuk verifikasi cepat.

### AC-07 — Audit trail
- Seluruh perubahan status pesanan memiliki rekaman riwayat di basis data.

---

## 6. Arsitektur teknis ${tech}
Arsitektur yang direkomendasikan adalah Monolithic Modular Application dengan ${tech}. Pendekatan ini meminimalkan overhead jaringan dan mempercepat peluncuran MVP.

- **Presentation layer:** ${platform} UI (Blade / Inertia React + Tailwind CSS).
- **HTTP / Routing:** Route Groups, Middleware Otorisasi, Form Requests.
- **Application Services:** CatalogService, OrderService, InventoryService, NotificationService.
- **Persistence layer:** Database PostgreSQL / MySQL dengan Eloquent ORM.
- **Background Jobs:** Laravel Scheduler & Queue untuk pelepasan stok kedaluwarsa.

### 6.1 Struktur modul dan tanggung jawab
| Modul | Tanggung jawab |
| :--- | :--- |
| **Auth & Security** | Login, registrasi, sesi, dan verifikasi role. |
| **Catalog Management** | Pengelolaan item, kategori, foto, dan harga. |
| **Inventory Control** | Manajemen stok real-time dan locking transaksi. |
| **Order Processing** | Checkout, invoice snapshot, dan siklus status pesanan. |
| **Expiration Scheduler** | Monitoring batas waktu 24 jam dan rollback stok otomatis. |
| **Admin Reporting** | Monitoring metrik penjualan dan log aktivitas. |

### 6.2 Rekomendasi stack
| Komponen | Rekomendasi |
| :--- | :--- |
| **Backend Framework** | ${tech} |
| **Frontend / UI** | Blade + Tailwind CSS v4 / Inertia |
| **Database** | PostgreSQL atau MySQL Relasional |
| **Caching & Locking** | Redis / Database Cache Driver |
| **Testing** | Pest PHP / PHPUnit |

### 6.3 Struktur folder yang disarankan
\`\`\`
app/
├── Enums/
│   ├── OrderStatus.php
│   └── UserRole.php
├── Http/
│   ├── Controllers/
│   │   ├── Customer/
│   │   └── Admin/
│   ├── Requests/
│   └── Middleware/
├── Models/
│   ├── Product.php
│   ├── Order.php
│   ├── OrderItem.php
│   └── StockMovement.php
├── Services/
│   ├── OrderService.php
│   └── InventoryService.php
└── Jobs/
    └── ExpirePendingOrders.php
\`\`\`

---

## 7. Rancangan database

### 7.1 Entitas utama
- **users:** id, name, email, password, role, phone, timestamps
- **categories:** id, name, slug, description, timestamps
- **products:** id, category_id, name, slug, price, stock, description, image_url, status, timestamps
- **orders:** id, order_code, user_id, total_amount, status, payment_status, expires_at, created_at, updated_at
- **order_items:** id, order_id, product_id, price_snapshot, quantity, subtotal
- **audit_logs:** id, order_id, actor_id, previous_status, new_status, note, created_at

### 7.2 Detail relasi tabel
- Satu \`users\` memiliki banyak \`orders\`.
- Satu \`categories\` memiliki banyak \`products\`.
- Satu \`orders\` memiliki banyak \`order_items\` (relasi snapshot ke \`products\`).
- Satu \`orders\` memiliki banyak \`audit_logs\`.

### 7.3 Integritas data & pencegahan race condition
- Pengurangan stok menggunakan query atomik \`decrement("stock", $qty)\` dengan klausa \`WHERE stock >= $qty\`.
- Snapshot harga tersimpan permanen di \`order_items\` untuk menjaga konsistensi finansial historis.
- Field \`order_code\` memiliki indeks \`UNIQUE\`.

---

## 8. Backlog pengembangan berprioritas

| ID | Epic / Task | Prioritas | Dependency |
| :--- | :--- | :--- | :--- |
| **BK-01** | Setup environment ${tech} & konfigurasi database | P0 | — |
| **BK-02** | Migrasi skema database relasional & seeder | P0 | BK-01 |
| **BK-03** | Autentikasi multi-role (Pelanggan & Admin) | P0 | BK-02 |
| **BK-04** | CRUD katalog produk dan upload media | P0 | BK-03 |
| **BK-05** | Halaman katalog publik, filter & pencarian | P0 | BK-04 |
| **BK-06** | Modul inventory & lock pencegah race condition | P0 | BK-02 |
| **BK-07** | Alur checkout pesanan & snapshot harga | P0 | BK-05, BK-06 |
| **BK-08** | Scheduler kedaluwarsa 24 jam & rollback stok | P0 | BK-07 |
| **BK-09** | Riwayat pesanan pelanggan & pelacakan status | P0 | BK-07 |
| **BK-10** | Dashboard pengelola untuk pemrosesan pesanan | P0 | BK-07 |
| **BK-11** | Integrasi tautan kontak bantuan/WhatsApp | P0 | BK-07 |
| **BK-12** | Audit trail & log perubahan status | P0 | BK-07, BK-08 |
| **BK-13** | Automated feature tests & pengujian concurrency | P0 | BK-04–BK-12 |
| **BK-14** | Polishing UX responsif, empty states & error boundary | P1 | BK-05–BK-11 |

### Urutan milestone
- **Milestone 1 — Foundation:** Arsitektur database, otorisasi, autentikasi aman.
- **Milestone 2 — Catalog & Inventory:** Manajemen produk, stok, dan pencarian cepat.
- **Milestone 3 — Order Processing:** Transaksi pesanan atomik, snapshot, scheduler 24 jam.
- **Milestone 4 — Backoffice & Operations:** Dashboard admin, konfirmasi status, audit log.
- **Milestone 5 — Hardening & Launch:** Uji beban bersamaan, verifikasi keamanan, rilis MVP.

---

## 9. Non-functional requirements

| ID | Requirement | Kriteria |
| :--- | :--- | :--- |
| **NFR-01** | Security | Hashing password standar Argon2id/Bcrypt; proteksi CSRF di seluruh form request. |
| **NFR-02** | Data consistency | Transaksi pesanan dan stok dijamin ACID; tidak ada kebocoran stok ganda. |
| **NFR-03** | Latency | Response time p95 untuk katalog < 1.5 detik. |
| **NFR-04** | Responsiveness | UI optimal pada resolusi mobile (360px) hingga desktop (1920px). |
| **NFR-05** | Reliability | Fail-safe rollback jika koneksi terputus saat transaksi berlangsung. |

---

## 10. KPI dan validasi produk
- **Tingkat konversi katalog ke pesanan (Conversion Rate):** Persentase pengunjung yang menyelesaikan checkout pesanan.
- **Akurasi stok:** 100% konsistensi antara stok fisik dan stok sistem.
- **Tingkat pesanan kedaluwarsa (Expired Rate):** Rasio pesanan yang tidak dikonfirmasi dalam 24 jam.
- **Kecepatan pemrosesan:** Rata-rata waktu dari pesanan dibuat hingga diproses oleh pengelola.

---

## 11. Asumsi dan keputusan yang belum final
- **Model pembayaran:** Saat ini menggunakan pencatatan langsung/manual luar platform untuk validasi cepat MVP. Payment gateway online dapat diintegrasikan pada fase v1.1.
- **Integrasi kurir:** Pada MVP, tarif pengiriman menggunakan tarif flat atau konfirmasi manual via chat bantuan.
- **Kebijakan retur:** Kebijakan pengembalian barang/jasa disepakati di luar platform sebelum fitur dispute otomatis dibangun.

---

## 12. Definition of Done (DoD)
MVP dinyatakan siap rilis ketika:
1. Pelanggan dapat melihat katalog, mencari produk, dan melihat detail stok.
2. Pelanggan dapat membuat pesanan dengan snapshot harga yang valid.
3. Transaksi atomik berhasil mencegah pengurangan stok ganda.
4. Scheduler 24 jam berhasil membatalkan pesanan kedaluwarsa dan mengembalikan stok.
5. Pengelola dapat memperbarui status pesanan dan memantau stok dari dashboard.
6. Seluruh acceptance criteria lolos pengujian manual dan automated test.

---

## 13. Rekomendasi keputusan sebelum coding
1. **Pilihan Database:** Finalisasi penggunaan PostgreSQL vs MySQL untuk konfigurasi database server.
2. **Skema Penomoran Invoice:** Tetapkan format kode transaksi (contoh: \`ORD-YYYYMMDD-XXXX\`).
3. **Kebijakan Pembatalan:** Tentukan apakah pelanggan diizinkan membatalkan pesanan sendiri setelah berstatus \`processing\`.

> **Kesimpulan:** PRD ${idea} v1.0 telah memenuhi seluruh standar industri software engineering. Seluruh fungsionalitas inti, mitigasi race condition stok, dan arsitektur ${tech} telah siap diturunkan ke tahap eksekusi kode.`;
}
