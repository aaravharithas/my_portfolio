"use client";

import { useEffect } from "react";
import { Command, Download, Link2, Mail } from "lucide-react";
import { FaGithub, FaInstagram, FaLinkedinIn } from "react-icons/fa6";
import { copyWithIsland } from "@/components/skiper/dynamic-island";
import { runItem, TooltipToolbar, type ToolItem } from "@/components/skiper/tooltip-toolbar";
import type { NavigationProfile } from "@/types/portfolio";

/** Opens the navbar's command palette (it listens for ⌘K / Ctrl+K on document). */
export const openPalette = () => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));

/** The site-wide quick actions; the dock shows some, the "Find me" tile others, shortcuts cover all. */
export function quickActions(profile: NavigationProfile) {
  const link = (label: string) => profile.links.find(item => item.label === label)?.href;
  const all: (ToolItem | false | undefined | "")[] = [
    { id: "contact", label: "Contact", keys: ["C"], icon: <Mail size={16} aria-hidden="true" />, onSelect: () => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }) },
    link("LinkedIn") && { id: "linkedin", label: "LinkedIn", keys: ["L"], icon: <FaLinkedinIn size={15} aria-hidden="true" />, href: link("LinkedIn") },
    link("GitHub") && { id: "github", label: "GitHub", keys: ["G"], icon: <FaGithub size={16} aria-hidden="true" />, href: link("GitHub") },
    link("Instagram") && { id: "instagram", label: "Instagram", keys: ["I"], icon: <FaInstagram size={16} aria-hidden="true" />, href: link("Instagram") },
    profile.email && { id: "email", label: "Copy email", keys: ["E"], icon: <Mail size={16} aria-hidden="true" />, onSelect: () => void copyWithIsland(profile.email, "Email copied") },
    profile.cvLink && { id: "cv", label: "Download CV", keys: ["D"], icon: <Download size={16} aria-hidden="true" />, href: "/cv", download: true },
    { id: "share", label: "Copy link", keys: ["S"], icon: <Link2 size={16} aria-hidden="true" />, onSelect: () => void copyWithIsland(location.href.split("#")[0], "Link copied") },
    { id: "menu", label: "Menu", keys: ["⌘", "K"], icon: <Command size={16} aria-hidden="true" />, onSelect: openPalette, dot: true },
  ];
  return all.filter((item): item is ToolItem => !!item);
}

const DOCK = ["contact", "linkedin", "github", "cv", "share", "menu"];

export function VerticalDock({ profile }: { profile: NavigationProfile }) {
  const actions = quickActions(profile);
  // Single-letter shortcuts for every quick action, ignored while typing or with modifiers held.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      const item = quickActions(profile).find(action => action.keys?.length === 1 && action.keys[0].toLowerCase() === event.key.toLowerCase());
      if (!item) return;
      event.preventDefault();
      runItem(item);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [profile]);
  return <div className="fixed top-1/2 right-4 z-[80] hidden -translate-y-1/2 xl:block">
    <TooltipToolbar side="left" label="Quick actions" items={actions.filter(item => DOCK.includes(item.id))}
      className="flex flex-col items-center gap-1 rounded-full border border-white/10 bg-black p-1.5 shadow-glass"
      itemClassName="grid size-9 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white" />
  </div>;
}
