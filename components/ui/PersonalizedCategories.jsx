import React, { useState, useEffect } from 'react';
import { FaPlay, FaPlus, FaInfoCircle, FaStar, FaEye, FaChevronLeft, FaChevronRight, FaRobot, FaLightbulb } from 'react-icons/fa';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Link from 'next/link';
import { getSmartRecommendations } from '../../src/utils/recommendations';
import { getUserFeedback, shouldFilterContent } from '../../src/utils/userFeedback';
import { getPopularMovies, getTrendingMovies, getMoviesByGenre } from '../../src/handlers/movies';
import { getPopularShows, getTrendingShows, getShowsByGenre } from '../../src/handlers/shows';
import { getPopularAnime, getTrendingAnime, getAnimeByGenre } from '../../src/handlers/anime';
import FeedbackButton from './FeedbackButton';

const PersonalizedCategories = ({ type = 'all', contentType = 'all', limit = 20 }) => {
  // Support both 'type' and 'contentType' props for backward compatibility
  const activeType = type !== 'all' ? type : contentType;
  const [recommendations, setRecommendations] = useState({ sections: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeContentSections, setActiveContentSections] = useState({});
  const [userFeedback, setUserFeedback] = useState({ positive: {}, negative: {} });

  useEffect(() => {
    loadPersonalizedContent();
    loadUserFeedback();
  }, [activeType]);

  const loadUserFeedback = () => {
    try {
      const feedback = getUserFeedback();
      setUserFeedback(feedback);
    } catch (error) {
      console.error('Error loading user feedback:', error);
    }
  };

  const loadPersonalizedContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get enhanced smart recommendations with ML and feedback integration
      const smartRecs = await getSmartRecommendations({ 
        contentType: activeType, 
        limit,
        includeGenreBased: true,
        includeContentBased: true,
        includeTrending: true,
        includeHybridML: true,
        explorationRate: 0.15,
        diversityScore: 0.8
      });

      // Load actual content for each recommendation section with advanced filtering
      const processedSections = await Promise.all(
        smartRecs.sections.map(async (section) => {
          try {
            let content = await loadContentForSection(section);
            
            // Apply user feedback filtering
            if (content && content.length > 0) {
              content = content.filter(item => !shouldFilterContent(item, userFeedback));
              
              // Sort by advanced scoring if available
              if (section.type === 'hybrid_ml' || section.type === 'genre_based_enhanced') {
                content = await applyAdvancedScoring(content, smartRecs.patterns);
              }
            }
            
            return {
              ...section,
              content: content || [],
              hasContent: content && content.length > 0,
              mlEnhanced: section.type.includes('enhanced') || section.type === 'hybrid_ml'
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

  const applyAdvancedScoring = async (content, patterns) => {
    try {
      // Import scoring function dynamically to avoid circular dependencies
      const { calculateAdvancedContentScore } = await import('../../src/utils/recommendations');
      
      return content
        .map(item => ({
          ...item,
          recommendationScore: calculateAdvancedContentScore(item, patterns, userFeedback)
        }))
        .sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0));
    } catch (error) {
      console.error('Error applying advanced scoring:', error);
      return content;
    }
  };

  const handleFeedbackChange = (feedbackEntry) => {
    // Reload user feedback and potentially refresh recommendations
    loadUserFeedback();
    
    // Optional: Trigger a partial refresh of recommendations
    // This could be optimized to only update affected sections
    setTimeout(() => {
      loadPersonalizedContent();
    }, 1000);
  };

  const loadContentForSection = async (section) => {
    const { type, data } = section;

    try {
      switch (type) {
        case 'genre_based':
        case 'genre_based_enhanced':
        case 'secondary_genre':
          return await loadGenreBasedContent(data);
        
        case 'because_you_watched':
        case 'because_you_watched_enhanced':
          return await loadBecauseYouWatchedContent(data);
        
        case 'high_rated':
        case 'smart_high_rated':
          return await loadHighRatedContent(data);
        
        case 'trending_filtered':
        case 'contextual_trending':
          return await loadTrendingFilteredContent(data);

        case 'hybrid_ml':
          return await loadHybridMLContent(data);

        case 'exploration':
          return await loadExplorationContent(data);
        
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

  const loadHybridMLContent = async (data) => {
    // Combine multiple content sources with advanced weighting
    let content = [];

    try {
      // Get content from multiple sources based on algorithm components
      const promises = [];

      if (data.contentType === 'all' || data.contentType === 'movie') {
        promises.push(
          getPopularMovies(15).then(movies => movies.map(item => ({ ...item, type: 'movie', source: 'popular' })))
        );
        promises.push(
          getTrendingMovies(15).then(movies => movies.map(item => ({ ...item, type: 'movie', source: 'trending' })))
        );
      }
      
      if (data.contentType === 'all' || data.contentType === 'show') {
        promises.push(
          getPopularShows(15).then(shows => shows.map(item => ({ ...item, type: 'show', source: 'popular' })))
        );
        promises.push(
          getTrendingShows(15).then(shows => shows.map(item => ({ ...item, type: 'show', source: 'trending' })))
        );
      }
      
      if (data.contentType === 'all' || data.contentType === 'anime') {
        promises.push(
          getPopularAnime(15).then(anime => anime.map(item => ({ ...item, type: 'anime', source: 'popular' })))
        );
        promises.push(
          getTrendingAnime(15).then(anime => anime.map(item => ({ ...item, type: 'anime', source: 'trending' })))
        );
      }

      const results = await Promise.all(promises);
      content = results.flat();

      // Remove duplicates
      const uniqueContent = content.reduce((acc, item) => {
        const key = `${item.id}_${item.type}`;
        if (!acc.find(existing => `${existing.id}_${existing.type}` === key)) {
          acc.push(item);
        }
        return acc;
      }, []);

      return uniqueContent.slice(0, data.limit || 20);
    } catch (error) {
      console.error('Error loading hybrid ML content:', error);
      return [];
    }
  };

  const loadExplorationContent = async (data) => {
    let content = [];

    try {
      // Load content from unexplored genres
      if (data.includeGenres && data.includeGenres.length > 0) {
        const genrePromises = data.includeGenres.map(async (genre) => {
          const promises = [];
          
          if (data.contentType === 'all' || data.contentType === 'movie') {
            promises.push(getMoviesByGenre(genre, 5).then(movies => 
              movies.map(item => ({ ...item, type: 'movie', explorationGenre: genre }))
            ));
          }
          
          if (data.contentType === 'all' || data.contentType === 'show') {
            promises.push(getShowsByGenre(genre, 5).then(shows => 
              shows.map(item => ({ ...item, type: 'show', explorationGenre: genre }))
            ));
          }
          
          if (data.contentType === 'all' || data.contentType === 'anime') {
            promises.push(getAnimeByGenre(genre, 5).then(anime => 
              anime.map(item => ({ ...item, type: 'anime', explorationGenre: genre }))
            ));
          }

          const results = await Promise.all(promises);
          return results.flat();
        });

        const genreResults = await Promise.all(genrePromises);
        content = genreResults.flat();
      }

      // Filter by minimum rating if specified
      if (data.minRating) {
        content = content.filter(item => 
          (item.rating || item.vote_average || 0) >= data.minRating
        );
      }

      return content.slice(0, 15);
    } catch (error) {
      console.error('Error loading exploration content:', error);
      return [];
    }
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
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                  {section.mlEnhanced && (
                    <div className="flex items-center space-x-1 bg-gradient-to-r from-blue-600 to-purple-600 px-2 py-1 rounded-full">
                      <FaRobot className="text-xs" />
                      <span className="text-xs font-medium">AI Enhanced</span>
                    </div>
                  )}
                  {section.type === 'exploration' && (
                    <div className="flex items-center space-x-1 bg-gradient-to-r from-green-600 to-teal-600 px-2 py-1 rounded-full">
                      <FaLightbulb className="text-xs" />
                      <span className="text-xs font-medium">Discovery</span>
                    </div>
                  )}
                </div>
                {section.type === 'because_you_watched' || section.type === 'because_you_watched_enhanced' ? (
                  section.baseContent && (
                    <p className="text-netflix-text-gray text-sm mt-1">
                      Similar to "{formatContentTitle(section.baseContent)}"
                    </p>
                  )
                ) : section.description && (
                  <p className="text-netflix-text-gray text-sm mt-1">
                    {section.description}
                  </p>
                )}
              </div>
              
              {section.confidence && (
                <div className="text-right">
                  <div className="text-xs text-netflix-text-gray">Confidence</div>
                  <div className="text-sm font-medium">
                    {Math.round(section.confidence * 100)}%
                  </div>
                </div>
              )}
            </div>
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
                <div key={itemIndex} className="flex-shrink-0 w-48 group/item">
                  <Link href={getContentUrl(item)}>
                    <div className="cursor-pointer transform transition-all duration-300 hover:scale-105">
                      <div className="relative rounded-lg overflow-hidden bg-netflix-gray">
                        <div className="aspect-[2/3]">
                          <LazyLoadImage
                            effect="blur"
                            src={getImageUrl(item)}
                            alt={formatContentTitle(item)}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover/item:scale-110"
                          />
                        </div>
                        
                        {/* Enhanced overlay with more information */}
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
                            
                            <div className="flex items-center space-x-2 text-xs mb-2">
                              <span className="bg-green-600 px-2 py-1 rounded text-white font-semibold">
                                {item.recommendationScore ? 
                                  `${Math.round(item.recommendationScore * 100)}% Match` : 
                                  `${Math.round(formatRating(item) * 10)}% Match`
                                }
                              </span>
                              <div className="flex items-center">
                                <FaStar className="text-yellow-500 mr-1" />
                                <span>{formatRating(item)}</span>
                              </div>
                            </div>
                            
                            {/* Show genre tags for exploration content */}
                            {item.explorationGenre && (
                              <div className="text-xs text-green-400 mb-1">
                                New: {item.explorationGenre}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                  
                  {/* Title and feedback section */}
                  <div className="mt-2">
                    <h3 className="text-sm font-medium text-netflix-white truncate">
                      {formatContentTitle(item)}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-netflix-text-gray capitalize">
                          {item.type}
                        </span>
                        <div className="flex items-center text-xs text-netflix-text-gray">
                          <FaStar className="text-yellow-500 mr-1" />
                          {formatRating(item)}
                        </div>
                      </div>
                      
                      {/* Feedback buttons */}
                      <div className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                        <FeedbackButton
                          content={item}
                          size="xs"
                          onFeedbackChange={handleFeedbackChange}
                          className="scale-75"
                        />
                      </div>
                    </div>
                  </div>
                </div>
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