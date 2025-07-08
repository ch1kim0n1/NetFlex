import React, { useState } from 'react';
import { FaThumbsUp, FaThumbsDown, FaTimes, FaHeart, FaHeartBroken } from 'react-icons/fa';
import { recordUserFeedback } from '../../src/utils/userFeedback';

const FeedbackButton = ({ 
  content, 
  type = 'like_dislike', 
  size = 'sm',
  onFeedbackChange,
  showLabels = false,
  className = ''
}) => {
  const [feedback, setFeedback] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleFeedback = async (isLike) => {
    try {
      // Record the feedback
      const feedbackEntry = recordUserFeedback(
        content.id, 
        content.type || 'movie', 
        isLike, 
        {
          genres: content.genres,
          rating: content.rating || content.vote_average,
          releaseDate: content.releaseDate || content.release_date,
          runtime: content.runtime,
          director: content.director,
          cast: content.cast,
          keywords: content.keywords,
          originalLanguage: content.original_language
        }
      );

      setFeedback(isLike ? 'liked' : 'disliked');
      
      // Show temporary feedback message
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);

      // Notify parent component
      if (onFeedbackChange) {
        onFeedbackChange(feedbackEntry);
      }

    } catch (error) {
      console.error('Error recording feedback:', error);
    }
  };

  const buttonSizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  const getButtonClass = (isLike) => {
    const baseClass = `${buttonSizeClasses[size]} rounded-full border-2 transition-all duration-200 flex items-center justify-center relative`;
    
    if (feedback === (isLike ? 'liked' : 'disliked')) {
      return isLike 
        ? `${baseClass} bg-green-600 border-green-600 text-white transform scale-110`
        : `${baseClass} bg-red-600 border-red-600 text-white transform scale-110`;
    }

    return isLike
      ? `${baseClass} border-green-500 text-green-500 hover:bg-green-500 hover:text-white hover:scale-105`
      : `${baseClass} border-red-500 text-red-500 hover:bg-red-500 hover:text-white hover:scale-105`;
  };

  const renderStandardButtons = () => (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={() => handleFeedback(true)}
        className={getButtonClass(true)}
        title="I like this"
        disabled={feedback !== null}
      >
        <FaThumbsUp />
      </button>
      
      <button
        onClick={() => handleFeedback(false)}
        className={getButtonClass(false)}
        title="I don't like this"
        disabled={feedback !== null}
      >
        <FaThumbsDown />
      </button>

      {showLabels && (
        <span className="text-xs text-netflix-text-gray ml-2">
          Rate this recommendation
        </span>
      )}

      {showTooltip && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-netflix-dark text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
          {feedback === 'liked' ? 'Added to preferences!' : 'Noted your dislike'}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-netflix-dark rotate-45"></div>
        </div>
      )}
    </div>
  );

  const renderHeartButtons = () => (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={() => handleFeedback(true)}
        className={getButtonClass(true)}
        title="Love this!"
        disabled={feedback !== null}
      >
        <FaHeart />
      </button>
      
      <button
        onClick={() => handleFeedback(false)}
        className={getButtonClass(false)}
        title="Not for me"
        disabled={feedback !== null}
      >
        <FaHeartBroken />
      </button>
    </div>
  );

  return (
    <div className="relative">
      {type === 'heart' ? renderHeartButtons() : renderStandardButtons()}
    </div>
  );
};

export default FeedbackButton;
