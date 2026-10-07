const multer = require('multer');

// Gunakan Memory Storage agar kompatibel secara native dengan Vercel Serverless (read-only filesystem)
const storage = multer.memoryStorage();

// Filter jenis file (hanya gambar)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung! Hanya file gambar (JPG, PNG, WEBP, SVG) yang diperbolehkan.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 4.5 * 1024 * 1024 // 4.5 MB (Batas aman payload serverless Vercel)
  }
});

module.exports = upload;
