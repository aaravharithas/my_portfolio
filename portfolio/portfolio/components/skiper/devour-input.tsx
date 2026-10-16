"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";
import { notifyIsland } from "@/components/skiper/dynamic-island";
import { contactError, CONTACT_LIMITS, type ContactField, type ContactMessage } from "@/lib/contact";
import { cn } from "@/lib/utils";

const STEPS: { field: ContactField; label: string; placeholder: string; type: string; autoComplete: string }[] = [
  { field: "email", label: "Your email", placeholder: "you@email.com", type: "email", autoComplete: "email" },
  { field: "name", label: "Your name", placeholder: "Your name", type: "text", autoComplete: "name" },
  { field: "message", label: "Your message", placeholder: "Say hi…", type: "text", autoComplete: "off" },
];

const LIFE = 0.9;
const SWEEP = 0.3;

/**
 * Draws the input's text onto the overlay canvas with the same font, samples it every 2px into
 * particles, then dissolves them right to left (each drifts right/up, shrinks and fades).
 */
function devour(input: HTMLInputElement, canvas: HTMLCanvasElement): Promise<void> {
  const style = getComputedStyle(input);
  const { width, height } = input.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.ceil(width * ratio);
  canvas.height = Math.ceil(height * ratio);
  const context = canvas.getContext("2d");
  if (!context) return Promise.resolve();
  context.scale(ratio, ratio);
  context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  if ("letterSpacing" in context) context.letterSpacing = style.letterSpacing;
  context.fillStyle = style.color;
  context.textBaseline = "middle";
  context.fillText(input.value, parseFloat(style.paddingLeft) - input.scrollLeft, height / 2);

  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  const stride = Math.max(1, Math.round(2 * ratio));
  const particles: { x: number; y: number; vx: number; vy: number; delay: number }[] = [];
  for (let py = 0; py < canvas.height; py += stride) {
    for (let px = 0; px < canvas.width; px += stride) {
      if (data[(py * canvas.width + px) * 4 + 3] > 128) particles.push({ x: px / ratio, y: py / ratio, vx: 20 + Math.random() * 50, vy: -(10 + Math.random() * 40), delay: 0 });
    }
  }
  const right = Math.max(1, ...particles.map(particle => particle.x));
  for (const particle of particles) particle.delay = (1 - particle.x / right) * SWEEP;

  return new Promise(resolve => {
    const start = performance.now();
    const frame = (now: number) => {
      const elapsed = (now - start) / 1000;
      context.clearRect(0, 0, width, height);
      let alive = false;
      for (const particle of particles) {
        const t = (elapsed - particle.delay) / LIFE;
        if (t >= 1) continue;
        alive = true;
        const life = Math.max(0, t);
        const size = 2 * (1 - life);
        context.globalAlpha = 1 - life;
        context.fillRect(particle.x + particle.vx * life * LIFE, particle.y + particle.vy * life * LIFE, size, size);
      }
      if (alive) requestAnimationFrame(frame);
      else { context.clearRect(0, 0, width, height); resolve(); }
    };
    requestAnimationFrame(frame);
  });
}

/** Email → name → message, one huge borderless input at a time; each answer is "devoured" on Enter. */
export function DevourInput() {
  const id = useId();
  const reduced = useReducedMotion();
  const [scope, animate] = useAnimate();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<ContactMessage>({ email: "", name: "", message: "" });
  const [value, setValue] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [eating, setEating] = useState(false);
  const [status, setStatus] = useState("");
  const [sentTo, setSentTo] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const current = STEPS[step];

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || !input.current) return;
    const problem = contactError(current.field, value);
    if (problem) {
      setStatus(problem);
      setInvalid(true);
      setTimeout(() => setInvalid(false), 1000);
      if (!reduced) animate(scope.current, { x: [0, -6, 6, -4, 4, 0] }, { duration: 0.3 });
      return;
    }
    const next = { ...values, [current.field]: value.trim() };
    setValues(next);
    setStatus("");
    setBusy(true);
    if (reduced || !canvas.current) await animate(input.current, { opacity: 0 }, { duration: 0.25 });
    else {
      setEating(true);
      await devour(input.current, canvas.current);
      setEating(false);
    }
    setValue("");
    if (input.current) input.current.style.opacity = "";

    if (step < STEPS.length - 1) {
      setStep(step + 1);
      setBusy(false);
      return;
    }
    setStatus("Sending…");
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...next, website: honeypot.current?.value ?? "" }),
    }).catch(() => null);
    if (!response?.ok) {
      const { error } = await response?.json().catch(() => ({})) ?? {};
      setValue(next.message);
      setStatus(error || "Couldn’t send right now. Please try again.");
      setBusy(false);
      return;
    }
    setStatus("Message sent.");
    notifyIsland({ kind: "sent" });
    setSentTo(next.name);
  }

  const big = "text-[32px] leading-none tracking-[-0.05em] md:text-[60px]";
  return <div className="mx-auto mt-[34px] w-full max-w-3xl">
    {sentTo ? <p className={cn(big, "py-3 text-foreground")}>
      {/* Real spaces between the word spans so the sentence reads correctly to screen readers. */}
      {`Thanks, ${sentTo} — I’ll reply soon.`.split(" ").map((word, index) => <span key={index}>{index > 0 && " "}<motion.span className="inline-block"
        initial={reduced ? false : { opacity: 0, y: 10, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5, delay: index * 0.08 }}>{word}</motion.span></span>)}
    </p> : <form ref={scope} onSubmit={submit} noValidate>
      <div className="flex items-center gap-4">
        <label htmlFor={id} className="sr-only">{current.label} (step {step + 1} of {STEPS.length})</label>
        <div className="relative min-w-0 flex-1">
          <motion.input key={step} ref={input} id={id} name={current.field} type={current.type} autoComplete={current.autoComplete}
            autoFocus={step > 0} spellCheck={false} autoCorrect="off" autoCapitalize="off" maxLength={CONTACT_LIMITS[current.field]} value={value} onChange={event => setValue(event.target.value)} readOnly={busy}
            placeholder={current.placeholder} aria-invalid={invalid || undefined} aria-describedby={`${id}-status`}
            initial={step > 0 && !reduced ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
            className={cn(big, "h-[1.3em] w-full bg-transparent py-0 text-foreground outline-none placeholder:text-white/30", eating && "text-transparent caret-transparent")} />
          <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />
        </div>
        <button type="submit" disabled={busy} aria-label={step < STEPS.length - 1 ? "Next" : "Send message"} className="grid h-10 w-[72px] shrink-0 place-items-end text-white/50 transition-colors hover:text-white">
          <AnimatePresence mode="wait" initial={false}>
            {value ? <motion.span key="hint" className="text-xs whitespace-nowrap" initial={{ opacity: 0, filter: "blur(4px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(4px)" }} transition={{ duration: 0.15 }}>[ enter ↵ ]</motion.span>
              : <motion.svg key="arrow" viewBox="0 0 48 12" className="h-3 w-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} aria-hidden="true">
                <path d="M0 6h46M41 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1" />
              </motion.svg>}
          </AnimatePresence>
        </button>
      </div>
      <div className={cn("mt-2 h-px w-full transition-colors duration-200", invalid ? "bg-red-500" : "bg-white/10")} />
      {/* Honeypot: invisible to people, tempting to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label>Website <input ref={honeypot} name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
    </form>}
    <p id={`${id}-status`} role="status" aria-live="polite" className="mt-3 min-h-4 text-xs text-white/50">{status}</p>
  </div>;
}
