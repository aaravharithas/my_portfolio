import { SectionHeading } from "@/components/section-heading";
import { BentoGrid } from "@/components/skiper/bento-grid";
import type { Portfolio } from "@/types/portfolio";

export function Projects({ projects }: { projects: Portfolio["projects"] }) {
  return <section id="work" aria-labelledby="work-heading">
    <SectionHeading id="work-heading" title="Built with purpose." subtitle="A closer look at what I’ve been building." />
    {projects.length ? <BentoGrid projects={projects} /> : <p className="section-copy mx-auto mt-[34px] text-center">New work will appear here soon.</p>}
  </section>;
}
