"use client";

import { useEffect, useRef, useState, type FocusEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

export type ToolItem = {
  id: string;
  label: string;
  icon: ReactNode;
  keys?: string[];
  href?: string;
  download?: boolean;
  onSelect?: () => void;
  dot?: boolean;
};

const spring = { type: "spring", stiffness: 500, damping: 35 } as const;

/** Runs an item exactly like clicking it: links open (or download), buttons fire. */
export function runItem(item: ToolItem) {
  if (item.onSelect) return item.onSelect();
  if (!item.href) return;
  const link = document.createElement("a");
  link.href = item.href;
  if (item.download) link.download = "";
  else { link.target = "_blank"; link.rel = "noopener noreferrer"; }
  document.body.append(link);
  link.click();
  link.remove();
}

type Anchor = { index: number; x: number; y: number };

// One tooltip shared by every item. The first show waits 300ms; moving to another item while it is
// open is instant (it slides there); leaving hides it after 100ms.
function useSharedTooltip(side: "top" | "left") {
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const open = useRef(false);
  useEffect(() => () => clearTimeout(timer.current), []);
  const place = (index: number, element: HTMLElement): Anchor => side === "top"
    ? { index, x: element.offsetLeft + element.offsetWidth / 2, y: element.offsetTop }
    : { index, x: element.offsetLeft, y: element.offsetTop + element.offsetHeight / 2 };
  return {
    anchor,
    show(index: number, element: HTMLElement) {
      clearTimeout(timer.current);
      if (open.current) return setAnchor(place(index, element));
      timer.current = setTimeout(() => { open.current = true; setAnchor(place(index, element)); }, 300);
    },
    hide() {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => { open.current = false; setAnchor(null); }, 100);
    },
  };
}

function Control({ item, className, onShow }: { item: ToolItem; className?: string; onShow: (element: HTMLElement) => void }) {
  const props = {
    "aria-label": item.label,
    "aria-keyshortcuts": item.keys?.length === 1 ? item.keys[0] : undefined,
    className: cn("relative outline-offset-2", className),
    onMouseEnter: (event: { currentTarget: HTMLElement }) => onShow(event.currentTarget),
    onFocus: (event: { currentTarget: HTMLElement }) => onShow(event.currentTarget),
  };
  const content = <>{item.icon}{item.dot && <span aria-hidden="true" className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-sky-500" />}</>;
  if (item.href) return <a href={item.href} download={item.download || undefined} target={item.download ? undefined : "_blank"} rel="noopener noreferrer" {...props}>{content}</a>;
  if (item.onSelect) return <button type="button" onClick={item.onSelect} {...props}>{content}</button>;
  return <span role="img" {...props}>{content}</span>;
}

/**
 * Pill of icon controls with a Vercel-style tooltip. `side="top"` puts it above (horizontal bars),
 * `side="left"` to the left (vertical dock, card badges). The container must not clip overflow.
 */
export function TooltipToolbar({ items, side = "top", label, className, itemClassName }: { items: ToolItem[]; side?: "top" | "left"; label?: string; className?: string; itemClassName?: string }) {
  const tip = useSharedTooltip(side);
  const active = tip.anchor ? items[tip.anchor.index] : null;
  const onBlur = (event: FocusEvent<HTMLDivElement>) => { if (!event.currentTarget.contains(event.relatedTarget)) tip.hide(); };
  return <div role="toolbar" aria-label={label} aria-orientation={side === "left" && items.length > 1 ? "vertical" : "horizontal"} className={cn("relative", className)} onMouseLeave={tip.hide} onBlur={onBlur}>
    {items.map((item, index) => <Control key={item.id} item={item} className={itemClassName} onShow={element => tip.show(index, element)} />)}
    <AnimatePresence>
      {tip.anchor && active && <motion.div key="tip" aria-hidden="true" className="pointer-events-none absolute top-0 left-0 z-30"
        initial={{ opacity: 0, scale: 0.94, x: tip.anchor.x, y: tip.anchor.y }}
        animate={{ opacity: 1, scale: 1, x: tip.anchor.x, y: tip.anchor.y }}
        exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.12 } }}
        transition={spring}>
        {/* A zero-size flex box centres the bubble on the anchor point without transforms that would fight `layout`. */}
        <div className={cn("absolute flex", side === "top" ? "bottom-2 left-0 w-0 justify-center" : "top-0 right-2 h-0 items-center")}>
          <motion.div layout transition={spring} style={{ borderRadius: 8 }} className="flex items-center gap-2 border border-white/10 bg-black px-2.5 py-1.5 text-sm whitespace-nowrap text-white">
            <motion.span layout="position" className="flex items-center gap-2">
              {active.label}
              {active.keys?.map(key => <kbd key={key} className="grid h-5 min-w-5 place-items-center rounded-[6px] border border-white/20 px-1 font-sans text-[11px]">{key}</kbd>)}
            </motion.span>
          </motion.div>
        </div>
      </motion.div>}
    </AnimatePresence>
  </div>;
}
