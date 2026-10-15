import { getPortfolio } from "@/lib/portfolio";

export async function GET() {
  try {
    const { navigation } = await getPortfolio();
    if (!navigation.cvLink) return new Response("CV unavailable.", { status: 404 });
    const url = new URL(navigation.cvLink);
    if (url.protocol !== "https:" || url.hostname !== "portfolioapi.pythonanywhere.com" || !url.pathname.startsWith("/media/")) {
      return new Response("CV unavailable.", { status: 404 });
    }
    const response = await fetch(url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(20000), redirect: "error" });
    if (!response.ok || !response.body) throw new Error("CV unavailable");
    return new Response(response.body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="portfolio-cv.pdf"',
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("The CV could not be downloaded. Please try again shortly.", { status: 502 });
  }
}
