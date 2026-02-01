import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { usePortfolio } from "../context/PortfolioContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

// Mapping function to convert skill names to simple-icons slugs
const getSkillSlug = (skillName) => {
  const skillMap = {
    "HTML5": "html5",
    "HTML": "html5",
    "CSS": "css3",
    "CSS3": "css3",
    "JavaScript": "javascript",
    "JS": "javascript",
    "React": "react",
    "Next.js": "nextdotjs",
    "NextJS": "nextdotjs",
    "Node.js": "nodedotjs",
    "NodeJS": "nodedotjs",
    "Python": "python",
    "Django": "django",
    "Flask": "flask",
    "Git": "git",
    "GitHub": "github",
    "Figma": "figma",
    "TensorFlow": "tensorflow",
    "MongoDB": "mongodb",
    "PostgreSQL": "postgresql",
    "MySQL": "mysql",
    "Redis": "redis",
    "Docker": "docker",
    "AWS": "amazonaws",
    "TypeScript": "typescript",
    "Vue": "vuedotjs",
    "Angular": "angular",
    "Svelte": "svelte",
    "Express": "express",
    "NestJS": "nestjs",
    "GraphQL": "graphql",
    "REST": "rest",
    "Tailwind CSS": "tailwindcss",
    "Bootstrap": "bootstrap",
    "Sass": "sass",
    "Less": "less",
    "Webpack": "webpack",
    "Vite": "vite",
    "Jest": "jest",
    "Cypress": "cypress",
    "Firebase": "firebase",
    "Supabase": "supabase",
    "Vercel": "vercel",
    "Netlify": "netlify",
  };

  // Try exact match first
  if (skillMap[skillName]) {
    return skillMap[skillName];
  }

  // Try case-insensitive match
  const lowerSkill = skillName.toLowerCase();
  for (const [key, value] of Object.entries(skillMap)) {
    if (key.toLowerCase() === lowerSkill) {
      return value;
    }
  }

  // Try to find partial match
  for (const [key, value] of Object.entries(skillMap)) {
    if (lowerSkill.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerSkill)) {
      return value;
    }
  }

  // Default: convert to slug format (lowercase, replace spaces with dashes, remove special chars)
  return skillName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
};

// CDN URL for simple-icons SVGs
const getIconUrl = (slug) => `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${slug}.svg`;

// Default icon when a skill's icon is not found (simple-icons "code" - generic for skills)
const DEFAULT_ICON_SLUG = 'code';
const DEFAULT_ICON_URL = getIconUrl(DEFAULT_ICON_SLUG);

// Inline SVG fallback when even the default icon URL fails to load (no network dependency)
const DefaultIconSvg = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M8.5 13.5L6 11l2.5-2.5L6 6l2.5 2.5L11 11l-2.5 2.5L11 16l-2.5-2.5zm7 0L18 11l-2.5-2.5L18 6l-2.5 2.5L13 11l2.5 2.5L13 16l2.5-2.5z" />
  </svg>
);

export default function ToolsSection() {
  const { portfolioData, loading } = usePortfolio();
  const { theme: themeMode } = useTheme();
  // Track which skills had their icon fail to load (by skill name) so we show default icon
  const [failedIconNames, setFailedIconNames] = useState(() => new Set());
  // When default icon URL also fails, show inline SVG for those skills
  const [defaultIconFailedNames, setDefaultIconFailedNames] = useState(() => new Set());

  const handleIconError = useCallback((toolName) => {
    setFailedIconNames((prev) => new Set(prev).add(toolName));
  }, []);

  const handleDefaultIconError = useCallback((toolName) => {
    setDefaultIconFailedNames((prev) => new Set(prev).add(toolName));
  }, []);

  // Map skills from API to tool format
  const toolSvgs = portfolioData?.skills?.map(skill => ({
    name: skill.name,
    slug: getSkillSlug(skill.name),
    value: skill.value
  })) || [];

  return (
    <motion.section
      id="tools"
      className="w-full max-w-6xl px-4 py-20 mx-auto"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <h2 
        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-10 md:mb-12 text-center dark:text-white"
        style={{ color: themeMode === 'light' ? '#000000' : undefined }}
      >
        Tools & Tech Stack
      </h2>

      {/* Simple Grid Layout */}
      {toolSvgs.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 sm:gap-6 md:gap-8 items-center justify-items-center max-w-6xl mx-auto">
          {toolSvgs.map((tool, idx) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              whileHover={{ scale: 1.2 }}
              className="flex flex-col items-center justify-center group"
            >
              <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-1 sm:mb-2">
                {defaultIconFailedNames.has(tool.name) ? (
                  /* Inline SVG when both skill icon and default icon URL failed */
                  <DefaultIconSvg
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 group-hover:scale-110 transition-transform duration-200"
                    style={{
                      color: themeMode === 'light' ? '#000' : '#fff',
                    }}
                  />
                ) : failedIconNames.has(tool.name) ? (
                  /* Default icon (from CDN) when skill icon failed to load */
                  <img
                    src={DEFAULT_ICON_URL}
                    alt={`${tool.name} (default icon)`}
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 group-hover:scale-110 transition-transform duration-200"
                    style={{
                      filter: themeMode === 'light'
                        ? 'brightness(0) saturate(100%)'
                        : 'invert(1)',
                    }}
                    loading="lazy"
                    onError={() => handleDefaultIconError(tool.name)}
                  />
                ) : (
                  <img
                    src={getIconUrl(tool.slug)}
                    alt={`${tool.name} icon`}
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 group-hover:scale-110 transition-transform duration-200"
                    style={{
                      filter: themeMode === 'light'
                        ? 'brightness(0) saturate(100%)'
                        : 'invert(1)',
                    }}
                    loading="lazy"
                    onError={() => handleIconError(tool.name)}
                  />
                )}
              </div>
              <h3 
                className="text-sm font-medium text-center dark:text-white opacity-70 group-hover:opacity-100 transition-opacity duration-200"
                style={{ color: themeMode === 'light' ? '#000000' : undefined }}
              >
                {tool.name}
              </h3>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">No skills data available</p>
      )}
    </motion.section>
  );
}