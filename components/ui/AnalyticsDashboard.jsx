import React, { useState, useEffect } from 'react';
import { FaPlay, FaClock, FaTrophy, FaChartBar, FaFire, FaStar, FaCalendarAlt, FaEye, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { generateAnalyticsReport, getWeeklyViewingSummary, getViewingComparison } from '../../src/utils/analytics';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30'); // days

  useEffect(() => {
    const loadAnalytics = () => {
      try {
        const analyticsData = generateAnalyticsReport();
        const weekly = getWeeklyViewingSummary();
        const comp = getViewingComparison(parseInt(selectedPeriod));
        
        setAnalytics(analyticsData);
        setWeeklyStats(weekly);
        setComparison(comp);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [selectedPeriod]);

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black text-netflix-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-netflix-red mx-auto mb-4"></div>
          <p className="text-lg">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics || analytics.summary.totalContent === 0) {
    return (
      <div className="min-h-screen bg-netflix-black text-netflix-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <FaChartBar className="text-6xl text-netflix-red mb-4 mx-auto opacity-50" />
          <h2 className="text-2xl font-bold mb-4">No Viewing Data Yet</h2>
          <p className="text-netflix-text-gray mb-6">
            Start watching some content to see your personalized analytics and insights!
          </p>
          <div className="bg-netflix-dark rounded-lg p-4">
            <p className="text-sm text-netflix-text-gray">
              Your analytics will show viewing patterns, favorite genres, completion rates, and more.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const formatGenre = (genreName) => {
    return genreName.charAt(0).toUpperCase() + genreName.slice(1).toLowerCase();
  };

  const getDayName = (dayIndex) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  };

  const getComparisonIcon = (value) => {
    if (value > 0) return <FaArrowUp className="text-green-500" />;
    if (value < 0) return <FaArrowDown className="text-red-500" />;
    return <span className="text-netflix-text-gray">—</span>;
  };

  const getComparisonColor = (value) => {
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-netflix-text-gray';
  };

  return (
    <div className="min-h-screen bg-netflix-black text-netflix-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Viewing Analytics</h1>
          <p className="text-netflix-text-gray text-lg">
            Insights into your streaming habits and preferences
          </p>
        </div>

        {/* Period Selector */}
        <div className="mb-8">
          <div className="bg-netflix-dark rounded-lg p-4 inline-block">
            <label className="text-sm text-netflix-text-gray mr-4">Comparison Period:</label>
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-netflix-gray text-netflix-white rounded px-3 py-1 text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-netflix-dark rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <FaPlay className="text-netflix-red text-2xl" />
              <div className="flex items-center text-sm">
                {getComparisonIcon(comparison.changes.contentChange)}
                <span className={`ml-1 ${getComparisonColor(comparison.changes.contentChange)}`}>
                  {Math.abs(comparison.changes.contentChange)}
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold">{analytics.summary.totalContent}</h3>
            <p className="text-netflix-text-gray text-sm">Total Content Watched</p>
          </div>

          <div className="bg-netflix-dark rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <FaClock className="text-blue-500 text-2xl" />
              <div className="flex items-center text-sm">
                {getComparisonIcon(comparison.changes.hoursChange)}
                <span className={`ml-1 ${getComparisonColor(comparison.changes.hoursChange)}`}>
                  {Math.abs(comparison.changes.hoursChange)}h
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold">{analytics.watchTime.totalHours}h</h3>
            <p className="text-netflix-text-gray text-sm">Total Watch Time</p>
          </div>

          <div className="bg-netflix-dark rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <FaFire className="text-orange-500 text-2xl" />
              <span className="text-sm text-netflix-text-gray">
                {analytics.timePatterns.viewingStreak} days
              </span>
            </div>
            <h3 className="text-2xl font-bold">{analytics.insights.bingeMeter}</h3>
            <p className="text-netflix-text-gray text-sm">Binge Level</p>
          </div>

          <div className="bg-netflix-dark rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <FaStar className="text-yellow-500 text-2xl" />
              <span className="text-sm text-netflix-text-gray">
                {analytics.insights.diversityScore}%
              </span>
            </div>
            <h3 className="text-2xl font-bold">{analytics.insights.averageRating}/10</h3>
            <p className="text-netflix-text-gray text-sm">Average Rating</p>
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="bg-netflix-dark rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaCalendarAlt className="mr-2 text-netflix-red" />
            This Week's Activity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-netflix-red">{weeklyStats.contentWatched}</div>
              <div className="text-sm text-netflix-text-gray">Content Watched</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{weeklyStats.totalHours}h</div>
              <div className="text-sm text-netflix-text-gray">Hours Watched</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{weeklyStats.averagePerDay}</div>
              <div className="text-sm text-netflix-text-gray">Per Day Average</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{weeklyStats.completedContent}</div>
              <div className="text-sm text-netflix-text-gray">Completed</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Favorite Genres */}
          <div className="bg-netflix-dark rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Favorite Genres</h2>
            <div className="space-y-3">
              {Object.entries(analytics.preferences.genreBreakdown)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([genre, count], index) => {
                  const percentage = (count / analytics.summary.totalContent) * 100;
                  return (
                    <div key={genre} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-netflix-red rounded mr-3 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <span>{formatGenre(genre)}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-24 bg-netflix-gray rounded-full h-2 mr-3">
                          <div 
                            className="bg-netflix-red h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-netflix-text-gray w-8">{count}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Viewing Patterns */}
          <div className="bg-netflix-dark rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Peak Viewing Hours</h2>
            <div className="space-y-3">
              {analytics.timePatterns.peakHours.map((hourData, index) => {
                const hour12 = hourData.hour % 12 || 12;
                const ampm = hourData.hour >= 12 ? 'PM' : 'AM';
                return (
                  <div key={hourData.hour} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-blue-500 rounded mr-3 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span>{hour12}:00 {ampm}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 bg-netflix-gray rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(hourData.count / Math.max(...analytics.timePatterns.peakHours.map(h => h.count))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-netflix-text-gray w-8">{hourData.count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-netflix-gray">
              <p className="text-sm text-netflix-text-gray">
                <strong>Busiest Day:</strong> {getDayName(analytics.timePatterns.busiestDay.day)}
              </p>
              <p className="text-sm text-netflix-text-gray">
                <strong>Current Streak:</strong> {analytics.timePatterns.viewingStreak} days
              </p>
            </div>
          </div>
        </div>

        {/* Achievements */}
        {analytics.milestones.achievements.length > 0 && (
          <div className="bg-netflix-dark rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaTrophy className="mr-2 text-yellow-500" />
              Achievements Unlocked
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.milestones.achievements.map((achievement, index) => (
                <div key={index} className="bg-netflix-gray rounded-lg p-4 flex items-center">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mr-4">
                    <FaTrophy className="text-netflix-black text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <p className="text-sm text-netflix-text-gray">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-netflix-dark rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Content Type Distribution</h2>
            <div className="space-y-4">
              {Object.entries(analytics.preferences.contentTypeBreakdown).map(([type, count]) => {
                const percentage = (count / analytics.summary.totalContent) * 100;
                return (
                  <div key={type} className="flex items-center justify-between">
                    <span className="capitalize">{type}s</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-netflix-gray rounded-full h-3 mr-3">
                        <div 
                          className="bg-gradient-to-r from-netflix-red to-red-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-netflix-text-gray w-12">{Math.round(percentage)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-netflix-dark rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Completion Rate</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Movies</span>
                <div className="flex items-center">
                  <div className="w-32 bg-netflix-gray rounded-full h-3 mr-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${analytics.preferences.completionRates.movie}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-netflix-text-gray w-12">{analytics.preferences.completionRates.movie}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>TV Shows</span>
                <div className="flex items-center">
                  <div className="w-32 bg-netflix-gray rounded-full h-3 mr-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${analytics.preferences.completionRates.show}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-netflix-text-gray w-12">{analytics.preferences.completionRates.show}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-netflix-dark rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaEye className="mr-2 text-netflix-red" />
            Recent Activity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.recentActivity.slice(0, 6).map((item, index) => (
              <div key={index} className="flex items-center p-3 bg-netflix-gray rounded-lg">
                <img 
                  src={item.image} 
                  alt={item.title?.english || item.title?.original || item.title}
                  className="w-12 h-18 object-cover rounded mr-3"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">
                    {item.title?.english || item.title?.original || item.title}
                  </h3>
                  <p className="text-sm text-netflix-text-gray">
                    {item.type === 'movie' ? 'Movie' : `S${item.currentSeason}E${item.currentEpisode}`}
                  </p>
                  <p className="text-xs text-netflix-text-gray">
                    {new Date(item.watchedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{Math.round(item.progressPercentage)}%</div>
                  <div className="w-12 bg-netflix-black rounded-full h-1 mt-1">
                    <div 
                      className="bg-netflix-red h-1 rounded-full"
                      style={{ width: `${item.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 