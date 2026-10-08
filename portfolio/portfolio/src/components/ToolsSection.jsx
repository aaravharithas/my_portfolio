import { usePortfolio } from '../context/usePortfolio.js';
import { SectionHeading } from './ui.jsx';
import { SiPython, SiJavascript, SiReact, SiDjango, SiFlask, SiNodedotjs, SiTypescript, SiGit, SiDocker, SiPostgresql } from 'react-icons/si';
import { HiCodeBracket } from 'react-icons/hi2';

const icons = { python: SiPython, javascript: SiJavascript, react: SiReact, django: SiDjango,
  flask: SiFlask, 'node.js': SiNodedotjs, typescript: SiTypescript, git: SiGit, docker: SiDocker, postgresql: SiPostgresql };

export default function ToolsSection() {
  const { portfolioData } = usePortfolio();
  return <section id="tools" className="section-shell section-space">
    <SectionHeading number="03" title="Tools of the trade" />
    <div className="skills-layout">
      {portfolioData.skills.map((skill, index) => {
        const Icon = icons[skill.name?.toLowerCase()] || HiCodeBracket;
        return <div className="skill-tile" key={`${skill.name}-${index}`}><Icon aria-hidden="true" /><h3>{skill.name}</h3></div>;
      })}
    </div>
    {!portfolioData.skills.length && <p className="muted">No skills listed yet.</p>}
  </section>;
}
