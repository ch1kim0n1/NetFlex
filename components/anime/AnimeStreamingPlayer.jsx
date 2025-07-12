import React, { useState, useEffect } from 'react';
import { FaPlay, FaExternalLinkAlt, FaExchangeAlt, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

function AnimeStreamingPlayer({ streamingUrls, animeTitle, episodeNumber, season, animeId }) {
  const [currentSource, setCurrentSource] = useState(null);
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const [playerError, setPlayerError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Available streaming sources with proper priority
  const sources = [
    // Primary working iframe sources
    {
      id: 'vidsrc_anime',
      name: 'VidSrc Anime',
      description: 'Reliable anime streaming with good quality',
      type: 'iframe',
      url: streamingUrls?.vidsrc_anime,
      quality: 'high',
      priority: 1
    },
    {
      id: 'vidstreaming',
      name: 'VidStreaming',
      description: 'High quality anime streaming',
      type: 'iframe',
      url: streamingUrls?.vidstreaming,
      quality: 'high',
      priority: 2
    },
    {
      id: 'douvideo',
      name: 'DouVideo',
      description: 'Fast anime streaming source',
      type: 'iframe',
      url: streamingUrls?.douvideo,
      quality: 'high',
      priority: 3
    },
    {
      id: 'vidcloud',
      name: 'VidCloud',
      description: 'Reliable streaming with good quality',
      type: 'iframe',
      url: streamingUrls?.vidcloud,
      quality: 'high',
      priority: 4
    },
    {
      id: 'animefire',
      name: 'AnimeFire',
      description: 'Alternative anime streaming source',
      type: 'iframe',
      url: streamingUrls?.animefire,
      quality: 'medium',
      priority: 5
    },
    {
      id: 'kawaiifu',
      name: 'KawaiiDesu',
      description: 'Clean anime streaming interface',
      type: 'iframe',
      url: streamingUrls?.kawaiifu,
      quality: 'medium',
      priority: 6
    },
    {
      id: 'vidsrc',
      name: 'VidSrc',
      description: 'General purpose streaming',
      type: 'iframe',
      url: streamingUrls?.vidsrc,
      quality: 'medium',
      priority: 7
    },
    // External watch page sources
    {
      id: 'hianime_watch',
      name: 'HiAnime',
      description: 'Premium anime streaming - Watch Page',
      type: 'external',
      url: streamingUrls?.hianime_watch,
      quality: 'premium',
      priority: 8
    },
    {
      id: 'gogoanime_watch',
      name: 'GogoAnime',
      description: 'Popular anime streaming - Watch Page',
      type: 'external',
      url: streamingUrls?.gogoanime_watch,
      quality: 'high',
      priority: 9
    },
    {
      id: 'nineanime_watch',
      name: '9anime',
      description: 'Well-known anime platform - Watch Page',
      type: 'external',
      url: streamingUrls?.nineanime_watch,
      quality: 'high',
      priority: 10
    },
    {
      id: 'animepahe_watch',
      name: 'AnimePahe',
      description: 'High-quality compressed anime - Watch Page',
      type: 'external',
      url: streamingUrls?.animepahe_watch,
      quality: 'high',
      priority: 11
    }
  ].filter(source => source.url && source.url !== 'null').sort((a, b) => a.priority - b.priority);

  // Set default source on load
  useEffect(() => {
    if (sources.length > 0 && !currentSource) {
      setCurrentSource(sources[0]);
      setPlayerError(false);
    }
  }, [sources, currentSource]);

  // Handle source selection
  const handleSourceChange = (source) => {
    setCurrentSource(source);
    setShowSourceSelector(false);
    setPlayerError(false);
    setIsLoading(true);
    
    if (source.type === 'external') {
      // Open external watch pages in new tab
      window.open(source.url, '_blank', 'noopener,noreferrer');
      return;
    }
  };

  // Handle iframe load events
  const handleIframeLoad = () => {
    setIsLoading(false);
    setPlayerError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setPlayerError(true);
    
    // Auto-switch to next source if available
    const currentIndex = sources.findIndex(s => s.id === currentSource?.id);
    if (currentIndex < sources.length - 1) {
      const nextSource = sources[currentIndex + 1];
      if (nextSource && nextSource.type === 'iframe') {
        setTimeout(() => {
          handleSourceChange(nextSource);
        }, 2000);
      }
    }
  };

  // Show no sources message if no working sources
  if (sources.length === 0) {
    return (
      <div className="w-full aspect-video bg-netflix-dark rounded-lg flex items-center justify-center">
        <div className="text-center text-netflix-text-gray">
          <FaExclamationTriangle className="text-4xl mb-4 mx-auto text-yellow-500" />
          <h3 className="text-lg font-semibold mb-2">No Streaming Sources Available</h3>
          <p className="text-sm">This anime episode is not available for streaming.</p>
          <p className="text-sm mt-2">This might be due to regional restrictions or licensing issues.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Player Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-netflix-dark rounded-lg">
        <div className="flex items-center space-x-4">
          <h3 className="text-netflix-white font-semibold">
            {animeTitle} - Episode {episodeNumber}
          </h3>
          {playerError && (
            <div className="flex items-center space-x-2 text-yellow-500">
              <FaExclamationTriangle className="text-sm" />
              <span className="text-sm">Source failed, trying next...</span>
            </div>
          )}
          {isLoading && (
            <div className="flex items-center space-x-2 text-blue-500">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-sm">Loading...</span>
            </div>
          )}
        </div>

        {/* Source Selector */}
        <div className="relative">
          <button
            onClick={() => setShowSourceSelector(!showSourceSelector)}
            className="flex items-center space-x-2 px-4 py-2 bg-netflix-red text-netflix-white rounded-md hover:bg-netflix-red-dark transition-colors"
          >
            <FaExchangeAlt />
            <span>Source: {currentSource?.name || 'Select'}</span>
          </button>

          {showSourceSelector && (
            <div className="absolute right-0 top-full mt-2 bg-netflix-dark border border-netflix-gray rounded-lg shadow-lg z-10 min-w-80">
              <div className="p-4">
                <h4 className="text-netflix-white font-semibold mb-3">Choose Source:</h4>
                <div className="space-y-2">
                  {sources.map((source) => (
                    <button
                      key={source.id}
                      onClick={() => handleSourceChange(source)}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                        currentSource?.id === source.id
                          ? 'border-netflix-red bg-netflix-red/10 text-netflix-white'
                          : 'border-netflix-gray hover:border-netflix-gray/50 hover:bg-netflix-gray/20 text-netflix-text-gray'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{source.name}</span>
                            {source.quality === 'premium' && (
                              <span className="px-2 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold">
                                PREMIUM
                              </span>
                            )}
                            {source.quality === 'high' && (
                              <span className="px-2 py-1 text-xs bg-green-500 text-white rounded-full font-semibold">
                                HD
                              </span>
                            )}
                            {source.quality === 'medium' && (
                              <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full font-semibold">
                                SD
                              </span>
                            )}
                            {source.type === 'external' && (
                              <span className="px-2 py-1 text-xs bg-gray-500 text-white rounded-full font-semibold">
                                EXTERNAL
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-netflix-text-gray mt-1">{source.description}</span>
                        </div>
                        {source.type === 'external' && (
                          <FaExternalLinkAlt className="h-4 w-4 text-netflix-text-gray" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Player */}
      <div className="w-full aspect-video bg-netflix-black rounded-lg overflow-hidden relative">
        {playerError && (
          <div className="absolute inset-0 bg-netflix-black/80 flex items-center justify-center z-10">
            <div className="text-center text-netflix-text-gray">
              <FaExclamationTriangle className="text-4xl mb-4 mx-auto text-red-500" />
              <h3 className="text-lg font-semibold mb-2">Playback Error</h3>
              <p className="text-sm mb-4">Unable to load this source. Trying next available source...</p>
              <div className="flex justify-center space-x-2">
                <button 
                  onClick={() => {
                    const nextIndex = (sources.findIndex(s => s.id === currentSource?.id) + 1) % sources.length;
                    handleSourceChange(sources[nextIndex]);
                  }}
                  className="bg-netflix-red text-netflix-white px-4 py-2 rounded hover:bg-netflix-red-dark transition-colors"
                >
                  Try Next Source
                </button>
                <button 
                  onClick={() => setPlayerError(false)}
                  className="bg-netflix-gray text-netflix-white px-4 py-2 rounded hover:bg-netflix-gray/80 transition-colors"
                >
                  Retry Current
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-netflix-black/80 flex items-center justify-center z-10">
            <div className="text-center text-netflix-text-gray">
              <div className="animate-spin w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-lg font-semibold">Loading Player...</p>
              <p className="text-sm mt-2">Setting up {currentSource?.name}...</p>
            </div>
          </div>
        )}

        {currentSource && currentSource.type === 'iframe' && (
          <iframe
            key={currentSource.id}
            src={currentSource.url}
            className="w-full h-full border-0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={`${animeTitle} Episode ${episodeNumber} - ${currentSource.name}`}
          />
        )}
      </div>

      {/* Player Info */}
      <div className="bg-netflix-dark rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FaInfoCircle className="text-netflix-red mt-1 flex-shrink-0" />
          <div className="text-netflix-text-gray text-sm space-y-1">
            <div>
              <span className="font-medium">Currently using:</span> 
              <span className="text-netflix-white ml-1">{currentSource?.name || 'None'}</span>
              <span className="text-netflix-text-gray ml-2">({currentSource?.quality || 'Unknown'} quality)</span>
            </div>
            <div>
              <span className="font-medium">Available sources:</span> 
              <span className="text-netflix-white ml-1">{sources.length} total</span>
              <span className="text-netflix-text-gray ml-2">
                ({sources.filter(s => s.type === 'iframe').length} iframe, {sources.filter(s => s.type === 'external').length} external)
              </span>
            </div>
            <div className="text-xs text-netflix-text-gray pt-2">
              <strong>Note:</strong> If a source doesn't work, try switching to another one. External sources will open in a new tab.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnimeStreamingPlayer; 