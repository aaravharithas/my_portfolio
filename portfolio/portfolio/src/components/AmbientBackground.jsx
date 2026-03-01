import React, { useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext.jsx";
import { isTouchDevice } from "../utils/responsiveUtils.js";

const NUM_PARTICLES = 50;
const PARTICLE_RADIUS = 1.5;
const REPULSION_RADIUS = 110;
const REPULSION_STRENGTH = 6;
const SPRING_STRENGTH = 0.035;
const DAMPING = 0.88;

const ACCENT_COLORS = [
  [96, 165, 250],   // blue
  [167, 139, 250],  // violet
  [244, 114, 182],  // pink
  [52, 211, 153],   // emerald
  [251, 191, 36],   // amber
  [45, 212, 191],   // teal
];

// Wrapper: skip entirely on touch/mobile — no mouse cursor on those devices
export default function AmbientBackground() {
  if (isTouchDevice()) return null;
  return <AmbientBackgroundCanvas />;
}

function AmbientBackgroundCanvas() {
  const { theme: themeMode } = useTheme();
  const canvasRef = useRef(null);
  const stateRef = useRef({ particles: [], mouse: null, raf: null, theme: themeMode });

  // Keep theme in sync without restarting the animation loop
  useEffect(() => {
    stateRef.current.theme = themeMode;
  }, [themeMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const buildParticles = (w, h) =>
      Array.from({ length: NUM_PARTICLES }, () => {
        const [r, g, b] = ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)];
        const x = Math.random() * w;
        const y = Math.random() * h;
        return { homeX: x, homeY: y, x, y, vx: 0, vy: 0, r, g, b,
                 opacity: 0.25 + Math.random() * 0.25 };
      });

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stateRef.current.particles = buildParticles(canvas.width, canvas.height);
    };

    const animate = () => {
      const { particles, mouse, theme } = stateRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        // Spring return to home position
        p.vx += (p.homeX - p.x) * SPRING_STRENGTH;
        p.vy += (p.homeY - p.y) * SPRING_STRENGTH;

        // Mouse repulsion
        if (mouse) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          const radSq = REPULSION_RADIUS * REPULSION_RADIUS;
          if (distSq < radSq && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const force = (REPULSION_RADIUS - dist) / REPULSION_RADIUS * REPULSION_STRENGTH;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x += p.vx;
        p.y += p.vy;

        const alpha = theme === "light" ? p.opacity * 0.35 : p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, PARTICLE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${alpha})`;
        ctx.fill();
      }

      stateRef.current.raf = requestAnimationFrame(animate);
    };

    const onMouseMove = (e) => {
      stateRef.current.mouse = { x: e.clientX, y: e.clientY };
    };
    const onMouseLeave = () => {
      stateRef.current.mouse = null;
    };
    const onResize = () => {
      const oldW = canvas.width;
      const oldH = canvas.height;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Remap home positions proportionally so particles spread to new viewport
      for (const p of stateRef.current.particles) {
        p.homeX = (p.homeX / oldW) * canvas.width;
        p.homeY = (p.homeY / oldH) * canvas.height;
      }
    };

    init();
    stateRef.current.raf = requestAnimationFrame(animate);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(stateRef.current.raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
}
