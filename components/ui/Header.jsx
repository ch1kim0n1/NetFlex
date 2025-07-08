import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { FaFilm, FaTv, FaDragon } from "react-icons/fa";
import { CgSearch } from "react-icons/cg";
import Logo from "../ui/Logo";
import SearchInput from "../ui/SearchInput";
import Link from "next/link";

function Header({ bg = false, type, showBrowseButtons = false }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef(null);

  const isActivePage = (path) => {
    return router.pathname.startsWith(path);
  };

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 0;
      setIsScrolled(isScrolled);
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSearchIconClick = () => {
    setIsMenuOpen(true); // Open the search menu
    setTimeout(() => {
      // Ensure the menu is open before focusing
      searchInputRef.current.focusInput();
    }, 0);
  };

  return (
    <>
      <div
        className={`z-50 transition-all py-4 px-6 flex justify-between left-0 items-center top-0 right-0 ${bg === true ? "bg-gradient-to-b from-netflix-black/90 to-transparent" : "bg-netflix-black"} ${isScrolled ? `sticky top-0 bg-netflix-black/95 backdrop-filter backdrop-blur-lg shadow-lg` : ''}`}
      >
        <div className="z-50 flex flex-row space-x-5">
          <Logo />
          
          {/* Browse Navigation - White Buttons for Movies/Shows/Search pages */}
          {showBrowseButtons && (
            <>
              {/* Desktop Browse Buttons */}
              <div className="hidden lg:flex my-auto space-x-3 ml-8">
                <Link href={`/movies`}>
                  <button className={`transition-all px-4 py-2 rounded-lg font-medium flex items-center space-x-2 ${
                    isActivePage('/movies') 
                      ? 'bg-netflix-red text-netflix-white shadow-lg' 
                      : 'bg-netflix-white text-netflix-black hover:bg-netflix-text-gray'
                  }`}>
                    <FaFilm />
                    <span>Browse Movies</span>
                  </button>
                </Link>
                <Link href={`/shows`}>
                  <button className={`transition-all px-4 py-2 rounded-lg font-medium flex items-center space-x-2 ${
                    isActivePage('/shows') 
                      ? 'bg-netflix-red text-netflix-white shadow-lg' 
                      : 'bg-netflix-white text-netflix-black hover:bg-netflix-text-gray'
                  }`}>
                    <FaTv />
                    <span>Browse Shows</span>
                  </button>
                </Link>
                <Link href={`/anime`}>
                  <button className={`transition-all px-4 py-2 rounded-lg font-medium flex items-center space-x-2 ${
                    isActivePage('/anime') 
                      ? 'bg-netflix-red text-netflix-white shadow-lg' 
                      : 'bg-netflix-white text-netflix-black hover:bg-netflix-text-gray'
                  }`}>
                    <FaDragon />
                    <span>Browse Anime</span>
                  </button>
                </Link>
                <Link href={`/search`}>
                  <button className={`transition-all px-4 py-2 rounded-lg font-medium flex items-center space-x-2 ${
                    isActivePage('/search') 
                      ? 'bg-netflix-red text-netflix-white shadow-lg' 
                      : 'bg-netflix-white text-netflix-black hover:bg-netflix-text-gray'
                  }`}>
                    <CgSearch />
                    <span>Advanced Search</span>
                  </button>
                </Link>
              </div>
              
              {/* Mobile Browse Buttons */}
              <div className="flex lg:hidden my-auto space-x-2 ml-4">
                <Link href={`/movies`}>
                  <button className="bg-netflix-white text-netflix-black hover:bg-netflix-text-gray transition-all p-2 rounded-lg" title="Browse Movies">
                    <FaFilm />
                  </button>
                </Link>
                <Link href={`/shows`}>
                  <button className="bg-netflix-white text-netflix-black hover:bg-netflix-text-gray transition-all p-2 rounded-lg" title="Browse Shows">
                    <FaTv />
                  </button>
                </Link>
                <Link href={`/anime`}>
                  <button className="bg-netflix-white text-netflix-black hover:bg-netflix-text-gray transition-all p-2 rounded-lg" title="Browse Anime">
                    <FaDragon />
                  </button>
                </Link>
                <Link href={`/search`}>
                  <button className="bg-netflix-white text-netflix-black hover:bg-netflix-text-gray transition-all p-2 rounded-lg" title="Advanced Search">
                    <CgSearch />
                  </button>
                </Link>
              </div>
            </>
          )}

          {/* Default Navigation - Underline style for other pages */}
          {!showBrowseButtons && (
            <div className="hidden lg:flex my-auto text-sm font-medium text-netflix-white space-x-6 ml-8">
              <Link href={`/shows`}>
                <button title="TV Shows" className="transition-all text-netflix-white hover:text-netflix-text-gray py-2 hover:underline underline-offset-4 decoration-2 decoration-netflix-red">
                  <span>TV Shows</span>
                </button>
              </Link>
              <Link href={`/movies`}>
                <button title="Movies" className="transition-all text-netflix-white hover:text-netflix-text-gray py-2 hover:underline underline-offset-4 decoration-2 decoration-netflix-red">
                  <span>Movies</span>
                </button>
              </Link>
              <Link href={`/anime`}>
                <button title="Anime" className="transition-all text-netflix-white hover:text-netflix-text-gray py-2 hover:underline underline-offset-4 decoration-2 decoration-netflix-red">
                  <span>Anime</span>
                </button>
              </Link>
              <Link href={`/trending`}>
                <button title="Trending" className="transition-all text-netflix-white hover:text-netflix-text-gray py-2 hover:underline underline-offset-4 decoration-2 decoration-netflix-red">
                  <span>Trending</span>
                </button>
              </Link>
              <Link href={`/search`}>
                <button title="Search" className="transition-all text-netflix-white hover:text-netflix-text-gray py-2 hover:underline underline-offset-4 decoration-2 decoration-netflix-red">
                  <span>Search</span>
                </button>
              </Link>
              <Link href={`/analytics`}>
                <button title="Your Analytics" className="transition-all text-netflix-white hover:text-netflix-text-gray py-2 hover:underline underline-offset-4 decoration-2 decoration-netflix-red">
                  <span>Analytics</span>
                </button>
              </Link>
            </div>
          )}
        </div>
        <div className={`flex justify-end items-center space-x-4`}>
          <div onClick={handleSearchIconClick} className={`${bg === true ? "hidden" : ""} transition-all text-netflix-white hover:text-netflix-text-gray p-2 hover:cursor-pointer flex items-center space-x-2`}>
            <CgSearch className="text-xl" />
            <span className="hidden md:inline text-sm">Quick Search</span>
          </div>
        </div>
      </div>

      <div
        onClick={() => setIsMenuOpen(false)}
        className={`transition-all fixed ${isMenuOpen ? "z-30 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-80" : ""} w-screen h-screen`}
      />

      <div
        onClick={() => setIsMenuOpen(false)}
        className={`transition-all pt-2 p-5 z-30 fixed ${isMenuOpen ? "top-0 left-0 right-0 bottom-0" : "-top-full"} w-screen flex items-center justify-center transform transition-transform ${isMenuOpen ? "scale-100" : "scale-0"}`}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <SearchInput ref={searchInputRef} type={type} />
        </div>
      </div>
    </>
  );
}

export default Header;