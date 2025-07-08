import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import MainLayout from '../../../../../components/ui/MainLayout';
import AnimeStreamingPlayer from '../../../../../components/anime/AnimeStreamingPlayer';
import SeasonEpisodeSelector from '../../../../../components/shows/SeasonEpisodeSelector';
import { getAnimeDetails, getAnimeEpisodes, getAnimeSeasons } from '../../../../../src/handlers/anime';
import { updateShowProgress } from '../../../../../src/utils/viewingHistory';
import { FaArrowLeft, FaPlay, FaPlus, FaThumbsUp, FaShare, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';

function WatchAnimeEpisode() {
  const router = useRouter();
  const { animeId, season, episode } = router.query;
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seasonsLoading, setSeasonsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnimeData = async () => {
      if (!animeId || !season || !episode) return;
      
      try {
        setLoading(true);
        const [animeData, episodesData, seasonsData] = await Promise.all([
          getAnimeDetails(animeId),
          getAnimeEpisodes(animeId, parseInt(season)),
          getAnimeSeasons(animeId)
        ]);

        if (animeData) {
          setAnime({ ...animeData, type: 'anime' });
          setEpisodes(episodesData);
          setSeasons(seasonsData);

          // Find current episode
          const currentEp = episodesData.find(ep => ep.episodeNumber === parseInt(episode));
          if (currentEp) {
            setCurrentEpisode(currentEp);
          } else {
            setError('Episode not found');
          }
        } else {
          setError('Anime not found');
        }
      } catch (err) {
        setError('Failed to load anime');
        console.error('Error fetching anime:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeData();
  }, [animeId, season, episode]);

  // Track viewing progress when episode starts playing
  useEffect(() => {
    if (anime && currentEpisode && animeId && season && episode) {
      // Add to recently watched when user starts watching (5% progress)
      const trackInitialView = () => {
        updateShowProgress(anime, parseInt(season), parseInt(episode), 5);
      };

      // Add a small delay to ensure the episode has actually started
      const timer = setTimeout(trackInitialView, 10000); // 10 seconds after page load

      return () => clearTimeout(timer);
    }
  }, [anime, currentEpisode, animeId, season, episode]);

  const navigateToEpisode = (episodeNumber) => {
    router.push(`/anime/watch/${animeId}/${season}/${episodeNumber}`);
  };

  const hasNextEpisode = () => {
    return parseInt(episode) < episodes.length;
  };

  const hasPreviousEpisode = () => {
    return parseInt(episode) > 1;
  };

  const handleSeasonChange = async (newSeason) => {
    if (newSeason === parseInt(season)) return;
    
    setSeasonsLoading(true);
    try {
      const newEpisodes = await getAnimeEpisodes(animeId, newSeason);
      if (newEpisodes.length > 0) {
        router.push(`/anime/watch/${animeId}/${newSeason}/1`);
      }
    } catch (error) {
      console.error('Error switching season:', error);
    } finally {
      setSeasonsLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-netflix-white text-xl">Loading episode...</div>
        </div>
      </MainLayout>
    );
  }

  if (error || !anime || !currentEpisode) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-netflix-white text-xl mb-4">{error || 'Episode not found'}</div>
            <Link href="/anime">
              <button className="bg-netflix-red text-netflix-white px-6 py-2 rounded hover:bg-netflix-red-dark transition-colors">
                Back to Anime
              </button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <Head>
        <title>
          {anime.title?.english || anime.title?.original} - S{season}E{episode} - NetFlex
        </title>
        <meta 
          name="description" 
          content={`Watch ${anime.title?.english || anime.title?.original} Season ${season} Episode ${episode} on NetFlex`} 
        />
      </Head>
      
      <MainLayout>
        <div className="bg-netflix-black min-h-screen">
          {/* Header */}
          <div className="pt-8 pb-4 px-8 border-b border-netflix-gray/20">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => router.push(`/anime/info/${anime.id}`)}
                    className="flex items-center space-x-2 text-netflix-text-gray hover:text-netflix-white transition-colors group"
                  >
                    <FaArrowLeft className="group-hover:translate-x-[-2px] transition-transform" />
                    <span>Back to Info</span>
                  </button>
                </div>
                
                <div className="text-center">
                  <h1 className="text-netflix-white text-xl font-semibold">
                    {anime.title?.english || anime.title?.original}
                  </h1>
                  <p className="text-netflix-text-gray text-sm">
                    Season {season} • Episode {episode}
                    {currentEpisode.title && ` • ${currentEpisode.title}`}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button className="text-netflix-text-gray hover:text-netflix-white transition-colors">
                    <FaPlus className="text-xl" />
                  </button>
                  <button className="text-netflix-text-gray hover:text-netflix-white transition-colors">
                    <FaThumbsUp className="text-xl" />
                  </button>
                  <button className="text-netflix-text-gray hover:text-netflix-white transition-colors">
                    <FaShare className="text-xl" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Streaming Player */}
              <div className="lg:col-span-2">
                <AnimeStreamingPlayer 
                  streamingUrls={currentEpisode.streaming}
                  animeTitle={anime.title?.english || anime.title?.original}
                  episodeNumber={parseInt(episode)}
                  season={parseInt(season)}
                />
                
                {/* Episode Navigation */}
                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={() => hasPreviousEpisode() && navigateToEpisode(parseInt(episode) - 1)}
                    disabled={!hasPreviousEpisode()}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                      hasPreviousEpisode() 
                        ? 'bg-netflix-gray text-netflix-white hover:bg-netflix-gray/80' 
                        : 'bg-netflix-gray/30 text-netflix-text-gray cursor-not-allowed'
                    }`}
                  >
                    <FaChevronLeft />
                    <span>Previous Episode</span>
                  </button>
                  
                  <div className="text-netflix-text-gray text-sm">
                    Episode {episode} of {episodes.length}
                  </div>
                  
                  <button
                    onClick={() => hasNextEpisode() && navigateToEpisode(parseInt(episode) + 1)}
                    disabled={!hasNextEpisode()}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                      hasNextEpisode() 
                        ? 'bg-netflix-gray text-netflix-white hover:bg-netflix-gray/80' 
                        : 'bg-netflix-gray/30 text-netflix-text-gray cursor-not-allowed'
                    }`}
                  >
                    <span>Next Episode</span>
                    <FaChevronRight />
                  </button>
                </div>
              </div>

              {/* Anime Information & Episode Selector */}
              <div className="lg:col-span-1">
                <div className="bg-netflix-dark rounded-lg p-6 space-y-6">
                  {/* Anime Poster */}
                  <div className="text-center">
                    <img 
                      src={anime.image} 
                      alt={anime.title?.english || anime.title?.original}
                      className="w-48 mx-auto rounded-lg shadow-lg"
                    />
                  </div>

                  {/* Episode Info */}
                  <div>
                    <h3 className="text-netflix-white font-semibold text-lg mb-2">
                      {currentEpisode.title || `Episode ${episode}`}
                    </h3>
                    {currentEpisode.overview && (
                      <p className="text-netflix-text-gray text-sm leading-relaxed">
                        {currentEpisode.overview}
                      </p>
                    )}
                    {currentEpisode.runtime && (
                      <p className="text-netflix-text-gray text-sm mt-2">
                        Runtime: {currentEpisode.runtime} minutes
                      </p>
                    )}
                  </div>

                  {/* Season/Episode Selector */}
                  {seasons.length > 0 && (
                    <SeasonEpisodeSelector
                      seasons={seasons}
                      episodes={episodes}
                      currentSeason={parseInt(season)}
                      currentEpisode={parseInt(episode)}
                      animeId={animeId}
                      onSeasonChange={handleSeasonChange}
                      onEpisodeSelect={navigateToEpisode}
                      loading={seasonsLoading}
                      basePath="/anime/watch"
                    />
                  )}

                  {/* Anime Details */}
                  <div className="pt-4 border-t border-netflix-gray/20">
                    <h4 className="text-netflix-white font-semibold mb-3">Anime Details</h4>
                    <div className="space-y-2 text-sm">
                      {anime.releaseDate && (
                        <div className="flex justify-between">
                          <span className="text-netflix-text-gray">Year:</span>
                          <span className="text-netflix-white">
                            {new Date(anime.releaseDate).getFullYear()}
                          </span>
                        </div>
                      )}
                      {anime.rating && (
                        <div className="flex justify-between">
                          <span className="text-netflix-text-gray">Rating:</span>
                          <span className="text-netflix-white">{anime.rating.toFixed(1)}/10</span>
                        </div>
                      )}
                      {anime.status && (
                        <div className="flex justify-between">
                          <span className="text-netflix-text-gray">Status:</span>
                          <span className="text-netflix-white">{anime.status}</span>
                        </div>
                      )}
                      {anime.seasons && (
                        <div className="flex justify-between">
                          <span className="text-netflix-text-gray">Seasons:</span>
                          <span className="text-netflix-white">{anime.seasons}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Genres */}
                    {anime.genres && anime.genres.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-netflix-text-gray text-sm mb-2">Genres:</h5>
                        <div className="flex flex-wrap gap-1">
                          {anime.genres.map((genre) => (
                            <span 
                              key={genre.id}
                              className="bg-netflix-gray text-netflix-white px-2 py-1 rounded text-xs"
                            >
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
}

export default WatchAnimeEpisode; 