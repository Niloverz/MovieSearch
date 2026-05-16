const API_KEY = 'API_KEY'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const movieGrid = document.getElementById('movieGrid');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');

searchBtn.addEventListener('click', searchMovies);

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchMovies();
    }
});

async function searchMovies() {
    const query = searchInput.value.trim();
    
    if (query === '') {
        showError('Masukkan judul film');
        return;
    }
    
    showLoading();
    movieGrid.innerHTML = '';
    hideError();
    
    try {
        const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=id-ID`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Gagal mengambil data');
        }
        
        const data = await response.json();
        
        if (data.results.length === 0) {
            showError('Film tidak ditemukan. Coba kata kunci lain.');
            return;
        }
        
        displayMovies(data.results);
        
    } catch (error) {
        console.error('Error:', error);
        showError('Terjadi kesalahan. Coba lagi nanti.');
    } finally {
        hideLoading();
    }
}

function displayMovies(movies) {
    movieGrid.innerHTML = '';
    
    movies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        
        let posterHtml = '';
        if (movie.poster_path) {
            posterHtml = `<img src="${IMAGE_URL}${movie.poster_path}" alt="${movie.title}" class="movie-poster">`;
        } else {
            posterHtml = `<div class="movie-poster-placeholder">🎬</div>`;
        }
        
        const rating = movie.vote_average.toFixed(1);
        
        card.innerHTML = `
            ${posterHtml}
            <div class="movie-info">
                <div class="movie-title">${escapeHtml(movie.title)}</div>
                <div class="movie-year">${movie.release_date ? movie.release_date.split('-')[0] : 'Tidak diketahui'}</div>
                <div class="movie-rating">⭐ ${rating}/10</div>
            </div>
        `;
        
       card.addEventListener('click', () => {
            window.location.href = `detailfilm.html?id=${movie.id}`;
    });
        
        movieGrid.appendChild(card);
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
    showLoading();
    try {
        const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=id-ID`;
        const response = await fetch(url);
        const data = await response.json();
        displayMovies(data.results.slice(0, 8)); 
    } catch (error) {
        console.error('Gagal load film populer:', error);
    } finally {
        hideLoading();
    }
}

loadPopularMovies();