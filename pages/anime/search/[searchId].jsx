import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FaArrowLeft, FaSearch } from 'react-icons/fa';
import MainLayout from "../../../components/ui/MainLayout";
import ParticleBackground from "../../../components/ui/ParticleBackground";
import ContentRow from "../../../components/ui/ContentRow";
import GenreSelector from "../../../components/ui/GenreSelector";
import AnimeCard from "../../../components/anime/AnimeCard";
import { searchAnime, getAnimeGenres, getAnimeByGenre } from "../../../src/handlers/anime";

export default function AnimeSearch() {
  const router = useRouter();
  const { searchId } = router.query;
  const [results, setResults] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (searchId) {
      const decodedQuery = decodeURIComponent(searchId);
      setSearchQuery(decodedQuery);
      performSearch(decodedQuery);
    }
  }, [searchId]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const animeGenres = await getAnimeGenres();
        setGenres(animeGenres);
      } catch (error) {
        console.error('Error fetching anime genres:', error);
      }
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    if (selectedGenre && searchQuery) {
      filterByGenre();
    }
  }, [selectedGenre]);

  const performSearch = async (query) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const searchResults = await searchAnime(query, 50);
      setResults(searchResults);
    } catch (error) {
      console.error('Error searching anime:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const filterByGenre = async () => {
    if (!selectedGenre) return;
    
    setLoading(true);
    try {
      const genreResults = await getAnimeByGenre(selectedGenre, 50);
      // Filter genre results by search query if it exists
      if (searchQuery.trim()) {
        const filteredResults = genreResults.filter(anime =>
          anime.title?.english?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          anime.title?.original?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          anime.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setResults(filteredResults);
      } else {
        setResults(genreResults);
      }
    } catch (error) {
      console.error('Error filtering anime by genre:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    router.push(`/anime/search/${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleGenreSelect = (genreId) => {
    setSelectedGenre(genreId);
    if (!genreId) {
      // If no genre selected, go back to original search
      performSearch(searchQuery);
    }
  };

  return (
    <>
      <Head>
        <title>{searchQuery ? `"${searchQuery}" - Anime Search` : 'Anime Search'} - NetFlex</title>
        <meta name="description" content={`Search results for "${searchQuery}" in anime on NetFlex`} />
      </Head>
      
      <MainLayout showBrowseButtons={false} type={"anime"}>
        <ParticleBackground />
        <div className="pt-6 sm:pt-8 space-y-6 sm:space-y-8 relative z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mb-4 sm:mb-6">
              <button 
                onClick={() => router.push('/anime')}
                className="flex items-center space-x-2 text-netflix-text-gray hover:text-netflix-white transition-colors group"
              >
                <FaArrowLeft className="group-hover:translate-x-[-2px] transition-transform" />
                <span className="text-sm sm:text-base">Back to Anime</span>
              </button>
            </div>
            
            {/* Search Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-netflix-white mb-3 sm:mb-4">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'Search Anime'}
              </h1>
              
              {/* Search Form */}
              <form onSubmit={handleNewSearch} className="flex items-center space-x-2 sm:space-x-4 max-w-full sm:max-w-2xl">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for anime..."
                    className="w-full bg-netflix-dark text-netflix-white px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 rounded-lg border border-netflix-gray focus:border-netflix-red focus:outline-none text-sm sm:text-base"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-netflix-text-gray hover:text-netflix-white transition-colors"
                  >
                    <FaSearch className="text-sm sm:text-base" />
                  </button>
                </div>
              </form>
            </div>

            {/* Results Count */}
            {!loading && (
              <div className="mb-4 sm:mb-6">
                <p className="text-netflix-text-gray text-sm sm:text-base">
                  {results.length > 0 
                    ? `Found ${results.length} anime${selectedGenre ? ` in ${genres.find(g => g.id === selectedGenre)?.name || 'selected genre'}` : ''}`
                    : 'No anime found'
                  }
                  {searchQuery && ` for "${searchQuery}"`}
                </p>
              </div>
            )}
          </div>

          {/* Genre Filter */}
          <div className="px-4 sm:px-0">
            <GenreSelector 
              genres={genres}
              selectedGenre={selectedGenre}
              onGenreSelect={handleGenreSelect}
              type="anime"
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12 sm:py-16">
              <div className="text-netflix-white text-lg sm:text-xl">Searching anime...</div>
            </div>
          )}

          {/* Search Results */}
          {!loading && results.length > 0 && (
            <div className="px-4 sm:px-0">
              <ContentRow title={selectedGenre ? `${genres.find(g => g.id === selectedGenre)?.name || 'Genre'} Anime` : 'Search Results'}>
                {results.map((anime) => (
                  <div key={anime.id} className="flex-none w-48 sm:w-60">
                    <AnimeCard data={anime} />
                  </div>
                ))}
              </ContentRow>
            </div>
          )}

          {/* No Results */}
          {!loading && results.length === 0 && searchQuery && (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-8">
              <div className="text-center">
                <FaSearch className="text-netflix-text-gray text-4xl sm:text-6xl mb-3 sm:mb-4 mx-auto" />
                <h3 className="text-netflix-white text-xl sm:text-2xl font-semibold mb-2">No anime found</h3>
                <p className="text-netflix-text-gray text-base sm:text-lg mb-4 sm:mb-6 max-w-md">
                  We couldn't find any anime matching "{searchQuery}"
                  {selectedGenre && ` in ${genres.find(g => g.id === selectedGenre)?.name || 'the selected genre'}`}.
                </p>
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-netflix-text-gray text-sm sm:text-base">Try:</p>
                  <ul className="text-netflix-text-gray text-xs sm:text-sm space-y-1 max-w-sm mx-auto">
                    <li>• Checking your spelling</li>
                    <li>• Using different keywords</li>
                    <li>• Browsing by genre instead</li>
                    <li>• Removing the genre filter</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    </>
  );
} 