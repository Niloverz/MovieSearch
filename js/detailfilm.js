const API_KEY = 'API _KEY'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

function getMovieIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

const loadingDetail = document.getElementById('loadingDetail');
const errorDetail = document.getElementById('errorDetail');
const movieDetail = document.getElementById('movieDetail');

async function loadMovieDetail() {
    const movieId = getMovieIdFromUrl();
    
    if (!movieId) {
        showError();
        return;
    }
    
    try {
        const url = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=id-ID`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Gagal memuat detail');
        
        const movie = await response.json();
        displayMovieDetail(movie);
        
    } catch (error) {
        console.error('Error:', error);
        showError();
    }
}

function displayMovieDetail(movie) {
    const posterImg = document.getElementById('posterImg');
    if (movie.poster_path) {
        posterImg.src = `${IMAGE_URL}${movie.poster_path}`;
        posterImg.alt = movie.title;
    } else {
        posterImg.src = '';
        posterImg.alt = 'No poster';
    }
    
    document.getElementById('movieTitle').textContent = movie.title;
    
    document.getElementById('movieYear').textContent = movie.release_date ? movie.release_date.split('-')[0] : 'Tidak diketahui';
    
    const runtime = movie.runtime;
    if (runtime) {
        const hours = Math.floor(runtime / 60);
        const minutes = runtime % 60;
        document.getElementById('movieRuntime').textContent = `${hours}j ${minutes}m`;
    } else {
        document.getElementById('movieRuntime').textContent = 'Tidak diketahui';
    }
    
    document.getElementById('movieRating').innerHTML = `⭐ ${movie.vote_average.toFixed(1)}/10`;
    
    const genresContainer = document.getElementById('movieGenres');
    genresContainer.innerHTML = '';
    movie.genres.forEach(genre => {
        const badge = document.createElement('span');
        badge.className = 'genre-badge';
        badge.textContent = genre.name;
        genresContainer.appendChild(badge);
    });
    
    document.getElementById('movieOverview').textContent = movie.overview || 'Tidak ada sinopsis.';
    
    document.getElementById('movieStatus').textContent = movie.status || 'Tidak diketahui';
    document.getElementById('movieLanguage').textContent = movie.original_language?.toUpperCase() || 'Tidak diketahui';
    document.getElementById('movieReleaseDate').textContent = movie.release_date || 'Tidak diketahui';
    
    loadingDetail.classList.add('hidden');
    movieDetail.classList.remove('hidden');
}

function showError() {
    loadingDetail.classList.add('hidden');
    errorDetail.classList.remove('hidden');
}

document.getElementById('backBtn').addEventListener('click', () => {
    if (document.referrer && document.referrer.includes('index.html')) {
        window.location.href = document.referrer;
    } else {
        window.location.href = 'index.html';
    }
});

document.addEventListener('DOMContentLoaded', loadMovieDetail);