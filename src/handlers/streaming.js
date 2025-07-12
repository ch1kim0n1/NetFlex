// Modern Streaming Handler
// Focused on reliable anime streaming sources

import { 
  getAniListId,
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
    // VidSrc - reliable iframe embed source
    streamingUrls.vidsrc = `https://vidsrc.xyz/embed/movie/${imdbId}`;
    // AutoEmbed - alternative iframe embed source
    streamingUrls.autoembed = `https://autoembed.co/movie/imdb/${imdbId}`;
    streamingUrls.primary = streamingUrls.vidsrc;
  } else if (tmdbId) {
    // Fallback to TMDB ID if IMDB ID not available
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
    streamingUrls.vidsrc = `https://vidsrc.xyz/embed/tv/${imdbId}/${season}-${episode}`;
    streamingUrls.autoembed = `https://autoembed.co/tv/imdb/${imdbId}-${season}-${episode}`;
    streamingUrls.primary = streamingUrls.vidsrc;
  } else if (tmdbId && season && episode) {
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
    streamingUrls.vidsrc = `https://vidsrc.xyz/embed/tv/${imdbId}`;
    streamingUrls.autoembed = `https://autoembed.co/tv/imdb/${imdbId}`;
    streamingUrls.primary = streamingUrls.vidsrc;
  } else if (tmdbId) {
    streamingUrls.vidsrc = `https://vidsrc.xyz/embed/tv/${tmdbId}`;
    streamingUrls.autoembed = `https://autoembed.co/tv/tmdb/${tmdbId}`;
    streamingUrls.primary = streamingUrls.vidsrc;
  }

  return streamingUrls;
};

const encodeAnimeTitle = (title) => {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove multiple hyphens
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .trim();
};

const ANIME_STREAMING_SOURCES = {
  VIDSTREAMING: {
    name: 'VidStreaming',
    type: 'embed',
    quality: 'high',
    generateUrl: (title, episode) => {
      const cleanTitle = encodeAnimeTitle(title);
      return episode
        ? `https://vidstreaming.io/embed/${cleanTitle}-episode-${episode}`
        : `https://vidstreaming.io/embed/${cleanTitle}`;
    },
  },
  DOUVIDEO: {
    name: 'DouVideo',
    type: 'embed',
    quality: 'high',
    generateUrl: (title, episode) => {
      const cleanTitle = encodeAnimeTitle(title);
      return episode
        ? `https://douvideo.com/embed/${cleanTitle}-episode-${episode}`
        : `https://douvideo.com/embed/${cleanTitle}`;
    },
  },
  VIDCLOUD: {
    name: 'VidCloud',
    type: 'embed',
    quality: 'high',
    generateUrl: (title, episode) => {
      const cleanTitle = encodeAnimeTitle(title);
      return episode
        ? `https://rabbitstream.net/embed/${cleanTitle}/${episode}`
        : `https://rabbitstream.net/embed/${cleanTitle}`;
    },
  },
  VIDSRC: {
    name: 'VidSrc',
    type: 'embed',
    quality: 'high',
    generateUrl: (title, episode, anilistId) => {
      if (anilistId) {
        return episode
          ? `https://vidsrc.xyz/embed/anime/${anilistId}/${episode}`
          : `https://vidsrc.xyz/embed/anime/${anilistId}`;
      }
      return null;
    },
  },
};

const generateAllAnimeStreamingUrls = (title, episode = null, anilistId = null) => {
  const sources = {};
  Object.entries(ANIME_STREAMING_SOURCES).forEach(([key, source]) => {
    try {
      const url = source.generateUrl(title, episode, anilistId);
      if (url) {
        sources[key.toLowerCase()] = {
          name: source.name,
          url: url,
          type: source.type,
          quality: source.quality,
          working: true
        };
      }
    } catch (error) {
      console.warn(`Error generating URL for ${source.name}:`, error);
    }
  });
  return sources;
};

const getBestAnimeStreamingSource = (sources) => {
  if (!sources || Object.keys(sources).length === 0) return null;
  const priority = ['vidstreaming', 'douvideo', 'vidcloud', 'vidsrc'];
  for (const key of priority) {
    if (sources[key] && sources[key].working) {
      return sources[key];
    }
  }
  return Object.values(sources).find(source => source.working) || null;
};

/**
 * Generate streaming URLs for anime using the new reliable sources
 * @param {string} imdbId - IMDB ID (e.g., "tt1234567")
 * @param {string} tmdbId - TMDB ID (e.g., "123456")
 * @param {string} anilistId - AniList ID (optional)
 * @param {string} title - Anime title
 * @returns {Promise<object>} - Comprehensive anime streaming data
 */
export const getAnimeStreamingUrls = async (imdbId, tmdbId, anilistId = null, title = null) => {
  try {
    if (!title) {
      throw new Error('Anime title is required for streaming URL generation');
    }

    const sources = generateAllAnimeStreamingUrls(title, null, anilistId);
    const bestSource = getBestAnimeStreamingSource(sources);
    const embedSources = Object.values(sources).filter(s => s.type === 'embed');

    // Generate streaming URLs in the format expected by AnimeStreamingPlayer
    const cleanTitle = encodeAnimeTitle(title);
    const streamingUrls = {
      primary: bestSource?.url || null,
      // VidSrc anime specific URLs
      vidsrc_anime: anilistId ? `https://vidsrc.xyz/embed/anime/${anilistId}` : null,
      // Alternative anime streaming sources
      animefire: `https://animefire.net/embed/${cleanTitle}`,
      kawaiifu: `https://kawaiifu.com/embed/${cleanTitle}`,
      // Working embed sources
      vidstreaming: sources.vidstreaming?.url || null,
      douvideo: sources.douvideo?.url || null,
      vidcloud: sources.vidcloud?.url || null,
      vidsrc: sources.vidsrc?.url || null,
      // Watch page links
      hianime_watch: `https://hianime.to/watch/${cleanTitle}`,
      gogoanime_watch: `https://gogoanime.lu/watch/${cleanTitle}`,
      nineanime_watch: `https://9anime.pl/watch/${cleanTitle}`,
      animepahe_watch: `https://animepahe.com/play/${cleanTitle}`,
      // Legacy format support
      sources: sources,
      embedSources: embedSources,
      externalSources: [],
      totalSources: Object.keys(sources).length,
      hasEmbedSources: embedSources.length > 0,
      hasExternalSources: false,
      bestSource: bestSource,
      working: Object.keys(sources).length > 0
    };

    return streamingUrls;
  } catch (error) {
    console.error('Error generating anime streaming URLs:', error);
    return {
      primary: null,
      vidsrc_anime: null,
      animefire: null,
      kawaiifu: null,
      vidstreaming: null,
      douvideo: null,
      vidcloud: null,
      vidsrc: null,
      hianime_watch: null,
      gogoanime_watch: null,
      nineanime_watch: null,
      animepahe_watch: null,
      sources: {},
      embedSources: [],
      externalSources: [],
      totalSources: 0,
      hasEmbedSources: false,
      hasExternalSources: false,
      bestSource: null,
      working: false
    };
  }
};

/**
 * Generate streaming URLs for anime episodes using the new reliable sources
 * @param {string} imdbId - IMDB ID (e.g., "tt1234567")
 * @param {string} tmdbId - TMDB ID (e.g., "123456")
 * @param {number} season - Season number
 * @param {number} episode - Episode number
 * @param {string} anilistId - AniList ID (optional)
 * @param {object} animeTitle - Anime title object with english/original names
 * @returns {Promise<object>} - Comprehensive anime episode streaming data
 */
export const getAnimeEpisodeStreamingUrls = async (imdbId, tmdbId, season, episode, anilistId = null, animeTitle = null) => {
  try {
    const title = animeTitle?.english || animeTitle?.original || animeTitle;

    if (!title) {
      throw new Error('Anime title is required for episode streaming URL generation');
    }

    if (!episode) {
      throw new Error('Episode number is required for episode streaming');
    }

    const sources = generateAllAnimeStreamingUrls(title, episode, anilistId);
    const bestSource = getBestAnimeStreamingSource(sources);
    const embedSources = Object.values(sources).filter(s => s.type === 'embed');

    // Generate streaming URLs in the format expected by AnimeStreamingPlayer
    const cleanTitle = encodeAnimeTitle(title);
    const streamingUrls = {
      primary: bestSource?.url || null,
      // VidSrc anime specific URLs
      vidsrc_anime: anilistId ? `https://vidsrc.xyz/embed/anime/${anilistId}/${episode}` : null,
      // Alternative anime streaming sources
      animefire: `https://animefire.net/embed/${cleanTitle}/episode-${episode}`,
      kawaiifu: `https://kawaiifu.com/embed/${cleanTitle}/episode-${episode}`,
      // Working embed sources
      vidstreaming: sources.vidstreaming?.url || null,
      douvideo: sources.douvideo?.url || null,
      vidcloud: sources.vidcloud?.url || null,
      vidsrc: sources.vidsrc?.url || null,
      // Watch page links
      hianime_watch: `https://hianime.to/watch/${cleanTitle}/ep-${episode}`,
      gogoanime_watch: `https://gogoanime.lu/watch/${cleanTitle}/episode-${episode}`,
      nineanime_watch: `https://9anime.pl/watch/${cleanTitle}/ep-${episode}`,
      animepahe_watch: `https://animepahe.com/play/${cleanTitle}/episode-${episode}`,
      // Legacy format support
      sources: sources,
      embedSources: embedSources,
      externalSources: [],
      episode: episode,
      season: season,
      totalSources: Object.keys(sources).length,
      hasEmbedSources: embedSources.length > 0,
      hasExternalSources: false,
      bestSource: bestSource,
      working: Object.keys(sources).length > 0
    };

    return streamingUrls;
  } catch (error) {
    console.error('Error generating anime episode streaming URLs:', error);
    return {
      primary: null,
      vidsrc_anime: null,
      animefire: null,
      kawaiifu: null,
      vidstreaming: null,
      douvideo: null,
      vidcloud: null,
      vidsrc: null,
      hianime_watch: null,
      gogoanime_watch: null,
      nineanime_watch: null,
      animepahe_watch: null,
      sources: {},
      embedSources: [],
      externalSources: [],
      episode: episode,
      season: season,
      totalSources: 0,
      hasEmbedSources: false,
      hasExternalSources: false,
      bestSource: null,
      working: false
    };
  }
};

/**
 * Extract IMDB ID from external IDs
 * @param {object} externalIds - External IDs object from TMDB
 * @returns {string|null} - IMDB ID if found
 */
export const extractImdbId = (externalIds) => {
  if (!externalIds) return null;
  
  const imdbId = externalIds.imdb_id;
  if (imdbId && imdbId.startsWith('tt')) {
    return imdbId;
  }
  
  return null;
};

// getAniListId is imported from consumetApi.js and used directly
export { getAniListId };

/**
 * Format streaming data for consistent response structure
 * @param {object} item - Raw streaming data
 * @param {string} type - Content type ('movie', 'tv', 'anime')
 * @returns {object} - Formatted streaming data
 */
export const formatStreamingData = (item, type = 'anime') => {
  if (!item) return null;

  const baseData = {
    id: item.id,
    title: item.title || item.name,
    type: type,
    working: item.working || false
  };

  if (type === 'anime') {
    return {
      ...baseData,
      sources: item.sources || {},
      embedSources: item.embedSources || [],
      externalSources: item.externalSources || [],
      totalSources: item.totalSources || 0,
      hasEmbedSources: item.hasEmbedSources || false,
      hasExternalSources: item.hasExternalSources || false,
      bestSource: item.bestSource || null,
      primary: item.primary || null
    };
  }

  return baseData;
};

/**
 * Test if a streaming source is working
 * @param {string} url - URL to test
 * @returns {Promise<boolean>} - Whether the source is working
 */
export const testStreamingSource = async (url) => {
  try {
    const response = await fetch(url, { 
      method: 'HEAD', 
      mode: 'no-cors',
      timeout: 5000 
    });
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get health status of streaming sources
 * @returns {Promise<object>} - Health status of all sources
 */
export const getStreamingSourcesHealth = async () => {
  const sources = [
    { name: 'VidStreaming', url: 'https://vidstreaming.io' },
    { name: 'DouVideo', url: 'https://douvideo.com' },
    { name: 'VidCloud', url: 'https://rabbitstream.net' },
    { name: 'VidSrc', url: 'https://vidsrc.xyz' },
  ];

  const healthStatus = {};
  
  await Promise.all(sources.map(async (source) => {
    const isWorking = await testStreamingSource(source.url);
    healthStatus[source.name] = {
      working: isWorking,
      url: source.url,
      lastChecked: new Date().toISOString()
    };
  }));

  return healthStatus;
};

export default {
  getMovieStreamingUrls,
  getEpisodeStreamingUrls,
  getShowStreamingUrls,
  getAnimeStreamingUrls,
  getAnimeEpisodeStreamingUrls,
  extractImdbId,
  formatStreamingData,
  testStreamingSource,
  getStreamingSourcesHealth,
  getAniListId,
};