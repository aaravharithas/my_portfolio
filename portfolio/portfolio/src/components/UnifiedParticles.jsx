import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext.jsx";
import { theme } from "../config/theme.js";

/**
 * UnifiedParticles - Single canvas combining background and sphere particles
 * All particles can interact with each other in the same coordinate space
 * 
 * Features:
 * - Background particles (2D, full viewport)
 * - Sphere particles (3D projected to 2D, positioned above center)
 * - Gravitational field around sphere (particles orbit like planets)
 * - Single animation loop for optimal performance
 */
export default function UnifiedParticles({ 
  // Background particle props
  backgroundIntensity = 'normal',
  backgroundParticleCount = null,
  
  // Sphere props
  sphereRadius = 50,
  sphereParticleCount = 200,
  rotationSpeed = 0.4,
  enableInteraction = true,
  enableGravity = true, // Enable gravitational field around sphere
  sphereOffsetY = -80 // Move sphere up (negative = up)
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  
  // Particle arrays
  const backgroundParticlesRef = useRef([]);
  const sphereParticlesRef = useRef([]);
  
  // State
  const mouseRef = useRef({ x: null, y: null });
  const rotationRef = useRef({ x: 0, y: 0, z: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const { theme: themeMode } = useTheme();

  // Configuration
  const CONFIG = {
    // Background particles (Starfield)
    BG_PARTICLES_DESKTOP: 150, // More particles for dense starfield
    BG_PARTICLES_TABLET: 100,
    BG_PARTICLES_MOBILE: 60,
    BG_PARTICLE_SIZE_MIN: 0.5, // Tiny stars
    BG_PARTICLE_SIZE_MAX: 4.0, // Some larger stars
    BG_MAGNETIC_RADIUS: 150,
    BG_MAGNETIC_STRENGTH: 0.02,
    BG_VELOCITY_DAMPING: 0.995, // Less damping for floaty space drift
    BG_BASE_VELOCITY: 0.15, // Slower, floaty motion (space-like)
    
    // Space effects
    TWINKLE_SPEED: 0.002, // Twinkling animation speed (slower, more subtle)
    TWINKLE_VARIATION: 0.3, // How much opacity varies (0-1)
    GLOW_INTENSITY: 1.2, // Particle glow strength
    DEPTH_FADE_DISTANCE: 800, // Distance for depth-based fading
    PARALLAX_STRENGTH: 0.3, // Parallax motion based on depth (0-1)
    SHOOTING_STAR_CHANCE: 0.0005, // Chance per frame for shooting star (0-1)
    SHOOTING_STAR_DURATION: 60, // Frames a shooting star lasts
    SHOOTING_STAR_SPEED: 8, // Speed of shooting star
    
    // Sphere particles
    SPHERE_PARTICLE_SIZE_MIN: 1.5, // Match background for consistency
    SPHERE_PARTICLE_SIZE_MAX: 3.5,
    SPHERE_MAGNETIC_RADIUS: 60,
    SPHERE_MAGNETIC_STRENGTH: 0.01,
    PERSPECTIVE: 400,
    EDGE_FADE_DISTANCE: 8,
    
    // Gravity field
    GRAVITY_RADIUS: 200, // Maximum distance for gravitational effect (further reduced)
    GRAVITY_STRENGTH: 0.5, // Gravitational constant (G) - Lower gravity strength
    MIN_ORBITAL_DISTANCE: 60, // Minimum distance to start orbiting (must be outside sphere)
    MAX_ORBITAL_DISTANCE: 350, // Maximum distance for stable orbits
    ORBITAL_DAMPING: 0.998, // Damping for orbital motion (very low)
    SPHERE_BOUNDARY_MULTIPLIER: 1.15, // Particles cannot get closer than 1.15x sphere radius
    REPULSION_STRENGTH: 0.5, // Strong repulsion when too close to sphere
    GRAVITY_DAMPING_REDUCTION: 0.998, // Very little damping when in gravity field (0.998 vs 0.98)
    ORBITAL_SPEED_MULTIPLIER: 0.5, // Orbital speed (will be adjusted relative to sphere rotation)
    
    // General
    DPR_CAP: 2.0,
    MOBILE_BREAKPOINT: 768,
    TABLET_BREAKPOINT: 1024,
    INTENSITY_MULTIPLIERS: {
      low: 0.6,
      normal: 1.0,
      high: 1.4
    }
  };

  // Get background particle count
  const getBackgroundParticleCount = () => {
    if (backgroundParticleCount !== null) return backgroundParticleCount;
    
    const width = window.innerWidth;
    const intensityMultiplier = CONFIG.INTENSITY_MULTIPLIERS[backgroundIntensity] || 1.0;
    
    if (width < CONFIG.MOBILE_BREAKPOINT) {
      return Math.floor(CONFIG.BG_PARTICLES_MOBILE * intensityMultiplier);
    } else if (width < CONFIG.TABLET_BREAKPOINT) {
      return Math.floor(CONFIG.BG_PARTICLES_TABLET * intensityMultiplier);
    } else {
      return Math.floor(CONFIG.BG_PARTICLES_DESKTOP * intensityMultiplier);
    }
  };

  // Initialize background particles (2D) - Theme-colored particles
  const initBackgroundParticles = (count, width, height) => {
    const particles = [];
    
    // Theme colors - black in light theme, white in dark theme
    const themeColors = themeMode === 'light' 
      ? [
          { r: 0, g: 0, b: 0 },       // Black (visible on white)
          { r: 0, g: 0, b: 0 },       // Black
          { r: 0, g: 0, b: 0 },       // Black
        ]
      : [
          { r: 255, g: 255, b: 255 }, // White (visible on dark)
          { r: 255, g: 255, b: 255 }, // White
          { r: 255, g: 255, b: 255 }, // White
        ];
    
    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      
      // Use theme gradient colors
      let colorIndex = 0;
      if (rand < 0.4) {
        // 40% blue
        colorIndex = 0;
      } else if (rand < 0.7) {
        // 30% purple
        colorIndex = 1;
      } else {
        // 30% pink
        colorIndex = 2;
      }
      
      const color = themeColors[colorIndex];
      // Convert RGB to HSL for consistency
      const r = color.r / 255;
      const g = color.g / 255;
      const b = color.b / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      
      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      
      const baseHue = h * 360;
      const saturation = s * 100;
      const lightness = l * 100;
      
      // Size variation (tiny to large stars)
      const size = CONFIG.BG_PARTICLE_SIZE_MIN + Math.random() * (CONFIG.BG_PARTICLE_SIZE_MAX - CONFIG.BG_PARTICLE_SIZE_MIN);
      
      // Brightness variation (some stars brighter, some dimmer)
      const brightness = 0.3 + Math.random() * 0.7; // 0.3 to 1.0
      const baseOpacity = themeMode === 'light' 
        ? 0.2 + Math.random() * 0.3 
        : (0.4 + Math.random() * 0.6) * brightness; // Brighter in dark mode
      
      // Twinkling phase (random starting point)
      const twinklePhase = Math.random() * Math.PI * 2;
      
      particles.push({
        type: 'background',
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * CONFIG.BG_BASE_VELOCITY,
        vy: (Math.random() - 0.5) * CONFIG.BG_BASE_VELOCITY,
        size: size,
        baseHue: baseHue,
        saturation: saturation,
        lightness: lightness,
        themeColor: color, // Store RGB color for direct use
        baseOpacity: baseOpacity, // Store base for twinkling
        opacity: baseOpacity,
        twinklePhase: twinklePhase,
        brightness: brightness, // For depth-based rendering
        depth: Math.random(), // Random depth (0-1) for 3D effect
        baseX: Math.random() * width, // Store original position for parallax
        baseY: Math.random() * height,
        isShootingStar: false, // Shooting star state
        shootingStarProgress: 0, // Progress through shooting star animation
        shootingStarAngle: 0, // Direction of shooting star
      });
    }
    return particles;
  };

  // Generate sphere particles (3D) - using same theme colors as background
  const generateSphereParticles = (count, sphereRadius) => {
    const particles = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    
    // Use same theme colors as background particles - black in light theme, white in dark theme
    const themeColors = themeMode === 'light' 
      ? [
          { r: 0, g: 0, b: 0 },       // Black (visible on white)
          { r: 0, g: 0, b: 0 },       // Black
          { r: 0, g: 0, b: 0 },       // Black
        ]
      : [
          { r: 255, g: 255, b: 255 }, // White (visible on dark)
          { r: 255, g: 255, b: 255 }, // White
          { r: 255, g: 255, b: 255 }, // White
        ];
    
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      
      // Randomly assign theme color (same distribution as background)
      const rand = Math.random();
      let colorIndex = 0;
      if (rand < 0.4) {
        colorIndex = 0; // 40% blue
      } else if (rand < 0.7) {
        colorIndex = 1; // 30% purple
      } else {
        colorIndex = 2; // 30% pink
      }
      
      const color = themeColors[colorIndex];
      
      particles.push({
        type: 'sphere',
        x3d: x,
        y3d: y,
        z3d: z,
        originalX3d: x,
        originalY3d: y,
        originalZ3d: z,
        x2d: 0,
        y2d: 0,
        size: CONFIG.SPHERE_PARTICLE_SIZE_MIN + Math.random() * (CONFIG.SPHERE_PARTICLE_SIZE_MAX - CONFIG.SPHERE_PARTICLE_SIZE_MIN),
        opacity: themeMode === 'light' ? 0.5 + Math.random() * 0.3 : 0.4 + Math.random() * 0.25,
        themeColor: color, // Store RGB color for direct use (same as background)
        displacementX: 0,
        displacementY: 0,
        displacementZ: 0,
      });
    }
    
    return particles;
  };


  // 3D rotation functions
  const rotateX = (x, y, z, angle) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return { x, y: y * cos - z * sin, z: y * sin + z * cos };
  };

  const rotateY = (x, y, z, angle) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return { x: x * cos + z * sin, y, z: -x * sin + z * cos };
  };

  const rotateZ = (x, y, z, angle) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return { x: x * cos - y * sin, y: x * sin + y * cos, z };
  };

  // Project 3D to 2D
  const project3DTo2D = (x, y, z, centerX, centerY, sphereRadius) => {
    const zOffset = 2.2;
    const zAdjusted = z + zOffset;
    const scale = CONFIG.PERSPECTIVE / (CONFIG.PERSPECTIVE + zAdjusted);
    const projectedX = centerX + x * sphereRadius * scale;
    const projectedY = centerY + y * sphereRadius * scale;
    
    return {
      x: projectedX,
      y: projectedY,
      scale: Math.max(0.5, scale),
      depth: zAdjusted,
      z3d: z
    };
  };

  // Get particle color (theme colors) - same for both background and sphere particles
  const getParticleColor = (particle) => {
    // All particles (background and sphere) use theme gradient colors
    if (particle.themeColor) {
      const color = particle.themeColor;
      return `rgba(${color.r}, ${color.g}, ${color.b}, ${particle.opacity})`;
    }
    
    // Fallback to HSL if themeColor not available
    if (particle.saturation !== undefined && particle.lightness !== undefined) {
      return `hsla(${particle.baseHue}, ${particle.saturation}%, ${particle.lightness}%, ${particle.opacity})`;
    }
    
    // Final fallback
    return themeMode === 'light' 
      ? `rgba(0, 0, 0, ${particle.opacity})` // Black fallback
      : `rgba(255, 255, 255, ${particle.opacity})`; // White fallback
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mounted) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    let width = window.innerWidth;
    let height = window.innerHeight;
    const sphereCenterX = width / 2;
    const sphereCenterY = height / 2 + sphereOffsetY; // Move sphere up

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

      // Reinitialize background particles
      const bgCount = getBackgroundParticleCount();
      backgroundParticlesRef.current = initBackgroundParticles(bgCount, width, height);
    };

    resize();
    window.addEventListener("resize", resize);

    // Initialize particles
    const bgCount = getBackgroundParticleCount();
    backgroundParticlesRef.current = initBackgroundParticles(bgCount, width, height);
    sphereParticlesRef.current = generateSphereParticles(sphereParticleCount, sphereRadius);

    // Mouse tracking
    let mouseUpdateThrottle = 0;
    const handleMouseMove = (e) => {
      mouseUpdateThrottle++;
      if (mouseUpdateThrottle % 2 === 0) {
        mouseRef.current.x = e.clientX;
        mouseRef.current.y = e.clientY;
      }

      // Handle drag rotation
      if (isDraggingRef.current && enableInteraction) {
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;
        
        rotationRef.current.y += deltaX * 0.01;
        rotationRef.current.x -= deltaY * 0.01;
        
        dragStartRef.current.x = e.clientX;
        dragStartRef.current.y = e.clientY;
      }
    };

    const handleMouseDown = (e) => {
      if (!enableInteraction) return;
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      // Check if click is near sphere center (use current viewport dimensions)
      const currentSphereCenterX = window.innerWidth / 2;
      const currentSphereCenterY = window.innerHeight / 2 + sphereOffsetY;
      const distToCenter = Math.sqrt(
        Math.pow(mouseX - currentSphereCenterX, 2) + Math.pow(mouseY - currentSphereCenterY, 2)
      );
      
      if (distToCenter < sphereRadius * 1.5) {
        isDraggingRef.current = true;
        dragStartRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleMouseLeave = () => {
      isDraggingRef.current = false;
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    // Touch event handlers for mobile swipe support
    const handleTouchStart = (e) => {
      if (!enableInteraction) return;
      e.preventDefault();
      const touch = e.touches[0];
      const touchX = touch.clientX;
      const touchY = touch.clientY;
      
      // Check if touch is near sphere center
      const currentSphereCenterX = window.innerWidth / 2;
      const currentSphereCenterY = window.innerHeight / 2 + sphereOffsetY;
      const distToCenter = Math.sqrt(
        Math.pow(touchX - currentSphereCenterX, 2) + Math.pow(touchY - currentSphereCenterY, 2)
      );
      
      if (distToCenter < sphereRadius * 1.5) {
        isDraggingRef.current = true;
        dragStartRef.current = { x: touchX, y: touchY };
      }
    };

    const handleTouchMove = (e) => {
      if (!enableInteraction || !isDraggingRef.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      const touchX = touch.clientX;
      const touchY = touch.clientY;
      
      // Update mouse position for magnetic effect
      mouseUpdateThrottle++;
      if (mouseUpdateThrottle % 2 === 0) {
        mouseRef.current.x = touchX;
        mouseRef.current.y = touchY;
      }

      // Handle drag rotation (same as mouse)
      const deltaX = touchX - dragStartRef.current.x;
      const deltaY = touchY - dragStartRef.current.y;
      
      rotationRef.current.y += deltaX * 0.01;
      rotationRef.current.x -= deltaY * 0.01;
      
      dragStartRef.current.x = touchX;
      dragStartRef.current.y = touchY;
    };

    const handleTouchEnd = (e) => {
      if (!enableInteraction) return;
      e.preventDefault();
      isDraggingRef.current = false;
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    if (enableInteraction) {
      canvas.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("mouseleave", handleMouseLeave);
      // Add touch event listeners for mobile
      canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
      canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
      canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
      canvas.addEventListener("touchcancel", handleTouchEnd, { passive: false });
    } else {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseleave", handleMouseLeave);
    }

    // Animation loop
    let lastTime = performance.now();
    const animate = (currentTime) => {
      const deltaTime = Math.min(0.033, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      // Auto-rotation
      if (!isDraggingRef.current) {
        rotationRef.current.y += rotationSpeed * deltaTime;
      }

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      const backgroundParticles = backgroundParticlesRef.current;
      const sphereParticles = sphereParticlesRef.current;
      const rotation = rotationRef.current;
      const mouse = mouseRef.current;
      const currentRotationSpeed = rotationSpeed; // Store rotation speed for orbital calculations

      // Recalculate sphere center (in case of resize)
      const currentSphereCenterX = width / 2;
      const currentSphereCenterY = height / 2 + sphereOffsetY;

      // First, update and project all 3D particles to get their 2D positions
      const sphere2DPositions = [];

      // Process sphere particles
      for (let i = 0; i < sphereParticles.length; i++) {
        const p = sphereParticles[i];
        let x = p.originalX3d;
        let y = p.originalY3d;
        let z = p.originalZ3d;

        // Magnetic effect (calculate on current position before rotation)
        if (mouse.x !== null && mouse.y !== null) {
          // First rotate to get current position
          let tempRotated = rotateY(x, y, z, rotation.y);
          tempRotated = rotateX(tempRotated.x, tempRotated.y, tempRotated.z, rotation.x);
          tempRotated = rotateZ(tempRotated.x, tempRotated.y, tempRotated.z, rotation.z);
          const tempProjected = project3DTo2D(tempRotated.x, tempRotated.y, tempRotated.z, currentSphereCenterX, currentSphereCenterY, sphereRadius);
          
          const dx = mouse.x - tempProjected.x;
          const dy = mouse.y - tempProjected.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONFIG.SPHERE_MAGNETIC_RADIUS) {
            const force = (1 - distance / CONFIG.SPHERE_MAGNETIC_RADIUS) * CONFIG.SPHERE_MAGNETIC_STRENGTH;
            const dirLength = Math.sqrt(dx * dx + dy * dy);
            if (dirLength > 0) {
              const tangentX = dx / dirLength;
              const tangentY = dy / dirLength;
              p.displacementX += tangentX * force * 0.02;
              p.displacementY += tangentY * force * 0.02;
            }
          }
        }

        // Apply displacement and renormalize
        x += p.displacementX;
        y += p.displacementY;
        z += p.displacementZ;
        const dist = Math.sqrt(x*x + y*y + z*z);
        if (dist > 0) {
          x /= dist;
          y /= dist;
          z /= dist;
        }

        // Decay displacement
        p.displacementX *= 0.92;
        p.displacementY *= 0.92;
        p.displacementZ *= 0.92;

        // Rotate
        let rotated = rotateY(x, y, z, rotation.y);
        rotated = rotateX(rotated.x, rotated.y, rotated.z, rotation.x);
        rotated = rotateZ(rotated.x, rotated.y, rotated.z, rotation.z);

        // Project to 2D
        const projected = project3DTo2D(rotated.x, rotated.y, rotated.z, currentSphereCenterX, currentSphereCenterY, sphereRadius);
        p.x2d = projected.x;
        p.y2d = projected.y;
        sphere2DPositions.push({ x: projected.x, y: projected.y, particle: p, projected });
      }

      // Update background particles with cross-interaction
      const animationTime = performance.now();
      for (let i = 0; i < backgroundParticles.length; i++) {
        const p = backgroundParticles[i];

        // Parallax effect: Stars at different depths move at different speeds
        // Creates subtle 3D motion effect
        const parallaxOffsetX = Math.sin(animationTime * 0.0001 + p.depth * Math.PI * 2) * CONFIG.PARALLAX_STRENGTH * (1 - p.depth) * 2;
        const parallaxOffsetY = Math.cos(animationTime * 0.00015 + p.depth * Math.PI * 2) * CONFIG.PARALLAX_STRENGTH * (1 - p.depth) * 2;
        
        // Shooting star effect (rare, random)
        if (!p.isShootingStar && Math.random() < CONFIG.SHOOTING_STAR_CHANCE) {
          p.isShootingStar = true;
          p.shootingStarProgress = 0;
          p.shootingStarAngle = Math.random() * Math.PI * 2; // Random direction
          // Make shooting star brighter
          p.baseOpacity = Math.min(1.0, (p.baseOpacity || 0.5) * 2);
        }
        
        if (p.isShootingStar) {
          // Shooting star moves fast in a straight line
          p.shootingStarProgress++;
          const speed = CONFIG.SHOOTING_STAR_SPEED * (1 + p.depth); // Faster if closer
          p.x += Math.cos(p.shootingStarAngle) * speed;
          p.y += Math.sin(p.shootingStarAngle) * speed;
          
          // Fade out as it progresses
          const fadeProgress = p.shootingStarProgress / CONFIG.SHOOTING_STAR_DURATION;
          p.baseOpacity = (p.baseOpacity || 0.5) * (1 - fadeProgress);
          
          // Reset shooting star after duration
          if (p.shootingStarProgress >= CONFIG.SHOOTING_STAR_DURATION) {
            p.isShootingStar = false;
            p.shootingStarProgress = 0;
            // Reset position and opacity
            p.x = Math.random() * width;
            p.y = Math.random() * height;
            p.baseOpacity = 0.3 + Math.random() * 0.7;
          }
        } else {
          // Normal star motion with parallax
          p.x += p.vx + parallaxOffsetX;
          p.y += p.vy + parallaxOffsetY;
        }

        // Calculate distance to sphere FIRST (used for multiple checks)
        const dxToCenter = currentSphereCenterX - p.x;
        const dyToCenter = currentSphereCenterY - p.y;
        const distanceToSphere = Math.sqrt(dxToCenter * dxToCenter + dyToCenter * dyToCenter);
        const isInGravityField = distanceToSphere < CONFIG.GRAVITY_RADIUS;
        const isInOrbit = distanceToSphere >= CONFIG.MIN_ORBITAL_DISTANCE && distanceToSphere <= CONFIG.MAX_ORBITAL_DISTANCE;

        // Mouse magnetic effect (reduced when in gravity field, but still active)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONFIG.BG_MAGNETIC_RADIUS) {
            // Cursor effect is stronger - reduce only slightly in gravity field
            const mouseStrength = isInGravityField 
              ? CONFIG.BG_MAGNETIC_STRENGTH * 0.7  // 30% reduction (cursor still dominant)
              : CONFIG.BG_MAGNETIC_STRENGTH;
            const force = (1 - distance / CONFIG.BG_MAGNETIC_RADIUS) * mouseStrength;
            p.vx += dx * force;
            p.vy += dy * force;
          }
        }

        // Gravitational field around sphere (APPLIED FIRST for maximum effect)
        if (enableGravity && isInGravityField && distanceToSphere > 0) {
          // SIMPLIFIED: Direct strong attraction - no complex calculations
          // Normalize direction vector (points FROM particle TO center)
          const dirX = dxToCenter / distanceToSphere;
          const dirY = dyToCenter / distanceToSphere;
          
          // Calculate gravity force - SIMPLE and STRONG
          // Use inverse distance (not squared) for stronger effect at all distances
          const distanceFactor = 1 - (distanceToSphere / CONFIG.GRAVITY_RADIUS); // 1 at center, 0 at edge
          // Base force that works at all distances + distance-based boost
          const baseForce = CONFIG.GRAVITY_STRENGTH * 0.2; // Always active
          const distanceBoost = (CONFIG.GRAVITY_STRENGTH / distanceToSphere) * (1 + distanceFactor * 10);
          const gravityForce = baseForce + distanceBoost;
          
          // Apply gravitational acceleration (ATTRACTS particles toward center)
          // Apply BEFORE damping to maximize effect
          p.vx += dirX * gravityForce;
          p.vy += dirY * gravityForce;
          
          // STRONG REPULSION: Prevent particles from entering sphere boundary
          const minAllowedDistance = sphereRadius * CONFIG.SPHERE_BOUNDARY_MULTIPLIER; // 1.15x radius = 57.5px
          if (distanceToSphere < minAllowedDistance) {
            // Strong repulsion to push particles away from sphere
            const penetration = minAllowedDistance - distanceToSphere;
            const repulsionForce = penetration * CONFIG.REPULSION_STRENGTH;
            // Push particle away from center
            p.vx -= dirX * repulsionForce;
            p.vy -= dirY * repulsionForce;
            // Also push position slightly outward to prevent getting stuck
            const pushOut = penetration * 0.1;
            p.x -= dirX * pushOut;
            p.y -= dirY * pushOut;
          }
          
          // Orbital mechanics: if particle is in orbital range, add tangential velocity
          if (isInOrbit && distanceToSphere >= minAllowedDistance) {
            // Calculate tangential direction (perpendicular to radial)
            const tangentX = -dirY; // Perpendicular to radial
            const tangentY = dirX;
            
            // Calculate current tangential velocity
            const currentTangentialV = (p.vx * tangentX + p.vy * tangentY);
            
            // Orbital speed: slightly faster than sphere rotation speed
            // Sphere rotates at rotationSpeed (0.4), so orbital speed should be ~1.2-1.5x faster
            const orbitalSpeedRatio = 1.3; // 30% faster than sphere
            const baseOrbitalSpeed = Math.sqrt(gravityForce * distanceToSphere) * CONFIG.ORBITAL_SPEED_MULTIPLIER;
            const speedBoost = currentRotationSpeed * orbitalSpeedRatio * distanceToSphere * 0.015; // Additional speed based on sphere rotation
            const targetTangentialV = baseOrbitalSpeed + speedBoost;
            
            // Gradually adjust to orbital velocity (gentler adjustment for smoother motion)
            const tangentialAdjustment = (targetTangentialV - currentTangentialV) * 0.2;
            p.vx += tangentX * tangentialAdjustment;
            p.vy += tangentY * tangentialAdjustment;
          }
        }

        // Velocity damping (MUCH less damping when in gravity field to preserve gravity effect)
        const damping = isInOrbit 
          ? CONFIG.ORBITAL_DAMPING  // 0.995
          : (isInGravityField 
            ? CONFIG.GRAVITY_DAMPING_REDUCTION  // 0.995 - minimal damping
            : CONFIG.BG_VELOCITY_DAMPING); // 0.98 - normal damping
        p.vx *= damping;
        p.vy *= damping;

        // Boundary wrap (DISABLED when in gravity field to prevent teleporting away)
        if (!isInGravityField) {
          // Only wrap if particle is far from sphere
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        } else {
          // When in gravity field, use bounce instead of wrap
          if (p.x < 0) { p.x = 0; p.vx *= -0.5; }
          if (p.x > width) { p.x = width; p.vx *= -0.5; }
          if (p.y < 0) { p.y = 0; p.vy *= -0.5; }
          if (p.y > height) { p.y = height; p.vy *= -0.5; }
        }

        // Draw background particle (space star with effects)
        // Enhanced twinkling effect (subtle, space-like)
        const time = performance.now() * CONFIG.TWINKLE_SPEED;
        const twinkle = Math.sin(time + (p.twinklePhase || 0)) * CONFIG.TWINKLE_VARIATION;
        // Add secondary twinkle for more realistic effect
        const twinkle2 = Math.sin(time * 1.3 + (p.twinklePhase || 0) * 2) * CONFIG.TWINKLE_VARIATION * 0.5;
        const combinedTwinkle = (twinkle + twinkle2) / 2;
        const twinkledOpacity = Math.max(0.2, Math.min(1.0, (p.baseOpacity || p.opacity) + combinedTwinkle));
        p.opacity = twinkledOpacity;
        
        // Depth-based size and opacity (farther = smaller/fainter)
        const depthFactor = p.depth !== undefined ? p.depth : 0.5;
        const depthSize = p.size * (0.5 + depthFactor * 0.5); // 50-100% of size based on depth
        const depthOpacity = twinkledOpacity * (0.4 + depthFactor * 0.6); // 40-100% opacity
        
        // Shooting star trail effect
        if (p.isShootingStar && p.shootingStarProgress > 0) {
          // Draw trail behind shooting star
          const trailLength = Math.min(30, p.shootingStarProgress * 0.5);
          const trailOpacity = depthOpacity * 0.3;
          const gradient = ctx.createLinearGradient(
            p.x - Math.cos(p.shootingStarAngle) * trailLength,
            p.y - Math.sin(p.shootingStarAngle) * trailLength,
            p.x,
            p.y
          );
          gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
          gradient.addColorStop(1, `rgba(255, 255, 255, ${trailOpacity})`);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = depthSize * 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x - Math.cos(p.shootingStarAngle) * trailLength, p.y - Math.sin(p.shootingStarAngle) * trailLength);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, depthSize, 0, Math.PI * 2);
        
        // Use twinkled opacity for color
        const finalOpacity = depthOpacity;
        const color = getParticleColor(p);
        // Replace opacity in color string
        ctx.fillStyle = color.replace(/[\d\.]+\)$/, `${finalOpacity})`);
        
        // Enhanced glow effect (space star glow)
        if (themeMode === 'dark') {
          const glowSize = depthSize * CONFIG.GLOW_INTENSITY;
          // Brighter glow for shooting stars
          const glowMultiplier = p.isShootingStar ? 2.5 : 1.0;
          ctx.shadowBlur = glowSize * 2 * glowMultiplier;
          // Glow color matches particle color
          if (p.themeColor) {
            const color = p.themeColor;
            ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${finalOpacity * 0.6 * glowMultiplier})`;
          } else {
            ctx.shadowColor = themeMode === 'light'
              ? `rgba(0, 0, 0, ${finalOpacity * 0.6 * glowMultiplier})` // Black fallback
              : `rgba(255, 255, 255, ${finalOpacity * 0.6 * glowMultiplier})`; // White fallback
          }
        }
        
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw atmosphere glow around sphere (space effect)
      if (themeMode === 'dark') {
        const glowRadius = sphereRadius * 1.3;
        const gradient = ctx.createRadialGradient(
          currentSphereCenterX, currentSphereCenterY, sphereRadius * 0.8,
          currentSphereCenterX, currentSphereCenterY, glowRadius
        );
        gradient.addColorStop(0, 'rgba(100, 150, 255, 0.15)'); // Blue glow
        gradient.addColorStop(0.5, 'rgba(150, 200, 255, 0.08)');
        gradient.addColorStop(1, 'rgba(200, 220, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(currentSphereCenterX, currentSphereCenterY, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw sphere particles (use positions from update loop)
      for (let i = 0; i < sphere2DPositions.length; i++) {
        const { x: posX, y: posY, projected: finalProjected, particle: p } = sphere2DPositions[i];

        const dx = finalProjected.x - currentSphereCenterX;
        const dy = finalProjected.y - currentSphereCenterY;
        const distFromCenter2D = Math.sqrt(dx * dx + dy * dy);
        const maxRadius2D = sphereRadius * 1.15;

        if (distFromCenter2D <= maxRadius2D) {
          // Get z from projected depth
          const normalizedZ = (finalProjected.z3d + 1) / 2;
          let alpha = Math.max(0.3, normalizedZ * 0.7 + 0.3); // Brighter for space
          
          const edgeDistance = maxRadius2D - distFromCenter2D;
          if (edgeDistance < CONFIG.EDGE_FADE_DISTANCE) {
            alpha *= edgeDistance / CONFIG.EDGE_FADE_DISTANCE;
          }
          
          if (finalProjected.depth > 0.8 && alpha > 0.15) {
            ctx.beginPath();
            const particleSize = Math.max(1.5, p.size * finalProjected.scale);
            ctx.arc(finalProjected.x, finalProjected.y, particleSize, 0, Math.PI * 2);
            const finalOpacity = alpha * parseFloat(p.opacity);
            ctx.fillStyle = getParticleColor(p).replace(/[\d\.]+\)$/, `${finalOpacity})`);
            
            // Enhanced glow for sphere particles (theme-colored)
            ctx.shadowBlur = 6 * finalProjected.scale * normalizedZ * CONFIG.GLOW_INTENSITY;
            if (p.themeColor) {
              const color = p.themeColor;
              ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${finalOpacity * 0.5})`;
            } else {
              ctx.shadowColor = themeMode === 'light'
                ? `rgba(30, 58, 138, ${finalOpacity * 0.5})` // Dark blue fallback
                : `rgba(147, 197, 253, ${finalOpacity * 0.5})`; // Very light blue fallback
            }
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }


      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      if (enableInteraction) {
        canvas.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("mouseleave", handleMouseLeave);
        // Remove touch event listeners
        canvas.removeEventListener("touchstart", handleTouchStart);
        canvas.removeEventListener("touchmove", handleTouchMove);
        canvas.removeEventListener("touchend", handleTouchEnd);
        canvas.removeEventListener("touchcancel", handleTouchEnd);
      } else {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseleave", handleMouseLeave);
      }
      ctx.clearRect(0, 0, width, height);
    };
  }, [mounted, themeMode, backgroundIntensity, backgroundParticleCount, sphereRadius, sphereParticleCount, rotationSpeed, enableInteraction, enableGravity, sphereOffsetY]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: enableInteraction ? "auto" : "none",
        cursor: enableInteraction ? "grab" : "default",
        zIndex: 0,
      }}
      onMouseDown={(e) => {
        if (enableInteraction) {
          e.currentTarget.style.cursor = "grabbing";
        }
      }}
      onMouseUp={(e) => {
        if (enableInteraction) {
          e.currentTarget.style.cursor = "grab";
        }
      }}
    />
  );
}
