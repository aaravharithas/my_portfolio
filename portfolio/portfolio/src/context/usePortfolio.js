import { useContext } from 'react';
import { PortfolioContext } from './portfolioState.js';
export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error('usePortfolio must be used within PortfolioProvider');
  return context;
}
