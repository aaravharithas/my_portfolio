import React from "react";
import { motion } from "framer-motion";
import { usePortfolio } from "../context/PortfolioContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { glassmorphic } from "../config/glassmorphic.js";
import { getGlassStyle, getGlassBackground, getGlassBorder, getLiquidGlassGradient } from "../utils/themeUtils.js";
import { theme } from "../config/theme.js";

// Social icons component that uses centralized theme
const SocialIcon = ({ children, themeMode }) => {
  return (
    <div
      style={{
        filter: themeMode === 'dark' ? 'invert(1)' : 'invert(0)',
        transition: 'filter 0.3s ease',
      }}
    >
      {children}
    </div>
  );
};

// SVG components for social icons
const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="40" height="40" viewBox="0 0 50 50">
    <path d="M 16 3 C 8.8324839 3 3 8.8324839 3 16 L 3 34 C 3 41.167516 8.8324839 47 16 47 L 34 47 C 41.167516 47 47 41.167516 47 34 L 47 16 C 47 8.8324839 41.167516 3 34 3 L 16 3 z M 16 5 L 34 5 C 40.086484 5 45 9.9135161 45 16 L 45 34 C 45 40.086484 40.086484 45 34 45 L 16 45 C 9.9135161 45 5 40.086484 5 34 L 5 16 C 5 9.9135161 9.9135161 5 16 5 z M 37 11 A 2 2 0 0 0 35 13 A 2 2 0 0 0 37 15 A 2 2 0 0 0 39 13 A 2 2 0 0 0 37 11 z M 25 14 C 18.936712 14 14 18.936712 14 25 C 14 31.063288 18.936712 36 25 36 C 31.063288 36 36 31.063288 36 25 C 36 18.936712 31.063288 14 25 14 z M 25 16 C 29.982407 16 34 20.017593 34 25 C 34 29.982407 29.982407 34 25 34 C 20.017593 34 16 29.982407 16 25 C 16 20.017593 20.017593 16 25 16 z"></path>
  </svg>
);

const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="40" height="40" viewBox="0 0 50 50">
    <path d="M41,4H9C6.24,4,4,6.24,4,9v32c0,2.76,2.24,5,5,5h32c2.76,0,5-2.24,5-5V9C46,6.24,43.76,4,41,4z M17,20v19h-6V20H17z M11,14.47c0-1.4,1.2-2.47,3-2.47s2.93,1.07,3,2.47c0,1.4-1.12,2.53-3,2.53C12.2,17,11,15.87,11,14.47z M39,39h-6c0,0,0-9.26,0-10 c0-2-1-4-3.5-4.04h-0.08C27,24.96,26,27.02,26,29c0,0.91,0,10,0,10h-6V20h6v2.56c0,0,1.93-2.56,5.81-2.56 c3.97,0,7.19,2.73,7.19,8.26V39z"></path>
  </svg>
);

const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="40" height="40" viewBox="0 0 50 50">
    <path d="M 11 4 C 7.134 4 4 7.134 4 11 L 4 39 C 4 42.866 7.134 46 11 46 L 39 46 C 42.866 46 46 42.866 46 39 L 46 11 C 46 7.134 42.866 4 39 4 L 11 4 z M 13.085938 13 L 21.023438 13 L 26.660156 21.009766 L 33.5 13 L 36 13 L 27.789062 22.613281 L 37.914062 37 L 29.978516 37 L 23.4375 27.707031 L 15.5 37 L 13 37 L 22.308594 26.103516 Z"></path>
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="40" height="40" viewBox="0 0 50 50">
    <path d="M 14 4 C 8.4886661 4 4 8.4886661 4 14 L 4 36 C 4 41.511334 8.4886661 46 14 46 L 36 46 C 41.511334 46 46 41.511334 46 36 L 46 14 C 46 8.4886661 41.511334 4 36 4 L 14 4 z M 13 16 L 37 16 C 37.18 16 37.349766 16.020312 37.509766 16.070312 L 27.679688 25.890625 C 26.199688 27.370625 23.790547 27.370625 22.310547 25.890625 L 12.490234 16.070312 C 12.650234 16.020312 12.82 16 13 16 z M 11.070312 17.490234 L 18.589844 25 L 11.070312 32.509766 C 11.020312 32.349766 11 32.18 11 32 L 11 18 C 11 17.82 11.020312 17.650234 11.070312 17.490234 z M 38.929688 17.490234 C 38.979688 17.650234 39 17.82 39 18 L 39 32 C 39 32.18 38.979687 32.349766 38.929688 32.509766 L 31.400391 25 L 38.929688 17.490234 z M 20 26.410156 L 20.890625 27.310547 C 22.020625 28.440547 23.510234 29 24.990234 29 C 26.480234 29 27.959844 28.440547 29.089844 27.310547 L 29.990234 26.410156 L 37.509766 33.929688 C 37.349766 33.979688 37.18 34 37 34 L 13 34 C 12.82 34 12.650234 33.979687 12.490234 33.929688 L 20 26.410156 z"></path>
  </svg>
);

export default function ContactSection() {
  const { theme: themeMode } = useTheme();
  const { portfolioData, loading } = usePortfolio();

  // Build socials array from API data
  const socials = [];
  if (portfolioData?.social) {
    if (portfolioData.social.linkedin) {
      socials.push({
        name: "LinkedIn",
        link: portfolioData.social.linkedin,
        svg: <LinkedInIcon />
      });
    }
    if (portfolioData.social.instagram) {
      socials.push({
        name: "Instagram",
        link: portfolioData.social.instagram,
        svg: <InstagramIcon />
      });
    }
    if (portfolioData.social.twitter) {
      socials.push({
        name: "Twitter",
        link: portfolioData.social.twitter,
        svg: <TwitterIcon />
      });
    }
  }
  
  // Add email if available
  if (portfolioData?.email) {
    socials.push({
      name: "Mail",
      link: `mailto:${portfolioData.email}`,
      svg: <MailIcon />
    });
  }

  const cvLink = portfolioData?.cvLink ?? "";
  
  return (
    <motion.section
      id="contact"
      className="w-full max-w-xs sm:max-w-md md:max-w-xl px-4 py-12 sm:py-16 mx-auto text-center"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <h2 
        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 dark:text-white"
        style={{ color: themeMode === 'light' ? '#000000' : undefined }}
      >
        Contact
      </h2>
      
      <motion.form
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="rounded-2xl shadow-glass p-8 flex flex-col gap-4 mb-8 relative overflow-hidden"
        style={{
          ...getGlassStyle({ background: 'form', border: 'form', blur: 'md', shadow: 'glass', theme: themeMode }),
        }}
        onSubmit={e => e.preventDefault()}
      >
        {/* Animated background gradient - same as navbar */}
        <motion.div
          className="absolute inset-0"
          style={{
            opacity: themeMode === 'light' ? 0.4 : 0.3,
          }}
          animate={{
            background: [
              getLiquidGlassGradient('gradient1', themeMode),
              getLiquidGlassGradient('gradient2', themeMode),
              getLiquidGlassGradient('gradient3', themeMode),
              getLiquidGlassGradient('gradient1', themeMode),
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Floating particles - same as navbar */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {[...Array(4)].map((_, i) => {
            // Use colored particles for light mode, white for dark mode
            const particleColors = themeMode === 'light' 
              ? ['rgba(96,165,250,0.4)', 'rgba(167,139,250,0.4)', 'rgba(244,114,182,0.4)', 'rgba(96,165,250,0.4)']
              : ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.2)'];
            return (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  left: `${15 + i * 20}%`,
                  top: `${20 + (i % 2) * 60}%`,
                  backgroundColor: particleColors[i % particleColors.length],
                }}
                animate={{
                  y: [-5, -15, -5],
                  opacity: themeMode === 'light' ? [0.4, 0.8, 0.4] : [0.2, 0.6, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
              />
            );
          })}
        </div>
        <input
          type="text"
          placeholder="Your Name"
          className="px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-glass focus:outline-none transition-all relative z-10 text-sm sm:text-base"
          style={{
            minHeight: "44px",
            background: getGlassBackground('form', themeMode),
            border: `1px solid ${getGlassBorder('form', themeMode)}`,
            backdropFilter: `blur(${glassmorphic.blur.md})`,
            WebkitBackdropFilter: `blur(${glassmorphic.blur.md})`,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = theme.colors.brand.appleBlue;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = getGlassBorder('form', themeMode);
          }}
          required
        />
        <input
          type="email"
          placeholder="Your Email"
          className="px-4 py-3 rounded-lg shadow-glass focus:outline-none transition-all relative z-10"
          style={{
            background: getGlassBackground('form', themeMode),
            border: `1px solid ${getGlassBorder('form', themeMode)}`,
            backdropFilter: `blur(${glassmorphic.blur.md})`,
            WebkitBackdropFilter: `blur(${glassmorphic.blur.md})`,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = theme.colors.brand.appleBlue;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = getGlassBorder('form', themeMode);
          }}
          required
        />
        <textarea
          placeholder="Your Message"
          className="px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-glass focus:outline-none min-h-[80px] sm:min-h-[100px] transition-all text-sm sm:text-base"
          style={{
            background: getGlassBackground('form', themeMode),
            border: `1px solid ${getGlassBorder('form', themeMode)}`,
            backdropFilter: `blur(${glassmorphic.blur.md})`,
            WebkitBackdropFilter: `blur(${glassmorphic.blur.md})`,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = theme.colors.brand.appleBlue;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = getGlassBorder('form', themeMode);
          }}
          required
        />
        <button
          type="submit"
          className="mt-2 px-6 py-3 rounded-full backdrop-blur-xl shadow-glass font-semibold text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-appleBlue/60 relative z-10"
          style={{
            background: getGlassBackground('button', themeMode),
            border: `1px solid ${getGlassBorder('button', themeMode)}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = getGlassBackground('buttonHover', themeMode);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = getGlassBackground('button', themeMode);
          }}
        >
          <span className="gradient-text gradient-text-infinite">Send Message</span>
        </button>
      </motion.form>

      {/* Social Media Icons - Clean Layout Without Background */}
      {socials.length > 0 && (
        <motion.div 
          className="flex justify-center items-center gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          {socials.map((social, index) => (
            <motion.a
              key={social.name}
              href={social.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 transition-all duration-200"
              aria-label={social.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
              style={{
                filter: themeMode === 'dark' ? 'invert(1)' : 'invert(0)',
                transition: 'filter 0.3s ease, transform 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.filter = themeMode === 'dark' 
                  ? 'invert(1) brightness(1.2)' 
                  : 'invert(0) brightness(0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.filter = themeMode === 'dark' ? 'invert(1)' : 'invert(0)';
              }}
            >
              {social.svg}
            </motion.a>
          ))}
        </motion.div>
      )}

      {/* Download Resume Button */}
      {cvLink && (
        <motion.a
          href={cvLink}
          className="inline-block px-6 py-3 rounded-full backdrop-blur-xl shadow-glass font-medium transition-all duration-200 mb-8"
          style={{
            background: getGlassBackground('button', themeMode),
            border: `1px solid ${getGlassBorder('button', themeMode)}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = getGlassBackground('buttonHover', themeMode);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = getGlassBackground('button', themeMode);
          }}
          download={!cvLink.startsWith('http')}
          target={cvLink.startsWith('http') ? '_blank' : undefined}
          rel={cvLink.startsWith('http') ? 'noopener noreferrer' : undefined}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        >
          <span className="gradient-text gradient-text-infinite">Download Resume</span>
        </motion.a>
      )}
    </motion.section>
  );
}