// NeonTriangulatedMesh.jsx (Fully Fixed Version)
// Premium neon triangulated mesh with cursor/touch warp + scroll depth.
// Fully mobile-optimized. No DOMMatrix errors.

import React, { useRef, useEffect } from "react";

export default function NeonTriangulatedMesh() {
  // ------------------------- CONFIG -------------------------
  const CONFIG = {
    COLS: 20,
    ROWS: 12,
    JITTER: 18,
    WARP: 0.25,
    SHEEN: 0.9,
    LINE_WIDTH: 1.1,
    COLORS: ["#66f0ff", "#b676ff", "#ff66b3"],
    BG: ["#020216", "#06102a"],
    SCROLL_DEPTH_MULT: 0.0009,
    TOUCH_MULT: 1.8,
    MOBILE_REDUCTION_THRESHOLD: 700,
  };
  // -----------------------------------------------------------

  const canvasRef = useRef();
  const rafRef = useRef();
  const pointsRef = useRef([]);
  const trianglesRef = useRef([]);
  const pointer = useRef({ x: -9999, y: -9999, down: false });
  const scrollOffset = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    let dpr = Math.max(1, window.devicePixelRatio || 1);

    // ---------- Compute grid size ----------
    function computeGridSize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      let cols = CONFIG.COLS;
      let rows = CONFIG.ROWS;

      if (w < CONFIG.MOBILE_REDUCTION_THRESHOLD) {
        cols = Math.max(8, Math.round(cols * 0.6));
        rows = Math.max(6, Math.round(rows * 0.6));
      }

      return { w, h, cols, rows };
    }

    // ---------- Resize + Safe Transform ----------
    function resize() {
      dpr = Math.max(1, window.devicePixelRatio || 1);
      const { w, h } = computeGridSize();

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";

      // FIXED: No more DOMMatrixInit errors
      if (ctx.resetTransform) ctx.resetTransform();
      ctx.scale(dpr, dpr);

      initPointsAndTriangles();
    }

    // ---------- Initialize Points + Triangles ----------
    function initPointsAndTriangles() {
      const { w, h, cols, rows } = computeGridSize();
      const pts = [];
      const jitter = CONFIG.JITTER;

      const stepX = w / (cols - 1);
      const stepY = h / (rows - 1);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * stepX + (Math.random() - 0.5) * jitter;
          const y = r * stepY + (Math.random() - 0.5) * jitter;

          pts.push({
            x,
            y,
            ox: x,
            oy: y,
            vx: 0,
            vy: 0,
            z: Math.random() * 1.2, // pseudo depth
          });
        }
      }

      const tris = [];
      for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols - 1; c++) {
          const i = r * cols + c;
          tris.push([i, i + cols, i + 1]);
          tris.push([i + 1, i + cols, i + cols + 1]);
        }
      }

      pointsRef.current = pts;
      trianglesRef.current = tris;
    }

    // ---------- Interaction ----------
    function getPt(ev) {
      if (ev.touches && ev.touches[0]) {
        return {
          x: ev.touches[0].clientX,
          y: ev.touches[0].clientY,
          touch: true,
        };
      }
      return { x: ev.clientX, y: ev.clientY, touch: false };
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
    }
    function onUp() {
      pointer.current.down = false;
    }
    function onWheel(e) {
      scrollOffset.current += e.deltaY * CONFIG.SCROLL_DEPTH_MULT;
      scrollOffset.current = Math.max(-0.6, Math.min(1.4, scrollOffset.current));
    }

    // ---------- Physics ----------
    function update(dt) {
      const pts = pointsRef.current;
      const p = pointer.current;
      const isTouch = "ontouchstart" in window;

      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      for (let i = 0; i < pts.length; i++) {
        const pt = pts[i];

        const dx = p.x - pt.x;
        const dy = p.y - pt.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;

        const influence = 150 + pt.z * 140;
        const warp = CONFIG.WARP * (isTouch ? CONFIG.TOUCH_MULT : 1);

        if (dist < influence) {
          const amount = (1 - dist / influence) * warp * (1 + scrollOffset.current * 0.6);
          const dir = p.down ? -1 : 1;
          pt.vx += (dx / dist) * amount * dir * 0.9;
          pt.vy += (dy / dist) * amount * dir * 0.9;
        }

        // spring back + parallax
        const tx = pt.ox + pt.z * scrollOffset.current * 40;
        const ty = pt.oy + pt.z * scrollOffset.current * 40;

        pt.vx += (tx - pt.x) * 0.06;
        pt.vy += (ty - pt.y) * 0.06;

        pt.vx *= 0.88;
        pt.vy *= 0.88;

        pt.x += pt.vx;
        pt.y += pt.vy;
      }
    }

    // ---------- Render ----------
    function draw() {
      const pts = pointsRef.current;
      const tris = trianglesRef.current;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, CONFIG.BG[0]);
      bg.addColorStop(1, CONFIG.BG[1]);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.lineWidth = CONFIG.LINE_WIDTH;

      for (let i = 0; i < tris.length; i++) {
        const [i1, i2, i3] = tris[i];
        const a = pts[i1];
        const b = pts[i2];
        const c = pts[i3];

        const cx = (a.x + b.x + c.x) / 3;
        const cy = (a.y + b.y + c.y) / 3;

        const dx = pointer.current.x - cx;
        const dy = pointer.current.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const alpha = Math.max(0.08, 0.6 - dist / 420);

        const grad = ctx.createLinearGradient(a.x, a.y, c.x, c.y);
        grad.addColorStop(0, CONFIG.COLORS[(i + 1) % CONFIG.COLORS.length]);
        grad.addColorStop(1, CONFIG.COLORS[(i + 2) % CONFIG.COLORS.length]);

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.closePath();

        ctx.globalAlpha = alpha * 0.72 * CONFIG.SHEEN;
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.globalAlpha = Math.min(1, alpha);
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.stroke();

        ctx.globalAlpha = alpha * 0.9;
        ctx.strokeStyle = CONFIG.COLORS[i % CONFIG.COLORS.length];
        ctx.lineWidth = 0.6;
        ctx.stroke();
        ctx.lineWidth = CONFIG.LINE_WIDTH;
      }

      // Glowing points
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];

        ctx.beginPath();
        ctx.globalAlpha = 0.14;
        ctx.fillStyle = CONFIG.COLORS[i % CONFIG.COLORS.length];
        ctx.arc(p.x, p.y, 6 * (0.6 + p.z * 0.8), 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#fff";
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    }

    // ---------- Animation Loop ----------
    let last = performance.now();

    function loop(now) {
      const dt = now - last;
      last = now;

      update(dt / 16.66);
      draw();

      rafRef.current = requestAnimationFrame(loop);
    }

    resize();
    rafRef.current = requestAnimationFrame(loop);

    // ---------- Event listeners ----------
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", () => setTimeout(resize, 300));

    // ---------- Cleanup ----------
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
        width: "100%",
        height: "100%",
        zIndex: -1,
        display: "block",
        touchAction: "none",
      }}
    />
  );
}
