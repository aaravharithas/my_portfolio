const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function dateParts(value: string): { year: number; month: number; day: number } | null {
  const input = value.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  const plain = /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/.exec(input);
  const year = Number(iso?.[1] ?? plain?.[3]);
  const month = iso ? Number(iso[2]) - 1 : MONTHS.findIndex(item => item.toLowerCase() === plain?.[1].slice(0, 3).toLowerCase());
  const day = Number(iso?.[3] ?? plain?.[2]);
  if (!Number.isInteger(year) || year < 1000 || month < 0 || month > 11 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month, day));
  return date.getUTCDate() === day ? { year, month, day } : null;
}

// "2025 — Now", "Aug–Oct 2023", "2021 — 2024": short enough for one experience row.
export function compactRange(start: string, end: string): string {
  const from = dateParts(start);
  const present = /^present$/i.test(end.trim());
  const to = present ? null : dateParts(end);
  if (!from) return present ? "Now" : to ? String(to.year) : "";
  if (present) return `${from.year} — Now`;
  if (!to) return String(from.year);
  if (from.year !== to.year) return `${from.year} — ${to.year}`;
  return from.month === to.month ? `${MONTHS[from.month]} ${from.year}` : `${MONTHS[from.month]}–${MONTHS[to.month]} ${from.year}`;
}

export function yearRange(start: string, end: string): string {
  const startYear = dateParts(start)?.year;
  const endYear = /^present$/i.test(end.trim()) ? "Present" : dateParts(end)?.year;
  if (startYear === endYear) return String(startYear ?? "");
  return [startYear, endYear].filter(Boolean).join(" — ");
}

export function dateOrder(value: string): number {
  if (/^present$/i.test(value.trim())) return Number.MAX_SAFE_INTEGER;
  const parts = dateParts(value);
  return parts ? Date.UTC(parts.year, parts.month, parts.day) : 0;
}
