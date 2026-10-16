"use client";

import { useEffect, useRef, type ComponentProps } from "react";

// A div that gets the `paused` class while it is off screen or the tab is hidden;
// globals.css then pauses every CSS animation inside it.
export function PauseOffscreen(props: ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let visible = true;
    const update = () => element.classList.toggle("paused", !visible || document.hidden);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { threshold: 0 });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, []);
  return <div ref={ref} {...props} />;
}
