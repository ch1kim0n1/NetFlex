import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FaArrowLeft } from 'react-icons/fa';
import MainLayout from "../../components/ui/MainLayout";
import ParticleBackground from "../../components/ui/ParticleBackground";
import ContentRow from "../../components/ui/ContentRow";
import GenreSelector from "../../components/ui/GenreSelector";
import AnimeCard from "../../components/anime/AnimeCard";
import RecentlyWatchedCard from "../../components/ui/RecentlyWatchedCard";
import PersonalizedCategories from "../../components/ui/PersonalizedCategories";
import { 
  getPopularAnime, 
  getTrendingAnime, 
  getTopRatedAnime, 
  getOngoingAnime, 
  getAnimeGenres, 
  getAnimeByGenre 
} from "../../src/handlers/anime";
import { getRecentlyWatchedAnime } from "../../src/utils/viewingHistory";

export default function Anime() {
  const router = useRouter();
  const [popularAnime, setPopularAnime] = useState([]);
  const [trendingAnime, setTrendingAnime] = useState([]);
  const [topRatedAnime, setTopRatedAnime] = useState([]);
  const [ongoingAnime, setOngoingAnime] = useState([]);
  const [recentlyWatchedAnime, setRecentlyWatchedAnime] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [genreAnime, setGenreAnime] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const [popular, trending, topRated, ongoing, animeGenres] = await Promise.all([
          getPopularAnime(20),
          getTrendingAnime(20),
          getTopRatedAnime(20),
          getOngoingAnime(20),
          getAnimeGenres()
        ]);
        
        setPopularAnime(popular);
        setTrendingAnime(trending);
        setTopRatedAnime(topRated);
        setOngoingAnime(ongoing);
        setGenres(animeGenres);
        
        // Load recently watched anime from localStorage
        const recentlyWatched = getRecentlyWatchedAnime();
        setRecentlyWatchedAnime(recentlyWatched);
      } catch (error) {
        console.error('Error fetching anime:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, []);

  useEffect(() => {
    const fetchGenreAnime = async () => {
      if (selectedGenre) {
        try {
          const anime = await getAnimeByGenre(selectedGenre, 20);
          setGenreAnime(anime);
        } catch (error) {
          console.error('Error fetching anime by genre:', error);
        }
      } else {
        setGenreAnime([]);
      }
    };

    fetchGenreAnime();
  }, [selectedGenre]);

  const handleRemoveFromRecentlyWatched = (animeId) => {
    setRecentlyWatchedAnime(prev => prev.filter(anime => anime.id !== animeId));
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-netflix-white text-xl">Loading Anime...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Anime - NetFlex</title>
        <meta name="description" content="Discover the best anime on NetFlex. From popular series to critically acclaimed anime shows." />
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
            
            <h1 className="text-4xl font-bold text-netflix-white mb-4">Anime</h1>
            <p className="text-netflix-text-gray text-lg">
              Discover popular anime series, trending shows, and critically acclaimed anime.
            </p>
          </div>

          <GenreSelector 
            genres={genres}
            selectedGenre={selectedGenre}
            onGenreSelect={setSelectedGenre}
            type="anime"
          />

          {selectedGenre && genreAnime.length > 0 && (
            <ContentRow title={`${genres.find(g => g.id === selectedGenre)?.name || 'Genre'} Anime`}>
              {genreAnime.map((anime) => (
                <div key={anime.id} className="flex-none w-60">
                  <AnimeCard data={anime} />
                </div>
              ))}
            </ContentRow>
          )}

          {recentlyWatchedAnime.length > 0 && (
            <ContentRow title="Continue Watching">
              {recentlyWatchedAnime.map((anime) => (
                <div key={anime.id} className="flex-none w-60">
                  <RecentlyWatchedCard 
                    data={anime} 
                    onRemove={handleRemoveFromRecentlyWatched}
                  />
                </div>
              ))}
            </ContentRow>
          )}

          <PersonalizedCategories type="anime" />

          {trendingAnime.length > 0 && (
            <ContentRow title="Trending Anime">
              {trendingAnime.map((anime) => (
                <div key={anime.id} className="flex-none w-60">
                  <AnimeCard data={anime} />
                </div>
              ))}
            </ContentRow>
          )}

          {popularAnime.length > 0 && (
            <ContentRow title="Popular Anime">
              {popularAnime.map((anime) => (
                <div key={anime.id} className="flex-none w-60">
                  <AnimeCard data={anime} />
                </div>
              ))}
            </ContentRow>
          )}

          {topRatedAnime.length > 0 && (
            <ContentRow title="Top Rated Anime">
              {topRatedAnime.map((anime) => (
                <div key={anime.id} className="flex-none w-60">
                  <AnimeCard data={anime} />
                </div>
              ))}
            </ContentRow>
          )}

          {ongoingAnime.length > 0 && (
            <ContentRow title="Currently Airing">
              {ongoingAnime.map((anime) => (
                <div key={anime.id} className="flex-none w-60">
                  <AnimeCard data={anime} />
                </div>
              ))}
            </ContentRow>
          )}
        </div>
      </MainLayout>
    </>
  );
} 