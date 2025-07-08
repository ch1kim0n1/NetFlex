import React, { useState, useEffect } from 'react';
import { FaPlay, FaPlus, FaInfoCircle, FaStar, FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Link from 'next/link';
import { getSmartRecommendations } from '../../src/utils/recommendations';
import { getPopularMovies, getTrendingMovies, getMoviesByGenre } from '../../src/handlers/movies';
import { getPopularShows, getTrendingShows, getShowsByGenre } from '../../src/handlers/shows';
import { getPopularAnime, getTrendingAnime, getAnimeByGenre } from '../../src/handlers/anime';

const PersonalizedCategories = ({ type = 'all', contentType = 'all', limit = 20 }) => {
  // Support both 'type' and 'contentType' props for backward compatibility
  const activeType = type !== 'all' ? type : contentType;
  const [recommendations, setRecommendations] = useState({ sections: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeContentSections, setActiveContentSections] = useState({});

  useEffect(() => {
    loadPersonalizedContent();
  }, [activeType]);

  const loadPersonalizedContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get smart recommendations
      const smartRecs = await getSmartRecommendations({ 
        contentType: activeType, 
        limit,
        includeGenreBased: true,
        includeContentBased: true,
        includeTrending: true 
      });

      // Load actual content for each recommendation section
      const processedSections = await Promise.all(
        smartRecs.sections.map(async (section) => {
          try {
            const content = await loadContentForSection(section);
            return {
              ...section,
              content: content || [],
              hasContent: content && content.length > 0
            };
          } catch (error) {
            console.error(`Error loading content for section ${section.title}:`, error);
            return {
              ...section,
              content: [],
              hasContent: false
            };
          }
        })
      );

      setRecommendations({
        ...smartRecs,
        sections: processedSections.filter(section => section.hasContent)
      });
    } catch (error) {
      console.error('Error loading personalized content:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadContentForSection = async (section) => {
    const { type, data } = section;

    try {
      switch (type) {
        case 'genre_based':
          return await loadGenreBasedContent(data);
        
        case 'because_you_watched':
          return await loadBecauseYouWatchedContent(data);
        
        case 'high_rated':
          return await loadHighRatedContent(data);
        
        case 'trending_filtered':
          return await loadTrendingFilteredContent(data);
        
        default:
          return [];
      }
    } catch (error) {
      console.error(`Error loading content for section type ${type}:`, error);
      return [];
    }
  };

  const loadGenreBasedContent = async (data) => {
    if (!data.genres || data.genres.length === 0) return [];

    const primaryGenre = data.genres[0];
    let content = [];

    try {
      if (data.contentType === 'all' || data.contentType === 'movie') {
        const movies = await getMoviesByGenre(primaryGenre, 10);
        content = [...content, ...movies.map(item => ({ ...item, type: 'movie' }))];
      }
      
      if (data.contentType === 'all' || data.contentType === 'show') {
        const shows = await getShowsByGenre(primaryGenre, 10);
        content = [...content, ...shows.map(item => ({ ...item, type: 'show' }))];
      }
      
      if (data.contentType === 'all' || data.contentType === 'anime') {
        const anime = await getAnimeByGenre(primaryGenre, 10);
        content = [...content, ...anime.map(item => ({ ...item, type: 'anime' }))];
      }
    } catch (error) {
      console.error('Error loading genre-based content:', error);
    }

    return content.slice(0, data.limit || 20);
  };

  const loadBecauseYouWatchedContent = async (data) => {
    if (!data.baseContent || !data.baseContent.genres) return [];

    const baseGenres = data.baseContent.genres;
    let content = [];

    try {
      if (data.baseContent.type === 'movie' || !data.baseContent.type) {
        const movies = await getMoviesByGenre(baseGenres[0], 10);
        content = [...content, ...movies
          .filter(movie => movie.id !== data.baseContent.id) // Exclude the base content
          .map(item => ({ ...item, type: 'movie' }))
        ];
      }
      
      if (data.baseContent.type === 'show') {
        const shows = await getShowsByGenre(baseGenres[0], 10);
        content = [...content, ...shows
          .filter(show => show.id !== data.baseContent.id) // Exclude the base content
          .map(item => ({ ...item, type: 'show' }))
        ];
      }
      
      if (data.baseContent.type === 'anime') {
        const anime = await getAnimeByGenre(baseGenres[0], 10);
        content = [...content, ...anime
          .filter(animeItem => animeItem.id !== data.baseContent.id) // Exclude the base content
          .map(item => ({ ...item, type: 'anime' }))
        ];
      }
    } catch (error) {
      console.error('Error loading because-you-watched content:', error);
    }

    return content.slice(0, 10);
  };

  const loadHighRatedContent = async (data) => {
    let content = [];

    try {
      if (data.contentType === 'all' || data.contentType === 'movie') {
        const movies = await getPopularMovies(15);
        content = [...content, ...movies
          .filter(movie => (movie.rating || movie.vote_average || 0) >= (data.minRating || 7))
          .map(item => ({ ...item, type: 'movie' }))
        ];
      }
      
      if (data.contentType === 'all' || data.contentType === 'show') {
        const shows = await getPopularShows(15);
        content = [...content, ...shows
          .filter(show => (show.rating || show.vote_average || 0) >= (data.minRating || 7))
          .map(item => ({ ...item, type: 'show' }))
        ];
      }
      
      if (data.contentType === 'all' || data.contentType === 'anime') {
        const anime = await getPopularAnime(15);
        content = [...content, ...anime
          .filter(animeItem => (animeItem.rating || animeItem.vote_average || 0) >= (data.minRating || 7))
          .map(item => ({ ...item, type: 'anime' }))
        ];
      }
    } catch (error) {
      console.error('Error loading high-rated content:', error);
    }

    return content.slice(0, 20);
  };

  const loadTrendingFilteredContent = async (data) => {
    let content = [];

    try {
      if (data.contentType === 'all' || data.contentType === 'movie') {
        const movies = await getTrendingMovies(15);
        content = [...content, ...movies.map(item => ({ ...item, type: 'movie' }))];
      }
      
      if (data.contentType === 'all' || data.contentType === 'show') {
        const shows = await getTrendingShows(15);
        content = [...content, ...shows.map(item => ({ ...item, type: 'show' }))];
      }
      
      if (data.contentType === 'all' || data.contentType === 'anime') {
        const anime = await getTrendingAnime(15);
        content = [...content, ...anime.map(item => ({ ...item, type: 'anime' }))];
      }
    } catch (error) {
      console.error('Error loading trending content:', error);
    }

    // Filter by preferred genres if available
    if (data.genres && data.genres.length > 0) {
      content = content.filter(item => {
        if (!item.genres) return true;
        return item.genres.some(genre => {
          const genreName = typeof genre === 'object' ? genre.name : genre;
          return data.genres.includes(genreName);
        });
      });
    }

    return content.slice(0, 20);
  };

  const scrollSection = (sectionIndex, direction) => {
    const sectionElement = document.getElementById(`section-${sectionIndex}`);
    if (sectionElement) {
      const scrollAmount = 300;
      const currentScroll = sectionElement.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      sectionElement.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  const formatContentTitle = (item) => {
    if (item.title?.english) return item.title.english;
    if (item.title?.original) return item.title.original;
    if (item.title) return item.title;
    if (item.name) return item.name;
    if (item.original_name) return item.original_name;
    return 'Untitled';
  };

  const formatRating = (item) => {
    const rating = item.rating || item.vote_average || 0;
    return Math.round(rating * 10) / 10;
  };

  const getContentUrl = (item) => {
    if (item.type === 'movie') {
      return `/movies/info/${item.id}`;
    } else if (item.type === 'show') {
      return `/shows/info/${item.id}`;
    } else if (item.type === 'anime') {
      return `/anime/info/${item.id}`;
    }
    return '#';
  };

  const getImageUrl = (item) => {
    if (item.image) return item.image;
    if (item.poster_path) return `https://image.tmdb.org/t/p/w500${item.poster_path}`;
    return '/placeholder-poster.jpg';
  };

  if (loading) {
    return (
      <div className="text-netflix-white p-6">
        <div className="animate-pulse space-y-8">
          {[1, 2, 3].map(i => (
            <div key={i}>
              <div className="h-6 bg-netflix-gray rounded w-64 mb-4"></div>
              <div className="flex space-x-4">
                {[1, 2, 3, 4, 5].map(j => (
                  <div key={j} className="w-48 h-72 bg-netflix-gray rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-netflix-white p-6">
        <div className="bg-netflix-dark rounded-lg p-6 text-center">
          <p className="text-red-500 mb-2">Error loading personalized content</p>
          <p className="text-netflix-text-gray text-sm">{error}</p>
          <button 
            onClick={loadPersonalizedContent}
            className="mt-4 bg-netflix-red text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (recommendations.sections.length === 0) {
    return (
      <div className="text-netflix-white p-6">
        <div className="bg-netflix-dark rounded-lg p-8 text-center">
          <FaEye className="text-4xl text-netflix-text-gray mb-4 mx-auto" />
          <h3 className="text-xl font-semibold mb-2">No Personalized Content Yet</h3>
          <p className="text-netflix-text-gray">
            Watch some content to get personalized recommendations!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-netflix-white">
      {recommendations.sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mb-12">
          <div className="px-6 mb-4">
            <h2 className="text-2xl font-bold mb-2">{section.title}</h2>
            {section.type === 'because_you_watched' && section.baseContent && (
              <p className="text-netflix-text-gray text-sm">
                Similar to "{formatContentTitle(section.baseContent)}"
              </p>
            )}
          </div>
          
          <div className="relative group">
            {/* Left scroll button */}
            <button
              onClick={() => scrollSection(sectionIndex, 'left')}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-netflix-black bg-opacity-70 hover:bg-opacity-90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <FaChevronLeft />
            </button>

            {/* Content scroll container */}
            <div
              id={`section-${sectionIndex}`}
              className="flex space-x-4 overflow-x-auto scrollbar-hide px-6"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {section.content.map((item, itemIndex) => (
                <Link key={itemIndex} href={getContentUrl(item)}>
                  <div className="flex-shrink-0 w-48 cursor-pointer group/item transform transition-all duration-300 hover:scale-105">
                    <div className="relative rounded-lg overflow-hidden bg-netflix-gray">
                      <div className="aspect-[2/3]">
                        <LazyLoadImage
                          effect="blur"
                          src={getImageUrl(item)}
                          alt={formatContentTitle(item)}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover/item:scale-110"
                        />
                      </div>
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                                <FaPlay className="text-black text-xs ml-0.5" />
                              </button>
                              <button className="w-8 h-8 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white transition-colors">
                                <FaPlus className="text-white text-xs" />
                              </button>
                            </div>
                            <button className="w-8 h-8 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white transition-colors">
                              <FaInfoCircle className="text-white text-xs" />
                            </button>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="bg-green-600 px-2 py-1 rounded text-white font-semibold">
                              {Math.round(formatRating(item) * 10)}% Match
                            </span>
                            <div className="flex items-center">
                              <FaStar className="text-yellow-500 mr-1" />
                              <span>{formatRating(item)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Title below poster */}
                    <div className="mt-2">
                      <h3 className="text-sm font-medium text-netflix-white truncate">
                        {formatContentTitle(item)}
                      </h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-netflix-text-gray capitalize">
                          {item.type}
                        </span>
                        <div className="flex items-center text-xs text-netflix-text-gray">
                          <FaStar className="text-yellow-500 mr-1" />
                          {formatRating(item)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Right scroll button */}
            <button
              onClick={() => scrollSection(sectionIndex, 'right')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-netflix-black bg-opacity-70 hover:bg-opacity-90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PersonalizedCategories; 