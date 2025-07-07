import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { FaFilm, FaTv, FaUser, FaCaretDown, FaSignOutAlt, FaUserShield } from "react-icons/fa";
import { CgSearch } from "react-icons/cg";
import Logo from "../ui/Logo";
import SearchInput from "../ui/SearchInput";
import AuthModal from "../auth/AuthModal";
import ProfileSelector from "../auth/ProfileSelector";
import { useAuth } from "../../src/contexts/AuthContext";
import Link from "next/link";

function Header({ bg = false, type, showBrowseButtons = false }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchInputRef = useRef(null);
  const { isAuthenticated, currentProfile, logout, user, isLoading, isAdmin, selectProfile } = useAuth();

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
    setIsMenuOpen(true);
    setTimeout(() => {
      searchInputRef.current.focusInput();
    }, 0);
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setShowAuthModal(true);
  };

  const handleProfileChange = () => {
    setShowProfileSelector(true);
    setShowUserMenu(false);
  };

  const handleProfileSelect = (profile) => {
    selectProfile(profile);
    setShowProfileSelector(false);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/');
  };

  // Don't render auth buttons if still loading
  if (isLoading) {
    return (
      <div className={`z-50 transition-all py-4 px-6 flex justify-between left-0 items-center top-0 right-0 ${bg === true ? "bg-gradient-to-b from-netflix-black/90 to-transparent" : "bg-netflix-black"} ${isScrolled ? `sticky top-0 bg-netflix-black/95 backdrop-filter backdrop-blur-lg shadow-lg` : ''}`}>
        <div className="z-50 flex flex-row space-x-5">
          <Logo />
        </div>
        <div className="flex justify-end items-center space-x-4">
          <div className="w-8 h-8 bg-netflix-gray/30 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`z-50 transition-all py-4 px-6 flex justify-between left-0 items-center top-0 right-0 ${bg === true ? "bg-gradient-to-b from-netflix-black/90 to-transparent" : "bg-netflix-black"} ${isScrolled ? `sticky top-0 bg-netflix-black/95 backdrop-filter backdrop-blur-lg shadow-lg` : ''}`}
      >
        <div className="z-50 flex flex-row space-x-5">
          <Logo />
          
          {/* Browse Navigation - Show only if authenticated */}
          {isAuthenticated && showBrowseButtons && (
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
                <Link href={`/search`}>
                  <button className="bg-netflix-white text-netflix-black hover:bg-netflix-text-gray transition-all p-2 rounded-lg" title="Advanced Search">
                    <CgSearch />
                  </button>
                </Link>
              </div>
            </>
          )}

          {/* Default Navigation - Show only if authenticated */}
          {isAuthenticated && !showBrowseButtons && (
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
              <Link href={`/search`}>
                <button title="Search" className="transition-all text-netflix-white hover:text-netflix-text-gray py-2 hover:underline underline-offset-4 decoration-2 decoration-netflix-red">
                  <span>Search</span>
                </button>
              </Link>
            </div>
          )}
        </div>

        <div className={`flex justify-end items-center space-x-4`}>
          {/* Search Icon - Show only if authenticated */}
          {isAuthenticated && (
            <div onClick={handleSearchIconClick} className={`${bg === true ? "hidden" : ""} transition-all text-netflix-white hover:text-netflix-text-gray p-2 hover:cursor-pointer flex items-center space-x-2`}>
              <CgSearch className="text-xl" />
              <span className="hidden md:inline text-sm">Quick Search</span>
            </div>
          )}

          {/* Authentication Section */}
          {!isAuthenticated ? (
            /* Guest User - Show Sign In button only */
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSignIn}
                className="px-4 py-2 bg-netflix-red hover:bg-netflix-red/80 text-netflix-white rounded-md transition-colors font-medium"
              >
                Sign In
              </button>
            </div>
          ) : (
            /* Authenticated User - Show Profile */
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-netflix-gray/20 transition-colors"
              >
                {currentProfile ? (
                  <>
                    <img
                      src={currentProfile.avatar}
                      alt={currentProfile.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                    <span className="hidden md:inline text-netflix-white text-sm font-medium">
                      {currentProfile.name}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 bg-netflix-red rounded flex items-center justify-center">
                      <FaUser className="text-netflix-white text-sm" />
                    </div>
                    <span className="hidden md:inline text-netflix-white text-sm font-medium">
                      {user.firstName}
                    </span>
                  </>
                )}
                <FaCaretDown className="text-netflix-text-gray text-sm" />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-netflix-black border border-netflix-gray/30 rounded-lg shadow-2xl py-2 z-60">
                  <div className="px-4 py-2 border-b border-netflix-gray/30">
                    <p className="text-netflix-white text-sm font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-netflix-text-gray text-xs">{user.email}</p>
                    {isAdmin && (
                      <p className="text-netflix-red text-xs font-medium mt-1">ADMIN</p>
                    )}
                  </div>
                  
                  {isAdmin && (
                    <>
                      <Link href="/admin/dashboard">
                        <button className="w-full text-left px-4 py-2 text-netflix-white hover:bg-netflix-gray/20 transition-colors flex items-center space-x-2">
                          <FaUserShield className="text-sm text-netflix-red" />
                          <span>Admin Dashboard</span>
                        </button>
                      </Link>
                      <div className="border-b border-netflix-gray/30 my-2"></div>
                    </>
                  )}
                  
                  <button
                    onClick={handleProfileChange}
                    className="w-full text-left px-4 py-2 text-netflix-white hover:bg-netflix-gray/20 transition-colors"
                  >
                    Switch Profile
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-netflix-white hover:bg-netflix-gray/20 transition-colors flex items-center space-x-2"
                  >
                    <FaSignOutAlt className="text-sm" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Close user menu when clicking outside */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Search Modal */}
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        onShowProfileSelector={() => {
          setShowAuthModal(false);
          setTimeout(() => setShowProfileSelector(true), 100);
        }}
      />

      {/* Profile Selector */}
              <ProfileSelector
          isOpen={showProfileSelector}
          onClose={() => setShowProfileSelector(false)}
          onProfileSelect={handleProfileSelect}
        />
    </>
  );
}

export default Header;