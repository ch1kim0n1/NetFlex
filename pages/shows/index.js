import Head from "next/head";
import { useEffect, useState } from "react";
import MainLayout from "../../components/ui/MainLayout";
import ContentRow from "../../components/ui/ContentRow";
import ShowCard from "../../components/shows/ShowCard";
import RecentlyWatchedCard from "../../components/ui/RecentlyWatchedCard";
import { getPopularShows, getTrendingShows, getTopRatedShows, getOnTheAirShows } from "../../src/handlers/shows";
import { getRecentlyWatchedShows } from "../../src/utils/viewingHistory";

export default function Shows() {
  const [popularShows, setPopularShows] = useState([]);
  const [trendingShows, setTrendingShows] = useState([]);
  const [topRatedShows, setTopRatedShows] = useState([]);
  const [onTheAirShows, setOnTheAirShows] = useState([]);
  const [recentlyWatchedShows, setRecentlyWatchedShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const [popular, trending, topRated, onTheAir] = await Promise.all([
          getPopularShows(20),
          getTrendingShows(20),
          getTopRatedShows(20),
          getOnTheAirShows(20)
        ]);
        
        setPopularShows(popular);
        setTrendingShows(trending);
        setTopRatedShows(topRated);
        setOnTheAirShows(onTheAir);
        
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
      
      <MainLayout>
        <div className="pt-8 space-y-8">
          <div className="px-6">
            <h1 className="text-4xl font-bold text-netflix-white mb-4">TV Shows</h1>
            <p className="text-netflix-text-gray text-lg">
              Discover award-winning series, binge-worthy dramas, and trending shows.
            </p>
          </div>

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