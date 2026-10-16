import { parseContact } from "../../../lib/contact.ts";

const WINDOW_MS = 60_000;
const LIMIT = 3;
// ponytail: in-memory, so the limit is per server instance; move to a shared store (e.g. Vercel KV) if spam gets through.
const hits = new Map<string, number[]>();

function rateLimited(ip: string, now = Date.now()) {
  const recent = (hits.get(ip) ?? []).filter(time => now - time < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 1000) for (const [key, times] of hits) if (now - times[times.length - 1] >= WINDOW_MS) hits.delete(key);
  return recent.length > LIMIT;
}

export async function POST(request: Request) {
  // Vercel overwrites x-forwarded-for with the real client IP, so it can't be spoofed there.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
  if (rateLimited(ip)) return Response.json({ error: "Too many messages. Try again in a minute." }, { status: 429 });

  const body: unknown = await request.json().catch(() => null);
  // Honeypot: only bots fill the hidden "website" field. Pretend success so they don't retry.
  if (body && typeof body === "object" && (body as { website?: unknown }).website) return Response.json({ ok: true });
  const message = parseContact(body);
  if (!message) return Response.json({ error: "Please check the form and try again." }, { status: 400 });

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!key || !to) {
    console.warn("[contact] RESEND_API_KEY or CONTACT_TO_EMAIL is not set; message not sent.");
    return process.env.NODE_ENV === "production"
      ? Response.json({ error: "The contact form isn’t set up yet." }, { status: 503 })
      : Response.json({ ok: true, dev: true });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
      to: [to],
      reply_to: message.email,
      subject: `Portfolio message from ${message.name.replace(/\s+/g, " ")}`,
      text: `${message.message}\n\n— ${message.name} <${message.email}>`,
    }),
  }).catch(() => null);
  if (!response?.ok) {
    console.error("[contact] Resend request failed", response?.status);
    return Response.json({ error: "Couldn’t send right now. Please try again." }, { status: 502 });
  }
  return Response.json({ ok: true });
}
