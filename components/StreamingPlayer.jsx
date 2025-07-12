import React, { useState, useEffect, useMemo } from 'react';
import { FaPlay, FaInfoCircle, FaExchangeAlt, FaExclamationTriangle } from 'react-icons/fa';

function StreamingPlayer({ streamingUrls, title, type = 'movie', episode = null }) {
  const [currentSource, setCurrentSource] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [directVideoUrl, setDirectVideoUrl] = useState(null);
  const [useProxy, setUseProxy] = useState(false);

  // Available streaming sources
  const sources = useMemo(() => [
    { 
      name: 'VidSrc', 
      url: streamingUrls?.vidsrc,
      type: 'iframe',
      priority: 1
    },
    { 
      name: 'AutoEmbed', 
      url: streamingUrls?.autoembed,
      type: 'iframe', 
      priority: 2
    },
    { 
      name: 'VidSrc (Proxy)', 
      url: streamingUrls?.vidsrc,
      type: 'proxy',
      priority: 3
    },
  ].filter(source => source.url), [streamingUrls]);

  const [iframeUrl, setIframeUrl] = useState('');

  // Attempt to extract direct video URL from vidsrc
  const extractDirectVideoUrl = async (vidsrcUrl) => {
    try {
      console.log('[StreamingPlayer] Attempting to extract direct video URL from:', vidsrcUrl);
      
      // Use our proxy to fetch the vidsrc page
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(vidsrcUrl)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`Proxy failed: ${response.status}`);
      }
      
      const html = await response.text();
      
      // Look for m3u8 URLs in the HTML
      const m3u8Regex = /(https?:\/\/[^\s"']+\.m3u8[^\s"']*)/gi;
      const matches = html.match(m3u8Regex);
      
      if (matches && matches.length > 0) {
        // Return the first m3u8 URL found, proxied through our API
        const directUrl = matches[0];
        const proxiedUrl = `/api/proxy?url=${encodeURIComponent(directUrl)}`;
        console.log('[StreamingPlayer] Found direct video URL:', directUrl);
        return proxiedUrl;
      }
      
      return null;
    } catch (error) {
      console.error('[StreamingPlayer] Error extracting direct video URL:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadSource = async () => {
      const currentSourceData = sources[currentSource];
      if (!currentSourceData?.url) {
        setIframeUrl('');
        setDirectVideoUrl(null);
        return;
      }

      setIsLoading(true);
      setHasError(false);

      if (currentSourceData.type === 'proxy') {
        // Try to extract direct video URL
        const videoUrl = await extractDirectVideoUrl(currentSourceData.url);
        if (videoUrl) {
          setDirectVideoUrl(videoUrl);
          setIframeUrl('');
          setUseProxy(true);
        } else {
          // Fallback to iframe if direct extraction fails
          setIframeUrl(currentSourceData.url);
          setDirectVideoUrl(null);
          setUseProxy(false);
        }
      } else {
        // Regular iframe source
        setIframeUrl(currentSourceData.url);
        setDirectVideoUrl(null);
        setUseProxy(false);
      }
    };

    loadSource();
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
    setRetryCount(0);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setRetryCount(0);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
    
    // Auto-retry with next source after a delay
    if (retryCount < sources.length - 1) {
      setTimeout(() => {
        console.log('[StreamingPlayer] Auto-switching to next source due to error');
        setRetryCount(prev => prev + 1);
        handleSourceChange((currentSource + 1) % sources.length);
      }, 2000);
    }
  };

  const handleVideoError = () => {
    console.error('[StreamingPlayer] Video playback error');
    setHasError(true);
    
    // Auto-retry with next source
    if (retryCount < sources.length - 1) {
      setTimeout(() => {
        console.log('[StreamingPlayer] Auto-switching to next source due to video error');
        setRetryCount(prev => prev + 1);
        handleSourceChange((currentSource + 1) % sources.length);
      }, 2000);
    }
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
            {retryCount > 0 && (
              <div className="flex items-center space-x-2 text-yellow-500">
                <FaExclamationTriangle className="text-sm" />
                <span className="text-sm">Auto-switched {retryCount} time{retryCount > 1 ? 's' : ''}</span>
              </div>
            )}
            {useProxy && (
              <div className="flex items-center space-x-2 text-green-500">
                <FaExchangeAlt className="text-sm" />
                <span className="text-sm">Direct Stream</span>
              </div>
            )}
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
                <option key={index} value={index}>
                  {source.name}
                  {source.type === 'proxy' && ' (Enhanced)'}
                </option>
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
        {directVideoUrl ? (
          // Direct video player for proxied streams
          <video
            src={directVideoUrl}
            className="absolute inset-0 w-full h-full"
            controls
            autoPlay
            onError={handleVideoError}
            onLoadStart={() => setIsLoading(true)}
            onLoadedData={() => setIsLoading(false)}
            onCanPlay={() => setIsLoading(false)}
            crossOrigin="anonymous"
          >
            Your browser does not support the video tag.
          </video>
        ) : iframeUrl && (
          // Iframe player for regular embed sources
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
              <span className="font-medium">
                {useProxy ? 'Enhanced Streaming:' : 'Settings Notice:'}
              </span> 
              {useProxy 
                ? ' Direct video stream with full browser controls and better compatibility.'
                : ' Audio, subtitles, and quality settings are managed directly by the video provider. Use the player controls within the video to adjust these settings.'
              }
            </div>
          </div>
          {sources.length > 1 && (
            <div className="text-netflix-text-gray text-xs">
              {currentSource + 1} of {sources.length} sources
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default StreamingPlayer;