import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaInfoCircle, FaExchangeAlt, FaExclamationTriangle, FaCog } from 'react-icons/fa';
import dynamic from 'next/dynamic';

// Dynamically import HLS.js to avoid SSR issues
const Hls = dynamic(() => import('hls.js'), { ssr: false });

function EnhancedStreamingPlayer({ streamingUrls, title, type = 'movie', episode = null }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [currentSource, setCurrentSource] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [directVideoUrl, setDirectVideoUrl] = useState(null);
  const [useHLS, setUseHLS] = useState(false);
  const [hlsReady, setHlsReady] = useState(false);
  const [manifestUrl, setManifestUrl] = useState(null);

  // Available streaming sources with enhanced proxy support
  const sources = [
    { 
      name: 'VidSrc (Direct)', 
      url: streamingUrls?.vidsrc,
      type: 'enhanced',
      priority: 1
    },
    { 
      name: 'VidSrc (Embed)', 
      url: streamingUrls?.vidsrc,
      type: 'iframe',
      priority: 2
    },
    { 
      name: 'AutoEmbed', 
      url: streamingUrls?.autoembed,
      type: 'iframe', 
      priority: 3
    },
  ].filter(source => source.url);

  // Extract manifest URL from vidsrc page
  const extractManifestUrl = async (vidsrcUrl) => {
    try {
      console.log('[EnhancedPlayer] Extracting manifest from:', vidsrcUrl);
      
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(vidsrcUrl)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`Proxy failed: ${response.status}`);
      }
      
      const html = await response.text();
      
      // Look for various video URL patterns
      const patterns = [
        /(https?:\/\/[^\s"']+\.m3u8[^\s"']*)/gi,
        /(https?:\/\/[^\s"']+\/playlist\.m3u8[^\s"']*)/gi,
        /(https?:\/\/[^\s"']+\/index\.m3u8[^\s"']*)/gi,
        /src["']\s*:\s*["']([^"']+\.m3u8[^"']*)/gi,
        /file["']\s*:\s*["']([^"']+\.m3u8[^"']*)/gi,
      ];
      
      for (const pattern of patterns) {
        const matches = html.match(pattern);
        if (matches && matches.length > 0) {
          let manifestUrl = matches[0];
          
          // Clean up the URL if it was captured with extra characters
          if (manifestUrl.includes('src') || manifestUrl.includes('file')) {
            const urlMatch = manifestUrl.match(/https?:\/\/[^\s"']+\.m3u8[^\s"']*/);
            if (urlMatch) {
              manifestUrl = urlMatch[0];
            }
          }
          
          console.log('[EnhancedPlayer] Found manifest URL:', manifestUrl);
          return manifestUrl;
        }
      }
      
      // Also look for MP4 direct links as fallback
      const mp4Patterns = [
        /(https?:\/\/[^\s"']+\.mp4[^\s"']*)/gi,
        /src["']\s*:\s*["']([^"']+\.mp4[^"']*)/gi,
      ];
      
      for (const pattern of mp4Patterns) {
        const matches = html.match(pattern);
        if (matches && matches.length > 0) {
          let videoUrl = matches[0];
          if (videoUrl.includes('src')) {
            const urlMatch = videoUrl.match(/https?:\/\/[^\s"']+\.mp4[^\s"']*/);
            if (urlMatch) {
              videoUrl = urlMatch[0];
            }
          }
          console.log('[EnhancedPlayer] Found MP4 URL:', videoUrl);
          return videoUrl;
        }
      }
      
      return null;
    } catch (error) {
      console.error('[EnhancedPlayer] Error extracting manifest:', error);
      return null;
    }
  };

  // Initialize HLS player
  const initializeHLS = (url) => {
    if (!videoRef.current) return;

    // Clean up existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const video = videoRef.current;
    
    // Import HLS dynamically
    import('hls.js').then((HlsModule) => {
      const HlsJs = HlsModule.default;
      
      if (HlsJs.isSupported()) {
        const hls = new HlsJs({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
          maxBufferLength: 30,
          maxMaxBufferLength: 600,
          maxBufferSize: 60 * 1000 * 1000,
          maxBufferHole: 0.5,
          highBufferWatchdogPeriod: 2,
          nudgeOffset: 0.1,
          nudgeMaxRetry: 3,
          maxFragLookUpTolerance: 0.25,
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 10,
          enableSoftwareAES: true,
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 1,
          manifestLoadingRetryDelay: 1000,
          fragLoadingTimeOut: 20000,
          fragLoadingMaxRetry: 3,
          fragLoadingRetryDelay: 1000,
          xhrSetup: function(xhr, url) {
            // Use our proxy for all requests
            const originalUrl = url;
            const proxiedUrl = `/api/proxy?url=${encodeURIComponent(originalUrl)}`;
            xhr.open('GET', proxiedUrl, true);
          }
        });

        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(HlsJs.Events.MANIFEST_PARSED, () => {
          console.log('[EnhancedPlayer] HLS manifest parsed successfully');
          setHlsReady(true);
          setIsLoading(false);
          setHasError(false);
        });

        hls.on(HlsJs.Events.ERROR, (event, data) => {
          console.error('[EnhancedPlayer] HLS error:', data);
          
          if (data.fatal) {
            switch (data.type) {
              case HlsJs.ErrorTypes.NETWORK_ERROR:
                console.log('[EnhancedPlayer] Network error, trying to recover...');
                hls.startLoad();
                break;
              case HlsJs.ErrorTypes.MEDIA_ERROR:
                console.log('[EnhancedPlayer] Media error, trying to recover...');
                hls.recoverMediaError();
                break;
              default:
                console.log('[EnhancedPlayer] Fatal error, switching source...');
                setHasError(true);
                handleSourceError();
                break;
            }
          }
        });

        hlsRef.current = hls;
        setUseHLS(true);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = url;
        setUseHLS(false);
        setIsLoading(false);
      } else {
        console.log('[EnhancedPlayer] HLS not supported, falling back to iframe');
        setHasError(true);
        handleSourceError();
      }
    }).catch((error) => {
      console.error('[EnhancedPlayer] Failed to load HLS.js:', error);
      setHasError(true);
      handleSourceError();
    });
  };

  // Handle source errors and auto-switching
  const handleSourceError = () => {
    if (retryCount < sources.length - 1) {
      setTimeout(() => {
        console.log('[EnhancedPlayer] Auto-switching to next source');
        setRetryCount(prev => prev + 1);
        setCurrentSource((prev) => (prev + 1) % sources.length);
      }, 2000);
    } else {
      console.log('[EnhancedPlayer] All sources failed');
      setHasError(true);
    }
  };

  // Load source effect
  useEffect(() => {
    const loadSource = async () => {
      const currentSourceData = sources[currentSource];
      if (!currentSourceData?.url) return;

      setIsLoading(true);
      setHasError(false);
      setHlsReady(false);
      setDirectVideoUrl(null);
      setManifestUrl(null);

      if (currentSourceData.type === 'enhanced') {
        // Try to extract direct manifest/video URL
        const extractedUrl = await extractManifestUrl(currentSourceData.url);
        
        if (extractedUrl) {
          setManifestUrl(extractedUrl);
          
          // Proxy the URL through our API
          const proxiedUrl = `/api/proxy?url=${encodeURIComponent(extractedUrl)}`;
          
          if (extractedUrl.includes('.m3u8')) {
            // It's an HLS manifest
            initializeHLS(proxiedUrl);
          } else {
            // It's a direct video file
            setDirectVideoUrl(proxiedUrl);
            setUseHLS(false);
            setIsLoading(false);
          }
        } else {
          // Fallback to iframe
          setDirectVideoUrl(currentSourceData.url);
          setUseHLS(false);
          setIsLoading(false);
        }
      } else {
        // Regular iframe source
        setDirectVideoUrl(currentSourceData.url);
        setUseHLS(false);
        setIsLoading(false);
      }
    };

    loadSource();
  }, [currentSource]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  const handleSourceChange = (index) => {
    setCurrentSource(index);
    setRetryCount(0);
  };

  const handleVideoError = () => {
    console.error('[EnhancedPlayer] Video error');
    setHasError(true);
    handleSourceError();
  };

  const handleVideoLoaded = () => {
    setIsLoading(false);
    setHasError(false);
  };

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
                <span className="text-sm">Switched {retryCount} time{retryCount > 1 ? 's' : ''}</span>
              </div>
            )}
            {useHLS && hlsReady && (
              <div className="flex items-center space-x-2 text-green-500">
                <FaCog className="text-sm" />
                <span className="text-sm">HLS Stream</span>
              </div>
            )}
          </div>
          
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
              <p className="text-netflix-text-gray">
                {useHLS ? 'Loading HLS stream...' : 'Loading player...'}
              </p>
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
                {retryCount >= sources.length - 1 
                  ? 'All sources failed. Please try again later.' 
                  : 'Switching to next source...'
                }
              </p>
              {retryCount < sources.length - 1 && (
                <button 
                  onClick={() => handleSourceChange((currentSource + 1) % sources.length)}
                  className="bg-netflix-red text-netflix-white px-4 py-2 rounded hover:bg-netflix-red-dark transition-colors"
                >
                  Try Next Source
                </button>
              )}
            </div>
          </div>
        )}

        {/* Video Player */}
        {(useHLS || manifestUrl) && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full"
            controls
            autoPlay
            onError={handleVideoError}
            onLoadedData={handleVideoLoaded}
            onCanPlay={handleVideoLoaded}
            crossOrigin="anonymous"
          >
            Your browser does not support the video tag.
          </video>
        )}

        {/* Iframe Player */}
        {!useHLS && !manifestUrl && directVideoUrl && (
          <iframe
            src={directVideoUrl}
            className="absolute inset-0 w-full h-full border-0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            onLoad={handleVideoLoaded}
            onError={handleVideoError}
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
                {useHLS && hlsReady ? 'Enhanced HLS Streaming:' : 'Notice:'}
              </span> 
              {useHLS && hlsReady 
                ? ' Direct HLS stream with CORS proxy for maximum compatibility.'
                : ' Streaming through embed player with automatic source switching.'
              }
            </div>
          </div>
          <div className="text-netflix-text-gray text-xs">
            {currentSource + 1} of {sources.length} sources
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnhancedStreamingPlayer;
