import React from 'react'
import ClientLayout from './components/ClientLayout.jsx'
import Navbar from './components/Navbar.jsx'
import HeroSection from './components/HeroSection.jsx'
import AboutSection from './components/AboutSection.jsx'
import EducationExperienceSection from './components/EducationExperienceSection.jsx'
import ToolsSection from './components/ToolsSection.jsx'
import ProjectsSection from './components/ProjectsSection.jsx'
import ContactSection from './components/ContactSection.jsx'
import Footer from './components/Footer.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './index.css'

function PortfolioContent() {
  const { loading, error, portfolioData } = usePortfolio();
  const [showLoadingScreen, setShowLoadingScreen] = React.useState(true);
  const [loadingScreenComplete, setLoadingScreenComplete] = React.useState(false);

  // Lock body scroll while loading screen is visible; unlock and scroll to top when entering portfolio
  React.useEffect(() => {
    if (showLoadingScreen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
        window.scrollTo(0, 0);
      };
    }
  }, [showLoadingScreen]);

  React.useEffect(() => {
    // Only hide loading screen if data is loaded AND user has completed the loading screen
    if (!loading && portfolioData && loadingScreenComplete) {
      const timer = setTimeout(() => {
        setShowLoadingScreen(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, portfolioData, loadingScreenComplete]);

  const handleLoadingScreenComplete = () => {
    setLoadingScreenComplete(true);
    // If data is already loaded, hide immediately
    if (!loading && portfolioData) {
      setTimeout(() => {
        setShowLoadingScreen(false);
      }, 500);
    }
  };

  if (error) {
    return (
      <ClientLayout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">
              Error Loading Portfolio
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <>
      {/* Portfolio mounts during loading so components initialize without glitches */}
      <ClientLayout>
        <div className="overflow-x-hidden">
          <HeroSection />
          <AboutSection />
          <EducationExperienceSection />
          <ToolsSection />
          <ProjectsSection />
          <ContactSection />
          <Footer />
        </div>
        <Navbar variant="mobile" />
      </ClientLayout>

      {/* Loading overlay – rendered on top while portfolio loads in background */}
      {showLoadingScreen && (
        <div className="fixed inset-0 z-[100]">
          <LoadingScreen
            onComplete={handleLoadingScreenComplete}
            dataReady={!loading && !!portfolioData}
          />
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <PortfolioProvider>
        <PortfolioContent />
      </PortfolioProvider>
    </ThemeProvider>
  )
}

export default App