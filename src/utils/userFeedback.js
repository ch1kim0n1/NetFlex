// Advanced User Feedback System for NetFlex
// Manages likes, dislikes, and learning from user preferences

const USER_FEEDBACK_KEY = 'netflex_user_feedback';
const NEGATIVE_FEEDBACK_KEY = 'netflex_negative_feedback';
const FEEDBACK_WEIGHTS = {
  LIKE: 1.0,
  DISLIKE: -1.0,
  WATCH_COMPLETE: 0.8,
  WATCH_PARTIAL: 0.4,
  SKIP_QUICKLY: -0.3,
  REWATCH: 1.2
};

/**
 * Get user feedback data
 */
export const getUserFeedback = () => {
  try {
    const feedback = localStorage.getItem(USER_FEEDBACK_KEY);
    const negativeFeedback = localStorage.getItem(NEGATIVE_FEEDBACK_KEY);
    
    return {
      positive: feedback ? JSON.parse(feedback) : {},
      negative: negativeFeedback ? JSON.parse(negativeFeedback) : {},
      weights: FEEDBACK_WEIGHTS
    };
  } catch (error) {
    console.error('Error reading user feedback:', error);
    return { positive: {}, negative: {}, weights: FEEDBACK_WEIGHTS };
  }
};

/**
 * Save user feedback
 */
const saveFeedback = (positive, negative) => {
  try {
    localStorage.setItem(USER_FEEDBACK_KEY, JSON.stringify(positive));
    localStorage.setItem(NEGATIVE_FEEDBACK_KEY, JSON.stringify(negative));
  } catch (error) {
    console.error('Error saving user feedback:', error);
  }
};

/**
 * Record user like/dislike for content
 */
export const recordUserFeedback = (contentId, contentType, isLike, contentData = {}) => {
  const feedback = getUserFeedback();
  const timestamp = new Date().toISOString();
  
  const feedbackEntry = {
    contentId: contentId.toString(),
    contentType,
    timestamp,
    weight: isLike ? FEEDBACK_WEIGHTS.LIKE : FEEDBACK_WEIGHTS.DISLIKE,
    contentData: {
      genres: contentData.genres || [],
      rating: contentData.rating || 0,
      releaseYear: contentData.releaseDate ? new Date(contentData.releaseDate).getFullYear() : null,
      runtime: contentData.runtime || 0,
      director: contentData.director || null,
      cast: contentData.cast || [],
      keywords: contentData.keywords || [],
      originalLanguage: contentData.originalLanguage || 'en'
    }
  };

  if (isLike) {
    feedback.positive[contentId] = feedbackEntry;
    // Remove from negative if it was there
    delete feedback.negative[contentId];
  } else {
    feedback.negative[contentId] = feedbackEntry;
    // Remove from positive if it was there
    delete feedback.positive[contentId];
  }

  saveFeedback(feedback.positive, feedback.negative);
  
  // Invalidate recommendation cache
  try {
    const { invalidateRecommendationCache } = require('./recommendations');
    invalidateRecommendationCache();
  } catch (error) {
    console.debug('Recommendations module not available for cache invalidation');
  }

  return feedbackEntry;
};

/**
 * Get content similarity score based on user feedback
 */
export const getContentSimilarityScore = (content, userFeedback) => {
  let score = 0;
  let factorCount = 0;

  // Genre similarity with liked content
  const likedGenres = new Map();
  const dislikedGenres = new Map();

  Object.values(userFeedback.positive).forEach(feedback => {
    feedback.contentData.genres.forEach(genre => {
      const genreName = typeof genre === 'object' ? genre.name : genre;
      likedGenres.set(genreName, (likedGenres.get(genreName) || 0) + feedback.weight);
    });
  });

  Object.values(userFeedback.negative).forEach(feedback => {
    feedback.contentData.genres.forEach(genre => {
      const genreName = typeof genre === 'object' ? genre.name : genre;
      dislikedGenres.set(genreName, (dislikedGenres.get(genreName) || 0) + Math.abs(feedback.weight));
    });
  });

  // Calculate genre score
  const contentGenres = content.genres || [];
  contentGenres.forEach(genre => {
    const genreName = typeof genre === 'object' ? genre.name : genre;
    if (likedGenres.has(genreName)) {
      score += likedGenres.get(genreName) * 0.3;
      factorCount++;
    }
    if (dislikedGenres.has(genreName)) {
      score -= dislikedGenres.get(genreName) * 0.4; // Penalize disliked genres more
      factorCount++;
    }
  });

  // Rating similarity
  const likedRatings = Object.values(userFeedback.positive)
    .map(f => f.contentData.rating)
    .filter(r => r > 0);
  
  if (likedRatings.length > 0 && content.rating) {
    const avgLikedRating = likedRatings.reduce((sum, r) => sum + r, 0) / likedRatings.length;
    const ratingDiff = Math.abs(content.rating - avgLikedRating);
    score += Math.max(0, (10 - ratingDiff) / 10) * 0.2;
    factorCount++;
  }

  // Release year preference
  const likedYears = Object.values(userFeedback.positive)
    .map(f => f.contentData.releaseYear)
    .filter(y => y);
  
  if (likedYears.length > 0 && content.releaseDate) {
    const contentYear = new Date(content.releaseDate).getFullYear();
    const avgLikedYear = likedYears.reduce((sum, y) => sum + y, 0) / likedYears.length;
    const yearDiff = Math.abs(contentYear - avgLikedYear);
    score += Math.max(0, (20 - yearDiff) / 20) * 0.15;
    factorCount++;
  }

  // Normalize score
  return factorCount > 0 ? score / factorCount : 0;
};

/**
 * Check if content should be filtered out based on negative feedback
 */
export const shouldFilterContent = (content, userFeedback) => {
  const contentId = content.id.toString();
  
  // Directly disliked
  if (userFeedback.negative[contentId]) {
    return true;
  }

  // Similar to heavily disliked content
  const similarityThreshold = -0.7;
  const similarityScore = getContentSimilarityScore(content, userFeedback);
  
  return similarityScore < similarityThreshold;
};

/**
 * Get user's preferred content characteristics
 */
export const getUserPreferences = () => {
  const feedback = getUserFeedback();
  const preferences = {
    favoriteGenres: new Map(),
    dislikedGenres: new Map(),
    preferredRatingRange: { min: 0, max: 10 },
    preferredYearRange: { min: 1900, max: new Date().getFullYear() },
    preferredRuntime: { min: 0, max: 300 },
    preferredLanguages: new Map(),
    totalFeedback: Object.keys(feedback.positive).length + Object.keys(feedback.negative).length
  };

  // Analyze positive feedback
  Object.values(feedback.positive).forEach(feedbackItem => {
    const { contentData, weight } = feedbackItem;
    
    // Genres
    contentData.genres.forEach(genre => {
      const genreName = typeof genre === 'object' ? genre.name : genre;
      preferences.favoriteGenres.set(
        genreName, 
        (preferences.favoriteGenres.get(genreName) || 0) + weight
      );
    });

    // Languages
    if (contentData.originalLanguage) {
      preferences.preferredLanguages.set(
        contentData.originalLanguage,
        (preferences.preferredLanguages.get(contentData.originalLanguage) || 0) + weight
      );
    }
  });

  // Analyze negative feedback
  Object.values(feedback.negative).forEach(feedbackItem => {
    const { contentData, weight } = feedbackItem;
    
    contentData.genres.forEach(genre => {
      const genreName = typeof genre === 'object' ? genre.name : genre;
      preferences.dislikedGenres.set(
        genreName, 
        (preferences.dislikedGenres.get(genreName) || 0) + Math.abs(weight)
      );
    });
  });

  return preferences;
};

/**
 * Record implicit feedback from viewing behavior
 */
export const recordImplicitFeedback = (contentId, contentType, action, data = {}) => {
  const feedback = getUserFeedback();
  let weight = 0;

  switch (action) {
    case 'watch_complete':
      weight = FEEDBACK_WEIGHTS.WATCH_COMPLETE;
      break;
    case 'watch_partial':
      weight = FEEDBACK_WEIGHTS.WATCH_PARTIAL;
      break;
    case 'skip_quickly':
      weight = FEEDBACK_WEIGHTS.SKIP_QUICKLY;
      break;
    case 'rewatch':
      weight = FEEDBACK_WEIGHTS.REWATCH;
      break;
    default:
      return;
  }

  const implicitEntry = {
    contentId: contentId.toString(),
    contentType,
    timestamp: new Date().toISOString(),
    weight,
    action,
    implicit: true,
    data
  };

  if (weight > 0) {
    feedback.positive[`${contentId}_${action}`] = implicitEntry;
  } else {
    feedback.negative[`${contentId}_${action}`] = implicitEntry;
  }

  saveFeedback(feedback.positive, feedback.negative);
};

export default {
  getUserFeedback,
  recordUserFeedback,
  getContentSimilarityScore,
  shouldFilterContent,
  getUserPreferences,
  recordImplicitFeedback
};
