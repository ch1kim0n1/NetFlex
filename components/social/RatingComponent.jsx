import { useState, useEffect } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { useAuth } from '../../src/contexts/AuthContext';
import { getUserRating, saveRating, getAverageRating } from '../../src/utils/socialUtils';

const RatingComponent = ({ contentId, contentType, className = "" }) => {
  const { user, currentProfile, isAuthenticated } = useAuth();
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRatings();
  }, [contentId, contentType, user, currentProfile]);

  const loadRatings = async () => {
    // Load average rating
    const avgRating = await getAverageRating(contentId, contentType);
    setAverageRating(avgRating);

    // Load user's rating if authenticated
    if (isAuthenticated && user && currentProfile) {
      const rating = await getUserRating(user.id, currentProfile.id, contentId, contentType);
      setUserRating(rating ? rating.rating : 0);
    }
  };

  const handleRating = async (rating) => {
    if (!isAuthenticated || !user || !currentProfile) return;

    setLoading(true);
    try {
      await saveRating(user.id, currentProfile.id, contentId, contentType, rating);
      setUserRating(rating);
      // Reload average rating
      const avgRating = await getAverageRating(contentId, contentType);
      setAverageRating(avgRating);
    } catch (error) {
      console.error('Error saving rating:', error);
    }
    setLoading(false);
  };

  const renderStars = (rating, isInteractive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= (isInteractive ? (hoverRating || rating) : rating);
      stars.push(
        <button
          key={i}
          onClick={isInteractive ? () => handleRating(i) : undefined}
          onMouseEnter={isInteractive ? () => setHoverRating(i) : undefined}
          onMouseLeave={isInteractive ? () => setHoverRating(0) : undefined}
          disabled={loading || !isInteractive}
          className={`${isInteractive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-all ${loading ? 'opacity-50' : ''}`}
        >
          {isFilled ? (
            <FaStar className="text-yellow-400" />
          ) : (
            <FaRegStar className="text-netflix-text-gray" />
          )}
        </button>
      );
    }
    return stars;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Average Rating */}
      {averageRating && (
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            {renderStars(averageRating.average)}
          </div>
          <div className="text-netflix-text-gray text-sm">
            <span className="text-netflix-white font-medium">
              {averageRating.average.toFixed(1)}
            </span>
            <span className="ml-1">
              ({averageRating.count} {averageRating.count === 1 ? 'rating' : 'ratings'})
            </span>
          </div>
        </div>
      )}

      {/* User Rating */}
      {isAuthenticated ? (
        <div className="space-y-2">
          <p className="text-netflix-white text-sm font-medium">Your Rating:</p>
          <div className="flex items-center space-x-1">
            {renderStars(userRating, true)}
            {userRating > 0 && (
              <span className="text-netflix-white text-sm ml-2">
                {userRating}/5
              </span>
            )}
          </div>
          {!userRating && (
            <p className="text-netflix-text-gray text-xs">
              Click a star to rate this {contentType}
            </p>
          )}
        </div>
      ) : (
        <div className="p-3 bg-netflix-gray/20 border border-netflix-gray/30 rounded-md">
          <p className="text-netflix-text-gray text-sm">
            Sign in to rate this {contentType}
          </p>
        </div>
      )}
    </div>
  );
};

export default RatingComponent; 