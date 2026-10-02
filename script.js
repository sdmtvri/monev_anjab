/**
 * ==========================================================================
 * Kuesioner Data Pegawai Operasional - SDM TVRI 2026
 * Spreadsheet ID: 19rftSXE8R8sk9tDb2f4s6XOd9rJXUMmJkHYRI6Mssq4
 * Link: https://docs.google.com/spreadsheets/d/19rftSXE8R8sk9tDb2f4s6XOd9rJXUMmJkHYRI6Mssq4/edit
 * Google Apps Script Web App URL:
 * https://script.google.com/macros/s/AKfycbx2wBxPAjyfxUnExsxkYIYvBwHFHVoNXTpiC9ijz_jhVITryVk6OPEVMsPMGVDL4q52/exec
 * Kolom: Timestamp, Nama, NIP, Status, Satker, Bagian, Jenis, Jabatan, Jenjang, Uraian
 * ==========================================================================
 */

// Google Apps Script Web App URL resmi yang terhubung langsung ke spreadsheet
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx2wBxPAjyfxUnExsxkYIYvBwHFHVoNXTpiC9ijz_jhVITryVk6OPEVMsPMGVDL4q52/exec';

// ==========================================================================
// DAFTAR JABATAN & ATURAN JENJANG KONDISIONAL
// ==========================================================================

// Daftar Jabatan Fungsional
const JABATAN_FUNGSIONAL = [
  'Analis Anggaran',
  'Analis Hukum',
  'Analis Kebijakan',
  'Analis Pengelolaan Keuangan APBN',
  'Analis SDM Aparatur',
  'Arsiparis',
  'Asesor SDM Aparatur',
  'Asisten Pranata Siaran',
  'Asisten Teknisi Siaran',
  'Auditor',
  'Penata Laksana Barang',
  'Pengembang Teknologi Pembelajaran',
  'Pengelola Pengadaan Barang/Jasa',
  'Perancang Peraturan Perundang-Undangan',
  'Perencana',
  'Pranata Hubungan Masyarakat',
  'Pranata Komputer',
  'Pranata Keuangan APBN',
  'Pranata SDM Aparatur',
  'Pranata Siaran',
  'Teknisi Siaran'
];

// Daftar Jabatan Pelaksana
const JABATAN_PELAKSANA = [
  'Operator Layanan Operasional',
  'Penata Acara',
  'Penata Kelola Pemerintahan',
  'Penata Layanan Operasional',
  'Penelaah Teknis Kebijakan',
  'Pengadministrasi Perkantoran',
  'Pengelola Keprotokolan',
  'Pengelola Layanan Operasional',
  'Pengelola Siaran',
  'Pengelola Umum Operasional',
  'Pengolah Data dan Informasi',
  'Penyusun Materi Hukum dan Perundang-undangan'
];

// Rule Jenjang 1: Pemula, Terampil, Mahir, Penyelia
const JENJANG_TERAMPIL = [
  'Asisten Pranata Siaran',
  'Asisten Teknisi Siaran',
  'Pranata Keuangan APBN',
  'Pranata SDM Aparatur',
  'Penata Laksana Barang'
];

// Rule Jenjang 2: Pemula, Terampil, Mahir, Penyelia, Ahli Pertama, Ahli Muda, Ahli Madya
const JENJANG_TERAMPIL_DAN_AHLI = [
  'Pranata Hubungan Masyarakat',
  'Arsiparis'
];

// Rule Jenjang 3: Ahli Pertama, Ahli Muda, Ahli Madya (Jabatan Fungsional lainnya)
const JENJANG_AHLI_STANDARD = [
  'Ahli Pertama',
  'Ahli Muda',
  'Ahli Madya'
];

// DOM Elements
const form = document.getElementById('employeeForm');
const btnReset = document.getElementById('btnReset');
const btnSubmit = document.getElementById('btnSubmit');
const submitSpinner = document.getElementById('submitSpinner');
const submitIcon = document.getElementById('submitIcon');
const submitText = document.getElementById('submitText');

// Success Alert Banner
const successAlert = document.getElementById('successAlert');
const btnCloseSuccessAlert = document.getElementById('btnCloseSuccessAlert');

// Form inputs
const namaInput = document.getElementById('nama');
const nipInput = document.getElementById('nip');
const statusSelect = document.getElementById('status');
const satuanKerjaSelect = document.getElementById('satuanKerja');
const bagianSelect = document.getElementById('bagian');
const jenisJabatanSelect = document.getElementById('jenisJabatan');
const jabatanSelect = document.getElementById('jabatan');
const jenjangJabatanSelect = document.getElementById('jenjangJabatan');
const uraianTugasInput = document.getElementById('uraianTugas');
const charCountSpan = document.getElementById('charCount');
const toastContainer = document.getElementById('toastContainer');

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  setupAntiInspectProtection();
  setupEventListeners();
  updateConditionalDropdowns();
});

/* ==========================================================================
   ANTI-INSPECT & RIGHT-CLICK PROTECTION
   ========================================================================== */
function setupAntiInspectProtection() {
  // Cegah klik kanan (context menu) di seluruh halaman
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  }, false);

  // Cegah shortcut keyboard developer tools & inspect element
  document.addEventListener('keydown', (e) => {
    // F12 (DevTools)
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect Element)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
      const keyUpper = e.key.toUpperCase();
      if (keyUpper === 'I' || keyUpper === 'J' || keyUpper === 'C') {
        e.preventDefault();
        return false;
      }
    }

    // Ctrl+U (View Source)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
      return false;
    }

    // Ctrl+S (Save Page)
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      return false;
    }
  }, false);
}

/* ==========================================================================
   EVENT LISTENERS
   ========================================================================== */
function setupEventListeners() {
  // Perubahan pada Jenis Jabatan
  jenisJabatanSelect.addEventListener('change', handleJenisJabatanChange);

  // Perubahan pada Jabatan (menentukan Jenjang Jabatan)
  jabatanSelect.addEventListener('change', handleJabatanChange);

  // Penghitung karakter Uraian Tugas
  uraianTugasInput.addEventListener('input', () => {
    const len = uraianTugasInput.value.length;
    charCountSpan.textContent = `${len} karakter`;
  });

  // NIP hanya angka dan maksimal 18 digit
  nipInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 18);
  });

  // Hapus error saat input diubah
  [namaInput, nipInput, statusSelect, satuanKerjaSelect, bagianSelect, jenisJabatanSelect, jabatanSelect, jenjangJabatanSelect, uraianTugasInput].forEach(field => {
    field.addEventListener('input', () => clearFieldError(field));
    field.addEventListener('change', () => clearFieldError(field));
  });

  // Tombol Hapus Form
  btnReset.addEventListener('click', () => {
    handleFormReset();
    hideSuccessAlert();
  });

  // Tombol tutup success alert
  if (btnCloseSuccessAlert) {
    btnCloseSuccessAlert.addEventListener('click', hideSuccessAlert);
  }

  // Form Submit
  form.addEventListener('submit', handleFormSubmit);
}

/* ==========================================================================
   CONDITIONAL DROPDOWN LOGIC
   ========================================================================== */
function handleJenisJabatanChange() {
  const selectedType = jenisJabatanSelect.value;

  // Reset dropdown turunan
  jabatanSelect.innerHTML = '<option value="" disabled selected>Pilih Jabatan...</option>';
  jenjangJabatanSelect.innerHTML = '<option value="" disabled selected>Pilih Jenjang Jabatan...</option>';

  if (!selectedType) {
    jabatanSelect.disabled = true;
    jenjangJabatanSelect.disabled = true;
    clearFieldError(jenisJabatanSelect);
    return;
  }

  jabatanSelect.disabled = false;

  if (selectedType === 'Fungsional') {
    JABATAN_FUNGSIONAL.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item;
      opt.textContent = item;
      jabatanSelect.appendChild(opt);
    });

    // Jenjang menunggu user memilih Jabatan
    jenjangJabatanSelect.innerHTML = '<option value="" disabled selected>Pilih Jabatan terlebih dahulu...</option>';
    jenjangJabatanSelect.disabled = true;

  } else if (selectedType === 'Pelaksana') {
    JABATAN_PELAKSANA.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item;
      opt.textContent = item;
      jabatanSelect.appendChild(opt);
    });

    // Untuk Pelaksana, jenjang otomatis '-'
    jenjangJabatanSelect.innerHTML = '<option value="-" selected>-</option>';
    jenjangJabatanSelect.value = '-';
    jenjangJabatanSelect.disabled = true;
  }

  clearFieldError(jenisJabatanSelect);
  clearFieldError(jabatanSelect);
  clearFieldError(jenjangJabatanSelect);
}

function handleJabatanChange() {
  const selectedType = jenisJabatanSelect.value;
  const selectedJabatan = jabatanSelect.value;

  clearFieldError(jabatanSelect);

  if (selectedType === 'Pelaksana') {
    jenjangJabatanSelect.innerHTML = '<option value="-" selected>-</option>';
    jenjangJabatanSelect.value = '-';
    jenjangJabatanSelect.disabled = true;
    clearFieldError(jenjangJabatanSelect);
    return;
  }

  if (selectedType === 'Fungsional') {
    if (!selectedJabatan) {
      jenjangJabatanSelect.innerHTML = '<option value="" disabled selected>Pilih Jabatan terlebih dahulu...</option>';
      jenjangJabatanSelect.disabled = true;
      return;
    }

    jenjangJabatanSelect.disabled = false;
    jenjangJabatanSelect.innerHTML = '<option value="" disabled selected>Pilih Jenjang Jabatan...</option>';

    let jenjangList = [];

    // Aturan 1: Asisten Pranata Siaran, Asisten Teknisi Siaran, Pranata Keuangan APBN, Pranata SDM Aparatur, Penata Laksana Barang
    // Jenjang = Pemula, Terampil, Mahir, Penyelia
    if (JENJANG_TERAMPIL.includes(selectedJabatan)) {
      jenjangList = ['Pemula', 'Terampil', 'Mahir', 'Penyelia'];
    }
    // Aturan 2: Pranata Hubungan Masyarakat, Arsiparis
    // Jenjang = Pemula, Terampil, Mahir, Penyelia, Ahli Pertama, Ahli Muda, Ahli Madya
    else if (JENJANG_TERAMPIL_DAN_AHLI.includes(selectedJabatan)) {
      jenjangList = ['Pemula', 'Terampil', 'Mahir', 'Penyelia', 'Ahli Pertama', 'Ahli Muda', 'Ahli Madya'];
    }
    // Aturan 3: Di luar daftar di atas (Standard Ahli)
    // Jenjang = Ahli Pertama, Ahli Muda, Ahli Madya
    else {
      jenjangList = JENJANG_AHLI_STANDARD;
    }

    jenjangList.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item;
      opt.textContent = item;
      jenjangJabatanSelect.appendChild(opt);
    });

    clearFieldError(jenjangJabatanSelect);
  }
}

function updateConditionalDropdowns() {
  handleJenisJabatanChange();
}

/* ==========================================================================
   VALIDASI FORMULIR
   ========================================================================== */
function clearFieldError(field) {
  field.classList.remove('is-invalid');
  const errorElem = document.getElementById(`error-${field.id}`);
  if (errorElem) {
    errorElem.textContent = '';
  }
}

function setFieldError(field, message) {
  field.classList.add('is-invalid');
  const errorElem = document.getElementById(`error-${field.id}`);
  if (errorElem) {
    errorElem.textContent = message;
  }
}

function validateForm() {
  let isValid = true;
  let firstInvalid = null;

  // Nama
  if (!namaInput.value.trim()) {
    setFieldError(namaInput, 'Nama lengkap sesuai SK wajib diisi.');
    isValid = false;
    if (!firstInvalid) firstInvalid = namaInput;
  } else if (namaInput.value.trim().length < 3) {
    setFieldError(namaInput, 'Nama lengkap minimal 3 karakter.');
    isValid = false;
    if (!firstInvalid) firstInvalid = namaInput;
  }

  // NIP (Wajib 18 Digit Angka)
  const nipVal = nipInput.value.trim();
  if (!nipVal) {
    setFieldError(nipInput, 'NIP wajib diisi.');
    isValid = false;
    if (!firstInvalid) firstInvalid = nipInput;
  } else if (nipVal.length !== 18) {
    setFieldError(nipInput, `NIP harus terdiri dari 18 digit angka (saat ini ${nipVal.length} digit).`);
    isValid = false;
    if (!firstInvalid) firstInvalid = nipInput;
  }

  // Status
  if (!statusSelect.value) {
    setFieldError(statusSelect, 'Silakan pilih status kepegawaian.');
    isValid = false;
    if (!firstInvalid) firstInvalid = statusSelect;
  }

  // Satuan Kerja (Satker)
  if (!satuanKerjaSelect.value) {
    setFieldError(satuanKerjaSelect, 'Silakan pilih Satuan Kerja.');
    isValid = false;
    if (!firstInvalid) firstInvalid = satuanKerjaSelect;
  }

  // Bagian
  if (!bagianSelect.value) {
    setFieldError(bagianSelect, 'Silakan pilih Bagian.');
    isValid = false;
    if (!firstInvalid) firstInvalid = bagianSelect;
  }

  // Jenis Jabatan (Jenis)
  if (!jenisJabatanSelect.value) {
    setFieldError(jenisJabatanSelect, 'Silakan pilih Jenis Jabatan.');
    isValid = false;
    if (!firstInvalid) firstInvalid = jenisJabatanSelect;
  }

  // Jabatan
  if (!jabatanSelect.value) {
    setFieldError(jabatanSelect, 'Silakan pilih Jabatan.');
    isValid = false;
    if (!firstInvalid) firstInvalid = jabatanSelect;
  }

  // Jenjang Jabatan (Jenjang)
  const isPelaksana = jenisJabatanSelect.value === 'Pelaksana';
  const jenjangVal = isPelaksana ? '-' : jenjangJabatanSelect.value;
  if (!jenjangVal) {
    setFieldError(jenjangJabatanSelect, 'Silakan pilih Jenjang Jabatan.');
    isValid = false;
    if (!firstInvalid) firstInvalid = jenjangJabatanSelect;
  }

  // Uraian Tugas (Uraian)
  if (!uraianTugasInput.value.trim()) {
    setFieldError(uraianTugasInput, 'Uraian tugas dan tanggung jawab wajib diisi.');
    isValid = false;
    if (!firstInvalid) firstInvalid = uraianTugasInput;
  } else if (uraianTugasInput.value.trim().length < 5) {
    setFieldError(uraianTugasInput, 'Mohon sebutkan tugas dan tanggung jawab Anda secara lengkap.');
    isValid = false;
    if (!firstInvalid) firstInvalid = uraianTugasInput;
  }

  if (firstInvalid) {
    firstInvalid.focus();
  }

  return isValid;
}

/* ==========================================================================
   SUBMISI KE GOOGLE SHEETS
   ========================================================================== */
async function handleFormSubmit(e) {
  e.preventDefault();

  if (!validateForm()) {
    showToast('Mohon lengkapi seluruh isian bertanda bintang merah.', 'error');
    return;
  }

  // Format Timestamp waktu Jakarta (WIB): dd/MM/yyyy HH:mm:ss
  const now = new Date();
  const formattedTimestamp = now.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\./g, ':');

  // Struktur data langsung dikirim ke Kolom A - J Spreadsheet:
  // Timestamp, Nama, NIP, Status, Satker, Bagian, Jenis, Jabatan, Jenjang, Uraian
  const payload = {
    Timestamp: formattedTimestamp,
    Nama: namaInput.value.trim(),
    NIP: nipInput.value.trim(),
    Status: statusSelect.value,
    Satker: satuanKerjaSelect.value,
    Bagian: bagianSelect.value,
    Jenis: jenisJabatanSelect.value,
    Jabatan: jabatanSelect.value,
    Jenjang: isPelaksana ? '-' : (jenjangJabatanSelect.value || '-'),
    Uraian: uraianTugasInput.value.trim()
  };

  setSubmitting(true);

  try {
    // Kirim data langsung ke Web App URL Google Apps Script Anda tanpa popup
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    // 1. Tampilkan pesan: "Terima kasih, Data Berhasil dikirim!"
    showSuccessAlert();
    showToast('Terima kasih, Data Berhasil dikirim!', 'success');

    // 2. Reset semua isi form
    handleFormReset();

    // 3. Kembali ke bagian paling atas layar
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (err) {
    console.error('Error saat mengirim kuesioner:', err);
    showToast('Gagal mengirim ke Google Sheets. Silakan periksa koneksi internet Anda.', 'error');
  } finally {
    setSubmitting(false);
  }
}

function showSuccessAlert() {
  if (successAlert) {
    successAlert.classList.remove('hidden');
  }
}

function hideSuccessAlert() {
  if (successAlert) {
    successAlert.classList.add('hidden');
  }
}

function setSubmitting(isSubmitting) {
  btnSubmit.disabled = isSubmitting;
  btnReset.disabled = isSubmitting;

  if (isSubmitting) {
    submitSpinner.classList.remove('hidden');
    submitIcon.classList.add('hidden');
    submitText.textContent = 'Mengirim...';
  } else {
    submitSpinner.classList.add('hidden');
    submitIcon.classList.remove('hidden');
    submitText.textContent = 'Kirim';
  }
}

function handleFormReset() {
  form.reset();
  charCountSpan.textContent = '0 karakter';
  updateConditionalDropdowns();

  [namaInput, nipInput, statusSelect, satuanKerjaSelect, bagianSelect, jenisJabatanSelect, jabatanSelect, jenjangJabatanSelect, uraianTugasInput].forEach(field => {
    clearFieldError(field);
  });
}

/* ==========================================================================
   SISTEM NOTIFIKASI TOAST
   ========================================================================== */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconSvg = type === 'success' 
    ? '<svg class="toast-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>'
    : '<svg class="toast-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#f43f5e" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

  toast.innerHTML = `
    ${iconSvg}
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}
