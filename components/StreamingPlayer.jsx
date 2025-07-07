import React, { useState } from 'react';
import { FaPlay, FaExpand, FaVolumeUp, FaClosedCaptioning, FaCog, FaTimes, FaCheck } from 'react-icons/fa';

function StreamingPlayer({ streamingUrls, title, type = 'movie', episode = null }) {
  const [currentSource, setCurrentSource] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [audioLanguage, setAudioLanguage] = useState('en');
  const [subtitleLanguage, setSubtitleLanguage] = useState('off');
  const [videoQuality, setVideoQuality] = useState('auto');
  const [isDubbed, setIsDubbed] = useState(false);

  // Available streaming sources
  const sources = [
    { name: 'VidSrc', url: streamingUrls?.vidsrc },
    { name: 'AutoEmbed', url: streamingUrls?.autoembed },
  ].filter(source => source.url);

  // Available audio languages
  const audioLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  ];

  // Available subtitle languages
  const subtitleLanguages = [
    { code: 'off', name: 'Off', flag: '🚫' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  ];

  // Available video qualities
  const videoQualities = [
    { code: 'auto', name: 'Auto', description: 'Best available' },
    { code: '1080p', name: '1080p HD', description: 'High Definition' },
    { code: '720p', name: '720p HD', description: 'HD Ready' },
    { code: '480p', name: '480p', description: 'Standard Definition' },
    { code: '360p', name: '360p', description: 'Lower Quality' },
  ];

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
            
            <button
              onClick={() => setShowSettings(true)}
              className="bg-netflix-gray hover:bg-netflix-gray/80 text-netflix-white p-2 rounded text-sm transition-colors"
              title="Player Settings"
            >
              <FaCog />
            </button>
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
        {currentSourceUrl && (
          <iframe
            src={currentSourceUrl}
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
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-netflix-text-gray text-sm">
              <FaVolumeUp className="text-netflix-red" />
              <span>
                Audio: {audioLanguages.find(lang => lang.code === audioLanguage)?.flag} {audioLanguages.find(lang => lang.code === audioLanguage)?.name}
                {isDubbed && ' (Dubbed)'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-netflix-text-gray text-sm">
              <FaClosedCaptioning className="text-netflix-red" />
              <span>
                Subtitles: {subtitleLanguages.find(lang => lang.code === subtitleLanguage)?.flag} {subtitleLanguages.find(lang => lang.code === subtitleLanguage)?.name}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-netflix-text-gray text-sm">
              <span>Quality: {videoQualities.find(q => q.code === videoQuality)?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-netflix-dark rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-netflix-white">Player Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-netflix-text-gray hover:text-netflix-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-6">
              {/* Audio Language */}
              <div>
                <h4 className="text-netflix-white font-medium mb-3">Audio Language</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {audioLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setAudioLanguage(lang.code)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        audioLanguage === lang.code 
                          ? 'bg-netflix-red text-netflix-white' 
                          : 'bg-netflix-gray/20 text-netflix-text-gray hover:bg-netflix-gray/30'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                      {audioLanguage === lang.code && <FaCheck />}
                    </button>
                  ))}
                </div>
                
                {/* Sub vs Dub Toggle */}
                <div className="mt-3 flex items-center space-x-3">
                  <span className="text-netflix-text-gray text-sm">Prefer:</span>
                  <button
                    onClick={() => setIsDubbed(false)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      !isDubbed 
                        ? 'bg-netflix-red text-netflix-white' 
                        : 'bg-netflix-gray/20 text-netflix-text-gray hover:bg-netflix-gray/30'
                    }`}
                  >
                    Original + Subtitles
                  </button>
                  <button
                    onClick={() => setIsDubbed(true)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      isDubbed 
                        ? 'bg-netflix-red text-netflix-white' 
                        : 'bg-netflix-gray/20 text-netflix-text-gray hover:bg-netflix-gray/30'
                    }`}
                  >
                    Dubbed
                  </button>
                </div>
              </div>

              {/* Subtitle Language */}
              <div>
                <h4 className="text-netflix-white font-medium mb-3">Subtitles</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {subtitleLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSubtitleLanguage(lang.code)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        subtitleLanguage === lang.code 
                          ? 'bg-netflix-red text-netflix-white' 
                          : 'bg-netflix-gray/20 text-netflix-text-gray hover:bg-netflix-gray/30'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                      {subtitleLanguage === lang.code && <FaCheck />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Quality */}
              <div>
                <h4 className="text-netflix-white font-medium mb-3">Video Quality</h4>
                <div className="space-y-2">
                  {videoQualities.map((quality) => (
                    <button
                      key={quality.code}
                      onClick={() => setVideoQuality(quality.code)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        videoQuality === quality.code 
                          ? 'bg-netflix-red text-netflix-white' 
                          : 'bg-netflix-gray/20 text-netflix-text-gray hover:bg-netflix-gray/30'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{quality.name}</div>
                        <div className="text-sm opacity-70">{quality.description}</div>
                      </div>
                      {videoQuality === quality.code && <FaCheck />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={() => setShowSettings(false)}
                className="w-full bg-netflix-red hover:bg-netflix-red-dark text-netflix-white py-3 rounded-lg transition-colors font-medium"
              >
                Apply Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StreamingPlayer; 