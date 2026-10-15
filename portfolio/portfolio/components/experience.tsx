"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, MapPin } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { compactRange } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { Portfolio } from "@/types/portfolio";

function ExperienceRow({ item }: { item: Portfolio["experience"][number] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const reduced = useReducedMotion();
  // "Corizo - Empowering Tomorrow's Leaders" → "Corizo"; the full name shows when expanded.
  const company = item.company.split(/\s+[-–—|]\s+/)[0] || item.role;
  const dates = compactRange(item.startDate, item.endDate);
  return <div>
    <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)} className={cn("flex w-full items-center gap-2 rounded-2xl px-4 py-2 text-left text-foreground/40 transition-colors hover:bg-muted hover:text-foreground", open && "bg-muted text-foreground")}>
      <span className="min-w-0 truncate">{company}</span>
      <span aria-hidden="true" className="h-0.5 min-w-8 flex-1 bg-foreground/10" />
      {dates && <span className="shrink-0">{dates}</span>}
      <ArrowUpRight size={14} aria-hidden="true" className={cn("shrink-0 transition-transform", open && "rotate-90")} />
    </button>
    <div id={id}>
      <AnimatePresence initial={false}>
        {open && <motion.div initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : 0.25 }} className="overflow-hidden">
          <div className="space-y-2 px-4 pt-1 pb-3 text-[15px] text-foreground/50">
            <p className="text-foreground/80">{[item.role, item.company].filter(Boolean).join(" @ ")}</p>
            {item.description && <p className="whitespace-pre-line">{item.description}</p>}
            {item.location && <p className="flex items-center gap-1.5"><MapPin size={14} aria-hidden="true" />{item.location}</p>}
          </div>
        </motion.div>}
      </AnimatePresence>
    </div>
  </div>;
}

export function Experience({ experience }: { experience: Portfolio["experience"] }) {
  return <section id="experience" aria-labelledby="experience-heading">
    <SectionHeading id="experience-heading" title="Learning by doing." subtitle="The teams, projects, and experiences that have shaped my work." />
    <div className="relative mx-auto mt-[94px] flex w-full max-w-lg flex-col gap-1 lg:mt-[125px]">
      {experience.length ? experience.map((item, index) => <ExperienceRow key={`${item.company}-${index}`} item={item} />) : <p className="section-copy text-center">Experience updates will appear here.</p>}
    </div>
  </section>;
}
