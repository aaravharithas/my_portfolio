"use client";

import { useEffect, useRef } from "react";
import { useInView } from "motion/react";

/**
 * skiper-ui.com's looping smoke video (public/hero/loopbg.mp4), used by the hero and the education
 * glow. It plays only while on screen with the tab visible, and never with reduced motion (the poster
 * frame stands in). The media query is watched directly so turning reduced motion on mid-visit pauses it.
 */
export function LoopVideo({ className, preload = "none" }: { className?: string; preload?: "auto" | "none" }) {
  const ref = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => { if (inView && !document.hidden && !reduce.matches) video.play().catch(() => {}); else video.pause(); };
    sync();
    document.addEventListener("visibilitychange", sync);
    reduce.addEventListener("change", sync);
    return () => { document.removeEventListener("visibilitychange", sync); reduce.removeEventListener("change", sync); };
  }, [inView]);
  return <video ref={ref} muted loop playsInline preload={preload} poster="/hero/loopbg-poster.jpg" aria-hidden="true" className={className}>
    <source src="/hero/loopbg.mp4" type="video/mp4" />
  </video>;
}
