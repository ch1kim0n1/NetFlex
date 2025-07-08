import Head from "next/head";
import React from "react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import MainLayout from "../../../components/ui/MainLayout";
import ParticleBackground from "../../../components/ui/ParticleBackground";
import { getAnimeDetails, getAnimeEpisodes, getAnimeSeasons } from "../../../src/handlers/anime";
import { FaPlay, FaChevronDown, FaArrowLeft } from 'react-icons/fa';

function AnimeDetailsPage() {
  const router = useRouter();
  const { animeId } = router.query;
  const [animeData, setAnimeData] = useState(null);
  const [episodeData, setEpisodeData] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [loading, setLoading] = useState(true);
  const [episodesLoading, setEpisodesLoading] = useState(false);

  useEffect(() => {
    if (animeId) {
      const fetchAnimeData = async () => {
        try {
          const [anime, episodes, seasonsData] = await Promise.all([
            getAnimeDetails(animeId),
            getAnimeEpisodes(animeId, 1), // Get first season
            getAnimeSeasons(animeId)
          ]);
          setAnimeData(anime);
          setEpisodeData(episodes);
          setSeasons(seasonsData);
        } catch (error) {
          console.error('Error fetching anime details:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchAnimeData();
    }
  }, [animeId]);

  const handleSeasonChange = async (seasonNumber) => {
    if (seasonNumber === selectedSeason) return;
    
    try {
      setEpisodesLoading(true);
      setSelectedSeason(seasonNumber);
      const episodes = await getAnimeEpisodes(animeId, seasonNumber);
      setEpisodeData(episodes);
    } catch (error) {
      console.error('Error fetching episodes for season:', error);
    } finally {
      setEpisodesLoading(false);
    }
  };

  const handleWatchNow = () => {
    router.push(`/anime/watch/${animeId}/1/1`);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-netflix-white text-xl">Loading Anime Details...</div>
        </div>
      </MainLayout>
    );
  }

  if (!animeData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-netflix-white text-xl">Anime not found</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <Head>
        <title>{animeData.title.english || animeData.title.original} - NetFlex</title>
        <meta name="description" content={animeData.description} />
        <meta
          property="og:title"
          content={`Watch ${animeData.title.english || animeData.title.original} - NetFlex`}
        />
        <meta property="og:description" content={animeData.description} />
        <meta property="og:image" content={animeData.bannerImage} />
      </Head>

      <MainLayout useHead={false} banner={animeData.bannerImage} type="anime">
        <ParticleBackground />
        <div className="px-8 py-8 relative z-10">
          {/* Back Button */}
          <div className="max-w-6xl mx-auto mb-6">
            <button 
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-netflix-text-gray hover:text-netflix-white transition-colors group"
            >
              <FaArrowLeft className="group-hover:translate-x-[-2px] transition-transform" />
              <span>Back</span>
            </button>
          </div>
          
          {/* Anime Details */}
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Poster */}
              <div className="md:col-span-1">
                <img
                  src={animeData.image}
                  alt={animeData.title.english || animeData.title.original}
                  className="w-full rounded-lg shadow-lg"
                />
              </div>

              {/* Details */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h1 className="text-4xl font-bold text-netflix-white mb-4">
                    {animeData.title.english || animeData.title.original}
                  </h1>
                  
                  <div className="flex items-center space-x-4 text-netflix-text-gray mb-4">
                    {animeData.rating && (
                      <span className="flex items-center space-x-1">
                        <span className="text-netflix-red">★</span>
                        <span>{animeData.rating.toFixed(1)}</span>
                      </span>
                    )}
                    {animeData.releaseDate && (
                      <span>{new Date(animeData.releaseDate).getFullYear()}</span>
                    )}
                    {animeData.seasons && (
                      <span>{animeData.seasons} {animeData.seasons === 1 ? 'Season' : 'Seasons'}</span>
                    )}
                    {animeData.totalEpisodes && (
                      <span>{animeData.totalEpisodes} Episodes</span>
                    )}
                  </div>

                  <p className="text-netflix-text-gray text-lg leading-relaxed mb-6">
                    {animeData.description}
                  </p>

                  {animeData.genres && animeData.genres.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-netflix-white font-semibold mb-2">Genres</h3>
                      <div className="flex flex-wrap gap-2">
                        {animeData.genres.map((genre) => (
                          <span
                            key={genre.id}
                            className="px-3 py-1 bg-netflix-gray/30 text-netflix-text-gray rounded-full text-sm"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {animeData.networks && animeData.networks.length > 0 && (
                    <div>
                      <h3 className="text-netflix-white font-semibold mb-2">Networks</h3>
                      <div className="flex flex-wrap gap-2">
                        {animeData.networks.map((network) => (
                          <span
                            key={network.id}
                            className="px-3 py-1 bg-netflix-red/20 text-netflix-white rounded-full text-sm"
                          >
                            {network.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleWatchNow}
                  className="bg-netflix-red hover:bg-netflix-red-dark text-netflix-white font-semibold py-3 px-8 rounded-md transition-all duration-300 transform hover:scale-105"
                >
                  ▶ Watch Now
                </button>
              </div>
            </div>

            {/* Episodes */}
            {(episodeData.length > 0 || seasons.length > 0) && (
              <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-netflix-white">Episodes</h2>
                  
                  {/* Season Selector */}
                  {seasons.length > 1 && (
                    <div className="relative">
                      <select
                        value={selectedSeason}
                        onChange={(e) => handleSeasonChange(parseInt(e.target.value))}
                        disabled={episodesLoading}
                        className="bg-netflix-gray text-netflix-white px-4 py-2 rounded-md border border-netflix-gray/50 focus:outline-none focus:ring-2 focus:ring-netflix-red disabled:opacity-50"
                      >
                        {seasons.map((season) => (
                          <option key={season.seasonNumber} value={season.seasonNumber}>
                            Season {season.seasonNumber}
                            {season.name !== `Season ${season.seasonNumber}` && ` - ${season.name}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {episodesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-netflix-red mx-auto mb-2"></div>
                    <p className="text-netflix-text-gray">Loading episodes...</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {episodeData.map((episode) => (
                      <Link 
                        key={episode.id} 
                        href={`/anime/watch/${animeData.id}/${selectedSeason}/${episode.episodeNumber}`}
                      >
                        <div className="bg-netflix-gray/20 rounded-lg p-4 hover:bg-netflix-gray/30 transition-colors cursor-pointer group">
                          <div className="flex items-start space-x-4">
                            <div className="relative">
                              {episode.image && (
                                <img
                                  src={episode.image}
                                  alt={episode.title}
                                  className="w-32 h-18 object-cover rounded"
                                />
                              )}
                              {/* Play button overlay */}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                                <FaPlay className="text-netflix-white text-xl" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-netflix-white font-semibold group-hover:text-netflix-red transition-colors">
                                {episode.episodeNumber}. {episode.title}
                              </h3>
                              {episode.overview && (
                                <p className="text-netflix-text-gray text-sm mt-2 line-clamp-2">
                                  {episode.overview}
                                </p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-xs text-netflix-text-gray">
                                {episode.runtime && <span>{episode.runtime}m</span>}
                                {episode.airDate && (
                                  <span>{new Date(episode.airDate).toLocaleDateString()}</span>
                                )}
                                {episode.rating && (
                                  <span>⭐ {episode.rating.toFixed(1)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    </>
  );
}

export default AnimeDetailsPage; 