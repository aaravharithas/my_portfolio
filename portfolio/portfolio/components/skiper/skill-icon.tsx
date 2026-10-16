import type { IconType } from "react-icons";
import { SiCplusplus, SiDjango, SiDocker, SiFastapi, SiFlask, SiGit, SiGo, SiGoogle, SiHtml5, SiJavascript, SiLinux, SiNodedotjs, SiPostgresql, SiPython, SiReact, SiTypescript } from "react-icons/si";
import { TbBrandVscode } from "react-icons/tb";
import { cn } from "@/lib/utils";

// Simple Icons logos (via react-icons) and brand colours, keyed by lowercase skill / tool name.
// Simple Icons dropped the VS Code logo, so that one comes from Tabler.
const ICONS: Record<string, [IconType, string]> = {
  python: [SiPython, "#3776AB"],
  javascript: [SiJavascript, "#F7DF1E"],
  typescript: [SiTypescript, "#3178C6"],
  django: [SiDjango, "#0C4B33"],
  drf: [SiDjango, "#A30000"],
  flask: [SiFlask, "#FFFFFF"],
  fastapi: [SiFastapi, "#009688"],
  "c++": [SiCplusplus, "#00599C"],
  go: [SiGo, "#00ADD8"],
  "node.js": [SiNodedotjs, "#5FA04E"],
  react: [SiReact, "#61DAFB"],
  "google adk": [SiGoogle, "#4285F4"],
  "html/css": [SiHtml5, "#E34F26"],
  git: [SiGit, "#F05032"],
  "vs code": [TbBrandVscode, "#007ACC"],
  postgres: [SiPostgresql, "#4169E1"],
  docker: [SiDocker, "#2496ED"],
  linux: [SiLinux, "#FCC624"],
};

export const brandColor = (name: string) => ICONS[name.toLowerCase()]?.[1] ?? "#232323";

/** Black or white, whichever reads better on the brand colour. */
export function inkFor(hex: string) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? "#000" : "#fff";
}

/** Logo for a skill, or its first two letters when there is no logo. */
export function SkillIcon({ name, className }: { name: string; className?: string }) {
  const entry = ICONS[name.toLowerCase()];
  if (!entry) return <span aria-hidden="true" className={cn("grid place-items-center text-[0.8em] font-bold uppercase", className)}>{name.replace(/[^a-z0-9]/gi, "").slice(0, 2)}</span>;
  const Icon = entry[0];
  return <Icon aria-hidden="true" className={className} />;
}
