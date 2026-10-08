import { useEffect, useState } from 'react';
import { usePortfolio } from '../context/usePortfolio.js';
import ThemeControls from './ThemeControls.jsx';

const links = [
  ['about', 'About'], ['education-experience', 'Journey'], ['tools', 'Skills'],
  ['projects', 'Projects'], ['contact', 'Contact'],
];

export default function Navbar() {
  const { portfolioData } = usePortfolio();
  const [activeId, setActiveId] = useState('home');
  const initials = (portfolioData.name || 'Portfolio').split(/\s+/).slice(0, 2).map((part) => part[0]).join('');
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (visible.length) setActiveId(visible[visible.length - 1].target.id);
    }, { rootMargin: '-15% 0px -55% 0px' });
    ['home', ...links.map(([id]) => id)].forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  return <header className="site-header">
    <div className="nav-bar surface">
      <a className="brand" href="#home" aria-label={`${portfolioData.name}, home`}>
        <span className="brand-mark">{initials}<span>.</span></span>
      </a>
      <nav className="section-nav" aria-label="Main navigation">
        {links.map(([id, label]) => <a key={id} href={`#${id}`}
          aria-current={activeId === id ? 'location' : undefined}>{label}</a>)}
      </nav>
      <ThemeControls />
    </div>
  </header>;
}
