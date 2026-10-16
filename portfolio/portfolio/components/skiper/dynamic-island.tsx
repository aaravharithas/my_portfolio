"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { PauseOffscreen } from "@/components/pause-offscreen";

type IslandEvent = { kind: "copied"; label: string } | { kind: "download" } | { kind: "sent" };
type View = "open" | "role" | "time" | IslandEvent["kind"];

/** Shows a short-lived event in the global island (copy, download, form sent). */
export function notifyIsland(event: IslandEvent) {
  window.dispatchEvent(new CustomEvent<IslandEvent>("island", { detail: event }));
}

export async function copyWithIsland(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    notifyIsland({ kind: "copied", label });
    return true;
  } catch {
    return false;
  }
}

const morph = { type: "spring", bounce: 0.25, duration: 0.5 } as const;
const ist = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" });

function useIstClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(ist.format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

const Check = () => <svg viewBox="0 0 16 16" className="size-4 text-green-400" aria-hidden="true">
  <motion.path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.15 }} />
</svg>;

const Progress = () => <svg viewBox="0 0 20 20" className="size-4 -rotate-90 text-sky-500" aria-hidden="true">
  <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
  <motion.circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: "easeInOut" }} />
</svg>;

type Details = { role?: string; company?: string; location?: string };

function Content({ view, label, details, time }: { view: View; label: string; details: Details; time: string }) {
  switch (view) {
    case "open": return <><span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex size-2 rounded-full bg-green-500" /></span>Open to work</>;
    case "role": return <><span className="grid size-5 place-items-center rounded-full bg-blue text-[10px] font-semibold">{details.company?.[0] ?? "•"}</span>{details.role} · {details.company}</>;
    case "time": return <>{details.location}{time && ` · ${time}`}</>;
    case "copied": return <><Check />{label}</>;
    case "download": return <><Progress />Downloading CV</>;
    case "sent": return <><Check />Message sent</>;
  }
}

function Pill({ view, label = "", details = {} }: { view: View; label?: string; details?: Details }) {
  const reduced = useReducedMotion();
  const time = useIstClock();
  return <motion.div layout transition={reduced ? { duration: 0 } : morph} style={{ borderRadius: 999 }} className="flex h-8 min-w-[120px] items-center justify-center overflow-hidden bg-black text-[13px] text-white shadow-glass">
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span key={view + label} className="flex items-center gap-2 px-3 whitespace-nowrap"
        initial={reduced ? false : { opacity: 0, filter: "blur(6px)", scale: 0.92 }}
        animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
        exit={reduced ? undefined : { opacity: 0, filter: "blur(6px)", scale: 0.92 }}
        transition={{ duration: 0.25 }}>
        <Content view={view} label={label} details={details} time={time} />
      </motion.span>
    </AnimatePresence>
  </motion.div>;
}

/** Bento "Now" tile: cycles open-to-work → role → local time every 3s while on screen. */
export function NowIsland(details: Details) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduced = useReducedMotion();
  const views: View[] = details.role ? ["open", "role", "time"] : ["open", "time"];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!inView || reduced) return;
    const id = setInterval(() => setIndex(current => (current + 1) % views.length), 3000);
    return () => clearInterval(id);
  }, [inView, reduced, views.length]);
  return <PauseOffscreen className="grid size-full place-items-center">
    <div ref={ref}><Pill view={views[index % views.length]} details={details} /></div>
  </PauseOffscreen>;
}

/** Fixed under the navbar; hidden until an event, then gone again after 2s. Also catches every /cv link click. */
export function GlobalIsland() {
  const [event, setEvent] = useState<IslandEvent | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const show = (next: IslandEvent) => {
      clearTimeout(timer);
      setEvent(next);
      timer = setTimeout(() => setEvent(null), 2000);
    };
    const onIsland = (e: Event) => show((e as CustomEvent<IslandEvent>).detail);
    const onClick = (e: MouseEvent) => { if ((e.target as Element | null)?.closest?.('a[href="/cv"]')) show({ kind: "download" }); };
    window.addEventListener("island", onIsland);
    document.addEventListener("click", onClick);
    return () => { clearTimeout(timer); window.removeEventListener("island", onIsland); document.removeEventListener("click", onClick); };
  }, []);
  return <div role="status" aria-live="polite" className="pointer-events-none fixed top-[72px] left-1/2 z-[85] -translate-x-1/2">
    <AnimatePresence>
      {event && <motion.div initial={{ opacity: 0, y: -8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.9 }} transition={morph}>
        <Pill view={event.kind} label={event.kind === "copied" ? event.label : ""} />
      </motion.div>}
    </AnimatePresence>
  </div>;
}
