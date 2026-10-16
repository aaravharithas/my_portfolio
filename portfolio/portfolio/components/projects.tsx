import { SectionHeading } from "@/components/section-heading";
import { BentoGrid } from "@/components/skiper/bento-grid";
import type { NavigationProfile, Portfolio } from "@/types/portfolio";

export function Projects(props: { projects: Portfolio["projects"]; skills: Portfolio["skills"]; role: Portfolio["experience"][number] | null; profile: NavigationProfile; firstName: string }) {
  return <section id="work" aria-labelledby="work-heading">
    <SectionHeading id="work-heading" title="Built with purpose." subtitle="A closer look at what I’ve been building." />
    <BentoGrid {...props} />
  </section>;
}
