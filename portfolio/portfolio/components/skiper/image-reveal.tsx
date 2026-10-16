"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { PortfolioImage } from "@/components/portfolio-image";

type Props = { src: string; alt: string; sizes: string };

// Bottom layer: grainy monochrome version of the photo.
const Grainy = ({ src, alt, sizes }: Props) => <div className="absolute inset-0">
  <PortfolioImage src={src} alt={alt} sizes={sizes} className="brightness-90 contrast-125 grayscale" />
  <div aria-hidden="true" className="grain pointer-events-none absolute inset-0" />
</div>;

/** Colour photo revealed bottom-up over a grainy copy as the card scrolls into view. */
export function ScrollImageReveal(props: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const clipPath = useTransform(scrollYProgress, [0, 1], ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);
  return <div ref={ref} className="absolute inset-0">
    <Grainy {...props} />
    <motion.div className="absolute inset-0" style={reduced ? undefined : { clipPath, scale }}>
      <PortfolioImage src={props.src} alt="" sizes={props.sizes} />
    </motion.div>
  </div>;
}

/** Same layers, revealed on hover of the surrounding `group` (bento tile) over 400ms. Touch screens (no hover) just show the colour photo. */
export function HoverImageReveal(props: Props) {
  return <div className="absolute inset-0">
    <Grainy {...props} />
    <div className="absolute inset-0 scale-110 transition-[clip-path,scale] duration-400 ease-out [clip-path:inset(100%_0_0_0)] group-focus-within:scale-100 group-focus-within:[clip-path:inset(0)] group-hover:scale-100 group-hover:[clip-path:inset(0)] [@media(hover:none)]:scale-100 [@media(hover:none)]:[clip-path:inset(0)]">
      <PortfolioImage src={props.src} alt="" sizes={props.sizes} />
    </div>
  </div>;
}
