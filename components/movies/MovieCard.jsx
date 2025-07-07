import Link from "next/link";
import { FaFilm, FaStar, FaPlay, FaClock } from 'react-icons/fa';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

function MovieCard({ data }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.getFullYear();
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <>
      <Link href={"/movies/info/" + data.id}>
        <div className="group cursor-pointer">
          <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-netflix-gray">
            <div className="transition-all duration-300 ease-in-out group-hover:scale-110">
              <LazyLoadImage
                effect="blur"
                className="w-full h-full object-cover"
                src={data.image}
                alt={data.title.english || data.title.original}
              />
            </div>
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-netflix-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center justify-end mb-2">
                  <Link href={`/movies/watch/${data.id}`}>
                    <button 
                      className="bg-netflix-red hover:bg-netflix-red-dark text-netflix-white px-3 py-1 rounded-full text-xs font-medium transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Watch
                    </button>
                  </Link>
                </div>
                <h3 className="text-netflix-white font-bold text-sm line-clamp-2 mb-1">
                  {data.title.english || data.title.original}
                </h3>
                <div className="flex items-center space-x-3 text-xs text-netflix-text-gray">
                  {data.rating && (
                    <div className="flex items-center space-x-1">
                      <FaStar className="text-netflix-red" />
                      <span>{data.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {data.releaseDate && (
                    <span>{formatDate(data.releaseDate)}</span>
                  )}
                  {data.runtime && (
                    <div className="flex items-center space-x-1">
                      <FaClock className="text-netflix-text-gray" />
                      <span>{formatRuntime(data.runtime)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}

export default MovieCard; 