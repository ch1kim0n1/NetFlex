import { useState, useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

function ContentRow({ title, children, className = "" }) {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const rowRef = useRef(null);

  const scroll = (direction) => {
    const { current } = rowRef;
    if (current) {
      const scrollAmount = current.clientWidth * 0.8;
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleScroll = () => {
    const { current } = rowRef;
    if (current) {
      const { scrollLeft, scrollWidth, clientWidth } = current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <div className={`relative group ${className}`}>
      <h2 className="text-netflix-white text-xl font-semibold mb-4 px-6">{title}</h2>
      
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-20 bg-netflix-black/80 hover:bg-netflix-black/90 text-netflix-white p-2 rounded-full transition-all duration-300 ${
            showLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
          } group-hover:opacity-100`}
        >
          <FaChevronLeft size={20} />
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-20 bg-netflix-black/80 hover:bg-netflix-black/90 text-netflix-white p-2 rounded-full transition-all duration-300 ${
            showRightArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
          } group-hover:opacity-100`}
        >
          <FaChevronRight size={20} />
        </button>

        {/* Content Row */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto scrollbar-hide space-x-4 px-6 py-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default ContentRow; 