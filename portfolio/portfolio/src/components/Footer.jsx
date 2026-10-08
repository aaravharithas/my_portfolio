import { usePortfolio } from '../context/usePortfolio.js';
export default function Footer() {
  const { portfolioData, error, loading, refetch } = usePortfolio();
  return <footer className="site-footer section-shell">
    <div><a href="#home" className="footer-name">{portfolioData.name}</a>
      <p className="small muted">© {new Date().getFullYear()} · Made with care.</p></div>
    <div className="footer-meta">
      {error && <p className="small muted" role="status">{error} <button type="button" className="text-link" onClick={refetch} disabled={loading}>Retry</button></p>}
      <a href="#home" className="text-link">Back to top ↑</a>
    </div>
  </footer>;
}
