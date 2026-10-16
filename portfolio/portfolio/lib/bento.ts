// Bento slots in fill priority: projects take g first, then d, h, f, b, a, e, c.
// Rendering in this order also gives mobile (one column) the projects first.
export const SLOT_ORDER = ["g", "d", "h", "f", "b", "a", "e", "c"] as const;
export type Slot = (typeof SLOT_ORDER)[number];
export type Playground = "soon" | "role" | "stickers" | "findme" | "stack" | "photo" | "now" | "toolbox";

// What each slot shows when no project lands there. g only empties with zero projects.
const PLAYGROUND: Record<Slot, Playground> = { g: "soon", d: "role", h: "stickers", f: "findme", b: "stack", a: "photo", e: "now", c: "toolbox" };

export type BentoTile<P> = { slot: Slot; project: P } | { slot: Slot; playground: Playground };

/** Projects beyond the 8 slots come back as `extra` and render as plain tiles after the grid areas. */
export function fillBento<P>(projects: P[]): { tiles: BentoTile<P>[]; extra: P[] } {
  return {
    tiles: SLOT_ORDER.map((slot, index): BentoTile<P> => index < projects.length ? { slot, project: projects[index] } : { slot, playground: PLAYGROUND[slot] }),
    extra: projects.slice(SLOT_ORDER.length),
  };
}
