require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const { Item } = require('./models/Item');
const itemController = require('./controllers/itemController');
const upload = require('./middleware/upload');

const app = express();
const PORT = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/campus_lost_found';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sajikan file statis frontend dan uploads lokal dari folder public/
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// === RESTful API Endpoints ===
// 1. Ambil daftar barang dengan filter dinamis & pencarian
app.get('/api/items', itemController.getItems);

// 2. Ambil statistik ringkasan dashboard
app.get('/api/stats', itemController.getStats);

// 3. Ambil detail satu barang
app.get('/api/items/:id', itemController.getItemById);

// 4. Buat laporan barang baru (Lost / Found) dengan upload foto lokal
app.post('/api/items', upload.single('image'), itemController.createItem);

// 5. Update status barang (pending <-> resolved)
app.patch('/api/items/:id/status', itemController.updateItemStatus);

// 6. Smart Matching Engine untuk mencari barang yang cocok
app.get('/api/items/:id/matches', itemController.getSmartMatches);

// Fallback SPA routing ke index.html untuk route non-API
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal pada server',
    error: err.message
  });
});

// Database Connection Manager (Cached untuk Vercel Serverless & Localhost)
let dbPromise = null;
async function ensureDatabaseConnected() {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (!dbPromise) {
    dbPromise = mongoose.connect(DATABASE_URL, {
      serverSelectionTimeoutMS: 4000
    }).then(async () => {
      console.log('[Database] Terhubung ke MongoDB secara sukses!');
      await Item.seedData();
    }).catch(async (err) => {
      console.warn('[Database] Peringatan: Tidak dapat terhubung ke MongoDB server:', err.message);
      console.log('[Database] Beralih otomatis ke In-Memory Data Store.');
      await Item.seedData();
    });
  }
  return dbPromise;
}

// Middleware untuk memastikan koneksi DB siap sebelum menangani request API
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    await ensureDatabaseConnected();
  }
  next();
});

// Jalankan standalone listener jika berjalan di lokal (bukan Vercel Serverless)
async function startServer() {
  console.log('--------------------------------------------------');
  console.log('  CAMPUS LOST & FOUND HUB - LOCAL DEVELOPMENT');
  console.log('--------------------------------------------------');

  await ensureDatabaseConnected();

  app.listen(PORT, () => {
    console.log(`[Server] Aplikasi berjalan aktif di: http://localhost:${PORT}`);
    console.log(`[API] Endpoint RESTful aktif di: http://localhost:${PORT}/api/items`);
    console.log('--------------------------------------------------');
  });
}

if (!process.env.VERCEL) {
  startServer();
}

module.exports = app;
