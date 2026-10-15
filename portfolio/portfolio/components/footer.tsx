"use client";

import { useRef, type RefObject } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
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

function Badge({ name, profileImage }: { name: string; profileImage: string }) {
  return <div className="relative size-[126px]">
    <svg viewBox="0 0 126 126" aria-hidden="true" className="absolute inset-0 size-full">
      <path d={SEAL} fill="var(--muted)" stroke="white" strokeOpacity="0.1" />
      <path d={STEMS} fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.6" />
      <g fill="currentColor" fillOpacity="0.35">{LEAVES.map(({ cx, cy, rotate }) => <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx="1.5" ry="3.6" transform={`rotate(${rotate} ${cx} ${cy})`} />)}</g>
    </svg>
    <svg viewBox="0 0 126 126" role="img" aria-label="Open to work" className="badge-ring absolute inset-0 size-full fill-foreground/60 font-mono text-[8px]">
      <defs><path id="badge-text-path" d="M 13,63 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0" /></defs>
      <text xmlSpace="preserve"><textPath href="#badge-text-path" textLength="314">OPEN TO WORK • LET’S BUILD • </textPath></text>
    </svg>
    <div className="absolute inset-[33px] [perspective:400px]">
      <div className="badge-flip relative size-full overflow-hidden rounded-full border border-muted3">
        <PortfolioImage src={profileImage} alt={name} sizes="60px" />
      </div>
    </div>
  </div>;
}

// Each half slides in from its screen edge toward the badge. The container is centred by the
// footer's items-center. From lg it shifts 40px right (below lg that would clip the left shape
// with a hard edge), so the left pad grows by 80px there to keep both shapes ~100px from the badge.
// The top-[38%] / 1/2 / 55% values line the shapes up with the badge centre at each breakpoint.
function FooterShapes({ target }: { target: RefObject<HTMLElement | null> }) {
  const { scrollYProgress } = useScroll({ target, offset: ["start end", "end end"] });
  const left = useTransform(scrollYProgress, [0, 1], ["-100%", "0%"]);
  const right = useTransform(scrollYProgress, [0, 1], ["100%", "0%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return <div aria-hidden="true" className="pointer-events-none absolute top-24 h-[500px] w-full max-w-[1300px] overflow-hidden sm:top-16 lg:top-8 lg:translate-x-10">
    <motion.div style={{ x: left, opacity }} className="absolute top-[38%] left-0 flex h-[330px] w-1/2 -translate-y-1/2 items-center justify-end pr-[100px] sm:top-1/2 lg:top-[55%] lg:pr-[140px]">
      <div className="relative origin-right scale-50 sm:scale-75 lg:scale-100">
        <div className="shape-capsule h-[120px] w-[260px] -rotate-[18deg]" />
        <div className="shape-orb absolute -top-16 left-6 size-16" />
      </div>
    </motion.div>
    <motion.div style={{ x: right, opacity }} className="absolute top-[38%] right-0 flex h-[330px] w-1/2 -translate-y-1/2 items-center justify-start pl-[100px] sm:top-1/2 lg:top-[55%] lg:pl-[60px]">
      <div className="relative origin-left scale-50 sm:scale-75 lg:scale-100">
        <div className="shape-ring size-[200px] rotate-12" />
        <div className="shape-orb absolute right-0 -bottom-6 size-12" />
      </div>
    </motion.div>
  </div>;
}

export function Footer({ name, profileImage }: { name: string; profileImage: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  return <footer ref={ref} id="contact" aria-labelledby="contact-heading" className="relative mb-3 flex min-h-[580px] flex-col items-center overflow-hidden px-5 pt-3.5 pb-2">
    {!reduced && <FooterShapes target={ref} />}
    <div className="relative z-10">
      <p className="mb-2.5 text-center text-[10px] leading-[15px] text-foreground/60">LET’S TALK</p>
      <SectionHeading id="contact-heading" title="Let’s build something together" />
    </div>
    {/* Puts the badge top ~205px below the (two-line) heading's top. */}
    <div className="relative z-10 mt-[129px] scale-75 sm:scale-[.85] lg:scale-100"><Badge name={name} profileImage={profileImage} /></div>
    <p className="mt-auto pt-10 text-sm text-foreground/50">Design and Developed by ©{name}</p>
  </footer>;
}
