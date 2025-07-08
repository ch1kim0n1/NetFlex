import React, { useState, useEffect, useMemo } from 'react';
import { FaPlay, FaInfoCircle } from 'react-icons/fa';

function StreamingPlayer({ streamingUrls, title, type = 'movie', episode = null }) {
  const [currentSource, setCurrentSource] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Available streaming sources
  const sources = useMemo(() => [
    { name: 'VidSrc', url: streamingUrls?.vidsrc },
    { name: 'AutoEmbed', url: streamingUrls?.autoembed },
  ].filter(source => source.url), [streamingUrls]);

  const [iframeUrl, setIframeUrl] = useState('');

  useEffect(() => {
    const baseUrl = sources[currentSource]?.url;
    if (!baseUrl) {
      setIframeUrl('');
      return;
    }

    setIframeUrl(baseUrl);
  }, [currentSource, sources]);

  if (!sources.length) {
    return (
      <div className="bg-netflix-dark rounded-lg p-8 text-center">
        <div className="text-netflix-text-gray mb-4">
          <FaPlay className="mx-auto text-4xl mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">Content Not Available</h3>
          <p>Streaming links are not available for this content.</p>
        </div>
      </div>
    );
  }

  const currentSourceUrl = sources[currentSource]?.url;

  const handleSourceChange = (index) => {
    setCurrentSource(index);
    setIsLoading(true);
    setHasError(false);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="bg-netflix-dark rounded-lg overflow-hidden">
      {/* Player Header */}
      <div className="bg-netflix-black/50 px-4 py-3 border-b border-netflix-gray/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-netflix-white font-semibold">
              {title}
              {episode && (
                <span className="text-netflix-text-gray ml-2">
                  S{episode.seasonNumber}E{episode.episodeNumber}
                </span>
              )}
            </h3>
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-2">
            <span className="text-netflix-text-gray text-sm">Source:</span>
            <select 
              value={currentSource} 
              onChange={(e) => handleSourceChange(parseInt(e.target.value))}
              className="bg-netflix-gray text-netflix-white px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-netflix-red"
            >
              {sources.map((source, index) => (
                <option key={index} value={index}>{source.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Player Container */}
      <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 bg-netflix-black flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-netflix-red mx-auto mb-4"></div>
              <p className="text-netflix-text-gray">Loading player...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {hasError && !isLoading && (
          <div className="absolute inset-0 bg-netflix-black flex items-center justify-center z-10">
            <div className="text-center">
              <div className="text-netflix-red text-4xl mb-4">⚠️</div>
              <h3 className="text-netflix-white font-semibold mb-2">Playback Error</h3>
              <p className="text-netflix-text-gray mb-4">
                There was an issue loading this content. Try switching to a different source.
              </p>
              <button 
                onClick={() => handleSourceChange((currentSource + 1) % sources.length)}
                className="bg-netflix-red text-netflix-white px-4 py-2 rounded hover:bg-netflix-red-dark transition-colors"
              >
                Try Next Source
              </button>
            </div>
          </div>
        )}

        {/* Streaming Player */}
        {iframeUrl && (
          <iframe
            src={iframeUrl}
            key={iframeUrl}
            className="absolute inset-0 w-full h-full border-0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={`${title} - ${sources[currentSource]?.name} Player`}
          />
        )}
      </div>

      {/* Player Footer */}
      <div className="bg-netflix-black/50 px-4 py-3 border-t border-netflix-gray/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FaInfoCircle className="text-netflix-red" />
            <div className="text-netflix-text-gray text-sm">
              <span className="font-medium">Settings Notice:</span> Audio, subtitles, and quality settings are managed directly by the video provider. Use the player controls within the video to adjust these settings.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default StreamingPlayer;