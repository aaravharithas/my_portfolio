export const pages = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
] as const;

export function safeUrl(value: unknown, requirePath = false): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return null;
    if (requirePath && !url.pathname.replaceAll("/", "").trim()) return null;
    return url.href;
  } catch {
    return null;
  }
}
