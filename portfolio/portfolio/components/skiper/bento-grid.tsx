"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useInView } from "motion/react";
import { ArrowUpRight, CodeXml } from "lucide-react";
import { PortfolioImage } from "@/components/portfolio-image";
import { TooltipToolbar, type ToolItem } from "@/components/skiper/tooltip-toolbar";
import { projectTiles, type TileSize } from "@/lib/bento";
import { cn } from "@/lib/utils";
import type { Portfolio } from "@/types/portfolio";

type Project = Portfolio["projects"][number];

// Literal class names so Tailwind generates them. Rows come from .bento in globals.css; the grid's
// dense flow fills the cells beside a right-hand 2×2 tile. On md (2 columns) a big tile spans the row
// and a tall tile spans two rows beside the small ones; on mobile every tile is one cell.
const SIZE: Record<TileSize, string> = {
  solo: "md:col-span-2 md:row-span-2 lg:col-span-2 lg:col-start-2 lg:row-span-2",
  "pair-big": "md:row-span-2 lg:col-span-2 lg:row-span-2",
  "pair-tall": "md:row-span-2 lg:row-span-2",
  big: "md:col-span-2 lg:col-span-2 lg:row-span-2",
  "big-right": "md:col-span-2 lg:col-span-2 lg:col-start-3 lg:row-span-2",
  tall: "md:row-span-2 lg:row-span-2",
  small: "",
  wide: "lg:col-span-2",
  banner: "md:col-span-2 lg:col-span-4",
};

/** Skiper's card shell: media on top, label below, tooltip badges in the top-right corner. Shared with the Playzone. */
export function Card({ label, href, badges, className, children }: { label: string; href?: string; badges?: ToolItem[]; className?: string; children: ReactNode }) {
  return <article className={cn("group relative flex h-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-[20px] border border-muted bg-muted p-3 shadow-glass transition-colors hover:bg-muted2", className)}>
    {href && <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label}, live demo`} className="absolute inset-0 z-[1] rounded-[20px]" />}
    <div className="relative w-full flex-1 overflow-hidden rounded-2xl border border-muted3">{children}</div>
    <h3 className="pt-2 pl-2 font-medium">{label}</h3>
    {!!badges?.length && <TooltipToolbar side="left" items={badges} label={`${label} links`} className="absolute top-5 right-5 z-10 flex gap-1.5"
      itemClassName="grid size-6 place-items-center rounded-full bg-[#121212] text-sky-500" />}
  </article>;
}

/** Plays only while its card is hovered (mouse) or, on touch screens, while in view. */
function HoverVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const [hovered, setHovered] = useState(false);
  // The card's full-size link sits above the media, so listen on the card itself.
  useEffect(() => {
    const card = ref.current?.closest("article");
    if (!card) return;
    const enter = () => setHovered(true);
    const leave = () => setHovered(false);
    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointerleave", leave);
    return () => { card.removeEventListener("pointerenter", enter); card.removeEventListener("pointerleave", leave); };
  }, []);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (hovered || (inView && matchMedia("(hover: none)").matches)) video.play().catch(() => {});
    else video.pause();
  }, [hovered, inView]);
  return <video ref={ref} src={src} muted loop playsInline preload="none" aria-hidden="true" className="absolute inset-0 size-full object-cover" />;
}

function ProjectTile({ project, className }: { project: Project; className: string }) {
  const badges: ToolItem[] = [
    ...(project.link ? [{ id: "demo", label: "Live demo", href: project.link, icon: <ArrowUpRight size={16} aria-hidden="true" /> }] : []),
    ...(project.github ? [{ id: "code", label: "Source code", href: project.github, icon: <CodeXml size={16} aria-hidden="true" /> }] : []),
  ];
  return <Card label={project.title} href={project.link || undefined} badges={badges} className={className}>
    {/* Whole image (contain) over a blurred, darkened cover copy, so banners of any ratio show fully in every tile. */}
    <PortfolioImage src={project.image} alt="" sizes="(max-width: 767px) 95vw, 560px" className="scale-110 opacity-40 blur-2xl" />
    <PortfolioImage src={project.image} alt={`${project.title} preview`} sizes="(max-width: 767px) 95vw, 560px" className="object-contain transition-transform duration-700 group-hover:scale-[1.03]" />
    {project.video && <HoverVideo src={project.video} />}
    {/* Details on hover / keyboard focus; always shown on touch screens, which can't hover. */}
    {(project.metadata || project.description || project.tech_stack.length > 0) && <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pt-16 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
      {project.metadata && <p className="text-xs text-foreground/60">{project.metadata}</p>}
      {project.description && <p className="mt-1 line-clamp-2 max-w-xl text-sm text-foreground/85">{project.description}</p>}
      {!!project.tech_stack.length && <ul aria-label="Technology stack" className="mt-3 flex flex-wrap gap-1.5">{project.tech_stack.map(tech => <li key={tech} className="rounded-[6px] bg-white/10 px-2 py-0.5 text-[11px] text-foreground/80">{tech}</li>)}</ul>}
    </div>}
  </Card>;
}

/** Projects only, in Skiper's card grid; tile sizes adapt to the count (see lib/bento.ts). */
export function BentoGrid({ projects }: { projects: Project[] }) {
  const sizes = projectTiles(projects.length);
  // Two projects use a centred 3-column grid (big square + tall), so it is 3/4 of the usual width.
  return <div className={cn("bento mx-auto mt-[34px] grid w-full grid-cols-1 gap-[10px] md:grid-cols-2 lg:grid-flow-row-dense", projects.length === 2 ? "max-w-[845px] lg:grid-cols-3" : "max-w-[1130px] lg:grid-cols-4")}>
    {projects.map((project, index) => <ProjectTile key={`${project.title}-${index}`} project={project} className={SIZE[sizes[index]]} />)}
  </div>;
}
