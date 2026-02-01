/**
 * BounceCard - React Bits style card with bounce/tilt on hover (framer-motion).
 * Wraps children and adds subtle 3D tilt + scale bounce. Respects touch devices.
 */
import React, { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

export default function BounceCard({
  children,
  className = "",
  maxTilt = 8,
  scaleOnHover = 1.02,
  springDamping = 25,
  springStiffness = 300,
  disabled = false,
  ...rest
}) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useTransform(y, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(x, [0, 1], [-maxTilt, maxTilt]);
  const springConfig = { damping: springDamping, stiffness: springStiffness };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  const handleMove = (e) => {
    if (!cardRef.current || disabled) return;
    const rect = cardRef.current.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    x.set(mx / w);
    y.set(my / h);
  };

  const handleLeave = () => {
    setIsHovered(false);
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      className={className}
      onMouseMove={handleMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleLeave}
      style={{
        rotateX: disabled ? 0 : rotateXSpring,
        rotateY: disabled ? 0 : rotateYSpring,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      whileHover={!disabled ? { scale: scaleOnHover } : undefined}
      transition={{ type: "spring", damping: 15, stiffness: 300 }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
