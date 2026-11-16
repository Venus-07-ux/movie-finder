// Ключ берётся из .env, в коде его нет
const API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const JSON_SERVER_URL = import.meta.env.VITE_JSON_SERVER_URL;

const titleInput = document.getElementById('titleInput');
const searchBtn = document.getElementById('searchBtn');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');
const titleYearEl = document.getElementById('titleYear');
const ratingEl = document.getElementById('rating');
const plotEl = document.getElementById('plot');
const watchlistBtn = document.getElementById('watchlistBtn');

let currentMovie = null;

function setStatus(text, type = '') {
  statusEl.textContent = text;
  statusEl.className = type;
}

// GET: поиск фильма
async function searchMovie() {
  const title = titleInput.value.trim();
  if (!title) {
    setStatus('Please enter a movie title.', 'error');
    return;
  }
  if (!API_KEY) {
    setStatus('API key is missing. Check your .env file.', 'error');
    return;
  }

  searchBtn.disabled = true;
  resultEl.classList.add('hidden');
  setStatus('Loading...');

  try {
    const url = `https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(title)}&plot=full`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    if (data.Response === 'False') {
      throw new Error(data.Error);
    }

    currentMovie = {
      title: data.Title,
      year: data.Year,
      rating: data.imdbRating,
      plot: data.Plot,
      imdbID: data.imdbID,
    };

    titleYearEl.textContent = `${currentMovie.title} (${currentMovie.year})`;
    ratingEl.textContent = `⭐ ${currentMovie.rating} / 10`;
    plotEl.textContent = currentMovie.plot;
    resultEl.classList.remove('hidden');
    setStatus('');
  } catch (error) {
    setStatus(`Error: ${error.message}`, 'error');
  } finally {
    searchBtn.disabled = false;
  }
}

// POST: mock Add to Watchlist (в JSON Server)
async function addToWatchlist() {
  if (!currentMovie) return;
  watchlistBtn.disabled = true;

  try {
    const response = await fetch(`${JSON_SERVER_URL}/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentMovie),
    });

    if (!response.ok) {
      throw new Error(`Could not save: ${response.status}`);
    }

    const saved = await response.json();
    setStatus(`"${saved.title}" added to watchlist ✅`, 'ok');
  } catch (error) {
    setStatus(`Error: ${error.message}. Is JSON Server running?`, 'error');
  } finally {
    watchlistBtn.disabled = false;
  }
}

searchBtn.addEventListener('click', searchMovie);
titleInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchMovie();
});
watchlistBtn.addEventListener('click', addToWatchlist);