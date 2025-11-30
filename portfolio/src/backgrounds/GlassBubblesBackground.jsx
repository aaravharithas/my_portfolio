import React, { useEffect, useRef } from "react";

export default function GlassBubblesBackground({
  bubbleCount = 22,
  maxSize = 160,
  minSize = 60,
  floatSpeed = 0.6,
  repelStrength = 0.14,
  glowColor = "rgba(250,204,21,0.45)", // neon yellow glow
}) {
  const canvasRef = useRef(null);
  const bubbles = useRef([]);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.scale(dpr, dpr);

      initBubbles();
    }

    function initBubbles() {
      bubbles.current = [];
      for (let i = 0; i < bubbleCount; i++) {
        const size = Math.random() * (maxSize - minSize) + minSize;

        bubbles.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size,
          baseSize: size,
          vx: (Math.random() - 0.5) * floatSpeed,
          vy: (Math.random() - 0.5) * floatSpeed,
          offset: Math.random() * 1000,
        });
      }
    }

    function drawBubble(b) {
      ctx.save();

      // Glass effect: blur+glow
      ctx.filter = "blur(6px)";

      // Outer glow
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 25;

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size / 2, 0, Math.PI * 2);

      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fill();
      ctx.restore();

      // Inner sharp circle
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size / 2.4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fill();

      // Shine highlight
      ctx.beginPath();
      ctx.arc(b.x + b.size * 0.18, b.y - b.size * 0.18, b.size / 5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fill();
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      bubbles.current.forEach((b) => {
        // Float motion
        b.y += b.vy;
        b.x += b.vx;

        // subtle pulsation
        b.size = b.baseSize + Math.sin(performance.now() / 800 + b.offset) * 6;

        // Wrap around edges
        if (b.y - b.size > height) b.y = -b.size;
        if (b.x - b.size > width) b.x = -b.size;
        if (b.x + b.size < 0) b.x = width + b.size;

        // Mouse repel
        const dx = b.x - mouse.current.x;
        const dy = b.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = 140;

        if (dist < influence) {
          const force = (1 - dist / influence) * repelStrength;
          b.x += dx * force * 5;
          b.y += dy * force * 5;
        }

        drawBubble(b);
      });

      requestAnimationFrame(animate);
    }

    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
      mouse.current.y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    }

    function onLeave() {
      mouse.current.x = -9999;
      mouse.current.y = -9999;
    }

    resize();
    animate();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseleave", onLeave);
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
        zIndex: 0,
      }}
    />
  );
}
