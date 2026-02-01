import React, { useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext.jsx";

/**
 * AntigravityParticles - Lightweight Canvas 2D particle system
 * Inspired by Google Antigravity's elegant particle effects
 * 
 * Features:
 * - Canvas 2D rendering (lightweight, no DOM overhead)
 * - Magnetic cursor attraction
 * - Device-adaptive particle counts
 * - Theme-aware colors
 * - Optimized performance with DPR capping
 */
export default function AntigravityParticles({ 
  particleCount = null, // Override default count
  intensity = 'normal', // 'low', 'normal', 'high'
  floatUpward = false, // When true, particles rise (antigravity effect)
  floatStrength = 0.08 // Upward velocity per frame when floatUpward (e.g. 0.05-0.1)
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: null, y: null });
  const { theme: themeMode } = useTheme();

  // Configuration - optimized for performance
  const CONFIG = {
    PARTICLES_DESKTOP: 80,
    PARTICLES_TABLET: 60,
    PARTICLES_MOBILE: 40,
    PARTICLE_SIZE_MIN: 1.5,
    PARTICLE_SIZE_MAX: 3.5,
    MAGNETIC_RADIUS: 150,
    MAGNETIC_STRENGTH: 0.02,
    VELOCITY_DAMPING: 0.98,
    BASE_VELOCITY: 0.3,
    DPR_CAP: 2.0,
    MOBILE_BREAKPOINT: 768,
    TABLET_BREAKPOINT: 1024,
    // Intensity multipliers
    INTENSITY_MULTIPLIERS: {
      low: 0.6,
      normal: 1.0,
      high: 1.4
    }
  };

  // Get particle count based on screen size
  const getParticleCount = () => {
    if (particleCount !== null) return particleCount;
    
    const width = window.innerWidth;
    const intensityMultiplier = CONFIG.INTENSITY_MULTIPLIERS[intensity] || 1.0;
    
    if (width < CONFIG.MOBILE_BREAKPOINT) {
      return Math.floor(CONFIG.PARTICLES_MOBILE * intensityMultiplier);
    } else if (width < CONFIG.TABLET_BREAKPOINT) {
      return Math.floor(CONFIG.PARTICLES_TABLET * intensityMultiplier);
    } else {
      return Math.floor(CONFIG.PARTICLES_DESKTOP * intensityMultiplier);
    }
  };

  // Initialize particles
  const initParticles = (count, width, height) => {
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * CONFIG.BASE_VELOCITY,
        vy: (Math.random() - 0.5) * CONFIG.BASE_VELOCITY,
        size: CONFIG.PARTICLE_SIZE_MIN + Math.random() * (CONFIG.PARTICLE_SIZE_MAX - CONFIG.PARTICLE_SIZE_MIN),
        baseHue: themeMode === 'light' ? 200 + Math.random() * 60 : 0, // Blue-purple range for light, white for dark
        opacity: themeMode === 'light' ? 0.25 + Math.random() * 0.15 : 0.2 + Math.random() * 0.1
      });
    }
    return particles;
  };

  // Get particle color based on theme
  const getParticleColor = (particle) => {
    if (themeMode === 'light') {
      // Colored particles for light mode
      return `hsla(${particle.baseHue}, 70%, 65%, ${particle.opacity})`;
    } else {
      // White particles for dark mode
      return `rgba(255, 255, 255, ${particle.opacity})`;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    let width = window.innerWidth;
    let height = window.innerHeight;

    // DPR capping for performance
    const DPR = Math.min(CONFIG.DPR_CAP, window.devicePixelRatio || 1);

    // Resize handler
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      canvas.width = Math.floor(width * DPR);
      canvas.height = Math.floor(height * DPR);
      
      if (ctx.resetTransform) ctx.resetTransform();
      ctx.scale(DPR, DPR);

      // Reinitialize particles on resize
      const count = getParticleCount();
      particlesRef.current = initParticles(count, width, height);
    };

    resize();
    window.addEventListener("resize", resize);

    // Mouse tracking (throttled for performance)
    let mouseUpdateThrottle = 0;
    const handleMouseMove = (e) => {
      mouseUpdateThrottle++;
      if (mouseUpdateThrottle % 2 === 0) { // Update every other frame
        mouseRef.current.x = e.clientX;
        mouseRef.current.y = e.clientY;
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Animation loop
    let lastTime = performance.now();
    const animate = (currentTime) => {
      const deltaTime = Math.min(0.033, (currentTime - lastTime) / 1000); // Cap at 30ms
      lastTime = currentTime;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Upward float (antigravity) - apply before motion
        if (floatUpward) {
          p.vy -= floatStrength;
        }

        // Natural floating motion
        p.x += p.vx;
        p.y += p.vy;

        // Magnetic attraction to cursor
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONFIG.MAGNETIC_RADIUS) {
            const force = (1 - distance / CONFIG.MAGNETIC_RADIUS) * CONFIG.MAGNETIC_STRENGTH;
            p.vx += dx * force;
            p.vy += dy * force;
          }
        }

        // Velocity damping for smooth motion
        p.vx *= CONFIG.VELOCITY_DAMPING;
        p.vy *= CONFIG.VELOCITY_DAMPING;

        // Boundary conditions - wrap around
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (floatUpward) {
          // Rising particles: wrap top -> bottom (respawn at bottom when they rise off top)
          if (p.y < 0) {
            p.y = height;
            p.x = Math.random() * width;
          }
          if (p.y > height) p.y = 0;
        } else {
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = getParticleColor(p);
        
        // Subtle glow effect (minimal performance cost)
        if (themeMode === 'dark') {
          ctx.shadowBlur = 4;
          ctx.shadowColor = `rgba(255, 255, 255, ${p.opacity * 0.5})`;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      ctx.clearRect(0, 0, width, height);
    };
  }, [themeMode, intensity, particleCount, floatUpward, floatStrength]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
