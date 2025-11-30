import { motion } from "framer-motion";
import { useContext } from "react";
import { DataContext } from "../context/DataContext";

import {
  SiJavascript,
  SiReact,
  SiPython,
  SiNodedotjs,
  SiDjango,
  SiHtml5,
  SiCss3,
  SiMongodb,
  SiMysql,
  SiGit,
  SiCplusplus,
  SiTailwindcss,
  SiBootstrap,
  // NEW TECH
  SiExpress,
  SiTensorflow,
  SiPytorch,
  SiKeras,
  SiPandas,
  SiNumpy,
  SiOpencv,
  SiScikitlearn,
  SiJupyter,
  SiFastapi,
  SiTypescript,
  SiNextdotjs,
  SiPostgresql,
  SiFirebase,
  SiVercel,
  SiDocker,
  SiKubernetes,
  SiGraphql,
  SiRedux,
  SiFlask,
  SiAnaconda,
} from "react-icons/si";
import { FaTools } from "react-icons/fa";


// EXTENDED ICON MAP
const iconMap = {
  javascript: <SiJavascript size={28} color="white" />,
  typescript: <SiTypescript size={28} color="white" />,
  react: <SiReact size={28} color="white" />,
  nextjs: <SiNextdotjs size={28} color="white" />,
  redux: <SiRedux size={28} color="white" />,

  python: <SiPython size={28} color="white" />,
  django: <SiDjango size={28} color="white" />,
  flask: <SiFlask size={28} color="white" />,
  fastapi: <SiFastapi size={28} color="white" />,
  anaconda: <SiAnaconda size={28} color="white" />,
  jupyter: <SiJupyter size={28} color="white" />,

  "node.js": <SiNodedotjs size={28} color="white" />,
  node: <SiNodedotjs size={28} color="white" />,
  express: <SiExpress size={28} color="white" />,

  html: <SiHtml5 size={28} color="white" />,
  css: <SiCss3 size={28} color="white" />,
  tailwind: <SiTailwindcss size={28} color="white" />,
  bootstrap: <SiBootstrap size={28} color="white" />,

  mongodb: <SiMongodb size={28} color="white" />,
  mysql: <SiMysql size={28} color="white" />,
  postgresql: <SiPostgresql size={28} color="white" />,
  firebase: <SiFirebase size={28} color="white" />,

  tensorflow: <SiTensorflow size={28} color="white" />,
  pytorch: <SiPytorch size={28} color="white" />,
  keras: <SiKeras size={28} color="white" />,
  pandas: <SiPandas size={28} color="white" />,
  numpy: <SiNumpy size={28} color="white" />,
  opencv: <SiOpencv size={28} color="white" />,
  sklearn: <SiScikitlearn size={28} color="white" />,

  docker: <SiDocker size={28} color="white" />,
  kubernetes: <SiKubernetes size={28} color="white" />,
  graphql: <SiGraphql size={28} color="white" />,
  vercel: <SiVercel size={28} color="white" />,

  git: <SiGit size={28} color="white" />,
  cplusplus: <SiCplusplus size={28} color="white" />,
};


function getIcon(skillName) {
  const key = skillName.toLowerCase().replace(/\s+/g, "");
  return iconMap[key] || <FaTools size={24} color="white" />;
}


function Skills() {
  const { data } = useContext(DataContext);

  const skillsData = {
    heading: {
      title: "Skills",
      subtitle: "My Skills",
      description:
        "Here you will find more information about my current skills mostly in terms of programming and technology",
    },
    skills: data.skills,
  };

  const radius = 24;
  const circumference = 2 * Math.PI * radius;


  return (
    <section className="ftco-section" id="skills-section">
      <div className="container">

        {/* Section Heading */}
        <motion.div
          className="row justify-content-center pb-5"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
        >
          <div className="col-md-12 heading-section text-center">
            <h1 className="big big-2">{skillsData.heading.title}</h1>
            <h2 className="mb-4">{skillsData.heading.subtitle}</h2>
            <p>{skillsData.heading.description}</p>
          </div>
        </motion.div>


        {/* Skills Grid */}
        <div className="row">
          {skillsData.skills.map((skill, idx) => (
            <div
              className="col-12 col-sm-6 col-md-4 mb-4 animate-box"
              key={skill.name}
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >

              <motion.div
                className="progress-wrap"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "14px",
                  padding: "14px 16px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  backdropFilter: "blur(12px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  minHeight: "90px",

                  // ✅ OPTION A (90% width)
                  width: "90%",
                  margin: "0 auto",

                  position: "relative",
                  overflow: "hidden"
                }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6 }}
                whileHover={{ scale: 1.03 }}
              >

                {/* ALWAYS-ACTIVE GLASS GLOW ELEMENT */}
                <div
                  style={{
                    position: "absolute",
                    top: "-40%",
                    left: "-40%",
                    width: "180%",
                    height: "180%",
                    background:
                      "radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%)",
                    opacity: 0.25,
                    pointerEvents: "none",
                    zIndex: 0,
                  }}
                />

                {/* ICON BOX */}
                <div
                  style={{
                    width: "4rem",
                    height: "4rem",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 2,
                  }}
                >
                  {getIcon(skill.name)}
                </div>

                {/* ANIMATED CIRCLE */}
                <div style={{ position: "relative", width: "58px", height: "58px", zIndex: 2 }}>
                  <svg width="58" height="58">
                    <circle
                      cx="29"
                      cy="29"
                      r={radius}
                      stroke="rgba(255,255,255,0.18)"
                      strokeWidth="6"
                      fill="none"
                    />

                    <motion.circle
                      cx="29"
                      cy="29"
                      r={radius}
                      stroke="#FACC15"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference}
                      whileInView={{
                        strokeDashoffset:
                          circumference - (skill.value / 100) * circumference,
                      }}
                      viewport={{ once: false }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* PERCENT NUMBER */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                  >
                    {skill.value}%
                  </div>
                </div>

                {/* SKILL NAME */}
                <h3
                  style={{
                    marginLeft: "auto",
                    fontSize: "17px",
                    fontWeight: "600",
                    color: "#fff",
                    whiteSpace: "nowrap",
                    zIndex: 2,
                  }}
                >
                  {skill.name}
                </h3>

              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Skills;
