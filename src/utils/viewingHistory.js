// Viewing History Management for NetFlex
// Tracks user's watching progress and recently watched content

const VIEWING_HISTORY_KEY = 'netflex_viewing_history';
const MAX_RECENTLY_WATCHED = 10;

// Import invalidateRecommendationCache and recordImplicitFeedback for automatic learning
let invalidateRecommendationCache = null;
let recordImplicitFeedback = null;

try {
  const recommendationsModule = require('./recommendations');
  invalidateRecommendationCache = recommendationsModule.invalidateRecommendationCache;
} catch (error) {
  console.debug('Recommendations module not available');
}

try {
  const feedbackModule = require('./userFeedback');
  recordImplicitFeedback = feedbackModule.recordImplicitFeedback;
} catch (error) {
  console.debug('User feedback module not available');
}

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

// Save viewing history to localStorage with automatic feedback learning
const saveViewingHistory = (history) => {
  try {
    localStorage.setItem(VIEWING_HISTORY_KEY, JSON.stringify(history));
    
    // Invalidate recommendation cache when viewing history changes
    if (invalidateRecommendationCache) {
      invalidateRecommendationCache();
    }
  } catch (error) {
    console.error('Error saving viewing history:', error);
  }
};

// Automatically record implicit feedback based on viewing behavior
const recordViewingFeedback = (contentData, progressPercentage, sessionDuration = 0) => {
  if (!recordImplicitFeedback) return;

  try {
    // Determine feedback type based on viewing behavior
    if (progressPercentage >= 90) {
      // Completed content - strong positive signal
      recordImplicitFeedback(contentData.id, contentData.type || 'movie', 'watch_complete', {
        progressPercentage,
        sessionDuration
      });
    } else if (progressPercentage >= 70) {
      // Mostly watched - positive signal
      recordImplicitFeedback(contentData.id, contentData.type || 'movie', 'watch_partial', {
        progressPercentage,
        sessionDuration
      });
    } else if (progressPercentage < 10 && sessionDuration < 300) {
      // Quickly skipped - negative signal
      recordImplicitFeedback(contentData.id, contentData.type || 'movie', 'skip_quickly', {
        progressPercentage,
        sessionDuration
      });
    }

    // Check for rewatch behavior
    const history = getViewingHistory();
    const allContent = [...(history.movies || []), ...(history.shows || [])];
    const previousWatches = allContent.filter(item => 
      item.id === contentData.id && item.type === contentData.type
    );
    
    if (previousWatches.length > 1) {
      recordImplicitFeedback(contentData.id, contentData.type || 'movie', 'rewatch', {
        rewatchCount: previousWatches.length,
        progressPercentage
      });
    }
  } catch (error) {
    console.error('Error recording viewing feedback:', error);
  }
};

// Add or update movie viewing progress with enhanced timestamp tracking and automatic feedback
export const updateMovieProgress = (movieData, progressPercentage = 0, watchedAt = new Date().toISOString(), currentTime = 0, sessionDuration = 0) => {
  const history = getViewingHistory();
  
  // Remove existing entry if it exists
  const existingMovie = history.movies.find(item => item.id === movieData.id);
  history.movies = history.movies.filter(item => item.id !== movieData.id);
  
  // Calculate precise timestamp in seconds
  const totalDuration = movieData.runtime ? movieData.runtime * 60 : 0; // Convert to seconds
  const exactTimestamp = Math.round((progressPercentage / 100) * totalDuration);
  
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
    isCompleted: progressPercentage >= 90, // Consider 90%+ as completed
    // Enhanced tracking fields
    currentTimestamp: currentTime || exactTimestamp, // Exact position in seconds
    totalDuration: totalDuration,
    sessionCount: (existingMovie?.sessionCount || 0) + 1,
    lastDevice: navigator.userAgent || 'Unknown',
    watchingSessions: [
      ...(existingMovie?.watchingSessions || []),
      {
        startTime: watchedAt,
        endTime: watchedAt,
        duration: sessionDuration,
        device: navigator.userAgent || 'Unknown',
        progress: progressPercentage
      }
    ]
  };
  
  history.movies.unshift(movieEntry);
  
  // Keep only the most recent items
  history.movies = history.movies.slice(0, MAX_RECENTLY_WATCHED);
  
  // Record implicit feedback
  recordViewingFeedback(movieEntry, progressPercentage, sessionDuration);
  
  saveViewingHistory(history);
  return movieEntry;
};

// Add or update show episode viewing progress with enhanced timestamp tracking
export const updateShowProgress = (showData, season, episode, progressPercentage = 0, watchedAt = new Date().toISOString(), currentTime = 0, episodeDuration = 2700) => {
  const history = getViewingHistory();
  
  // Find existing entry to preserve session history
  const existingEntry = history.shows.find(item => item.id === showData.id);
  
  // Remove existing entry if it exists
  history.shows = history.shows.filter(item => item.id !== showData.id);
  
  // Calculate precise timestamp in seconds (default 45 min episode = 2700 seconds)
  const totalDuration = episodeDuration;
  const exactTimestamp = Math.round((progressPercentage / 100) * totalDuration);
  
  // Preserve episode tracking across seasons
  const episodeHistory = existingEntry?.episodeHistory || {};
  const episodeKey = `S${season}E${episode}`;
  
  // Update episode history
  episodeHistory[episodeKey] = {
    season,
    episode,
    progressPercentage,
    currentTimestamp: currentTime || exactTimestamp,
    totalDuration,
    watchedAt,
    isCompleted: progressPercentage >= 90
  };
  
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
    type: showData.type || 'show', // Use the actual type from the show data (anime, show, etc.)
    isEpisodeCompleted: progressPercentage >= 90, // Consider 90%+ as completed
    // Enhanced tracking fields
    currentTimestamp: currentTime || exactTimestamp, // Exact position in seconds
    totalDuration: totalDuration,
    sessionCount: (existingEntry?.sessionCount || 0) + 1,
    lastDevice: navigator.userAgent || 'Unknown',
    episodeHistory, // Track progress for each episode
    watchingSessions: [
      ...(existingEntry?.watchingSessions || []),
      {
        startTime: watchedAt,
        endTime: watchedAt,
        duration: 0,
        device: navigator.userAgent || 'Unknown',
        progress: progressPercentage,
        season,
        episode
      }
    ].slice(-10) // Keep last 10 sessions
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

// Get recently watched anime specifically
export const getRecentlyWatchedAnime = () => {
  const history = getViewingHistory();
  return (history.shows || []).filter(item => item.type === 'anime');
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
  } else if (item.type === 'anime') {
    return `/anime/watch/${item.id}/${item.currentSeason}/${item.currentEpisode}`;
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
  } else if (item.type === 'show' || item.type === 'anime') {
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

// Enhanced timestamp tracking functions

/**
 * Update viewing progress with precise timestamp tracking
 */
export const updateViewingTimestamp = (itemId, itemType, currentTimestamp, sessionDuration = 0) => {
  const history = getViewingHistory();
  const contentArray = itemType === 'movie' ? history.movies : history.shows;
  const itemIndex = contentArray.findIndex(item => item.id === itemId);
  
  if (itemIndex === -1) return false;
  
  const item = contentArray[itemIndex];
  const now = new Date().toISOString();
  
  // Update timestamp and progress
  item.currentTimestamp = Math.max(0, Math.min(item.totalDuration || 0, currentTimestamp));
  item.progressPercentage = item.totalDuration > 0 ? 
    Math.round((item.currentTimestamp / item.totalDuration) * 100) : 0;
  item.watchedAt = now;
  item.lastDevice = navigator.userAgent || 'Unknown';
  
  // Update completion status
  if (itemType === 'movie') {
    item.isCompleted = item.progressPercentage >= 90;
  } else {
    item.isEpisodeCompleted = item.progressPercentage >= 90;
  }
  
  // Update watching sessions
  if (!item.watchingSessions) item.watchingSessions = [];
  
  const lastSession = item.watchingSessions[item.watchingSessions.length - 1];
  if (lastSession && new Date(now) - new Date(lastSession.startTime) < 30 * 60 * 1000) {
    // Update existing session if within 30 minutes
    lastSession.endTime = now;
    lastSession.duration += sessionDuration;
    lastSession.progress = item.progressPercentage;
  } else {
    // Create new session
    item.watchingSessions.push({
      startTime: now,
      endTime: now,
      duration: sessionDuration,
      device: navigator.userAgent || 'Unknown',
      progress: item.progressPercentage
    });
    
    // Keep only last 10 sessions
    item.watchingSessions = item.watchingSessions.slice(-10);
  }
  
  saveViewingHistory(history);
  return true;
};

/**
 * Get precise continue watching timestamp for a content item
 */
export const getContinueWatchingTimestamp = (item) => {
  if (!item || !item.currentTimestamp) return 0;
  
  // Don't continue if very close to the end (last 2 minutes)
  const timeRemaining = (item.totalDuration || 0) - item.currentTimestamp;
  if (timeRemaining < 120) return 0;
  
  // Don't continue if at the very beginning (first 30 seconds)
  if (item.currentTimestamp < 30) return 0;
  
  return item.currentTimestamp;
};

/**
 * Format timestamp for display (e.g., "1:23:45")
 */
export const formatTimestamp = (seconds) => {
  if (!seconds || seconds < 0) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

/**
 * Calculate time remaining for content
 */
export const getTimeRemaining = (item) => {
  if (!item || !item.totalDuration || !item.currentTimestamp) {
    return { seconds: 0, formatted: '0:00' };
  }
  
  const remaining = Math.max(0, item.totalDuration - item.currentTimestamp);
  return {
    seconds: remaining,
    formatted: formatTimestamp(remaining)
  };
};

/**
 * Get viewing session analytics for an item
 */
export const getSessionAnalytics = (item) => {
  if (!item || !item.watchingSessions) {
    return {
      totalSessions: 0,
      totalWatchTime: 0,
      averageSessionLength: 0,
      devicesUsed: [],
      firstWatched: null,
      lastWatched: null
    };
  }
  
  const sessions = item.watchingSessions;
  const totalWatchTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  const devices = [...new Set(sessions.map(s => s.device).filter(Boolean))];
  
  return {
    totalSessions: sessions.length,
    totalWatchTime,
    averageSessionLength: sessions.length > 0 ? totalWatchTime / sessions.length : 0,
    devicesUsed: devices,
    firstWatched: sessions.length > 0 ? sessions[0].startTime : null,
    lastWatched: sessions.length > 0 ? sessions[sessions.length - 1].endTime : null
  };
};

/**
 * Sync viewing progress across devices (placeholder for future cloud sync)
 */
export const syncViewingProgress = async (userId = null) => {
  // This would integrate with a cloud service for cross-device sync
  // For now, we'll just simulate the sync process
  
  const localHistory = getViewingHistory();
  
  try {
    // In a real implementation, this would:
    // 1. Upload local changes to cloud
    // 2. Download remote changes
    // 3. Merge and resolve conflicts
    // 4. Update local storage
    
    console.log('Syncing viewing progress...', {
      localMovies: localHistory.movies?.length || 0,
      localShows: localHistory.shows?.length || 0,
      timestamp: new Date().toISOString()
    });
    
    // Simulate success
    return {
      success: true,
      synced: {
        movies: localHistory.movies?.length || 0,
        shows: localHistory.shows?.length || 0
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error syncing viewing progress:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Auto-save viewing progress at regular intervals
 */
let autoSaveInterval = null;

export const startAutoSave = (itemId, itemType, getTimestampFn, intervalMs = 30000) => {
  // Clear existing interval
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }
  
  autoSaveInterval = setInterval(() => {
    if (typeof getTimestampFn === 'function') {
      const currentTime = getTimestampFn();
      if (currentTime > 0) {
        updateViewingTimestamp(itemId, itemType, currentTime, intervalMs / 1000);
      }
    }
  }, intervalMs);
  
  return autoSaveInterval;
};

export const stopAutoSave = () => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
};

/**
 * Enhanced continue watching URL with timestamp
 */
export const getContinueWatchingUrlWithTimestamp = (item) => {
  const baseUrl = getContinueWatchingUrl(item);
  if (!baseUrl) return null;
  
  const timestamp = getContinueWatchingTimestamp(item);
  if (timestamp > 0) {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}t=${Math.floor(timestamp)}`;
  }
  
  return baseUrl;
}; 