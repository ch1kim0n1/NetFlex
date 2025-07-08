// Advanced Recommendations Engine for NetFlex
// Analyzes viewing history to provide intelligent content suggestions

import { getViewingHistory } from './viewingHistory.js';
import { 
  getUserFeedback, 
  getContentSimilarityScore, 
  shouldFilterContent, 
  getUserPreferences 
} from './userFeedback.js';

const RECOMMENDATION_CACHE_KEY = 'netflex_recommendations_cache';
const CACHE_DURATION = 1000 * 60 * 15; // 15 minutes for more dynamic updates

// Enhanced recommendation algorithms
const ALGORITHMS = {
  GENRE_BASED: 'genre_based',
  RATING_BASED: 'rating_based',
  COLLABORATIVE: 'collaborative',
  CONTENT_BASED: 'content_based',
  TRENDING: 'trending',
  HYBRID_ML: 'hybrid_ml',
  CONTEXTUAL: 'contextual',
  FEEDBACK_LEARNING: 'feedback_learning'
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
 * Advanced content scoring using multiple factors
 */
const calculateAdvancedContentScore = (content, patterns, userFeedback) => {
  let score = 0;
  let maxScore = 0;

  // 1. User feedback similarity (highest weight)
  const feedbackScore = getContentSimilarityScore(content, userFeedback);
  score += feedbackScore * 0.35;
  maxScore += 0.35;

  // 2. Genre matching with viewing history
  const genreScore = calculateGenreScore(content, patterns);
  score += genreScore * 0.25;
  maxScore += 0.25;

  // 3. Rating preference alignment
  const ratingScore = calculateRatingScore(content, patterns);
  score += ratingScore * 0.15;
  maxScore += 0.15;

  // 4. Recency and trending factors
  const recencyScore = calculateRecencyScore(content);
  score += recencyScore * 0.10;
  maxScore += 0.10;

  // 5. Content quality indicators
  const qualityScore = calculateQualityScore(content);
  score += qualityScore * 0.15;
  maxScore += 0.15;

  // Normalize to 0-1 range
  return maxScore > 0 ? Math.max(0, Math.min(1, score / maxScore)) : 0;
};

/**
 * Calculate genre matching score
 */
const calculateGenreScore = (content, patterns) => {
  if (!content.genres || !patterns.favoriteGenres.length) return 0;

  const contentGenres = content.genres.map(g => typeof g === 'object' ? g.name : g);
  const favoriteGenresMap = new Map(
    patterns.favoriteGenres.map((genre, index) => [genre, 1 - (index * 0.1)])
  );

  let score = 0;
  let totalWeight = 0;

  contentGenres.forEach(genre => {
    if (favoriteGenresMap.has(genre)) {
      const weight = favoriteGenresMap.get(genre);
      score += weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? score / favoriteGenresMap.size : 0;
};

/**
 * Calculate rating preference score
 */
const calculateRatingScore = (content, patterns) => {
  if (!content.rating || patterns.averageRating === 0) return 0.5;

  const ratingDiff = Math.abs(content.rating - patterns.averageRating);
  return Math.max(0, (10 - ratingDiff) / 10);
};

/**
 * Calculate recency and trending score
 */
const calculateRecencyScore = (content) => {
  if (!content.releaseDate) return 0.5;

  const releaseYear = new Date(content.releaseDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const yearDiff = currentYear - releaseYear;

  // Prefer content from last 5 years, with gradual decline
  if (yearDiff <= 1) return 1.0;
  if (yearDiff <= 3) return 0.9;
  if (yearDiff <= 5) return 0.8;
  if (yearDiff <= 10) return 0.6;
  if (yearDiff <= 20) return 0.4;
  return 0.2;
};

/**
 * Calculate content quality score
 */
const calculateQualityScore = (content) => {
  let score = 0;
  let factors = 0;

  // Rating factor
  if (content.rating && content.rating > 0) {
    score += content.rating / 10;
    factors++;
  }

  // Vote count factor (higher vote count = more reliable)
  if (content.vote_count) {
    const voteScore = Math.min(1, content.vote_count / 1000);
    score += voteScore * 0.5;
    factors++;
  }

  // Popularity factor
  if (content.popularity) {
    const popularityScore = Math.min(1, content.popularity / 100);
    score += popularityScore * 0.3;
    factors++;
  }

  return factors > 0 ? score / factors : 0.5;
};
/**
 * Enhanced analysis of user's viewing patterns with feedback integration
 */
export const analyzeViewingPatterns = () => {
  const history = getViewingHistory();
  const userFeedback = getUserFeedback();
  const userPreferences = getUserPreferences();
  const allContent = [...(history.movies || []), ...(history.shows || [])];
  
  if (allContent.length === 0 && userPreferences.totalFeedback === 0) {
    return {
      favoriteGenres: [],
      averageRating: 0,
      preferredContentTypes: [],
      viewingFrequency: 'low',
      completionRate: 0,
      recentActivity: false,
      confidence: 0,
      userFeedback: userPreferences,
      contextualFactors: {
        timePreference: 'any',
        seasonality: 'any',
        mood: 'neutral'
      }
    };
  }

  // Enhanced genre analysis with feedback weighting
  const genreCount = {};
  const genreRatings = {};
  
  // Process viewing history
  allContent.forEach(item => {
    if (item.genres) {
      item.genres.forEach(genre => {
        const genreName = typeof genre === 'object' ? genre.name : genre;
        genreCount[genreName] = (genreCount[genreName] || 0) + 1;
        
        if (item.rating) {
          if (!genreRatings[genreName]) genreRatings[genreName] = [];
          genreRatings[genreName].push(item.rating);
        }
      });
    }
  });

  // Integrate user feedback into genre preferences
  userPreferences.favoriteGenres.forEach((weight, genre) => {
    genreCount[genre] = (genreCount[genre] || 0) + (weight * 2); // Amplify feedback
  });

  userPreferences.dislikedGenres.forEach((weight, genre) => {
    genreCount[genre] = Math.max(0, (genreCount[genre] || 0) - weight);
  });

  const favoriteGenres = Object.entries(genreCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8) // Increased from 5 to capture more nuance
    .map(([genre]) => genre);

  // Enhanced rating analysis
  const ratingsWithValues = allContent.filter(item => item.rating && item.rating > 0);
  let averageRating = 0;
  
  if (ratingsWithValues.length > 0) {
    // Weight recent ratings more heavily
    const weightedRatings = ratingsWithValues.map(item => {
      const age = Date.now() - new Date(item.watchedAt).getTime();
      const daysDiff = age / (1000 * 60 * 60 * 24);
      const weight = Math.max(0.3, 1 - (daysDiff / 365)); // Decay over a year
      return item.rating * weight;
    });
    
    const totalWeight = ratingsWithValues.reduce((sum, item) => {
      const age = Date.now() - new Date(item.watchedAt).getTime();
      const daysDiff = age / (1000 * 60 * 60 * 24);
      return sum + Math.max(0.3, 1 - (daysDiff / 365));
    }, 0);
    
    averageRating = weightedRatings.reduce((sum, rating) => sum + rating, 0) / totalWeight;
  }

  // Content type preferences with recency weighting
  const contentTypes = allContent.reduce((acc, item) => {
    const age = Date.now() - new Date(item.watchedAt).getTime();
    const daysDiff = age / (1000 * 60 * 60 * 24);
    const weight = Math.max(0.5, 1 - (daysDiff / 180)); // 6-month decay
    
    acc[item.type] = (acc[item.type] || 0) + weight;
    return acc;
  }, {});

  const preferredContentTypes = Object.entries(contentTypes)
    .sort(([,a], [,b]) => b - a)
    .map(([type]) => type);

  // Advanced viewing frequency analysis
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentWeekContent = allContent.filter(item => new Date(item.watchedAt) > oneWeekAgo);
  const recentMonthContent = allContent.filter(item => new Date(item.watchedAt) > oneMonthAgo);
  
  let viewingFrequency = 'low';
  if (recentWeekContent.length >= 7) viewingFrequency = 'very_high';
  else if (recentWeekContent.length >= 4) viewingFrequency = 'high';
  else if (recentWeekContent.length >= 2) viewingFrequency = 'medium';
  else if (recentMonthContent.length >= 4) viewingFrequency = 'low_regular';

  // Enhanced completion rate with content type consideration
  const completedContent = allContent.filter(item => 
    item.type === 'movie' ? item.isCompleted : item.isEpisodeCompleted
  );
  const completionRate = allContent.length > 0 ? (completedContent.length / allContent.length) * 100 : 0;

  // Recent activity with more granular tracking
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const recentActivity = allContent.some(item => new Date(item.watchedAt) > threeDaysAgo);

  // Calculate confidence score based on data richness
  const dataPoints = allContent.length + userPreferences.totalFeedback;
  const confidence = Math.min(1, dataPoints / 50); // Full confidence at 50+ data points

  // Contextual factors analysis
  const contextualFactors = analyzeContextualFactors(allContent);

  return {
    favoriteGenres,
    averageRating: Math.round(averageRating * 10) / 10,
    preferredContentTypes,
    viewingFrequency,
    completionRate: Math.round(completionRate),
    recentActivity,
    totalWatched: allContent.length,
    genreDistribution: genreCount,
    genreRatings,
    confidence,
    userFeedback: userPreferences,
    contextualFactors,
    ratingDistribution: calculateRatingDistribution(ratingsWithValues),
    viewingVelocity: calculateViewingVelocity(allContent)
  };
};

/**
 * Analyze contextual viewing factors
 */
const analyzeContextualFactors = (allContent) => {
  const factors = {
    timePreference: 'any',
    seasonality: 'any',
    mood: 'neutral',
    bingeBehavior: 'moderate'
  };

  if (allContent.length === 0) return factors;

  // Analyze viewing times (would need timestamp data)
  const recentBinges = allContent.filter(item => {
    const watchDate = new Date(item.watchedAt);
    const now = new Date();
    const timeDiff = now - watchDate;
    return timeDiff < (7 * 24 * 60 * 60 * 1000); // Last week
  });

  if (recentBinges.length >= 5) {
    factors.bingeBehavior = 'high';
  } else if (recentBinges.length >= 3) {
    factors.bingeBehavior = 'moderate';
  } else {
    factors.bingeBehavior = 'low';
  }

  return factors;
};

/**
 * Calculate rating distribution
 */
const calculateRatingDistribution = (ratingsWithValues) => {
  const distribution = { low: 0, medium: 0, high: 0 };
  
  ratingsWithValues.forEach(item => {
    if (item.rating < 6) distribution.low++;
    else if (item.rating < 8) distribution.medium++;
    else distribution.high++;
  });

  return distribution;
};

/**
 * Calculate viewing velocity trends
 */
const calculateViewingVelocity = (allContent) => {
  if (allContent.length < 2) return 'stable';

  const sortedContent = allContent
    .sort((a, b) => new Date(a.watchedAt) - new Date(b.watchedAt));

  const recentHalf = sortedContent.slice(-Math.ceil(sortedContent.length / 2));
  const olderHalf = sortedContent.slice(0, Math.floor(sortedContent.length / 2));

  if (recentHalf.length === 0 || olderHalf.length === 0) return 'stable';

  const recentRate = recentHalf.length / 30; // Items per month
  const olderRate = olderHalf.length / 30;

  if (recentRate > olderRate * 1.5) return 'increasing';
  if (recentRate < olderRate * 0.5) return 'decreasing';
  return 'stable';
};

/**
 * Enhanced genre-based recommendations with advanced scoring
 */
export const getGenreBasedRecommendations = async (favoriteGenres, contentType = 'all', limit = 20, userFeedback = null) => {
  if (favoriteGenres.length === 0) return [];

  try {
    const recommendations = {
      algorithm: ALGORITHMS.HYBRID_ML,
      genres: favoriteGenres,
      contentType,
      limit,
      scoringFactors: {
        genreMatch: 0.4,
        userFeedback: 0.3,
        contentQuality: 0.2,
        recency: 0.1
      },
      needsApiCall: true,
      filterCriteria: {
        excludeDisliked: true,
        minScore: 0.3,
        diversityFactor: 0.7
      }
    };

    return recommendations;
  } catch (error) {
    console.error('Error generating enhanced genre-based recommendations:', error);
    return [];
  }
};

/**
 * Advanced "Because you watched X" recommendations with context analysis
 */
export const getBecauseYouWatchedRecommendations = async (baseContent, limit = 10, userFeedback = null) => {
  if (!baseContent) return [];

  const recommendations = {
    baseContent,
    recommendations: [],
    algorithm: ALGORITHMS.CONTENT_BASED,
    needsApiCall: true,
    contextAnalysis: {
      primaryGenres: baseContent.genres || [],
      secondaryFactors: {
        director: baseContent.director || null,
        cast: baseContent.cast || [],
        keywords: baseContent.keywords || [],
        releaseYear: baseContent.releaseDate ? new Date(baseContent.releaseDate).getFullYear() : null,
        rating: baseContent.rating || 0,
        runtime: baseContent.runtime || 0
      },
      similarityThreshold: 0.6,
      diversityBalance: 0.3
    }
  };

  // Enhanced similarity criteria
  if (baseContent.genres) {
    recommendations.genres = baseContent.genres;
  }

  return recommendations;
};

/**
 * Hybrid ML-powered recommendations with multiple algorithms
 */
export const getHybridMLRecommendations = async (patterns, options = {}) => {
  const {
    limit = 30,
    contentType = 'all',
    diversityScore = 0.7,
    explorationRate = 0.2
  } = options;

  const userFeedback = getUserFeedback();
  const recommendations = {
    algorithm: ALGORITHMS.HYBRID_ML,
    components: [
      { type: 'collaborative', weight: 0.3 },
      { type: 'content_based', weight: 0.25 },
      { type: 'genre_based', weight: 0.2 },
      { type: 'feedback_learning', weight: 0.15 },
      { type: 'trending_contextual', weight: 0.1 }
    ],
    scoringMatrix: {
      userSimilarity: 0.3,
      contentSimilarity: 0.25,
      genrePreference: 0.2,
      feedbackAlignment: 0.15,
      qualityScore: 0.1
    },
    filters: {
      excludeDisliked: true,
      minQualityScore: 0.4,
      diversityEnforcement: diversityScore,
      explorationBonus: explorationRate
    },
    limit,
    contentType,
    needsApiCall: true
  };

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
    includeHybridML = true,
    contentType = 'all',
    explorationRate = 0.15,
    diversityScore = 0.8
  } = options;

  // Check cache first
  const cached = getCachedRecommendations();
  if (cached && cached.timestamp && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    return cached.data;
  }

  const patterns = analyzeViewingPatterns();
  const userFeedback = getUserFeedback();
  const recommendations = {
    patterns,
    sections: [],
    confidence: patterns.confidence,
    diversityMetrics: {
      genreDiversity: 0,
      yearDiversity: 0,
      ratingDiversity: 0
    }
  };

  try {
    // Hybrid ML recommendations (highest priority for experienced users)
    if (includeHybridML && patterns.confidence > 0.3) {
      const hybridRecs = await getHybridMLRecommendations(patterns, {
        limit: Math.ceil(limit * 0.4),
        contentType,
        diversityScore,
        explorationRate
      });
      
      recommendations.sections.push({
        title: 'Recommended For You',
        type: 'hybrid_ml',
        data: hybridRecs,
        priority: 1,
        confidence: patterns.confidence
      });
    }

    // Enhanced genre-based recommendations
    if (includeGenreBased && patterns.favoriteGenres.length > 0) {
      const genreRecs = await getGenreBasedRecommendations(
        patterns.favoriteGenres.slice(0, 3), 
        contentType, 
        Math.ceil(limit * 0.3),
        userFeedback
      );
      
      recommendations.sections.push({
        title: `More ${patterns.favoriteGenres[0]} ${contentType !== 'all' ? contentType : 'Content'}`,
        type: 'genre_based_enhanced',
        data: genreRecs,
        priority: 2
      });

      // Secondary genre recommendations for diversity
      if (patterns.favoriteGenres.length > 1) {
        const secondaryGenreRecs = await getGenreBasedRecommendations(
          [patterns.favoriteGenres[1]], 
          contentType, 
          Math.ceil(limit * 0.2),
          userFeedback
        );
        
        recommendations.sections.push({
          title: `${patterns.favoriteGenres[1]} Picks`,
          type: 'secondary_genre',
          data: secondaryGenreRecs,
          priority: 4
        });
      }
    }

    // Advanced "Because you watched" sections with context
    if (includeContentBased) {
      const history = getViewingHistory();
      const recentContent = [...(history.movies || []), ...(history.shows || [])]
        .filter(item => !shouldFilterContent(item, userFeedback)) // Exclude disliked content
        .sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt))
        .slice(0, 4); // Increased from 3

      for (const content of recentContent) {
        const becauseYouWatched = await getBecauseYouWatchedRecommendations(content, 12, userFeedback);
        if (becauseYouWatched) {
          recommendations.sections.push({
            title: `Because you watched "${content.title?.english || content.title?.original || content.title}"`,
            type: 'because_you_watched_enhanced',
            baseContent: content,
            data: becauseYouWatched,
            priority: 3
          });
        }
      }
    }

    // Smart high-rated recommendations based on user preferences
    if (patterns.averageRating > 6.5) {
      const smartHighRated = {
        algorithm: ALGORITHMS.RATING_BASED,
        minRating: Math.max(7, patterns.averageRating - 0.5),
        maxRating: 10,
        genres: patterns.favoriteGenres,
        yearRange: {
          min: new Date().getFullYear() - 10,
          max: new Date().getFullYear()
        },
        excludeWatched: true,
        userFeedbackFiltering: true,
        needsApiCall: true
      };

      recommendations.sections.push({
        title: 'High Quality Picks For You',
        type: 'smart_high_rated',
        data: smartHighRated,
        priority: 3
      });
    }

    // Contextual trending with user preference filtering
    if (includeTrending) {
      const contextualTrending = {
        algorithm: ALGORITHMS.CONTEXTUAL,
        baseAlgorithm: ALGORITHMS.TRENDING,
        filters: {
          genres: patterns.favoriteGenres,
          minRating: Math.max(6, patterns.averageRating - 2),
          contentType,
          excludeDisliked: true,
          timeWindow: 'week',
          regions: ['global', 'us'] // Could be made user-configurable
        },
        boost: {
          genreMatch: 1.3,
          ratingAlignment: 1.2,
          recency: 1.1
        },
        needsApiCall: true
      };

      recommendations.sections.push({
        title: 'Trending Now For You',
        type: 'contextual_trending',
        data: contextualTrending,
        priority: 5
      });
    }

    // Exploration recommendations (new genres/types)
    if (explorationRate > 0 && patterns.confidence > 0.5) {
      const explorationRecs = {
        algorithm: ALGORITHMS.CONTEXTUAL,
        type: 'exploration',
        excludeGenres: patterns.favoriteGenres.slice(0, 2), // Avoid top 2 favorite genres
        includeGenres: getExplorationGenres(patterns),
        minRating: Math.max(7, patterns.averageRating),
        diversityBoost: 1.5,
        needsApiCall: true
      };

      recommendations.sections.push({
        title: 'Try Something New',
        type: 'exploration',
        data: explorationRecs,
        priority: 6,
        description: 'Discover content outside your usual preferences'
      });
    }

    // Cache the results
    cacheRecommendations(recommendations);
    return recommendations;

  } catch (error) {
    console.error('Error generating enhanced smart recommendations:', error);
    return { patterns, sections: [] };
  }
};

/**
 * Get genres for exploration (less watched genres with good ratings)
 */
const getExplorationGenres = (patterns) => {
  const allGenres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 
    'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery', 
    'Romance', 'Science Fiction', 'TV Movie', 'Thriller', 'War', 'Western'
  ];

  const watchedGenres = patterns.favoriteGenres;
  const unexploredGenres = allGenres.filter(genre => 
    !watchedGenres.includes(genre)
  );

  // Return 2-3 unexplored genres for variety
  return unexploredGenres.slice(0, 3);
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
  getHybridMLRecommendations,
  getSmartRecommendations,
  getDiscoveryRecommendations,
  getPersonalizedHomepage,
  invalidateRecommendationCache,
  getSimilarContent,
  calculateAdvancedContentScore
};