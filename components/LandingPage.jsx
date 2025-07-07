import Link from "next/link";
import { FaPlay, FaInfoCircle, FaFire, FaDragon } from "react-icons/fa";
import React, { useState } from "react";
import NetFlexIntro from "./ui/NetFlexIntro";

function LandingPage() {
  const [showIntro, setShowIntro] = useState(true);
  
  // Fixed permanent background image - the cinematic one
  const permanentHeroImage = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2325&q=80";

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  // Show intro first
  if (showIntro) {
    return <NetFlexIntro onComplete={handleIntroComplete} />;
  }

  return (
    <div className="min-h-screen bg-netflix-black animate-fadeIn" style={{ animationDuration: '1.5s' }}>
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-netflix-black/70 to-netflix-black/30 z-10"></div>
          
          {/* Permanent background image */}
          <img
            src={permanentHeroImage}
            alt="Netflix Hero Background"
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
          
          {/* Floating particles animation */}
          <div className="absolute inset-0 z-5">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-netflix-red rounded-full opacity-20 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-20 px-8 max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-6xl md:text-8xl font-black text-netflix-white mb-6 leading-tight animate-fadeIn drop-shadow-2xl" style={{ textShadow: '0 0 20px rgba(229, 9, 20, 0.3), 0 0 40px rgba(229, 9, 20, 0.15)' }}>
              NetFlex
            </h1>
            <p className="text-xl md:text-2xl text-netflix-white mb-8 font-medium animate-fadeIn">
              Unlimited movies, TV shows and more.
            </p>
            <p className="text-lg text-netflix-text-gray mb-12 leading-relaxed animate-fadeIn">
              Stream thousands of movies and TV shows. Watch anywhere. Cancel anytime.
              No ads, no interruptions, just pure entertainment.
            </p>
            
            {/* Action Button */}
            <div className="flex justify-center mb-12 animate-fadeIn">
              <Link href="/search">
                <button className="group relative flex items-center justify-center gap-3 bg-netflix-red hover:bg-netflix-red-dark text-netflix-white font-bold py-5 px-10 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-2xl overflow-hidden">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-netflix-red/50 blur-xl animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-netflix-red via-netflix-red-dark to-netflix-red opacity-80"></div>
                  
                  {/* Content */}
                  <div className="relative flex items-center gap-3">
                    <FaPlay className="text-xl" />
                    <span className="text-xl">Start Search</span>
                  </div>
                  
                  {/* Additional glow on hover */}
                  <div className="absolute inset-0 bg-netflix-red/30 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Fade to black at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-netflix-black to-transparent z-15"></div>
      </div>

      {/* Content Categories */}
      <div className="px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <Link href="/shows">
              <div className="group relative overflow-hidden rounded-lg bg-netflix-gray/20 hover:bg-netflix-gray/30 transition-all duration-300 transform hover:scale-105">
                <div className="p-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-netflix-red rounded-full flex items-center justify-center">
                      <FaPlay className="text-netflix-white text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-netflix-white">TV Shows</h3>
                      <p className="text-netflix-text-gray">Binge-watch series</p>
                    </div>
                  </div>
                  <p className="text-netflix-text-gray mb-6">
                    Discover award-winning series, from gripping dramas to hilarious comedies.
                  </p>
                  <div className="flex items-center text-netflix-red group-hover:text-netflix-white transition-colors">
                    <span className="font-semibold">Explore TV Shows</span>
                    <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link href="/movies">
              <div className="group relative overflow-hidden rounded-lg bg-netflix-gray/20 hover:bg-netflix-gray/30 transition-all duration-300 transform hover:scale-105">
                <div className="p-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-netflix-red rounded-full flex items-center justify-center">
                      <FaInfoCircle className="text-netflix-white text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-netflix-white">Movies</h3>
                      <p className="text-netflix-text-gray">Blockbuster films</p>
                    </div>
                  </div>
                  <p className="text-netflix-text-gray mb-6">
                    From action-packed blockbusters to intimate indie films, find your next favorite movie.
                  </p>
                  <div className="flex items-center text-netflix-red group-hover:text-netflix-white transition-colors">
                    <span className="font-semibold">Browse Movies</span>
                    <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link href="/anime">
              <div className="group relative overflow-hidden rounded-lg bg-netflix-gray/20 hover:bg-netflix-gray/30 transition-all duration-300 transform hover:scale-105">
                <div className="p-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-netflix-red rounded-full flex items-center justify-center">
                      <FaDragon className="text-netflix-white text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-netflix-white">Anime</h3>
                      <p className="text-netflix-text-gray">Japanese animation</p>
                    </div>
                  </div>
                  <p className="text-netflix-text-gray mb-6">
                    Explore the world of anime, from popular series to critically acclaimed shows.
                  </p>
                  <div className="flex items-center text-netflix-red group-hover:text-netflix-white transition-colors">
                    <span className="font-semibold">Browse Anime</span>
                    <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/trending">
              <div className="group relative overflow-hidden rounded-lg bg-netflix-gray/20 hover:bg-netflix-gray/30 transition-all duration-300 transform hover:scale-105">
                <div className="p-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-netflix-red rounded-full flex items-center justify-center">
                      <FaFire className="text-netflix-white text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-netflix-white">Trending</h3>
                      <p className="text-netflix-text-gray">What's hot now</p>
                    </div>
                  </div>
                  <p className="text-netflix-text-gray mb-6">
                    Stay up-to-date with the most popular content that everyone is talking about.
                  </p>
                  <div className="flex items-center text-netflix-red group-hover:text-netflix-white transition-colors">
                    <span className="font-semibold">See Trending</span>
                    <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;