// Enhanced Content Filtering and Analysis for NetFlex
// Provides advanced filtering and content analysis using TMDB data

import { getUserFeedback, getContentSimilarityScore } from './userFeedback';

/**
 * Enhanced content filtering with multiple criteria
 */
export const filterContentAdvanced = (content, filters = {}) => {
  const {
    minRating = 0,
    maxRating = 10,
    genres = [],
    excludeGenres = [],
    yearRange = null,
    languages = [],
    excludeWatched = false,
    userFeedbackFiltering = true,
    minVoteCount = 0,
    sortBy = 'recommendation_score' // recommendation_score, rating, popularity, release_date
  } = filters;

  let filteredContent = [...content];
  const userFeedback = userFeedbackFiltering ? getUserFeedback() : { positive: {}, negative: {} };

  // Filter by rating range
  if (minRating > 0 || maxRating < 10) {
    filteredContent = filteredContent.filter(item => {
      const rating = item.rating || item.vote_average || 0;
      return rating >= minRating && rating <= maxRating;
    });
  }

  // Filter by genres (include)
  if (genres.length > 0) {
    filteredContent = filteredContent.filter(item => {
      if (!item.genres) return false;
      const itemGenres = item.genres.map(g => typeof g === 'object' ? g.name : g);
      return genres.some(genre => itemGenres.includes(genre));
    });
  }

  // Filter by genres (exclude)
  if (excludeGenres.length > 0) {
    filteredContent = filteredContent.filter(item => {
      if (!item.genres) return true;
      const itemGenres = item.genres.map(g => typeof g === 'object' ? g.name : g);
      return !excludeGenres.some(genre => itemGenres.includes(genre));
    });
  }

  // Filter by year range
  if (yearRange) {
    filteredContent = filteredContent.filter(item => {
      const releaseDate = item.releaseDate || item.release_date || item.first_air_date;
      if (!releaseDate) return true;
      
      const year = new Date(releaseDate).getFullYear();
      return year >= yearRange.min && year <= yearRange.max;
    });
  }

  // Filter by languages
  if (languages.length > 0) {
    filteredContent = filteredContent.filter(item => {
      const language = item.originalLanguage || item.original_language || 'en';
      return languages.includes(language);
    });
  }

  // Filter by vote count (popularity threshold)
  if (minVoteCount > 0) {
    filteredContent = filteredContent.filter(item => {
      const voteCount = item.vote_count || 0;
      return voteCount >= minVoteCount;
    });
  }

  // Apply user feedback filtering
  if (userFeedbackFiltering) {
    filteredContent = filteredContent.filter(item => {
      const contentId = item.id.toString();
      
      // Exclude directly disliked content
      if (userFeedback.negative[contentId]) {
        return false;
      }

      // Calculate similarity score and filter low scores
      const similarityScore = getContentSimilarityScore(item, userFeedback);
      return similarityScore >= -0.5; // Allow some negative but not extremely negative
    });
  }

  // Sort content
  filteredContent = sortContent(filteredContent, sortBy, userFeedback);

  return filteredContent;
};

/**
 * Sort content by various criteria
 */
const sortContent = (content, sortBy, userFeedback) => {
  switch (sortBy) {
    case 'recommendation_score':
      return content
        .map(item => ({
          ...item,
          recommendationScore: getContentSimilarityScore(item, userFeedback)
        }))
        .sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0));

    case 'rating':
      return content.sort((a, b) => {
        const ratingA = a.rating || a.vote_average || 0;
        const ratingB = b.rating || b.vote_average || 0;
        return ratingB - ratingA;
      });

    case 'popularity':
      return content.sort((a, b) => {
        const popA = a.popularity || 0;
        const popB = b.popularity || 0;
        return popB - popA;
      });

    case 'release_date':
      return content.sort((a, b) => {
        const dateA = new Date(a.releaseDate || a.release_date || a.first_air_date || 0);
        const dateB = new Date(b.releaseDate || b.release_date || b.first_air_date || 0);
        return dateB - dateA;
      });

    case 'alphabetical':
      return content.sort((a, b) => {
        const titleA = (a.title?.english || a.title?.original || a.title || a.name || '').toLowerCase();
        const titleB = (b.title?.english || b.title?.original || b.title || b.name || '').toLowerCase();
        return titleA.localeCompare(titleB);
      });

    default:
      return content;
  }
};

/**
 * Analyze content diversity in a collection
 */
export const analyzeContentDiversity = (content) => {
  const diversity = {
    genreDiversity: 0,
    yearDiversity: 0,
    ratingDiversity: 0,
    languageDiversity: 0,
    scoreBreakdown: {
      genres: {},
      years: {},
      ratings: {},
      languages: {}
    }
  };

  if (content.length === 0) return diversity;

  // Analyze genres
  const genres = new Set();
  content.forEach(item => {
    if (item.genres) {
      item.genres.forEach(genre => {
        const genreName = typeof genre === 'object' ? genre.name : genre;
        genres.add(genreName);
        diversity.scoreBreakdown.genres[genreName] = (diversity.scoreBreakdown.genres[genreName] || 0) + 1;
      });
    }
  });
  diversity.genreDiversity = genres.size;

  // Analyze years
  const years = new Set();
  content.forEach(item => {
    const releaseDate = item.releaseDate || item.release_date || item.first_air_date;
    if (releaseDate) {
      const year = new Date(releaseDate).getFullYear();
      years.add(year);
      diversity.scoreBreakdown.years[year] = (diversity.scoreBreakdown.years[year] || 0) + 1;
    }
  });
  diversity.yearDiversity = years.size;

  // Analyze rating distribution
  const ratingRanges = { low: 0, medium: 0, high: 0 };
  content.forEach(item => {
    const rating = item.rating || item.vote_average || 0;
    if (rating < 6) ratingRanges.low++;
    else if (rating < 8) ratingRanges.medium++;
    else ratingRanges.high++;
  });
  diversity.ratingDiversity = Object.values(ratingRanges).filter(count => count > 0).length;
  diversity.scoreBreakdown.ratings = ratingRanges;

  // Analyze languages
  const languages = new Set();
  content.forEach(item => {
    const language = item.originalLanguage || item.original_language || 'en';
    languages.add(language);
    diversity.scoreBreakdown.languages[language] = (diversity.scoreBreakdown.languages[language] || 0) + 1;
  });
  diversity.languageDiversity = languages.size;

  return diversity;
};

/**
 * Enhanced content search with fuzzy matching
 */
export const searchContent = (content, query, options = {}) => {
  const {
    searchFields = ['title', 'description', 'genres'],
    fuzzyThreshold = 0.3,
    boostExactMatches = true
  } = options;

  if (!query || query.trim().length === 0) return content;

  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/);

  return content
    .map(item => {
      let score = 0;
      let matches = [];

      // Search in title
      if (searchFields.includes('title')) {
        const title = (item.title?.english || item.title?.original || item.title || item.name || '').toLowerCase();
        if (title.includes(normalizedQuery)) {
          score += boostExactMatches ? 10 : 5;
          matches.push('title');
        } else {
          // Check for partial word matches
          const titleWords = title.split(/\s+/);
          queryWords.forEach(queryWord => {
            titleWords.forEach(titleWord => {
              if (titleWord.includes(queryWord) || queryWord.includes(titleWord)) {
                score += 2;
              }
            });
          });
        }
      }

      // Search in description
      if (searchFields.includes('description')) {
        const description = (item.description || item.overview || '').toLowerCase();
        if (description.includes(normalizedQuery)) {
          score += 3;
          matches.push('description');
        }
      }

      // Search in genres
      if (searchFields.includes('genres') && item.genres) {
        const genreMatches = item.genres.some(genre => {
          const genreName = (typeof genre === 'object' ? genre.name : genre).toLowerCase();
          return genreName.includes(normalizedQuery);
        });
        if (genreMatches) {
          score += 5;
          matches.push('genre');
        }
      }

      return { ...item, searchScore: score, searchMatches: matches };
    })
    .filter(item => item.searchScore > 0)
    .sort((a, b) => b.searchScore - a.searchScore);
};

/**
 * Generate content recommendations based on similarity
 */
export const generateSimilarContent = (baseContent, allContent, options = {}) => {
  const {
    limit = 20,
    excludeSelf = true,
    similarityThreshold = 0.3
  } = options;

  if (!baseContent || !allContent.length) return [];

  const userFeedback = getUserFeedback();
  
  return allContent
    .filter(item => {
      // Exclude the base content itself
      if (excludeSelf && item.id === baseContent.id && item.type === baseContent.type) {
        return false;
      }
      
      // Calculate similarity score
      const similarity = calculateContentSimilarity(baseContent, item);
      return similarity >= similarityThreshold;
    })
    .map(item => ({
      ...item,
      similarityScore: calculateContentSimilarity(baseContent, item),
      recommendationScore: getContentSimilarityScore(item, userFeedback)
    }))
    .sort((a, b) => {
      // Combine similarity and recommendation scores
      const scoreA = (a.similarityScore * 0.6) + (a.recommendationScore * 0.4);
      const scoreB = (b.similarityScore * 0.6) + (b.recommendationScore * 0.4);
      return scoreB - scoreA;
    })
    .slice(0, limit);
};

/**
 * Calculate similarity between two content items
 */
const calculateContentSimilarity = (content1, content2) => {
  let score = 0;
  let factors = 0;

  // Genre similarity
  if (content1.genres && content2.genres) {
    const genres1 = content1.genres.map(g => typeof g === 'object' ? g.name : g);
    const genres2 = content2.genres.map(g => typeof g === 'object' ? g.name : g);
    const commonGenres = genres1.filter(g => genres2.includes(g));
    score += (commonGenres.length / Math.max(genres1.length, genres2.length)) * 0.4;
    factors += 0.4;
  }

  // Rating similarity
  const rating1 = content1.rating || content1.vote_average || 0;
  const rating2 = content2.rating || content2.vote_average || 0;
  if (rating1 > 0 && rating2 > 0) {
    const ratingDiff = Math.abs(rating1 - rating2);
    score += Math.max(0, (10 - ratingDiff) / 10) * 0.2;
    factors += 0.2;
  }

  // Year similarity
  const year1 = content1.releaseDate ? new Date(content1.releaseDate).getFullYear() : 0;
  const year2 = content2.releaseDate ? new Date(content2.releaseDate).getFullYear() : 0;
  if (year1 > 0 && year2 > 0) {
    const yearDiff = Math.abs(year1 - year2);
    score += Math.max(0, (20 - yearDiff) / 20) * 0.2;
    factors += 0.2;
  }

  // Type similarity
  if (content1.type === content2.type) {
    score += 0.2;
  }
  factors += 0.2;

  return factors > 0 ? score / factors : 0;
};

export default {
  filterContentAdvanced,
  analyzeContentDiversity,
  searchContent,
  generateSimilarContent,
  calculateContentSimilarity
};
