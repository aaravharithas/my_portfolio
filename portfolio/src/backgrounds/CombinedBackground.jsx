// CombinedBackground.jsx
import React, { useEffect, useRef } from "react";

/**
 * Stable Elegant CombinedBackground
 *
 * - Stable physics (no jitter) — wander clamped and gentle springs
 * - Z-layers: fake depth controls size/alpha/blur
 * - Orbiters, magnetic particles, per-particle trails, motion blur steps
 * - OffscreenCanvas used when available
 * - Device-adaptive counts, DPR cap
 *
 * Top-level tuning constants below — tweak to taste.
 */

export default function CombinedBackground({ preferReduced = false }) {
  // -------------------- CONFIG (tweak these) --------------------
  const CONFIG = {
    // Counts (desktop baseline)
    BASE_PARTICLES: 140,
    BASE_MAGNETIC_MAX: 18,
    ORBIT_SHELLS: 4, // depth rings

    // Sizes
    PARTICLE_SIZE_MIN: 0.9,
    PARTICLE_SIZE_MAX: 3.4,
    MAGNETIC_SIZE_MIN: 1.6,
    MAGNETIC_SIZE_MAX: 4.2,

    // Physics
    SPRING_FACTOR: 0.055, // spring toward orbit/target (reduced for stability)
    DAMPING: 0.94, // velocity damping
    WANDER_MAX: 0.0012, // clamped wander amplitude (very small)
    MAGNETIC_FORCE: 0.22,
    REGULAR_FORCE: 0.055,

    // Orbit
    ORBIT_BASE_RATE: 0.55,
    ORBIT_RADIUS_MIN: 36,
    ORBIT_RADIUS_MAX: 240,

    // Trails
    TRAIL_LENGTH_DESKTOP: 7,
    TRAIL_LENGTH_TABLET: 5,
    TRAIL_LENGTH_MOBILE: 3,
    TRAIL_JUMP_LIMIT_SQ: 3600, // skip trail segments longer than ~60px

    // Visual
    BASE_HUE: 210,
    SHADOW_BLUR_DESKTOP: 20,
    SHADOW_BLUR_MOBILE: 8,
    MOTION_BLUR_STEPS: 1,

    // Scroll & interaction
    INTERACTION_RADIUS: 160,
    SCROLL_ENERGY_DECAY: 0.92,
    SCROLL_ENERGY_PER_DELTA: 0.0011,
    SCROLL_GRAVITY: 0.06,
    SCROLL_ENERGY_MAX: 2.0,

    // Device tuning
    DPR_CAP: 2,
    MOBILE_BREAKPOINT: 780,
    TABLET_BREAKPOINT: 1200,
    MOBILE_SCALE: 0.50,
    TABLET_SCALE: 0.78,

    // Spawn
    MAG_SPAWN_INTERVAL_MS: 1200,
    MAG_BURST_MIN: 1,
    MAG_BURST_MAX: 3,
  };
  // ------------------ end CONFIG ------------------

  // refs
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const spawnRef = useRef(null);
  const offscreenRef = useRef({ enabled: false, canvas: null, ctx: null });

  // mutable state refs
  const dimsRef = useRef({
    width: Math.max(320, window.innerWidth),
    height: Math.max(240, window.innerHeight),
    DPR: Math.min(CONFIG.DPR_CAP, window.devicePixelRatio || 1),
    device: "desktop", // 'mobile' | 'tablet' | 'desktop'
  });

  const particlesRef = useRef([]);
  const miniBlobsRef = useRef([]);
  const pointerRef = useRef({ x: -9999, y: -9999, down: false });
  const scrollRef = useRef({ lastY: window.scrollY || 0, dir: 1, energy: 0, hueShift: 0 });
  const centerRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2, vx: 0, vy: 0 });

  // helpers
  const rand = (a, b) => Math.random() * (b - a) + a;
  const I = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx = canvas.getContext("2d", { alpha: true });

    // Try OffscreenCanvas
    if (typeof OffscreenCanvas !== "undefined") {
      try {
        const off = new OffscreenCanvas(dimsRef.current.width, dimsRef.current.height);
        const offCtx = off.getContext("2d");
        if (offCtx) {
          offscreenRef.current.enabled = true;
          offscreenRef.current.canvas = off;
          offscreenRef.current.ctx = offCtx;
        }
      } catch (e) {
        offscreenRef.current.enabled = false;
      }
    }

    // detect device class and tuning
    function detectDevice() {
      const w = Math.max(320, window.innerWidth);
      dimsRef.current.width = w;
      dimsRef.current.height = Math.max(240, window.innerHeight);
      dimsRef.current.DPR = Math.min(CONFIG.DPR_CAP, window.devicePixelRatio || 1);

      if (preferReduced) {
        dimsRef.current.device = "mobile";
      } else if (w <= CONFIG.MOBILE_BREAKPOINT) {
        dimsRef.current.device = "mobile";
      } else if (w <= CONFIG.TABLET_BREAKPOINT) {
        dimsRef.current.device = "tablet";
      } else {
        dimsRef.current.device = "desktop";
      }
    }
    detectDevice();

    // safe resize
    function resizeCanvas() {
      detectDevice();
      const { width, height, DPR } = dimsRef.current;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      canvas.width = Math.floor(width * DPR);
      canvas.height = Math.floor(height * DPR);
      if (ctx.resetTransform) ctx.resetTransform();
      ctx.scale(DPR, DPR);

      if (offscreenRef.current.enabled && offscreenRef.current.canvas) {
        try {
          offscreenRef.current.canvas.width = width;
          offscreenRef.current.canvas.height = height;
        } catch (e) {
          offscreenRef.current.enabled = false;
        }
      }
    }

    // initialize state
    function initState() {
      particlesRef.current = [];
      miniBlobsRef.current = [];
      pointerRef.current = { x: -9999, y: -9999, down: false };
      scrollRef.current = { lastY: window.scrollY || 0, dir: 1, energy: 0, hueShift: 0 };
      centerRef.current = { x: dimsRef.current.width / 2, y: dimsRef.current.height / 2, vx: 0, vy: 0 };

      const w = dimsRef.current.width;
      const h = dimsRef.current.height;

      let particleCount = CONFIG.BASE_PARTICLES;
      let magneticRatio = 0.12;
      if (dimsRef.current.device === "mobile") {
        particleCount = Math.max(36, Math.floor(CONFIG.BASE_PARTICLES * CONFIG.MOBILE_SCALE));
        magneticRatio = 0.08;
      } else if (dimsRef.current.device === "tablet") {
        particleCount = Math.max(72, Math.floor(CONFIG.BASE_PARTICLES * CONFIG.TABLET_SCALE));
        magneticRatio = 0.10;
      }

      // define orbital shells
      const shells = [];
      for (let s = 0; s < CONFIG.ORBIT_SHELLS; s++) {
        const z = 0.12 + (s / Math.max(1, CONFIG.ORBIT_SHELLS - 1)) * 0.78; // 0.12..0.9
        shells.push({ index: s, z });
      }

      for (let i = 0; i < particleCount; i++) {
        const shell = shells[i % shells.length];
        const isOrbiter = Math.random() < 0.28;
        particlesRef.current.push({
          id: i,
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(-1.0, 1.0),
          vy: rand(-1.0, 1.0),
          sizeBase: rand(CONFIG.PARTICLE_SIZE_MIN, CONFIG.PARTICLE_SIZE_MAX),
          size: 0,
          hueBase: (CONFIG.BASE_HUE + rand(-40, 40) + 360) % 360,
          hue: 0,
          magnetic: Math.random() < magneticRatio,
          isOrbiter,
          wobble: rand(0, 1000),
          age: 0,
          maxLife: rand(8, 20),
          shellIndex: shell.index,
          z: shell.z * (0.92 + Math.random() * 0.16), // small per-particle variance
          orbit: {
            radius: rand(CONFIG.ORBIT_RADIUS_MIN, Math.min(CONFIG.ORBIT_RADIUS_MAX, Math.round(Math.min(w, h) * (0.14 + shell.index * 0.08)))),
            angle: rand(0, Math.PI * 2),
            speed: 0,
          },
          trail: [],
          lastWrapped: false,
        });
      }

      // mini blobs for soft behind-glow
      for (let i = 0; i < 4; i++) {
        miniBlobsRef.current.push({
          x: rand(0, w),
          y: rand(0, h),
          baseR: rand(12, 30),
          r: rand(12, 30),
          offset: Math.random() * 2000,
        });
      }
    }

    // spawn magnetic burst (recycle)
    function spawnMagneticBurst(count = 1) {
      const w = dimsRef.current.width;
      const len = particlesRef.current.length;
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * len);
        const p = particlesRef.current[idx];
        if (!p) continue;
        p.x = rand(0, w);
        p.y = rand(0, dimsRef.current.height);
        p.vx = rand(-1.3, 1.3);
        p.vy = rand(-1.3, 1.3);
        p.magnetic = true;
        p.age = 0;
        p.maxLife = rand(8, 22);
        p.sizeBase = rand(CONFIG.MAGNETIC_SIZE_MIN, CONFIG.MAGNETIC_SIZE_MAX);
        p.trail.length = 0;
      }
    }

    // pointer handlers
    function onPointerMove(e) {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX ?? (e.touches && e.touches[0] && e.touches[0].clientX);
      const py = e.clientY ?? (e.touches && e.touches[0] && e.touches[0].clientY);
      if (px == null || py == null) return;
      pointerRef.current.x = px - rect.left;
      pointerRef.current.y = py - rect.top;
    }
    function onPointerDown() {
      pointerRef.current.down = true;
    }
    function onPointerUp() {
      pointerRef.current.down = false;
    }

    // scroll handlers
    function onScroll() {
      const y = window.scrollY || 0;
      const dy = y - scrollRef.current.lastY;
      scrollRef.current.lastY = y;
      scrollRef.current.dir = dy >= 0 ? 1 : -1;
      scrollRef.current.energy = Math.min(CONFIG.SCROLL_ENERGY_MAX, scrollRef.current.energy + Math.abs(dy) * CONFIG.SCROLL_ENERGY_PER_DELTA);
      scrollRef.current.hueShift = (scrollRef.current.hueShift + Math.abs(dy) * 0.03) % 360;
    }
    function onWheel(e) {
      const dy = e.deltaY || 0;
      scrollRef.current.dir = dy >= 0 ? 1 : -1;
      scrollRef.current.energy = Math.min(CONFIG.SCROLL_ENERGY_MAX, scrollRef.current.energy + Math.abs(dy) * CONFIG.SCROLL_ENERGY_PER_DELTA * 2.2);
      scrollRef.current.hueShift = (scrollRef.current.hueShift + Math.abs(dy) * 0.02) % 360;
    }

    // physics update (stable)
    function update(dt) {
      const { width: w, height: h, device } = dimsRef.current;
      const isMobile = device === "mobile";
      const sEnergy = scrollRef.current.energy;
      const scrollDir = scrollRef.current.dir;

      // gentle stable center drift (clamped)
      const px = pointerRef.current.x;
      const py = pointerRef.current.y;
      if (px !== -9999 && py !== -9999) {
        centerRef.current.vx += (px - centerRef.current.x) * 0.0007;
        centerRef.current.vy += (py - centerRef.current.y) * 0.0007;
      } else {
        // very small procedural drift (low amplitude)
        centerRef.current.vx += Math.sin(performance.now() * 0.00007) * 0.00018;
        centerRef.current.vy += Math.cos(performance.now() * 0.000065) * 0.00016;
      }
      // clamp center velocity to avoid runaway
      centerRef.current.vx = clamp(centerRef.current.vx, -0.8, 0.8);
      centerRef.current.vy = clamp(centerRef.current.vy, -0.8, 0.8);

      centerRef.current.vx *= 0.993;
      centerRef.current.vy *= 0.993;
      centerRef.current.x += centerRef.current.vx * Math.max(1, w / 900);
      centerRef.current.y += centerRef.current.vy * Math.max(1, h / 900);

      // per-particle updates
      for (let p of particlesRef.current) {
        p.age += dt;

        // tiny clamped wander (minimized to prevent jitter)
        const wanderX = Math.sin(p.wobble + performance.now() * 0.00045) * CONFIG.WANDER_MAX;
        const wanderY = Math.cos(p.wobble + performance.now() * 0.00047) * CONFIG.WANDER_MAX;
        p.vx += wanderX;
        p.vy += wanderY;

        // pointer interaction (magnetic stronger)
        if (px !== -9999 && py !== -9999) {
          const dx = px - p.x;
          const dy = py - p.y;
          const dist = Math.hypot(dx, dy) || 1;
          const radius = CONFIG.INTERACTION_RADIUS * (isMobile ? 1.3 : 1.0);
          if (dist < radius) {
            const strength = (1 - dist / radius);
            if (p.magnetic) {
              const f = Math.pow(strength, 1.18) * CONFIG.MAGNETIC_FORCE * (pointerRef.current.down ? 1.12 : 1.0);
              p.vx += (dx / dist) * f * (0.9 + (Math.random() - 0.5) * 0.12);
              p.vy += (dy / dist) * f * (0.9 + (Math.random() - 0.5) * 0.12);
            } else {
              const f = strength * CONFIG.REGULAR_FORCE * (pointerRef.current.down ? 0.95 : 0.5);
              p.vx += (dx / dist) * f;
              p.vy += (dy / dist) * f;
            }
          }
        }

        // orbiters: spring to orbit target
        if (p.isOrbiter) {
          const ox = centerRef.current.x;
          const oy = centerRef.current.y;

          // shell-influenced speed (front layers slightly faster)
          const zFactor = 1 - p.z * 0.6;
          p.orbit.speed = CONFIG.ORBIT_BASE_RATE * (0.35 + sEnergy * 0.24) * zFactor * (isMobile ? 0.6 : 1.0) * scrollDir;
          p.orbit.angle += p.orbit.speed * dt;

          const tx = ox + Math.cos(p.orbit.angle) * p.orbit.radius;
          const ty = oy + Math.sin(p.orbit.angle) * p.orbit.radius;

          // spring toward target (stabilized)
          p.vx += (tx - p.x) * CONFIG.SPRING_FACTOR;
          p.vy += (ty - p.y) * CONFIG.SPRING_FACTOR;
        }

        // scroll gravity (gentle)
        if (sEnergy > 0.01) {
          p.vy += sEnergy * CONFIG.SCROLL_GRAVITY * (p.magnetic ? 0.55 : 1.0) * scrollDir;
        }

        // occasional cheap neighbor repulsion sample (low frequency)
        if (Math.random() > 0.94) {
          const j = Math.floor(Math.random() * particlesRef.current.length);
          if (j !== undefined && j !== p.id) {
            const q = particlesRef.current[j];
            if (q) {
              const rx = q.x - p.x;
              const ry = q.y - p.y;
              const rd = Math.hypot(rx, ry) || 1;
              if (rd < 10) {
                const push = (10 - rd) * 0.02;
                p.vx -= (rx / rd) * push;
                p.vy -= (ry / rd) * push;
              }
            }
          }
        }

        // damping and clamp velocity
        p.vx *= CONFIG.DAMPING;
        p.vy *= CONFIG.DAMPING;
        const speedLimit = (1.0 + sEnergy * 1.6) * (isMobile ? 1.4 : 1.0) * (1 + (1 - p.z) * 0.22);
        const sp = Math.hypot(p.vx, p.vy);
        if (sp > speedLimit && sp > 0.0001) {
          p.vx = (p.vx / sp) * speedLimit;
          p.vy = (p.vy / sp) * speedLimit;
        }

        // integrate
        p.x += p.vx;
        p.y += p.vy;

        // wrap with trail reset to avoid long segments
        let wrapped = false;
        if (p.x < -20) {
          p.x = dimsRef.current.width + 20;
          wrapped = true;
        } else if (p.x > dimsRef.current.width + 20) {
          p.x = -20;
          wrapped = true;
        }
        if (p.y < -20) {
          p.y = dimsRef.current.height + 20;
          wrapped = true;
        } else if (p.y > dimsRef.current.height + 20) {
          p.y = -20;
          wrapped = true;
        }
        if (wrapped) {
          p.trail.length = 0;
          p.lastWrapped = true;
        } else {
          p.lastWrapped = false;
        }

        // depth-based scale/alpha
        const zScale = 1 + (1 - p.z) * 1.4;
        p.size = p.sizeBase * zScale;
        p.hue = (p.hueBase + scrollRef.current.hueShift + Math.sin(performance.now() * 0.00035 + p.wobble) * 3) % 360;

        // push to trail at stable intervals (throttle)
        if (Math.random() > 0.36) {
          p.trail.push({ x: p.x, y: p.y });
        }
        const maxTrail = dimsRef.current.device === "mobile"
          ? CONFIG.TRAIL_LENGTH_MOBILE
          : dimsRef.current.device === "tablet"
            ? CONFIG.TRAIL_LENGTH_TABLET
            : CONFIG.TRAIL_LENGTH_DESKTOP;

        if (p.trail.length > maxTrail) p.trail.shift();

        // respawn magnetic after life
        if (p.magnetic && p.age >= (p.maxLife || 16)) {
          p.x = rand(0, dimsRef.current.width);
          p.y = rand(0, dimsRef.current.height);
          p.vx = rand(-0.8, 0.8);
          p.vy = rand(-0.8, 0.8);
          p.age = 0;
          p.maxLife = rand(8, 20);
          p.trail.length = 0;
          p.hueBase = (CONFIG.BASE_HUE + rand(-30, 90) + 360) % 360;
        }
      }

      // mini blobs gentle movement
      for (const b of miniBlobsRef.current) {
        b.x += Math.sin(b.offset + performance.now() * 0.00018) * 0.14;
        b.y += Math.cos(b.offset + performance.now() * 0.0002) * 0.14;
        b.r = b.baseR + Math.sin(b.offset + performance.now() * 0.001) * (dimsRef.current.device === "mobile" ? 1.2 : 2.8);
      }

      // scroll decay
      scrollRef.current.energy *= CONFIG.SCROLL_ENERGY_DECAY;
      if (scrollRef.current.energy < 0.0005) scrollRef.current.energy = 0;
    }

    // drawing routine (works on ctx passed)
    function drawTo(ctxDraw) {
      const w = dimsRef.current.width;
      const h = dimsRef.current.height;
      const isMobile = dimsRef.current.device === "mobile";

      // clear and base black
      ctxDraw.clearRect(0, 0, w, h);
      ctxDraw.fillStyle = "#000";
      ctxDraw.fillRect(0, 0, w, h);

      // subtle vignette for readability
      const vg = ctxDraw.createRadialGradient(w * 0.5, h * 0.45, Math.min(w, h) * 0.12, w * 0.5, h * 0.45, Math.max(w, h) * 0.9);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.24)");
      ctxDraw.fillStyle = vg;
      ctxDraw.fillRect(0, 0, w, h);

      // mini blobs behind
      for (const b of miniBlobsRef.current) {
        const grad = ctxDraw.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        grad.addColorStop(0, `hsla(${CONFIG.BASE_HUE + scrollRef.current.hueShift}, 80%, 68%, 0.12)`);
        grad.addColorStop(1, `rgba(0,0,0,0)`);
        ctxDraw.beginPath();
        ctxDraw.fillStyle = grad;
        ctxDraw.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctxDraw.fill();
      }

      // draw shells subtle (cheap)
      for (let s = 0; s < CONFIG.ORBIT_SHELLS; s++) {
        ctxDraw.beginPath();
        const radius = Math.min(w, h) * (0.08 + s * 0.14);
        ctxDraw.strokeStyle = `rgba(255,255,255,${0.009 + s * 0.002})`;
        ctxDraw.lineWidth = 1;
        ctxDraw.arc(centerRef.current.x, centerRef.current.y, radius, 0, Math.PI * 2);
        ctxDraw.stroke();
      }

      // draw particles back->front by z
      const sorted = particlesRef.current.slice().sort((a, b) => b.z - a.z);

      for (const p of sorted) {
        // draw trail (skip long segments)
        if (p.trail && p.trail.length > 1) {
          ctxDraw.beginPath();
          const trailAlpha = 0.26 * (1 - p.z * 0.7);
          ctxDraw.lineWidth = Math.max(0.6, p.size * 0.14);
          ctxDraw.strokeStyle = `hsla(${p.hue},92%,72%,${trailAlpha})`;

          for (let i = 0; i < p.trail.length - 1; i++) {
            const a = p.trail[i];
            const b = p.trail[i + 1];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            if (dx * dx + dy * dy > CONFIG.TRAIL_JUMP_LIMIT_SQ) continue;
            ctxDraw.moveTo(a.x, a.y);
            ctxDraw.lineTo(b.x, b.y);
          }
          ctxDraw.stroke();
        }

        // cheap motion blur pips
        for (let s = 1; s <= CONFIG.MOTION_BLUR_STEPS; s++) {
          const bx = p.x - p.vx * s * (1 + (1 - p.z) * 0.6);
          const by = p.y - p.vy * s * (1 + (1 - p.z) * 0.6);
          const blurAlpha = 0.045 * (1 / s) * (1 - p.z * 0.5);
          ctxDraw.beginPath();
          ctxDraw.fillStyle = `hsla(${p.hue},92%,66%,${blurAlpha})`;
          ctxDraw.arc(bx, by, Math.max(0.35, p.size * (1 - s * 0.08) * (1 - p.z * 0.18)), 0, Math.PI * 2);
          ctxDraw.fill();
        }

        // core particle
        const alphaCore = p.magnetic ? 0.88 * (1 - p.z * 0.22) : 0.58 * (1 - p.z * 0.35);
        const shadow = Math.round((1 - p.z) * (isMobile ? CONFIG.SHADOW_BLUR_MOBILE : CONFIG.SHADOW_BLUR_DESKTOP));
        ctxDraw.beginPath();
        ctxDraw.fillStyle = `hsla(${p.hue},92%,${p.magnetic ? 66 : 60}%,${alphaCore})`;
        ctxDraw.shadowBlur = shadow;
        ctxDraw.shadowColor = `hsla(${p.hue},92%,74%,${alphaCore * 0.9})`;
        ctxDraw.arc(p.x, p.y, Math.max(0.6, p.size * (1 + (1 - p.z) * 0.32)), 0, Math.PI * 2);
        ctxDraw.fill();
        ctxDraw.shadowBlur = 0;
      }
    }

    // main loop
    let lastTime = performance.now();
    function loop(now) {
      const dt = Math.min(0.033, (now - lastTime) / 1000);
      lastTime = now;

      update(dt);

      if (offscreenRef.current.enabled && offscreenRef.current.ctx) {
        try {
          drawTo(offscreenRef.current.ctx);
          // blit
          ctx.clearRect(0, 0, dimsRef.current.width, dimsRef.current.height);
          ctx.drawImage(offscreenRef.current.canvas, 0, 0, dimsRef.current.width, dimsRef.current.height);
        } catch (e) {
          offscreenRef.current.enabled = false;
          drawTo(ctx);
        }
      } else {
        drawTo(ctx);
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    // event listeners
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });

    // resize debounced
    let resizeTimer = null;
    function handleResize() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeCanvas();
        initState();
      }, 140);
    }
    window.addEventListener("resize", handleResize);

    // visibility
    function onVisibilityChange() {
      if (document.hidden) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      } else {
        lastTime = performance.now();
        rafRef.current = requestAnimationFrame(loop);
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    // start
    resizeCanvas();
    initState();
    rafRef.current = requestAnimationFrame(loop);

    // spawn interval
    if (spawnRef.current) clearInterval(spawnRef.current);
    spawnRef.current = setInterval(() => {
      const burst = dimsRef.current.device === "mobile"
        ? I(CONFIG.MAG_BURST_MIN, Math.max(CONFIG.MAG_BURST_MIN, CONFIG.MAG_BURST_MAX - 1))
        : I(CONFIG.MAG_BURST_MIN, CONFIG.MAG_BURST_MAX);
      spawnMagneticBurst(burst);
    }, CONFIG.MAG_SPAWN_INTERVAL_MS);

    // cleanup
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);

      particlesRef.current.length = 0;
      miniBlobsRef.current.length = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferReduced]);

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
        userSelect: "none",
        background: "#000",
      }}
    />
  );
}
