import React, { useEffect, useRef } from "react";

const BlobDistortionBackground = () => {
  const canvasRef = useRef(null);
  let animationFrame;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Blob physics
    let blob = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      radius: 160,
      vx: 0,
      vy: 0,
      elasticity: 0.12,
      friction: 0.86,
    };

    let mouse = { x: null, y: null, active: false };

    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    });

    window.addEventListener("mouseleave", () => {
      mouse.active = false;
    });

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply attraction toward mouse
      if (mouse.active) {
        let dx = mouse.x - blob.x;
        let dy = mouse.y - blob.y;

        blob.vx += dx * blob.elasticity;
        blob.vy += dy * blob.elasticity;
      }

      // Apply friction
      blob.vx *= blob.friction;
      blob.vy *= blob.friction;

      blob.x += blob.vx;
      blob.y += blob.vy;

      // Draw blob
      const gradient = ctx.createRadialGradient(
        blob.x,
        blob.y,
        blob.radius * 0.2,
        blob.x,
        blob.y,
        blob.radius
      );

      gradient.addColorStop(0, "rgba(120, 90, 255, 0.55)");
      gradient.addColorStop(0.5, "rgba(140, 60, 255, 0.45)");
      gradient.addColorStop(1, "rgba(160, 40, 255, 0.25)");

      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.shadowBlur = 80;
      ctx.shadowColor = "rgba(160, 40, 255, 0.6)";
      ctx.fill();

      animationFrame = requestAnimationFrame(animate);
    }

    animate();

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
        zIndex: -2,
        pointerEvents: "none",
      }}
    />
  );
};

export default BlobDistortionBackground;
