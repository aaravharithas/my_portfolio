"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchPortfolioData } from '../services/apiService';
import fallbackPortfolio from '../data/fallbackPortfolio.json';

const PortfolioContext = createContext();

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

export const PortfolioProvider = ({ children }) => {
  const [portfolioData, setPortfolioData] = useState(fallbackPortfolio);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPortfolioData = async () => {
      try {
        setLoading(true);
        const data = await fetchPortfolioData();
        setPortfolioData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setPortfolioData(fallbackPortfolio);
        console.error('Failed to load portfolio data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPortfolioData();
  }, []);

  const value = {
    portfolioData,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      fetchPortfolioData()
        .then((data) => {
          setPortfolioData(data);
          setError(null);
        })
        .catch((err) => {
          setError(err.message);
          setPortfolioData(fallbackPortfolio);
        })
        .finally(() => setLoading(false));
    }
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};