import { normalizePortfolio } from '../utils/portfolioData.js';

const username = encodeURIComponent(import.meta.env.VITE_PORTFOLIO_USERNAME || 'aaravharithas');
const base = (import.meta.env.VITE_PORTFOLIO_API_BASE_URL || (import.meta.env.DEV ? '/api' : 'https://portfolioapi.pythonanywhere.com')).replace(/\/$/, '');
export const API_URL = `${base}/portfolio/${username}/`;

export async function fetchPortfolioData(signal) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(abort, 6000);
  try {
    const response = await fetch(API_URL, { signal: controller.signal });
    if (!response.ok) throw new Error(`Portfolio request failed: ${response.status}`);
    const data = await response.json();
    return normalizePortfolio(data);
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}
