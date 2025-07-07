import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const NetFlexIntro = ({ onComplete }) => {
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const backgroundRef = useRef(null);
  const particlesRef = useRef(null);
  const lightSweepRef = useRef(null);
  const glowRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  const [particles, setParticles] = useState([]);

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

    return () => {
      tl.kill();
    };
  }, [particles, onComplete]);

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