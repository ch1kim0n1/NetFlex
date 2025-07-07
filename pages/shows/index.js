import Head from "next/head";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import MainLayout from "../../components/ui/MainLayout";
import ContentRow from "../../components/ui/ContentRow";
import ShowCard from "../../components/shows/ShowCard";
import RecentlyWatchedCard from "../../components/ui/RecentlyWatchedCard";
import ParticleBackground from "../../components/ui/ParticleBackground";
import GenreSelector from "../../components/ui/GenreSelector";
import { getPopularShows, getTrendingShows, getTopRatedShows, getOnTheAirShows, getGenres, getShowsByGenre } from "../../src/handlers/shows";
import { getRecentlyWatchedShows } from "../../src/utils/viewingHistory";
import { FaArrowLeft } from 'react-icons/fa';

export default function Shows() {
  const router = useRouter();
  const [popularShows, setPopularShows] = useState([]);
  const [trendingShows, setTrendingShows] = useState([]);
  const [topRatedShows, setTopRatedShows] = useState([]);
  const [onTheAirShows, setOnTheAirShows] = useState([]);
  const [recentlyWatchedShows, setRecentlyWatchedShows] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [genreShows, setGenreShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const [popular, trending, topRated, onTheAir, showGenres] = await Promise.all([
          getPopularShows(20),
          getTrendingShows(20),
          getTopRatedShows(20),
          getOnTheAirShows(20),
          getGenres()
        ]);
        
        setPopularShows(popular);
        setTrendingShows(trending);
        setTopRatedShows(topRated);
        setOnTheAirShows(onTheAir);
        setGenres(showGenres);
        
        // Load recently watched shows from localStorage
        const recentlyWatched = getRecentlyWatchedShows();
        setRecentlyWatchedShows(recentlyWatched);
      } catch (error) {
        console.error('Error fetching shows:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, []);

  useEffect(() => {
    const fetchGenreShows = async () => {
      if (selectedGenre) {
        try {
          const shows = await getShowsByGenre(selectedGenre, 20);
          setGenreShows(shows);
        } catch (error) {
          console.error('Error fetching shows by genre:', error);
        }
      } else {
        setGenreShows([]);
      }
    };

    fetchGenreShows();
  }, [selectedGenre]);

  const handleRemoveFromRecentlyWatched = (showId) => {
    setRecentlyWatchedShows(prev => prev.filter(show => show.id !== showId));
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-netflix-white text-xl">Loading TV Shows...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <Head>
        <title>TV Shows - NetFlex</title>
        <meta name="description" content="Discover the best TV shows on NetFlex. From trending series to critically acclaimed dramas." />
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
            
            <h1 className="text-4xl font-bold text-netflix-white mb-4">TV Shows</h1>
            <p className="text-netflix-text-gray text-lg">
              Discover award-winning series, binge-worthy dramas, and trending shows.
            </p>
          </div>

          <GenreSelector 
            genres={genres}
            selectedGenre={selectedGenre}
            onGenreSelect={setSelectedGenre}
            type="show"
          />

          {selectedGenre && genreShows.length > 0 && (
            <ContentRow title={`${genres.find(g => g.id === selectedGenre)?.name || 'Genre'} Shows`}>
              {genreShows.map((show) => (
                <div key={show.id} className="flex-none w-60">
                  <ShowCard data={show} />
                </div>
              ))}
            </ContentRow>
          )}

          {recentlyWatchedShows.length > 0 && (
            <ContentRow title="Continue Watching">
              {recentlyWatchedShows.map((show) => (
                <div key={show.id} className="flex-none w-60">
                  <RecentlyWatchedCard 
                    data={show} 
                    onRemove={handleRemoveFromRecentlyWatched}
                  />
                </div>
              ))}
            </ContentRow>
          )}

          {trendingShows.length > 0 && (
            <ContentRow title="Trending Now">
              {trendingShows.map((show) => (
                <div key={show.id} className="flex-none w-60">
                  <ShowCard data={show} />
                </div>
              ))}
            </ContentRow>
          )}

          {popularShows.length > 0 && (
            <ContentRow title="Popular TV Shows">
              {popularShows.map((show) => (
                <div key={show.id} className="flex-none w-60">
                  <ShowCard data={show} />
                </div>
              ))}
            </ContentRow>
          )}

          {topRatedShows.length > 0 && (
            <ContentRow title="Top Rated">
              {topRatedShows.map((show) => (
                <div key={show.id} className="flex-none w-60">
                  <ShowCard data={show} />
                </div>
              ))}
            </ContentRow>
          )}

          {onTheAirShows.length > 0 && (
            <ContentRow title="Currently Airing">
              {onTheAirShows.map((show) => (
                <div key={show.id} className="flex-none w-60">
                  <ShowCard data={show} />
                </div>
              ))}
            </ContentRow>
          )}
        </div>
      </MainLayout>
    </>
  );
} 