import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef, useContext, useState } from "react";
import { DataContext } from "../context/DataContext";

function Projects() {
  const { data } = useContext(DataContext);

  const projectsData = {
    heading: {
      title: "Projects",
      subtitle: "Our Projects",
      description:
        "Here you will find some of the personal projects that I created, each containing its own case study.",
    },
    projects: data?.projects || [],
  };

  const neonYellow = "#FACC15";
  const lightYellow = "#FFE066";

  const safeProjects = projectsData.projects.filter(
    (p) => p && typeof p === "object"
  );

  const rows = [];
  for (let i = 0; i < safeProjects.length; i += 2) {
    rows.push(safeProjects.slice(i, i + 2));
  }

  const glassCard = {
    backdropFilter: "blur(16px)",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "22px",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "white",
  };

  return (
    <section id="projects-section" style={{ padding: "80px 0" }}>

      {/* MOBILE FIXES FOR RESPONSIVE BEHAVIOR */}
      <style>{`
        @media (max-width: 768px) {
          #projects-section .big.big-2 {
            font-size: 42px !important;
            margin-bottom: 20px !important;
          }

          .project-card-wrapper {
            overflow: hidden !important;
            position: relative;
          }

          .project-card-inner {
            height: 260px !important;
          }

          .hologram-label {
            top: -20px !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>

        {/* Heading */}
        <motion.div
          className="row justify-content-center pb-5"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ position: "relative" }}
        >
          <div className="col-md-12 heading-section text-center" style={{ position: "relative" }}>
            <h1
              className="big big-2"
              style={{
                position: "absolute",
                top: "-35px",
                left: "0",
                right: "0",
                fontSize: "100px",
                color: "rgba(255, 255, 255, 0.13)",
                zIndex: 1,
                textTransform: "uppercase",
                letterSpacing: "3px",
                userSelect: "none",
              }}
            >
              {projectsData.heading.title}
            </h1>

            <h2
              className="mb-4"
              style={{
                fontWeight: "bolder",
                position: "relative",
                zIndex: 5,
                marginTop: "-3rem",
              }}
            >
              {projectsData.heading.subtitle}
            </h2>

            <p
              style={{
                position: "relative",
                zIndex: 5,
                color: "#ccc",
                maxWidth: "650px",
                margin: "0 auto",
                lineHeight: "1.7",
              }}
            >
              {projectsData.heading.description}
            </p>
          </div>
        </motion.div>

        {/* Project Rows */}
        {rows.map((row, i) => (
          <motion.div
            key={i}
            className="row mb-5"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {row.map((project, j) => (
              <div key={j} className="col-md-6 col-12 mb-4 project-card-wrapper">
                <ProjectCard
                  project={project}
                  glassCard={glassCard}
                  neonYellow={neonYellow}
                  lightYellow={lightYellow}
                />
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ project, glassCard, neonYellow, lightYellow }) {
  if (!project || !project.image) {
    return (
      <div
        style={{
          padding: "20px",
          borderRadius: "14px",
          background: "#222",
          color: "#aaa",
          textAlign: "center",
        }}
      >
        <p>⚠ Invalid project data</p>
      </div>
    );
  }

  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0.6 1", "1 0.6"],
  });

  const softGlowShadow = useTransform(
    scrollYProgress,
    [0, 1],
    [
      "0 0 18px rgba(250,204,21,0.15)",
      "0 0 58px rgba(250,204,21,0.55)",
    ]
  );

  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  };

  const tiltX = (mousePos.x - 0.5) * 12;
  const tiltY = (mousePos.y - 0.5) * -12;

  const spotlightX = mousePos.x * 100;
  const spotlightY = mousePos.y * 100;

  const particle = (k, s, b, l, t, d, delay) => (
    <motion.div
      key={k}
      initial={{ opacity: 0.4, y: 0 }}
      animate={{ opacity: [0.35, 0.9, 0.35], y: [0, -14, 0] }}
      transition={{ duration: d, delay, repeat: Infinity, repeatType: "mirror" }}
      style={{
        position: "absolute",
        left: l,
        top: t,
        width: s,
        height: s,
        borderRadius: "50%",
        background: neonYellow,
        filter: `blur(${b}px)`,
        zIndex: 1,
        pointerEvents: "none",
      }}
    />
  );

  const hologramFloat = {
    y: hovered ? [-6, -16, -6] : [-4, -10, -4],
    opacity: hovered ? [0.45, 0.75, 0.45] : [0.25, 0.45, 0.25],
  };

  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const newRipple = {
      id: Date.now(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  return (
    <motion.div
      ref={ref}
      className="project-card-inner"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setMousePos({ x: 0.5, y: 0.5 });
      }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{
        padding: "3px",
        borderRadius: "18px",
        position: "relative",
        overflow: "hidden",
        boxShadow: softGlowShadow,
        backdropFilter: "blur(14px)",
        marginBottom: "22px",
      }}
    >
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        {particle("p1", 12, 8, "8%", "18%", 4.5, 0)}
        {particle("p2", 18, 12, "72%", "62%", 5.8, 0.4)}
        {particle("p3", 10, 6, "42%", "82%", 4.2, 0.2)}
        {particle("p4", 14, 10, "86%", "30%", 6.0, 1.0)}
        {particle("p5", 20, 14, "22%", "55%", 5.0, 0.7)}
      </div>

      {/* Hologram Label */}
      <motion.div
        className="hologram-label"
        animate={hologramFloat}
        transition={{ duration: 3, repeat: Infinity, repeatType: "mirror" }}
        style={{
          position: "absolute",
          top: "-40px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "6px 22px",
          background: "rgba(250,204,21,0.12)",
          borderRadius: "12px",
          border: "1px solid rgba(250,204,21,0.35)",
          backdropFilter: "blur(8px)",
          color: lightYellow,
          fontWeight: 700,
          fontSize: "14px",
          textTransform: "uppercase",
          letterSpacing: "2px",
          zIndex: 20,
          textShadow: "0 0 10px rgba(250,204,21,0.85)",
          pointerEvents: "none",
        }}
      >
        HOLOGRAM
      </motion.div>

      {/* MAIN PROJECT CARD */}
      <motion.div
        animate={{
          rotateY: tiltX,
          rotateX: tiltY,
          scale: hovered ? 1.04 : 1,
        }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
        style={{
          ...glassCard,
          height: "330px",
          borderRadius: "16px",
          overflow: "hidden",
          cursor: "pointer",
          position: "relative",
          backgroundImage: `url(${project.image})`,
          opacity:hovered ? 1 : 0.5,
          transition: "opacity 0.75s ease-out",
          backgroundSize: "cover",
          backgroundPosition: "center",
          transformStyle: "preserve-3d",
          zIndex: 5,
        }}
      >
        {/* Spotlight */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at ${spotlightX}% ${spotlightY}%, rgba(250,204,21,0.35), rgba(250,204,21,0) 60%)`,
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.2s ease-out",
            zIndex: 6,
          }}
        />

        {/* Dark Overlay */}
        <motion.div
          animate={{ opacity: hovered ? 0.55 : 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(3px)",
            zIndex: 7,
          }}
        />

        {/* Reflection Streak */}
        <motion.div
          animate={{ x: ["-140%", "200%"] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "60%",
            height: "100%",
            background:
              "linear-gradient(115deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 100%)",
            transform: "skewX(-15deg)",
            zIndex: 8,
            pointerEvents: "none",
          }}
        />

        {/* Ripples */}
        {ripples.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0.6, scale: 0 }}
            animate={{ opacity: 0, scale: 3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: r.x - 20,
              top: r.y - 20,
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: `2px solid ${neonYellow}`,
              pointerEvents: "none",
              zIndex: 9,
            }}
          />
        ))}

        {/* Text */}
        <motion.div
          animate={{ y: hovered ? -8 : 0 }}
          transition={{ duration: 0.35 }}
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            right: "20px",
            zIndex: 10,
            color: "white",
          }}
        >
          <h3 style={{ color: lightYellow, fontSize: "22px", fontWeight: 700 }}>
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: lightYellow, textDecoration: "none" }}
            >
              {project.title}
            </a>
          </h3>

          <span style={{ color: "#ddd", fontSize: "15px" }}>
            {project.metadata}
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default Projects;
