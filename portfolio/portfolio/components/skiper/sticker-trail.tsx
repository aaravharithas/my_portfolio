"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { brandColor, inkFor, SkillIcon } from "@/components/skiper/skill-icon";

type Sticker = { id: number; x: number; y: number; name: string; rotate: number };

const SPACING = 40;
const MAX_ALIVE = 20;
const LIFETIME = 600;
const FADE = 400;
const HINT_DELAY = 1000;

/** Drops a logo sticker every 40px of mouse travel; each pops in, lingers 600ms, then fades out. Mouse only. */
export function StickerTrail({ names }: { names: string[] }) {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [idle, setIdle] = useState(true);
  const last = useRef<{ x: number; y: number } | null>(null);
  const nextId = useRef(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);
  // The hint comes back 1s after the last sticker has finished fading.
  useEffect(() => {
    if (stickers.length) return;
    const timer = setTimeout(() => setIdle(true), FADE + HINT_DELAY);
    return () => clearTimeout(timer);
  }, [stickers.length]);

  function onMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || !names.length) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    if (last.current && Math.hypot(x - last.current.x, y - last.current.y) < SPACING) return;
    last.current = { x, y };
    setIdle(false);
    const id = nextId.current++;
    setStickers(list => [...list.slice(-(MAX_ALIVE - 1)), { id, x, y, name: names[id % names.length], rotate: Math.random() * 30 - 15 }]);
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      setStickers(list => list.filter(sticker => sticker.id !== id));
    }, LIFETIME);
    timers.current.add(timer);
  }

  return <div className="relative size-full overflow-hidden" onPointerMove={onMove} onPointerLeave={() => { last.current = null; }}>
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 transition-opacity duration-300 ${idle && !stickers.length ? "opacity-100" : "opacity-0"}`}>
      <p className="text-[10px] tracking-widest text-white/40">MOVE YOUR MOUSE</p>
      <span className="h-8 w-px bg-white/20" />
    </div>
    <AnimatePresence>
      {stickers.map(sticker => {
        const color = brandColor(sticker.name);
        return <motion.div key={sticker.id} aria-hidden="true"
          className="pointer-events-none absolute grid size-16 place-items-center rounded-2xl border-[3px] border-white shadow-[0_8px_24px_rgba(0,0,0,.45)]"
          style={{ left: sticker.x - 32, top: sticker.y - 32, rotate: sticker.rotate, backgroundColor: color, color: inkFor(color) }}
          initial={{ scale: 0.4 }} animate={{ scale: 1, transition: { type: "spring", stiffness: 500, damping: 18 } }}
          exit={{ opacity: 0, scale: 0.8, transition: { duration: FADE / 1000 } }}>
          <SkillIcon name={sticker.name} className="size-8" />
        </motion.div>;
      })}
    </AnimatePresence>
  </div>;
}
