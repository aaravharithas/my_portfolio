import { useRef, useState } from 'react';
import { usePortfolio } from '../context/usePortfolio.js';
import { Badge, SectionHeading, Surface } from './ui.jsx';

function formatDate(value) {
  if (!value || value === 'Present') return 'Present';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function EducationExperienceSection() {
  const { portfolioData } = usePortfolio();
  const [activeTab, setActiveTab] = useState('education');
  const tabsRef = useRef(null);
  const tabs = ['education', 'experience'];
  const items = portfolioData[activeTab] || [];
  const onTabKey = (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - tabs.indexOf(activeTab);
    setActiveTab(tabs[next]);
    tabsRef.current.children[next].focus();
  };
  return <section id="education-experience" className="section-shell section-space">
    <SectionHeading number="02" title="The journey so far" />
    <div className="tabs" role="tablist" aria-label="Education and experience" ref={tabsRef} onKeyDown={onTabKey}>
      {tabs.map((tab) => <button key={tab} type="button" role="tab" id={`tab-${tab}`}
        aria-controls="journey-panel" aria-selected={activeTab === tab} tabIndex={activeTab === tab ? 0 : -1}
        onClick={() => setActiveTab(tab)}>{tab === 'education' ? 'Education' : 'Experience'}</button>)}
    </div>
    <div id="journey-panel" role="tabpanel" aria-labelledby={`tab-${activeTab}`} tabIndex={0}>
      <div className="journey-layout">
        {items.map((item, index) => <Surface as="article" className="journey-card" key={`${activeTab}-${index}`}>
          <Badge>{formatDate(item.startDate)} — {formatDate(item.endDate)}</Badge>
          <h3>{activeTab === 'education' ? item.degree : item.role}</h3>
          <p className="journey-place">{activeTab === 'education' ? item.institution : item.company}</p>
          {item.location && <p className="muted small">{item.location}</p>}
          <p className="muted">{item.description}</p>
        </Surface>)}
      </div>
      {!items.length && <p className="muted empty-state">No {activeTab} entries yet.</p>}
    </div>
  </section>;
}
