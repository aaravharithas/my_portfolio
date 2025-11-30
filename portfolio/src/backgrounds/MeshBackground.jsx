// MeshBackground.jsx
import React, { useRef, useEffect } from "react";

/**
 * Triangulated Mesh Background (B2)
 *
 * Usage: <MeshBackground />
 *
 * Renders a responsive triangulated mesh (grid -> two triangles per cell).
 * Interactive: mouse/touch repels points, subtle float animation.
 *
 * Non-blocking: pointerEvents: 'none'.
 */

export default function MeshBackground({
  colorStroke = "rgba(250,204,21,0.10)", // neon yellow stroke
  colorFill = "rgba(250,204,21,0.02)",   // subtle fill
  gridBase = 90,                          // base spacing in px for large screens
  amplitude = 10,                         // max displacement for animation
  speed = 0.6,                            // animation speed multiplier
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const pointsRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999, down: false });
  const resizeTimerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    let width = 0;
    let height = 0;
    let dpr = Math.max(1, window.devicePixelRatio || 1);

    // build grid of points
    function buildPoints() {
      pointsRef.current = [];
      const w = width;
      const h = height;

      // choose spacing based on screen size for responsiveness
      // smaller spacing -> denser mesh
      const spacing = Math.max(48, Math.floor(gridBase * (window.innerWidth < 600 ? 0.6 : window.innerWidth < 900 ? 0.8 : 1)));

      const cols = Math.ceil(w / spacing) + 1;
      const rows = Math.ceil(h / spacing) + 1;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * spacing;
          const y = row * spacing;
          // store original (grid) position, animated position, velocity and a noise offset
          pointsRef.current.push({
            ox: x,
            oy: y,
            x: x + (Math.random() - 0.5) * spacing * 0.15,
            y: y + (Math.random() - 0.5) * spacing * 0.15,
            vx: 0,
            vy: 0,
            n: Math.random() * Math.PI * 2, // noise phase
            row,
            col,
            spacing,
            cols,
            rows,
          });
        }
      }

      // store grid dims for triangulation
      pointsRef.current._cols = cols;
      pointsRef.current._rows = rows;
      pointsRef.current._spacing = spacing;
    }

    // handle resize
    function resize() {
      cancelAnimationFrame(rafRef.current);
      dpr = Math.max(1, window.devicePixelRatio || 1);
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);

      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      buildPoints();
      start(); // restart animation loop
    }

    // mouse/touch handling
    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      mouseRef.current.x = x;
      mouseRef.current.y = y;
    }
    function onLeave() {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    }

    // main draw loop
    let last = performance.now();
    function step(now) {
      const dt = Math.min(64, now - last) / 1000; // in seconds
      last = now;

      updatePoints(dt);
      render();

      rafRef.current = requestAnimationFrame(step);
    }

    // update point physics & noise
    function updatePoints(dt) {
      const points = pointsRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const interactionRadius = Math.max(60, Math.min(200, Math.max(width, height) * 0.12));

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // noise (float) - uses sine
        const t = performance.now() / 1000;
        const noiseX = Math.sin(p.n + t * speed) * (amplitude * 0.35);
        const noiseY = Math.cos(p.n + t * speed * 0.9) * (amplitude * 0.25);

        // target position = original grid + noise
        const tx = p.ox + noiseX;
        const ty = p.oy + noiseY;

        // interaction: if mouse is near, apply repulsion
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist2 = dx * dx + dy * dy;
        if (mx > -9000 && dist2 < interactionRadius * interactionRadius) {
          const dist = Math.sqrt(dist2) || 0.0001;
          // normalized direction from mouse to point
          const nx = (p.x - mx) / dist;
          const ny = (p.y - my) / dist;
          // strength decreases with distance
          const strength = (1 - dist / interactionRadius) * 1.8;
          // push the target away
          const repel = Math.max(10, interactionRadius * 0.08) * strength;
          // combine with noise
          p.vx += (tx + nx * repel - p.x) * (0.12 + strength * 0.05);
          p.vy += (ty + ny * repel - p.y) * (0.12 + strength * 0.05);
        } else {
          // gently move back to target
          p.vx += (tx - p.x) * 0.08;
          p.vy += (ty - p.y) * 0.08;
        }

        // damping
        p.vx *= 0.86;
        p.vy *= 0.86;

        // apply velocity
        p.x += p.vx;
        p.y += p.vy;
      }
    }

    // Triangulation: connect grid points into two triangles per quad.
    // We created points row-by-row so index = row*cols + col
    function render() {
      const points = pointsRef.current;
      ctx.clearRect(0, 0, width, height);

      // subtle background tint (transparent)
      // ctx.fillStyle = "rgba(0,0,0,0)";
      // ctx.fillRect(0,0,width,height);

      const cols = points._cols;
      const rows = points._rows;
      if (!cols || !rows) return;

      ctx.lineWidth = 1;
      ctx.strokeStyle = colorStroke;
      ctx.fillStyle = colorFill;

      // for all cells
      for (let row = 0; row < rows - 1; row++) {
        for (let col = 0; col < cols - 1; col++) {
          const iTL = row * cols + col;
          const iTR = iTL + 1;
          const iBL = (row + 1) * cols + col;
          const iBR = iBL + 1;

          const pTL = points[iTL];
          const pTR = points[iTR];
          const pBL = points[iBL];
          const pBR = points[iBR];

          // triangle 1 (TL, TR, BL)
          ctx.beginPath();
          ctx.moveTo(pTL.x, pTL.y);
          ctx.lineTo(pTR.x, pTR.y);
          ctx.lineTo(pBL.x, pBL.y);
          ctx.closePath();

          // fill with very subtle color
          ctx.fillStyle = colorFill;
          ctx.fill();

          // stroke lines
          ctx.strokeStyle = colorStroke;
          ctx.stroke();

          // triangle 2 (BR, BL, TR)
          ctx.beginPath();
          ctx.moveTo(pBR.x, pBR.y);
          ctx.lineTo(pBL.x, pBL.y);
          ctx.lineTo(pTR.x, pTR.y);
          ctx.closePath();

          ctx.fillStyle = colorFill;
          ctx.fill();

          ctx.strokeStyle = colorStroke;
          ctx.stroke();
        }
      }

      // optional: draw points (tiny)
      // ctx.fillStyle = "rgba(250,204,21,0.08)";
      // for (let i=0;i<points.length;i++){ const p=points[i]; ctx.beginPath(); ctx.arc(p.x,p.y,1.1,0,Math.PI*2); ctx.fill(); }
    }

    // start animation
    function start() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      last = performance.now();
      rafRef.current = requestAnimationFrame(step);
    }

    // initial setup
    resize();

    // event listeners
    window.addEventListener("resize", () => {
      // debounce resize to avoid rebuild thrash
      clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(() => resize(), 120);
    });

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchstart", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    // cleanup
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchstart", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorStroke, colorFill, gridBase, amplitude, speed]);

  // canvas element sits fixed and behind content; pointerEvents none so it won't capture clicks.
  // zIndex set to 0; your page content should have zIndex > 0. If you keep header fixed, ensure it has higher z-index.
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        display: "block",
        background: "transparent",
      }}
    />
  );
}
