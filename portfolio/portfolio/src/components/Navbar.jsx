import React from "react";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { HiUser, HiFolder, HiAcademicCap, HiStar, HiEnvelope } from "react-icons/hi2";
import DarkModeToggle from "./DarkModeToggle.jsx";
import MobileWelcome from "./MobileWelcome.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { glassmorphic } from "../config/glassmorphic.js";
import { getGlassStyle, getLiquidGlassGradient } from "../utils/themeUtils.js";
import { theme } from "../config/theme.js";

// Order matches portfolio: About → Education → Tools (Skills) → Projects → Contact
const navLinks = [
  { name: "About", href: "#about", icon: HiUser },
  { name: "Education", href: "#education-experience", icon: HiAcademicCap },
  { name: "Skills", href: "#tools", icon: HiStar },
  { name: "Projects", href: "#projects", icon: HiFolder },
  { name: "Contact", href: "#contact", icon: HiEnvelope },
];

const sectionIds = navLinks.map((link) => link.href.replace('#', ''));

export default function Navbar({ variant = "desktop" }) {
  const isDesktop = variant === "desktop";
  const { theme: themeMode } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [showMobileWelcome, setShowMobileWelcome] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [bubbleStyle, setBubbleStyle] = useState({ left: 0, width: 0, height: 0, top: 0 });
  const desktopLinksWrapRef = useRef(null);
  const mobileLinksWrapRef = useRef(null);
  const siriAudioRef = useRef(null);
  const [siriActive, setSiriActive] = useState(false);
  const [desktopSiriActive, setDesktopSiriActive] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Desktop variant: always show navbar. Mobile variant: check welcome.
    if (isDesktop) {
      setShowNavbar(true);
    } else {
      const hasSeenWelcome = typeof window !== 'undefined' && localStorage.getItem('hasSeenMobileWelcome');
      if (!hasSeenWelcome) {
        setShowMobileWelcome(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('hasSeenMobileWelcome', 'true');
        }
      } else {
        setShowNavbar(true);
      }
    }
  }, [isDesktop]);

  // Track which section is in view for active tab styling (scroll-based: section containing viewport anchor point)
  useEffect(() => {
    const viewportAnchor = 0.25; // 25% from top of viewport
    const updateActiveSection = () => {
      const y = typeof window !== 'undefined' ? window.innerHeight * viewportAnchor : 0;
      // Check home first — when viewport anchor is in home section, set activeSectionId to 'home' (bubble disappears)
      const homeEl = document.getElementById('home');
      if (homeEl) {
        const homeRect = homeEl.getBoundingClientRect();
        if (homeRect.top <= y && homeRect.bottom >= y) {
          setActiveSectionId('home');
          return;
        }
      }
      let active = null;
      let activeTop = -Infinity;
      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top <= y && rect.bottom >= y) {
          if (rect.top > activeTop) {
            activeTop = rect.top;
            active = id;
          }
        }
      });
      setActiveSectionId(active);
    };
    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);
    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, []);

  // Measure active tab position for sliding bubble (desktop + mobile)
  useEffect(() => {
    if (!activeSectionId) return;
    const measure = () => {
      const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
      const wrapRef = isDesktop ? desktopLinksWrapRef.current : mobileLinksWrapRef.current;
      if (!wrapRef) return;
      const activeEl = wrapRef.querySelector(`[data-section-id="${activeSectionId}"]`);
      if (!activeEl) return;
      const r = activeEl.getBoundingClientRect();
      const wr = wrapRef.getBoundingClientRect();
      setBubbleStyle({
        left: r.left - wr.left,
        width: r.width,
        height: r.height,
        top: r.top - wr.top,
      });
    };
    measure();
    const t = requestAnimationFrame(() => measure());
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(t);
      window.removeEventListener('resize', measure);
    };
  }, [activeSectionId]);

  const handleWelcomeComplete = () => {
    setShowMobileWelcome(false);
    setTimeout(() => {
      setShowNavbar(true);
    }, 200);
  };

  const scrollToSection = (href) => {
    const element = document.getElementById(href.replace('#', ''));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Don't render navbar until welcome is complete or not needed
  if (!isMounted || (showMobileWelcome && !showNavbar)) {
    return (
      <>
        {showMobileWelcome && <MobileWelcome onComplete={handleWelcomeComplete} />}
      </>
    );
  }

  return (
    <>
      {showMobileWelcome && <MobileWelcome onComplete={handleWelcomeComplete} />}

      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: showNavbar ? 1 : 0, y: showNavbar ? 0 : -20 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className={
          isDesktop
            ? "fixed top-4 left-1/2 right-auto -translate-x-1/2 w-[95vw] max-w-4xl z-50 hidden md:flex items-center justify-between px-6 py-1.5 pb-1.5 border overflow-hidden rounded-2xl shadow-glass"
            : "fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-between px-3 py-1.5 border overflow-hidden rounded-t-2xl shadow-glass pb-[max(0.5rem,env(safe-area-inset-bottom))]"
        }
        style={{
          ...getGlassStyle({ background: 'navbar', border: 'navbar', blur: 'md', shadow: 'navbar', theme: themeMode }),
          maxWidth: '100%',
        }}
      >
        {/* Animated background gradient - theme-aware */}
        <motion.div
          className="absolute inset-0"
          style={{
            opacity: themeMode === 'light' ? 0.4 : 0.3,
          }}
          animate={{
            background: [
              getLiquidGlassGradient('gradient1', themeMode),
              getLiquidGlassGradient('gradient2', themeMode),
              getLiquidGlassGradient('gradient3', themeMode),
              getLiquidGlassGradient('gradient1', themeMode),
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Floating particles in navbar - theme-aware colors */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          {[...Array(4)].map((_, i) => {
            // Use colored particles for light mode, white for dark mode
            const particleColors = themeMode === 'light' 
              ? ['rgba(96,165,250,0.4)', 'rgba(167,139,250,0.4)', 'rgba(244,114,182,0.4)', 'rgba(96,165,250,0.4)']
              : ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.2)'];
            return (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  left: `${15 + i * 20}%`,
                  top: `${20 + (i % 2) * 60}%`,
                  backgroundColor: particleColors[i % particleColors.length],
                }}
                animate={{
                  y: [-5, -15, -5],
                  opacity: themeMode === 'light' ? [0.4, 0.8, 0.4] : [0.2, 0.6, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
              />
            );
          })}
        </div>

        {/* Siri-style orb for desktop (left side) - exact same as mobile with click animation */}
        <div className={`${isDesktop ? "flex" : "hidden"} items-center relative z-10`}>
          <button
            className="flex items-center justify-center p-1 focus:outline-none"
            onClick={async () => {
              if (!desktopSiriActive) {
                setDesktopSiriActive(true);
                setActiveSectionId('home');
                scrollToSection('#home');
                if (siriAudioRef.current) {
                  try {
                    await siriAudioRef.current.play();
                  } catch (e) {
                    // Audio play failed, continue without sound
                  }
                }
                setTimeout(() => {
                  setDesktopSiriActive(false);
                }, 1500);
              } else {
                setDesktopSiriActive(false);
              }
            }}
            aria-label="Scroll to home"
          >
            <motion.div
              animate={desktopSiriActive ? {
                scale: [1, 1.3, 1.1, 1.2, 1],
                rotate: [0, 180, 360],
              } : {
                scale: 1,
                rotate: 0,
              }}
              transition={{
                duration: desktopSiriActive ? 1.5 : 0.3,
                ease: "easeInOut"
              }}
              className="relative w-14 h-14 rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: desktopSiriActive
                  ? 'conic-gradient(from 0deg, #60A5FA, #A78BFA, #F472B6, #34D399, #FBBF24, #60A5FA)'
                  : 'linear-gradient(135deg, rgba(96,165,250,0.3), rgba(167,139,250,0.3), rgba(244,114,182,0.2))',
                boxShadow: desktopSiriActive
                  ? '0 0 30px 15px rgba(96,165,250,0.3), 0 0 60px 30px rgba(167,139,250,0.2)'
                  : '0 0 20px 8px rgba(96,165,250,0.2)'
              }}
            >
              {/* Animated particles - same as mobile */}
              {isMounted && desktopSiriActive && Array.from({ length: 8 }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{
                    background: `hsl(${i * 45}, 70%, 60%)`,
                    left: '50%',
                    top: '50%',
                  }}
                  animate={{
                    x: [0, Math.cos(i * 45 * Math.PI / 180) * 25],
                    y: [0, Math.sin(i * 45 * Math.PI / 180) * 25],
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                />
              ))}

              {/* Central pulsing core - same as mobile */}
              <motion.div
                className="absolute w-6 h-6 rounded-full"
                style={{
                  background: desktopSiriActive
                    ? 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 50%, transparent 100%)'
                    : 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                }}
                animate={desktopSiriActive ? {
                  scale: [1, 1.2, 0.9, 1.1, 1],
                  opacity: [0.7, 1, 0.8, 0.9, 0.7],
                } : {
                  scale: 1,
                  opacity: 0.6,
                }}
                transition={{
                  duration: desktopSiriActive ? 1.5 : 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: "easeInOut"
                }}
              />

              {/* Outer ripple rings - same as mobile */}
              {Array.from({ length: 3 }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-white/40"
                  style={{
                    width: `${(i + 2) * 12}px`,
                    height: `${(i + 2) * 12}px`,
                  }}
                  animate={desktopSiriActive ? {
                    scale: [1, 1.5, 1.2],
                    opacity: [0.6, 0.2, 0.4],
                  } : {
                    scale: 1,
                    opacity: 0.3,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: desktopSiriActive ? Infinity : 0,
                    delay: i * 0.2,
                    ease: "easeOut"
                  }}
                />
              ))}

              {/* Rotating gradient overlay - same as mobile */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.2), transparent)',
                }}
                animate={{
                  rotate: desktopSiriActive ? [0, 360] : [0, 180, 360],
                }}
                transition={{
                  duration: desktopSiriActive ? 2 : 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </motion.div>
            {typeof window !== 'undefined' && (
              <audio ref={siriAudioRef} src="/siri-activate.mp3" preload="auto" />
            )}
          </button>
        </div>

        {/* Nav links with sliding glass bubble — desktop */}
        <div ref={desktopLinksWrapRef} className={`relative flex-1 ${isDesktop ? "flex" : "hidden"} justify-center min-w-0`}>
          {/* Sliding glass bubble — ease-in-out; disappears on home */}
          <motion.div
            className="absolute rounded-2xl pointer-events-none z-0"
            style={{
              left: bubbleStyle.left,
              top: bubbleStyle.top,
              width: bubbleStyle.width,
              height: bubbleStyle.height,
              background: themeMode === 'light'
                ? 'linear-gradient(135deg, rgba(0,0,0,0.45), rgba(0,0,0,0.35))'
                : 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.12))',
              border: themeMode === 'light' ? '1px solid rgba(80,80,80,0.5)' : '1px solid rgba(255,255,255,0.25)',
              boxShadow: themeMode === 'light' ? 'inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 8px rgba(0,0,0,0.15)' : 'inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.2)',
              backdropFilter: `blur(${glassmorphic.blur.sm})`,
              WebkitBackdropFilter: `blur(${glassmorphic.blur.sm})`,
            }}
            animate={{
              left: bubbleStyle.left,
              top: bubbleStyle.top,
              width: bubbleStyle.width,
              height: bubbleStyle.height,
              opacity: activeSectionId === 'home' ? 0 : 1,
            }}
            transition={{ type: 'tween', ease: [0.4, 0, 0.2, 1], duration: 0.4 }}
          />
          <ul className="flex gap-2 sm:gap-4 md:gap-6 mx-auto relative z-10">
          {navLinks.map(link => {
            const sectionId = link.href.replace('#', '');
            const isActive = activeSectionId === sectionId;
            return (
            <li key={link.name}>
              <motion.button
                data-section-id={sectionId}
                onClick={() => scrollToSection(link.href)}
                className="relative font-medium transition-colors px-2 sm:px-3 py-2 rounded-xl sm:rounded-2xl overflow-hidden group text-sm sm:text-base"
                style={{
                  color: themeMode === 'dark' ? 'rgba(255,255,255,0.8)' : theme.colors.text.primary.light,
                  background: 'transparent',
                  minHeight: "40px",
                  transition: 'color 0.28s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = themeMode === 'light'
                    ? theme.colors.text.primary.light
                    : 'rgba(255,255,255,0.9)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = themeMode === 'dark' ? 'rgba(255,255,255,0.8)' : theme.colors.text.primary.light;
                }}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.95, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              >
                {/* Hover glass when not active */}
                {!isActive && (
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: themeMode === 'light'
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.5))'
                        : 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.1))',
                      backdropFilter: `blur(${glassmorphic.blur.sm})`,
                      WebkitBackdropFilter: `blur(${glassmorphic.blur.sm})`,
                      border: `1px solid ${themeMode === 'light' ? 'rgba(150,150,150,0.4)' : glassmorphic.borders[themeMode].elevated}`,
                      boxShadow: themeMode === 'light' ? 'inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 8px rgba(0,0,0,0.08)' : 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.2)',
                    }}
                    aria-hidden
                  />
                )}

                {/* Floating micro-particles on hover - theme-aware */}
                <div className={`absolute inset-0 overflow-hidden rounded-2xl transition-opacity duration-300 ${isActive ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                  {[...Array(3)].map((_, i) => {
                    // Use colored particles for light mode, white for dark mode
                    const hoverParticleColor = themeMode === 'light'
                      ? ['rgba(96,165,250,0.6)', 'rgba(167,139,250,0.6)', 'rgba(244,114,182,0.6)'][i % 3]
                      : 'rgba(255,255,255,0.6)';
                    return (
                      <motion.div
                        key={i}
                        className="absolute w-0.5 h-0.5 rounded-full"
                        style={{
                          left: `${30 + i * 20}%`,
                          top: `${40 + (i % 2) * 20}%`,
                          backgroundColor: hoverParticleColor,
                        }}
                        animate={{
                          y: [-3, -8, -3],
                          opacity: themeMode === 'light' ? [0.5, 0.9, 0.5] : [0.3, 0.8, 0.3],
                        }}
                        transition={{
                          duration: 1.5 + i * 0.2,
                          repeat: Infinity,
                          delay: i * 0.1,
                          ease: "easeInOut"
                        }}
                      />
                    );
                  })}
                </div>

                <span className="relative z-10">{link.name}</span>
              </motion.button>
            </li>
          );
          })}
          </ul>
        </div>

        {/* Dark mode toggle - desktop */}
        <div className={`${isDesktop ? "flex" : "hidden"} items-center relative z-10`}>
          <DarkModeToggle />
        </div>

        {/* Mobile bottom bar: orb (home) + icon links + dark toggle */}
        <div className={`${isDesktop ? "hidden" : "flex"} flex-shrink-0 items-center relative z-10`}>
          <button
            className="flex items-center justify-center p-1 focus:outline-none"
            onClick={async () => {
              if (!siriActive) {
                setSiriActive(true);
                setActiveSectionId('home');
                scrollToSection('#home');
                if (siriAudioRef.current) {
                  try {
                    await siriAudioRef.current.play();
                  } catch (e) {
                    // Audio play failed, continue without sound
                  }
                }
                setTimeout(() => {
                  setSiriActive(false);
                }, 1500);
              } else {
                setSiriActive(false);
              }
            }}
            aria-label="Scroll to home"
          >
            <motion.div
              animate={siriActive ? {
                scale: [1, 1.3, 1.1, 1.2, 1],
                rotate: [0, 180, 360],
              } : {
                scale: 1,
                rotate: 0,
              }}
              transition={{
                duration: siriActive ? 1.5 : 0.3,
                ease: "easeInOut"
              }}
              className="relative w-14 h-14 rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: siriActive
                  ? 'conic-gradient(from 0deg, #60A5FA, #A78BFA, #F472B6, #34D399, #FBBF24, #60A5FA)'
                  : 'linear-gradient(135deg, rgba(96,165,250,0.3), rgba(167,139,250,0.3), rgba(244,114,182,0.2))',
                boxShadow: siriActive
                  ? '0 0 30px 15px rgba(96,165,250,0.3), 0 0 60px 30px rgba(167,139,250,0.2)'
                  : '0 0 20px 8px rgba(96,165,250,0.2)'
              }}
            >
              {/* Animated particles */}
              {isMounted && siriActive && Array.from({ length: 8 }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{
                    background: `hsl(${i * 45}, 70%, 60%)`,
                    left: '50%',
                    top: '50%',
                  }}
                  animate={{
                    x: [0, Math.cos(i * 45 * Math.PI / 180) * 25],
                    y: [0, Math.sin(i * 45 * Math.PI / 180) * 25],
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                />
              ))}

              {/* Central pulsing core */}
              <motion.div
                className="absolute w-6 h-6 rounded-full"
                style={{
                  background: siriActive
                    ? 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 50%, transparent 100%)'
                    : 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                }}
                animate={siriActive ? {
                  scale: [1, 1.2, 0.9, 1.1, 1],
                  opacity: [0.7, 1, 0.8, 0.9, 0.7],
                } : {
                  scale: 1,
                  opacity: 0.6,
                }}
                transition={{
                  duration: siriActive ? 1.5 : 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: "easeInOut"
                }}
              />

              {/* Outer ripple rings */}
              {Array.from({ length: 3 }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-white/40"
                  style={{
                    width: `${(i + 2) * 12}px`,
                    height: `${(i + 2) * 12}px`,
                  }}
                  animate={siriActive ? {
                    scale: [1, 1.5, 1.2],
                    opacity: [0.6, 0.2, 0.4],
                  } : {
                    scale: 1,
                    opacity: 0.3,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: siriActive ? Infinity : 0,
                    delay: i * 0.2,
                    ease: "easeOut"
                  }}
                />
              ))}

              {/* Rotating gradient overlay */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.2), transparent)',
                }}
                animate={{
                  rotate: siriActive ? [0, 360] : [0, 180, 360],
                }}
                transition={{
                  duration: siriActive ? 2 : 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </motion.div>
            {typeof window !== 'undefined' && (
              <audio ref={siriAudioRef} src="/siri-activate.mp3" preload="auto" />
            )}
          </button>
        </div>

        {/* Mobile: icon-only nav links with sliding glass bubble */}
        <div ref={mobileLinksWrapRef} className={`${isDesktop ? "hidden" : "flex"} flex-1 justify-center items-center gap-2 sm:gap-4 relative z-10 min-w-0`}>
          {/* Sliding glass bubble — ease-in-out; disappears on home */}
          <motion.div
            className="absolute rounded-xl pointer-events-none z-0"
            style={{
              left: bubbleStyle.left,
              top: bubbleStyle.top,
              width: bubbleStyle.width,
              height: bubbleStyle.height,
              background: themeMode === 'light'
                ? 'linear-gradient(135deg, rgba(0,0,0,0.45), rgba(0,0,0,0.35))'
                : 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.12))',
              border: themeMode === 'light' ? '1px solid rgba(80,80,80,0.5)' : '1px solid rgba(255,255,255,0.25)',
              boxShadow: themeMode === 'light' ? 'inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 6px rgba(0,0,0,0.12)' : 'inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 6px rgba(0,0,0,0.2)',
              backdropFilter: `blur(${glassmorphic.blur.sm})`,
              WebkitBackdropFilter: `blur(${glassmorphic.blur.sm})`,
            }}
            animate={{
              left: bubbleStyle.left,
              top: bubbleStyle.top,
              width: bubbleStyle.width,
              height: bubbleStyle.height,
              opacity: activeSectionId === 'home' ? 0 : 1,
            }}
            transition={{ type: 'tween', ease: [0.4, 0, 0.2, 1], duration: 0.4 }}
          />
          {navLinks.filter((link) => link.name !== 'About').map((link) => {
            const Icon = link.icon;
            const sectionId = link.href.replace('#', '');
            const isActive = activeSectionId === sectionId;
            return (
              <motion.button
                key={link.name}
                data-section-id={sectionId}
                onClick={() => scrollToSection(link.href)}
                aria-label={link.name}
                className="relative flex items-center justify-center min-w-[40px] min-h-[40px] rounded-xl overflow-hidden transition-colors z-10"
                style={{
                  color: themeMode === 'dark' ? 'rgba(255,255,255,0.8)' : theme.colors.text.primary.light,
                  background: 'transparent',
                  transition: 'color 0.28s ease',
                }}
                whileTap={{ scale: 0.92 }}
              >
                <Icon className="w-6 h-6" aria-hidden />
              </motion.button>
            );
          })}
        </div>

        {/* Dark mode toggle - mobile */}
        <div className={`${isDesktop ? "hidden" : "flex"} items-center relative z-10 flex-shrink-0`}>
          <DarkModeToggle />
        </div>
      </motion.nav>
    </>
  );
}