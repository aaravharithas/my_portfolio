"use client";

import { motion, useReducedMotion } from "motion/react";

export function SectionHeading({ title, subtitle, id }: { title: string; subtitle?: string; id: string }) {
  const reduced = useReducedMotion();
  const words = title.split(" ");
  const shown = { opacity: 1, y: 0, filter: "blur(0px)" };
  return (
    <motion.div className="section-intro flex flex-col items-center gap-[8px] text-center" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
      <h2 id={id} aria-label={title} className="section-heading">
        {words.map((word, index) => <motion.span key={`${word}-${index}`} aria-hidden="true" className="reveal-word mr-[0.25em] inline-block" variants={{
          hidden: reduced ? shown : { opacity: 0, y: 10, filter: "blur(8px)" },
          visible: shown,
        }} transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : index * 0.08 }}>{word}</motion.span>)}
      </h2>
      {subtitle && <motion.p className="section-copy" variants={{ hidden: { opacity: reduced ? 1 : 0 }, visible: { opacity: 1 } }} transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : words.length * 0.08 }}>
        {subtitle}
      </motion.p>}
    </motion.div>
  );
}
