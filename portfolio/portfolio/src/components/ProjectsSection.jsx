import { useState } from 'react';
import { HiArrowUpRight } from 'react-icons/hi2';
import { usePortfolio } from '../context/usePortfolio.js';
import { Badge, Button, PortfolioImage, SectionHeading, Surface } from './ui.jsx';

const PAGE_SIZE = 3;

export default function ProjectsSection() {
  const { portfolioData } = usePortfolio();
  const [currentPage, setCurrentPage] = useState(1);
  const projects = portfolioData.projects.filter((project) => project.status !== 'draft');
  const totalPages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const visible = projects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const changePageFromBottom = (next) => {
    setCurrentPage(next);
    document.getElementById('projects')?.scrollIntoView({ behavior: 'instant' });
  };
  return <section id="projects" className="section-shell section-space">
    <SectionHeading number="04" title="Selected work" description="A closer look at what I’ve been building." />
    {totalPages > 1 && <nav className="pagination" aria-label="Project pages">
      <Button disabled={page === 1} onClick={() => setCurrentPage(page - 1)}>Previous</Button>
      <span aria-live="polite">{page} / {totalPages}</span>
      <Button disabled={page === totalPages} onClick={() => setCurrentPage(page + 1)}>Next</Button>
    </nav>}
    <div className="projects-layout">
      {visible.map((project, index) => <Surface as="article" className="project-card" key={project.id || `${project.title}-${index}`}>
        <div className="project-image-wrap" style={{ '--project-ratio': `${project.imageWidth || 640} / ${project.imageHeight || 400}`, '--project-fit': project.imageFit || 'contain' }}><PortfolioImage src={project.image} alt={project.imageAlt || project.title || 'Project preview'}
          className="project-image" loading="lazy" width={project.imageWidth || 640} height={project.imageHeight || 400} />
          <span className="project-number" aria-hidden="true">{String((page - 1) * PAGE_SIZE + index + 1).padStart(2, '0')}</span>
        </div>
        <div className="project-body">
          <div className="badge-row">{(Array.isArray(project.tech_stack) ? project.tech_stack : []).map((tech, i) => <Badge key={`${tech}-${i}`}>{tech}</Badge>)}</div>
          <h3>{project.title || 'Untitled project'}</h3>
          <p className="muted">{project.description || 'More details coming soon.'}</p>
          <div className="button-row project-links">
            {project.link && <Button href={project.link} target="_blank" rel="noopener noreferrer">Live demo <HiArrowUpRight aria-hidden="true" /></Button>}
            {project.github && <Button href={project.github} target="_blank" rel="noopener noreferrer">GitHub <HiArrowUpRight aria-hidden="true" /></Button>}
          </div>
        </div>
      </Surface>)}
    </div>
    {totalPages > 1 && <nav className="pagination pagination--bottom" aria-label="Project pages, bottom">
      <Button disabled={page === 1} onClick={() => changePageFromBottom(page - 1)}>Previous</Button>
      <span>{page} / {totalPages}</span>
      <Button disabled={page === totalPages} onClick={() => changePageFromBottom(page + 1)}>Next</Button>
    </nav>}
    {!projects.length && <p className="muted empty-state">New projects are on the way.</p>}
  </section>;
}
