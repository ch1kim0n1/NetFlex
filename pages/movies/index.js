import Head from "next/head";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import MainLayout from "../../components/ui/MainLayout";
import ContentRow from "../../components/ui/ContentRow";
import MovieCard from "../../components/movies/MovieCard";
import RecentlyWatchedCard from "../../components/ui/RecentlyWatchedCard";
import ParticleBackground from "../../components/ui/ParticleBackground";
import GenreSelector from "../../components/ui/GenreSelector";
import { getPopularMovies, getTrendingMovies, getTopRatedMovies, getNowPlayingMovies, getMovieGenres, getMoviesByGenre } from "../../src/handlers/movies";
import { getRecentlyWatchedMovies } from "../../src/utils/viewingHistory";
import { FaArrowLeft } from 'react-icons/fa';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function Movies() {
  const router = useRouter();
  const [popularMovies, setPopularMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [recentlyWatchedMovies, setRecentlyWatchedMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [genreMovies, setGenreMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [popular, trending, topRated, nowPlaying, movieGenres] = await Promise.all([
          getPopularMovies(20),
          getTrendingMovies(20),
          getTopRatedMovies(20),
          getNowPlayingMovies(20),
          getMovieGenres()
        ]);
        
        setPopularMovies(popular);
        setTrendingMovies(trending);
        setTopRatedMovies(topRated);
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
    <ProtectedRoute>
      <Head>
        <title>Movies - NetFlex</title>
        <meta name="description" content="Explore trending and popular movies on NetFlex" />
      </Head>

      <MainLayout showBrowseButtons={true}>
        <ParticleBackground />
        <div className="px-8 py-8">
          {/* Back Button */}
          <div className="max-w-7xl mx-auto mb-6">
            <button 
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-netflix-text-gray hover:text-netflix-white transition-colors group"
            >
              <FaArrowLeft className="group-hover:translate-x-[-2px] transition-transform" />
              <span>Back</span>
            </button>
          </div>

          <h1 className="text-4xl font-bold text-netflix-white mb-8 text-center">Movies</h1>
          
          {/* Genre Selector */}
          <div className="max-w-7xl mx-auto mb-8">
            <GenreSelector
              genres={genres}
              selectedGenre={selectedGenre}
              onGenreChange={setSelectedGenre}
              type="movie"
            />
          </div>

          {/* Recently Watched Movies */}
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

          {/* Genre Movies */}
          {selectedGenre && genreMovies.length > 0 && (
            <ContentRow title={`${genres.find(g => g.id === selectedGenre)?.name} Movies`}>
              {genreMovies.map((movie) => (
                <div key={movie.id} className="flex-none w-60">
                  <MovieCard data={movie} />
                </div>
              ))}
            </ContentRow>
          )}

          {/* Popular Movies */}
          {popularMovies.length > 0 && (
            <ContentRow title="Popular Movies">
              {popularMovies.map((movie) => (
                <div key={movie.id} className="flex-none w-60">
                  <MovieCard data={movie} />
                </div>
              ))}
            </ContentRow>
          )}

          {/* Trending Movies */}
          {trendingMovies.length > 0 && (
            <ContentRow title="Trending Now">
              {trendingMovies.map((movie) => (
                <div key={movie.id} className="flex-none w-60">
                  <MovieCard data={movie} />
                </div>
              ))}
            </ContentRow>
          )}

          {/* Top Rated Movies */}
          {topRatedMovies.length > 0 && (
            <ContentRow title="Top Rated">
              {topRatedMovies.map((movie) => (
                <div key={movie.id} className="flex-none w-60">
                  <MovieCard data={movie} />
                </div>
              ))}
            </ContentRow>
          )}

          {/* Now Playing Movies */}
          {nowPlayingMovies.length > 0 && (
            <ContentRow title="Now Playing">
              {nowPlayingMovies.map((movie) => (
                <div key={movie.id} className="flex-none w-60">
                  <MovieCard data={movie} />
                </div>
              ))}
            </ContentRow>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
} 