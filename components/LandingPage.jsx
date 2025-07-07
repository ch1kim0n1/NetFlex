import Link from "next/link";
import { FaPlay, FaInfoCircle, FaSearch } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import NetFlexIntro from "./ui/NetFlexIntro";
import AuthModal from "./auth/AuthModal";
import { useAuth } from "../src/contexts/AuthContext";

function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [showIntro, setShowIntro] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  
  // Fixed permanent background image - the cinematic one
  const permanentHeroImage = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2325&q=80";

  // Check for login parameter in URL
  useEffect(() => {
    if (router.query.login === 'true' && !isAuthenticated) {
      setShowIntro(false);
      setShowAuthModal(true);
    }
  }, [router.query.login, isAuthenticated]);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const handleAuthRequired = (mode = 'signin') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  // Show intro first (unless redirected for login)
  if (showIntro && router.query.login !== 'true') {
    return <NetFlexIntro onComplete={handleIntroComplete} />;
  }

  return (
    <div className="min-h-screen bg-netflix-black animate-fadeIn" style={{ animationDuration: '1.5s' }}>
      {/* Hero Section */}
      <div 
        className="relative h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${permanentHeroImage}')` }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-netflix-black/70 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-transparent"></div>
        
        {/* Hero Content */}
        <div className="relative z-10 flex items-center h-full px-8 lg:px-16">
          <div className="max-w-2xl">
            <h1 className="text-5xl lg:text-7xl font-black text-netflix-white mb-6 leading-tight">
              Unlimited movies, TV shows, and more
            </h1>
            <p className="text-xl lg:text-2xl text-netflix-text-gray mb-8 leading-relaxed">
              Watch anywhere. Cancel anytime. Ready to watch? Enter your email to create or restart your membership.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {isAuthenticated ? (
                <>
                  <Link href="/search">
                    <button className="bg-netflix-red hover:bg-netflix-red/80 text-netflix-white font-semibold py-4 px-8 rounded-md transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3">
                      <FaSearch className="text-xl" />
                      <span className="text-lg">Browse</span>
                    </button>
                  </Link>
                  <Link href="/trending">
                    <button className="bg-transparent border-2 border-netflix-white text-netflix-white hover:bg-netflix-white hover:text-netflix-black font-semibold py-4 px-8 rounded-md transition-all duration-300 flex items-center justify-center space-x-3">
                      <FaPlay className="text-xl" />
                      <span className="text-lg">Trending</span>
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => handleAuthRequired('signin')}
                    className="bg-netflix-red hover:bg-netflix-red/80 text-netflix-white font-semibold py-4 px-8 rounded-md transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3"
                  >
                    <FaPlay className="text-xl" />
                    <span className="text-lg">Get Started</span>
                  </button>
                  <button 
                    onClick={() => handleAuthRequired('signin')}
                    className="bg-transparent border-2 border-netflix-white text-netflix-white hover:bg-netflix-white hover:text-netflix-black font-semibold py-4 px-8 rounded-md transition-all duration-300 flex items-center justify-center space-x-3"
                  >
                    <FaInfoCircle className="text-xl" />
                    <span className="text-lg">Learn More</span>
                  </button>
                </>
              )}
            </div>

            {!isAuthenticated && (
              <p className="text-netflix-text-gray mt-6 text-sm">
                Ready to watch? <button 
                  onClick={() => handleAuthRequired('signin')}
                  className="text-netflix-white hover:text-netflix-red transition-colors underline"
                >
                  Sign in
                </button> or <button 
                  onClick={() => handleAuthRequired('signup')}
                  className="text-netflix-white hover:text-netflix-red transition-colors underline"
                >
                  create your account
                </button>.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20 px-8 lg:px-16 text-center bg-netflix-dark">
        <h2 className="text-4xl lg:text-5xl font-bold text-netflix-white mb-6">
          Ready to watch? Enter your email to create or restart your membership.
        </h2>
        <div className="max-w-md mx-auto">
          {isAuthenticated ? (
            <div className="space-y-4">
              <Link href="/search">
                <button className="w-full bg-netflix-red hover:bg-netflix-red/80 text-netflix-white font-semibold py-4 px-8 rounded-md transition-all duration-300">
                  Start Browsing
                </button>
              </Link>
            </div>
          ) : (
            <button 
              onClick={() => handleAuthRequired('signup')}
              className="w-full bg-netflix-red hover:bg-netflix-red/80 text-netflix-white font-semibold py-4 px-8 rounded-md transition-all duration-300"
            >
              Get Started
            </button>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </div>
  );
}

export default LandingPage;