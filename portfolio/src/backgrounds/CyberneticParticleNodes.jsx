// CyberneticParticleNodes.jsx
// A lightweight, mobile-friendly neon node network with elastic connections.
// - Mouse/touch attraction
// - Click shockwave
// - Scroll-driven tension/zoom
// - Performance optimizations and full cleanup

import React, { useRef, useEffect } from "react";

export default function CyberneticParticleNodes() {
  // ------------------------- CUSTOMIZATION -------------------------
  const CONFIG = {
    NODE_COUNT: 60,            // number of nodes (lower for weaker devices)
    MIN_DIST: 110,             // max connection distance
    SPRING: 0.06,              // spring force for elastic wires
    DAMPING: 0.92,             // velocity damping
    MAX_SPEED: 6,              // clamp node velocity
    NODE_RADIUS: 3.2,          // base node radius
    LINE_WIDTH: 1.2,           // connection line width
    NEON_COLORS: [             // palette of neon colors
      "rgba(97, 218, 251, 0.95)",
      "rgba(139, 92, 246, 0.95)",
      "rgba(255, 85, 150, 0.95)"
    ],
    BACKGROUND_GRADIENT: ["#020617", "#07102a"], // background blend
    INTERACTION_RADIUS: 160,   // radius for cursor attraction
    TOUCH_MULT: 1.6,           // stronger interaction on touch
    SCROLL_SENSITIVITY: 0.0009 // how scroll affects tension
  };
  // --------------------------- /CONFIG -----------------------------

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const nodesRef = useRef([]);
  const pointerRef = useRef({ x: -9999, y: -9999, down: false, vx: 0, vy: 0 });
  const scrollState = useRef({ y: 0, tension: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    let dpr = Math.max(1, window.devicePixelRatio || 1);

    function resize() {
      dpr = Math.max(1, window.devicePixelRatio || 1);
      const { innerWidth: w, innerHeight: h } = window;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    // -------------------- Node Initialization --------------------
    function random(min, max) {
      return Math.random() * (max - min) + min;
    }

    function initNodes() {
      const N = CONFIG.NODE_COUNT;
      const nodes = [];
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      for (let i = 0; i < N; i++) {
        nodes.push({
          x: random(0, w),
          y: random(0, h),
          vx: random(-0.6, 0.6),
          vy: random(-0.6, 0.6),
          r: CONFIG.NODE_RADIUS * random(0.8, 1.6),
          color: CONFIG.NEON_COLORS[i % CONFIG.NEON_COLORS.length],
          locked: false
        });
      }
      nodesRef.current = nodes;
    }
    initNodes();

    // --------------- Interaction utilities ----------------
    function getPointerFromEvent(e) {
      if (e.touches && e.touches[0]) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY, touched: true };
      }
      return { x: e.clientX, y: e.clientY, touched: false };
    }

    function onPointerMove(e) {
      const p = getPointerFromEvent(e);
      const prev = pointerRef.current;
      pointerRef.current.x = p.x;
      pointerRef.current.y = p.y;
      pointerRef.current.vx = (p.x - (prev.x || p.x));
      pointerRef.current.vy = (p.y - (prev.y || p.y));
    }

    function onPointerDown(e) {
      const p = getPointerFromEvent(e);
      pointerRef.current.down = true;
      pointerRef.current.x = p.x;
      pointerRef.current.y = p.y;
      // small visual shockwave by pushing nodes away later in update
    }

    function onPointerUp() {
      pointerRef.current.down = false;
    }

    function onWheel(e) {
      // scroll affects tension -> increases elasticity
      scrollState.current.y += e.deltaY;
      scrollState.current.tension += e.deltaY * CONFIG.SCROLL_SENSITIVITY;
      // clamp
      scrollState.current.tension = Math.max(-0.5, Math.min(1.2, scrollState.current.tension));
    }

    // ---------------------- Physics Update ---------------------
    function update(dt) {
      const nodes = nodesRef.current;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const p = pointerRef.current;
      const isTouch = "ontouchstart" in window;

      // Slight auto drift on background color
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];

        // basic bounds containment (soft)
        if (a.x < -40) a.vx += 0.6;
        if (a.x > w + 40) a.vx -= 0.6;
        if (a.y < -40) a.vy += 0.6;
        if (a.y > h + 40) a.vy -= 0.6;

        // Pairwise interaction: small repulsion for separation
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;

          // minimal separation
          if (dist < 18) {
            const overlap = (18 - dist) * 0.02;
            const nx = dx / dist;
            const ny = dy / dist;
            a.vx -= nx * overlap;
            a.vy -= ny * overlap;
            b.vx += nx * overlap;
            b.vy += ny * overlap;
          }
        }

        // mouse/touch attraction
        const dx = p.x - a.x;
        const dy = p.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const interactRadius = CONFIG.INTERACTION_RADIUS * (isTouch ? CONFIG.TOUCH_MULT : 1);

        if (dist < interactRadius) {
          const strength = (1 - dist / interactRadius);
          const factor = (p.down ? 1.8 : 0.9);
          // attract or repel based on pointer speed (fast swipe repels)
          const velMag = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          const repel = velMag > 10 ? 1.2 : 0;
          a.vx += (dx / (dist + 6 || 1)) * strength * (factor - repel) * 0.6;
          a.vy += (dy / (dist + 6 || 1)) * strength * (factor - repel) * 0.6;
        }

        // soft mover: small random jitter for life
        a.vx += (Math.random() - 0.5) * 0.12;
        a.vy += (Math.random() - 0.5) * 0.12;

        // apply damping and clamp speed
        a.vx *= CONFIG.DAMPING;
        a.vy *= CONFIG.DAMPING;
        const speed = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
        if (speed > CONFIG.MAX_SPEED) {
          const s = CONFIG.MAX_SPEED / speed;
          a.vx *= s;
          a.vy *= s;
        }

        a.x += a.vx;
        a.y += a.vy;
      }
    }

    // ---------------------- Render ----------------------------
    function draw() {
      const nodes = nodesRef.current;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      // Background gradient
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, CONFIG.BACKGROUND_GRADIENT[0]);
      g.addColorStop(1, CONFIG.BACKGROUND_GRADIENT[1]);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // subtle glass overlay
      ctx.save();
      ctx.globalAlpha = 0.06 + Math.max(0, Math.min(0.14, scrollState.current.tension * 0.08));
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      // connections
      ctx.lineWidth = CONFIG.LINE_WIDTH;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONFIG.MIN_DIST + scrollState.current.tension * 30) {
            const alpha = (1 - dist / (CONFIG.MIN_DIST + 1)) * 0.85;
            // gradient stroke between node colors
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, a.color);
            grad.addColorStop(1, b.color);
            ctx.strokeStyle = grad;
            ctx.globalAlpha = alpha * 0.85;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            ctx.closePath();
            ctx.globalAlpha = 1;
          }
        }
      }

      // nodes glow
      nodes.forEach((n) => {
        // outer glow
        ctx.beginPath();
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = n.color;
        ctx.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        // core
        ctx.beginPath();
        ctx.globalAlpha = 1;
        ctx.fillStyle = n.color;
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
      });
    }

    // ------------------ Animation Loop -------------------
    let last = performance.now();
    function loop(now) {
      const dt = Math.min(48, now - last);
      last = now;
      update(dt / 16.666);
      draw();
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);

    // ------------------ Event Listeners -------------------
    const moveOpts = { passive: true };
    window.addEventListener("mousemove", onPointerMove, moveOpts);
    window.addEventListener("touchmove", onPointerMove, moveOpts);
    window.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("touchend", onPointerUp);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("resize", resize);

    // Optional: subtle responsive scaling on orientation change
    window.addEventListener("orientationchange", () => {
      setTimeout(resize, 350);
    });

    // ------------------ Cleanup -------------------
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onPointerMove, moveOpts);
      window.removeEventListener("touchmove", onPointerMove, moveOpts);
      window.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("mouseup", onPointerUp);
      window.removeEventListener("touchend", onPointerUp);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // canvas styled to fill the screen behind content
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        display: "block",
        width: "100%",
        height: "100%",
        touchAction: "none",
        background: "transparent"
      }}
    />
  );
}
