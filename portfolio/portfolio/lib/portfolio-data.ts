import type { NavigationProfile, Portfolio, PublicPortfolio } from "@/types/portfolio";
import { safeUrl } from "./navigation.ts";
import { dateOrder } from "./dates.ts";

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const collection = (value: unknown) => Array.isArray(value) ? value.map(record) : [];

export function mediaUrl(value: unknown): string {
  const valid = safeUrl(value);
  if (!valid) return "";
  const url = new URL(valid);
  return url.protocol === "https:" && url.hostname === "portfolioapi.pythonanywhere.com" && url.pathname.startsWith("/media/") ? valid : "";
}

// Explicit projection keeps private API fields out of HTML and client props.
export function normalizePortfolio(input: unknown): PublicPortfolio {
  const data = record(input);
  if (!text(data.name)) throw new Error("Portfolio data is missing a name.");
  const social = record(data.social);
  const projects: Portfolio["projects"] = collection(data.projects).filter(item => text(item.title)).map(item => ({
    title: text(item.title), image: mediaUrl(item.image), video: mediaUrl(item.video), link: safeUrl(item.link) ?? "", github: safeUrl(item.github, true) ?? "",
    metadata: text(item.metadata), description: text(item.description),
    tech_stack: Array.isArray(item.tech_stack) ? [...new Set(item.tech_stack.map(text).filter(Boolean))] : [],
  }));
  const links: NavigationProfile["links"] = [];
  for (const [label, raw] of [["LinkedIn", social.linkedin], ["Instagram", social.instagram], ["GitHub", projects.find(project => project.github)?.github]] as const) {
    const href = safeUrl(raw, true);
    if (href) links.push({ label, href });
  }
  const email = text(data.email);
  const navigation: NavigationProfile = {
    name: text(data.name), username: text(data.username), profileImage: mediaUrl(data.profileImage), cvLink: mediaUrl(data.cvLink),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "", links,
  };
  return {
    navigation, firstName: text(data.firstName) || text(data.name), lastName: text(data.firstName) ? text(data.lastName) : "",
    title: text(data.title),
    // Temporary display correction; the backend/CMS still needs the source edit.
    aboutMe: text(data.aboutMe).replace(/\bmanily\b/gi, "mainly"),
    twitter: safeUrl(social.twitter, true) ?? "",
    projects,
    experience: collection(data.experience).filter(item => text(item.role)).map(item => ({
      startDate: text(item.startDate), endDate: text(item.endDate), role: text(item.role), company: text(item.company),
      location: text(item.location), description: text(item.description),
    })).sort((a, b) => dateOrder(b.startDate) - dateOrder(a.startDate)),
    education: collection(data.education).filter(item => text(item.degree)).map(item => ({
      startDate: text(item.startDate), endDate: text(item.endDate), degree: text(item.degree), institution: text(item.institution), description: text(item.description),
    })).sort((a, b) => (dateOrder(b.endDate) || dateOrder(b.startDate)) - (dateOrder(a.endDate) || dateOrder(a.startDate))),
    skills: collection(data.skills).filter(item => text(item.name) && typeof item.value === "number" && Number.isFinite(item.value)).map(item => ({
      name: text(item.name), value: Math.max(0, Math.min(100, item.value as number)), category: text(item.category) || null,
    })).sort((a, b) => b.value - a.value),
  };
}
