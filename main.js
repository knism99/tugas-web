/**
 * main.js — Perpustakaan Digital
 * ================================
 * File JavaScript utama yang mengatur semua logika aplikasi:
 * - Mengambil data buku dari file app.json
 * - Menampilkan kartu buku secara dinamis (render)
 * - Filter buku berdasarkan genre
 * - Urutkan buku berdasarkan judul, tahun, atau jumlah halaman
 * - Menampilkan & menutup modal detail buku
 */

// ===================================================
// BAGIAN 1: MENGAMBIL ELEMEN-ELEMEN HTML (DOM)
// ===================================================
// Kita ambil elemen HTML berdasarkan ID-nya agar bisa
// dimanipulasi (diubah isi/tampilan-nya) lewat JavaScript.

const booksGrid = document.getElementById('books-grid');     // Area grid tempat kartu buku ditampilkan
const genreFilter = document.getElementById('genre-filter'); // Dropdown filter genre
const sortOption = document.getElementById('sort-option');   // Dropdown pilihan urutan
const bookCount = document.getElementById('book-count');     // Teks jumlah buku yang tampil

// Elemen-elemen di dalam Modal (pop-up detail buku)
const modalOverlay = document.getElementById('modal-overlay');       // Latar belakang gelap modal
const modalClose = document.getElementById('modal-close');           // Tombol tutup (×)
const modalTitle = document.getElementById('modal-title');           // Judul buku di modal
const modalAuthor = document.getElementById('modal-author');         // Penulis buku di modal
const modalGenre = document.getElementById('modal-genre');           // Badge genre di modal
const modalYear = document.getElementById('modal-year');             // Tahun terbit di modal
const modalPages = document.getElementById('modal-pages');           // Jumlah halaman di modal
const modalRating = document.getElementById('modal-rating');         // Rating buku di modal
const modalPrice = document.getElementById('modal-price');           // Harga buku di modal
const modalDescription = document.getElementById('modal-description'); // Sinopsis di modal
const modalCover = document.getElementById('modal-cover');           // Gambar cover di modal

// ===================================================
// BAGIAN 2: STATE (DATA YANG DISIMPAN)
// ===================================================
let books = [];         // Array berisi SEMUA data buku yang dimuat dari app.json
let currentBooks = [];  // Array berisi buku yang SEDANG DITAMPILKAN (setelah filter & sort)

// ===================================================
// BAGIAN 3: FORMAT HARGA KE RUPIAH
// ===================================================
/**
 * Fungsi formatPrice — Mengubah angka menjadi format mata uang Rupiah.
 * Contoh: 120000 → "Rp 120.000"
 * 
 * @param {number} price - Harga buku dalam angka
 * @returns {string} - Harga dalam format Rupiah
 */
function formatPrice(price) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',       // Format sebagai mata uang
        currency: 'IDR',         // Mata uang Indonesia (Rupiah)
        minimumFractionDigits: 0, // Tidak tampilkan desimal (,00)
        maximumFractionDigits: 0
    }).format(price);
}

// ===================================================
// BAGIAN 4: MEMBUAT KARTU BUKU (HTML Element)
// ===================================================
/**
 * Fungsi createBookCard — Membuat satu elemen kartu buku (div).
 * Kartu berisi: gambar cover, badge genre, rating, judul, penulis,
 * tahun terbit, jumlah halaman, harga, dan tombol "Lihat Detail".
 * 
 * @param {Object} book - Objek data buku dari app.json
 * @returns {HTMLElement} - Elemen div kartu buku yang sudah jadi
 */
function createBookCard(book) {
    // Buat elemen div baru sebagai kartu buku
    const card = document.createElement('div');
    card.className = 'book-card';                    // Kelas CSS untuk styling kartu
    card.setAttribute('data-genre', book.genre);     // Simpan genre sebagai atribut (dipakai oleh CSS)
    card.setAttribute('data-id', book.id);           // Simpan ID buku sebagai atribut

    // Isi konten dalam kartu menggunakan template literal (HTML dinamis)
    card.innerHTML = `
    <div class="book-cover">
      <!-- Badge genre di pojok kiri atas cover -->
      <span class="book-genre ${book.genre}">${book.genre}</span>
      <!-- Rating buku di pojok kanan atas cover -->
      <span class="book-rating">⭐ ${book.rating}</span>
      <!-- Gambar background (blur) — jika gagal load, disembunyikan -->
      <img src="${book.image}" alt="" class="cover-image-bg" onerror="this.style.display='none';">
      <!-- Gambar utama (tampil jelas) — jika gagal load, disembunyikan -->
      <img src="${book.image}" alt="${book.title}" class="cover-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
    </div>
    <div class="book-info">
      <!-- Judul buku (dibatasi 2 baris oleh CSS) -->
      <h3 class="book-title">${book.title}</h3>
      <!-- Nama penulis -->
      <p class="book-author">oleh ${book.author}</p>
      <!-- Info tahun terbit dan jumlah halaman -->
      <div class="book-meta">
        <span>📅 ${book.year}</span>
        <span>📄 ${book.pages} hal</span>
      </div>
      <!-- Harga buku dalam format Rupiah -->
      <p class="book-price">${formatPrice(book.price)}</p>
      <!-- Tombol untuk membuka modal detail -->
      <span class="view-detail">Lihat Detail <span class="arrow">→</span></span>
    </div>
  `;

    // Tambahkan event: saat kartu diklik → buka modal dengan data buku ini
    card.addEventListener('click', () => openModal(book));

    return card; // Kembalikan elemen kartu yang sudah jadi
}

// ===================================================
// BAGIAN 5: MENAMPILKAN BUKU KE HALAMAN (RENDER)
// ===================================================
/**
 * Fungsi renderBooks — Menampilkan semua buku di currentBooks ke dalam grid HTML.
 * Jika tidak ada buku (array kosong), tampilkan pesan "tidak ada buku ditemukan".
 */
function renderBooks() {
    // Kosongkan isi grid sebelum menampilkan buku yang baru
    booksGrid.innerHTML = '';

    // Jika tidak ada buku (setelah filter), tampilkan pesan kosong
    if (currentBooks.length === 0) {
        booksGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h3>Tidak ada buku ditemukan</h3>
        <p>Coba ubah filter atau kata kunci pencarian</p>
      </div>
    `;
        bookCount.textContent = '0'; // Reset jumlah buku ke 0
        return; // Hentikan fungsi di sini
    }

    // Loop setiap buku → buat kartu → tambahkan ke grid
    currentBooks.forEach(book => {
        const card = createBookCard(book);  // Buat elemen kartu
        booksGrid.appendChild(card);        // Tambahkan kartu ke dalam grid
    });

    // Perbarui teks jumlah buku yang ditampilkan
    bookCount.textContent = currentBooks.length;
}

// ===================================================
// BAGIAN 6: FILTER BUKU BERDASARKAN GENRE
// ===================================================
/**
 * Fungsi filterBooks — Menyaring buku berdasarkan genre yang dipilih.
 * Jika "all" dipilih, kembalikan semua buku.
 * 
 * @param {string} genre - Nama genre ('all', 'Fiction', 'Self-Help', dll)
 * @returns {Array} - Array buku yang sesuai genre
 */
function filterBooks(genre) {
    if (genre === 'all') {
        return [...books]; // Salin semua buku (spread operator agar tidak memodifikasi array asli)
    }
    // Gunakan .filter() untuk hanya ambil buku yang genrenya cocok
    return books.filter(book => book.genre === genre);
}

// ===================================================
// BAGIAN 7: MENGURUTKAN BUKU
// ===================================================
/**
 * Fungsi sortBooks — Mengurutkan array buku berdasarkan kriteria tertentu.
 * 
 * @param {Array} booksArray - Array buku yang akan diurutkan
 * @param {string} sortBy - Kriteria urutan: 'title', 'year', atau 'pages'
 * @returns {Array} - Array buku yang sudah diurutkan
 */
function sortBooks(booksArray, sortBy) {
    const sorted = [...booksArray]; // Salin array agar array asli tidak berubah

    switch (sortBy) {
        case 'title':
            // Urutkan A-Z berdasarkan judul, dengan locale Indonesia agar "Á" urut dengan benar
            sorted.sort((a, b) => a.title.localeCompare(b.title, 'id'));
            break;
        case 'year':
            // Urutkan dari tahun terbaru ke terlama (descending)
            sorted.sort((a, b) => b.year - a.year);
            break;
        case 'pages':
            // Urutkan dari halaman terbanyak ke tersedikit (descending)
            sorted.sort((a, b) => b.pages - a.pages);
            break;
        default:
            break; // Jika tidak ada yang cocok, tidak diapa-apakan
    }

    return sorted;
}

// ===================================================
// BAGIAN 8: GABUNGKAN FILTER DAN SORT
// ===================================================
/**
 * Fungsi applyFilterAndSort — Dipanggil saat dropdown filter/sort berubah.
 * Prosesnya: filter dulu → lalu sort → lalu render ke halaman.
 */
function applyFilterAndSort() {
    const genre = genreFilter.value; // Ambil nilai genre yang dipilih dari dropdown
    const sort = sortOption.value;   // Ambil nilai urutan yang dipilih dari dropdown

    // Langkah 1: Filter buku berdasarkan genre
    let filtered = filterBooks(genre);

    // Langkah 2: Urutkan hasil filter
    currentBooks = sortBooks(filtered, sort);

    // Langkah 3: Tampilkan hasilnya ke halaman
    renderBooks();
}

// ===================================================
// BAGIAN 9: BUKA MODAL DETAIL BUKU
// ===================================================
/**
 * Fungsi openModal — Menampilkan pop-up dengan detail lengkap buku yang diklik.
 * Mengisi semua elemen modal dengan data buku yang diterima.
 * 
 * @param {Object} book - Objek data buku yang akan ditampilkan
 */
function openModal(book) {
    // Isi setiap bagian modal dengan data dari objek buku
    modalTitle.textContent = book.title;                      // Judul buku
    modalAuthor.textContent = `oleh ${book.author}`;          // Penulis
    modalGenre.textContent = book.genre;                      // Genre (teks)
    modalGenre.className = `modal-genre ${book.genre}`;       // Genre (class CSS untuk warna badge)
    modalYear.textContent = book.year;                        // Tahun terbit
    modalPages.textContent = book.pages;                      // Jumlah halaman
    modalRating.textContent = book.rating;                    // Rating
    modalPrice.textContent = formatPrice(book.price);         // Harga (format Rupiah)
    modalDescription.textContent = book.description;          // Sinopsis

    // Tampilkan gambar cover buku di dalam modal (sama seperti di kartu)
    modalCover.innerHTML = `
    <img src="${book.image}" alt="" class="cover-image-bg" onerror="this.style.display='none';">
    <img src="${book.image}" alt="${book.title}" class="cover-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">  `;

    // Pastikan background cover transparan agar gambar terlihat penuh
    modalCover.style.background = 'transparent';

    // Tampilkan modal dengan menambahkan class 'active' (diatur di CSS)
    modalOverlay.classList.add('active');

    // Nonaktifkan scroll halaman utama saat modal terbuka
    document.body.style.overflow = 'hidden';
}

// ===================================================
// BAGIAN 10: TUTUP MODAL
// ===================================================
/**
 * Fungsi closeModal — Menyembunyikan pop-up modal.
 */
function closeModal() {
    // Hapus class 'active' → modal jadi tersembunyi (via CSS transition)
    modalOverlay.classList.remove('active');

    // Aktifkan kembali scroll halaman utama
    document.body.style.overflow = '';
}

// ===================================================
// BAGIAN 11: EVENT LISTENERS (Mendengarkan Aksi User)
// ===================================================

// Saat dropdown genre berubah → jalankan filter & sort
genreFilter.addEventListener('change', applyFilterAndSort);

// Saat dropdown urutan berubah → jalankan filter & sort
sortOption.addEventListener('change', applyFilterAndSort);

// Saat tombol × diklik → tutup modal
modalClose.addEventListener('click', closeModal);

// Saat area gelap di luar modal diklik → tutup modal
// (hanya jika yang diklik adalah overlay-nya, bukan isi modal)
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

// Saat tombol Escape ditekan & modal sedang terbuka → tutup modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
    }
});

// ===================================================
// BAGIAN 12: INISIALISASI — MUAT DATA SAAT HALAMAN SIAP
// ===================================================
/**
 * DOMContentLoaded — Event yang dijalankan SETELAH seluruh HTML selesai dimuat,
 * tapi sebelum gambar/resource lain selesai.
 * 
 * Di sini kita mengambil data buku dari file app.json menggunakan fetch().
 */
document.addEventListener('DOMContentLoaded', () => {
    fetch('app.json')                    // Ambil file data buku (JSON)
        .then(response => response.json()) // Ubah response menjadi objek JavaScript
        .then(data => {
            books = data;                  // Simpan semua data buku ke variabel global
            currentBooks = [...books];     // currentBooks awalnya sama dengan semua buku
            applyFilterAndSort();          // Tampilkan buku dengan filter & sort default
        })
        .catch(error => {
            // Jika gagal memuat JSON (misalnya file tidak ditemukan), tampilkan error di console
            console.error('JSON not loaded:', error);
        });
});
