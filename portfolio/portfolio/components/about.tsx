import { ScrollImageReveal } from "@/components/skiper/image-reveal";
import { SectionHeading } from "@/components/section-heading";

export function About({ name, aboutMe, profileImage }: { name: string; aboutMe: string; profileImage: string }) {
  return <section id="about" aria-labelledby="about-heading">
    <SectionHeading id="about-heading" title="About me" subtitle={aboutMe} />
    <figure className="bento-card mx-auto mt-[34px] w-full max-w-sm">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-muted3">
        <ScrollImageReveal src={profileImage} alt={name} sizes="(max-width: 640px) 90vw, 360px" />
      </div>
      <figcaption className="pt-2 pl-2 font-medium">{name}</figcaption>
    </figure>
  </section>;
}
