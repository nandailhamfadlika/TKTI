const mongoose = require('mongoose');

// Skema Mongoose standar
const itemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['lost', 'found'],
      required: [true, 'Tipe barang (lost/found) wajib diisi']
    },
    title: {
      type: String,
      required: [true, 'Judul barang wajib diisi'],
      trim: true
    },
    category: {
      type: String,
      enum: ['ktm', 'kunci', 'elektronik', 'dokumen', 'dompet', 'lainnya'],
      required: [true, 'Kategori barang wajib dipilih']
    },
    location: {
      type: String,
      required: [true, 'Lokasi kejadian/penemuan wajib diisi'],
      trim: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String,
      required: [true, 'Deskripsi ciri-ciri barang wajib diisi'],
      trim: true
    },
    reporterName: {
      type: String,
      required: [true, 'Nama pelapor wajib diisi'],
      trim: true
    },
    contact: {
      type: String,
      required: [true, 'Nomor WhatsApp kontak wajib diisi'],
      trim: true
    },
    imageUrl: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'resolved'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Mongoose Model
const MongooseItem = mongoose.model('Item', itemSchema);

// Data 8 Seed Dummy Realistis Kampus
const initialSeedData = [
  {
    _id: '66fa8101a111111111111101',
    type: 'lost',
    title: 'KTM Mahasiswa Nurul Fikri an. Rizky Pratama',
    category: 'ktm',
    location: 'Gedung A',
    date: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    description: 'KTM berwarna biru berlogo NF dengan gantungan tali merah NF-Card. Hilang di sekitar koridor lantai 2 Gedung A.',
    reporterName: 'Rizky Pratama',
    contact: '6281234567890',
    imageUrl: '/uploads/ktm-sample.svg',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000)
  },
  {
    _id: '66fa8101a111111111111102',
    type: 'found',
    title: 'KTM Mahasiswa NF di Lorong Gedung A',
    category: 'ktm',
    location: 'Gedung A',
    date: new Date(Date.now() - 1 * 24 * 3600 * 1000),
    description: 'Ditemukan kartu tanda mahasiswa warna biru an. Rizky P. di bangku lorong Gedung A lantai 2 dekat laboratorium.',
    reporterName: 'Budi Santoso (Security Gedung A)',
    contact: '6281298765432',
    imageUrl: '/uploads/ktm-sample.svg',
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000)
  },
  {
    _id: '66fa8101a111111111111103',
    type: 'lost',
    title: 'Kunci Motor Honda Beat Hitam',
    category: 'kunci',
    location: 'Parkiran Utama',
    date: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    description: 'Kunci motor Honda Beat ada gantungan boneka beruang kecil warna cokelat dan remote alarm.',
    reporterName: 'Amanda Putri',
    contact: '6285712345678',
    imageUrl: '/uploads/kunci-sample.svg',
    status: 'pending',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000)
  },
  {
    _id: '66fa8101a111111111111104',
    type: 'found',
    title: 'Gantungan Kunci Motor Honda & Boneka Beruang',
    category: 'kunci',
    location: 'Parkiran Utama',
    date: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    description: 'Ditemukan anak kunci motor Honda dengan gantungan boneka beruang mini cokelat di paving blok dekat pos parkiran utama.',
    reporterName: 'Pak Joko (Petugas Parkir)',
    contact: '6281311223344',
    imageUrl: '/uploads/kunci-sample.svg',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000)
  },
  {
    _id: '66fa8101a111111111111105',
    type: 'lost',
    title: 'Earphone TWS Baseus Encok WM01 Putih',
    category: 'elektronik',
    location: 'Perpustakaan',
    date: new Date(Date.now() - 4 * 24 * 3600 * 1000),
    description: 'Casing dan sepasang earphone Baseus warna putih tertinggal di bilik belajar lantai 3 dekat rak buku komputer.',
    reporterName: 'Dimas Arya',
    contact: '6287890123456',
    imageUrl: '/uploads/tws-sample.svg',
    status: 'pending',
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
    updatedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000)
  },
  {
    _id: '66fa8101a111111111111106',
    type: 'found',
    title: 'TWS Baseus Putih di Meja Belajar',
    category: 'elektronik',
    location: 'Perpustakaan',
    date: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    description: 'Ditemukan tempat earphone wireless merk Baseus warna putih di bilik meja baca perpustakaan lantai 3.',
    reporterName: 'Siti Nurhaliza (Pustakawati)',
    contact: '6281908765432',
    imageUrl: '/uploads/tws-sample.svg',
    status: 'pending',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000)
  },
  {
    _id: '66fa8101a111111111111107',
    type: 'lost',
    title: 'Dompet Lipat Kulit Coklat Baellerry',
    category: 'dompet',
    location: 'Kantin',
    date: new Date(Date.now() - 5 * 24 * 3600 * 1000),
    description: 'Dompet pria kulit coklat merk Baellerry berisi KTP, kartu mahasiswa, dan kartu Flazz. Terjatuh saat makan siang di kantin kampus.',
    reporterName: 'Fajar Ramadhan',
    contact: '6282123456789',
    imageUrl: '/uploads/dompet-sample.svg',
    status: 'pending',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000)
  },
  {
    _id: '66fa8101a111111111111108',
    type: 'found',
    title: 'Map Dokumen Berkas Skripsi & Transkrip Nilai',
    category: 'dokumen',
    location: 'Auditorium',
    date: new Date(Date.now() - 1 * 24 * 3600 * 1000),
    description: 'Ditemukan stopmap merah berisi draft bimbingan skripsi dan transkrip nilai atas nama mahasiswi prodi TI angkatan 2021 di bangku belakang auditorium.',
    reporterName: 'Panitia Seminar Lab TI',
    contact: '6285678901234',
    imageUrl: '/uploads/dokumen-sample.svg',
    status: 'resolved',
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000)
  }
];

// In-Memory Repository Fallback (Aktif otomatis jika MongoDB tidak terhubung)
class InMemoryItemRepository {
  constructor() {
    this.items = JSON.parse(JSON.stringify(initialSeedData));
  }

  async find(query = {}) {
    let result = [...this.items];

    if (query.type) {
      result = result.filter(item => item.type === query.type);
    }
    if (query.category) {
      result = result.filter(item => item.category === query.category);
    }
    if (query.location) {
      result = result.filter(item => item.location.toLowerCase() === query.location.toLowerCase());
    }
    if (query.status) {
      result = result.filter(item => item.status === query.status);
    }
    if (query.$or && Array.isArray(query.$or)) {
      result = result.filter(item => {
        return query.$or.some(condition => {
          if (condition.title && condition.title.$regex) {
            return new RegExp(condition.title.$regex, condition.title.$options || 'i').test(item.title);
          }
          if (condition.description && condition.description.$regex) {
            return new RegExp(condition.description.$regex, condition.description.$options || 'i').test(item.description);
          }
          return false;
        });
      });
    }

    // Urutkan dari yang terbaru (createdAt desc)
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return result;
  }

  async findById(id) {
    const item = this.items.find(i => String(i._id) === String(id));
    return item ? JSON.parse(JSON.stringify(item)) : null;
  }

  async create(data) {
    const newItem = {
      _id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      type: data.type,
      title: data.title.trim(),
      category: data.category,
      location: data.location.trim(),
      date: data.date ? new Date(data.date) : new Date(),
      description: data.description.trim(),
      reporterName: data.reporterName.trim(),
      contact: data.contact.trim(),
      imageUrl: data.imageUrl || null,
      status: data.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.items.unshift(newItem);
    return newItem;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const index = this.items.findIndex(i => String(i._id) === String(id));
    if (index === -1) return null;

    const current = this.items[index];
    const updated = {
      ...current,
      ...(update.$set || update),
      updatedAt: new Date()
    };
    this.items[index] = updated;
    return options.new ? updated : current;
  }

  async countDocuments(query = {}) {
    const res = await this.find(query);
    return res.length;
  }

  async seedIfEmpty() {
    if (this.items.length === 0) {
      this.items = JSON.parse(JSON.stringify(initialSeedData));
    }
  }
}

const memoryRepo = new InMemoryItemRepository();

// Abstraksi Unified Database Layer
const Item = {
  isMongooseConnected() {
    return mongoose.connection.readyState === 1;
  },

  async find(filter = {}) {
    if (this.isMongooseConnected()) {
      return await MongooseItem.find(filter).sort({ createdAt: -1 }).lean();
    }
    return await memoryRepo.find(filter);
  },

  async findById(id) {
    if (this.isMongooseConnected()) {
      return await MongooseItem.findById(id).lean();
    }
    return await memoryRepo.findById(id);
  },

  async create(data) {
    if (this.isMongooseConnected()) {
      const doc = new MongooseItem(data);
      return await doc.save();
    }
    return await memoryRepo.create(data);
  },

  async findByIdAndUpdate(id, update, options = { new: true }) {
    if (this.isMongooseConnected()) {
      return await MongooseItem.findByIdAndUpdate(id, update, options).lean();
    }
    return await memoryRepo.findByIdAndUpdate(id, update, options);
  },

  async countDocuments(filter = {}) {
    if (this.isMongooseConnected()) {
      return await MongooseItem.countDocuments(filter);
    }
    return await memoryRepo.countDocuments(filter);
  },

  async seedData() {
    if (this.isMongooseConnected()) {
      const count = await MongooseItem.countDocuments();
      if (count === 0) {
        console.log('[Database] MongoDB kosong. Menyemai 8 data dummy kampus...');
        const cleanSeeds = initialSeedData.map(({ _id, ...rest }) => rest);
        await MongooseItem.insertMany(cleanSeeds);
        console.log('[Database] Berhasil menyemai data dummy ke MongoDB.');
      }
    } else {
      await memoryRepo.seedIfEmpty();
      console.log('[Database] In-memory store siap dengan 8 data dummy kampus.');
    }
  }
};

module.exports = {
  Item,
  MongooseItem,
  initialSeedData
};
