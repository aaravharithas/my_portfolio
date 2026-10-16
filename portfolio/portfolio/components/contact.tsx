import { SectionHeading } from "@/components/section-heading";
import { DevourInput } from "@/components/skiper/devour-input";

export function Contact() {
  return <section id="contact" aria-labelledby="contact-form-heading">
    <SectionHeading id="contact-form-heading" title="Get in touch." subtitle="Email, name, a short note. Press Enter after each." />
    <DevourInput />
  </section>;
}
