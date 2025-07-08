import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import MainLayout from "../../components/ui/MainLayout";
import MovieCard from "../../components/movies/MovieCard";
import ShowCard from "../../components/shows/ShowCard";
import ParticleBackground from "../../components/ui/ParticleBackground";
import { FaSearch, FaFilter, FaTimes, FaSort, FaArrowLeft } from 'react-icons/fa';
import { searchMovies, getMovieGenres, getPopularMovies, getTrendingMovies } from "../../src/handlers/movies";
import { searchShows, getGenres, getPopularShows, getTrendingShows } from "../../src/handlers/shows";
import { getPopularAnime, getTrendingAnime, searchAnime } from "../../src/handlers/anime";
import AnimeCard from "../../components/anime/AnimeCard";

export default function GlobalSearch() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contentType, setContentType] = useState('all'); // all, movies, shows, anime
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('relevance'); // relevance, rating, date, title
  const [movieGenres, setMovieGenres] = useState([]);
  const [showGenres, setShowGenres] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const [movieGenreList, showGenreList] = await Promise.all([
          getMovieGenres(),
          getGenres()
        ]);
        setMovieGenres(movieGenreList);
        setShowGenres(showGenreList);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchGenres();
    
    // Check for search query in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    if (queryParam) {
      setSearchQuery(queryParam);
    } else {
      // Load initial content when page loads
      loadInitialContent();
    }
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch();
      } else {
        loadInitialContent();
      }
    }, 300); // Add slight delay for better UX

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, contentType, selectedGenre, sortBy]);

  const loadInitialContent = async () => {
    setLoading(true);
    try {
      let content = [];
      
      if (contentType === 'all' || contentType === 'movies') {
        const [popular, trending] = await Promise.all([
          getPopularMovies(20),
          getTrendingMovies(20)
        ]);
        content = [...content, ...popular, ...trending];
      }
      
      if (contentType === 'all' || contentType === 'shows') {
        const [popular, trending] = await Promise.all([
          getPopularShows(20),
          getTrendingShows(20)
        ]);
        content = [...content, ...popular, ...trending];
      }
      
      if (contentType === 'all' || contentType === 'anime') {
        const [popular, trending] = await Promise.all([
          getPopularAnime(20),
          getTrendingAnime(20)
        ]);
        content = [...content, ...popular, ...trending];
      }

      // Remove duplicates and add type
      let uniqueContent = content.reduce((acc, item) => {
        if (!acc.find(existing => existing.id === item.id && getItemType(existing) === getItemType(item))) {
          acc.push({
            ...item,
            type: getItemType(item)
          });
        }
        return acc;
      }, []);

      // Apply genre filter if selected
      if (selectedGenre) {
        uniqueContent = uniqueContent.filter(item => 
          item.genres && item.genres.includes(parseInt(selectedGenre))
        );
      }

      setResults(applySorting(uniqueContent));
    } catch (error) {
      console.error('Error loading initial content:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      let allResults = [];
      
      if (contentType === 'all' || contentType === 'movies') {
        const movieResults = await searchMovies(searchQuery, 50);
        allResults = [...allResults, ...movieResults.map(item => ({ ...item, type: 'movie' }))];
      }
      
      if (contentType === 'all' || contentType === 'shows') {
        const showResults = await searchShows(searchQuery, 50);
        allResults = [...allResults, ...showResults.map(item => ({ ...item, type: 'show' }))];
      }
      
      if (contentType === 'all' || contentType === 'anime') {
        const animeResults = await searchAnime(searchQuery, 50);
        allResults = [...allResults, ...animeResults.map(item => ({ ...item, type: 'anime' }))];
      }

      // Apply genre filter
      if (selectedGenre) {
        allResults = allResults.filter(item => 
          item.genres && item.genres.includes(parseInt(selectedGenre))
        );
      }

      setResults(applySorting(allResults));
    } catch (error) {
      console.error('Error searching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getItemType = (item) => {
    // Check if it's explicitly marked as anime
    if (item.type === 'anime') {
      return 'anime';
    }
    // Better detection logic for movies vs shows
    if (item.seasons !== undefined || item.totalEpisodes !== undefined || item.number_of_seasons !== undefined) {
      return 'show';
    }
    if (item.runtime !== undefined || item.release_date !== undefined) {
      return 'movie';
    }
    // Fallback: use title structure to detect
    return item.title?.english ? (item.seasons !== undefined ? 'show' : 'movie') : 'movie';
  };

  const applySorting = (items) => {
    const sortedItems = [...items];
    
    switch (sortBy) {
      case 'rating':
        return sortedItems.sort((a, b) => {
          const ratingA = a.rating || a.vote_average || 0;
          const ratingB = b.rating || b.vote_average || 0;
          return ratingB - ratingA;
        });
      case 'date':
        return sortedItems.sort((a, b) => {
          const dateA = new Date(a.releaseDate || a.release_date || a.first_air_date || 0);
          const dateB = new Date(b.releaseDate || b.release_date || b.first_air_date || 0);
          return dateB - dateA;
        });
      case 'title':
        return sortedItems.sort((a, b) => {
          const titleA = (a.title?.english || a.title?.original || a.name || a.original_name || '').toLowerCase();
          const titleB = (b.title?.english || b.title?.original || b.name || b.original_name || '').toLowerCase();
          return titleA.localeCompare(titleB);
        });
      case 'relevance':
      default:
        // For relevance, keep original order (search results are already sorted by relevance)
        return sortedItems;
    }
  };

  const getCurrentGenres = () => {
    if (contentType === 'movies') return movieGenres;
    if (contentType === 'shows') return showGenres;
    
    // Combine and deduplicate genres for 'all' content type
    const combined = [...movieGenres, ...showGenres];
    return combined.reduce((acc, genre) => {
      if (!acc.find(g => g.id === genre.id)) {
        acc.push(genre);
      }
      return acc;
    }, []);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      performSearch();
    }
  };

  return (
    <>
      <Head>
        <title>Search - NetFlex</title>
        <meta name="description" content="Search and discover movies and TV shows on NetFlex. Advanced filters and sorting options." />
      </Head>
      
      <MainLayout showBrowseButtons={false}>
        <ParticleBackground />
        <div className="pt-6 sm:pt-8 space-y-6 sm:space-y-8 relative z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <div className="mb-4 sm:mb-6">
              <button 
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-netflix-text-gray hover:text-netflix-white transition-colors group"
              >
                <FaArrowLeft className="group-hover:translate-x-[-2px] transition-transform" />
                <span className="text-sm sm:text-base">Back</span>
              </button>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-netflix-white mb-3 sm:mb-4">Advanced Search</h1>
            <p className="text-netflix-text-gray text-base sm:text-lg">
              Explore movies and TV shows with advanced filters and sorting options
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative mb-4 sm:mb-6">
              <div className="relative">
                <FaSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-netflix-text-gray text-sm sm:text-base" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies and TV shows..."
                  className="w-full bg-netflix-gray/20 border border-netflix-gray/40 rounded-lg pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 text-netflix-white placeholder-netflix-text-gray focus:outline-none focus:border-netflix-red transition-colors text-sm sm:text-base"
                />
              </div>
            </form>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-1 sm:space-x-2 bg-netflix-gray/20 hover:bg-netflix-gray/30 text-netflix-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                <FaFilter className="text-xs sm:text-sm" />
                <span>Filters</span>
              </button>

              {/* Content Type Filter */}
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="bg-netflix-gray/20 border border-netflix-gray/40 text-netflix-white px-2 sm:px-4 py-2 rounded-lg focus:outline-none focus:border-netflix-red text-sm sm:text-base"
              >
                <option value="all">All Content</option>
                <option value="movies">Movies</option>
                <option value="shows">TV Shows</option>
            <option value="anime">Anime</option>
              </select>

              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-netflix-gray/20 border border-netflix-gray/40 text-netflix-white px-2 sm:px-4 py-2 rounded-lg focus:outline-none focus:border-netflix-red text-sm sm:text-base"
              >
                <option value="relevance">Sort by Relevance</option>
                <option value="rating">Sort by Rating</option>
                <option value="date">Sort by Release Date</option>
                <option value="title">Sort by Title</option>
              </select>

              {/* Results Count */}
              <span className="text-netflix-text-gray text-sm sm:text-base">
                {results.length} results
              </span>
            </div>

            {/* Expandable Filters */}
            {showFilters && (
              <div className="bg-netflix-gray/10 border border-netflix-gray/30 rounded-lg p-4 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-netflix-white">Genre:</label>
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="bg-netflix-gray/20 border border-netflix-gray/40 text-netflix-white px-3 py-2 rounded focus:outline-none focus:border-netflix-red"
                    >
                      <option value="">All Genres</option>
                      {getCurrentGenres().map((genre) => (
                        <option key={genre.id} value={genre.id}>
                          {genre.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {(selectedGenre) && (
                    <button
                      onClick={() => {
                        setSelectedGenre('');
                      }}
                      className="flex items-center space-x-1 text-netflix-red hover:text-netflix-white transition-colors"
                    >
                      <FaTimes />
                      <span>Clear Filters</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Results Grid */}
          <div className="px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex items-center justify-center py-16 sm:py-20">
                <div className="text-netflix-white text-lg sm:text-xl">Loading...</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {results.map((item) => (
                  <div key={`${item.type}-${item.id}`}>
                                      {item.type === 'movie' ? (
                    <MovieCard data={item} />
                  ) : item.type === 'anime' ? (
                    <AnimeCard data={item} />
                  ) : (
                    <ShowCard data={item} />
                  )}
                  </div>
                ))}
              </div>
            )}

            {!loading && results.length === 0 && (
              <div className="text-center py-20">
                <h3 className="text-2xl text-netflix-white mb-2">
                  {searchQuery ? 'No results found' : 'Start your search'}
                </h3>
                <p className="text-netflix-text-gray">
                  {searchQuery 
                    ? 'Try adjusting your search terms or filters.'
                    : 'Enter a movie or TV show title to begin searching.'
                  }
                </p>
                {searchQuery && (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedGenre('');
                      setContentType('all');
                      setSortBy('relevance');
                    }}
                    className="mt-4 bg-netflix-red hover:bg-netflix-red-dark text-netflix-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Clear Search & Browse All
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    </>
  );
} 