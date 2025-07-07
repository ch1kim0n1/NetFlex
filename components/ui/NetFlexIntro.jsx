import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const NetFlexIntro = ({ onComplete }) => {
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const backgroundRef = useRef(null);
  const particlesRef = useRef(null);
  const lightSweepRef = useRef(null);
  const glowRef = useRef(null);
  const reviewsRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  const [particles, setParticles] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Generate particle system
  useEffect(() => {
    const particleArray = [];
    for (let i = 0; i < 25; i++) {
      particleArray.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        speed: Math.random() * 0.5 + 0.2,
      });
    }
    setParticles(particleArray);

    // Generate review testimonials
    const reviewTexts = [
      { text: "Best streaming platform ever created!", rating: 5, author: "Sarah M." },
      { text: "Netflix killer! Amazing content selection.", rating: 5, author: "Mike T." },
      { text: "Crystal clear quality and no buffering.", rating: 5, author: "Emma L." },
      { text: "Love the interface and recommendations!", rating: 4, author: "David R." },
      { text: "Finally, a platform that actually works!", rating: 5, author: "Lisa K." },
      { text: "Incredible variety of shows and movies.", rating: 5, author: "John D." },
      { text: "Smooth streaming, zero interruptions.", rating: 4, author: "Ana G." },
      { text: "This is the future of entertainment!", rating: 5, author: "Chris P." },
      { text: "Blown away by the user experience.", rating: 5, author: "Maya S." },
      { text: "Perfect for binge-watching sessions!", rating: 4, author: "Tom W." }
    ];

    const reviewArray = [];
    for (let i = 0; i < 3; i++) {
      const randomReview = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];
      
      // Generate position that avoids center (logo area)
      let x, y;
      const side = Math.floor(Math.random() * 4);
      
      switch(side) {
        case 0: // Top area
          x = Math.random() * 80 + 10;
          y = Math.random() * 25 + 5; // Top 30%
          break;
        case 1: // Bottom area  
          x = Math.random() * 80 + 10;
          y = Math.random() * 25 + 70; // Bottom 30%
          break;
        case 2: // Left area
          x = Math.random() * 25 + 5; // Left 30%
          y = Math.random() * 60 + 20; // Avoid very top/bottom
          break;
        case 3: // Right area
          x = Math.random() * 25 + 70; // Right 30%
          y = Math.random() * 60 + 20; // Avoid very top/bottom
          break;
      }
      
      reviewArray.push({
        id: i,
        ...randomReview,
        x: x,
        y: y,
        delay: Math.random() * 4 + 1, // Stagger appearance
        duration: Math.random() * 2 + 3, // How long they stay
      });
    }
    setReviews(reviewArray);
  }, []);

  // Main animation timeline
  useEffect(() => {
    if (!containerRef.current || !logoRef.current) return;

    const tl = gsap.timeline();
    const container = containerRef.current;
    const logo = logoRef.current;
    const background = backgroundRef.current;
    const particlesContainer = particlesRef.current;
    const lightSweep = lightSweepRef.current;
    const glow = glowRef.current;
    const reviewsContainer = reviewsRef.current;

    // Set initial states
    gsap.set(container, { opacity: 0 });
    gsap.set(logo, { 
      opacity: 0, 
      rotationY: -90, 
      scale: 0.8,
      transformOrigin: "center center",
      transformStyle: "preserve-3d"
    });
    gsap.set(background, { opacity: 0 });
    gsap.set(particlesContainer, { opacity: 0 });
    gsap.set(lightSweep, { x: -200, opacity: 0 });
    gsap.set(glow, { opacity: 0, scale: 0.8 });
    gsap.set(reviewsContainer, { opacity: 0 });

    // Animation sequence
    tl
      // 1. Fade in container and background
      .to(container, { 
        opacity: 1, 
        duration: 0.8, 
        ease: "power2.inOut" 
      })
      .to(background, { 
        opacity: 1, 
        duration: 1.2, 
        ease: "power2.inOut" 
      }, "-=0.4")
      
      // 2. Logo 3D rotation entrance
      .to(logo, { 
        opacity: 1, 
        rotationY: 0, 
        scale: 1,
        duration: 1.5, 
        ease: "power3.out",
        transformOrigin: "center center"
      }, "-=0.6")
      
      // 3. Glow effect appears
      .to(glow, { 
        opacity: 0.8, 
        scale: 1,
        duration: 0.8, 
        ease: "power2.out" 
      }, "-=0.8")
      
      // 4. Particles fade in
      .to(particlesContainer, { 
        opacity: 1, 
        duration: 1, 
        ease: "power2.inOut" 
      }, "-=1")
      
      // 4.5. Reviews fade in
      .to(reviewsContainer, { 
        opacity: 1, 
        duration: 0.8, 
        ease: "power2.inOut" 
      }, "-=0.5")
      
      // 5. Light sweep effect
      .to(lightSweep, { 
        opacity: 1, 
        duration: 0.1 
      }, "+=0.5")
      .to(lightSweep, { 
        x: 300, 
        duration: 0.6, 
        ease: "power2.out" 
      }, "-=0.1")
      .to(lightSweep, { 
        opacity: 0, 
        duration: 0.3, 
        ease: "power2.in" 
      }, "-=0.2")
      
      // 6. Second light sweep
      .to(lightSweep, { 
        x: -200, 
        opacity: 1, 
        duration: 0.1 
      }, "+=0.8")
      .to(lightSweep, { 
        x: 300, 
        duration: 0.5, 
        ease: "power2.out" 
      }, "-=0.1")
      .to(lightSweep, { 
        opacity: 0, 
        duration: 0.3 
      }, "-=0.2")
      
      // 7. Hold for a moment then transition out
      .to({}, { duration: 1.5 }) // pause
      .to(container, { 
        opacity: 0, 
        scale: 1.1,
        duration: 1, 
        ease: "power2.inOut",
        onComplete: () => {
          setIsVisible(false);
          onComplete?.();
        }
      });

    // Glow pulsing animation
    gsap.to(glow, {
      scale: 1.05,
      opacity: 0.6,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
      delay: 2
    });

    // Particle floating animation
    particles.forEach((particle, index) => {
      const element = particlesContainer?.children[index];
      if (element) {
        gsap.to(element, {
          y: `+=${Math.random() * 100 - 50}`,
          x: `+=${Math.random() * 50 - 25}`,
          rotation: Math.random() * 360,
          duration: Math.random() * 8 + 4,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
          delay: Math.random() * 2
        });
      }
    });

    // Review testimonial animations
    reviews.forEach((review, index) => {
      const element = reviewsContainer?.children[index];
      if (element) {
        // Initial state for each review
        gsap.set(element, {
          opacity: 0,
          scale: 0.8,
          y: 20
        });

        // Staggered appearance animation
        gsap.to(element, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
          delay: review.delay
        });

        // Gentle floating motion
        gsap.to(element, {
          y: `+=${Math.random() * 20 - 10}`,
          x: `+=${Math.random() * 15 - 7.5}`,
          rotation: Math.random() * 4 - 2,
          duration: Math.random() * 3 + 2,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
          delay: review.delay + 0.6
        });

        // Fade out before main animation ends
        gsap.to(element, {
          opacity: 0,
          scale: 0.9,
          duration: 0.8,
          ease: "power2.in",
          delay: review.delay + review.duration
        });
      }
    });

    return () => {
      tl.kill();
    };
  }, [particles, reviews, onComplete]);

  // Hover effect
  const handleLogoHover = () => {
    if (logoRef.current) {
      gsap.to(logoRef.current, {
        scale: 1.1,
        duration: 0.3,
        ease: "power2.out"
      });
      
      // Quick shimmer effect
      gsap.fromTo(lightSweepRef.current, 
        { x: -200, opacity: 0 },
        { x: 300, opacity: 0.8, duration: 0.4, ease: "power2.out" }
      );
    }
  };

  const handleLogoLeave = () => {
    if (logoRef.current) {
      gsap.to(logoRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: '#000000' }}
    >
      {/* Textured Background with Vignette */}
      <div
        ref={backgroundRef}
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,1) 100%),
            url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='m0 40l40-40h-40z'/%3E%3C/g%3E%3C/svg%3E")
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Background Particles */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-netflix-red"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              boxShadow: `0 0 ${particle.size * 2}px rgba(229, 9, 20, 0.6)`,
              filter: 'blur(0.5px)'
            }}
          />
        ))}
      </div>

      {/* Floating Review Testimonials */}
      <div 
        ref={reviewsRef}
        className="absolute inset-0 pointer-events-none z-10"
      >
        {reviews.map((review) => (
          <div
            key={review.id}
            className="absolute bg-black/80 backdrop-blur-md text-white p-3 rounded-lg border border-red-500/30 shadow-2xl max-w-xs"
            style={{
              left: `${review.x}%`,
              top: `${review.y}%`,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 20px rgba(229, 9, 20, 0.3), 0 8px 32px rgba(0, 0, 0, 0.8)'
            }}
          >
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-sm ${
                    i < review.rating 
                      ? 'text-yellow-400 drop-shadow-sm' 
                      : 'text-gray-600'
                  }`}
                  style={{
                    textShadow: i < review.rating ? '0 0 4px rgba(251, 191, 36, 0.6)' : 'none'
                  }}
                >
                  ★
                </span>
              ))}
              <span className="text-yellow-400 text-xs ml-1 font-bold">
                {review.rating}/5
              </span>
            </div>
            <p className="text-xs text-gray-100 leading-tight mb-2 font-medium">
              "{review.text}"
            </p>
            <p className="text-xs text-red-400 font-semibold">
              - {review.author}
            </p>
          </div>
        ))}
      </div>

      {/* Main Logo Container */}
      <div className="relative">
        {/* Logo Glow Background */}
        <div
          ref={glowRef}
          className="absolute inset-0 rounded-lg"
          style={{
            background: 'radial-gradient(ellipse, rgba(229, 9, 20, 0.3) 0%, transparent 70%)',
            filter: 'blur(20px)',
            transform: 'scale(2)',
          }}
        />

        {/* Main NF Logo */}
        <div
          ref={logoRef}
          className="relative cursor-pointer select-none"
          onMouseEnter={handleLogoHover}
          onMouseLeave={handleLogoLeave}
          style={{
            perspective: '1000px',
            transformStyle: 'preserve-3d'
          }}
        >
          <div
            className="text-netflix-red font-black tracking-tighter"
            style={{
              fontSize: 'clamp(4rem, 15vw, 12rem)',
              fontFamily: 'Arial Black, sans-serif',
              textShadow: `
                0 0 20px rgba(229, 9, 20, 0.5),
                0 0 40px rgba(229, 9, 20, 0.3),
                0 0 60px rgba(229, 9, 20, 0.1),
                4px 4px 8px rgba(0, 0, 0, 0.8)
              `,
              filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5))',
              WebkitTextStroke: '2px rgba(139, 0, 0, 0.3)',
            }}
          >
            NF
          </div>
        </div>

        {/* Light Sweep Effect */}
        <div
          ref={lightSweepRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)',
            width: '100px',
            height: '100%',
            filter: 'blur(2px)',
            mixBlendMode: 'overlay'
          }}
        />
      </div>

      {/* Click to Skip */}
      <div className="absolute bottom-8 right-8 text-netflix-text-gray text-sm opacity-60 hover:opacity-100 transition-opacity">
        <button
          onClick={() => {
            setIsVisible(false);
            onComplete?.();
          }}
          className="hover:text-netflix-white transition-colors"
        >
          Skip Intro →
        </button>
      </div>
    </div>
  );
};

export default NetFlexIntro; 