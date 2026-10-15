"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Copy } from "lucide-react";

type HeroProps = { name: string; firstName: string; lastName: string; title: string; email: string; cvLink: string; rolls: number[] };

export function Hero({ name, firstName, lastName, title, email, cvLink, rolls }: HeroProps) {
  const reduced = useReducedMotion();
  const [status, setStatus] = useState("");
  let index = 0;

  async function copyEmail() {
    try { await navigator.clipboard.writeText(email); setStatus("Copied"); }
    catch { setStatus("Copy failed"); }
    setTimeout(() => setStatus(""), 1600);
  }

  return <header className="relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 text-center">
    <div aria-hidden="true" className="hero-bg pointer-events-none">
      <div className="hero-floor" />
      <div className="hb hb-navy" /><div className="hb hb-blue" /><div className="hb hb-deep" />
      <div className="hb hb-pocketL" /><div className="hb hb-pocketR" />
      <div className="hb hb-plume" /><div className="hb hb-core" />
    </div>
    <div className="relative z-10 mt-20 flex flex-col items-center">
      <p className="eyebrow">Hi, I’m</p>
      <h1 aria-label={name} className="display-name max-w-full">
        {[firstName, lastName].filter(Boolean).map((line, lineIndex) => <span key={lineIndex} className="block" aria-hidden="true">
          {Array.from(line).map((letter, letterIndex) => {
            const copies = rolls[index++] ?? 6;
            return <span key={letterIndex} className="inline-block h-[1em] overflow-hidden align-top">
              <motion.span className="letter-column flex flex-col" initial={{ y: "0em" }} animate={{ y: reduced ? "0em" : `-${copies - 1}em` }} transition={{ duration: reduced ? 0 : 1.2 + (copies - 6) / 20, ease: [0.65, 0, 0.35, 1] }}>
                {Array.from({ length: copies }, (_, copy) => <span key={copy} className="block h-[1em] shrink-0">{letter === " " ? " " : letter}</span>)}
              </motion.span>
            </span>;
          })}
        </span>)}
      </h1>
      <p className="eyebrow">{title}</p>
      <div className="mt-24 flex flex-col items-center gap-2 md:flex-row">
        {email && <button type="button" onClick={copyEmail} aria-label="Copy email address" className="flex h-12 cursor-pointer items-center gap-2 rounded-2xl bg-muted px-5 font-mono text-sm active:scale-[0.999]">
          <span>pip install {firstName.toLowerCase().replace(/\s+/g, "-")}<span className="opacity-40">/backend</span></span>
          {status ? <span className="text-xs opacity-60">{status}</span> : <Copy size={16} className="opacity-40" aria-hidden="true" />}
        </button>}
        {cvLink && <a href="/cv" download className="primary-button">Download CV</a>}
      </div>
    </div>
    <span role="status" className="sr-only">{status === "Copied" ? "Email copied." : status && "Copy failed. Please allow clipboard access and retry."}</span>
  </header>;
}
