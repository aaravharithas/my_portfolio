import { Check } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { yearRange } from "@/lib/dates";
import type { Portfolio } from "@/types/portfolio";

export function Education({ education, cvLink }: { education: Portfolio["education"]; cvLink: string }) {
  return <section id="education" aria-labelledby="education-heading">
    <SectionHeading id="education-heading" title="Always a student." />
    {/* min-h instead of a fixed 464px so long descriptions grow the card instead of being clipped at ~640px widths. */}
    {education.length ? <div className="mx-auto mt-[34px] flex w-full max-w-2xl flex-col gap-3 sm:min-h-[464px] sm:flex-row">
      {education.map((item, index) => <article key={`${item.degree}-${index}`} className="relative w-full overflow-hidden rounded-3xl bg-muted p-[30px]">
        {index === 0 && <div aria-hidden="true" className="education-glow pointer-events-none absolute -inset-20" />}
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold">{item.degree}</h3>
            <p className="mt-2 text-[38px] leading-[38px] font-semibold tracking-tighter">{yearRange(item.startDate, item.endDate)}</p>
            {item.institution && <p className="mt-6 text-[15px]">{item.institution}</p>}
            {item.description && <ul className="mt-3 space-y-2">
              {item.description.split(/(?<=\.)\s+/).filter(Boolean).map(line => <li key={line} className="flex gap-2 text-[15px] leading-[21px]"><Check size={16} className="mt-0.5 shrink-0 opacity-50" aria-hidden="true" /><span className="opacity-50">{line}</span></li>)}
            </ul>}
          </div>
          {cvLink && <a href="/cv" download className="mt-20 block w-full rounded-xl bg-foreground py-2 text-center text-[15px] font-semibold text-background transition-opacity hover:opacity-90">Download CV</a>}
        </div>
      </article>)}
    </div> : <p className="section-copy mx-auto mt-[34px] text-center">Education updates will appear here.</p>}
  </section>;
}
