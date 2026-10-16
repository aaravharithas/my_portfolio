"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { SkillIcon } from "@/components/skiper/skill-icon";
import { cn } from "@/lib/utils";
import type { Portfolio } from "@/types/portfolio";

type Skill = Portfolio["skills"][number];

const SIZES = { full: { thumb: 50, grown: 110, text: 240 }, mini: { thumb: 36, grown: 72, text: 96 } };
// Anton is ~0.5em per uppercase letter; cqw is the component's own width.
const fit = (text: string) => `${(100 / (Math.max(text.length, 4) * 0.5)).toFixed(1)}cqw`;

/**
 * Row of skill thumbnails over a huge Anton word. Hover / focus / tap a thumbnail to grow it and
 * swap the word for the skill name; a primary-coloured circle trails the mouse with the value.
 */
export function HoverSkills({ skills, word, size = "full" }: { skills: Skill[]; word: string; size?: "full" | "mini" }) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const [mouseOver, setMouseOver] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const followX = useSpring(x, { stiffness: 300, damping: 25 });
  const followY = useSpring(y, { stiffness: 300, damping: 25 });
  const { thumb, grown, text: maxText } = SIZES[size];
  const skill = active === null ? null : skills[active];
  const shown = (skill?.name ?? word).toUpperCase();
  // The word box keeps the default word's height and skill names never exceed it (long ones shrink to
  // fit), so swapping words never moves anything below. The thumbnail row is a fixed 120px for the same reason.
  const height = `min(${maxText}px, ${fit(word)})`;
  const fontSize = `min(${maxText}px, ${fit(word)}, ${fit(shown)})`;

  const pointer = (event: PointerEvent) => {
    const box = root.current?.getBoundingClientRect();
    return box ? [event.clientX - box.left, event.clientY - box.top] : null;
  };

  function track(event: PointerEvent<HTMLDivElement>) {
    const at = event.pointerType === "mouse" && pointer(event);
    if (!at) return;
    x.set(at[0]);
    y.set(at[1]);
  }

  // Entering the row puts the circle exactly at the pointer instead of springing in from its last
  // spot; only later moves are springy. Jump the source first (its change starts a spring), then the spring.
  function enterRow(event: PointerEvent<HTMLDivElement>) {
    const at = event.pointerType === "mouse" && pointer(event);
    if (!at) return;
    x.jump(at[0]);
    y.jump(at[1]);
    followX.jump(at[0]);
    followY.jump(at[1]);
    setMouseOver(true);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    const target = event.key === "Home" ? 0 : event.key === "End" ? skills.length - 1 : step === undefined ? null : ((active ?? -1) + step + skills.length) % skills.length;
    if (target === null) return;
    event.preventDefault();
    buttons.current[target]?.focus();
  }

  return <div ref={root} className="relative flex w-full flex-col items-center [container-type:inline-size]" onPointerMove={track}>
    <div role="toolbar" aria-label="Skills" className="relative z-10 flex h-[120px] flex-wrap content-center items-center justify-center gap-1.5 sm:gap-2" onKeyDown={onKeyDown}
      onPointerEnter={enterRow}
      onPointerLeave={event => { if (event.pointerType === "mouse") { setMouseOver(false); setActive(null); } }}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setActive(null); }}>
      {skills.map((item, index) => <motion.button key={item.name} ref={element => { buttons.current[index] = element; }} type="button" layout
        aria-label={`${item.name}, ${item.value}%`} aria-pressed={active === index} tabIndex={index === (active ?? 0) ? 0 : -1}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        style={{ width: active === index ? grown : thumb, height: active === index ? grown : thumb, borderRadius: 8 }}
        onPointerEnter={event => event.pointerType === "mouse" && setActive(index)}
        onFocus={() => setActive(index)} onClick={() => setActive(index)}
        className="grid shrink-0 place-items-center bg-muted3 p-[5px] text-foreground">
        <SkillIcon name={item.name} className="size-full max-h-[60%] max-w-[60%]" />
      </motion.button>)}
    </div>

    <div aria-hidden="true" className="relative mt-2 flex w-full items-center justify-center font-poster leading-none uppercase select-none" style={{ height, fontSize }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={shown} className={cn("flex whitespace-pre", skill ? "text-primary" : "text-foreground")}>
          {Array.from(shown).map((letter, index) => <motion.span key={index}
            initial={reduced ? false : { y: 20, opacity: 0, filter: "blur(6px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={reduced ? undefined : { y: -20, opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 0.3, delay: reduced ? 0 : index * 0.02 }}>{letter}</motion.span>)}
        </motion.span>
      </AnimatePresence>
    </div>

    <AnimatePresence>
      {mouseOver && skill && !reduced && <motion.div aria-hidden="true" style={{ x: followX, y: followY }}
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
        className="pointer-events-none absolute top-3 left-3 z-20 grid size-[120px] place-items-center rounded-full bg-primary text-sm font-medium text-black">
        ↗ {skill.value}%
      </motion.div>}
    </AnimatePresence>
  </div>;
}
