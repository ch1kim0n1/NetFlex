import Head from "next/head";
import React from "react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MainLayout from "../../../components/ui/MainLayout";
import { getMovieDetails } from "../../../src/handlers/movies";

function MovieDetailsPage() {
  const router = useRouter();
  const { movieId } = router.query;
  const [movieData, setMovieData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (movieId) {
      const fetchMovieData = async () => {
        try {
          const movie = await getMovieDetails(movieId);
          setMovieData(movie);
        } catch (error) {
          console.error('Error fetching movie details:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchMovieData();
    }
  }, [movieId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-netflix-white text-xl">Loading Movie Details...</div>
        </div>
      </MainLayout>
    );
  }

  if (!movieData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-netflix-white text-xl">Movie not found</div>
        </div>
      </MainLayout>
    );
  }

  const formatRuntime = (minutes) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleWatchNow = () => {
    router.push(`/movies/watch/${movieId}`);
  };

  return (
    <>
      <Head>
        <title>{movieData.title.english || movieData.title.original} - NetFlex</title>
        <meta name="description" content={movieData.description} />
        <meta
          property="og:title"
          content={`Watch ${movieData.title.english || movieData.title.original} - NetFlex`}
        />
        <meta property="og:description" content={movieData.description} />
        <meta property="og:image" content={movieData.bannerImage} />
      </Head>

      <MainLayout useHead={false} banner={movieData.bannerImage} type="movies">
        <div className="px-6 py-8">
          {/* Movie Details */}
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Poster */}
              <div className="md:col-span-1">
                <img
                  src={movieData.image}
                  alt={movieData.title.english || movieData.title.original}
                  className="w-full rounded-lg shadow-lg"
                />
              </div>

              {/* Details */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h1 className="text-4xl font-bold text-netflix-white mb-4">
                    {movieData.title.english || movieData.title.original}
                  </h1>
                  
                  <div className="flex items-center space-x-4 text-netflix-text-gray mb-4">
                    {movieData.rating && (
                      <span className="flex items-center space-x-1">
                        <span className="text-netflix-red">★</span>
                        <span>{movieData.rating.toFixed(1)}</span>
                      </span>
                    )}
                    {movieData.releaseDate && (
                      <span>{new Date(movieData.releaseDate).getFullYear()}</span>
                    )}
                    {movieData.runtime && (
                      <span>{formatRuntime(movieData.runtime)}</span>
                    )}
                  </div>

                  <p className="text-netflix-text-gray text-lg leading-relaxed mb-6">
                    {movieData.description}
                  </p>

                  {movieData.genres && movieData.genres.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-netflix-white font-semibold mb-2">Genres</h3>
                      <div className="flex flex-wrap gap-2">
                        {movieData.genres.map((genre) => (
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

                  {movieData.productionCompanies && movieData.productionCompanies.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-netflix-white font-semibold mb-2">Production</h3>
                      <div className="flex flex-wrap gap-2">
                        {movieData.productionCompanies.slice(0, 3).map((company) => (
                          <span
                            key={company.id}
                            className="px-3 py-1 bg-netflix-red/20 text-netflix-white rounded-full text-sm"
                          >
                            {company.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(movieData.budget > 0 || movieData.revenue > 0) && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {movieData.budget > 0 && (
                        <div>
                          <span className="text-netflix-text-gray">Budget:</span>
                          <span className="text-netflix-white ml-2">
                            {formatCurrency(movieData.budget)}
                          </span>
                        </div>
                      )}
                      {movieData.revenue > 0 && (
                        <div>
                          <span className="text-netflix-text-gray">Revenue:</span>
                          <span className="text-netflix-white ml-2">
                            {formatCurrency(movieData.revenue)}
                          </span>
                        </div>
                      )}
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
          </div>
        </div>
      </MainLayout>
    </>
  );
}

export default MovieDetailsPage; 