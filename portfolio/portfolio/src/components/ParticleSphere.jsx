import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext.jsx";

/**
 * ParticleSphere - 3D sphere made of particles
 * Particles arranged in spherical formation, projected to 2D canvas
 * Interactive rotation and magnetic cursor effects
 */
export default function ParticleSphere({ 
  radius = 40, // Sphere radius in pixels
  particleCount = 120, // Number of particles
  rotationSpeed = 0.5, // Auto-rotation speed
  enableInteraction = true, // Enable drag to rotate
  ringParticleCount = 80, // Number of ring particles
  ringRadius = 1.8 // Ring radius multiplier (relative to sphere radius)
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const particlesRef = useRef([]);
  const ringParticlesRef = useRef([]);
  const mouseRef = useRef({ x: null, y: null });
  const rotationRef = useRef({ x: 0, y: 0, z: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const { theme: themeMode } = useTheme();

  // Configuration
  const CONFIG = {
    PARTICLE_SIZE_MIN: 0.8,
    PARTICLE_SIZE_MAX: 1.0,
    MAGNETIC_RADIUS: 60,
    MAGNETIC_STRENGTH: 0.01,
    DPR_CAP: 2.0,
    PERSPECTIVE: 400, // Higher = less zoom, shows proper sphere size
    EDGE_FADE_DISTANCE: 8, // Distance from edge to start fading
  };

  // Generate sphere particles using proper spherical distribution
  const generateSphereParticles = (count, sphereRadius) => {
    const particles = [];
    
    // Improved Fibonacci sphere distribution for even coverage
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden angle
    
    for (let i = 0; i < count; i++) {
      // Uniform distribution on sphere using golden angle spiral
      const y = 1 - (i / (count - 1)) * 2; // y from -1 to 1
      const radiusAtY = Math.sqrt(1 - y * y); // Radius at this y level
      const theta = goldenAngle * i; // Golden angle spiral
      
      // Convert to Cartesian coordinates (unit sphere)
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      
      particles.push({
        // 3D position (normalized to unit sphere)
        x3d: x,
        y3d: y,
        z3d: z,
        // 2D projected position (will be calculated)
        x2d: 0,
        y2d: 0,
        size: CONFIG.PARTICLE_SIZE_MIN + Math.random() * (CONFIG.PARTICLE_SIZE_MAX - CONFIG.PARTICLE_SIZE_MIN),
        baseHue: themeMode === 'light' ? 200 + Math.random() * 60 : 0,
        opacity: themeMode === 'light' ? 0.5 + Math.random() * 0.3 : 0.4 + Math.random() * 0.25,
        // For magnetic effect - store original 3D position
        originalX3d: x,
        originalY3d: y,
        originalZ3d: z,
        // Displacement for magnetic effect (in 3D space)
        displacementX: 0,
        displacementY: 0,
        displacementZ: 0,
      });
    }
    
    return particles;
  };

  // Generate ring particles around the sphere (like Saturn's rings)
  const generateRingParticles = (count, sphereRadius, ringRadiusMultiplier) => {
    const particles = [];
    // ringRadiusMultiplier should make ring diameter = 1.5x sphere diameter
    // So ring radius = 1.5 * sphere radius (since diameter = 2 * radius)
    // If sphere radius = 50px, ring radius = 75px, ring diameter = 150px
    const ringRadiusValue = sphereRadius * ringRadiusMultiplier;
    
    for (let i = 0; i < count; i++) {
      // Distribute particles in a flat ring (in XZ plane, Y = 0)
      const angle = (i / count) * Math.PI * 2;
      // Ring particles distributed between 1.0x and ringRadiusMultiplier x sphere radius
      const distance = sphereRadius * (1.1 + Math.random() * (ringRadiusMultiplier - 1.0) * 0.9);
      
      // Position in XZ plane (Y = 0 for flat ring, or slight Y variation for tilted ring)
      const x = Math.cos(angle) * distance;
      const y = (Math.random() - 0.5) * 0.15; // Less vertical spread
      const z = Math.sin(angle) * distance;
      
      particles.push({
        x3d: x / sphereRadius, // Normalize to unit scale relative to sphere
        y3d: y / sphereRadius,
        z3d: z / sphereRadius,
        originalX3d: x / sphereRadius,
        originalY3d: y / sphereRadius,
        originalZ3d: z / sphereRadius,
        size: CONFIG.PARTICLE_SIZE_MIN + Math.random() * (CONFIG.PARTICLE_SIZE_MAX - CONFIG.PARTICLE_SIZE_MIN),
        baseHue: themeMode === 'light' ? 200 + Math.random() * 60 : 0,
        opacity: themeMode === 'light' ? 0.35 + Math.random() * 0.25 : 0.3 + Math.random() * 0.2,
        displacementX: 0,
        displacementY: 0,
        displacementZ: 0,
      });
    }
    
    return particles;
  };

  // Rotate 3D point around X axis
  const rotateX = (x, y, z, angle) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: x,
      y: y * cos - z * sin,
      z: y * sin + z * cos
    };
  };

  // Rotate 3D point around Y axis
  const rotateY = (x, y, z, angle) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: x * cos + z * sin,
      y: y,
      z: -x * sin + z * cos
    };
  };

  // Rotate 3D point around Z axis
  const rotateZ = (x, y, z, angle) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: x * cos - y * sin,
      y: x * sin + y * cos,
      z: z
    };
  };

  // Project 3D point to 2D canvas with proper perspective
  const project3DTo2D = (x, y, z, centerX, centerY, sphereRadius) => {
    // Add offset to z to bring sphere forward (z ranges from -1 to 1)
    // Higher offset = sphere further back, shows proper size (not zoomed)
    const zOffset = 2.2; // Keep sphere at proper distance to show actual size
    const zAdjusted = z + zOffset;
    const scale = CONFIG.PERSPECTIVE / (CONFIG.PERSPECTIVE + zAdjusted);
    const projectedX = centerX + x * sphereRadius * scale;
    const projectedY = centerY + y * sphereRadius * scale;
    
    return {
      x: projectedX,
      y: projectedY,
      scale: Math.max(0.5, scale), // Minimum scale to prevent particles from disappearing
      depth: zAdjusted,
      z3d: z // Store original z for edge detection
    };
  };

  // Get particle color
  const getParticleColor = (particle) => {
    if (themeMode === 'light') {
      return `hsla(${particle.baseHue}, 70%, 65%, ${particle.opacity})`;
    } else {
      return `rgba(255, 255, 255, ${particle.opacity})`;
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mounted) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    
    // Use CSS size directly (more reliable than getBoundingClientRect on initial load)
    const CSS_WIDTH = 120;
    const CSS_HEIGHT = 120;
    let width = CSS_WIDTH;
    let height = CSS_HEIGHT;
    let centerX = width / 2;
    let centerY = height / 2;

    // DPR capping
    const DPR = Math.min(CONFIG.DPR_CAP, window.devicePixelRatio || 1);

    // Resize handler - always use CSS size as source of truth
    const resize = () => {
      // Always use CSS size - don't rely on getBoundingClientRect which can be wrong
      width = CSS_WIDTH;
      height = CSS_HEIGHT;
      
      centerX = width / 2; // Always 60
      centerY = height / 2; // Always 60
      
      // Set canvas size - must match CSS size
      canvas.width = Math.floor(width * DPR);
      canvas.height = Math.floor(height * DPR);
      
      if (ctx.resetTransform) ctx.resetTransform();
      ctx.scale(DPR, DPR);
    };

    // Initialize with requestAnimationFrame to ensure canvas is rendered
    const initCanvas = () => {
      requestAnimationFrame(() => {
        resize(); // Ensure canvas is properly sized
        // Double-check after a small delay to handle any layout shifts
        setTimeout(() => {
          resize();
        }, 10);
      });
    };

    initCanvas();
    window.addEventListener("resize", resize);

    // Initialize particles
    particlesRef.current = generateSphereParticles(particleCount, radius);
    ringParticlesRef.current = generateRingParticles(ringParticleCount, radius, ringRadius);

    // Mouse tracking - store canvas-relative coordinates
    const handleMouseMove = (e) => {
      if (isDraggingRef.current && enableInteraction) {
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;
        
        rotationRef.current.y += deltaX * 0.01;
        rotationRef.current.x -= deltaY * 0.01;
        
        dragStartRef.current.x = e.clientX;
        dragStartRef.current.y = e.clientY;
      } else {
        // Convert window coordinates to canvas-relative coordinates
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.x = e.clientX - rect.left;
        mouseRef.current.y = e.clientY - rect.top;
      }
    };

    const handleMouseDown = (e) => {
      if (!enableInteraction) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Check if click is near sphere center
      const distToCenter = Math.sqrt(
        Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
      );
      
      if (distToCenter < radius * 1.5) {
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

    if (enableInteraction) {
      canvas.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("mouseleave", handleMouseLeave);
    } else {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseleave", handleMouseLeave);
    }

    // Animation loop
    let lastTime = performance.now();
    let frameCount = 0;
    const animate = (currentTime) => {
      const deltaTime = Math.min(0.033, (currentTime - lastTime) / 1000);
      lastTime = currentTime;
      frameCount++;

      // Ensure canvas size is always correct (use CSS size as source of truth)
      if (frameCount < 3) {
        width = CSS_WIDTH;
        height = CSS_HEIGHT;
        centerX = width / 2;
        centerY = height / 2;
        // Re-apply canvas sizing to ensure it's correct
        canvas.width = Math.floor(width * DPR);
        canvas.height = Math.floor(height * DPR);
        if (ctx.resetTransform) ctx.resetTransform();
        ctx.scale(DPR, DPR);
      }

      // Auto-rotation
      if (!isDraggingRef.current) {
        rotationRef.current.y += rotationSpeed * deltaTime;
      }

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      const ringParticles = ringParticlesRef.current;
      const rotation = rotationRef.current;
      const mouse = mouseRef.current;

      // Ensure centerX and centerY are valid (safeguard - calculate once per frame)
      const validCenterX = (centerX > 0) ? centerX : width / 2;
      const validCenterY = (centerY > 0) ? centerY : height / 2;

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Start with original 3D position
        let x = p.originalX3d;
        let y = p.originalY3d;
        let z = p.originalZ3d;

        // Apply magnetic displacement if mouse is nearby (in 3D space)
        if (mouse.x !== null && mouse.y !== null) {
          // First project current position to get 2D screen position
          const projected = project3DTo2D(x, y, z, validCenterX, validCenterY, radius);
          const dx = mouse.x - projected.x;
          const dy = mouse.y - projected.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONFIG.MAGNETIC_RADIUS) {
            const force = (1 - distance / CONFIG.MAGNETIC_RADIUS) * CONFIG.MAGNETIC_STRENGTH;
            
            // Convert 2D mouse force to 3D displacement on sphere surface
            // Normalize the direction vector
            const dirLength = Math.sqrt(dx * dx + dy * dy);
            if (dirLength > 0) {
              // Project mouse direction onto sphere's tangent plane
              // This preserves the sphere shape
              const tangentX = dx / dirLength;
              const tangentY = dy / dirLength;
              
              // Apply displacement along sphere surface (tangent to surface)
              // Use cross product to find tangent direction
              const normalX = x; // Normalized, so this is the normal
              const normalY = y;
              const normalZ = z;
              
              // Simple approach: push particle away from center slightly, then renormalize
              const pushAmount = force * 0.02;
              p.displacementX += tangentX * pushAmount;
              p.displacementY += tangentY * pushAmount;
            }
          }
        }

        // Apply displacement and renormalize to keep on sphere surface
        x += p.displacementX;
        y += p.displacementY;
        z += p.displacementZ;
        
        // Renormalize to unit sphere to preserve shape
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

        // Apply rotations
        let rotated = rotateY(x, y, z, rotation.y);
        rotated = rotateX(rotated.x, rotated.y, rotated.z, rotation.x);
        rotated = rotateZ(rotated.x, rotated.y, rotated.z, rotation.z);

        // Project to 2D (using validCenterX and validCenterY calculated above)
        // Ring particles are already normalized, so projection uses radius directly
        const projected = project3DTo2D(rotated.x, rotated.y, rotated.z, validCenterX, validCenterY, radius);
        
        // Store 2D position
        p.x2d = projected.x;
        p.y2d = projected.y;
        
        // Calculate distance from sphere center in 2D
        const dx = projected.x - validCenterX;
        const dy = projected.y - validCenterY;
        const distFromCenter2D = Math.sqrt(dx * dx + dy * dy);
        const maxRadius2D = radius * 1.15; // Slightly larger for edge fade
        
        // Only draw if particle is within sphere boundary (circular clipping)
        if (distFromCenter2D <= maxRadius2D) {
          // Calculate depth for opacity (fade particles on back)
          const normalizedZ = (rotated.z + 1) / 2; // Normalize from -1..1 to 0..1
          let alpha = Math.max(0.25, normalizedZ * 0.75 + 0.25); // Better depth fade
          
          // Edge fade - fade particles near sphere edge for circular appearance
          const edgeDistance = maxRadius2D - distFromCenter2D;
          if (edgeDistance < CONFIG.EDGE_FADE_DISTANCE) {
            const edgeFade = edgeDistance / CONFIG.EDGE_FADE_DISTANCE;
            alpha *= edgeFade; // Fade out at edges
          }
          
          // Only draw if particle is visible (not too far back)
          if (projected.depth > 0.8 && alpha > 0.15) {
            ctx.beginPath();
            const particleSize = Math.max(0.8, p.size * projected.scale); // Uniform particle size
            ctx.arc(projected.x, projected.y, particleSize, 0, Math.PI * 2);
            
            // Adjust opacity based on depth and edge fade
            const finalOpacity = alpha * parseFloat(p.opacity);
            ctx.fillStyle = getParticleColor(p).replace(/[\d\.]+\)$/, `${finalOpacity})`);
            
            // Glow effect for particles closer to camera (better depth perception)
            if (themeMode === 'dark') {
              const glowIntensity = normalizedZ;
              ctx.shadowBlur = 5 * projected.scale * glowIntensity;
              ctx.shadowColor = `rgba(255, 255, 255, ${finalOpacity * 0.4})`;
            }
            
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      // Update and draw ring particles
      for (let i = 0; i < ringParticles.length; i++) {
        const p = ringParticles[i];
        
        // Start with original 3D position
        let x = p.originalX3d;
        let y = p.originalY3d;
        let z = p.originalZ3d;

        // Apply rotations (rings rotate with sphere)
        let rotated = rotateY(x, y, z, rotation.y);
        rotated = rotateX(rotated.x, rotated.y, rotated.z, rotation.x);
        rotated = rotateZ(rotated.x, rotated.y, rotated.z, rotation.z);

        // Project to 2D (using validCenterX and validCenterY calculated above)
        // Ring particles are normalized (x3d is relative to sphere radius)
        // So when projecting, we multiply by radius to get actual pixel position
        // ringRadius = 1.5 means ring extends to 1.5x sphere radius = 75px from center
        const projected = project3DTo2D(rotated.x, rotated.y, rotated.z, validCenterX, validCenterY, radius);
        
        // Calculate distance from sphere center in 2D
        const dx = projected.x - validCenterX;
        const dy = projected.y - validCenterY;
        const distFromCenter2D = Math.sqrt(dx * dx + dy * dy);
        
        // Ring diameter = 1.5x sphere diameter (100px * 1.5 = 150px)
        // So ring radius = 75px = radius (50px) * ringRadius (1.5)
        const minRingRadius2D = radius * 1.05; // Start just outside sphere (52.5px)
        const maxRingRadius2D = radius * ringRadius * 1.1; // Ring extends to ~82.5px (75px * 1.1 for edge fade)
        
        // STRICT circular clipping - enforce circular boundary to prevent square appearance
        // Ring extends to exactly 1.5x sphere radius (75px) with fade zone
        const absoluteMaxRadius = radius * ringRadius * 1.12; // Absolute maximum with fade
        
        // Only draw if within circular boundary (not square)
        if (distFromCenter2D <= absoluteMaxRadius) {
          // Check if particle is within the ring annulus (donut shape)
          const isInRing = distFromCenter2D >= minRingRadius2D && distFromCenter2D <= maxRingRadius2D;
          // Calculate depth for opacity
          const normalizedZ = (rotated.z + 1) / 2;
          let alpha = Math.max(0.2, normalizedZ * 0.6 + 0.2);
          
          if (isInRing) {
            // Edge fade for ring particles (both inner and outer edges)
            const outerEdgeDistance = maxRingRadius2D - distFromCenter2D;
            const innerEdgeDistance = distFromCenter2D - minRingRadius2D;
            if (outerEdgeDistance < CONFIG.EDGE_FADE_DISTANCE) {
              const edgeFade = outerEdgeDistance / CONFIG.EDGE_FADE_DISTANCE;
              alpha *= edgeFade;
            }
            if (innerEdgeDistance < CONFIG.EDGE_FADE_DISTANCE * 0.5) {
              const edgeFade = innerEdgeDistance / (CONFIG.EDGE_FADE_DISTANCE * 0.5);
              alpha *= edgeFade;
            }
          } else {
            // Fade out particles outside the ring but within absolute max (for smooth circular edge)
            const fadeDistance = absoluteMaxRadius - distFromCenter2D;
            if (fadeDistance < CONFIG.EDGE_FADE_DISTANCE * 2) {
              alpha *= fadeDistance / (CONFIG.EDGE_FADE_DISTANCE * 2);
            } else {
              alpha = 0; // Don't draw outside absolute max
            }
          }
          
          // Only draw if visible and has sufficient opacity
          if (projected.depth > 0.8 && alpha > 0.15) {
              ctx.beginPath();
              const particleSize = Math.max(0.8, p.size * projected.scale); // Match sphere particle size
              ctx.arc(projected.x, projected.y, particleSize, 0, Math.PI * 2);
              
              const finalOpacity = alpha * parseFloat(p.opacity);
              ctx.fillStyle = getParticleColor(p).replace(/[\d\.]+\)$/, `${finalOpacity})`);
              
              // Subtle glow for ring particles
              if (themeMode === 'dark') {
                const glowIntensity = normalizedZ * 0.4;
                ctx.shadowBlur = 4 * projected.scale * glowIntensity;
                ctx.shadowColor = `rgba(255, 255, 255, ${finalOpacity * 0.3})`;
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
      } else {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseleave", handleMouseLeave);
      }
      ctx.clearRect(0, 0, width, height);
    };
  }, [mounted, themeMode, particleCount, radius, rotationSpeed, enableInteraction, ringParticleCount, ringRadius]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: "120px",
        height: "120px",
        pointerEvents: enableInteraction ? "auto" : "none",
        cursor: enableInteraction ? "grab" : "default",
        zIndex: 1,
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
