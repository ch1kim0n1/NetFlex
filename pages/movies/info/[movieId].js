import Head from "next/head";
import React from "react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MainLayout from "../../../components/ui/MainLayout";
import ParticleBackground from "../../../components/ui/ParticleBackground";
import RatingComponent from "../../../components/social/RatingComponent";
import ReviewsSection from "../../../components/social/ReviewsSection";
import InvitationComponent from "../../../components/social/InvitationComponent";
import { getMovieDetails } from "../../../src/handlers/movies";
import { FaArrowLeft } from 'react-icons/fa';

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
      <MainLayout showBrowseButtons={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-netflix-white text-xl">Loading Movie Details...</div>
        </div>
      </MainLayout>
    );
  }

  if (!movieData) {
    return (
      <MainLayout showBrowseButtons={true}>
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

  const movieTitle = movieData.title.english || movieData.title.original;
  const backdropImage = movieData.bannerImage || movieData.image;

  return (
    <>
      <Head>
        <title>{movieTitle} - NetFlex</title>
        <meta name="description" content={movieData.description} />
        <meta
          property="og:title"
          content={`Watch ${movieTitle} - NetFlex`}
        />
        <meta property="og:description" content={movieData.description} />
        <meta property="og:image" content={movieData.bannerImage} />
      </Head>

      {/* Fading Background Image */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-in-out"
          style={{ 
            backgroundImage: `url('${backdropImage}')`,
            filter: 'blur(1px)'
          }}
        />
        {/* Black and white poster overlay for epic effect */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 transition-all duration-1000 ease-in-out"
          style={{ 
            backgroundImage: `url('${movieData.image}')`,
            filter: 'grayscale(100%) blur(2px)',
            backgroundSize: '150% 150%',
            backgroundPosition: 'center right'
          }}
        />
        {/* Dark overlay gradients for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-netflix-black/90 to-netflix-black/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-netflix-black/30 via-transparent to-netflix-black" />
      </div>

      <MainLayout useHead={false} type="movies" showBrowseButtons={true}>
        <ParticleBackground />
        <div className="px-8 py-8 relative z-10 min-h-screen">
          {/* Back Button */}
          <div className="max-w-6xl mx-auto mb-6">
            <button 
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-netflix-text-gray hover:text-netflix-white transition-colors group bg-netflix-black/50 backdrop-blur-sm rounded-lg px-4 py-2"
            >
              <FaArrowLeft className="group-hover:translate-x-[-2px] transition-transform" />
              <span>Back</span>
            </button>
          </div>
          
          {/* Movie Details */}
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Poster */}
              <div className="md:col-span-1">
                <img
                  src={movieData.image}
                  alt={movieTitle}
                  className="w-full rounded-lg shadow-2xl ring-1 ring-white/10 transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Details */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-netflix-black/30 backdrop-blur-md rounded-xl p-8 border border-white/10">
                  <h1 className="text-4xl font-bold text-netflix-white mb-4 text-shadow-lg">
                    {movieTitle}
                  </h1>
                  
                  <div className="flex items-center space-x-4 text-netflix-text-gray mb-4">
                    {movieData.rating && (
                      <span className="flex items-center space-x-1 bg-netflix-red/20 px-3 py-1 rounded-full">
                        <span className="text-netflix-red">★</span>
                        <span className="text-netflix-white font-medium">{movieData.rating.toFixed(1)}</span>
                      </span>
                    )}
                    {movieData.releaseDate && (
                      <span className="bg-netflix-gray/30 px-3 py-1 rounded-full text-netflix-white">
                        {new Date(movieData.releaseDate).getFullYear()}
                      </span>
                    )}
                    {movieData.runtime && (
                      <span className="bg-netflix-gray/30 px-3 py-1 rounded-full text-netflix-white">
                        {formatRuntime(movieData.runtime)}
                      </span>
                    )}
                  </div>

                  <p className="text-netflix-text-gray text-lg leading-relaxed mb-6 text-shadow">
                    {movieData.description}
                  </p>

                  {movieData.genres && movieData.genres.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-netflix-white font-semibold mb-2">Genres</h3>
                      <div className="flex flex-wrap gap-2">
                        {movieData.genres.map((genre) => (
                          <span
                            key={genre.id}
                            className="px-3 py-1 bg-netflix-gray/40 border border-netflix-gray/30 text-netflix-white rounded-full text-sm backdrop-blur-sm"
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
                            className="px-3 py-1 bg-netflix-red/30 border border-netflix-red/30 text-netflix-white rounded-full text-sm backdrop-blur-sm"
                          >
                            {company.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(movieData.budget > 0 || movieData.revenue > 0) && (
                    <div className="grid grid-cols-2 gap-4 text-sm bg-netflix-gray/20 rounded-lg p-4">
                      {movieData.budget > 0 && (
                        <div>
                          <span className="text-netflix-text-gray">Budget:</span>
                          <span className="text-netflix-white ml-2 font-medium">
                            {formatCurrency(movieData.budget)}
                          </span>
                        </div>
                      )}
                      {movieData.revenue > 0 && (
                        <div>
                          <span className="text-netflix-text-gray">Revenue:</span>
                          <span className="text-netflix-white ml-2 font-medium">
                            {formatCurrency(movieData.revenue)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-4 mt-8">
                    <button 
                      onClick={handleWatchNow}
                      className="bg-netflix-red hover:bg-netflix-red-dark text-netflix-white font-semibold py-3 px-8 rounded-md transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      ▶ Watch Now
                    </button>
                    
                    <InvitationComponent
                      contentId={movieId}
                      contentType="movie"
                      contentTitle={movieTitle}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Features Section */}
            <div className="border-t border-white/10 pt-12">
              <div className="grid lg:grid-cols-3 gap-12">
                {/* Ratings */}
                <div className="lg:col-span-1">
                  <div className="bg-netflix-black/40 backdrop-blur-md rounded-xl p-6 border border-white/10">
                    <h2 className="text-2xl font-bold text-netflix-white mb-6">Community Rating</h2>
                    <RatingComponent
                      contentId={movieId}
                      contentType="movie"
                    />
                  </div>
                </div>

                {/* Reviews */}
                <div className="lg:col-span-2">
                  <div className="bg-netflix-black/40 backdrop-blur-md rounded-xl p-6 border border-white/10">
                    <ReviewsSection
                      contentId={movieId}
                      contentType="movie"
                    />
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

export default MovieDetailsPage; 