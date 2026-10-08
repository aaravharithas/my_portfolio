import { SiGithub, SiInstagram, SiLinkedin, SiX } from 'react-icons/si';
import { usePortfolio } from '../context/usePortfolio.js';
const networks = [['linkedin', 'LinkedIn', SiLinkedin], ['github', 'GitHub', SiGithub], ['instagram', 'Instagram', SiInstagram], ['twitter', 'X / Twitter', SiX]];
export default function SocialLinks() {
  const { portfolioData } = usePortfolio();
  return <div className="social-links">
    {networks.filter(([key]) => portfolioData.social?.[key]).map(([key, label, Icon]) =>
      <a key={key} href={portfolioData.social[key]} target="_blank" rel="noopener noreferrer" aria-label={label}><Icon aria-hidden="true" /></a>)}
  </div>;
}
