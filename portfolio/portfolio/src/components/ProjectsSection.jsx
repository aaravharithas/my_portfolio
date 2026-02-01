import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext.jsx";
import { usePortfolio } from "../context/PortfolioContext.jsx";
import { glassmorphic } from "../config/glassmorphic.js";
import BounceCard from "./react-bits/BounceCard.jsx";
import { getGlassBackground, getGlassBorder, getDeviceAwareBlurValue } from "../utils/themeUtils.js";
import { theme } from "../config/theme.js";
import {
  getDeviceType,
  getResponsiveGap,
  isTouchDevice,
  supportsBackdropFilter,
} from "../utils/responsiveUtils.js";

const PROJECTS_PER_PAGE = 3;

// Same conic gradient ring as theme toggle / loading screen
const conicRingGradient =
  "conic-gradient(from 0deg, #60A5FA, #A78BFA, #F472B6, #34D399, #FBBF24, #60A5FA)";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function ProjectsSection() {
  const { theme: themeMode } = useTheme();
  const { portfolioData, loading } = usePortfolio();
  const [currentPage, setCurrentPage] = useState(1);

  // Map API projects to component format and filter out drafts
  const projects = portfolioData?.projects
    ?.filter((project) => project.status !== "draft")
    ?.map((project) => ({
      title: project.title || "Untitled Project",
      tech: project.tech_stack || [],
      description:
        project.discription || project.description || "No description available.",
      image: project.image || "/images/default-project.png",
      link: project.link || null,
      github: project.github || null,
    })) || [];

  // Pagination logic
  const totalPages = Math.ceil(projects.length / PROJECTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
  const endIndex = startIndex + PROJECTS_PER_PAGE;
  const paginatedProjects = projects.slice(startIndex, endIndex);

  // Device detection and responsive handling
  const [deviceType, setDeviceType] = useState(() => getDeviceType());
  const [supportsBackdrop, setSupportsBackdrop] = useState(() =>
    supportsBackdropFilter()
  );
  const isTouch = isTouchDevice();

  useEffect(() => {
    const checkDevice = () => {
      setDeviceType(getDeviceType());
      setSupportsBackdrop(supportsBackdropFilter());
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Reset to page 1 when projects change (e.g. after API load)
  useEffect(() => {
    setCurrentPage(1);
  }, [projects.length]);

  return (
    <motion.section
      id="projects"
      className="w-full max-w-6xl px-4 py-20 mx-auto"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <h2
        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 md:mb-10 text-center dark:text-white"
        style={{ color: themeMode === "light" ? "#000000" : undefined }}
      >
        Projects
      </h2>
      {projects.length === 0 && !loading && (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No projects available
        </p>
      )}
      {projects.length > 0 && (
        <>
          {/* Pagination - above cards to avoid layout glitches from card height changes */}
          {totalPages > 1 && (
            <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 mb-6 flex-wrap">
              <motion.button
                onClick={() =>
                  setCurrentPage((p) => Math.max(1, p - 1))
                }
                disabled={currentPage === 1}
                className="px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-base rounded-full font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                style={{
                  background: getGlassBackground("button", themeMode),
                  border: `1px solid ${getGlassBorder("button", themeMode)}`,
                  color:
                    currentPage === 1
                      ? themeMode === "light"
                        ? "#999999"
                        : "#666666"
                      : themeMode === "light"
                        ? "#000000"
                        : theme.colors.text.black[themeMode],
                  backdropFilter: supportsBackdrop
                    ? `blur(${getDeviceAwareBlurValue("md", deviceType)})`
                    : "none",
                  WebkitBackdropFilter: supportsBackdrop
                    ? `blur(${getDeviceAwareBlurValue("md", deviceType)})`
                    : "none",
                }}
                whileHover={
                  currentPage > 1 ? { scale: 1.05 } : {}
                }
                whileTap={currentPage > 1 ? { scale: 0.95 } : {}}
              >
                <span className="sm:hidden">Prev</span>
                <span className="hidden sm:inline">← Previous</span>
              </motion.button>

              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    const isActive = currentPage === page;
                    const buttonContent = (
                      <motion.button
                        onClick={() => setCurrentPage(page)}
                        className="w-7 h-7 sm:w-9 sm:h-9 rounded-full text-xs sm:text-sm font-medium flex items-center justify-center"
                        style={{
                          background: getGlassBackground("button", themeMode),
                          border: `1px solid ${getGlassBorder("button", themeMode)}`,
                          color:
                            themeMode === "light"
                              ? "#000000"
                              : theme.colors.text.black[themeMode],
                          backdropFilter: supportsBackdrop
                            ? `blur(${getDeviceAwareBlurValue("sm", deviceType)})`
                            : "none",
                          WebkitBackdropFilter: supportsBackdrop
                            ? `blur(${getDeviceAwareBlurValue("sm", deviceType)})`
                            : "none",
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {page}
                      </motion.button>
                    );
                    return isActive ? (
                      <motion.div
                        key={page}
                        className="relative w-9 h-9 sm:w-[42px] sm:h-[42px] min-w-9 min-h-9 sm:min-w-[42px] sm:min-h-[42px] rounded-full flex-shrink-0 flex items-center justify-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {/* Rotating gradient ring - same as theme toggle */}
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          style={{ background: conicRingGradient }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />
                        {/* Opaque center mask so only the ring shows - 3px ring width */}
                        <div
                          className="absolute inset-[3px] rounded-full pointer-events-none"
                          style={{
                            background:
                              themeMode === "light"
                                ? "rgba(255,255,255,0.95)"
                                : "rgba(13,13,13,0.95)",
                          }}
                        />
                        <motion.button
                          onClick={() => setCurrentPage(page)}
                          className="absolute inset-[3px] w-7 h-7 sm:w-9 sm:h-9 rounded-full text-xs sm:text-sm font-medium flex items-center justify-center"
                          style={{
                            background:
                              themeMode === "light"
                                ? "rgba(255,255,255,0.95)"
                                : "rgba(13,13,13,0.95)",
                            border: "none",
                            color:
                              themeMode === "light"
                                ? "#000000"
                                : theme.colors.text.black[themeMode],
                            backdropFilter: supportsBackdrop
                              ? `blur(${getDeviceAwareBlurValue("sm", deviceType)})`
                              : "none",
                            WebkitBackdropFilter: supportsBackdrop
                              ? `blur(${getDeviceAwareBlurValue("sm", deviceType)})`
                              : "none",
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {page}
                        </motion.button>
                      </motion.div>
                    ) : (
                      <React.Fragment key={page}>{buttonContent}</React.Fragment>
                    );
                  }
                )}
              </div>

              <motion.button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-base rounded-full font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                style={{
                  background: getGlassBackground("button", themeMode),
                  border: `1px solid ${getGlassBorder("button", themeMode)}`,
                  color:
                    currentPage === totalPages
                      ? themeMode === "light"
                        ? "#999999"
                        : "#666666"
                      : themeMode === "light"
                        ? "#000000"
                        : theme.colors.text.black[themeMode],
                  backdropFilter: supportsBackdrop
                    ? `blur(${getDeviceAwareBlurValue("md", deviceType)})`
                    : "none",
                  WebkitBackdropFilter: supportsBackdrop
                    ? `blur(${getDeviceAwareBlurValue("md", deviceType)})`
                    : "none",
                }}
                whileHover={
                  currentPage < totalPages ? { scale: 1.05 } : {}
                }
                whileTap={
                  currentPage < totalPages ? { scale: 0.95 } : {}
                }
              >
                <span className="sm:hidden">Next</span>
                <span className="hidden sm:inline">Next →</span>
              </motion.button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              style={{
                gap: `${getResponsiveGap(deviceType)}px`,
                perspective: "1000px",
              }}
            >
              {paginatedProjects.map((project) => {
                const defaultBlur = getDeviceAwareBlurValue("md", deviceType);
                const hoverBlur =
                  glassmorphic.hover.blurDevice?.[deviceType]?.hover ||
                  glassmorphic.hover.blur.hover;

                return (
                  <motion.div key={project.title} variants={itemVariants}>
                    <BounceCard
                      disabled={isTouch}
                      maxTilt={4}
                      scaleOnHover={1.02}
                      className="h-full w-full min-h-0"
                    >
                      <motion.div
                        whileHover={
                          !isTouch && themeMode === "light"
                            ? {
                                boxShadow:
                                  "0 12px 40px 0 rgba(0,0,0,0.15)",
                              }
                            : {}
                        }
                        whileTap={
                          isTouch ? { scale: glassmorphic.touch.activeScale } : {}
                        }
                        className="group project-card rounded-2xl flex flex-col overflow-hidden transition-all duration-300 h-full w-full min-h-0"
                        style={{
                          background: getGlassBackground("card", themeMode),
                          border: `1px solid ${getGlassBorder("card", themeMode)}`,
                          boxShadow:
                            themeMode === "light"
                              ? "0 10px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1)"
                              : "none",
                          backdropFilter: supportsBackdrop
                            ? `blur(${defaultBlur})`
                            : "none",
                          WebkitBackdropFilter: supportsBackdrop
                            ? `blur(${defaultBlur})`
                            : "none",
                          willChange: "transform, backdrop-filter",
                          transform: "translateZ(0)",
                        }}
                        onMouseEnter={
                          !isTouch
                            ? (e) => {
                                if (supportsBackdrop) {
                                  e.currentTarget.style.backdropFilter = `blur(${hoverBlur})`;
                                  e.currentTarget.style.WebkitBackdropFilter = `blur(${hoverBlur})`;
                                }
                                e.currentTarget.style.background =
                                  getGlassBackground("cardHover", themeMode);
                              }
                            : undefined
                        }
                        onMouseLeave={
                          !isTouch
                            ? (e) => {
                                if (supportsBackdrop) {
                                  e.currentTarget.style.backdropFilter = `blur(${defaultBlur})`;
                                  e.currentTarget.style.WebkitBackdropFilter = `blur(${defaultBlur})`;
                                }
                                e.currentTarget.style.background =
                                  getGlassBackground("card", themeMode);
                              }
                            : undefined
                        }
                      >
                        {/* Image Section */}
                        <div className="relative w-full h-[100px] sm:h-[120px] md:h-[140px] lg:h-[160px] overflow-hidden rounded-t-xl sm:rounded-t-2xl">
                          <motion.img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-500"
                            whileHover={{ scale: 1.1 }}
                            onError={(e) => {
                              e.target.src = "/images/default-project.png";
                            }}
                          />
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background:
                                themeMode === "dark"
                                  ? "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 100%)"
                                  : "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.05) 100%)",
                            }}
                          />
                        </div>

                        <div className="glass-gradient-overlay" />

                        {/* Content Section */}
                        <div className="project-card-content flex flex-col items-start p-4 sm:p-5 md:p-6 flex-1">
                          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 transition-colors">
                            <span className="relative inline-block">
                              <span
                                style={{
                                  color:
                                    themeMode === "light"
                                      ? "#000000"
                                      : theme.colors.text.primary[themeMode],
                                }}
                              >
                                {project.title}
                              </span>
                              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 gradient-text gradient-text-infinite">
                                {project.title}
                              </span>
                            </span>
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {project.tech && project.tech.length > 0 ? (
                              project.tech.map((tech) => (
                                <span
                                  key={tech}
                                  className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium"
                                  style={{
                                    background:
                                      themeMode === "dark"
                                        ? "rgba(255,255,255,0.12)"
                                        : "rgba(0,0,0,0.06)",
                                    color:
                                      themeMode === "light"
                                        ? "#1a1a1a"
                                        : theme.colors.text.secondary[
                                            themeMode
                                          ],
                                    border: `1px solid ${getGlassBorder("base", themeMode)}`,
                                    boxShadow:
                                      themeMode === "light"
                                        ? "0 1px 2px rgba(0,0,0,0.04)"
                                        : "0 1px 2px rgba(0,0,0,0.15)",
                                    backdropFilter: supportsBackdrop
                                      ? `blur(${getDeviceAwareBlurValue("sm", deviceType)})`
                                      : "none",
                                    WebkitBackdropFilter: supportsBackdrop
                                      ? `blur(${getDeviceAwareBlurValue("sm", deviceType)})`
                                      : "none",
                                  }}
                                >
                                  {tech}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                No tech stack listed
                              </span>
                            )}
                          </div>
                          <p
                            className="whitespace-pre-line text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3"
                            style={{
                              color: theme.colors.text.secondary[themeMode],
                            }}
                          >
                            {project.description}
                          </p>
                          {(project.link || project.github) && (
                            <div className="flex gap-2 mt-auto pt-2">
                              {project.link && (
                                <motion.a
                                  href={project.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-xs font-medium transition-all"
                                  style={{
                                    background: getGlassBackground(
                                      "button",
                                      themeMode
                                    ),
                                    border: `1px solid ${getGlassBorder("button", themeMode)}`,
                                    color:
                                      themeMode === "light"
                                        ? "#000000"
                                        : theme.colors.text.black[themeMode],
                                  }}
                                >
                                  Live Demo
                                </motion.a>
                              )}
                              {project.github && (
                                <motion.a
                                  href={project.github}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-xs font-medium transition-all"
                                  style={{
                                    background: getGlassBackground(
                                      "button",
                                      themeMode
                                    ),
                                    border: `1px solid ${getGlassBorder("button", themeMode)}`,
                                    color:
                                      themeMode === "light"
                                        ? "#000000"
                                        : theme.colors.text.black[themeMode],
                                  }}
                                >
                                  GitHub
                                </motion.a>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </BounceCard>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </motion.section>
  );
}
