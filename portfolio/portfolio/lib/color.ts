// WCAG relative luminance and contrast, used to keep brand colours readable on the near-black page.
const rgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const linear = (value: number) => { const c = value / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const hex = (channels: number[]) => "#" + channels.map(v => Math.round(v).toString(16).padStart(2, "0")).join("");

export function luminance(color: string) {
  const [r, g, b] = rgb(color).map(linear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** The colour itself if it already reaches `min` contrast on `background`, else the least-lightened mix toward white that does. */
export function readableOn(color: string, background = "#080808", min = 4.5) {
  const channels = rgb(color);
  for (let step = 0; step <= 20; step++) {
    const mixed = hex(channels.map(v => v + (255 - v) * (step / 20)));
    if (contrast(mixed, background) >= min) return mixed;
  }
  return "#ffffff";
}
