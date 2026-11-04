"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type IslandEvent = { kind: "copied"; label: string } | { kind: "download" } | { kind: "sent" };

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

const Check = () => <svg viewBox="0 0 16 16" className="size-4 text-green-400" aria-hidden="true">
  <motion.path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.15 }} />
</svg>;

const Progress = () => <svg viewBox="0 0 20 20" className="size-4 -rotate-90 text-sky-500" aria-hidden="true">
  <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
  <motion.circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: "easeInOut" }} />
</svg>;

function Content({ event }: { event: IslandEvent }) {
  switch (event.kind) {
    case "copied": return <><Check />{event.label}</>;
    case "download": return <><Progress />Downloading CV</>;
    case "sent": return <><Check />Message sent</>;
  }
}

function Pill({ event }: { event: IslandEvent }) {
  const reduced = useReducedMotion();
  return <motion.div layout transition={reduced ? { duration: 0 } : morph} style={{ borderRadius: 999 }} className="flex h-8 min-w-[120px] items-center justify-center overflow-hidden bg-black text-[13px] text-white shadow-glass">
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span key={event.kind + ("label" in event ? event.label : "")} className="flex items-center gap-2 px-3 whitespace-nowrap"
        initial={reduced ? false : { opacity: 0, filter: "blur(6px)", scale: 0.92 }}
        animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
        exit={reduced ? undefined : { opacity: 0, filter: "blur(6px)", scale: 0.92 }}
        transition={{ duration: 0.25 }}>
        <Content event={event} />
      </motion.span>
    </AnimatePresence>
  </motion.div>;
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
        <Pill event={event} />
      </motion.div>}
    </AnimatePresence>
  </div>;
}
