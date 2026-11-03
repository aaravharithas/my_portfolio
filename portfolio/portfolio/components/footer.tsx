"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useAnimationControls } from "motion/react";
import { cn } from "@/lib/utils";
import { PortfolioImage } from "@/components/portfolio-image";
import { SectionHeading } from "@/components/section-heading";

// Badge geometry in a 126×126 viewBox, rounded so server and client markup match.
const round = (n: number) => Math.round(n * 100) / 100;
const polar = (r: number, deg: number) => [round(63 + r * Math.cos(deg * Math.PI / 180)), round(63 + r * Math.sin(deg * Math.PI / 180))];
const SEAL = Array.from({ length: 241 }, (_, i) => {
  const deg = i * 1.5;
  const [x, y] = polar(59.5 + 2.5 * Math.cos(deg * 24 * Math.PI / 180), deg);
  return `${i ? "L" : "M"}${x} ${y}`;
}).join("") + "Z";
const arc = (from: number, to: number) => { const [x1, y1] = polar(41, from); const [x2, y2] = polar(41, to); return `M${x1} ${y1}A41 41 0 0 ${to > from ? 1 : 0} ${x2} ${y2}`; };
const STEMS = arc(110, 228) + arc(70, -48);
// Leaf pairs climb the left side from the bottom, then mirror onto the right.
const LEAVES = [110, 124, 138, 152, 166, 180, 194, 208, 222]
  .flatMap(deg => [{ r: 44.5, deg, tilt: -35 }, { r: 37.5, deg: deg + 6, tilt: 35 }])
  .flatMap(leaf => [leaf, { ...leaf, deg: 180 - leaf.deg, tilt: -leaf.tilt }])
  .map(({ r, deg, tilt }) => { const [cx, cy] = polar(r, deg); return { cx, cy, rotate: deg + tilt }; });

// Static, like Skiper's badge: the only motion is the whole-badge flip in Footer (on view and on hover).
function Badge({ name, profileImage }: { name: string; profileImage: string }) {
  return <div className="relative size-[126px]">
    <svg viewBox="0 0 126 126" aria-hidden="true" className="absolute inset-0 size-full">
      <path d={SEAL} fill="var(--muted)" stroke="white" strokeOpacity="0.1" />
      <path d={STEMS} fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.6" />
      <g fill="currentColor" fillOpacity="0.35">{LEAVES.map(({ cx, cy, rotate }) => <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx="1.5" ry="3.6" transform={`rotate(${rotate} ${cx} ${cy})`} />)}</g>
    </svg>
    <svg viewBox="0 0 126 126" role="img" aria-label="Open to work" className="absolute inset-0 size-full fill-foreground/60 font-mono text-[8px]">
      <defs><path id="badge-text-path" d="M 13,63 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0" /></defs>
      <text xmlSpace="preserve"><textPath href="#badge-text-path" textLength="314">OPEN TO WORK • LET’S BUILD • </textPath></text>
    </svg>
    <div className="absolute inset-[33px] overflow-hidden rounded-full border border-muted3">
      <PortfolioImage src={profileImage} alt={name} sizes="60px" />
    </div>
  </div>;
}

const handEase = [0, 0.69, 0.5, 1] as const;
const handFrame = "pointer-events-none absolute top-24 h-[500px] w-full max-w-[1300px] overflow-hidden sm:top-16 lg:top-8";

/**
 * Layout and motion follow skiper-ui.com's footer: the badge and both hand frames share one 300px,
 * full-width row (the frames are positioned against it, which puts the fingertips beside the badge).
 * Each frame tips, scales and fades in whenever it comes into view; the badge flips in
 * (rotateY 180→360) and spins once more on hover. The hand PNGs are already light-on-transparent,
 * so on this dark theme they are shown unfiltered (Skiper's dark-mode --invert is invert(0)).
 */
export function Footer({ name, profileImage }: { name: string; profileImage: string }) {
  const badge = useAnimationControls();
  const spinning = useRef(false);
  async function spin() {
    if (spinning.current) return;
    spinning.current = true;
    // The entrance flip ends at 360°, so restart from the identical-looking 0° or the first hover spin
    // would be 360→360 and do nothing (as on skiper-ui.com).
    badge.set({ rotateY: 0 });
    await badge.start({ rotateY: 360, transition: { duration: 1, ease: "easeInOut" } });
    badge.set({ rotateY: 0 });
    spinning.current = false;
  }
  return <footer aria-labelledby="contact-heading" className="relative mb-3 flex flex-col items-center overflow-hidden px-5 pt-3.5">
    <div className="relative z-10">
      <p className="mb-2.5 text-center text-[10px] leading-[15px] text-foreground/60">LET’S TALK</p>
      <SectionHeading id="contact-heading" title="Let’s build something together" />
    </div>
    <div className="relative mt-[-30px] flex h-[300px] w-screen items-center justify-center gap-3 sm:mt-[34px]">
      <motion.div onMouseEnter={spin} animate={badge} initial={{ rotateY: 180 }} whileInView={{ rotateY: 360 }} transition={{ duration: 0.5, ease: "easeInOut" }}
        className="relative z-10 flex scale-75 items-center justify-center sm:scale-[.85] lg:scale-100">
        <Badge name={name} profileImage={profileImage} />
      </motion.div>
      <motion.div aria-hidden="true" initial={{ x: 10, opacity: 0.5, scale: 0.8, rotate: 10 }} whileInView={{ x: 20, opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1, ease: handEase }} className={cn(handFrame, "translate-x-10")}>
        <Image src="/footer/hand-right.png" alt="" width={704} height={376} sizes="(max-width: 1300px) 50vw, 650px" className="absolute right-0 h-auto w-1/2 select-none" />
        <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background" />
      </motion.div>
      <motion.div aria-hidden="true" initial={{ x: -10, opacity: 0.5, scale: 0.8, rotate: -10 }} whileInView={{ x: 0, opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1, ease: handEase }} className={cn(handFrame, "-translate-x-14")}>
        <Image src="/footer/hand-left.png" alt="" width={686} height={388} sizes="(max-width: 1300px) 50vw, 650px" className="absolute left-0 h-auto w-1/2 select-none" />
        <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background" />
      </motion.div>
    </div>
    <p className="mb-2 text-sm text-foreground/50 sm:mt-24">Design and Developed by ©{name}</p>
  </footer>;
}
