import { SectionHeading } from "@/components/section-heading";
import { HoverSkills } from "@/components/skiper/hover-skills";
import type { NavigationProfile, Portfolio } from "@/types/portfolio";

const Line = () => <svg aria-hidden="true" className="h-px w-full" fill="none"><line x1="0" y1="0.5" x2="100%" y2="0.5" stroke="white" strokeOpacity="0.1" strokeDasharray="3 2" /></svg>;

function Divider({ label }: { label?: string }) {
  return <div className="mx-auto flex h-3 w-full max-w-xl items-center gap-3"><Line />{label && <><p className="min-w-fit text-[10px] opacity-30">{label}</p><Line /></>}</div>;
}

type Contact = { label: string; value: string; href: string; external?: boolean };

// Label at rest, the actual value in a tooltip on hover / focus. Opacity sits on the label, not the
// link, so the tooltip stays fully opaque.
function ContactLink({ label, value, href, external }: Contact) {
  return <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} aria-label={`${label}: ${value}`}
    className="group/contact relative inline-flex rounded-md py-5">
    <span className="transition-opacity group-hover/contact:opacity-50 group-focus-visible/contact:opacity-50">{label}</span>
    <span aria-hidden="true" className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 rounded-md border border-border bg-muted3 px-2 py-0.5 font-mono text-[11px] font-normal tracking-normal whitespace-nowrap text-foreground opacity-0 transition-opacity group-hover/contact:opacity-100 group-focus-visible/contact:opacity-100">{value}</span>
  </a>;
}

export function Skills({ skills, firstName, profile }: { skills: Portfolio["skills"]; firstName: string; profile: NavigationProfile }) {
  const linkedin = profile.links.find(link => link.label === "LinkedIn")?.href;
  const contacts = [
    linkedin && { label: "LinkedIn", value: linkedin.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""), href: linkedin, external: true },
    profile.phone && { label: "Phone", value: profile.phone, href: `tel:${profile.phone.replace(/[^\d+]/g, "")}` },
    profile.email && { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  ].filter((contact): contact is Contact => !!contact);
  return <section id="skills" aria-labelledby="skills-heading">
    <SectionHeading id="skills-heading" title="The tools behind the work." />
    <div className="relative mt-[34px] w-full">
      {skills.length ? <>
        <Divider label="STACK" />
        <div className="mx-auto my-11 max-w-[1130px]"><HoverSkills skills={skills} word={firstName} /></div>
      </> : <p className="section-copy mx-auto text-center">The stack is being updated.</p>}
      {!!contacts.length && <>
        <Divider label="REACH ME" />
        <div className="my-11 flex flex-wrap items-center justify-center gap-x-8 text-xl font-medium tracking-tighter">
          {contacts.map(contact => <ContactLink key={contact.label} {...contact} />)}
        </div>
      </>}
    </div>
  </section>;
}
