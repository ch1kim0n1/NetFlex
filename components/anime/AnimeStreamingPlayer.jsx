import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress, FaCog, FaExternalLinkAlt, FaChevronDown, FaTimes, FaExchangeAlt, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

function AnimeStreamingPlayer({ streamingUrls, animeTitle, episodeNumber, season, animeId }) {
  const [currentSource, setCurrentSource] = useState('primary');
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const [showQualitySelector, setShowQualitySelector] = useState(false);
  const [playerError, setPlayerError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentQuality, setCurrentQuality] = useState('auto');
  const [consumetData, setConsumetData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [availableQualities, setAvailableQualities] = useState([]);
  const [subtitles, setSubtitles] = useState([]);
  const videoRef = useRef(null);

  // Extract Consumet streaming data
  useEffect(() => {
    if (streamingUrls?.consumet_data) {
      setConsumetData(streamingUrls.consumet_data);
    } else if (streamingUrls?.primary?.bestSource) {
      setConsumetData(streamingUrls.primary);
    }
  }, [streamingUrls]);

  // Available streaming sources for anime with working URLs
  const sources = [
    // Consumet API sources (direct video links) - prioritize these
    ...(streamingUrls?.consumet_data?.providers?.gogoanime ? [{
      id: 'consumet_gogoanime',
      name: 'Gogoanime (Direct)',
      description: 'Direct video via Consumet API - Gogoanime',
      type: 'direct',
      data: streamingUrls.consumet_data.providers.gogoanime
    }] : []),
    ...(streamingUrls?.consumet_data?.providers?.zoro ? [{
      id: 'consumet_zoro', 
      name: 'Zoro (Direct)',
      description: 'Direct video via Consumet API - Zoro',
      type: 'direct',
      data: streamingUrls.consumet_data.providers.zoro
    }] : []),
    ...(streamingUrls?.consumet_data?.providers?.animepahe ? [{
      id: 'consumet_animepahe',
      name: 'AnimePahe (Direct)',
      description: 'Direct video via Consumet API - AnimePahe',
      type: 'direct',
      data: streamingUrls.consumet_data.providers.animepahe
    }] : []),
    ...(streamingUrls?.consumet_data?.providers?.nineanime ? [{
      id: 'consumet_9anime',
      name: '9anime (Direct)',
      description: 'Direct video via Consumet API - 9anime',
      type: 'direct',
      data: streamingUrls.consumet_data.providers.nineanime
    }] : []),
    
    // Legacy Consumet format support
    ...(streamingUrls?.consumet_gogoanime?.sources ? [{
      id: 'legacy_gogoanime',
      name: 'Gogoanime (Legacy)',
      description: 'Legacy Consumet format',
      type: 'direct',
      data: streamingUrls.consumet_gogoanime
    }] : []),
    ...(streamingUrls?.consumet_zoro?.sources ? [{
      id: 'legacy_zoro',
      name: 'Zoro (Legacy)', 
      description: 'Legacy Consumet format',
      type: 'direct',
      data: streamingUrls.consumet_zoro
    }] : []),
    
    // Working embed sources
    {
      id: 'vidsrc_anime',
      name: 'VidSrc Anime',
      description: 'Reliable anime streaming with good quality',
      type: 'iframe',
      url: streamingUrls?.vidsrc_anime,
      quality: 'high'
    },
    {
      id: 'animefire',
      name: 'AnimeFire',
      description: 'Fast anime streaming source',
      type: 'iframe',
      url: streamingUrls?.animefire,
      quality: 'medium'
    },
    {
      id: 'kawaiifu',
      name: 'KawaiiDesu',
      description: 'Clean anime streaming interface',
      type: 'iframe',
      url: streamingUrls?.kawaiifu,
      quality: 'medium'
    },
    
    // Watch page links (open in new tab)
    {
      id: 'hianime_watch',
      name: 'HiAnime',
      description: 'Premium anime streaming - Watch Page',
      type: 'external',
      url: streamingUrls?.hianime_watch,
      quality: 'premium'
    },
    {
      id: 'gogoanime_watch',
      name: 'GogoAnime',
      description: 'Popular anime streaming - Watch Page',
      type: 'external',
      url: streamingUrls?.gogoanime_watch,
      quality: 'high'
    },
    {
      id: 'nineanime_watch',
      name: '9anime',
      description: 'Well-known anime platform - Watch Page',
      type: 'external',
      url: streamingUrls?.nineanime_watch,
      quality: 'high'
    },
    {
      id: 'animepahe_watch',
      name: 'AnimePahe',
      description: 'High-quality compressed anime - Watch Page',
      type: 'external',
      url: streamingUrls?.animepahe_watch,
      quality: 'high'
    }
  ].filter(source => 
    // Only include sources that have valid URLs or data
    source.url || (source.data && (source.data.sources || source.data.info))
  );

  // Get available qualities from Consumet data
  const getAvailableQualities = () => {
    const currentSourceData = sources.find(s => s.id === currentSource);
    if (currentSourceData?.type === 'direct') {
      let qualities = [];
      
      if (currentSourceData.data.sources) {
        // Legacy format
        qualities = currentSourceData.data.sources.map(source => ({
          quality: source.quality || 'Unknown',
          url: source.url,
          isM3U8: source.url?.includes('.m3u8')
        }));
      } else if (currentSourceData.data.info?.episodes) {
        // New format - need to get episode sources
        const episode = currentSourceData.data.info.episodes.find(ep => ep.number === episodeNumber);
        if (episode && streamingUrls?.consumet_data?.allSources) {
          qualities = streamingUrls.consumet_data.allSources
            .filter(source => source.provider === currentSourceData.data.provider)
            .map(source => ({
              quality: source.quality || 'Unknown',
              url: source.url,
              isM3U8: source.url?.includes('.m3u8')
            }));
        }
      }
      
      return qualities;
    }
    return [];
  };

  // Get current streaming URL/data
  const getCurrentStreamingData = () => {
    const selectedSource = sources.find(s => s.id === currentSource);
    
    if (selectedSource?.type === 'direct') {
      const qualities = getAvailableQualities();
      const selectedQualitySource = qualities.find(q => q.quality === currentQuality) || qualities[0];
      
      // Get subtitles for this source
      let subtitles = [];
      if (selectedSource.data.subtitles) {
        subtitles = selectedSource.data.subtitles;
      } else if (streamingUrls?.consumet_data?.subtitles) {
        subtitles = streamingUrls.consumet_data.subtitles.filter(sub => 
          sub.provider === selectedSource.data.provider
        );
      }
      
      return {
        type: 'direct',
        url: selectedQualitySource?.url,
        isM3U8: selectedQualitySource?.isM3U8,
        subtitles: subtitles,
        qualities: qualities
      };
    }
    
    return {
      type: 'iframe',
      url: selectedSource?.url || streamingUrls?.primary
    };
  };

  // Set default source and quality
  useEffect(() => {
    if (sources.length > 0) {
      // Prefer Consumet direct sources
      const directSource = sources.find(s => s.type === 'direct');
      setCurrentSource(directSource?.id || sources[0].id);
      setPlayerError(false);
      setRetryCount(0);
      
      // Set default quality
      if (directSource) {
        const qualities = getAvailableQualities();
        if (qualities.length > 0) {
          const bestQuality = qualities.find(q => q.quality === '1080p') || 
                             qualities.find(q => q.quality === '720p') || 
                             qualities[0];
          if (bestQuality) {
            setCurrentQuality(bestQuality.quality);
          }
        }
      }
    }
  }, [streamingUrls, sources]);

  // Handle video load errors
  const handleVideoError = () => {
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

  const handleSourceChange = (source) => {
    setCurrentSource(source);
    setIsPlaying(false);
    setShowSourceSelector(false);
    
    if (source.type === 'external') {
      // Open external watch pages in new tab
      window.open(source.url, '_blank', 'noopener,noreferrer');
      return;
    }
    
    if (source.type === 'direct' && source.data) {
      // Handle Consumet API direct sources
      if (source.data.sources && source.data.sources.length > 0) {
        const videoSource = source.data.sources.find(s => s.quality === 'auto' || s.quality === 'default') || source.data.sources[0];
        setCurrentVideoUrl(videoSource.url);
        setAvailableQualities(source.data.sources);
        setCurrentQuality(videoSource.quality || 'auto');
        setSubtitles(source.data.subtitles || []);
        setIsPlaying(true);
      }
    } else if (source.type === 'iframe' && source.url) {
      // Handle iframe sources
      setCurrentVideoUrl(source.url);
      setIsPlaying(true);
    }
  };

  const currentStreamingData = getCurrentStreamingData();

  if (!currentStreamingData.url) {
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
          {isLoading && (
            <div className="flex items-center space-x-2 text-blue-500">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-sm">Loading...</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Quality Selector for direct sources */}
          {currentStreamingData.type === 'direct' && currentStreamingData.qualities?.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setShowQualitySelector(!showQualitySelector)}
                className="flex items-center space-x-2 px-3 py-1 bg-netflix-gray text-netflix-white rounded-md hover:bg-netflix-gray/80 transition-colors text-sm"
              >
                <FaCog />
                <span>{currentQuality}</span>
              </button>

              {showQualitySelector && (
                <div className="absolute right-0 top-full mt-2 bg-netflix-dark border border-netflix-gray rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    <h4 className="text-netflix-white font-semibold mb-2 px-2">Quality:</h4>
                    {currentStreamingData.qualities.map((quality) => (
                      <button
                        key={quality.quality}
                        onClick={() => {
                          setCurrentQuality(quality.quality);
                          setShowQualitySelector(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          currentQuality === quality.quality
                            ? 'bg-netflix-red text-netflix-white'
                            : 'text-netflix-text-gray hover:bg-netflix-gray/50'
                        }`}
                      >
                        {quality.quality} {quality.isM3U8 && '(HLS)'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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
                      onClick={() => handleSourceChange(source)}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                        currentSource?.id === source.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex flex-col items-start">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{source.name}</span>
                            {source.quality === 'premium' && (
                              <span className="px-2 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold">
                                PREMIUM
                              </span>
                            )}
                            {source.quality === 'high' && (
                              <span className="px-2 py-1 text-xs bg-green-500 text-white rounded-full font-semibold">
                                HD+
                              </span>
                            )}
                            {source.quality === 'medium' && (
                              <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full font-semibold">
                                HD
                              </span>
                            )}
                            {source.type === 'direct' && (
                              <span className="px-2 py-1 text-xs bg-orange-500 text-white rounded-full font-semibold">
                                DIRECT
                              </span>
                            )}
                            {source.type === 'external' && (
                              <span className="px-2 py-1 text-xs bg-gray-500 text-white rounded-full font-semibold">
                                WATCH PAGE
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-600">{source.description}</span>
                        </div>
                      </div>
                      {source.type === 'external' && (
                        <FaExternalLinkAlt className="h-4 w-4 text-gray-400" />
                      )}
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
        ) : currentStreamingData.type === 'direct' ? (
          <video
            ref={videoRef}
            src={currentStreamingData.url}
            className="w-full h-full"
            controls
            autoPlay
            onError={handleVideoError}
            onLoadStart={() => setIsLoading(true)}
            onLoadedData={() => setIsLoading(false)}
          >
            {/* Add subtitles from Consumet */}
            {currentStreamingData.subtitles?.map((subtitle, index) => (
              <track
                key={index}
                kind="subtitles"
                src={subtitle.url}
                srcLang={subtitle.lang || 'en'}
                label={subtitle.lang || `Subtitle ${index + 1}`}
                default={index === 0}
              />
            ))}
            Your browser does not support the video tag.
          </video>
        ) : (
          <iframe
            src={currentStreamingData.url}
            className="w-full h-full"
            allowFullScreen
            frameBorder="0"
            title={`${animeTitle} Episode ${episodeNumber}`}
            onError={handleVideoError}
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
              {currentStreamingData.type === 'direct' && (
                <span className="bg-green-600 text-white text-xs px-1 rounded ml-2">DIRECT VIDEO</span>
              )}
              {retryCount > 0 && (
                <span className="text-yellow-500 ml-2">(Auto-switched {retryCount} time{retryCount > 1 ? 's' : ''})</span>
              )}
            </div>
            <div className="mb-1">
              <span className="font-medium">Available sources:</span> <span className="text-netflix-white">
                {sources.length} sources detected ({sources.filter(s => s.type === 'direct').length} direct, {sources.filter(s => s.type === 'iframe').length} iframe)
              </span>
            </div>
            {currentStreamingData.type === 'direct' && currentStreamingData.qualities?.length > 0 && (
              <div className="mb-1">
                <span className="font-medium">Available qualities:</span> <span className="text-netflix-white">
                  {currentStreamingData.qualities.map(q => q.quality).join(', ')}
                </span>
              </div>
            )}
            {currentStreamingData.subtitles?.length > 0 && (
              <div className="mb-1">
                <span className="font-medium">Subtitles:</span> <span className="text-netflix-white">
                  {currentStreamingData.subtitles.length} available
                </span>
              </div>
            )}
            <div>
              <span className="font-medium">Powered by:</span> <span className="text-netflix-white">
                Consumet API {currentStreamingData.type === 'direct' ? '(Direct streaming)' : '+ Fallback providers'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnimeStreamingPlayer; 