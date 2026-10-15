import "server-only";
import { cache } from "react";
import { normalizePortfolio } from "@/lib/portfolio-data";

export const PORTFOLIO_URL = "https://portfolioapi.pythonanywhere.com/portfolio/aaravharithas/";

export const getPortfolio = cache(async () => {
  const response = await fetch(PORTFOLIO_URL, {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error("Portfolio data is temporarily unavailable.");
  return normalizePortfolio(await response.json());
});
