import Head from "next/head";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import MainLayout from "../../components/ui/MainLayout";
import ContentRow from "../../components/ui/ContentRow";
import ShowCard from "../../components/shows/ShowCard";
import MovieCard from "../../components/movies/MovieCard";
import ParticleBackground from "../../components/ui/ParticleBackground";
import { getTrendingShows } from "../../src/handlers/shows";
import { getTrendingMovies } from "../../src/handlers/movies";
import { FaArrowLeft } from 'react-icons/fa';

export default function Trending() {
  const router = useRouter();
  const [trendingShows, setTrendingShows] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const [shows, movies] = await Promise.all([
          getTrendingShows(20),
          getTrendingMovies(20)
        ]);
        
        setTrendingShows(shows);
        setTrendingMovies(movies);
      } catch (error) {
        console.error('Error fetching trending content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-netflix-white text-xl">Loading Trending Content...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Trending - NetFlex</title>
        <meta name="description" content="Discover what's trending on NetFlex. The hottest movies and TV shows everyone is watching." />
      </Head>
      
      <MainLayout showBrowseButtons={true}>
        <ParticleBackground />
        <div className="pt-8 space-y-8 relative z-10">
          <div className="px-8">
            <div className="mb-6">
              <button 
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-netflix-text-gray hover:text-netflix-white transition-colors group"
              >
                <FaArrowLeft className="group-hover:translate-x-[-2px] transition-transform" />
                <span>Back to Home</span>
              </button>
            </div>
            
            <h1 className="text-4xl font-bold text-netflix-white mb-4">Trending Now</h1>
            <p className="text-netflix-text-gray text-lg">
              Discover what everyone is watching right now.
            </p>
          </div>

          {trendingShows.length > 0 && (
            <ContentRow title="Trending TV Shows">
              {trendingShows.map((show) => (
                <div key={show.id} className="flex-none w-60">
                  <ShowCard data={show} />
                </div>
              ))}
            </ContentRow>
          )}

          {trendingMovies.length > 0 && (
            <ContentRow title="Trending Movies">
              {trendingMovies.map((movie) => (
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