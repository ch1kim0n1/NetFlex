import Link from "next/link";
import { FaPlay, FaClock, FaTimes } from 'react-icons/fa';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { 
  getContinueWatchingUrl, 
  formatProgressText, 
  shouldShowContinueWatching,
  removeFromViewingHistory 
} from '../../src/utils/viewingHistory';

function RecentlyWatchedCard({ data, onRemove }) {
  const continueUrl = getContinueWatchingUrl(data);
  const progressText = formatProgressText(data);
  const showContinue = shouldShowContinueWatching(data);

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromViewingHistory(data.id, data.type);
    onRemove?.(data.id);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.getFullYear();
  };

  return (
    <div className="group cursor-pointer relative">
      <Link href={continueUrl || '#'}>
        <div className="relative">
          {/* Main Image Container */}
          <div className="relative aspect-[16/9] rounded-md overflow-hidden bg-netflix-gray">
            <div className="transition-all duration-300 ease-in-out group-hover:scale-110">
              <LazyLoadImage
                effect="blur"
                className="w-full h-full object-cover"
                src={data.image}
                alt={data.title?.english || data.title?.original || data.title}
              />
            </div>
            
            {/* Progress Bar */}
            {data.progressPercentage > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-netflix-gray/50">
                <div 
                  className="h-full bg-netflix-red transition-all duration-300"
                  style={{ width: `${data.progressPercentage}%` }}
                />
              </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-netflix-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FaPlay className="text-netflix-white text-lg" />
                    <span className="text-netflix-white text-sm font-medium">
                      {showContinue ? 'Continue Watching' : 'Watch Now'}
                    </span>
                  </div>
                  <button 
                    className="bg-netflix-red hover:bg-netflix-red-dark text-netflix-white px-3 py-1 rounded-full text-xs font-medium transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {showContinue ? 'Continue' : 'Watch'}
                  </button>
                </div>
                
                <h3 className="text-netflix-white font-bold text-sm line-clamp-2 mb-2">
                  {data.title?.english || data.title?.original || data.title}
                </h3>
                
                <div className="flex items-center space-x-3 text-xs text-netflix-text-gray mb-2">
                  {data.rating && (
                    <div className="flex items-center space-x-1">
                      <span>⭐</span>
                      <span>{data.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {data.releaseDate && (
                    <span>{formatDate(data.releaseDate)}</span>
                  )}
                  {data.type === 'movie' && data.runtime && (
                    <span>{Math.floor(data.runtime / 60)}h {data.runtime % 60}m</span>
                  )}
                  {data.type === 'show' && data.seasons && (
                    <span>{data.seasons} {data.seasons === 1 ? 'Season' : 'Seasons'}</span>
                  )}
                </div>

                {/* Progress Text */}
                <div className="flex items-center space-x-2 text-xs">
                  <FaClock className="text-netflix-text-gray" />
                  <span className="text-netflix-text-gray">{progressText}</span>
                </div>
              </div>
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-netflix-black/70 hover:bg-netflix-black/90 text-netflix-white p-1.5 rounded-full"
              title="Remove from recently watched"
            >
              <FaTimes className="text-xs" />
            </button>
          </div>

          {/* Card Footer - Always Visible */}
          <div className="mt-3 space-y-1">
            <h4 className="text-netflix-white font-medium text-sm truncate">
              {data.title?.english || data.title?.original || data.title}
            </h4>
            
            <div className="flex items-center justify-between">
              <span className="text-netflix-text-gray text-xs">
                {data.type === 'movie' ? 'Movie' : 'TV Show'}
              </span>
              <span className="text-netflix-red text-xs font-medium">
                {showContinue ? 'Continue' : 'Watched'}
              </span>
            </div>

            {/* Simplified Progress Text */}
            <div className="text-netflix-text-gray text-xs">
              {data.type === 'show' && (
                <span>
                  Last: S{data.currentSeason}E{data.currentEpisode}
                </span>
              )}
              {data.type === 'movie' && data.progressPercentage > 0 && (
                <span>
                  {Math.round(data.progressPercentage)}% watched
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default RecentlyWatchedCard; 