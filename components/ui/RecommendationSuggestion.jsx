import React, { useState, useEffect } from 'react';
import { FaTimes, FaThumbsUp, FaThumbsDown, FaLightbulb, FaRobot } from 'react-icons/fa';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { recordUserFeedback } from '../../src/utils/userFeedback';
import { getSmartRecommendations } from '../../src/utils/recommendations';

const SUGGESTION_COOLDOWN_KEY = 'netflex_suggestion_cooldown';
const COOLDOWN_DURATION = 1000 * 60 * 60 * 2; // 2 hours between suggestions

const RecommendationSuggestion = ({ onClose, isVisible }) => {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  useEffect(() => {
    if (isVisible) {
      loadSuggestion();
    }
  }, [isVisible]);

  const loadSuggestion = async () => {
    setLoading(true);
    try {
      // Get smart recommendations
      const recommendations = await getSmartRecommendations({
        limit: 10,
        includeHybridML: true
      });

      // Find a good suggestion from the recommendations
      let selectedSuggestion = null;
      
      for (const section of recommendations.sections) {
        if (section.content && section.content.length > 0) {
          // Prefer ML-enhanced recommendations
          if (section.mlEnhanced) {
            selectedSuggestion = {
              content: section.content[0],
              reason: section.title,
              confidence: section.confidence || 0.8,
              algorithm: 'AI-Enhanced'
            };
            break;
          } else if (!selectedSuggestion) {
            selectedSuggestion = {
              content: section.content[0],
              reason: section.title,
              confidence: 0.7,
              algorithm: 'Smart Algorithm'
            };
          }
        }
      }

      if (selectedSuggestion) {
        setSuggestion(selectedSuggestion);
      }
    } catch (error) {
      console.error('Error loading suggestion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (isLike) => {
    if (!suggestion) return;

    try {
      await recordUserFeedback(
        suggestion.content.id,
        suggestion.content.type || 'movie',
        isLike,
        suggestion.content
      );

      setFeedbackGiven(true);
      
      // Set cooldown
      localStorage.setItem(SUGGESTION_COOLDOWN_KEY, Date.now().toString());

      // Close after a brief delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Error recording feedback:', error);
    }
  };

  const formatContentTitle = (content) => {
    if (content.title) {
      return content.title.english || content.title.original || content.title;
    }
    return content.name || 'Unknown Title';
  };

  const formatRating = (content) => {
    const rating = content.rating || content.vote_average || 0;
    return Math.round(rating * 10) / 10;
  };

  const getImageUrl = (content) => {
    return content.image || content.poster_path || '/placeholder-poster.jpg';
  };

  if (!isVisible || !suggestion) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-netflix-dark to-gray-900 rounded-2xl max-w-md w-full mx-auto shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <FaRobot className="text-blue-400 text-xl" />
            <h3 className="text-xl font-bold text-white">Recommendation for You</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-netflix-red mx-auto mb-4"></div>
            <p className="text-gray-400">Finding the perfect recommendation...</p>
          </div>
        ) : (
          <div className="p-6">
            {/* Content Preview */}
            <div className="flex space-x-4 mb-6">
              <div className="w-24 h-36 rounded-lg overflow-hidden flex-shrink-0">
                <LazyLoadImage
                  src={getImageUrl(suggestion.content)}
                  alt={formatContentTitle(suggestion.content)}
                  className="w-full h-full object-cover"
                  effect="blur"
                />
              </div>
              
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white mb-2">
                  {formatContentTitle(suggestion.content)}
                </h4>
                
                <div className="flex items-center space-x-3 mb-3">
                  <span className="bg-green-600 px-2 py-1 rounded text-xs font-medium">
                    {Math.round(suggestion.confidence * 100)}% Match
                  </span>
                  <span className="text-gray-400 text-sm capitalize">
                    {suggestion.content.type}
                  </span>
                  <span className="text-yellow-400 text-sm">
                    ★ {formatRating(suggestion.content)}
                  </span>
                </div>

                <p className="text-gray-300 text-sm mb-3 line-clamp-3">
                  {suggestion.content.description || suggestion.content.overview || 'No description available.'}
                </p>

                <div className="flex items-center space-x-1 text-xs text-blue-400">
                  <FaLightbulb />
                  <span>From: {suggestion.reason}</span>
                </div>
              </div>
            </div>

            {/* Algorithm Badge */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                <FaRobot />
                <span>Powered by {suggestion.algorithm}</span>
              </div>
            </div>

            {/* Feedback Section */}
            {!feedbackGiven ? (
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-4">
                  Does this look interesting to you?
                </p>
                
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => handleFeedback(true)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full transition-colors font-medium"
                  >
                    <FaThumbsUp />
                    <span>Yes, I'd watch this</span>
                  </button>
                  
                  <button
                    onClick={() => handleFeedback(false)}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full transition-colors font-medium"
                  >
                    <FaThumbsDown />
                    <span>Not for me</span>
                  </button>
                </div>
                
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white text-sm mt-4 transition-colors"
                >
                  Maybe later
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-green-400 text-lg mb-2">✓</div>
                <p className="text-green-400 font-medium">
                  Thanks for your feedback!
                </p>
                <p className="text-gray-400 text-sm">
                  We'll use this to improve your recommendations.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Hook to manage suggestion display timing
export const useRecommendationSuggestions = () => {
  const [showSuggestion, setShowSuggestion] = useState(false);

  useEffect(() => {
    const checkForSuggestion = () => {
      try {
        const lastSuggestion = localStorage.getItem(SUGGESTION_COOLDOWN_KEY);
        const now = Date.now();
        
        if (!lastSuggestion || (now - parseInt(lastSuggestion)) > COOLDOWN_DURATION) {
          // Show suggestion after user has been active for a while
          const timer = setTimeout(() => {
            setShowSuggestion(true);
          }, 30000); // 30 seconds delay

          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('Error checking suggestion timing:', error);
      }
    };

    checkForSuggestion();
  }, []);

  const closeSuggestion = () => {
    setShowSuggestion(false);
  };

  return { showSuggestion, closeSuggestion };
};

export default RecommendationSuggestion;
