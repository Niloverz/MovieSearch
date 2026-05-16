const API_KEY = 'API_KEY';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const movieGrid = document.getElementById('movieGrid');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');

let currentMovies = []; 
let currentSort = 'popular'; 

searchBtn.addEventListener('click', searchMovies);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchMovies();
    }
});

const homeBtn = document.getElementById('homeBtn');
if (homeBtn) {
    homeBtn.addEventListener('click', () => {
        searchInput.value = '';
        const newUrl = window.location.pathname;
        window.history.pushState({}, '', newUrl);
        currentSort = 'popular';
        updateActiveFilter('popular');
        loadPopularMovies();
    });
}

const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const sortType = btn.dataset.sort;
        if (!sortType) return;
        
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentSort = sortType;
        
        if (currentMovies.length > 0) {
            applySortAndDisplay();
        }
    });
});

async function searchMovies() {
    const query = searchInput.value.trim();
    
    if (query === '') {
        showError('Masukkan judul film terlebih dahulu!');
        return;
    }
    
    const newUrl = `${window.location.pathname}?query=${encodeURIComponent(query)}`;
    window.history.pushState({}, '', newUrl);
    
    await performSearch(query);
}

async function performSearch(query) {
    showLoading();
    movieGrid.innerHTML = '';
    hideError();
    
    try {
        const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=id-ID`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Gagal mengambil data');
        
        const data = await response.json();
        
        if (data.results.length === 0) {
            showError('Film tidak ditemukan. Coba kata kunci lain.');
            currentMovies = [];
            return;
        }
        
        displayMovies(data.results);
        
    } catch (error) {
        console.error('Error:', error);
        showError('Terjadi kesalahan. Coba lagi nanti.');
        currentMovies = [];
    } finally {
        hideLoading();
    }
}

function getQueryFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('query');
}

function displayMovies(movies) {
    currentMovies = [...movies];
    applySortAndDisplay();
}

function applySortAndDisplay() {
    let sortedMovies = [...currentMovies];
    
    switch(currentSort) {
        case 'latest':
            sortedMovies.sort((a, b) => {
                const dateA = a.release_date ? new Date(a.release_date) : new Date(0);
                const dateB = b.release_date ? new Date(b.release_date) : new Date(0);
                return dateB - dateA;
            });
            break;
        case 'oldest':
            sortedMovies.sort((a, b) => {
                const dateA = a.release_date ? new Date(a.release_date) : new Date(0);
                const dateB = b.release_date ? new Date(b.release_date) : new Date(0);
                return dateA - dateB;
            });
            break;
        case 'rating':
            sortedMovies.sort((a, b) => b.vote_average - a.vote_average);
            break;
        default:
            sortedMovies = [...currentMovies];
    }
    
    movieGrid.innerHTML = '';
    sortedMovies.forEach(movie => {
        const card = createMovieCard(movie);
        movieGrid.appendChild(card);
    });
}

function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    let posterHtml = '';
    if (movie.poster_path) {
        posterHtml = `<img src="${IMAGE_URL}${movie.poster_path}" alt="${movie.title}" class="movie-poster">`;
    } else {
        posterHtml = `<div class="movie-poster-placeholder">🎬</div>`;
    }
    
    const rating = movie.vote_average.toFixed(1);
    const year = movie.release_date ? movie.release_date.split('-')[0] : 'Tidak diketahui';
    
    card.innerHTML = `
        ${posterHtml}
        <div class="movie-info">
            <div class="movie-title">${escapeHtml(movie.title)}</div>
            <div class="movie-year">${year}</div>
            <div class="movie-rating">⭐ ${rating}/10</div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        window.location.href = `detailfilm.html?id=${movie.id}`;
    });
    
    return card;
}

function updateActiveFilter(sortType) {
    filterBtns.forEach(btn => {
        if (btn.dataset.sort === sortType) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function showLoading() {
    loadingState.classList.remove('hidden');
}

function hideLoading() {
    loadingState.classList.add('hidden');
}

function showError(message) {
    errorState.classList.remove('hidden');
    errorState.innerHTML = `<p>${message}</p>`;
}

function hideError() {
    errorState.classList.add('hidden');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function loadPopularMovies() {
    const query = getQueryFromUrl();
    
    if (query) {
        searchInput.value = query;
        await performSearch(query);
        return;
    }
    
    showLoading();
    try {
        const pages = await Promise.all([
            fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=id-ID&page=1`).then(res => res.json()),
            fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=id-ID&page=2`).then(res => res.json()),
            fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=id-ID&page=3`).then(res => res.json()),
            fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=id-ID&page=4`).then(res => res.json()),
            fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=id-ID&page=5`).then(res => res.json())
        ]);
        
        let allMovies = [];
        pages.forEach(page => {
            allMovies = [...allMovies, ...page.results];
        });
        
        const uniqueMovies = [];
        const seenIds = new Set();
        for (const movie of allMovies) {
            if (!seenIds.has(movie.id)) {
                seenIds.add(movie.id);
                uniqueMovies.push(movie);
            }
        }
        
        displayMovies(uniqueMovies);
        
    } catch (error) {
        console.error('Gagal load film populer:', error);
        showError('Gagal memuat film populer.');
    } finally {
        hideLoading();
    }
}

window.addEventListener('popstate', () => {
    const query = getQueryFromUrl();
    if (query) {
        searchInput.value = query;
        performSearch(query);
    } else {
        searchInput.value = '';
        currentSort = 'popular';
        updateActiveFilter('popular');
        loadPopularMovies();
    }
});

loadPopularMovies();