import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaChevronDown, FaPlay } from 'react-icons/fa';

function SeasonEpisodeSelector({ 
  showId, 
  currentSeason, 
  currentEpisode, 
  seasons, 
  episodes, 
  onSeasonChange,
  loading = false 
}) {
  const router = useRouter();
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);
  const [isEpisodeDropdownOpen, setIsEpisodeDropdownOpen] = useState(false);

  const handleSeasonSelect = (seasonNumber) => {
    setIsSeasonDropdownOpen(false);
    onSeasonChange(seasonNumber);
    // Navigate to first episode of the new season
    router.push(`/shows/watch/${showId}/${seasonNumber}/1`);
  };

  const handleEpisodeSelect = (episodeNumber) => {
    setIsEpisodeDropdownOpen(false);
    router.push(`/shows/watch/${showId}/${currentSeason}/${episodeNumber}`);
  };

  const currentSeasonData = seasons.find(s => s.seasonNumber === parseInt(currentSeason));
  const currentEpisodeData = episodes.find(e => e.episodeNumber === parseInt(currentEpisode));

  return (
    <div className="bg-netflix-dark rounded-lg p-4 mb-6">
      <h3 className="text-netflix-white font-semibold mb-4">Episodes</h3>
      
      {/* Season and Episode Selectors */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Season Selector */}
        <div className="relative">
          <button
            onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
            disabled={loading}
            className="w-full bg-netflix-gray text-netflix-white px-4 py-2 rounded-md flex items-center justify-between hover:bg-netflix-gray/80 transition-colors disabled:opacity-50"
          >
            <span>Season {currentSeason}</span>
            <FaChevronDown className={`transition-transform ${isSeasonDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isSeasonDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-netflix-dark border border-netflix-gray rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
              {seasons.map((season) => (
                <button
                  key={season.seasonNumber}
                  onClick={() => handleSeasonSelect(season.seasonNumber)}
                  className="w-full text-left px-4 py-2 text-netflix-white hover:bg-netflix-gray transition-colors"
                >
                  <div className="font-medium">Season {season.seasonNumber}</div>
                  {season.name !== `Season ${season.seasonNumber}` && (
                    <div className="text-sm text-netflix-text-gray">{season.name}</div>
                  )}
                  <div className="text-xs text-netflix-text-gray">
                    {season.episodeCount} episodes
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Episode Selector */}
        <div className="relative">
          <button
            onClick={() => setIsEpisodeDropdownOpen(!isEpisodeDropdownOpen)}
            disabled={loading || episodes.length === 0}
            className="w-full bg-netflix-gray text-netflix-white px-4 py-2 rounded-md flex items-center justify-between hover:bg-netflix-gray/80 transition-colors disabled:opacity-50"
          >
            <span>Episode {currentEpisode}</span>
            <FaChevronDown className={`transition-transform ${isEpisodeDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isEpisodeDropdownOpen && episodes.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-netflix-dark border border-netflix-gray rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
              {episodes.map((episode) => (
                <button
                  key={episode.episodeNumber}
                  onClick={() => handleEpisodeSelect(episode.episodeNumber)}
                  className="w-full text-left px-4 py-2 text-netflix-white hover:bg-netflix-gray transition-colors"
                >
                  <div className="font-medium">
                    {episode.episodeNumber}. {episode.title}
                  </div>
                  {episode.runtime && (
                    <div className="text-xs text-netflix-text-gray">
                      {episode.runtime} min
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Episode List */}
      {episodes.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {episodes.map((episode) => (
            <div
              key={episode.id}
              className={`p-3 rounded-md cursor-pointer transition-colors ${
                episode.episodeNumber === parseInt(currentEpisode)
                  ? 'bg-netflix-red/20 border border-netflix-red/50'
                  : 'bg-netflix-gray/20 hover:bg-netflix-gray/30'
              }`}
              onClick={() => handleEpisodeSelect(episode.episodeNumber)}
            >
              <div className="flex items-start space-x-3">
                {episode.image && (
                  <img
                    src={episode.image}
                    alt={episode.title}
                    className="w-20 h-12 object-cover rounded flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-netflix-white font-medium text-sm">
                      {episode.episodeNumber}. {episode.title}
                    </h4>
                    {episode.episodeNumber === parseInt(currentEpisode) && (
                      <FaPlay className="text-netflix-red text-xs" />
                    )}
                  </div>
                  {episode.overview && (
                    <p className="text-netflix-text-gray text-xs line-clamp-2">
                      {episode.overview}
                    </p>
                  )}
                  <div className="flex items-center space-x-3 mt-2 text-xs text-netflix-text-gray">
                    {episode.runtime && <span>{episode.runtime}m</span>}
                    {episode.airDate && (
                      <span>{new Date(episode.airDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-netflix-red mx-auto mb-2"></div>
          <p className="text-netflix-text-gray text-sm">Loading episodes...</p>
        </div>
      )}
    </div>
  );
}

export default SeasonEpisodeSelector; 