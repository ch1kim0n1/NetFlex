// Advanced Recommendations Engine for NetFlex
// Analyzes viewing history to provide intelligent content suggestions

import { getViewingHistory } from './viewingHistory.js';

const RECOMMENDATION_CACHE_KEY = 'netflex_recommendations_cache';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

// Recommendation algorithms
const ALGORITHMS = {
  GENRE_BASED: 'genre_based',
  RATING_BASED: 'rating_based',
  COLLABORATIVE: 'collaborative',
  CONTENT_BASED: 'content_based',
  TRENDING: 'trending'
};

/**
 * Get cached recommendations if available and not expired
 */
const getCachedRecommendations = () => {
  try {
    const cached = localStorage.getItem(RECOMMENDATION_CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
  } catch (error) {
    console.error('Error reading recommendation cache:', error);
  }
  return null;
};

/**
 * Cache recommendations
 */
const cacheRecommendations = (recommendations) => {
  try {
    const cacheData = {
      data: recommendations,
      timestamp: Date.now()
    };
    localStorage.setItem(RECOMMENDATION_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching recommendations:', error);
  }
};

/**
 * Analyze user's viewing patterns
 */
export const analyzeViewingPatterns = () => {
  const history = getViewingHistory();
  const allContent = [...(history.movies || []), ...(history.shows || [])];
  
  if (allContent.length === 0) {
    return {
      favoriteGenres: [],
      averageRating: 0,
      preferredContentTypes: [],
      viewingFrequency: 'low',
      completionRate: 0,
      recentActivity: false
    };
  }

  // Genre analysis
  const genreCount = {};
  allContent.forEach(item => {
    if (item.genres) {
      item.genres.forEach(genre => {
        const genreName = typeof genre === 'object' ? genre.name : genre;
        genreCount[genreName] = (genreCount[genreName] || 0) + 1;
      });
    }
  });

  const favoriteGenres = Object.entries(genreCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([genre]) => genre);

  // Rating analysis
  const ratingsWithValues = allContent.filter(item => item.rating && item.rating > 0);
  const averageRating = ratingsWithValues.length > 0 
    ? ratingsWithValues.reduce((sum, item) => sum + item.rating, 0) / ratingsWithValues.length 
    : 0;

  // Content type preferences
  const contentTypes = allContent.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  const preferredContentTypes = Object.entries(contentTypes)
    .sort(([,a], [,b]) => b - a)
    .map(([type]) => type);

  // Viewing frequency analysis
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentContent = allContent.filter(item => new Date(item.watchedAt) > oneWeekAgo);
  
  let viewingFrequency = 'low';
  if (recentContent.length >= 10) viewingFrequency = 'high';
  else if (recentContent.length >= 4) viewingFrequency = 'medium';

  // Completion rate
  const completedContent = allContent.filter(item => 
    item.type === 'movie' ? item.isCompleted : item.isEpisodeCompleted
  );
  const completionRate = allContent.length > 0 ? (completedContent.length / allContent.length) * 100 : 0;

  // Recent activity
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const recentActivity = allContent.some(item => new Date(item.watchedAt) > threeDaysAgo);

  return {
    favoriteGenres,
    averageRating: Math.round(averageRating * 10) / 10,
    preferredContentTypes,
    viewingFrequency,
    completionRate: Math.round(completionRate),
    recentActivity,
    totalWatched: allContent.length,
    genreDistribution: genreCount
  };
};

/**
 * Generate genre-based recommendations
 */
export const getGenreBasedRecommendations = async (favoriteGenres, contentType = 'all', limit = 20) => {
  if (favoriteGenres.length === 0) return [];

  try {
    // This would integrate with your existing API handlers
    const recommendations = [];
    
    // For now, we'll return a structure that can be filled by your API calls
    return {
      algorithm: ALGORITHMS.GENRE_BASED,
      genres: favoriteGenres,
      contentType,
      limit,
      needsApiCall: true
    };
  } catch (error) {
    console.error('Error generating genre-based recommendations:', error);
    return [];
  }
};

/**
 * Generate "Because you watched X" recommendations
 */
export const getBecauseYouWatchedRecommendations = async (baseContent, limit = 10) => {
  if (!baseContent) return [];

  const recommendations = {
    baseContent,
    recommendations: [],
    algorithm: ALGORITHMS.CONTENT_BASED,
    needsApiCall: true
  };

  // Extract genres and other metadata from base content
  if (baseContent.genres) {
    recommendations.genres = baseContent.genres;
  }

  return recommendations;
};

/**
 * Get smart content recommendations based on viewing history
 */
export const getSmartRecommendations = async (options = {}) => {
  const {
    limit = 50,
    includeGenreBased = true,
    includeContentBased = true,
    includeTrending = true,
    contentType = 'all'
  } = options;

  // Check cache first
  const cached = getCachedRecommendations();
  if (cached) {
    return cached;
  }

  const patterns = analyzeViewingPatterns();
  const recommendations = {
    patterns,
    sections: []
  };

  try {
    // Genre-based recommendations
    if (includeGenreBased && patterns.favoriteGenres.length > 0) {
      const genreRecs = await getGenreBasedRecommendations(
        patterns.favoriteGenres.slice(0, 3), 
        contentType, 
        Math.ceil(limit * 0.4)
      );
      
      recommendations.sections.push({
        title: `More ${patterns.favoriteGenres[0]} Content`,
        type: 'genre_based',
        data: genreRecs,
        priority: 1
      });
    }

    // "Because you watched" sections
    if (includeContentBased) {
      const history = getViewingHistory();
      const recentContent = [...(history.movies || []), ...(history.shows || [])]
        .sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt))
        .slice(0, 3);

      for (const content of recentContent) {
        const becauseYouWatched = await getBecauseYouWatchedRecommendations(content, 10);
        if (becauseYouWatched) {
          recommendations.sections.push({
            title: `Because you watched "${content.title?.english || content.title?.original || content.title}"`,
            type: 'because_you_watched',
            baseContent: content,
            data: becauseYouWatched,
            priority: 2
          });
        }
      }
    }

    // High-rated content similar to user preferences
    if (patterns.averageRating > 7) {
      recommendations.sections.push({
        title: 'Highly Rated Picks For You',
        type: 'high_rated',
        data: {
          algorithm: ALGORITHMS.RATING_BASED,
          minRating: Math.max(7, patterns.averageRating - 1),
          genres: patterns.favoriteGenres,
          needsApiCall: true
        },
        priority: 3
      });
    }

    // Trending content filtered by preferences
    if (includeTrending) {
      recommendations.sections.push({
        title: 'Trending Now',
        type: 'trending_filtered',
        data: {
          algorithm: ALGORITHMS.TRENDING,
          genres: patterns.favoriteGenres,
          contentType,
          needsApiCall: true
        },
        priority: 4
      });
    }

    // Cache the results
    cacheRecommendations(recommendations);
    return recommendations;

  } catch (error) {
    console.error('Error generating smart recommendations:', error);
    return { patterns, sections: [] };
  }
};

/**
 * Get recommendations for content discovery
 */
export const getDiscoveryRecommendations = async (contentType = 'all') => {
  const patterns = analyzeViewingPatterns();
  
  // If user has no viewing history, return trending content
  if (patterns.totalWatched === 0) {
    return {
      sections: [{
        title: 'Popular Right Now',
        type: 'trending',
        data: {
          algorithm: ALGORITHMS.TRENDING,
          contentType,
          needsApiCall: true
        },
        priority: 1
      }]
    };
  }

  return getSmartRecommendations({ contentType });
};

/**
 * Get personalized content for homepage
 */
export const getPersonalizedHomepage = async () => {
  const patterns = analyzeViewingPatterns();
  const recommendations = await getSmartRecommendations();
  
  const homepage = {
    patterns,
    hero: null,
    sections: []
  };

  // Select hero content (most recently watched unfinished content)
  const history = getViewingHistory();
  const unfinishedContent = [...(history.movies || []), ...(history.shows || [])]
    .filter(item => !item.isCompleted && item.progressPercentage > 5)
    .sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt));

  if (unfinishedContent.length > 0) {
    homepage.hero = unfinishedContent[0];
  }

  // Add recommendation sections
  homepage.sections = recommendations.sections;

  return homepage;
};

/**
 * Update recommendations when viewing history changes
 */
export const invalidateRecommendationCache = () => {
  try {
    localStorage.removeItem(RECOMMENDATION_CACHE_KEY);
  } catch (error) {
    console.error('Error invalidating recommendation cache:', error);
  }
};

/**
 * Get similar content based on a specific item
 */
export const getSimilarContent = async (item, limit = 20) => {
  const similarContent = {
    baseItem: item,
    recommendations: [],
    criteria: {
      genres: item.genres || [],
      rating: item.rating || 0,
      type: item.type || 'movie'
    },
    needsApiCall: true
  };

  return similarContent;
};

export default {
  analyzeViewingPatterns,
  getGenreBasedRecommendations,
  getBecauseYouWatchedRecommendations,
  getSmartRecommendations,
  getDiscoveryRecommendations,
  getPersonalizedHomepage,
  invalidateRecommendationCache,
  getSimilarContent
}; 