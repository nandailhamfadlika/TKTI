# 🎓 Campus Lost & Found Hub

**Campus Lost & Found Hub** adalah sistem informasi modern berbasis web fullstack untuk pelaporan, penelusuran, dan pencocokan otomatis barang hilang (*lost*) serta temuan (*found*) di lingkungan kampus.

Aplikasi ini dilengkapi dengan **Smart Matching Engine** cerdas yang mengkalkulasi tingkat kemiripan barang berdasarkan bobot kategori, kedekatan lokasi gedung, serta ekstraksi dan pembersihan kata kunci deskripsi fisik tanpa stopwords.

---

## 🌟 Fitur Utama

1. **Dual-Action Reporting:**
   - Formulir khusus **+ Lapor Kehilangan (Lost)** beraksen merah/rose.
   - Formulir khusus **+ Lapor Penemuan (Found)** beraksen hijau/emerald.
   - Validasi data lengkap (kategori, gedung lokasi, kontak WhatsApp format `628xxx`, ciri fisik).

2. **Smart Matching Engine (AI-Like Keyword Matcher):**
   - Menganalisis barang lawan yang berstatus *pending* (Lost $\leftrightarrow$ Found).
   - Ekstraksi token kata kunci dengan mengabaikan kata penghubung/stopwords Indonesia (*di, ke, dari, yang, dan, hilang, ditemukan, dll*).
   - Algoritma pembobotan skor kecocokan:
     - **Kategori Identik:** Bobot **35%**.
     - **Kesamaan Lokasi / Area Gedung:** Bobot **20%**.
     - **Overlap Kata Kunci Judul & Deskripsi:** Bobot **45%** (dengan multiplier khusus untuk kata kunci judul).
   - Menampilkan persentase kecocokan (*match score*), level peluang (*Sangat Tinggi, Tinggi, Sedang*), serta penjelasan alasan kecocokan.

3. **Direct Claim via WhatsApp:**
   - Tombol otomatis menuju chat WhatsApp pelapor/penemu dengan template pesan terstruktur:
     ```text
     https://wa.me/{contact}?text=Halo%20{reporterName},%20saya%20melihat%20laporan%20Anda%20di%20Campus%20Lost%20%26%20Found%20Hub%20terkait%20{title}.%20Saya%20ingin%20mengonfirmasi%20pengembalian/klaim%20barang%20tersebut.
     ```

4. **Interactive Filters & Real-time Search:**
   - Filter cepat berdasarkan status (*Belum Diambil* vs *Sudah Dikembalikan*).
   - Filter tab tipe laporan (*Semua*, *Barang Hilang*, *Ditemukan*).
   - Filter multi-kategori (KTM, Kunci, Elektronik, Dokumen, Dompet, Lainnya).
   - Filter lokasi spesifik (Gedung A, Gedung B, Perpustakaan, Kantin, Parkiran Utama, Musala, Auditorium).
   - Pencarian teks instan (debounced).

5. **Direct Status Toggle:**
   - Memungkinkan pengubah status barang antara `pending` (Belum Diambil) dan `resolved` (Sudah Dikembalikan) langsung dari antarmuka.

6. **Local Photo Upload & Visual Recognition:**
   - Fitur upload foto barang agar mudah dikenali secara visual oleh mahasiswa dan staf keamanan kampus.
   - File foto disimpan secara lokal di direktori server `public/uploads/` menggunakan `multer`.
   - Dilengkapi dropzone interaktif, pratinjau thumbnail instan sebelum kirim, pembatasan tipe file (JPG, PNG, WEBP), serta batas ukuran maksimal 5MB.
   - Foto ditampilkan pada kartu grid, modal detail resolusi tinggi, dan thumbnail pada daftar rekomendasi *Smart Matcher*.

7. **Dual Database Architecture:**
   - Mendukung **MongoDB dengan Mongoose ODM**.
   - Dilengkapi **Auto-Fallback In-Memory Store** jika daemon MongoDB lokal tidak aktif, sehingga proyek dapat **langsung dijalankan out-of-the-box tanpa setup database tambahan**.
   - Otomatis menyemai 8 data dummy realistis kampus lengkap dengan sampel visual barang.

---

## 🛠️ Tech Stack

- **Backend Runtime & Framework:** Node.js, Express.js (RESTful API, CORS, JSON Body Parser).
- **File Upload Handler:** Multer (local disk storage di `public/uploads/`).
- **Database & ODM:** MongoDB dengan Mongoose (dengan seamless fallback in-memory repository).
- **Frontend SPA:** HTML5, Modern Tailwind CSS (via CDN), FontAwesome Icons, Vanilla ES6+ Modular JavaScript dengan native Fetch API.
- **Environment:** Dotenv (`.env`).

---

## 📁 Struktur Direktori

```text
├── package.json               # Konfigurasi dependensi & npm scripts
├── .env.example               # Contoh konfigurasi environment variable
├── .env                       # Environment aktif (PORT, DATABASE_URL)
├── server.js                  # Setup Express server, routes API, DB connection
├── middleware/
│   └── upload.js              # Konfigurasi Multer untuk penyimpanan foto lokal
├── models/
│   └── Item.js                # Schema Mongoose, seed data 8 item kampus, & fallback adapter
├── controllers/
│   └── itemController.js      # RESTful controller + Smart Matching Engine algorithm
├── public/
│   ├── index.html             # UI antarmuka Tailwind CSS (Dark Modern Tech theme)
│   ├── app.js                 # Frontend application logic & Fetch API integration
│   └── uploads/               # Direktori penyimpanan foto lokal barang kampus
└── README.md                  # Dokumentasi proyek
```

---

## 🚀 Panduan Menjalankan Aplikasi Secara Lokal

### 1. Prasyarat
- Pastikan telah menginstal [Node.js](https://nodejs.org/) (versi 16 atau lebih baru).

### 2. Instalasi Dependensi
Buka terminal pada direktori proyek, lalu jalankan:
```bash
npm install
```

### 3. Konfigurasi Environment (Opsional)
File `.env` telah disiapkan secara otomatis. Anda dapat mengubah port atau URL MongoDB jika diinginkan:
```env
PORT=5000
DATABASE_URL=mongodb://127.0.0.1:27017/campus_lost_found
```
> **Catatan:** Jika server MongoDB tidak aktif di komputer Anda, aplikasi akan **secara otomatis beralih ke penyimpanan In-Memory** tanpa error, sehingga seluruh fitur tetap dapat dicoba secara instan.

### 4. Menjalankan Server
Jalankan perintah:
```bash
npm start
```
Atau untuk mode development dengan auto-reload (Node.js 18+):
```bash
npm run dev
```

### 5. Akses Aplikasi
Buka peramban (browser) dan buka alamat:
```
http://localhost:5000
```

---

## 📡 Dokumentasi Endpoint RESTful API

| Method | Endpoint | Deskripsi | Query / Body Params |
|---|---|---|---|
| `GET` | `/api/items` | Mengambil daftar barang | Query: `type`, `category`, `location`, `status`, `q` |
| `GET` | `/api/items/:id` | Mengambil detail satu barang | Param: `id` |
| `POST` | `/api/items` | Mendaftarkan laporan barang baru | Body: `type`, `title`, `category`, `location`, `description`, `reporterName`, `contact` |
| `PATCH` | `/api/items/:id/status` | Mengubah status barang (`pending` / `resolved`) | Body (opsional): `{ status: "resolved" }` |
| `GET` | `/api/items/:id/matches` | **Smart Matching Engine** mencari barang yang cocok | Param: `id` |
| `GET` | `/api/stats` | Statistik ringkasan barang | - |

---

## 🧪 Skenario Pengujian Smart Matching Engine

Data seed awal telah memuat 8 item kampus realistis dengan pasangan yang saling mencocokkan:
1. **KTM Mahasiswa Nurul Fikri an. Rizky Pratama** (Lost, Gedung A) $\leftrightarrow$ **KTM Mahasiswa NF di Lorong Gedung A** (Found, Gedung A) $\rightarrow$ *Skor kecocokan sangat tinggi (>85%)*.
2. **Kunci Motor Honda Beat Hitam** (Lost, Parkiran Utama) $\leftrightarrow$ **Gantungan Kunci Motor Honda & Boneka Beruang** (Found, Parkiran Utama) $\rightarrow$ *Skor kecocokan tinggi (>80%)*.
3. **Earphone TWS Baseus Encok WM01 Putih** (Lost, Perpustakaan) $\leftrightarrow$ **TWS Baseus Putih di Meja Belajar** (Found, Perpustakaan) $\rightarrow$ *Skor kecocokan tinggi (>85%)*.
4. Klik tombol **"Detail & Match"** pada salah satu barang di atas untuk melihat engine bekerja secara interaktif!

---

## ☁️ Panduan Deployment ke Vercel (Lengkap Media & Environment)

### 1. Mengapa Upload Media Awalnya Gagal di Vercel?
Di platform Vercel Serverless (AWS Lambda):
- Sistem berkas (*filesystem*) bersifat **Read-Only** (`EROFS: read-only file system`). Server tidak dapat menulis file baru secara permanen ke direktori lokal `public/uploads/`.
- Setiap request ditangani oleh fungsi serverless yang bersifat *stateless* dan *ephemeral*.

### 2. Solusi Arsitektur yang Diterapkan:
- **`multer.memoryStorage()`**: File foto diterima langsung di memori (*buffer*), bukan disk fisik.
- **Dukungan Cloudinary CDN**: Jika kredensial Cloudinary disetel, foto otomatis diunggah ke CDN Cloudinary berkecepatan tinggi.
- **Auto-Fallback Base64 Data URI (Zero-Config)**: Jika Anda belum mendaftar Cloudinary, sistem otomatis mengubah gambar menjadi Base64 Data URI dan menyimpannya langsung ke database MongoDB. **Upload media langsung berfungsi di Vercel tanpa perlu setup pihak ketiga!**
- **Berkas `vercel.json`**: Mengonfigurasi Express serverless runtime dan routing otomatis.

### 3. Konfigurasi Environment Variables di Dashboard Vercel

Buka **Vercel Dashboard** $\rightarrow$ Pilih Project Anda $\rightarrow$ Tab **Settings** $\rightarrow$ **Environment Variables**.

Tambahkan variabel berikut:

| Nama Variabel | Contoh Nilai | Keterangan |
|---|---|---|
| `DATABASE_URL` | `mongodb+srv://admin:pass@cluster0.abc.mongodb.net/campus_lost_found?retryWrites=true&w=majority` | **Wajib:** Koneksi MongoDB Atlas agar data persisten di cloud |
| `NODE_ENV` | `production` | Mode produksi |
| `CLOUDINARY_CLOUD_NAME` | `my-campus-hub` | *(Opsional)* Cloud Name dari Cloudinary |
| `CLOUDINARY_API_KEY` | `987654321012345` | *(Opsional)* API Key dari Cloudinary |
| `CLOUDINARY_API_SECRET` | `A_BcDeFgHiJkLmNoPqRsTuVwXyZ` | *(Opsional)* API Secret dari Cloudinary |

Setelah menambahkan Environment Variables, lakukan **Redeploy** di Vercel (*Deployments* $\rightarrow$ klik titik tiga $\rightarrow$ *Redeploy*).

