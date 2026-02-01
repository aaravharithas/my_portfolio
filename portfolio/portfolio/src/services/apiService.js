import fallbackPortfolio from '../data/fallbackPortfolio.json';

const API_BASE_URL = 'https://portfolioapi.pythonanywhere.com/portfolio/aaravharithas/';

export const fetchPortfolioData = async () => {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    return fallbackPortfolio;
  }
};

export default {
  fetchPortfolioData
};