import Head from "next/head";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import MainLayout from "../../components/ui/MainLayout";
import ContentRow from "../../components/ui/ContentRow";
import MovieCard from "../../components/movies/MovieCard";
import RecentlyWatchedCard from "../../components/ui/RecentlyWatchedCard";
import ParticleBackground from "../../components/ui/ParticleBackground";
import GenreSelector from "../../components/ui/GenreSelector";
import PersonalizedCategories from "../../components/ui/PersonalizedCategories";
import { getPopularMovies, getTopRatedMovies, getUpcomingMovies, getNowPlayingMovies, getMovieGenres, getMoviesByGenre } from "../../src/handlers/movies";
import { getRecentlyWatchedMovies } from "../../src/utils/viewingHistory";
import { FaArrowLeft } from 'react-icons/fa';

export default function Movies() {
  const router = useRouter();
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [recentlyWatchedMovies, setRecentlyWatchedMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [genreMovies, setGenreMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [popular, topRated, upcoming, nowPlaying, movieGenres] = await Promise.all([
          getPopularMovies(20),
          getTopRatedMovies(20),
          getUpcomingMovies(20),
          getNowPlayingMovies(20),
          getMovieGenres()
        ]);
        
        setPopularMovies(popular);
        setTopRatedMovies(topRated);
        setUpcomingMovies(upcoming);
        setNowPlayingMovies(nowPlaying);
        setGenres(movieGenres);
        
        // Load recently watched movies from localStorage
        const recentlyWatched = getRecentlyWatchedMovies();
        setRecentlyWatchedMovies(recentlyWatched);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    const fetchGenreMovies = async () => {
      if (selectedGenre) {
        try {
          const movies = await getMoviesByGenre(selectedGenre, 20);
          setGenreMovies(movies);
        } catch (error) {
          console.error('Error fetching movies by genre:', error);
        }
      } else {
        setGenreMovies([]);
      }
    };

    fetchGenreMovies();
  }, [selectedGenre]);

  const handleRemoveFromRecentlyWatched = (movieId) => {
    setRecentlyWatchedMovies(prev => prev.filter(movie => movie.id !== movieId));
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-netflix-white text-xl">Loading Movies...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Movies - NetFlex</title>
        <meta name="description" content="Watch the latest movies on NetFlex. From blockbuster hits to indie films." />
      </Head>
      
      <MainLayout showBrowseButtons={false}>
        <ParticleBackground />
        <div className="pt-6 sm:pt-8 space-y-6 sm:space-y-8 relative z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mb-4 sm:mb-6">
              <button 
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-netflix-text-gray hover:text-netflix-white transition-colors group"
              >
                <FaArrowLeft className="group-hover:translate-x-[-2px] transition-transform" />
                <span className="text-sm sm:text-base">Back to Home</span>
              </button>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-netflix-white mb-3 sm:mb-4">Movies</h1>
            <p className="text-netflix-text-gray text-base sm:text-lg">
              From blockbuster hits to indie gems, discover your next favorite movie.
            </p>
          </div>

          <GenreSelector 
            genres={genres}
            selectedGenre={selectedGenre}
            onGenreSelect={setSelectedGenre}
            type="movie"
          />

          {selectedGenre && genreMovies.length > 0 && (
            <ContentRow title={`${genres.find(g => g.id === selectedGenre)?.name || 'Genre'} Movies`}>
              {genreMovies.map((movie) => (
                <div key={movie.id} className="flex-none w-60">
                  <MovieCard data={movie} />
                </div>
              ))}
            </ContentRow>
          )}

          {recentlyWatchedMovies.length > 0 && (
            <ContentRow title="Continue Watching">
              {recentlyWatchedMovies.map((movie) => (
                <div key={movie.id} className="flex-none w-60">
                  <RecentlyWatchedCard 
                    data={movie} 
                    onRemove={handleRemoveFromRecentlyWatched}
                  />
                </div>
              ))}
            </ContentRow>
          )}

          {/* Personalized Recommendations */}
          <PersonalizedCategories contentType="movie" limit={15} />

          {nowPlayingMovies.length > 0 && (
            <ContentRow title="Now Playing">
              {nowPlayingMovies.map((movie) => (
                <div key={movie.id} className="flex-none w-60">
                  <MovieCard data={movie} />
                </div>
              ))}
            </ContentRow>
          )}

          {popularMovies.length > 0 && (
            <ContentRow title="Popular Movies">
              {popularMovies.map((movie) => (
                <div key={movie.id} className="flex-none w-60">
                  <MovieCard data={movie} />
                </div>
              ))}
            </ContentRow>
          )}

          {topRatedMovies.length > 0 && (
            <ContentRow title="Top Rated">
              {topRatedMovies.map((movie) => (
                <div key={movie.id} className="flex-none w-60">
                  <MovieCard data={movie} />
                </div>
              ))}
            </ContentRow>
          )}

          {upcomingMovies.length > 0 && (
            <ContentRow title="Coming Soon">
              {upcomingMovies.map((movie) => (
                <div key={movie.id} className="flex-none w-60">
                  <MovieCard data={movie} />
                </div>
              ))}
            </ContentRow>
          )}
        </div>
      </MainLayout>
    </>
  );
} 