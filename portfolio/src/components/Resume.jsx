import { motion } from "framer-motion";
import { useContext } from "react";
import { DataContext } from "../context/DataContext";

function Resume() {
  const { data } = useContext(DataContext);

  const education = data?.education || [];
  const experience = data?.experience || [];
  const cvLink = data?.cvLink || "#";

  const neonYellow = "#FACC15";
  const lightYellow = "#FFE066";
  const title = "Experience & Education"
  const discription = "A timeline of my professional experience and educational journey, represented cleanly with a modern glassmorphic theme."

  return (
    <section id="resume-section" style={{ padding: "80px 0" }}>
      
      {/* RESPONSIVE TIMELINE FIX (line removed) */}
      <style>{`
        .timeline-container {
          position: relative;
          margin-top: 40px;
        }

        /* REMOVED: .timeline-line */

        .timeline-item {
          width: 90%;
          margin: 40px auto;
          position: relative;
          display: flex;
          justify-content: center;
          z-index: 5;
        }

        .timeline-dot {
          position: absolute;
          top: 26px;
          left: 50%;
          transform: translateX(-50%);
          width: 18px;
          height: 18px;
          background: #FACC15;
          border-radius: 50%;
          border: 4px solid #000;
          box-shadow: 0 0 18px #FACC15;
          z-index: 20 !important;
        }

        .timeline-card {
          width: 90%;
          max-width: 700px;
          z-index: 10 !important;
        }

        @media (max-width: 992px) {
          .timeline-item { width: 95%; }
          .timeline-card { width: 95%; }
        }

        @media (max-width: 768px) {
          .timeline-item { width: 100%; }
          .timeline-card { width: 100%; }
        }
      `}</style>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>

        {/* HEADING (same as Skills section) */}
        {/* <motion.div
          className="row justify-content-center pb-5"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
        >
          <div className="col-md-12 heading-section text-center">
            <h1 className="big big-2">{title}</h1>
            <h2 className="mb-4">{title}</h2>
            <p>
              {discription}
            </p>
          </div>
        </motion.div> */}
        <motion.div
          className="row justify-content-center pb-5"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ position: "relative" }}
        >
          <style>
            {`
      /* Background Title */
      .section-big-title {
        position: absolute;
        left: 0;
        right: 0;
        top: -25px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 3px;
        color: rgba(255,255,255,0.13);
        user-select: none;
        z-index: 1;
      }

      /* Default size (desktop) */
      @media (min-width: 1200px) {
        .section-big-title { font-size: 90px; }
      }

      /* Laptop */
      @media (max-width: 1199px) {
        .section-big-title { font-size: 75px; }
      }

      /* Tablet */
      @media (max-width: 992px) {
        .section-big-title { font-size: 60px; top: -20px; }
      }

      /* Small Tablet / Large Phones */
      @media (max-width: 768px) {
        .section-big-title { font-size: 48px; top: -18px; }
      }

      /* Mobile */
      @media (max-width: 576px) {
        .section-big-title { font-size: 38px; top: -12px; }
      }

      /* Small Mobile */
      @media (max-width: 400px) {
        .section-big-title { font-size: 38px; top: -8px; }
      }

      /* Foreground Title */
      .section-title {
        font-weight: bolder;
        z-index: 5;
        position: relative;
      }

      /* Adjust margin so foreground title never overlaps */
      @media (min-width: 1200px) {
        .section-title { margin-top: -3.2rem; }
      }
      @media (max-width: 1199px) {
        .section-title { margin-top: -2.8rem; }
      }
      @media (max-width: 992px) {
        .section-title { margin-top: -2.4rem; }
      }
      @media (max-width: 768px) {
        .section-title { margin-top: -2.1rem; }
      }
      @media (max-width: 576px) {
        .section-title { margin-top: -1.8rem; }
      }
      @media (max-width: 400px) {
        .section-title { margin-top: -1.3rem; }
      }

      /* Paragraph responsiveness */
      .section-description {
        max-width: 650px;
        margin: 0 auto;
        color: #ccc;
        line-height: 1.7;
        z-index: 5;
        position: relative;
        font-size: 1rem;
      }
      @media (max-width: 768px) {
        .section-description { font-size: 0.95rem; }
      }
      @media (max-width: 576px) {
        .section-description { font-size: 0.9rem; }
      }
    `}
          </style>

          <div
            className="col-md-12 heading-section text-center"
            style={{ position: "relative" }}
          >
            <h1 className="section-big-title">{title}</h1>

            <h2 className="mb-4 section-title">{title}</h2>

            <p className="section-description">{discription}</p>
          </div>
        </motion.div>


        {/* EXPERIENCE */}
        <motion.h2
          style={{
            color: neonYellow,
            fontSize: "28px",
            fontWeight: "800",
            marginBottom: "10px",
            letterSpacing: "1px",
          }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          Experience
        </motion.h2>

        <div className="timeline-container">

          {experience.map((item, idx) => (
            <motion.div
              key={idx}
              className="timeline-item"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.6, delay: idx * 0.12 }}
              whileHover={{ scale: 1.03 }}
            >
              {/* Dot stays, center line removed */}
              <div className="timeline-dot" />

              <motion.div
                className="timeline-card"
                animate={{
                  boxShadow: [
                    "0 0 15px rgba(250, 204, 21, 0.2)",
                    "0 0 25px rgba(250, 204, 21, 0.4)",
                    "0 0 40px rgba(250, 204, 21, 0.6)",
                    "0 0 25px rgba(250, 204, 21, 0.4)",
                    "0 0 15px rgba(250, 204, 21, 0.2)",
                  ],
                  borderColor: [
                    "rgba(250, 204, 21, 0.4)",
                    "rgba(250, 204, 21, 0.8)",
                    "rgba(250, 204, 21, 1)",
                    "rgba(250, 204, 21, 0.8)",
                    "rgba(250, 204, 21, 0.4)",
                  ],
                }}
                transition={{ duration: 6, repeat: Infinity, repeatType: "mirror" }}
                style={{
                  padding: "3px",
                  borderRadius: "18px",
                  border: "2px solid rgba(250, 204, 21, 0.5)",
                  backdropFilter: "blur(14px)",
                }}
              >
                <div
                  style={{
                    backdropFilter: "blur(14px)",
                    background: "rgba(255, 255, 255, 0.08)",
                    borderRadius: "16px",
                    padding: "22px",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <span style={{ color: neonYellow, fontSize: "14px", fontWeight: "bold" }}>
                    {item.startDate} - {item.endDate}
                  </span>

                  <h3
                    style={{
                      marginTop: "10px",
                      fontSize: "22px",
                      fontWeight: "700",
                      color: lightYellow,
                    }}
                  >
                    {item.type === "education" ? item.degree : item.role}
                  </h3>

                  <div style={{ color: "#eee", fontSize: "14px", marginTop: "4px" }}>
                    {item.type === "education" ? item.institution : item.company}
                  </div>

                  <p style={{ color: "#ddd", marginTop: "14px", lineHeight: "1.7" }}>
                    {item.description}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* EDUCATION */}
        <motion.h2
          style={{
            color: neonYellow,
            fontSize: "28px",
            fontWeight: "800",
            marginTop: "80px",
            marginBottom: "10px",
            letterSpacing: "1px",
          }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          Education
        </motion.h2>

        <div className="timeline-container">

          {education.map((item, idx) => (
            <motion.div
              key={idx}
              className="timeline-item"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.6, delay: idx * 0.12 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="timeline-dot" />

              <motion.div
                className="timeline-card"
                animate={{
                  boxShadow: [
                    "0 0 15px rgba(250, 204, 21, 0.2)",
                    "0 0 25px rgba(250, 204, 21, 0.4)",
                    "0 0 40px rgba(250, 204, 21, 0.6)",
                    "0 0 25px rgba(250, 204, 21, 0.4)",
                    "0 0 15px rgba(250, 204, 21, 0.2)",
                  ],
                  borderColor: [
                    "rgba(250, 204, 21, 0.4)",
                    "rgba(250, 204, 21, 0.8)",
                    "rgba(250, 204, 21, 1)",
                    "rgba(250, 204, 21, 0.8)",
                    "rgba(250, 204, 21, 0.4)",
                  ],
                }}
                transition={{ duration: 6, repeat: Infinity, repeatType: "mirror" }}
                style={{
                  padding: "3px",
                  borderRadius: "18px",
                  border: "2px solid rgba(250, 204, 21, 0.5)",
                  backdropFilter: "blur(14px)",
                }}
              >
                <div
                  style={{
                    backdropFilter: "blur(14px)",
                    background: "rgba(255, 255, 255, 0.08)",
                    borderRadius: "16px",
                    padding: "22px",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <span style={{ color: neonYellow, fontSize: "14px", fontWeight: "bold" }}>
                    {item.startDate} - {item.endDate}
                  </span>

                  <h3
                    style={{
                      marginTop: "10px",
                      fontSize: "22px",
                      fontWeight: "700",
                      color: lightYellow,
                    }}
                  >
                    {item.type === "education" ? item.degree : item.role}
                  </h3>

                  <div style={{ color: "#eee", fontSize: "14px", marginTop: "4px" }}>
                    {item.type === "education" ? item.institution : item.company}
                  </div>

                  <p style={{ color: "#ddd", marginTop: "14px", lineHeight: "1.7" }}>
                    {item.description}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* CV BUTTON */}
        <div style={{ textAlign: "center", marginTop: "60px" }}>
          <a
            href={cvLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: neonYellow,
              color: "#000",
              padding: "14px 34px",
              borderRadius: "10px",
              fontWeight: "800",
              fontSize: "16px",
              textDecoration: "none",
              boxShadow: "0 0 18px #FACC15",
              transition: "0.3s",
            }}
            onMouseOver={(e) => (e.target.style.boxShadow = "0 0 28px #FFD700")}
            onMouseOut={(e) => (e.target.style.boxShadow = "0 0 18px #FACC15")}
          >
            Download CV
          </a>
        </div>
      </div>
    </section>
  );
}

export default Resume;
