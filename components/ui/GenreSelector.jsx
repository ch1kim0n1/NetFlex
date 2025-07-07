import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const GenreSelector = ({ genres, selectedGenre, onGenreSelect, type = 'show' }) => {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  useEffect(() => {
    const container = document.getElementById(`genre-container-${type}`);
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth);
    }
  }, [genres, type]);

  const scroll = (direction) => {
    const container = document.getElementById(`genre-container-${type}`);
    const scrollAmount = 200;
    
    if (container) {
      const newScrollLeft = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
      
      setTimeout(() => {
        setCanScrollLeft(container.scrollLeft > 0);
        setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth);
      }, 300);
    }
  };

  return (
    <div className="relative px-6 mb-8">
      <div className="flex flex-col space-y-4">
        <h3 className="text-xl font-semibold text-netflix-white">Browse by Genre</h3>
        
        <div className="relative max-w-full">
          {/* Left scroll button */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-netflix-black/90 hover:bg-netflix-black text-netflix-white p-2 rounded-full transition-all shadow-lg border border-netflix-gray/30"
            >
              <FaChevronLeft />
            </button>
          )}

          {/* Genre container - limited width */}
          <div
            id={`genre-container-${type}`}
            className="flex space-x-3 overflow-x-auto scrollbar-hide py-2 px-8 max-w-5xl mx-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onScroll={(e) => {
              const container = e.target;
              setCanScrollLeft(container.scrollLeft > 0);
              setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth);
            }}
          >
            {/* All genres option */}
            <button
              onClick={() => onGenreSelect(null)}
              className={`flex-none px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                selectedGenre === null
                  ? 'bg-netflix-red text-netflix-white shadow-lg'
                  : 'bg-netflix-gray/20 text-netflix-text-gray hover:bg-netflix-gray/30 hover:text-netflix-white'
              }`}
            >
              All Genres
            </button>
            
            {/* Individual genres */}
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => onGenreSelect(genre.id)}
                className={`flex-none px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedGenre === genre.id
                    ? 'bg-netflix-red text-netflix-white shadow-lg'
                    : 'bg-netflix-gray/20 text-netflix-text-gray hover:bg-netflix-gray/30 hover:text-netflix-white'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>

          {/* Right scroll button */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-netflix-black/90 hover:bg-netflix-black text-netflix-white p-2 rounded-full transition-all shadow-lg border border-netflix-gray/30"
            >
              <FaChevronRight />
            </button>
          )}
        </div>
        
        {/* Navigation instruction */}
        <div className="text-center">
          <p className="text-netflix-text-gray text-xs">
            Use arrow buttons or scroll horizontally to browse genres
          </p>
        </div>
      </div>
    </div>
  );
};

export default GenreSelector; 