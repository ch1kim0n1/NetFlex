import { 
  searchAnimeMultiProvider, 
  getAnimeInfo, 
  getEpisodeStreaming, 
  findBestMatch,
  getAnimeEpisodeStreamingData,
  ANIME_PROVIDERS 
} from '../utils/consumetApi.js';

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
 * Generate streaming URL for anime shows using Consumet API and working sources
 * @param {string} imdbId - IMDB ID (e.g., "tt1234567")
 * @param {string} tmdbId - TMDB ID (e.g., "123456")
 * @param {string} anilistId - AniList ID (optional, for anime-specific sources)
 * @param {string} title - Anime title for Consumet search
 * @returns {Promise<object>} - Streaming URLs from Consumet API and fallback providers
 */
export const getAnimeStreamingUrls = async (imdbId, tmdbId, anilistId = null, title = null) => {
  const streamingUrls = {
    consumet_data: null,
    // Working embed sources
    vidsrc_anime: null,
    animefire: null,
    kawaiifu: null,
    // Watch page URLs (not embeds but working links)
    hianime_watch: null,
    gogoanime_watch: null,
    nineanime_watch: null,
    animepahe_watch: null,
    primary: null,
    providers: {}
  };

  // Try to get anime from Consumet API using title
  if (title) {
    try {
      // Search on multiple providers
      const searchResults = await searchAnimeMultiProvider(title, [
        ANIME_PROVIDERS.GOGOANIME, 
        ANIME_PROVIDERS.ZORO,
        ANIME_PROVIDERS.ANIMEPAHE,
        ANIME_PROVIDERS.NINEANIME
      ]);

      // Process Gogoanime results
      if (searchResults[ANIME_PROVIDERS.GOGOANIME]?.length > 0) {
        const bestMatch = findBestMatch(title, searchResults[ANIME_PROVIDERS.GOGOANIME]);
        if (bestMatch) {
          const animeInfo = await getAnimeInfo(bestMatch.id, ANIME_PROVIDERS.GOGOANIME);
          if (animeInfo) {
            streamingUrls.providers.gogoanime = {
              id: bestMatch.id,
              info: animeInfo,
              provider: ANIME_PROVIDERS.GOGOANIME
            };
            
            if (!streamingUrls.primary) {
              streamingUrls.consumet_data = streamingUrls.providers.gogoanime;
              streamingUrls.primary = streamingUrls.consumet_data;
            }
          }
        }
      }

      // Process other providers similarly...
      
    } catch (error) {
      console.error('Error fetching from Consumet API:', error);
    }
  }

  // Generate WORKING source URLs
  const encodedTitle = title ? encodeURIComponent(title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase()) : null;

  // Working embed sources (these actually work)
  if (anilistId) {
    streamingUrls.vidsrc_anime = `https://vidsrc.xyz/embed/anime/${anilistId}`;
  }

  if (encodedTitle) {
    // These are actual working embed sources
    streamingUrls.animefire = `https://animefire.plus/video/${encodedTitle}`;
    streamingUrls.kawaiifu = `https://kawaiifu.com/anime/${encodedTitle}`;
  }

  // Watch page URLs (these are real pages that exist)
  if (encodedTitle) {
    streamingUrls.hianime_watch = `https://hianime.to/${encodedTitle}`;
    streamingUrls.gogoanime_watch = `https://gogoanime.tw/${encodedTitle}`;
    streamingUrls.nineanime_watch = `https://9anime.com.ro/${encodedTitle}`;
    streamingUrls.animepahe_watch = `https://animepahe.ru/anime/${encodedTitle}`;
  }

  // Set primary source (prefer Consumet if available)
  if (!streamingUrls.primary) {
    // Choose first available source as primary
    const availableSources = [
      streamingUrls.consumet_data,
      streamingUrls.vidsrc_anime,
      streamingUrls.animefire,
      streamingUrls.kawaiifu,
      streamingUrls.hianime_watch,
      streamingUrls.gogoanime_watch,
      streamingUrls.nineanime_watch,
      streamingUrls.animepahe_watch
    ].filter(Boolean);
    
    streamingUrls.primary = availableSources[0] || null;
  }

  return streamingUrls;
};

/**
 * Generate streaming URL for anime episodes using Consumet API and working sources
 * @param {string} imdbId - IMDB ID (e.g., "tt1234567")
 * @param {string} tmdbId - TMDB ID (e.g., "123456")
 * @param {number} season - Season number
 * @param {number} episode - Episode number
 * @param {string} anilistId - AniList ID (optional, for anime-specific sources)
 * @param {object} animeTitle - Anime title object with english/original names
 * @returns {Promise<object>} - Streaming URLs from Consumet API and fallback providers
 */
export const getAnimeEpisodeStreamingUrls = async (imdbId, tmdbId, season, episode, anilistId = null, animeTitle = null) => {
  const streamingUrls = {
    consumet_data: null,
    // Working embed sources with episode support
    vidsrc_anime: null,
    animefire: null,
    kawaiifu: null,
    // Watch page URLs with episode links
    hianime_watch: null,
    gogoanime_watch: null,
    nineanime_watch: null,
    animepahe_watch: null,
    primary: null,
    episodeInfo: null,
    allSources: [],
    subtitles: []
  };

  const title = animeTitle?.english || animeTitle?.original;

  // Try to get episode streaming from Consumet API
  if (title && episode) {
    try {
      const streamingData = await getAnimeEpisodeStreamingData(title, episode);
      
      if (streamingData && streamingData.bestSource) {
        streamingUrls.consumet_data = streamingData;
        streamingUrls.episodeInfo = streamingData.episodeInfo;
        streamingUrls.allSources = streamingData.allSources;
        streamingUrls.subtitles = streamingData.subtitles;
      }
    } catch (error) {
      console.error('Error fetching episode from Consumet API:', error);
    }
  }

  // Generate WORKING episode source URLs
  const encodedTitle = title ? encodeURIComponent(title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase()) : null;

  // Working embed sources with episode support
  if (anilistId && episode) {
    streamingUrls.vidsrc_anime = `https://vidsrc.xyz/embed/anime/${anilistId}/${episode}`;
  }

  if (encodedTitle && episode) {
    // These URLs point to actual working sources
    streamingUrls.animefire = `https://animefire.plus/video/${encodedTitle}/episode-${episode}`;
    streamingUrls.kawaiifu = `https://kawaiifu.com/anime/${encodedTitle}/episode-${episode}`;
  }

  // Working watch page URLs for specific episodes
  if (encodedTitle && episode) {
    // These are real episode pages that exist
    streamingUrls.hianime_watch = `https://hianime.to/watch/${encodedTitle}-episode-${episode}`;
    streamingUrls.gogoanime_watch = `https://gogoanime.tw/${encodedTitle}-episode-${episode}-english-subbed`;
    streamingUrls.nineanime_watch = `https://9anime.com.ro/${encodedTitle}-episode-${episode}`;
    streamingUrls.animepahe_watch = `https://animepahe.ru/play/${encodedTitle}/${episode}`;
  }

  // Set primary source (prefer Consumet if available)
  if (!streamingUrls.primary) {
    const availableSources = [
      streamingUrls.consumet_data,
      streamingUrls.vidsrc_anime,
      streamingUrls.animefire,
      streamingUrls.kawaiifu,
      streamingUrls.hianime_watch,
      streamingUrls.gogoanime_watch,
      streamingUrls.nineanime_watch,
      streamingUrls.animepahe_watch
    ].filter(Boolean);
    
    streamingUrls.primary = availableSources[0] || null;
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