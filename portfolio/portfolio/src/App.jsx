import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import AboutSection from './components/AboutSection.jsx';
import EducationExperienceSection from './components/EducationExperienceSection.jsx';
import ToolsSection from './components/ToolsSection.jsx';
import ProjectsSection from './components/ProjectsSection.jsx';
import ContactSection from './components/ContactSection.jsx';
import Footer from './components/Footer.jsx';
import { PortfolioProvider } from './context/PortfolioContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

export default function App() {
  return <ThemeProvider><PortfolioProvider>
    <a className="skip-link" href="#main">Skip to content</a>
    <Navbar />
    <main id="main" tabIndex={-1}>
      <HeroSection />
      <AboutSection />
      <EducationExperienceSection />
      <ToolsSection />
      <ProjectsSection />
      <ContactSection />
    </main>
    <Footer />
  </PortfolioProvider></ThemeProvider>;
}
