import { useState, useEffect } from 'react';
import { FaPlay, FaExchangeAlt, FaLanguage, FaClosedCaptioning } from 'react-icons/fa';

function AnimeStreamingPlayer({ streamingUrls, animeTitle, episodeNumber, season }) {
  const [currentSource, setCurrentSource] = useState('primary');
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const [isDub, setIsDub] = useState(false);
  const [skipIntro, setSkipIntro] = useState(true);

  // Available streaming sources for anime
  const sources = [
    {
      id: 'vidsrc_anime',
      name: 'VidSrc Anime',
      description: 'Anime-specific player (Best quality)',
      url: streamingUrls?.vidsrc_anime,
      supportsOptions: true
    },
    {
      id: 'embed2',
      name: '2Embed Anime',
      description: 'Alternative anime source',
      url: streamingUrls?.embed2,
      supportsOptions: false
    },
    {
      id: 'vidsrc_tv',
      name: 'VidSrc TV',
      description: 'General TV source (Fallback)',
      url: streamingUrls?.vidsrc_tv,
      supportsOptions: false
    }
  ].filter(source => source.url);

  // Get current streaming URL with options
  const getCurrentStreamingUrl = () => {
    const selectedSource = sources.find(s => s.id === currentSource);
    if (!selectedSource) return streamingUrls?.primary;

    let url = selectedSource.url;

    // Apply anime-specific options for VidSrc Anime
    if (selectedSource.id === 'vidsrc_anime' && url) {
      // VidSrc anime format: /anime/{anilist_id}/{episode}/{dub}/{skip}
      // Reconstruct URL with current options
      const urlParts = url.split('/');
      if (urlParts.length >= 6) {
        const baseUrl = urlParts.slice(0, -2).join('/'); // Remove last two parts (dub/skip)
        url = `${baseUrl}/${isDub ? '1' : '0'}${skipIntro ? '/1' : ''}`;
      }
    }

    return url;
  };

  // Set default source
  useEffect(() => {
    if (sources.length > 0) {
      setCurrentSource(sources[0].id);
    }
  }, [streamingUrls]);

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
        </div>

        <div className="flex items-center space-x-4">
          {/* Language Toggle */}
          {sources.some(s => s.supportsOptions) && (
            <button
              onClick={() => setIsDub(!isDub)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm transition-colors ${
                isDub 
                  ? 'bg-netflix-red text-netflix-white' 
                  : 'bg-netflix-gray text-netflix-text-gray hover:bg-netflix-gray/80'
              }`}
            >
              <FaLanguage />
              <span>{isDub ? 'DUB' : 'SUB'}</span>
            </button>
          )}

          {/* Skip Intro Toggle */}
          {sources.some(s => s.supportsOptions) && (
            <button
              onClick={() => setSkipIntro(!skipIntro)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm transition-colors ${
                skipIntro 
                  ? 'bg-netflix-red text-netflix-white' 
                  : 'bg-netflix-gray text-netflix-text-gray hover:bg-netflix-gray/80'
              }`}
            >
              <FaClosedCaptioning />
              <span>Skip Intro</span>
            </button>
          )}

          {/* Source Selector */}
          <div className="relative">
            <button
              onClick={() => setShowSourceSelector(!showSourceSelector)}
              className="flex items-center space-x-2 px-3 py-1 bg-netflix-gray text-netflix-white rounded-md hover:bg-netflix-gray/80 transition-colors text-sm"
            >
              <FaExchangeAlt />
              <span>Source</span>
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
        <iframe
          src={currentStreamingUrl}
          className="w-full h-full"
          allowFullScreen
          frameBorder="0"
          title={`${animeTitle} Episode ${episodeNumber}`}
        />
      </div>

      {/* Source Info */}
      <div className="text-sm text-netflix-text-gray text-center">
        Currently using: <span className="text-netflix-white font-medium">
          {sources.find(s => s.id === currentSource)?.name || 'Default Source'}
        </span>
        {sources.find(s => s.id === currentSource)?.supportsOptions && (
          <span className="ml-2">
            • {isDub ? 'Dubbed' : 'Subtitled'} 
            {skipIntro && ' • Skip Intro Enabled'}
          </span>
        )}
      </div>
    </div>
  );
}

export default AnimeStreamingPlayer; 