/**
 * Campus Lost & Found Hub - Frontend Client Logic
 * Modular Vanilla JavaScript dengan Fetch API & Fresh White Aesthetic
 */

// Application State
const state = {
  items: [],
  filters: {
    type: '',
    category: '',
    location: '',
    status: '',
    q: ''
  },
  currentItem: null,
  searchDebounceTimer: null
};

// Kategori Icons & Labels Mapping (Fresh High-Contrast Palette on White)
const CATEGORY_MAP = {
  ktm: { label: 'KTM / Kartu', icon: 'fa-id-card', color: 'text-sky-700 bg-sky-50 border-sky-200' },
  kunci: { label: 'Kunci', icon: 'fa-key', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  elektronik: { label: 'Elektronik', icon: 'fa-laptop', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  dokumen: { label: 'Dokumen', icon: 'fa-file-lines', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  dompet: { label: 'Dompet / Tas', icon: 'fa-wallet', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  lainnya: { label: 'Lainnya', icon: 'fa-box-archive', color: 'text-slate-700 bg-slate-100 border-slate-200' }
};

// Inisialisasi saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
  fetchStats();
  fetchItems();
});

/**
 * Mengambil ringkasan statistik dari server
 */
async function fetchStats() {
  try {
    const res = await fetch('/api/stats');
    const result = await res.json();
    if (result.success && result.data) {
      document.getElementById('stat-total').innerText = result.data.total;
      document.getElementById('stat-lost').innerText = result.data.lost;
      document.getElementById('stat-found').innerText = result.data.found;
      document.getElementById('stat-resolved').innerText = result.data.resolved;
    }
  } catch (error) {
    console.error('Gagal memuat statistik:', error);
  }
}

/**
 * Mengambil daftar barang dengan query parameter dinamis
 */
async function fetchItems() {
  const container = document.getElementById('itemsContainer');
  const emptyState = document.getElementById('emptyState');
  
  // Tampilkan Skeleton Loading jika kontainer belum terisi
  container.innerHTML = getSkeletonHTML(6);
  emptyState.classList.add('hidden');

  try {
    const params = new URLSearchParams();
    if (state.filters.type) params.append('type', state.filters.type);
    if (state.filters.category) params.append('category', state.filters.category);
    if (state.filters.location) params.append('location', state.filters.location);
    if (state.filters.status) params.append('status', state.filters.status);
    if (state.filters.q) params.append('q', state.filters.q);

    const res = await fetch(`/api/items?${params.toString()}`);
    const result = await res.json();

    if (result.success) {
      state.items = result.data || [];
      document.getElementById('items-badge-count').innerText = `${state.items.length} barang`;

      if (state.items.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
      } else {
        renderItems(state.items);
      }
    } else {
      showToast(result.message || 'Gagal mengambil data barang', 'error');
    }
  } catch (error) {
    console.error('Error fetching items:', error);
    container.innerHTML = `
      <div class="col-span-full text-center py-12 text-rose-500 bg-white rounded-2xl border border-rose-100 shadow-xs">
        <i class="fa-solid fa-triangle-exclamation text-3xl mb-2"></i>
        <p class="font-medium text-sm">Gagal terhubung ke server. Pastikan server lokal berjalan.</p>
      </div>
    `;
  }
}

/**
 * Render daftar kartu barang ke grid UI dengan estetika Fresh White
 */
function renderItems(items) {
  const container = document.getElementById('itemsContainer');
  container.innerHTML = items.map(item => {
    const isLost = item.type === 'lost';
    const isResolved = item.status === 'resolved';
    const cat = CATEGORY_MAP[item.category] || CATEGORY_MAP.lainnya;
    const formattedDate = new Date(item.date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const waLink = generateWhatsAppLink(item);

    // Tampilan Gambar / Banner Ilustrasi
    const imageHTML = item.imageUrl ? `
      <div class="relative h-44 w-full overflow-hidden rounded-xl bg-slate-100 mb-3.5 border border-slate-200/80 cursor-pointer group/img" onclick="openDetailModal('${item._id}')">
        <img 
          src="${item.imageUrl}" 
          alt="${escapeHtml(item.title)}" 
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
          loading="lazy"
          onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\'w-full h-full flex items-center justify-center bg-slate-50 text-slate-400\'><i class=\'fa-solid ${cat.icon} text-3xl\'></i></div>'"
        >
        <div class="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur text-[10px] font-bold text-slate-700 border border-slate-200/80 shadow-xs flex items-center gap-1">
          <i class="fa-solid fa-camera text-[9px] text-brand-600"></i> Foto
        </div>
      </div>
    ` : `
      <div class="relative h-28 w-full overflow-hidden rounded-xl bg-slate-50 mb-3.5 border border-slate-200/70 flex items-center justify-center text-slate-400 group-hover:text-slate-500 transition-colors">
        <i class="fa-solid ${cat.icon} text-3xl opacity-60"></i>
      </div>
    `;

    return `
      <div class="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 shadow-card hover:shadow-card-hover group">
        
        <div>
          <!-- Card Header Badges -->
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${isLost ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}">
              <i class="${isLost ? 'fa-solid fa-circle-exclamation text-rose-600' : 'fa-solid fa-hand-holding-heart text-emerald-600'} text-[10px]"></i>
              ${isLost ? 'Kehilangan' : 'Ditemukan'}
            </span>

            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cat.color}">
              <i class="fa-solid ${cat.icon} text-[10px]"></i>
              ${cat.label}
            </span>
          </div>

          <!-- Foto Barang -->
          ${imageHTML}

          <!-- Title -->
          <h4 class="text-base font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-2 leading-snug cursor-pointer" onclick="openDetailModal('${item._id}')" title="${escapeHtml(item.title)}">
            ${escapeHtml(item.title)}
          </h4>

          <!-- Metadata: Location & Date -->
          <div class="space-y-1.5 text-xs text-slate-500 mb-3.5">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-location-dot text-rose-500 w-4 text-center"></i>
              <span class="text-slate-800 font-semibold">${escapeHtml(item.location)}</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="fa-regular fa-clock text-slate-400 w-4 text-center"></i>
              <span class="text-slate-600">${formattedDate}</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-user text-slate-400 w-4 text-center"></i>
              <span class="truncate font-medium text-slate-600">${escapeHtml(item.reporterName)}</span>
            </div>
          </div>

          <!-- Description Preview -->
          <p class="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            ${escapeHtml(item.description)}
          </p>
        </div>

        <!-- Card Footer -->
        <div class="pt-3 border-t border-slate-100 flex flex-col gap-3">
          <!-- Status Indicator Pill -->
          <div class="flex items-center justify-between">
            <span class="inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full border ${isResolved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}">
              <span class="w-1.5 h-1.5 rounded-full ${isResolved ? 'bg-emerald-600' : 'bg-amber-500 animate-pulse'}"></span>
              ${isResolved ? 'Sudah Dikembalikan' : 'Belum Diambil'}
            </span>

            <button onclick="toggleQuickStatus('${item._id}', event)" title="Klik untuk ubah status" class="text-[11px] font-semibold text-slate-400 hover:text-slate-700 underline transition-colors">
              ${isResolved ? 'Tandai Pending' : 'Tandai Selesai'}
            </button>
          </div>

          <!-- Action Buttons -->
          <div class="grid grid-cols-2 gap-2 mt-0.5">
            <button onclick="openDetailModal('${item._id}')" class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200/70 transition-all shadow-xs">
              <i class="fa-solid fa-wand-magic-sparkles text-[11px]"></i>
              <span>Detail &amp; Match</span>
            </button>

            <a href="${waLink}" target="_blank" class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs">
              <i class="fa-brands fa-whatsapp text-sm"></i>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

      </div>
    `;
  }).join('');
}

/**
 * Generate formatted WhatsApp Direct Claim Link sesuai spesifikasi
 */
function generateWhatsAppLink(item) {
  const contact = item.contact || '';
  const reporter = encodeURIComponent(item.reporterName || 'Pelapor');
  const title = encodeURIComponent(item.title || 'Barang');

  const text = `Halo%20${reporter},%20saya%20melihat%20laporan%20Anda%20di%20Campus%20Lost%20%26%20Found%20Hub%20terkait%20${title}.%20Saya%20ingin%20mengonfirmasi%20pengembalian/klaim%20barang%20tersebut.`;
  return `https://wa.me/${contact}?text=${text}`;
}

/**
 * Filter Management Functions (Pill Segmented Style)
 */
function setTypeFilter(type) {
  state.filters.type = type;

  // Update tabs active state
  const tabs = {
    '': document.getElementById('tab-all'),
    'lost': document.getElementById('tab-lost'),
    'found': document.getElementById('tab-found')
  };

  Object.entries(tabs).forEach(([t, btn]) => {
    if (t === type) {
      btn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all bg-white text-slate-900 shadow-xs border border-slate-200/80';
    } else {
      btn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all text-slate-600 hover:text-slate-900';
    }
  });

  fetchItems();
}

function handleSearchInput(value) {
  const clearBtn = document.getElementById('clearSearchBtn');
  if (value.trim()) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
  }

  clearTimeout(state.searchDebounceTimer);
  state.searchDebounceTimer = setTimeout(() => {
    state.filters.q = value.trim();
    fetchItems();
  }, 350);
}

function clearSearch() {
  const input = document.getElementById('searchInput');
  input.value = '';
  document.getElementById('clearSearchBtn').classList.add('hidden');
  state.filters.q = '';
  fetchItems();
}

function applyFilters() {
  state.filters.category = document.getElementById('categoryFilter').value;
  state.filters.location = document.getElementById('locationFilter').value;
  state.filters.status = document.getElementById('statusFilter').value;
  fetchItems();
}

function resetFilters() {
  state.filters = {
    type: '',
    category: '',
    location: '',
    status: '',
    q: ''
  };

  document.getElementById('searchInput').value = '';
  document.getElementById('clearSearchBtn').classList.add('hidden');
  document.getElementById('categoryFilter').value = '';
  document.getElementById('locationFilter').value = '';
  document.getElementById('statusFilter').value = '';

  setTypeFilter('');
}

/**
 * Modal Detail & Smart Matching Engine Integration
 */
async function openDetailModal(id) {
  const modal = document.getElementById('detailModal');
  modal.classList.remove('hidden');

  const matchesLoading = document.getElementById('matchesLoading');
  const matchesContainer = document.getElementById('matchesContainer');
  const matchesEmpty = document.getElementById('matchesEmpty');

  matchesContainer.innerHTML = '';
  matchesEmpty.classList.add('hidden');
  matchesLoading.classList.remove('hidden');

  try {
    const res = await fetch(`/api/items/${id}`);
    const result = await res.json();

    if (!result.success || !result.data) {
      showToast('Barang tidak ditemukan', 'error');
      closeDetailModal();
      return;
    }

    const item = result.data;
    state.currentItem = item;

    // Populate modal fields
    const isLost = item.type === 'lost';
    const isResolved = item.status === 'resolved';
    const cat = CATEGORY_MAP[item.category] || CATEGORY_MAP.lainnya;

    // Display Foto Barang di Modal jika ada
    const imgContainer = document.getElementById('modal-image-container');
    const modalImg = document.getElementById('modal-image');
    if (item.imageUrl) {
      modalImg.src = item.imageUrl;
      imgContainer.classList.remove('hidden');
    } else {
      modalImg.src = '';
      imgContainer.classList.add('hidden');
    }

    // Type Badge
    const typeBadge = document.getElementById('modal-type-badge');
    typeBadge.className = `px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isLost ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`;
    typeBadge.innerHTML = `<i class="${isLost ? 'fa-solid fa-circle-exclamation text-rose-600' : 'fa-solid fa-hand-holding-heart text-emerald-600'} mr-1.5"></i>${isLost ? 'Barang Kehilangan (Lost)' : 'Barang Ditemukan (Found)'}`;

    // Status Badge
    const statusBadge = document.getElementById('modal-status-badge');
    statusBadge.className = `px-3 py-1 rounded-full text-xs font-semibold ${isResolved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`;
    statusBadge.innerHTML = `<span class="inline-block w-2 h-2 rounded-full ${isResolved ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'} mr-1.5"></span>${isResolved ? 'Sudah Dikembalikan' : 'Belum Diambil'}`;

    document.getElementById('modal-title').innerText = item.title;
    document.getElementById('modal-category').innerText = cat.label;
    document.getElementById('modal-location').innerText = item.location;
    document.getElementById('modal-date').innerText = new Date(item.date).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    document.getElementById('modal-reporter').innerText = `${item.reporterName} (${item.contact})`;
    document.getElementById('modal-description').innerText = item.description;

    // Direct WhatsApp Button
    const waBtn = document.getElementById('modal-wa-btn');
    waBtn.href = generateWhatsAppLink(item);

    // Status Toggle Button text
    const statusText = document.getElementById('modal-status-toggle-text');
    statusText.innerText = isResolved ? 'Tandai Kembali Sebagai Pending' : 'Tandai Selesai (Sudah Dikembalikan)';

    // Fetch Smart Matches
    fetchSmartMatches(id);

  } catch (error) {
    console.error('Error opening detail modal:', error);
    showToast('Terjadi kesalahan saat memuat detail barang', 'error');
  }
}

function closeDetailModal() {
  document.getElementById('detailModal').classList.add('hidden');
  state.currentItem = null;
}

/**
 * Panggil Smart Matching Engine API dan render hasilnya dengan kartu bersih
 */
async function fetchSmartMatches(id) {
  const matchesLoading = document.getElementById('matchesLoading');
  const matchesContainer = document.getElementById('matchesContainer');
  const matchesEmpty = document.getElementById('matchesEmpty');

  try {
    const res = await fetch(`/api/items/${id}/matches`);
    const result = await res.json();

    matchesLoading.classList.add('hidden');

    if (result.success && result.data && result.data.length > 0) {
      matchesContainer.innerHTML = result.data.map(match => {
        const mItem = match.item;
        const waLink = generateWhatsAppLink(mItem);

        // Warna badge skor
        let scoreBadge = 'bg-brand-50 text-brand-700 border-brand-200';
        if (match.score >= 70) {
          scoreBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        } else if (match.score < 40) {
          scoreBadge = 'bg-amber-50 text-amber-700 border-amber-200';
        }

        // Thumbnail kandidat
        const candThumbHTML = mItem.imageUrl ? `
          <img src="${mItem.imageUrl}" alt="${escapeHtml(mItem.title)}" class="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0 bg-slate-50">
        ` : `
          <div class="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
            <i class="fa-solid fa-camera text-base"></i>
          </div>
        `;

        return `
          <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-brand-300 hover:shadow-card transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            <div class="flex items-start gap-3.5 flex-1 min-w-0">
              ${candThumbHTML}
              <div class="space-y-1 flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="px-2.5 py-0.5 rounded-lg text-xs font-extrabold border ${scoreBadge}">
                    <i class="fa-solid fa-gauge-high mr-1"></i>${match.score}% Skor Cocok
                  </span>
                  <span class="text-xs font-bold text-slate-700">
                    ${match.matchLevel}
                  </span>
                  <span class="text-xs text-slate-400">&bull; ${escapeHtml(mItem.location)}</span>
                </div>

                <h5 class="text-sm font-extrabold text-slate-900 truncate">${escapeHtml(mItem.title)}</h5>
                <p class="text-xs text-slate-500 line-clamp-1">${escapeHtml(mItem.description)}</p>

                <!-- Alasan Kecocokan & Keywords -->
                <div class="pt-1 flex flex-wrap gap-1.5">
                  ${match.reasons.map(r => `
                    <span class="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      <i class="fa-solid fa-check text-[9px] text-brand-600 mr-1"></i>${escapeHtml(r)}
                    </span>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Match Actions -->
            <div class="flex items-center gap-2 w-full md:w-auto flex-shrink-0">
              <a href="${waLink}" target="_blank" class="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all">
                <i class="fa-brands fa-whatsapp text-sm"></i>
                <span>Hubungi Penemu/Pemilik</span>
              </a>
            </div>

          </div>
        `;
      }).join('');
    } else {
      matchesEmpty.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error fetching smart matches:', error);
    matchesLoading.classList.add('hidden');
    matchesEmpty.classList.remove('hidden');
  }
}

/**
 * Toggle Status dari dalam Modal
 */
async function toggleModalItemStatus() {
  if (!state.currentItem) return;
  const id = state.currentItem._id;

  try {
    const res = await fetch(`/api/items/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });
    const result = await res.json();

    if (result.success) {
      showToast(result.message, 'success');
      await openDetailModal(id);
      fetchItems();
      fetchStats();
    } else {
      showToast(result.message || 'Gagal mengubah status', 'error');
    }
  } catch (error) {
    console.error('Error toggling status:', error);
    showToast('Terjadi kesalahan koneksi', 'error');
  }
}

/**
 * Toggle Status Cepat langsung dari Kartu Grid
 */
async function toggleQuickStatus(id, event) {
  if (event) event.stopPropagation();

  try {
    const res = await fetch(`/api/items/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });
    const result = await res.json();

    if (result.success) {
      showToast(result.message, 'success');
      fetchItems();
      fetchStats();
    } else {
      showToast(result.message || 'Gagal mengubah status', 'error');
    }
  } catch (error) {
    console.error('Error quick toggling status:', error);
    showToast('Terjadi kesalahan koneksi', 'error');
  }
}

/**
 * Helper Photo Upload Dropzone
 */
function triggerFileInput() {
  document.getElementById('imageInput').click();
}

function handleImageSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Harap pilih file gambar (JPG, PNG, WEBP)', 'error');
    clearSelectedImage();
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showToast('Ukuran foto maksimal 5 MB', 'error');
    clearSelectedImage();
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('imagePreview').src = e.target.result;
    document.getElementById('imageFileName').innerText = file.name;
    document.getElementById('imageFileSize').innerText = (file.size / 1024).toFixed(1) + ' KB';

    document.getElementById('uploadPrompt').classList.add('hidden');
    document.getElementById('imagePreviewContainer').classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

function clearSelectedImage(event) {
  if (event) event.stopPropagation();
  const input = document.getElementById('imageInput');
  input.value = '';
  document.getElementById('imagePreview').src = '';
  document.getElementById('uploadPrompt').classList.remove('hidden');
  document.getElementById('imagePreviewContainer').classList.add('hidden');
}

/**
 * Modal Create Laporan Baru
 */
function openCreateModal(preselectedType = 'lost') {
  const form = document.getElementById('createItemForm');
  form.reset();
  clearSelectedImage();

  const radio = form.querySelector(`input[name="formType"][value="${preselectedType}"]`);
  if (radio) radio.checked = true;

  const titleEl = document.getElementById('create-modal-title');
  if (preselectedType === 'lost') {
    titleEl.innerText = 'Lapor Barang Kehilangan';
  } else {
    titleEl.innerText = 'Lapor Penemuan Barang';
  }

  document.getElementById('createModal').classList.remove('hidden');
}

function closeCreateModal() {
  document.getElementById('createModal').classList.add('hidden');
  clearSelectedImage();
}

/**
 * Submit Form Lapor Barang Baru dengan Dukungan Upload Foto
 */
async function handleCreateSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const submitBtn = document.getElementById('submitFormBtn');

  // Menggunakan FormData native untuk mengirim file multipart
  const formData = new FormData(form);
  const type = formData.get('formType');
  formData.set('type', type);
  formData.set('date', new Date().toISOString());

  // Validasi lokal field wajib
  const title = formData.get('title');
  const category = formData.get('category');
  const location = formData.get('location');
  const reporterName = formData.get('reporterName');
  const contact = formData.get('contact');
  const description = formData.get('description');

  if (!type || !title || !category || !location || !reporterName || !contact || !description) {
    showToast('Harap lengkapi semua kolom yang wajib diisi', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Menyimpan...';

  try {
    const res = await fetch('/api/items', {
      method: 'POST',
      body: formData // Browser otomatis menyetel Content-Type multipart/form-data
    });
    const result = await res.json();

    if (result.success) {
      showToast('Laporan berhasil didaftarkan ke sistem!', 'success');
      closeCreateModal();
      form.reset();
      clearSelectedImage();
      fetchItems();
      fetchStats();

      // Langsung buka modal detail item baru untuk melihat kecocokannya
      if (result.data && result.data._id) {
        setTimeout(() => {
          openDetailModal(result.data._id);
        }, 500);
      }
    } else {
      showToast(result.message || 'Gagal menyimpan laporan', 'error');
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    showToast('Terjadi kesalahan saat menghubungi server', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> <span>Kirim Laporan</span>';
  }
}

/**
 * Toast Notification System (Fresh White Floating Card with Border Accent)
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');

  const borderColors = {
    success: 'border-l-emerald-500 text-emerald-700',
    error: 'border-l-rose-500 text-rose-700',
    info: 'border-l-brand-600 text-brand-700'
  };

  const icons = {
    success: 'fa-circle-check text-emerald-600',
    error: 'fa-circle-xmark text-rose-600',
    info: 'fa-circle-info text-brand-600'
  };

  toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-white text-slate-800 shadow-popover border border-slate-200 border-l-4 ${borderColors[type] || borderColors.info} text-sm font-medium transition-all transform duration-300 translate-y-4 opacity-0`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info} text-lg"></i>
    <span class="flex-1 text-slate-800 font-semibold">${escapeHtml(message)}</span>
    <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-700 ml-2">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;

  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  }, 10);

  // Auto remove after 4.5s
  setTimeout(() => {
    toast.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

/**
 * Helper Skeleton Loading HTML (Fresh White / Light Slate Style)
 */
function getSkeletonHTML(count = 4) {
  return Array(count).fill(0).map(() => `
    <div class="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 space-y-4 shadow-card animate-pulse">
      <div class="flex justify-between">
        <div class="w-20 h-5 bg-slate-100 rounded-full"></div>
        <div class="w-24 h-5 bg-slate-100 rounded-full"></div>
      </div>
      <div class="w-full h-40 bg-slate-100 rounded-xl"></div>
      <div class="w-3/4 h-5 bg-slate-200 rounded"></div>
      <div class="space-y-2">
        <div class="w-1/2 h-3 bg-slate-100 rounded"></div>
        <div class="w-1/3 h-3 bg-slate-100 rounded"></div>
      </div>
      <div class="w-full h-12 bg-slate-50 rounded-xl border border-slate-100"></div>
      <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        <div class="h-8 bg-slate-100 rounded-xl"></div>
        <div class="h-8 bg-slate-100 rounded-xl"></div>
      </div>
    </div>
  `).join('');
}

/**
 * Utility escape HTML string untuk keamanan XSS
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
