"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useInView } from "motion/react";
import { ArrowUpRight, CodeXml } from "lucide-react";
import { PortfolioImage } from "@/components/portfolio-image";
import { NowIsland } from "@/components/skiper/dynamic-island";
import { HoverSkills } from "@/components/skiper/hover-skills";
import { HoverImageReveal } from "@/components/skiper/image-reveal";
import { StickerTrail } from "@/components/skiper/sticker-trail";
import { ToolboxWall } from "@/components/skiper/toolbox-wall";
import { TooltipToolbar, type ToolItem } from "@/components/skiper/tooltip-toolbar";
import { quickActions } from "@/components/skiper/vertical-dock";
import { fillBento, type Playground, type Slot } from "@/lib/bento";
import { compactRange } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { NavigationProfile, Portfolio } from "@/types/portfolio";

type Project = Portfolio["projects"][number];
type Props = { projects: Project[]; skills: Portfolio["skills"]; role: Portfolio["experience"][number] | null; profile: NavigationProfile; firstName: string };

// Literal class names so Tailwind generates them; areas are defined on .bento in globals.css.
const AREA: Record<Slot, string> = { a: "md:[grid-area:a]", b: "md:[grid-area:b]", c: "md:[grid-area:c]", d: "md:[grid-area:d]", e: "md:[grid-area:e]", f: "md:[grid-area:f]", g: "md:[grid-area:g]", h: "md:[grid-area:h]" };
const EXTRAS = ["Git", "VS Code", "Postgres", "Docker", "Linux"];
const interactive: ToolItem = { id: "interactive", label: "Interactive", icon: <span className="size-2 rounded-full bg-sky-500" /> };

function Card({ slot, label, href, badges, children }: { slot?: Slot; label: string; href?: string; badges?: ToolItem[]; children: ReactNode }) {
  return <article data-slot={slot} className={cn("group relative flex h-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-[20px] border border-muted bg-muted p-3 shadow-glass transition-colors hover:bg-muted2", slot && AREA[slot])}>
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

function ProjectTile({ project, slot }: { project: Project; slot?: Slot }) {
  const badges: ToolItem[] = [
    ...(project.link ? [{ id: "demo", label: "Live demo", href: project.link, icon: <ArrowUpRight size={16} aria-hidden="true" /> }] : []),
    ...(project.github ? [{ id: "code", label: "Source code", href: project.github, icon: <CodeXml size={16} aria-hidden="true" /> }] : []),
  ];
  return <Card slot={slot} label={project.title} href={project.link || undefined} badges={badges}>
    {/* Whole image (contain) over a blurred, darkened cover copy, so banners of any ratio show fully in every slot. */}
    <PortfolioImage src={project.image} alt="" sizes="(max-width: 767px) 95vw, 560px" className="scale-110 opacity-40 blur-2xl" />
    <PortfolioImage src={project.image} alt={`${project.title} preview`} sizes="(max-width: 767px) 95vw, 560px" className="object-contain transition-transform duration-700 group-hover:scale-[1.03]" />
    {project.video && <HoverVideo src={project.video} />}
  </Card>;
}

function PlaygroundTile({ kind, slot, props }: { kind: Playground; slot: Slot; props: Props }) {
  const { skills, role, profile, projects, firstName } = props;
  const company = role?.company.split(/\s+[-–—|]\s+/)[0] ?? "";
  switch (kind) {
    case "toolbox": {
      const seen = new Set<string>();
      const tools = [...skills.map(skill => skill.name), ...projects.flatMap(project => project.tech_stack), ...EXTRAS].filter(tool => !seen.has(tool.toLowerCase()) && seen.add(tool.toLowerCase()));
      return <Card slot={slot} label="Toolbox" badges={[interactive]}><ToolboxWall tools={tools} /></Card>;
    }
    case "stack":
      return <Card slot={slot} label="Stack" badges={[interactive]}><div className="grid size-full place-items-center px-4"><HoverSkills skills={skills} word={firstName} size="mini" /></div></Card>;
    case "now":
      return <Card slot={slot} label="Now" badges={[interactive]}><NowIsland role={role?.role} company={company.split(" ")[0]} location={role?.location.split(/[\s,]+/)[0] || "India"} /></Card>;
    case "photo":
      return <Card slot={slot} label="About" badges={[interactive]}><HoverImageReveal src={profile.profileImage} alt={profile.name} sizes="(max-width: 767px) 95vw, 280px" /></Card>;
    case "findme":
      return <Card slot={slot} label="Find me" badges={[interactive]}>
        <div className="grid size-full place-items-center">
          <TooltipToolbar label="Find me" items={quickActions(profile).filter(item => item.id !== "contact" && item.id !== "share")}
            className="flex items-center gap-1 rounded-full border border-white/10 bg-black px-2 py-1.5"
            itemClassName="grid size-9 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white" />
        </div>
      </Card>;
    case "stickers":
      return <Card slot={slot} label="Sticker trail" badges={[interactive]}><StickerTrail names={skills.map(skill => skill.name)} /></Card>;
    case "role":
      return <Card slot={slot} label="Current role">
        {role ? <div className="flex size-full flex-col justify-end gap-1 bg-gradient-to-br from-blue/15 via-transparent to-transparent p-6">
          <span className="mb-auto grid size-10 place-items-center rounded-full bg-blue text-sm font-semibold">{company[0]}</span>
          <p className="text-2xl font-semibold tracking-tight">{role.role}</p>
          <p className="text-foreground/60">{company} · {compactRange(role.startDate, role.endDate)}</p>
          {role.location && <p className="text-sm text-foreground/40">{role.location}</p>}
        </div> : <p className="grid size-full place-items-center text-sm text-foreground/40">Open to new roles</p>}
      </Card>;
    case "soon":
      return <Card slot={slot} label="Work"><p className="grid size-full place-items-center text-sm text-foreground/40">New work lands here soon.</p></Card>;
  }
}

export function BentoGrid(props: Props) {
  const { tiles, extra } = fillBento(props.projects);
  return <div className="bento mx-auto mt-[34px] grid w-full max-w-[1130px] grid-cols-1 gap-[10px] md:grid-cols-2 lg:grid-cols-4">
    {tiles.map(tile => "project" in tile
      ? <ProjectTile key={tile.slot} slot={tile.slot} project={tile.project} />
      : <PlaygroundTile key={tile.slot} slot={tile.slot} kind={tile.playground} props={props} />)}
    {extra.map((project, index) => <ProjectTile key={`extra-${index}`} project={project} />)}
  </div>;
}
