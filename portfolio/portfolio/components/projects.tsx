import { ArrowUpRight, CodeXml } from "lucide-react";
import { PortfolioImage } from "@/components/portfolio-image";
import { SectionHeading } from "@/components/section-heading";
import { projectLayout } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";
import type { Portfolio } from "@/types/portfolio";

const cornerButton = "flex size-8 items-center justify-center rounded-full bg-muted3/80 backdrop-blur-sm transition-transform active:scale-95";

export function Projects({ projects }: { projects: Portfolio["projects"] }) {
  const layout = projectLayout(projects.length);
  return <section id="work" aria-labelledby="work-heading">
    <SectionHeading id="work-heading" title="Built with purpose." subtitle="A closer look at what I’ve been building." />
    {projects.length ? <div data-project-layout={layout} className="mx-auto mt-[34px] grid w-full max-w-[1130px] grid-cols-1 gap-[10px] md:grid-cols-2 lg:grid-cols-4">
      {projects.map((project, index) => {
        const big = layout === "bento" && index % 5 === 0;
        const span = layout === "feature" ? "md:col-span-2 lg:col-span-2 lg:col-start-2" : layout === "pair" ? "lg:col-span-2" : big ? "lg:col-span-2 lg:row-span-2" : index % 5 === 3 ? "lg:col-span-2" : "";
        return <article key={`${project.title}-${index}`} className={cn("bento-card group min-w-0", span)}>
          <div className={cn("relative overflow-hidden rounded-2xl border border-muted3", layout === "feature" ? "aspect-[16/10]" : big ? "aspect-[4/3] lg:aspect-auto lg:flex-1" : "aspect-[4/3]")}>
            <PortfolioImage src={project.image} alt={`${project.title} preview`} sizes="(max-width: 767px) 95vw, (max-width: 1023px) 50vw, 560px" className="transition-transform duration-700 group-hover:scale-[1.03]" />
            {(project.metadata || project.description || project.tech_stack.length > 0) && <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pt-16 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100">
              {project.metadata && <p className="text-xs text-foreground/60">{project.metadata}</p>}
              {project.description && <p className="mt-1 line-clamp-2 max-w-xl text-sm text-foreground/85">{project.description}</p>}
              {!!project.tech_stack.length && <ul aria-label="Technology stack" className="mt-3 flex flex-wrap gap-1.5">{project.tech_stack.map(tech => <li key={tech} className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] text-foreground/80">{tech}</li>)}</ul>}
            </div>}
            <div className="absolute top-3 right-3 z-10 flex gap-2">
              {project.link && <a href={project.link} target="_blank" rel="noopener noreferrer" className={cornerButton} aria-label={`Visit ${project.title}`}><ArrowUpRight size={16} aria-hidden="true" /></a>}
              {project.github && <a href={project.github} target="_blank" rel="noopener noreferrer" className={cornerButton} aria-label={`View ${project.title} on GitHub`}><CodeXml size={16} aria-hidden="true" /></a>}
            </div>
          </div>
          <h3 className="pt-2 pl-2 font-medium">{project.title}</h3>
        </article>;
      })}
    </div> : <p className="section-copy mx-auto mt-[34px] text-center">New work will appear here soon.</p>}
  </section>;
}
