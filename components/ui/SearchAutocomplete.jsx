import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { CgSearch } from 'react-icons/cg';
import { FaFilm, FaTv, FaSpinner } from 'react-icons/fa';
import { searchMovies } from '../../src/handlers/movies';
import { searchShows } from '../../src/handlers/shows';

function SearchAutocomplete({ onClose, searchType = 'shows', autoFocus = false }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const searchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setLoading(true);
        let results = [];
        
        if (searchType === 'movies') {
          results = await searchMovies(query.trim(), 8);
        } else {
          results = await searchShows(query.trim(), 8);
        }

        setSuggestions(results);
      } catch (error) {
        console.error('Error searching:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, searchType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    router.push(`/${searchType}/search/${encodeURIComponent(query.trim())}`);
    onClose?.();
  };

  const handleSuggestionClick = (suggestion) => {
    if (searchType === 'movies') {
      router.push(`/movies/info/${suggestion.id}`);
    } else {
      router.push(`/shows/info/${suggestion.id}`);
    }
    onClose?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose?.();
      return;
    }

    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center bg-netflix-dark border border-netflix-gray rounded-lg overflow-hidden">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder={`Search ${searchType === 'movies' ? 'movies' : 'TV shows'}...`}
            className="flex-1 bg-transparent text-netflix-white px-4 py-3 placeholder-netflix-text-gray focus:outline-none"
          />
          
          <div className="flex items-center px-4">
            {loading && (
              <FaSpinner className="text-netflix-text-gray animate-spin mr-2" />
            )}
            <button
              type="submit"
              className="text-netflix-text-gray hover:text-netflix-white transition-colors"
            >
              <CgSearch className="text-xl" />
            </button>
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {(suggestions.length > 0 || (query.length >= 2 && !loading)) && (
          <div 
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-1 bg-netflix-dark border border-netflix-gray rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {suggestions.length > 0 ? (
              <>
                {suggestions.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => handleSuggestionClick(item)}
                    className={`flex items-center space-x-3 p-3 cursor-pointer transition-colors ${
                      index === selectedIndex
                        ? 'bg-netflix-red/20'
                        : 'hover:bg-netflix-gray/30'
                    }`}
                  >
                    <div className="flex-shrink-0 w-12 h-16 bg-netflix-gray rounded overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title?.english || item.title?.original}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {searchType === 'movies' ? (
                            <FaFilm className="text-netflix-text-gray" />
                          ) : (
                            <FaTv className="text-netflix-text-gray" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-netflix-white font-medium truncate">
                        {item.title?.english || item.title?.original}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-netflix-text-gray">
                        {item.releaseDate && (
                          <span>{formatDate(item.releaseDate)}</span>
                        )}
                        {item.rating && (
                          <span>⭐ {item.rating.toFixed(1)}</span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-netflix-text-gray mt-1 line-clamp-2">
                          {item.description.length > 100 
                            ? `${item.description.substring(0, 100)}...`
                            : item.description
                          }
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Show all results link */}
                <div
                  onClick={handleSubmit}
                  className="border-t border-netflix-gray/30 p-3 text-center cursor-pointer hover:bg-netflix-gray/20 transition-colors"
                >
                  <span className="text-netflix-red text-sm">
                    View all results for "{query}"
                  </span>
                </div>
              </>
            ) : (
              query.length >= 2 && !loading && (
                <div className="p-4 text-center text-netflix-text-gray">
                  No {searchType} found for "{query}"
                </div>
              )
            )}
          </div>
        )}
      </form>
    </div>
  );
}

export default SearchAutocomplete; 