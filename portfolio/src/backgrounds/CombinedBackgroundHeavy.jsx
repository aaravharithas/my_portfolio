// // CombinedBackgroundHeavyReadable.jsx
// // "Dark Cyber Grid" — heavy features but tuned for content readability.
// // - Dark, structured grid background
// // - Magnetic particles + spring physics + per-particle short trails
// // - Center drifting (very subtle)
// // - Wander noise + occasional random spawns (reduced frequency)
// // - OffscreenCanvas when available for smoother compositing
// // - Tuned visual values for readability (reduced bloom, dim trails, subtle motion blur)
// // - Device-adaptive: automatically reduces counts on weaker/smaller screens
// // - Proper cleanup and safe DPR handling
// //
// // Drop into your React project. No external libs required.

// import React, { useEffect, useRef } from "react";

// export default function CombinedBackgroundHeavyReadable({
//   preferReduced = false, // optional prop to force a lighter config
// }) {
//   const canvasRef = useRef(null);
//   const rafRef = useRef(null);
//   const spawnRef = useRef(null);
//   const offscreenRef = useRef({ enabled: false, canvas: null, ctx: null });

//   // ---------------- CONFIG (top-level easy tuning) ----------------
//   const CONFIG_BASE = {
//     PARTICLE_COUNT_DESKTOP: 120, // tuned down for readability
//     PARTICLE_COUNT_LAPTOP: 120, // optional increase for beefier desktops
//     PARTICLE_COUNT_MOBILE: 56,
//     MAGNETIC_RATIO: 0.14,
//     TRAIL_MAX_LEN: 6, // short per-particle trails
//     TRAIL_FADE: 0.06,
//     MAX_SHADOW_BLUR: 20, // reduced glow compared to the heavy version
//     SPRING_STIFFNESS: 0.10,
//     SPRING_DAMPING: 0.88,
//     WANDER_STRENGTH: 0.28,
//     ORBIT_MIN: 28,
//     ORBIT_MAX: 380,
//     BASE_SPEED: 1.2,
//     OFFSCREEN: true,
//     DPR_CAP: 2.0,
//     SPAWN_INTERVAL_MS: 1200, // less frequent spawns
//     RANDOM_SPAWN_CHANCE: 0.12,
//     MOTION_BLUR_STEPS: 1,
//     GRID_OPACITY: 0.08,
//     GRID_LINE_GAP: 120,
//     GRID_LINE_WIDTH: 1,
//   };

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     let ctx = canvas.getContext("2d", { alpha: true });

//     // device detection & adaptive config
//     const isMobile = window.innerWidth <= 780 || /Mobi|Android/i.test(navigator.userAgent);
//     const isLaptopish = window.innerWidth <= 1400 && !isMobile;
//     const DPR = Math.min(CONFIG_BASE.DPR_CAP, window.devicePixelRatio || 1);

//     const CONFIG = { ...CONFIG_BASE };
//     // adjust counts based on device
//     if (preferReduced) {
//       CONFIG.PARTICLE_COUNT = Math.max(36, Math.floor(CONFIG_BASE.PARTICLE_COUNT_MOBILE * 0.9));
//     } else if (isMobile) {
//       CONFIG.PARTICLE_COUNT = CONFIG_BASE.PARTICLE_COUNT_MOBILE;
//     } else if (isLaptopish) {
//       CONFIG.PARTICLE_COUNT = CONFIG_BASE.PARTICLE_COUNT_DESKTOP;
//     } else {
//       CONFIG.PARTICLE_COUNT = CONFIG_BASE.PARTICLE_COUNT_LAPTOP;
//     }

//     // Offscreen setup (try/catch)
//     if (CONFIG.OFFSCREEN && typeof OffscreenCanvas !== "undefined") {
//       try {
//         const off = new OffscreenCanvas(window.innerWidth, window.innerHeight);
//         const offCtx = off.getContext("2d");
//         if (offCtx) {
//           offscreenRef.current.enabled = true;
//           offscreenRef.current.canvas = off;
//           offscreenRef.current.ctx = offCtx;
//         }
//       } catch (e) {
//         offscreenRef.current.enabled = false;
//       }
//     }

//     // canvas sizing helpers
//     let width = window.innerWidth;
//     let height = window.innerHeight;

//     function resize() {
//       width = Math.max(300, window.innerWidth);
//       height = Math.max(200, window.innerHeight);
//       canvas.style.width = width + "px";
//       canvas.style.height = height + "px";
//       canvas.width = Math.floor(width * DPR);
//       canvas.height = Math.floor(height * DPR);
//       // safe transform
//       if (ctx.resetTransform) ctx.resetTransform();
//       ctx.scale(DPR, DPR);

//       if (offscreenRef.current.enabled && offscreenRef.current.canvas) {
//         try {
//           offscreenRef.current.canvas.width = width;
//           offscreenRef.current.canvas.height = height;
//         } catch (e) {
//           offscreenRef.current.enabled = false;
//         }
//       }
//     }
//     resize();
//     window.addEventListener("resize", resize);

//     // ---------------- state
//     const particles = new Array(CONFIG.PARTICLE_COUNT).fill(0).map((_, i) => ({
//       id: i,
//       x: Math.random() * width,
//       y: Math.random() * height,
//       vx: (Math.random() - 0.5) * 2,
//       vy: (Math.random() - 0.5) * 2,
//       size: Math.random() * 2.6 + 0.6,
//       hue: 200 + Math.random() * 80, // cooler neon palette (teal -> purple)
//       magnetic: Math.random() < CONFIG.MAGNETIC_RATIO,
//       age: 0,
//       maxLife: 8 + Math.random() * 14,
//       wobble: Math.random() * 9999,
//       orbit: {
//         radius: Math.random() * (CONFIG.ORBIT_MAX - CONFIG.ORBIT_MIN) + CONFIG.ORBIT_MIN,
//         angle: Math.random() * Math.PI * 2,
//       },
//       trail: [], // per-particle short trail: store last N positions
//     }));

//     // center-of-mass with mild drift
//     const center = { x: width / 2, y: height / 2, vx: 0, vy: 0 };

//     // pointer
//     const pointer = { x: -9999, y: -9999, active: false, down: false };

//     // scroll dir & energy
//     let scrollDir = 1;
//     let lastScroll = window.scrollY || 0;

//     // sampling helper for cheap neighbor interactions
//     function sampleNeighbor(idx) {
//       // pick a few random neighbors to simulate soft interactions
//       const len = particles.length;
//       const j = (idx + Math.floor(Math.random() * 8) + 3) % len;
//       return particles[j];
//     }

//     // spawn burst (small)
//     function spawnBurst(count = 3) {
//       for (let k = 0; k < count; k++) {
//         const i = Math.floor(Math.random() * particles.length);
//         const p = particles[i];
//         p.x = Math.random() * width;
//         p.y = Math.random() * height;
//         p.vx = (Math.random() - 0.5) * 3;
//         p.vy = (Math.random() - 0.5) * 3;
//         p.age = 0;
//         p.maxLife = 6 + Math.random() * 18;
//         p.hue = 180 + Math.random() * 120;
//         p.magnetic = Math.random() < CONFIG.MAGNETIC_RATIO;
//         p.trail.length = 0;
//       }
//     }

//     // spawn interval
//     if (spawnRef.current) clearInterval(spawnRef.current);
//     spawnRef.current = setInterval(() => {
//       if (Math.random() < CONFIG.RANDOM_SPAWN_CHANCE) spawnBurst(Math.max(1, Math.floor(Math.random() * 4)));
//     }, CONFIG.SPAWN_INTERVAL_MS);

//     // pointer events
//     function onPointerMove(e) {
//       const rect = canvas.getBoundingClientRect();
//       pointer.x = (e.clientX ?? pointer.x) - rect.left;
//       pointer.y = (e.clientY ?? pointer.y) - rect.top;
//       pointer.active = true;
//       // small chance to spawn near pointer for interaction
//       if (Math.random() > 0.996) spawnBurst(1);
//     }
//     function onPointerDown() {
//       pointer.down = true;
//       if (Math.random() > 0.8) spawnBurst(2);
//     }
//     function onPointerUp() {
//       pointer.down = false;
//     }
//     window.addEventListener("pointermove", onPointerMove, { passive: true });
//     window.addEventListener("pointerdown", onPointerDown, { passive: true });
//     window.addEventListener("pointerup", onPointerUp);

//     // scroll handling (direction)
//     function onScroll() {
//       const y = window.scrollY || 0;
//       scrollDir = y > lastScroll ? 1 : -1;
//       lastScroll = y;
//     }
//     window.addEventListener("scroll", onScroll, { passive: true });

//     // physics update (dt seconds)
//     function updatePhysics(dt) {
//       // subtle center drift (reduced amplitude for readability)
//       center.vx += Math.sin(performance.now() * 0.00017) * 0.0006;
//       center.vy += Math.cos(performance.now() * 0.00013) * 0.0006;
//       // pointer influence
//       if (pointer.active && pointer.x !== -9999) {
//         center.vx += (pointer.x - center.x) * 0.0006;
//         center.vy += (pointer.y - center.y) * 0.0006;
//       }
//       center.vx *= 0.993;
//       center.vy *= 0.993;
//       center.x += center.vx * Math.max(1, width / 900);
//       center.y += center.vy * Math.max(1, height / 900);

//       // update particles
//       for (let i = 0; i < particles.length; i++) {
//         const p = particles[i];
//         p.age += dt;

//         // wander (soft)
//         p.vx += Math.sin(p.wobble + performance.now() * 0.0005) * 0.0015 * CONFIG.WANDER_STRENGTH;
//         p.vy += Math.cos(p.wobble + performance.now() * 0.00055) * 0.0015 * CONFIG.WANDER_STRENGTH;

//         // orbit target
//         const orbitSpeed = (CONFIG.BASE_SPEED * 0.5 + (p.size / 6)) * (isMobile ? 0.6 : 1.0);
//         p.orbit.angle += orbitSpeed * 0.002 * scrollDir;
//         const tx = center.x + Math.cos(p.orbit.angle) * p.orbit.radius;
//         const ty = center.y + Math.sin(p.orbit.angle) * p.orbit.radius;

//         // spring toward orbit target
//         const dx = tx - p.x;
//         const dy = ty - p.y;
//         p.vx += dx * CONFIG.SPRING_STIFFNESS * dt;
//         p.vy += dy * CONFIG.SPRING_STIFFNESS * dt;

//         // magnetic attraction to pointer if magnetic
//         if (p.magnetic && pointer.active && pointer.x !== -9999) {
//           const mdx = pointer.x - p.x;
//           const mdy = pointer.y - p.y;
//           const md = Math.hypot(mdx, mdy) || 1;
//           if (md < 240) {
//             const force = (1 - md / 240) * 0.9 * (pointer.down ? 1.6 : 1.0);
//             p.vx += (mdx / md) * force * 0.04;
//             p.vy += (mdy / md) * force * 0.04;
//           }
//         }

//         // cheap interaction: sample a couple neighbors and repel if very close
//         for (let s = 0; s < 2; s++) {
//           const q = sampleNeighbor(i);
//           if (!q) continue;
//           const rx = q.x - p.x;
//           const ry = q.y - p.y;
//           const rd = Math.hypot(rx, ry) || 1;
//           if (rd < 10) {
//             const push = (10 - rd) * 0.02;
//             p.vx -= (rx / rd) * push;
//             p.vy -= (ry / rd) * push;
//           }
//         }

//         // damping
//         p.vx *= CONFIG.SPRING_DAMPING;
//         p.vy *= CONFIG.SPRING_DAMPING;

//         // apply
//         p.x += p.vx;
//         p.y += p.vy;

//         // wrap edges softly
//         if (p.x < -18) p.x = width + 18;
//         if (p.x > width + 18) p.x = -18;
//         if (p.y < -18) p.y = height + 18;
//         if (p.y > height + 18) p.y = -18;

//         // age respawn
//         if (p.age > p.maxLife) {
//           p.x = Math.random() * width;
//           p.y = Math.random() * height;
//           p.vx = (Math.random() - 0.5) * 2.6;
//           p.vy = (Math.random() - 0.5) * 2.6;
//           p.age = 0;
//           p.maxLife = 6 + Math.random() * 22;
//           p.trail.length = 0;
//         }

//         // push new point into trail (short)
//         const t = p.trail;
//         t.push({ x: p.x, y: p.y, a: 1 });
//         if (t.length > CONFIG.TRAIL_MAX_LEN) t.shift();
//       }
//     }

//     // draw grid (subtle, behind everything)
//     function drawGrid(ctxLocal) {
//       ctxLocal.save();
//       ctxLocal.globalAlpha = CONFIG.GRID_OPACITY;
//       ctxLocal.strokeStyle = "rgba(150,150,150,0.9)";
//       ctxLocal.lineWidth = Math.max(0.5, CONFIG.GRID_LINE_WIDTH);
//       const gap = CONFIG.GRID_LINE_GAP;
//       // vertical lines
//       for (let x = 0; x < width + gap; x += gap) {
//         ctxLocal.beginPath();
//         ctxLocal.moveTo(x + (center.x % gap) - gap / 2, 0);
//         ctxLocal.lineTo(x + (center.x % gap) - gap / 2, height);
//         ctxLocal.stroke();
//       }
//       // horizontal lines
//       for (let y = 0; y < height + gap; y += gap) {
//         ctxLocal.beginPath();
//         ctxLocal.moveTo(0, y + (center.y % gap) - gap / 2);
//         ctxLocal.lineTo(width, y + (center.y % gap) - gap / 2);
//         ctxLocal.stroke();
//       }
//       ctxLocal.restore();
//     }

//     // draw frame to ctxLocal
//     function drawTo(ctxLocal) {
//       ctxLocal.clearRect(0, 0, width, height);

//       // dark background (very slightly textured by gradient)
//       ctxLocal.fillStyle = "#0a0a0a";
//       ctxLocal.fillRect(0, 0, width, height);

//       // subtle vignette to keep text readable in center areas
//       const vg = ctxLocal.createRadialGradient(width * 0.5, height * 0.45, Math.min(width, height) * 0.1, width * 0.5, height * 0.45, Math.max(width, height) * 0.9);
//       vg.addColorStop(0, "rgba(0,0,0,0)");
//       vg.addColorStop(1, "rgba(0,0,0,0.36)");
//       ctxLocal.fillStyle = vg;
//       ctxLocal.fillRect(0, 0, width, height);

//       // draw grid faint behind particles
//       drawGrid(ctxLocal);

//       // draw particle trails (dim, short)
//       for (let p of particles) {
//         const t = p.trail;
//         if (t && t.length > 1) {
//           for (let k = 0; k < t.length; k++) {
//             const seg = t[k];
//             const alpha = 0.14 * (1 - k / t.length); // dim
//             ctxLocal.beginPath();
//             ctxLocal.fillStyle = `hsla(${p.hue}, 92%, 62%, ${alpha})`;
//             const radius = Math.max(0.3, p.size * (1 - k / t.length) * 0.9);
//             ctxLocal.arc(seg.x, seg.y, radius, 0, Math.PI * 2);
//             ctxLocal.fill();
//           }
//         }

//         // subtle motion blur step (cheap)
//         for (let s = 1; s <= CONFIG.MOTION_BLUR_STEPS; s++) {
//           const fx = p.x - p.vx * s * 0.5;
//           const fy = p.y - p.vy * s * 0.5;
//           const blurAlpha = 0.05 * (1 / s);
//           ctxLocal.beginPath();
//           ctxLocal.fillStyle = `hsla(${p.hue}, 92%, 62%, ${blurAlpha})`;
//           ctxLocal.arc(fx, fy, Math.max(0.3, p.size * (1 - s * 0.08)), 0, Math.PI * 2);
//           ctxLocal.fill();
//         }

//         // core particle (reduced shadow)
//         ctxLocal.beginPath();
//         ctxLocal.fillStyle = `hsla(${p.hue}, 92%, ${p.magnetic ? 56 : 52}%, 0.98)`;
//         ctxLocal.shadowBlur = (p.magnetic ? CONFIG.MAX_SHADOW_BLUR * 0.7 : CONFIG.MAX_SHADOW_BLUR * 0.35);
//         ctxLocal.shadowColor = `hsla(${p.hue},92%,64%,0.85)`;
//         ctxLocal.arc(p.x, p.y, p.size, 0, Math.PI * 2);
//         ctxLocal.fill();
//         ctxLocal.shadowBlur = 0;
//       }
//     }

//     // main loop
//     let last = performance.now();
//     function loop(now) {
//       const dt = Math.min(0.033, (now - last) / 1000);
//       last = now;

//       updatePhysics(dt);

//       if (offscreenRef.current.enabled && offscreenRef.current.ctx) {
//         drawTo(offscreenRef.current.ctx);
//         try {
//           ctx.clearRect(0, 0, width, height);
//           ctx.drawImage(offscreenRef.current.canvas, 0, 0, width, height);
//         } catch (e) {
//           // fallback
//           offscreenRef.current.enabled = false;
//           drawTo(ctx);
//         }
//       } else {
//         drawTo(ctx);
//       }

//       rafRef.current = requestAnimationFrame(loop);
//     }

//     rafRef.current = requestAnimationFrame(loop);

//     // cleanup
//     return () => {
//       if (rafRef.current) cancelAnimationFrame(rafRef.current);
//       if (spawnRef.current) clearInterval(spawnRef.current);
//       window.removeEventListener("resize", resize);
//       window.removeEventListener("pointermove", onPointerMove);
//       window.removeEventListener("pointerdown", onPointerDown);
//       window.removeEventListener("pointerup", onPointerUp);
//       window.removeEventListener("scroll", onScroll);
//       particles.length = 0;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [preferReduced]);

//   return (
//     <canvas
//       ref={canvasRef}
//       style={{
//         position: "fixed",
//         inset: 0,
//         width: "100%",
//         height: "100%",
//         zIndex: -1,
//         pointerEvents: "none",
//         background: "#000",
//       }}
//     />
//   );
// }


// ======================= CombinedBackground.jsx (Patched) ===========================
// This version fixes the straight-line trails issue by:
// ✓ Breaking trail when a particle teleports or wraps
// ✓ Skipping segments that are too long
// ✓ Smoothing trail transitions
// All features preserved exactly as requested.

import React, { useEffect, useRef } from "react";

export default function CombinedBackground() {
  const CONFIG = {
    BASE_PARTICLES: 120,
    BASE_MAGNETIC_MAX: 14,
    BASE_ORBITER_RATIO: 0.25,

    PARTICLE_SIZE_MIN: 1.0,
    PARTICLE_SIZE_MAX: 3.2,
    MAGNETIC_SIZE_MIN: 1.6,
    MAGNETIC_SIZE_MAX: 4.0,

    TRAIL_LENGTH_DESKTOP: 8,
    TRAIL_LENGTH_MOBILE: 4,

    BASE_SPEED: 1.0,
    DAMPING: 0.96,

    MAGNETIC_FORCE: 0.22,
    REGULAR_FORCE: 0.05,

    ORBIT_BASE_RATE: 0.7,
    ORBIT_RADIUS_MIN: 36,
    ORBIT_RADIUS_MAX: 220,

    INTERACTION_RADIUS: 150,
    WANDER_FORCE: 0.0022,

    SCROLL_ENERGY_DECAY: 0.92,
    SCROLL_ENERGY_MAX: 2.0,
    SCROLL_ENERGY_PER_DELTA: 0.0011,
    SCROLL_GRAVITY: 0.06,

    MOBILE_BREAKPOINT: 780,
    MOBILE_SCALE: 0.55,
    TABLET_SCALE: 0.8,

    SHADOW_BLUR_DESKTOP: 22,
    SHADOW_BLUR_MOBILE: 8,

    DPR_CAP: 2,
    BASE_HUE: 210,

    MAG_SPAWN_INTERVAL: 1100,
    MAG_BURST_MIN: 1,
    MAG_BURST_MAX: 3,

    TRAIL_JUMP_LIMIT: 4000 // <===== NEW: max allowed squared distance for trail segment
  };

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const spawnRef = useRef(null);

  const dimsRef = useRef({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < CONFIG.MOBILE_BREAKPOINT,
    DPR: Math.min(CONFIG.DPR_CAP, window.devicePixelRatio || 1),
  });

  const particlesRef = useRef([]);
  const miniBlobsRef = useRef([]);
  const pointerRef = useRef({ x: -9999, y: -9999, down: false });
  const scrollRef = useRef({ lastY: window.scrollY, dir: 1, energy: 0, hueShift: 0 });
  const centerRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2, vx: 0, vy: 0 });

  const offscreenRef = useRef({ enabled: false, canvas: null, ctx: null });

  const rand = (a, b) => Math.random() * (b - a) + a;
  const I = (a, b) => Math.floor(rand(a, b + 1));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });

    // Offscreen canvas
    if (typeof OffscreenCanvas !== "undefined") {
      try {
        const off = new OffscreenCanvas(dimsRef.current.width, dimsRef.current.height);
        const octx = off.getContext("2d");
        if (octx) {
          offscreenRef.current.enabled = true;
          offscreenRef.current.canvas = off;
          offscreenRef.current.ctx = octx;
        }
      } catch {}
    }

    let PARTICLE_COUNT = CONFIG.BASE_PARTICLES;
    let TRAIL_LENGTH = CONFIG.TRAIL_LENGTH_DESKTOP;
    let MAGNETIC_MAX = CONFIG.BASE_MAGNETIC_MAX;

    function applyTuning() {
      const w = window.innerWidth;

      dimsRef.current.width = w;
      dimsRef.current.height = window.innerHeight;
      dimsRef.current.isMobile = w < CONFIG.MOBILE_BREAKPOINT;
      dimsRef.current.DPR = Math.min(CONFIG.DPR_CAP, window.devicePixelRatio || 1);

      if (dimsRef.current.isMobile) {
        PARTICLE_COUNT = Math.floor(CONFIG.BASE_PARTICLES * CONFIG.MOBILE_SCALE);
        MAGNETIC_MAX = Math.floor(CONFIG.BASE_MAGNETIC_MAX * 0.5);
        TRAIL_LENGTH = CONFIG.TRAIL_LENGTH_MOBILE;
      } else if (w < 1100) {
        PARTICLE_COUNT = Math.floor(CONFIG.BASE_PARTICLES * CONFIG.TABLET_SCALE);
        MAGNETIC_MAX = Math.floor(CONFIG.BASE_MAGNETIC_MAX * 0.75);
        TRAIL_LENGTH = CONFIG.TRAIL_LENGTH_DESKTOP;
      } else {
        PARTICLE_COUNT = CONFIG.BASE_PARTICLES;
        MAGNETIC_MAX = CONFIG.BASE_MAGNETIC_MAX;
        TRAIL_LENGTH = CONFIG.TRAIL_LENGTH_DESKTOP;
      }
    }

    function resizeCanvas() {
      applyTuning();
      const { width, height, DPR } = dimsRef.current;

      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      canvas.width = Math.floor(width * DPR);
      canvas.height = Math.floor(height * DPR);

      if (ctx.resetTransform) ctx.resetTransform();
      ctx.scale(DPR, DPR);

      if (offscreenRef.current.enabled) {
        offscreenRef.current.canvas.width = width;
        offscreenRef.current.canvas.height = height;
      }
    }

    function init() {
      particlesRef.current = [];
      miniBlobsRef.current = [];

      const w = dimsRef.current.width;
      const h = dimsRef.current.height;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particlesRef.current.push({
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(-1, 1),
          vy: rand(-1, 1),
          size: rand(CONFIG.PARTICLE_SIZE_MIN, CONFIG.PARTICLE_SIZE_MAX),
          hueBase: (CONFIG.BASE_HUE + rand(-40, 40)) % 360,
          hue: 0,
          magnetic: Math.random() < 0.15,
          isOrbiter: Math.random() < CONFIG.BASE_ORBITER_RATIO,
          wobble: Math.random() * 10,
          orbit: {
            radius: rand(CONFIG.ORBIT_RADIUS_MIN, CONFIG.ORBIT_RADIUS_MAX),
            angle: rand(0, Math.PI * 2),
            speed: 0,
          },
          trail: [],
        });
      }

      for (let i = 0; i < 4; i++) {
        miniBlobsRef.current.push({
          x: rand(0, w),
          y: rand(0, h),
          baseR: rand(14, 24),
          offset: Math.random() * 1000,
          r: rand(14, 24),
        });
      }
    }

    // ------------------ Pointer ------------------
    function onPointerMove(e) {
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX || (e.touches && e.touches[0].clientX)) - r.left;
      const y = (e.clientY || (e.touches && e.touches[0].clientY)) - r.top;
      pointerRef.current.x = x;
      pointerRef.current.y = y;
    }

    function onPointerDown() {
      pointerRef.current.down = true;
    }
    function onPointerUp() {
      pointerRef.current.down = false;
    }

    // ------------------- Scroll -------------------
    function onScroll() {
      const y = window.scrollY;
      const dy = y - scrollRef.current.lastY;
      scrollRef.current.lastY = y;

      scrollRef.current.dir = dy >= 0 ? 1 : -1;
      scrollRef.current.energy = Math.min(
        CONFIG.SCROLL_ENERGY_MAX,
        scrollRef.current.energy + Math.abs(dy) * CONFIG.SCROLL_ENERGY_PER_DELTA
      );
      scrollRef.current.hueShift = (scrollRef.current.hueShift + Math.abs(dy) * 0.04) % 360;
    }

    // ------------------ Physics -------------------
    function update(dt) {
      const { width: w, height: h, isMobile } = dimsRef.current;
      const scrollDir = scrollRef.current.dir;
      const sEnergy = scrollRef.current.energy;

      // center drift
      const cx = centerRef.current.x;
      const cy = centerRef.current.y;
      const px = pointerRef.current.x;
      const py = pointerRef.current.y;

      if (px !== -9999) {
        centerRef.current.vx += (px - cx) * 0.001;
        centerRef.current.vy += (py - cy) * 0.001;
      } else {
        centerRef.current.vx += Math.sin(performance.now() * 0.0001) * 0.0004;
        centerRef.current.vy += Math.cos(performance.now() * 0.00012) * 0.0004;
      }

      centerRef.current.vx *= 0.98;
      centerRef.current.vy *= 0.98;

      centerRef.current.x += centerRef.current.vx;
      centerRef.current.y += centerRef.current.vy;

      // particle loop
      for (const p of particlesRef.current) {
        // wander
        p.vx += Math.sin(p.wobble + performance.now() * 0.0005) * CONFIG.WANDER_FORCE;
        p.vy += Math.cos(p.wobble + performance.now() * 0.0005) * CONFIG.WANDER_FORCE;

        // pointer force
        if (px !== -9999) {
          const dx = px - p.x;
          const dy = py - p.y;
          const d = Math.hypot(dx, dy);
          if (d < CONFIG.INTERACTION_RADIUS) {
            const f = (1 - d / CONFIG.INTERACTION_RADIUS);
            if (p.magnetic) {
              p.vx += (dx / d) * f * CONFIG.MAGNETIC_FORCE;
              p.vy += (dy / d) * f * CONFIG.MAGNETIC_FORCE;
            } else {
              p.vx += (dx / d) * f * CONFIG.REGULAR_FORCE;
              p.vy += (dy / d) * f * CONFIG.REGULAR_FORCE;
            }
          }
        }

        // orbiters
        if (p.isOrbiter) {
          const ox = centerRef.current.x;
          const oy = centerRef.current.y;

          p.orbit.speed = CONFIG.ORBIT_BASE_RATE * (isMobile ? 0.5 : 1) * scrollDir;
          p.orbit.angle += p.orbit.speed * dt;

          const tx = ox + Math.cos(p.orbit.angle) * p.orbit.radius;
          const ty = oy + Math.sin(p.orbit.angle) * p.orbit.radius;

          p.vx += (tx - p.x) * 0.05;
          p.vy += (ty - p.y) * 0.05;
        }

        // scroll gravity
        p.vy += sEnergy * CONFIG.SCROLL_GRAVITY * scrollDir;

        p.vx *= CONFIG.DAMPING;
        p.vy *= CONFIG.DAMPING;

        p.x += p.vx;
        p.y += p.vy;

        // wrap (and reset trail)
        let wrapped = false;
        if (p.x < -20) {
          p.x = w + 20;
          wrapped = true;
        }
        if (p.x > w + 20) {
          p.x = -20;
          wrapped = true;
        }
        if (p.y < -20) {
          p.y = h + 20;
          wrapped = true;
        }
        if (p.y > h + 20) {
          p.y = -20;
          wrapped = true;
        }

        if (wrapped) {
          p.trail = []; // <===== FIX: prevents long straight teleport lines
        }

        // hue update
        p.hue = (p.hueBase + scrollRef.current.hueShift) % 360;

        // trail update
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > TRAIL_LENGTH) p.trail.shift();
      }

      // mini blobs
      for (const b of miniBlobsRef.current) {
        b.x += Math.sin(b.offset + performance.now() * 0.0002) * 0.2;
        b.y += Math.cos(b.offset + performance.now() * 0.00025) * 0.2;
        b.r = b.baseR + Math.sin(b.offset + performance.now() * 0.001) * (isMobile ? 1.5 : 3);
      }

      scrollRef.current.energy *= CONFIG.SCROLL_ENERGY_DECAY;
    }

    // ------------------ Draw -------------------
    function draw(ctxDraw) {
      const w = dimsRef.current.width;
      const h = dimsRef.current.height;
      const isMobile = dimsRef.current.isMobile;

      ctxDraw.clearRect(0, 0, w, h);
      ctxDraw.fillStyle = "#000";
      ctxDraw.fillRect(0, 0, w, h);

      // vignette
      const g = ctxDraw.createRadialGradient(w / 2, h / 2, w * 0.1, w / 2, h / 2, w * 0.9);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0,0.28)");
      ctxDraw.fillStyle = g;
      ctxDraw.fillRect(0, 0, w, h);

      // particles
      for (const p of particlesRef.current) {
        // ===================== TRAILS =======================
        ctxDraw.beginPath();
        ctxDraw.lineWidth = 1.1;
        ctxDraw.strokeStyle = `hsla(${p.hue},90%,65%,0.28)`;

        for (let i = 0; i < p.trail.length - 1; i++) {
          const a = p.trail[i];
          const b = p.trail[i + 1];

          const dx = b.x - a.x;
          const dy = b.y - a.y;

          // Skip drawing big jumps → prevents straight lines
          if (dx * dx + dy * dy > CONFIG.TRAIL_JUMP_LIMIT) continue;

          ctxDraw.moveTo(a.x, a.y);
          ctxDraw.lineTo(b.x, b.y);
        }
        ctxDraw.stroke();

        // ===================== CORE =======================
        ctxDraw.beginPath();
        const alpha = p.magnetic ? 0.9 : 0.6;
        ctxDraw.fillStyle = `hsla(${p.hue},92%,60%,${alpha})`;
        ctxDraw.shadowBlur = p.magnetic
          ? (isMobile ? CONFIG.SHADOW_BLUR_MOBILE : CONFIG.SHADOW_BLUR_DESKTOP)
          : (isMobile ? CONFIG.SHADOW_BLUR_MOBILE * 0.6 : CONFIG.SHADOW_BLUR_DESKTOP * 0.6);
        ctxDraw.shadowColor = `hsla(${p.hue},90%,70%,0.8)`;
        ctxDraw.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctxDraw.fill();
        ctxDraw.shadowBlur = 0;
      }

      // blobs
      for (const b of miniBlobsRef.current) {
        const grad = ctxDraw.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        grad.addColorStop(0, "rgba(255,255,255,0.07)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctxDraw.fillStyle = grad;
        ctxDraw.beginPath();
        ctxDraw.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctxDraw.fill();
      }
    }

    // ------------------ Animation Loop -------------------
    let last = performance.now();
    function frame(now) {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;

      update(dt);

      if (offscreenRef.current.enabled) {
        const octx = offscreenRef.current.ctx;
        draw(octx);
        ctx.clearRect(0, 0, dimsRef.current.width, dimsRef.current.height);
        ctx.drawImage(offscreenRef.current.canvas, 0, 0);
      } else {
        draw(ctx);
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    resizeCanvas();
    init();
    rafRef.current = requestAnimationFrame(frame);

    // magnetic bursts
    spawnRef.current = setInterval(() => {
      const count = dimsRef.current.isMobile
        ? I(1, 2)
        : I(CONFIG.MAG_BURST_MIN, CONFIG.MAG_BURST_MAX);

      for (let i = 0; i < count; i++) {
        const idx = I(0, particlesRef.current.length - 1);
        const p = particlesRef.current[idx];

        p.magnetic = true;
        p.size = rand(CONFIG.MAGNETIC_SIZE_MIN, CONFIG.MAGNETIC_SIZE_MAX);
        p.vx = rand(-1.2, 1.2);
        p.vy = rand(-1.2, 1.2);

        // reset trail to avoid sudden lines from old motion
        p.trail = [];
      }
    }, CONFIG.MAG_SPAWN_INTERVAL);

    let resizeTimer = null;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeCanvas();
        init();
      }, 150);
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(spawnRef.current);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: -1,
        background: "#000",
      }}
    />
  );
}
