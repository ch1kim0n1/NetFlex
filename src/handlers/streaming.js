// Streaming API handlers for NetFlex
// Uses VidSrc and AutoEmbed APIs for actual streaming

/**
 * Generate streaming URL for movies
 * @param {string} imdbId - IMDB ID (e.g., "tt1234567")
 * @param {string} tmdbId - TMDB ID (e.g., "123456")
 * @returns {object} - Streaming URLs from different providers
 */
export const getMovieStreamingUrls = (imdbId, tmdbId) => {
  const streamingUrls = {
    vidsrc: null,
    autoembed: null,
    primary: null
  };

  if (imdbId) {
    // VidSrc URLs
    streamingUrls.vidsrc = `https://vidsrc.xyz/embed/movie/${imdbId}`;
    streamingUrls.autoembed = `https://autoembed.co/movie/imdb/${imdbId}`;
    streamingUrls.primary = streamingUrls.vidsrc; // Use VidSrc as primary
  } else if (tmdbId) {
    // Fallback to TMDB ID
    streamingUrls.vidsrc = `https://vidsrc.xyz/embed/movie/${tmdbId}`;
    streamingUrls.autoembed = `https://autoembed.co/movie/tmdb/${tmdbId}`;
    streamingUrls.primary = streamingUrls.vidsrc;
  }

  return streamingUrls;
};

/**
 * Generate streaming URL for TV show episodes
 * @param {string} imdbId - IMDB ID (e.g., "tt1234567")
 * @param {string} tmdbId - TMDB ID (e.g., "123456")
 * @param {number} season - Season number
 * @param {number} episode - Episode number
 * @returns {object} - Streaming URLs from different providers
 */
export const getEpisodeStreamingUrls = (imdbId, tmdbId, season, episode) => {
  const streamingUrls = {
    vidsrc: null,
    autoembed: null,
    primary: null
  };

  if (imdbId && season && episode) {
    // VidSrc URLs
    streamingUrls.vidsrc = `https://vidsrc.xyz/embed/tv/${imdbId}/${season}-${episode}`;
    streamingUrls.autoembed = `https://autoembed.co/tv/imdb/${imdbId}-${season}-${episode}`;
    streamingUrls.primary = streamingUrls.vidsrc; // Use VidSrc as primary
  } else if (tmdbId && season && episode) {
    // Fallback to TMDB ID
    streamingUrls.vidsrc = `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}-${episode}`;
    streamingUrls.autoembed = `https://autoembed.co/tv/tmdb/${tmdbId}-${season}-${episode}`;
    streamingUrls.primary = streamingUrls.vidsrc;
  }

  return streamingUrls;
};

/**
 * Generate streaming URL for TV shows (general)
 * @param {string} imdbId - IMDB ID (e.g., "tt1234567")
 * @param {string} tmdbId - TMDB ID (e.g., "123456")
 * @returns {object} - Streaming URLs from different providers
 */
export const getShowStreamingUrls = (imdbId, tmdbId) => {
  const streamingUrls = {
    vidsrc: null,
    autoembed: null,
    primary: null
  };

  if (imdbId) {
    // VidSrc URLs
    streamingUrls.vidsrc = `https://vidsrc.xyz/embed/tv/${imdbId}`;
    streamingUrls.primary = streamingUrls.vidsrc; // Use VidSrc as primary
  } else if (tmdbId) {
    // Fallback to TMDB ID
    streamingUrls.vidsrc = `https://vidsrc.xyz/embed/tv/${tmdbId}`;
    streamingUrls.primary = streamingUrls.vidsrc;
  }

  return streamingUrls;
};

/**
 * Generate streaming URL for anime shows (general)
 * @param {string} imdbId - IMDB ID (e.g., "tt1234567")
 * @param {string} tmdbId - TMDB ID (e.g., "123456")
 * @returns {object} - Streaming URLs from different providers
 */
export const getAnimeStreamingUrls = (imdbId, tmdbId) => {
  const streamingUrls = {
    vidsrc: null,
    autoembed: null,
    primary: null
  };

  if (imdbId) {
    // VidSrc URLs for anime (same as TV shows)
    streamingUrls.vidsrc = `https://vidsrc.xyz/embed/tv/${imdbId}`;
    streamingUrls.primary = streamingUrls.vidsrc; // Use VidSrc as primary
  } else if (tmdbId) {
    // Fallback to TMDB ID
    streamingUrls.vidsrc = `https://vidsrc.xyz/embed/tv/${tmdbId}`;
    streamingUrls.primary = streamingUrls.vidsrc;
  }

  return streamingUrls;
};

/**
 * Generate streaming URL for anime episodes
 * @param {string} imdbId - IMDB ID (e.g., "tt1234567")
 * @param {string} tmdbId - TMDB ID (e.g., "123456")
 * @param {number} season - Season number
 * @param {number} episode - Episode number
 * @returns {object} - Streaming URLs from different providers
 */
export const getAnimeEpisodeStreamingUrls = (imdbId, tmdbId, season, episode) => {
  const streamingUrls = {
    vidsrc: null,
    autoembed: null,
    primary: null
  };

  if (imdbId && season && episode) {
    // VidSrc URLs for anime episodes (same format as TV shows)
    streamingUrls.vidsrc = `https://vidsrc.xyz/embed/tv/${imdbId}/${season}-${episode}`;
    streamingUrls.autoembed = `https://autoembed.co/tv/imdb/${imdbId}-${season}-${episode}`;
    streamingUrls.primary = streamingUrls.vidsrc; // Use VidSrc as primary
  } else if (tmdbId && season && episode) {
    // Fallback to TMDB ID
    streamingUrls.vidsrc = `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}-${episode}`;
    streamingUrls.autoembed = `https://autoembed.co/tv/tmdb/${tmdbId}-${season}-${episode}`;
    streamingUrls.primary = streamingUrls.vidsrc;
  }

  return streamingUrls;
};

/**
 * Extract IMDB ID from external IDs object
 * @param {object} externalIds - External IDs from TMDB
 * @returns {string|null} - IMDB ID or null
 */
export const extractImdbId = (externalIds) => {
  if (externalIds && externalIds.imdb_id) {
    return externalIds.imdb_id;
  }
  return null;
};

/**
 * Format streaming data for consistency
 * @param {object} item - Movie, show, or anime data from TMDB
 * @param {string} type - 'movie', 'tv', or 'anime'
 * @returns {object} - Formatted data with streaming URLs
 */
export const formatStreamingData = (item, type = 'movie') => {
  const imdbId = extractImdbId(item.external_ids);
  const tmdbId = item.id?.toString();
  
  let streamingUrls = {};
  
  if (type === 'movie') {
    streamingUrls = getMovieStreamingUrls(imdbId, tmdbId);
  } else if (type === 'tv') {
    streamingUrls = getShowStreamingUrls(imdbId, tmdbId);
  } else if (type === 'anime') {
    streamingUrls = getAnimeStreamingUrls(imdbId, tmdbId);
  }

  return {
    ...item,
    streaming: streamingUrls,
    imdbId,
    tmdbId
  };
}; 