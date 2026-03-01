import React, { useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext.jsx";
import { isTouchDevice } from "../utils/responsiveUtils.js";
import { shapes } from "../data/particleShapes.js";

// ─── Constants ───────────────────────────────────────────────────────────────
const GRID_SPACING   = 22;    // px between grid dots
const N_SHAPE_POINTS = 32;    // points per shape (matches particleShapes.js)
const SHAPE_SCALE    = 80;    // px — shape radius from center
const ATTRACT_RADIUS = 200;   // px — particles within this distance form shape
const REPICK_DIST    = 180;   // px — cursor travel before a new shape is picked

const GRID_SPRING  = 0.035;
const GRID_DAMPING = 0.88;
const SHAPE_SPRING  = 0.13;
const SHAPE_DAMPING = 0.80;

// ─── Build grid particles ────────────────────────────────────────────────────
function buildGrid(W, H) {
  const cols = Math.ceil(W / GRID_SPACING) + 1;
  const rows = Math.ceil(H / GRID_SPACING) + 1;
  const offsetX = (W - (cols - 1) * GRID_SPACING) / 2;
  const offsetY = (H - (rows - 1) * GRID_SPACING) / 2;
  return Array.from({ length: cols * rows }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const hx = offsetX + col * GRID_SPACING;
    const hy = offsetY + row * GRID_SPACING;
    return {
      x: hx, y: hy,
      vx: 0, vy: 0,
      homeX: hx, homeY: hy,
      slotX: null, slotY: null,
    };
  });
}

// ─── Assign nearby particles to shape slots ──────────────────────────────────
function assignShape(state) {
  const { particles, mouse, shapeIdx, assigned } = state;

  // Clear previous assignments
  assigned.forEach((i) => {
    particles[i].slotX = null;
    particles[i].slotY = null;
  });
  assigned.clear();

  if (!mouse) return;

  const shape = shapes[shapeIdx];
  const mx = mouse.x, my = mouse.y;

  // Scale shape points to screen coords centered on cursor
  const slots = shape.map((pt) => ({
    x: mx + pt.x * SHAPE_SCALE,
    y: my + pt.y * SHAPE_SCALE,
  }));

  // Gather particles near cursor (by home position, not current pos)
  const nearby = [];
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const d = Math.hypot(p.homeX - mx, p.homeY - my);
    if (d < ATTRACT_RADIUS) nearby.push({ i, d });
  }
  nearby.sort((a, b) => a.d - b.d);
  const take = nearby.slice(0, N_SHAPE_POINTS);
  if (take.length === 0) return;

  // Sort both by angle from cursor for a natural, non-crossed assignment
  take.sort((a, b) =>
    Math.atan2(particles[a.i].homeY - my, particles[a.i].homeX - mx) -
    Math.atan2(particles[b.i].homeY - my, particles[b.i].homeX - mx)
  );
  const slotsSorted = [...slots].sort(
    (a, b) =>
      Math.atan2(a.y - my, a.x - mx) - Math.atan2(b.y - my, b.x - mx)
  );

  const count = Math.min(take.length, slotsSorted.length);
  for (let k = 0; k < count; k++) {
    const idx = take[k].i;
    particles[idx].slotX = slotsSorted[k].x;
    particles[idx].slotY = slotsSorted[k].y;
    assigned.add(idx);
  }
}

// ─── Wrapper: skip on touch devices ─────────────────────────────────────────
export default function AmbientBackground() {
  if (isTouchDevice()) return null;
  return <AmbientBackgroundCanvas />;
}

function AmbientBackgroundCanvas() {
  const { theme: themeMode } = useTheme();
  const canvasRef = useRef(null);
  const stateRef = useRef({
    particles: [],
    mouse: null,
    shapeIdx: 0,
    assigned: new Set(),
    lastPickX: null,
    lastPickY: null,
    raf: null,
    theme: themeMode,
  });

  useEffect(() => {
    stateRef.current.theme = themeMode;
  }, [themeMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const init = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      // Clear any in-flight shape state before rebuilding
      stateRef.current.assigned.clear();
      stateRef.current.lastPickX = null;
      stateRef.current.lastPickY = null;
      stateRef.current.particles = buildGrid(canvas.width, canvas.height);
    };

    const animate = () => {
      const { particles, theme } = stateRef.current;
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      const gridColor  = theme === "light" ? "rgba(0,0,0,0.35)"   : "rgba(255,255,255,0.3)";
      const shapeColor = theme === "light" ? "#000000"            : "#ffffff";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const inShape = p.slotX !== null;
        const tx = inShape ? p.slotX : p.homeX;
        const ty = inShape ? p.slotY : p.homeY;
        const k    = inShape ? SHAPE_SPRING  : GRID_SPRING;
        const damp = inShape ? SHAPE_DAMPING : GRID_DAMPING;

        p.vx += (tx - p.x) * k;
        p.vy += (ty - p.y) * k;
        p.vx *= damp;
        p.vy *= damp;
        p.x  += p.vx;
        p.y  += p.vy;

        ctx.beginPath();
        // Shape particles: solid color + slightly larger so the outline reads clearly
        ctx.arc(p.x, p.y, inShape ? 0.8 : 0.5, 0, Math.PI * 2);
        ctx.fillStyle = inShape ? shapeColor : gridColor;
        ctx.fill();
      }

      stateRef.current.raf = requestAnimationFrame(animate);
    };

    // ── Mouse events ──────────────────────────────────────────────────────
    const onMouseMove = (e) => {
      const state = stateRef.current;
      const mx = e.clientX, my = e.clientY;

      // Re-pick shape if cursor has travelled far enough (or first entry)
      const needsPick =
        state.lastPickX === null ||
        Math.hypot(mx - state.lastPickX, my - state.lastPickY) > REPICK_DIST;

      state.mouse = { x: mx, y: my };

      if (needsPick) {
        state.shapeIdx = Math.floor(Math.random() * shapes.length);
        state.lastPickX = mx;
        state.lastPickY = my;
      }

      assignShape(state);
    };

    const onMouseLeave = () => {
      const state = stateRef.current;
      state.mouse = null;
      state.lastPickX = null;
      state.lastPickY = null;
      state.assigned.forEach((i) => {
        state.particles[i].slotX = null;
        state.particles[i].slotY = null;
      });
      state.assigned.clear();
    };

    // ── Resize ────────────────────────────────────────────────────────────
    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        init();
        // If mouse is still in window, re-assign shape immediately
        if (stateRef.current.mouse) assignShape(stateRef.current);
      }, 150);
    };

    init();
    stateRef.current.raf = requestAnimationFrame(animate);

    window.addEventListener("mousemove",  onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("resize",     onResize);

    return () => {
      cancelAnimationFrame(stateRef.current.raf);
      clearTimeout(resizeTimer);
      window.removeEventListener("mousemove",  onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize",     onResize);
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
