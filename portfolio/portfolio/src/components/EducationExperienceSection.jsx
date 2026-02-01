import React from "react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext.jsx";
import { usePortfolio } from "../context/PortfolioContext.jsx";
import { glassmorphic } from "../config/glassmorphic.js";
import { getGlassBackground, getGlassBorder, getGlassStyle, getDeviceAwareBlurValue, getLiquidGlassGradient } from "../utils/themeUtils.js";
import BounceCard from "./react-bits/BounceCard.jsx";
import { theme } from "../config/theme.js";
import { getDeviceType, isTouchDevice, supportsBackdropFilter } from "../utils/responsiveUtils.js";

export default function EducationExperienceSection() {
  const { theme: themeMode } = useTheme();
  const { portfolioData, loading } = usePortfolio();
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { name: "Education" },
    { name: "Experience" }
  ];

  const educationData = portfolioData?.education || [];
  const experienceData = portfolioData?.experience || [];
  const currentData = activeTab === 0 ? educationData : experienceData;

  const [deviceType, setDeviceType] = useState(() => getDeviceType());
  const [supportsBackdrop, setSupportsBackdrop] = useState(() => supportsBackdropFilter());
  const isTouch = isTouchDevice();

  useEffect(() => {
    const checkDevice = () => {
      setDeviceType(getDeviceType());
      setSupportsBackdrop(supportsBackdropFilter());
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return (
    <motion.section
      id="education-experience"
      className="w-full max-w-6xl px-4 py-20 mx-auto"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <h2 
        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 md:mb-10 text-center dark:text-white"
        style={{ color: themeMode === 'light' ? '#000000' : undefined }}
      >
        Education & Experience
      </h2>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8 sm:mb-10 md:mb-12 gap-3 sm:gap-4">
        {tabs.map((tab, idx) => (
          <motion.button
            key={tab.name}
            onClick={() => setActiveTab(idx)}
            whileHover={{ 
              scale: 1.05,
              boxShadow: activeTab === idx ? glassmorphic.shadows.buttonHover : glassmorphic.shadows.button
            }}
            whileTap={{ scale: 0.95 }}
            className={`group relative inline-block px-6 py-3 font-medium text-base rounded-full overflow-hidden transition-all duration-300 ${
              activeTab === idx ? '' : ''
            }`}
            style={{
              ...getGlassStyle({ background: 'button', border: 'base', blur: 'lg', shadow: 'button', theme: themeMode, deviceType }),
              color: activeTab === idx 
                ? theme.colors.text.black[themeMode]
                : theme.colors.text.secondary[themeMode],
            }}
            onMouseEnter={(e) => {
              if (activeTab !== idx) {
                e.currentTarget.style.color = theme.colors.text.primary[themeMode];
                e.currentTarget.style.background = getGlassBackground('buttonHover', themeMode);
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== idx) {
                e.currentTarget.style.color = theme.colors.text.secondary[themeMode];
                e.currentTarget.style.background = getGlassBackground('button', themeMode);
              }
            }}
          >
            {/* Liquid effect background - only show on active tab */}
            {activeTab === idx && (
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
                style={{
                  background: glassmorphic.liquidGlass.gradients.gradient1,
                }}
                animate={{
                  background: [
                    glassmorphic.liquidGlass.gradients.gradient1,
                    glassmorphic.liquidGlass.gradients.gradient2,
                    glassmorphic.liquidGlass.gradients.gradient3,
                    glassmorphic.liquidGlass.gradients.gradient1,
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
            
            {/* Floating particles - only show on active tab */}
            {activeTab === idx && (
              <div className="absolute inset-0 overflow-hidden rounded-full">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white/40 rounded-full"
                    style={{
                      left: `${20 + i * 15}%`,
                      top: `${30 + (i % 2) * 40}%`,
                    }}
                    animate={{
                      y: [-10, -20, -10],
                      opacity: [0.3, 0.8, 0.3],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2 + i * 0.3,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            )}
            
            <span className="relative z-10">
              {activeTab === idx ? (
                <span className="gradient-text gradient-text-infinite">{tab.name}</span>
              ) : (
                <span
                  style={{
                    color: themeMode === 'light' ? '#4a4a4a' : theme.colors.text.secondary[themeMode],
                  }}
                >
                  {tab.name}
                </span>
              )}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Vertical timeline */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mt-8 sm:mt-10"
      >
        {/* Timeline line */}
        {currentData.length > 0 && (
          <div
            className="absolute left-4 sm:left-6 top-0 bottom-0 w-px"
            style={{
              background: themeMode === 'light' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.15)',
            }}
            aria-hidden
          />
        )}

        <div className="flex flex-col gap-0">
          {currentData.map((item, idx) => {
            const defaultBlur = getDeviceAwareBlurValue('md', deviceType);
            const hoverBlur = glassmorphic.hover.blurDevice?.[deviceType]?.hover || glassmorphic.hover.blur.hover;

            return (
              <motion.div
                key={`${activeTab}-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="relative flex gap-4 sm:gap-6 pl-12 sm:pl-16 pb-10 last:pb-0"
              >
                {/* Timeline dot */}
                <div
                  className="absolute left-4 sm:left-6 top-6 -translate-x-1/2 w-3 h-3 rounded-full shrink-0 ring-4 ring-white dark:ring-[#0a0a0a]"
                  style={{
                    background: themeMode === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)',
                    border: `2px solid ${themeMode === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(10,10,10,0.95)'}`,
                  }}
                  aria-hidden
                />

                {/* Card */}
                <BounceCard disabled={isTouch} maxTilt={0} scaleOnHover={1.01} className="w-full min-w-0">
                  <motion.div
                    whileHover={!isTouch ? {
                      boxShadow: themeMode === 'light'
                        ? '0 12px 40px 0 rgba(0,0,0,0.12)'
                        : '0 12px 40px 0 rgba(0,0,0,0.4)',
                    } : {}}
                    whileTap={isTouch ? { scale: glassmorphic.touch.activeScale } : {}}
                    className="group project-card rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 flex flex-col items-start transition-all duration-300 w-full"
                    style={{
                      background: getGlassBackground('card', themeMode),
                      border: `1px solid ${getGlassBorder('card', themeMode)}`,
                      backdropFilter: supportsBackdrop ? `blur(${defaultBlur})` : 'none',
                      WebkitBackdropFilter: supportsBackdrop ? `blur(${defaultBlur})` : 'none',
                      willChange: 'transform, backdrop-filter',
                      transform: 'translateZ(0)',
                    }}
                    onMouseEnter={!isTouch ? (e) => {
                      if (supportsBackdrop) {
                        e.currentTarget.style.backdropFilter = `blur(${hoverBlur})`;
                        e.currentTarget.style.WebkitBackdropFilter = `blur(${hoverBlur})`;
                      }
                      e.currentTarget.style.background = getGlassBackground('cardHover', themeMode);
                    } : undefined}
                    onMouseLeave={!isTouch ? (e) => {
                      if (supportsBackdrop) {
                        e.currentTarget.style.backdropFilter = `blur(${defaultBlur})`;
                        e.currentTarget.style.WebkitBackdropFilter = `blur(${defaultBlur})`;
                      }
                      e.currentTarget.style.background = getGlassBackground('card', themeMode);
                    } : undefined}
                  >
                    <div className="glass-gradient-overlay" />

                    {/* Date Badge */}
                    <div className="flex justify-between items-start w-full mb-3">
                      <div
                        className="relative overflow-hidden rounded-lg inline-block"
                        style={{
                          border: `1px solid ${getGlassBorder('base', themeMode)}`,
                          boxShadow: themeMode === 'light' ? '0 1px 2px rgba(0,0,0,0.04)' : '0 1px 2px rgba(0,0,0,0.15)',
                        }}
                      >
                        <motion.div
                          className="absolute inset-0 rounded-lg"
                          style={{ opacity: themeMode === 'light' ? 0.4 : 0.3 }}
                          animate={{
                            background: [
                              getLiquidGlassGradient('gradient1', themeMode),
                              getLiquidGlassGradient('gradient2', themeMode),
                              getLiquidGlassGradient('gradient3', themeMode),
                              getLiquidGlassGradient('gradient1', themeMode),
                            ],
                          }}
                          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <span
                          className="relative z-10 block text-xs sm:text-sm px-2.5 py-1 sm:px-3 sm:py-1.5 font-medium"
                          style={{ color: theme.colors.badges.text[themeMode] }}
                        >
                          {activeTab === 0
                            ? `${new Date(item.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${new Date(item.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                            : `${new Date(item.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${item.endDate === 'Present' ? 'Present' : new Date(item.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                        </span>
                      </div>
                    </div>

                    <div className="project-card-content flex flex-col items-start w-full pt-2">
                      <h3 className="text-lg font-semibold mb-2 transition-colors">
                        <span className="relative inline-block">
                          <span
                            style={{
                              color: themeMode === 'light' ? '#000000' : theme.colors.text.primary[themeMode],
                            }}
                          >
                            {activeTab === 0 ? item.degree : item.role}
                          </span>
                          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 gradient-text gradient-text-infinite">
                            {activeTab === 0 ? item.degree : item.role}
                          </span>
                        </span>
                      </h3>
                      <p
                        className="text-sm sm:text-base font-medium mb-1"
                        style={{
                          color: themeMode === 'light' ? '#1a1a1a' : theme.colors.text.secondary[themeMode],
                        }}
                      >
                        {activeTab === 0 ? item.institution : item.company}
                      </p>
                      {activeTab === 1 && item.location && (
                        <p
                          className="text-xs sm:text-sm mb-2 sm:mb-3"
                          style={{
                            color: themeMode === 'light' ? '#4a4a4a' : theme.colors.text.tertiary[themeMode],
                          }}
                        >
                          📍 {item.location}
                        </p>
                      )}
                      <p
                        className="text-xs sm:text-sm"
                        style={{
                          color: themeMode === 'light' ? '#1a1a1a' : theme.colors.text.secondary[themeMode],
                        }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                </BounceCard>
              </motion.div>
            );
          })}
        </div>

        {currentData.length === 0 && !loading && (
          <p className="text-center py-8" style={{ color: themeMode === 'light' ? '#6b7280' : theme.colors.text.secondary[themeMode] }}>
            {activeTab === 0 ? 'No education entries yet.' : 'No experience entries yet.'}
          </p>
        )}
      </motion.div>
    </motion.section>
  );
}