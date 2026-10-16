// Shared by the contact form (client) and /api/contact (server).
export type ContactField = "email" | "name" | "message";
export type ContactMessage = Record<ContactField, string>;

export const CONTACT_FIELDS: ContactField[] = ["email", "name", "message"];
export const CONTACT_LIMITS: Record<ContactField, number> = { email: 254, name: 100, message: 280 };

/** Empty string when valid, otherwise a short human-readable problem. */
export function contactError(field: ContactField, value: string): string {
  const text = value.trim();
  if (!text) return field === "email" ? "Enter your email." : field === "name" ? "Tell me your name." : "Write a short message.";
  if (text.length > CONTACT_LIMITS[field]) return `Keep it under ${CONTACT_LIMITS[field]} characters.`;
  if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return "That email doesn’t look right.";
  return "";
}

/** Trimmed message when every field is a valid string, otherwise null. */
export function parseContact(body: unknown): ContactMessage | null {
  if (!body || typeof body !== "object") return null;
  const data = body as Record<string, unknown>;
  const message = {} as ContactMessage;
  for (const field of CONTACT_FIELDS) {
    const value = data[field];
    if (typeof value !== "string" || contactError(field, value)) return null;
    message[field] = value.trim();
  }
  return message;
}
