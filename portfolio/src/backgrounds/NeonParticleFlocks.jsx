// NeonParticleFlocks.jsx (Fully Fixed Version)
// Neon boids-style particles with cursor/touch gravity, scroll energy,
// optimized for mobile, and free of DOMMatrixInit setTransform issues.

import React, { useRef, useEffect } from "react";

export default function NeonParticleFlocks() {
  // ------------------------ CONFIG ------------------------
  const CONFIG = {
    PARTICLES: 140,
    NEIGHBOR_DIST: 60,
    COHESION: 0.006,
    ALIGNMENT: 0.03,
    SEPARATION: 0.08,
    MAX_SPEED: 3.6,
    MAX_FORCE: 0.06,
    PARTICLE_SIZE: 2.4,

    COLORS: [
      "rgba(255, 95, 109, 1)",
      "rgba(100, 255, 218, 1)",
      "rgba(138, 102, 255, 1)",
    ],

    BG_GRADIENT: ["#030217", "#08102a"],

    SPAWN_ON_CLICK: 12,
    SCROLL_BOOST: 0.0012,

    TOUCH_MULTIPLIER: 1.6,
  };
  // ---------------------------------------------------------

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const particlesRef = useRef([]);
  const pointer = useRef({ x: -9999, y: -9999, down: false });
  const scrollEnergy = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    let dpr = window.devicePixelRatio || 1;

    // ----------- RESIZE (FIXED VERSION) -----------
    function resize() {
      dpr = window.devicePixelRatio || 1;

      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";

      // FIX: safe DPR scaling
      if (ctx.resetTransform) ctx.resetTransform();
      ctx.scale(dpr, dpr);
    }
    resize();
    // ----------------------------------------------

    // ------------ PARTICLE CLASS ------------
    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 1.6;
        this.vy = (Math.random() - 0.5) * 1.6;
        this.size = CONFIG.PARTICLE_SIZE * (0.7 + Math.random() * 1.6);
        this.color =
          CONFIG.COLORS[Math.floor(Math.random() * CONFIG.COLORS.length)];
      }

      applyForce(fx, fy) {
        this.vx += fx;
        this.vy += fy;
      }

      update() {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const maxSpeed = CONFIG.MAX_SPEED + scrollEnergy.current * 2;

        if (speed > maxSpeed) {
          const s = maxSpeed / speed;
          this.vx *= s;
          this.vy *= s;
        }

        this.x += this.vx;
        this.y += this.vy;
      }

      draw(ctx) {
        ctx.beginPath();
        ctx.globalAlpha = 0.14;
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size * 3.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ------------ INIT PARTICLES ------------
    function initParticles() {
      const arr = [];
      const w = window.innerWidth;
      const h = window.innerHeight;

      for (let i = 0; i < CONFIG.PARTICLES; i++) {
        arr.push(new Particle(Math.random() * w, Math.random() * h));
      }

      particlesRef.current = arr;
    }
    initParticles();

    // ------------ INTERACTION ------------
    function getPt(e) {
      if (e.touches && e.touches[0]) {
        return {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          touch: true,
        };
      }
      return { x: e.clientX, y: e.clientY, touch: false };
    }

    function onMove(e) {
      const p = getPt(e);
      pointer.current.x = p.x;
      pointer.current.y = p.y;
    }

    function onDown(e) {
      const p = getPt(e);
      pointer.current.down = true;
      pointer.current.x = p.x;
      pointer.current.y = p.y;

      if (!p.touch) spawnBurst(p.x, p.y, CONFIG.SPAWN_ON_CLICK);
    }

    function onUp() {
      pointer.current.down = false;
    }

    function onWheel(e) {
      scrollEnergy.current = Math.min(
        1.5,
        scrollEnergy.current + Math.abs(e.deltaY) * CONFIG.SCROLL_BOOST
      );
    }

    function spawnBurst(x, y, count) {
      const arr = particlesRef.current;
      for (let i = 0; i < count; i++) {
        const p = new Particle(x, y);
        p.vx = (Math.random() - 0.5) * 8;
        p.vy = (Math.random() - 0.5) * 8;
        arr.push(p);

        if (arr.length > CONFIG.PARTICLES * 2) arr.shift();
      }
    }

    // ------------ BOIDS LOGIC ------------
    function computeForces() {
      const ps = particlesRef.current;
      const len = ps.length;
      const m = pointer.current;
      const isTouch = "ontouchstart" in window;

      for (let i = 0; i < len; i++) {
        const p = ps[i];

        let cx = 0,
          cy = 0,
          ax = 0,
          ay = 0,
          sx = 0,
          sy = 0;
        let count = 0;

        for (let j = 0; j < len; j++) {
          if (i === j) continue;
          const q = ps[j];

          const dx = q.x - p.x;
          const dy = q.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONFIG.NEIGHBOR_DIST) {
            cx += q.x;
            cy += q.y;

            ax += q.vx;
            ay += q.vy;

            if (dist < 18) {
              sx -= dx;
              sy -= dy;
            }

            count++;
          }
        }

        if (count > 0) {
          cx = (cx / count - p.x) * CONFIG.COHESION;
          cy = (cy / count - p.y) * CONFIG.COHESION;

          ax = (ax / count - p.vx) * CONFIG.ALIGNMENT;
          ay = (ay / count - p.vy) * CONFIG.ALIGNMENT;

          sx *= CONFIG.SEPARATION;
          sy *= CONFIG.SEPARATION;

          p.applyForce(cx + ax + sx, cy + ay + sy);
        }

        // ---- Cursor attraction ----
        const dxm = m.x - p.x;
        const dym = m.y - p.y;
        const rm = Math.sqrt(dxm * dxm + dym * dym);
        const r = 140 * (isTouch ? CONFIG.TOUCH_MULTIPLIER : 1);

        if (rm < r) {
          const pull = (1 - rm / r) * (m.down ? 0.9 : 0.45);
          p.applyForce((dxm / (rm + 1)) * pull, (dym / (rm + 1)) * pull);
        }

        // random flutter influenced by scroll energy
        p.vx += (Math.random() - 0.5) * 0.06 * (1 + scrollEnergy.current * 1.4);
        p.vy += (Math.random() - 0.5) * 0.06 * (1 + scrollEnergy.current * 1.4);

        p.update();
      }

      scrollEnergy.current *= 0.92; // decay
    }

    // ----------- DRAW -----------
    function draw() {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, CONFIG.BG_GRADIENT[0]);
      bg.addColorStop(1, CONFIG.BG_GRADIENT[1]);

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // faint connecting lines
      ctx.lineWidth = 0.8;
      const ps = particlesRef.current;
      for (let i = 0; i < ps.length; i++) {
        const a = ps[i];
        for (let j = i + 1; j < ps.length; j++) {
          const b = ps[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONFIG.NEIGHBOR_DIST * 0.8) {
            const alpha = (1 - dist / (CONFIG.NEIGHBOR_DIST * 0.8)) * 0.14;

            ctx.globalAlpha = alpha;
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, a.color);
            grad.addColorStop(1, b.color);

            ctx.strokeStyle = grad;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;

      // particles
      ps.forEach((p) => p.draw(ctx));
    }

    // ----------- LOOP -----------
    let last = performance.now();
    function loop(now) {
      const dt = now - last;
      last = now;

      computeForces();
      draw();

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    // ----------- EVENTS -----------
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("resize", resize);

    // ----------- CLEANUP -----------
    return () => {
      cancelAnimationFrame(rafRef.current);

      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("touchstart", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        width: "100%",
        height: "100%",
        display: "block",
        touchAction: "none",
      }}
    />
  );
}
