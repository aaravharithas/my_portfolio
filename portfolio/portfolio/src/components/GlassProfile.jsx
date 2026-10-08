import { HiArrowUpRight, HiCodeBracket, HiMapPin } from 'react-icons/hi2';

export default function GlassProfile({ data }) {
  const initials = data.name?.split(/\s+/).slice(0, 2).map((word) => word[0]).join('') || 'P';
  return <aside className="glass-scene" aria-label="Profile at a glance">
    <div className="glass-orb" aria-hidden="true" />
    <div className="glass-sheet glass-sheet--back" aria-hidden="true" />
    <div className="glass-profile-card">
      <div className="glass-card-top"><span className="eyebrow">Developer portfolio</span><HiCodeBracket aria-hidden="true" /></div>
      <span className="glass-monogram" aria-hidden="true">{initials}</span>
      <h2>{data.name}</h2>
      <p className="muted">{data.title}</p>
      <div className="glass-expertise">{data.skills.slice(0, 3).map((skill, index) => <span key={index}>{skill.name}</span>)}</div>
      <a href="#about" className="text-link">Behind the work <HiArrowUpRight aria-hidden="true" /></a>
    </div>
    {data.address && <div className="glass-location"><HiMapPin aria-hidden="true" /><span>{data.address}</span><span className="status-dot" /></div>}
  </aside>;
}
