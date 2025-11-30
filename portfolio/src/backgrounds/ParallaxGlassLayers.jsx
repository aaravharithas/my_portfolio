import React, { useEffect, useRef } from "react";

/**
 * ParallaxGlassLayers.jsx
 *
 * - layerCount: number of glass layers (default 5)
 * - intensity: cursor response intensity
 * - scrollIntensity: how much scroll moves layers
 * - maxShift: max px shift for the closest layer
 * - blurBase: base blur for layers
 *
 * Adds:
 * - momentum simulation for scroll
 * - spring physics for layer motion (stiffness + damping)
 * - dynamic depth blur on scroll speed
 * - slight perspective tilt on scroll direction
 *
 * Usage: <ParallaxGlassLayers {...props} />
 */

export default function ParallaxGlassLayers({
  layerCount = 5,
  intensity = 0.038,
  scrollIntensity = 0.12,
  maxShift = 36,
  blurBase = 10,
}) {
  const containerRef = useRef(null);
  const rafRef = useRef(null);

  // Refs for state that shouldn't rerender
  const pointer = useRef({ x: 0.5, y: 0.5 });
  const sizes = useRef({ w: window.innerWidth, h: window.innerHeight });
  const targetTransforms = useRef([]);
  const currentTransforms = useRef([]);
  const scrollState = useRef({
    current: window.scrollY || 0,
    target: window.scrollY || 0,
    velocity: 0, // momentum velocity
  });
  const lastScrollTime = useRef(performance.now());
  const prefersReduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Visual presets (gradients, hue hint)
  const layerStyles = [
    { gradient: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(250,204,21,0.03))", hueShift: 25 },
    { gradient: "linear-gradient(120deg, rgba(255,255,255,0.05), rgba(120,100,255,0.02))", hueShift: 260 },
    { gradient: "linear-gradient(60deg, rgba(255,255,255,0.04), rgba(0,210,255,0.02))", hueShift: 190 },
    { gradient: "linear-gradient(110deg, rgba(255,255,255,0.04), rgba(255,90,120,0.02))", hueShift: 350 },
    { gradient: "linear-gradient(150deg, rgba(255,255,255,0.03), rgba(0,0,0,0.03))", hueShift: 0 },
  ];

  // clamp helper
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // init transform arrays
    targetTransforms.current = new Array(layerCount).fill(0).map(() => ({
      tx: 0,
      ty: 0,
      rot: 0,
      tz: 0,
      tiltX: 0,
      tiltY: 0,
      blurExtra: 0,
    }));
    // current transforms will be eased using spring physics
    currentTransforms.current = new Array(layerCount).fill(0).map(() => ({
      tx: 0,
      ty: 0,
      rot: 0,
      tz: 0,
      vx: 0, // velocity for spring per property
      vy: 0,
      vrot: 0,
      vtz: 0,
      tiltX: 0,
      tiltY: 0,
      blurExtra: 0,
    }));

    // size tracking
    const onResize = () => {
      sizes.current.w = window.innerWidth;
      sizes.current.h = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    // pointer tracking (mouse + touch)
    const onMove = (e) => {
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      pointer.current.x = clamp(cx / sizes.current.w, 0, 1);
      pointer.current.y = clamp(cy / sizes.current.h, 0, 1);

      // small transient z target pulse handled in animate loop
      for (let i = 0; i < layerCount; i++) {
        targetTransforms.current[i].tz = 6 * ((i + 1) / layerCount);
      }
    };
    const onLeave = () => {
      pointer.current.x = 0.5;
      pointer.current.y = 0.5;
    };

    // scroll/momentum handling
    const onScroll = () => {
      const now = performance.now();
      const newTarget = window.scrollY || 0;
      const last = scrollState.current.target;
      // estimate instantaneous velocity (px / ms)
      const dt = Math.max(8, now - lastScrollTime.current);
      const dy = newTarget - last;
      const instantV = dy / dt;
      // momentum: blend into velocity with decay
      scrollState.current.velocity = scrollState.current.velocity * 0.88 + instantV * 0.28;
      scrollState.current.target = newTarget;
      lastScrollTime.current = now;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // click/touch shouldn't matter but keep for small pulse
    const onTap = () => {
      // add a tiny transient tz to all layers
      for (let i = 0; i < layerCount; i++) targetTransforms.current[i].tz += 8 * ((i + 1) / layerCount);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("touchend", onLeave);
    window.addEventListener("click", onTap, { passive: true });

    // SPRING parameters (physical feel)
    const stiffness = 0.12; // spring stiffness (higher = snappier)
    const damping = 0.82;   // damping ratio (0..1, lower = more oscillation)

    // scroll momentum parameters
    const scrollEase = 0.12;
    const scrollVelocityDecay = 0.92;

    // animation loop
    const animate = () => {
      // update scroll current with inertia
      const s = scrollState.current;
      // ease current toward target
      s.current += (s.target - s.current) * scrollEase;
      // apply velocity decay
      s.velocity *= scrollVelocityDecay;

      // compute normalized pointer -1..1
      const px = (pointer.current.x - 0.5) * 2;
      const py = (pointer.current.y - 0.5) * 2;

      // compute small perspective tilt derived from scroll velocity
      const tiltX_fromScroll = clamp(-s.velocity * 160, -12, 12); // rotateX
      const tiltY_fromScroll = clamp(s.velocity * 160, -12, 12);  // rotateY

      for (let i = 0; i < layerCount; i++) {
        const depthFactor = (i + 1) / layerCount;

        // cursor-based target translations
        const layerStrength = intensity * (1 + depthFactor * 1.6);
        const txCursor = px * maxShift * layerStrength * (1 + (i / layerCount));
        const tyCursor = py * maxShift * layerStrength * (1 + (i / layerCount));

        // scroll-based target translation (parallax)
        const scrollOffset = s.current * scrollIntensity * depthFactor * (i % 2 === 0 ? 1 : 0.85);

        // target rotation from pointer and scroll tilt
        const rotTarget = px * 6 * depthFactor + tiltY_fromScroll * 0.02 * depthFactor;

        // target tilt: incorporate scroll tilt for subtle perspective
        const tiltXTarget = tiltX_fromScroll * (0.12 * depthFactor);
        const tiltYTarget = tiltY_fromScroll * (0.08 * depthFactor);

        // dynamic blur extra based on scroll speed and depth (more speed => more blur)
        const blurExtraTarget = Math.min(18, Math.abs(s.velocity) * 320 * depthFactor);

        // set targets
        const tgt = targetTransforms.current[i];
        tgt.tx = txCursor;
        tgt.ty = tyCursor + scrollOffset;
        tgt.rot = rotTarget;
        tgt.tz = (tgt.tz || 0) * 0.88; // decay transient tz (added by pointer pulses)
        tgt.tiltX = tiltXTarget;
        tgt.tiltY = tiltYTarget;
        tgt.blurExtra = blurExtraTarget;

        // apply spring (per-property) to current transforms
        const cur = currentTransforms.current[i];

        // spring for tx (x)
        const ax = (tgt.tx - cur.tx) * stiffness;
        cur.vx = (cur.vx + ax) * damping;
        cur.tx += cur.vx;

        // spring for ty (y)
        const ay = (tgt.ty - cur.ty) * stiffness;
        cur.vy = (cur.vy + ay) * damping;
        cur.ty += cur.vy;

        // spring for rotation
        const arot = (tgt.rot - cur.rot) * (stiffness * 0.9);
        cur.vrot = (cur.vrot + arot) * (damping * 0.9);
        cur.rot += cur.vrot;

        // spring for tz (z translate)
        const atz = (tgt.tz - (cur.tz || 0)) * (stiffness * 0.6);
        cur.vtz = (cur.vtz + atz) * (damping * 0.86);
        cur.tz = (cur.tz || 0) + cur.vtz;

        // spring for tilt X/Y and blur (lower stiffness to feel floaty)
        cur.tiltX += (tgt.tiltX - cur.tiltX) * 0.14;
        cur.tiltY += (tgt.tiltY - cur.tiltY) * 0.14;
        cur.blurExtra += (tgt.blurExtra - cur.blurExtra) * 0.12;

        // apply to DOM node
        const node = container.children[i];
        if (!node) continue;

        // perspective tilt + translate + rotate + subtle scale for depth
        const depthScale = 1 + depthFactor * 0.02;
        const transform = `perspective(1200px) translate3d(${cur.tx.toFixed(2)}px, ${cur.ty.toFixed(2)}px, ${cur.tz.toFixed(2)}px) rotateX(${cur.tiltX.toFixed(2)}deg) rotateY(${cur.tiltY.toFixed(2)}deg) rotate(${cur.rot.toFixed(2)}deg) scale(${depthScale})`;
        node.style.transform = transform;

        // dynamic blur calculation
        const blurVal = Math.max(0, blurBase + (depthFactor * 6) + cur.blurExtra * 0.7);
        node.style.backdropFilter = `blur(${blurVal.toFixed(2)}px) saturate(120%)`;
        node.style.WebkitBackdropFilter = `blur(${blurVal.toFixed(2)}px) saturate(120%)`;

        // subtle opacity tweak per depth
        node.style.opacity = `${clamp(0.55 + depthFactor * 0.5, 0.45, 1)}`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    // Start loop (respect reduced motion)
    if (!prefersReduced) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      // reduced motion: set static mild transforms
      for (let i = 0; i < layerCount; i++) {
        const node = container.children[i];
        if (!node) continue;
        node.style.transform = `translate3d(0, ${i * 6}px, 0) scale(${1 + (i + 1) / layerCount * 0.01})`;
        node.style.backdropFilter = `blur(${blurBase + i}px) saturate(120%)`;
        node.style.opacity = `${clamp(0.65 + (i + 1) / layerCount * 0.45, 0.55, 1)}`;
      }
    }

    // cleanup
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("touchend", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("click", onTap);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layerCount, intensity, scrollIntensity, maxShift, blurBase]);

  // Build layers markup (DOM divs)
  const layers = [];
  for (let i = 0; i < layerCount; i++) {
    const depthFactor = (i + 1) / layerCount;
    const preset = layerStyles[i % layerStyles.length];
    const blur = blurBase + depthFactor * 6;
    const sizeScale = 1 + depthFactor * 0.03;

    layers.push(
      <div
        key={i}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: `${50 - i * 4}%`,
          top: `${6 + i * 5}%`,
          width: `${110 - i * 6}%`,
          height: `${82 - i * 6}%`,
          transform: "translate3d(0,0,0)",
          transition: "transform 120ms linear, opacity 200ms linear",
          zIndex: -10 - i,
          pointerEvents: "none",
          borderRadius: "28px",
          overflow: "hidden",
          backdropFilter: `blur(${blur}px) saturate(120%)`,
          WebkitBackdropFilter: `blur(${blur}px) saturate(120%)`,
          background: preset.gradient,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.02), 0 ${2 + i}px ${12 + i * 6}px rgba(0,0,0,${0.45 - i * 0.05})`,
          transformOrigin: "center center",
          opacity: clamp(0.6 + depthFactor * 0.5, 0.45, 1),
          willChange: "transform, backdrop-filter, opacity",
        }}
      >
        {/* glossy streak */}
        <div
          style={{
            position: "absolute",
            top: `${8 + i * 3}%`,
            left: `${6 + i * 2}%`,
            width: `${26 + i * 6}%`,
            height: `${20 + i * 6}%`,
            transform: "rotate(-12deg)",
            background: "linear-gradient(90deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02))",
            filter: "blur(6px)",
            opacity: 0.66,
            pointerEvents: "none",
            borderRadius: "30px",
          }}
        />

        {/* subtle grain overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(255,255,255,0.01), rgba(0,0,0,0.02))",
            mixBlendMode: "overlay",
            pointerEvents: "none",
          }}
        />

        {/* decorative SVG shapes */}
        <svg
          viewBox="0 0 200 120"
          preserveAspectRatio="xMidYMid slice"
          style={{
            position: "absolute",
            right: `${6 + i * 2}%`,
            bottom: `${6 + i * 2}%`,
            width: `${28 + i * 6}%`,
            height: `${28 + i * 6}%`,
            opacity: 0.12 + depthFactor * 0.06,
            filter: `blur(${(i + 1) * 1.6}px)`,
            pointerEvents: "none",
          }}
        >
          <defs>
            <linearGradient id={`g-${i}`} x1="0" x2="1">
              <stop offset="0%" stopColor={`hsla(${preset.hueShift || 200},90%,60%,0.6)`} />
              <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
            </linearGradient>
          </defs>
          <circle cx="40" cy="40" r="36" fill={`url(#g-${i})`} />
          <ellipse cx="140" cy="80" rx="48" ry="24" fill={`rgba(255,255,255,0.03)`} />
        </svg>
      </div>
    );
  }

  // Container sits behind everything (z-index -2). Ensure header/content have higher z-index.
  return (
    <>
      <div
        ref={containerRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: -2,
          pointerEvents: "none",
          overflow: "hidden",
          display: "block",
        }}
      >
        {layers}
      </div>

      {/* Respect reduced-motion and ensure child layers don't take pointer events */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          div[aria-hidden="true"] > div {
            transition: none !important;
            animation: none !important;
          }
        }
        div[aria-hidden="true"] * {
          pointer-events: none !important;
        }
      `}</style>
    </>
  );
}
