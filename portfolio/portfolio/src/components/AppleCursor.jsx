import React, { useEffect, useState, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useVelocity,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { isTouchDevice } from "../utils/responsiveUtils.js";

const MAGNET_STRENGTH = 0.15;

// Wrapper: skip entirely on touch/mobile — no mouse cursor exists on those devices
export default function AppleCursor() {
  if (isTouchDevice()) return null;
  return <AppleCursorInner />;
}

function AppleCursorInner() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [cursorState, setCursorState] = useState("default"); // "default" | "link" | "button" | "text"
  const [isPressed, setIsPressed] = useState(false);
  const [magnetTarget, setMagnetTarget] = useState(null);
  const magnetTargetRef = useRef(null);
  magnetTargetRef.current = magnetTarget;

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 45, stiffness: 1200 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // Velocity for speed-based opacity (trail dots removed — too expensive)
  const velocityX = useVelocity(cursorXSpring);
  const velocityY = useVelocity(cursorYSpring);
  const speed = useTransform(
    [velocityX, velocityY],
    ([vx, vy]) => Math.sqrt(vx * vx + vy * vy)
  );

  const isVisibleMotion = useMotionValue(1);
  const hoverActiveMotion = useMotionValue(0);
  useEffect(() => {
    isVisibleMotion.set(isVisible ? 1 : 0);
  }, [isVisible, isVisibleMotion]);
  useEffect(() => {
    hoverActiveMotion.set(
      cursorState === "link" || cursorState === "button" ? 1 : 0
    );
  }, [cursorState, hoverActiveMotion]);

  // Combined opacity: full on hover, speed-based (0.3–1) otherwise
  const cursorOpacity = useTransform(
    [isVisibleMotion, speed, hoverActiveMotion],
    ([vis, s, hover]) =>
      vis * (hover ? 1 : 0.3 + Math.min(Number(s) / 400, 0.7))
  );

  useEffect(() => {
    setMounted(true);
    setIsVisible(true);
    document.body.classList.add("cursor-hidden");
    return () => {
      document.body.classList.remove("cursor-hidden");
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const moveCursor = (e) => {
      const mag = magnetTargetRef.current;
      if (mag) {
        cursorX.set(e.clientX + (mag.x - e.clientX) * mag.strength);
        cursorY.set(e.clientY + (mag.y - e.clientY) * mag.strength);
      } else {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
      }
      setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    const handleMouseOver = (e) => {
      const target = e.target;
      const el = target?.nodeType === 1 ? target : target?.parentElement;
      const interactive = el?.closest?.(
        'a, button, [role="button"], [role="link"]'
      );
      const isInput = el?.closest?.("input, textarea");

      if (interactive) {
        const isButton =
          interactive.matches("button") ||
          interactive.getAttribute("role") === "button";
        setCursorState(isButton ? "button" : "link");
        const rect = interactive.getBoundingClientRect();
        setMagnetTarget({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          strength: MAGNET_STRENGTH,
        });
      } else if (isInput) {
        setCursorState("text");
        setMagnetTarget(null);
      } else {
        setCursorState("default");
        setMagnetTarget(null);
      }
    };

    const handlePointerDown = () => setIsPressed(true);
    const handlePointerUp = () => setIsPressed(false);
    const handlePointerCancel = () => setIsPressed(false);

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerCancel);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [cursorX, cursorY, mounted]);

  const isHover = cursorState === "link" || cursorState === "button";
  const hoverScale = cursorState === "button" ? 2.8 : 2.5;
  const hoverRingScale = cursorState === "button" ? 3.2 : 3;

  if (!mounted) return null;

  return (
    <>
      <motion.div
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
          x: "-50%",
          y: "-50%",
          opacity: cursorOpacity,
        }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Hover glow — simple fade, no pulsing repeat */}
        {isHover && (
          <motion.div
            className="absolute w-20 h-20 rounded-full bg-white"
            style={{
              left: "50%",
              top: "50%",
              x: "-50%",
              y: "-50%",
              filter: "blur(12px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {/* Click burst ring */}
        <AnimatePresence>
          {isPressed && (
            <motion.div
              className="absolute inset-0 border-2 border-white rounded-full"
              style={{
                left: "50%",
                top: "50%",
                x: "-50%",
                y: "-50%",
              }}
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>

        {/* Main morphing blob */}
        <motion.div
          className="relative"
          animate={{
            scale: cursorState === "text" ? 0.3 : isHover ? hoverScale : 1,
            rotate: isHover ? [0, 180, 360] : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            rotate: isHover
              ? { duration: 2, repeat: Infinity, ease: "linear" }
              : {},
          }}
        >
          {/* Idle: CSS-animated gradient ring (GPU only, zero JS cost) */}
          {cursorState === "default" && (
            <div
              className="absolute left-1/2 top-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-blob-gradient flex items-center justify-center"
              aria-hidden
            >
              <div className="w-6 h-6 rounded-full bg-white" />
            </div>
          )}

          {/* Organic blob shape */}
          <motion.div
            className="w-6 h-6 bg-white rounded-full"
            animate={{
              borderRadius:
                cursorState === "text"
                  ? "2px"
                  : isHover
                    ? ["50%", "60% 40% 30% 70%", "40% 60% 70% 30%", "50%"]
                    : "50%",
              scaleX: cursorState === "text" ? 3 : 1,
              scaleY: cursorState === "text" ? 0.3 : 1,
            }}
            transition={{
              borderRadius: {
                duration: 3,
                repeat: isHover ? Infinity : 0,
                ease: "easeInOut",
              },
              scale: { type: "spring", stiffness: 300, damping: 20 },
            }}
            style={{
              filter: "blur(0.5px)",
              boxShadow: "0 0 20px rgba(255, 255, 255, 0.8)",
            }}
          />

          {/* Text caret blink */}
          {cursorState === "text" && (
            <motion.div
              className="absolute w-0.5 h-4 bg-white rounded-sm"
              style={{
                left: "100%",
                top: "50%",
                marginLeft: 4,
                y: "-50%",
              }}
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </motion.div>

        {/* Outer ring for hover */}
        {isHover && (
          <motion.div
            className="absolute inset-0 border border-white rounded-full"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: hoverRingScale, opacity: [0, 0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </motion.div>
    </>
  );
}
