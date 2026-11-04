// Tile shapes for n projects on the Work grid: Skiper's mix of big squares, tall and wide rectangles
// and small squares, without ever leaving a hole. Each 2-row block of the 4-column grid holds either
// four projects (big 2×2, tall 1×2, two small 1×1) or three (big 2×2, two wide 2×1); the big tile
// alternates sides. Leftovers fill a final row: two wide tiles, or one full-width banner.
// Two projects get a big square beside a tall tile in a centred 3-column grid; one gets a big square.
export type TileSize = "solo" | "pair-big" | "pair-tall" | "big" | "big-right" | "tall" | "small" | "wide" | "banner";

export function projectTiles(count: number): TileSize[] {
  if (count === 1) return ["solo"];
  if (count === 2) return ["pair-big", "pair-tall"];
  const sizes: TileSize[] = [];
  let blocks = 0;
  const big = (): TileSize => (blocks++ % 2 ? "big-right" : "big");
  for (let i = 0; i < Math.floor(count / 4); i++) sizes.push(big(), "tall", "small", "small");
  const rest = count % 4;
  if (rest === 3) sizes.push(big(), "wide", "wide");
  if (rest === 2) sizes.push("wide", "wide");
  if (rest === 1) sizes.push("banner");
  return sizes;
}
