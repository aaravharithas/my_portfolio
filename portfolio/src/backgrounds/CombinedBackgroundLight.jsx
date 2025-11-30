// CombinedBackgroundLight.jsx
// Ultra-lightweight orbiting particle background for laptops/PCs.
// - ~70 orbiting particles
// - Scroll reverses orbit direction
// - No trails, no ripples, minimal shadows
// - Very low CPU/GPU usage
// - Safe DPR scaling & cleanup

import React, { useEffect, useRef } from "react";

export default function CombinedBackgroundLight() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  // EASY TUNING (top of file)
  const CONFIG = {
    PARTICLES: 70,
    ORBIT_MIN: 48,
    ORBIT_MAX: 160,
    ORBIT_SPEED: 0.42,
    DPR_CAP: 1.6,
    SHADOW_BLUR: 6, // low-cost shadow
  };

  const rand = (a, b) => Math.random() * (b - a) + a;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });

    // DPR & resize
    const DPR = Math.min(CONFIG.DPR_CAP, window.devicePixelRatio || 1);
    let w = window.innerWidth;
    let h = window.innerHeight;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      if (ctx.resetTransform) ctx.resetTransform();
      ctx.scale(DPR, DPR);
    }
    resize();
    window.addEventListener("resize", resize);

    // center static; no drifting
    const center = { x: w / 2, y: h / 2 };

    // particles
    const particles = new Array(CONFIG.PARTICLES).fill(0).map(() => ({
      angle: rand(0, Math.PI * 2),
      radius: rand(CONFIG.ORBIT_MIN, CONFIG.ORBIT_MAX),
      speed: CONFIG.ORBIT_SPEED * rand(0.75, 1.25),
      size: rand(1.1, 3.0),
      hue: rand(160, 260),
    }));

    // scroll direction
    let scrollDir = 1;
    let lastScrollY = window.scrollY || 0;
    function onScroll() {
      scrollDir = window.scrollY > lastScrollY ? 1 : -1;
      lastScrollY = window.scrollY;
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    // animation loop
    let last = performance.now();
    function frame(now) {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;

      // clear
      ctx.clearRect(0, 0, w, h);

      // black background
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);

      // draw particles (orbit only)
      for (let p of particles) {
        p.angle += p.speed * dt * scrollDir;
        const x = center.x + Math.cos(p.angle) * p.radius;
        const y = center.y + Math.sin(p.angle) * p.radius;

        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 88%, 60%, 0.9)`;
        ctx.shadowBlur = CONFIG.SHADOW_BLUR;
        ctx.shadowColor = `hsla(${p.hue}, 88%, 70%, 0.85)`;
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);

    // cleanup
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      // clear canvas
      ctx.clearRect(0, 0, w, h);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
        background: "#000",
      }}
    />
  );
}
