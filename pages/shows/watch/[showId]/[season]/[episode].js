import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import MainLayout from '../../../../../components/ui/MainLayout';
import StreamingPlayer from '../../../../../components/StreamingPlayer';
import SeasonEpisodeSelector from '../../../../../components/shows/SeasonEpisodeSelector';
import { getShowDetails, getShowEpisodes, getShowSeasons } from '../../../../../src/handlers/shows';
import { updateShowProgress } from '../../../../../src/utils/viewingHistory';
import { FaArrowLeft, FaPlay, FaPlus, FaThumbsUp, FaShare, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';

function WatchEpisode() {
  const router = useRouter();
  const { showId, season, episode } = router.query;
  const [show, setShow] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seasonsLoading, setSeasonsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!showId || !season || !episode) return;
      
      try {
        setLoading(true);
        
        // Fetch show details, episodes, and seasons in parallel
        const [showData, episodesData, seasonsData] = await Promise.all([
          getShowDetails(showId),
          getShowEpisodes(showId, parseInt(season)),
          getShowSeasons(showId)
        ]);
        
        if (showData) {
          setShow(showData);
        } else {
          setError('Show not found');
          return;
        }

        if (seasonsData) {
          setSeasons(seasonsData);
        }
        
        if (episodesData) {
          setEpisodes(episodesData);
          const episodeData = episodesData.find(ep => ep.episodeNumber === parseInt(episode));
          if (episodeData) {
            setCurrentEpisode(episodeData);
          } else {
            setError('Episode not found');
          }
        } else {
          setError('Episodes not found');
        }
      } catch (err) {
        setError('Failed to load content');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showId, season, episode]);

  // Track viewing progress when episode starts playing
  useEffect(() => {
    if (show && currentEpisode && showId && season && episode) {
      // Add to recently watched when user starts watching (5% progress)
      const trackInitialView = () => {
        updateShowProgress(show, parseInt(season), parseInt(episode), 5);
      };

      // Add a small delay to ensure the episode has actually started
      const timer = setTimeout(trackInitialView, 10000); // 10 seconds after page load

      return () => clearTimeout(timer);
    }
  }, [show, currentEpisode, showId, season, episode]);

  const navigateToEpisode = (newEpisode) => {
    router.push(`/shows/watch/${showId}/${season}/${newEpisode}`);
  };

  const getCurrentEpisodeIndex = () => {
    return episodes.findIndex(ep => ep.episodeNumber === parseInt(episode));
  };

  const hasNextEpisode = () => {
    const currentIndex = getCurrentEpisodeIndex();
    return currentIndex < episodes.length - 1;
  };

  const hasPreviousEpisode = () => {
    const currentIndex = getCurrentEpisodeIndex();
    return currentIndex > 0;
  };

  const handleSeasonChange = async (newSeason) => {
    if (newSeason === parseInt(season)) return;
    
    try {
      setSeasonsLoading(true);
      const newEpisodesData = await getShowEpisodes(showId, newSeason);
      setEpisodes(newEpisodesData);
    } catch (err) {
      console.error('Error fetching episodes for new season:', err);
    } finally {
      setSeasonsLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Head>
          <title>Loading Episode - NetFlex</title>
        </Head>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-netflix-red mx-auto mb-4"></div>
            <p className="text-netflix-text-gray">Loading episode...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !show || !currentEpisode) {
    return (
      <MainLayout>
        <Head>
          <title>Episode Not Found - NetFlex</title>
        </Head>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-netflix-white mb-4">Episode Not Found</h1>
            <p className="text-netflix-text-gray mb-8">{error || 'The episode you are looking for could not be found.'}</p>
            <Link href="/shows">
              <button className="bg-netflix-red text-netflix-white px-6 py-3 rounded-md hover:bg-netflix-red-dark transition-colors">
                Browse Shows
              </button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Head>
        <title>{show.title.english} - S{season}E{episode} - Watch on NetFlex</title>
        <meta name="description" content={`Watch ${show.title.english} Season ${season} Episode ${episode} on NetFlex. ${currentEpisode.overview}`} />
        <meta property="og:title" content={`${show.title.english} - S${season}E${episode} - Watch on NetFlex`} />
        <meta property="og:description" content={currentEpisode.overview} />
        <meta property="og:image" content={currentEpisode.image || show.bannerImage} />
        <meta property="og:type" content="video.episode" />
      </Head>

      <div className="min-h-screen bg-netflix-black">
        {/* Header Controls */}
        <div className="sticky top-0 bg-netflix-black/80 backdrop-blur-md z-20 border-b border-netflix-gray/30">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => router.back()}
                  className="flex items-center space-x-2 text-netflix-text-gray hover:text-netflix-white transition-colors"
                >
                  <FaArrowLeft />
                  <span>Back</span>
                </button>
                <div className="h-6 w-px bg-netflix-gray/50"></div>
                <h1 className="text-xl font-semibold text-netflix-white">
                  {show.title.english} - S{season}E{episode}
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-netflix-text-gray hover:text-netflix-white transition-colors">
                  <FaPlus />
                  <span>My List</span>
                </button>
                <button className="flex items-center space-x-2 text-netflix-text-gray hover:text-netflix-white transition-colors">
                  <FaThumbsUp />
                  <span>Like</span>
                </button>
                <button className="flex items-center space-x-2 text-netflix-text-gray hover:text-netflix-white transition-colors">
                  <FaShare />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Streaming Player */}
            <div className="lg:col-span-2">
              <StreamingPlayer 
                streamingUrls={currentEpisode.streaming}
                title={show.title.english}
                type="tv"
                episode={currentEpisode}
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

            {/* Episode Information and Season/Episode Selector */}
            <div className="lg:col-span-1 space-y-6">
              {/* Season/Episode Selector */}
              <SeasonEpisodeSelector
                showId={showId}
                currentSeason={season}
                currentEpisode={episode}
                seasons={seasons}
                episodes={episodes}
                onSeasonChange={handleSeasonChange}
                loading={seasonsLoading}
              />
              
              {/* Current Episode Details */}
              <div className="bg-netflix-dark rounded-lg p-6">
                <div className="mb-6">
                  <img 
                    src={currentEpisode.image || show.image} 
                    alt={`${show.title.english} - S${season}E${episode}`}
                    className="w-full rounded-lg mb-4"
                  />
                  <h2 className="text-2xl font-bold text-netflix-white mb-2">
                    {currentEpisode.title}
                  </h2>
                  <p className="text-netflix-text-gray mb-4">
                    {show.title.english} - Season {season}, Episode {episode}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-netflix-white font-semibold mb-2">Episode Overview</h3>
                    <p className="text-netflix-text-gray text-sm leading-relaxed">
                      {currentEpisode.overview || 'No overview available for this episode.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-netflix-white font-semibold mb-1">Rating</h4>
                      <p className="text-netflix-text-gray text-sm">
                        ⭐ {currentEpisode.rating?.toFixed(1) || 'N/A'}/10
                      </p>
                    </div>
                    <div>
                      <h4 className="text-netflix-white font-semibold mb-1">Runtime</h4>
                      <p className="text-netflix-text-gray text-sm">
                        {currentEpisode.runtime || 'N/A'} minutes
                      </p>
                    </div>
                    <div>
                      <h4 className="text-netflix-white font-semibold mb-1">Air Date</h4>
                      <p className="text-netflix-text-gray text-sm">
                        {currentEpisode.airDate ? new Date(currentEpisode.airDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-netflix-white font-semibold mb-1">Season</h4>
                      <p className="text-netflix-text-gray text-sm">
                        {currentEpisode.seasonNumber}
                      </p>
                    </div>
                  </div>

                  {show.genres && show.genres.length > 0 && (
                    <div>
                      <h4 className="text-netflix-white font-semibold mb-2">Genres</h4>
                      <div className="flex flex-wrap gap-2">
                        {show.genres.map((genre) => (
                          <span 
                            key={genre.id} 
                            className="bg-netflix-gray/30 text-netflix-text-gray px-2 py-1 rounded-full text-xs"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {show.networks && show.networks.length > 0 && (
                    <div>
                      <h4 className="text-netflix-white font-semibold mb-2">Networks</h4>
                      <div className="space-y-1">
                        {show.networks.slice(0, 3).map((network) => (
                          <p key={network.id} className="text-netflix-text-gray text-sm">
                            {network.name}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {show.imdbId && (
                    <div>
                      <h4 className="text-netflix-white font-semibold mb-2">External Links</h4>
                      <a 
                        href={`https://www.imdb.com/title/${show.imdbId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-netflix-red hover:text-netflix-white transition-colors text-sm"
                      >
                        View on IMDB
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default WatchEpisode; 