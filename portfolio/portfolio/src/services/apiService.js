import fallbackPortfolio from '../data/fallbackPortfolio.json';

const API_URL = import.meta.env.DEV
  ? '/api/portfolio/aaravharithas/'
  : 'https://portfolioapi.pythonanywhere.com/portfolio/aaravharithas/';

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
    if (!data || typeof data !== 'object' || Array.isArray(data) || typeof data.name !== 'string') {
      throw new Error('Invalid portfolio response');
    }
    return { ...fallbackPortfolio, ...data,
      ...Object.fromEntries(['projects', 'education', 'experience', 'skills'].map((key) =>
        [key, Array.isArray(data[key]) ? data[key].filter((item) => item && typeof item === 'object') : fallbackPortfolio[key]])),
    };
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}
