const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Deteksi konfigurasi Cloudinary dari Environment Variables
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_URL ||
  (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
);

if (isCloudinaryConfigured) {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config();
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }
}

/**
 * Menyimpan media yang diunggah ke storage yang tepat:
 * 1. Cloudinary CDN (Jika kredensial disetel di Vercel Environment Variables)
 * 2. Disk Lokal (Jika berjalan di localhost dan direktori writable)
 * 3. Base64 Data URI (Fallback otomatis untuk Vercel Serverless tanpa perlu external service)
 */
async function processUploadedMedia(file) {
  if (!file || !file.buffer) return null;

  // 1. Prioritas Cloudinary (Solusi CDN terbaik untuk Production Vercel)
  if (isCloudinaryConfigured) {
    try {
      return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'campus_lost_found',
            resource_type: 'auto'
          },
          (error, result) => {
            if (error) {
              console.error('[Media] Cloudinary upload error:', error);
              // Fallback aman ke Base64 jika koneksi Cloudinary bermasalah
              const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
              return resolve(base64);
            }
            resolve(result.secure_url);
          }
        );
        uploadStream.end(file.buffer);
      });
    } catch (err) {
      console.error('[Media] Error saat upload ke Cloudinary:', err);
    }
  }

  // 2. Jika di localhost (bukan Vercel), simpan ke public/uploads/
  const isVercel = Boolean(process.env.VERCEL);
  if (!isVercel) {
    try {
      const uploadDir = path.join(__dirname, '../public/uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = `item-${uniqueSuffix}${ext}`;
      const filePath = path.join(uploadDir, filename);

      fs.writeFileSync(filePath, file.buffer);
      return `/uploads/${filename}`;
    } catch (diskErr) {
      console.warn('[Media] File system read-only atau disk gagal, beralih ke Base64:', diskErr.message);
    }
  }

  // 3. Fallback Otomatis untuk Vercel Serverless: Base64 Data URI
  // Memungkinkan media langsung tersimpan di MongoDB tanpa konfigurasi pihak ketiga
  console.log('[Media] Mengonversi gambar ke Base64 Data URI untuk penyimpanan Vercel Serverless');
  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
}

module.exports = {
  processUploadedMedia,
  isCloudinaryConfigured
};
