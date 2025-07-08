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
 * @param {string} anilistId - AniList ID (optional, for anime-specific sources)
 * @returns {object} - Streaming URLs from different providers
 */
export const getAnimeStreamingUrls = (imdbId, tmdbId, anilistId = null) => {
  const streamingUrls = {
    vidsrc_anime: null,
    vidsrc_tv: null,
    embed2: null,
    animepahe: null,
    primary: null
  };

  // Anime-specific VidSrc endpoint (uses AniList ID)
  if (anilistId) {
    streamingUrls.vidsrc_anime = `https://vidsrc.icu/embed/anime/${anilistId}/1/0`; // Sub by default
    streamingUrls.primary = streamingUrls.vidsrc_anime; // Use anime-specific as primary
  }

  // 2Embed anime source with improved format
  if (tmdbId) {
    streamingUrls.embed2 = `https://www.2embed.cc/embedtv/${tmdbId}`;
    if (!streamingUrls.primary) {
      streamingUrls.primary = streamingUrls.embed2;
    }
  }

  // Fallback to TV show endpoints for general anime
  if (imdbId) {
    streamingUrls.vidsrc_tv = `https://vidsrc.xyz/embed/tv/${imdbId}`;
    if (!streamingUrls.primary) {
      streamingUrls.primary = streamingUrls.vidsrc_tv;
    }
  } else if (tmdbId && !streamingUrls.primary) {
    streamingUrls.vidsrc_tv = `https://vidsrc.xyz/embed/tv/${tmdbId}`;
    streamingUrls.primary = streamingUrls.vidsrc_tv;
  }

  return streamingUrls;
};

/**
 * Generate streaming URL for anime episodes
 * @param {string} imdbId - IMDB ID (e.g., "tt1234567")
 * @param {string} tmdbId - TMDB ID (e.g., "123456")
 * @param {number} season - Season number
 * @param {number} episode - Episode number
 * @param {string} anilistId - AniList ID (optional, for anime-specific sources)
 * @param {object} animeTitle - Anime title object with english/original names
 * @returns {object} - Streaming URLs from different providers
 */
export const getAnimeEpisodeStreamingUrls = (imdbId, tmdbId, season, episode, anilistId = null, animeTitle = null) => {
  const streamingUrls = {
    vidsrc_anime: null,
    vidsrc_tv: null,
    embed2: null,
    animepahe: null,
    primary: null
  };

  // Anime-specific VidSrc endpoint (uses AniList ID and episode number)
  if (anilistId && episode) {
    streamingUrls.vidsrc_anime = `https://vidsrc.icu/embed/anime/${anilistId}/${episode}/0`; // Sub by default
    streamingUrls.primary = streamingUrls.vidsrc_anime; // Use anime-specific as primary
  }

  // 2Embed anime episode source - Fixed URL format
  if (tmdbId && season && episode) {
    // Use the correct 2embed TV format for anime episodes
    streamingUrls.embed2 = `https://www.2embed.cc/embedtv/${tmdbId}?s=${season}&e=${episode}`;
    
    if (!streamingUrls.primary) {
      streamingUrls.primary = streamingUrls.embed2;
    }
  }

  // Fallback to TV show endpoints
  if (imdbId && season && episode) {
    streamingUrls.vidsrc_tv = `https://vidsrc.xyz/embed/tv/${imdbId}/${season}-${episode}`;
    if (!streamingUrls.primary) {
      streamingUrls.primary = streamingUrls.vidsrc_tv;
    }
  } else if (tmdbId && season && episode && !streamingUrls.primary) {
    streamingUrls.vidsrc_tv = `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}-${episode}`;
    streamingUrls.primary = streamingUrls.vidsrc_tv;
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
 * Basic TMDB to AniList ID mapping for popular anime
 * In a real implementation, this would use a comprehensive mapping database
 */
const TMDB_TO_ANILIST_MAPPING = {
  // Attack on Titan
  '1429': '16498',
  // Naruto
  '1429': '20',
  // One Piece  
  '37854': '21',
  // Death Note
  '13916': '1535',
  // My Hero Academia
  '65930': '21459',
  // Demon Slayer
  '85937': '101922',
  // Jujutsu Kaisen
  '95479': '113415',
  // Dragon Ball Z
  '12971': '813',
  // One Punch Man
  '73223': '21087',
  // Fullmetal Alchemist: Brotherhood
  '31911': '5114',
  // Hunter x Hunter (2011)
  '46298': '11061',
  // Tokyo Ghoul
  '60574': '20605',
  // Spirited Away (movie, but including for reference)
  '129': '199',
  // Your Name
  '372058': '21519',
};

/**
 * Get AniList ID from TMDB/IMDB IDs
 * @param {string} tmdbId - TMDB ID
 * @param {string} imdbId - IMDB ID
 * @param {string} title - Anime title for fuzzy matching
 * @returns {string|null} - AniList ID or null
 */
export const getAniListId = async (tmdbId, imdbId, title) => {
  // Check our basic mapping first
  if (tmdbId && TMDB_TO_ANILIST_MAPPING[tmdbId]) {
    return TMDB_TO_ANILIST_MAPPING[tmdbId];
  }
  
  // In a real implementation, you would:
  // 1. Use a comprehensive mapping database (TMDB -> AniList)
  // 2. Call an API service that provides this mapping
  // 3. Use fuzzy title matching with AniList API
  // 4. Use services like Kitsu.io API for cross-referencing
  
  // For now, return null for unmapped anime
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
    // For anime, we may need to get AniList ID asynchronously
    streamingUrls = getAnimeStreamingUrls(imdbId, tmdbId);
  }

  return {
    ...item,
    streaming: streamingUrls,
    imdbId,
    tmdbId
  };
}; 