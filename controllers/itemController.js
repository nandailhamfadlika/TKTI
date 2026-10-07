const { Item } = require('../models/Item');
const { processUploadedMedia } = require('../services/mediaService');

// Daftar Stop Words Bahasa Indonesia & Frasa Umum Kampus
const STOP_WORDS = new Set([
  'di', 'ke', 'dari', 'yang', 'dan', 'atau', 'ini', 'itu', 'ada', 'pada', 'untuk',
  'dengan', 'saya', 'anda', 'kamu', 'dia', 'mereka', 'kami', 'atas', 'nama', 'telah',
  'ter', 'sebuah', 'satu', 'si', 'lah', 'kah', 'pun', 'oleh', 'saat', 'sekitar', 'dekat',
  'lantai', 'meja', 'hilang', 'kehilangan', 'ditemukan', 'penemuan', 'mencari', 'dicari',
  'tolong', 'hubungi', 'barang', 'bisa', 'mohon', 'an', 'nomor', 'no', 'posisi', 'adalah',
  'dalam', 'luar', 'karena', 'jika', 'bila', 'apabila', 'sudah', 'belum', 'sedang'
]);

/**
 * Ekstraksi token kata kunci bersih dari teks
 */
function extractKeywords(text = '') {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .map(word => word.trim())
    .filter(word => word.length >= 3 && !STOP_WORDS.has(word));
}

/**
 * 1. GET /api/items
 * Mengambil daftar barang dengan filter & search
 */
exports.getItems = async (req, res) => {
  try {
    const { type, category, location, status, q } = req.query;
    const filter = {};

    if (type && ['lost', 'found'].includes(type)) {
      filter.type = type;
    }

    if (category && ['ktm', 'kunci', 'elektronik', 'dokumen', 'dompet', 'lainnya'].includes(category)) {
      filter.category = category;
    }

    if (location && location.trim() !== '') {
      filter.location = location.trim();
    }

    if (status && ['pending', 'resolved'].includes(status)) {
      filter.status = status;
    }

    if (q && q.trim() !== '') {
      const keyword = q.trim();
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { location: { $regex: keyword, $options: 'i' } },
        { reporterName: { $regex: keyword, $options: 'i' } }
      ];
    }

    const items = await Item.find(filter);

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
      message: 'Daftar barang berhasil diambil'
    });
  } catch (error) {
    console.error('Error in getItems:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar barang',
      error: error.message
    });
  }
};

/**
 * 2. GET /api/items/:id
 * Mengambil detail satu barang
 */
exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Barang dengan ID tersebut tidak ditemukan'
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
      message: 'Detail barang ditemukan'
    });
  } catch (error) {
    console.error('Error in getItemById:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mencari barang',
      error: error.message
    });
  }
};

/**
 * 3. POST /api/items
 * Mendaftarkan barang baru (Lost / Found)
 */
exports.createItem = async (req, res) => {
  try {
    const { type, title, category, location, date, description, reporterName, contact } = req.body;

    // Validasi field wajib
    const requiredFields = { type, title, category, location, description, reporterName, contact };
    const missing = Object.entries(requiredFields)
      .filter(([_, val]) => !val || String(val).trim() === '')
      .map(([key]) => key);

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Field berikut wajib diisi: ${missing.join(', ')}`
      });
    }

    // Validasi tipe barang
    if (!['lost', 'found'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipe barang harus berupa "lost" (kehilangan) atau "found" (penemuan)'
      });
    }

    // Validasi kategori
    const validCategories = ['ktm', 'kunci', 'elektronik', 'dokumen', 'dompet', 'lainnya'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Kategori harus salah satu dari: ${validCategories.join(', ')}`
      });
    }

    // Pembersihan & formatting kontak WhatsApp
    let cleanContact = String(contact).replace(/\D/g, '');
    if (cleanContact.startsWith('08')) {
      cleanContact = '628' + cleanContact.slice(2);
    } else if (cleanContact.startsWith('8')) {
      cleanContact = '628' + cleanContact.slice(1);
    }

    // Ambil path / URL foto (Cloudinary / Disk / Base64 fallback)
    let imageUrl = null;
    if (req.file) {
      imageUrl = await processUploadedMedia(req.file);
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl.trim();
    }

    const newItem = await Item.create({
      type,
      title: title.trim(),
      category,
      location: location.trim(),
      date: date ? new Date(date) : new Date(),
      description: description.trim(),
      reporterName: reporterName.trim(),
      contact: cleanContact,
      imageUrl,
      status: 'pending'
    });

    return res.status(201).json({
      success: true,
      data: newItem,
      message: 'Laporan barang berhasil disimpan ke dalam sistem'
    });
  } catch (error) {
    console.error('Error in createItem:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal membuat laporan barang',
      error: error.message
    });
  }
};

/**
 * 4. PATCH /api/items/:id/status
 * Mengubah status barang antara pending dan resolved
 */
exports.updateItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Barang tidak ditemukan'
      });
    }

    // Tentukan status baru (jika diberikan di body gunakan itu, jika tidak toggle otomatis)
    let newStatus = req.body && req.body.status;
    if (!newStatus || !['pending', 'resolved'].includes(newStatus)) {
      newStatus = item.status === 'pending' ? 'resolved' : 'pending';
    }

    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { $set: { status: newStatus } },
      { new: true }
    );

    const statusLabel = newStatus === 'resolved' ? 'Sudah Dikembalikan' : 'Belum Diambil (Pending)';

    return res.status(200).json({
      success: true,
      data: updatedItem,
      message: `Status barang berhasil diubah menjadi: ${statusLabel}`
    });
  } catch (error) {
    console.error('Error in updateItemStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengubah status barang',
      error: error.message
    });
  }
};

/**
 * 5. GET /api/items/:id/matches
 * Smart Matching Engine:
 * - Menemukan barang berlawanan tipe (lost <-> found) yang berstatus 'pending'.
 * - Menghitung skor kecocokan berdasarkan:
 *   a. Kategori (Bobot 35%)
 *   b. Kesamaan Lokasi (Bobot 20%)
 *   c. Overlap Kata Kunci Judul & Deskripsi (Bobot 45%)
 */
exports.getSmartMatches = async (req, res) => {
  try {
    const { id } = req.params;
    const targetItem = await Item.findById(id);

    if (!targetItem) {
      return res.status(404).json({
        success: false,
        message: 'Barang rujukan tidak ditemukan'
      });
    }

    // Tentukan tipe yang menjadi target pencocokan
    const oppositeType = targetItem.type === 'lost' ? 'found' : 'lost';

    // Cari semua barang lawan dengan status 'pending'
    const candidateItems = await Item.find({
      type: oppositeType,
      status: 'pending'
    });

    // Tokenisasi item acuan
    const targetTitleTokens = extractKeywords(targetItem.title);
    const targetDescTokens = extractKeywords(targetItem.description);
    const allTargetTokens = Array.from(new Set([...targetTitleTokens, ...targetDescTokens]));

    const matches = [];

    for (const candidate of candidateItems) {
      // Lewati item yang sama
      if (String(candidate._id) === String(targetItem._id)) continue;

      let score = 0;
      const reasons = [];
      const matchedTokens = new Set();

      // 1. Bobot Kategori (35 poin)
      const isSameCategory = candidate.category === targetItem.category;
      if (isSameCategory) {
        score += 35;
        reasons.push(`Kategori identik: ${candidate.category.toUpperCase()}`);
      }

      // 2. Bobot Lokasi (20 poin)
      const candLoc = candidate.location.toLowerCase().trim();
      const targLoc = targetItem.location.toLowerCase().trim();
      let isLocationMatch = false;

      if (candLoc === targLoc) {
        score += 20;
        isLocationMatch = true;
        reasons.push(`Lokasi persis sama: "${candidate.location}"`);
      } else if (candLoc.includes(targLoc) || targLoc.includes(candLoc)) {
        score += 15;
        isLocationMatch = true;
        reasons.push(`Area lokasi berdekatan: "${candidate.location}" & "${targetItem.location}"`);
      } else {
        // Cek irisan kata lokasi
        const candLocWords = extractKeywords(candLoc);
        const targLocWords = extractKeywords(targLoc);
        const commonLoc = candLocWords.filter(w => targLocWords.includes(w));
        if (commonLoc.length > 0) {
          score += 10;
          isLocationMatch = true;
          reasons.push(`Gedung/Area terkait: ${commonLoc.join(', ')}`);
        }
      }

      // 3. Bobot Kata Kunci Teks (45 poin)
      const candTitleTokens = extractKeywords(candidate.title);
      const candDescTokens = extractKeywords(candidate.description);
      const allCandTokens = Array.from(new Set([...candTitleTokens, ...candDescTokens]));

      // Cari irisan kata kunci
      for (const token of allTargetTokens) {
        if (allCandTokens.some(candToken => candToken.includes(token) || token.includes(candToken))) {
          matchedTokens.add(token);
        }
      }

      // Hitung bobot overlap kata kunci
      if (matchedTokens.size > 0) {
        // Bonus khusus jika kata judul ada yang cocok
        const titleOverlap = targetTitleTokens.filter(t => candTitleTokens.includes(t));
        let textPoints = (matchedTokens.size / Math.max(2, allTargetTokens.length)) * 35;
        if (titleOverlap.length > 0) {
          textPoints += Math.min(10, titleOverlap.length * 5); // bonus hingga 10 poin
        }

        const cappedTextPoints = Math.min(45, Math.round(textPoints));
        score += cappedTextPoints;
        reasons.push(`Kata kunci cocok (${matchedTokens.size} kata): ${Array.from(matchedTokens).slice(0, 5).join(', ')}`);
      }

      // Pastikan total skor antara 0 - 100
      const finalScore = Math.min(100, Math.max(0, Math.round(score)));

      // Tentukan Level Kecocokan
      let matchLevel = 'Rendah';
      let badgeColor = 'slate';
      if (finalScore >= 70) {
        matchLevel = 'Sangat Tinggi (Peluang Kuat)';
        badgeColor = 'emerald';
      } else if (finalScore >= 45) {
        matchLevel = 'Tinggi (Kemungkinan Cocok)';
        badgeColor = 'cyan';
      } else if (finalScore >= 25) {
        matchLevel = 'Sedang (Perlu Dicek)';
        badgeColor = 'amber';
      }

      // Hanya masukkan yang memiliki relevansi (skor >= 20%)
      if (finalScore >= 20) {
        matches.push({
          item: candidate,
          score: finalScore,
          matchLevel,
          badgeColor,
          categoryMatch: isSameCategory,
          locationMatch: isLocationMatch,
          matchedKeywords: Array.from(matchedTokens),
          reasons
        });
      }
    }

    // Urutkan dari skor tertinggi
    matches.sort((a, b) => b.score - a.score);

    return res.status(200).json({
      success: true,
      count: matches.length,
      targetItem: {
        id: targetItem._id,
        type: targetItem.type,
        title: targetItem.title,
        category: targetItem.category,
        location: targetItem.location,
        status: targetItem.status
      },
      data: matches,
      message: matches.length > 0
        ? `Ditemukan ${matches.length} barang rekomendasi yang berpotensi cocok`
        : 'Belum ada barang berlawanan yang cocok saat ini'
    });
  } catch (error) {
    console.error('Error in getSmartMatches:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menjalankan kalkulasi pencocokan cerdas',
      error: error.message
    });
  }
};

/**
 * 6. GET /api/stats
 * Statistik umum ringkasan sistem
 */
exports.getStats = async (req, res) => {
  try {
    const total = await Item.countDocuments();
    const lost = await Item.countDocuments({ type: 'lost' });
    const found = await Item.countDocuments({ type: 'found' });
    const resolved = await Item.countDocuments({ status: 'resolved' });
    const pending = await Item.countDocuments({ status: 'pending' });

    return res.status(200).json({
      success: true,
      data: {
        total,
        lost,
        found,
        resolved,
        pending
      },
      message: 'Statistik barang berhasil diambil'
    });
  } catch (error) {
    console.error('Error in getStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik',
      error: error.message
    });
  }
};
