"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { LoopVideo } from "@/components/loop-video";
import { SectionHeading } from "@/components/section-heading";
import { yearRange } from "@/lib/dates";
import type { Portfolio } from "@/types/portfolio";

export function Education({ education }: { education: Portfolio["education"] }) {
  return <section id="education" aria-labelledby="education-heading">
    <SectionHeading id="education-heading" title="Always a student." />
    {/* Cards size to their content (no CV button any more); side by side they stretch to equal height. */}
    {education.length ? <div className="mx-auto mt-[34px] flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
      {/* As skiper-ui.com's pricing cards: each fades and rises in on view; the newest gets the loop video, rotated and scaled, as its glow. */}
      {education.map((item, index) => <motion.article key={`${item.degree}-${index}`} className="relative w-full overflow-hidden rounded-3xl bg-muted p-[30px]"
        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: index === 0 ? [0, -0.07, 0.11, 1] : [0, 0.5, 0.11, 1], delay: 0.1 + index * 0.2 }}>
        {index === 0 && <LoopVideo className="pointer-events-none absolute inset-0 size-full translate-y-22 -translate-x-14 rotate-45 scale-[1.8] object-cover" />}
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold">{item.degree}</h3>
            <p className="mt-2 text-[38px] leading-[38px] font-semibold tracking-tighter">{yearRange(item.startDate, item.endDate)}</p>
            {item.institution && <p className="mt-6 text-[15px]">{item.institution}</p>}
            {item.description && <ul className="mt-3 space-y-2">
              {item.description.split(/(?<=\.)\s+/).filter(Boolean).map(line => <li key={line} className="flex gap-2 text-[15px] leading-[21px]"><Check size={16} className="mt-0.5 shrink-0 opacity-50" aria-hidden="true" /><span className="opacity-50">{line}</span></li>)}
            </ul>}
          </div>
        </div>
      </motion.article>)}
    </div> : <p className="section-copy mx-auto mt-[34px] text-center">Education updates will appear here.</p>}
  </section>;
}
