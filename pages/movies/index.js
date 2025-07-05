import Head from "next/head";
import { useEffect, useState } from "react";
import MainLayout from "../../components/ui/MainLayout";
import ContentRow from "../../components/ui/ContentRow";
import MovieCard from "../../components/movies/MovieCard";
import { getPopularMovies, getTrendingMovies, getTopRatedMovies, getUpcomingMovies, getNowPlayingMovies } from "../../src/handlers/movies";

export default function Movies() {
  const [popularMovies, setPopularMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [popular, trending, topRated, upcoming, nowPlaying] = await Promise.all([
          getPopularMovies(20),
          getTrendingMovies(20),
          getTopRatedMovies(20),
          getUpcomingMovies(20),
          getNowPlayingMovies(20)
        ]);
        
        setPopularMovies(popular);
        setTrendingMovies(trending);
        setTopRatedMovies(topRated);
        setUpcomingMovies(upcoming);
        setNowPlayingMovies(nowPlaying);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

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
      
      <MainLayout>
        <div className="pt-8 space-y-8">
          <div className="px-6">
            <h1 className="text-4xl font-bold text-netflix-white mb-4">Movies</h1>
            <p className="text-netflix-text-gray text-lg">
              From blockbuster hits to indie gems, discover your next favorite movie.
            </p>
          </div>

          {trendingMovies.length > 0 && (
            <ContentRow title="Trending Movies">
              {trendingMovies.map((movie) => (
                <div key={movie.id} className="flex-none w-80">
                  <MovieCard data={movie} />
                </div>
              ))}
            </ContentRow>
          )}

          {nowPlayingMovies.length > 0 && (
            <ContentRow title="Now Playing">
              {nowPlayingMovies.map((movie) => (
                <div key={movie.id} className="flex-none w-80">
                  <MovieCard data={movie} />
                </div>
              ))}
            </ContentRow>
          )}

          {popularMovies.length > 0 && (
            <ContentRow title="Popular Movies">
              {popularMovies.map((movie) => (
                <div key={movie.id} className="flex-none w-80">
                  <MovieCard data={movie} />
                </div>
              ))}
            </ContentRow>
          )}

          {topRatedMovies.length > 0 && (
            <ContentRow title="Top Rated">
              {topRatedMovies.map((movie) => (
                <div key={movie.id} className="flex-none w-80">
                  <MovieCard data={movie} />
                </div>
              ))}
            </ContentRow>
          )}

          {upcomingMovies.length > 0 && (
            <ContentRow title="Coming Soon">
              {upcomingMovies.map((movie) => (
                <div key={movie.id} className="flex-none w-80">
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