import React from "react";
import { usePortfolio } from "../context/PortfolioContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Footer() {
  const { theme: themeMode } = useTheme();
  const { portfolioData } = usePortfolio();
  const name = portfolioData?.name ?? "";
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="w-full py-6 sm:py-8 pb-24 md:pb-8 text-center"
      style={{
        background: themeMode === "light" ? "#000000" : "#ffffff",
        color: themeMode === "light" ? "#ffffff" : "#000000",
        transition: "background 0.3s ease, color 0.3s ease",
      }}
    >
      <p className="text-xs sm:text-sm">
        © {currentYear}{name ? ` ${name}.` : ""} All rights reserved.
      </p>
    </footer>
  );
}
