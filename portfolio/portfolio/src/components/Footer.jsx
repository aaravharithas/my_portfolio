import React from "react";
import { usePortfolio } from "../context/PortfolioContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { getGlassStyle, getGlassBorder } from "../utils/themeUtils.js";

// Small (22px) icon variants for the footer
const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 50 50" fill="currentColor">
    <path d="M 16 3 C 8.8324839 3 3 8.8324839 3 16 L 3 34 C 3 41.167516 8.8324839 47 16 47 L 34 47 C 41.167516 47 47 41.167516 47 34 L 47 16 C 47 8.8324839 41.167516 3 34 3 L 16 3 z M 16 5 L 34 5 C 40.086484 5 45 9.9135161 45 16 L 45 34 C 45 40.086484 40.086484 45 34 45 L 16 45 C 9.9135161 45 5 40.086484 5 34 L 5 16 C 5 9.9135161 9.9135161 5 16 5 z M 37 11 A 2 2 0 0 0 35 13 A 2 2 0 0 0 37 15 A 2 2 0 0 0 39 13 A 2 2 0 0 0 37 11 z M 25 14 C 18.936712 14 14 18.936712 14 25 C 14 31.063288 18.936712 36 25 36 C 31.063288 36 36 31.063288 36 25 C 36 18.936712 31.063288 14 25 14 z M 25 16 C 29.982407 16 34 20.017593 34 25 C 34 29.982407 29.982407 34 25 34 C 20.017593 34 16 29.982407 16 25 C 16 20.017593 20.017593 16 25 16 z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 50 50" fill="currentColor">
    <path d="M41,4H9C6.24,4,4,6.24,4,9v32c0,2.76,2.24,5,5,5h32c2.76,0,5-2.24,5-5V9C46,6.24,43.76,4,41,4z M17,20v19h-6V20H17z M11,14.47c0-1.4,1.2-2.47,3-2.47s2.93,1.07,3,2.47c0,1.4-1.12,2.53-3,2.53C12.2,17,11,15.87,11,14.47z M39,39h-6c0,0,0-9.26,0-10 c0-2-1-4-3.5-4.04h-0.08C27,24.96,26,27.02,26,29c0,0.91,0,10,0,10h-6V20h6v2.56c0,0,1.93-2.56,5.81-2.56 c3.97,0,7.19,2.73,7.19,8.26V39z" />
  </svg>
);

const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 50 50" fill="currentColor">
    <path d="M 11 4 C 7.134 4 4 7.134 4 11 L 4 39 C 4 42.866 7.134 46 11 46 L 39 46 C 42.866 46 46 42.866 46 39 L 46 11 C 46 7.134 42.866 4 39 4 L 11 4 z M 13.085938 13 L 21.023438 13 L 26.660156 21.009766 L 33.5 13 L 36 13 L 27.789062 22.613281 L 37.914062 37 L 29.978516 37 L 23.4375 27.707031 L 15.5 37 L 13 37 L 22.308594 26.103516 Z" />
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 50 50" fill="currentColor">
    <path d="M 14 4 C 8.4886661 4 4 8.4886661 4 14 L 4 36 C 4 41.511334 8.4886661 46 14 46 L 36 46 C 41.511334 46 46 41.511334 46 36 L 46 14 C 46 8.4886661 41.511334 4 36 4 L 14 4 z M 13 16 L 37 16 C 37.18 16 37.349766 16.020312 37.509766 16.070312 L 27.679688 25.890625 C 26.199688 27.370625 23.790547 27.370625 22.310547 25.890625 L 12.490234 16.070312 C 12.650234 16.020312 12.82 16 13 16 z M 11.070312 17.490234 L 18.589844 25 L 11.070312 32.509766 C 11.020312 32.349766 11 32.18 11 32 L 11 18 C 11 17.82 11.020312 17.650234 11.070312 17.490234 z M 38.929688 17.490234 C 38.979688 17.650234 39 17.82 39 18 L 39 32 C 39 32.18 38.979687 32.349766 38.929688 32.509766 L 31.400391 25 L 38.929688 17.490234 z M 20 26.410156 L 20.890625 27.310547 C 22.020625 28.440547 23.510234 29 24.990234 29 C 26.480234 29 27.959844 28.440547 29.089844 27.310547 L 29.990234 26.410156 L 37.509766 33.929688 C 37.349766 33.979688 37.18 34 37 34 L 13 34 C 12.82 34 12.650234 33.979687 12.490234 33.929688 L 20 26.410156 z" />
  </svg>
);

function Footer() {
  const { theme: themeMode } = useTheme();
  const { portfolioData } = usePortfolio();
  const name = portfolioData?.name ?? "";
  const currentYear = new Date().getFullYear();

  // Build social links from API data
  const socials = [];
  if (portfolioData?.social?.linkedin) {
    socials.push({ name: "LinkedIn", href: portfolioData.social.linkedin, Icon: LinkedInIcon });
  }
  if (portfolioData?.social?.instagram) {
    socials.push({ name: "Instagram", href: portfolioData.social.instagram, Icon: InstagramIcon });
  }
  if (portfolioData?.social?.twitter) {
    socials.push({ name: "Twitter/X", href: portfolioData.social.twitter, Icon: TwitterIcon });
  }
  if (portfolioData?.email) {
    socials.push({ name: "Email", href: `mailto:${portfolioData.email}`, Icon: MailIcon });
  }

  const { border: _border, ...glassBase } = getGlassStyle({ background: 'card', blur: 'md', shadow: 'glass', theme: themeMode });

  return (
    <footer
      className="w-full py-6 sm:py-8 pb-24 md:pb-8 text-center relative overflow-hidden"
      style={{
        ...glassBase,
        borderTop: `1px solid ${getGlassBorder('card', themeMode)}`,
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}
    >
      {/* Subtle liquid glass background accent */}
      <div
        aria-hidden
        className={`absolute inset-0 ${themeMode === 'light' ? 'liquid-glass-anim-light' : 'liquid-glass-anim'}`}
        style={{ opacity: 0.12 }}
      />

      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Social icon links */}
        {socials.length > 0 && (
          <div className="flex items-center justify-center gap-5">
            {socials.map(({ name: label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('mailto') ? undefined : '_blank'}
                rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                aria-label={label}
                className="transition-all duration-200"
                style={{
                  color: themeMode === 'light' ? '#1d1d1f' : '#ededed',
                  opacity: 0.5,
                  display: 'inline-flex',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'scale(1.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.5';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Icon />
              </a>
            ))}
          </div>
        )}

        {/* Copyright */}
        <p
          className="text-xs sm:text-sm"
          style={{
            color: themeMode === 'light'
              ? 'rgba(0,0,0,0.45)'
              : 'rgba(255,255,255,0.35)',
          }}
        >
          © {currentYear}{name ? ` ${name}.` : ""} All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default React.memo(Footer);
