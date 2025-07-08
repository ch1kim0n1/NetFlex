import { useState, useEffect } from 'react';
import { FaPlay, FaExchangeAlt, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

function AnimeStreamingPlayer({ streamingUrls, animeTitle, episodeNumber, season, animeId }) {
  const [currentSource, setCurrentSource] = useState('primary');
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const [playerError, setPlayerError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Available streaming sources for anime with multiple 2embed formats
  const sources = [
    {
      id: 'vidsrc_anime',
      name: 'VidSrc Anime',
      description: 'Anime-specific player (Best quality)',
      url: streamingUrls?.vidsrc_anime
    },
    {
      id: 'embed2',
      name: '2Embed Anime',
      description: 'Alternative anime source',
      url: streamingUrls?.embed2
    },
    {
      id: 'embed2_alt1',
      name: '2Embed Alt 1',
      description: '2Embed alternative format',
      url: animeId && season && episodeNumber 
        ? `https://www.2embed.cc/embedanime/${animeId}?s=${season}&e=${episodeNumber}`
        : null
    },
    {
      id: 'embed2_alt2',
      name: '2Embed Alt 2', 
      description: '2Embed direct format',
      url: animeId && season && episodeNumber
        ? `https://www.2embed.cc/embed/tv?id=${animeId}&s=${season}&e=${episodeNumber}`
        : null
    },
    {
      id: 'vidsrc_tv',
      name: 'VidSrc TV',
      description: 'General TV source (Fallback)',
      url: streamingUrls?.vidsrc_tv
    }
  ].filter(source => source.url);

  // Get current streaming URL
  const getCurrentStreamingUrl = () => {
    const selectedSource = sources.find(s => s.id === currentSource);
    return selectedSource?.url || streamingUrls?.primary;
  };

  // Set default source
  useEffect(() => {
    if (sources.length > 0) {
      setCurrentSource(sources[0].id);
      setPlayerError(false);
      setRetryCount(0);
    }
  }, [streamingUrls]);

  // Handle iframe load errors
  const handleIframeError = () => {
    setPlayerError(true);
    
    // Auto-retry with next source
    if (retryCount < sources.length - 1) {
      setTimeout(() => {
        const currentIndex = sources.findIndex(s => s.id === currentSource);
        const nextSource = sources[currentIndex + 1];
        if (nextSource) {
          setCurrentSource(nextSource.id);
          setRetryCount(prev => prev + 1);
          setPlayerError(false);
        }
      }, 2000);
    }
  };

  const currentStreamingUrl = getCurrentStreamingUrl();

  if (!currentStreamingUrl) {
    return (
      <div className="w-full aspect-video bg-netflix-dark rounded-lg flex items-center justify-center">
        <div className="text-center text-netflix-text-gray">
          <FaPlay className="text-4xl mb-4 mx-auto opacity-50" />
          <p>No streaming sources available for this anime episode.</p>
          <p className="text-sm mt-2">This might be due to regional restrictions or licensing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Streaming Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-netflix-dark rounded-lg">
        <div className="flex items-center space-x-4">
          <h3 className="text-netflix-white font-semibold">
            {animeTitle} - Episode {episodeNumber}
          </h3>
          {playerError && (
            <div className="flex items-center space-x-2 text-yellow-500">
              <FaExclamationTriangle className="text-sm" />
              <span className="text-sm">Auto-switching source...</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Source Selector */}
          <div className="relative">
            <button
              onClick={() => setShowSourceSelector(!showSourceSelector)}
              className="flex items-center space-x-2 px-3 py-1 bg-netflix-gray text-netflix-white rounded-md hover:bg-netflix-gray/80 transition-colors text-sm"
            >
              <FaExchangeAlt />
              <span>Source ({sources.length})</span>
            </button>

            {showSourceSelector && (
              <div className="absolute right-0 top-full mt-2 bg-netflix-dark border border-netflix-gray rounded-lg shadow-lg z-10 min-w-64">
                <div className="p-2">
                  <h4 className="text-netflix-white font-semibold mb-2 px-2">Choose Source:</h4>
                  {sources.map((source) => (
                    <button
                      key={source.id}
                      onClick={() => {
                        setCurrentSource(source.id);
                        setShowSourceSelector(false);
                        setPlayerError(false);
                        setRetryCount(0);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        currentSource === source.id
                          ? 'bg-netflix-red text-netflix-white'
                          : 'text-netflix-text-gray hover:bg-netflix-gray/50'
                      }`}
                    >
                      <div className="font-medium">{source.name}</div>
                      <div className="text-xs opacity-75">{source.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="w-full aspect-video bg-netflix-black rounded-lg overflow-hidden">
        {playerError ? (
          <div className="w-full h-full flex items-center justify-center bg-netflix-dark">
            <div className="text-center text-netflix-text-gray">
              <FaExclamationTriangle className="text-4xl mb-4 mx-auto text-yellow-500" />
              <p>Error loading this source</p>
              <p className="text-sm mt-2">Trying next available source...</p>
            </div>
          </div>
        ) : (
          <iframe
            src={currentStreamingUrl}
            className="w-full h-full"
            allowFullScreen
            frameBorder="0"
            title={`${animeTitle} Episode ${episodeNumber}`}
            onError={handleIframeError}
            onLoad={() => setPlayerError(false)}
          />
        )}
      </div>

      {/* Source Info */}
      <div className="bg-netflix-dark rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <FaInfoCircle className="text-netflix-red" />
          <div className="text-netflix-text-gray text-sm">
            <div className="mb-1">
              <span className="font-medium">Currently using:</span> <span className="text-netflix-white">
                {sources.find(s => s.id === currentSource)?.name || 'Default Source'}
              </span>
              {retryCount > 0 && (
                <span className="text-yellow-500 ml-2">(Auto-switched {retryCount} time{retryCount > 1 ? 's' : ''})</span>
              )}
            </div>
            <div className="mb-1">
              <span className="font-medium">Available sources:</span> <span className="text-netflix-white">
                {sources.length} sources detected
              </span>
            </div>
            <div>
              <span className="font-medium">Settings Notice:</span> Audio language (sub/dub), subtitles, and quality settings are managed directly by the video provider. Use the player controls within the video to adjust these settings.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnimeStreamingPlayer; 