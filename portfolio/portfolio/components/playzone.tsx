"use client";

import { SectionHeading } from "@/components/section-heading";
import { Card } from "@/components/skiper/bento-grid";
import { HoverImageReveal } from "@/components/skiper/image-reveal";
import { StickerTrail } from "@/components/skiper/sticker-trail";
import { ToolboxWall } from "@/components/skiper/toolbox-wall";
import type { ToolItem } from "@/components/skiper/tooltip-toolbar";
import type { Portfolio } from "@/types/portfolio";

const EXTRAS = ["Git", "VS Code", "Postgres", "Docker", "Linux"];
// The blue dot in each card's corner; its tooltip says how to play.
const how = (label: string): ToolItem[] => [{ id: "how", label, icon: <span className="size-2 rounded-full bg-sky-500" /> }];
// Same pill as the toolbox's "drag me", so every tile says how to play at a glance.
const Caption = ({ children, className = "" }: { children: string; className?: string }) =>
  <p aria-hidden="true" className={`pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] text-white/40 backdrop-blur ${className}`}>{children}</p>;

type Props = { skills: Portfolio["skills"]; projects: Portfolio["projects"]; name: string; profileImage: string };

/**
 * Interactive toys, kept out of the Work grid. On lg the three cards tile a 4×2 grid: a tall toolbox,
 * a big square sticker canvas and a tall photo. On md the toolbox spans two rows beside the other two;
 * on mobile they stack.
 */
export function Playzone({ skills, projects, name, profileImage }: Props) {
  const seen = new Set<string>();
  const tools = [...skills.map(skill => skill.name), ...projects.flatMap(project => project.tech_stack), ...EXTRAS]
    .filter(tool => !seen.has(tool.toLowerCase()) && seen.add(tool.toLowerCase()));
  return <section id="playzone" aria-labelledby="playzone-heading">
    <SectionHeading id="playzone-heading" title="Playzone." subtitle="Drag and hover around. Nothing here breaks." />
    <div className="mx-auto mt-[34px] grid w-full max-w-[1130px] auto-rows-[320px] grid-cols-1 gap-[10px] md:auto-rows-[300px] md:grid-cols-2 lg:grid-cols-4">
      <Card label="Toolbox" badges={how("Drag in any direction")} className="md:row-span-2"><ToolboxWall tools={tools} /></Card>
      <Card label="Sticker trail" badges={how("Move your mouse, or drag a finger sideways")} className="lg:col-span-2 lg:row-span-2"><StickerTrail names={skills.map(skill => skill.name)} /></Card>
      <Card label="Hover reveal" badges={how("Hover to bring the colour back")} className="lg:row-span-2"><HoverImageReveal src={profileImage} alt={name} sizes="(max-width: 767px) 95vw, 280px" /><Caption className="[@media(hover:none)]:hidden">hover me</Caption></Card>
    </div>
  </section>;
}
