import React from "react";
import { motion } from "framer-motion";
import { usePortfolio } from "../context/PortfolioContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function AboutSection() {
  const { portfolioData, loading } = usePortfolio();
  const { theme: themeMode } = useTheme();

  const profileImage = portfolioData?.profileImage ?? "/images/placeholder-avatar.png";
  const name = portfolioData?.name ?? "";
  const title = portfolioData?.title ?? "";
  const address = portfolioData?.address ?? "";
  const aboutMe = (portfolioData?.aboutMe || "").trim();

  const defaultAboutText =
    name && title
      ? `Hi! I'm ${name}, ${title.toLowerCase()}. ${address ? `Based in ${address}.` : ""}`
      : "";
  const aboutParagraphs = aboutMe
    ? aboutMe.split(/\n+/).map((p) => p.trim()).filter(Boolean)
    : defaultAboutText ? [defaultAboutText] : [];

  return (
    <motion.section
      id="about"
      className="w-full max-w-3xl px-4 py-12 sm:py-16 mx-auto flex flex-col md:flex-row items-center gap-4 sm:gap-6 md:gap-8"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <motion.img
        src={profileImage}
        alt={name ? `${name} Profile` : "Profile"}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-40 h-auto mb-4 md:mb-0 rounded-full object-cover"
        whileHover={{ rotateY: 18 }}
        whileTap={{ rotateY: -10 }}
        style={{ perspective: 600 }}
        onError={(e) => {
          e.target.src = "/images/placeholder-avatar.png";
        }}
      />
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        <h2 
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 dark:text-white"
          style={{ color: themeMode === 'light' ? '#000000' : undefined }}
        >
          About Me
        </h2>
        {aboutParagraphs.map((paragraph, i) => (
          <p
            key={i}
            className={`text-base sm:text-lg dark:text-gray-300 ${i < aboutParagraphs.length - 1 ? "mb-3" : "mb-0"}`}
            style={{ color: themeMode === 'light' ? '#000000' : undefined }}
          >
            {paragraph}
          </p>
        ))}
      </motion.div>
    </motion.section>
  );
}