// ===== DOM Elements =====
const booksGrid = document.getElementById('books-grid');
const genreFilter = document.getElementById('genre-filter');
const sortOption = document.getElementById('sort-option');
const bookCount = document.getElementById('book-count');

// Modal Elements
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalAuthor = document.getElementById('modal-author');
const modalGenre = document.getElementById('modal-genre');
const modalYear = document.getElementById('modal-year');
const modalPages = document.getElementById('modal-pages');
const modalRating = document.getElementById('modal-rating');
const modalPrice = document.getElementById('modal-price');
const modalDescription = document.getElementById('modal-description');
const modalCover = document.getElementById('modal-cover');

// ===== State =====
let currentBooks = [...books];

// ===== Format Currency =====
function formatPrice(price) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

// ===== Get Book Icon based on Genre =====
function getBookIcon(genre) {
    const icons = {
        'Fiction': '📕',
        'Self-Help': '📗',
        'Sci-Fi': '📘',
        'History': '📙'
    };
    return icons[genre] || '📖';
}

// ===== Create Book Card HTML =====
function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.setAttribute('data-genre', book.genre);
    card.setAttribute('data-id', book.id);

    card.innerHTML = `
    <div class="book-cover">
      <span class="book-genre ${book.genre}">${book.genre}</span>
      <span class="book-rating">⭐ ${book.rating}</span>
      <img src="${book.image}" alt="${book.title}" class="cover-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
      <span class="cover-icon" style="display: none;">${getBookIcon(book.genre)}</span>
    </div>
    <div class="book-info">
      <h3 class="book-title">${book.title}</h3>
      <p class="book-author">oleh ${book.author}</p>
      <div class="book-meta">
        <span>📅 ${book.year}</span>
        <span>📄 ${book.pages} hal</span>
      </div>
      <p class="book-price">${formatPrice(book.price)}</p>
      <span class="view-detail">Lihat Detail →</span>
    </div>
  `;

    // Add click event for modal
    card.addEventListener('click', () => openModal(book));

    return card;
}

// ===== Render Books =====
function renderBooks() {
    // Clear grid
    booksGrid.innerHTML = '';

    // Check if there are books to display
    if (currentBooks.length === 0) {
        booksGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">📚</div>
        <h3>Tidak ada buku ditemukan</h3>
        <p>Coba ubah filter atau kata kunci pencarian</p>
      </div>
    `;
        bookCount.textContent = '0';
        return;
    }

    // Render each book
    currentBooks.forEach(book => {
        const card = createBookCard(book);
        booksGrid.appendChild(card);
    });

    // Update count
    bookCount.textContent = currentBooks.length;
}

// ===== Filter Books by Genre =====
function filterBooks(genre) {
    if (genre === 'all') {
        return [...books];
    }
    return books.filter(book => book.genre === genre);
}

// ===== Sort Books =====
function sortBooks(booksArray, sortBy) {
    const sorted = [...booksArray];

    switch (sortBy) {
        case 'title':
            sorted.sort((a, b) => a.title.localeCompare(b.title, 'id'));
            break;
        case 'year':
            sorted.sort((a, b) => b.year - a.year); // Newest first
            break;
        case 'pages':
            sorted.sort((a, b) => b.pages - a.pages); // Most pages first
            break;
        default:
            break;
    }

    return sorted;
}

// ===== Apply Filter and Sort =====
function applyFilterAndSort() {
    const genre = genreFilter.value;
    const sort = sortOption.value;

    // First filter, then sort
    let filtered = filterBooks(genre);
    currentBooks = sortBooks(filtered, sort);

    // Re-render
    renderBooks();
}

// ===== Open Modal =====
function openModal(book) {
    // Populate modal content
    modalTitle.textContent = book.title;
    modalAuthor.textContent = `oleh ${book.author}`;
    modalGenre.textContent = book.genre;
    modalGenre.className = `modal-genre ${book.genre}`;
    modalYear.textContent = book.year;
    modalPages.textContent = book.pages;
    modalRating.textContent = book.rating;
    modalPrice.textContent = formatPrice(book.price);
    modalDescription.textContent = book.description;

    // Update cover with image
    modalCover.innerHTML = `
    <img src="${book.image}" alt="${book.title}" class="cover-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
    <span class="cover-icon" style="display: none;">${getBookIcon(book.genre)}</span>
  `;

    // Update cover background based on genre
    const genreGradients = {
        'Fiction': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'Self-Help': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'Sci-Fi': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'History': 'linear-gradient(135deg, #f5576c 0%, #ff8a00 100%)'
    };
    modalCover.style.background = genreGradients[book.genre] || 'var(--primary-gradient)';

    // Show modal
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ===== Close Modal =====
function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== Event Listeners =====
genreFilter.addEventListener('change', applyFilterAndSort);
sortOption.addEventListener('change', applyFilterAndSort);

modalClose.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
    }
});

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    applyFilterAndSort();
});
