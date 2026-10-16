import { randomInt } from "node:crypto";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { Projects } from "@/components/projects";
import { Experience } from "@/components/experience";
import { Skills } from "@/components/skills";
import { Education } from "@/components/education";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
import { GlobalIsland } from "@/components/skiper/dynamic-island";
import { VerticalDock } from "@/components/skiper/vertical-dock";
import { getPortfolio } from "@/lib/portfolio";

// The footer switches from CSS shapes to the 3D hand renders once both files exist.
const hands = ["left", "right"].every(side => existsSync(join(process.cwd(), "public", "footer", `hand-${side}.png`)));

export async function generateMetadata(): Promise<Metadata> {
  try {
    const profile = await getPortfolio();
    return { title: `${profile.navigation.name} — ${profile.title || "Portfolio"}`, description: profile.aboutMe || `The portfolio of ${profile.navigation.name}.` };
  } catch {
    return { title: "Portfolio | aaravharithas" };
  }
}

export default async function Home() {
  const profile = await getPortfolio();
  const { name, email, cvLink, profileImage } = profile.navigation;
  const rolls = Array.from(profile.firstName + profile.lastName, () => randomInt(6, 23));
  return <>
    <Navbar profile={profile.navigation} />
    <GlobalIsland />
    <VerticalDock profile={profile.navigation} />
    <main id="main" tabIndex={-1} className="outline-none">
      <Hero name={name} firstName={profile.firstName} lastName={profile.lastName} title={profile.title} email={email} cvLink={cvLink} rolls={rolls} />
      <div className="section-stack px-5 mt-[200px] md:mt-[300px]">
        <About name={name} aboutMe={profile.aboutMe} profileImage={profileImage} />
        <Projects projects={profile.projects} skills={profile.skills} role={profile.experience[0] ?? null} profile={profile.navigation} firstName={profile.firstName} />
        <Experience experience={profile.experience} />
        <Skills skills={profile.skills} cvLink={cvLink} firstName={profile.firstName} />
        <Education education={profile.education} cvLink={cvLink} />
        <Contact />
      </div>
    </main>
    <div className="mt-[200px] md:mt-[300px]"><Footer name={name} profileImage={profileImage} hands={hands} /></div>
  </>;
}
