// Consumet API utility functions for anime streaming
// Documentation: https://docs.consumet.org/

const CONSUMET_BASE_URL = 'https://api.consumet.org';

/**
 * Available anime providers in Consumet API
 */
export const ANIME_PROVIDERS = {
  GOGOANIME: 'gogoanime',
  ZORO: 'zoro',
  CRUNCHYROLL: 'crunchyroll',
  NINEANIME: '9anime',
  ANIMEFOX: 'animefox',
  ANIMEPAHE: 'animepahe',
  ANILIST: 'anilist',
  BILIBILI: 'bilibili'
};

/**
 * Available streaming servers for different providers
 */
export const STREAMING_SERVERS = {
  [ANIME_PROVIDERS.GOGOANIME]: ['vidstreaming', 'gogo', 'streamsb', 'mixdrop'],
  [ANIME_PROVIDERS.ZORO]: ['vidcloud', 'vidstreaming', 'streamtape'],
  [ANIME_PROVIDERS.CRUNCHYROLL]: ['crunchyroll'],
  [ANIME_PROVIDERS.NINEANIME]: ['vidplay', 'mycloud', 'filemoon'],
  [ANIME_PROVIDERS.ANIMEFOX]: ['vidplay'],
  [ANIME_PROVIDERS.ANIMEPAHE]: ['kwik'],
  [ANIME_PROVIDERS.ANILIST]: ['default'],
  [ANIME_PROVIDERS.BILIBILI]: ['default']
};

/**
 * Working anime streaming sources (Updated January 2025)
 */
export const ANIME_STREAMING_SOURCES = {
  // Tier 1: Embed Sources (Actually embeddable)
  VIDSRC: {
    name: 'VidSrc',
    baseUrl: 'https://vidsrc.xyz/embed/anime',
    quality: 'high',
    description: 'Reliable anime streaming with good compatibility'
  },
  ANIMEFIRE: {
    name: 'AnimeFire',
    baseUrl: 'https://animefire.plus/video',
    quality: 'medium',
    description: 'Fast anime streaming source'
  },
  KAWAIIFU: {
    name: 'KawaiiDesu',
    baseUrl: 'https://kawaiifu.com/anime',
    quality: 'medium', 
    description: 'Clean interface anime streaming'
  },
  
  // Tier 2: Watch Page Sources (Open in new tab)
  HIANIME: {
    name: 'HiAnime',
    baseUrl: 'https://hianime.to',
    quality: 'premium',
    description: 'Premium anime streaming with highest quality'
  },
  GOGOANIME: {
    name: 'GogoAnime',
    baseUrl: 'https://gogoanime.tw',
    quality: 'high',
    description: 'Popular anime streaming with good availability'
  },
  NINEANIME: {
    name: '9anime',
    baseUrl: 'https://9anime.com.ro',
    quality: 'high',
    description: 'Well-known anime streaming platform'
  },
  ANIMEPAHE: {
    name: 'AnimePahe',
    baseUrl: 'https://animepahe.ru/anime',
    quality: 'high',
    description: 'High-quality compressed anime streaming'
  }
};

/**
 * Search for anime across multiple providers
 * @param {string} query - Anime title to search for
 * @param {string[]} providers - Array of providers to search (default: all major ones)
 * @returns {Promise<object>} - Search results grouped by provider
 */
export const searchAnimeMultiProvider = async (query, providers = [ANIME_PROVIDERS.GOGOANIME, ANIME_PROVIDERS.ZORO]) => {
  const results = {};
  
  try {
    const searchPromises = providers.map(async (provider) => {
      try {
        const response = await fetch(`${CONSUMET_BASE_URL}/anime/${provider}/${encodeURIComponent(query)}`);
        const data = await response.json();
        return { provider, results: data.results || [] };
      } catch (error) {
        console.error(`Error searching ${provider}:`, error);
        return { provider, results: [] };
      }
    });

    const searchResults = await Promise.all(searchPromises);
    
    searchResults.forEach(({ provider, results: providerResults }) => {
      results[provider] = providerResults;
    });

    return results;
  } catch (error) {
    console.error('Error in multi-provider search:', error);
    return {};
  }
};

/**
 * Get anime details with episodes from a specific provider
 * @param {string} animeId - Anime ID from search results
 * @param {string} provider - Provider name
 * @returns {Promise<object>} - Anime details with episodes
 */
export const getAnimeInfo = async (animeId, provider) => {
  try {
    const response = await fetch(`${CONSUMET_BASE_URL}/anime/${provider}/info/${animeId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching anime info from ${provider}:`, error);
    return null;
  }
};

/**
 * Get streaming sources for a specific episode
 * @param {string} episodeId - Episode ID from anime info
 * @param {string} provider - Provider name
 * @param {string} server - Streaming server (optional)
 * @returns {Promise<object>} - Streaming sources and metadata
 */
export const getEpisodeStreaming = async (episodeId, provider, server = null) => {
  try {
    const defaultServer = server || STREAMING_SERVERS[provider]?.[0];
    const url = `${CONSUMET_BASE_URL}/anime/${provider}/watch/${episodeId}${defaultServer ? `?server=${defaultServer}` : ''}`;
    
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching episode streaming from ${provider}:`, error);
    return null;
  }
};

/**
 * Get the best quality source from streaming sources
 * @param {array} sources - Array of streaming sources
 * @returns {object} - Best quality source
 */
export const getBestQualitySource = (sources) => {
  if (!sources || sources.length === 0) return null;
  
  // Quality priority order
  const qualityPriority = ['1080p', '720p', '480p', '360p', 'default'];
  
  for (const quality of qualityPriority) {
    const source = sources.find(s => s.quality === quality);
    if (source) return source;
  }
  
  // Return first available source if no specific quality found
  return sources[0];
};

/**
 * Find the best matching anime from search results
 * @param {string} searchQuery - Original search query
 * @param {array} searchResults - Array of search results
 * @returns {object} - Best matching anime result
 */
export const findBestMatch = (searchQuery, searchResults) => {
  if (!searchResults || searchResults.length === 0) return null;
  
  const query = searchQuery.toLowerCase();
  
  // First, try exact title match
  let bestMatch = searchResults.find(anime => 
    anime.title?.toLowerCase() === query ||
    anime.title?.english?.toLowerCase() === query ||
    anime.title?.romaji?.toLowerCase() === query
  );
  
  if (bestMatch) return bestMatch;
  
  // Then try partial match with highest score
  const scoredResults = searchResults.map(anime => {
    const titles = [
      anime.title,
      anime.title?.english,
      anime.title?.romaji,
      anime.title?.native
    ].filter(Boolean);
    
    let score = 0;
    titles.forEach(title => {
      if (title && title.toLowerCase().includes(query)) {
        score += 1;
      }
      if (title && query.includes(title.toLowerCase())) {
        score += 0.5;
      }
    });
    
    return { anime, score };
  });
  
  // Sort by score and return the best match
  scoredResults.sort((a, b) => b.score - a.score);
  return scoredResults[0]?.score > 0 ? scoredResults[0].anime : searchResults[0];
};

/**
 * Get comprehensive streaming data for an anime episode
 * @param {string} animeTitle - Anime title for searching
 * @param {number} episodeNumber - Episode number (1-based)
 * @param {string[]} preferredProviders - Preferred providers in order
 * @returns {Promise<object>} - Comprehensive streaming data
 */
export const getAnimeEpisodeStreamingData = async (
  animeTitle, 
  episodeNumber, 
  preferredProviders = [ANIME_PROVIDERS.GOGOANIME, ANIME_PROVIDERS.ZORO]
) => {
  try {
    // Search across providers
    const searchResults = await searchAnimeMultiProvider(animeTitle, preferredProviders);
    
    const streamingData = {
      providers: {},
      bestSource: null,
      allSources: [],
      subtitles: [],
      episodeInfo: null
    };

    // Try each provider in order of preference
    for (const provider of preferredProviders) {
      if (!searchResults[provider] || searchResults[provider].length === 0) continue;
      
      try {
        // Find best matching anime
        const bestMatch = findBestMatch(animeTitle, searchResults[provider]);
        if (!bestMatch) continue;
        
        // Get anime info with episodes
        const animeInfo = await getAnimeInfo(bestMatch.id, provider);
        if (!animeInfo || !animeInfo.episodes) continue;
        
        // Find the specific episode
        const episode = animeInfo.episodes.find(ep => ep.number === episodeNumber);
        if (!episode) continue;
        
        // Get streaming sources for the episode
        const streamingSources = await getEpisodeStreaming(episode.id, provider);
        if (!streamingSources || !streamingSources.sources) continue;
        
        // Store provider data
        streamingData.providers[provider] = {
          animeInfo: bestMatch,
          episode: episode,
          sources: streamingSources.sources,
          subtitles: streamingSources.subtitles || [],
          intro: streamingSources.intro,
          outro: streamingSources.outro
        };
        
        // Add to all sources
        streamingData.allSources.push(...streamingSources.sources.map(source => ({
          ...source,
          provider,
          episodeId: episode.id
        })));
        
        // Add subtitles
        if (streamingSources.subtitles) {
          streamingData.subtitles.push(...streamingSources.subtitles.map(sub => ({
            ...sub,
            provider
          })));
        }
        
        // Set episode info from first successful provider
        if (!streamingData.episodeInfo) {
          streamingData.episodeInfo = episode;
        }
        
        // Set best source if not already set
        if (!streamingData.bestSource) {
          const bestQualitySource = getBestQualitySource(streamingSources.sources);
          if (bestQualitySource) {
            streamingData.bestSource = {
              ...bestQualitySource,
              provider,
              episodeId: episode.id
            };
          }
        }
        
      } catch (providerError) {
        console.error(`Error processing provider ${provider}:`, providerError);
        continue;
      }
    }
    
    return streamingData;
    
  } catch (error) {
    console.error('Error getting anime episode streaming data:', error);
    return {
      providers: {},
      bestSource: null,
      allSources: [],
      subtitles: [],
      episodeInfo: null
    };
  }
};

/**
 * Get recent/popular anime from a provider
 * @param {string} provider - Provider name
 * @param {number} page - Page number (default: 1)
 * @returns {Promise<array>} - Array of recent anime
 */
export const getRecentAnime = async (provider = ANIME_PROVIDERS.GOGOANIME, page = 1) => {
  try {
    const response = await fetch(`${CONSUMET_BASE_URL}/anime/${provider}/recent-episodes?page=${page}`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`Error fetching recent anime from ${provider}:`, error);
    return [];
  }
};

/**
 * Get popular anime from a provider
 * @param {string} provider - Provider name
 * @param {number} page - Page number (default: 1)
 * @returns {Promise<array>} - Array of popular anime
 */
export const getPopularAnime = async (provider = ANIME_PROVIDERS.GOGOANIME, page = 1) => {
  try {
    const response = await fetch(`${CONSUMET_BASE_URL}/anime/${provider}/top-airing?page=${page}`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`Error fetching popular anime from ${provider}:`, error);
    return [];
  }
};

/**
 * Helper function to encode anime title for URL usage
 * @param {string} title - Anime title
 * @returns {string} - URL-encoded title
 */
export const encodeAnimeTitle = (title) => {
  return encodeURIComponent(
    title
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .toLowerCase()
      .trim()
  );
};

/**
 * Get anime streaming URL from various working sources
 * @param {string} title - Anime title
 * @param {number} episode - Episode number (optional)
 * @param {string} anilistId - AniList ID (optional)
 * @returns {object} - Various streaming URLs (both embeds and watch pages)
 */
export const getAnimeStreamingFromSources = (title, episode = null, anilistId = null) => {
  const encodedTitle = encodeAnimeTitle(title);
  
  const sources = {
    // Embed sources (can be embedded in iframe)
    vidsrc_anime: null,
    animefire: null,
    kawaiifu: null,
    
    // Watch page sources (open in new tab)
    hianime_watch: null,
    gogoanime_watch: null,
    nineanime_watch: null,
    animepahe_watch: null
  };

  // VidSrc URLs (Embed) - requires AniList ID
  if (anilistId) {
    sources.vidsrc_anime = episode 
      ? `https://vidsrc.xyz/embed/anime/${anilistId}/${episode}`
      : `https://vidsrc.xyz/embed/anime/${anilistId}`;
  }

  // AnimeFire URLs (Embed) - works with title
  if (title) {
    sources.animefire = episode
      ? `https://animefire.plus/video/${encodedTitle}/episode-${episode}`
      : `https://animefire.plus/video/${encodedTitle}`;
  }

  // KawaiiDesu URLs (Embed) - works with title
  if (title) {
    sources.kawaiifu = episode
      ? `https://kawaiifu.com/anime/${encodedTitle}/episode-${episode}`
      : `https://kawaiifu.com/anime/${encodedTitle}`;
  }

  // HiAnime Watch Page URLs
  if (title) {
    sources.hianime_watch = episode
      ? `https://hianime.to/watch/${encodedTitle}-episode-${episode}`
      : `https://hianime.to/${encodedTitle}`;
  }

  // GogoAnime Watch Page URLs
  if (title) {
    sources.gogoanime_watch = episode
      ? `https://gogoanime.tw/${encodedTitle}-episode-${episode}-english-subbed`
      : `https://gogoanime.tw/${encodedTitle}`;
  }

  // 9anime Watch Page URLs
  if (title) {
    sources.nineanime_watch = episode
      ? `https://9anime.com.ro/${encodedTitle}-episode-${episode}`
      : `https://9anime.com.ro/${encodedTitle}`;
  }

  // AnimePahe Watch Page URLs
  if (title) {
    sources.animepahe_watch = episode
      ? `https://animepahe.ru/play/${encodedTitle}/${episode}`
      : `https://animepahe.ru/anime/${encodedTitle}`;
  }

  return sources;
};
