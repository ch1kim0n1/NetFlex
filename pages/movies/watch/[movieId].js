import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import MainLayout from '../../../components/ui/MainLayout';
import StreamingPlayer from '../../../components/StreamingPlayer';
import { getMovieDetails } from '../../../src/handlers/movies';
import { updateMovieProgress, invalidateRecommendationCache } from '../../../src/utils/viewingHistory';
import { invalidateRecommendationCache as invalidateRecCache } from '../../../src/utils/recommendations';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

function WatchMovie() {
  const router = useRouter();
  const { movieId } = router.query;
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!movieId) return;
      
      try {
        setLoading(true);
        const movieData = await getMovieDetails(movieId);
        if (movieData) {
          setMovie(movieData);
        } else {
          setError('Movie not found');
        }
      } catch (err) {
        setError('Failed to load movie');
        console.error('Error fetching movie:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [movieId]);

  // Track viewing progress when movie starts playing
  useEffect(() => {
    if (movie && movieId) {
      // Add to recently watched when user starts watching (5% progress)
      const trackInitialView = () => {
        updateMovieProgress(movie, 5);
        // Invalidate recommendation cache to trigger new recommendations
        invalidateRecCache();
      };

      // Add a small delay to ensure the movie has actually started
      const timer = setTimeout(trackInitialView, 10000); // 10 seconds after page load

      return () => clearTimeout(timer);
    }
  }, [movie, movieId]);

  if (loading) {
    return (
      <MainLayout>
        <Head>
          <title>Loading Movie - NetFlex</title>
        </Head>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-netflix-red mx-auto mb-4"></div>
            <p className="text-netflix-text-gray">Loading movie...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !movie) {
    return (
      <MainLayout>
        <Head>
          <title>Movie Not Found - NetFlex</title>
        </Head>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-netflix-white mb-4">Movie Not Found</h1>
            <p className="text-netflix-text-gray mb-8">{error || 'The movie you are looking for could not be found.'}</p>
            <Link href="/movies">
              <button className="bg-netflix-red text-netflix-white px-6 py-3 rounded-md hover:bg-netflix-red-dark transition-colors">
                Browse Movies
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
        <title>{movie.title.english} - Watch on NetFlex</title>
        <meta name="description" content={`Watch ${movie.title.english} on NetFlex. ${movie.description}`} />
        <meta property="og:title" content={`${movie.title.english} - Watch on NetFlex`} />
        <meta property="og:description" content={movie.description} />
        <meta property="og:image" content={movie.bannerImage} />
        <meta property="og:type" content="video.movie" />
      </Head>

      <div className="min-h-screen bg-netflix-black">
        {/* Header Controls */}
        <div className="sticky top-0 bg-netflix-black/80 backdrop-blur-md z-20 border-b border-netflix-gray/30">
          <div className="max-w-7xl mx-auto px-8 py-4">
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
                  {movie.title.english}
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Streaming Player */}
            <div className="lg:col-span-2">
              <StreamingPlayer 
                streamingUrls={movie.streaming}
                title={movie.title.english}
                type="movie"
              />
            </div>

            {/* Movie Information */}
            <div className="lg:col-span-1">
              <div className="bg-netflix-dark rounded-lg p-6">
                <div className="mb-6">
                  <img 
                    src={movie.image} 
                    alt={movie.title.english}
                    className="w-full rounded-lg mb-4"
                  />
                  <h2 className="text-2xl font-bold text-netflix-white mb-2">
                    {movie.title.english}
                  </h2>
                  {movie.title.original !== movie.title.english && (
                    <p className="text-netflix-text-gray mb-4">
                      Original: {movie.title.original}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-netflix-white font-semibold mb-2">Overview</h3>
                    <p className="text-netflix-text-gray text-sm leading-relaxed">
                      {movie.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-netflix-white font-semibold mb-1">Rating</h4>
                      <p className="text-netflix-text-gray text-sm">
                        ⭐ {movie.rating?.toFixed(1)}/10
                      </p>
                    </div>
                    <div>
                      <h4 className="text-netflix-white font-semibold mb-1">Runtime</h4>
                      <p className="text-netflix-text-gray text-sm">
                        {movie.runtime} minutes
                      </p>
                    </div>
                    <div>
                      <h4 className="text-netflix-white font-semibold mb-1">Release Date</h4>
                      <p className="text-netflix-text-gray text-sm">
                        {new Date(movie.releaseDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-netflix-white font-semibold mb-1">Status</h4>
                      <p className="text-netflix-text-gray text-sm">
                        {movie.status}
                      </p>
                    </div>
                  </div>

                  {movie.genres && movie.genres.length > 0 && (
                    <div>
                      <h4 className="text-netflix-white font-semibold mb-2">Genres</h4>
                      <div className="flex flex-wrap gap-2">
                        {movie.genres.map((genre) => (
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

                  {movie.productionCompanies && movie.productionCompanies.length > 0 && (
                    <div>
                      <h4 className="text-netflix-white font-semibold mb-2">Production</h4>
                      <div className="space-y-1">
                        {movie.productionCompanies.slice(0, 3).map((company) => (
                          <p key={company.id} className="text-netflix-text-gray text-sm">
                            {company.name}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {movie.imdbId && (
                    <div>
                      <h4 className="text-netflix-white font-semibold mb-2">External Links</h4>
                      <a 
                        href={`https://www.imdb.com/title/${movie.imdbId}`}
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

export default WatchMovie;