import React, { useEffect, useRef } from "react";

const RGBLightTrails = () => {
  const canvasRef = useRef(null);
  const trails = [];
  let hue = 0;
  let animationFrame = null;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let mouse = { x: null, y: null };

    // Track cursor
    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      trails.push({
        x: mouse.x,
        y: mouse.y,
        alpha: 1,
        size: 2 + Math.random() * 4,
        hue: hue,
      });

      if (trails.length > 120) trails.shift();
    });

    // Draw loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      hue += 1; // RGB shifting

      trails.forEach((p, index) => {
        p.alpha -= 0.02;

        if (p.alpha <= 0) {
          trails.splice(index, 1);
          return;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${p.alpha})`;
        ctx.shadowColor = `hsla(${p.hue}, 90%, 65%, 0.9)`;
        ctx.shadowBlur = 20;
        ctx.fill();
      });

      // Idle animation (soft floating dots)
      if (!mouse.x) {
        trails.push({
          x: canvas.width / 2 + Math.sin(Date.now() * 0.002) * 80,
          y: canvas.height / 2 + Math.cos(Date.now() * 0.002) * 80,
          alpha: 0.5,
          size: 3,
          hue: hue,
        });
      }

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrame);
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
        pointerEvents: "none", // important
      }}
    />
  );
};

export default RGBLightTrails;
