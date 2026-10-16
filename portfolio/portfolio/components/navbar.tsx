"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Command as CommandIcon, CornerDownLeft, Download } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { notifyIsland } from "@/components/skiper/dynamic-island";
import { pages } from "@/lib/navigation";
import type { NavigationProfile } from "@/types/portfolio";

const itemClass = "rounded-lg py-2.5 data-[selected=true]:bg-muted2";

export function Navbar({ profile }: { profile: NavigationProfile }) {
  const [open, setOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = !!target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey) && !event.repeat) {
        event.preventDefault();
        setOpen(current => !current);
      } else if (event.key === "/" && !typing) {
        event.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopyStatus("Email copied to clipboard.");
      notifyIsland({ kind: "copied", label: "Email copied" });
    } catch {
      setCopyStatus("Copy failed. Check clipboard permission and try again.");
    }
  }

  function visit(href: string) {
    setOpen(false);
    window.open(href, "_blank", "noopener,noreferrer");
  }

  function downloadCV() {
    setOpen(false);
    const link = document.createElement("a");
    link.href = "/cv";
    link.download = "portfolio-cv.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <Dialog open={open} onOpenChange={value => { setOpen(value); setCopyStatus(""); }}>
      <div className="fixed top-0 left-1/2 z-[90] flex w-screen -translate-x-1/2 justify-center px-3 py-2 md:w-full md:max-w-3xl">
        <nav aria-label="Main navigation" className="flex w-full items-center justify-between rounded-2xl border border-muted2 bg-muted py-2.5 pr-2.5 pl-5 shadow-glass backdrop-blur-[12px]">
          <a href="#main" aria-label={`${profile.name}, back to top`} className="flex min-w-0 items-center gap-2 rounded-md">
            <span className="relative flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted3 text-[10px]" aria-hidden="true">
              {profile.profileImage && !imageFailed
                ? <Image src={profile.profileImage} alt="" fill preload sizes="24px" className="object-cover" onError={() => setImageFailed(true)} />
                : profile.name.split(/\s+/).map(word => word[0]).slice(0, 2).join("")}
            </span>
            <span className="truncate text-sm font-semibold">{profile.name}</span>
          </a>
          <div className="flex shrink-0 items-center gap-2">
            <div className="mr-2 hidden items-center gap-4 md:flex">
              {pages.map(page => <a key={page.href} href={page.href} className="text-[13px] opacity-50 transition-opacity hover:opacity-100">{page.label}</a>)}
            </div>
            <DialogTrigger asChild>
              <button ref={trigger} type="button" aria-label="Open navigation and commands" aria-keyshortcuts="Meta+K Control+K /" title="Open commands (⌘K / Ctrl+K)" className="icon-button">
                <CommandIcon size={16} aria-hidden="true" />
              </button>
            </DialogTrigger>
            {profile.cvLink ? (
              <a href="/cv" download aria-label="Download CV" title="Download CV" className="icon-button">
                <Download size={16} aria-hidden="true" />
              </a>
            ) : <button disabled aria-label="CV unavailable" className="icon-button"><Download size={16} aria-hidden="true" /></button>}
          </div>
        </nav>
      </div>
      <DialogContent
        showCloseButton={false}
        className="top-[70px] w-[calc(100%-1.5rem)] max-w-[744px] translate-y-0 gap-0 overflow-hidden rounded-2xl border-muted2 bg-muted p-0 shadow-glass backdrop-blur-[12px] sm:max-w-[744px]"
        onCloseAutoFocus={event => { event.preventDefault(); trigger.current?.focus(); }}
      >
        <DialogTitle className="sr-only">Portfolio commands</DialogTitle>
        <DialogDescription className="sr-only">Search pages and links. Use arrow keys to navigate and Enter to select.</DialogDescription>
        <Command className="rounded-none bg-transparent">
          <div className="p-2 pb-0"><CommandInput placeholder="Search Anything" /></div>
          <CommandList className="max-h-[min(420px,calc(100dvh-180px))] p-2">
            <CommandEmpty>No matching pages or links.</CommandEmpty>
            <CommandGroup heading="Pages">
              {pages.map(page => (
                <CommandItem key={page.href} value={`page ${page.label}`} className={itemClass} onSelect={() => {
                  setOpen(false);
                  window.location.hash = page.href;
                }}>
                  <ArrowRight aria-hidden="true" /><span>{page.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Links">
              {profile.links.map(link => <CommandItem key={link.label} value={link.label} className={itemClass} onSelect={() => visit(link.href)}>
                <ArrowRight aria-hidden="true" /><span>{link.label}</span>
              </CommandItem>)}
              {profile.cvLink && <CommandItem value="Download CV resume" className={itemClass} onSelect={downloadCV}><ArrowRight aria-hidden="true" /><span>Download CV</span></CommandItem>}
              {profile.email && <CommandItem value="Copy email contact" className={itemClass} onSelect={copyEmail}><ArrowRight aria-hidden="true" /><span>Copy email</span></CommandItem>}
            </CommandGroup>
          </CommandList>
          <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-foreground/50">
            <p role="status" aria-live="polite" className="flex items-center gap-1.5">{copyStatus || <><CornerDownLeft size={12} aria-hidden="true" />Go To Page</>}</p>
            <kbd className="rounded-md bg-muted3 px-1.5 font-mono text-[11px]">/</kbd>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
