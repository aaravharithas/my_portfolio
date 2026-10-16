"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { PauseOffscreen } from "@/components/pause-offscreen";
import { SkillIcon } from "@/components/skiper/skill-icon";
import { cn } from "@/lib/utils";

// One 6×7 pattern of 96px cells, drawn 3×3. The pan offset is wrapped into one pattern size and the
// idle drift (a CSS animation, so it runs on the compositor) moves up to one more, so together they
// never run past the 3×3 edge. 576×672 covers every tile size the bento uses (widest ~550, tallest ~600).
const CELL = 96;
const COLS = 6;
const ROWS = 7;
const WIDTH = COLS * CELL;
const HEIGHT = ROWS * CELL;
const wrap = (value: number, size: number) => ((value % size) + size) % size - size;

export function ToolboxWall({ tools }: { tools: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const panX = useMotionValue(0);
  const panY = useMotionValue(0);
  const x = useTransform(panX, value => wrap(value, WIDTH));
  const y = useTransform(panY, value => wrap(value, HEIGHT));
  const drag = useRef<{ x: number; y: number; time: number; vx: number; vy: number } | null>(null);
  const coast = useRef({ x: 0, y: 0 });
  const [grabbing, setGrabbing] = useState(false);

  // After a drag the wall coasts with exponential decay (velocity × e^(−t/325ms), like Motion's inertia).
  useAnimationFrame((_, delta) => {
    const velocity = coast.current;
    if (drag.current || Math.abs(velocity.x) + Math.abs(velocity.y) <= 5) return;
    panX.set(panX.get() + velocity.x * delta / 1000);
    panY.set(panY.get() + velocity.y * delta / 1000);
    const decay = Math.exp(-delta / 325);
    velocity.x *= decay;
    velocity.y *= decay;
  });

  // Horizontal wheel / trackpad swipes pan; vertical wheel is left to page scrolling.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      coast.current = { x: 0, y: 0 };
      panX.set(panX.get() - event.deltaX);
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [panX]);

  function start(event: PointerEvent<HTMLDivElement>) {
    coast.current = { x: 0, y: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, time: event.timeStamp, vx: 0, vy: 0 };
    setGrabbing(true);
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    const last = drag.current;
    if (!last) return;
    const dx = event.clientX - last.x;
    const dy = event.clientY - last.y;
    const dt = Math.max(1, event.timeStamp - last.time) / 1000;
    panX.set(panX.get() + dx);
    panY.set(panY.get() + dy);
    drag.current = { x: event.clientX, y: event.clientY, time: event.timeStamp, vx: dx / dt, vy: dy / dt };
  }
  function end() {
    const last = drag.current;
    drag.current = null;
    setGrabbing(false);
    if (last && !reduced) coast.current = { x: last.vx, y: last.vy };
  }

  return <PauseOffscreen className="size-full">
    <div ref={ref} role="img" aria-label={`Tools I use: ${tools.join(", ")}`}
      className={cn("relative size-full touch-pan-y overflow-hidden select-none", grabbing ? "cursor-grabbing" : "cursor-grab")}
      onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
      <motion.div style={{ x, y }} className="absolute top-0 left-0 will-change-transform">
        <div className="toolbox-drift grid" style={{ gridTemplateColumns: `repeat(${COLS * 3}, ${CELL}px)` }}>
          {Array.from({ length: COLS * ROWS * 9 }, (_, cell) => {
            const col = (cell % (COLS * 3)) % COLS;
            const row = Math.floor(cell / (COLS * 3)) % ROWS;
            const tool = tools[(col + row * 3) % tools.length];
            return <div key={cell} className="grid size-24 place-items-center">
              <div style={{ rotate: `${((col * 7 + row * 13) % 13) - 6}deg` }} className="grid size-12 place-items-center rounded-xl border border-white/5 bg-muted3 p-2.5 text-foreground/80">
                <SkillIcon name={tool} className="size-full" />
              </div>
            </div>;
          })}
        </div>
      </motion.div>
      <p className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] text-white/40 backdrop-blur">drag me</p>
    </div>
  </PauseOffscreen>;
}
