import { SectionHeading } from "@/components/section-heading";
import { cn } from "@/lib/utils";
import type { Portfolio } from "@/types/portfolio";

type Skill = Portfolio["skills"][number];

const Line = () => <svg aria-hidden="true" className="h-px w-full" fill="none"><line x1="0" y1="0.5" x2="100%" y2="0.5" stroke="white" strokeOpacity="0.1" strokeDasharray="3 2" /></svg>;

function Divider({ label }: { label?: string }) {
  return <div className="mx-auto flex h-3 w-full max-w-xl items-center gap-3"><Line />{label && <><p className="min-w-fit text-[10px] opacity-30">{label}</p><Line /></>}</div>;
}

// Opacity sits on the name, not the wrapper, so the % tooltip stays fully opaque.
function SkillItem({ skill, nameClass, duplicate = false }: { skill: Skill; nameClass: string; duplicate?: boolean }) {
  return <span tabIndex={duplicate ? -1 : 0} className="group/skill relative inline-flex cursor-help rounded-md py-5">
    <span className={cn("transition-all", nameClass)}>{skill.name}</span>
    <span className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 rounded-md border border-border bg-muted3 px-2 py-0.5 font-mono text-[10px] font-normal tracking-normal text-foreground opacity-0 transition-opacity group-hover/skill:opacity-100 group-focus/skill:opacity-100">{skill.value}%</span>
  </span>;
}

export function Skills({ skills, cvLink }: { skills: Portfolio["skills"]; cvLink: string }) {
  const core = skills.filter(skill => skill.value >= 80);
  const rest = skills.filter(skill => skill.value < 80);
  return <section id="skills" aria-labelledby="skills-heading">
    <SectionHeading id="skills-heading" title="The tools behind the work." />
    <div className="relative mt-[34px] w-full">
      {!!core.length && <>
        <Divider label="CORE" />
        <div className="relative mx-auto my-11 max-w-4xl">
          <div className="group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]">
            {Array.from({ length: 4 }, (_, copy) => <div key={copy} aria-hidden={copy > 0 || undefined} className="marquee-group flex min-w-full shrink-0 animate-marquee items-center justify-around [gap:var(--gap)] group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused]">
              {core.map(skill => <span key={skill.name} className="mx-4 text-lg font-semibold tracking-tight"><SkillItem skill={skill} duplicate={copy > 0} nameClass="opacity-30 group-hover/skill:opacity-100 group-focus/skill:opacity-100" /></span>)}
            </div>)}
          </div>
          <div className="marquee-fade pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background" />
          <div className="marquee-fade pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background" />
        </div>
      </>}
      {!!rest.length && <>
        <Divider label="ALSO WORKS WITH" />
        <div className="my-11 flex flex-wrap items-center justify-center gap-x-8 text-xl font-medium tracking-tighter">
          {rest.map(skill => <SkillItem key={skill.name} skill={skill} nameClass="group-hover/skill:opacity-50" />)}
        </div>
      </>}
      {skills.length ? <>
        <Divider />
        <p className="mt-6 text-center text-sm text-foreground/50">Always learning{cvLink ? <> — <a href="/cv" download className="font-semibold text-foreground transition-opacity hover:opacity-70">see my CV →</a></> : "."}</p>
      </> : <p className="section-copy mx-auto text-center">The stack is being updated.</p>}
    </div>
  </section>;
}
