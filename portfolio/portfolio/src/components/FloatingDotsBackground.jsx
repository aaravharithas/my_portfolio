import React, { useMemo } from "react";
import { useTheme } from "../context/ThemeContext.jsx";

const DOT_COUNT = 14;
const DOT_POSITIONS = [
  { left: "8%", top: "12%" },
  { left: "22%", top: "8%" },
  { left: "45%", top: "15%" },
  { left: "78%", top: "20%" },
  { left: "92%", top: "35%" },
  { left: "15%", top: "45%" },
  { left: "55%", top: "40%" },
  { left: "85%", top: "55%" },
  { left: "5%", top: "72%" },
  { left: "35%", top: "78%" },
  { left: "68%", top: "85%" },
  { left: "90%", top: "92%" },
  { left: "50%", top: "95%" },
  { left: "28%", top: "28%" },
];

export default function FloatingDotsBackground() {
  const { theme } = useTheme();

  const dots = useMemo(
    () =>
      Array.from({ length: DOT_COUNT }, (_, i) => ({
        ...DOT_POSITIONS[i],
        size: 2 + (i % 3) * 1,
        duration: 8 + (i % 5) * 2,
        delay: -(i * 0.7) % 10,
      })),
    []
  );

  const dotColor =
    theme === "light"
      ? "rgba(0, 0, 0, 0.15)"
      : "rgba(255, 255, 255, 0.12)";

  return (
    <div
      className="floating-dots-bg"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {dots.map((dot, i) => (
        <div
          key={i}
          className="floating-dot"
          style={{
            position: "absolute",
            left: dot.left,
            top: dot.top,
            width: dot.size,
            height: dot.size,
            borderRadius: "50%",
            backgroundColor: dotColor,
            animation: `float-dot ${dot.duration}s ease-in-out ${dot.delay}s infinite`,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}
