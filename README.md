# 🏢 SI-RUANG - Sistem Informasi Peminjaman Ruangan Kampus

SI-RUANG adalah aplikasi web full-stack berbasis **Next.js App Router**, **Prisma ORM**, **Neon PostgreSQL**, dan **Tailwind CSS**. Sistem ini mengelola peminjaman ruangan perkuliahan & seminar di lingkungan kampus dengan proteksi role-based access control (Admin & Dosen), sinkronisasi data dari WebService eksternal, validasi pencegahan bentrok jadwal (anti-collision), serta automated testing.

---

## 🌟 Fitur Utama & Aturan Bisnis

### 1. 🔑 Autentikasi & Otorisasi (Role & Middleware)
- **Role System**: Terbagi atas **`ADMIN`** (Biro Sarpras) dan **`DOSEN`** (Pengajar).
- **Security**: Menggunakan password hashing **`bcryptjs`** dan session token berbasis **`JWT (jose)`** yang disimpan aman dalam **HttpOnly Cookies**.
- **Middleware**: Proteksi rute otomatis (`/dashboard/*`, `/api/rooms/sync`, `/api/reservations/[id]/approval`).

### 2. 🗄️ ORM & Migration (Prisma + Neon PostgreSQL)
- Menggunakan **Prisma ORM** yang terhubung langsung ke **Neon Serverless PostgreSQL**.
- Data model terdiri dari tabel `User`, `Room`, dan `Reservation`.

### 3. 👥 Seeder Minimal (10 Ruangan & 10 Pengguna)
Sudah tersedia seeder bawaan dengan:
- **10 Ruangan Default**: `GDA-101`, `GDA-102`, `GDA-103`, `GDA-104`, `GDA-105`, `GDB-101`, `GDB-104`, `GDC-101`, `GDC-102`, `GDD-101`.
- **10 Pengguna Default**:
  - **2 Admin**:
    - `admin@kampus.ac.id` / `admin123` (Administrator Utama)
    - `admin.sarpras@kampus.ac.id` / `admin123` (Admin Subbag Sarpras)
  - **8 Dosen**:
    - `dosen1@kampus.ac.id` s/d `dosen8@kampus.ac.id` / `dosen123`

### 4. 🚪 CRUD Data Ruangan & 🔄 WebService Sync
- **CRUD Ruangan**: Admin dapat menambah, mengubah detail, dan menghapus ruangan. Menggunakan pencegahan duplikasi Kode Ruang & Nama Ruangan.
- **Sinkronisasi WebService**: Fitur sync otomatis data ruangan dari WebService API:
  `https://api-ruangan.vercel.app/rooms`
  Data di-upsert berdasarkan `kode_ruang` tanpa merusak riwayat peminjaman yang ada.

### 5. 📅 Pengajuan Peminjaman, Edit, & Approval Admin
- **Dosen**: Mengajukan & mengedit peminjaman ruangan dengan memilih ruangan, tanggal, jam mulai, jam selesai, dan keperluan kegiatan.
- **Admin**: Menelaah dan menyetujui (**Approve**) atau menolak (**Reject**) pengajuan beserta memberikan catatan/alasan admin.

### 6. 🚫 Pencegahan Bentrok Jadwal (Anti-Collision Logic)
- **Aturan Bisnis Utama**: Ruangan yang **telah disetujui** tidak dapat dipinjam pada slot waktu yang berpotongan di hari yang sama:
  $$\text{Overlap} \iff (\text{start}_{\text{baru}} < \text{end}_{\text{lama}}) \land (\text{end}_{\text{baru}} > \text{start}_{\text{lama}})$$
- Validasi dilakukan secara ganda: pada saat Dosen membuat/mengedit pengajuan dan saat Admin menekan tombol Approve.

### 7. 📊 Dashboard Ringkasan & 🔍 Search / Filter
- Metric Cards: Total Ruangan, Ruangan Tersedia vs Pemeliharaan, Pengajuan Menunggu, Disetujui, Ditolak, dan Selesai.
- Toggle Tema Light / Dark Mode (Default Light).
- Filtering berdasarkan Tanggal (dengan DatePicker & 1-click clear), Status (`Menunggu`, `Disetujui`, `Ditolak`, `Selesai`), Gedung (opsi gedung tidak hilang saat terfilter), Jenis Ruangan (`kelas`, `pertemuan`, `rapat`), dan Pencarian Teks.

### 8. 🧪 Automated Testing (Vitest)
Tersedia 5 test suite otomatis (16 unit tests) yang mencakup:
1. `__tests__/conflict.test.ts`: Pengujian logika deteksi bentrok jadwal.
2. `__tests__/auth.test.ts`: Pengujian hashing bcrypt dan pemrosesan token JWT.
3. `__tests__/sync.test.ts`: Pengujian transformasi & pemetaan data dari WebService API.
4. `__tests__/reservation.test.ts`: Pengujian transisi status & validasi waktu.
5. `__tests__/filter.test.ts`: Pengujian algoritma filter dan pencarian ruangan.

---

## 🚀 Panduan Instalasi & Jalankan Lokal

### Prerequisites
- **Node.js**: v18.x atau v20.x
- **npm** / **yarn** / **pnpm**

### Langkah-Langkah

1. **Clone & Masuk ke Direktori Proyek**:
   ```bash
   cd my-app
   ```

2. **Instalasi Dependencies**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables (`.env`)**:
   Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   *Atau untuk pengguna Windows (Command Prompt / PowerShell)*:
   ```powershell
   copy .env.example .env
   ```

   Isi file `.env` akan secara otomatis berisi konfigurasi database Neon PostgreSQL & JWT Secret:
   ```env
   DATABASE_URL="postgresql://neondb_owner:npg_fs0pGnwEz6Qk@ep-morning-fog-aza6tehy-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
   JWT_SECRET="super-secret-jwt-key-peminjaman-ruangan-2026"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Migrasi Database & Seeder**:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Buka peramban di `http://localhost:3000`.

---

## 🧪 Jalankan Automated Tests

Untuk menjalankan seluruh 5 test suite otomatis:
```bash
npm run test
```
atau
```bash
npx vitest run
```

---

## 🔑 Kredensial Uji Coba Cepat (Seeder Accounts)

Pada halaman Login (`http://localhost:3000/login`), Anda dapat menekan tombol **"Akun Admin"** atau **"Akun Dosen"** untuk pengisian cepat otomatis:

| Role | Email | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@kampus.ac.id` | `admin123` | Administrator Utama (Dapat Approve/Reject, CRUD Ruangan, Sync API) |
| **ADMIN** | `admin.sarpras@kampus.ac.id` | `admin123` | Admin Sarpras |
| **DOSEN** | `dosen1@kampus.ac.id` | `dosen123` | Prof. Dr. Ahmad Dahlan, M.T. (Dapat Mengajukan & Mengedit Peminjaman) |
| **DOSEN** | `dosen2@kampus.ac.id` | `dosen123` | Dr. Budi Santoso, M.Kom. |

---

## 📦 Struktur Proyek

```
my-app/
├── app/
│   ├── api/
│   │   ├── auth/          # Endpoint Login, Logout, Me
│   │   ├── dashboard/     # Endpoint Ringkasan Statistik
│   │   ├── reservations/  # Endpoint CRUD, Edit, & Persetujuan Peminjaman
│   │   └── rooms/         # Endpoint CRUD & Sync Ruangan WebService
│   ├── dashboard/         # Halaman Dashboard, Data Ruangan, Peminjaman
│   ├── login/             # Halaman Login
│   ├── globals.css        # Styling Glassmorphism & Tailwind CSS v4 Theme
│   └── layout.tsx
├── components/            # Komponen UI Navigation & Layout
├── lib/
│   ├── auth.ts            # Hashing & Token Helper
│   ├── conflict.ts        # Algoritma Anti-Bentrok Jadwal
│   ├── db.ts              # Prisma Client Singleton
│   └── sync-rooms.ts      # Integrasi API https://api-ruangan.vercel.app/rooms
├── prisma/
│   ├── schema.prisma      # Prisma Schema Models
│   └── seed.ts            # Seeder 10 Ruangan & 10 User
├── __tests__/             # 5 Automated Test Suites (Vitest)
├── .env.example           # Contoh Berkas Environment Variables
└── README.md
```
