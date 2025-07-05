import { useState, useEffect, useRef } from "react";
import { FaFilm, FaTv } from "react-icons/fa";
import { CgSearch } from "react-icons/cg";
import Logo from "../ui/Logo";
import SearchInput from "../ui/SearchInput";
import Link from "next/link";

function Header({ bg = false, type }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef(null);

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
            <Link href={`/trending`}>
              <button title="Trending" className="transition-all text-netflix-white hover:text-netflix-text-gray py-2 hover:underline underline-offset-4 decoration-2 decoration-netflix-red">
                <span>Trending</span>
              </button>
            </Link>
            {/* <button title="Movies" className="transition-all dark:text-secondary text-primary hover:bg-secondary-hover dark:hover:bg-primary-light py-2 px-5 my-auto rounded-lg flex flex-row space-x-2">
              <LuClapperboard className="mt-1" />
              <Link href={`/movies`}>Movies</Link>
            </button>
            <button title="Shows" className="transition-all dark:text-secondary text-primary hover:bg-secondary-hover dark:hover:bg-primary-light py-2 px-5 my-auto rounded-lg flex flex-row space-x-2">
              <PiTelevision className="mt-1" />
              <Link href={`/shows`}>Shows</Link>
            </button> */}
          </div>
        </div>
        <div className={`flex justify-end items-center space-x-4`}>
          <div onClick={handleSearchIconClick} className={`text-xl ${bg === true ? "hidden" : ""} transition-all text-netflix-white hover:text-netflix-text-gray p-2 hover:cursor-pointer`}>
            <CgSearch />
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