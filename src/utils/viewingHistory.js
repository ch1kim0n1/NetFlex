// Viewing History Management for NetFlex
// Tracks user's watching progress and recently watched content

const VIEWING_HISTORY_KEY = 'netflex_viewing_history';
const MAX_RECENTLY_WATCHED = 10;

// Get all viewing history from localStorage
export const getViewingHistory = () => {
  try {
    const history = localStorage.getItem(VIEWING_HISTORY_KEY);
    return history ? JSON.parse(history) : { movies: [], shows: [] };
  } catch (error) {
    console.error('Error reading viewing history:', error);
    return { movies: [], shows: [] };
  }
};

// Save viewing history to localStorage
const saveViewingHistory = (history) => {
  try {
    localStorage.setItem(VIEWING_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving viewing history:', error);
  }
};

// Add or update movie viewing progress
export const updateMovieProgress = (movieData, progressPercentage = 0, watchedAt = new Date().toISOString()) => {
  const history = getViewingHistory();
  
  // Remove existing entry if it exists
  history.movies = history.movies.filter(item => item.id !== movieData.id);
  
  // Add new entry at the beginning
  const movieEntry = {
    id: movieData.id,
    title: movieData.title,
    image: movieData.image,
    bannerImage: movieData.bannerImage,
    description: movieData.description,
    rating: movieData.rating,
    runtime: movieData.runtime,
    genres: movieData.genres,
    releaseDate: movieData.releaseDate,
    progressPercentage: Math.max(0, Math.min(100, progressPercentage)),
    watchedAt,
    type: 'movie',
    isCompleted: progressPercentage >= 90 // Consider 90%+ as completed
  };
  
  history.movies.unshift(movieEntry);
  
  // Keep only the most recent items
  history.movies = history.movies.slice(0, MAX_RECENTLY_WATCHED);
  
  saveViewingHistory(history);
  return movieEntry;
};

// Add or update show episode viewing progress
export const updateShowProgress = (showData, season, episode, progressPercentage = 0, watchedAt = new Date().toISOString()) => {
  const history = getViewingHistory();
  
  // Remove existing entry if it exists
  history.shows = history.shows.filter(item => item.id !== showData.id);
  
  // Add new entry at the beginning
  const showEntry = {
    id: showData.id,
    title: showData.title,
    image: showData.image,
    bannerImage: showData.bannerImage,
    description: showData.description,
    rating: showData.rating,
    seasons: showData.seasons,
    totalEpisodes: showData.totalEpisodes,
    genres: showData.genres,
    releaseDate: showData.releaseDate,
    currentSeason: season,
    currentEpisode: episode,
    progressPercentage: Math.max(0, Math.min(100, progressPercentage)),
    watchedAt,
    type: 'show',
    isEpisodeCompleted: progressPercentage >= 90 // Consider 90%+ as completed
  };
  
  history.shows.unshift(showEntry);
  
  // Keep only the most recent items
  history.shows = history.shows.slice(0, MAX_RECENTLY_WATCHED);
  
  saveViewingHistory(history);
  return showEntry;
};

// Get recently watched movies
export const getRecentlyWatchedMovies = () => {
  const history = getViewingHistory();
  return history.movies || [];
};

// Get recently watched shows
export const getRecentlyWatchedShows = () => {
  const history = getViewingHistory();
  return history.shows || [];
};

// Get all recently watched content (combined)
export const getAllRecentlyWatched = () => {
  const history = getViewingHistory();
  const combined = [
    ...(history.movies || []),
    ...(history.shows || [])
  ];
  
  // Sort by watch time (most recent first)
  return combined.sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt));
};

// Remove item from viewing history
export const removeFromViewingHistory = (id, type) => {
  const history = getViewingHistory();
  
  if (type === 'movie') {
    history.movies = history.movies.filter(item => item.id !== id);
  } else if (type === 'show') {
    history.shows = history.shows.filter(item => item.id !== id);
  }
  
  saveViewingHistory(history);
};

// Clear all viewing history
export const clearViewingHistory = () => {
  try {
    localStorage.removeItem(VIEWING_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing viewing history:', error);
  }
};

// Get continue watching URL for an item
export const getContinueWatchingUrl = (item) => {
  if (item.type === 'movie') {
    return `/movies/watch/${item.id}`;
  } else if (item.type === 'show') {
    return `/shows/watch/${item.id}/${item.currentSeason}/${item.currentEpisode}`;
  }
  return null;
};

// Format progress text for display
export const formatProgressText = (item) => {
  if (item.type === 'movie') {
    if (item.isCompleted) {
      return 'Watched';
    }
    return `${Math.round(item.progressPercentage)}% watched`;
  } else if (item.type === 'show') {
    const seasonText = `S${item.currentSeason}`;
    const episodeText = `E${item.currentEpisode}`;
    
    if (item.isEpisodeCompleted) {
      return `Last watched: ${seasonText}${episodeText}`;
    }
    return `Continue ${seasonText}${episodeText} (${Math.round(item.progressPercentage)}%)`;
  }
  return '';
};

// Check if item should show "continue watching" vs "watch"
export const shouldShowContinueWatching = (item) => {
  return item.progressPercentage > 5 && !item.isCompleted; // Show continue if more than 5% watched and not completed
}; 