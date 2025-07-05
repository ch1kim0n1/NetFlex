import Head from "next/head";
import React from "react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MainLayout from "../../../components/ui/MainLayout";
import { getShowDetails, getShowEpisodes } from "../../../src/handlers/shows";

function ShowDetailsPage() {
  const router = useRouter();
  const { showId } = router.query;
  const [showData, setShowData] = useState(null);
  const [episodeData, setEpisodeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (showId) {
      const fetchShowData = async () => {
        try {
          const [show, episodes] = await Promise.all([
            getShowDetails(showId),
            getShowEpisodes(showId, 1) // Get first season
          ]);
          setShowData(show);
          setEpisodeData(episodes);
        } catch (error) {
          console.error('Error fetching show details:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchShowData();
    }
  }, [showId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-netflix-white text-xl">Loading Show Details...</div>
        </div>
      </MainLayout>
    );
  }

  if (!showData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-netflix-white text-xl">Show not found</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <Head>
        <title>{showData.title.english || showData.title.original} - NetFlex</title>
        <meta name="description" content={showData.description} />
        <meta
          property="og:title"
          content={`Watch ${showData.title.english || showData.title.original} - NetFlex`}
        />
        <meta property="og:description" content={showData.description} />
        <meta property="og:image" content={showData.bannerImage} />
      </Head>

      <MainLayout useHead={false} banner={showData.bannerImage} type="shows">
        <div className="px-6 py-8">
          {/* Show Details */}
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Poster */}
              <div className="md:col-span-1">
                <img
                  src={showData.image}
                  alt={showData.title.english || showData.title.original}
                  className="w-full rounded-lg shadow-lg"
                />
              </div>

              {/* Details */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h1 className="text-4xl font-bold text-netflix-white mb-4">
                    {showData.title.english || showData.title.original}
                  </h1>
                  
                  <div className="flex items-center space-x-4 text-netflix-text-gray mb-4">
                    {showData.rating && (
                      <span className="flex items-center space-x-1">
                        <span className="text-netflix-red">★</span>
                        <span>{showData.rating.toFixed(1)}</span>
                      </span>
                    )}
                    {showData.releaseDate && (
                      <span>{new Date(showData.releaseDate).getFullYear()}</span>
                    )}
                    {showData.seasons && (
                      <span>{showData.seasons} {showData.seasons === 1 ? 'Season' : 'Seasons'}</span>
                    )}
                    {showData.totalEpisodes && (
                      <span>{showData.totalEpisodes} Episodes</span>
                    )}
                  </div>

                  <p className="text-netflix-text-gray text-lg leading-relaxed mb-6">
                    {showData.description}
                  </p>

                  {showData.genres && showData.genres.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-netflix-white font-semibold mb-2">Genres</h3>
                      <div className="flex flex-wrap gap-2">
                        {showData.genres.map((genre) => (
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

                  {showData.networks && showData.networks.length > 0 && (
                    <div>
                      <h3 className="text-netflix-white font-semibold mb-2">Networks</h3>
                      <div className="flex flex-wrap gap-2">
                        {showData.networks.map((network) => (
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

                <button className="bg-netflix-red hover:bg-netflix-red-dark text-netflix-white font-semibold py-3 px-8 rounded-md transition-all duration-300 transform hover:scale-105">
                  ▶ Watch Now
                </button>
              </div>
            </div>

            {/* Episodes */}
            {episodeData.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-netflix-white mb-6">Episodes</h2>
                <div className="grid gap-4">
                  {episodeData.slice(0, 10).map((episode) => (
                    <div
                      key={episode.id}
                      className="bg-netflix-gray/20 rounded-lg p-4 hover:bg-netflix-gray/30 transition-colors"
                    >
                      <div className="flex items-start space-x-4">
                        {episode.image && (
                          <img
                            src={episode.image}
                            alt={episode.title}
                            className="w-32 h-18 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-netflix-white font-semibold">
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
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    </>
  );
}

export default ShowDetailsPage; 