import { useEffect, useState } from 'react';
import { fetchPortfolioData } from '../services/apiService.js';
import fallbackPortfolio from '../data/fallbackPortfolio.json';
import { PortfolioContext } from './portfolioState.js';

export function PortfolioProvider({ children }) {
  const [portfolioData, setPortfolioData] = useState(fallbackPortfolio);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [request, setRequest] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchPortfolioData(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setPortfolioData(data);
        setError(null);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError('Live updates are unavailable. Showing saved portfolio content.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [request]);

  const refetch = () => {
    setLoading(true);
    setError(null);
    setRequest((count) => count + 1);
  };
  return <PortfolioContext.Provider value={{ portfolioData, loading, error, refetch }}>{children}</PortfolioContext.Provider>;
}
