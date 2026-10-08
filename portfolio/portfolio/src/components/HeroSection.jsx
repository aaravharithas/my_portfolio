import { HiArrowDownRight, HiArrowUpRight } from 'react-icons/hi2';
import { usePortfolio } from '../context/usePortfolio.js';
import { useTheme } from '../context/useTheme.js';
import GlassProfile from './GlassProfile.jsx';
import { Badge, Button, PortfolioImage, Surface } from './ui.jsx';

export default function HeroSection() {
  const { portfolioData: data } = usePortfolio();
  const { designTheme } = useTheme();
  const firstName = data.firstName || data.name?.split(' ')[0] || '';
  const lastName = data.lastName || data.name?.split(' ').slice(1).join(' ') || '';
  const description = data.tagline || data.description || data.bio || data.aboutMe || '';
  return <section id="home" className="hero section-shell" aria-label="Introduction">
    <div className="hero-copy enter">
      <p className="eyebrow"><span className="status-dot" /> Hello, I’m</p>
      <h1>{firstName}<span className="accent-text">{lastName}</span></h1>
      <p className="hero-role">{data.title}</p>
      <p className="hero-description muted">{description}</p>
      <div className="button-row">
        <Button href="#projects" variant="primary">View my work <HiArrowUpRight aria-hidden="true" /></Button>
        <Button href="#contact">Let’s talk <HiArrowUpRight aria-hidden="true" /></Button>
      </div>
    </div>
    {designTheme !== 'glass' ? <Surface className="hero-profile" as="aside" aria-label="Profile">
      <PortfolioImage src={data.profileImage} alt={data.name} className="hero-portrait" width="280" height="280" />
      <Badge>{data.address || 'Building for the web'}</Badge>
      <p>{data.title}</p>
      <a className="text-link" href="#about">A little about me <HiArrowUpRight aria-hidden="true" /></a>
    </Surface> : <GlassProfile data={data} />}
    <a className="hero-scroll" href="#about"><HiArrowDownRight aria-hidden="true" /> Explore the portfolio</a>
  </section>;
}
