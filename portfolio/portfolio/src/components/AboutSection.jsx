import { usePortfolio } from '../context/usePortfolio.js';
import { PortfolioImage, SectionHeading, Surface } from './ui.jsx';

export default function AboutSection() {
  const { portfolioData: data } = usePortfolio();
  const paragraphs = (data.aboutMe || `Hi, I'm ${data.name}.`).split(/\n+/).filter(Boolean);
  return <section id="about" className="section-shell section-space">
    <SectionHeading number="01" title="A little about me" />
    <Surface className="about-layout">
      <PortfolioImage src={data.profileImage} alt={`${data.name} portrait`} className="about-portrait" width="240" height="280" loading="lazy" />
      <div className="about-copy">
        <h3>{data.title}</h3>
        {paragraphs.map((paragraph, index) => <p className="muted" key={index}>{paragraph}</p>)}
        {data.address && <p className="location"><span className="status-dot" /> Based in {data.address}</p>}
      </div>
    </Surface>
  </section>;
}
