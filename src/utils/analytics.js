// Advanced Analytics Engine for NetFlex
// Provides detailed viewing statistics and insights

import { getViewingHistory } from './viewingHistory.js';

const ANALYTICS_CACHE_KEY = 'netflex_analytics_cache';
const CACHE_DURATION = 1000 * 60 * 15; // 15 minutes

/**
 * Get cached analytics if available and not expired
 */
const getCachedAnalytics = () => {
  try {
    const cached = localStorage.getItem(ANALYTICS_CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
  } catch (error) {
    console.error('Error reading analytics cache:', error);
  }
  return null;
};

/**
 * Cache analytics data
 */
const cacheAnalytics = (analytics) => {
  try {
    const cacheData = {
      data: analytics,
      timestamp: Date.now()
    };
    localStorage.setItem(ANALYTICS_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching analytics:', error);
  }
};

/**
 * Calculate total watch time from viewing history
 */
export const calculateTotalWatchTime = () => {
  const history = getViewingHistory();
  const allContent = [...(history.movies || []), ...(history.shows || [])];
  
  let totalMinutes = 0;
  
  allContent.forEach(item => {
    if (item.type === 'movie' && item.runtime) {
      // For movies, calculate watched time based on progress percentage
      const watchedTime = (item.runtime * item.progressPercentage) / 100;
      totalMinutes += watchedTime;
    } else if (item.type === 'show') {
      // For shows, estimate 45 minutes per episode watched
      const episodeLength = 45; // Average episode length
      const watchedTime = (episodeLength * item.progressPercentage) / 100;
      totalMinutes += watchedTime;
    }
  });
  
  return {
    totalMinutes: Math.round(totalMinutes),
    totalHours: Math.round(totalMinutes / 60 * 10) / 10,
    totalDays: Math.round(totalMinutes / (60 * 24) * 10) / 10
  };
};

/**
 * Analyze viewing patterns by time
 */
export const analyzeViewingTimePatterns = () => {
  const history = getViewingHistory();
  const allContent = [...(history.movies || []), ...(history.shows || [])];
  
  if (allContent.length === 0) {
    return {
      byHour: {},
      byDayOfWeek: {},
      byMonth: {},
      peakHours: [],
      busiestDay: null,
      viewingStreak: 0
    };
  }

  const byHour = {};
  const byDayOfWeek = {};
  const byMonth = {};
  const dailyActivity = {};

  // Initialize counters
  for (let i = 0; i < 24; i++) byHour[i] = 0;
  for (let i = 0; i < 7; i++) byDayOfWeek[i] = 0;
  for (let i = 1; i <= 12; i++) byMonth[i] = 0;

  allContent.forEach(item => {
    const date = new Date(item.watchedAt);
    const hour = date.getHours();
    const dayOfWeek = date.getDay();
    const month = date.getMonth() + 1;
    const dayKey = date.toDateString();

    byHour[hour]++;
    byDayOfWeek[dayOfWeek]++;
    byMonth[month]++;
    dailyActivity[dayKey] = (dailyActivity[dayKey] || 0) + 1;
  });

  // Find peak hours (top 3)
  const peakHours = Object.entries(byHour)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }));

  // Find busiest day of week
  const busiestDay = Object.entries(byDayOfWeek)
    .reduce((max, [day, count]) => count > max.count ? { day: parseInt(day), count } : max, { day: 0, count: 0 });

  // Calculate viewing streak
  const sortedDays = Object.keys(dailyActivity).sort((a, b) => new Date(b) - new Date(a));
  let streak = 0;
  let currentDate = new Date();
  
  for (const dayKey of sortedDays) {
    const dayDate = new Date(dayKey);
    const diffInDays = Math.floor((currentDate - dayDate) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === streak) {
      streak++;
    } else {
      break;
    }
  }

  return {
    byHour,
    byDayOfWeek,
    byMonth,
    peakHours,
    busiestDay,
    viewingStreak: streak,
    dailyActivity
  };
};

/**
 * Analyze content preferences
 */
export const analyzeContentPreferences = () => {
  const history = getViewingHistory();
  const allContent = [...(history.movies || []), ...(history.shows || [])];
  
  if (allContent.length === 0) {
    return {
      genreBreakdown: {},
      contentTypeBreakdown: {},
      ratingDistribution: {},
      completionRates: {},
      favoriteDecades: {},
      languagePreferences: {}
    };
  }

  const genreBreakdown = {};
  const contentTypeBreakdown = {};
  const ratingDistribution = { 'under5': 0, '5-6': 0, '6-7': 0, '7-8': 0, '8-9': 0, '9+': 0 };
  const completionRates = { movie: { completed: 0, total: 0 }, show: { completed: 0, total: 0 } };
  const favoriteDecades = {};
  const languagePreferences = {};

  allContent.forEach(item => {
    // Genre analysis
    if (item.genres) {
      item.genres.forEach(genre => {
        const genreName = typeof genre === 'object' ? genre.name : genre;
        genreBreakdown[genreName] = (genreBreakdown[genreName] || 0) + 1;
      });
    }

    // Content type breakdown
    contentTypeBreakdown[item.type] = (contentTypeBreakdown[item.type] || 0) + 1;

    // Rating distribution
    if (item.rating) {
      if (item.rating < 5) ratingDistribution['under5']++;
      else if (item.rating < 6) ratingDistribution['5-6']++;
      else if (item.rating < 7) ratingDistribution['6-7']++;
      else if (item.rating < 8) ratingDistribution['7-8']++;
      else if (item.rating < 9) ratingDistribution['8-9']++;
      else ratingDistribution['9+']++;
    }

    // Completion rates
    if (item.type === 'movie') {
      completionRates.movie.total++;
      if (item.isCompleted) completionRates.movie.completed++;
    } else {
      completionRates.show.total++;
      if (item.isEpisodeCompleted) completionRates.show.completed++;
    }

    // Decade analysis
    if (item.releaseDate) {
      const year = new Date(item.releaseDate).getFullYear();
      const decade = Math.floor(year / 10) * 10;
      favoriteDecades[decade] = (favoriteDecades[decade] || 0) + 1;
    }
  });

  return {
    genreBreakdown,
    contentTypeBreakdown,
    ratingDistribution,
    completionRates: {
      movie: completionRates.movie.total > 0 ? 
        Math.round((completionRates.movie.completed / completionRates.movie.total) * 100) : 0,
      show: completionRates.show.total > 0 ? 
        Math.round((completionRates.show.completed / completionRates.show.total) * 100) : 0
    },
    favoriteDecades,
    languagePreferences
  };
};

/**
 * Calculate viewing milestones and achievements
 */
export const calculateViewingMilestones = () => {
  const history = getViewingHistory();
  const allContent = [...(history.movies || []), ...(history.shows || [])];
  const watchTime = calculateTotalWatchTime();
  const preferences = analyzeContentPreferences();
  
  const milestones = {
    achievements: [],
    progress: {},
    stats: {}
  };

  // Viewing time milestones
  const timeTargets = [
    { hours: 10, title: "Getting Started", description: "Watched 10 hours of content" },
    { hours: 50, title: "Movie Buff", description: "Watched 50 hours of content" },
    { hours: 100, title: "Streaming Enthusiast", description: "Watched 100 hours of content" },
    { hours: 250, title: "Binge Expert", description: "Watched 250 hours of content" },
    { hours: 500, title: "Entertainment Connoisseur", description: "Watched 500 hours of content" },
    { hours: 1000, title: "Legend", description: "Watched 1000+ hours of content" }
  ];

  timeTargets.forEach(target => {
    if (watchTime.totalHours >= target.hours) {
      milestones.achievements.push({
        ...target,
        achieved: true,
        type: 'time'
      });
    }
  });

  // Content quantity milestones
  const quantityTargets = [
    { count: 5, title: "First Steps", description: "Watched 5 titles" },
    { count: 25, title: "Explorer", description: "Watched 25 titles" },
    { count: 50, title: "Collector", description: "Watched 50 titles" },
    { count: 100, title: "Curator", description: "Watched 100 titles" },
    { count: 250, title: "Archive Master", description: "Watched 250 titles" }
  ];

  quantityTargets.forEach(target => {
    if (allContent.length >= target.count) {
      milestones.achievements.push({
        ...target,
        achieved: true,
        type: 'quantity'
      });
    }
  });

  // Genre explorer achievements
  const genreCount = Object.keys(preferences.genreBreakdown).length;
  if (genreCount >= 5) {
    milestones.achievements.push({
      title: "Genre Explorer",
      description: `Explored ${genreCount} different genres`,
      achieved: true,
      type: 'genre'
    });
  }

  // Completion rate achievements
  if (preferences.completionRates.movie >= 80) {
    milestones.achievements.push({
      title: "Finisher",
      description: "High completion rate for movies",
      achieved: true,
      type: 'completion'
    });
  }

  milestones.stats = {
    totalAchievements: milestones.achievements.length,
    watchTime,
    totalContent: allContent.length,
    genresExplored: genreCount
  };

  return milestones;
};

/**
 * Generate comprehensive analytics report
 */
export const generateAnalyticsReport = () => {
  // Check cache first
  const cached = getCachedAnalytics();
  if (cached) {
    return cached;
  }

  const history = getViewingHistory();
  const allContent = [...(history.movies || []), ...(history.shows || [])];
  
  const analytics = {
    summary: {
      totalContent: allContent.length,
      totalMovies: history.movies?.length || 0,
      totalShows: history.shows?.length || 0,
      generatedAt: new Date().toISOString()
    },
    watchTime: calculateTotalWatchTime(),
    timePatterns: analyzeViewingTimePatterns(),
    preferences: analyzeContentPreferences(),
    milestones: calculateViewingMilestones(),
    recentActivity: allContent
      .sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt))
      .slice(0, 10)
  };

  // Calculate some additional insights
  analytics.insights = {
    averageRating: allContent.length > 0 ? 
      Math.round((allContent.reduce((sum, item) => sum + (item.rating || 0), 0) / allContent.length) * 10) / 10 : 0,
    mostWatchedGenre: Object.entries(analytics.preferences.genreBreakdown)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A',
    bingeMeter: analytics.timePatterns.viewingStreak > 5 ? 'High' : 
                analytics.timePatterns.viewingStreak > 2 ? 'Medium' : 'Low',
    diversityScore: Math.min(100, Object.keys(analytics.preferences.genreBreakdown).length * 10)
  };

  // Cache the results
  cacheAnalytics(analytics);
  return analytics;
};

/**
 * Get weekly viewing summary
 */
export const getWeeklyViewingSummary = () => {
  const history = getViewingHistory();
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const weeklyContent = [...(history.movies || []), ...(history.shows || [])]
    .filter(item => new Date(item.watchedAt) > oneWeekAgo);

  const watchTime = weeklyContent.reduce((total, item) => {
    if (item.type === 'movie' && item.runtime) {
      return total + (item.runtime * item.progressPercentage) / 100;
    } else {
      return total + (45 * item.progressPercentage) / 100; // Estimate for shows
    }
  }, 0);

  return {
    contentWatched: weeklyContent.length,
    totalHours: Math.round(watchTime / 60 * 10) / 10,
    averagePerDay: Math.round((weeklyContent.length / 7) * 10) / 10,
    completedContent: weeklyContent.filter(item => 
      item.type === 'movie' ? item.isCompleted : item.isEpisodeCompleted
    ).length
  };
};

/**
 * Compare current period with previous period
 */
export const getViewingComparison = (days = 30) => {
  const history = getViewingHistory();
  const allContent = [...(history.movies || []), ...(history.shows || [])];
  
  const currentPeriodStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const previousPeriodStart = new Date(Date.now() - 2 * days * 24 * 60 * 60 * 1000);
  
  const currentPeriod = allContent.filter(item => 
    new Date(item.watchedAt) > currentPeriodStart
  );
  
  const previousPeriod = allContent.filter(item => {
    const watchDate = new Date(item.watchedAt);
    return watchDate > previousPeriodStart && watchDate <= currentPeriodStart;
  });

  const calculatePeriodStats = (content) => ({
    totalContent: content.length,
    totalHours: content.reduce((total, item) => {
      if (item.type === 'movie' && item.runtime) {
        return total + (item.runtime * item.progressPercentage) / (100 * 60);
      } else {
        return total + (45 * item.progressPercentage) / (100 * 60);
      }
    }, 0)
  });

  const current = calculatePeriodStats(currentPeriod);
  const previous = calculatePeriodStats(previousPeriod);

  return {
    current,
    previous,
    changes: {
      contentChange: current.totalContent - previous.totalContent,
      hoursChange: Math.round((current.totalHours - previous.totalHours) * 10) / 10,
      contentChangePercent: previous.totalContent > 0 ? 
        Math.round(((current.totalContent - previous.totalContent) / previous.totalContent) * 100) : 0,
      hoursChangePercent: previous.totalHours > 0 ? 
        Math.round(((current.totalHours - previous.totalHours) / previous.totalHours) * 100) : 0
    }
  };
};

export default {
  generateAnalyticsReport,
  calculateTotalWatchTime,
  analyzeViewingTimePatterns,
  analyzeContentPreferences,
  calculateViewingMilestones,
  getWeeklyViewingSummary,
  getViewingComparison
}; 